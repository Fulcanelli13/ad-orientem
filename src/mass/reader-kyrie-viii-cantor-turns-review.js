// Kyrie VIII (1961 Graduale Romanum) performance roles, RESEARCH ONLY.
// In the final ninth invocation, * and ** divide a single Kyrie into
// cantors/first half, second half, and joined full choir respectively.
// This is distinct from the 9 canonical Mass Schola cues. None are moved.
// Source: Graduale Romanum (1961), De ritibus servandis in cantu Missae II,
// and the source-locked 1961 Kyriale VIII melody pp. 28*–29*.
import {prepareKyrieVIIIReview,KYRIE_VIII_REVIEW_SOURCE}
 from "./reader-kyrie-viii-review-queue.js";

const freeze=Object.freeze;
export const KYRIE_VIII_TURN_SCHEMA="ao-1961-schola-kyrie-viii-cantor-turns-review-v1";
const SOURCE_RULE="Graduale Romanum (1961), De ritibus servandis in cantu Missae, II";
const SOURCE_URL="https://fliphtml5.com/tlnkj/pybi/Graduale_Romanum_1961/23/";
const finalCue="AO.SM.C0052";
const hold=reason=>freeze({
 schema:KYRIE_VIII_TURN_SCHEMA,status:"HOLD_ORIGINAL_RUBRIC_OR_SOURCE_DRIFT",
 reason,publicScoreCount:0,subphrases:freeze([])
});

export function reviewKyrieVIIICantorTurns({corpus,source}={}){
 const review=prepareKyrieVIIIReview({corpus,source});
 if(review.status!=="READY_FOR_NOTE_BY_NOTE_PRINT_REVIEW_NOT_PUBLISHABLE" ||
   review.sourceCues!==9 || review.scoreId!=="GREGOBASE-1184")
  return hold("NINE_CANONICAL_SOURCE_CUES_REQUIRED");
 const final=review.rows.at(-1);
 if(final?.cueId!==finalCue||final?.sourceLine!==3||
   final?.sourceLatin!=="Kýrie, eléison."||
   JSON.stringify(final?.facsimileFolios)!=='["29*"]')
  return hold("FINAL_KYRIE_CUE_OR_PRINT_FOLIO_DRIFT");
 const line=final.sourceLineGabc;
 // Literal 1961 score transcribes one simple star, then one double star.
 // The second section has MELISMA ONLY and must not create an extra Kyrie.
 const a=line.indexOf("<clear>*");
 const b=line.indexOf("<clear>**");
 if(a<0||b<=a||line.indexOf("<clear>*",a+1)!==b||
   line.indexOf("<clear>**",b+1)>=0||!line.endsWith("(::)"))
  return hold("ORIGINAL_SINGLE_AND_DOUBLE_ASTERISK_BOUNDARIES_REQUIRED");
 const first=line.slice(0,a).trim(),second=line.slice(a+"<clear>*".length,b).trim(),
       third=line.slice(b+"<clear>**".length).trim();
 if(!/^Ký\(k'\)ri\(j\)e\(/u.test(first)||
   !/^\(,\)\s+\(kj/u.test(second)||
   !/^\(,\)\s+e\(/u.test(third))
  return hold("PRINTED_THREE_PART_MELODY_OR_LYRIC_BOUNDARY_DRIFT");
 const subphrases=freeze([
  freeze({id:"KYRIE_VIII_FINAL_PART_1",part:1,owner:"CANTORS_OR_FIRST_CHOIR",
   sourceCueId:finalCue,sourceStar:"BEFORE_SINGLE_STAR",
   sourceText:"Kýrie",sourceLatin:final.sourceLatin,
   rawGabcSourceFragment:first,sourceNoteVerified:false,
   performance:"EXPECTED_NOT_OBSERVED"}),
  freeze({id:"KYRIE_VIII_FINAL_PART_2",part:2,owner:"OTHER_CHOIR_HALF",
   sourceCueId:finalCue,sourceStar:"AFTER_SINGLE_BEFORE_DOUBLE_STAR",
   sourceText:"melisma continuing Kýrie",sourceLatin:final.sourceLatin,
   rawGabcSourceFragment:second,sourceNoteVerified:false,
   performance:"EXPECTED_NOT_OBSERVED"}),
  freeze({id:"KYRIE_VIII_FINAL_PART_3",part:3,owner:"FULL_CHOIR_TOGETHER",
   sourceCueId:finalCue,sourceStar:"AFTER_DOUBLE_STAR",
   sourceText:"eléison",sourceLatin:final.sourceLatin,
   rawGabcSourceFragment:third,sourceNoteVerified:false,
   performance:"EXPECTED_NOT_OBSERVED"})
 ]);
 return freeze({
  schema:KYRIE_VIII_TURN_SCHEMA,
  status:"RUBRICALLY_MAPPED_MUSICAL_PROOF_NOT_APPROVED",
  sourceRule:SOURCE_RULE,sourceUrl:SOURCE_URL,
  sourceScoreId:KYRIE_VIII_REVIEW_SOURCE.scoreId,
  sourceGabcSha256:KYRIE_VIII_REVIEW_SOURCE.sourceGabcSha256,
  finalCueId:finalCue,sourceLine:3,facsimileFolios:final.facsimileFolios,
  firstEightCues:freeze(review.rows.slice(0,8).map(row=>freeze({
   sourceCueId:row.cueId,sourceLine:row.sourceLine,
   choirPattern:"ALTERNATING_CANTORS_OR_CHOIR_HALVES",
   startingSide:"LOCAL_UNSPECIFIED",observed:false
  }))),
  subphrases,printedPartCount:3,
  canonicalMassCues:9,extraMassCues:0,publicScoreCount:0,
  userEditorialApproval:false,musicalNotationVerified:false,
  publication:"BLOCKED"
 });
}
