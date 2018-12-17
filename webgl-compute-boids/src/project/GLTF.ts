import {Primitive, VertexAttribute} from '../webgl/Primitive';
import {GLTFData, GLTFLoader} from './GLTFLoader';

export class GLTF extends Primitive
{
  protected _bufferData:Float32Array;

  public get bufferData():Float32Array
  {
    return this._bufferData;
  }

  protected _indeces:Uint16Array;

  public get indeces():Uint16Array
  {
    return this._indeces;
  }

  constructor()
  {
    super();
  }

  public async loadModel(url:string, centering:boolean = false):Promise<void>
  {
    const data:GLTFData = await GLTFLoader.load(url);

    this._indeces = data.indices.data as Uint16Array;
    this._numIndices = this._indeces.length;

    this._numAttributes = data.position.num + data.normal.num;
    this._numVertices = data.numVertices;

    let centerX:number = 0.0;
    let centerY:number = 0.0;
    let centerZ:number = 0.0;
    if(centering)
    {
      const posMin:number[] = data.position.min;
      const posMax:number[] = data.position.max;
      centerX = (posMax[0] - posMin[0]) / 2 + posMin[0];
      centerY = (posMax[1] - posMin[1]) / 2 + posMin[1];
      centerZ = (posMax[2] - posMin[2]) / 2 + posMin[2];
    }

    this._bufferData = new Float32Array(this._numAttributes * this._numVertices);
    for(let i:number = 0; i < this._numVertices; i++)
    {
      const bufferVertexOffset:number = i * 6;
      const sourceVertexOffset:number = i * 3;
      this._bufferData[bufferVertexOffset] = data.position.data[sourceVertexOffset] - centerX;
      this._bufferData[bufferVertexOffset + 1] = data.position.data[sourceVertexOffset + 1] - centerY;
      this._bufferData[bufferVertexOffset + 2] = data.position.data[sourceVertexOffset + 2] - centerZ;

      this._bufferData[bufferVertexOffset + 3] = data.normal.data[sourceVertexOffset];
      this._bufferData[bufferVertexOffset + 4] = data.normal.data[sourceVertexOffset + 1];
      this._bufferData[bufferVertexOffset + 5] = data.normal.data[sourceVertexOffset + 2];
    }
  }

  public createBuffer(gl:WebGLRenderingContext):void
  {
    let buffer:WebGLBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._bufferData), gl.STATIC_DRAW);

    const positionAttribute:VertexAttribute = {
      name:'position',
      byteStride:24,
      bufferOffset:0,
      buffer:buffer,
      divisor:-1
    };
    this.vboList.push(positionAttribute);

    const normalAttribute:VertexAttribute = {
      name:'normal',
      byteStride:24,
      bufferOffset:12,
      buffer:buffer,
      divisor:-1
    };
    this.vboList.push(normalAttribute);

    buffer = gl.createBuffer();

    const instancePositionAttribute:VertexAttribute = {
      name:'instancePosition',
      byteStride:32,
      bufferOffset:0,
      buffer:buffer,
      divisor:1
    };
    this.vboList.push(instancePositionAttribute);

    const instanceVelocityAttribute:VertexAttribute = {
      name:'instanceVelocity',
      byteStride:32,
      bufferOffset:16,
      buffer:buffer,
      divisor:1
    };
    this.vboList.push(instanceVelocityAttribute);

    buffer = gl.createBuffer();

    const instanceColorAttribute:VertexAttribute = {
      name:'instanceColor',
      byteStride:16,
      bufferOffset:0,
      buffer:buffer,
      divisor:1
    };
    this.vboList.push(instanceColorAttribute);

    this._indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indeces), gl.STATIC_DRAW);
  }
}
