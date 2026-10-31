// M01: shared publication boundary for existing Mass/rite music events.
//
// An existing source-anchored chant event is NOT an approved musical score,
// selected celebrant/response tone, audio recording or observed performance.
// The musical corpus and any editorial score/recording decisions have separate
// authorities; in particular, draft GregoBase research cannot leak into LIVE.
const freeze=Object.freeze;
const MUSIC_KINDS=new Set([
  "CHANT","PRIEST_VOICE","PROCESSIONAL_CHANT","PROCESSIONAL_LITANY",
  "PROCESSIONAL_HYMN","PROCESSIONAL_ANTIPHON","HYMN","LITANY",
  "RESPONSORY","TRACT","ANTIPHON_PSALM","CHANTED_PASSION",
  "PRIEST_DIALOGUE_WITH_RESPONSES","CANTICLE","PRAECONIUM"
]);
const PAIR_REQUIRED=new Set([
  "GLORIA_INTONATION","CREDO_INTONATION","COLLECT","GOSPEL",
  "PREFACE_DIALOGUE","PATERNOSTER","POSTCOMMUNION","DISMISSAL"
]);

/** The current release has no promoted notation, tone-pair or audio registry.
 * This explicitly records the gap without turning a research lead, a parish
 * free-text setting, or a selected Mass card into a publication claim.
 * SOURCE_REFERENCE_PRESENT is deliberately weaker than text/content approval.
 */
export function sourceMusicMaterialGate({
  eventId,kind,sourceRef,sourceOwner,sourceReferencePresent=false,
  condition=null
}={}){
  const id=String(eventId??"").trim();
  const type=String(kind??"").trim().toUpperCase();
  const owner=String(sourceOwner??"").trim();
  if(!MUSIC_KINDS.has(type))return null;
  const references=Array.isArray(sourceRef)?sourceRef.map(String):[String(sourceRef??"")];
  const valid=Boolean(id&&owner&&references.length&&references.every(Boolean)&&
    sourceReferencePresent===true);
  return freeze({
    schema:"ao-mass-music-material-gate-v1",
    eventId:id,kind:type,sourceOwner:owner,
    sourceRefs:freeze([...references]),condition:condition??null,
    textEvidence:valid?"SOURCE_REFERENCE_PRESENT":"SOURCE_HOLD",
    notation:"NO_APPROVED_RUNTIME_SCORE",
    celebrantResponseTone:PAIR_REQUIRED.has(id)||type==="PRIEST_DIALOGUE_WITH_RESPONSES"
      ?"PAIR_NOT_MUSICALLY_VERIFIED":"NOT_APPLICABLE_OR_UNRESOLVED",
    referenceAudio:"NO_APPROVED_RUNTIME_RECORDING",
    publication:"NOT_PROMOTED",
    editorialPolicy:"USER_APPROVAL_REQUIRED_FOR_NEW_MUSIC",
    musicalPerformance:"NOT_INFERRED",
    usableAsScore:false,usableAsRecording:false
  });
}
