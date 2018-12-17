/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "js/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Main", function() { return Main; });
class Main {
    constructor() {
        console.log(new Date());
        this.init();
    }
    async init() {
        // Selector setup
        this.selectBox = document.getElementById('selectBox');
        const maxNumElementsIndex = Math.log2(Main.MAX_THREAD_NUM * Main.MAX_GROUP_NUM) - 9;
        for (let i = 0; i < maxNumElementsIndex; i++) {
            const option = document.createElement('option');
            option.text = '' + this.getLength(i);
            this.selectBox.add(option);
        }
        this.selectBox.selectedIndex = 7;
        this.selectBox.addEventListener('change', () => {
            this.logElement.innerText = '';
            this.selectBox.disabled = true;
            requestAnimationFrame(() => this.compute());
        });
        // Div setup
        this.logElement = document.getElementById('log');
        // Canvas setup
        const canvas = document.createElement(('canvas'));
        // Create WebGL2ComputeRenderingContext
        const context = canvas.getContext('webgl2-compute');
        if (!context) {
            document.body.className = 'error';
            return;
        }
        this.context = context;
        this.initializeComputeProgram();
        this.compute();
    }
    async compute() {
        const length = this.getLength(this.selectBox.selectedIndex);
        const arr = new Float32Array(length);
        this.resetData(arr, length);
        await this.computeCPU(arr.slice(0));
        await this.computeGPU(arr.slice(0));
        this.selectBox.disabled = false;
    }
    async computeCPU(arr) {
        const now = performance.now();
        arr.sort((a, b) => {
            return a - b;
        });
        this.log(`CPU sort time: ${Math.round(performance.now() - now)} ms`);
        console.log(`sort result validation: ${this.validateSorted(arr) ? 'success' : 'failure'}`);
        // console.log(arr);
    }
    async computeGPU(arr) {
        const now = performance.now();
        const context = this.context;
        const length = arr.length;
        const threadgroupsPerGrid = Math.max(1, length / Main.MAX_THREAD_NUM);
        // create ShaderStorageBuffer
        const ssbo = context.createBuffer();
        context.bindBuffer(context.SHADER_STORAGE_BUFFER, ssbo);
        context.bufferData(context.SHADER_STORAGE_BUFFER, arr, context.STATIC_DRAW);
        context.bindBufferBase(context.SHADER_STORAGE_BUFFER, 0, ssbo);
        // execute ComputeShader
        context.useProgram(this.bitonicSortProgram1);
        context.dispatchCompute(threadgroupsPerGrid, 1, 1);
        context.memoryBarrier(context.SHADER_STORAGE_BARRIER_BIT);
        if (threadgroupsPerGrid > 1) {
            for (let k = threadgroupsPerGrid; k <= length; k <<= 1) {
                for (let j = k >> 1; j > 0; j >>= 1) {
                    // execute ComputeShader
                    context.useProgram(this.bitonicSortProgram2);
                    context.uniform4uiv(this.bitonicSortProgram2UniformLocation, new Uint32Array([k, j, 0, 0]));
                    context.dispatchCompute(threadgroupsPerGrid, 1, 1);
                    context.memoryBarrier(context.SHADER_STORAGE_BARRIER_BIT);
                }
            }
        }
        // get result
        const result = new Float32Array(length);
        context.getBufferSubData(context.SHADER_STORAGE_BUFFER, 0, result);
        this.log(`GPU sort time: ${Math.round(performance.now() - now)} ms`);
        console.log(`sort result validation: ${this.validateSorted(result) ? 'success' : 'failure'}`);
    }
    resetData(arr, sortLength) {
        for (let i = 0; i < sortLength; i++) {
            arr[i] = Math.random();
        }
    }
    validateSorted(arr) {
        const length = arr.length;
        for (let i = 0; i < length; i++) {
            if (i !== length - 1 && arr[i] > arr[i + 1]) {
                console.log('validation error:', i, arr[i], arr[i + 1]);
                console.log(arr);
                return false;
            }
        }
        return true;
    }
    initializeComputeProgram() {
        // ComputeShader source
        // language=GLSL
        const computeShaderSource1 = `#version 310 es
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
        const computeShaderSource2 = `#version 310 es
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
    createComputeProgram(source) {
        const context = this.context;
        // create WebGLShader for ComputeShader
        const computeShader = context.createShader(context.COMPUTE_SHADER);
        context.shaderSource(computeShader, source);
        context.compileShader(computeShader);
        if (!context.getShaderParameter(computeShader, context.COMPILE_STATUS)) {
            console.log(context.getShaderInfoLog(computeShader));
        }
        // create WebGLProgram for ComputeShader
        const computeProgram = context.createProgram();
        context.attachShader(computeProgram, computeShader);
        context.linkProgram(computeProgram);
        if (!context.getProgramParameter(computeProgram, context.LINK_STATUS)) {
            console.log(context.getProgramInfoLog(computeProgram));
        }
        return computeProgram;
    }
    getLength(index) {
        return 1 << (index + 10);
    }
    log(str) {
        this.logElement.innerText += str + '\n';
    }
}
Main.MAX_THREAD_NUM = 1024;
Main.MAX_GROUP_NUM = 2048;
window.addEventListener('DOMContentLoaded', () => {
    new Main();
});


/***/ })
/******/ ]);