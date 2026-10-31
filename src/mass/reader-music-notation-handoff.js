// M06: source-owned chant -> existing offline Exsurge viewer handoff.
// This is a MODEL / EDITORIAL contract, not a new score renderer.
// Draft #2111 already owns createKyrialeNotationViewer.open(score), which
// accepts {scoreId,title,printedWitness,sourceUrl,gabc}. New scores MUST
// remain outside public assets until an independently trusted user-approved
// publication manifest and original musical-facsimile comparison exist.
import {resolve1962DialogueToneFamily} from "./reader-mass-1962-tone-family.js";

const freeze=Object.freeze;
const PREFACE=freeze({
 SOLEMN:freeze({id:"PREFACE_SOLEMN",sourceId:4449}),
 FERIAL:freeze({id:"PREFACE_FERIAL",sourceId:4450})
});
const CANDIDATES=freeze({
 ORATIONS_FESTIVE:4487,PATERNOSTER_COMMON:7282,
 ASPERGES_NORMAL:497,ASPERGES_PASCHAL:958,DISMISSAL_ITE_I:2988
});
const musicHold=(eventId,reason,lead=null,parts=[])=>freeze({
 schema:"ao-mass-music-m06-notation-handoff-v1",
 eventId:String(eventId??""),status:"RESEARCH_ONLY_NOT_PUBLISHED",
 reason,sourceCandidateId:lead?.id??null,sourceId:lead?.sourceId??null,
 sourceParts:freeze(parts.map(x=>freeze(x))),
 rendererOwner:"EXISTING_PR2111_OFFLINE_EXSURGE_PILOT",
 scorePublished:false,sourceNotationApproved:false,recordingApproved:false,
 playableAudio:false,observedSinging:false,scoreAvailableToMassUser:false
});
const toPart=(exchange)=>freeze({
 exchangeId:exchange.id,
 leaderCueIds:freeze([...exchange.leaderCueIds]),
 responseCueIds:freeze([...exchange.responseCueIds]),
 leaderRole:exchange.leaderRole,
 responseRole:exchange.responseRole
});
function lead(id){return {id,sourceId:CANDIDATES[id]}}
function skip(event,reason){return musicHold(event,reason)}
/** The ACTUAL selected Mass owns the Preface's solemn / ferial
 * classification. Never use a generic civil-season or parish title to
 * select both priest and choir melody.
 */
export function resolveOrdinaryMassNotationHandoff({
 eventId,form="SOLEMN",resolvedMass=null,massPlan=null,
 sungDialogue=null
}={}){
 const id=String(eventId??"");
 const actor=String(form??"").toUpperCase();
 if(!["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"].includes(actor))
  return skip(id,"NO_SUNG_MASS_SCORE_PROJECTION");
 if(!sungDialogue||sungDialogue.eventId!==id||
    !Array.isArray(sungDialogue.exchanges)||!sungDialogue.exchanges.length)
  return skip(id,"CANONICAL_SUNG_SOURCE_PAIRS_REQUIRED");
 const parts=sungDialogue.exchanges.map(toPart);
 if(id==="PREFACE_DIALOGUE"){
  const tone=resolve1962DialogueToneFamily(id,{resolvedMass});
  if(tone?.status!=="RUBRICAL_FAMILY_RESOLVED" ||
     !PREFACE[tone.family]||
     sungDialogue.toneSelection?.toneFamily!==tone.family)
   return musicHold(id,"EXACT_1962_SOLEMN_FERIAL_TONE_UNRESOLVED",null,parts);
  if(parts.length!==3||parts.some(x=>x.leaderCueIds.length<1||x.responseCueIds.length!==1))
   return musicHold(id,"THREE_COMPLETE_PREFACE_EXCHANGES_REQUIRED",null,parts);
  return musicHold(id,"PREFACE_PRIEST_AND_THREE_RESPONSES_RESEARCH_SCORE_HELD",
   PREFACE[tone.family],parts);
 }
 if(["COLLECT","POSTCOMMUNION"].includes(id)){
  const tone=resolve1962DialogueToneFamily(id,{resolvedMass});
  if(tone?.status!=="RUBRICAL_FAMILY_RESOLVED")
   return musicHold(id,"COMMON_TONE_FAMILY_UNRESOLVED",null,parts);
  if(tone.family!=="SOLEMN")return musicHold(id,"FERIAL_ORATION_GREETING_SCORE_NOT_YET_ACQUIRED",null,parts);
  return musicHold(id,"FESTIVE_GREETING_ONLY_FULL_ORATION_TONE_NOT_ACQUIRED",
   lead("ORATIONS_FESTIVE"),parts);
 }
 if(id==="PATERNOSTER"){
  const tone=resolve1962DialogueToneFamily(id,{resolvedMass});
  if(tone?.status!=="RUBRICAL_FAMILY_RESOLVED")
   return musicHold(id,"COMMON_TONE_FAMILY_UNRESOLVED",null,parts);
  return musicHold(id,"PATER_NOSTER_CONCLUSION_ONLY_EXACT_COMPLETE_TONE_PENDING",
   lead("PATERNOSTER_COMMON"),parts);
 }
 if(id==="DISMISSAL"){
  const chosen=String(sungDialogue.dismissal?.formula??"UNRESOLVED");
  if(chosen==="REQUIESCANT_IN_PACE")
   return musicHold(id,"REQUIEM_REQUIESCANT_AMEN_MUSIC_NOT_YET_ACQUIRED",null,parts);
  if(chosen==="BENEDICAMUS_DOMINO")
   return musicHold(id,"BENEDICAMUS_DEO_GRATIAS_MUSIC_NOT_YET_ACQUIRED",null,parts);
  if(chosen!=="ITE_MISSA_EST"||massPlan?.dismissal!=="ITE_MISSA_EST")
   return musicHold(id,"SOURCE_CERTIFIED_DISMISSAL_VARIANT_REQUIRED",null,parts);
  // GregoBase #2988 is a DOUBLE Alleluia setting for a particular printed
  // seasonal use. No current authoritative 1962 dismissal resolver has
  // established that usage; do NOT show it on ordinary Sundays or weekdays.
  return musicHold(id,"DOUBLE_ALLELUIA_DISMISSAL_SOURCE_PROOF_REQUIRED",
   lead("DISMISSAL_ITE_I"),parts);
 }
 return musicHold(id,"NO_M05_SCORE_ACQUIRED_FOR_THIS_SUNG_DIALOGUE",null,parts);
}
/** Aspersion is a separate *native rite*, not a substitute for the Introit.
 * Require the native selected formula and rite source's event identity.
 * The 1961 score contains Gloria Patri, but the 1962 PASSIONTIDE native
 * rite omits that paragraph; do not present an unsplit full score as if all
 * of it were to be sung.
 */
export function resolveNativeAspersionNotationHandoff({
 riteId,stageId,eventId,formulaState
}={}){
 const id=String(eventId??"");
 if(riteId!=="ASPERGES"||stageId!=="ASP-R02")return skip(id,"NATIVE_ASPERGES_CHANT_STAGE_REQUIRED");
 const form=String(formulaState?.formula??"");
 const correct=form==="ORDINARY"?"AO.MUS.ASP.ME":
   form==="PASCHAL"?"AO.MUS.ASP.VIDI":null;
 if(!correct||id!==correct)return skip(id,"ASPERGES_FORMULA_EVENT_MISMATCH");
 if(form==="PASCHAL"&&formulaState?.omitGloriaPatri)
  return skip(id,"PASCHAL_RITE_CANNOT_OMIT_GLORIA");
 if(form==="ORDINARY"&&formulaState?.omitGloriaPatri)
  return musicHold(id,"PASSIONTIDE_GLORIA_MUST_BE_SUPPRESSED_IN_VIEWER",
   lead("ASPERGES_NORMAL"));
 return musicHold(id,"1961_ANTIPHON_PSALM_GLORIA_RESEARCH_SCORE_PENDING",
  lead(form==="PASCHAL"?"ASPERGES_PASCHAL":"ASPERGES_NORMAL"));
}
const recordedId=s=>String(s??"").trim();
/** A user/editor may use an isolated RESEARCH preview with PR #2111's
 * existing Exsurge score.open() payload. This mapper neither imports
 * GABC into the live Mass UI nor approves/publicly exposes a score.
 * It requires an exact M05 text screening result and an explicit
 * research-review context. No caller-supplied flags authorize release.
 */
export function buildOfflineNotationResearchPayload({
 handoff,record,sourceScreen,editorialReview=false
}={}){
 if(editorialReview!==true||!handoff||
    handoff.status!=="RESEARCH_ONLY_NOT_PUBLISHED"||
    !handoff.sourceCandidateId||recordedId(record?.id)!==handoff.sourceCandidateId||
    record?.sourceId!==handoff.sourceId||
    sourceScreen?.id!==record.id||
    sourceScreen?.textParity!=="PINNED_TEXT_MATCHES_GABC"||
    sourceScreen?.scoreRelease!=="BLOCKED"||
    record?.renderApproved!==false||
    record?.editorialApproval!=="PENDING_USER_FINAL_COLLECTION_REVIEW"||
    !String(record?.gabc??"").includes("%%")||
    !/^https:\/\/gregobase\.selapa\.net\/chant\.php\?id=\d+$/.test(
      String(record?.gregobaseUrl??"")))return null;
 // Never preview a complete Gloria-containing Asperges as an actual
 // Passiontide score, nor mislabel an Easter-only dismissal as ordinary.
 if(["PASSIONTIDE_GLORIA_MUST_BE_SUPPRESSED_IN_VIEWER",
      "DOUBLE_ALLELUIA_DISMISSAL_SOURCE_PROOF_REQUIRED"].includes(handoff.reason))
   return null;
 return freeze({
  scoreId:"GREGOBASE-"+record.sourceId,title:record.sourceName,
  printedWitness:record.sourceFolio,sourceUrl:record.gregobaseUrl,
  gabc:record.gabc,
  referenceType:"RESEARCH_ONLY_NOT_RELEASED",
  releaseApproved:false,audio:false,
  targetEventId:handoff.eventId
 });
}
/** Always closed until user approvals and printed music verification exist.
 * The existing Kyriale research viewer is not a public publication route.
 */
export function approvedMassNotationForLive(_handoff,_record,_approval){
 return null;
}
