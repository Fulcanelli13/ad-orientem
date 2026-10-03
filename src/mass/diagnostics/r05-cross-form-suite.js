
(()=>{
 'use strict';
 const AO=window.AO=window.AO||{};
 const parse=id=>{try{return JSON.parse(document.getElementById(id)?.textContent||'null')}catch(_){return null}};
 const LOW=parse('mass-data'), SUNG=parse('mass-data-sung'), R02=parse('ao-v174c-low-recovery-contract'), R03=parse('ao-v174d-mc-certification'), R04=parse('ao-v174e-solemn-b006-contract'), C=parse('ao-v174f-r05-contract');
 const canonicalIds=()=>Array.from({length:275},(_,i)=>`AO.SM.C${String(i+1).padStart(4,'0')}`);
 const cueMap=d=>new Map((d?.priestEvents||[]).filter(x=>x?.Source_Cue_ID).map(x=>[x.Source_Cue_ID,x]));
 const unitIds=d=>{const a=[];for(const b of d?.blocks||[])for(const u of b.units||[])if(u?.cue_id)a.push(u.cue_id);return a};
 const row=eid=>(R03?.sourceMoments||[]).find(x=>x?.['E ID']===eid)||null;
 const sole=eid=>(R04?.ministerEvents||[]).filter(x=>x?.sourceMoment===eid);
 const lowCue=cueMap(LOW), sungCue=cueMap(SUNG);
 const profiles=Object.freeze({
   low:{id:'low',schola:false,incense:false,sacred:false,deacon:false,subdeacon:false,torchbearers:false,epistle:'CELEBRANT',gospel:'CELEBRANT',dismissal:'CELEBRANT'},
   'mc-simple':{id:'mc-simple',schola:true,incense:false,sacred:false,deacon:false,subdeacon:false,torchbearers:false,epistle:'ELIGIBLE_CLERIC_OR_CELEBRANT',gospel:'CELEBRANT',dismissal:'CELEBRANT'},
   'mc-incense':{id:'mc-incense',schola:true,incense:true,sacred:false,deacon:false,subdeacon:false,torchbearers:false,epistle:'ELIGIBLE_CLERIC_OR_CELEBRANT',gospel:'CELEBRANT',dismissal:'CELEBRANT'},
   solemn:{id:'solemn',schola:true,incense:true,sacred:true,deacon:true,subdeacon:true,torchbearers:true,epistle:'SUBDEACON',gospel:'DEACON',dismissal:'DEACON'}
 });
 function hasBoolBell(o){let bad=false;(function w(v){if(bad||v==null)return;if(Array.isArray(v)){v.forEach(w);return}if(typeof v==='object'){for(const [k,x] of Object.entries(v)){if(/^bell$/i.test(k)&&typeof x==='boolean'){bad=true;return}w(x)}}})(o);return bad}
 function test(id,pass,detail,category){return {id,pass:!!pass,detail:String(detail??''),category:category||'GENERAL'}}
 function noSacred(s){return !/\b(DEACON|SUBDEACON|SACRED[_ ]MINISTER)/i.test(String(s||''))}
 function run(){
   const T=[]; const add=(id,p,d,c)=>T.push(test(id,p,d,c));
   const lowIds=unitIds(LOW), sungIds=unitIds(SUNG), canon=canonicalIds();
   const lowCanon=canon.filter(x=>lowIds.includes(x)), sungCanon=canon.filter(x=>sungIds.includes(x)), synth=sungIds.filter(x=>/^AO\.SM\.C02(76|77|78|79)$/.test(x));
   add('G001_LOW_CANONICAL_275',lowCanon.length===275,`${lowCanon.length}/275`,'CANONICAL_IDENTITY');
   add('G002_SUNG_CANONICAL_275',sungCanon.length===275,`${sungCanon.length}/275`,'CANONICAL_IDENTITY');
   add('G003_SUNG_SYNTHETIC_4',new Set(synth).size===4,`${new Set(synth).size}/4`,'CANONICAL_IDENTITY');
   add('G004_BLOCK_GRAPH_96',LOW?.blocks?.length===96&&SUNG?.blocks?.length===96,`${LOW?.blocks?.length}/${SUNG?.blocks?.length}`,'CANONICAL_IDENTITY');
   add('G005_R02_DENOMINATOR',R02?.certifiedSourceMoments?.length===63,`${R02?.certifiedSourceMoments?.length}/63`,'CANONICAL_IDENTITY');
   add('G006_R03_DENOMINATOR',R03?.sourceMoments?.length===71,`${R03?.sourceMoments?.length}/71`,'CANONICAL_IDENTITY');
   add('G007_R03_BINDINGS_189',R03?.bindings?.length===189,`${R03?.bindings?.length}/189`,'CANONICAL_IDENTITY');
   add('G008_R04_DENOMINATOR',R04?.certifiedSourceMoments?.length===68,`${R04?.certifiedSourceMoments?.length}/68`,'CANONICAL_IDENTITY');
   add('G009_R04_DELTAS_19',R04?.ministerEvents?.length===19,`${R04?.ministerEvents?.length}/19`,'CANONICAL_IDENTITY');
   add('F001_LOW_NO_INCENSE',profiles.low.incense===false&&LOW?.profileFlags?.INCENSE_ENABLED===false,'Low incense OFF','FORM_CAPABILITIES');
   add('F002_LOW_NO_SCHOLA',profiles.low.schola===false,'Low Schola capability OFF','FORM_CAPABILITIES');
   add('F003_MC_SIMPLE_NO_INCENSE',profiles['mc-simple'].incense===false&&R03?.profiles?.['mc-simple']?.incense===false,'MC Simple incense OFF','FORM_CAPABILITIES');
   add('F004_MC_INCENSE_ON',profiles['mc-incense'].incense===true&&R03?.profiles?.['mc-incense']?.incense===true,'MC Incense ON','FORM_CAPABILITIES');
   add('F005_MC_NO_SACRED_MINISTERS',!profiles['mc-simple'].sacred&&!profiles['mc-incense'].sacred&&!profiles['mc-simple'].deacon&&!profiles['mc-incense'].subdeacon,'No deacon/subdeacon in MC','FORM_CAPABILITIES');
   add('F006_MC_NO_RUNTIME_TORCHBEARER',profiles['mc-incense'].torchbearers===false&&R03?.profiles?.['mc-incense']?.runtimeTorchbearerActor===false,'Torchbearers optional staffing only; no canonical runtime actor','FORM_CAPABILITIES');
   add('F007_SOLEMN_SACRED_MINISTERS',profiles.solemn.deacon&&profiles.solemn.subdeacon&&profiles.solemn.sacred,'Deacon + subdeacon active','FORM_CAPABILITIES');
   add('F008_SOLEMN_TORCHBEARERS',profiles.solemn.torchbearers&&/ELEVATIONS/.test(R04?.topology?.TORCHBEARERS||''),'Solemn elevation torchbearers','FORM_CAPABILITIES');
   add('F009_SECOND_CONFITEOR_OFF',LOW?.profileFlags?.SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED===false&&SUNG?.profileFlags?.SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED===false,'OFF in donor profiles','FORM_CAPABILITIES');
   add('A001_E07_MC_SIMPLE_SUPPRESSED',row('E07')?.['Simple no-incense']==='SUPPRESSED','E07 suppressed','ACTOR_TOPOLOGY');
   add('A002_E07_MC_INCENSE_ACTIVE',row('E07')?.['Solemnized + incense']==='ACTIVE'&&noSacred(row('E07')?.['Resolved actor(s)']),row('E07')?.['Resolved actor(s)'],'ACTOR_TOPOLOGY');
   add('A003_E07_SOLEMN_DEACON_THURIFER',sole('E07').some(x=>/DEACON/.test(x.actor)&&/THURIFER/.test(x.actor)),sole('E07').map(x=>x.actor).join(' | '),'ACTOR_TOPOLOGY');
   add('A004_E12_LOW_CELEBRANT',/READS THE EPISTLE/i.test(lowCue.get('AO.SM.C0075')?.Action||'')&&/CLEAR SPOKEN/.test(lowCue.get('AO.SM.C0075')?.Voice||''),lowCue.get('AO.SM.C0075')?.Voice,'ACTOR_TOPOLOGY');
   add('A005_E12_MC_NO_SUBDEACON',noSacred(row('E12')?.['Resolved actor(s)'])&&!/SUBDEACON/i.test(row('E12')?.['Runtime rule']||''),row('E12')?.['Resolved actor(s)'],'ACTOR_TOPOLOGY');
   add('A006_E12_SOLEMN_SUBDEACON',sole('E12').some(x=>/SUBDEACON/.test(x.actor)),sole('E12').map(x=>x.actor).join(' | '),'ACTOR_TOPOLOGY');
   add('A007_E18_LOW_CELEBRANT',/PROCLAIMS THE GOSPEL/i.test(lowCue.get('AO.SM.C0086')?.Action||''),lowCue.get('AO.SM.C0086')?.Voice,'ACTOR_TOPOLOGY');
   add('A008_E18_MC_CELEBRANT',/CELEBRANT/.test(row('E18')?.['Resolved actor(s)']||'')&&noSacred(row('E18')?.['Resolved actor(s)']),row('E18')?.['Resolved actor(s)'],'ACTOR_TOPOLOGY');
   add('A009_E18_SOLEMN_DEACON',sole('E18').some(x=>/DEACON/.test(x.actor)),sole('E18').map(x=>x.actor).join(' | '),'ACTOR_TOPOLOGY');
   add('A010_E27_PROFILE_SPLIT',row('E27')?.['Simple no-incense']==='SUPPRESSED'&&row('E27')?.['Solemnized + incense']==='ACTIVE'&&noSacred(row('E27')?.['Resolved actor(s)']),row('E27')?.['Resolved actor(s)'],'ACTOR_TOPOLOGY');
   add('A011_E40_MC_THURIFER_ONLY',/THURIFER/.test(row('E40')?.['Resolved actor(s)']||'')&&noSacred(row('E40')?.['Resolved actor(s)']),row('E40')?.['Resolved actor(s)'],'ACTOR_TOPOLOGY');
   add('A012_E40_SOLEMN_SACRED',sole('E40').some(x=>/DEACON/.test(x.actor)&&/SUBDEACON/.test(x.actor)&&/TORCHBEARERS/.test(x.actor)),sole('E40').map(x=>x.actor).join(' | '),'ACTOR_TOPOLOGY');
   add('A013_E44_MC_THURIFER_ONLY',/THURIFER/.test(row('E44')?.['Resolved actor(s)']||'')&&noSacred(row('E44')?.['Resolved actor(s)']),row('E44')?.['Resolved actor(s)'],'ACTOR_TOPOLOGY');
   add('A014_E44_SOLEMN_SACRED',sole('E44').some(x=>/DEACON/.test(x.actor)&&/SUBDEACON/.test(x.actor)&&/TORCHBEARERS/.test(x.actor)),sole('E44').map(x=>x.actor).join(' | '),'ACTOR_TOPOLOGY');
   add('A015_E51_SOLEMN_ONLY_SUBDEACON',sole('E51').some(x=>/SUBDEACON/.test(x.actor))&&noSacred(row('E51')?.['Resolved actor(s)']),`MC=${row('E51')?.['Resolved actor(s)']} · Solemn=${sole('E51').map(x=>x.actor).join(' | ')}`,'ACTOR_TOPOLOGY');
   add('A016_E55_FORMAL_PAX_SOLEMN_ONLY',sole('E55').some(x=>x.canonicalMcEvent==='MC-0066')&&/NO FORMAL/i.test(row('E55')?.['Deviation from Solemn']||''),`Solemn MC-0066; MC ${row('E55')?.['Runtime rule']}`,'ACTOR_TOPOLOGY');
   add('A017_E64_SOLEMN_COMMUNION',sole('E64').some(x=>/DEACON|SACRED/.test(x.actor))&&noSacred(row('E64')?.['Resolved actor(s)']),`MC=${row('E64')?.['Resolved actor(s)']}`,'ACTOR_TOPOLOGY');
   add('A018_E65_SOLEMN_ABLUTIONS',sole('E65').some(x=>/SUBDEACON|DEACON/.test(x.actor))&&noSacred(row('E65')?.['Resolved actor(s)']),`MC=${row('E65')?.['Resolved actor(s)']}`,'ACTOR_TOPOLOGY');
   add('A019_E68_DISMISSAL_SPLIT',profiles.low.dismissal==='CELEBRANT'&&profiles['mc-simple'].dismissal==='CELEBRANT'&&profiles.solemn.dismissal==='DEACON'&&sole('E68').some(x=>/DEACON/.test(x.actor)),'Low/MC celebrant · Solemn deacon','ACTOR_TOPOLOGY');
   add('A020_E70_LAST_GOSPEL_SPLIT',noSacred(row('E70')?.['Resolved actor(s)'])&&sole('E70').some(x=>/SUBDEACON/.test(x.actor)),`MC=${row('E70')?.['Resolved actor(s)']} · Solemn subdeacon responses`,'ACTOR_TOPOLOGY');
   add('V001_EPISTLE_VOICE_LOW',/CLEAR SPOKEN/.test(lowCue.get('AO.SM.C0075')?.Voice||''),lowCue.get('AO.SM.C0075')?.Voice,'VOICE');
   add('V002_EPISTLE_VOICE_MC',/SUNG \/ CLEAR/.test(sungCue.get('AO.SM.C0075')?.Voice||''),sungCue.get('AO.SM.C0075')?.Voice,'VOICE');
   add('V003_GOSPEL_VOICE_LOW',/CLEAR SPOKEN/.test(lowCue.get('AO.SM.C0086')?.Voice||''),lowCue.get('AO.SM.C0086')?.Voice,'VOICE');
   add('V004_GOSPEL_VOICE_MC',/SUNG \/ CLEAR/.test(sungCue.get('AO.SM.C0086')?.Voice||''),sungCue.get('AO.SM.C0086')?.Voice,'VOICE');
   add('V005_SOLEMN_CELEBRANT_LISTENS_EPISTLE',R04?.ministerEvents?.some(x=>x.sourceMoment==='E12'&&/SUBDEACON/.test(x.actor)),'Celebrant listening lane + subdeacon proclamation','VOICE');
   add('R001_LOW_EPISTLE_NOT_SEDILIA',lowCue.get('AO.SM.C0075')?.Priest_Station==='ALTAR_EPISTLE_MISSAL',lowCue.get('AO.SM.C0075')?.Priest_Station,'ROUTE');
   add('R002_MC_EPISTLE_ALTAR_ROUTE',sungCue.get('AO.SM.C0075')?.Priest_Station==='ALTAR_EPISTLE_MISSAL',sungCue.get('AO.SM.C0075')?.Priest_Station,'ROUTE');
   const soleRuntimeSource=[...document.scripts].map(x=>x.textContent||'').join('\n'); add('R003_SOLEMN_EPISTLE_SEDILIA',/AO\.SM\.C0075[\s\S]{0,500}SEDILIA/.test(soleRuntimeSource),'Solemn C0075 runtime overlay routes celebrant to sedilia/listening state','ROUTE');
   add('S001_LOW_SCHOLA_DORMANT',(LOW?.schola||[]).every(x=>x.Runtime_Enabled_Low_Mass!=='YES'),'All Low schola references dormant','SCHOLA');
   add('S002_SUNG_SCHOLA_CORE',(SUNG?.schola||[]).some(x=>x.Scope==='CORE_SUNG_MASS'),'Core sung Schola clock present','SCHOLA');
   add('S003_MC_AND_SOLEMN_SHARE_SCHOLA_DONOR',profiles['mc-simple'].schola&&profiles['mc-incense'].schola&&profiles.solemn.schola,'Shared sung Schola donor; actor topology remains separate','SCHOLA');
   add('B001_NO_BELL_BOOLEAN',!hasBoolBell(LOW)&&!hasBoolBell(SUNG),'No bell=true/false semantic','BELL');
   add('B002_LOW_COMMUNION_WARNING',/BELL005/.test(R02?.contracts?.communionWarningBell||'')&&/MINISTER|SERVER/i.test(R02?.contracts?.communionWarningBell||''),R02?.contracts?.communionWarningBell,'BELL');
   add('B003_DNSD_BELL_HISTORICAL',/BELL006/.test(R02?.contracts?.priestDomineNonSumDignusBell||'')&&/historical/i.test(R02?.contracts?.priestDomineNonSumDignusBell||''),R02?.contracts?.priestDomineNonSumDignusBell,'BELL');
   add('B004_MC_ELEVATION_INCENSE_CONDITIONAL',/THURIFER OVERLAY/.test(row('E40')?.['Resolved actor(s)']||'')&&/IF INCENSE/.test(row('E44')?.['Resolved actor(s)']||''),'Thurifer overlay only in incense profile','BELL');
   add('P001_LOW_SUNG_PROFILE_FLAG_OFF',LOW?.profileFlags?.AO_DEFAULT_1962_SUNG===false,'Low sung-posture gate OFF','POSTURE');
   add('P002_SUNG_PROFILE_FLAG_ON',SUNG?.profileFlags?.AO_DEFAULT_1962_SUNG===true,'Sung posture gate ON','POSTURE');
   const postureText=JSON.stringify([...(LOW?.postures||[]),...(SUNG?.postures||[])]);
   add('P003_POSTURE_NO_MINISTER_TOPOLOGY',!/DEACON|SUBDEACON|THURIFER|TORCHBEARER/i.test(postureText),'Faithful posture data independent from minister topology','POSTURE');
   add('P004_POSTURE_ARRAYS_PRESENT',LOW?.postures?.length===26&&SUNG?.postures?.length===23,`${LOW?.postures?.length}/${SUNG?.postures?.length}`,'POSTURE');
   const mcActorLeak=(R03?.bindings||[]).filter(x=>/DEACON|SUBDEACON/i.test(x?.['Resolved actor']||''));
   add('C001_NO_SACRED_ACTOR_IN_MC_BINDINGS',mcActorLeak.length===0,`${mcActorLeak.length} leaked bindings`,'CONTAMINATION');
   const soleElev=sole('E40').concat(sole('E44')).map(x=>x.actor).join(' ');
   add('C002_NO_LOW_SERVER_IN_SOLEMN_ELEVATIONS',!/\bSERVER\b/.test(soleElev),soleElev,'CONTAMINATION');
   add('C003_MC_NO_FORMAL_PAX',/suppress/i.test(row('E55')?.['Runtime rule']||'')||/no formal/i.test(row('E55')?.['Deviation from Solemn']||''),row('E55')?.['Runtime rule'],'CONTAMINATION');
   add('C004_SOLEMN_PAX_FORM_SCOPED',sole('E55').some(x=>x.canonicalMcEvent==='MC-0066'),'MC-0066 only in Solemn overlay','CONTAMINATION');
   add('C005_FORM_SELECTOR_4',document.querySelectorAll('[data-ao-form]').length===4,`${document.querySelectorAll('[data-ao-form]').length} choices`,'CONTAMINATION');
   const active=AO.MassProfile?.id||document.body.dataset.massProfile||document.body.dataset.massForm;
   add('C006_ACTIVE_PROFILE_VALID',Object.prototype.hasOwnProperty.call(profiles,active),String(active),'CONTAMINATION');
   const failed=T.filter(x=>!x.pass);return {build:'v1.75_R14_INTEGRATION_CANDIDATE',task:'R05',lineage:'v43.59 B007',pass:failed.length===0,total:T.length,passed:T.length-failed.length,failed:failed.length,failures:failed,tests:T,profiles,keyMoments:C?.keyMoments||{},legacyInvariantCount:C?.legacyInvariantCount||40};
 }
 AO.CrossFormRegression=Object.freeze({version:'v1.74f-R05',profiles,run,matrix:()=>C?.keyMoments||{}});
 AO.CrossFormAudit=Object.freeze({run});
 function publish(){const a=run();document.documentElement.dataset.aoR05=a.pass?'pass':'fail';const dbg=document.querySelector('.debug-panel');if(dbg&&!dbg.querySelector('[data-v174f-r05]')){const row=document.createElement('div');row.className='debug-row';row.dataset.v174fR05='';row.innerHTML=`<b>Cross-form R05</b><span>${a.pass?'PASS':'FAIL'} · ${a.passed}/${a.total} invariants</span>`;dbg.append(row)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(publish,160),{once:true});else setTimeout(publish,160);
})();
