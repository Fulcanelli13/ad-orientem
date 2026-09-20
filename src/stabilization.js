(()=>{'use strict';
const KEY='ao2:reading-position:v1',MAX_AGE=12*60*60*1000;
const rt=()=>globalThis.AO_RUNTIME_V8;
const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}};
let restoring=true;
const visible=el=>el&&!el.hidden&&el.getAttribute('aria-hidden')!=='true'&&getComputedStyle(el).display!=='none';
function snapshot(){
 if(restoring)return;
 const state=rt()?.store?.getState();if(!state)return;
 const pb=document.getElementById('aoPrayerBookRoot');
 const record={savedAt:Date.now(),route:state.route,date:state.selectedDate};
 if(visible(pb)&&pb.classList.contains('open')){
  const s=globalThis.AOTraditionalPrayerBook?.getState?.()||{};
  record.prayer=Object.fromEntries(['view','prayer','rosarySet','rosaryStep','rosaryForm','station','benedictionStep','confStep'].map(k=>[k,s[k]]));
  record.scrollTop=pb.scrollTop;
  record.faces=[...pb.querySelectorAll('[data-pb-flip]')].filter(x=>x.dataset.face==='vernacular').map(x=>x.dataset.pbFlip);
 }else{
  if(visible(document.getElementById('ao-learn-root')))record.module={surface:'learn',state:globalThis.AO_UNDERSTAND_MASS?.getState?.()};
  else if(visible(document.getElementById('ao-cate-root')))record.module={surface:'catechism',state:globalThis.AO_TRADITIONAL_CATECHISM?.getState?.()};
  else if(visible(document.getElementById('ao-v354-root')))record.module=globalThis.AO_NAV_V362?.captureEucharisticContext?.();
  else if(visible(document.getElementById('ao-v37-root')))record.domain=globalThis.AO_GLOBAL_RIBBON_V4323?.getActive?.();
 }
 try{sessionStorage.setItem(KEY,JSON.stringify(record))}catch{}
}
function sync(){document.documentElement.dataset.aoFollowingMass=String(rt()?.store?.getState()?.route==='live');snapshot()}
async function install(){
 const runtime=rt();if(!runtime?.store){setTimeout(install,80);return}
 const saved=read();
 runtime.store.subscribe(sync);
 // Capture browser back before legacy routers can leave Mass without confirmation.
 window.addEventListener('popstate',event=>{
  const s=runtime.store.getState();if(s.route!=='live')return;
  event.stopImmediatePropagation();
  if(s.live.sheet)runtime.store.dispatch({type:'live-sheet',sheet:null});
  // Browser gestures keep the current step. The visible Home button handles deliberate exit.
  try{history.pushState({aoV25Guard:true},'',location.href)}catch{}
 },true);
 window.addEventListener('pagehide',snapshot);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')snapshot()});
 document.addEventListener('click',()=>{queueMicrotask(snapshot);setTimeout(snapshot,180)},true);
 document.addEventListener('change',()=>queueMicrotask(snapshot),true);
 try{
  if(saved&&Number.isFinite(saved.savedAt)&&Date.now()-saved.savedAt<MAX_AGE){
   if(saved.route==='live')await runtime.controller.home.resumeSavedMass();
   else if(saved.route==='prepare')runtime.store.dispatch({type:'enter-prepare'});
   else if(saved.route==='thanksgiving')runtime.store.dispatch({type:'enter-thanksgiving'});
   if(saved.prayer){
    globalThis.AOTraditionalPrayerBook?.restorePosition?.(saved.prayer);
    const pb=document.getElementById('aoPrayerBookRoot');
    for(const b of pb?.querySelectorAll('[data-pb-flip]')||[]){if(saved.faces?.includes(b.dataset.pbFlip)&&b.dataset.face!=='vernacular')b.click()}
    if(pb)requestAnimationFrame(()=>{pb.scrollTop=Math.max(0,Number(saved.scrollTop)||0)});
   }else if(['learn','catechism','eucharistic'].includes(saved.module?.surface))globalThis.AO_NAV_V362?.restore?.(saved.module);
   else if(['pray','mass','learn','today'].includes(saved.domain))globalThis.AO_V37_SHELL?.openDomain?.(saved.domain);
  }
 }catch(error){console.warn('Reading position could not be restored',error)}
 restoring=false;sync();
}
globalThis.AO_STABILIZATION_V4334=Object.freeze({version:'43.34',snapshot});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
