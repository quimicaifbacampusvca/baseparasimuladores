namespace BaseDemoSI {
  /** Coordenadas independentes de resolução; commit ocorre somente no fim do gesto. */
  export function moveEntityByPixels(entity:SceneEntity, deltaX:number, deltaY:number, boundsWidth:number, boundsHeight:number):{x:number,y:number}|null {
    if (![deltaX,deltaY,boundsWidth,boundsHeight].every(Number.isFinite)||boundsWidth<=0||boundsHeight<=0)return null;
    const clamp=(value:number,extent:number)=>Math.min(100-extent/2,Math.max(extent/2,value));
    const round=(value:number)=>Math.round(value*10)/10;
    return {x:round(clamp(entity.x+(deltaX/boundsWidth)*100,entity.width)),y:round(clamp(entity.y+(deltaY/boundsHeight)*100,entity.height))};
  }
  /** Todo movimento interativo sobre a cena depende da capacidade de manipulação. */
  export function sceneManipulationAllowed():boolean {return moduleAllows("tools");}
}
