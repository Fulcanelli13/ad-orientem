// User-reported musical programme for the currently selected Mass.
// Presentation metadata only: not liturgical proper, rubric, priest or Schola clock.
import {SCHOLA_SCORE_CATALOGUE,SCHOLA_SCORE_TRACK_IDS} from "./reader-chant-score-pilot.js";

export const MASS_CHANT_PROGRAMME_SCHEMA="ao-mass-chant-programme-v1";
export const MASS_CHANT_UNCONFIRMED="UNCONFIRMED";
export const MASS_CHANT_ORDINARY_TRACKS=Object.freeze([
  "KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI",
]);
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const PILOT_CELEBRATIONS=new Set(["CALENDAR","VOTIVE"]);
const IDENTIFIER=/^[A-Za-z0-9_-]+$/;
export function massChantProgrammeIdentity(legacy,{form,kind}={}){
  if(!legacy||!/^\d{4}-\d{2}-\d{2}$/.test(String(legacy.date??"")))return null;
  const actual=legacy.actualCelebration;
  const source=String(legacy.properSource??legacy.proper?.sourcePath??legacy.proper?.data?.sourcePath??"");
  return JSON.stringify([
    String(legacy.date),String(legacy.celebrationId??"mass_of_day"),
    String(legacy.requestedCelebrationId??"mass_of_day"),
    String(legacy.celebrationType??"CALENDAR"),String(legacy.exceptionalProfile??""),
    String(actual?.id??""),source,String(form??""),String(kind??""),
  ]);
}
export function chantProgrammeEnabled({form,kind}={}){
  return SUNG.has(String(form??""))&&PILOT_CELEBRATIONS.has(String(kind??""));
}
export function massChantOptions(trackId,{form,kind}={}){
  if(!chantProgrammeEnabled({form,kind}))return Object.freeze([]);
  return Object.freeze(SCHOLA_SCORE_CATALOGUE.filter(item=>
    item.trackId===trackId &&
    typeof item.gabc==="string"&&item.gabc.includes("%%")&&IDENTIFIER.test(item.id)));
}
export function createMassChantProgramme(legacy,{
  form,kind,kyrieScoreId=null,selectedScores=null,sanctusPerformance="UNSPECIFIED",
}={}){
  const identity=massChantProgrammeIdentity(legacy,{form,kind});
  if(!identity||!chantProgrammeEnabled({form,kind}))return null;
  const performance=["GREGORIAN","POLYPHONIC"].includes(sanctusPerformance)?sanctusPerformance:"UNSPECIFIED";
  const requested=selectedScores&&typeof selectedScores==="object"?selectedScores:{};
  const valid={};
  for(const trackId of MASS_CHANT_ORDINARY_TRACKS){
    const candidate=trackId==="KYRIE"
      ?(requested.KYRIE??kyrieScoreId):requested[trackId];
    if(!(trackId==="SANCTUS_BENEDICTUS"&&performance==="POLYPHONIC") &&
       massChantOptions(trackId,{form,kind}).some(item=>item.id===candidate))
      valid[trackId]=candidate;
  }
  const selections=Object.freeze(valid);
  return Object.freeze({
    schema:MASS_CHANT_PROGRAMME_SCHEMA,identity,date:String(legacy.date),
    form:String(form),kind:String(kind),
    sourceType:"USER_REPORTED_MUSIC_NOT_RUBRICALLY_CERTIFIED",
    sourceOfLiturgicalText:"EXISTING_1962_MASS_HOST",
    // Backward-compatible Kyrie field; all new consumers use selections.
    kyrieScoreId:selections.KYRIE??null,selections,sanctusPerformance:performance,
    unresolvedTracks:Object.freeze(SCHOLA_SCORE_TRACK_IDS.filter(id=>!selections[id])),
    performanceNote:"SCHOLA_TIMING_UNOBSERVED",
  });
}
export function selectedChantScoreForReader(programme,trackId){
  if(programme?.schema!==MASS_CHANT_PROGRAMME_SCHEMA||
     programme.sourceType!=="USER_REPORTED_MUSIC_NOT_RUBRICALLY_CERTIFIED"||
     !chantProgrammeEnabled(programme))return null;
  if(trackId==="SANCTUS_BENEDICTUS"&&programme.sanctusPerformance==="POLYPHONIC")return null;
  const id=programme.selections?.[trackId]??null;
  return massChantOptions(trackId,programme).some(item=>item.id===id)?id:null;
}
