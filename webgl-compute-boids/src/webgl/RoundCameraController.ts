import {vec3} from 'gl-matrix';
import KeyboardEventName from './enum/events/KeyboardEventName';
import MouseEventName from './enum/events/MouseEventName';
import GestureEventName from './enum/events/GestureEventName';
import TouchEventName from './enum/events/TouchEventName';
import KeyCode from './enum/ui/KeyCode';
import {Camera} from './Camera';

export class RoundCameraController
{
  public static RAD:number = Math.PI / 180.0;

  // parameter
  public radiusMin:number = 1.0;
  public radiusOffset:number = 0.1;
  public gestureRadiusFactor:number = 20.0;

  // camera
  public radius:number = 2.0;
  private _camera:Camera;
  private _stage:HTMLCanvasElement;
  private _target:vec3;
  private _theta:number = 0.0;
  private _oldX:number = 0.0;
  private _phi:number = 90.0;
  private _oldY:number = 0.0;

  private _currentTheta:number = 0.0;
  private _currentPhi:number = 90.0;

  // for mouse
  public isMouseDown:Boolean;

  // for touch
  private _identifier:number;
  private _oldRadius:number;
  private _isGestureChange:Boolean;

  constructor(camera:Camera, stage:HTMLCanvasElement)
  {
    this._camera = camera;
    this._stage = stage;
    this._target = vec3.fromValues(0.0, 0.0, 0.0);
    this.enable();
    this._updateCamera();
  }

  public enable():void
  {
    document.addEventListener(KeyboardEventName.KEY_DOWN, (event:KeyboardEvent) =>
    {
      this._keyHandler(event);
    });
    document.addEventListener(MouseEventName.MOUSE_UP, (event:MouseEvent) =>
    {
      this._upHandler(event);
    });
    this._stage.addEventListener(MouseEventName.MOUSE_DOWN, (event:MouseEvent) =>
    {
      this._downHandler(event);
    });
    this._stage.addEventListener(MouseEventName.MOUSE_MOVE, (event:MouseEvent) =>
    {
      this._moveHandler(event);
    });
    this._stage.addEventListener(MouseEventName.MOUSE_WHEEL, (event:WheelEvent) =>
    {
      this._wheelHandler(event);
    });
    this._stage.addEventListener(MouseEventName.DOM_MOUSE_SCROLL, (event:WheelEvent) =>
    {
      this._domMouseScrollHandler(event);
    });

    // touch
    if('ontouchstart' in window)
    {
      this._stage.addEventListener(TouchEventName.TOUCH_START, (event:TouchEvent) =>
      {
        this._touchStartHandler(event);
      });
      this._stage.addEventListener(TouchEventName.TOUCH_MOVE, (event:TouchEvent) =>
      {
        this._touchMoveHandler(event);
      });
      document.addEventListener(TouchEventName.TOUCH_END, (event:TouchEvent) =>
      {
        this._touchEndHandler(event);
      });
    }
    if('ongesturestart' in window || 'GestureEvent' in window)
    {
      this._stage.addEventListener(GestureEventName.GESTURE_START, (event:MSGestureEvent) =>
      {
        this._gestureStartHandler(event);
      });
      this._stage.addEventListener(GestureEventName.GESTURE_CHANGE, (event:MSGestureEvent) =>
      {
        this._gestureChangeHandler(event);
      });
      document.addEventListener(GestureEventName.GESTURE_END, (event:MSGestureEvent) =>
      {
        this._gestureEndHandler(event);
      });
    }
  }

  private _keyHandler(event:KeyboardEvent):void
  {
    switch(event.keyCode)
    {
      case KeyCode.UP:
        this.radius -= this.radiusOffset;
        if(this.radius < this.radiusMin)
        {
          this.radius = this.radiusMin;
        }
        break;
      case KeyCode.DOWN:
        this.radius += this.radiusOffset;
        break;
      default:
        break;
    }
  }

  private _upHandler(event:MouseEvent):void
  {
    this.isMouseDown = false;
  }

  private _downHandler(event:MouseEvent):void
  {
    this.isMouseDown = true;
    let rect:ClientRect = (<Element> event.target).getBoundingClientRect();
    this._oldX = event.clientX - rect.left;
    this._oldY = event.clientY - rect.top;
  }

  private _wheelHandler(event:WheelEvent):void
  {
    event.preventDefault();
    if(event.deltaY < 0)
    {
      this.radius -= this.radiusOffset;
      if(this.radius < this.radiusMin)
      {
        this.radius = this.radiusMin;
      }
    }
    else
    {
      this.radius += this.radiusOffset;
    }
  }

  private _domMouseScrollHandler(event:any):void
  {
    event.preventDefault();
    if(event.detail < 0)
    {
      this.radius -= this.radiusOffset;
      if(this.radius < this.radiusMin)
      {
        this.radius = this.radiusMin;
      }
    }
    else
    {
      this.radius += this.radiusOffset;
    }
  }

  private _moveHandler(event:MouseEvent):void
  {
    if(this.isMouseDown)
    {
      let rect:ClientRect = (<Element> event.target).getBoundingClientRect();
      let stageX:number = event.clientX - rect.left;
      let stageY:number = event.clientY - rect.top;

      this.inputXY(stageX, stageY);
    }
  }

  private _touchStartHandler(event:TouchEvent):void
  {
    event.preventDefault();
    if(!this.isMouseDown)
    {
      let touches:TouchList = event.changedTouches;
      let touch:Touch = touches[0];
      this.isMouseDown = true;
      this._identifier = touch.identifier;
      let target:HTMLElement = <HTMLElement> touch.target;
      this._oldX = touch.pageX - target.offsetLeft;
      this._oldY = touch.pageY - target.offsetTop;
    }
  }

  private _touchMoveHandler(event:TouchEvent):void
  {
    event.preventDefault();
    if(this._isGestureChange)
    {
      return;
    }
    let touches:TouchList = event.changedTouches;
    let touchLength:number = touches.length;
    for(let i:number = 0; i < touchLength; i++)
    {
      let touch:Touch = touches[i];
      if(touch.identifier === this._identifier)
      {
        let target:HTMLElement = <HTMLElement> touch.target;
        let stageX:number = touch.pageX - target.offsetLeft;
        let stageY:number = touch.pageY - target.offsetTop;
        this.inputXY(stageX, stageY);
        break;
      }
    }
  }

  private _touchEndHandler(event:TouchEvent):void
  {
    if(this.isMouseDown)
    {
      event.preventDefault();
    }
    this.isMouseDown = false;
  }

  private _gestureStartHandler(event:MSGestureEvent):void
  {
    event.preventDefault();
    event.stopImmediatePropagation();
    this._isGestureChange = true;
    this.isMouseDown = true;
    this._oldRadius = this.radius;
  }

  private _gestureChangeHandler(event:MSGestureEvent):void
  {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.radius = this._oldRadius + this.gestureRadiusFactor * this.radiusOffset * (1 - event.scale);
    if(this.radius < this.radiusMin)
    {
      this.radius = this.radiusMin;
    }
  }

  private _gestureEndHandler(event:MSGestureEvent):void
  {
    event.preventDefault();
    event.stopImmediatePropagation();
    this._isGestureChange = false;
    this.isMouseDown = false;
    this._identifier = -1;
  }

  private inputXY(newX:number, newY:number):void
  {
    this._theta -= (newX - this._oldX) * 0.3;
    this._oldX = newX;
    this._phi -= (newY - this._oldY) * 0.3;
    this._oldY = newY;
    //
    if(this._phi < 20)
    {
      this._phi = 20;
    }
    else if(this._phi > 160)
    {
      this._phi = 160;
    }
  }

  private _updateCamera():void
  {
    let t:number = this._currentTheta * RoundCameraController.RAD;
    let p:number = this._currentPhi * RoundCameraController.RAD;

    let rsin:number = this.radius * Math.sin(p);
    this._camera.x = rsin * Math.sin(t) + this._target[0];
    this._camera.z = rsin * Math.cos(t) + this._target[2];
    this._camera.y = this.radius * Math.cos(p) + this._target[1];

    this._camera.lookAt(this._target);
  }

  public upDate(factor:number = 0.1):void
  {
    this._currentTheta += (this._theta - this._currentTheta) * factor;
    this._currentPhi += (this._phi - this._currentPhi) * factor;

    this._updateCamera();
  }

  public rotate(dTheta:number, dPhi:number):void
  {
    this._theta += dTheta;
    this._phi += dPhi;
  }

  public set(theta:number, phi:number):void
  {
    this._theta = theta;
    this._phi = phi;
  }
}
