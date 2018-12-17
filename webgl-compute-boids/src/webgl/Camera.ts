import {mat4, vec3} from 'gl-matrix';

export class Camera
{
  public static DIRECTION:vec3 = vec3.fromValues(0.0, 0.0, 1.0);
  //
  private _cameraUP:vec3 = vec3.fromValues(0.0, 1.0, 0.0);
  //
  private _projectionMtx:mat4 = mat4.identity(mat4.create());
  private _cameraMtx:mat4 = mat4.identity(mat4.create());
  private _lookMtx:mat4 = mat4.identity(mat4.create());
  //
  public x:number = 0.0;
  public y:number = 0.0;
  public z:number = 0.0;

  constructor(fov:number, aspect:number, zNear:number, zFar:number)
  {
    mat4.perspective(this._projectionMtx, fov, aspect, zNear, zFar);
  }

  public getCameraMtx():mat4
  {
    return this._cameraMtx;
  }

  public lookAt(point:vec3):void
  {
    mat4.identity(this._lookMtx);
    mat4.lookAt(this._lookMtx, vec3.fromValues(this.x, this.y, this.z), point, this._cameraUP);
    mat4.multiply(this._cameraMtx, this._projectionMtx, this._lookMtx);
  }
}
