// First 60 Gregorian Proper sources -> explicit PRINTED-MUSIC evidence gate.
// Does not publish any score, no matter how many local review checkboxes
// are marked. User data observations are untrusted reports, not approval.
import {createHash} from "node:crypto";
import {sourceNoteGroupInventory} from "./reader-kyriale-source-note-groups.js";
export const PROPER_PRINT_GATE_SCHEMA="ao-mass-1961-first60-print-facsimile-evidence-v1";
const HEAD="name: original GABC;\n%%\n";
const SCORE_FIELDS=Object.freeze([
 "pitch","neumes","underlay","rhythm","use1962","sourcePrint"
]);
const GROUP_FIELDS=Object.freeze(["gPitch","gNeumes","gUnderlay","gRhythm"]);
const VALID=new Set(["UNREVIEWED","MATCH","DIFFERENCE","UNCERTAIN"]);
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const reject=e=>{throw Error(e)};
function expected60(packet,audit){
 if(packet?.schema!=="ao-mass-1962-first-60-print-score-collation-v1"||
    packet.status!=="FIRST_60_EDITORS_PRINT_REVIEW_NOT_MUSIC_APPROVAL"||
    packet.batch?.candidates!==60||packet.publication?.publicScores!==0||
    !Array.isArray(packet.candidates)||packet.candidates.length!==60||
    audit?.schema!=="ao-1962-gregorian-first60-complete-antiphon-text-audit-v1"||
    audit.counts?.audited!==60||audit.counts.fullAntiphonLexicalEqual!==48||
    audit.counts.literalDifferenceHolds!==12||
    audit.counts.noteGroupTokenizationHolds!==0||
    audit.publication?.publicReaderScores!==0||
    !Array.isArray(audit.scoreEvidence)||audit.scoreEvidence.length!==60)
  reject("PRINT_GATE_PINNED_60_SOURCE_OR_LATIN_AUDIT_INVALID");
 const byId=new Map(audit.scoreEvidence.map(r=>[r.scoreId,r]));
 if(byId.size!==60)reject("PRINT_GATE_LATIN_AUDIT_DUPLICATE_ID");
 return byId;
}
function sourceProof(packet,byId){
 const rows=[],seen=new Set(),byPart={in:0,of:0,co:0};
 for(const score of packet.candidates){
  const ref=byId.get(score.scoreId);
  if(!ref||seen.has(score.scoreId)||!Object.hasOwn(byPart,score.part)||
     ref.part!==score.part||ref.scoreGabcSha256!==score.scoreGabcSha256||
     ref.original1961Page!==score.original1961Page||
     ref.sourceParagraphId!==score.representative?.sourceParagraphId||
     ref.selected1962Date!==score.representative?.date||
     ref.selected1962SourcePath!==score.representative?.sourcePath||
     score.publication!=="EDITORIAL_HOLD_NOT_PUBLIC"||
     score.approvedForMassReader!==false||
     !/^GREGOBASE-\d+$/.test(score.scoreId)||
     !/^[a-f0-9]{64}$/.test(score.scoreGabcSha256)||
     sha(score.scoreGabc)!==score.scoreGabcSha256||
     ref.userEditorialApproval!==false||ref.publicScore!==false||
     typeof score.sourceUrl!=="string"||
     !score.sourceUrl.startsWith("https://gregobase.selapa.net/chant.php?id="))
   reject("PRINT_GATE_SOURCE_SCORE_OR_1962_READER_DRIFT");
  seen.add(score.scoreId);byPart[score.part]++;
  const inventory=sourceNoteGroupInventory(HEAD+score.scoreGabc);
  if(inventory.noteBearingSourceTokens!==ref.evidence.originalScoreNoteBearingTokens)
   reject("PRINT_GATE_ORIGINAL_NOTE_GROUP_CENSUS_DRIFT");
  rows.push(Object.freeze({
   scoreId:score.scoreId,part:score.part,scoreGabcSha256:score.scoreGabcSha256,
   printedEdition:"Graduale Romanum (Solesmes 1961)",
   printedPage:score.original1961Page,
   printedPageVerifiedInImage:false,
   originalScorePageAndTranscription:score.sourceUrl,
   selected1962Date:ref.selected1962Date,
   selected1962SourcePath:ref.selected1962SourcePath,
   sourceOwner:ref.original1962Owner,
   sourceParagraphId:ref.sourceParagraphId,
   selected2026Occurrences:score.occurrences,
   firstTextAuditStatus:ref.status,
   textExact:ref.fullAntiphonLexicalEquality,
   noteGroups:inventory.groups.map(g=>({
    ordinal:g.ordinal,sourceLatinSyllable:g.syllable,
    originalGabcNotes:g.gabcOriginalNotes,
    originalPrintedSystemLocation:null,
    printedPitchVerified:false,
    printedNeumeVerified:false,
    printedUnderlayVerified:false,printedRhythmVerified:false
   })),
   originalGabc:score.scoreGabc,
   completePrintedMusicVerified:false,
   exactReaderCueAndSettingVerified:false,
   signedEditorialApproval:false,
   publication:"EDITORIAL_HOLD_NOT_PUBLIC"
  }));
 }
 if(seen.size!==60||Object.values(byPart).some(n=>n!==20))
  reject("PRINT_GATE_SIXTY_OR_ROLE_QUOTAS_CHANGED");
 return rows;
}
function verdict(row,observed){
 if(!row.textExact)return {status:"SOURCE_TEXT_VARIANT_HOLD",matched:0,
  noteGroupsChecked:0,allGroupChecksComplete:false};
 if(!observed)return {status:"AWAITING_PRINT_FACSIMILE_REVIEW",matched:0,
  noteGroupsChecked:0,allGroupChecksComplete:false};
 if(typeof observed!=="object"||Array.isArray(observed)||
    observed.publicScore!==false||observed.editorialApproval!==false||
    observed.reviewerObservationOnly!==true)
  reject("PRINT_OBSERVATION_MAY_NOT_ASSERT_EDITORIAL_APPROVAL");
 const fields=[...SCORE_FIELDS,...GROUP_FIELDS];
 for(const field of SCORE_FIELDS)if(!VALID.has(observed[field]??"UNREVIEWED"))
  reject("PRINT_OBSERVATION_INVALID_SCORE_FIELD_"+field);
 const groups=observed.groups??{};
 if(!groups||typeof groups!=="object"||Array.isArray(groups)||
    Object.keys(groups).some(k=>!/^[1-9]\d*$/.test(k)||Number(k)>row.noteGroups.length))
  reject("PRINT_OBSERVATION_INVALID_NOTE_GROUP_ID");
 let checked=0,discrepancy=SCORE_FIELDS.some(f=>
   ["DIFFERENCE","UNCERTAIN"].includes(observed[f]));
 for(const group of row.noteGroups){
  const g=groups[group.ordinal]??{};
  for(const f of GROUP_FIELDS){
   if(!VALID.has(g[f]??"UNREVIEWED"))
    reject("PRINT_OBSERVATION_INVALID_NOTE_GROUP_FIELD");
   if(["DIFFERENCE","UNCERTAIN"].includes(g[f]))discrepancy=true;
  }
  if(GROUP_FIELDS.every(f=>g[f]==="MATCH"))checked++;
 }
 const complete=SCORE_FIELDS.every(f=>observed[f]==="MATCH")&&
   checked===row.noteGroups.length;
 return {status:discrepancy?"PRINT_REVIEW_EXCEPTION_HOLD":
   complete?"ALL_OBSERVATIONS_MARKED_PENDING_INDEPENDENT_APPROVAL":
     "PRINT_REVIEW_PARTIALLY_COMPLETED",
  matched:SCORE_FIELDS.filter(f=>observed[f]==="MATCH").length,
  noteGroupsChecked:checked,allGroupChecksComplete:complete};
}
export function buildFirst60PrintedMusicEvidence({packet,latinAudit,observations=null}={}){
 const refs=expected60(packet,latinAudit);
 const rows=sourceProof(packet,refs);
 if(observations!==null){
  if(observations?.schema!=="ao-proper-first60-independent-print-observations-v1"||
     observations.editorialDecision!=="PENDING_INDEPENDENT_REVIEW"||
     observations.publication?.publicScores!==0||
     observations.publication?.automaticApproval!==false||
     observations.publication?.doNotImportIntoLive!==true||
     !Array.isArray(observations.sourceBatchScoreIds)||
     observations.sourceBatchScoreIds.length!==60||
     observations.sourceBatchScoreIds.some((id,i)=>id!==packet.candidates[i].scoreId)||
     !observations.evidence||typeof observations.evidence!=="object"||
     Array.isArray(observations.evidence))
   reject("PRINT_OBSERVATION_EXPORT_NOT_CANONICAL");
  const allowed=new Set(rows.map(x=>x.scoreId+"|"+x.scoreGabcSha256));
  if(Object.keys(observations.evidence).some(key=>!allowed.has(key)))
   reject("PRINT_OBSERVATION_UNKNOWN_OR_TAMPERED_SCORE_ID");
 }
 const scored=rows.map(row=>{
  const observation=observations?.evidence?.[row.scoreId+"|"+row.scoreGabcSha256];
  const status=verdict(row,observation);
  if(!row.textExact&&observation)reject("TEXT_VARIANTS_CANNOT_RECEIVE_PRINT_APPROVAL");
  return Object.freeze({...row,observation:status});
 });
 const count=x=>scored.filter(x).length;
 const textExact=count(x=>x.textExact),held=count(x=>!x.textExact);
 const allGroups=scored.reduce((n,x)=>n+x.noteGroups.length,0);
 const exactGroups=scored.filter(x=>x.textExact).reduce((n,x)=>n+x.noteGroups.length,0);
 const candidates=scored.filter(x=>x.textExact).sort((a,b)=>
  b.selected2026Occurrences-a.selected2026Occurrences||
  a.part.localeCompare(b.part)||a.scoreId.localeCompare(b.scoreId));
 return Object.freeze({
  schema:PROPER_PRINT_GATE_SCHEMA,status:"PRINT_MUSICAL_EVIDENCE_COLLECTION_NO_PUBLICATION",
  counts:{scores:60,fullLatinTextMatches:textExact,textVariantHolds:held,
   noteGroups:allGroups,textMatchedScoreNoteGroups:exactGroups,
   pendingFolioImageComparisons:textExact,
   sourceImagesIndependentlyCompared:0,completePrintedMusicVerified:0,
   signedEditorialApprovals:0,newlyPublicScores:0},
  firstTwelveForPrintComparison:candidates.slice(0,12).map(x=>x.scoreId),
  allScores:scored,
  publication:{publicScores:0,automaticMusicApproval:false,
   originalSolesmesImageMustBeCompared:true,
   userSignoffMandatory:true,readersAndScholaUntouched:true}
 });
}
