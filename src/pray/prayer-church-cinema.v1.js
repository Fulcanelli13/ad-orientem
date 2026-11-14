import "./prayer-church-cinema-styles.js";
/**
 * Live, physically modeled CSS-3D church camera for the Prayer modules.
 * Geometry, face matrix mathematics, cathedral topology, and eased camera
 * interpolation are adapted from the user's existing Claude-authored
 * Ad_Orientem_Prayers_R1_Altarpiece_and_Interactive_Church.html donor.
 *
 * This file does not author/advance prayers. Confession comes from its four
 * pre-existing macro stages; Tenebrae from the canonical Office plus an
 * independently opted-in *observed* local candle companion. No absolution,
 * implied priest, fabricated gesture, auto-extinguishing, stored sins or audio.
 *
 * CSS-3D is intentionally free of paid APIs, WebGL packages and downloads.
 */

export const PRAYER_CHURCH_CINEMA_VERSION="prayer-church-cinema-donor-v1";
const SC=46,DEG=Math.PI/180,RES=2.6;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const clone=x=>JSON.parse(JSON.stringify(x));
const L=(fr,en,french)=>french?fr:en;
// These locations correspond to the donor's actual physically modeled
// confessionals, choir stalls and high altar, rather than a flat illustration.
export const PRAYER_CINEMA_POSES=Object.freeze({
  confession:Object.freeze({
    prepare:{T:[4.65,1.8,9.6],yaw:27,el:9,dist:9.3,P:690,oy:.49},
    examine:{T:[5.75,1.6,9.6],yaw:62,el:9,dist:6.4,P:690,oy:.49},
    approach:{T:[5.9,1.65,10.25],yaw:3,el:5,dist:4.0,P:690,oy:.49},
    after:{T:[0,2.2,1.45],yaw:-8,el:8,dist:9.3,P:700,oy:.48}
  }),
  tenebrae:Object.freeze({
    office:{T:[-2.65,1.9,2.65],yaw:-26,el:7,dist:8.6,P:700,oy:.49},
    candles:{T:[0,1.8,3.4],yaw:0,el:6,dist:5.8,P:700,oy:.48}
  })
});

function churchFaces({kind,ceremony}={}){
 let OUT=[];
 const LIGHT=[0,3.4,4];
 const v3=(x,h,z)=>[x*SC,-h*SC,z*SC];
 const norm=a=>{const length=Math.hypot(...a)||1;return [...a.map(x=>x/length),length]};
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function lightOn(P,U,V,N){
  const D=v3(...LIGHT).map((x,i)=>x-P[i]);
  const pu=D.reduce((a,x,i)=>a+x*U[i],0),pv=D.reduce((a,x,i)=>a+x*V[i],0);
  const distance=Math.abs(D.reduce((a,x,i)=>a+x*N[i],0))/SC;
  const front=D.reduce((a,x,i)=>a+x*N[i],0)>0;
  const a0=Math.min(.57,.03+distance*.05+(front?0:.15));
  const radius=(7.5+distance*.8)*SC;
  return `radial-gradient(circle at ${pu.toFixed(0)}px ${pv.toFixed(0)}px,rgba(9,8,7,${a0.toFixed(2)}) 0,rgba(9,8,7,${Math.min(.9,a0+.25).toFixed(2)}) ${(radius*.55).toFixed(0)}px,rgba(9,8,7,.83) ${radius.toFixed(0)}px)`;
 }
 function face(p,u,v,mat,opt={}){
  const P=v3(...p),U=[u[0]*SC,-u[1]*SC,u[2]*SC],V=[v[0]*SC,-v[1]*SC,v[2]*SC];
  const [ux,uy,uz,w]=norm(U),[vx,vy,vz,h]=norm(V);
  if(w<=.01||h<=.01)return;
  const [nx,ny,nz]=norm(cross([ux,uy,uz],[vx,vy,vz]));
  const transform=`matrix3d(${ux.toFixed(5)},${uy.toFixed(5)},${uz.toFixed(5)},0,${vx.toFixed(5)},${vy.toFixed(5)},${vz.toFixed(5)},0,${nx.toFixed(5)},${ny.toFixed(5)},${nz.toFixed(5)},0,${P[0].toFixed(1)},${P[1].toFixed(1)},${P[2].toFixed(1)},1)`;
  const lo=opt.nolight?"":`--ao-cinema-light:${lightOn(P,[ux,uy,uz],[vx,vy,vz],[nx,ny,nz])};`;
  OUT.push(`<div class="aoChurchFace m-${mat}" style="width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:${transform};${lo}${opt.style||""}">${opt.content||""}</div>`);
 }
 function box(x0,x1,h0,h1,z0,z1,materials,skip=""){
  const m=typeof materials==="string"?{t:materials,f:materials,b:materials,l:materials,r:materials}:materials;
  const dx=x1-x0,dh=h1-h0,dz=z1-z0;
  if(!skip.includes("t"))face([x0,h1,z0],[dx,0,0],[0,0,dz],m.t||m.f);
  if(!skip.includes("f"))face([x0,h1,z1],[dx,0,0],[0,-dh,0],m.f);
  if(!skip.includes("b"))face([x1,h1,z0],[-dx,0,0],[0,-dh,0],m.b||m.f);
  if(!skip.includes("l"))face([x0,h1,z0],[0,0,dz],[0,-dh,0],m.l||m.f);
  if(!skip.includes("r"))face([x1,h1,z1],[0,0,-dz],[0,-dh,0],m.r||m.f);
 }
 const floor=(x0,x1,z0,z1,h,mat)=>face([x0,h,z0],[x1-x0,0,0],[0,0,z1-z0],mat);
 const wallN=(x,z0,z1,h0,h1,mat)=>face([x,h1,z1],[0,0,-(z1-z0)],[0,-(h1-h0),0],mat);
 const wallS=(x,z0,z1,h0,h1,mat)=>face([x,h1,z0],[0,0,z1-z0],[0,-(h1-h0),0],mat);
 const wallE=(z,x0,x1,h0,h1,mat)=>face([x0,h1,z],[x1-x0,0,0],[0,-(h1-h0),0],mat);
 const wallW=(z,x0,x1,h0,h1,mat)=>face([x1,h1,z],[-(x1-x0),0,0],[0,-(h1-h0),0],mat);
 // Main architectural grammar follows the donor: longitudinal nave,
 // sanctuary steps, original high altar + tabernacle, rail, choir stalls,
 // right aisle confessional, organ loft, and side stained-glass windows.
 floor(-6.5,6.5,4.98,22,0,"floor");floor(-.6,.6,4.98,21.7,.005,"runner");
 box(-4.5,4.5,0,.15,-1.6,4.98,{t:"altar-floor",f:"riser",l:"riser",r:"riser"},"b");
 for(const [a,b,h] of [[-1,1,.28],[-.7,1.26,.43],[-.4,1.51,.57]]){
  box(-2.7,2.7,h-.15,h,-1,b,{t:"marble",f:"riser",l:"riser",r:"riser"},"b");
 }
 box(-1.5,1.5,.59,1.59,-.9,-.05,{t:"linen",f:"frontal",b:"marble",l:"marble",r:"marble"});
 box(-1.5,1.5,1.59,1.76,-.9,-.62,{t:"gold",f:"gold",l:"gold",r:"gold"},"b");
 box(-.36,.36,1.76,2.28,-.9,-.42,{t:"gold",f:"tabernacle",l:"gold",r:"gold"},"b");
 wallE(-1,-2.45,2.45,.6,6.4,"reredos");
 face([-2.6,7.2,-.99],[5.2,0,0],[0,-.85,0],"pediment");
 box(-2.55,2.55,6.35,6.51,-1.08,-.94,"gold","b");
 // A monumental crucifix hangs in the same high-altar plane.
 box(-.085,.085,2.85,5.5,-.9,-.78,"cross","b");
 box(-.55,.55,4.4,4.56,-.9,-.78,"cross","b");
 // Choir stalls flanking the sanctuary, without inventing ministers.
 for(const [a,b] of [[-4.45,-3.35],[3.35,4.45]]){
  box(a,b,.15,.62,1.4,4.4,{t:"pewseat",f:"pew",l:"pewend",r:"pewend",b:"pew"});
  const back=a<0?a:b-.12;
  box(back,back+.12,.62,1.7,1.4,4.4,{t:"pewtop",f:"pew",l:"pewend",r:"pewend",b:"pew"});
 }
 for(const [a,b] of [[-4.5,-.62],[.62,4.5]]){
  box(a,b,.16,.22,4.68,4.98,"marble","b");
  face([a,.88,4.92],[b-a,0,0],[0,-.67,0],"rail");
  box(a,b,.88,.97,4.66,4.99,"marble","b");
 }
 wallN(-4.5,-1.6,4.98,.15,8.2,"wall");wallS(4.5,-1.6,4.98,.15,8.2,"wall");wallE(-1.6,-4.5,4.5,.15,8.2,"wall");
 wallN(-6.5,4.98,22,0,9.5,"wall");wallS(6.5,4.98,22,0,9.5,"wall");wallW(22,-6.5,6.5,0,9.5,"wall");
 wallE(4.98,-6.5,-4.5,0,9.5,"stone");wallE(4.98,4.5,6.5,0,9.5,"stone");
 wallE(4.98,-4.5,4.5,6.6,9.5,"stone");
 for(const z of [12.9,19.6]){
  face([-6.49,8.6,z+.6],[0,0,-1.2],[0,-3.2,0],"window",{nolight:true});
  face([6.49,8.6,z-.6],[0,0,1.2],[0,-3.2,0],"window",{nolight:true});
 }
 face([-4.49,7.6,.9],[0,0,-1.1],[0,-2.8,0],"window",{nolight:true});
 face([4.49,7.6,-.2],[0,0,1.1],[0,-2.8,0],"window",{nolight:true});
 for(const x of [-6.25,4.75])box(x,x+1.5,0,1.0,5.0,5.62,{t:"linen",f:"frontal",l:"marble",r:"marble"},"b");
 // The triangular hearse is optional: physically include it only when
 // a user has explicitly enabled an actually observed local ceremony.
 if(kind==="tenebrae"&&ceremony?.enabled===true){
  const z=3.18;
  // These angled metal members support real 3-D candle positions; they
  // aren't a 2-D pictogram superimposed over the sanctuary.
  face([-1.68,1.10,z],[1.68,1.57,0],[0,-.095,0],"gold");
  face([0,2.67,z],[1.68,-1.57,0],[0,-.095,0],"gold");
  box(-.075,.075,.6,2.70,z-.10,z+.10,"gold");
  box(-.72,.72,.55,.65,z-.24,z+.24,"wood");
 }
 // One real box in the church, not a fake CSS painting of a confessional.
 box(5.30,6.5,0,2.75,8.5,10.7,{t:"confroof",f:"confess",b:"confside",l:"confside",r:"confside"},"r");
 // Confessional grille and side pilasters, visible as the camera approaches.
 face([5.51,2.13,10.707],[.78,0,0],[0,-.70,0],"wood",{style:"background-image:repeating-linear-gradient(90deg,#21150e 0 7px,#b48b56 7px 10px),repeating-linear-gradient(0deg,transparent 0 21px,#a6824f 21px 23px);"});
 box(-6.5,6.5,3.5,3.7,20.2,22,"wood","t");
 face([-6.5,4.45,20.2],[13,0,0],[0,-.75,0],"rail");
 face([-3.7,8,21.97],[2.4,0,0],[0,-3.4,0],"gold",{style:"background-image:repeating-linear-gradient(90deg,#e7d9b2 0 6px,#4e3822 6px 11px);"});
 face([1.3,8,21.97],[2.4,0,0],[0,-3.4,0],"gold",{style:"background-image:repeating-linear-gradient(90deg,#e7d9b2 0 6px,#4e3822 6px 11px);"});
 for(const x of [-5.6,5.6])box(x-.15,x+.15,0,3.5,20.25,20.55,"marble");
 face([1.1,3.2,21.98],[-2.2,0,0],[0,-3.2,0],"wood");
 for(let i=0;i<8;i++){
  const z=7.3+i*1.43;
  for(const [a,b] of [[-4.6,-.95],[.95,4.6]]){
   box(a,b,0,.45,z-.2,z+.2,{t:"pewseat",f:"pew",b:"pew",l:"pewend",r:"pewend"});
   box(a,b,.45,.96,z+.15,z+.22,{t:"pewtop",f:"pew",b:"pew",l:"pewend",r:"pewend"});
  }
 }
 return OUT.join("");
}

const geometryCache=new Map();
function geometryMarkup(kind,ceremony){
 const key=kind==="tenebrae"&&ceremony?.enabled===true?"hearse":"church";
 if(!geometryCache.has(key))geometryCache.set(key,churchFaces({kind,ceremony}));
 return geometryCache.get(key);
}
let lastCamera=null,lastCeremony=null,active=null;
function candleStatus(ceremony,i){
 const number=Number.isInteger(ceremony?.extinguished)?clamp(ceremony.extinguished,0,14):0;
 if(i===14)return ceremony?.hidden&&!ceremony?.returned?"concealed":"lit";
 return i<number?"dark":"lit";
}
function poseFor(kind,phase,ceremony){
 if(kind==="confession")return PRAYER_CINEMA_POSES.confession[phase]||PRAYER_CINEMA_POSES.confession.prepare;
 return ceremony?.enabled?PRAYER_CINEMA_POSES.tenebrae.candles:PRAYER_CINEMA_POSES.tenebrae.office;
}
function cameraWorld(camera){
 const yaw=camera.yaw*DEG,elevation=clamp(camera.el,-10,88)*DEG;
 const dx=Math.sin(yaw)*Math.cos(elevation),dy=-Math.sin(elevation),dz=-Math.cos(yaw)*Math.cos(elevation);
 return {point:[camera.T[0]-dx*camera.dist,camera.T[1]-dy*camera.dist,camera.T[2]-dz*camera.dist],yaw:camera.yaw,elevation:camera.el};
}
function blendPose(a,b,t){
 let delta=b.yaw-a.yaw;
 while(delta>180)delta-=360;while(delta< -180)delta+=360;
 return {T:a.T.map((v,i)=>v+(b.T[i]-v)*t),yaw:a.yaw+delta*t,
  el:a.el+(b.el-a.el)*t,dist:Math.exp(Math.log(a.dist)+(Math.log(b.dist)-Math.log(a.dist))*t),
  P:a.P+(b.P-a.P)*t,oy:a.oy+(b.oy-a.oy)*t};
}
export function mountPrayerChurchCinema({visual,kind,phase="prepare",ceremony=null,french=false}={}){
 if(!visual||typeof document==="undefined"||!["confession","tenebrae"].includes(kind))return null;
 active?.dispose();
 const doc=visual.ownerDocument,win=doc.defaultView;
 const reduce=Boolean(win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
 const root=doc.createElement("div");root.className="aoChurchCinema";root.dataset.aoCinemaKind=kind;
 root.dataset.aoCinemaSource="claude-interactive-church-css3d-donor";
 root.dataset.aoCinemaPrivacy="visual-only";root.setAttribute("aria-hidden","true");
 root.innerHTML='<div class="aoChurchCinemaViewport" aria-hidden="true"><div class="aoChurchCinemaWorld"></div></div><div class="aoChurchCinemaAtmosphere" aria-hidden="true"></div><div class="aoChurchCinemaDarkness" aria-hidden="true"></div>';
 const viewport=root.querySelector(".aoChurchCinemaViewport"),world=root.querySelector(".aoChurchCinemaWorld");
 world.innerHTML=geometryMarkup(kind,ceremony);
 const candles=[];
 if(kind==="tenebrae"){
  for(let i=0;i<15;i++){
   // 7+7 ascending side candles and one apex candle on an actual 3-D hearse.
   const apex=i===14,level=apex?7:(i<7?i:13-i);
   const x=apex?0:(i<7?-1.58+i*.21:1.58-(i-7)*.21);
   const el=doc.createElement("div");el.className="aoChurchBillboard";
   el.dataset.aoCinemaCandle=String(i);
   el.setAttribute("aria-hidden","true");
   el.innerHTML='<div class="aoChurchCandle"></div><div class="aoChurchFlame"></div>';
   const b={el,x,h:apex?2.65:1.12+level*.195,z:3.15,w:.23,ht:.45};
   el.style.width=(b.w*SC*RES).toFixed(1)+"px";
   el.style.height=(b.ht*SC*RES).toFixed(1)+"px";
   world.append(el);candles.push(b);
  }
 }
 if(kind==="tenebrae"){
  const badge=doc.createElement("div");badge.className="aoChurchCinemaBadge";
  badge.textContent=ceremony?.enabled?
    L("Cérémonial local observé", "Observed local ceremonial",french):
    L("Office de 1960 · aucune extinction présumée","1960 Office · no candle rite presumed",french);
  root.append(badge);
 }
 // The pre-existing source owner, the source artwork and the view selector
 // remain in place. This physically modeled scene overlays only the visuals.
 visual.insertBefore(root,visual.querySelector(".aoPrayerRitualViews")||null);
 let cancelled=false,raf=null,camera=null,frame=0;
 const target=clone(poseFor(kind,phase,ceremony));
 const prior=lastCamera?.kind===kind?lastCamera.pose:null;
 const initial=prior?clone(prior):clone(kind==="confession"?
   {T:[0,2.15,8.4],yaw:0,el:11,dist:12,P:700,oy:.48}:
   {T:[0,2,7.3],yaw:0,el:9,dist:11.5,P:700,oy:.49});
 const from=reduce?target:initial;
 const duration=reduce?0:(prior?930:1370);
 const start=win?.performance?.now?.()??performance.now();
 function render(cameraValue){
  camera=cameraValue;
  const {point,yaw,elevation}=cameraWorld(camera);
  viewport.style.perspective=camera.P+"px";
  viewport.style.perspectiveOrigin=`50% ${camera.oy*100}%`;
  world.style.top=(camera.oy*100)+"%";
  world.style.transform=`translateZ(${camera.P}px) rotateX(${-elevation}deg) rotateY(${yaw}deg) translate3d(${(-point[0]*SC).toFixed(2)}px,${(point[1]*SC).toFixed(2)}px,${(-point[2]*SC).toFixed(2)}px)`;
  for(const b of candles){
   b.el.style.transform=`translate3d(${(b.x*SC-b.w*SC*RES/2).toFixed(1)}px,${(-b.h*SC-b.ht*SC*RES).toFixed(1)}px,${(b.z*SC).toFixed(1)}px) rotateY(${-yaw}deg) scale(${(1/RES).toFixed(4)})`;
  }
  root.dataset.aoCinemaFrames=String(++frame);
 }
 function tick(now){
  if(cancelled)return;
  const t=duration?clamp((now-start)/duration,0,1):1;
  render(blendPose(from,target,ease(t)));
  if(t<1)raf=win.requestAnimationFrame(tick);
  else{raf=null;root.dataset.aoCinemaMoving="false";}
 }
 function setCandles(){
  const before=lastCeremony?.enabled?lastCeremony:ceremony;
  const current=ceremony?.enabled?ceremony:null;
  let previousDark=lastCeremony?.enabled?
    clamp(.14+clamp(lastCeremony.extinguished||0,0,14)*.035+(lastCeremony.hidden?.14:0),.14,.87):.27;
  const dark=current?clamp(.14+clamp(current.extinguished||0,0,14)*.035+(current.hidden?.14:0),.14,.87):.28;
  root.style.setProperty("--ao-cinema-shadow",String(previousDark));
  root.style.setProperty("--ao-cinema-warm",String(current?Math.max(.05,.33-(current.extinguished||0)*.02):.08));
  for(let i=0;i<candles.length;i++){
   const b=candles[i],old=candleStatus(before,i);
   b.el.className="aoChurchBillboard"+(old==="dark"?" is-dark":old==="concealed"?" is-concealed":"");
   b.el.style.display=current?"":"none";
  }
  const settle=()=>{
   if(cancelled)return;
   root.style.setProperty("--ao-cinema-shadow",String(dark));
   for(let i=0;i<candles.length;i++){
    const status=candleStatus(current,i);
    candles[i].el.className="aoChurchBillboard"+(status==="dark"?" is-dark":status==="concealed"?" is-concealed":"");
   }
  };
  if(reduce)settle();else win.requestAnimationFrame(()=>win.requestAnimationFrame(settle));
  if(kind==="tenebrae")lastCeremony=current?clone(current):null;
 }
 root.dataset.aoCinemaPhase=kind==="tenebrae"?(ceremony?.enabled?"observed-candles":"office"):phase;
 root.dataset.aoCinemaMoving=String(!reduce);
 if(kind==="tenebrae")setCandles();
 if(reduce)render(target);else raf=win.requestAnimationFrame(tick);
 const obj={root,get camera(){return camera},get frameCount(){return frame},
  dispose(){if(cancelled)return;cancelled=true;if(raf!==null)win.cancelAnimationFrame(raf);
   lastCamera={kind,pose:clone(camera||target)};root.remove();if(active===obj)active=null;}};
 active=obj;return obj;
}
