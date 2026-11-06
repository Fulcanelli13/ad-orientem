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

// The 1962 Missal's General Rubrics, n. 513(a), explicitly require the
// celebrant to CHANT the Oremus before the Offertory antiphon.
// C0109 is an action/selected Proper handoff, NOT a second priest-sung cue.
// Existing Schola chant has its own unsynchronized performance clock.
// Source: https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
const OFFERTORY_1962_VOICE_BOUNDARIES=Object.freeze({
 "AO.SM.C0108":Object.freeze({clock:"PUBLIC_TEXT",expectedVoice:"SUNG / CLEAR",
   owner:"MR1962_513_A_OFFERTORY_OREMUS_SUNG"}),
 "AO.SM.C0109":Object.freeze({clock:"PRIEST_ACTION",
   owner:"SOURCE_PROPER_OFFERTORY_NOT_A_PRIEST_SUNG_CUE"}),
 "AO.SM.C0110":Object.freeze({clock:"PRIEST_PRIVATE",expectedVoice:"SECRET / QUIET",
   owner:"SUNG_SOURCE_OFFERTORY_PRIEST_PRIVATE"})
});
/** Keep the already-correct C0108 chant, suppress the misleading
 * "SUNG/CLEAR OPENING -> SECRET OFFERTORY" priest-voice transition on the
 * antiphon-only C0109 cue, and retain the actual C0110 secret prayer.
 * This is a presentation/ownership correction, not a new musical score.
 * It does not assert that any sound was heard or that a priest finished
 * a chant on a particular scroll position.
 */
export function resolveOffertoryVoiceBoundary({
 cueId=null,sourceClock=null,form=null,mode="LIVE",ordinaryVoice=null
}={}){
 const id=String(cueId??""),boundary=OFFERTORY_1962_VOICE_BOUNDARIES[id];
 const unavailable=Object.freeze({applied:false,priestVoice:ordinaryVoice??null,
  owner:"UNCHANGED_SOURCE_VOICE",actuallyHeard:"UNKNOWN"});
 if(!SUNG.has(String(form??"").toUpperCase())||
    !["LIVE","MISSAL"].includes(String(mode??"").toUpperCase())||
    !boundary||sourceClock!==boundary.clock)return unavailable;
 if(id==="AO.SM.C0109"){
  // This donor "voice" is a transition caption, not an audio report.
  // The Schola sings the proper independently; the priest's next exact
  // PRIEST_PRIVATE text, C0110, owns the quiet voice.
  return Object.freeze({applied:true,priestVoice:null,
   owner:boundary.owner,actuallyHeard:"UNKNOWN"});
 }
 const label=String(ordinaryVoice?.label??ordinaryVoice?.value??"");
 if(label!==boundary.expectedVoice)return unavailable;
 return Object.freeze({applied:true,priestVoice:ordinaryVoice,
  owner:boundary.owner,actuallyHeard:"UNKNOWN"});
}
