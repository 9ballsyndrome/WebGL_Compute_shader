const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;
const NUM_PARTICLES = 8;

let stats;

let context;
let computeProgram;
let renderProgram;
let ssbo;
let timeUniformLocation;
let time;

const script = async () => {
  // Canvas setup
  const canvas = document.getElementById(('myCanvas'));
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Create WebGL2ComputeRenderingContext
  context = canvas.getContext('webgl2-compute');
  if (!context) {
    document.body.className = 'error';
    return;
  }

  // Stats setup
  stats = new Stats();
  document.body.appendChild(stats.domElement);

  // ComputeShader source
  // language=GLSL
  const computeShaderSource = `#version 310 es
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
  const computeShader = context.createShader(context.COMPUTE_SHADER);
  context.shaderSource(computeShader, computeShaderSource);
  context.compileShader(computeShader);
  if (!context.getShaderParameter(computeShader, context.COMPILE_STATUS)) {
    console.log(context.getShaderInfoLog(computeShader));
    return;
  }

  // create WebGLProgram for ComputeShader
  computeProgram = context.createProgram();
  context.attachShader(computeProgram, computeShader);
  context.linkProgram(computeProgram);
  if (!context.getProgramParameter(computeProgram, context.LINK_STATUS)) {
    console.log(context.getProgramInfoLog(computeProgram));
    return;
  }

  // get uniform location in ComputeShader
  timeUniformLocation = context.getUniformLocation(computeProgram, 'time');

  // create ShaderStorageBuffer
  ssbo = context.createBuffer();
  context.bindBuffer(context.SHADER_STORAGE_BUFFER, ssbo);
  context.bufferData(context.SHADER_STORAGE_BUFFER, new Float32Array(NUM_PARTICLES * 2), context.STATIC_DRAW);
  context.bindBufferBase(context.SHADER_STORAGE_BUFFER, 0, ssbo);

  // VertexShader source
  // language=GLSL
  const vertexShaderSource = `#version 310 es
    layout (location = 0) in vec2 position;

    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      gl_PointSize = 3.0;
    }
    `;

  // create WebGLShader for VertexShader
  const vertexShader = context.createShader(context.VERTEX_SHADER);
  context.shaderSource(vertexShader, vertexShaderSource);
  context.compileShader(vertexShader);
  if (!context.getShaderParameter(vertexShader, context.COMPILE_STATUS)) {
    console.log(context.getShaderInfoLog(vertexShader));
    return;
  }

  // FragmentShader source
  // language=GLSL
  const fragmentShaderSource = `#version 310 es
    precision highp float;
    
    out vec4 outColor;
 
    void main() {
      outColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    `;

  // create WebGLShader for FragmentShader
  const fragmentShader = context.createShader(context.FRAGMENT_SHADER);
  context.shaderSource(fragmentShader, fragmentShaderSource);
  context.compileShader(fragmentShader);
  if (!context.getShaderParameter(fragmentShader, context.COMPILE_STATUS)) {
    console.log(context.getShaderInfoLog(fragmentShader));
    return;
  }

  // create WebGLProgram for rendering
  renderProgram = context.createProgram();
  context.attachShader(renderProgram, vertexShader);
  context.attachShader(renderProgram, fragmentShader);
  context.linkProgram(renderProgram);
  if (!context.getProgramParameter(renderProgram, context.LINK_STATUS)) {
    console.log(context.getProgramInfoLog(renderProgram));
    return;
  }

  // bind ShaderStorageBuffer as ARRAY_BUFFER
  context.bindBuffer(context.ARRAY_BUFFER, ssbo);
  context.enableVertexAttribArray(0);
  context.vertexAttribPointer(0, 2, context.FLOAT, false, 0, 0);

  // initialize states
  context.clearColor(0.2, 0.2, 0.2, 1.0);
  time = 0.0;

  render();
};

const render = () => {
  stats.begin();

  time += 1.0;

  // execute ComputeShader
  context.useProgram(computeProgram);
  context.uniform1f(timeUniformLocation, time);
  context.dispatchCompute(1, 1, 1);
  context.memoryBarrier(context.VERTEX_ATTRIB_ARRAY_BARRIER_BIT);

  // render
  context.clear(context.COLOR_BUFFER_BIT);
  context.useProgram(renderProgram);
  context.drawArrays(context.POINTS, 0, NUM_PARTICLES);

  stats.end();

  requestAnimationFrame(render);
};

window.addEventListener('DOMContentLoaded', script);
