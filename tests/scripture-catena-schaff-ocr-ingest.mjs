import assert from "node:assert/strict";
import {readFileSync,writeFileSync,rmSync,mkdtempSync} from "node:fs";
import {createHash} from "node:crypto";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const root="data/scripture/catena/";
const source=read(root+"research/full-corpus-pass-20261021/schaff-ocr-source-manifest.v1.json");
assert.equal(source.schema,"ao.catena.schaff-ocr-source-manifest.v1");
assert.equal(source.editions.length,2);
const scope=read(root+"research/full-corpus-pass-20261021/schaff-ocr-work-scope.v1.json");
assert.equal(scope.schema,"ao.catena.schaff-historical-scan-work-scope.v1");
assert.equal(scope.volumes.length,2);
for(const volume of scope.volumes){
 assert.ok(source.editions.some(x=>x.editionId===volume.editionId));
 assert.match(volume.ocrSHA256,/^[a-f0-9]{64}$/);
 assert.equal(volume.scopes[0].start,1);
 assert.equal(volume.scopes.at(-1).end,volume.maxLines);
 for(let i=1;i<volume.scopes.length;i++)
  assert.equal(volume.scopes[i-1].end+1,volume.scopes[i].start);
 assert.ok(volume.scopes.every(x=>x.authorSpeechUnverified===true));
}
assert.equal(scope.publicationApprovals,0);
for(const e of source.editions){
 assert.match(e.archiveDetailUrl,new RegExp("^https://archive\\.org/details/"+e.archiveId+"$"));
 assert.match(e.downloadUrl,new RegExp("^https://archive\\.org/download/"+e.archiveId+"/"));
 assert.ok(e.streamUrl.includes(e.archiveId+"/"));
 assert.equal(e.scanYear,1888);
 assert.equal(e.ocrQuality,"unverified");
 assert.equal(e.attribution,"volume_level_only");
}
const mark=read(root+"mark.json");
const snippet=mark.pericopes.flatMap(x=>x.segments.map(y=>y.text))
 .find(x=>x.length>=400&&x.length<=3000);
assert.ok(snippet);
const scratch=mkdtempSync(join(tmpdir(),"catena-schaff-ocr-"));
try{
 const input=join(scratch,"source.txt"),out=join(scratch,"dist");
 const sample=["SCHOLASTIC EDITORIAL SAMPLE NOT ACTUAL PATRISTIC SOURCE",
  "HARMONY OF THE GOSPELS",
  "Why would the underlying biblical accounts be compared?",
  "This line intentionally contains a question mark?",
  snippet+"?",
  "What evidence identifies the precise author of the question?",
  "Additional body text without anything question-shaped."].join("\n\n");
 writeFileSync(input,sample);
 const proc=execFileSync(process.execPath,[
   "scripts/scripture-catena-schaff-ocr-ingest.mjs",
   "--volume","NPNF1-06","--input",input,"--output-dir",out],{encoding:"utf8"});
 const line=JSON.parse(proc.trim().split("\n").at(-1));
 assert.equal(line.editionId,"NPNF1-06");
 assert.equal(line.publicationApprovals,0);
 assert.ok(line.questionMarkCandidates>=4);
 assert.ok(line.possibleLexicalCatenaOverlap>=1,
  "Literal Catena passage ought to have a lexical overlap hint");
 const candidate=read(join(out,"NPNF1-06.question-candidates.json"));
 assert.equal(candidate.sourceSHA256,createHash("sha256").update(sample).digest("hex"));
 assert.equal(candidate.canonicalCorpusSourcePointers,12692);
 assert.equal(candidate.questionMarkCandidates,line.questionMarkCandidates);
 assert.equal(candidate.publicationEligible,false);
 assert.equal(candidate.unsegmentedOCR,true);
 assert.equal(candidate.novelQuestionRecordsConfirmed,0);
 assert.equal(candidate.printedWorkBoundariesMatchedVerifiedScanDigest,false,
   "Local synthetic OCR must not assume a printed historical author");
 assert.deepEqual(candidate.printedWorkScopeCounts,{
  unclassified_source_digest_changed_or_local_test:candidate.questionMarkCandidates
 });
 assert.ok(candidate.windows.every(x=>
   x.printedWorkScope==="unclassified_source_digest_changed_or_local_test"&&
   x.printedWorkScopeStatus==="sha_pinned_ocr_range_heuristic_not_authorship"));
 assert.ok(candidate.windows.every(c=>!c.publicationEligible&&!c.novelContentConfirmed&&
   c.ownership.startsWith("unresolved_")&&
   c.originalOCRWindowSHA256===createHash("sha256").update(c.originalOCRWindow).digest("hex")));
 assert.ok(candidate.windows.some(x=>x.catenaOverlapHints.length));
 assert.equal(read(join(out,"summary.v1.json")).historicalScanVolumes,1);
 assert.throws(()=>execFileSync(process.execPath,
   ["scripts/scripture-catena-schaff-ocr-ingest.mjs","--volume","MISSING","--input",input,
    "--output-dir",out],{encoding:"utf8",stdio:["ignore","pipe","pipe"]}),/Command failed/);
 console.log("PASS Schaff 1888 OCR research: source pinning, all-four-Gospel lexical overlap hints, source hashes, no author/novelty/publication assertions");
}finally{rmSync(scratch,{recursive:true,force:true})}
