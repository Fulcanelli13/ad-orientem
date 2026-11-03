// Original-GABC first antiphon vs exact chosen 1962 Proper Latin.
// This does NOT verify notes, neumes, pitch or actual local sung settings.
// One source text mismatch must stay a publication hold.
import {createHash} from "node:crypto";
import {sourceNoteGroupInventory} from "./reader-kyriale-source-note-groups.js";
export const FIRST60_TEXT_GATE_SCHEMA="ao-1962-gregorian-first60-complete-antiphon-text-audit-v1";
const HASH=/^[a-f0-9]{64}$/;
const norm=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .replace(/j/gi,"i").replace(/\bcoel/gi,"cael")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const words=s=>norm(s).split(" ").filter(Boolean);
function stripMusicalNotation(scoreGabc){
 const text=String(scoreGabc??"");
 const marker=text.indexOf("(::)");
 if(marker<0)throw Error("GABC_ANTIPHON_TERMINATOR_ABSENT");
 const first=text.slice(0,marker).replace(/<[^>]*>/g,"")
   // Editorial GABC braces contain syllable letters, e.g. allelu{ia}.
   .replace(/\{([^}]*)\}/g,"$1")
   .replace(/\([^()]*\)/g,"");
 if(/[{}]/.test(first))throw Error("GABC_ANTIPHON_MARKUP_UNCLOSED");
 return norm(first);
}
function selectedLatinAntiphon(original){
 const lines=String(original??"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 // Introit antiphons carry a rubric ℣. before the text. Other Propers
 // carry a bibliographical scripture line before their first sung line.
 const first=lines[0]??"";
 const selected=/^[℣℟]\s*\./u.test(first)?first:lines[1]??"";
 if(!selected||/^\s*(?:Ps|Matt|Joann|Luc|Is|Prov|Dan|Act)\s*\d/i.test(selected))
  throw Error("SELECTED_1962_ANTIPHON_LINE_UNRESOLVED");
 return norm(selected);
}
const preview=(array,at)=>array.slice(Math.max(0,at-4),at+6).join(" ");
function diff(a,b){
 const x=words(a),y=words(b);
 let pos=0;
 while(pos<x.length&&pos<y.length&&x[pos]===y[pos])pos++;
 return {firstDifferingWord:pos+1,
  gabcTextWordCount:x.length,selectedLatinWordCount:y.length,
  originalGabcDifferenceWindow:preview(x,pos),
  selected1962DifferenceWindow:preview(y,pos)};
}
function compare(score,source){
 if(score===source)return "EXACT_ANTIPHON_LEXICAL_TEXT";
 if(source.startsWith(score+" "))return "SELECTED_1962_HAS_ADDITIONAL_TEXT";
 if(score.startsWith(source+" "))return "ORIGINAL_GABC_HAS_ADDITIONAL_TEXT";
 return "1961_SCORE_VS_SELECTED_1962_TEXT_VARIANT";
}
export function auditFirst60CompleteAntiphonText({packet}={}){
 if(packet?.schema!=="ao-mass-1962-first-60-print-score-collation-v1"||
    packet.status!=="FIRST_60_EDITORS_PRINT_REVIEW_NOT_MUSIC_APPROVAL"||
    packet.publication?.publicScores!==0||packet.batch?.candidates!==60||
    packet.batch?.distinctScoreIds!==60||
    !Array.isArray(packet.candidates)||packet.candidates.length!==60)
  throw Error("SOURCE_FIRST_60_EDITORIAL_PACKET_INVALID");
 const seen=new Set(),counts={},family={in:{exact:0,hold:0},of:{exact:0,hold:0},co:{exact:0,hold:0}};
 const scores=packet.candidates.map(c=>{
  if(!/^GREGOBASE-\d+$/.test(c?.scoreId)||!Object.hasOwn(family,c?.part)||
     !HASH.test(c.scoreGabcSha256)||seen.has(c.scoreId)||
     c.publication!=="EDITORIAL_HOLD_NOT_PUBLIC"||
     c.approvedForMassReader!==false||
     Object.values(c.review??{}).some(x=>x!==false)||
     typeof c.representative?.sourceLatin!=="string"||
     typeof c.scoreGabc!=="string"||
     createHash("sha256").update(c.scoreGabc,"utf8").digest("hex")!==c.scoreGabcSha256)
   throw Error("REVIEW_SCORE_ORIGINAL_IDENTITY_OR_RELEASE_GATE_CHANGED");
  seen.add(c.scoreId);
  const score=stripMusicalNotation(c.scoreGabc);
  const selected=selectedLatinAntiphon(c.representative.sourceLatin);
  if(words(score).length<4||words(selected).length<4)
   throw Error("REVIEW_ANTIPHON_LEXICAL_EXTRACTION_INCOMPLETE");
  const status=compare(score,selected);
  const exact=status==="EXACT_ANTIPHON_LEXICAL_TEXT";
  // The existing Kyriale note-group parser is not a proof of Proper
  // punctuation-to-neume boundaries. A failure is a separate explicit
  // musical-segmentation HOLD, never a Latin-lexical failure or approval.
  let groupInventoryStatus="GROUPS_IDENTIFIED_FOR_PRINT_COMPARISON_NOT_CERTIFIED";
  let noteGroupCount=null,groupInventoryHold=null;
  try{
   const inv=sourceNoteGroupInventory("name: "+c.scoreId+";\\n%%\\n"+c.scoreGabc);
   if(!inv.noteBearingSourceTokens)throw Error("ZERO_NOTE_GROUPS");
   noteGroupCount=inv.noteBearingSourceTokens;
  }catch(e){
   groupInventoryStatus="PROPER_GABC_NOTE_GROUP_TOKENIZATION_HOLD";
   groupInventoryHold=String(e?.message??e).slice(0,200);
  }
  family[c.part][exact?"exact":"hold"]++;
  counts[status]=(counts[status]??0)+1;
  return Object.freeze({
   scoreId:c.scoreId,part:c.part,sourceUrl:c.sourceUrl,
   original1961Page:c.original1961Page,scoreGabcSha256:c.scoreGabcSha256,
   selected1962Date:c.representative.date,
   selected1962SourcePath:c.representative.sourcePath,
   original1962Owner:c.representative.sourceOwner,
   sourceParagraphId:c.representative.sourceParagraphId,
   evidence:{originalGabcAntiphonNormalized:score,
    selected1962AntiphonNormalized:selected,originalScoreNoteBearingTokens:noteGroupCount,
    noteGroupInventoryStatus:groupInventoryStatus,
    noteGroupInventoryHold,
    ...diff(score,selected)},
   status,fullAntiphonLexicalEquality:exact,
   // Text correspondence does not certify the original printed music or
   // segmentation into source-owned reader and response paragraphs.
   complete1962GabcMusicalUnderlayVerified:false,
   original1961PitchAndNeumeFacsimileVerified:false,
   exactReaderBlockAndCueCertified:false,
   userEditorialApproval:false,publicScore:false,
   musicPublicationStatus:"EDITORIAL_HOLD_NOT_PUBLIC"
  });
 });
 if(Object.values(family).some(s=>s.exact+s.hold!==20))throw Error("FAMILY_20_CENSUS_CHANGED");
 return Object.freeze({
  schema:FIRST60_TEXT_GATE_SCHEMA,
  status:"ANTIPHON_TEXT_PARITY_RESEARCH_ONLY_NOT_PRINT_NOTATION_APPROVAL",
  counts:{audited:60,fullAntiphonLexicalEqual:scores.filter(x=>x.fullAntiphonLexicalEquality).length,
   literalDifferenceHolds:scores.filter(x=>!x.fullAntiphonLexicalEquality).length,
   noteGroupTokenizationHolds:scores.filter(x=>x.evidence.noteGroupInventoryHold!=null).length,
   byStatus:counts,byFamily:family,newPublicScores:0,
   automaticallyVerifiedPrintedNeumes:0},
  scoreEvidence:scores,
  textDifferenceHolds:scores.filter(x=>!x.fullAntiphonLexicalEquality),
  publication:{approvedDigitalScores:0,publicReaderScores:0,
   musicalPitchComparisonCertified:false,allSyllableToNeumePairingsCertified:false,
   printRhythmicSignsCompared:false,userAcceptanceRecorded:false}
 });
}
