import {createOfflineChantEngraver} from './reader-chant-engraver.js';
// Native Mass Schola: real Gregorian score selection and continuous manuscript viewing.
// Research/pilot only: selected preview is NOT the actual choir's musical setting.
// No playback, priest action, card navigation, audio clock, or liturgical inference.
const KYRIE_XVI_GABC=`name:Kyrie XVI;
office-part:Kyriale;
mode:3;
book:Graduale Romanum, 1961, p. 54* & The Liber Usualis, 1961, p. 59 & Chants of the Church, 1956, p. 40;
transcriber:Andrew Hinkley;
commentary:XI-XIII. s.;
%%
(c4) KY(g)ri(hi)e(ii) *() e(g)lé(h_)i(i)son.(i.) <i>iij.</i>(::)
Chri(k)ste(ij) e(h)lé(h_)i(i)son.(i.) <i>iij.</i>(::)
Ký(g)ri(hi)e(ii) e(g)lé(h_)i(i)son.(i.) <i>ij.</i>(::)
Ký(g)ri(hi)e(ii) *() e(g)lé(hj)i(h)son.(ighvGFE.) (::)`;

const KYRIE_XI_GABC=`name:Kyrie XI;
office-part:Kyriale;
mode:1;
book:Graduale Romanum, 1961, p. 38* & The Liber Usualis, 1961, p. 46 & Chants of the Church, 1956, p. 30;
transcriber:Andrew Hinkley;
%%
(c4) KY(ixhi)ri(hg)e(hd..) *(,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) <i>iij.</i>(::)
Chri(hg)ste(kv.jkJH'Gh.) (,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) <i>iij.</i>(::)
Ký(ixhi)ri(hg)e(hd..) (,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) <i>ij.</i>(::)
Ký(dfd)ri(cd)e(d.gv.fgFD'Cd.) <clear>*(,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) (::)`;
const KYRIE_VIII_GABC=`name:Kyrie VIII;
office-part:Kyriale;
mode:5;
book:Graduale Romanum, 1961, p. 28* & The Liber Usualis, 1961, p. 37 & Chants of the Church, 1956, p. 19;
transcriber:Andrew Hinkley;
commentary:XV-XVI. s.;
%%
(c3) KY(d)ri(gxfgh)e(h.ivHGh.) *~{~}(/[-2]kvIH'Ghih.) (,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) <i>iij.</i>(::)
Chri(f)ste(fvED'Cd.gxd!fg!hv.ivHGh.) (,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) <i>iij.</i>(::)
Ký(k')ri(j)e(kvJI'jkh.1gxkhiv./[-0.5]fg!hv.) (,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) <i>ij.</i>(::)
Ký(k')ri(j)e(kvJI'jkh.1) <clear>*(,) (kjkvJI'jkh.1gxkhiv./[-0.5]fg!hv.) <clear>**(,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) (::)`;
const source=(id)=>"https://gregobase.selapa.net/chant.php?id="+id;
const svg=(id)=>"https://gregobase.selapa.net/download.php?format=svg&id="+id;
const gabc=(id)=>"https://gregobase.selapa.net/download.php?elem=1&format=gabc&id="+id;
export const SCHOLA_SCORE_CATALOGUE=Object.freeze([
  Object.freeze({id:"GREGOBASE-545",trackId:"KYRIE",title:"Kyrie XVI",version:"Solesmes",
    status:"RESEARCH_EXAMPLE_NOT_MASS_SETTING",mode:3,
    provenance:"GREGOBASE_CC0_TRANSCRIPTION",transcriptionAuthor:"Andrew Hinkley",
    sourceUrl:source(545),svgUrl:svg(545),gabcUrl:gabc(545),
    bookWitnesses:Object.freeze(["Graduale Romanum (Solesmes, 1961), p. 54*",
      "Liber Usualis (Solesmes, 1961), p. 59"]),
    gabc:KYRIE_XVI_GABC}),
  Object.freeze({id:"GREGOBASE-2982",trackId:"KYRIE",title:"Kyrie XI",version:"Solesmes",
    status:"RESEARCH_EXAMPLE_NOT_MASS_SETTING",
    provenance:"GREGOBASE_CC0_TRANSCRIPTION",
    sourceUrl:source(2982),svgUrl:svg(2982),gabcUrl:gabc(2982),gabc:KYRIE_XI_GABC,
    bookWitnesses:Object.freeze(["Graduale Romanum (Solesmes, 1961), p. 38*",
      "Liber Usualis (Solesmes, 1961), p. 46"])}),
  Object.freeze({id:"GREGOBASE-1184",trackId:"KYRIE",title:"Kyrie VIII",version:"Solesmes",
    status:"RESEARCH_EXAMPLE_NOT_MASS_SETTING",
    provenance:"GREGOBASE_CC0_TRANSCRIPTION",
    sourceUrl:source(1184),svgUrl:svg(1184),gabcUrl:gabc(1184),gabc:KYRIE_VIII_GABC,
    bookWitnesses:Object.freeze(["Graduale Romanum (Solesmes, 1961), p. 28*",
      "Liber Usualis (Solesmes, 1961), p. 37"])}),
]);
export const SCHOLA_SCORE_PILOT=SCHOLA_SCORE_CATALOGUE[0];
export const SCHOLA_SCORE_TRACK_IDS=Object.freeze([
  "INTROIT","KYRIE","GLORIA","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
  "CREDO","OFFERTORY","SANCTUS_BENEDICTUS","AGNUS_DEI","COMMUNION",
]);
export function availableNativeScholaScores(trackId){
  return Object.freeze(SCHOLA_SCORE_CATALOGUE.filter(score=>score.trackId===String(trackId??"")));
}
// Explicit research-preview selection only. No date/feast/form default and no
// claim about the tune being performed in the building.
export function resolveNativeScholaScore({trackId,selectedScoreId=null}={}){
  const id=String(trackId??"");
  if(!SCHOLA_SCORE_TRACK_IDS.includes(id))
    return Object.freeze({status:"NO_SUPPORTED_SCHOLA_TRACK",score:null});
  const candidates=availableNativeScholaScores(id);
  if(!candidates.length)
    return Object.freeze({status:"NO_VERIFIED_SCORE_SELECTION",score:null});
  const selected=candidates.find(score=>score.id===selectedScoreId);
  if(!selected)return Object.freeze({status:"OPTIONAL_EXAMPLE_AVAILABLE",score:null,
    exampleId:candidates[0].id,availableIds:Object.freeze(candidates.map(s=>s.id))});
  return Object.freeze({status:"EXAMPLE_ONLY_NOT_SELECTED_FOR_MASS",
    score:selected,actualChoirMelody:"UNKNOWN"});
}
export function scoreReadingProgress({scrollTop=0,scrollHeight=0,clientHeight=0}={}){
  const max=Math.max(0,Number(scrollHeight||0)-Number(clientHeight||0));
  return max>0?Math.min(1,Math.max(0,Number(scrollTop||0)/max)):0;
}
export function scoreReadingStep(clientHeight){
  // Overlap staves rather than jump blind; still manual, not music timing.
  return Math.max(80,Math.round(Math.max(0,Number(clientHeight)||0)*.72));
}

const CSS=String.raw`
.ao-chant-score-launch[hidden],.ao-chant-score-panel[hidden],.ao-chant-score-dialog[hidden]{display:none!important}
.ao-chant-score-launch{position:absolute;right:62px;top:7px;z-index:11;
  min-height:26px;padding:4px 7px;font-size:8px!important;letter-spacing:.04em!important}
.ao-schola-dock[data-score-available="true"] .ao-schola-title{padding-right:165px}
@media(max-width:760px){.ao-chant-score-launch{right:61px;top:3px}
 .ao-schola-dock[data-score-available="true"] .ao-schola-title{padding-right:159px}}
.ao-schola-dock[data-notation="true"]:not([data-collapsed="true"]),
.ao-schola-dock[data-shared="true"][data-notation="true"]:not([data-collapsed="true"]){
  height:min(430px,42dvh)!important;max-height:min(430px,42dvh)!important;min-height:260px!important
}
.ao-schola-dock[data-notation="true"] .ao-schola-main,
.ao-schola-dock[data-notation="true"] .ao-schola-meta{display:none!important}
.ao-schola-dock[data-notation="true"]{display:flex!important;flex-direction:column}
.ao-chant-score-panel{min-height:0;flex:1;display:flex;flex-direction:column;gap:7px;margin-top:4px}
.ao-chant-score-tools{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.ao-chant-score-choices{min-width:120px;max-width:55%;min-height:28px;padding:4px 8px;
  color:#f1ede4;background:#202a35;border:1px solid #5b636c;border-radius:6px;
  font:500 11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.ao-chant-score-commands{display:flex;gap:5px;align-items:center}
.ao-chant-score-commands button{color:#eee9db;background:#252f39;border:1px solid #56606b;
  border-radius:5px;min-height:30px;min-width:34px;padding:4px 8px;cursor:pointer}
.ao-chant-score-commands button:disabled{opacity:.38;cursor:default}
.ao-chant-score-reading{overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;
  scrollbar-color:#8b8575 #eee8d9;overscroll-behavior:contain;touch-action:pan-y;
  flex:1;min-height:0;background:#faf8ee;color:#1c2329;border-radius:7px;
  scroll-behavior:smooth}
.ao-chant-score-reading svg{display:block;width:100%;height:auto;max-width:100%}
.ao-chant-score-reading [data-score-image][hidden],.ao-chant-score-reading [data-score-full-image][hidden]{display:none!important}
.ao-chant-score-fallback{padding:14px;font:500 13px/1.6 Georgia,serif;color:#444}
.ao-chant-score-caption{display:flex;justify-content:space-between;gap:12px;
  color:#b6bdc0;font:500 10px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.ao-chant-score-caption a{color:#d7c7a5}
.ao-chant-score-dialog{position:fixed;inset:0;z-index:100;display:flex;
  justify-content:center;align-items:center;padding:12px;background:rgba(4,7,12,.94);
  color:#eef0e8;font-family:var(--ao-font-ui,system-ui,sans-serif)}
.ao-chant-score-sheet{width:min(950px,100%);height:min(94dvh,1020px);display:flex;
  flex-direction:column;gap:10px;background:#121b24;border:1px solid #53616d;
  border-radius:12px;padding:clamp(12px,2vw,22px)}
.ao-chant-score-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
.ao-chant-score-title{font:normal 27px/1.15 Georgia,serif}
.ao-chant-score-close{border:1px solid #65717b;border-radius:6px;background:transparent;
  color:#f3efe5;padding:8px 12px;cursor:pointer}
.ao-chant-score-sheet .ao-chant-score-reading{flex:1}
.ao-chant-score-warning{font:500 11px/1.5 var(--ao-font-ui,system-ui,sans-serif);
  color:#c8cbd0;border-left:2px solid #be9a61;padding-left:8px;margin:0}
.ao-chant-score-panel button:focus-visible,
.ao-chant-score-dialog button:focus-visible,
.ao-chant-score-panel select:focus-visible{outline:2px solid #d3c29d;outline-offset:2px}
@media(max-width:760px){
 .ao-schola-dock[data-notation="true"]:not([data-collapsed="true"]){width:calc(100% - 24px)!important}
 .ao-chant-score-dialog{padding:4px}.ao-chant-score-sheet{height:98dvh;padding:10px;border-radius:8px}
 .ao-chant-score-choices{max-width:48%}
}
@media(prefers-reduced-motion:reduce){.ao-chant-score-reading{scroll-behavior:auto}}
`;

// Model never reads the priest's current text to advance the musical score.
export function installNativeScholaScorePilot(root,{onLayoutChange=()=>{}}={}){
  const dock=root?.querySelector?.(".ao-schola-dock");
  const controls=dock?.querySelector?.(".ao-schola-controls");
  const doc=root?.ownerDocument;
  if(!controls||!doc?.createElement)return Object.freeze({update:()=>{},destroy:()=>{}});
  const style=doc.createElement("style");style.textContent=CSS;root.appendChild(style);
  const trigger=doc.createElement("button");trigger.type="button";trigger.hidden=true;
  trigger.className="ao-schola-control ao-chant-score-launch";
  trigger.dataset.scholaScoreExample="true";trigger.textContent="GREGORIAN SCORE";
  trigger.setAttribute("aria-pressed","false");
  trigger.setAttribute("aria-label","Show Gregorian notation in Schola panel (reference selection only)");
  controls.appendChild(trigger);
  const panel=doc.createElement("section");panel.className="ao-chant-score-panel";panel.hidden=true;
  panel.setAttribute("aria-label","Continuous Gregorian notation, manually followed");
  panel.innerHTML=`<div class="ao-chant-score-tools">
    <select class="ao-chant-score-choices" data-score-choice aria-label="Reference Kyrie melody">
    </select><div class="ao-chant-score-commands">
      <button type="button" data-score-prev aria-label="Scroll notation upwards">↑</button>
      <button type="button" data-score-next aria-label="Advance notation downwards">↓</button>
      <button type="button" data-score-full aria-label="Expand Gregorian notation">FULL</button>
      <button type="button" data-score-hide aria-label="Return to Schola text">TEXT</button>
    </div></div>
    <div class="ao-chant-score-reading" data-score-reading tabindex="0"
      aria-label="Gregorian music manuscript; swipe or scroll manually">
      <div data-score-image aria-hidden="true"></div>
      <p class="ao-chant-score-fallback" data-score-fallback hidden>Notation unavailable while offline.
      The chant's GABC source remains available from GregoBase.</p>
    </div>
    <div class="ao-chant-score-caption"><span data-score-progress>MANUAL · 0%</span>
      <a data-score-source href="https://gregobase.selapa.net/chant.php?id=545"
        target="_blank" rel="noopener noreferrer">Source · GregoBase</a></div>`;
  dock.appendChild(panel);
  const dialogue=doc.createElement("section");
  dialogue.hidden=true;dialogue.className="ao-chant-score-dialog";
  dialogue.setAttribute("role","dialog");dialogue.setAttribute("aria-modal","true");
  dialogue.setAttribute("aria-label","Expanded Gregorian chant score");
  dialogue.innerHTML=`<div class="ao-chant-score-sheet">
    <div class="ao-chant-score-head"><span class="ao-chant-score-title" data-score-title>Gregorian chant</span>
      <button class="ao-chant-score-close" type="button" data-score-close>Close</button></div>
    <p class="ao-chant-score-warning">Reference score — not confirmation of what the choir sings.
      Follow manually; no recording or microphone is active.</p>
    <div class="ao-chant-score-reading" data-score-full-reading tabindex="0"
       aria-label="Full Gregorian score; scroll manually">
       <div data-score-full-image aria-hidden="true"></div>
       <p class="ao-chant-score-fallback" data-score-full-fallback hidden>Score unavailable offline.</p>
    </div><div class="ao-chant-score-caption">
      <span data-score-full-progress>MANUAL · 0%</span><a data-score-full-source
        href="https://gregobase.selapa.net/chant.php?id=545" target="_blank"
        rel="noopener noreferrer">Source · GregoBase</a></div></div>`;
  root.appendChild(dialogue);
  const select=panel.querySelector("[data-score-choice]");
  for(const item of availableNativeScholaScores("KYRIE")){
    const option=doc.createElement("option");option.value=item.id;
    option.textContent=item.title+" · reference";select.appendChild(option);
  }
  const viewport=panel.querySelector("[data-score-reading]");
  const fullViewport=dialogue.querySelector("[data-score-full-reading]");
  const picture=panel.querySelector("[data-score-image]");
  const fullPicture=dialogue.querySelector("[data-score-full-image]");
  let scoreId=SCHOLA_SCORE_PILOT.id;
  let isOpen=false, lastTrack=null, destroyed=false;
  const inlineEngraver=createOfflineChantEngraver({viewport:picture,document:doc});
  const expandedEngraver=createOfflineChantEngraver({viewport:fullPicture,document:doc});
  inlineEngraver.observe();expandedEngraver.observe();
  let renderedScoreId=null;
  let renderCounter=0;
  function chosen(){return SCHOLA_SCORE_CATALOGUE.find(s=>s.id===scoreId)||SCHOLA_SCORE_PILOT;}
  function updateProgress(){
    for(const [view,selector]of [[viewport,"[data-score-progress]"],[fullViewport,"[data-score-full-progress]"]]){
      const node=(view===viewport?panel:dialogue).querySelector(selector);
      if(node)node.textContent="MANUAL · "+Math.round(scoreReadingProgress({
        scrollTop:view.scrollTop,scrollHeight:view.scrollHeight,clientHeight:view.clientHeight})*100)+"%";
    }
  }
  function applyScore({reset=true}={}){
    const value=chosen();
    const request=++renderCounter;
    select.value=value.id;
    panel.querySelector("[data-score-source]").href=value.sourceUrl;
    dialogue.querySelector("[data-score-full-source]").href=value.sourceUrl;
    dialogue.querySelector("[data-score-title]").textContent=value.title;
    if(reset){viewport.scrollTop=0;fullViewport.scrollTop=0;}
    for(const [container,fallBack] of [[picture,panel.querySelector("[data-score-fallback]")],
      [fullPicture,dialogue.querySelector("[data-score-full-fallback]")]]){
      container.hidden=false;fallBack.hidden=true;
    }
    // Both views render from the verified GABC, never from a remote SVG.
    // Each view reflows independently as its available width changes.
    const tasks=[[inlineEngraver,picture,panel.querySelector("[data-score-fallback]")],
      [expandedEngraver,fullPicture,dialogue.querySelector("[data-score-full-fallback]")]];
    for(const [renderer,container,fallBack] of tasks){
      const job=renderedScoreId===value.id ? renderer.reflow():renderer.engrave(value.gabc);
      Promise.resolve(job).then(()=>{
        if(destroyed||request!==renderCounter)return;
        container.hidden=false;fallBack.hidden=true;updateProgress();
      }).catch(()=>{
        if(destroyed||request!==renderCounter)return;
        container.hidden=true;fallBack.hidden=false;
      });
    }
    renderedScoreId=value.id;
    updateProgress();
  }
  function updateVisible(){
    dock.dataset.notation=String(isOpen);
    trigger.setAttribute("aria-pressed",String(isOpen));
    trigger.textContent=isOpen?"CLOSE SCORE":"GREGORIAN SCORE";
    panel.hidden=!isOpen;
    onLayoutChange();
    if(isOpen)void inlineEngraver.reflow();
  }
  function hideFull({restoreFocus=true}={}){
    if(dialogue.hidden)return;
    // Carry back the relative reading position, never assign a liturgical cue.
    const ratio=scoreReadingProgress({scrollTop:fullViewport.scrollTop,
      scrollHeight:fullViewport.scrollHeight,clientHeight:fullViewport.clientHeight});
    dialogue.hidden=true;
    viewport.scrollTop=ratio*Math.max(0,viewport.scrollHeight-viewport.clientHeight);
    updateProgress();
    if(restoreFocus)panel.querySelector("[data-score-full]")?.focus?.();
  }
  function close(){
    hideFull({restoreFocus:false});isOpen=false;updateVisible();
    if(!trigger.hidden)trigger.focus?.();
  }
  function open(){
    if(trigger.hidden)return;
    isOpen=true;updateVisible();applyScore({reset:false});
    panel.querySelector("[data-score-choice]")?.focus?.();
  }
  function changeTrack(schola){
    const track=String(schola?.trackId??"");
    trigger.hidden=track!=="KYRIE";
    dock.dataset.scoreAvailable=String(track==="KYRIE");
    if(track!=="KYRIE"&&isOpen){isOpen=false;hideFull({restoreFocus:false});updateVisible();}
    lastTrack=track;
  }
  function scroll(view,dir){
    const increment=scoreReadingStep(view.clientHeight);
    view.scrollBy?.({top:increment*dir,behavior:"smooth"});
    if(!view.scrollBy)view.scrollTop=Math.max(0,view.scrollTop+increment*dir);
    updateProgress();
  }
  const onTrigger=()=>isOpen?close():open();
  const onPanelClick=event=>{
    const control=event.target?.closest?.("button");
    if(!control)return;
    if(control.hasAttribute("data-score-hide")){close();return;}
    if(control.hasAttribute("data-score-prev")){scroll(viewport,-1);return;}
    if(control.hasAttribute("data-score-next")){scroll(viewport,1);return;}
    if(control.hasAttribute("data-score-full")){
      const ratio=scoreReadingProgress({scrollTop:viewport.scrollTop,
        scrollHeight:viewport.scrollHeight,clientHeight:viewport.clientHeight});
      dialogue.hidden=false;applyScore({reset:false});
      void expandedEngraver.reflow();
      fullViewport.scrollTop=ratio*Math.max(0,fullViewport.scrollHeight-fullViewport.clientHeight);
      updateProgress();dialogue.querySelector("[data-score-close]")?.focus?.();
    }
  };
  const onDialogueClick=event=>{
    if(event.target===dialogue||event.target?.closest?.("[data-score-close]"))hideFull();
  };
  const onDialogKey=event=>{
    if(event.key==="Escape"&&!dialogue.hidden){event.stopPropagation();hideFull();}
    // Prevent Mass-card arrow navigation while the modal has keyboard focus.
    if(["ArrowLeft","ArrowRight"].includes(event.key)){event.stopPropagation();}
  };
  const onSelect=()=>{scoreId=select.value;applyScore();};
  const onPanelKey=event=>{
    // Inline score keyboard navigation is independent from Mass card navigation.
    if(["ArrowLeft","ArrowRight"].includes(event.key))event.stopPropagation();
  };
  const onScroll=()=>updateProgress();
  trigger.addEventListener("click",onTrigger);
  panel.addEventListener("click",onPanelClick);
  panel.addEventListener("keydown",onPanelKey);
  select.addEventListener("change",onSelect);
  dialogue.addEventListener("click",onDialogueClick);
  dialogue.addEventListener("keydown",onDialogKey);
  viewport.addEventListener("scroll",onScroll);
  fullViewport.addEventListener("scroll",onScroll);
  return Object.freeze({
    update(schola){
      if(destroyed)return;
      changeTrack(schola);
      // Never use schola.index/segmentId as a score-position clock.
    },
    hide:close,
    getState:()=>Object.freeze({open:isOpen,referenceScoreId:scoreId,
      actualChoirMelody:"UNKNOWN",lastTrack}),
    destroy(){
      destroyed=true;
      trigger.removeEventListener("click",onTrigger);
      panel.removeEventListener("click",onPanelClick);
      panel.removeEventListener("keydown",onPanelKey);
      select.removeEventListener("change",onSelect);
      dialogue.removeEventListener("click",onDialogueClick);
      dialogue.removeEventListener("keydown",onDialogKey);
      inlineEngraver.destroy();expandedEngraver.destroy();
      viewport.removeEventListener("scroll",onScroll);
      fullViewport.removeEventListener("scroll",onScroll);
      trigger.remove?.();panel.remove?.();dialogue.remove?.();style.remove?.();
      delete dock.dataset.notation;
      onLayoutChange();
    },
  });
}
