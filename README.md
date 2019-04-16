# WebGL 2.0 Compute shader Demos

This repository shows samples of WebGL Compute shader. For detail, see [Intent to Implement: WebGL 2.0 Compute](https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/bPD47wqY-r8/5DzgvEwFBAAJ) and [WebGL 2.0 Compute Specification - Draft](https://www.khronos.org/registry/webgl/specs/latest/2.0-compute/).

As of Apr 2019, WebGL Compute shader runs only on **Windows(or Linux) Google Chrome or Windows [Microsoft Edge Insider Channels](https://www.microsoftedgeinsider.com/en-us/download/?platform=win10)** launched with below command line flags.

- `--enable-webgl2-compute-context`  
Enable WebGL Compute shader, WebGL2ComputeRenderingContext  
Or you can enable this flag via about://flags/ if using the corresponding version, choose "WebGL 2.0 Compute"

- `--use-angle=gl`  
Run ANGLE with OpenGL backend because Shader Storage Buffer Object is now on implementing and there are some use cases which do not work well on D3D backend yet  
Some demos in this page need this flag  
Or you can enable this flag via about://flags/, choose "Choose ANGLE graphics backend"

- `--use-cmd-decoder=passthrough`  
In some environments, it could run well only after adding this flag. So try this if could not work with above two flags


*Note that some environments could not run WebGL Compute shader, especially in older GPU nor display driver*.

*WebGL 2.0 Compute API is now implementing. So if you try to develop, [Chrome Canary](https://www.google.com/chrome/canary/) is recommended as the latest feature-update and bug-fix are Nightly provided*.

## Experiments

### Boids simulation

Interaction calculations such as Boids simulation are suited for Compute shader because it can be run in parallel.
In this demo, it calculates coordinates and velocities of each Boids using Compute shader, and draws them using Instancing.
**In CPU, it is not doing anything except calling graphics API**.

[![181218_webgl-compute-boids_demo.gif](https://raw.githubusercontent.com/9ballsyndrome/WebGL_Compute_shader/master/document/181218_webgl-compute-boids_demo.gif)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-boids/dist/)

- [View demo (Make sure you are on a system with WebGL 2.0 Compute enabled)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-boids/dist/)
- [Source(TypeScript)](https://github.com/9ballsyndrome/WebGL_Compute_shader/tree/master/webgl-compute-boids)


### Bitonic sort

Bitonic sort is one of the sort algorithm that can be executed in parallel. This demo sorts an array with selected number of elements by CPU (JavaScript built-in `sort()`) and GPU (Compute shader), then compares each elapsed time.
In CPU sort, it simply measures the time to execute `sort()`. In GPU sort, it measures **the total time** to copy the array to GPU, execute Bitonic sort in Compute shader and copy the result data back to CPU.
Note that WebGL initialization time, for example shader compile, is not included.

[![181218_webgl-compute-bitonicSort_demo.gif](https://raw.githubusercontent.com/9ballsyndrome/WebGL_Compute_shader/master/document/181218_webgl-compute-bitonicSort_demo.gif)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-bitonicSort)

- [View demo (Make sure you are on a system with WebGL 2.0 Compute enabled)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-bitonicSort)
- [Source](https://github.com/9ballsyndrome/WebGL_Compute_shader/tree/master/webgl-compute-bitonicSort)


## Tutorial

### Simplest Compute shader

This is for the first step to implement Compute shader. It copies an array defined in CPU to GPU as the input data, writes its thread index to the array through Shader Storage Buffer Object in Compute shader, then copies the result data back to CPU and read it.

[![181218_webgl-compute-simple_demo.png](https://raw.githubusercontent.com/9ballsyndrome/WebGL_Compute_shader/master/document/181218_webgl-compute-simple_demo.png)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-simple)

- [View demo (Make sure you are on a system with WebGL 2.0 Compute enabled)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-simple)
- [Source](https://github.com/9ballsyndrome/WebGL_Compute_shader/tree/master/webgl-compute-simple)

### Vertex Compute shader

We can bind Shader Storage Buffer Object as ARRAY_BUFFER and use it as vertex attribute in Vertex shader.
So, we can use the result, calculated in Compute shader, in Vertex shader without going through CPU. This means there is no memory copy between CPU and GPU.
In this sample, it calculates particle coordinates in Compute shader and writes the result to Shader Storage Buffer Object, then renders the particle using it as attribte in Vertex shader.

[![181225_webgl-compute-vertex_demo.gif](https://raw.githubusercontent.com/9ballsyndrome/WebGL_Compute_shader/master/document/181225_webgl-compute-vertex_demo.gif)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-vertex/)

- [View demo (Make sure you are on a system with WebGL 2.0 Compute enabled)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-vertex/)
- [Source](https://github.com/9ballsyndrome/WebGL_Compute_shader/tree/master/webgl-compute-vertex)

### Texture Compute shader

There are two ways to output the result from Compute shader. One is using SSBO as mentioned above, and the other is using Texture. Texture bound from JavaScript side using `bindImageTexture()`, new API added by WebGL 2.0 Compute, can be read and written by Compute shader through `imageLoad()`/`imageStore ()`. Note that Texture to specify to `bindImageTexture()` should be immutable. "Immutable" means Texture has been allocated by using `texStorageXX()`, not `texImageXX()`. Now, we can create procedural textures or execute image processing without any vertices.

[![190409_webgl-compute-texture_demo.png](https://raw.githubusercontent.com/9ballsyndrome/WebGL_Compute_shader/master/document/190409_webgl-compute-texture_demo.png)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-texture/)

- [View demo (Make sure you are on a system with WebGL 2.0 Compute enabled)](https://9ballsyndrome.github.io/WebGL_Compute_shader/webgl-compute-texture/)
- [Source](https://github.com/9ballsyndrome/WebGL_Compute_shader/tree/master/webgl-compute-texture)
