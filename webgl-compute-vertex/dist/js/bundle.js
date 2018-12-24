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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

// stats.js - http://github.com/mrdoob/stats.js
(function(f,e){ true?module.exports=e():undefined})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();
u(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel("FPS","#0ff","#002")),h=e(new f.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var t=e(new f.Panel("MB","#f08","#201"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/
1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=h;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);
b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+" "+e+" ("+g(c)+"-"+g(k)+")",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Main", function() { return Main; });
/* harmony import */ var stats_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var stats_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(stats_js__WEBPACK_IMPORTED_MODULE_0__);

class Main {
    constructor() {
        console.log(new Date());
        this.init();
    }
    async init() {
        // Canvas setup
        const canvas = document.getElementById(('myCanvas'));
        canvas.width = Main.CANVAS_WIDTH;
        canvas.height = Main.CANVAS_HEIGHT;
        // Create WebGL2ComputeRenderingContext
        const context = canvas.getContext('webgl2-compute');
        if (!context) {
            document.body.className = 'error';
            return;
        }
        this.context = context;
        // Stats setup
        this.stats = new stats_js__WEBPACK_IMPORTED_MODULE_0__();
        document.body.appendChild(this.stats.dom);
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
        }
        // create WebGLProgram for ComputeShader
        const computeProgram = context.createProgram();
        context.attachShader(computeProgram, computeShader);
        context.linkProgram(computeProgram);
        if (!context.getProgramParameter(computeProgram, context.LINK_STATUS)) {
            console.log(context.getProgramInfoLog(computeProgram));
        }
        this.computeProgram = computeProgram;
        // get uniform location in ComputeShader
        this.timeUniformLocation = context.getUniformLocation(computeProgram, 'time');
        // create ShaderStorageBuffer
        const ssbo = context.createBuffer();
        context.bindBuffer(context.SHADER_STORAGE_BUFFER, ssbo);
        this.context.bufferData(this.context.SHADER_STORAGE_BUFFER, new Float32Array(Main.NUM_PARTICLES * 2), this.context.STATIC_DRAW);
        this.context.bindBufferBase(this.context.SHADER_STORAGE_BUFFER, 0, ssbo);
        this.ssbo = ssbo;
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
        const vertexShader = this.context.createShader(this.context.VERTEX_SHADER);
        this.context.shaderSource(vertexShader, vertexShaderSource);
        this.context.compileShader(vertexShader);
        if (!this.context.getShaderParameter(vertexShader, this.context.COMPILE_STATUS)) {
            console.log(this.context.getShaderInfoLog(vertexShader));
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
        const fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER);
        this.context.shaderSource(fragmentShader, fragmentShaderSource);
        this.context.compileShader(fragmentShader);
        if (!this.context.getShaderParameter(fragmentShader, this.context.COMPILE_STATUS)) {
            console.log(this.context.getShaderInfoLog(fragmentShader));
        }
        // create WebGLProgram for rendering
        const renderProgram = this.context.createProgram();
        this.context.attachShader(renderProgram, vertexShader);
        this.context.attachShader(renderProgram, fragmentShader);
        this.context.linkProgram(renderProgram);
        if (!this.context.getProgramParameter(renderProgram, this.context.LINK_STATUS)) {
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
    render() {
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
Main.CANVAS_WIDTH = 512;
Main.CANVAS_HEIGHT = 512;
Main.NUM_PARTICLES = 8;
window.addEventListener('DOMContentLoaded', () => {
    new Main();
});


/***/ })
/******/ ]);