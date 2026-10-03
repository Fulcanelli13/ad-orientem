
(()=>{
  const q=s=>document.querySelector(s),body=document.body;
  body.dataset.ui='modern-v23';
  let chromeTimer=null,navTimer=null,readingTimer=null;
  function wakeChrome(){body.classList.remove('chrome-idle');body.classList.add('nav-awake');clearTimeout(chromeTimer);clearTimeout(navTimer);chromeTimer=setTimeout(()=>body.classList.add('chrome-idle'),2400);navTimer=setTimeout(()=>body.classList.remove('nav-awake'),1700)}
  function readingMotion(){body.classList.add('reading-motion');body.classList.remove('nav-awake');clearTimeout(readingTimer);readingTimer=setTimeout(()=>body.classList.remove('reading-motion'),380);clearTimeout(chromeTimer);chromeTimer=setTimeout(()=>body.classList.add('chrome-idle'),900)}
  ['pointermove','pointerdown','focusin'].forEach(ev=>window.addEventListener(ev,wakeChrome,{passive:true}));window.addEventListener('keydown',wakeChrome);document.addEventListener('wheel',readingMotion,{passive:true});document.addEventListener('touchmove',readingMotion,{passive:true});
  const pulseTimers=new WeakMap();
  function pulse(node,duration=1500){if(!node)return;node.classList.add('just-changed');const prior=pulseTimers.get(node);if(prior)clearTimeout(prior);pulseTimers.set(node,setTimeout(()=>node.classList.remove('just-changed'),duration))}
  function watchText(textSel,ownerSel,duration){const t=q(textSel),owner=q(ownerSel);if(!t||!owner)return;let last=t.textContent;new MutationObserver(()=>{const now=t.textContent;if(now!==last){last=now;pulse(owner,duration)}}).observe(t,{subtree:true,characterData:true,childList:true})}
  watchText('#postureText','#postureCard',1350);watchText('#voiceText','#voiceCard',1500);watchText('#stationText','.priest-position',1450);watchText('#actionDisplay','#sectionAction',1600);
  ['#gestureCard','#responseCard'].forEach(sel=>{const el=q(sel);if(!el)return;let wasOff=el.classList.contains('off');new MutationObserver(()=>{const off=el.classList.contains('off');if(wasOff&&!off)pulse(el,2000);wasOff=off}).observe(el,{attributes:true,attributeFilter:['class']})});
  const reader=q('#reader');if(reader){new MutationObserver(()=>reader.querySelectorAll('.mass-card').forEach(card=>{if(card.dataset.v23Bound)return;card.dataset.v23Bound='1';card.addEventListener('scroll',readingMotion,{passive:true})})).observe(reader,{childList:true,subtree:true})}
  window.addEventListener('keydown',e=>{if(e.altKey&&e.shiftKey&&String(e.key).toLowerCase()==='q')body.classList.toggle('qa-mode')});
  wakeChrome();setTimeout(()=>body.classList.add('chrome-idle'),2600);
})();

(()=>{
  const q=s=>document.querySelector(s),AO=window.AO||{};
  const trigger=q('#formationTrigger'),sheet=q('#formationSheet'),panel=q('#formationPanel'),close=q('#formationClose');if(!trigger||!sheet||!panel||!close)return;
  const data=AO.LiturgicalData?.data||{};
  const macros=new Map((data.macros||[]).map(m=>[m.Macro_ID,m]));
  const special={
   'AO.SM.M03':{what:'The celebrant has intoned the opening of the Gloria; the public hymn is then carried by the Schola while the priest may continue on his own quieter track.',why:'The Gloria is a single public hymn of praise even when priest and choir are not word-for-word synchronized.',deep:'At sung Mass the priest and choir can occupy different points of the same Ordinary text. The public sung text is therefore the safer congregational clock after the intonation.'},
   'AO.SM.M09':{what:'The Creed is being professed publicly. The Schola carries the sung text after the celebrant’s intonation, with the Incarnatus receiving its own posture-sensitive cue.',why:'The Creed is both profession of faith and liturgical action; the Incarnation clause is marked bodily rather than treated as ordinary reading.',deep:'The app separates the textual cue from local/customary posture logic. Ordinary posture and the Christmas/Annunciation exception are resolved at runtime rather than hard-coded into the prayer text.'},
   'AO.SM.M11':{what:'The public Orate fratres and its response lead into the Secret, which the priest says quietly while the Offertory music may still be finishing.',why:'This is a transition from audible congregational exchange into quiet priestly prayer; forcing both onto one text clock creates false synchronization.',deep:'The harmonized Schola window is allowed to continue through the Secret entry when the chant is still sounding, while the priest’s quiet prayer remains a separate concurrent track.'},
   'AO.SM.M14':{what:'The Canon has begun. The priest prays in the traditional low voice; sacred silence and visible liturgical action now matter more than keeping pace with every word.',why:'The centre of attention shifts from public textual following toward interior participation in the Eucharistic Sacrifice.',deep:'The reader still preserves the Canon text in Missal mode, but Live mode treats bells, posture and visible sacred actions as higher-salience landmarks.'},
   'AO.SM.M15':{what:'The Consecration of the Sacred Host is the controlling sacred action. The visible elevation has priority over every secondary track.',why:'This is one of the decisive sacramental moments of the Mass, so the interface deliberately suppresses competing informational noise.',deep:'The focus resolver changes state only when the authoritative cue changes; scrolling itself does not repeatedly retrigger the elevation presentation.'},
   'AO.SM.M16':{what:'The Consecration of the Chalice is the controlling sacred action. The elevation remains the principal visible landmark.',why:'The reader gives sacramental action priority over explanatory or concurrent text at this point.',deep:'Bell cues and elevation presentation are event surfaces, not permanent boxes; they appear only at their exact canonical landmarks.'},
   'AO.SM.M25':{what:'Holy Communion is being distributed to the faithful. Until it is personally your turn, the Communion chant and visible distribution can orient you.',why:'Your own reception of Holy Communion is a personal liturgical action. When you confirm that you have received, the reader yields to a private recollection surface without pausing or rewriting the Mass.',deep:'Personal Action is layered over the universal Mass timeline rather than inserted into it. The app never guesses when your turn occurs; your confirmation creates only a private state, while the Schola and Mass state continue underneath.'},
   'AO.SM.M30':{what:'The Last Gospel is proclaimed publicly at the Gospel side. The Incarnation clause has its own genuflection cue.',why:'The rite closes with a final proclamation of the Word made flesh, marked by a bodily act at Et Verbum caro factum est.',deep:'The genuflection cue is anchored to the actual Incarnation words, not to the start of the Gospel or a generic section timer.'}
  };
  let snapshot=null,lastFocus=null;
  window.addEventListener('ao:focus-unit-changed',e=>{lastFocus=e.detail||lastFocus});
  function currentMacroId(){return q('#reader .mass-card.is-active .flow-unit.active')?.dataset.macro||lastFocus?.macro||q('#reader .mass-card.is-active')?.dataset.macro||''}
  function safeText(v,fallback='—'){const x=String(v||'').trim();return x||fallback}
  function populate(){
    const id=currentMacroId(),m=macros.get(id)||{},x=special[id]||{};
    q('#formationTitle').textContent=safeText(m.Moment,q('#guideCopy')?.textContent||'Mass context');
    q('#formationWhat').textContent=x.what||`The rite is presently in ${safeText(m.Moment,'this part of the Mass')}. The focused unit in the reader is the authoritative live cue.`;
    q('#formationDo').textContent=safeText(m.Guide_Copy_EN,'Follow the posture, gesture and response cues only when they become active.');
    q('#formationWhy').textContent=x.why||'This part belongs to the continuous action of the Mass; the reader keeps explanation subordinate to prayer and the current liturgical cue.';
    q('#formationActors').textContent=safeText(m.Concurrency_Rule,'Follow the currently authoritative public, visible or personal cue rather than trying to synchronize every actor at once.');
    q('#formationDeepCopy').textContent=x.deep||'This context layer is deliberately separate from the live reader. It explains the structure without adding permanent prose or changing the canonical Mass timeline.';
    q('#formationDeeper').open=false;
  }
  function activeCard(){return q('#reader .mass-card.is-active')}
  function open(){
    const card=activeCard(),active=q('#reader .mass-card.is-active .flow-unit.active');snapshot={card,scrollTop:card?.scrollTop||0,cue:active?.dataset.cue||'',macro:active?.dataset.macro||'',focused:document.activeElement};
    populate();sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');document.body.classList.add('formation-open');close.focus({preventScroll:true});
  }
  function shut(){
    if(!sheet.classList.contains('open'))return;sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');document.body.classList.remove('formation-open');
    const snap=snapshot;snapshot=null;if(snap?.card&&snap.card.isConnected){const old=snap.card.style.scrollBehavior;snap.card.style.scrollBehavior='auto';snap.card.scrollTop=snap.scrollTop;requestAnimationFrame(()=>{snap.card.scrollTop=snap.scrollTop;snap.card.style.scrollBehavior=old})}
    (snap?.focused?.isConnected?snap.focused:trigger).focus({preventScroll:true});
  }
  trigger.addEventListener('click',open);trigger.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});close.addEventListener('click',shut);sheet.addEventListener('pointerdown',e=>{if(e.target===sheet)shut()});panel.addEventListener('pointerdown',e=>e.stopPropagation());
  window.addEventListener('keydown',e=>{if(!sheet.classList.contains('open'))return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();shut();return}if(['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(e.key)){e.stopImmediatePropagation()}},true);
  AO.Formation=Object.freeze({version:'2.3.0',open,close:shut,currentMacro:currentMacroId});
})();
