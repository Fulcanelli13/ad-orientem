import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {discriminatePinnedPreGospel} from "../tools/mass/discriminate-gr1961-first400-pre-gospel.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const batchPaths=["data/mass/chant-corpus/gr1961-proper-001.json","data/mass/chant-corpus/gr1961-proper-002.json"];
const inputs={
 index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
 batches:batchPaths.map(p=>JSON.parse(read(p))),batchTexts:batchPaths.map(read),
 first:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-source-review.v1.json")),
 second:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-source-review.v1.json")),
 latinWitness:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
 evidence:JSON.parse(read("data/mass/chant-corpus/gr1961-first400-pre-gospel-source-sections.v1.json")),
};
const filename="data/mass/chant-corpus/gr1961-first400-pre-gospel-text-discrimination.v1.json";
const outcome=discriminatePinnedPreGospel(inputs);
assert.equal(read(filename),JSON.stringify(outcome,null,2)+"\n");
assert.deepEqual(outcome.summary,{records:47,sourceFiles:49,sourceOccurrences:69,
 atLeastEightWordPrefix:33,partialPrefix:7,priorityEarlyDivergence:7,
 explicitTractusTextRecords:3,recordsMultipleSources:11,
 selected1962ProperVerified:0,facsimileApproved:0,newReaderPromotions:0});
assert.deepEqual(outcome.records.filter(r=>r.limitedTextDisposition==="PRIORITY_EARLY_TEXT_DIVERGENCE").map(x=>x.gregobaseId),
 [38,56,63,134,249,329,348]);
assert.match(outcome.records.find(x=>x.gregobaseId===56).gabcInitialPhrase,/ego sum radix et genus david/);
assert.match(outcome.records.find(x=>x.gregobaseId===56).matches[0].sourceInitialPhrase,/ego sum pastor bonus/);
assert.equal(outcome.records.find(x=>x.gregobaseId===18).explicitTractusTextSeen,true);
assert.equal(outcome.records.find(x=>x.gregobaseId===372).explicitTractusTextSeen,false);
assert.throws(()=>discriminatePinnedPreGospel({...inputs,
 evidence:{...inputs.evidence,sourceFiles:[{...inputs.evidence.sourceFiles[0],blobSha:"untrusted"},...inputs.evidence.sourceFiles.slice(1)]}}),/Unpinned/);
assert.throws(()=>discriminatePinnedPreGospel({...inputs,batchTexts:[inputs.batchTexts[0]+" ",inputs.batchTexts[1]]}),/Frozen/);
for(const p of ["src/mass/reader-dom.js","src/mass/reader-chant-score-pilot.js","src/mass/reader-proper-chant-crosswalk.js"])
 assert.doesNotMatch(read(p),/gr1961-first400-pre-gospel-text-discrimination|gr1961-first400-pre-gospel-source-sections/);
console.log("PASS 47 research-only pre-Gospel GABC-to-Latin text discrimination; no promotions");
