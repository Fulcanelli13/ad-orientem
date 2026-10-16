/**
 * Mass moments — an educational index over the existing continuity-certified
 * Sung Guide registry. The ritual reader remains the sole event/text owner.
 * No Ultra Master historical claim, prose or bibliographic lead is published.
 */
import {validateGuideRegistry} from "../mass/reader-guide.js";
import {massFormationScriptureHtmlForAnchorIds,MASS_FORMATION_SCRIPTURE_ANCHORS} from "./mass-formation-scripture-context.js";

export const MASS_MOMENTS_STUDY_VERSION="ao-mass-moments-study-v1";
const ed=Object.freeze({
 "AO.CARD.001":{stageId:"MF01"},
 "AO.CARD.002":{stageId:"MF01",scripture:["MFS17"]},
 "AO.CARD.003":{stageId:"MF01",scripture:["MFS01"]},
 "AO.CARD.010":{stageId:"MF03"},
 "AO.CARD.011":{stageId:"MF03"},
 "AO.CARD.013":{scripture:["MFS02","MFS03"]},
 "AO.CARD.014":{stageId:"MF04"},
 "AO.CARD.015":{stageId:"MF05",scripture:["MFS07","MFS08"]},
 "AO.CARD.016":{stageId:"MF05",scripture:["MFS07","MFS08"]},
 "AO.CARD.017":{stageId:"MF04",scripture:["MFS09","MFS10","MFS11","MFS12"]},
 "AO.CARD.018":{stageId:"MF04"},
 "AO.CARD.019":{scripture:["MFS13"]},
 "AO.CARD.021":{scripture:["MFS14"]},
 "AO.CARD.023":{stageId:"MF07"},
 "AO.CARD.024":{stageId:"MF07",scripture:["MFS15"]},
 "AO.CARD.025":{stageId:"MF07"},
 "AO.CARD.026":{stageId:"MF08"},
 "AO.CARD.027":{stageId:"MF08"},
 "AO.CARD.028":{stageId:"MF08"},
 "AO.CARD.029":{stageId:"MF08"},
 "AO.CARD.030":{stageId:"MF08",scripture:["MFS16"]},
 "POST.MASS":{stageId:"MF08"}
});
export const MASS_MOMENTS_CURATED_LINKS=ed;
const anchorIdSet=new Set(MASS_FORMATION_SCRIPTURE_ANCHORS.map(x=>x.id));
for(const [guideId,row] of Object.entries(ed)){
 if(!/^(AO\.CARD\.\d{3}|POST\.MASS)$/.test(guideId))throw new Error("Unrecognized Guide ID");
 if(row.stageId&&!/^MF0[1-8]$/.test(row.stageId))throw new Error("Unrecognized Formation stage");
 if((row.scripture||[]).some(id=>!anchorIdSet.has(id)))throw new Error("Uncertified Scripture anchor in Mass moment");
}
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const label=(fr,en,french)=>fr?french:en;
const order=registry=>[registry.entries["PRE.ASPERGES"],...Array.from({length:30},(_,i)=>registry.entries["AO.CARD."+String(i+1).padStart(3,"0")]),registry.entries["POST.MASS"]];
const group=(n)=>n===0?0:n<=9?1:n<=18?2:n<=25?3:4;
const groups=Object.freeze([
 ["Before Mass","Avant la Messe"],
 ["The entrance and Word","Entrée et liturgie de la Parole"],
 ["Offertory and Canon","Offertoire et Canon"],
 ["Communion","Communion"],
 ["Conclusion and thanksgiving","Conclusion et action de grâces"]
]);
const headers=["What is happening","What should I do?","Why this matters","How this developed"];
/** Reuses only three verbatim existing Guide sections, not its uncertified
 * historical comparisons and generic source list. */
export function massMomentExistingGuideSections(guide){
 const long=String(guide?.long??"");
 return headers.slice(0,3).flatMap((heading,i)=>{
  const start=long.indexOf(heading+"\n");
  if(start<0)return [];
  const contentStart=start+heading.length+1;
  let end=long.length;
  for(const next of headers.slice(i+1)){const at=long.indexOf("\n\n"+next+"\n",contentStart);if(at>=0)end=Math.min(end,at);}
  const copy=long.slice(contentStart,end).trim();
  return copy?[{heading,text:copy}]:[];
 });
}
export function massMomentStudyLinks(guideId){
 const item=ed[guideId]||{};
 return Object.freeze({stageId:item.stageId||null,scriptureAnchorIds:Object.freeze([...(item.scripture||[])])});
}
export function massMomentStudyKeys(registry){
 validateGuideRegistry(registry);
 return order(registry).map(x=>x.key);
}
export function massMomentsStudyCss(){
 return [
 ".aoMFMomentsLead{font:400 .9rem/1.6 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,var(--muted,#9ba5b1));margin:0 0 20px}",
 ".aoMFMomentsGroup{margin:0 0 24px}.aoMFMomentsGroup h2{font:500 1.12rem/1.3 var(--ao-font-display,Georgia,serif);color:var(--liturgical,#c9ad78);padding:10px 0;margin:0;border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.14))}",
 ".aoMFMomentRow{border:0;border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.12));background:transparent;color:inherit;display:grid;grid-template-columns:34px minmax(0,1fr);gap:11px;width:100%;min-height:54px;align-items:center;padding:11px 2px;text-align:left;cursor:pointer}",
 ".aoMFMomentRow .n{color:var(--liturgical,#c9ad78);font:.75rem/1 var(--ao-font-ui,system-ui,sans-serif);font-variant-numeric:tabular-nums}",
 ".aoMFMomentRow strong{font:500 .98rem/1.4 var(--ao-font-display,Georgia,serif)}",
 ".aoMFMomentRow span:last-child{min-width:0;overflow-wrap:anywhere}",
 ".aoMFMomentRead{padding:15px 0;border-top:1px solid var(--ao-rule,rgba(255,255,255,.12));margin:16px 0}.aoMFMomentRead h2{font:500 1.15rem/1.35 var(--ao-font-display,Georgia,serif);margin:0 0 9px}",
 ".aoMFMomentRead p{white-space:pre-line;font-size:max(15px,.9375rem);line-height:1.66;margin:0}",
 ".aoMFMomentIntro{font:400 1.06rem/1.7 var(--ao-font-body,Georgia,serif);margin:12px 0 23px}",
 ".aoMFMomentContext{border-top:1px solid var(--ao-rule,rgba(255,255,255,.15));padding:17px 0}.aoMFMomentContext button{display:block;min-height:44px;text-align:left;background:var(--ao-surface-1,#101821);color:var(--liturgical,#c9ad78);border:1px solid var(--ao-rule,rgba(255,255,255,.14));border-radius:10px;padding:10px 14px;width:100%;font:.9rem/1.4 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}",
 ".aoMFStudyEntry{margin:23px 0 5px}.aoMFStudyEntry button{width:100%;min-height:48px;border:1px solid var(--ao-rule,rgba(255,255,255,.16));border-radius:12px;background:var(--ao-surface-1,#101821);color:var(--liturgical,#c9ad78);text-align:left;padding:11px 15px;font:500 .91rem/1.4 var(--ao-font-ui,system-ui,sans-serif)}",
 ".aoMFMomentWarning{margin:8px 0 16px;color:var(--ao-text-muted,var(--muted,#9ba5b1));font:.75rem/1.5 var(--ao-font-ui,system-ui,sans-serif)}",
 "@media(max-width:430px){.aoMFMomentRow{grid-template-columns:28px minmax(0,1fr)}.aoMFMomentsGroup{margin-bottom:19px}}"
 ].join("");
}
export function massMomentsStudyListHtml(registry,{french=false}={}){
 const guides=order(validateGuideRegistry(registry));
 const sections=groups.map(([en,fr],gi)=>{
  const relevant=guides.filter(g=>group(g.sequence)===gi);
  return '<section class="aoMFMomentsGroup"><h2>'+esc(french?fr:en)+'</h2>'+
   relevant.map(g=>'<button type="button" class="aoMFMomentRow" data-ao-mf-moment="'+esc(g.key)+'"><span class="n">'+
   esc(g.sequence===0?"·":g.sequence===31?"·":String(g.sequence).padStart(2,"0"))+
   '</span><span><strong>'+esc(g.moment)+'</strong></span></button>').join("")+'</section>';
 }).join("");
 return '<main class="aoMFWrap aoMFMomentsList"><p class="aoMFMomentsLead">'+
  esc(label(french,"The 32 existing Sung Mass Guide moments, in their actual order. Explore quietly before or after Mass; the LIVE reader remains unchanged.","Les 32 étapes du Guide de la Messe chantée, dans leur ordre réel. Parcours à consulter avant ou après la Messe ; le lecteur LIVE reste inchangé."))+
  '</p>'+sections+'</main>';
}
export function massMomentStudyDetailHtml(registry,guideId,{french=false,stageTitles={}}={}){
 const guide=validateGuideRegistry(registry).entries[guideId];if(!guide)return "";
 const pos=order(registry).findIndex(x=>x.key===guideId);
 const refs=massMomentStudyLinks(guideId);
 const stageTitle=refs.stageId?stageTitles[refs.stageId]:"";
 const sections=massMomentExistingGuideSections(guide);
 return '<main class="aoMFWrap aoMFStage aoMFMomentDetail" data-ao-mf-moment-detail="'+esc(guideId)+'">'+
  '<div class="aoMFQuestion">'+esc(label(french,"Sung Mass · Existing Guide","Messe chantée · Guide existant"))+'</div>'+
  '<h1>'+esc(guide.moment)+'</h1><p class="aoMFMomentIntro">'+esc(guide.short)+'</p>'+
  sections.map(s=>'<section class="aoMFMomentRead"><h2>'+esc(s.heading)+'</h2><p>'+esc(s.text)+'</p></section>').join("")+
  (refs.scriptureAnchorIds.length?massFormationScriptureHtmlForAnchorIds(refs.scriptureAnchorIds,{french}):"")+
  (refs.stageId&&stageTitle?'<section class="aoMFMomentContext"><button type="button" data-ao-mf-related-stage="'+esc(refs.stageId)+'">'+
    esc(label(french,"Continue in Study · ","Approfondir · ")+stageTitle)+' →</button></section>':"")+
  '<p class="aoMFMomentWarning">'+esc(label(french,
   "Existing Sung Mass guidance. Local posture, rite and ceremonial conditions may differ. Historical source comparisons are withheld here pending separate certification.",
   "Indications existantes pour la Messe chantée. Les postures et cérémonies peuvent varier. Les comparaisons historiques restent en révision."))+'</p>'+
  '<nav class="aoMFNav">'+
  '<button type="button" data-ao-mf-moment-prev '+(pos===0?'disabled':'')+'>'+esc(label(french,"Previous","Précédent"))+'</button>'+
  '<button type="button" data-ao-mf-moments-list>'+esc(label(french,"All moments","Toutes les étapes"))+'</button>'+
  '<button type="button" data-ao-mf-moment-next '+(pos===31?'disabled':'')+'>'+esc(label(french,"Next","Suivant"))+'</button>'+
  '</nav></main>';
}
