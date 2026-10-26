// User-reported musical programme for the currently selected Mass.
// Presentation metadata only: no changes to liturgical Propers, rubrical
// permission, source readings, Mass card count, or Schola event timing.
import {SCHOLA_SCORE_CATALOGUE} from "./reader-chant-score-pilot.js";

export const MASS_CHANT_PROGRAMME_SCHEMA="ao-mass-chant-programme-v1";
export const MASS_CHANT_UNCONFIRMED="UNCONFIRMED";
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
// Requiem and Nuptial settings require their own approved chant mapping.
const PILOT_CELEBRATIONS=new Set(["CALENDAR","VOTIVE"]);
const IDENTIFIER=/^[A-Za-z0-9_-]+$/;
export function massChantProgrammeIdentity(legacy,{form,kind}={}){
  if(!legacy||!/^\d{4}-\d{2}-\d{2}$/.test(String(legacy.date??"")))return null;
  const actual=legacy.actualCelebration;
  const source=String(legacy.properSource??legacy.proper?.sourcePath??legacy.proper?.data?.sourcePath??"");
  return JSON.stringify([
    String(legacy.date),
    String(legacy.celebrationId??"mass_of_day"),
    String(legacy.requestedCelebrationId??"mass_of_day"),
    String(legacy.celebrationType??"CALENDAR"),
    String(legacy.exceptionalProfile??""),
    String(actual?.id??""),
    source,
    String(form??""),
    String(kind??""),
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
export function createMassChantProgramme(legacy,{form,kind,kyrieScoreId=null}={}){
  const identity=massChantProgrammeIdentity(legacy,{form,kind});
  if(!identity||!chantProgrammeEnabled({form,kind}))return null;
  const allowed=massChantOptions("KYRIE",{form,kind});
  const kyrie=allowed.find(item=>item.id===kyrieScoreId)??null;
  return Object.freeze({
    schema:MASS_CHANT_PROGRAMME_SCHEMA,
    identity,
    date:String(legacy.date),
    form:String(form),
    kind:String(kind),
    sourceType:"USER_REPORTED_MUSIC_NOT_RUBRICALLY_CERTIFIED",
    sourceOfLiturgicalText:"EXISTING_1962_MASS_HOST",
    kyrieScoreId:kyrie?.id??null,
    selections:Object.freeze(kyrie?Object.freeze({KYRIE:kyrie.id}):{}),
    unresolvedTracks:Object.freeze([
      "INTROIT","GLORIA","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
      "CREDO","OFFERTORY","SANCTUS_BENEDICTUS","AGNUS_DEI","COMMUNION",
    ]),
  });
}
export function selectedChantScoreForReader(programme,trackId){
  if(programme?.schema!==MASS_CHANT_PROGRAMME_SCHEMA||
     programme.sourceType!=="USER_REPORTED_MUSIC_NOT_RUBRICALLY_CERTIFIED"||
     !chantProgrammeEnabled(programme))return null;
  const id=programme.selections?.[trackId]??null;
  return massChantOptions(trackId,programme).some(item=>item.id===id)?id:null;
}
