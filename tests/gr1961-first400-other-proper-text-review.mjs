import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reviewFirst400OtherProper} from "../tools/mass/discriminate-gr1961-first400-other-propers.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const inputs={
 batches:[1,2].map(i=>JSON.parse(read("data/mass/chant-corpus/gr1961-proper-00"+i+".json"))),
 index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
 first:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-source-review.v1.json")),
 second:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-source-review.v1.json")),
 witness1:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
 witness2:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-latin-witness-screen.v1.json")),
};
const out=reviewFirst400OtherProper(inputs);
assert.equal(read("data/mass/chant-corpus/gr1961-first400-other-proper-text-review.v1.json"),JSON.stringify(out,null,2)+"\n");
assert.deepEqual(out.summary,{records:55,totalOccurrences:80,
 AT_LEAST_EIGHT_WORD_PREFIX:45,PARTIAL_PREFIX:4,PRIORITY_EARLY_DIVERGENCE:6,
 canonical1962Verified:0,facsimileReviewed:0,promoted:0});
assert.deepEqual(out.records.filter(r=>r.status==="PRIORITY_EARLY_DIVERGENCE").map(x=>x.gregobaseId),[124,143,223,316,323,328]);
assert.ok(out.records.every(x=>x.promoted===false&&x.selected1962Proper==="NOT_VERIFIED"));
assert.throws(()=>reviewFirst400OtherProper({...inputs,
 witness1:{...inputs.witness1,candidateOccurrences:[{...inputs.witness1.candidateOccurrences[0],properSourcePath:"untrusted"},...inputs.witness1.candidateOccurrences.slice(1)]}}),/Unexpected source path/);
for(const p of ["src/mass/reader-dom.js","src/mass/reader-chant-score-pilot.js",
 "src/mass/reader-proper-chant-crosswalk.js"])
 assert.doesNotMatch(read(p),/gr1961-first400-other-proper-text-review/);
console.log("PASS 55 other Proper GABCs screened, 6 early continuations divergent, zero approvals");
