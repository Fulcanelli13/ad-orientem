/**
 * Original, source-aligned bilingual prayer readings for the actual Mass Explorer.
 * Reconciled from P2 descriptive drafts. This module owns no ritual texts,
 * rubrics, gestures, Scripture links or disputed historical evidence.
 */
export const MASS_EXPLORER_PRAYER_READINGS_VERSION="ao-mass-explorer-prayer-readings-v1";
const requiredFamilies=Object.freeze({ "before-offertory":23,offertory:8,
 "orate-preface":6,canon:15,communion:23,conclusion:9});
const conditional={
 PSALM_42_MAY_BE_OMITTED:{
 en:"Psalm 42 is omitted when the rubrics require it.",
 fr:"Le psaume 42 est omis lorsque les rubriques le prescrivent."},
 INCENSATION_DEPENDENT:{
 en:"This prayer is used when the incensation takes place.",
 fr:"Cette prière est utilisée lorsque l’encensement a lieu."},
 GLORIA_DEPENDENT:{
 en:"The Gloria is not said at every Mass.",
 fr:"Le Gloria n’est pas dit à toutes les Messes."},
 CREDO_DEPENDENT:{
 en:"The Credo is said only when prescribed.",
 fr:"Le Credo n’est dit que lorsqu’il est prescrit."},
 GOSPEL_HEADING_DEPENDENT:{
 en:"The Gospel named in this example is not the Gospel appointed for every day.",
 fr:"L’Évangile nommé dans cet exemple n’est pas celui de chaque jour."},
 DISMISSAL_FORM_DEPENDENT:{
 en:"The dismissal formula can change with the celebration.",
 fr:"La formule de renvoi peut varier selon la célébration."},
 BLESSING_MAY_BE_OMITTED:{
 en:"The final blessing is omitted in certain liturgical circumstances.",
 fr:"La bénédiction finale est omise en certaines circonstances liturgiques."},
 LAST_GOSPEL_MAY_BE_OMITTED:{
 en:"The Last Gospel is not prescribed in every circumstance.",
 fr:"Le dernier Évangile n’est pas prescrit en toutes circonstances."},
 OPTIONAL_LOCAL_OLDER_CUSTOM:{
 en:"Older or local Communion custom. This is not a universal 1962 requirement.",
 fr:"Usage ancien ou local à la Communion. Il ne s’agit pas d’une prescription universelle de 1962."}
};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
const localized=o=>o&&typeof o==="object"&&
 ["en","fr"].every(l=>typeof o[l]==="string"&&o[l].trim()===o[l]&&o[l].length>=8&&o[l].length<=1600);
const empty=()=>new Map();
const normalize=s=>String(s??"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
export function verifiedMassExplorerPrayerReadings(registry,catalog){
 if(registry?.schema!==MASS_EXPLORER_PRAYER_READINGS_VERSION||
    registry?.status!=="EDUCATIONAL_SOURCE_READING"||
    registry?.scope!=="EXPLORER_ONLY"||
    registry?.entries?.length!==84||
    catalog?.byBlock?.size!==96||catalog?.sequence?.length!==32)
   return empty();
 const out=new Map(),totals={};
 for(const r of registry.entries){
  const original=catalog.byBlock.get(r?.block_id);
  const status=original?.source?.Branch_Status;
  const expectedStatus=["AO.SM.B077","AO.SM.B078","AO.SM.B079"].includes(r.block_id)?
      "LOCAL_CUSTOM_PRE1960_SURVIVAL":
      ["AO.SM.B013","AO.SM.B036"].includes(r.block_id)?
        "CONDITIONAL_1962":"NORMATIVE_1962";
  const branch=r?.conditionality;
  if(!/^AO\.SM\.B\d{3}$/.test(r?.block_id||"")||
     !/^AO\.FORM\.PRAYER\./.test(r?.id||"")||
     !["MF01","MF02","MF03","MF04","MF05","MF06","MF07","MF08"].includes(r.stage_id)||
     !Object.hasOwn(requiredFamilies,r.family)||
     !localized(r.title)||!localized(r.reading)||
     typeof r.text_anchor_en!=="string"||r.text_anchor_en.length<3||
     !normalize(original?.source?.units?.map(u=>u.english).join(" ")).includes(normalize(r.text_anchor_en))||
     out.has(r.block_id)||!original||original.key!==r.moment_id||
     original.source.Proper_Slot||!original.source.units?.length||
     status!==expectedStatus||
     (r.source_status&&r.source_status!==status)||
     (branch!==null&&branch!==undefined&&branch!=="STANDARD_FIXED"&&!Object.hasOwn(conditional,branch))||
     (expectedStatus==="LOCAL_CUSTOM_PRE1960_SURVIVAL"&&branch!=="OPTIONAL_LOCAL_OLDER_CUSTOM")||
     (expectedStatus==="CONDITIONAL_1962"&&branch!=="INCENSATION_DEPENDENT")||
     (expectedStatus==="NORMATIVE_1962"&&(branch==="OPTIONAL_LOCAL_OLDER_CUSTOM"||
       branch==="INCENSATION_DEPENDENT")))
     return empty();
  totals[r.family]=(totals[r.family]||0)+1;
  out.set(r.block_id,Object.freeze({
   id:r.id,blockId:r.block_id,title:Object.freeze({...r.title}),
   reading:Object.freeze({...r.reading}),conditionality:branch||null,
   sourceStatus:status,relation:"DIRECT_DESCRIPTION_OF_SOURCE_TEXT"
  }));
 }
 if(Object.entries(requiredFamilies).some(([id,n])=>totals[id]!==n))return empty();
 return out;
}
export function massExplorerPrayerReadingHtml(entry,{french=false}={}){
 if(!entry||entry.relation!=="DIRECT_DESCRIPTION_OF_SOURCE_TEXT")return "";
 const lg=french?"fr":"en";
 const conditionalNotice=conditional[entry.conditionality];
 return '<div class="aoMXPrayerReading" data-ao-mx-text-reading="'+esc(entry.blockId)+'">'+
 '<h3>'+esc(entry.title[lg])+'</h3>'+
 '<p>'+esc(entry.reading[lg])+'</p>'+
 (conditionalNotice?'<p class="aoMXReadingConditional" data-ao-mx-conditional="'+
   esc(entry.conditionality)+'">'+esc(conditionalNotice[lg])+'</p>':"")+
 '</div>';
}
