
(()=>{
  AO.Cinematics=AO.Cinematics||{};
  const q=s=>document.querySelector(s), body=document.body, reader=q('#reader');
  const cinema=q('#canonArcCinema'), kicker=q('#canonArcKicker'), title=q('#canonArcTitle'), sub=q('#canonArcSub');
  if(!reader||!cinema)return;
  const STATE_CLASSES=['ao-sanctus-closing','ao-canon-silence','ao-consecration-words','ao-elevation-window','ao-canon-after','ao-canon-conclusion','ao-pater-reopen'];
  let lastMacro='',lastCue='',arcTimer=0,voiceTimer=0,scheduled=false;
  const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function active(){return reader.querySelector('.mass-card.is-active .flow-unit.active')||reader.querySelector('.flow-unit.active')}
  function clearStates(){STATE_CLASSES.forEach(c=>body.classList.remove(c))}
  function showArc(phase,k,t,s,ms=1900){
    if(body.classList.contains('part-transition')||body.classList.contains('ritual-event-active'))return;
    clearTimeout(arcTimer);cinema.dataset.phase=phase||'canon';kicker.textContent=k||'';title.textContent=t||'';sub.textContent=s||'';
    cinema.classList.remove('show');void cinema.offsetWidth;cinema.classList.add('show');cinema.setAttribute('aria-hidden','false');
    arcTimer=setTimeout(()=>{cinema.classList.remove('show');cinema.setAttribute('aria-hidden','true')},reduced()?850:ms);
  }
  function phaseFor(macro,cue){
    if(macro==='AO.SM.M13')return 'sanctus';
    if(macro==='AO.SM.M14')return 'canon';
    if(macro==='AO.SM.M15'||macro==='AO.SM.M16'){
      if(cue==='AO.SM.C0173'||cue==='AO.SM.C0179')return 'words';
      if(cue==='AO.SM.C0174'||cue==='AO.SM.C0181')return 'elevation';
      return 'consecration';
    }
    if(macro==='AO.SM.M17')return 'after';
    if(macro==='AO.SM.M18')return 'conclusion';
    if(macro==='AO.SM.M19')return 'pater';
    return '';
  }
  function apply(){
    scheduled=false;const el=active();if(!el)return;const macro=el.dataset.macro||'',cue=el.dataset.cue||'',phase=phaseFor(macro,cue);
    clearStates();
    if(phase==='sanctus'){
      const kind=(q('#scholaStreamKind')?.textContent||'').toUpperCase(),pause=(q('#scholaStreamPause')?.textContent||'').toUpperCase();
      if(/HOLD|COMPLETE/.test(kind+' '+pause))body.classList.add('ao-sanctus-closing');
    } else if(phase==='canon'||phase==='consecration') body.classList.add('ao-canon-silence');
    else if(phase==='words') body.classList.add('ao-canon-silence','ao-consecration-words');
    else if(phase==='elevation') body.classList.add('ao-canon-silence','ao-elevation-window');
    else if(phase==='after') body.classList.add('ao-canon-after');
    else if(phase==='conclusion') body.classList.add('ao-canon-conclusion');
    else if(phase==='pater') body.classList.add('ao-pater-reopen');

    if(macro!==lastMacro){
      if(macro==='AO.SM.M14')showArc('canon','CANON','SACRED SILENCE','The public chant recedes. The Canon is prayed in a low voice.',2200);
      if(macro==='AO.SM.M19'){
        showArc('pater','COMMUNION RITE','PATER NOSTER','Public prayer resumes.',1850);
        body.classList.add('ao-public-voice-return');clearTimeout(voiceTimer);voiceTimer=setTimeout(()=>body.classList.remove('ao-public-voice-return'),1700);
      }
    }
    lastMacro=macro;lastCue=cue;
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
  const obs=new MutationObserver(schedule);obs.observe(reader,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  for(const n of [q('#scholaStreamKind'),q('#scholaStreamPause'),q('#actionDisplay'),q('#voiceText')])if(n)new MutationObserver(schedule).observe(n,{childList:true,subtree:true,characterData:true,attributes:true});
  window.addEventListener('ao:part-mounted',schedule);
  requestAnimationFrame(()=>requestAnimationFrame(apply));
})();
