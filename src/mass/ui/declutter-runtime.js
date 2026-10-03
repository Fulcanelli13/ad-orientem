
(()=>{
  AO.EventSurfaces=AO.EventSurfaces||{version:'2.0',owner:'TRANSIENT_RITUAL_EVENTS'};
  AO.Cinematics=AO.Cinematics||{};
  const q=s=>document.querySelector(s);
  const cinema=q('#ritualEventCinema'), icon=q('#ritualEventIcon'), label=q('#ritualEventLabel'), detail=q('#ritualEventDetail');
  if(!cinema)return;
  let cinemaTimer=0,bellTimer=0,lastBell='',lastAction='',lastCinema='';
  const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function cloneIcon(from){return from?.innerHTML||''}
  function hideCinema(){clearTimeout(cinemaTimer);cinema.classList.remove('show');cinema.setAttribute('aria-hidden','true');document.body.classList.remove('ritual-event-active');}
  function showCinema(kind,main,sub,html,ms=1650){
    if(document.body.classList.contains('part-transition'))return;
    const sig=`${kind}|${main}|${sub}`;if(sig===lastCinema&&cinema.classList.contains('show'))return;lastCinema=sig;
    clearTimeout(cinemaTimer);cinema.dataset.kind=kind||'event';label.textContent=main||'';detail.textContent=sub||'';icon.innerHTML=html||'';
    cinema.classList.remove('show');void cinema.offsetWidth;cinema.classList.add('show');cinema.setAttribute('aria-hidden','false');document.body.classList.add('ritual-event-active');
    cinemaTimer=setTimeout(()=>{hideCinema();lastCinema=''},reduced()?900:ms);
  }
  window.__AO_EVENT_CINEMA=showCinema;AO.Cinematics.Event=Object.freeze({show:showCinema});

  // Bell is an event, never a waiting card or DOM state relay. Delay lets a simultaneous elevation win.
  function bellIconHtml(){const r=window.aoResolveIconRef?.('SEM:SOUND.ALTAR_BELLS');return r?.src?`<img class="asset-icon" src="${r.src}" alt="">`:''}
  window.addEventListener('ao:bell',ev=>{const d=ev.detail||{},sig=`${d.cue||''}|${d.label||''}|${d.detail||''}`;if(!sig||sig===lastBell)return;lastBell=sig;clearTimeout(bellTimer);bellTimer=setTimeout(()=>showCinema('bell',d.label||'ALTAR BELL',d.detail||'',bellIconHtml(),1350),150)});

  // Only genuinely major ceremonial actions get a cinematic. Routine actions stay in the action ribbon and disappear when finished.
  const actionBox=q('#sectionAction'),actionText=q('#actionDisplay'),actionIcon=q('#priestActionIcon');
  function majorActionSpec(txt){
    const t=String(txt||'').trim().toUpperCase();
    if(t==='ELEVATES HOST')return ['elevation','ELEVATION','SACRED HOST',1950];
    if(t==='ELEVATES CHALICE')return ['elevation','ELEVATION','PRECIOUS BLOOD',1950];
    if(t==='MINOR ELEVATION')return ['elevation','MINOR ELEVATION','CANON CONCLUSION',1750];
    if(t==='SHOWS SACRED HOST')return ['elevation','ECCE AGNUS DEI','BEHOLD THE LAMB OF GOD',1750];
    if(t==='BLESSES PEOPLE')return ['blessing','BLESSING','FINAL BLESSING',1600];
    return null;
  }
  function syncAction(){
    const txt=(actionText?.textContent||'').trim();if(!txt||txt==='—'||actionBox?.classList.contains('empty')){lastAction='';return}
    if(txt===lastAction)return;lastAction=txt;const spec=majorActionSpec(txt);if(!spec)return;
    clearTimeout(bellTimer);const [kind,main,sub,ms]=spec;showCinema(kind,main,sub,cloneIcon(actionIcon),ms);
  }
  if(actionBox&&window.MutationObserver)new MutationObserver(syncAction).observe(actionBox,{attributes:true,childList:true,subtree:true,characterData:true});

  // Ordinary audible priest speech is the default and does not deserve permanent chrome. Exceptional voice states do.
  const voiceCard=q('#voiceCard'),voiceText=q('#voiceText');
  function syncVoice(){
    const t=(voiceText?.textContent||'').trim().toUpperCase();const normal=!t||t==='—'||['AUDIBLE','CLEAR','CLEAR · LOCAL','SUNG · CLEAR'].includes(t);
    voiceCard?.classList.toggle('declutter-normal-voice',normal);
  }
  if(voiceCard&&window.MutationObserver)new MutationObserver(syncVoice).observe(voiceCard,{childList:true,subtree:true,characterData:true});

  // Remove duplicate Schola labels: the box itself already tells us it is the Schola, Latin is the default, and PAUSE button already implies LIVE.
  const scholaTitle=q('#scholaTitleText'),scholaKind=q('#scholaStreamKind'),scholaPause=q('#scholaStreamPause');
  let scholaGuard=false;
  function syncScholaChrome(){
    if(scholaGuard)return;scholaGuard=true;
    if(scholaTitle&&/^SCHOLA\s*·\s*/.test(scholaTitle.textContent||''))scholaTitle.textContent=(scholaTitle.textContent||'').replace(/^SCHOLA\s*·\s*/, '');
    if(scholaKind)scholaKind.classList.toggle('declutter-redundant',(scholaKind.textContent||'').trim()==='LATIN');
    if(scholaPause)scholaPause.classList.toggle('declutter-redundant',(scholaPause.textContent||'').trim()==='LIVE');
    scholaGuard=false;
  }
  for(const n of [scholaTitle,scholaKind,scholaPause])if(n&&window.MutationObserver)new MutationObserver(syncScholaChrome).observe(n,{childList:true,subtree:true,characterData:true});

  // Gesture surface: NOW/NEXT is the state; the gesture name belongs in the content, not twice in tag + content.
  const gestureCard=q('#gestureCard');
  function syncGestureLabel(){
    if(!gestureCard)return;const tag=gestureCard.querySelector('.tag');if(!tag)return;
    if(gestureCard.classList.contains('gesture-motion-now')&&tag.textContent!=='NOW')tag.textContent='NOW';
    else if(gestureCard.classList.contains('gesture-motion-preview')&&tag.textContent!=='NEXT')tag.textContent='NEXT';
  }
  if(gestureCard&&window.MutationObserver)new MutationObserver(syncGestureLabel).observe(gestureCard,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true});

  // Initialise after the canonical runtime has mounted its first state.
  requestAnimationFrame(()=>{syncAction();syncVoice();syncScholaChrome();syncGestureLabel()});
})();
