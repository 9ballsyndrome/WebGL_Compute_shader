import * as Stats from 'stats.js';

export class Main
{
  private static readonly CANVAS_WIDTH:number = 512;
  private static readonly CANVAS_HEIGHT:number = 512;

  private static readonly NUM_PARTICLES:number = 8;

  private stats:Stats;

  private context:WebGL2ComputeRenderingContext;
  private computeProgram:WebGLProgram;
  private renderProgram:WebGLProgram;
  private ssbo:WebGLBuffer;
  private timeUniformLocation:WebGLUniformLocation;

  private time:number;

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

    // ComputeShader source
    // language=GLSL
    const computeShaderSource:string = `#version 310 es
    layout (local_size_x = 8, local_size_y = 1, local_size_z = 1) in;
    struct Particle {
      vec2 pos;
    };
    layout (std430, binding = 0) buffer SSBO {
     Particle data[];
    } ssbo;
    
    uniform float time;
    
    void main() {
      uint threadIndex = gl_GlobalInvocationID.x;
      float floatIndex = float(threadIndex);
      ssbo.data[threadIndex].pos = vec2(floatIndex * 0.25 - 0.875, 0.5 * sin(time * 0.02 + floatIndex * 0.5));
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

    // get uniform location in ComputeShader
    this.timeUniformLocation = context.getUniformLocation(computeProgram, 'time');

    // create ShaderStorageBuffer
    const ssbo:WebGLBuffer = context.createBuffer();
    context.bindBuffer(context.SHADER_STORAGE_BUFFER, ssbo);
    this.context.bufferData(this.context.SHADER_STORAGE_BUFFER, new Float32Array(Main.NUM_PARTICLES * 2), this.context.STATIC_DRAW);
    this.context.bindBufferBase(this.context.SHADER_STORAGE_BUFFER, 0, ssbo);
    this.ssbo = ssbo;

    // VertexShader source
    // language=GLSL
    const vertexShaderSource:string = `#version 310 es
    layout (location = 0) in vec2 position;

    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      gl_PointSize = 3.0;
    }
    `;

    // create WebGLShader for VertexShader
    const vertexShader:WebGLShader = this.context.createShader(this.context.VERTEX_SHADER);
    this.context.shaderSource(vertexShader, vertexShaderSource);
    this.context.compileShader(vertexShader);
    if(!this.context.getShaderParameter(vertexShader, this.context.COMPILE_STATUS))
    {
      console.log(this.context.getShaderInfoLog(vertexShader));
    }

    // FragmentShader source
    // language=GLSL
    const fragmentShaderSource:string = `#version 310 es
    precision highp float;
    
    out vec4 outColor;
 
    void main() {
      outColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    `;

    // create WebGLShader for FragmentShader
    const fragmentShader:WebGLShader = this.context.createShader(this.context.FRAGMENT_SHADER);
    this.context.shaderSource(fragmentShader, fragmentShaderSource);
    this.context.compileShader(fragmentShader);
    if(!this.context.getShaderParameter(fragmentShader, this.context.COMPILE_STATUS))
    {
      console.log(this.context.getShaderInfoLog(fragmentShader));
    }

    // create WebGLProgram for rendering
    const renderProgram:WebGLProgram = this.context.createProgram();
    this.context.attachShader(renderProgram, vertexShader);
    this.context.attachShader(renderProgram, fragmentShader);
    this.context.linkProgram(renderProgram);
    if(!this.context.getProgramParameter(renderProgram, this.context.LINK_STATUS))
    {
      console.log(this.context.getProgramInfoLog(renderProgram));
    }
    this.renderProgram = renderProgram;

    // bind ShaderStorageBuffer as ARRAY_BUFFER
    this.context.bindBuffer(this.context.ARRAY_BUFFER, ssbo);
    this.context.enableVertexAttribArray(0);
    this.context.vertexAttribPointer(0, 2, this.context.FLOAT, false, 0, 0);

    // initialize states
    context.clearColor(0.2, 0.2, 0.2, 1.0);
    this.time = 0.0;

    this.render();
  }

  private render():void
  {
    this.stats.begin();

    this.time += 1.0;

    // execute ComputeShader
    this.context.useProgram(this.computeProgram);
    this.context.uniform1f(this.timeUniformLocation, this.time);
    this.context.dispatchCompute(1, 1, 1);
    this.context.memoryBarrier(this.context.VERTEX_ATTRIB_ARRAY_BARRIER_BIT);

    // render
    this.context.clear(this.context.COLOR_BUFFER_BIT);
    this.context.useProgram(this.renderProgram);
    this.context.drawArrays(this.context.POINTS, 0, Main.NUM_PARTICLES);

    this.stats.end();

    requestAnimationFrame(() => this.render());
  }
}

window.addEventListener('DOMContentLoaded', () =>
{
  new Main();
});
