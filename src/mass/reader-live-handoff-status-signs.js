// Claude handoff §5.4: source-exact expected cue signs, not sound detection.
// Never infer audible singing, bells or clergy actions from scrolling/Schola
// phrase progression. An unverified actor or cue produces no sign.
const freeze=Object.freeze;
const PUBLIC_SUNG=new Set([
  "SUNG / PUBLIC","SUNG / CLEAR","SUNG / CLEAR (MISSA CANTATA)"
]);
const PUBLIC_SPOKEN=new Set([
  "AUDIBLE / ELEVATED","CLEAR SPOKEN","CLEAR SPOKEN / local audibility"
]);
const QUIET=new Set([
  "LOW / QUIET","SECRET / QUIET WHILE MOVING","SECRET / QUIET",
  "QUIET / CEREMONIAL","SILENT","QUIET / LOW","SECRET / LOW",
  "SECRET","SECRET UNTIL CONCLUSION","PRIVATE / LOW",
  "QUIET PRIVATE RECITATION","QUIET INDIVIDUAL FORMULA"
]);
const blank=()=>freeze({
  priest:null,response:false,bell:false,schola:false,organ:false,
  source:"NO_VERIFIED_CURRENT_SOURCE_CUE",
  observedSound:false
});
export function projectLiveHandoffStatusSigns({gate,nativeState,priest,server,form}={}){
  const cue=String(nativeState?.nativeCueId??"");
  const certified=gate?.ok===true &&
    gate.reference?.status==="MATCHED_SOURCE_CARD" &&
    gate.reference?.nativeCardId===gate.reference?.expectedNativeId &&
    /^AO\.SM\.C\d{4}$/.test(cue) &&
    gate.reference?.evidence?.sourceCueIds?.includes(cue) &&
    nativeState?.cueProjectionSupported===true;
  if(!certified)return blank();

  const voice=nativeState?.priestVoice;
  const voiceValue=String(voice?.value??"");
  const voiceExact=Boolean(priest && voice?.cueId===cue &&
    ["R17_CUE_SOURCE","INDEPENDENT_PRIEST_OBSERVATION"].includes(voice.owner) &&
    !String(nativeState?.ownership?.priestVoice??"").includes("FAIL_CLOSED"));
  let priestSign=null;
  if(voiceExact){
    if(PUBLIC_SUNG.has(voiceValue) && String(form)!=="LOW")priestSign="SUNG";
    else if(PUBLIC_SPOKEN.has(voiceValue))priestSign="ALOUD";
    else if(QUIET.has(voiceValue))priestSign="QUIET";
  }

  const response=nativeState?.response;
  const responseSign=Boolean(response?.cueId===cue &&
    String(response?.text??response?.label??"").trim() &&
    nativeState?.ownership?.response==="R17_CUE_NATIVE");

  const bell=nativeState?.bell;
  const bellSign=Boolean(server && bell?.cueId===cue &&
    String(bell?.label??"").trim() &&
    bell?.suppressed!==true &&
    nativeState?.triduumBellSuppressed!==true &&
    !/FAIL_CLOSED|SUPPRESS|ABSENCE|NONE/.test(
      String(nativeState?.ownership?.bell??"")));

  // There is no approved automatically observed Schola/organ event.
  // These two signs must remain false until an independent signal exists.
  return freeze({
    priest:priestSign,response:responseSign,bell:bellSign,
    schola:false,organ:false,
    source:"CURRENT_NATIVE_SOURCE_CUE_EXPECTED_NOT_OBSERVED",
    observedSound:false
  });
}
