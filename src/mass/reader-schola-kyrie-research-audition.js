// Explicitly opened, zero-cost melody audition of a PROVISIONAL research source.
// Never promotes the score into the Schola dock, observes a choir, or moves a Mass cue.
import {offlineKyrialeResearchScore} from './reader-kyriale-research-gabc.js';
import {createOfflineChantEngraver,loadOfflineExsurge} from './reader-chant-engraver.js';
import {compileExsurgeGabcResearchMelody} from './reader-schola-exsurge-gabc-melody.js';
import {scholaGabcSyllables,mapScholaSvgLyrics} from './reader-schola-notation-follow.js';
import {compileGabcMelody,scheduleGabcMelody} from './reader-schola-gabc-melody.js';
import {createExsurgeNoteheadFollower} from './reader-schola-exsurge-notehead-follow.js';
import {
  ORDINARY_M54_RESEARCH_SOURCES,compileOrdinaryM54ResearchMelody,
  eligibleOrdinaryM54ResearchSource
} from './reader-schola-ordinary-research-melody.js';
import {
  PROPER_RESEARCH_SOURCES,compileProperM59ResearchMelody,
  eligibleProperM59ResearchSource
} from './reader-schola-proper-research-melody.js';

const SUNG=new Set(['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN']);
const REPEATS=Object.freeze([0,0,0,1,1,1,2,2,3]);
// These four transcriptions were source-pinned and proven to render in M48.
// Their ninefold melody schedules remain PROVISIONAL RESEARCH, not chant approval.
export const ADDITIONAL_KYRIE_RESEARCH_SOURCES=Object.freeze([
  Object.freeze({settingId:'MASS_01',title:'Kyrie I',scoreId:'GREGOBASE-1143',
    fingerprint:'1d935709',phraseNoteCounts:Object.freeze([15,21,20,23]),sourceNotes:79,performanceNotes:171}),
  Object.freeze({settingId:'MASS_08',title:'Kyrie VIII',scoreId:'GREGOBASE-1184',
    fingerprint:'0fe08a50',phraseNoteCounts:Object.freeze([25,23,23,31]),sourceNotes:102,performanceNotes:221}),
  Object.freeze({settingId:'MASS_11',title:'Kyrie XI',scoreId:'GREGOBASE-2982',
    fingerprint:'20149774',phraseNoteCounts:Object.freeze([18,21,18,25]),sourceNotes:82,performanceNotes:178}),
  Object.freeze({settingId:'MASS_17',title:'Kyrie XVII',scoreId:'GREGOBASE-272',
    fingerprint:'eebb7a65',phraseNoteCounts:Object.freeze([22,19,18,48]),sourceNotes:107,performanceNotes:207})
]);
const ADVANCED_SETTINGS=new Set(ADDITIONAL_KYRIE_RESEARCH_SOURCES.map(s=>s.settingId));
const RESEARCH_SETTINGS=new Set(['MASS_16','MASS_18',...ADVANCED_SETTINGS]);
// Never infer a Mass's Ordinary from the calendar or chant catalogue.
export function compileAdditionalKyrieResearchAudition({settingId,score,exsurge}={}){
  const spec=ADDITIONAL_KYRIE_RESEARCH_SOURCES.find(s=>s.settingId===settingId);
  if(!spec||!score||score.scoreApproved!==false||score.scoreId!==spec.scoreId)return null;
  try{
    const result=compileExsurgeGabcResearchMelody(score.gabc,{
      exsurge,scoreId:spec.scoreId,expectedFingerprint:spec.fingerprint,
      expectedPhraseNoteCounts:[...spec.phraseNoteCounts],phraseSequence:[...REPEATS]
    });
    if(result.sourceNoteCount!==spec.sourceNotes||
       result.performance.length!==spec.performanceNotes||
       result.invocations!==9)return null;
    return result;
  }catch{return null;} // Fail closed on unsupported/mutated notation.
}
export function kyrieXviAuditionEligible({form,settingId,isRequiem=false,mode='LIVE'}={}){
  return String(mode??'').toUpperCase()==='LIVE' &&
    SUNG.has(String(form??'').toUpperCase()) &&
    settingId==='MASS_16' && !isRequiem;
}
export function kyrieResearchAuditionEligible({form,settingId,isRequiem=false,mode='LIVE'}={}){
  return String(mode??'').toUpperCase()==='LIVE' &&
    SUNG.has(String(form??'').toUpperCase()) &&
    RESEARCH_SETTINGS.has(settingId)&&!isRequiem;
}
// The source identity, counts and repeat plan remain specifically guarded;
// the melodic parser and timing model are shared by future research scores.
const kyrieSourceFingerprint=text=>{
  let h=0x811c9dc5;
  for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),0x01000193);
  return(h>>>0).toString(16).padStart(8,'0');
};
export function compileKyrieXviAudition(gabc){
  try{
    // Fail closed even on a same-length editorial/source mutation.
    if(typeof gabc!=='string'||kyrieSourceFingerprint(gabc)!=='acef0d62')return null;
    const compiled=compileGabcMelody(gabc,{phraseSequence:REPEATS});
    if(compiled.sourceNoteCount!==40||compiled.sourceGroupCount!==27||
      compiled.phraseCount!==4||compiled.performance.length!==81||
      compiled.phrases.map(x=>x.reduce((n,g)=>n+g.notes.length,0)).join(',')!=='9,7,9,15'||
      !gabc.includes('<i>iij.</i>')||!gabc.includes('<i>ij.</i>'))
      return null;
    return compiled;
  }catch{return null;} // source/notation changed: do not guess.
}

// Separate exact-source guard: no automatic promotion of Kyrie XVIII.
export function compileKyrieXviiiAudition(gabc){
  try{
    if(typeof gabc!=='string'||kyrieSourceFingerprint(gabc)!=='db6e8276')return null;
    const compiled=compileGabcMelody(gabc,{phraseSequence:REPEATS});
    if(compiled.sourceNoteCount!==44||compiled.sourceGroupCount!==27||
       compiled.phraseCount!==4||compiled.performance.length!==90||
       compiled.phrases.map(x=>x.reduce((n,g)=>n+g.notes.length,0)).join(',')!=='10,8,10,16'||
       !gabc.includes('<i>iij.</i>')||!gabc.includes('<i>ij.</i>'))return null;
    return compiled;
  }catch{return null;}
}

const STYLES=`
.ao-kyrie-audition-launch{display:block;width:100%;margin:7px 0;padding:11px 8px;border:1px solid #bba574;border-radius:8px;background:#27342d;color:#f7eccb;font:600 12px system-ui;cursor:pointer}
.ao-kyrie-audition-launch[hidden]{display:none!important}
 .ao-kyrie-audition{box-sizing:border-box;position:fixed;inset:64px 14px auto auto;margin:0;width:min(430px,calc(100vw - 28px));max-height:min(36dvh,320px);overflow-y:auto;z-index:1100;background:#13201d;border:1px solid #8e7a4a;border-radius:14px;color:#efe9d9;padding:12px;box-shadow:0 18px 50px #0009;font:12px/1.4 system-ui}
.ao-kyrie-audition[hidden]{display:none!important}
.ao-kyrie-audition h3{margin:0;font:19px Georgia,serif;color:#f0dcaa}
.ao-kyrie-audition .ao-kyrie-head{display:flex;justify-content:space-between;gap:9px;align-items:center}
.ao-kyrie-audition .ao-kyrie-small{color:#c7bd9d;font-size:11px;margin:8px 0}
.ao-kyrie-audition .ao-kyrie-staff{max-height:110px;overflow:auto;border-radius:6px;background:#f8f7ef;color:#1b201d;padding:7px}
.ao-kyrie-audition .ao-kyrie-staff svg{width:100%;height:auto;max-width:100%}
.ao-kyrie-audition .ao-kyrie-staff svg text[data-kyrie-preview-current=true]{fill:#a35f24!important;stroke:#a35f24;stroke-width:.28px}
.ao-kyrie-audition .ao-kyrie-staff svg use.note[data-schola-notehead-active="true"]{fill:#bd6b21!important;stroke:#713612!important;stroke-width:.65px!important;paint-order:stroke fill}
.ao-kyrie-audition .ao-kyrie-controls{display:flex;gap:7px;align-items:center;justify-content:space-between;margin:9px 0}
.ao-kyrie-audition button,.ao-kyrie-audition select{font:inherit;color:#efe9d9;background:#273730;border:1px solid #67745f;border-radius:7px;padding:8px;min-height:36px;cursor:pointer}
.ao-kyrie-audition button:focus-visible,.ao-kyrie-audition :is(input,select):focus-visible{outline:2px solid #e3c584}
.ao-kyrie-audition .ao-kyrie-controls button{flex:1}
.ao-kyrie-audition label{display:flex;gap:9px;align-items:center;justify-content:space-between;margin:7px 0}
.ao-kyrie-audition label input{flex:1;min-width:0}
.ao-kyrie-audition .ao-kyrie-progress{font-variant-numeric:tabular-nums}
.ao-kyrie-audition .ao-kyrie-head-actions{display:flex;align-items:center;gap:5px;flex-shrink:0}
.ao-kyrie-audition[data-minimized="true"]{width:min(315px,calc(100vw - 28px));max-height:150px}
.ao-kyrie-audition[data-minimized="true"] .ao-kyrie-staff,
.ao-kyrie-audition[data-minimized="true"] .ao-kyrie-small,
.ao-kyrie-audition[data-minimized="true"] label{display:none!important}
.ao-kyrie-audition[data-minimized="true"] .ao-kyrie-controls{margin:6px 0 0}
.ao-kyrie-audition[data-minimized="true"] h3{font-size:16px}
`;

export function createKyrieXviResearchAudition({root,
  getContext=()=>({}),
  engraverFactory=createOfflineChantEngraver,
  audioFactory=null
}={}){
  if(!root?.ownerDocument)throw new TypeError('Reader root required');
  const doc=root.ownerDocument;
  const view=doc.defaultView;
  const style=doc.createElement('style');style.textContent=STYLES;
  doc.head.append(style);
  const trigger=doc.createElement('button');trigger.type='button';
  trigger.className='ao-kyrie-audition-launch';
  trigger.dataset.kyrieResearchAuditionOpen='';
  trigger.dataset.ordinaryPreviewMovement='KYRIE';
  const triggers=new Map([['KYRIE',trigger]]);
  // A movement has one launcher even when several exact GABCs are indexed.
  // Earlier code created one abandoned button per score and overwrote its
  // movement-keyed Map entry. Do not duplicate controls across settings.
  const ordinaryMovements=new Set(ORDINARY_M54_RESEARCH_SOURCES.map(x=>x.movement));
  for(const movement of ordinaryMovements){
    const extra=doc.createElement('button');
    extra.type='button';
    extra.className='ao-kyrie-audition-launch';
    extra.dataset.kyrieResearchAuditionOpen='';
    extra.dataset.ordinaryPreviewMovement=movement;
    extra.textContent='♫ MELODY PREVIEW';
    extra.hidden=true;
    triggers.set(movement,extra);
  }
  // One research-only Proper launcher, NEVER one automatic button per card.
  const properTrigger=doc.createElement('button');
  properTrigger.type='button';
  properTrigger.className='ao-kyrie-audition-launch';
  properTrigger.dataset.kyrieResearchAuditionOpen='';
  properTrigger.dataset.ordinaryPreviewMovement='PROPER';
  properTrigger.textContent='♫ PROPER MELODY PREVIEW';
  properTrigger.hidden=true;
  triggers.set('PROPER',properTrigger);
  trigger.textContent='♫ HEAR KYRIE XVI · MELODY PREVIEW';
  trigger.hidden=true;
  const panel=doc.createElement('section');
  panel.className='ao-kyrie-audition';panel.setAttribute('popover','manual');panel.hidden=true;
  panel.setAttribute('aria-label','Kyrie XVI provisional research melody preview');
  panel.innerHTML=`<div class="ao-kyrie-head"><h3>Kyrie XVI · melody</h3><div class="ao-kyrie-head-actions"><button type="button" data-kyrie-action="minimize" aria-label="Minimise melody preview" aria-pressed="false">−</button><button type="button" data-kyrie-action="close" aria-label="Close melody preview">×</button></div></div>
    <p class="ao-kyrie-small">Research transcription · not an approved performance score · melody only</p>
    <div class="ao-kyrie-staff" data-kyrie-staff role="img" aria-label="Kyrie XVI Gregorian neumes"></div>
    <div class="ao-kyrie-controls"><button type="button" data-kyrie-action="play">▶ Play</button><button type="button" data-kyrie-action="stop">■ Stop</button></div>
    <label>Sound <select data-kyrie-tone><option value="flute">Flute</option><option value="pure">Pure tone</option></select></label>
    <label>Pitch <input data-kyrie-pitch type="range" min="-12" max="12" value="0" step="1"><output data-kyrie-pitch-value>0</output></label>
    <label>Speed <input data-kyrie-speed type="range" min="0.5" max="1.6" value="1" step="0.1"><output data-kyrie-speed-value>1×</output></label>
    <div class="ao-kyrie-small ao-kyrie-progress" aria-live="off" data-kyrie-position>Ready · nine invocations</div>`;
  doc.body.append(panel);
  const sourceXvi=offlineKyrialeResearchScore('KYRIE','MASS_16');
  const scoreXvi=compileKyrieXviAudition(sourceXvi?.gabc);
  if(!scoreXvi)throw new Error('Kyrie XVI source changed; audition withheld');
  const sourceXviii=offlineKyrialeResearchScore('KYRIE','MASS_18');
  const scoreXviii=compileKyrieXviiiAudition(sourceXviii?.gabc);
  const sources=new Map([
    ['MASS_16',{score:sourceXvi,compiled:scoreXvi,title:'Kyrie XVI',movement:'KYRIE'}],
    ...(scoreXviii?[['MASS_18',{score:sourceXviii,compiled:scoreXviii,title:'Kyrie XVIII',movement:'KYRIE'}]]:[])
  ]);
  let setting='MASS_16',activeMovement='KYRIE',score=sourceXvi,compiled=scoreXvi;
  const ordinaryKey=(movement,settingId)=>movement+':'+settingId;
  let ordinaryExsurgePromise=null;
  const ordinaryAttempted=new Set();
  function prepareOrdinaryResearch(movement,settingId){
    const key=ordinaryKey(movement,settingId);
    if(destroyed||sources.has(key)||ordinaryAttempted.has(key))return;
    const spec=ORDINARY_M54_RESEARCH_SOURCES.find(x=>
      x.movement===movement&&x.settingId===settingId);
    if(!spec)return;
    // Compile only the actual user-chosen score. Attempt each source once
    // per reader instance; an invalid GABC must fail closed without a
    // microtask retry loop or a 14-score first-open performance penalty.
    ordinaryAttempted.add(key);
    ordinaryExsurgePromise??=loadOfflineExsurge(doc).catch(()=>null);
    void ordinaryExsurgePromise.then(exsurge=>{
      if(destroyed||!exsurge)return;
      const prepared=compileOrdinaryM54ResearchMelody({
        movement,settingId,exsurge
      });
      if(!prepared)return;
      const src=offlineKyrialeResearchScore(movement,settingId);
      // Keep the exact canonical source in the research record. Only the
      // player/engraver receives the independently pinned, Gregorio-equivalent
      // explicit bivirga spelling for Exsurge's notehead indexing.
      const playerScore=prepared.rendererEquivalentExpansion
        ?Object.freeze({...src,canonicalGabc:src.gabc,gabc:prepared.notationGabc,
          provisionalRendererEquivalent:true})
        :src;
      sources.set(key,{
        score:playerScore,compiled:prepared.melody,title:spec.title,movement
      });
    }).catch(()=>{/* Unsupported source: withheld. */})
      .finally(()=>{if(!destroyed)sync();});
  }
  const properAttempted=new Set();
  function prepareProperResearch(selectionId){
    const key='PROPER:'+selectionId;
    if(destroyed||sources.has(key)||properAttempted.has(key))return;
    if(!PROPER_RESEARCH_SOURCES.some(spec=>spec.selectionId===selectionId))
      return;
    properAttempted.add(key);
    // The existing vendored Exsurge promise is shared with the Ordinary:
    // the research Proper cannot create a second player or network dependency.
    ordinaryExsurgePromise??=loadOfflineExsurge(doc).catch(()=>null);
    void ordinaryExsurgePromise.then(exsurge=>{
      if(destroyed||!exsurge)return;
      const result=compileProperM59ResearchMelody({selectionId,exsurge});
      if(!result)return; // Exact source or source-note failure withholds audio.
      sources.set(key,{
        score:result.renderScore,compiled:result.melody,
        title:result.source.role[0]+result.source.role.slice(1).toLowerCase()+
          ' · '+result.source.title,
        movement:'PROPER'
      });
    }).catch(()=>{/* Missing source/exsurge means no research preview. */})
      .finally(()=>{if(!destroyed)sync();});
  }
  // Load the pinned offline Exsurge semantics only after a user selects one
  // of the four additional research settings. Other Mass forms never preload.
  let advancedPending=null,advancedLoadAttempted=false;
  function prepareAdvancedResearch(){
    if(advancedPending||advancedLoadAttempted||destroyed)return;
    advancedLoadAttempted=true;
    advancedPending=loadOfflineExsurge(doc).then(exsurge=>{
      if(destroyed)return;
      for(const spec of ADDITIONAL_KYRIE_RESEARCH_SOURCES){
        const src=offlineKyrialeResearchScore('KYRIE',spec.settingId);
        const prepared=compileAdditionalKyrieResearchAudition({
          settingId:spec.settingId,score:src,exsurge
        });
        if(prepared)sources.set(spec.settingId,{
          score:src,compiled:prepared,title:spec.title,movement:'KYRIE'
        });
      }
    }).catch(()=>{ /* Missing offline Exsurge: withhold preview. */ })
      .finally(()=>{advancedPending=null;if(!destroyed)sync();});
  }
  let demoTiming=scheduleGabcMelody(compiled);
  const staff=panel.querySelector('[data-kyrie-staff]');
  const position=panel.querySelector('[data-kyrie-position]');
  const playButton=panel.querySelector('[data-kyrie-action="play"]');
  const minimizeButton=panel.querySelector('[data-kyrie-action="minimize"]');
  const pitchNode=panel.querySelector('[data-kyrie-pitch]');
  const speedNode=panel.querySelector('[data-kyrie-speed]');
  const toneNode=panel.querySelector('[data-kyrie-tone]');
  let noteheadFollower=createExsurgeNoteheadFollower({staff,compiled});
  let engraver=null,lyricTargets=[],audio=null,index=0,playing=false,timer=0;
  let voices=[],destroyed=false,sourceRendered=false;
  let timeoutId=0;
  const getAudio=()=>{
    if(audio)return audio;
    const Ctor=audioFactory??view?.AudioContext??view?.webkitAudioContext;
    if(!Ctor)throw new Error('Web Audio unavailable');
    audio=new Ctor();return audio;
  };
  function releaseVoices(){
    for(const node of voices){try{node.stop?.()}catch{};try{node.disconnect?.()}catch{}}
    voices=[];
  }
  function clearTimer(){if(timeoutId){view?.clearTimeout(timeoutId);timeoutId=0}}
  function silence(){playing=false;clearTimer();releaseVoices();playButton.textContent='▶ Play';}
  function paint(){
    const note=compiled.performance[index];
    const segment=activeMovement==='KYRIE'?'Invocation':'Section';
    position.textContent=note?`${segment} ${note.invocation}/${compiled.invocations} · source note ${note.sourceNoteOrdinal}/${compiled.sourceNoteCount}`: 'Complete';
    // A source ordinal targets a real Exsurge use#note-N glyph;
    // explicit repetitions revisit identical written noteheads.
    staff.dataset.sourceNoteOrdinal=note?String(note.sourceNoteOrdinal):'complete';
    staff.dataset.performanceNoteOrdinal=note?String(index+1):'complete';
    const aligned=noteheadFollower.paint(note?.sourceNoteOrdinal??0);
    for(let i=0;i<lyricTargets.length;i++){
      const active=Boolean(note&&note.groupIndex===i);
      lyricTargets[i].dataset.kyriePreviewCurrent=String(active);
      if(active&&!aligned){const r=lyricTargets[i].getBoundingClientRect(),v=staff.getBoundingClientRect();
        if(r.top<v.top||r.bottom>v.bottom)staff.scrollTop+=r.top-v.top-v.height/3;
      }
    }
  }
  function sound(note,seconds){
    const context=getAudio();void context.resume?.();
    const now=context.currentTime;
    const pitch=Number(pitchNode.value)||0;
    const freq=440*Math.pow(2,(note.midi+pitch-69)/12);
    const flute=toneNode.value==='flute';
    const envelope=context.createGain();envelope.gain.setValueAtTime(.0001,now);
    envelope.gain.linearRampToValueAtTime(flute?.075:.10,now+.035);
    envelope.gain.setValueAtTime(flute?.075:.10,now+Math.max(.05,seconds-.075));
    envelope.gain.exponentialRampToValueAtTime(.0001,now+seconds);
    envelope.connect(context.destination);
    const oscillator=context.createOscillator();oscillator.type='sine';
    oscillator.frequency.value=freq;oscillator.connect(envelope);oscillator.start(now);oscillator.stop(now+seconds+.012);
    voices.push(oscillator);
    if(flute){for(const [ratio,gain] of [[2,.10],[3,.025]]){
      const harmonic=context.createOscillator(),amp=context.createGain();
      harmonic.type='sine';harmonic.frequency.value=freq*ratio;amp.gain.value=gain;
      harmonic.connect(amp).connect(envelope);harmonic.start(now);harmonic.stop(now+seconds+.012);
      voices.push(harmonic);
    }}
  }
  function advance(){
    if(!playing||destroyed)return;
    const note=compiled.performance[index];
    if(!note){silence();paint();return}
    paint();
    const speed=Number(speedNode.value)||1;
    const duration=demoTiming.events[index].durationMs/1000/speed;
    try{sound(note,duration)}catch{silence();position.textContent='Audio unavailable in this browser';return}
    timeoutId=view.setTimeout(()=>{
      releaseVoices();index++;
      if(index>=compiled.performance.length){silence();paint();return}
      if(note.phraseEnd){timeoutId=view.setTimeout(advance,demoTiming.events[index-1].gapAfterMs/speed)}
      else advance();
    },duration*1000);
  }
  function pause(){silence();paint()}
  function play(){
    if(playing)return pause();
    if(index>=compiled.performance.length)index=0;
    try{getAudio()}catch{position.textContent='Audio unavailable';return}
    playing=true;playButton.textContent='Ⅱ Pause';advance();
  }
  function stop(){silence();index=0;paint()}
  function setMinimized(value){
    const minimal=Boolean(value);
    panel.dataset.minimized=String(minimal);
    minimizeButton.textContent=minimal?'□':'−';
    minimizeButton.setAttribute('aria-label',
      minimal?'Expand Gregorian notation':'Minimise Gregorian notation');
    minimizeButton.setAttribute('aria-pressed',String(minimal));
  }
  function close(){
    stop();
    if(panel.matches?.(':popover-open'))panel.hidePopover();
    panel.hidden=true;
  }
  function switchScore(nextSetting){
    const selected=sources.get(nextSetting);
    if(!selected)return false;
    if(setting===nextSetting)return true;
    close();
    engraver?.destroy?.();engraver=null;
    noteheadFollower.destroy();
    staff.replaceChildren();lyricTargets=[];sourceRendered=false;
    setting=nextSetting;activeMovement=selected.movement??'KYRIE';score=selected.score;compiled=selected.compiled;
    demoTiming=scheduleGabcMelody(compiled);
    noteheadFollower=createExsurgeNoteheadFollower({staff,compiled});
    panel.querySelector('h3').textContent=selected.title+' · melody';
    panel.setAttribute('aria-label',selected.title+' provisional research melody preview');
    staff.setAttribute('aria-label',selected.title+' Gregorian neumes');
    const selectedTrigger=triggers.get(activeMovement);
    if(selectedTrigger)selectedTrigger.textContent=
      '♫ HEAR '+selected.title.toUpperCase()+' · MELODY PREVIEW';
    staff.scrollTop=0;staff.scrollLeft=0;
    paint();
    return true;
  }
  async function open(requestedTrigger=trigger){
    if(requestedTrigger.hidden)return;
    const requestedKey=requestedTrigger.dataset.researchScoreKey;
    if(!requestedKey||!sources.has(requestedKey)||!switchScore(requestedKey))return;
    // Once an explicitly chosen chant opens in its own nonmodal player,
    // collapse the configuration sheet so the Mass text remains visible.
    const musicPlan=root.querySelector('[data-schola-local-panel]');
    if(musicPlan?.open)musicPlan.open=false;
    setMinimized(false);
    panel.hidden=false;
    // Manual popover enters the browser top layer without making the Mass
    // reader inert. A modal dialog would break independent priest navigation.
    if(panel.showPopover && !panel.matches(':popover-open'))panel.showPopover();
    if(!sourceRendered){
      sourceRendered=true;
      try{
        engraver=engraverFactory({viewport:staff,document:doc,
          onRendered:()=>{
            lyricTargets=mapScholaSvgLyrics(staff.querySelector('svg'),
              scholaGabcSyllables(score.gabc));
            paint();
          }
        });
        if(await engraver.engrave(score.gabc)){
          engraver.observe?.();
          const parts=scholaGabcSyllables(score.gabc);
          lyricTargets=mapScholaSvgLyrics(staff.querySelector('svg'),parts);
          // Text highlight is a syllable guide, not a claim of editorial
          // neume-by-neume rhythmic certification.
          paint();
        }
      }catch{position.textContent='Notation unavailable; melody remains a research preview'}
    }
    paint();
  }
  const panelClick=event=>{
    const action=event.target.closest('[data-kyrie-action]')?.dataset.kyrieAction;
    if(action==='close')close();
    if(action==='minimize')setMinimized(panel.dataset.minimized!=='true');
    if(action==='play')play();
    if(action==='stop')stop();
  };
  const rootClick=event=>{
    const requested=event.target.closest('[data-kyrie-research-audition-open]');
    if(requested&&triggers.get(requested.dataset.ordinaryPreviewMovement)===requested)
      void open(requested);
  };
  const rootChange=event=>{
    if(event.target.matches('[data-schola-proper-research-sunday]')){
      const week=event.target.value;
      const sourcePicker=root.querySelector('[data-schola-proper-research-select]');
      if(sourcePicker){
        const blank=doc.createElement('option');
        blank.value='';
        blank.textContent='No chant selected · nothing plays automatically';
        sourcePicker.replaceChildren(blank);
        const names=Object.freeze({
          INTROIT:'Introit',GRADUAL:'Gradual',ALLELUIA:'Alleluia',
          OFFERTORY:'Offertory',COMMUNION:'Communion'
        });
        // M67: keep the first Holy Family source visible as a clearly
        // disabled textual witness, not an enabled audio option.
        if(week==='HOLY_FAMILY'){
          const held=doc.createElement('option');
          held.value='HOLY_FAMILY_INTROIT';
          held.textContent='Introit · Exsultet / Exsultat · editorial text hold';
          held.disabled=true;
          held.setAttribute('disabled','');
          sourcePicker.append(held);
        }
        for(const spec of PROPER_RESEARCH_SOURCES){
          if(!spec.selectionId.startsWith(week+'_'))continue;
          const option=doc.createElement('option');
          option.value=spec.selectionId;
          option.textContent=names[spec.role]+' · '+spec.title+
            (spec.selectionId==='CHRISTMAS_VIGIL_ALLELUIA'
              ?' · Sunday Vigil only (not 2026)':
              spec.selectionId==='CHRISTMAS_DAWN_COMMUNION'
              ?' · recovered source (uncertified)':'');
          sourcePicker.append(option);
        }
      }
      // The Mass chooser is a study selector, never a calendar command.
      properTrigger.hidden=true;
      properTrigger.dataset.researchScoreKey='';
      close();sync();
      return;
    }
    if(event.target.matches('[data-schola-proper-research-select]')){
      // A research-only change never alters the saved liturgical programme.
      properTrigger.hidden=true;
      properTrigger.dataset.researchScoreKey='';
      close();
      sync();
      return;
    }
    if(event.target.matches(
      '[data-schola-kyriale-choice], [data-schola-ordinary-setting], '+
      '[data-ordinary-reference-chooser] select'
    )){
      // A changed setting invalidates an open melody synchronously before
      // the saved programme refresh. Never keep an old source sounding.
      for(const button of triggers.values())button.hidden=true;
      close();
    }
  };
  const settingsChanged=event=>{
    if(event.target===pitchNode){panel.querySelector('[data-kyrie-pitch-value]').textContent=String(pitchNode.value);}
    if(event.target===speedNode){panel.querySelector('[data-kyrie-speed-value]').textContent=speedNode.value+'×';}
    if([pitchNode,speedNode,toneNode].includes(event.target)&&playing){pause();play();}
  };
  panel.addEventListener('click',panelClick);
  panel.addEventListener('input',settingsChanged);
  panel.addEventListener('change',settingsChanged);
  root.addEventListener('click',rootClick);
  root.addEventListener('change',rootChange,true);
  function sync(){
    if(destroyed)return false;
    const {form,settingId,isRequiem,mode,ordinarySelections={}}=getContext();
    const chosenKyrie=settingId??ordinarySelections?.KYRIE;
    const permitted=kyrieResearchAuditionEligible({
      form,settingId:chosenKyrie,isRequiem,mode
    });
    if(permitted&&ADVANCED_SETTINGS.has(chosenKyrie)&&!sources.has(chosenKyrie))
      prepareAdvancedResearch();
    const eligible=permitted&&sources.has(chosenKyrie);
    const kyrieAnchor=root.querySelector('[data-schola-original-score="KYRIE"]');
    if(kyrieAnchor&&trigger.parentElement!==kyrieAnchor.parentElement)
      kyrieAnchor.insertAdjacentElement('afterend',trigger);
    trigger.dataset.researchScoreKey=chosenKyrie??'';
    trigger.hidden=!eligible;
    if(eligible){
      const selected=sources.get(chosenKyrie);
      trigger.textContent='♫ HEAR '+selected.title.toUpperCase()+' · MELODY PREVIEW';
      // Keep the original Kyrie flow, without interrupting a separate
      // Ordinary movement that the user explicitly opened.
      if(panel.hidden&&activeMovement==='KYRIE'&&setting!==chosenKyrie)
        switchScore(chosenKyrie);
    }
    let visible=eligible;
    for(const [movement,button] of triggers){
      if(movement==='KYRIE'||movement==='PROPER')continue;
      const chosen=ordinarySelections?.[movement];
      const key=ordinaryKey(movement,chosen);
      const allowed=eligibleOrdinaryM54ResearchSource({
        movement,settingId:chosen,form,mode,isRequiem
      });
      if(allowed&&!sources.has(key))prepareOrdinaryResearch(movement,chosen);
      const anchor=root.querySelector(
        '[data-schola-original-score="'+movement+'"]');
      if(anchor&&button.parentElement!==anchor.parentElement)
        anchor.insertAdjacentElement('afterend',button);
      const show=allowed&&sources.has(key);
      button.dataset.researchScoreKey=show?key:'';
      button.hidden=!show;
      if(show)button.textContent='♫ HEAR '+
        sources.get(key).title.toUpperCase()+' · MELODY PREVIEW';
      visible ||= show;
    }
    const selectedProper=root.querySelector(
      '[data-schola-proper-research-select]')?.value??'';
    const chosenResearchWeek=root.querySelector(
      '[data-schola-proper-research-sunday]')?.value??'ADVENT1';
    const properKey='PROPER:'+selectedProper;
    const properAllowed=selectedProper.startsWith(chosenResearchWeek+'_')&&
      eligibleProperM59ResearchSource({
        form,mode,isRequiem,selectionId:selectedProper
      });
    if(properAllowed&&!sources.has(properKey))
      prepareProperResearch(selectedProper);
    const properAnchor=root.querySelector('[data-schola-proper-research]');
    if(properAnchor&&properTrigger.parentElement!==properAnchor.parentElement)
      properAnchor.insertAdjacentElement('afterend',properTrigger);
    const properVisible=Boolean(properAnchor&&properAllowed&&sources.has(properKey));
    properTrigger.dataset.researchScoreKey=properVisible?properKey:'';
    properTrigger.hidden=!properVisible;
    if(properVisible)
      properTrigger.textContent='♫ HEAR '+
        sources.get(properKey).title.toUpperCase()+' · MELODY PREVIEW';
    visible ||=properVisible;
    // Persisted programmes may be changed while the player is open:
    // if the source no longer exactly matches, release the sound immediately.
    if(!panel.hidden){
      const chosen=activeMovement==='KYRIE'?chosenKyrie:
        activeMovement==='PROPER'?selectedProper:
        ordinarySelections?.[activeMovement];
      const key=activeMovement==='KYRIE'?chosen:
        activeMovement==='PROPER'?properKey:
        ordinaryKey(activeMovement,chosen);
      const button=triggers.get(activeMovement);
      if(setting!==key||button?.hidden)close();
    }
    return visible;
  }
  function destroy(){
    if(destroyed)return;destroyed=true;silence();
    if(panel.matches?.(':popover-open'))panel.hidePopover();
    engraver?.destroy?.();noteheadFollower.destroy();audio?.close?.();
    root.removeEventListener('click',rootClick);
    root.removeEventListener('change',rootChange,true);
    panel.removeEventListener('click',panelClick);
    panel.removeEventListener('input',settingsChanged);
    panel.removeEventListener('change',settingsChanged);
    for(const button of triggers.values())button.remove();
    panel.remove();style.remove();
  }
  return Object.freeze({sync,stop,destroy,getState:()=>Object.freeze({
    eligible:!trigger.hidden,open:!panel.hidden,playing,index,
    total:compiled.performance.length,sourceApproved:false,
    audioOwnedBySchola:false,
    noteheadAligned:noteheadFollower.getState().mapped,
    noteheadCount:noteheadFollower.getState().glyphCount,
    activeMovement,activeScoreKey:setting,
    visiblePreviewMovements:[...triggers].filter(([,b])=>!b.hidden).map(([m])=>m)
  })});
}