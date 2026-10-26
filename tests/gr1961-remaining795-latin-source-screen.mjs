import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reconcileLast795} from "../tools/mass/reconcile-gr1961-remaining795-latin-sources.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const files=[3,4,5,6].map(i=>"data/mass/chant-corpus/gr1961-proper-00"+i+".json");
const input={index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
 batches:files.map(p=>JSON.parse(read(p))),batchTexts:files.map(read),
 firstWitness:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
 evidence:JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-latin-evidence.v1.json"))};
const saved=read("data/mass/chant-corpus/gr1961-remaining795-source-review.v1.json");
const output=reconcileLast795(input);
assert.equal(saved,JSON.stringify(output.report,null,2)+"\n","The 795-row output must be byte-for-byte reproducible");
assert.deepEqual(output.summary,{records:795,sourceFilesRead:106,sourceLineOccurrences:357,
 candidates:240,preGospel:138,simpleProper:102,noHit:470,unsearchable:85,
 multiSource:43,embedded:32,certified1962:0,facsimileReviewed:0,readerPromoted:0});
assert.deepEqual(output.batches.map(b=>[b.records,b.candidates,b.noHit,b.unsearchable]),
 [[200,53,128,19],[200,59,119,22],[200,74,108,18],[195,54,115,26]]);
assert.equal(output.report.records.length,795);
assert.equal(new Set(output.report.records.map(r=>r.id)).size,795);
assert.ok(output.report.records.every(r=>r.editorialApproval==="NOT_GRANTED"));
assert.equal(input.evidence.sevenHits.length,1);
assert.equal(input.evidence.sevenHits[0].id,63);
assert.equal(input.evidence.sevenHits[0].path,"Sancti/05-26");
assert.equal(input.evidence.sevenHits[0].section,"Communio");
assert.throws(()=>reconcileLast795({...input,batchTexts:[input.batchTexts[0]+" ",...input.batchTexts.slice(1)]}),/metadata mismatch/);
assert.throws(()=>reconcileLast795({...input,
 evidence:{...input.evidence,sourceFiles:[
 {...input.evidence.sourceFiles[0],blobSha:"untrusted"},...input.evidence.sourceFiles.slice(1)]}}),/Source identity drift/);
assert.throws(()=>reconcileLast795({...input,evidence:{...input.evidence,hits:[
 {...input.evidence.hits[0],text:"Fabricated unrelated"},
 ...input.evidence.hits.slice(1)]}}),/Unsupported/);
const summary=JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-summary.v1.json"));
assert.deepEqual(summary.summary,output.summary);
assert.deepEqual(summary.batches,output.batches);
for(const path of ["src/mass/reader-dom.js","src/mass/reader-chant-score-pilot.js",
 "src/mass/reader-proper-chant-crosswalk.js"]){
 assert.doesNotMatch(read(path),/gr1961-remaining795-latin-evidence|gr1961-remaining795-source-review/,
 "Research metadata must never become a Mass reader import");
}
console.log("PASS 795 archived records screened against pinned 106 source files; 0 promotions");
