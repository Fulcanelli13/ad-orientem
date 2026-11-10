// Non-publishing Schola review crosswalk for Kyrie VIII / De Angelis.
// The 1961 witness uses four musical lines with 3+3+2+1 invocations,
// while the native 65-card reader owns nine independent source cues.
// Research metadata is not an editorial or note-for-note musical approval.
import {offlineKyrialeResearchScore} from "./reader-kyriale-research-gabc.js";

export const KYRIE_VIII_REVIEW_SCHEMA="ao-schola-kyrie-viii-nine-cue-source-review-v1";
export const KYRIE_VIII_REVIEW_SOURCE=Object.freeze({
 scoreId:"GREGOBASE-1184",
 movement:"KYRIE",settingId:"MASS_08",
 title:"Kyrie VIII · De Angelis",
 sourceUrl:"https://gregobase.selapa.net/chant.php?id=1184",
 sourceWitness:"Graduale Romanum, Solesmes 1961, p. 28*",
 printedPageImages:Object.freeze([
  "https://gregobase.selapa.net/sources/2/905.png",
  "https://gregobase.selapa.net/sources/2/906.png"
 ]),
 sourceCredit:"Andrew Hinkley (GregoBase transcription; later revision history)",
 sourceLicence:"CC0-1.0",
 reviewStatus:"TEXT_AND_SOURCE_IDENTIFIED_NOT_MUSICAL_APPROVED",
 userApproved:false,musicalNotationVerified:false,publication:"BLOCKED"
});
const FORMULA=Object.freeze([
 Object.freeze({sourceLine:0,cues:Object.freeze(["AO.SM.C0044","AO.SM.C0045","AO.SM.C0046"]),latin:"Kýrie, eléison.",role:"KYRIE_INITIAL"}),
 Object.freeze({sourceLine:1,cues:Object.freeze(["AO.SM.C0047","AO.SM.C0048","AO.SM.C0049"]),latin:"Christe, eléison.",role:"CHRISTE"}),
 Object.freeze({sourceLine:2,cues:Object.freeze(["AO.SM.C0050","AO.SM.C0051"]),latin:"Kýrie, eléison.",role:"KYRIE_RETURN"}),
 Object.freeze({sourceLine:3,cues:Object.freeze(["AO.SM.C0052"]),latin:"Kýrie, eléison.",role:"KYRIE_FINAL_VARIANT"})
]);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[æœ]/gi,c=>c.toLowerCase()==="æ"?"ae":"oe")
 .toLowerCase().replace(/[^a-z]/g,"");
const fail=reason=>Object.freeze({
 schema:KYRIE_VIII_REVIEW_SCHEMA,
 status:"HOLD_SOURCE_MISMATCH",reason,
 scoredCues:0,approvedScores:0,publishedScores:0,
 rows:Object.freeze([])
});
export function prepareKyrieVIIIReview({corpus,source=offlineKyrialeResearchScore("KYRIE","MASS_08")}={}){
 if(source?.scoreId!==KYRIE_VIII_REVIEW_SOURCE.scoreId ||
    source?.catalogueId!=="MASS_08"||
    typeof source.gabc!=="string"||
    !source.gabc.includes("Graduale Romanum, 1961, p. 28*"))
  return fail("WRONG_SOURCE_IDENTITY_OR_1961_WITNESS");
 const body=source.gabc.split("%%")[1];
 const lines=body?.split(/\r?\n/).map(s=>s.trim()).filter(s=>s.includes("(::)"))??[];
 if(lines.length!==4||
    !/^\(c3\)\s*KY/.test(lines[0])||
    !/^Chri/.test(lines[1])||
    !/^Ký/.test(lines[2])||
    !/^Ký/.test(lines[3])||
    !/iij\./.test(lines[0])||
    !/iij\./.test(lines[1])||
    !/ij\./.test(lines[2])||
    /iij\.|ij\./.test(lines[3]))
  return fail("K148_1961_FOUR_MUSICAL_LINES_OR_REPEAT_COUNTS_DRIFT");
 const blocks=corpus?.blocks?.filter(b=>b.Macro_ID==="AO.SM.M02")??[];
 const units=blocks.flatMap(b=>(b.units??[])
  .filter(u=>u.clock==="SCHOLA_PUBLIC")
  .map(u=>({cueId:u.cue_id,latin:u.latin,blockId:b.Block_ID})));
 if(blocks.length!==1||units.length!==9||blocks[0].Block_ID!=="AO.SM.B015")
  return fail("SOURCE_65_CARD_KYRIE_BLOCK_OR_NINE_CUES_DRIFT");
 const sourceRows=FORMULA.flatMap(g=>g.cues.map((cueId,repeatIndex)=>Object.freeze({
  cueId,sourceLine:g.sourceLine,repeatIndex,sourceBlockId:"AO.SM.B015",
  settingId:"MASS_08",sourceScoreId:"GREGOBASE-1184",
  sourceLatin:g.latin,role:g.role,
  sourceLineGabc:lines[g.sourceLine],
  noteComparison:"NOT_DONE",
  userEditorialApproval:false,
  musicalNotationVerified:false,
  status:"RESEARCH_REVIEW_HOLD_NOT_PUBLIC"
 })));
 if(sourceRows.length!==9 || sourceRows.some((row,i)=>
  units[i]?.cueId!==row.cueId||
  units[i]?.blockId!==row.sourceBlockId||
  norm(units[i]?.latin)!==norm(row.sourceLatin)))
  return fail("NATIVE_NINE_CUE_LATIN_OR_ORDER_DRIFT");
 return Object.freeze({
  schema:KYRIE_VIII_REVIEW_SCHEMA,
  status:"READY_FOR_NOTE_BY_NOTE_PRINT_REVIEW_NOT_PUBLISHABLE",
  scoreId:"GREGOBASE-1184",
  sourceWitness:KYRIE_VIII_REVIEW_SOURCE.sourceWitness,
  sourceUrl:KYRIE_VIII_REVIEW_SOURCE.sourceUrl,
  pattern:"3 KYRIE INITIAL + 3 CHRISTE + 2 KYRIE RETURN + 1 FINAL VARIANT",
  printedSourceLines:4,sourceCues:9,
  printedRepeatPattern:Object.freeze([3,3,2,1]),
  noteComparisonComplete:false,
  musicalNotationVerified:false,
  approvedScores:0,publishedScores:0,
  rows:Object.freeze(sourceRows)
 });
}
