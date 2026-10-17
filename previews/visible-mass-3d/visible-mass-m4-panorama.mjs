/**
 * The Visible Mass M4: genuine fixed-vantage 360-degree photographic projection.
 * Research review only. No virtual walking, invented geometry, ceremonial evidence,
 * transferred still-photo hotspot coordinates or author-owned liturgical answers.
 *
 * Source images are requested at a bounded width from Wikimedia Commons. The
 * source image and licensed photographer remain identified for every scene.
 */
export const M4_PANORAMA_SCENES=Object.freeze({
 BROMPTON_PANO:Object.freeze({
  id:"BROMPTON_PANO", venue:"Brompton Oratory, London",
  filename:"Brompton Oratory 360x180, London, UK - Diliff.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Brompton_Oratory_360x180,_London,_UK_-_Diliff.jpg",
  creator:"David Iliff",licence:"CC BY-SA 3.0",
  caption:"Brompton Oratory · genuine 360° interior photograph · not a Mass in progress"
 }),
 NEWMAN_360:Object.freeze({
  id:"NEWMAN_360",venue:"Newman University Church, Dublin",
  filename:"Newman University Church Interior 360x180, Dublin, Ireland - Diliff.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Newman_University_Church_Interior_360x180,_Dublin,_Ireland_-_Diliff.jpg",
  creator:"David Iliff",licence:"CC BY-SA 3.0",
  caption:"Newman University Church · genuine 360° interior photograph · separate Catholic church, not a 1962 Mass record"
 })
});
const tau=Math.PI*2;
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export function m4PanoramaPose(sceneId,pose){
 if(!Object.hasOwn(M4_PANORAMA_SCENES,sceneId))throw new Error("Unknown original panorama scene");
 if(!pose||![pose.yaw,pose.pitch,pose.fov].every(Number.isFinite))throw new Error("Invalid panorama pose");
 return Object.freeze({sceneId,yaw:((pose.yaw+Math.PI)%tau+tau)%tau-Math.PI,
  pitch:clamp(pose.pitch,-1.25,1.25),fov:clamp(pose.fov,36,92)});
}
export function m4SourceRequest(sceneId){
 const scene=M4_PANORAMA_SCENES[sceneId];
 if(!scene)throw new Error("Unknown original panorama scene");
 const params=new URLSearchParams({action:"query",format:"json",formatversion:"2",
  prop:"imageinfo",iiprop:"url|size",iiurlwidth:"2048",
  titles:"File:"+scene.filename,origin:"*"});
 return "https://commons.wikimedia.org/w/api.php?"+params;
}
/** The positive pitch axis points UP; equatorial scanline is at image height / 2.
 * For a north-up equirectangular source, its first pixel row is the zenith.
 * This explicit convention prevents the former upside-down panorama defect.
 */
export function m4EquirectangularUV(x,y,width,height,pose){
 const fov=pose.fov*Math.PI/180, t=Math.tan(fov/2);
 const vx=(2*(x+.5)/width-1)*t*(width/height);
 const vy=(1-2*(y+.5)/height)*t;
 const pitch=pose.pitch,cp=Math.cos(pitch),sp=Math.sin(pitch);
 const yy=vy*cp+sp, zz=cp-vy*sp;
 const sy=Math.sin(pose.yaw),cy=Math.cos(pose.yaw);
 const xx=vx*cy+zz*sy, z=zz*cy-vx*sy;
 const lon=Math.atan2(xx,z),lat=Math.atan2(yy,Math.hypot(xx,z));
 return {u:((.5+lon/tau)%1+1)%1,v:clamp(.5-lat/Math.PI,0,1)};
}
export function createM4Panorama({mount,notice,onScene}){
 if(!mount||!notice||typeof onScene!=="function")throw new Error("M4 panorama requires explicit view elements");
 const canvas=document.createElement("canvas");
 canvas.setAttribute("aria-label","Rectilinear perspective from an authentic 360-degree photograph");
 canvas.style.cssText="display:block;width:100%;height:auto;background:#070b10";
 mount.replaceChildren(canvas);
 const ctx=canvas.getContext("2d",{alpha:false});
 if(!ctx)throw new Error("2D canvas unavailable");
 const source=document.createElement("canvas"),sctx=source.getContext("2d",{willReadFrequently:true});
 if(!sctx)throw new Error("Source canvas unavailable");
 const poses=new Map(),images=new Map();
 let active=null,sourcePixels=null,loading=0,frame=0,drag=null;
 const setNotice=(message)=>{notice.textContent=message;};
 function schedule(){
  if(!active||!sourcePixels||frame)return;
  frame=requestAnimationFrame(()=>{frame=0;render();});
 }
 function render(){
  if(!active||!sourcePixels)return;
  const w=clamp(Math.round(mount.clientWidth||600),280,560),h=Math.round(w*.58);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const pixels=ctx.createImageData(w,h),dst=pixels.data,src=sourcePixels.data,sw=sourcePixels.width,sh=sourcePixels.height;
  const pose=poses.get(active);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const uv=m4EquirectangularUV(x,y,w,h,pose);
   const px=Math.min(sw-1,Math.floor(uv.u*sw)),py=Math.min(sh-1,Math.floor(uv.v*sh));
   const a=(py*sw+px)*4,b=(y*w+x)*4;
   dst[b]=src[a];dst[b+1]=src[a+1];dst[b+2]=src[a+2];dst[b+3]=255;
  }
  ctx.putImageData(pixels,0,0);
 }
 async function open(sceneId){
  const scene=M4_PANORAMA_SCENES[sceneId];
  if(!scene)throw new Error("Unrecognised church photograph");
  const token=++loading;active=sceneId;
  if(!poses.has(sceneId))poses.set(sceneId,m4PanoramaPose(sceneId,{yaw:0,pitch:0,fov:72}));
  onScene(scene);setNotice("Loading original photographic panorama…");
  try{
   if(!images.has(sceneId)){
    const response=await fetch(m4SourceRequest(sceneId));
    if(!response.ok)throw new Error("Commons source metadata unavailable");
    const doc=await response.json(),info=doc?.query?.pages?.[0]?.imageinfo?.[0];
    const imageUrl=info?.thumburl||info?.url;
    if(!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(imageUrl||""))throw new Error("Unverified photographic host");
    const img=new Image();img.crossOrigin="anonymous";img.decoding="async";
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error("Photographic image unavailable"));img.src=imageUrl;});
    if(Math.abs(img.naturalWidth/img.naturalHeight-2)>.02)throw new Error("Source is not a 360×180 equirectangular photograph");
    images.set(sceneId,img);
   }
   if(token!==loading)return false;
   const img=images.get(sceneId);
   source.width=img.naturalWidth;source.height=img.naturalHeight;
   sctx.drawImage(img,0,0);
   sourcePixels=sctx.getImageData(0,0,source.width,source.height);
   setNotice("Fixed photographic viewpoint · drag to look, arrow keys to turn, +/- to zoom. No virtual walking.");
   schedule();return true;
  }catch(err){
   if(token!==loading)return false;
   sourcePixels=null;ctx.clearRect(0,0,canvas.width,canvas.height);
   setNotice("Panorama image unavailable. Open the original Commons photograph via the source credit, or return to the high altar. "+String(err.message||err));
   return false;
  }
 }
 function adjust(dyaw,dpitch,dfov){
  if(!active)return;
  const p=poses.get(active);poses.set(active,m4PanoramaPose(active,{yaw:p.yaw+dyaw,pitch:p.pitch+dpitch,fov:p.fov+dfov}));schedule();
 }
 canvas.style.touchAction="none";canvas.tabIndex=0;
 canvas.addEventListener("pointerdown",e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
  adjust(-dx/Math.max(1,canvas.clientWidth)*2.6,dy/Math.max(1,canvas.clientHeight)*1.3,0);
 });
 for(const type of ["pointerup","pointercancel","lostpointercapture"])canvas.addEventListener(type,()=>{drag=null;});
 canvas.addEventListener("keydown",e=>{
  const keys={ArrowLeft:[-.12,0,0],ArrowRight:[.12,0,0],ArrowUp:[0,.1,0],ArrowDown:[0,-.1,0],"+":[0,0,-5],"-":[0,0,5]};
  if(Object.hasOwn(keys,e.key)){e.preventDefault();adjust(...keys[e.key]);}
 });
 return Object.freeze({open,adjust,status:()=>({active,pose:active?poses.get(active):null,loaded:!!sourcePixels}),
  redraw:schedule,hide:()=>{loading++;active=null;sourcePixels=null;if(frame)cancelAnimationFrame(frame);frame=0;}});
}
