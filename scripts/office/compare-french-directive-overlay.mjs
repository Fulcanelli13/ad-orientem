#!/usr/bin/env node
/**
 * Compare original pinned All Souls office generation with exactly one
 * researcher-modified French directive syntax candidate.
 * 
 * This script does not certify translation text, divine-office rubrics or
 * availability in production. It fails if Latin or English content changes:
 * the only permitted controlled intervention is a French source-file syntax
 * delimiter experiment.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {createHash} from "node:crypto";
import {missingOfficeSourceCells} from "../../src/office/research-reader.js";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";

const HOURS=["MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"];
const digest=value=>createHash("sha256").update(value,"utf8").digest("hex");
const read=(root,hour,lang)=>{
  const path=join(root,"2026-11-02",hour.toLowerCase(),lang+".research.json");
  return JSON.parse(readFileSync(path,"utf8"));
};
export function compareOfficeSourceCandidate({original,candidate}={}){
  if(!original||!candidate||
    original.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    candidate.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    original.date!=="2026-11-02"||candidate.date!==original.date||
    original.hour!==candidate.hour||original.language!==candidate.language||
    original.publishable!==false||candidate.publishable!==false)
    throw Error("OFFICE_FRENCH_CANDIDATE_SOURCE_INVALID");
  const texts=d=>d.sections.map(s=>s.text);
  const originalText=texts(original),candidateText=texts(candidate);
  const missingBefore=missingOfficeSourceCells(original).map(s=>s.sourceCellId);
  const missingAfter=missingOfficeSourceCells(candidate).map(s=>s.sourceCellId);
  if(original.language!=="fr" &&
    (originalText.length!==candidateText.length||
     originalText.some((text,i)=>candidateText[i]!==text)))
    throw Error("OFFICE_FRENCH_CANDIDATE_OTHER_LANGUAGE_MUTATED");
  // A false impression of success must never be created by removing sections.
  const fewerSourceCells=candidate.sections.length<original.sections.length;
  return {
    hour:original.hour,language:original.language,
    sourceCellCountBefore:original.sections.length,
    sourceCellCountAfter:candidate.sections.length,
    sourceCellCountReduced:fewerSourceCells,
    originalContentSha256:digest(JSON.stringify(originalText)),
    candidateContentSha256:digest(JSON.stringify(candidateText)),
    beforeMissingSourceCellIds:missingBefore,
    afterMissingSourceCellIds:missingAfter,
    recoveredSourceCellIds:missingBefore.filter(id=>!missingAfter.includes(id)),
    newlyMissingSourceCellIds:missingAfter.filter(id=>!missingBefore.includes(id)),
    needsManualReview:true,translationVerified:false,
  };
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==6||args[0]!=="--baseline"||
    args[2]!=="--candidate"||args[4]!=="--report")
    throw Error("USAGE: --baseline root --candidate root --report path");
  const baseline=resolve(args[1]),candidate=resolve(args[3]),dest=resolve(args[5]);
  const pairs=HOURS.flatMap(hour=>["la","en","fr"].map(language=>
    compareOfficeSourceCandidate({
      original:read(baseline,hour,language),
      candidate:read(candidate,hour,language),
    })));
  const french=pairs.filter(r=>r.language==="fr");
  const originalMissing=french.flatMap(r=>r.beforeMissingSourceCellIds);
  const candidateMissing=french.flatMap(r=>r.afterMissingSourceCellIds);
  const recovered=french.flatMap(r=>r.recoveredSourceCellIds);
  const report={
    schema:"ao.office.french-syntax-candidate-comparison.v1",
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    experiment:"ASCII_QUOTE_DELIMITERS_ONLY_15_SPECIAL_DIRECTIVES",
    hoursCompared:8,documentsCompared:pairs.length,
    originalMissingCount:originalMissing.length,
    candidateMissingCount:candidateMissing.length,
    recoveredCount:recovered.length,
    newlyMissingCount:french.reduce((n,x)=>n+x.newlyMissingSourceCellIds.length,0),
    candidateSourceCellsReduced:french.filter(x=>x.sourceCellCountReduced).map(x=>x.hour),
    byHour:french,
    fullyRecovered:french.every(x=>x.afterMissingSourceCellIds.length===0),
    // Even if syntax resolved all missing markers, no independent proper-text
    // collation has been conducted. Do not promote this experiment.
    sourceSyntaxCauseSupported:recovered.length>0,
    sourceSyntaxCorrectionProvenLiturgicallyCorrect:false,
    certifiedFrenchHours:0,published:0,canPublish:false,
  };
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("OFFICE_FRENCH_SYNTAX_COMPARISON",JSON.stringify({
    hours:report.hoursCompared,originalMissingCount:report.originalMissingCount,
    candidateMissingCount:report.candidateMissingCount,
    recoveredCount:report.recoveredCount,
    newlyMissingCount:report.newlyMissingCount,
    candidateSourceCellsReduced:report.candidateSourceCellsReduced,
    sourceSyntaxCauseSupported:report.sourceSyntaxCauseSupported,
    certifiedFrenchHours:0,published:0,
  }));
  for(const x of french)
    console.log("OFFICE_FRENCH_SYNTAX_BY_HOUR",JSON.stringify({
      hour:x.hour,before:x.beforeMissingSourceCellIds,
      after:x.afterMissingSourceCellIds,recovered:x.recoveredSourceCellIds,
      reducedSourceCells:x.sourceCellCountReduced}));
  if(report.originalMissingCount!==11)
    throw Error("OFFICE_FRENCH_CANDIDATE_BASELINE_DRIFT");
  if(report.newlyMissingCount>0 || report.candidateSourceCellsReduced.length>0)
    throw Error("OFFICE_FRENCH_CANDIDATE_REGRESSION");
}
if(process.argv[1]&&new URL("file://"+resolve(process.argv[1])).href===import.meta.url){
  try{main()}catch(error){console.error(error?.stack??String(error));process.exitCode=1}
}
