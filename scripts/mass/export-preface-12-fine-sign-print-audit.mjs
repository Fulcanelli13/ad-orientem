// Research-only, source-derived fine-neume review slots. Neither a Gregorian
// engraving nor agreement between modern transcriptions certifies the 1961 print.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {buildPreface12PrintWorklist} from "./export-preface-12-independent-print-worklist.mjs";

export const PREFACE_SIGN_REVIEW_SCHEMA="ao-1961-preface-12-syllable-mark-print-audit-v1";
const alternate=JSON.parse(readFileSync(new URL(
 "../../data/mass/preface-1961-alt-transcriber-rhythmic-differences.v1.json",
 import.meta.url),"utf8"));
const signatures=Object.freeze({
 "..":{type:"DOUBLE_PUNCTUM_MORA",domain:"RHYTHMIC_SIGN"},
 ".":{type:"PUNCTUM_MORA",domain:"RHYTHMIC_SIGN"},
 "'":{type:"VERTICAL_EPISEMA",domain:"RHYTHMIC_SIGN"},
 "_":{type:"HORIZONTAL_EPISEMA",domain:"RHYTHMIC_SIGN"},
 "~":{type:"DIMINUTIVE_LIQUESCENCE",domain:"NEUME_SHAPE"},
 "!":{type:"ZERO_WIDTH_NEUME_BOUNDARY",domain:"GROUPING"},
 w:{type:"QUILISMA",domain:"NEUME_SHAPE"},
 v:{type:"VIRGA",domain:"NEUME_SHAPE"}
});
function notesAndSigns(group){
 const symbols=[];
 // Longest alternative first: ".." must not become two distinct mora dots.
 const re=/\.\.|\.|'|_|~|!|[a-m]w|[a-m]v/gu;
 for(const m of group.matchAll(re)){
  const symbol=m[0], key=symbol.length===2&&/[a-m][wv]/u.test(symbol)?
   symbol[1]:symbol;
  const category=signatures[key];
  if(!category)throw Error("UNKNOWN_PREFACE_GABC_SIGN_"+symbol);
  symbols.push({symbol,sourceCharOffset:m.index,
   kind:category.type,domain:category.domain});
 }
 return symbols;
}
const loc=(w,status="PENDING_INDEPENDENT_VISUAL_SIGN_TRANSCRIPTION")=>({
 book:w.book,page:w.page,imageUrl:w.url,
 printGlyphObserved:null,signShapeConfirmed:false,
 visualEvidenceCrop:null,reviewer:null,comparisonStatus:status
});
export function buildPreface12FineSignAudit(){
 const master=buildPreface12PrintWorklist();
 const rows=master.rows.map(r=>{
  const alt=alternate.rows.find(a=>a.primaryGregoBaseId===r.sourceId&&a.cueId===r.cueId);
  if(!alt)throw Error("MISSING_ALTERNATE_PREFACE_"+r.sourceId+"_"+r.cueId);
  const groups=r.sourceSyllableNoteGroups.map((g,syllableIndex)=>({
   syllableIndex,syllable:g.printedSyllable,sourceGabcNoteGroup:g.gabcNoteGroup,
   pitchedLetters:[...g.gabcNoteGroup.matchAll(/[a-m]/gu)].map(x=>x[0]),
   signs:notesAndSigns(g.gabcNoteGroup).map((sign,signIndex)=>({
    ...sign,signId:r.scoreId+".S"+syllableIndex+".M"+signIndex,
    printChecks:r.printWitnesses.map(w=>loc(w))
   }))
  }));
  const special=r.sourceId===4451&&r.cueId==="AO.SM.C0138";
  const exceptional=special?{
   phraseSyllable:"spí",sourceNoteGroup:"g",alternativeNoteGroup:"g'",
   sign:"VERTICAL_EPISEMA",sourceSignPresent:false,alternativeSignPresent:true,
   editorialHistory:"2023-03-30 alternate #7676 adding ictus",
   proofRequired:"READ_ORIGINAL_1961_PRINT_AT_SPI_NOT_ALTERNATE_GABC",
   currentVisualReading:"INDETERMINATE_AT_AVAILABLE_SCAN_RESOLUTION",
   printChecks:r.printWitnesses.map(w=>loc(w,"PRINTED_ICTUS_NOT_YET_RESOLVED"))
  }:null;
  return {scoreId:r.scoreId,sourceId:r.sourceId,family:r.family,cueId:r.cueId,
   sourceLatin:r.sourceLatin,sourceGabcPhrase:r.originalGabcPhrase,
   originalGabcSource:r.sourceUrl,
   alternateSourceUrl:alt.alternateTextUrl,
   printedWitnesses:r.printWitnesses,
   syllables:groups,
   cadenceBar:{sourceGabc:"(::)",printedBarShape:"NOT_CERTIFIED"},
   alternateSignConflict:exceptional,
   independentPrintedSignCertification:"NONE",
   published:false,publicScoreApproved:false,
   editorialDecision:"RESEARCH_HOLD"};
 });
 const signs=rows.flatMap(r=>r.syllables.flatMap(s=>s.signs));
 const conflicts=rows.filter(x=>x.alternateSignConflict);
 const counts={
  responseSettings:rows.length,printedBookWitnesses:rows.reduce((n,r)=>n+r.printedWitnesses.length,0),
  sourceSignOccurrences:signs.length,
  sourceSignPrintChecks:signs.reduce((n,x)=>n+x.printChecks.length,0),
  sourceMarkTypes:[...new Set(signs.map(x=>x.kind))].sort(),
  alternativeSignConflicts:conflicts.length,
  alternativeConflictPrintChecks:conflicts.reduce((n,r)=>n+r.alternateSignConflict.printChecks.length,0),
  independentlyVerifiedSignChecks:0,independentlyCertifiedResponses:0,newPublicApprovals:0
 };
 if(rows.length!==12||counts.printedBookWitnesses!==24||conflicts.length!==1||
   counts.alternativeConflictPrintChecks!==2||
   signs.some(x=>x.printChecks.length!==2)||
   rows.some(r=>r.printedWitnesses.length!==2||r.publicScoreApproved!==false))
  throw Error("INVALID_PREFACE_FINE_SIGN_AUDIT_SCOPE");
 return {
  schema:PREFACE_SIGN_REVIEW_SCHEMA,
  sourceAuthority:"1961 Liber Usualis pp.109–110 and Graduale Romanum pp.130*–132*",
  visualJudgment:"The current reproductions do not reliably resolve the spí vertical episema. No print sign has been independently certified. This file is a generated source-sign locator and comparison checklist, not a transcription of the printed signs.",
  syntaxReference:"https://gregorio-project.github.io/gabc/details.html",
  documentedDisputeSource:"https://gregobase.selapa.net/history.php?changeset=1680188627%7C7676%7C8322",
  structuralRule:"GABC ! is a zero-width neume boundary, not an ictus; w marks a quilisma shape, not an additional pitch. A doubled period remains one double-mora group. Absence of a symbol in GABC is not proof of absence in the print.",
  counts,rows
 };
}
const csv=x=>'"'+String(x??"").replaceAll('"','""').replaceAll("\n"," ")+'"';
export function preface12FineSignCsv(){
 const d=buildPreface12FineSignAudit();
 const header=["score_id","family","cue_id","syllable_index","syllable","note_group",
  "sign_id","gabc_symbol","sign_type","sign_domain","book","printed_page",
  "plate_url","print_glyph_observed","parity","crop_evidence","reviewer","publication"];
 const out=[header.map(csv).join(",")];
 for(const r of d.rows){
  for(const s of r.syllables)for(const mark of s.signs)for(const w of mark.printChecks)
   out.push([r.scoreId,r.family,r.cueId,s.syllableIndex,s.syllable,
    s.sourceGabcNoteGroup,mark.signId,mark.symbol,mark.kind,mark.domain,
    w.book,w.page,w.imageUrl,"",w.comparisonStatus,"","","DO_NOT_PUBLISH"]
    .map(csv).join(","));
  if(r.alternateSignConflict)for(const w of r.alternateSignConflict.printChecks){
   const a=r.alternateSignConflict;
   out.push([r.scoreId,r.family,r.cueId,"",a.phraseSyllable,a.sourceNoteGroup,
    r.scoreId+".MISSING_ALT_ICTUS","SOURCE_ABSENT_ALT_PRESENT",a.sign,"RHYTHMIC_SIGN",
    w.book,w.page,w.imageUrl,"",w.comparisonStatus,"","","DO_NOT_PUBLISH"]
    .map(csv).join(","));
  }
 }
 if(out.length!==1+d.counts.sourceSignPrintChecks+d.counts.alternativeConflictPrintChecks)
  throw Error("FINE_SIGN_CSV_ROWS_INCOMPLETE");
 return out.join("\n")+"\n";
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const dir=new URL("../../.tmp/mass-participation-28-review/",import.meta.url);
 mkdirSync(fileURLToPath(dir),{recursive:true});
 const d=buildPreface12FineSignAudit();
 writeFileSync(new URL("preface-12-1961-fine-sign-print-audit.json",dir),JSON.stringify(d,null,2)+"\n");
 writeFileSync(new URL("preface-12-1961-fine-sign-print-audit.csv",dir),preface12FineSignCsv());
 console.log("PASS "+d.counts.responseSettings+" research-only Preface response settings; "+
  d.counts.sourceSignOccurrences+" exact GABC sign occurrences × 2 1961 book witnesses; "+
  d.counts.alternativeSignConflicts+" unresolved ictus mismatch; 0 print sign certifications");
}
