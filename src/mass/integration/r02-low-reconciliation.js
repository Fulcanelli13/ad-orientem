
(()=>{
 'use strict';
 const AO=window.AO=window.AO||{};
 const CONTRACT=JSON.parse(document.getElementById('ao-v174c-low-recovery-contract').textContent);
 const canonicalVisibleIds=Object.freeze(Array.from({length:275},(_,i)=>`AO.SM.C${String(i+1).padStart(4,'0')}`));
 const syntheticSungIds=Object.freeze(['AO.SM.C0276','AO.SM.C0277','AO.SM.C0278','AO.SM.C0279']);
 function payload(){try{return JSON.parse(document.getElementById('mass-data').textContent)}catch(_){return null}}
 function unitMap(data){const m=new Map();for(const b of data?.blocks||[])for(const u of b.units||[])if(u?.cue_id)m.set(u.cue_id,{...u,block:b.Block_ID,macro:b.Macro_ID});return m}
 function byCue(arr,cue,key='Source_Cue_ID'){return (arr||[]).filter(x=>x?.[key]===cue)}
 function run(){
   const form=document.body.dataset.massForm||AO.MassProfile?.id||'';
   if(form!=='low')return {build:'v1.75_R14_INTEGRATION_CANDIDATE',applicable:false,pass:true,form};
   const data=payload(),units=unitMap(data),checks=[];
   const add=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
   const missing=canonicalVisibleIds.filter(id=>!units.has(id));
   add('275 canonical visible cues',missing.length===0&&canonicalVisibleIds.length===275,missing.length?`Missing ${missing.join(', ')}`:'275/275 present');
   add('275 Low priest events',(data?.priestEvents||[]).length===275,`${(data?.priestEvents||[]).length} events`);
   add('63 certified B005 moments',CONTRACT.certifiedSourceMoments.length===63,`${CONTRACT.certifiedSourceMoments.length}/63`);
   add('No Low incense',data?.profileFlags?.INCENSE_ENABLED===false,String(data?.profileFlags?.INCENSE_ENABLED));
   add('No Low Schola capability',AO.MassProfile?.capabilities?.schola===false,String(AO.MassProfile?.capabilities?.schola));
   add('Dialogue responses default off',data?.profileFlags?.LOW_MASS_DIALOGUE_RESPONSES===false,String(data?.profileFlags?.LOW_MASS_DIALOGUE_RESPONSES));
   const branch=(data?.branches||[]).find(x=>x.Condition==='SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED');
   add('Second Confiteor branch default OFF',data?.profileFlags?.SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED===false&&String(branch?.Default||'').toUpperCase()==='OFF',`flag=${data?.profileFlags?.SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED} branch=${branch?.Default||'missing'}`);
   const secondConfCues=['AO.SM.C0235','AO.SM.C0236','AO.SM.C0237','AO.SM.C0238','AO.SM.C0239','AO.SM.C0240','AO.SM.C0241'];
   const secondConfEvents=secondConfCues.flatMap(c=>byCue(data?.priestEvents,c));
   add('Second Confiteor events remain branch-gated',secondConfEvents.length===7&&secondConfEvents.every(x=>x.Branch_Condition==='SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED'),`${secondConfEvents.length}/7 gated`);
   const faithfulDnsd=['AO.SM.C0243','AO.SM.C0244','AO.SM.C0245'];
   const dnsdEvents=faithfulDnsd.flatMap(c=>byCue(data?.priestEvents,c));
   const dnsdResponses=faithfulDnsd.flatMap(c=>byCue(data?.responses,c));
   add('Faithful Dnsd is celebrant-led',dnsdEvents.length===3&&dnsdEvents.every(x=>String(x.Facing||'').includes('PEOPLE')&&/CLEAR SPOKEN/i.test(String(x.Voice||'')))&&dnsdResponses.length===0,`${dnsdEvents.length} priest events; ${dnsdResponses.length} response events`);
   const bellRuntime=AO.BellRuntime?.normative||[];
   const bellIds=bellRuntime.map(x=>x.id);
   add('Normative bell grammar BELL001–005',['AO.SM.BELL001','AO.SM.BELL002','AO.SM.BELL003','AO.SM.BELL004','AO.SM.BELL005'].every(id=>bellIds.includes(id)),bellIds.join(','));
   const oldDnsdBell=(AO.BellRuntime?.historicalSuppressed||[]).some(x=>x.id==='AO.SM.BELL006'&&x.cues?.includes('AO.SM.C0229'));
   add('Priest Dnsd bell suppressed as historical',oldDnsdBell,'AO.SM.BELL006 never enters normative BELL_RUNTIME');
   const warning=bellRuntime.find(x=>x.id==='AO.SM.BELL005');
   add('Communion warning owned by server',warning?.owner==='MINISTER_OR_SERVER'&&warning?.cue==='AO.SM.C0225',warning?`${warning.cue} · ${warning.owner}`:'missing');
   const pass=checks.every(x=>x.pass);
   return {build:'v1.75_R14_INTEGRATION_CANDIDATE',applicable:true,pass,form,canonicalVisibleTextCues:275,certifiedSourceMoments:63,checks};
 }
 AO.CanonicalIdentity=Object.freeze({
   execution:'AO.SM',visibleParagraphTextCues:275,sungExecutionCues:279,
   lowSyntheticSungCues:0,sungSyntheticPriestLaneCues:syntheticSungIds,
   textAuthority:'Ad_Orientem_1962_SOT_v3_AUDITED_COMPATIBILITY / current AO.SM display+cues',
   formRecoveryAuthority:'Ad_Orientem_Mass_Form_Recovery_Delta_Matrix_v1.1_R01_IDENTITY_FREEZE'
 });
 AO.LowMassB005=Object.freeze({...CONTRACT,certifiedSourceMoments:Object.freeze([...CONTRACT.certifiedSourceMoments]),exceptions:Object.freeze({...CONTRACT.exceptions}),runAudit:run});
 let lastAudit=null;
 AO.LowMassAudit=Object.freeze({run,get last(){return lastAudit}});
 function publish(){const a=run();lastAudit=a;document.documentElement.dataset.aoLowReconciliation=a.pass?'pass':'fail';
   const dbg=document.querySelector('.debug-panel');if(dbg&&a.applicable&&!dbg.querySelector('[data-v174c-r02]')){const row=document.createElement('div');row.className='debug-row';row.dataset.v174cR02='';row.innerHTML=`<b>Low R02</b><span>${a.pass?'PASS':'FAIL'} · 275 cues · 63 B005 moments</span>`;dbg.append(row)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(publish,80),{once:true});else setTimeout(publish,80);
 window.addEventListener('ao:focus-unit-changed',()=>{if(document.body.dataset.massForm==='low')publish()},{passive:true});
})();
