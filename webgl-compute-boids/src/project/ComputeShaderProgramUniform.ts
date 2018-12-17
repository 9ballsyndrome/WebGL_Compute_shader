import {UniformBufferObject} from '../webgl/UniformBufferObject';

export class ComputeShaderProgramUniform extends UniformBufferObject
{
  public static readonly BUFFER_LENGTH:number = 4;

  // Layout
  // 0 = separateWeight:float
  // 1 = alignmentWeight:float
  // 2 = cohesionWeight:float
  // 3 = padding

  public get separateWeight():number
  {
    return this._bufferData.subarray(0, 1)[0];
  }

  public set separateWeight(value:number)
  {
    this._copyNumberData(value, 0);
  }

  public get alignmentWeight():number
  {
    return this._bufferData.subarray(1, 2)[0];
  }

  public set alignmentWeight(value:number)
  {
    this._copyNumberData(value, 1);
  }

  public get cohesionWeight():number
  {
    return this._bufferData.subarray(2, 3)[0];
  }

  public set cohesionWeight(value:number)
  {
    this._copyNumberData(value, 2);
  }

  constructor(name:string, binding:number)
  {
    super(name, binding);
    this._bufferDataLength = ComputeShaderProgramUniform.BUFFER_LENGTH;
  }
}
