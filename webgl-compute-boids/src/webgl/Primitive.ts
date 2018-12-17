import {ProgramObject, ShaderAttribute} from './ProgramObject';

export class Primitive
{
  protected _numAttributes:number;

  public get numAttributes():number
  {
    return this._numAttributes;
  }

  protected _numVertices:number;

  public get numVertices():number
  {
    return this._numVertices;
  }

  protected _numIndices:number;

  public get numIndices():number
  {
    return this._numIndices;
  }

  protected _indexBuffer:WebGLBuffer;

  public get indexBuffer():WebGLBuffer
  {
    return this._indexBuffer;
  }

  protected vboList:VertexAttribute[];

  constructor()
  {
    this.vboList = [];
  }

  public createBuffer(gl:WebGLRenderingContext):void
  {
  }

  public bindVertexbuffer(gl2:WebGL2RenderingContext, program:ProgramObject):void
  {
    const length:number = program.attributeList.length;
    for(let i:number = 0; i < length; i++)
    {
      const shaderAttibute:ShaderAttribute = program.attributeList[i];
      if(shaderAttibute.location >= 0)
      {
        let vertexAttribute:VertexAttribute = this.getVertexBuffer(shaderAttibute.name);
        if(vertexAttribute)
        {
          gl2.bindBuffer(gl2.ARRAY_BUFFER, vertexAttribute.buffer);
          gl2.enableVertexAttribArray(shaderAttibute.location);
          gl2.vertexAttribPointer(shaderAttibute.location, shaderAttibute.stride, gl2.FLOAT, false, vertexAttribute.byteStride, vertexAttribute.bufferOffset);

          if(vertexAttribute.divisor > 0)
          {
            gl2.vertexAttribDivisor(shaderAttibute.location, vertexAttribute.divisor);
          }
        }
      }
    }
  }

  public getVertexBuffer(attributeName:string):VertexAttribute
  {
    const length:number = this.vboList.length;
    for(let i:number = 0; i < length; i++)
    {
      let attribute:VertexAttribute = this.vboList[i];
      if(attribute.name === attributeName)
      {
        return attribute;
      }
    }
    return null;
  }
}

export interface VertexAttribute
{
  name:string;
  byteStride:number;
  bufferOffset:number;
  buffer:WebGLBuffer;
  divisor:number;
}