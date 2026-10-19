// Explore's reviewable category emblem set, independent of source-owned insignia.
// The glyphs depict UI categories, not ecclesiastical recognition or provenance.
// A future approved asset-bank substitution only needs to replace this renderer.
export const EXPLORE_MEDALLION_KINDS=Object.freeze([
  "CHURCH","SHRINE","RELIC","PILGRIMAGE","APPARITION","TRADITION","SAINT",
]);
export const EXPLORE_MEDALLION_ID_PREFIX="ao-explore-medallion-";

export function exploreCategoryMedallionKind(item={}){
  const lens=String(item.lens??"").toLowerCase();
  const category=lens==="heritage"?String(item.heritage_primary??"").toLowerCase():lens;
  return Object.freeze({
    shrines:"SHRINE",relics:"RELIC",pilgrimages:"PILGRIMAGE",
    apparitions:"APPARITION",traditions:"TRADITION",saints:"SAINT",
  })[category]??"CHURCH";
}

// MapLibre reads source-owned data properties; no visual category creates a Place.
export function exploreCategoryMedallionExpression(){
  return ["match",["case",["==",["get","lens"],"heritage"],
    ["get","heritage_primary"],["get","lens"]],
    "shrines","SHRINE","relics","RELIC","pilgrimages","PILGRIMAGE",
    "apparitions","APPARITION","traditions","TRADITION","saints","SAINT",
    "CHURCH"];
}
const pt=(ctx,x,y)=>ctx.lineTo(x,y);
function shape(ctx,kind){
  ctx.beginPath();
  if(kind==="CHURCH"){
    ctx.moveTo(19,61);pt(ctx,65,61);ctx.moveTo(24,61);pt(ctx,24,34);pt(ctx,42,20);pt(ctx,60,34);pt(ctx,60,61);
    ctx.moveTo(35,61);pt(ctx,35,45);ctx.quadraticCurveTo(42,35,49,45);pt(ctx,49,61);
    ctx.moveTo(42,19);pt(ctx,42,10);ctx.moveTo(36,14);pt(ctx,48,14);
  }else if(kind==="SHRINE"){
    ctx.moveTo(20,63);pt(ctx,64,63);ctx.moveTo(26,63);pt(ctx,26,31);
    ctx.quadraticCurveTo(42,11,58,31);pt(ctx,58,63);
    ctx.moveTo(32,59);pt(ctx,32,39);ctx.quadraticCurveTo(42,28,52,39);pt(ctx,52,59);
    ctx.moveTo(42,30);pt(ctx,42,20);ctx.moveTo(37,25);pt(ctx,47,25);
  }else if(kind==="RELIC"){
    ctx.moveTo(42,14);pt(ctx,42,25);ctx.moveTo(36,19);pt(ctx,48,19);
    ctx.moveTo(30,32);pt(ctx,54,32);pt(ctx,59,40);pt(ctx,55,59);pt(ctx,29,59);pt(ctx,25,40);ctx.closePath();
    ctx.moveTo(36,47);ctx.quadraticCurveTo(42,35,48,47);pt(ctx,48,55);pt(ctx,36,55);ctx.closePath();
    ctx.moveTo(20,64);pt(ctx,64,64);
  }else if(kind==="PILGRIMAGE"){
    ctx.moveTo(42,63);ctx.quadraticCurveTo(8,43,24,27);ctx.quadraticCurveTo(33,15,42,27);
    ctx.quadraticCurveTo(51,15,60,27);ctx.quadraticCurveTo(76,43,42,63);
    for(const [x,y] of [[24,27],[31,23],[42,26],[53,23],[60,27]]){ctx.moveTo(42,63);pt(ctx,x,y);}
  }else if(kind==="APPARITION"){
    ctx.arc(42,35,10,0,Math.PI*2);
    for(let i=0;i<8;i++){const angle=(i*Math.PI)/4;ctx.moveTo(42+15*Math.cos(angle),35+15*Math.sin(angle));pt(ctx,42+23*Math.cos(angle),35+23*Math.sin(angle));}
    ctx.moveTo(25,63);ctx.quadraticCurveTo(42,51,59,63);
  }else if(kind==="TRADITION"){
    ctx.moveTo(23,59);pt(ctx,61,59);ctx.moveTo(26,54);pt(ctx,58,54);
    ctx.moveTo(42,17);pt(ctx,42,52);ctx.moveTo(31,30);pt(ctx,53,30);
    ctx.moveTo(28,63);pt(ctx,56,63);
  }else if(kind==="SAINT"){
    ctx.arc(42,31,12,0,Math.PI*2);
    ctx.moveTo(21,63);ctx.quadraticCurveTo(22,46,42,46);
    ctx.quadraticCurveTo(62,46,63,63);
    ctx.moveTo(25,14);ctx.quadraticCurveTo(42,5,59,14);
  }
  ctx.stroke();
}
// Runs once per MapLibre map. Canvases are registered sprites, never DOM markers.
export function registerExploreCategoryMedallions(map,win=globalThis){
  if(!map?.addImage||!win?.document?.createElement)return false;
  const canvas=win.document.createElement("canvas");
  canvas.width=84;canvas.height=84;
  const ctx=canvas.getContext?.("2d");
  if(!ctx)return false;
  try{
    for(const kind of EXPLORE_MEDALLION_KINDS){
      for(const approximate of [false,true]){
        ctx.clearRect(0,0,84,84);
        // Ivory discs, finely outlined in gold. Approximate positions have a
        // visibly interrupted muted rim; they never pretend to be entrances.
        ctx.beginPath();ctx.arc(42,42,37,0,2*Math.PI);
        ctx.fillStyle=approximate?"#D4D8D2":"#EBE2D1";ctx.fill();
        ctx.strokeStyle=approximate?"#7B908B":"#B99C6B";
        ctx.lineWidth=3.2;ctx.setLineDash(approximate?[5,5]:[]);ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth=3.4;ctx.strokeStyle=approximate?"#56675F":"#655137";
        ctx.lineCap="round";ctx.lineJoin="round";
        shape(ctx,kind);
        const id=EXPLORE_MEDALLION_ID_PREFIX+kind+(approximate?"-indicative":"");
        if(!map.hasImage?.(id))map.addImage(id,ctx.getImageData(0,0,84,84),{pixelRatio:2});
      }
    }
    return true;
  }catch{return false;}
}
