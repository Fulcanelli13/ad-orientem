
/* AO.Attention — response/action cues; never alters Mass text. */
(function(){
 AO.Attention=AO.Attention||{version:'2.0',owner:'LIVE_CUE_ARBITRATION'};
 const q=s=>document.querySelector(s);
 const state={responseKey:'',action:'',sacredTimer:0,handoffTitle:'',handoffTimer:0,responseTranslation:false};
 const reduce=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clean=s=>String(s||'').replace(/^\s*℟\.?\s*/,'').trim();
 const withR=s=>{const t=clean(s);return t?`℟. ${t}`:'℟.'};
 function visibleFlow(){return Array.from(document.querySelectorAll('.mass-card.is-active .flow-unit')).filter(x=>getComputedStyle(x).display!=='none')}
 function responseForElement(el){
   if(!el)return null;
   const cue=el.dataset.cue||'';
   const canonical=cue?window.__AO_RESPONSE_BY_CUE?.get(cue):null;
   if(canonical&&window.__AO_RESPONSE_IS_FOR_USER?.(canonical))return canonical;
   if(el.dataset.runtimeResponse)return {Response_Text:withR(el.dataset.runtimeResponse),Default_User_Response:'YES'};
   return null;
 }
 function nextCanonicalResponse(el){
   if(!el)return null;const els=visibleFlow(),i=els.indexOf(el),blockId=el.dataset.block;
   if(i<0||!blockId)return null;
   for(let j=i+1;j<Math.min(els.length,i+6);j++){
     const x=els[j];if(x.dataset.block!==blockId)break;
     const r=responseForElement(x);if(r)return {el:x,resp:r};
   }
   return null;
 }
 function responseEnglish(el){const n=el?.nextElementSibling;return n?.classList?.contains('translation')?(n.textContent||'').trim():''}
 function responsePayload(el,resp,userResp){
   if(userResp&&resp)return {phase:'now',el,resp,latin:withR(resp.Response_Text||el?.dataset?.runtimeResponse),english:responseEnglish(el)};
   if(el?.dataset?.runtimeResponse)return {phase:'now',el,resp:null,latin:withR(el.dataset.runtimeResponse),english:responseEnglish(el)};
   const nxt=nextCanonicalResponse(el);if(nxt)return {phase:'next',el:nxt.el,resp:nxt.resp,latin:withR(nxt.resp.Response_Text||nxt.el.dataset.runtimeResponse),english:responseEnglish(nxt.el)};
   return null;
 }
 function renderResponseRail(payload){
   const card=q('#responseCard'),tag=q('#responseTag'),text=q('#responseText'),tr=q('#responseRailTranslation');if(!card||!tag||!text)return;
   if(!payload){card.classList.remove('functional-response-ready','functional-response-now','functional-response-next','functional-response-enter','show-response-translation');tag.textContent='RESPOND';if(tr){tr.textContent='';tr.setAttribute('aria-hidden','true')}state.responseKey='';return}
   card.classList.remove('off');card.classList.add('functional-response-ready');card.classList.toggle('functional-response-now',payload.phase==='now');card.classList.toggle('functional-response-next',payload.phase==='next');
   tag.textContent=payload.phase==='now'?'NOW':'NEXT';text.textContent=payload.latin;window.__AO_SET_ICON_HTML?.(q('#responseIcon'),'SEM:CUE.RESPONSE','℟');
   card.dataset.responseEnglish=payload.english||'';if(tr){tr.textContent=payload.english||'';tr.setAttribute('aria-hidden',state.responseTranslation&&!!payload.english?'false':'true')}card.classList.toggle('show-response-translation',state.responseTranslation&&!!payload.english);
   const key=`${payload.phase}:${payload.el?.dataset?.cue||payload.latin}`;if(key!==state.responseKey){state.responseKey=key;if(!reduce()){card.classList.remove('functional-response-enter');void card.offsetWidth;card.classList.add('functional-response-enter');setTimeout(()=>card.classList.remove('functional-response-enter'),260)}}
 }
 function toggleResponseTranslation(){const card=q('#responseCard');if(!card?.classList.contains('functional-response-ready')||!card.dataset.responseEnglish)return;state.responseTranslation=!state.responseTranslation;card.classList.toggle('show-response-translation',state.responseTranslation);q('#responseRailTranslation')?.setAttribute('aria-hidden',state.responseTranslation?'false':'true')}
 q('#responseCard')?.addEventListener('click',toggleResponseTranslation);q('#responseCard')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleResponseTranslation()}});
 function actionIsSacred(a){return ['ELEVATES HOST','ELEVATES CHALICE','MINOR ELEVATION','SHOWS SACRED HOST'].includes(a)}
 function renderActionMotion(){const box=q('#sectionAction'),value=q('#actionDisplay');if(!box||!value)return;const raw=(value.textContent||'').trim(),a=raw==='—'?'':raw,changed=a!==state.action;if(changed){state.action=a;if(a&&!reduce()){box.classList.remove('functional-action-enter');void box.offsetWidth;box.classList.add('functional-action-enter');setTimeout(()=>box.classList.remove('functional-action-enter'),280)}}const sacred=actionIsSacred(a);box.classList.toggle('functional-sacred-action',sacred);if(sacred&&changed){document.body.classList.add('functional-sacred-focus');clearTimeout(state.sacredTimer);state.sacredTimer=setTimeout(()=>document.body.classList.remove('functional-sacred-focus'),1250)}else if(!sacred&&changed)document.body.classList.remove('functional-sacred-focus')}
 function showScholaHandoff(){const dock=q('#scholaDock'),kind=q('#scholaStreamKind'),title=q('#scholaTitleText');if(!dock||!kind||!title)return;const t=title.textContent||'';if(!dock.classList.contains('show')||!/(GLORIA|CREDO)/.test(t)){state.handoffTitle='';return}if(t===state.handoffTitle)return;state.handoffTitle=t;dock.classList.add('functional-handoff');kind.textContent='PRIEST → SCHOLA';clearTimeout(state.handoffTimer);state.handoffTimer=setTimeout(()=>{dock.classList.remove('functional-handoff');if(kind.textContent==='PRIEST → SCHOLA')kind.textContent='LATIN'},1250)}
 const st=q('#scholaTitleText');if(st&&window.MutationObserver)new MutationObserver(showScholaHandoff).observe(st,{childList:true,subtree:true,characterData:true});const sd=q('#scholaDock');if(sd&&window.MutationObserver)new MutationObserver(showScholaHandoff).observe(sd,{attributes:true,attributeFilter:['class','aria-hidden']});
 window.__AO_FUNCTIONAL_MOTION=function(el,block,priest,resp,userResp){if(document.body.dataset.mode!=='live'){renderResponseRail(null);renderActionMotion();return}renderResponseRail(responsePayload(el,resp,userResp));renderActionMotion();showScholaHandoff()};
})();
