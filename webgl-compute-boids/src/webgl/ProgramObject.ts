import {UniformBufferObject} from './UniformBufferObject';

export class ProgramObject
{
  protected _program:WebGLProgram;

  public get program():WebGLProgram
  {
    return this._program;
  }

  protected _attributeList:ShaderAttribute[];

  public get attributeList():ShaderAttribute[]
  {
    return this._attributeList;
  }

  protected _uniformList:UniformBufferObject[];

  public get uniformList():UniformBufferObject[]
  {
    return this._uniformList;
  }

  protected _vertexShaderSource:string;
  protected _fragmentShaderSource:string;

  constructor()
  {
    this._uniformList = [];
    this._attributeList = [];
    this.init();
  }

  protected init():void
  {

  }

  public creatProgram(gl2:WebGL2RenderingContext):void
  {
    const vShader:WebGLShader = this.creatShader(gl2, this._vertexShaderSource, gl2.VERTEX_SHADER);
    const fShader:WebGLShader = this.creatShader(gl2, this._fragmentShaderSource, gl2.FRAGMENT_SHADER);

    this._program = gl2.createProgram();
    gl2.attachShader(this._program, vShader);
    gl2.attachShader(this._program, fShader);

    gl2.linkProgram(this._program);

    let i:number;
    let length:number;

    length = this._attributeList.length;
    for(i = 0; i < length; i++)
    {
      const attribute:ShaderAttribute = this._attributeList[i];
      if(attribute.location === -1)
      {
        attribute.location = gl2.getAttribLocation(this._program, attribute.name);
      }
    }

    length = this._uniformList.length;
    for(i = 0; i < length; i++)
    {
      const uniform:UniformBufferObject = this._uniformList[i];
      uniform.index = gl2.getUniformBlockIndex(this._program, uniform.name);
    }
  }

  private creatShader(gl:WebGLRenderingContext, source:string, type:number):WebGLShader
  {
    const shader:WebGLShader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
      return shader;
    }
    else
    {
      console.log(type === gl.VERTEX_SHADER, gl.getShaderInfoLog(shader));
      return null;
    }
  }

  public bindShader(gl2:WebGL2RenderingContext):void
  {
    this.bindProgram(gl2);
    this.bindUniform(gl2);
  }

  public bindProgram(gl:WebGLRenderingContext):void
  {
    if(gl.getProgramParameter(this._program, gl.LINK_STATUS))
    {
      gl.useProgram(this._program);
    }
    else
    {
      console.log(gl.getProgramInfoLog(this._program));
    }
  }

  public bindUniform(gl2:WebGL2RenderingContext):void
  {
    const length:number = this._uniformList.length;
    for(let i:number = 0; i < length; i++)
    {
      const uniform:UniformBufferObject = this._uniformList[i];
      gl2.bindBufferBase(gl2.UNIFORM_BUFFER, uniform.binding, uniform.buffer);
      gl2.uniformBlockBinding(this.program, uniform.index, uniform.binding);
    }
  }
}

export interface ShaderAttribute
{
  name:string;
  stride:number;
  location:number;
}