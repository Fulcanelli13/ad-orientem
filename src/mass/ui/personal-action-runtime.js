
(()=>{
  'use strict';
  const AO=window.AO=window.AO||{};
  const q=s=>document.querySelector(s);
  const prompt=q('#personalActionPrompt'),layer=q('#personalRecollection'),returnBtn=q('#personalRecollectionReturn');
  if(!prompt||!layer||!returnBtn)return;

  const data=AO.LiturgicalData?.data||{};
  const faithfulCommunion=data.profileFlags?.FAITHFUL_COMMUNION!==false;
  const state={
    phase:'IDLE',          // IDLE | AVAILABLE | RECOLLECTION | COMPLETE
    macro:'',
    cue:'',
    received:false,
    recollecting:false,
    completed:false
  };

  function setIcon(node){
    if(!node)return;
    try{node.innerHTML=typeof assetImg==='function'?(assetImg('SEM:ACTION.COMMUNION','section-icon')||''):'✠'}
    catch(_){node.textContent='✠'}
  }
  setIcon(q('#personalActionIcon'));setIcon(q('#personalRecollectionIcon'));

  function responseActive(){const x=q('#responseCard');return !!x&&!x.classList.contains('off')}
  function gestureActive(){const x=q('#gestureCard');return !!x&&!x.classList.contains('off')}
  function sacredActionActive(){
    const b=document.body;
    return b.classList.contains('ritual-event-active')||
      b.classList.contains('canon-elevation-host')||
      b.classList.contains('canon-elevation-chalice')||
      b.classList.contains('ao-consecration-host')||
      b.classList.contains('ao-consecration-chalice');
  }
  function scholaActive(){return document.body.classList.contains('schola-visible')}
  function attentionOwner(){
    if(responseActive())return 'RESPOND';
    if(state.recollecting)return 'PERSONAL_ACTION';
    if(sacredActionActive())return 'SACRED_ACTION';
    if(gestureActive())return 'GESTURE';
    if(scholaActive())return 'SCHOLA';
    return 'READING';
  }
  function syncAttention(){
    const owner=attentionOwner();
    document.body.dataset.attentionOwner=owner;
    return owner;
  }

  function publish(reason){
    syncAttention();
    window.dispatchEvent(new CustomEvent('ao:personal-action-changed',{detail:{
      reason,phase:state.phase,macro:state.macro,cue:state.cue,
      received:state.received,recollecting:state.recollecting,completed:state.completed,
      attentionOwner:document.body.dataset.attentionOwner||'READING'
    }}));
  }

  function positionPrompt(){
    const dock=q('#scholaDock');
    let bottom=58;
    if(dock?.classList.contains('show')){
      const r=dock.getBoundingClientRect();
      if(r.height>0&&r.top<window.innerHeight)bottom=Math.ceil(window.innerHeight-r.top+14);
    }
    prompt.style.bottom=`${bottom}px`;
  }
  function setPromptVisible(on){
    const show=!!on&&faithfulCommunion&&!state.received&&!state.completed&&!state.recollecting;
    positionPrompt();
    prompt.classList.toggle('show',show);
    prompt.setAttribute('aria-hidden',show?'false':'true');
    prompt.tabIndex=show?0:-1;
  }

  function applyFocus(detail={}){
    state.macro=detail.macro||state.macro||'';
    state.cue=detail.cue||state.cue||'';
    const available=faithfulCommunion&&state.macro==='AO.SM.M25'&&!state.received&&!state.completed;
    if(state.recollecting){
      state.phase='RECOLLECTION';
      setPromptVisible(false);
    }else if(available){
      state.phase='AVAILABLE';
      setPromptVisible(true);
    }else if(!state.completed){
      state.phase='IDLE';
      setPromptVisible(false);
    }else{
      setPromptVisible(false);
    }
    publish('FOCUS');
  }

  function openRecollection(){
    if(!faithfulCommunion||state.completed)return;
    state.received=true;
    state.recollecting=true;
    state.phase='RECOLLECTION';
    setPromptVisible(false);
    layer.classList.add('open');
    layer.setAttribute('aria-hidden','false');
    document.body.classList.add('personal-recollection-open');
    publish('COMMUNION_RECEIVED');
    requestAnimationFrame(()=>returnBtn.focus({preventScroll:true}));
  }

  function closeRecollection(){
    if(!state.recollecting)return;
    state.recollecting=false;
    state.completed=true;
    state.phase='COMPLETE';
    layer.classList.remove('open');
    layer.setAttribute('aria-hidden','true');
    document.body.classList.remove('personal-recollection-open');
    publish('RECOLLECTION_COMPLETE');
    const active=q('#reader .mass-card.is-active .flow-unit.active');
    (active||q('#formationTrigger')||document.body).focus?.({preventScroll:true});
  }

  prompt.addEventListener('click',openRecollection);
  returnBtn.addEventListener('click',closeRecollection);
  layer.addEventListener('pointerdown',e=>{if(e.target===layer)e.stopPropagation()});

  window.addEventListener('ao:focus-unit-changed',e=>applyFocus(e.detail||{}));
  window.addEventListener('keydown',e=>{
    if(!state.recollecting)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeRecollection();return}
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End','j','J','k','K'].includes(e.key)){
      e.preventDefault();e.stopImmediatePropagation();
    }
  },true);

  // Keep attention priority synchronized with existing transient response/gesture/Schola surfaces.
  const attentionTargets=[q('#responseCard'),q('#gestureCard'),q('#scholaDock')].filter(Boolean);
  if(window.MutationObserver){
    const mo=new MutationObserver(()=>{syncAttention();positionPrompt()});
    attentionTargets.forEach(node=>mo.observe(node,{attributes:true,attributeFilter:['class','aria-hidden']}));
  }
  window.addEventListener('resize',positionPrompt,{passive:true});

  // Initial state if the first focus event fired before this module mounted.
  const active=q('#reader .mass-card.is-active .flow-unit.active');
  if(active)applyFocus({macro:active.dataset.macro||'',cue:active.dataset.cue||''});
  else syncAttention();

  AO.PersonalAction=Object.freeze({
    version:'2.4.0',
    priority:['RESPOND','PERSONAL_ACTION','SACRED_ACTION','GESTURE','SCHOLA','READING'],
    getState:()=>({...state,attentionOwner:document.body.dataset.attentionOwner||'READING'}),
    confirmCommunion:openRecollection,
    returnToMass:closeRecollection
  });
})();
