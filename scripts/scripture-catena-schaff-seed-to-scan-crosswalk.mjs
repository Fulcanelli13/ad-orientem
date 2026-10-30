#!/usr/bin/env node
/**
 * Crosswalk previously identified full-work loci into SHA-verified 1888 OCR.
 * An English phrase matching a print OCR work unit DOES NOT prove speaker,
 * chapter boundaries, critical correctness, or novel material.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
const option=(n,f)=>{const i=process.argv.indexOf(n);return i<0?f:process.argv[i+1]};
const ocrRoot=resolve(option("--ocr-dir","dist/schaff-original-ocr"));
const segmentRoot=resolve(option("--section-dir","dist/schaff-sectioned-research"));
const outDir=resolve(option("--output-dir","dist/schaff-context-pilot"));
const root="data/scripture/catena/research/full-corpus-pass-20261021/";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const registry=read(root+"schaff-first-full-work-question-seeds.v1.json");
if(registry.schema!=="ao.catena.schaff-full-work-question-seeds.v1"||
 registry.rows.length!==14)throw Error("UNEXPECTED_ORIGINAL_WORK_RESEARCH_SEEDS");
const norm=s=>s.toLowerCase().normalize("NFKD")
 .replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const sha=s=>createHash("sha256").update(s).digest("hex");
const roman=s=>{
 const w={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
 let a=0;for(let i=0;i<s.length;i++){
  const n=w[s[i]],next=w[s[i+1]]||0;
  if(!n)throw Error("INVALID_ROMAN_WORK_LOCUS");
  a+=n<next?-n:n;
 }return a;
};
const volumes={};
for(const id of ["NPNF1-06","NPNF1-10"]){
 const scan=readFileSync(join(ocrRoot,id+".raw-ocr.txt"),"utf8");
 const inv=read(join(segmentRoot,id+".source-units-and-questions.v1.json"));
 if(sha(scan)!==inv.sourceVolumeSHA256)throw Error("ORIGINAL_PRINT_SCAN_CHANGED");
 volumes[id]={lines:scan.replace(/\r/g,"").split("\n"),inv};
}
const rows=registry.rows.map(seed=>{
 const data=volumes[seed.editionId];
 if(!data)throw Error("UNKNOWN_NPNF_SERIES_VOLUME");
 const m=seed.editionId==="NPNF1-06"?
  /^Book\s+([IVXLCDM]+),/.exec(seed.workLocus):
  /^Homily\s+([IVXLCDM]+),/.exec(seed.workLocus);
 if(!m)throw Error("ORIGINAL_WORK_LOCUS_UNKNOWN:"+seed.id);
 const ordinal=roman(m[1]);
 const unit=data.inv.units.find(u=>u.unitOrdinal===ordinal);
 if(!unit)throw Error("HISTORICAL_PRINTED_SOURCE_UNIT_MISSING:"+seed.id);
 const originalOCR=data.lines.slice(unit.startLine-1,unit.endLine).join("\n");
 if(sha(originalOCR)!==unit.originalUnitOCRSHA256)
  throw Error("HISTORICAL_PRINTED_UNIT_SHA_CHANGED");
 const exactPhraseObserved=norm(originalOCR).includes(norm(seed.exactEnglishAnchor));
 return {
  seedId:seed.id,sourceEditionId:seed.editionId,
  sourceHistoricalWork:seed.originalWork,
  sourceWorkLocusLabel:seed.workLocus,
  sourceUnitId:unit.id,sourceUnitOrdinal:ordinal,
  sourceUnitOriginalOCRSHA256:unit.originalUnitOCRSHA256,
  printedSourceUnitLineStart:unit.startLine,
  printedSourceUnitLineEnd:unit.endLine,
  externalEnglishAnchor:seed.exactEnglishAnchor,
  englishAnchorNormalizedMatchIn1888OCR:exactPhraseObserved,
  missingMatchMeansOCROrEditionDifferenceNotSourceAbsence:!exactPhraseObserved,
  inheritedCatenaPointerAlreadyLinked:seed.catenaSourcePointer,
  attributionCertified:false,sourceQuestionCertified:false,
  sourceAnswerCertified:false,catenaNoveltyCertified:false,
  originalPrintedPageVisuallyInspected:false,publicationEligible:false
 };
});
const result={schema:"ao.catena.schaff-seed-to-historical-scan-crosswalk.v1",
 sources:"1888 NPNF I vols VI and X, unchanged historical scan OCR",
 originalResearchSeeds:rows.length,
 historicalWorkUnitsLocated:rows.length,
 normalizedOriginalOCRAnchorFound:rows.filter(r=>r.englishAnchorNormalizedMatchIn1888OCR).length,
 historicalOCRAnchorNotExactlyFound:rows.filter(r=>!r.englishAnchorNormalizedMatchIn1888OCR).length,
 existingCatenaPointersPreserved:rows.filter(r=>r.inheritedCatenaPointerAlreadyLinked).length,
 authorshipConfirmed:0,criticalTextVerified:0,verifiedNewPatristicAnswers:0,
 publicationApprovals:0,rows};
mkdirSync(outDir,{recursive:true});
writeFileSync(join(outDir,"schaff-seed-to-scan-crosswalk.v1.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({originalResearchSeeds:result.originalResearchSeeds,
 originalPrintUnitsLocated:result.historicalWorkUnitsLocated,
 historicalOCRPhraseMatches:result.normalizedOriginalOCRAnchorFound,
 historicalOCRNonmatches:result.historicalOCRAnchorNotExactlyFound,
 noPublication:true}));
