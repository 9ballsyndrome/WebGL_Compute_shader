import {GUI} from 'dat.gui';

export class GUIPanel
{
  public num:number;
  public separateWeight:number;
  public alignmentWeight:number;
  public cohesionWeight:number;

  public resetFunction:Function;

  constructor()
  {
    this.num = 0;
    this.reset();
  }

  public reset():void
  {
    this.separateWeight = 3.0;
    this.alignmentWeight = 1.0;
    this.cohesionWeight = 1.0;
  }

  public static setGUITitle(gui:GUI, propertyName:string, title:string):void
  {
    let propertyList:HTMLCollectionOf<Element> = gui.domElement.getElementsByClassName('property-name');
    let length:number = propertyList.length;
    for(let i:number = 0; i < length; i++)
    {
      let element:Element = propertyList[i];
      if(element.innerHTML === propertyName)
      {
        element.innerHTML = title;
      }
    }
  }
}
