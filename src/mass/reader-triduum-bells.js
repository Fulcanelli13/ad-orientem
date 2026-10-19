// The Holy Week altar-bell silence is a distinct 1962 rite policy.
// The canonical MC sound events remain the Ordinary Mass authority; this
// overlay suppresses (rather than rewrites) them during Holy Thursday.
// No source focus, card change, or chant clock proves a bell actually sounded.
import {holyThursdayCanonVariantsForProper} from "./reader-holy-thursday-canon.js";

const freeze=Object.freeze;
const REGULAR_BELL_CUES=new Set([
 "AO.SM.C0145","AO.SM.C0161","AO.SM.C0174","AO.SM.C0181","AO.SM.C0225"
]);
const HT_GLORIA="AO.SM.C0053";
const GLORIA_END="AO.SM.C0069";
const SOURCE=freeze({
 holyThursday:"Missale Romanum 1962, Feria V in Cena Domini, rubrica 7",
 easterVigil:"Missale Romanum 1962, Sabbato Sancto, Gloria rubric",
 sourceGraph:"data/mass/special-days-core.v1.1.json#mass_overlays.EASTER_VIGIL.modify_mc.MC-0013.insert_signal",
});

function expectedGloriaBell(subject,cueId){
 return freeze({
   cueId,label:"CHURCH AND ALTAR BELLS",detail:subject+" · Gloria",
   soundClass:"CHURCH_AND_ALTAR_BELLS",instrument:"CHURCH_AND_ALTAR_BELLS",
   status:"EXPECTED_NOT_OBSERVED",observedNow:false,actuallyHeard:"UNKNOWN",
   notAnObservation:true,sourceOwner:"1962_TRIDUUM_GLORIA_RUBRIC",
   owner:"1962_TRIDUUM_GLORIA_RUBRIC",canonicalEventIds:freeze([]),
   sourceTiming:freeze({rubricalWindow:"DURING_GLORIA",
     timingPrecision:"EXPECTED_AT_GLORIA_OPENING_NOT_AUDIO_DETECTED",
     sourceClock:"PRIEST_GLORIA_INTONATION"}),
   presentationHoldMs:2200,transient:true,authority:SOURCE,
 });
}
function bellCinema(subject,cueId){
 return freeze({
  id:"TRIDUUM:GLORIA:"+cueId,kind:"BELL",
  title:"BELLS",subtitle:subject+" · GLORIA",cueId,
  transient:true,durationMs:2200,
  owner:"1962_TRIDUUM_GLORIA_RUBRIC",canonicalAuthority:false,
  observedNow:false,notAnObservation:true,
 });
}
export function isCertifiedHolyThursdayMass(resolvedMass){
 return Boolean(holyThursdayCanonVariantsForProper(resolvedMass));
}

/**
 * Normal Mass-reader cue projection. Holy Thursday has a source-authenticated
 * Proper (Tempora/Quad6-4r); no Gregorian-date or title-only heuristics.
 * Before its Gloria, ordinary Mass bell cues cannot yet occur. At the exact
 * priest's Gloria opening we show an expected church+altar-bells indicator.
 * Once the Gloria ends, all ordinary altar-bell icons are suppressed:
 * wooden clapper is a *different* instrument, not bells.svg.
 *
 * Priest elevation cinematics and explicit rubric-stage observations remain
 * valid and independent: only their bell channel is suppressed.
 */
export function projectHolyThursdayBell({
 resolvedMass=null,cueId=null,expectedBell=null,expectedCinematic=null,
}={}){
 const id=String(cueId??"");
 if(!isCertifiedHolyThursdayMass(resolvedMass))
   return freeze({applies:false,bell:expectedBell,cinematic:expectedCinematic,
    owner:"ORDINARY_MASS_SOUND_EVENTS",instrument:null,
    suppressed:false});
 if(id===HT_GLORIA)
   return freeze({applies:true,bell:expectedGloriaBell("HOLY THURSDAY",id),
     cinematic:bellCinema("HOLY THURSDAY",id),
     owner:"1962_HOLY_THURSDAY_GLORIA",instrument:"CHURCH_AND_ALTAR_BELLS",
     suppressed:false});
 const afterGloria=/^AO\.SM\.C\d{4}$/.test(id)&&
   Number(id.slice(-4))>Number(GLORIA_END.slice(-4));
 if(afterGloria && REGULAR_BELL_CUES.has(id))
   return freeze({applies:true,bell:null,cinematic:expectedCinematic,
     owner:"1962_HOLY_THURSDAY_POST_GLORIA_BELL_SILENCE",
     instrument:"WOODEN_CLAPPER_CUSTOM_NOT_OBSERVED",suppressed:true});
 return freeze({applies:true,bell:expectedBell,cinematic:expectedCinematic,
   owner:"1962_HOLY_THURSDAY_NO_SPECIAL_BELL_AT_THIS_CUE",
   instrument:null,suppressed:false});
}

/** The composite Vigil owns its Mass separately from the Ordinary LIVE cue
 * controller. This projection is an expected Gloria milestone on its existing
 * actual Mass card, never the preceding fire, Exsultet, prophecies, or Litany.
 * It intentionally does NOT invent an observed sound or other five Mass bells.
 */
export function projectEasterVigilGloriaBell({
 distinctRite=null,massStarted=false,card=null,
}={}){
 if(distinctRite!=="EASTER_VIGIL"||massStarted!==true||!card)
   return freeze({applies:false,bell:null,cinematic:null,
     owner:"NO_VIGIL_GLORIA_IN_CURRENT_RITE"});
 const cues=new Set((card.paragraphs??[]).flatMap(row=>
   row.sourceCueIds??(row.id?[row.id]:[])));
 if(!cues.has(HT_GLORIA))
   return freeze({applies:true,bell:null,cinematic:null,
     owner:"1962_EASTER_VIGIL_MASS_NOT_GLORIA"});
 return freeze({applies:true,bell:expectedGloriaBell("EASTER VIGIL",HT_GLORIA),
   cinematic:bellCinema("EASTER VIGIL",HT_GLORIA),
   owner:"1962_EASTER_VIGIL_GLORIA_BELLS_RETURN",
   instrument:"CHURCH_AND_ALTAR_BELLS"});
}

export const TRIDUUM_BELL_AUTHORITY=freeze({
 source:SOURCE,holyThursdayGloriaCue:HT_GLORIA,
 ordinaryBellCueIds:freeze([...REGULAR_BELL_CUES]),
 easterVigilGraphSignal:"CHURCH_BELLS_AT_GLORIA",
 expectedNotHeard:true,woodenClapperIsNotAltarBell:true,
});
