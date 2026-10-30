/**
 * F07 Chaplet — opt-in presentation adapter for the existing Divine Mercy event stream.
 * Ownership remains in devotional-methods-v1 / MERCY. No new prayers, counts,
 * completion state, or tap-anywhere advances are introduced here.
 */
import {mercyBeadNavigationModel} from "./mercy-bead-navigation.js";
export const CHAPLET_F07_PILOT_SCHEMA="ao-chaplet-f07-crown-v1";
export function chapletF07PilotEnabled(win=globalThis){
 try{return new URLSearchParams(win.location?.search||"").get("aoChapletF07Pilot")==="1"}
 catch{return false}
}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderMercyF07Crown(steps,index,{french=false}={}){
 const m=mercyBeadNavigationModel(steps,index,{french});
 const beads=steps.map((step,i)=>({step,index:i})).filter(x=>x.step.group==="large-bead"||x.step.group==="small-bead");
 if(beads.length!==55)throw new TypeError("F07 requires five source-owned decades of eleven events");
 const circles=beads.map(({step,index:stepIndex},i)=>{
  const angle=2*Math.PI*(i/55);
  const cx=(60+43*Math.sin(angle)).toFixed(2),cy=(60-43*Math.cos(angle)).toFixed(2);
  const state=stepIndex===index?"active":stepIndex<index?"passed":"upcoming";
  const large=step.group==="large-bead";
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+(large?3.5:2.2)+'" class="aoF07Bead aoF07Bead-'+state+(large?" aoF07Large":"")+'" />';
 }).join("");
 const caption=m.caption,description=m.shortName;
 return '<figure class="aoF07CrownBand" data-ao-f07-crown data-position="'+index+'" data-total="'+steps.length+'" data-decade="'+(m.activeDecade??"")+'" aria-label="'+esc((french?"Position dans le chapelet : ":"Chaplet position: ")+caption)+'">'+
  '<svg class="aoF07CrownDiagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-hidden="true">'+
   '<circle class="aoF07CrownTrack" cx="60" cy="60" r="43"/>'+circles+
   '<path class="aoF07CrownCross" d="M60 50v21M50 60.5h20"/>'+
  '</svg>'+
  '<figcaption class="aoF07CrownText"><small>'+esc(french?"COURONNE DU CHAPELET":"WHOLE CHAPLET")+'</small>'+
   '<strong>'+esc(caption)+'</strong><span>'+esc(description)+'</span>'+
  '</figcaption></figure>';
}
const F07_STYLE=`
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"]{display:flex;flex-direction:column}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"]>.aoBatch02MercyOpenings{order:10}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyBeadNavigation{margin-top:0!important;margin-bottom:0!important}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoCardHead{padding:7px 10px 4px!important}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoCardScroll{padding-top:8px!important}

#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownBand{display:grid;grid-template-columns:118px minmax(0,1fr);align-items:center;gap:12px;width:100%;min-width:0;margin:2px 0 6px;padding:4px 12px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:14px;box-sizing:border-box;background:var(--surface-1,rgba(25,30,35,.18))}
#aoPray435930 .aoF07CrownDiagram{width:118px;height:118px;display:block}
#aoPray435930 .aoF07CrownTrack{fill:none;stroke:var(--border,rgba(220,220,220,.2));stroke-width:.65}
#aoPray435930 .aoF07Bead{stroke:var(--liturgical,#d0b184);stroke-width:.7;fill:var(--surface-2,#35404a)}
#aoPray435930 .aoF07Bead-passed{fill:var(--liturgical,#cbb28b);opacity:.55}
#aoPray435930 .aoF07Bead-active{fill:#ad5651;stroke:#ecb4ac;stroke-width:1.8}
#aoPray435930 .aoF07Large{stroke-width:1.1}
#aoPray435930 .aoF07CrownCross{fill:none;stroke:var(--liturgical,#cbb28b);stroke-width:1.5;stroke-linecap:round;opacity:.7}
#aoPray435930 .aoF07CrownText{min-width:0;display:flex;flex-direction:column;gap:7px;font-family:var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoF07CrownText small{font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07CrownText strong{font:500 clamp(18px,4.5vw,23px)/1.25 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#f1e7d7)}
#aoPray435930 .aoF07CrownText span{font:400 13px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b9b6b3)}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyStrand,
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyBeadPosition{display:none}
@media(max-width:390px){
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownBand{grid-template-columns:84px minmax(0,1fr);gap:8px;padding:2px 7px;margin:0 0 3px}
 #aoPray435930 .aoF07CrownDiagram{width:84px;height:84px}
 #aoPray435930 .aoF07CrownText{gap:4px}
 #aoPray435930 .aoF07CrownText strong{font-size:17px}
 #aoPray435930 .aoF07CrownText span{font-size:12px}
}
@media(max-width:359px){
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownBand{grid-template-columns:74px minmax(0,1fr);gap:6px;padding:2px 6px}
 #aoPray435930 .aoF07CrownDiagram{width:74px;height:74px}
 #aoPray435930 .aoF07CrownText{gap:3px}
 #aoPray435930 .aoF07CrownText strong{font-size:15px;line-height:1.2}
 #aoPray435930 .aoF07CrownText span{font-size:11px}
}
`;
export function installChapletF07Styles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-chaplet-f07-style"))return;
 const tag=doc.createElement("style");tag.id="ao-chaplet-f07-style";tag.textContent=F07_STYLE;doc.head.append(tag);
}
installChapletF07Styles();
