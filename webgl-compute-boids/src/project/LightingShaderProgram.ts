import {ProgramObject} from '../webgl/ProgramObject';
import {LightingShaderProgramUniform} from './LightingShaderProgramUniform';

export class LightingShaderProgram extends ProgramObject
{

  public get shaderUniform():LightingShaderProgramUniform
  {
    return this._uniformList[0] as LightingShaderProgramUniform;
  }

  protected init():void
  {
    // language=GLSL
    this._vertexShaderSource = `#version 300 es
      #define PI 3.141592653589793

      in vec3 position;
      in vec3 normal;
      in vec3 instancePosition;
      in vec3 instanceVelocity;
      in vec4 instanceColor;
      
      layout (std140) uniform Uniforms {
        mat4 vpMatrix;
        vec4 ambientLightColor;
        vec4 directionalLightColor;
        vec3 directionalLightDirection;
      } uniforms;
    
      out   vec4 vColor;
      
      mat4 createRotationMatrix(float rotX, float rotY, float rotZ)
      {
        float cosH = cos(rotY);
        float sinH = sin(rotY);
        float cosA = cos(rotZ);
        float sinA = sin(rotZ);
        float cosB = cos(rotX);
        float sinB = sin(rotX);
        
        return mat4(
        cosH * cosA + sinH * sinB * sinA, cosB * sinA, -sinH * cosA + cosH * sinB * sinA, 0.0,
        -cosH * sinA + sinH * sinB * cosA, cosB * cosA, sinH * sinA + cosH * sinB * cosA, 0.0,
        sinH * cosB, -sinB, cosH * cosB, 0.0,
        0.0, 0.0, 0.0, 1.0
        );
      }
      
      void main(void)
      {
        float rotY = atan(instanceVelocity.x, instanceVelocity.z);
        float rotX = -asin(instanceVelocity.y / (length(instanceVelocity.xyz) + 1e-8)) - 0.5 * PI;
        mat4 mMatrix = createRotationMatrix(rotX, rotY, 0.0);
        
        mMatrix[3] += vec4(instancePosition, 0.0);
        
        mat4 sMatrix = mat4(0.5);
        sMatrix[3][3] = 1.0;
        
        mMatrix =  mMatrix * sMatrix;
      
        vec4 pos = vec4(position, 1.0);
        gl_Position = (uniforms.vpMatrix * mMatrix) * pos;
        
        mat3 nMatrix = mat3(mMatrix);
        nMatrix = inverse(nMatrix);
        nMatrix = transpose(nMatrix);
        vec3 worldNormal = normalize(nMatrix * normal);
        float diffuse = dot(worldNormal, normalize(uniforms.directionalLightDirection));
        diffuse = clamp(diffuse, 0.0, 1.0);
        
        vColor = instanceColor * (uniforms.ambientLightColor + diffuse * uniforms.directionalLightColor);
      }
    `;

    // language=GLSL
    this._fragmentShaderSource = `#version 300 es
      precision mediump float;
      
      in vec4 vColor;
      out vec4 outColor;
      
      void main(void)
      {
        outColor = vColor;
      }
    `;

    this._uniformList[0] = new LightingShaderProgramUniform('Uniforms', 0);

    this.attributeList[0] = {
      name:'position',
      stride:3,
      location:-1
    };

    this.attributeList[1] = {
      name:'normal',
      stride:3,
      location:-1
    };

    this.attributeList[2] = {
      name:'instancePosition',
      stride:3,
      location:-1
    };

    this.attributeList[3] = {
      name:'instanceVelocity',
      stride:3,
      location:-1
    };

    this.attributeList[4] = {
      name:'instanceColor',
      stride:4,
      location:-1
    };
  }
}