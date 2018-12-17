export class Main
{
  private static readonly MAX_THREAD_NUM:number = 1024;
  private static readonly MAX_GROUP_NUM:number = 2048;

  private logElement:HTMLDivElement;
  private selectBox:HTMLSelectElement;

  private context:WebGL2ComputeRenderingContext;
  private bitonicSortProgram1:WebGLProgram;
  private bitonicSortProgram2:WebGLProgram;
  private bitonicSortProgram2UniformLocation:WebGLUniformLocation;

  constructor()
  {
    console.log(new Date());
    this.init();
  }

  private async init():Promise<void>
  {
    // Selector setup
    this.selectBox = <HTMLSelectElement> document.getElementById('selectBox');
    const maxNumElementsIndex:number = Math.log2(Main.MAX_THREAD_NUM * Main.MAX_GROUP_NUM) - 9;
    for(let i:number = 0; i < maxNumElementsIndex; i++)
    {
      const option:HTMLOptionElement = document.createElement('option');
      option.text = '' + this.getLength(i);
      this.selectBox.add(option);
    }
    this.selectBox.selectedIndex = 7;
    this.selectBox.addEventListener('change', () =>
    {
      this.logElement.innerText = '';
      this.selectBox.disabled = true;
      requestAnimationFrame(() => this.compute());
    });

    // Div setup
    this.logElement = <HTMLDivElement> document.getElementById('log');

    // Canvas setup
    const canvas:HTMLCanvasElement = <HTMLCanvasElement> document.createElement(('canvas'));

    // Create WebGL2ComputeRenderingContext
    const context:WebGL2ComputeRenderingContext = canvas.getContext('webgl2-compute');
    if(!context)
    {
      document.body.className = 'error';
      return;
    }
    this.context = context;

    this.initializeComputeProgram();

    this.compute();
  }

  private async compute():Promise<void>
  {
    const length:number = this.getLength(this.selectBox.selectedIndex);
    const arr:Float32Array = new Float32Array(length);
    this.resetData(arr, length);

    await this.computeCPU(arr.slice(0));
    await this.computeGPU(arr.slice(0));

    this.selectBox.disabled = false;
  }

  private async computeCPU(arr:Float32Array):Promise<void>
  {
    const now:number = performance.now();
    arr.sort(
      (a:number, b:number):number =>
      {
        return a - b;
      }
    );
    this.log(`CPU sort time: ${Math.round(performance.now() - now)} ms`);
    console.log(`sort result validation: ${this.validateSorted(arr) ? 'success' : 'failure'}`);

    // console.log(arr);
  }

  private async computeGPU(arr:Float32Array):Promise<void>
  {
    const now:number = performance.now();

    const context:WebGL2ComputeRenderingContext = this.context;

    const length:number = arr.length;

    const threadgroupsPerGrid:number = Math.max(1, length / Main.MAX_THREAD_NUM);

    // create ShaderStorageBuffer
    const ssbo:WebGLBuffer = context.createBuffer();
    context.bindBuffer(context.SHADER_STORAGE_BUFFER, ssbo);
    context.bufferData(context.SHADER_STORAGE_BUFFER, arr, context.STATIC_DRAW);
    context.bindBufferBase(context.SHADER_STORAGE_BUFFER, 0, ssbo);

    // execute ComputeShader
    context.useProgram(this.bitonicSortProgram1);
    context.dispatchCompute(threadgroupsPerGrid, 1, 1);
    context.memoryBarrier(context.SHADER_STORAGE_BARRIER_BIT);

    if(threadgroupsPerGrid > 1)
    {
      for(let k:number = threadgroupsPerGrid; k <= length; k <<= 1)
      {
        for(let j:number = k >> 1; j > 0; j >>= 1)
        {
          // execute ComputeShader
          context.useProgram(this.bitonicSortProgram2);
          context.uniform4uiv(this.bitonicSortProgram2UniformLocation, new Uint32Array([k, j, 0, 0]));
          context.dispatchCompute(threadgroupsPerGrid, 1, 1);
          context.memoryBarrier(context.SHADER_STORAGE_BARRIER_BIT);
        }
      }
    }

    // get result
    const result:Float32Array = new Float32Array(length);
    context.getBufferSubData(context.SHADER_STORAGE_BUFFER, 0, result);
    this.log(`GPU sort time: ${Math.round(performance.now() - now)} ms`);
    console.log(`sort result validation: ${this.validateSorted(result) ? 'success' : 'failure'}`);
  }

  private resetData(arr:Float32Array, sortLength:number):void
  {
    for(let i:number = 0; i < sortLength; i++)
    {
      arr[i] = Math.random();
    }
  }

  private validateSorted(arr:Float32Array):boolean
  {
    const length:number = arr.length;
    for(let i:number = 0; i < length; i++)
    {
      if(i !== length - 1 && arr[i] > arr[i + 1])
      {
        console.log('validation error:', i, arr[i], arr[i + 1]);
        console.log(arr);
        return false;
      }
    }
    return true;
  }

  private initializeComputeProgram():void
  {
    // ComputeShader source
    // language=GLSL
    const computeShaderSource1:string = `#version 310 es
    layout (local_size_x = ${Main.MAX_THREAD_NUM}, local_size_y = 1, local_size_z = 1) in;
    layout (std430, binding = 0) buffer SSBO {
      float data[];
    } ssbo;
    shared float sharedData[${Main.MAX_THREAD_NUM}];
    
    void main() {
      sharedData[gl_LocalInvocationID.x] = ssbo.data[gl_GlobalInvocationID.x];
      memoryBarrierShared();
      barrier();
      
      uint offset = gl_WorkGroupID.x * gl_WorkGroupSize.x;
      
      float tmp;
      for (uint k = 2u; k <= gl_WorkGroupSize.x; k <<= 1) {
        for (uint j = k >> 1; j > 0u; j >>= 1) {
          uint ixj = (gl_GlobalInvocationID.x ^ j) - offset;
          if (ixj > gl_LocalInvocationID.x) {
            if ((gl_GlobalInvocationID.x & k) == 0u) {
              if (sharedData[gl_LocalInvocationID.x] > sharedData[ixj]) {
                tmp = sharedData[gl_LocalInvocationID.x];
                sharedData[gl_LocalInvocationID.x] = sharedData[ixj];
                sharedData[ixj] = tmp;
              }
            }
            else
            {
              if (sharedData[gl_LocalInvocationID.x] < sharedData[ixj]) {
                tmp = sharedData[gl_LocalInvocationID.x];
                sharedData[gl_LocalInvocationID.x] = sharedData[ixj];
                sharedData[ixj] = tmp;
              }
            }
          }
          memoryBarrierShared();
          barrier();
        }
      }
      ssbo.data[gl_GlobalInvocationID.x] = sharedData[gl_LocalInvocationID.x];
    }
    `;

    // create WebGLProgram for ComputeShader
    this.bitonicSortProgram1 = this.createComputeProgram(computeShaderSource1);

    // language=GLSL
    const computeShaderSource2:string = `#version 310 es
    layout (local_size_x = ${Main.MAX_THREAD_NUM}, local_size_y = 1, local_size_z = 1) in;
    layout (std430, binding = 0) buffer SSBO {
      float data[];
    } ssbo;
    uniform uvec4 numElements;
    
    void main() {
       float tmp;
      uint ixj = gl_GlobalInvocationID.x ^ numElements.y;
      if (ixj > gl_GlobalInvocationID.x)
      {
        if ((gl_GlobalInvocationID.x & numElements.x) == 0u)
        {
          if (ssbo.data[gl_GlobalInvocationID.x] > ssbo.data[ixj])
          {
            tmp = ssbo.data[gl_GlobalInvocationID.x];
            ssbo.data[gl_GlobalInvocationID.x] = ssbo.data[ixj];
            ssbo.data[ixj] = tmp;
          }
        }
        else
        {
          if (ssbo.data[gl_GlobalInvocationID.x] < ssbo.data[ixj])
          {
            tmp = ssbo.data[gl_GlobalInvocationID.x];
            ssbo.data[gl_GlobalInvocationID.x] = ssbo.data[ixj];
            ssbo.data[ixj] = tmp;
          }
        }
      }
    }
    `;

    // create WebGLProgram for ComputeShader
    this.bitonicSortProgram2 = this.createComputeProgram(computeShaderSource2);
    this.bitonicSortProgram2UniformLocation = this.context.getUniformLocation(this.bitonicSortProgram2, 'numElements');
  }

  private createComputeProgram(source:string):WebGLProgram
  {
    const context:WebGL2ComputeRenderingContext = this.context;

    // create WebGLShader for ComputeShader
    const computeShader:WebGLShader = context.createShader(context.COMPUTE_SHADER);
    context.shaderSource(computeShader, source);
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

    return computeProgram;
  }

  private getLength(index:number):number
  {
    return 1 << (index + 10);
  }

  private log(str:string):void
  {
    this.logElement.innerText += str + '\n';
  }
}

window.addEventListener('DOMContentLoaded', () =>
{
  new Main();
});
