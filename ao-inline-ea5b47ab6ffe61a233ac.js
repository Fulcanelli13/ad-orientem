
(function(){
'use strict';
const VERSION='23-live-sequence-certification';
const KEY='ao-active-resolved-mass-v23';
const OLD_KEYS=['ao-active-resolved-mass-v22','ao-active-resolved-mass-v21'];
function rt(){return window.AO_RUNTIME_V8||null}
function api(){return window.AO_CELEBRATION_API||null}
function arch(){return window.AO_CELEBRATION_ARCH_V1||null}
function state(){return rt()?.store?.getState?.()||null}
function fr(){return state()?.language==='fr'}
function L(en,frText){return fr()?frText:en}
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function clearActive(){
  window.AO_ACTIVE_MASS_SESSION=null;
  try{localStorage.removeItem(KEY);OLD_KEYS.forEach(k=>localStorage.removeItem(k))}catch{}
}
function saveActive(session){
  window.AO_ACTIVE_MASS_SESSION=session;
  try{localStorage.setItem(KEY,JSON.stringify(session));OLD_KEYS.forEach(k=>localStorage.removeItem(k))}catch{}
}
function restoreActive(){
  try{
    let raw=localStorage.getItem(KEY);
    if(!raw){for(const k of OLD_KEYS){raw=localStorage.getItem(k);if(raw)break}}
    if(!raw)return;
    const session=JSON.parse(raw),s=state();
    if(!session?.date||!session?.resolvedMass||!session?.proper)return clearActive();
    if(s?.selectedDate&&session.date!==s.selectedDate)return clearActive();
    window.AO_ACTIVE_MASS_SESSION=session;
  }catch{clearActive()}
}
function overrideProperFlags(proper,resolved){
  const out=clone(proper);
  if(typeof resolved.gloria==='boolean')out.hasGloria=out.showGloria=resolved.gloria;
  if(typeof resolved.credo==='boolean')out.hasCredo=out.showCredo=resolved.credo;
  if(resolved.celebrationType==='requiem'){
    out.isRequiem=true;
    out.riteProfile='requiem_1962';
  }
  return out;
}
function calendarProper(){const s=state();return s?.resolution?.proper?.status==='ready'?s.resolution.proper.data:null}
function firstCollect(proper){return (proper?.collects||[])[0]||proper?.collect||null}
function hasNuptialBlessings(proper){
  const ids=new Set((proper?.specialSections||[]).map(x=>x.id));
  return ['Benedictio Nuptialis 1','Benedictio Nuptialis 2','Benedictio Finalis'].every(id=>ids.has(id));
}
function assemblyPlanFor(decision,resolved,a){
  const code=String(decision?.code||'');
  if(/^votive-[12]-collect-retained$/.test(code))return {kind:'votive-collect-retained',retainedCollect:true,nuptialBlessings:false};
  if(code==='nuptial-mass-of-day')return {kind:'nuptial-mass-of-day',retainedCollect:true,nuptialBlessings:true};
  if(code==='requiem-all-souls-calendar')return {kind:'calendar-fallback',retainedCollect:false,nuptialBlessings:false};
  return null;
}
function assemblyStatus(){
  const a=arch(),A=api(),s=state();
  if(!a||!A||!s)return {ok:false,reason:L('Architecture is still starting.','L’architecture est encore en cours de démarrage.')};
  const decision=A.getRubricState?.().decision||A.resolveRubrics?.();
  const resolved=A.getResolvedMass?.();
  if(!decision||!resolved)return {ok:false,reason:L('Resolve the celebration first.','Résolvez d’abord la célébration.')};
  if(['impeded','prohibited'].includes(decision.status))return {ok:false,reason:decision.summary||L('This Mass cannot be started under the selected conditions.','Cette Messe ne peut pas être commencée dans les conditions sélectionnées.')};
  if(a.readiness?.loading)return {ok:false,reason:L('Resolving the formulary…','Résolution du formulaire…')};
  const cal=calendarProper();
  if(decision.status==='permitted'){
    if(resolved.celebrationId==='mass_of_day')return cal?{ok:true,resolved,proper:cal,calendar:true,assemblyPlan:null}:{ok:false,reason:L('The calendar Proper is not ready.','Le Propre du calendrier n’est pas prêt.')};
    if(!a.resolvedProper)return {ok:false,reason:L('Resolve the selected formulary before starting.','Résolvez le formulaire sélectionné avant de commencer.')};
    if(resolved.requestedCelebrationId==='nuptial'&&!hasNuptialBlessings(a.resolvedProper))return {ok:false,reason:L('The Nuptial formulary is missing one or more blessing sections.','Il manque une ou plusieurs sections de bénédiction dans le formulaire nuptial.')};
    return {ok:true,resolved,proper:a.resolvedProper,requestedProper:a.resolvedProper,calendar:false,assemblyPlan:null};
  }
  if(decision.status==='permittedWithChanges'){
    const plan=assemblyPlanFor(decision,resolved,a);
    if(!plan)return {ok:false,reason:L('This result still requires a local verification or an addition that is not sequence-certified.','Ce résultat exige encore une vérification locale ou un ajout qui n’est pas certifié dans la séquence.')};
    if(!cal)return {ok:false,reason:L('The calendar Proper is not ready.','Le Propre du calendrier n’est pas prêt.')};
    if(plan.kind==='calendar-fallback')return {ok:true,resolved,proper:cal,calendar:true,assemblyPlan:plan};
    const requested=a.resolvedProper;
    if(!requested)return {ok:false,reason:L('Resolve the requested formulary before assembling the Mass of the Day.','Résolvez le formulaire demandé avant d’assembler la Messe du jour.')};
    if(plan.retainedCollect&&!firstCollect(requested))return {ok:false,reason:L('The requested formulary does not contain the Collect required for this rubrical fallback.','Le formulaire demandé ne contient pas la Collecte requise pour ce cas rubrical.')};
    if(plan.nuptialBlessings&&!hasNuptialBlessings(requested))return {ok:false,reason:L('The Nuptial formulary is missing one or more blessing sections.','Il manque une ou plusieurs sections de bénédiction dans le formulaire nuptial.')};
    return {ok:true,resolved,proper:cal,requestedProper:requested,calendar:true,assemblyPlan:plan};
  }
  return {ok:false,reason:L('The rubrical result is not startable.','Le résultat rubrical ne permet pas de commencer la Messe.')};
}
async function startLive(){
  const a=arch(),A=api(),r=rt();
  if(!a||!A||!r?.store)return;
  if(a.actualCelebration?.id!=='mass_of_day'&&!a.resolvedProper&&!a.readiness?.loading){try{await A.resolveReadiness?.()}catch{}}
  const status=assemblyStatus();
  if(!status.ok){decorate();return}
  const resolved=clone(status.resolved);
  resolved.sourceDiagnostics={...(resolved.sourceDiagnostics||{}),sequenceCertification:'v23-matrix-16-of-16',sequenceContract:'ResolvedMass input only'};
  if(resolved.celebrationType==='requiem')resolved.exceptionalProfile='requiem-1962';
  const plan=status.assemblyPlan||null;
  const needsSession=!status.calendar||!!(plan&&(plan.retainedCollect||plan.nuptialBlessings));
  if(!needsSession){
    clearActive();
  }else{
    const proper=overrideProperFlags(status.proper,resolved);
    const session={
      version:VERSION,
      date:safeDate(),
      startedAt:new Date().toISOString(),
      requestedType:a.actualCelebration?.type||resolved.celebrationType,
      requestedTitle:(a.actualCelebration?.id&&window.AO_CELEBRATION_CATALOGUE?.[a.actualCelebration.id]?.title)||null,
      resolvedMass:resolved,
      proper,
      requestedProper:clone(status.requestedProper||a.resolvedProper),
      assemblyPlan:clone(plan),
      themePlan:{primary:resolved.colour||proper.color||'Green',massColor:resolved.colour||proper.color||'Green'}
    };
    saveActive(session);
  }
  r.store.dispatch({type:'live-form-session',form:a.celebrationForm||'sung'});
  r.store.dispatch({type:'live-follow-mode-session',mode:a.followMode||'vox'});
  a.stage=null;a.history=[];
  document.getElementById('ao-mass-flow-v1')?.remove();
  r.store.dispatch({type:'enter-live'});
}
function safeDate(){return state()?.selectedDate||new Date().toISOString().slice(0,10)}
function setTextIfChanged(el,value){if(!el)return false;const next=String(value??'');if(el.textContent===next)return false;el.textContent=next;return true}
function decorate(){
  const wrap=document.getElementById('ao-mass-flow-v1');if(!wrap)return;
  const buttons=[...wrap.querySelectorAll('.aoFlowActions .primary')];
  const target=buttons.find(b=>/Live sequence wiring|Raccordement à la séquence|Start Mass|Commencer la Messe/i.test(b.textContent||'')||b.dataset.aoStartLive!==undefined);
  if(!target)return;
  const st=assemblyStatus();
  setTextIfChanged(target,st.ok?L('Start Mass →','Commencer la Messe →'):st.reason);
  target.disabled=!st.ok;
  if(st.ok)target.dataset.aoStartLive='';else delete target.dataset.aoStartLive;
  let note=target.parentElement?.nextElementSibling;
  if(!note||!note.classList?.contains('aoBridgeNote')){note=document.createElement('div');note.className='aoBridgeNote';target.parentElement?.insertAdjacentElement('afterend',note)}
  note.classList.toggle('ok',!!st.ok);
  let noteText=st.reason;
  if(st.ok){
    const kind=st.assemblyPlan?.kind;
    noteText=kind==='nuptial-mass-of-day'
      ? L('Mass of the Day assembled with the Nuptial Collect and the Nuptial Blessing in their prescribed places.','Messe du jour assemblée avec la Collecte nuptiale et la Bénédiction nuptiale à leurs places prescrites.')
      : kind==='votive-collect-retained'
      ? L('Mass of the Day assembled with the retained Collect of the impeded votive Mass under one conclusion.','Messe du jour assemblée avec la Collecte conservée de la Messe votive empêchée sous une seule conclusion.')
      : kind==='calendar-fallback'
      ? L('The rubrical result resolves to the calendar Mass; the normal live sequence will be used.','Le résultat rubrical renvoie à la Messe du calendrier ; la séquence normale sera utilisée.')
      : L('ResolvedMass is ready. The live engine will render this already-resolved celebration; it will not recalculate rubrical permission.','ResolvedMass est prêt. Le moteur en direct rendra cette célébration déjà résolue ; il ne recalculera pas la permission rubricale.');
  }
  setTextIfChanged(note,noteText);
}
function install(){
  restoreActive();
  const r=rt();if(!r?.store){setTimeout(install,80);return}
  let lastDate=r.store.getState().selectedDate;
  r.store.subscribe(s=>{if(s.selectedDate!==lastDate){lastDate=s.selectedDate;clearActive()}queueMicrotask(decorate)});
  decorate();
}
document.addEventListener('click',e=>{
  const prepareNext=e.target?.closest?.('[data-prepare-next]');
  if(prepareNext&&state()?.route==='prepare'){
    const label=(prepareNext.textContent||'').replace(/\s+/g,' ').trim();
    if(/Follow Mass|Follow Liturgy|Suivre la Messe|Suivre la liturgie/i.test(label)&&api()?.openPreflight){e.preventDefault();e.stopImmediatePropagation();rt()?.store?.dispatch?.({type:'leave-prepare'});queueMicrotask(()=>api()?.openPreflight?.());return}
  }
  const b=e.target?.closest?.('[data-ao-start-live]');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();void startLive();
},true);
window.AO_SEQUENCE_BRIDGE_V23={version:VERSION,startLive,getAssemblyStatus:assemblyStatus,clearActive,decorate,getActive:()=>window.AO_ACTIVE_MASS_SESSION||null};window.AO_SEQUENCE_BRIDGE_V22=window.AO_SEQUENCE_BRIDGE_V23;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
