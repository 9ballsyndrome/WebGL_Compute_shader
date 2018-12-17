interface HTMLCanvasElement extends HTMLElement
{
  getContext(contextId:'webgl2-compute', contextAttributes?:WebGLContextAttributes):WebGL2ComputeRenderingContext | null;
}

interface WebGL2ComputeRenderingContext extends WebGL2RenderingContext
{
  /* WebGL2 Compute constants */
  readonly COMPUTE_SHADER:number;                          // 0x91B9
  readonly SHADER_STORAGE_BUFFER:number;                  // 0x90D2
  readonly READ_ONLY:number;                                // 0x88B8
  readonly WRITE_ONLY:number;                               // 0x88B9
  readonly READ_WRITE:number;                               // 0x88BA

  readonly VERTEX_ATTRIB_ARRAY_BARRIER_BIT:number;           // 0x00000001
  readonly ELEMENT_ARRAY_BARRIER_BIT:number;                  // 0x00000002
  readonly UNIFORM_BARRIER_BIT:number;                         // 0x00000004
  readonly TEXTURE_FETCH_BARRIER_BIT:number;                  // 0x00000008
  readonly SHADER_IMAGE_ACCESS_BARRIER_BIT:number;           // 0x00000020
  readonly COMMAND_BARRIER_BIT:number;                         // 0x00000040
  readonly PIXEL_BUFFER_BARRIER_BIT:number;                   // 0x00000080
  readonly TEXTURE_UPDATE_BARRIER_BIT:number;                 // 0x00000100
  readonly BUFFER_UPDATE_BARRIER_BIT:number;                  // 0x00000200
  readonly FRAMEBUFFER_BARRIER_BIT:number;                    // 0x00000400
  readonly TRANSFORM_FEEDBACK_BARRIER_BIT:number;            // 0x00000800
  readonly ATOMIC_COUNTER_BARRIER_BIT:number;                 // 0x00001000
  readonly SHADER_STORAGE_BARRIER_BIT:number;                 // 0x00002000
  // readonly GL_ALL_BARRIER_BITS:number;                               // 0xFFFFFFFF

  /* Buffer objects */

  // WebGL1:
  bufferData(target:number, sizeOrData:number | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array |
    Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer | null, usage:number):void;

  bufferSubData(target:number, dstByteOffset:number, srcData:Int8Array | Int16Array | Int32Array | Uint8Array |
    Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer | null):void;

  // For compatibility with WebGL 1 context in older Typescript versions.
  bufferData(target:number, data:ArrayBufferView, usage:number):void;

  bufferSubData(target:number, dstByteOffset:number, srcData:ArrayBufferView):void;

  // WebGL2:
  bufferData(target:number, srcData:Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array |
    Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer | null, usage:number, srcOffset:number, length?:number):void;

  bufferSubData(target:number, dstByteOffset:number, srcData:ArrayBufferView,
                srcOffset:number, length?:number):void;

  copyBufferSubData(readTarget:number, writeTarget:number, readOffset:number,
                    writeOffset:number, size:number):void;

  // MapBufferRange, in particular its read-only and write-only modes,
  // can not be exposed safely to JavaScript. GetBufferSubData
  // replaces it for the purpose of fetching data back from the GPU.
  getBufferSubData(target:number, srcByteOffset:number, dstBuffer:ArrayBufferView,
                   dstOffset?:number, length?:number):void;

  /* Framebuffer objects */
  blitFramebuffer(srcX0:number, srcY0:number, srcX1:number, srcY1:number, dstX0:number, dstY0:number,
                  dstX1:number, dstY1:number, mask:number, filter:number):void;

  framebufferTextureLayer(target:number, attachment:number, texture:WebGLTexture | null, level:number,
                          layer:number):void;

  invalidateFramebuffer(target:number, attachments:number[]):void;

  invalidateSubFramebuffer(target:number, attachments:number[],
                           x:number, y:number, width:number, height:number):void;

  readBuffer(src:number):void;

  /* Renderbuffer objects */
  getInternalformatParameter(target:number, internalformat:number, pname:number):any;

  renderbufferStorageMultisample(target:number, samples:number, internalformat:number,
                                 width:number, height:number):void;

  /* Texture objects */
  texStorage2D(target:number, levels:number, internalformat:number, width:number,
               height:number):void;

  texStorage3D(target:number, levels:number, internalformat:number, width:number,
               height:number, depth:number):void;

  // WebGL1 legacy entrypoints:
  texImage2D(target:number, level:number, internalformat:number,
             width:number, height:number, border:number, format:number,
             type:number, pixels?:ArrayBufferView | null):void;

  texImage2D(target:number, level:number, internalformat:number,
             format:number, type:number, source:ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException
  texImage2D(target:number, level:number, internalformat:number,
             format:number, type:number, source:ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException

  texSubImage2D(target:number, level:number, xoffset:number, yoffset:number,
                width:number, height:number,
                format:number, type:number, pixels?:ArrayBufferView | null):void;

  texSubImage2D(target:number, level:number, xoffset:number, yoffset:number,
                format:number, type:number, source:ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException
  texSubImage2D(target:number, level:number, xoffset:number, yoffset:number,
                format:number, type:number, source:ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException

  // WebGL2 entrypoints:
  texImage2D(target:number, level:number, internalformat:number, width:number, height:number,
             border:number, format:number, type:number, pboOffset:number):void;

  texImage2D(target:number, level:number, internalformat:number, width:number, height:number,
             border:number, format:number, type:number,
             source:ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException
  texImage2D(target:number, level:number, internalformat:number, width:number, height:number,
             border:number, format:number, type:number, srcData:ArrayBufferView,
             srcOffset:number):void;

  texImage3D(target:number, level:number, internalformat:number, width:number, height:number,
             depth:number, border:number, format:number, type:number, pboOffset:number):void;

  texImage3D(target:number, level:number, internalformat:number, width:number, height:number,
             depth:number, border:number, format:number, type:number,
             source:ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException
  texImage3D(target:number, level:number, internalformat:number, width:number, height:number,
             depth:number, border:number, format:number, type:number, srcData:ArrayBufferView | null):void;

  texImage3D(target:number, level:number, internalformat:number, width:number, height:number,
             depth:number, border:number, format:number, type:number, srcData:ArrayBufferView,
             srcOffset:number):void;

  texSubImage2D(target:number, level:number, xoffset:number, yoffset:number, width:number,
                height:number, format:number, type:number, pboOffset:number):void;

  texSubImage2D(target:number, level:number, xoffset:number, yoffset:number, width:number,
                height:number, format:number, type:number,
                source:ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException
  texSubImage2D(target:number, level:number, xoffset:number, yoffset:number, width:number,
                height:number, format:number, type:number, srcData:ArrayBufferView,
                srcOffset:number):void;

  texSubImage3D(target:number, level:number, xoffset:number, yoffset:number, zoffset:number,
                width:number, height:number, depth:number, format:number, type:number,
                pboOffset:number):void;

  texSubImage3D(target:number, level:number, xoffset:number, yoffset:number, zoffset:number,
                width:number, height:number, depth:number, format:number, type:number,
                source:ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement):void; // May throw DOMException
  texSubImage3D(target:number, level:number, xoffset:number, yoffset:number, zoffset:number,
                width:number, height:number, depth:number, format:number, type:number,
                srcData:ArrayBufferView | null, srcOffset?:number):void;

  copyTexSubImage3D(target:number, level:number, xoffset:number, yoffset:number, zoffset:number,
                    x:number, y:number, width:number, height:number):void;

  compressedTexImage2D(target:number, level:number, internalformat:number, width:number,
                       height:number, border:number, imageSize:number, offset:number):void;

  compressedTexImage2D(target:number, level:number, internalformat:number, width:number,
                       height:number, border:number, srcData:Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array |
      Uint8ClampedArray | Float32Array | Float64Array | DataView | null, srcOffset?:number, srcLengthOverride?:number):void;

  // For compatibility with WebGL 1 context in older Typescript versions.
  compressedTexImage2D(target:number, level:number, internalformat:number, width:number,
                       height:number, border:number, srcData:ArrayBufferView,
                       srcOffset?:number, srcLengthOverride?:number):void;

  compressedTexImage3D(target:number, level:number, internalformat:number, width:number,
                       height:number, depth:number, border:number, imageSize:number, offset:number):void;

  compressedTexImage3D(target:number, level:number, internalformat:number, width:number,
                       height:number, depth:number, border:number, srcData:ArrayBufferView,
                       srcOffset?:number, srcLengthOverride?:number):void;

  compressedTexSubImage2D(target:number, level:number, xoffset:number, yoffset:number,
                          width:number, height:number, format:number, imageSize:number, offset:number):void;

  compressedTexSubImage2D(target:number, level:number, xoffset:number, yoffset:number,
                          width:number, height:number, format:number,
                          srcData:Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array |
                            Uint8ClampedArray | Float32Array | Float64Array | DataView | null, srcOffset?:number, srcLengthOverride?:number):void;

  // For compatibility with WebGL 1 context in older Typescript versions.
  compressedTexSubImage2D(target:number, level:number, xoffset:number, yoffset:number,
                          width:number, height:number, format:number,
                          srcData:ArrayBufferView | null,
                          srcOffset?:number,
                          srcLengthOverride?:number):void;

  compressedTexSubImage3D(target:number, level:number, xoffset:number, yoffset:number,
                          zoffset:number, width:number, height:number, depth:number,
                          format:number, imageSize:number, offset:number):void;

  compressedTexSubImage3D(target:number, level:number, xoffset:number, yoffset:number,
                          zoffset:number, width:number, height:number, depth:number,
                          format:number, srcData:ArrayBufferView,
                          srcOffset?:number,
                          srcLengthOverride?:number):void;

  /* Programs and shaders */
  getFragDataLocation(program:WebGLProgram, name:string):number;

  /* Uniforms */
  uniform1ui(location:WebGLUniformLocation | null, v0:number):void;

  uniform2ui(location:WebGLUniformLocation | null, v0:number, v1:number):void;

  uniform3ui(location:WebGLUniformLocation | null, v0:number, v1:number, v2:number):void;

  uniform4ui(location:WebGLUniformLocation | null, v0:number, v1:number, v2:number, v3:number):void;

  uniform1fv(location:WebGLUniformLocation | null, data:Float32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform2fv(location:WebGLUniformLocation | null, data:Float32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform3fv(location:WebGLUniformLocation | null, data:Float32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform4fv(location:WebGLUniformLocation | null, data:Float32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform1iv(location:WebGLUniformLocation | null, data:Int32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform2iv(location:WebGLUniformLocation | null, data:Int32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform3iv(location:WebGLUniformLocation | null, data:Int32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform4iv(location:WebGLUniformLocation | null, data:Int32Array | ArrayLike<number>, srcOffset?:number,
             srcLength?:number):void;

  uniform1uiv(location:WebGLUniformLocation | null, data:Uint32Array | ArrayLike<number>, srcOffset?:number,
              srcLength?:number):void;

  uniform2uiv(location:WebGLUniformLocation | null, data:Uint32Array | ArrayLike<number>, srcOffset?:number,
              srcLength?:number):void;

  uniform3uiv(location:WebGLUniformLocation | null, data:Uint32Array | ArrayLike<number>, srcOffset?:number,
              srcLength?:number):void;

  uniform4uiv(location:WebGLUniformLocation | null, data:Uint32Array | ArrayLike<number>, srcOffset?:number,
              srcLength?:number):void;

  uniformMatrix2fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                   srcOffset?:number, srcLength?:number):void;

  uniformMatrix3x2fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                     srcOffset?:number, srcLength?:number):void;

  uniformMatrix4x2fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                     srcOffset?:number, srcLength?:number):void;

  uniformMatrix2x3fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                     srcOffset?:number, srcLength?:number):void;

  uniformMatrix3fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                   srcOffset?:number, srcLength?:number):void;

  uniformMatrix4x3fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                     srcOffset?:number, srcLength?:number):void;

  uniformMatrix2x4fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                     srcOffset?:number, srcLength?:number):void;

  uniformMatrix3x4fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                     srcOffset?:number, srcLength?:number):void;

  uniformMatrix4fv(location:WebGLUniformLocation | null, transpose:boolean, data:Float32Array | ArrayLike<number>,
                   srcOffset?:number, srcLength?:number):void;

  /* Vertex attribs */
  vertexAttribI4i(index:number, x:number, y:number, z:number, w:number):void;

  vertexAttribI4iv(index:number, values:Int32Array | ArrayLike<number>):void;

  vertexAttribI4ui(index:number, x:number, y:number, z:number, w:number):void;

  vertexAttribI4uiv(index:number, values:Uint32Array | ArrayLike<number>):void;

  vertexAttribIPointer(index:number, size:number, type:number, stride:number, offset:number):void;

  /* Writing to the drawing buffer */
  vertexAttribDivisor(index:number, divisor:number):void;

  drawArraysInstanced(mode:number, first:number, count:number, instanceCount:number):void;

  drawElementsInstanced(mode:number, count:number, type:number, offset:number, instanceCount:number):void;

  drawRangeElements(mode:number, start:number, end:number, count:number, type:number, offset:number):void;

  /* Reading back pixels */

  // WebGL1:
  readPixels(x:number, y:number, width:number, height:number, format:number, type:number,
             dstData:Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray |
               Float32Array | Float64Array | DataView | null):void;

  // For compatibility with WebGL 1 context in older Typescript versions.
  readPixels(x:number, y:number, width:number, height:number, format:number, type:number,
             dstData:ArrayBufferView | null):void;

  // WebGL2:
  readPixels(x:number, y:number, width:number, height:number, format:number, type:number,
             offset:number):void;

  readPixels(x:number, y:number, width:number, height:number, format:number, type:number,
             dstData:ArrayBufferView, dstOffset:number):void;

  /* Multiple Render Targets */
  drawBuffers(buffers:number[]):void;

  clearBufferfv(buffer:number, drawbuffer:number, values:Float32Array | ArrayLike<number>,
                srcOffset?:number):void;

  clearBufferiv(buffer:number, drawbuffer:number, values:Int32Array | ArrayLike<number>,
                srcOffset?:number):void;

  clearBufferuiv(buffer:number, drawbuffer:number, values:Uint32Array | ArrayLike<number>,
                 srcOffset?:number):void;

  clearBufferfi(buffer:number, drawbuffer:number, depth:number, stencil:number):void;

  /* Query Objects */
  createQuery():WebGLQuery | null;

  deleteQuery(query:WebGLQuery | null):void;

  isQuery(query:WebGLQuery | null):boolean; // [WebGLHandlesContextLoss]
  beginQuery(target:number, query:WebGLQuery):void;

  endQuery(target:number):void;

  getQuery(target:number, pname:number):WebGLQuery | null;

  getQueryParameter(query:WebGLQuery, pname:number):any;

  /* Sampler Objects */
  createSampler():WebGLSampler | null;

  deleteSampler(sampler:WebGLSampler | null):void;

  isSampler(sampler:WebGLSampler | null):boolean; // [WebGLHandlesContextLoss]
  bindSampler(unit:number, sampler:WebGLSampler | null):void;

  samplerParameteri(sampler:WebGLSampler, pname:number, param:number):void;

  samplerParameterf(sampler:WebGLSampler, pname:number, param:number):void;

  getSamplerParameter(sampler:WebGLSampler, pname:number):any;

  /* Sync objects */
  fenceSync(condition:number, flags:number):WebGLSync | null;

  isSync(sync:WebGLSync | null):boolean; // [WebGLHandlesContextLoss]
  deleteSync(sync:WebGLSync | null):void;

  clientWaitSync(sync:WebGLSync, flags:number, timeout:number):number;

  waitSync(sync:WebGLSync, flags:number, timeout:number):void;

  getSyncParameter(sync:WebGLSync, pname:number):any;

  /* Transform Feedback */
  createTransformFeedback():WebGLTransformFeedback | null;

  deleteTransformFeedback(tf:WebGLTransformFeedback | null):void;

  isTransformFeedback(tf:WebGLTransformFeedback | null):boolean; // [WebGLHandlesContextLoss]
  bindTransformFeedback(target:number, tf:WebGLTransformFeedback | null):void;

  beginTransformFeedback(primitiveMode:number):void;

  endTransformFeedback():void;

  transformFeedbackVaryings(program:WebGLProgram, varyings:string[], bufferMode:number):void;

  getTransformFeedbackVarying(program:WebGLProgram, index:number):WebGLActiveInfo | null;

  pauseTransformFeedback():void;

  resumeTransformFeedback():void;

  /* Uniform Buffer Objects and Transform Feedback Buffers */
  bindBufferBase(target:number, index:number, buffer:WebGLBuffer | null):void;

  bindBufferRange(target:number, index:number, buffer:WebGLBuffer | null, offset:number, size:number):void;

  getIndexedParameter(target:number, index:number):any;

  getUniformIndices(program:WebGLProgram, uniformNames:string[]):number[] | null;

  getActiveUniforms(program:WebGLProgram, uniformIndices:number[], pname:number):any;

  getUniformBlockIndex(program:WebGLProgram, uniformBlockName:string):number;

  getActiveUniformBlockParameter(program:WebGLProgram, uniformBlockIndex:number, pname:number):any;

  getActiveUniformBlockName(program:WebGLProgram, uniformBlockIndex:number):string | null;

  uniformBlockBinding(program:WebGLProgram, uniformBlockIndex:number, uniformBlockBinding:number):void;

  /* Vertex Array Objects */
  createVertexArray():WebGLVertexArrayObject | null;

  deleteVertexArray(vertexArray:WebGLVertexArrayObject | null):void;

  isVertexArray(vertexArray:WebGLVertexArrayObject | null):boolean; // [WebGLHandlesContextLoss]
  bindVertexArray(array:WebGLVertexArrayObject | null):void;

  /* WebGL2 Compute */
  dispatchCompute(num_groups_x:number, num_groups_y:number, num_groups_z:number):void;

  bindImageTexture(unit:number, texture:WebGLTexture | null, level:number, layered:boolean, layer:number, access:number, format:number):void;

  memoryBarrier(barriers:number):void;

  memoryBarrierByRegion(barriers:number):void;
}