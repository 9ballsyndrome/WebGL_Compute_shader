export class UniformBufferObject
{
  protected _name:string;

  public get name():string
  {
    return this._name;
  }

  protected _index:number;

  public get index():number
  {
    return this._index;
  }

  public set index(value:number)
  {
    this._index = value;
  }

  protected _binding:number;

  public get binding():number
  {
    return this._binding;
  }

  public set binding(value:number)
  {
    this._binding = value;
  }

  protected _bufferData:Float32Array;

  public get bufferData():Float32Array
  {
    return this._bufferData;
  }

  protected _bufferDataLength:number;

  public get bufferDataLength():number
  {
    return this._bufferDataLength;
  }

  protected _buffer:WebGLBuffer;

  public get buffer():WebGLBuffer
  {
    return this._buffer;
  }

  constructor(name:string, binding:number)
  {
    this._name = name;
    this._binding = binding;
  }

  public createBuffer(gl2:WebGL2RenderingContext):void
  {
    this._buffer = gl2.createBuffer();
    this._bufferData = new Float32Array(this._bufferDataLength);

    gl2.bindBuffer(gl2.UNIFORM_BUFFER, this._buffer);
    gl2.bufferData(gl2.UNIFORM_BUFFER, this._bufferData, gl2.DYNAMIC_DRAW);
    gl2.bindBuffer(gl2.UNIFORM_BUFFER, null);
  }

  public updateBuffer(gl2:WebGL2RenderingContext):void
  {
    gl2.bindBuffer(gl2.UNIFORM_BUFFER, this._buffer);
    gl2.bufferSubData(gl2.UNIFORM_BUFFER, 0, this._bufferData);
    gl2.bindBuffer(gl2.UNIFORM_BUFFER, null);
  }

  protected _copyData(data:Float32Array, offset:number, count:number):void
  {
    for(let i:number = 0; i < count; i++)
    {
      this._bufferData[offset + i] = data[i];
    }
  }

  protected _copyNumberData(data:number, offset:number):void
  {
    this._bufferData[offset] = data;
  }
}
