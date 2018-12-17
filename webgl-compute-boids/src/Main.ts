import {GUI, GUIController} from 'dat.gui';
import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats.js';
import {ComputeShaderProgramUniform} from './project/ComputeShaderProgramUniform';
import {GLTF} from './project/GLTF';
import {GUIPanel} from './project/GUIPanel';
import {LightingShaderProgram} from './project/LightingShaderProgram';
import {LightingShaderProgramUniform} from './project/LightingShaderProgramUniform';
import {RGB} from './project/RGB';
import {Camera} from './webgl/Camera';
import {ProgramObject} from './webgl/ProgramObject';
import {RoundCameraController} from './webgl/RoundCameraController';
import {SceneObject} from './webgl/SceneObject';

export class Main
{
  private static readonly RAD:number = Math.PI / 180;

  private static readonly CANVAS_WIDTH:number = 512;
  private static readonly CANVAS_HEIGHT:number = 512;

  private static readonly COLOR_AMBIENT_LIGHT:vec4 = vec4.fromValues(0.2, 0.2, 0.2, 1.0);
  private static readonly COLOR_DIRECTIONAL_LIGHT:vec4 = vec4.fromValues(0.8, 0.8, 0.8, 1.0);

  private static readonly WORK_GROUP_SIZE:number = 256;
  private static readonly MAX_INSTANCE_NUM:number = 1024 * 4;

  private stats:Stats;

  private canvas:HTMLCanvasElement;
  private context:WebGL2ComputeRenderingContext;
  private computeProgram:WebGLProgram;
  private computeUniform:ComputeShaderProgramUniform;
  private computeUniformDirty:boolean;
  private ssboIn:WebGLBuffer;
  private ssboOut:WebGLBuffer;

  private camera:Camera;
  private cameraController:RoundCameraController;
  private renderProgram:ProgramObject;
  private model:GLTF;
  private numGroups:number;
  private numInstances:number;

  constructor()
  {
    console.log(new Date());
    this.init();
  }

  private async init():Promise<void>
  {
    // Canvas setup
    const canvas:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById(('myCanvas'));
    canvas.width = Main.CANVAS_WIDTH;
    canvas.height = Main.CANVAS_HEIGHT;
    this.canvas = canvas;

    // Create WebGL2ComputeRenderingContext
    const context:WebGL2ComputeRenderingContext = canvas.getContext('webgl2-compute');
    if(!context)
    {
      document.body.className = 'error';
      return;
    }
    this.context = context;

    // Stats setup
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    context.clearColor(0.2, 0.2, 0.2, 1.0);
    context.clearDepth(1.0);
    context.enable(this.context.CULL_FACE);
    context.enable(this.context.DEPTH_TEST);
    context.depthFunc(this.context.LEQUAL);

    this.numInstances = 1024;
    this.numGroups = this.numInstances / Main.WORK_GROUP_SIZE;

    // GUI setup
    const gui:GUI = new GUI({autoPlace:true});
    const instanceFolder:GUI = gui.addFolder('Instance');
    instanceFolder.open();
    const panel:GUIPanel = new GUIPanel();
    panel.num = this.numInstances;
    const numSlider:GUIController = instanceFolder.add(panel, 'num', Main.WORK_GROUP_SIZE, Main.MAX_INSTANCE_NUM).step(Main.WORK_GROUP_SIZE);
    GUIPanel.setGUITitle(gui, 'num', 'Num');
    numSlider.onFinishChange((value:number) =>
    {
      this.numInstances = value;
      this.numGroups = this.numInstances / Main.WORK_GROUP_SIZE;
    });

    const separateWeightSlider:GUIController = instanceFolder.add(panel, 'separateWeight', 0.0, 10.0).step(1.0);
    GUIPanel.setGUITitle(gui, 'separateWeight', 'SeparateWeight');
    separateWeightSlider.onFinishChange((value:number) =>
    {
      this.computeUniformDirty = true;
      this.computeUniform.separateWeight = value;
    });
    const alignmentWeightSlider:GUIController = instanceFolder.add(panel, 'alignmentWeight', 0.0, 10.0).step(1.0);
    GUIPanel.setGUITitle(gui, 'alignmentWeight', 'AlignmentWeight');
    alignmentWeightSlider.onFinishChange((value:number) =>
    {
      this.computeUniformDirty = true;
      this.computeUniform.alignmentWeight = value;
    });
    const cohesionWeightSlider:GUIController = instanceFolder.add(panel, 'cohesionWeight', 0.0, 10.0).step(1.0);
    GUIPanel.setGUITitle(gui, 'cohesionWeight', 'CohesionWeight');
    cohesionWeightSlider.onFinishChange((value:number) =>
    {
      this.computeUniformDirty = true;
      this.computeUniform.cohesionWeight = value;
    });
    panel.resetFunction = () =>
    {
      this.computeUniformDirty = true;
      panel.reset();
      separateWeightSlider.updateDisplay();
      alignmentWeightSlider.updateDisplay();
      cohesionWeightSlider.updateDisplay();
      this.computeUniform.separateWeight = panel.separateWeight;
      this.computeUniform.alignmentWeight = panel.alignmentWeight;
      this.computeUniform.cohesionWeight = panel.cohesionWeight;
    };
    instanceFolder.add(panel, 'resetFunction');

    // ComputeShader source
    // language=GLSL
    const computeShaderSource:string = `#version 310 es
    layout (local_size_x = ${Main.WORK_GROUP_SIZE}, local_size_y = 1, local_size_z = 1) in;
    #define SEPARATE_RANGE 1.0
    #define ALIGNMENT_RANGE 2.0
    #define COHESION_RANGE 2.0
    #define MAX_SPEED 5.0
    #define MAX_STEER_FORCE 0.5
    #define AVOID_WALL_WEIGHT 10.0
    #define DELTA_TIME 0.05
    
    layout (std140) uniform Uniforms {
      float separateWeight;
      float alignmentWeight;
      float cohesionWeight;
    } uniforms;
    
    struct Boids {
      vec3 position;
      vec3 velocity;
    };
    layout (std140, binding = 0) buffer SSBOIn {
     Boids data[];
    } ssboIn;
    layout (std140, binding = 1) buffer SSBOOut {
     Boids data[];
    } ssboOut;
    shared Boids sharedData[${Main.WORK_GROUP_SIZE}];
    
    vec3 limit(vec3 vec, float max) {
      float length = length(vec);
      return (length > max && length > 0.0) ? vec * max / length : vec;
    }
    
    vec3 avoidWall(vec3 position) {
      vec3 wc = vec3(0.0);
      vec3 ws = vec3(64.0);
      vec3 acc = vec3(0.0);
      
      acc.x = (position.x < wc.x - ws.x * 0.5) ? acc.x + 1.0 : acc.x;
      acc.x = (position.x > wc.x + ws.x * 0.5) ? acc.x - 1.0 : acc.x;
      acc.y = (position.y < wc.y - ws.y * 0.5) ? acc.y + 1.0 : acc.y;
      acc.y = (position.y > wc.y + ws.y * 0.5) ? acc.y - 1.0 : acc.y;
      acc.z = (position.z < wc.z - ws.z * 0.5) ? acc.z + 1.0 : acc.z;
      acc.z = (position.z > wc.z + ws.z * 0.5) ? acc.z - 1.0 : acc.z;
      return acc;
    }
    
    void main() {
      uint threadIndex = gl_GlobalInvocationID.x;
      //ssboOut.data[threadIndex].position = ssboIn.data[threadIndex].position + ssboIn.data[threadIndex].velocity;
      
      Boids boids = ssboIn.data[threadIndex];
      vec3 position = boids.position;
      vec3 velocity = boids.velocity;
      
      vec3 separetePositionSum = vec3(0.0);
      int separeteCount = 0;
      
      vec3 alignmentVelocitySum = vec3(0.0);
      int alignmentCount = 0;
      
      vec3 cohesionPositionSum = vec3(0.0);
      int cohesionCount = 0;
      
      for(uint j = 0u; j < gl_WorkGroupSize.x; j++) {
        uint offset = j * gl_WorkGroupSize.x;
        sharedData[gl_LocalInvocationID .x] = ssboIn.data[offset + gl_LocalInvocationID .x];
        memoryBarrierShared();
        barrier();
        for(uint i = 0u; i < gl_WorkGroupSize.x; i++) {
          Boids targetBoids = sharedData[i];
          vec3 targetPosition = targetBoids.position;
          vec3 targetVelocity = targetBoids.velocity;
          
          vec3 diff = position - targetPosition;
          float dist = length(diff);
          
          if(dist > 0.0 && dist <= SEPARATE_RANGE) {
            vec3 repluse = normalize(diff);
            repluse /= dist;
            separetePositionSum += repluse;
            separeteCount++;
          }
          
          if(dist > 0.0 && dist <= ALIGNMENT_RANGE) {
            alignmentVelocitySum += targetVelocity;
            alignmentCount++;
          }
          
          if(dist > 0.0 && dist <= COHESION_RANGE) {
            cohesionPositionSum += targetPosition;
            cohesionCount++;
          }
        }
        barrier();
      }
      
      vec3 separeteSteer = vec3(0.0);
      if(separeteCount > 0) {
        separeteSteer = separetePositionSum / float(separeteCount);
        separeteSteer = normalize(separeteSteer) * MAX_SPEED;
        separeteSteer = separeteSteer - velocity;
        separeteSteer = limit(separeteSteer, MAX_STEER_FORCE);
      }
      
      vec3 alignmentSteer = vec3(0.0);
      if(alignmentCount > 0) {
        alignmentSteer = alignmentVelocitySum / float(alignmentCount);
        alignmentSteer = normalize(alignmentSteer) * MAX_SPEED;
        alignmentSteer = alignmentSteer - velocity;
        alignmentSteer = limit(alignmentSteer, MAX_STEER_FORCE);
      }
      
      vec3 cohesionSteer = vec3(0.0);
      if(cohesionCount > 0) {
        cohesionPositionSum = cohesionPositionSum / float(cohesionCount);
        cohesionSteer = cohesionPositionSum - position;
        cohesionSteer = normalize(cohesionSteer) * MAX_SPEED;
        cohesionSteer = cohesionSteer - velocity;
        cohesionSteer = limit(cohesionSteer, MAX_STEER_FORCE);
      }
      vec3 force = separeteSteer * uniforms.separateWeight;
      force += alignmentSteer * uniforms.alignmentWeight;
      force += cohesionSteer * uniforms.cohesionWeight;
      
      force += avoidWall(position) * AVOID_WALL_WEIGHT;
      
      vec3 newVelocity = velocity + force * DELTA_TIME;
      newVelocity = limit(newVelocity, MAX_SPEED);
      ssboOut.data[threadIndex].velocity = newVelocity;
      ssboOut.data[threadIndex].position = position + newVelocity * DELTA_TIME;
    }
    `;

    // create WebGLShader for ComputeShader
    const computeShader:WebGLShader = context.createShader(context.COMPUTE_SHADER);
    context.shaderSource(computeShader, computeShaderSource);
    context.compileShader(computeShader);
    if(!context.getShaderParameter(computeShader, context.COMPILE_STATUS))
    {
      console.log(context.getShaderInfoLog(computeShader));
    }

    // create WebGLProgram for ComputeShader
    const computeProgram:WebGLProgram = context.createProgram();
    context.attachShader(computeProgram, computeShader);
    context.linkProgram(computeProgram);
    if(!context.getProgramParameter(computeProgram, context.LINK_STATUS))
    {
      console.log(context.getProgramInfoLog(computeProgram));
    }
    this.computeProgram = computeProgram;

    this.computeUniform = new ComputeShaderProgramUniform('Uniforms', 2);
    this.computeUniform.createBuffer(this.context);
    this.computeUniform.index = this.context.getUniformBlockIndex(this.computeProgram, this.computeUniform.name);
    this.computeUniform.separateWeight = panel.separateWeight;
    this.computeUniform.alignmentWeight = panel.alignmentWeight;
    this.computeUniform.cohesionWeight = panel.cohesionWeight;
    this.computeUniformDirty = true;
    this.context.bindBufferBase(this.context.UNIFORM_BUFFER, this.computeUniform.binding, this.computeUniform.buffer);
    this.context.uniformBlockBinding(this.computeProgram, this.computeUniform.index, this.computeUniform.binding);

    this.model = new GLTF();
    await this.model.loadModel('assets/Suzanne.gltf', true);
    this.model.createBuffer(this.context);

    const lightingShaderProgram:LightingShaderProgram = new LightingShaderProgram();
    lightingShaderProgram.creatProgram(this.context);
    const uniform:LightingShaderProgramUniform = lightingShaderProgram.shaderUniform;
    uniform.createBuffer(this.context);
    uniform.ambientLightColor = Main.COLOR_AMBIENT_LIGHT;
    uniform.directionalLightColor = Main.COLOR_DIRECTIONAL_LIGHT;
    uniform.directionalLightDirection = vec3.fromValues(1.0, 1.0, 1.0);
    this.renderProgram = lightingShaderProgram;

    const instanceAttributeData:Float32Array = new Float32Array(Main.MAX_INSTANCE_NUM * 8);
    const instanceColorData:Float32Array = new Float32Array(Main.MAX_INSTANCE_NUM * 4);
    for(let i:number = 0; i < Main.MAX_INSTANCE_NUM; i++)
    {
      const idx:number = i * 8;
      // position
      instanceAttributeData[idx] = (Math.random() - 0.5) * 2;
      instanceAttributeData[idx + 1] = (Math.random() - 0.5) * 2;
      instanceAttributeData[idx + 2] = (Math.random() - 0.5) * 2;

      // padding
      instanceAttributeData[idx + 3] = 0.0;

      // velocity
      instanceAttributeData[idx + 4] = (Math.random() - 0.5) * 0.2;
      instanceAttributeData[idx + 5] = (Math.random() - 0.5) * 0.2;
      instanceAttributeData[idx + 6] = (Math.random() - 0.5) * 0.2;

      // padding
      instanceAttributeData[idx + 7] = 0.0;

      // color
      const color:RGB = RGB.createFromHSV(360 * Math.random(), 0.9, 0.9);
      const idx2:number = i * 4;
      instanceColorData[idx2] = color.r;
      instanceColorData[idx2 + 1] = color.g;
      instanceColorData[idx2 + 2] = color.b;
      instanceColorData[idx2 + 3] = 1.0;
    }
    const instanceAttribute:WebGLBuffer = this.model.getVertexBuffer('instancePosition').buffer;
    context.bindBuffer(context.ARRAY_BUFFER, instanceAttribute);
    context.bufferData(context.ARRAY_BUFFER, instanceAttributeData, this.context.STATIC_DRAW);
    this.ssboIn = instanceAttribute;
    this.ssboOut = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, this.ssboOut);
    context.bufferData(context.ARRAY_BUFFER, instanceAttributeData, this.context.STATIC_DRAW);

    const instanceColor:WebGLBuffer = this.model.getVertexBuffer('instanceColor').buffer;
    context.bindBuffer(context.ARRAY_BUFFER, instanceColor);
    context.bufferData(context.ARRAY_BUFFER, instanceColorData, this.context.STATIC_DRAW);

    // Initialize camera
    this.camera = new Camera(45 * Main.RAD, Main.CANVAS_WIDTH / Main.CANVAS_HEIGHT, 0.1, 1000.0);
    this.cameraController = new RoundCameraController(this.camera, this.canvas);
    this.canvas.style.cursor = 'move';
    this.cameraController.radius = 50;
    this.cameraController.radiusOffset = 5;
    this.cameraController.rotate(0, 0);

    this.render();
  }

  private render():void
  {
    this.stats.begin();

    // execute ComputeShader
    this.context.useProgram(this.computeProgram);
    // this.context.bindBuffer(this.context.SHADER_STORAGE_BUFFER, this.ssboIn);
    this.context.bindBufferBase(this.context.SHADER_STORAGE_BUFFER, 0, this.ssboIn);
    this.context.bindBufferBase(this.context.SHADER_STORAGE_BUFFER, 1, this.ssboOut);
    if(this.computeUniformDirty)
    {
      this.computeUniform.updateBuffer(this.context);
      this.computeUniformDirty = false;
    }
    this.context.dispatchCompute(this.numGroups, 1, 1);
    this.context.memoryBarrier(this.context.VERTEX_ATTRIB_ARRAY_BARRIER_BIT);

    /*
    this.context.bindBuffer(this.context.SHADER_STORAGE_BUFFER, this.ssboOut);
    const result:Float32Array = new Float32Array(this.numInstances * 4);
    this.context.getBufferSubData(this.context.SHADER_STORAGE_BUFFER, 0, result);
    console.log(result);
    */

    // render
    this.model.getVertexBuffer('instancePosition').buffer = this.ssboOut;
    this.model.getVertexBuffer('instanceVelocity').buffer = this.ssboOut;

    // Update camera
    this.cameraController.upDate(0.1);
    this.model.bindVertexbuffer(this.context, this.renderProgram);

    this.context.clear(this.context.COLOR_BUFFER_BIT);

    const uniform:LightingShaderProgramUniform = (this.renderProgram as LightingShaderProgram).shaderUniform;
    uniform.vpMatrix = this.camera.getCameraMtx();
    uniform.updateBuffer(this.context);
    this.renderProgram.bindUniform(this.context);
    this.renderProgram.bindProgram(this.context);
    this.context.drawElementsInstanced(this.context.TRIANGLES, this.model.numIndices, this.context.UNSIGNED_SHORT, 0, this.numInstances);

    [this.ssboIn, this.ssboOut] = [this.ssboOut, this.ssboIn];

    this.stats.end();

    requestAnimationFrame(() => this.render());
  }
}

window.addEventListener('DOMContentLoaded', () =>
{
  new Main();
});
