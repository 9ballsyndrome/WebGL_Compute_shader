export class GLTFLoader
{
  public static glcontext:WebGLRenderingContext;

  public static async load(url:string):Promise<GLTFData>
  {
    const json:any = await fetch(url).then((response:Response) => response.json());
    const pathArr:string[] = url.split('/');
    pathArr.pop();
    const relativePath:string = pathArr.join('/');

    if(!GLTFLoader.glcontext)
    {
      GLTFLoader.glcontext = ((document.createElement('canvas') as HTMLCanvasElement).getContext('webgl') as WebGLRenderingContext);
    }
    const glcontext:WebGLRenderingContext = GLTFLoader.glcontext;

    // console.log(json);

    const mesh:any = json.meshes[0];
    const primitive:any = mesh.primitives[0];

    const data:GLTFData = {
      primitiveType:PrimitiveType.POINTS,
      numVertices:0,
      position:null,
      normal:null,
      indices:null
    };

    switch(primitive.mode)
    {
      case glcontext.POINTS:
        data.primitiveType = PrimitiveType.POINTS;
        break;
      case glcontext.LINES:
        data.primitiveType = PrimitiveType.LINES;
        break;
      case glcontext.TRIANGLES:
        data.primitiveType = PrimitiveType.TRIANGLES;
        break;
      default:
        return data;
    }

    const bufferDataList:ArrayBuffer[] = await GLTFLoader.loadBuffers(json.buffers, relativePath);
    const accessorsDataList:ArrayBufferView[] = GLTFLoader.loadAccessors(json.accessors, json.bufferViews, bufferDataList);

    const attributes:any = primitive.attributes;

    const positionAccessorIndex:number = attributes.POSITION;
    const positionAccessor:any = json.accessors[positionAccessorIndex];

    data.numVertices = positionAccessor.count;

    data.position = {
      data:accessorsDataList[positionAccessorIndex],
      num:GLTFLoader.getAccessorTypeSize(positionAccessor.type),
      min:positionAccessor.min,
      max:positionAccessor.max
    };
    // console.log(data);

    if(attributes.hasOwnProperty('NORMAL'))
    {
      const normalAccessorIndex:number = attributes.NORMAL;
      data.normal = {
        data:accessorsDataList[normalAccessorIndex],
        num:GLTFLoader.getAccessorTypeSize(json.accessors[normalAccessorIndex].type)
      };
    }

    if(primitive.hasOwnProperty('indices'))
    {
      const indicesAccessorIndex:number = primitive.indices;
      data.indices = {
        data:accessorsDataList[indicesAccessorIndex]
      };
    }

    return data;
  }

  private static async loadBuffers(buffers:any[], relativePath:string):Promise<ArrayBuffer[]>
  {
    const bufferDataList:ArrayBuffer[] = [];

    const length:number = buffers.length;
    for(let i:number = 0; i < length; i++)
    {
      const buffer:any = buffers[i];
      const bufferData:ArrayBuffer = await fetch(relativePath + '/' + buffer.uri).then((response:Response) => response.arrayBuffer());
      if(bufferData.byteLength === buffer.byteLength)
      {
        bufferDataList.push(bufferData);
      }
    }
    return bufferDataList;
  }

  private static loadAccessors(accessors:any[], bufferViews:any[], bufferDataList:ArrayBuffer[]):ArrayBufferView[]
  {
    const accessorsDataList:ArrayBufferView[] = [];

    const length:number = accessors.length;
    for(let i:number = 0; i < length; i++)
    {
      const accessor:any = accessors[i];
      const bufferView:any = bufferViews[accessor.bufferView];
      const bufferData:ArrayBuffer = bufferDataList[bufferView.buffer];
      switch(accessor.componentType)
      {
        case GLTFLoader.glcontext.BYTE:
          break;
        case GLTFLoader.glcontext.UNSIGNED_BYTE:
          break;
        case GLTFLoader.glcontext.SHORT:
          break;
        case GLTFLoader.glcontext.UNSIGNED_SHORT:
          const uint16Array:Uint16Array = new Uint16Array(bufferData, bufferView.byteOffset + accessor.byteOffset, accessor.count * GLTFLoader.getAccessorTypeSize(accessor.type));
          accessorsDataList.push(uint16Array);
          break;
        case GLTFLoader.glcontext.INT:
          break;
        case GLTFLoader.glcontext.UNSIGNED_INT:
          break;
        case GLTFLoader.glcontext.FLOAT:
          const float32Array:Float32Array = new Float32Array(bufferData, bufferView.byteOffset + accessor.byteOffset, accessor.count * GLTFLoader.getAccessorTypeSize(accessor.type));
          accessorsDataList.push(float32Array);
          break;
        default:
          break;
      }
    }
    return accessorsDataList;
  }

  private static getAccessorTypeSize(accessorType:string):number
  {
    let size:number = 0;
    switch(accessorType)
    {
      case 'SCALAR':
        size = AccessorType.SCALAR;
        break;
      case 'VEC2':
        size = AccessorType.VEC2;
        break;
      case 'VEC3':
        size = AccessorType.VEC3;
        break;
      case 'VEC4':
        size = AccessorType.VEC4;
        break;
      case 'MAT2':
        size = AccessorType.MAT2;
        break;
      case 'MAT3':
        size = AccessorType.MAT3;
        break;
      case 'MAT4':
        size = AccessorType.MAT4;
        break;
    }
    return size;
  }

  constructor()
  {
  }
}

declare const enum AccessorType
{
  'SCALAR' = 1,
  'VEC2' = 2,
  'VEC3' = 3,
  'VEC4' = 4,
  'MAT2' = 4,
  'MAT3' = 9,
  'MAT4' = 16
}

export declare const enum PrimitiveType
{
  'POINTS',
  'LINES',
  'TRIANGLES'
}

export declare interface GLTFData
{
  primitiveType:PrimitiveType;
  numVertices:number;
  position:GLTFAttributeData;
  normal:GLTFAttributeData;
  indices:GLTFIndexData;
}

export declare interface GLTFAttributeData
{
  data:ArrayBufferView;
  num:number;
  min?:number[];
  max?:number[];
}

export declare interface GLTFIndexData
{
  data:ArrayBufferView;
}
