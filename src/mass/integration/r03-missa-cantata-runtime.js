
(()=>{
 'use strict';
 const AO=window.AO=window.AO||{},node=document.getElementById('ao-v174d-mc-certification');
 const CERT=node?JSON.parse(node.textContent):null;
 function selectedColumn(){return AO.MassProfile?.ceremonialProfile==='SOLEMNIZED_WITH_INCENSE'?'Incense profile':'Simple profile'}
 function stateOf(b){return String(b?.[selectedColumn()]||'')}
 function activeBindings(){return !CERT?[]:CERT.bindings.filter(b=>stateOf(b)!=='SUPPRESSED')}
 function eRefs(id){return !CERT?[]:CERT.bindings.filter(b=>String(b['E refs']||'').split(/\s*;\s*/).includes(id))}
 function check(id,pass,detail){return {id,pass:!!pass,detail}}
 function run(){
   const applicable=AO.MassProfile?.form==='MISSA_CANTATA';if(!applicable)return {build:'v1.75_R14_INTEGRATION_CANDIDATE',applicable:false,pass:true,profile:AO.MassProfile?.id||'low',checks:[]};
   const p=AO.MassProfile.ceremonialProfile,incense=p==='SOLEMNIZED_WITH_INCENSE',active=activeBindings(),checks=[];
   checks.push(check('A01',CERT?.sourceMoments?.length===71,`${CERT?.sourceMoments?.length||0}/71 source moments`));
   checks.push(check('A02',CERT?.bindings?.length===189,`${CERT?.bindings?.length||0}/189 MC bindings`));
   const incenseOnly=CERT.bindings.filter(b=>b.Support==='INCENSE_PROFILE_ONLY');checks.push(check('A03',incenseOnly.length===3&&incenseOnly.every(b=>b['Simple profile']==='SUPPRESSED'&&b['Incense profile']==='ACTIVE')&&!!AO.LiturgicalData?.data?.profileFlags?.INCENSE_ENABLED===incense,`profile=${p}; incense=${incense}; ${incenseOnly.length}/3 explicit incense-only events`));
   const sacred=active.filter(b=>/\b(?:DEACON|SUBDEACON)\b/i.test(String(b['Resolved actor']||'')));checks.push(check('A04',sacred.length===0,`${sacred.length} sacred-minister actor resolutions`));
   const epi=eRefs('E12');checks.push(check('A05',epi.length===3&&epi.every(b=>/CLERIC IF PRESENT; OTHERWISE CELEBRANT/i.test(String(b['Resolved actor']))),`${epi.length}/3 Epistle resolver events`));
   const e17=eRefs('E17'),e18=eRefs('E18');checks.push(check('A06',e17.every(b=>stateOf(b)==='SUPPRESSED')&&e18.some(b=>/CELEBRANT/i.test(String(b['Resolved actor']))),`private Gospel suppressed=${e17.every(b=>stateOf(b)==='SUPPRESSED')}; public Gospel=celebrant`));
   const pax=eRefs('E55').find(b=>b['MC Event']==='MC-COM-160');checks.push(check('A07',!!pax&&String(pax.Condition)==='mass.form==SOLEMN'&&AO.MassProfile.form!=='SOLEMN',`formal Pax gate=${pax?.Condition||'missing'}`));
   const e61=eRefs('E61');checks.push(check('A08',e61.length===4&&e61.every(b=>stateOf(b)==='SUPPRESSED')&&!AO.LiturgicalData.data.profileFlags.SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED,`${e61.length}/4 Second-Confiteor events suppressed`));
   const leonine=JSON.stringify(AO.LiturgicalData.data).match(/Leonine prayers/gi)||[];checks.push(check('A09',leonine.length===0,'no automatic Leonine-prayer runtime sequence'));
   checks.push(check('A10',CERT.openResearch?.RG005==='ASPERGES'&&eRefs('E02').every(b=>b.Support==='RG005_GATED'),'Asperges remains RG-005 gated'));
   checks.push(check('A11',CERT.openResearch?.RG004==='REQUIEM','Requiem remains RG-004 open'));
   checks.push(check('A12',(CERT.acceptance||[]).every(x=>x.Pass===true),`${(CERT.acceptance||[]).filter(x=>x.Pass===true).length}/${CERT.acceptance?.length||0} certification gates true`));
   const runtimeText=JSON.stringify({priestEvents:AO.LiturgicalData.data.priestEvents,schola:AO.LiturgicalData.data.schola,concurrency:AO.LiturgicalData.data.concurrency});
   checks.push(check('RUNTIME_TOPOLOGY',!/\b(?:deacon|subdeacon)\b/i.test(runtimeText),'active AO.SM execution donor contains no sacred-minister actor/text lane'));
   const pass=checks.every(x=>x.pass);return {build:'v1.75_R14_INTEGRATION_CANDIDATE',applicable:true,pass,profile:AO.MassProfile.id,ceremonialProfile:p,sourceMomentCount:CERT.sourceMoments.length,bindingCount:CERT.bindings.length,activeBindingCount:active.length,checks};
 }
 AO.MissaCantataCertification=Object.freeze({version:CERT.version,certificate:CERT.certificate,status:CERT.status,profiles:Object.freeze(CERT.profiles),sourceMoments:Object.freeze(CERT.sourceMoments),bindings:Object.freeze(CERT.bindings),deviations:Object.freeze(CERT.deviations),guards:Object.freeze(CERT.guards),activeBindings,eventsForSourceMoment:eRefs,runAudit:run});
 AO.MissaCantataAudit=Object.freeze({run});
 function publish(){const a=run();document.documentElement.dataset.aoMcR03=a.pass?'pass':'fail';const dbg=document.querySelector('.debug-panel');if(dbg&&a.applicable&&!dbg.querySelector('[data-v174d-r03]')){const row=document.createElement('div');row.className='debug-row';row.dataset.v174dR03='';row.innerHTML=`<b>MC R03</b><span>${a.pass?'PASS':'FAIL'} · ${a.sourceMomentCount}/71 E · ${a.bindingCount}/189 MC · ${AO.MassProfile.ceremonialProfile}</span>`;dbg.append(row)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(publish,90),{once:true});else setTimeout(publish,90);
})();
