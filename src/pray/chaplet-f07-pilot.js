/**
 * F07 Chaplet — opt-in presentation adapter for the existing Divine Mercy event stream.
 * Ownership remains in devotional-methods-v1 / MERCY. No new prayers, counts,
 * completion state, or tap-anywhere advances are introduced here.
 */
import {mercyBeadNavigationModel} from "./mercy-bead-navigation.js";
import {mercyStepText} from "./devotional-methods-v1.js";
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
/**
 * Recitation typography only. Split an existing, completely source-owned
 * prayer at a fixed clause boundary. ℣/℟ are communal reading cues, not
 * additional words or a new prescribed liturgical rite. The complete
 * untouched source text is returned when no exact split is available.
 */
export function mercyF07RoleLines(step,language="en"){
 if(!step||!["en","fr"].includes(language))return null;
 const text=mercyStepText(step,language);
 if(typeof text!=="string"||!text)return null;
 const split=step.group==="large-bead"?(language==="fr"?" en réparation de":" in atonement for"):
   step.group==="small-bead"?(language==="fr"?" sois miséricordieux":" have mercy"):
   step.group==="conclusion"?(language==="fr"?" prends pitié":" have mercy"):null;
 if(!split)return {text,parts:null};
 const at=text.lastIndexOf(split);
 if(at<1)return {text,parts:null};
 const leader=text.slice(0,at),response=text.slice(at);
 if(leader+response!==text)throw new TypeError("Divine Mercy text split altered source");
 return {text,parts:[leader,response]};
}
export function mercyF07RoleMarkup(step,language="en",{group=false}={}){
 const model=mercyF07RoleLines(step,language);
 if(!model)return "";
 if(!model.parts)return '<p class="aoF07MercyWhole">'+esc(model.text)+'</p>';
 const [leader,response]=model.parts;
 const leaderName=language==="fr"?"GUIDE":"LEADER";
 const responseName=language==="fr"?"TOUS":"ALL";
 return '<div class="aoF07MercyRoles" data-f07-group="'+(group?"with-others":"alone")+'">'+
  '<div class="aoF07MercyRole aoF07MercyRole-Leader"><span class="aoF07MercyRoleLabel" aria-hidden="true">℣</span>'+
   '<span class="aoF07MercyRoleName">'+leaderName+'</span><p>'+esc(leader)+'</p></div>'+
  '<div class="aoF07MercyRole aoF07MercyRole-Response"><span class="aoF07MercyRoleLabel" aria-hidden="true">℟</span>'+
   '<span class="aoF07MercyRoleName">'+responseName+'</span><p>'+esc(response.trimStart())+'</p></div></div>';
}
const F07_STYLE=`
/* Claude F07 m2/m3: keep current canonical prayer primary; retired
   neighbouring decade prayers are readable but low-emphasis. */
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"]{min-width:0}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07MercyRecitation{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:2px 0 5px;min-height:32px}
#aoPray435930 .aoF07MercyRecitation>span{font:500 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07MercyRecitation>div{display:flex;gap:4px}
#aoPray435930 .aoF07MercyRecitation button{min-height:32px;min-width:56px;padding:5px 10px;border-radius:999px;background:transparent;border:1px solid var(--border,rgba(210,185,144,.26));font:500 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#aaa)}
#aoPray435930 .aoF07MercyRecitation button[aria-pressed="true"]{background:rgba(210,185,144,.15);color:var(--text,#eee);border-color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07MercyChapterChips{display:flex;gap:5px;min-height:29px;overflow-x:auto;scrollbar-width:none;padding:0 0 5px;margin:2px 0 3px}
#aoPray435930 .aoF07MercyChapterChips::-webkit-scrollbar{display:none}
#aoPray435930 .aoF07MercyChapterChips button{flex:0 0 auto;height:29px;min-width:34px;padding:0 8px;border-radius:999px;border:1px solid var(--border,rgba(210,185,144,.3));background:transparent;color:var(--muted,#bab2a3);font:500 11px/1 var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoF07MercyChapterChips button[aria-current="step"]{border-color:var(--liturgical,#cbb28b);color:var(--text,#eee);background:rgba(210,185,144,.16)}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyPhases{display:none}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoSequenceTimeline{display:none}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine{transition:opacity .12s ease;opacity:.34;filter:none}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine.aoMercyPrayer{opacity:1}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine:not(.aoMercyPrayer)>p{font-size:14px!important;line-height:1.35!important}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine.aoMercyPrayer>p{font-size:20px!important;line-height:1.52!important}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine.aoMercyPrayer>small{color:var(--liturgical,#cbb28b);font-size:11px}
#aoPray435930 .aoF07MercyRoles{display:flex;flex-direction:column;gap:10px;margin:6px 0 4px}
#aoPray435930 .aoF07MercyRole{display:grid;grid-template-columns:16px 44px minmax(0,1fr);gap:5px;align-items:baseline;line-height:1.45}
#aoPray435930 .aoF07MercyRoleLabel{font:400 17px/1 var(--ao-font-liturgical,Georgia,serif);color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07MercyRoleName{font:600 9px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#aaa);letter-spacing:.08em}
#aoPray435930 .aoF07MercyRole p{margin:0;font:400 20px/1.48 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#e8dfd4)}
#aoPray435930 .aoF07MercyRoles[data-f07-group="with-others"] .aoF07MercyRole-Response p{font-weight:700}
#aoPray435930 .aoF07MercyRole-Response .aoF07MercyRoleLabel,
#aoPray435930 .aoF07MercyRole-Response .aoF07MercyRoleName{color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07MercyDock{display:flex;gap:8px;align-items:center;justify-content:space-between;position:sticky;bottom:0;z-index:4;min-height:56px;padding:6px 4px;background:var(--surface-1,#231d18)}
#aoPray435930 .aoF07MercyDock button{min-height:44px;border-radius:999px;font:500 13px/1 var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoF07MercyDockPrev{width:44px;min-width:44px;border:1px solid var(--border,rgba(210,185,144,.34));background:transparent;color:var(--text,#eee);font-size:23px!important}
#aoPray435930 .aoF07MercyDockNext{min-width:96px;padding:0 19px;border:0;background:var(--text,#eee);color:#221a15}
#aoPray435930 .aoF07MercyDock output{flex:1;text-align:center;color:var(--muted,#bcb4a8);font:500 11px var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyNote{display:none}
#aoPray435930 .aoF07MercyComplete{min-height:65vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:16px}
#aoPray435930 .aoF07MercyComplete small{font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07MercyComplete h2{font:400 30px/1.2 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#eee)}
#aoPray435930 .aoF07MercyComplete p{max-width:300px;font:400 17px/1.45 var(--ao-font-liturgical,Georgia,serif);color:var(--muted,#bbb)}
#aoPray435930 .aoF07MercyComplete button{min-height:48px;min-width:160px;border-radius:999px;padding:9px 18px}

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
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyBeadPosition{display:none}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyStrand{display:flex!important;gap:5px;align-items:center;overflow-x:auto;scrollbar-width:none;max-width:100%;padding:3px 1px 5px;min-height:44px}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyStrand::-webkit-scrollbar{display:none}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyStrand .aoMercyBeadButton{flex:0 0 40px;min-width:40px;min-height:40px;height:40px;border-radius:50%;touch-action:manipulation}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyStrand .aoMercyBeadButton[data-bead="0"]{flex-basis:44px;min-width:44px;height:44px}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyStrand .aoMercyBeadButton[data-status="active"]{outline:2px solid #bd655b;outline-offset:-2px}
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
