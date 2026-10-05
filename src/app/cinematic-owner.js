(()=>{'use strict';
const VERSION='43.12-ZERO-OBSERVER-CINEMATIC-CERTIFICATION';
const q=(s,r=document)=>r.querySelector(s);
const bootEl=()=>q('#ao-cinema-boot');
const transitionEl=()=>q('#ao-cinema-transition');
const loaderEl=()=>q('#ao-cinema-loader');
const runtime=()=>globalThis.AO_RUNTIME_V8||null;
const state=()=>runtime()?.store?.getState?.()||null;
const fr=()=>state()?.language==='fr';
const L=(en,frText)=>fr()?frText:en;
const systemReduced=()=>!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const reduced=()=>systemReduced()||!!state()?.settings?.reducedMotion;
const routeMeta={
 'enter-live':()=>({kicker:'AD ORIENTEM',title:L('Entering Mass','Entrée dans la Messe')}),
 'leave-live':()=>({kicker:'AD ORIENTEM',title:L('Returning home','Retour à l’accueil')}),
 'enter-prepare':()=>({kicker:L('BEFORE MASS','AVANT LA MESSE'),title:L('Preparation for Mass','Préparation à la Messe')}),
 'leave-prepare':()=>({kicker:'AD ORIENTEM',title:L('Returning home','Retour à l’accueil')}),
 'enter-thanksgiving':()=>({kicker:L('AFTER MASS','APRÈS LA MESSE'),title:L('Thanksgiving','Action de grâce')}),
 'finish-live':()=>({kicker:L('AFTER MASS','APRÈS LA MESSE'),title:L('Thanksgiving','Action de grâce')}),
 'leave-thanksgiving':()=>({kicker:'AD ORIENTEM',title:L('Returning home','Retour à l’accueil')}),
 'scripture-open':()=>({kicker:L('SACRED SCRIPTURE','SAINTE ÉCRITURE'),title:L('Opening the reading','Ouverture de la lecture')}),
 'scripture-close':()=>({kicker:'AD ORIENTEM',title:L('Returning','Retour')})
};
let transitionTimer=0,loaderTimer=0,loaderHideTimer=0,bootFinished=false,storeInstalled=false,lastLoadingKey='';
function sceneIn(){const app=q('#app');if(!app||reduced())return;app.classList.remove('aoCinemaSceneEnter');void app.offsetWidth;app.classList.add('aoCinemaSceneEnter');setTimeout(()=>app.classList.remove('aoCinemaSceneEnter'),620)}
function showTransition(meta){
 const el=transitionEl();if(!el||reduced()||bootEl()?.classList.contains('aoCinemaBootDone')===false)return;
 clearTimeout(transitionTimer);q('[data-ao-cinema-transition-kicker]',el).textContent=meta.kicker||'AD ORIENTEM';q('[data-ao-cinema-transition-title]',el).textContent=meta.title||'';el.classList.remove('aoCinemaTransitionOut');el.classList.add('aoCinemaTransitionOn');el.setAttribute('aria-hidden','false');
 requestAnimationFrame(()=>requestAnimationFrame(sceneIn));
 transitionTimer=setTimeout(()=>{el.classList.remove('aoCinemaTransitionOn');el.classList.add('aoCinemaTransitionOut');transitionTimer=setTimeout(()=>{el.classList.remove('aoCinemaTransitionOut');el.setAttribute('aria-hidden','true')},520)},Math.max(260,meta.hold||360));
}
function contentLoadingSpec(s){if(!s)return null;if(s.resolving)return {key:'calendar',title:L('Resolving the 1962 calendar','Résolution du calendrier de 1962'),sub:L('Selecting the proper Mass and liturgical colour','Sélection de la Messe et de la couleur liturgique')};if(s.scripture?.loading)return {key:'scripture',title:L('Opening Sacred Scripture','Ouverture de la Sainte Écriture'),sub:L('Loading the appointed reading and commentary','Chargement de la lecture et du commentaire')};return null}
function hideLoader(){clearTimeout(loaderTimer);lastLoadingKey='';const el=loaderEl();if(!el)return;clearTimeout(loaderHideTimer);el.classList.remove('aoCinemaLoaderOn');el.setAttribute('aria-hidden','true')}
function scheduleLoader(spec){
 if(!spec){hideLoader();return}if(bootEl()&&!bootEl().classList.contains('aoCinemaBootDone'))return;if(lastLoadingKey===spec.key&&loaderEl()?.classList.contains('aoCinemaLoaderOn'))return;lastLoadingKey=spec.key;clearTimeout(loaderTimer);loaderTimer=setTimeout(()=>{const current=contentLoadingSpec(state());if(!current||current.key!==spec.key)return;const el=loaderEl();if(!el)return;q('[data-ao-cinema-loader-title]',el).textContent=current.title;q('[data-ao-cinema-loader-sub]',el).textContent=current.sub;el.classList.add('aoCinemaLoaderOn');el.setAttribute('aria-hidden','false')},220)}
function syncLoading(s=state()){const spec=contentLoadingSpec(s);if(spec)scheduleLoader(spec);else hideLoader()}
function installStore(){
 const store=runtime()?.store;if(!store?.dispatch||!store?.subscribe||storeInstalled)return !!storeInstalled;storeInstalled=true;
 const original=store.dispatch.bind(store);store.dispatch=(action)=>{const type=action?.type,make=routeMeta[type];if(make)showTransition(make());const result=original(action);syncLoading(store.getState());queuePresentationScan();return result};
 store.subscribe(s=>{document.documentElement.dataset.aoCinemaRoute=s?.route||'';document.documentElement.dataset.reducedMotion=String(!!s?.settings?.reducedMotion);syncLoading(s);queuePresentationScan()});syncLoading(store.getState());queuePresentationScan();return true
}
function finishBoot(reason='ready'){
 if(bootFinished)return;bootFinished=true;const el=bootEl();if(!el)return;const s=state(),status=q('[data-ao-cinema-boot-status]',el),title=s?.resolution?.proper?.data?.name||s?.resolution?.day?.main?.title||'';if(status){status.textContent=title?L(`${title} · Ready`,`${title} · Prêt`):L('Ready','Prêt');status.classList.add('ready')}
 const delay=reduced()?0:260;setTimeout(()=>{el.classList.add('aoCinemaBootDone');el.dataset.reason=reason;setTimeout(()=>{el.remove();syncLoading(state())},reduced()?0:720)},delay)
}
function bootWatch(){
 const started=performance.now();let stable=0;const tick=()=>{installStore();const s=state(),home=q('.homeScreen'),ready=!!(s&&home&&!s.resolving&&s.resolution);if(ready)stable++;else stable=0;if(stable>=2){finishBoot('home-ready');return}if(performance.now()-started>5200){finishBoot('guard-timeout');return}requestAnimationFrame(tick)};requestAnimationFrame(tick)
}
const ART_SELECTORS=['.aoProperArt img','.aoRuleModuleHero img','.aoV401RosaryHero img','.aoSaintArtCard img','.aoSaintReaderMedia img','[data-ao-proper-art] img','.aoV4311StationsArt img'];
function artCandidate(img){return img instanceof HTMLImageElement&&ART_SELECTORS.some(sel=>img.matches(sel))}
function prepArt(img){if(!artCandidate(img)||img.dataset.aoCinemaImage==='1')return;img.dataset.aoCinemaImage='1';const host=img.parentElement;if(host)host.classList.add('aoCinemaArt');const ready=()=>{img.classList.remove('aoCinemaImagePending','aoCinemaImageError');img.classList.add('aoCinemaImageReady');host?.classList.remove('aoCinemaArt')};const fail=()=>{img.classList.remove('aoCinemaImagePending');img.classList.add('aoCinemaImageError');host?.classList.remove('aoCinemaArt')};if(img.complete&&img.naturalWidth>0){if(reduced()){ready();return}img.classList.add('aoCinemaImagePending');requestAnimationFrame(()=>requestAnimationFrame(ready));return}img.classList.add('aoCinemaImagePending');img.addEventListener('load',ready,{once:true});img.addEventListener('error',fail,{once:true})}
function scanArt(root=document){if(root instanceof HTMLImageElement)prepArt(root);root.querySelectorAll?.(ART_SELECTORS.join(',')).forEach(prepArt)}
function surfaceCandidate(el){if(!(el instanceof HTMLElement)||el.dataset.aoCinemaSurface==='1')return false;return el.matches('.homeSheetBackdrop,.rc2SheetBackdrop,.flowGuideOverlay,#aoPrayerBookRoot,.aoSaintReaderBackdrop,.aoAuditBackdrop')||!!el.querySelector?.('.homeSheet,.rc2Sheet')}
function prepSurface(el){if(!surfaceCandidate(el))return;el.dataset.aoCinemaSurface='1';if(!reduced()){el.classList.add('aoCinemaSurfaceIn');setTimeout(()=>el.classList.remove('aoCinemaSurfaceIn'),520)}}
const SURFACE_SELECTOR='.homeSheetBackdrop,.rc2SheetBackdrop,.flowGuideOverlay,#aoPrayerBookRoot,.aoSaintReaderBackdrop,.aoAuditBackdrop';
let presentationScanQueued=false,presentationScanTimer=0;
function scanPresentation(root=document){scanArt(root);if(root instanceof HTMLElement)prepSurface(root);root.querySelectorAll?.(SURFACE_SELECTOR).forEach(prepSurface)}
function queuePresentationScan(){
 if(!presentationScanQueued){presentationScanQueued=true;requestAnimationFrame(()=>{presentationScanQueued=false;scanPresentation()})}
 clearTimeout(presentationScanTimer);presentationScanTimer=setTimeout(scanPresentation,180)
}
function installPresentationHooks(){
 scanPresentation();
 document.addEventListener('click',()=>queuePresentationScan(),true);
 document.addEventListener('change',()=>queuePresentationScan(),true);
 document.addEventListener('submit',()=>queuePresentationScan(),true)
}
function init(){
 document.documentElement.dataset.aoCinematic=VERSION;installPresentationHooks();bootWatch();const wait=setInterval(()=>{if(installStore())clearInterval(wait)},40);setTimeout(()=>clearInterval(wait),6000);
 const api=Object.freeze({version:VERSION,showTransition,finishBoot,scanArt,scanPresentation,queuePresentationScan,isReducedMotion:reduced,observerFree:true});globalThis.AO_CINEMATIC_V4312=api;globalThis.AO_CINEMATIC_V4311=api
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

