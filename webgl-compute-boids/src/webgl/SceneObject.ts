import {mat4, vec3} from 'gl-matrix';

export class SceneObject
{
  private _mMatrix:mat4 = mat4.identity(mat4.create());
  private _translateVec:vec3 = vec3.create();
  private _scaleVec:vec3 = vec3.create();

  public x:number = 0.0;
  public y:number = 0.0;
  public z:number = 0.0;
  public scaleX:number = 1.0;
  public scaleY:number = 1.0;
  public scaleZ:number = 1.0;
  public rotationX:number = 0.0;
  public rotationY:number = 0.0;
  public rotationZ:number = 0.0;

  constructor()
  {
  }

  public getModelMtx():mat4
  {
    mat4.identity(this._mMatrix);
    vec3.set(this._translateVec, this.x, this.y, this.z);
    mat4.translate(this._mMatrix, this._mMatrix, this._translateVec);
    mat4.rotateZ(this._mMatrix, this._mMatrix, this.rotationZ);
    mat4.rotateY(this._mMatrix, this._mMatrix, this.rotationY);
    mat4.rotateX(this._mMatrix, this._mMatrix, this.rotationX);
    vec3.set(this._scaleVec, this.scaleX, this.scaleY, this.scaleZ);
    mat4.scale(this._mMatrix, this._mMatrix, this._scaleVec);
    return this._mMatrix;
  }
}
