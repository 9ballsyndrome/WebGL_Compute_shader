export class RGB
{
  public r:number = 0;
  public g:number = 0;
  public b:number = 0;

  constructor(r:number, g:number, b:number)
  {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public static createFromHSV(h:number, s:number, v:number):RGB
  {
    if(s > 1.0)
    {
      s = 1.0;
    }

    if(v > 1.0)
    {
      v = 1.0;
    }

    let th:number = (h + 360) % 360;
    let i:number = Math.floor(th / 60);
    let f:number = th / 60 - i;
    let m:number = v * (1 - s);
    let n:number = v * (1 - s * f);
    let k:number = v * (1 - s * (1 - f));

    let color:RGB;
    if(s === 0)
    {
      color = new RGB(v, v, v);
    }
    else
    {
      switch(i)
      {
        case 0:
        {
          color = new RGB(v, k, m);
          break;
        }
        case 1:
        {
          color = new RGB(n, v, m);
          break;
        }
        case 2:
        {
          color = new RGB(m, v, k);
          break;
        }
        case 3:
        {
          color = new RGB(m, n, v);
          break;
        }
        case 4:
        {
          color = new RGB(k, m, v);
          break;
        }
        case 5:
        {
          color = new RGB(v, m, n);
          break;
        }
      }
    }
    return color;
  }
}