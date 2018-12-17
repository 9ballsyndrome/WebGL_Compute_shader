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
        // Canvas setup
        const canvas = document.createElement(('canvas'));
        // Create WebGL2ComputeRenderingContext
        const context = canvas.getContext('webgl2-compute');
        if (!context) {
            document.body.className = 'error';
            return;
        }
        document.getElementById('context').innerText = 'WebGL2ComputeRenderingContext create: success';
        // ComputeShader source
        // language=GLSL
        const computeShaderSource = `#version 310 es
    layout (local_size_x = 8, local_size_y = 1, local_size_z = 1) in;
    layout (std430, binding = 0) buffer SSBO {
     float data[];
    } ssbo;
    
    void main() {
      uint threadIndex = gl_GlobalInvocationID.x;
      ssbo.data[threadIndex] = float(threadIndex);
    }
    `;
        // create WebGLShader for ComputeShader
        const computeShader = context.createShader(context.COMPUTE_SHADER);
        context.shaderSource(computeShader, computeShaderSource);
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
        // input data
        const input = new Float32Array(8);
        document.getElementById('input').innerText = `input: [${input}]`;
        // create ShaderStorageBuffer
        const ssbo = context.createBuffer();
        context.bindBuffer(context.SHADER_STORAGE_BUFFER, ssbo);
        context.bufferData(context.SHADER_STORAGE_BUFFER, input, context.STATIC_DRAW);
        context.bindBufferBase(context.SHADER_STORAGE_BUFFER, 0, ssbo);
        // execute ComputeShader
        context.useProgram(computeProgram);
        context.dispatchCompute(1, 1, 1);
        // get result
        const result = new Float32Array(8);
        context.getBufferSubData(context.SHADER_STORAGE_BUFFER, 0, result);
        document.getElementById('output').innerText = `output: [${result}]`;
    }
}
window.addEventListener('DOMContentLoaded', () => {
    new Main();
});


/***/ })
/******/ ]);