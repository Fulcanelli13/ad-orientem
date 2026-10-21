// Deliberately small, exact source-first LIVE rubric substitutions.
// User-approved icon names remain immutable in the final asset lock.
// Only suppress a redundant *visible* action label when the same source cue
// is actually rendering the exact approved pictogram. Keep the original DOM
// node, 1962 provenance and all Missal-mode rubrics intact.
export const EXACT_ICON_BACKED_LIVE_RUBRICS=Object.freeze({
  "AO.RUB.C0068.01":Object.freeze({
    cueId:"AO.SM.C0068",iconKey:"final_ao_sign_of_cross_vector",
    assetId:"ao_sign_of_cross_vector",action:"SIGNS HIMSELF",actor:"PRIEST",
  }),
  "AO.RUB.C0079.01":Object.freeze({
    cueId:"AO.SM.C0079",iconKey:"final_ao_adoration",
    assetId:"ao_adoration",action:"PROFOUND BOW",actor:"PRIEST",
  }),
  "AO.RUB.C0104.01":Object.freeze({
    cueId:"AO.SM.C0104",iconKey:"final_ao_sign_of_cross_vector",
    assetId:"ao_sign_of_cross_vector",action:"SIGNS HIMSELF",actor:"PRIEST",
  }),
  "AO.RUB.C0262.01":Object.freeze({
    cueId:"AO.SM.C0262",iconKey:"priest_kiss_altar_rich",
    assetId:"v46_priest_kiss_altar_rich",action:"KISSES ALTAR",actor:"PRIEST",
  }),
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
export function exactIconBackedRubric(rubricId,{mode=null,cueId=null,priestActionIconKey=null,iconResolved=false,priestActionLabel=null}={}){
  if(mode!=="LIVE"||!iconResolved)return null;
  const record=EXACT_ICON_BACKED_LIVE_RUBRICS[String(rubricId??"")];
  if(!record||record.cueId!==cueId||record.iconKey!==priestActionIconKey)return null;
  // A source cue may have several subactions (both elevations do). The
  // named phase must agree, not merely the cue number and artwork file.
  if(String(priestActionLabel??"").trim().toUpperCase()!==record.action)return null;
  return record;
}
// The remaining 49 published actions remain textual unless independently certified. Do NOT flatten complex C0174 /
// C0181 elevations into a single icon: preliminary/final genuflections,
// replacement, bells and joined-finger discipline have distinct timing.
// Head bow is not a profound bow, and a server's bell is not priest artwork.
