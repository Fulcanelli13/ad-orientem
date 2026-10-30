/**
 * Claude Round 2 Rosary presentation pilot — non-owning visual adaptation.
 *
 * The live Rosary donor (AO_ROSARY_V381) owns all prayer words, positions,
 * method choices, language faces, clicks and persistence. This module only
 * shortens the existing chapter rail and captions its real bead controls.
 */
import {rosaryCurrentChapter} from "./rosary-card-chapters.js";

export const ROSARY_R2_PILOT_SCHEMA = "ao-rosary-r2-source-projection-v1";
export function rosaryR2PilotEnabled(win=globalThis){
 try { return new URLSearchParams(win.location?.search||"").get("aoRosaryR2Pilot")==="1"; }
 catch { return false; }
}
const ROMANS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"];
export function rosaryR2PositionModel(steps,index,chapters,{french=false}={}){
 if(!Array.isArray(steps)||!steps.length||!Array.isArray(chapters)||!chapters.length||
    !Number.isInteger(index)||index<0||index>=steps.length) return null;
 const step=steps[index],ch=chapters[rosaryCurrentChapter(chapters,index)];
 if(!ch)return null;
 const mi=Number.isInteger(step?.mi)&&step.mi>=0?step.mi:null;
 const cues=mi===null?[]:steps.map((s,i)=>({s,i}))
  .filter(x=>x.s?.mi===mi&&x.s.cue===true&&Number.isInteger(x.s.bead)&&x.s.bead>0);
 const ordinal=cues.findIndex(x=>x.i===index);
 return Object.freeze({
  chapterId:ch.id,
  chapterTitle:ch.title,
  chapterStart:ch.start,
  cuePosition:ordinal>=0?ordinal+1:null,
  cueTotal:cues.length,
  cueLabel:ordinal>=0
    ? (french?"Grain ":"Bead ")+(ordinal+1)+" / "+cues.length
    : null
 });
}
const CSS = `
/* Source-owned R2 pilot. The original chapter and bead buttons remain clickable. */
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline{
 padding:5px 7px!important;background:var(--bg,#10151a)!important
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline .aoDevoStops{
 gap:5px!important;scroll-padding-inline:6px
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline .aoDevoStop{
 flex:0 0 auto!important;min-width:44px!important;max-width:200px;
 min-height:44px!important;display:flex!important;align-items:center!important;
 justify-content:center!important;gap:5px!important;padding:7px 10px!important;
 border-radius:999px!important;text-align:center!important
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline .aoDevoStop[aria-current="step"]{
 background:color-mix(in srgb,var(--liturgical,#c6ad83) 16%,var(--surface-1,#151c24))!important;
 border-color:var(--liturgical,#c6ad83)!important
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline .aoDevoStopNumber{
 font:650 12px/1.2 var(--ao-font-ui,system-ui,sans-serif)!important;
 letter-spacing:0!important
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline .aoDevoStop:not([aria-current="step"]) .aoDevoStopTitle{
 display:none!important
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline .aoDevoStop[aria-current="step"] .aoDevoStopTitle{
 display:block!important;font:500 12px/1.2 var(--ao-font-liturgical,Georgia,serif)!important;
 overflow:hidden;text-overflow:ellipsis;white-space:nowrap!important;max-width:132px
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryActiveCard{
 border-radius:12px!important;background:var(--surface-1,#151c24)!important;
 border:1px solid var(--border,rgba(255,255,255,.13))!important
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryActiveCard .aoRosaryPrayerScroll{
 font:400 clamp(19px,4.8vw,21px)/1.6 var(--ao-font-liturgical,Georgia,serif)
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryR2NativePosition{
 display:block;max-width:100%;margin:0 0 5px;text-align:center;
 color:var(--muted,#aeb2b8);font:600 11px/1.35 var(--ao-font-ui,system-ui,sans-serif)
}
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] [data-lab-rosary-next],
#aoPrayerBookRoot[data-ao-rosary-r2="v1"] [data-lab-rosary-prev]{
 min-height:44px!important
}
@media(max-width:359px){
 #aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline{padding:3px 4px!important}
 #aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryNamedTimeline .aoDevoStop{padding:5px 8px!important}
 #aoPrayerBookRoot[data-ao-rosary-r2="v1"] .aoRosaryActiveCard .aoRosaryPrayerScroll{font-size:19px}
}
`;
export function installRosaryR2Styles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById("ao-rosary-r2-pilot-style"))return false;
 const style=doc.createElement("style");style.id="ao-rosary-r2-pilot-style";
 style.textContent=CSS;doc.head?.append(style);return true;
}
/**
 * Read-only decoration. It never creates buttons, sets AO_ROSARY_V381 state,
 * rewrites prayers, or changes Latin/vernacular faces.
 */
export function applyRosaryR2Pilot({root,steps,index,chapters,french=false}={}){
 const shell=root?.querySelector?.(".pbShell");
 const rail=shell?.querySelector?.(":scope > .aoRosaryNamedTimeline");
 if(!shell||!rail||!Array.isArray(chapters)||!chapters.length)return false;
 const model=rosaryR2PositionModel(steps,index,chapters,{french});
 if(!model)return false;
 installRosaryR2Styles(shell.ownerDocument);
 root.dataset.aoRosaryR2="v1";
 const buttons=[...rail.querySelectorAll("[data-ao-rosary-chapter]")];
 for(let i=0;i<buttons.length;i++){
  const ch=chapters[i],button=buttons[i];
  if(!ch)continue;
  const symbol=Number.isInteger(ch.mi)&&ch.mi>=0
   ? ROMANS[ch.mi]||String(ch.mi+1)
   : ch.id==="opening"?(french?"Début":"Open")
   : ch.id==="conclusion"?(french?"Fin":"End"):"·";
  const number=button.querySelector(".aoDevoStopNumber");
  if(number)number.textContent=symbol;
  button.setAttribute("aria-label",ch.title);
  button.setAttribute("title",ch.title);
 }
 const native=shell.querySelector(".lab-bead-stage");
 if(native){
  let caption=native.querySelector(":scope > .aoRosaryR2NativePosition");
  if(!caption){
   caption=shell.ownerDocument.createElement("small");
   caption.className="aoRosaryR2NativePosition";
   caption.dataset.aoRosaryR2ReadOnly="";
   native.prepend(caption);
  }
  caption.textContent=model.cueLabel||model.chapterTitle;
 }
 shell.dataset.aoRosaryR2Chapter=model.chapterId;
 shell.dataset.aoRosaryR2CanonicalStep=String(index);
 return true;
}
