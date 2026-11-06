// The two 1962 sung Mass greetings with no independently assigned 1961
// response melody: Offertory (C0107) and final dismissal greeting (C0258).
// §§477,507,513–516 (1962) certify their sung role, NOT a specific pitch.
// Hypothesis: the 1961 ordinary festive oration greeting (#4487) may be
// transferable. Explicitly chosen opt-in RESEARCH PREVIEW ONLY, never
// canonical source authority, ordinary public notation or a performance claim.
import {PARTICIPATION_REFERENCE_SCORES} from "./reader-participation-reference-scores.js";
import {resolve1962CommonMassTone} from "./reader-mass-1962-tone-family.js";

export const GREETING_TRANSFER_SCHEMA="ao-1961-two-greeting-context-hypothesis-v1";
export const GREETING_TRANSFER_EXPLICIT_SELECTION="ORATION_FESTIVE_4487_UNVERIFIED_CONTEXT";
export const GREETING_TRANSFER_SOURCE=Object.freeze({
 sourceId:4487,sourceUrl:"https://gregobase.selapa.net/chant.php?id=4487",
 folio:"Graduale Romanum (Solesmes, 1961), p. 113*",
 pdfUrl:"https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf",
 rubric1962:"https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html",
 musicGuide1962:"https://media.churchmusicassociation.org/books/7848318-Psallite-Sapienter-A-Musicians-Guide-to-the-Extraordinary-Form.pdf",
 candidateUse:"ORATION_GREETING_TRANSFER_NOT_VERIFIED_FOR_OFFERTORY_OR_DISMISSAL",
 researchOnly:true,publicScoreApproved:false,sourceContextCertified:false
});
export const GREETING_TRANSFER_CUES=Object.freeze([
 Object.freeze({cueId:"AO.SM.C0107",blockId:"AO.SM.B028",eventId:"OFFERTORY",
   situation:"GREETING_BEFORE_OFFERTORY_OREMUS",chantRole1962:"SUNG_1962_513",
   candidateScope:"CONTEXT_TRANSFER_NOT_PRINTED_FOR_THIS_LOCATION"}),
 Object.freeze({cueId:"AO.SM.C0258",blockId:"AO.SM.B089",eventId:"DISMISSAL",
   situation:"GREETING_AFTER_POSTCOMMUNION_BEFORE_DISMISSAL",
   chantRole1962:"SUNG_1962_513",
   candidateScope:"CONTEXT_TRANSFER_NOT_PRINTED_FOR_THIS_LOCATION"})
]);
const normalize=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .toLowerCase().replace(/[℟℣]/g,"").replace(/[^a-z0-9]/g,"");
const canon=PARTICIPATION_REFERENCE_SCORES.find(x=>x.id==="AO.REF.ORATIONS_FESTIVE.0071");
if(!canon||canon.sourceId!==4487||canon.sourceLatin!=="℟. Et cum spíritu tuo."||
  canon.publicScoreApproved!==false||!canon.gabc.includes("(c3) <sp>R/</sp>. Et(h)"))
 throw Error("1961_GREETING_PRINTED_SOURCE_CHANGED__DO_NOT_SYNTHESIZE");
const sourced=(paragraph,requiredText)=>[
 paragraph?.primary,paragraph?.secondary,paragraph?.alternate,paragraph?.latin
].some(text=>typeof text==="string"&&normalize(text)===normalize(requiredText));

/** Not a tone recommendation. A deliberately explicit source-scope hypothesis
 * for review, never inferred from date, Gregorian response words, or selection
 * of an Ite/Offertory chant. All missing contexts fail closed.
 */
export function twoGreetingTransferCandidates({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null,selectedSettings={}
}={}){
 if(selectedSettings?.GREETING_TRANSFER_SOURCE!==GREETING_TRANSFER_EXPLICIT_SELECTION)
  return Object.freeze([]);
 if(!["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]
   .includes(String(form??"").toUpperCase()))return Object.freeze([]);
 if(resolvedMass?.schema!=="ao-resolved-mass-v2"||
   (resolvedMass.form&&String(resolvedMass.form).toUpperCase()!==String(form).toUpperCase())||
   (resolvedMass.distinctRite&&resolvedMass.distinctRite!=="NONE"))return Object.freeze([]);
 const target=GREETING_TRANSFER_CUES.find(x=>
   Array.isArray(paragraph?.sourceCueIds)&&
   paragraph.sourceCueIds.length===1&&paragraph.sourceCueIds[0]===x.cueId);
 if(!target||!paragraph||paragraph.kind==="RUBRIC"||
   !Array.isArray(paragraphs)||paragraphs.filter(x=>x===paragraph).length!==1||
   paragraphs.filter(p=>p?.id===paragraph.id).length!==1||
   paragraphs.filter(p=>Array.isArray(p?.sourceCueIds)&&p.sourceCueIds.includes(target.cueId)).length!==1||
   !sourced(paragraph,canon.sourceLatin))return Object.freeze([]);
 if(paragraph.sourceBlockId&&paragraph.sourceBlockId!==target.blockId)return Object.freeze([]);
 const proper=resolvedMass?.proper,context=resolvedMass?.provenance?.musicToneContext;
 const sourcePath=String(proper?.data?.sourcePath??proper?.sourcePath??"");
 if(!["READY","CACHED"].includes(proper?.status)||
   !/^(Tempora|Sancti|Commune)\/[A-Za-z0-9/_-]+$/i.test(sourcePath)||
   context?.verified!==true||context?.sourceOwner!=="1962_PROPER_RESOLVER"||
   context?.sourcePath!==sourcePath)return Object.freeze([]);
 const tone=resolve1962CommonMassTone({resolvedMass});
 if(tone.status!=="RUBRICAL_FAMILY_RESOLVED"||tone.family!=="SOLEMN")
  return Object.freeze([]);
 // An explicit old tone or variation must not accidentally borrow the
 // default festive greeting. Oration tone optional selections are independent.
 if(selectedSettings.ORATION_TONE&&selectedSettings.ORATION_TONE!=="DEFAULT_1961")
  return Object.freeze([]);
 return Object.freeze([Object.freeze({
  id:"AO.REF.UNVERIFIED_CONTEXT_TRANSFER_"+target.eventId+"."+target.cueId,
  sourceId:canon.sourceId,sourceName:canon.sourceName,
  sourceUrl:canon.sourceUrl,sourceFolio:canon.sourceFolio,
  sourceDocument:"src/mass/reader-two-greeting-transfer-candidates.js",
  sourceCueIds:Object.freeze([target.cueId]),
  sourceCueLatin:Object.freeze([canon.sourceLatin]),
  sourceLatin:canon.sourceLatin,kind:"PEOPLE_RESPONSE",
  eventId:target.eventId,riteScope:"ORDINARY_AND_SELECTED_MASS",
  sourcePhraseIndex:canon.sourcePhraseIndex,toneFamily:"SOLEMN",
  sourceContextCertified:false,sourceRubricEvidence:"1962_513_SUNG_GREETING",
  printVerification:"PRINTED_MELODY_EXACT_1961__THIS_MASS_POSITION_UNCERTIFIED",
  reviewOnly:true,publicScoreApproved:false,
  transferHypothesis:GREETING_TRANSFER_SOURCE.candidateUse,
  gabc:canon.gabc
 })]);
}
