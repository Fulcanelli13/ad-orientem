
(()=>{
 'use strict';
 const AO=window.AO=window.AO||{};
 const truth=v=>['1','true','yes','on'].includes(String(v??'').toLowerCase());
 const norm=v=>String(v??'').trim().toLowerCase();
 const OPTIONAL_KEYS=['pre','pre_done','following','participating','palm_procession','body','burial','mandatum','reposition','nuptial_eligibility','sprinkled','palm_received','ash_received','has_candle','candle_received','mandatum_participant','gf_communion','gf_no_veneration','gf_veneration'];
 function sanitizeState(input={},changedKey=''){
   const s={...input};
   const rite=norm(s.rite||'ordinary'),pre=norm(s.pre),following=norm(s.following);
   if(changedKey==='pre'){
     s.pre_done='';s.sprinkled='';s.palm_received='';s.ash_received='';s.has_candle='';s.candle_received='';s.palm_procession='';
   }
   if(changedKey==='following'){
     s.body='';s.burial='';
     if(!['corpus','procession'].includes(following) && !['palm','rogation'].includes(pre))s.participating='';
   }
   if(rite!=='requiem' && following==='absolution'){s.following='';s.body='';s.burial='';}
   if(rite!=='holy-thursday'){s.mandatum='';s.reposition='';}
   if(rite!=='nuptial')s.nuptial_eligibility='UNRESOLVED';
   if(['good-friday','easter-vigil'].includes(rite)){
     s.pre='';s.pre_done='';s.following='';s.participating='';s.palm_procession='';s.body='';s.burial='';s.mandatum='';s.reposition='';s.sprinkled='';s.palm_received='';s.ash_received='';s.has_candle='';s.candle_received='';
   }
   const p=norm(s.pre);
   if(p!=='asperges')s.sprinkled='';
   if(p!=='palm'){s.palm_received='';s.palm_procession='';}
   if(p!=='ash')s.ash_received='';
   if(p!=='candlemas'){s.has_candle='';s.candle_received='';}
   if(norm(s.following)!=='absolution'){s.body='';s.burial='';}
   if(!truth(s.body))s.burial='';
   return s;
 }
 function validateState(input={},opts={}){
   const s=sanitizeState(input),errors=[],warnings=[];
   const rite=norm(s.rite||'ordinary'),following=norm(s.following),pre=norm(s.pre);
   if(rite==='nuptial' && String(s.nuptial_eligibility||'UNRESOLVED').toUpperCase()!=='PERMITTED')errors.push('Resolve Nuptial eligibility before entering the reader.');
   if(s.proper_path && opts.properReady===false)errors.push('The selected Proper has not resolved. Resolve it or clear the Proper selection.');
   if(following==='absolution' && rite!=='requiem')errors.push('Funeral Absolution can only follow a Requiem in this runtime.');
   if(truth(s.pre_done) && !pre)errors.push('A pre-Mass rite is marked as occurring, but no rite is selected.');
   if(truth(s.burial) && !truth(s.body))errors.push('The burial procession branch requires a body to be present.');
   if(rite==='good-friday' && s.form)warnings.push('Good Friday is a distinct rite; the remembered Mass-form setting is ignored.');
   if(rite==='easter-vigil')warnings.push('Easter Vigil uses its own pre-Mass graph and hands into Mass at the Kyrie.');
   if(pre && !truth(s.pre_done))warnings.push('The selected pre-Mass rite is available but is not marked as actually occurring.');
   if(following==='procession')warnings.push('Generic procession ending rules require an explicit procession profile; otherwise the ending remains fail-closed.');
   return {pass:errors.length===0,errors,warnings,state:s};
 }
 function auditPure(){
   const tests={};
   const req=sanitizeState({rite:'requiem',following:'absolution',body:'1',burial:'1'});tests.requiemAbsolutionPreserved=req.following==='absolution'&&req.body==='1'&&req.burial==='1';
   const ord=sanitizeState({rite:'ordinary',following:'absolution',body:'1',burial:'1'});tests.absolutionClearedOutsideRequiem=!ord.following&&!ord.body&&!ord.burial;
   const pre=sanitizeState({rite:'ordinary',pre:'ash',pre_done:'1',sprinkled:'1',palm_received:'1'},'pre');tests.preChangeClearsOccurrenceAndRecipient=!pre.pre_done&&!pre.sprinkled&&!pre.palm_received;
   const gf=sanitizeState({rite:'good-friday',pre:'asperges',pre_done:'1',following:'corpus',participating:'1'});tests.goodFridayIsolation=!gf.pre&&!gf.pre_done&&!gf.following&&!gf.participating;
   const nup=validateState({rite:'nuptial',nuptial_eligibility:'UNRESOLVED'});tests.nuptialBlockedUntilPermitted=!nup.pass&&nup.errors.some(x=>/Nuptial eligibility/.test(x));
   const nupOk=validateState({rite:'nuptial',nuptial_eligibility:'PERMITTED'});tests.nuptialPermittedPass=nupOk.pass;
   const pr=validateState({rite:'ordinary',proper_path:'Sancti/10-07'},{properReady:false});tests.unresolvedProperFailClosed=!pr.pass;
   const burial=validateState({rite:'requiem',following:'absolution',body:'',burial:'1'});tests.burialSanitizedWithoutBody=burial.pass&&burial.state.burial==='';
   return {version:'R15',pass:Object.values(tests).every(Boolean),tests};
 }
 AO.ReleaseHardeningR15=Object.freeze({version:'R15',optionalKeys:Object.freeze([...OPTIONAL_KEYS]),sanitizeState,validateState,auditPure});
 if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id), gate=$('aoFormGate');if(!gate)return;
 function getStored(k,d=''){const p=new URLSearchParams(location.search);if(p.has(k))return p.get(k);try{return localStorage.getItem('ao-r14-'+k)??d}catch(_){return d}}
 function stateFromPage(){return {form:AO.MassProfile?.id||getStored('form','low'),rite:AO.MassProfile?.rite||getStored('rite','ordinary'),pre:getStored('pre',''),pre_done:getStored('pre_done',''),following:getStored('following',''),participating:getStored('participating',''),palm_procession:getStored('palm_procession',''),body:getStored('body',''),burial:getStored('burial',''),mandatum:getStored('mandatum',''),reposition:getStored('reposition',''),nuptial_eligibility:getStored('nuptial_eligibility','UNRESOLVED'),sprinkled:getStored('sprinkled',''),palm_received:getStored('palm_received',''),ash_received:getStored('ash_received',''),has_candle:getStored('has_candle',''),proper_path:getStored('proper_path',''),proper_title:getStored('proper_title',''),proper_type:getStored('proper_type','manual'),gloria_mode:getStored('gloria_mode','auto'),credo_mode:getStored('credo_mode','auto')};}
 function persistKey(k,v){try{const key='ao-r14-'+k;if(v===''||v===false||v==null)localStorage.removeItem(key);else localStorage.setItem(key,String(v))}catch(_){}}
 function writeStateToUrl(state,{setup=true}={}){const u=new URL(location.href);for(const k of OPTIONAL_KEYS.concat(['proper_path','proper_title','proper_type','gloria_mode','credo_mode'])){const v=state[k];if(v===''||v===false||v==null||v==='UNRESOLVED'&&k==='nuptial_eligibility'){u.searchParams.delete(k);persistKey(k,'')}else{u.searchParams.set(k,String(v));persistKey(k,v)}}if(setup)u.searchParams.set('setup','1');else u.searchParams.delete('setup');return u}
 function navigatePatch(patch,changedKey=''){const next=sanitizeState({...stateFromPage(),...patch},changedKey);location.replace(writeStateToUrl(next,{setup:true}).toString())}
 function interceptChange(id,key,read){const e=$(id);if(!e)return;e.addEventListener('change',ev=>{ev.preventDefault();ev.stopImmediatePropagation();navigatePatch({[key]:read?read(e):e.value},key)},{capture:true})}
 function interceptCheck(id,key){interceptChange(id,key,e=>e.checked?'1':'')}
 ['aoR14Pre'].forEach(()=>interceptChange('aoR14Pre','pre'));
 interceptCheck('aoR14PreDone','pre_done');interceptChange('aoR14Following','following');interceptCheck('aoR14Participating','participating');interceptCheck('aoR14PalmProcession','palm_procession');interceptCheck('aoR14Body','body');interceptCheck('aoR14Burial','burial');interceptCheck('aoR14Mandatum','mandatum');interceptCheck('aoR14Reposition','reposition');interceptChange('aoR14NuptialEligibility','nuptial_eligibility');interceptCheck('aoR14Sprinkled','sprinkled');interceptCheck('aoR14PalmReceived','palm_received');interceptCheck('aoR14AshReceived','ash_received');interceptCheck('aoR14HasCandle','has_candle');
 gate.querySelectorAll('[data-ao-form]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();const v=btn.dataset.aoForm;try{localStorage.setItem('ao-mass-profile',v);localStorage.removeItem('ao-mass-form')}catch(_){}const u=writeStateToUrl(stateFromPage(),{setup:true});u.searchParams.set('form',v);u.searchParams.delete('mc_profile');location.replace(u.toString())},{capture:true}));
 gate.querySelectorAll('[data-ao-rite]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();const r=btn.dataset.aoRite||'ordinary';try{localStorage.setItem('ao-mass-rite',r)}catch(_){}let next=sanitizeState({...stateFromPage(),rite:r},'rite');const u=writeStateToUrl(next,{setup:true});if(r==='ordinary')u.searchParams.delete('rite');else u.searchParams.set('rite',r);if(r!=='requiem'){u.searchParams.delete('candles');try{localStorage.removeItem('ao-requiem-candles')}catch(_){}}location.replace(u.toString())},{capture:true}));
 const resolveBtn=$('aoR14ResolveProper');resolveBtn?.addEventListener('click',async ev=>{ev.preventDefault();ev.stopImmediatePropagation();const path=$('aoR14ProperPath')?.value.trim()||'',status=$('aoR14ProperStatus');if(!path){if(status)status.textContent='Enter a Proper path.';return}if(status)status.textContent='Resolving Proper…';try{const packet=await AO.ProperResolverR09.resolve({path,name:$('aoR14ProperTitle')?.value.trim()||path,celebrationType:$('aoR14ProperType')?.value||'manual',gloriaMode:$('aoR14GloriaMode')?.value||'auto',credoMode:$('aoR14CredoMode')?.value||'auto'});const next={...stateFromPage(),proper_path:path,proper_title:packet.proper?.name||$('aoR14ProperTitle')?.value||path,proper_type:$('aoR14ProperType')?.value||'manual',gloria_mode:$('aoR14GloriaMode')?.value||'auto',credo_mode:$('aoR14CredoMode')?.value||'auto'};location.replace(writeStateToUrl(next,{setup:true}).toString())}catch(e){if(status)status.textContent='Proper resolution failed closed: '+(e?.message||e)}},{capture:true});
 function labelFor(id){return $(id)?.closest('label')||$(id)?.parentElement}
 const relevance={
  aoR14PreDone:()=>!!getStored('pre',''),
  aoR14Participating:()=>['corpus','procession'].includes(norm(getStored('following','')))||['palm','rogation'].includes(norm(getStored('pre',''))),
  aoR14PalmProcession:()=>norm(getStored('pre',''))==='palm',
  aoR14Body:()=>AO.MassProfile?.rite==='requiem'&&norm(getStored('following',''))==='absolution',
  aoR14Burial:()=>AO.MassProfile?.rite==='requiem'&&norm(getStored('following',''))==='absolution'&&truth(getStored('body','')),
  aoR14Mandatum:()=>AO.MassProfile?.rite==='holy-thursday',
  aoR14Reposition:()=>AO.MassProfile?.rite==='holy-thursday',
  aoR14NuptialEligibility:()=>AO.MassProfile?.rite==='nuptial',
  aoR14Sprinkled:()=>norm(getStored('pre',''))==='asperges',
  aoR14PalmReceived:()=>norm(getStored('pre',''))==='palm',
  aoR14AshReceived:()=>norm(getStored('pre',''))==='ash',
  aoR14HasCandle:()=>norm(getStored('pre',''))==='candlemas'
 };
 for(const [id,fn] of Object.entries(relevance)){const el=labelFor(id);if(el)el.dataset.r15Hidden=fn()?'false':'true'}
 if(['good-friday','easter-vigil'].includes(AO.MassProfile?.rite)){const l=labelFor('aoR14Pre');if(l)l.dataset.r15Hidden='true';const f=labelFor('aoR14Following');if(f)f.dataset.r15Hidden='true'}
 gate.classList.toggle('r15-good-friday',AO.MassProfile?.rite==='good-friday');
 gate.querySelectorAll('[data-ao-form]').forEach(b=>b.classList.toggle('ao-r15-selected',b.dataset.aoForm===AO.MassProfile?.id));gate.querySelectorAll('[data-ao-rite]').forEach(b=>b.classList.toggle('ao-r15-selected',b.dataset.aoRite===(AO.MassProfile?.rite||'ordinary')));
 const sub=gate.querySelector('.ao-form-sub');if(sub)sub.textContent='Choose what is actually being celebrated. Optional rites and personal states appear only when they are relevant; changes stay inside setup until you enter the reader.';
 const formHeading=gate.querySelector('.ao-form-heading');if(formHeading&&AO.MassProfile?.rite==='easter-vigil')formHeading.textContent='MASS PHASE FORM';
 let distinct=gate.querySelector('.ao-r15-distinct-note');if(!distinct){distinct=document.createElement('div');distinct.className='ao-r15-distinct-note';distinct.textContent='Good Friday is a distinct rite. The ordinary Mass-form selector is not used.';formHeading?.before(distinct)}
 const advanced=$('aoR14Advanced');
 let summary=gate.querySelector('.ao-r15-summary');if(!summary){summary=document.createElement('div');summary.className='ao-r15-summary';advanced?.before(summary)}
 const validation=validateState(stateFromPage(),{properReady:!AO.R09State?.requestedPath||AO.R09State?.ready});const prettyForm=AO.MassProfile?.rite==='good-friday'?'— distinct rite':(AO.MassProfile?.id||'—');const bits=[`<b>Current setup</b>`,`<div class="ao-r15-line">${(AO.MassProfile?.rite||'ordinary').replaceAll('-',' ')} · ${prettyForm}</div>`];if(AO.R09State?.requestedPath)bits.push(`<div class="ao-r15-line">Proper: ${AO.R09State?.packet?.proper?.name||AO.R09State.requestedPath}${AO.R09State.ready?' ✓':' · unresolved'}</div>`);if(getStored('pre',''))bits.push(`<div class="ao-r15-line">Before Mass: ${getStored('pre','')}${truth(getStored('pre_done',''))?' · occurs':' · not activated'}</div>`);if(getStored('following',''))bits.push(`<div class="ao-r15-line">After Mass: ${getStored('following','')}</div>`);if(validation.warnings.length)bits.push(`<div class="ao-r15-warning">${validation.warnings.join(' ')}</div>`);if(validation.errors.length)bits.push(`<div class="ao-r15-error">${validation.errors.join(' ')}</div>`);summary.innerHTML=bits.join('');
 const properPath=$('aoR14ProperPath');if(properPath&&!properPath.getAttribute('list')){const dl=document.createElement('datalist');dl.id='aoR15ProperHints';['Votive/Matrimonium','Votive/Defunctorum','Votive/Cross'].forEach(v=>{const o=document.createElement('option');o.value=v;dl.append(o)});properPath.setAttribute('list',dl.id);properPath.after(dl);const tools=document.createElement('div');tools.className='ao-r15-proper-tools';tools.innerHTML='<button type="button" data-r15-proper="Votive/Matrimonium">Nuptial Proper</button><button type="button" data-r15-clear-proper>Use calendar / current fixture</button>';properPath.closest('label')?.after(tools);tools.querySelector('[data-r15-proper]')?.addEventListener('click',()=>{properPath.value='Votive/Matrimonium';$('aoR14ProperTitle').value='Mass for Bridegroom and Bride';$('aoR14ProperType').value='nuptial'});tools.querySelector('[data-r15-clear-proper]')?.addEventListener('click',()=>{const next={...stateFromPage(),proper_path:'',proper_title:'',proper_type:'manual',gloria_mode:'auto',credo_mode:'auto'};try{for(const k of ['proper_path','proper_title','proper_type','gloria_mode','credo_mode'])localStorage.removeItem('ao-r14-'+k)}catch(_){}location.replace(writeStateToUrl(next,{setup:true}).toString())})}
 let actions=gate.querySelector('.ao-r15-actions');if(!actions){actions=document.createElement('div');actions.className='ao-r15-actions';actions.innerHTML='<button type="button" data-r15-reset>Reset optional rites</button><button type="button" class="ao-r15-enter" data-r15-enter>Enter reader</button>';gate.querySelector('.ao-form-panel')?.append(actions)}
 const enter=actions.querySelector('[data-r15-enter]');enter.disabled=!validation.pass;enter.title=validation.pass?'Enter the resolved reader':validation.errors.join(' ');enter.addEventListener('click',()=>{if(!validation.pass)return;const u=writeStateToUrl(sanitizeState(stateFromPage()),{setup:false});location.replace(u.toString())});actions.querySelector('[data-r15-reset]')?.addEventListener('click',()=>{const next={...stateFromPage()};for(const k of OPTIONAL_KEYS)next[k]='';next.nuptial_eligibility='UNRESOLVED';location.replace(writeStateToUrl(next,{setup:true}).toString())});
 const p=new URLSearchParams(location.search);if(p.get('setup')==='1'){gate.classList.add('open');gate.setAttribute('aria-hidden','false')}
 if(AO.MassProfile?.rite==='good-friday'){const pill=$('aoProfilePill');if(pill)pill.textContent='GOOD FRIDAY';const h=$('canonicalMassHeading');if(h)h.textContent='Good Friday · Solemn Afternoon Liturgy';document.title='Ad Orientem · v1.76 · Good Friday'}else document.title=document.title.replace('v1.75','v1.76');
 const cert=gate.querySelector('.ao-form-cert');if(cert)cert.textContent='R15 · release hardening · integrated R07–R13 runtime';
 function runtimeAudit(){const pure=auditPure(),r14=AO.R14Audit?.run?.(),cross=AO.CrossFormAudit?.run?.(),ids=[...document.querySelectorAll('[id]')].map(x=>x.id),duplicateIds=ids.filter((x,i)=>ids.indexOf(x)!==i);const tests={pure:!!pure.pass,r14:!r14||!!r14.pass,crossForm:!cross||!!cross.pass,oneActiveCard:document.querySelectorAll('#reader .mass-card.is-active').length<=1,duplicateIds:duplicateIds.length===0,goodFridayNoMassCards:AO.MassProfile?.rite!=='good-friday'||document.querySelectorAll('#reader [data-block^="AO.SM.B"]').length===0,nuptialEntryGuard:AO.MassProfile?.rite!=='nuptial'||String(AO.Calendar?.context?.nuptialEligibility)==='PERMITTED'||document.querySelectorAll('#reader [data-block^="AO.SM.B"]').length===0};return {version:'v1.76-R15',pass:Object.values(tests).every(Boolean),tests,pure,duplicateIds,rite:AO.MassProfile?.rite,form:AO.MassProfile?.id,proper:AO.R09State?.requestedPath||null,browserCertification:'NOT_CLAIMED_IN_CONTAINER'}}
 AO.R15Audit=Object.freeze({run:runtimeAudit});setTimeout(()=>{const a=runtimeAudit();document.documentElement.dataset.aoR15=a.pass?'pass':'fail'},350);
})();
