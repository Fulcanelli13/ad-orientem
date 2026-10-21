// Deliberately small, exact source-first LIVE rubric substitutions.
// User-approved icon names remain immutable in the final asset lock.
// Only suppress a redundant *visible* action label when the same source cue
// is actually rendering the exact approved pictogram. Keep the original DOM
// node, 1962 provenance and all Missal-mode rubrics intact.
export const EXACT_ICON_BACKED_LIVE_RUBRICS=Object.freeze({
  "AO.RUB.C0174.02":Object.freeze({
    cueId:"AO.SM.C0174",iconKey:"priest_elevation",assetId:"v46_priest_elevation",
    action:"ELEVATES HOST",actor:"PRIEST",
  }),
  "AO.RUB.C0181.02":Object.freeze({
    cueId:"AO.SM.C0181",iconKey:"final_ao_elevation_chalice",assetId:"ao_elevation_chalice",
    action:"ELEVATES CHALICE",actor:"PRIEST",
  }),
  "AO.RUB.C0232.02":Object.freeze({
    cueId:"AO.SM.C0232",iconKey:"final_ea_priest_communion_host_original",
    assetId:"ea_priest_communion_host_original",action:"RECEIVES HOST",actor:"PRIEST",
  }),
  "AO.RUB.C0234.02":Object.freeze({
    cueId:"AO.SM.C0234",iconKey:"final_ea_priest_communion_chalice_original",
    assetId:"ea_priest_communion_chalice_original",action:"RECEIVES CHALICE",actor:"PRIEST",
  }),
});
export function exactIconBackedRubric(rubricId,{mode=null,cueId=null,priestActionIconKey=null,iconResolved=false}={}){
  if(mode!=="LIVE"||!iconResolved)return null;
  const record=EXACT_ICON_BACKED_LIVE_RUBRICS[String(rubricId??"")];
  if(!record||record.cueId!==cueId||record.iconKey!==priestActionIconKey)return null;
  return record;
}
// 53 others deliberately remain textual. Do NOT flatten complex C0174 /
// C0181 elevations into a single icon: preliminary/final genuflections,
// replacement, bells and joined-finger discipline have distinct timing.
// Head bow is not a profound bow, and a server's bell is not priest artwork.
