// Canonical Sung Offertory: Oremus (C0108) is public; the priest's
// preparation thereafter is said secretly/quietly, while the Schola may
// continue singing the independently timed Offertory antiphon.
// No inference from the entire card, text substring, or a choir timer.
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const FIRST_PRIVATE=110;
const LAST_PRIVATE=133;
const OFFERTORY_PUBLIC=new Set([106,108,130]);
const numericCue=id=>/^AO\.SM\.C\d{4}$/.test(String(id??""))
  ? Number(String(id).slice(-4)) : NaN;

/** Source-cue status, not audio detection. */
export function projectPriestQuietOffertory({cueId=null,sourceClock=null,form=null,
  mode="LIVE",language="en"}={}){
  if(String(mode).toUpperCase()!=="LIVE" || !SUNG.has(String(form??"").toUpperCase()))return null;
  const n=numericCue(cueId);
  if(!Number.isInteger(n)||n<FIRST_PRIVATE||n>LAST_PRIVATE ||
    OFFERTORY_PUBLIC.has(n) || sourceClock!=="PRIEST_PRIVATE")return null;
  const fr=String(language).toLowerCase().startsWith("fr");
  return Object.freeze({
    schema:"ao-offertory-priest-quiet-v1",
    cueId:String(cueId),sourceClock:"PRIEST_PRIVATE",
    label:fr?"LE PRÊTRE PRIE À VOIX BASSE":"PRIEST PRAYS QUIETLY",
    description:fr
      ?"Après « Orémus », ces prières sont dites à voix basse. La schola peut continuer à chanter l’offertoire."
      :"After Oremus these prayers are said quietly. The Schola may continue the Offertory chant.",
    iconKey:"priest_silent",
    sourceOwner:"SUNG_CORPUS_PRIEST_PRIVATE",
    actuallyHeard:"UNKNOWN",notAnObservation:true,
  });
}
