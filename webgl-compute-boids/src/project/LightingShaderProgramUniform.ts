import {UniformBufferObject} from '../webgl/UniformBufferObject';

export class LightingShaderProgramUniform extends UniformBufferObject
{
  public static readonly BUFFER_LENGTH:number = 48;

  // Layout
  // 0-15 = vpMatrix:mat4
  // 16-19 = ambientLightColor:vec4
  // 20-23 = directionalLightColor:vec4
  // 24-26 = directionalLightDirection:vec3
  // 27 = padding

  public get vpMatrix():Float32Array
  {
    return this._bufferData.subarray(0, 16);
  }

  public set vpMatrix(value:Float32Array)
  {
    this._copyData(value, 0, 16);
  }

  public get ambientLightColor():Float32Array
  {
    return this._bufferData.subarray(16, 20);
  }

  public set ambientLightColor(value:Float32Array)
  {
    this._copyData(value, 16, 4);
  }

  public get directionalLightColor():Float32Array
  {
    return this._bufferData.subarray(20, 24);
  }

  public set directionalLightColor(value:Float32Array)
  {
    this._copyData(value, 20, 4);
  }

  public get directionalLightDirection():Float32Array
  {
    return this._bufferData.subarray(24, 27);
  }

  public set directionalLightDirection(value:Float32Array)
  {
    this._copyData(value, 24, 3);
  }

  constructor(name:string, binding:number)
  {
    super(name, binding);
    this._bufferDataLength = LightingShaderProgramUniform.BUFFER_LENGTH;
  }
}
