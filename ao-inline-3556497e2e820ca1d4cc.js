

(()=>{'use strict';
const VERSION='36.2-navigation-control-integrity';
let returnStack=[],lastCoreRoute=null,restoring=false,storeUnsub=null;
const rt=()=>window.AO_RUNTIME_V8||null;
const core=()=>rt()?.store?.getState?.()||null;
const fr=()=>core()?.language==='fr';
const L=(en,frs)=>fr()?frs:en;
function peekReturn(){return returnStack.length?returnStack[returnStack.length-1]:null}
function takeReturn(){return returnStack.length?returnStack.pop():null}
function setExternalReturn(ctx){if(!ctx)return null;const top=peekReturn();const same=top&&JSON.stringify(top)===JSON.stringify(ctx);if(!same)returnStack.push(ctx);return peekReturn()}
function clearExternalReturn(){returnStack=[]}
function markCoreRoute(route){lastCoreRoute=route||null;return lastCoreRoute}
function restoreTop(){const r=takeReturn();if(!r)return false;return restore(r)}
function captureEucharisticContext(){
 const r=document.getElementById('ao-v354-root');if(!r)return{surface:'eucharistic',route:'programmes'};
 const ses=r.querySelector('[data-ao354-ador-next]');if(ses)return{surface:'eucharistic',route:'adoration-session',duration:Number(ses.dataset.duration)||15,index:Number(ses.dataset.step)||0};
 if(r.querySelector('.ao354Timer'))return{surface:'eucharistic',route:'meditation'};
 if(r.querySelector('[data-ao354-complete="firstFriday"]'))return{surface:'eucharistic',route:'first-friday'};
 if(r.querySelector('[data-ao354-complete="firstSaturday"]'))return{surface:'eucharistic',route:'first-saturday'};
 if(r.querySelector('[data-ao354-ador]'))return{surface:'eucharistic',route:'adoration'};
 return{surface:'eucharistic',route:'programmes'}
}
function home(){
 restoring=true;clearExternalReturn();
 // v43.20: Home is a hard reset of transient presentation state.
 try{window.AO_INLINE_CUES_V251?.closeGuide?.()}catch{}
 try{window.AO_RULE_V411?.closeSheet?.()}catch{}
 try{window.AO_CONTENT_V37?.closeDiagnostics?.()}catch{}
 try{document.getElementById('ao-use-guide-v9')?.remove()}catch{}
 try{document.querySelectorAll('.aoArtInfoBackdrop,.aoArtQaBackdrop').forEach(n=>n.remove())}catch{}
 try{window.AOTraditionalPrayerBook?.close?.({silent:true})}catch{}
 try{window.AO_UNDERSTAND_MASS?.close?.()}catch{}
 try{window.AO_TRADITIONAL_CATECHISM?.close?.()}catch{}
 try{window.AO_DAILY_CATECHISM?.close?.()}catch{}
 try{window.AO_TRAD_V26?.close?.()}catch{}
 try{window.AO_EUCHARISTIC_V354?.close?.()}catch{}
 try{window.AO_V37_SHELL?.close?.()}catch{}
 try{window.AO_NAV_V25?.closePanel?.()}catch{}
 const s=core(),store=rt()?.store;if(s?.homeSheet)store?.dispatch({type:'home-sheet',sheet:null});
 if(s?.route==='scripture')store?.dispatch({type:'scripture-close'});
 const n=core();if(n?.route==='live')store?.dispatch({type:'leave-live'});else if(n?.route==='prepare')store?.dispatch({type:'leave-prepare'});else if(n?.route==='thanksgiving')store?.dispatch({type:'leave-thanksgiving'});
 restoring=false;return true
}
function restore(ctx){if(!ctx||restoring)return false;restoring=true;try{
 if(ctx.surface==='eucharistic'){
   if(ctx.route==='adoration-session')window.AO_EUCHARISTIC_V354?.resumeAdoration?.(ctx.duration,ctx.index);
   else window.AO_EUCHARISTIC_V354?.open?.(ctx.route||'programmes');return true
 }
 if(ctx.surface==='prayerbook'){window.AOTraditionalPrayerBook?.open?.();return true}
 if(ctx.surface==='traditional-exercises'){window.AO_TRAD_V26?.open?.();return true}
 if(ctx.surface==='learn'){if(ctx.state&&window.AO_UNDERSTAND_MASS?.restoreState)return window.AO_UNDERSTAND_MASS.restoreState(ctx.state);window.AO_UNDERSTAND_MASS?.open?.();if(ctx.lesson)window.AO_UNDERSTAND_MASS?.openLesson?.(ctx.lesson);return true}
 if(ctx.surface==='catechism'){if(ctx.state&&window.AO_TRADITIONAL_CATECHISM?.restoreState)return window.AO_TRADITIONAL_CATECHISM.restoreState(ctx.state);window.AO_TRADITIONAL_CATECHISM?.open?.(ctx.options||{});return true}
 if(ctx.surface==='domain'){window.AO_V37_SHELL?.openDomain?.(ctx.domain||'today');return true}
 if(ctx.surface==='home'){home();return true}
 }finally{restoring=false}return false}
function openCore(action,returnContext){bindStore();const store=rt()?.store;if(!store)return false;setExternalReturn(returnContext||{surface:'home'});if(action==='prepare'){store.dispatch({type:'enter-prepare'});lastCoreRoute='prepare';return true}if(action==='thanks'||action==='thanksgiving'){store.dispatch({type:'enter-thanksgiving'});lastCoreRoute='thanksgiving';return true}if(action==='live'){store.dispatch({type:'enter-live'});lastCoreRoute='live';return true}return false}
function laterOpen(){
 // v43.20: Back must act on the visually topmost transient surface first.
 const cue=document.getElementById('aoCueGuideSheet');if(cue&&!cue.hidden&&getComputedStyle(cue).display!=='none')return'cue-guide';
 if(document.getElementById('ao-use-guide-v9'))return'use-guide';
 const rule=document.getElementById('aoRuleSheet');if(rule&&!rule.hidden&&getComputedStyle(rule).display!=='none')return'rule';
 const diag=document.getElementById('ao-content-v37-panel');if(diag&&getComputedStyle(diag).display!=='none')return'content-diagnostics';
 if(document.querySelector('.aoArtInfoBackdrop'))return'art-info';
 if(document.querySelector('.aoArtQaBackdrop'))return'art-qa';
 const cs=core();if(cs?.route==='live'&&cs?.live?.sheet)return'live-sheet';
 const dc=document.getElementById('ao-daily-cate-root');if(dc&&!dc.hidden&&dc.getAttribute('aria-hidden')!=='true'&&getComputedStyle(dc).display!=='none')return'daily-catechism';
 const e=document.getElementById('ao-v354-root');if(e&&!e.hidden&&e.getAttribute('aria-hidden')!=='true'&&getComputedStyle(e).display!=='none')return'eucharistic';
 const t=document.getElementById('ao-v26-exercises');if(t&&!t.hidden&&t.getAttribute('aria-hidden')!=='true')return'traditional';
 // Catechism is checked first as a defensive fallback if a legacy conflict ever
 // leaves both teaching roots mounted. The ownership fix prevents that normally.
 const c=document.getElementById('ao-cate-root');if(c&&!c.hidden)return'catechism';
 const l=document.getElementById('ao-learn-root');if(l&&!l.hidden)return'learn';
 const d=document.getElementById('ao-v37-root');if(d&&!d.hidden&&document.body.classList.contains('aoV37ShellOpen'))return'domain';
 return null
}
function back(){
 const x=laterOpen(),ret=peekReturn();
 if(x==='cue-guide'){window.AO_INLINE_CUES_V251?.closeGuide?.();return true}
 if(x==='use-guide'){document.getElementById('ao-use-guide-v9')?.remove();return true}
 if(x==='rule'){window.AO_RULE_V411?.closeSheet?.();return true}
 if(x==='content-diagnostics'){window.AO_CONTENT_V37?.closeDiagnostics?.();return true}
 if(x==='art-info'){document.querySelectorAll('.aoArtInfoBackdrop').forEach(n=>n.remove());return true}
 if(x==='art-qa'){document.querySelectorAll('.aoArtQaBackdrop').forEach(n=>n.remove());return true}
 if(x==='live-sheet'){rt()?.store?.dispatch({type:'live-sheet',sheet:null});return true}
 if(x==='domain'){window.AO_V37_SHELL?.close?.();if(ret)queueMicrotask(restoreTop);return true}
 if(x==='daily-catechism'){window.AO_DAILY_CATECHISM?.close?.();if(ret)queueMicrotask(restoreTop);return true}
 if(x==='eucharistic'){
   const r=document.getElementById('ao-v354-root'),dest=r?.dataset?.back||'';
   if(ret&&(!dest||dest==='programmes')){window.AO_EUCHARISTIC_V354?.close?.();queueMicrotask(restoreTop);return true}
   const b=r?.querySelector('[data-ao354-back]');if(b){b.click();return true}window.AO_EUCHARISTIC_V354?.close?.();if(ret)queueMicrotask(restoreTop);return true
 }
 if(x==='traditional'){if(ret){window.AO_TRAD_V26?.close?.();queueMicrotask(restoreTop);return true}return !!window.AO_TRAD_V26?.back?.()}
 if(x==='learn'){const st=window.AO_UNDERSTAND_MASS?.getState?.();if(ret&&!st?.detail){window.AO_UNDERSTAND_MASS?.close?.();queueMicrotask(restoreTop);return true}return !!window.AO_UNDERSTAND_MASS?.back?.()}
 if(x==='catechism'){const st=window.AO_TRADITIONAL_CATECHISM?.getState?.();if(ret&&!st?.detail){window.AO_TRADITIONAL_CATECHISM?.close?.();queueMicrotask(restoreTop);return true}return !!window.AO_TRADITIONAL_CATECHISM?.back?.()}
 if(ret){
   const v25=window.AO_NAV_V25?.getState?.();
   if(v25?.panel){window.AO_NAV_V25?.closePanel?.();queueMicrotask(restoreTop);return true}
   const mass=document.getElementById('ao-mass-flow-v1');if(mass&&!mass.hidden&&mass.getAttribute('aria-hidden')!=='true'&&getComputedStyle(mass).display!=='none'){const b=mass.querySelector('[data-ao-back]')||mass.querySelector('[data-ao-close]');b?.click();queueMicrotask(restoreTop);return true}
   const s=core(),store=rt()?.store;
   if(s?.homeSheet){store?.dispatch({type:'home-sheet',sheet:null});queueMicrotask(restoreTop);return true}
   if(s?.route==='scripture'){lastCoreRoute=null;store?.dispatch({type:'scripture-close'});queueMicrotask(restoreTop);return true}
   if(s?.route==='live'){const fr=s.language==='fr';const ok=window.confirm(fr?'La Messe est en cours. Quitter le suivi ? Votre place sera enregistrée.':'Mass is in progress. Leave the follower? Your place will be saved.');if(ok){lastCoreRoute=null;store?.dispatch({type:'leave-live'});queueMicrotask(restoreTop)}return true}
   if(s?.route==='prepare'){lastCoreRoute=null;store?.dispatch({type:'leave-prepare'});queueMicrotask(restoreTop);return true}
   if(s?.route==='thanksgiving'){lastCoreRoute=null;store?.dispatch({type:'leave-thanksgiving'});queueMicrotask(restoreTop);return true}
 }
 return false
}
document.addEventListener('click',e=>{const b=e.target.closest('button,[role="button"]');if(!b)return;
 if(peekReturn()&&b.matches('[data-ao354-close]')){e.preventDefault();e.stopImmediatePropagation();window.AO_EUCHARISTIC_V354?.close?.();queueMicrotask(restoreTop);return}
 if(peekReturn()&&b.matches('[data-ao354-open="programmes"]')){e.preventDefault();e.stopImmediatePropagation();window.AO_EUCHARISTIC_V354?.close?.();queueMicrotask(restoreTop);return}
 if(peekReturn()&&b.matches('[data-dc-close]')){e.preventDefault();e.stopImmediatePropagation();window.AO_DAILY_CATECHISM?.close?.();queueMicrotask(restoreTop);return}
 if(b.matches('[data-app-home]')){e.preventDefault();e.stopImmediatePropagation();home();return}
 if(peekReturn()&&b.matches('[data-v352-home],[data-v352-close]')){e.preventDefault();e.stopImmediatePropagation();window.AO_TRAD_V26?.close?.();queueMicrotask(restoreTop);return}
 if(b.matches('[data-open-mass-learn]')&&b.closest('#ao-cate-root')){e.preventDefault();e.stopImmediatePropagation();const st=window.AO_TRADITIONAL_CATECHISM?.getState?.();setExternalReturn({surface:'catechism',state:st});window.AO_TRADITIONAL_CATECHISM?.close?.();window.AO_UNDERSTAND_MASS?.open?.();return}
 if(b.matches('[data-open-catechism]')&&b.closest('#ao-learn-root')){e.preventDefault();e.stopImmediatePropagation();const st=window.AO_UNDERSTAND_MASS?.getState?.();setExternalReturn({surface:'learn',state:st});window.AO_UNDERSTAND_MASS?.close?.();window.AO_TRADITIONAL_CATECHISM?.open?.();return}
 if(peekReturn()&&b.matches('#ao-learn-root [data-learn-close]')){e.preventDefault();e.stopImmediatePropagation();window.AO_UNDERSTAND_MASS?.close?.();queueMicrotask(restoreTop);return}
 if(peekReturn()&&b.matches('#ao-cate-root [data-cate-close]')){e.preventDefault();e.stopImmediatePropagation();window.AO_TRADITIONAL_CATECHISM?.close?.();queueMicrotask(restoreTop);return}
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&laterOpen()){if(back()){e.preventDefault();e.stopImmediatePropagation()}}},true);
function bindStore(){if(storeUnsub)return true;const store=rt()?.store;if(!store?.subscribe)return false;storeUnsub=store.subscribe(()=>{const r=core()?.route||null;if(lastCoreRoute&&r!==lastCoreRoute){if(r==='home'&&peekReturn()){lastCoreRoute=null;queueMicrotask(restoreTop)}else if(!['prepare','thanksgiving','live','scripture'].includes(r))lastCoreRoute=null}});return true}
bindStore();setTimeout(bindStore,50);setTimeout(bindStore,500);
window.AO_NAV_V362={version:'40.8-navigation-coordinator',back,home,restore,openCore,setExternalReturn,clearExternalReturn,markCoreRoute,captureEucharisticContext,peekReturn,returnToCaller:restoreTop,qa(){return{version:'40.8-navigation-coordinator',laterSurface:laterOpen(),uiInjection:false,returnDepth:returnStack.length,returnStack:[...returnStack],prayerDirectApi:!!window.AOTraditionalPrayerBook?.openModule,learnBack:!!window.AO_UNDERSTAND_MASS?.back,cateBack:!!window.AO_TRADITIONAL_CATECHISM?.back,eucharisticManage:!!window.AO_EUCHARISTIC_V354?.resetSeries,deadActButtons:[...document.querySelectorAll('[data-v352-act]')].filter(x=>!x.hasAttribute('aria-pressed')).length}}};
window.AO_V362_META={version:'v36.2',baseline:'Ad-Orientem-2.0-v36.1-GLOBAL-UI-HARMONIZATION.html',scope:['navigation stack bridge','return-context coordination','Back/Home semantics','direct cross-module routing'],massEngineChanged:false,calendarChanged:false,prayerTextChanged:false};
})();

