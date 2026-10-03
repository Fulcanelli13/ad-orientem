
(()=>{
 'use strict';
 const AO=window.AO=window.AO||{},node=document.getElementById('ao-v174e-solemn-b006-contract'),C=node?JSON.parse(node.textContent):null;
 const applicable=()=>AO.MassProfile?.form==='SOLEMN';
 function cueNum(c){const m=String(c||'').match(/C(\d{4})$/);return m?+m[1]:-1}
 function eventMatches(e,cue){if(e.cue)return e.cue===cue;if(Array.isArray(e.cueRange)){const n=cueNum(cue),a=cueNum(e.cueRange[0]),b=cueNum(e.cueRange[1]);return n>=a&&n<=b}return false}
 function eventsAt(cue){return !C?[]:C.ministerEvents.filter(e=>eventMatches(e,cue))}
 function primaryAt(cue){return eventsAt(cue)[0]||null}
 function decorateState(el,priest){if(!applicable())return;const box=document.getElementById('sectionAction'),value=document.getElementById('actionDisplay'),label=box?.querySelector('.section-label');if(!box||!value||!label)return;const ev=primaryAt(el?.dataset?.cue||'');if(ev){box.dataset.solemnMinister='1';box.classList.remove('empty');box.classList.add('hot');label.textContent=ev.actor;value.textContent=ev.label||ev.action;box.title=ev.action}else{if(box.dataset.solemnMinister){delete box.dataset.solemnMinister;box.title=''}label.textContent='ACTION'}}
 function check(id,pass,detail){return {id,pass:!!pass,detail}}
 function run(){if(!applicable())return {build:'v1.75_R14_INTEGRATION_CANDIDATE',applicable:false,pass:true,profile:AO.MassProfile?.id||'low',checks:[]};const checks=[],D=AO.LiturgicalData?.data||{},P=D.priestEvents||[],M=D.ministerEvents||[];
   checks.push(check('R04_SCOPE',C?.certifiedSourceMoments?.length===68&&new Set(C.certifiedSourceMoments).size===68,`${C?.certifiedSourceMoments?.length||0}/68 certified source moments`));
   checks.push(check('B006_BASE',C?.counts?.baseTemplateSteps===68&&C?.oldQa?.counts?.sungBaseTemplateBound===68,'68/68 B006 base steps bound'));
   checks.push(check('TOPOLOGY',C.topology.DEACON==='CORE'&&C.topology.SUBDEACON==='CORE'&&C.topology.THURIFER==='ACTIVE'&&/ELEVATIONS/.test(C.topology.TORCHBEARERS),'deacon/subdeacon/thurifer/torchbearers active'));
   checks.push(check('INCENSE',D.profileFlags?.INCENSE_ENABLED===true&&D.profileFlags?.SOLEMN_MASS_PROFILE===true,'Solemn incense constitutive'));
   const epi=P.find(x=>x.Source_Cue_ID==='AO.SM.C0075');checks.push(check('E12',epi?.Runtime_Actor_Override==='SUBDEACON'&&epi?.Voice==='LISTENS','Epistle belongs to subdeacon; celebrant listens'));
   const gospel=P.filter(x=>['AO.SM.C0082','AO.SM.C0084','AO.SM.C0086'].includes(x.Source_Cue_ID));checks.push(check('E16_E18',gospel.length===3&&gospel.every(x=>x.Runtime_Actor_Override==='DEACON'&&x.Voice==='LISTENS'),'public Gospel belongs to deacon'));
   const host=M.find(x=>x.sourceMoment==='E40'),chalice=M.find(x=>x.sourceMoment==='E44');checks.push(check('ELEVATIONS',/DEACON/.test(host?.actor||'')&&/TORCHBEARERS/.test(host?.actor||'')&&/DEACON/.test(chalice?.actor||'')&&/TORCHBEARERS/.test(chalice?.actor||''),'no Low-server chasuble substitution at elevations'));
   const pax=M.find(x=>x.sourceMoment==='E55');checks.push(check('E55',pax?.canonicalMcEvent==='MC-0066'&&/DEACON/.test(pax?.actor||''),'formal Solemn Pax restored at MC-0066'));
   checks.push(check('E64_E65',M.some(x=>x.sourceMoment==='E64'&&/DEACON/.test(x.actor))&&M.some(x=>x.sourceMoment==='E65'&&/SUBDEACON/.test(x.actor)),'Communion/ablution sacred-minister topology restored'));
   const dismiss=P.find(x=>x.Source_Cue_ID==='AO.SM.C0259');checks.push(check('E68',dismiss?.Runtime_Actor_Override==='DEACON'&&dismiss?.Voice==='LISTENS','deacon dismissal restored'));
   const lg=P.filter(x=>['AO.SM.C0268','AO.SM.C0270','AO.SM.C0275'].includes(x.Source_Cue_ID));checks.push(check('E70',lg.length===3&&lg.every(x=>x.Runtime_Actor_Override==='SUBDEACON'),'Last Gospel subdeacon response lane retained'));
   checks.push(check('E61',!D.profileFlags?.SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED,'Second Confiteor historical-only'));
   checks.push(check('NO_MC_CONTAMINATION',AO.MissaCantataProfile===null&&AO.MassProfile.capabilities.sacredMinisters===true,'Solemn is not Missa Cantata-with-ministers'));
   const pass=checks.every(x=>x.pass);return {build:'v1.75_R14_INTEGRATION_CANDIDATE',applicable:true,pass,profile:AO.MassProfile.id,sourceMomentCount:C.certifiedSourceMoments.length,ministerOverlayEvents:M.length,checks};
 }
 AO.SolemnMassBinding=Object.freeze({version:C.version,task:C.task,recoveryTask:C.recoveryTask,certifiedSourceMoments:Object.freeze(C.certifiedSourceMoments),sourceMomentMap:Object.freeze(C.sourceMomentMap),topology:Object.freeze(C.topology),ministerEvents:Object.freeze(C.ministerEvents),eventsAt,eventsForSourceMoment:(id)=>C.ministerEvents.filter(e=>e.sourceMoment===id),runAudit:run});
 AO.SolemnMassRuntime=Object.freeze({decorateState,eventsAt,primaryAt});
 AO.SolemnMassAudit=Object.freeze({run});
 function publish(){const a=run();document.documentElement.dataset.aoSolemnR04=a.pass?'pass':'fail';if(a.applicable){const active=document.querySelector('.mass-card.is-active .flow-unit.active,.mass-card.is-active .flow-unit.focus-current');if(active&&window.syncState)try{window.syncState(active)}catch(_){}const dbg=document.querySelector('.debug-panel');if(dbg&&!dbg.querySelector('[data-v174e-r04]')){const row=document.createElement('div');row.className='debug-row';row.dataset.v174eR04='';row.innerHTML=`<b>Solemn R04</b><span>${a.pass?'PASS':'FAIL'} · ${a.sourceMomentCount}/68 B006 · ${a.ministerOverlayEvents} minister deltas</span>`;dbg.append(row)}}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(publish,120),{once:true});else setTimeout(publish,120);
})();
