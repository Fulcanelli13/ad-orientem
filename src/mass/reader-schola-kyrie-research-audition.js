// Explicitly opened, zero-cost melody audition of a PROVISIONAL research source.
// Never promotes the score into the Schola dock, observes a choir, or moves a Mass cue.
import {offlineKyrialeResearchScore} from './reader-kyriale-research-gabc.js';
import {createOfflineChantEngraver} from './reader-chant-engraver.js';
import {scholaGabcSyllables,mapScholaSvgLyrics} from './reader-schola-notation-follow.js';

const SUNG=new Set(['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN']);
const REPEATS=Object.freeze([0,0,0,1,1,1,2,2,3]);
const DIATONIC=Object.freeze({c:0,d:2,e:4,f:5,g:7,h:9,i:11,j:12,k:14,l:16,m:17});
export function kyrieXviAuditionEligible({form,settingId,isRequiem=false}={}){
  return SUNG.has(String(form??'').toUpperCase()) && settingId==='MASS_16' && !isRequiem;
}
// Parse the existing four GABC invocation lines; this is *not* a general GABC
// parser. Bail out if the source changes rather than guessing repetitions.
export function compileKyrieXviAudition(gabc){
  const lines=String(gabc??'').split('%%')[1]?.trim().split(/\r?\n/).filter(Boolean)??[];
  if(lines.length!==4)return null;
  let global=0;
  const verses=lines.map((line,verseIndex)=>{
    const groups=[];
    for(const match of line.matchAll(/([^()]*)\(([^()]*)\)/g)){
      const raw=match[2];
      if(/^\s*[cf][1-4]\s*$/.test(raw))continue;
      const pitches=[...raw.matchAll(/[c-mC-M]/g)].map(x=>x[0]);
      if(!pitches.length)continue;
      const rawSyllable=match[1].replace(/<[^>]*>/g,'').replace(/\*|\{|\}/g,'').trim();
      if(!/[\p{L}]/u.test(rawSyllable))return null;
      groups.push(Object.freeze({
        groupIndex:0,verseIndex,syllable:rawSyllable,
        notes:Object.freeze(pitches.map((letter,position)=>Object.freeze({
          sourceNoteOrdinal:++global,
          midi:60+DIATONIC[letter.toLowerCase()],
          mora:/\./.test(raw) && position===pitches.length-1,
          episema:/_/.test(raw) && position===pitches.length-1,
        })))
      }));
    }
    return groups;
  });
  const flat=verses.flat();
  if(flat.length!==27 || global!==40 ||
    verses.map(x=>x.reduce((n,g)=>n+g.notes.length,0)).join(',')!=='9,7,9,15' ||
    !gabc.includes('<i>iij.</i>') || !gabc.includes('<i>ij.</i>'))return null;
  // A printed syllable is visited repeatedly; its note index remains stable.
  let nextGroup=0;
  const source=verses.map(groups=>groups.map(group=>Object.freeze({...group,groupIndex:nextGroup++})));
  const performance=[];
  for(let invocation=0;invocation<REPEATS.length;invocation++){
    const verseIndex=REPEATS[invocation];
    const groups=source[verseIndex];
    for(let gi=0;gi<groups.length;gi++){
      const group=groups[gi];
      for(let ni=0;ni<group.notes.length;ni++){
        performance.push(Object.freeze({
          ...group.notes[ni],groupIndex:group.groupIndex,
          invocation:invocation+1,verseIndex,
          phraseEnd:gi===groups.length-1 && ni===group.notes.length-1
        }));
      }
    }
  }
  return Object.freeze({sourceNoteCount:global,sourceGroupCount:flat.length,
    invocations:REPEATS.length,performance:Object.freeze(performance)});
}

const STYLES=`
.ao-kyrie-audition-launch{display:block;width:100%;margin:7px 0;padding:11px 8px;border:1px solid #bba574;border-radius:8px;background:#27342d;color:#f7eccb;font:600 12px system-ui;cursor:pointer}
.ao-kyrie-audition-launch[hidden]{display:none!important}
.ao-kyrie-audition{box-sizing:border-box;position:fixed;bottom:18px;right:14px;width:min(430px,calc(100vw - 28px));max-height:min(84dvh,650px);overflow-y:auto;z-index:1100;background:#13201d;border:1px solid #8e7a4a;border-radius:14px;color:#efe9d9;padding:12px;box-shadow:0 18px 50px #0009;font:12px/1.4 system-ui}
.ao-kyrie-audition[hidden]{display:none!important}
.ao-kyrie-audition h3{margin:0;font:19px Georgia,serif;color:#f0dcaa}
.ao-kyrie-audition .ao-kyrie-head{display:flex;justify-content:space-between;gap:9px;align-items:center}
.ao-kyrie-audition .ao-kyrie-small{color:#c7bd9d;font-size:11px;margin:8px 0}
.ao-kyrie-audition .ao-kyrie-staff{max-height:172px;overflow:auto;border-radius:6px;background:#f8f7ef;color:#1b201d;padding:7px}
.ao-kyrie-audition .ao-kyrie-staff svg{width:100%;height:auto;max-width:100%}
.ao-kyrie-audition .ao-kyrie-staff svg text[data-kyrie-preview-current=true]{fill:#a35f24!important;stroke:#a35f24;stroke-width:.28px}
.ao-kyrie-audition .ao-kyrie-controls{display:flex;gap:7px;align-items:center;justify-content:space-between;margin:9px 0}
.ao-kyrie-audition button,.ao-kyrie-audition select{font:inherit;color:#efe9d9;background:#273730;border:1px solid #67745f;border-radius:7px;padding:8px;min-height:36px;cursor:pointer}
.ao-kyrie-audition button:focus-visible,.ao-kyrie-audition :is(input,select):focus-visible{outline:2px solid #e3c584}
.ao-kyrie-audition .ao-kyrie-controls button{flex:1}
.ao-kyrie-audition label{display:flex;gap:9px;align-items:center;justify-content:space-between;margin:7px 0}
.ao-kyrie-audition label input{flex:1;min-width:0}
.ao-kyrie-audition .ao-kyrie-progress{font-variant-numeric:tabular-nums}
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
  trigger.textContent='♫ HEAR KYRIE XVI · MELODY PREVIEW';
  trigger.hidden=true;
  const panel=doc.createElement('section');
  panel.className='ao-kyrie-audition';panel.hidden=true;
  panel.setAttribute('aria-label','Kyrie XVI provisional research melody preview');
  panel.innerHTML=`<div class="ao-kyrie-head"><h3>Kyrie XVI · melody</h3><button type="button" data-kyrie-action="close" aria-label="Close melody preview">×</button></div>
    <p class="ao-kyrie-small">Research transcription · not an approved performance score · melody only</p>
    <div class="ao-kyrie-staff" data-kyrie-staff role="img" aria-label="Kyrie XVI Gregorian neumes"></div>
    <div class="ao-kyrie-controls"><button type="button" data-kyrie-action="play">▶ Play</button><button type="button" data-kyrie-action="stop">■ Stop</button></div>
    <label>Sound <select data-kyrie-tone><option value="flute">Flute</option><option value="pure">Pure tone</option></select></label>
    <label>Pitch <input data-kyrie-pitch type="range" min="-12" max="12" value="0" step="1"><output data-kyrie-pitch-value>0</output></label>
    <label>Speed <input data-kyrie-speed type="range" min="0.5" max="1.6" value="1" step="0.1"><output data-kyrie-speed-value>1×</output></label>
    <div class="ao-kyrie-small ao-kyrie-progress" aria-live="off" data-kyrie-position>Ready · nine invocations</div>
    <p class="ao-kyrie-small">This audition uses its own sound clock. Reader navigation cannot advance or restart the chant.</p>`;
  doc.body.append(panel);
  const score=offlineKyrialeResearchScore('KYRIE','MASS_16');
  const compiled=compileKyrieXviAudition(score?.gabc);
  if(!compiled)throw new Error('Kyrie XVI source changed; audition withheld');
  const staff=panel.querySelector('[data-kyrie-staff]');
  const position=panel.querySelector('[data-kyrie-position]');
  const playButton=panel.querySelector('[data-kyrie-action="play"]');
  const pitchNode=panel.querySelector('[data-kyrie-pitch]');
  const speedNode=panel.querySelector('[data-kyrie-speed]');
  const toneNode=panel.querySelector('[data-kyrie-tone]');
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
    position.textContent=note?`Invocation ${note.invocation}/9 · source note ${note.sourceNoteOrdinal}/40`: 'Complete';
    for(let i=0;i<lyricTargets.length;i++){
      const active=Boolean(note&&note.groupIndex===i);
      lyricTargets[i].dataset.kyriePreviewCurrent=String(active);
      if(active){const r=lyricTargets[i].getBoundingClientRect(),v=staff.getBoundingClientRect();
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
    const duration=(note.mora?.53:note.episema?.40:.30)/speed;
    try{sound(note,duration)}catch{silence();position.textContent='Audio unavailable in this browser';return}
    timeoutId=view.setTimeout(()=>{
      releaseVoices();index++;
      if(index>=compiled.performance.length){silence();paint();return}
      if(note.phraseEnd){timeoutId=view.setTimeout(advance,.28/speed*1000)}
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
  function close(){stop();panel.hidden=true}
  async function open(){
    if(trigger.hidden)return;
    panel.hidden=false;
    if(!sourceRendered){
      sourceRendered=true;
      try{
        engraver=engraverFactory({viewport:staff,document:doc});
        if(await engraver.engrave(score.gabc)){
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
    if(action==='play')play();
    if(action==='stop')stop();
  };
  const rootClick=event=>{
    if(event.target.closest('[data-kyrie-research-audition-open]'))void open();
  };
  const rootChange=event=>{
    if(event.target.matches('[data-schola-kyriale-choice="KYRIE"], [data-schola-ordinary-setting="KYRIE"]'))close();
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
    const {form,settingId,isRequiem}=getContext();
    const eligible=kyrieXviAuditionEligible({form,settingId,isRequiem});
    const anchor=root.querySelector('[data-schola-original-score="KYRIE"]');
    if(anchor&&trigger.parentElement!==anchor.parentElement)anchor.insertAdjacentElement('afterend',trigger);
    trigger.hidden=!eligible;
    if(!eligible)close();
    return eligible;
  }
  function destroy(){
    if(destroyed)return;destroyed=true;silence();
    engraver?.destroy?.();audio?.close?.();
    root.removeEventListener('click',rootClick);
    root.removeEventListener('change',rootChange,true);
    panel.removeEventListener('click',panelClick);
    panel.removeEventListener('input',settingsChanged);
    panel.removeEventListener('change',settingsChanged);
    trigger.remove();panel.remove();style.remove();
  }
  return Object.freeze({sync,stop,destroy,getState:()=>Object.freeze({
    eligible:!trigger.hidden,open:!panel.hidden,playing,index,
    total:compiled.performance.length,sourceApproved:false,
    audioOwnedBySchola:false
  })});
}