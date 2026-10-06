// v3.4.10 non-Mass reading activation extracted from the approved donor.
// Presentation-only: it does not own devotional content, rails, routing or liturgical state.
const VERSION="3.4.10";
let raf=0,bindRaf=0,boundMount=null;
let lastAngelusScrollTop=0,lastStationsScrollTop=0;

function root(){return document.getElementById("aoPray435930")}
function context(){
  const r=root(),mount=r?.querySelector?.(".aoP435930Mount")??null;
  return {root:r,mount,main:mount?.querySelector?.(".aoP435930Body")??null,view:mount?.dataset?.aoPrayView??""};
}
function phone(){try{return matchMedia("(max-width:760px)").matches}catch{return innerWidth<=760}}
export function focusLine(mount){
  if(!mount)return 0;
  const mr=mount.getBoundingClientRect(),head=mount.querySelector(":scope > .aoP435930Head");
  const top=Math.max(mr.top,head?.getBoundingClientRect().bottom||mr.top);
  const ratio=phone()?.40:.42;
  return top+Math.max(90,(mr.bottom-top)*ratio);
}
function midpointCurrent(nodes,y){
  if(!nodes.length)return null;
  for(let i=0;i<nodes.length-1;i++){
    const a=nodes[i].getBoundingClientRect(),b=nodes[i+1].getBoundingClientRect();
    if(y<(a.bottom+b.top)/2)return nodes[i];
  }
  return nodes[nodes.length-1];
}
function nearest(nodes,y){
  let best=null,d=Infinity;
  for(const n of nodes){
    const r=n.getBoundingClientRect();
    if(r.top<=y&&r.bottom>=y)return n;
    const nd=y<r.top?r.top-y:y-r.bottom;
    if(nd<d){d=nd;best=n}
  }
  return best;
}
function categorical(nodes,current,prefix){
  const idx=nodes.indexOf(current);
  nodes.forEach((node,i)=>{
    if(prefix==="ao347")node.classList.add("ao347-focusable");
    const distance=Math.abs(i-idx);
    node.classList.toggle(prefix+"-current",i===idx);
    node.classList.toggle(prefix+"-near",distance===1);
    node.classList.toggle(prefix+"-far",distance>1);
  });
}
function energy(nodes,current,mount,{cssVar,far,lastScroll,setLastScroll}){
  const idx=nodes.indexOf(current);if(idx<0)return;
  const y=focusLine(mount),s=mount.scrollTop;
  const direction=s===lastScroll?0:(s>lastScroll?1:-1);
  setLastScroll(s);
  const values=nodes.map((_,i)=>i===idx?1:(Math.abs(i-idx)===1?.76:far));
  const preZone=phone()?118:138;
  if(direction>=0&&idx<nodes.length-1){
    const a=current.getBoundingClientRect(),b=nodes[idx+1].getBoundingClientRect();
    const boundary=(a.bottom+b.top)/2,distance=boundary-y;
    const p=Math.max(0,Math.min(1,1-distance/preZone));
    if(p>0){values[idx]=1-.04*p;values[idx+1]=.76+.17*p}
  }else if(direction<0&&idx>0){
    const a=nodes[idx-1].getBoundingClientRect(),b=current.getBoundingClientRect();
    const boundary=(a.bottom+b.top)/2,distance=y-boundary;
    const p=Math.max(0,Math.min(1,1-distance/preZone));
    if(p>0){values[idx]=1-.04*p;values[idx-1]=.76+.17*p}
  }
  nodes.forEach((node,i)=>node.style.setProperty(cssVar,values[i].toFixed(3)));
}
function angelus(main,mount){
  const cards=[...main.querySelectorAll(".aoP435930AngelusSequence .aoP435930PrayerUnit")];
  if(!cards.length)return;
  const current=midpointCurrent(cards,focusLine(mount))||cards[0];
  categorical(cards,current,"ao346");
  energy(cards,current,mount,{
    cssVar:"--ao346-focus-opacity",far:.50,lastScroll:lastAngelusScrollTop,
    setLastScroll:value=>{lastAngelusScrollTop=value}
  });
  main.dataset.aoFocusCurrent=current.dataset.aoAngelusIndex??"";
}
function stationPhases(main){
  const phases=[];
  const now=main.querySelector(".aoP435930GuideNow");if(now){now.dataset.ao347Phase="arrive";phases.push(now)}
  const prayers=[...main.querySelectorAll(".aoP435930StationPrayer")];
  if(prayers[0]){prayers[0].dataset.ao347Phase="adoramus";phases.push(prayers[0])}
  const consider=main.querySelector(".aoP435930StationConsider");if(consider){consider.dataset.ao347Phase="consider";phases.push(consider)}
  const ordinary=main.querySelector(".aoP435930StationOrdinary");if(ordinary){ordinary.dataset.ao347Phase="ordinary";phases.push(ordinary)}
  for(const prayer of prayers.slice(1)){prayer.dataset.ao347Phase="devotion";phases.push(prayer)}
  const move=[...main.querySelectorAll(".aoP435930GuideCue")].at(-1);
  if(move){move.dataset.ao347Phase="move";phases.push(move)}
  return phases;
}
function stations(main,mount){
  const phases=stationPhases(main);if(!phases.length)return;
  const current=nearest(phases,focusLine(mount))||phases[0];
  categorical(phases,current,"ao347");
  energy(phases,current,mount,{
    cssVar:"--ao347-focus-opacity",far:.54,lastScroll:lastStationsScrollTop,
    setLastScroll:value=>{lastStationsScrollTop=value}
  });
  main.dataset.aoFocusCurrent=current.dataset.ao347Phase??"";
}
function sync(){
  raf=0;
  const {mount,main,view}=context();
  if(!mount||!main||!["angelus","stations"].includes(view))return;
  mount.dataset.aoFocusContract="v3.4.10";
  if(view==="angelus")angelus(main,mount);
  else stations(main,mount);
}
function queue(){if(!raf)raf=requestAnimationFrame(sync)}
function bind(){
  const {mount}=context();
  if(boundMount!==mount){
    boundMount?.removeEventListener?.("scroll",queue);
    boundMount=mount;
    boundMount?.addEventListener?.("scroll",queue,{passive:true});
  }
  queue();
}
function scheduleBind(){if(!bindRaf)bindRaf=requestAnimationFrame(()=>{bindRaf=0;bind()})}

export function installPrayFocusRuntime(){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_PRAY_FOCUS_V3410)return window.AO_PRAY_FOCUS_V3410;
  new MutationObserver(()=>scheduleBind()).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["data-ao-pray-view","lang"]});
  window.addEventListener("resize",queue,{passive:true});
  document.addEventListener("DOMContentLoaded",scheduleBind,{once:true});
  const api=Object.freeze({version:VERSION,bind:scheduleBind,sync:queue,focusLine});
  window.AO_PRAY_FOCUS_V3410=api;
  try{document.documentElement.dataset.aoPrayFocus="v3.4.10"}catch{}
  scheduleBind();
  return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installPrayFocusRuntime();
