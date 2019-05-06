const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;

const DRAW_SCALE = 0.5;

const EXPECTABLE_PIXELS = Math.ceil(CANVAS_WIDTH * DRAW_SCALE) * Math.ceil(CANVAS_HEIGHT * DRAW_SCALE);

const pnameList = [
  'MAX_ATOMIC_COUNTER_BUFFER_SIZE',
  'MAX_ATOMIC_COUNTER_BUFFER_BINDINGS',
  'MAX_COMBINED_ATOMIC_COUNTER_BUFFERS',
  'MAX_COMBINED_ATOMIC_COUNTERS',
  'MAX_VERTEX_ATOMIC_COUNTER_BUFFERS',
  'MAX_VERTEX_ATOMIC_COUNTERS',
  'MAX_FRAGMENT_ATOMIC_COUNTER_BUFFERS',
  'MAX_FRAGMENT_ATOMIC_COUNTERS',
  'MAX_COMPUTE_ATOMIC_COUNTER_BUFFERS',
  'MAX_COMPUTE_ATOMIC_COUNTERS'
];

const script = async () => {
  // Canvas setup
  const canvas = document.getElementById('myCanvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Create WebGL2ComputeRenderingContext
  // Set antialias to false to estimate issued pixels accurately
  // If antialias is set to true, issued pixels will greater than EXPECTABLE_PIXELS
  const context = canvas.getContext('webgl2-compute', {antialias: false});
  if (!context) {
    document.body.className = 'error';
    document.getElementById('atomicCounterError').style.display = 'none';
    return;
  }

  // Show each parameter about AtomicCounter
  pnameList.forEach(pname => console.log(pname, context.getParameter(context[pname])));

  // This sample requires at least one atomic counter in fragment shader
  if (context.getParameter(context.MAX_FRAGMENT_ATOMIC_COUNTERS) < 1) {
    document.body.className = 'error';
    document.getElementById('contextError').style.display = 'none';
    return;
  }

  // VertexShader source
  // language=GLSL
  const vertexShaderSource = `#version 310 es
  layout (location = 0) in vec2 position;

  void main() {
      gl_Position = vec4(position, 0.0, 1.0);
  }
  `;

  // Create WebGLShader for VertexShader
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
  layout (binding = 0, offset = 0) uniform atomic_uint pixelCount;

  out vec4 outColor;

  void main() {
      // increment pixelCount and get prior value
      uint priorPixelCountCount = atomicCounterIncrement(pixelCount);
      // Convert pixelCount to RGB uvec3
      uvec3 uCol = (uvec3(priorPixelCountCount) >> uvec3(16u, 8u, 0u)) & 255u;
      outColor = vec4(vec3(uCol) / 255.0, 1.0);
  }
  `;

  // Create WebGLShader for FragmentShader
  const fragmentShader = context.createShader(context.FRAGMENT_SHADER);
  context.shaderSource(fragmentShader, fragmentShaderSource);
  context.compileShader(fragmentShader);
  if (!context.getShaderParameter(fragmentShader, context.COMPILE_STATUS)) {
    console.log(context.getShaderInfoLog(fragmentShader));
    return;
  }

  // Create WebGLProgram for rendering
  const program = context.createProgram();
  context.attachShader(program, vertexShader);
  context.attachShader(program, fragmentShader);
  context.linkProgram(program);
  if (!context.getProgramParameter(program, context.LINK_STATUS)) {
    console.log(context.getProgramInfoLog(program));
    return;
  }
  context.useProgram(program);

  // Setup vertices to render square
  const r = DRAW_SCALE;
  const vertices = new Float32Array([
    // x, y
    -r, r,
    -r, -r,
    r, -r,
    r, r
  ]);
  const indices = new Uint32Array([
    0, 1, 2,
    0, 2, 3
  ]);

  const vbo = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, vbo);
  context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);

  context.enableVertexAttribArray(0);
  context.vertexAttribPointer(0, 2, context.FLOAT, false, 0, 0);

  const ibo = context.createBuffer();
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, ibo);
  context.bufferData(context.ELEMENT_ARRAY_BUFFER, indices, context.STATIC_DRAW);

  // Create AtomicCounterBuffer
  const acbo = context.createBuffer();
  context.bindBuffer(context.ATOMIC_COUNTER_BUFFER, acbo);
  context.bufferData(context.ATOMIC_COUNTER_BUFFER, new Uint32Array(1), context.DYNAMIC_COPY);
  context.bindBufferBase(context.ATOMIC_COUNTER_BUFFER, 0, acbo);

  // Initialize states
  context.clearColor(0.2, 0.2, 0.2, 1.0);
  context.enable(context.CULL_FACE);

  // Render
  context.clear(context.COLOR_BUFFER_BIT);
  context.drawElements(context.TRIANGLES, indices.length, context.UNSIGNED_INT, 0);

  context.memoryBarrier(context.ATOMIC_COUNTER_BARRIER_BIT);

  const result = new Uint32Array(1);
  context.getBufferSubData(context.ATOMIC_COUNTER_BUFFER, 0, result);
  console.log('---');
  console.log('expectable fragments count:', EXPECTABLE_PIXELS);
  console.log('result fragments count:', result[0]);
};

window.addEventListener('DOMContentLoaded', script);
