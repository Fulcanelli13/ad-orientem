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
/**
 * The three source-specific w1/c1 readers have passed their opt-in phone
 * acceptance and become the draft branch's default presentation.
 * Explicit ?aoChapletF07Pilot=0 remains a safe legacy rollback.
 * Divine Mercy m1/m2/m3 is still opt-in until prototype acceptance.
 */
export function chapletF07VariantsEnabled(win=globalThis){
 try{return new URLSearchParams(win.location?.search||"").get("aoChapletF07Pilot")!=="0"}
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
 const caption=m.caption,step=steps[index],language=french?"fr":"en";
 const tr=(en,fr)=>french?fr:en;
 const stage=step.decade?tr("DECADE","DIZAINE")+" "+["I","II","III","IV","V"][step.decade-1]:
  step.group==="opening"?tr("OPENING","OUVERTURE"):tr("CLOSING","CONCLUSION");
 const exactPrayer=mercyStepText(step,language)||"";
 const title=step.decade?(exactPrayer.split(",")[0]||m.shortName):m.shortName;
 const description=step.group==="small-bead"?step.bead+tr(" of 10"," sur 10"):
   step.group==="large-bead"?tr("Large bead","Gros grain"):m.caption;
 return '<figure class="aoF07CrownBand" data-ao-f07-crown data-position="'+index+'" data-total="'+steps.length+'" data-decade="'+(m.activeDecade??"")+'" aria-label="'+esc((french?"Position dans le chapelet : ":"Chaplet position: ")+caption)+'">'+
  '<svg class="aoF07CrownDiagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-hidden="true">'+
   '<circle class="aoF07CrownTrack" cx="60" cy="60" r="43"/>'+circles+
   '<path class="aoF07CrownCross" d="M60 50v21M50 60.5h20"/>'+
  '</svg>'+
  '<figcaption class="aoF07CrownText"><small>'+esc(stage)+'</small>'+
   '<strong>'+esc(title)+'</strong><span>'+esc(description)+'</span>'+
  '</figcaption></figure>';
}
/** Claude m1 home. Only presentation is new: the 55-bead diagram and source are unchanged. */
export function renderMercyF07Entry(steps,{french=false,source=""}={}){
 const tr=(en,fr)=>french?fr:en;
 const safeSource=esc(source);
 return '<main class="aoP435930Body aoF07MercyEntry" data-f07-mercy-entry="m1">'+
  '<section class="aoF07MercyEntryHero">'+
   '<span class="aoF07MercyEntryMark" aria-hidden="true">✝</span>'+
   '<div><small>'+esc(tr("CHAPLET","CHAPELET"))+'</small>'+
    '<h2>'+esc(tr("Divine Mercy Chaplet","Chapelet de la Divine Miséricorde"))+'</h2>'+
    '<div class="aoF07MercyEntryChips"><span>'+esc(tr("≈ 8 min","≈ 8 min"))+'</span><span>'+esc(tr("Customarily at 3 pm","Traditionnellement à 15 h"))+'</span></div>'+
   '</div></section>'+
  '<section class="aoF07MercyEntryOutline">'+
    renderMercyF07Crown(steps,0,{french})+
   '<ol><li>'+esc(tr("Opening prayers","Prières initiales"))+'</li>'+
    '<li>'+esc(tr("Five decades","Cinq dizaines"))+'</li>'+
    '<li>'+esc(tr("Closing invocations","Invocations finales"))+'</li></ol>'+
  '</section>'+
  '<button type="button" class="aoF07MercyBegin" data-p435930-mercy-begin>'+esc(tr("Begin","Commencer"))+'</button>'+
  '<details class="aoF07MercyEntrySource"><summary>ⓘ '+esc(tr("Source","Source"))+'</summary>'+
    '<a href="'+safeSource+'" target="_blank" rel="noopener noreferrer">'+esc(tr("Published prayer sequence","Texte et ordre publiés"))+'</a></details>'+
 '</main>';
}
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

/* Claude F07 m1: dedicated home before canonical opening prayers. */
#aoPray435930 .aoF07MercyEntry{display:flex;flex-direction:column;gap:18px;min-height:100%;box-sizing:border-box;padding:16px 15px 12px!important}
#aoPray435930 .aoF07MercyEntryHero{display:grid;grid-template-columns:76px minmax(0,1fr);gap:12px;align-items:center}
#aoPray435930 .aoF07MercyEntryMark{display:grid;place-items:center;width:76px;height:82px;border:1px solid rgba(211,187,151,.35);border-radius:8px;background:linear-gradient(140deg,#776a55,#322b25);color:#e5d7be;font-size:38px}
#aoPray435930 .aoF07MercyEntryHero h2{margin:5px 0 9px;font:500 26px/1.08 var(--ao-font-display,Georgia,serif);color:var(--text,#eee)}
#aoPray435930 .aoF07MercyEntryHero small{font:600 10px/1.3 system-ui,sans-serif;letter-spacing:.16em;color:var(--liturgical,#c6ab82)}
#aoPray435930 .aoF07MercyEntryChips{display:flex;gap:5px;flex-wrap:wrap}
#aoPray435930 .aoF07MercyEntryChips span{padding:4px 7px;border-radius:5px;background:rgba(188,172,146,.14);font:500 10px/1.2 system-ui,sans-serif;color:var(--text,#eee)}
#aoPray435930 .aoF07MercyEntryOutline{display:grid;grid-template-columns:94px minmax(0,1fr);align-items:center;gap:14px;padding:14px 12px;border:1px solid var(--border,rgba(220,220,220,.19));border-radius:11px}
#aoPray435930 .aoF07MercyEntryOutline .aoF07CrownBand{display:block;max-width:94px;width:94px;padding:0;margin:0;border:0;background:transparent}
#aoPray435930 .aoF07MercyEntryOutline .aoF07CrownDiagram{width:94px;height:94px}
#aoPray435930 .aoF07MercyEntryOutline .aoF07CrownText{display:none}
#aoPray435930 .aoF07MercyEntryOutline ol{display:grid;gap:9px;margin:0;padding-left:19px;font:400 14px/1.4 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#eee)}
#aoPray435930 .aoF07MercyBegin{margin-top:4px;width:100%;min-height:49px;padding:12px 17px;border:0;border-radius:999px;background:var(--text,#eee6dc);color:#241c18;font:600 15px/1.2 system-ui,sans-serif}
#aoPray435930 .aoF07MercyBegin:focus-visible{outline:3px solid var(--liturgical,#c6ab82);outline-offset:3px}
#aoPray435930 .aoF07MercyEntrySource{align-self:center;font:400 11px/1.4 system-ui,sans-serif;color:var(--muted,#beb2a4)}
#aoPray435930 .aoF07MercyEntrySource a{color:inherit}
#aoPray435930 .aoMercyCompletion{display:flex;flex-direction:column;align-items:center;gap:16px;justify-content:center;min-height:55vh;text-align:center}
#aoPray435930 .aoMercyCompletion h2{font:500 28px/1.18 var(--ao-font-display,Georgia,serif)}
#aoPray435930 .aoMercyCompletion button{min-height:48px;width:min(100%,260px);border-radius:999px}
@media(max-width:359px) and (max-height:650px){
 #aoPray435930 .aoF07MercyEntry{gap:10px;padding:7px 12px 8px!important}
 #aoPray435930 .aoF07MercyEntryMark{width:58px;height:62px;font-size:29px}
 #aoPray435930 .aoF07MercyEntryHero{grid-template-columns:58px minmax(0,1fr);gap:10px}
 #aoPray435930 .aoF07MercyEntryHero h2{font-size:21px;margin:2px 0 5px}
 #aoPray435930 .aoF07MercyEntryOutline{padding:6px 10px;gap:10px}
 #aoPray435930 .aoF07MercyEntryOutline .aoF07CrownDiagram{width:80px;height:80px}
 #aoPray435930 .aoF07MercyEntryOutline .aoF07CrownBand{width:80px}
 #aoPray435930 .aoF07MercyEntryOutline ol{gap:5px;font-size:12px}
 #aoPray435930 .aoF07MercyBegin{min-height:46px}
}
/* Claude m2: the source cursor owns one unobtrusive bottom navigation dock. */
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoCard{border:0!important;background:transparent!important;box-shadow:none!important}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoCardHead{display:none!important}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine{border:0!important;background:transparent!important}
#aoPray435930 .aoF07MercyDock{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:54px;position:sticky;bottom:0;z-index:5;padding:5px 12px;background:var(--surface-1,#211d19);border-top:1px solid var(--border,rgba(225,216,206,.15))}
#aoPray435930 .aoF07MercyDock button{min-height:44px;border-radius:999px;font:500 13px/1 system-ui,sans-serif}
#aoPray435930 .aoF07MercyDock [data-p435930-mercy-previous]{width:44px;min-width:44px;background:transparent;border:1px solid var(--border,rgba(225,216,206,.24));color:var(--text,#eee);font-size:23px}
#aoPray435930 .aoF07MercyDock [data-p435930-mercy-next]{min-width:104px;padding:0 16px;background:var(--text,#eee4d8);border:0;color:#211b16}
#aoPray435930 .aoF07MercyDock button:disabled{opacity:.28}
#aoPray435930 .aoF07MercyDock output{font:500 12px/1.3 system-ui,sans-serif;color:var(--muted,#bfb5a4);font-variant-numeric:tabular-nums}
#aoPray435930 .aoF07MercyDock button:focus-visible{outline:2px solid var(--liturgical,#c6ac84);outline-offset:2px}
@media(max-width:359px) and (max-height:650px){
 #aoPray435930 .aoF07MercyDock{min-height:48px;padding:2px 8px}
 #aoPray435930 .aoF07MercyDock button{min-height:42px}
}
/* Claude F07 m2: explicit canonical ℣/℟ fragments, legible active text. */
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine{opacity:.4;transition:opacity .12s ease}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine.aoMercyPrayer{opacity:1}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine:not(.aoMercyPrayer) .aoF07MercyRole p{font-size:15px!important}
#aoPray435930 .aoF07MercyRoles{display:flex;flex-direction:column;gap:12px;margin:4px 0 8px}
#aoPray435930 .aoF07MercyRole{display:grid;grid-template-columns:20px minmax(0,1fr);gap:7px;align-items:baseline}
#aoPray435930 .aoF07MercyRoleLabel{font:400 16px/1.2 Georgia,serif;color:var(--ao-prayer-sage,#9cbdb0)}
#aoPray435930 .aoF07MercyRoleName{display:none;font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.08em;color:var(--ao-prayer-sage,#9cbdb0)}
#aoPray435930 .aoF07MercyRole p{margin:0;font:400 20px/1.55 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#eee)}
#aoPray435930 .aoF07MercyRoles[data-f07-group="with-others"] .aoF07MercyRole{grid-template-columns:20px 34px minmax(0,1fr)}
#aoPray435930 .aoF07MercyRoles[data-f07-group="with-others"] .aoF07MercyRoleName{display:inline}
#aoPray435930 .aoF07MercyRoles[data-f07-group="with-others"] .aoF07MercyRole-Response p{font-weight:700}
#aoPray435930 .aoF07MercyRubric{font:italic 400 13px/1.45 var(--ao-font-liturgical,Georgia,serif);margin:4px 4px 10px;color:var(--muted,#b7aea3)}
#aoPray435930 .aoF07MercyChapterChips{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:0 0 8px;margin:3px 0}
#aoPray435930 .aoF07MercyChapterChips button{flex:0 0 auto;min-height:28px;padding:4px 9px;border:0;border-radius:4px;background:transparent;font:500 11px/1.2 system-ui,sans-serif;color:var(--muted,#b9b0a4)}
#aoPray435930 .aoF07MercyChapterChips button[aria-current="step"]{background:rgba(198,174,130,.17);color:var(--text,#eee)}
#aoPray435930 .aoF07MercyRecitation{display:flex;gap:8px;align-items:center;justify-content:space-between;font:500 10px system-ui,sans-serif;color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07MercyRecitation>div{display:flex;gap:4px}
#aoPray435930 .aoF07MercyRecitation button{min-height:30px;border:0;background:transparent;color:var(--muted,#b7aea3);font:500 11px system-ui,sans-serif;padding:3px 6px}
#aoPray435930 .aoF07MercyRecitation button[aria-pressed="true"]{color:var(--text,#eee);border-bottom:1px solid var(--liturgical,#cbb28b)}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyPhases{display:none}
#aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyNote{display:none}

/* On a 320×568 phone the prayer must begin above the app's 70px dock.
   Keep the canonical crown, stage choices and navigation; reclaim only
   spacing and legacy scroll padding. This does not change event ownership. */
@media(max-width:359px) and (max-height:650px){
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"]{
  padding-top:0!important;row-gap:0!important;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownBand{
  grid-template-columns:58px minmax(0,1fr);gap:6px;
  padding:0 5px;margin:0 0 2px;border-radius:0;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownDiagram{
  width:58px;height:58px;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownText{
  gap:1px;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownText strong{
  font-size:15px;line-height:1.1;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07CrownText span{
  font-size:10px;line-height:1.1;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07MercyChapterChips{
  margin:0;padding:0;gap:2px;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07MercyChapterChips button{
  min-height:25px;padding:2px 7px;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07MercyRecitation button{
  min-height:25px;padding:2px 5px;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyBeadNavigation{
  position:relative;top:auto;gap:0;padding:0 0 2px;margin:0 0 2px;
  border-bottom:0;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyBeadNavigation>.aoDevoProgress{
  margin:0;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoCardHead{
  padding:2px 8px!important;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoCardTitle{
  margin:0;font-size:19px;line-height:1.2;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoDevoCardScroll{
  padding:1px 8px 60px!important;gap:0;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoF07MercyRubric{
  margin:0 0 2px;line-height:1.2;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine{
  padding:3px 5px!important;
 }
 #aoPray435930 .aoMercyReader[data-ao-f07-chaplet="crown-v1"] .aoMercyLine p{
  margin-top:1px;line-height:1.38;
 }
}
`;
export function installChapletF07Styles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-chaplet-f07-style"))return;
 const tag=doc.createElement("style");tag.id="ao-chaplet-f07-style";tag.textContent=F07_STYLE;doc.head.append(tag);
}
installChapletF07Styles();
