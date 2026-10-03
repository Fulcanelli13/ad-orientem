// Compatibility bridge from the proven v3.4.6 pre-Mass architecture
// into the R17 modular session engine.
// This file intentionally does not depend on window/globalThis or DOM.

import { makeResolvedMass, compileMassPlan } from "./session-engine.js";

const LEGACY_EXCEPTIONAL = Object.freeze({
  "good-friday-1962": "GOOD_FRIDAY",
  "good_friday_1962": "GOOD_FRIDAY",
  "good_friday": "GOOD_FRIDAY",
  "easter-vigil-1962": "EASTER_VIGIL",
  "easter_vigil_1962": "EASTER_VIGIL",
  "easter_vigil": "EASTER_VIGIL",
});

function normalizedType(value) {
  const raw=String(value??"calendar").trim().toUpperCase().replace(/[- ]+/g,"_");
  if (raw==="MASS_OF_DAY") return "CALENDAR";
  return raw;
}

function legacyForm(value) {
  const raw=String(value??"sung").toLowerCase();
  if(raw==="low") return "LOW";
  if(raw==="solemn") return "SOLEMN";
  if(raw==="mc-simple"||raw==="missa_cantata_simple") return "MISSA_CANTATA_SIMPLE";
  return "MISSA_CANTATA_INCENSE";
}

function legacyMode(value) {
  const raw=String(value??"vox").toLowerCase();
  if(raw==="missal"||raw==="read") return "MISSAL";
  if(raw==="simple") return "SIMPLE";
  return "LIVE";
}

function properEnvelope(proper, legacy) {
  if(!proper) return null;
  if(proper.status && proper.data) return proper;
  return Object.freeze({
    status:"READY",
    data:proper,
    sourcePath:proper.sourcePath??legacy.properSource??null,
  });
}

function celebrationObject(id,type,title=null) {
  if(!id) return null;
  return Object.freeze({id:String(id),type:normalizedType(type),title});
}

export function adaptV346ResolvedMass(legacy, options={}) {
  if(!legacy || typeof legacy!=="object") throw new TypeError("v3.4.6 ResolvedMass object required");
  if(legacy.canStart!==true) throw new Error("Legacy preflight has not permitted Mass start");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(legacy.date??""))) throw new Error("Legacy ResolvedMass date missing");

  const calendarId=
    legacy.calendarDay?.id ??
    legacy.calendarDay?.path ??
    legacy.calendarDay?.title ??
    "mass_of_day";

  const calendarCelebration=celebrationObject(
    calendarId,
    "CALENDAR",
    legacy.calendarDay?.title??legacy.calendarDay?.name??null
  );

  const resultId=legacy.celebrationId??legacy.requestedCelebrationId??"mass_of_day";
  const requestedId=legacy.requestedCelebrationId??resultId;
  const explicit =
    requestedId &&
    requestedId!=="mass_of_day" &&
    resultId!=="mass_of_day";

  const requestedCelebration=explicit
    ? celebrationObject(resultId,legacy.celebrationType??"SPECIAL_FORMULARY",options.celebrationTitle??null)
    : null;

  const type=normalizedType(legacy.celebrationType);
  const overlays=[...(options.overlays??[])];
  if(type==="REQUIEM"&&!overlays.includes("REQUIEM")) overlays.push("REQUIEM");
  if((resultId==="nuptial"||requestedId==="nuptial"||type==="NUPTIAL")&&!overlays.includes("NUPTIAL")) overlays.push("NUPTIAL");
  if(type==="VOTIVE"&&!overlays.includes("VOTIVE_PROPER")) overlays.push("VOTIVE_PROPER");

  const profile=String(legacy.exceptionalProfile??"").toLowerCase();
  const distinctRite=options.distinctRite??LEGACY_EXCEPTIONAL[profile]??null;

  const proper=properEnvelope(options.proper??null,legacy);
  const adapted=makeResolvedMass({
    date:legacy.date,
    form:legacyForm(options.form??options.celebrationForm),
    presentationMode:legacyMode(options.presentationMode??options.followMode),
    calendarCelebration,
    requestedCelebration,
    proper,
    overlays,
    precedingRites:options.precedingRites??[],
    followingActions:options.followingActions??[],
    distinctRite,
    localProfile:options.localProfile??null,
    provenance:{
      adapter:"V346_RESOLVED_MASS",
      properSource:legacy.properSource??null,
      calendarRank:legacy.calendarRank??null,
      votiveClass:legacy.votiveClass??null,
      requiemClass:legacy.requiemClass??null,
      colour:legacy.colour??null,
      gloria:legacy.gloria??proper?.data?.hasGloria??proper?.hasGloria??null,
      credo:legacy.credo??proper?.data?.hasCredo??proper?.hasCredo??null,
      sequencePresent:options.sequencePresent??legacy.sequencePresent??null,
      chantSetting:options.chantSetting??legacy.chantSetting??null,
      faithfulCommunicantsPresent:options.faithfulCommunicantsPresent??legacy.faithfulCommunicantsPresent??null,
      commemorations:[...(legacy.commemorations??[])],
      seasonalMode:legacy.seasonalMode??null,
      exceptionalProfile:legacy.exceptionalProfile??null,
      insertedRites:[...(legacy.insertedRites??[])],
      conditions:[...(legacy.conditions??[])],
      rubricSources:[...(legacy.rubricSources??[])],
      languageCoverage:legacy.languageCoverage??null,
      sourceDiagnostics:legacy.sourceDiagnostics??null,
    },
  });

  return adapted;
}

export function prepareMassSessionFromV346(legacy, options={}) {
  const resolvedMass=adaptV346ResolvedMass(legacy,options);
  return Object.freeze({
    schema:"ao-mass-session-bridge-v1",
    resolvedMass,
    plan:compileMassPlan(resolvedMass),
    proper:resolvedMass.proper,
    legacy:Object.freeze({
      requestedCelebrationId:legacy.requestedCelebrationId??null,
      celebrationId:legacy.celebrationId??null,
      properSource:legacy.properSource??null,
    }),
  });
}
