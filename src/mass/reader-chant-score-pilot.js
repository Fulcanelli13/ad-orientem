// Gregorian notation pilot for the native Schola dock.
// This file never selects a melody from the Mass date, card, or priest's action.
// One CC0 GregoBase sample is exposed only after an explicit user action.
// Release gate: it is NOT a canonical 1962 Kyriale assignment.
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

export const SCHOLA_SCORE_PILOT=Object.freeze({
  id:"GREGOBASE-545",trackId:"KYRIE",title:"Kyrie XVI",
  status:"EXAMPLE_ONLY_NOT_SELECTED_FOR_MASS",
  provenance:"GREGOBASE_CC0_TRANSCRIPTION",
  transcriptionAuthor:"Andrew Hinkley",
  sourceUrl:"https://gregobase.selapa.net/chant.php?id=545",
  gabcUrl:"https://gregobase.selapa.net/download.php?elem=1&format=gabc&id=545",
  svgUrl:"https://gregobase.selapa.net/download.php?format=svg&id=545",
  bookWitnesses:Object.freeze([
    "Graduale Romanum (Solesmes, 1961), p. 54*",
    "Liber Usualis (Solesmes, 1961), p. 59",
    "Chants of the Church (Solesmes, 1956), p. 40",
  ]),
  gabc:KYRIE_XVI_GABC,
});

export const SCHOLA_SCORE_TRACK_IDS=Object.freeze([
  "INTROIT","KYRIE","GLORIA","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
  "CREDO","OFFERTORY","SANCTUS_BENEDICTUS","AGNUS_DEI","COMMUNION",
]);

// No Gregorian tune follows automatically from a text match. The
// selectedScoreId is deliberately required before a score can be considered
// associated with a Mass. This pilot always fails closed as an example.
export function resolveNativeScholaScore({trackId,selectedScoreId=null}={}){
  const id=String(trackId??"");
  if(!SCHOLA_SCORE_TRACK_IDS.includes(id))
    return Object.freeze({status:"NO_SUPPORTED_SCHOLA_TRACK",score:null});
  if(id!=="KYRIE")
    return Object.freeze({status:"NO_VERIFIED_SCORE_SELECTION",score:null});
  if(selectedScoreId!==SCHOLA_SCORE_PILOT.id)
    return Object.freeze({status:"OPTIONAL_EXAMPLE_AVAILABLE",score:null,
      exampleId:SCHOLA_SCORE_PILOT.id});
  return Object.freeze({status:"EXAMPLE_ONLY_NOT_SELECTED_FOR_MASS",
    score:SCHOLA_SCORE_PILOT,actualChoirMelody:"UNKNOWN"});
}

const CSS=`
.ao-chant-score-launch[hidden],.ao-chant-score-dialog[hidden]{display:none!important}
.ao-chant-score-launch{font-size:10px!important;letter-spacing:.08em!important}
.ao-chant-score-dialog{position:fixed;inset:0;z-index:100;display:flex;
  justify-content:center;align-items:center;padding:16px;
  background:rgba(3,6,11,.88);color:#edf0e8;font-family:var(--ao-font-ui,system-ui,sans-serif)}
.ao-chant-score-sheet{width:min(820px,100%);max-height:min(90dvh,900px);
  overflow:auto;background:#111923;border:1px solid #46515a;border-radius:14px;
  padding:clamp(18px,3vw,30px);box-shadow:0 28px 90px rgba(0,0,0,.55)}
.ao-chant-score-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.ao-chant-score-overline{color:#aab4c0;font-size:10px;letter-spacing:.15em;text-transform:uppercase}
.ao-chant-score-title{margin:8px 0 0;font:normal clamp(26px,4vw,37px)/1.15 Georgia,serif}
.ao-chant-score-close{background:transparent;color:#edf0e8;border:1px solid #52606b;
  padding:8px 12px;border-radius:7px;cursor:pointer;font-size:14px}
.ao-chant-score-warning{font-size:13px;line-height:1.55;color:#c5cbd0;
  margin:20px 0;border-left:2px solid #ae9169;padding-left:12px}
.ao-chant-score-frame{padding:14px;min-height:145px;border-radius:8px;
  background:#faf8ee;color:#242424;overflow:auto}
.ao-chant-score-frame img{width:100%;height:auto;display:block}
.ao-chant-score-source{font-size:12px;line-height:1.65;color:#adb5bc;margin-top:15px}
.ao-chant-score-source a{color:#d0c1a2;text-decoration:underline;text-underline-offset:3px}
.ao-chant-score-fallback{color:#383838;font-size:12px}
@media(max-width:560px){.ao-chant-score-dialog{padding:7px}
 .ao-chant-score-sheet{max-height:96dvh;padding:16px;border-radius:10px}
 .ao-chant-score-frame{padding:8px}}
@media(prefers-reduced-motion:reduce){.ao-chant-score-dialog *{animation:none!important}}
`;

// Browser DOM adapter; caller owns the reader and the Schola clock.
// No global listeners, no polling, no DOM injection of untrusted GABC.
export function installNativeScholaScorePilot(root){
  const dock=root?.querySelector?.(".ao-schola-dock");
  const controls=dock?.querySelector?.(".ao-schola-controls");
  const document=root?.ownerDocument;
  if(!controls||!document?.createElement)
    return Object.freeze({update:()=>{},destroy:()=>{}});
  const style=document.createElement("style");
  style.textContent=CSS;
  root.appendChild(style);
  const trigger=document.createElement("button");
  trigger.type="button";trigger.hidden=true;
  trigger.className="ao-schola-control ao-chant-score-launch";
  trigger.dataset.scholaScoreExample="true";
  trigger.textContent="SCORE";
  trigger.setAttribute("aria-label","Open an illustrative Kyrie XVI score; not the choir's selected melody");
  controls.appendChild(trigger);
  const dialog=document.createElement("section");
  dialog.className="ao-chant-score-dialog";
  dialog.hidden=true;
  dialog.setAttribute("role","dialog");
  dialog.setAttribute("aria-modal","true");
  dialog.setAttribute("aria-label","Gregorian notation example");
  dialog.innerHTML=`<div class="ao-chant-score-sheet">
    <div class="ao-chant-score-head"><div><div class="ao-chant-score-overline">Gregorian notation · source example</div>
      <h2 class="ao-chant-score-title">Kyrie XVI</h2></div>
      <button class="ao-chant-score-close" type="button" data-score-close aria-label="Close chant score">×</button></div>
    <p class="ao-chant-score-warning">Illustrative score only. This melody has <strong>not</strong> been
      verified as the setting sung at this Mass. Opening the score does not change the Schola track,
      the priest's actions, or the liturgical selection.</p>
    <div class="ao-chant-score-frame">
      <img alt="Kyrie XVI in Gregorian square-note notation; externally sourced from GregoBase"
        data-score-image loading="lazy">
      <p class="ao-chant-score-fallback" data-score-fallback hidden>
        The notation image is unavailable offline.
        Use the linked source when connected.</p>
    </div>
    <p class="ao-chant-score-source">CC0 GABC transcription: Andrew Hinkley ·
      <a href="https://gregobase.selapa.net/chant.php?id=545" target="_blank" rel="noopener noreferrer">GregoBase #545</a> ·
      <a href="https://gregobase.selapa.net/download.php?elem=1&amp;format=gabc&amp;id=545"
      target="_blank" rel="noopener noreferrer">Source GABC</a>.
      Witnesses: Graduale Romanum (1961), p. 54*; Liber Usualis (1961), p. 59.</p>
  </div>`;
  root.appendChild(dialog);
  const image=dialog.querySelector("[data-score-image]");
  const fallback=dialog.querySelector("[data-score-fallback]");
  const close=()=>{
    dialog.hidden=true;
    trigger.setAttribute("aria-expanded","false");
    if(!trigger.hidden)trigger.focus?.();
  };
  const open=()=>{
    // A demonstrative score is never a user-selected Mass melody.
    if(trigger.hidden)return;
    dialog.hidden=false;
    trigger.setAttribute("aria-expanded","true");
    if(image&&!image.getAttribute("src"))
      image.setAttribute("src",SCHOLA_SCORE_PILOT.svgUrl);
    dialog.querySelector("[data-score-close]")?.focus?.();
  };
  const onTrigger=()=>open();
  const onDialogClick=event=>{
    if(event.target===dialog || event.target?.closest?.("[data-score-close]"))close();
  };
  const onDialogKey=event=>{
    if(event.key==="Escape"&&!dialog.hidden){event.stopPropagation();close();}
  };
  const onError=()=>{
    if(image)image.hidden=true;
    if(fallback)fallback.hidden=false;
  };
  trigger.addEventListener("click",onTrigger);
  dialog.addEventListener("click",onDialogClick);
  dialog.addEventListener("keydown",onDialogKey);
  image?.addEventListener("error",onError);
  return Object.freeze({
    update(schola){
      const available=resolveNativeScholaScore({trackId:schola?.trackId}).status==="OPTIONAL_EXAMPLE_AVAILABLE";
      trigger.hidden=!available;
      if(!available && !dialog.hidden){dialog.hidden=true;trigger.setAttribute("aria-expanded","false");}
    },
    destroy(){
      trigger.removeEventListener("click",onTrigger);
      dialog.removeEventListener("click",onDialogClick);
      dialog.removeEventListener("keydown",onDialogKey);
      image?.removeEventListener("error",onError);
      style.remove?.();trigger.remove?.();dialog.remove?.();
    },
  });
}
