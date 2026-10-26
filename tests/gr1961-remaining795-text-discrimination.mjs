import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {compareLast795Continuations} from "../tools/mass/discriminate-gr1961-remaining795-text.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const paths=[3,4,5,6].map(i=>"data/mass/chant-corpus/gr1961-proper-00"+i+".json");
const input={
 batches:paths.map(p=>JSON.parse(read(p))),batchTexts:paths.map(read),
 index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
 original:JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-source-review.v1.json")),
 evidence:JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-latin-evidence.v1.json"))
};
const file="data/mass/chant-corpus/gr1961-remaining795-text-discrimination.v1.json";
const out=compareLast795Continuations(input);
assert.equal(read(file),JSON.stringify(out,null,2)+"\n");
assert.deepEqual(out.summary,{
 candidates:240,sourceOccurrences:357,AT_LEAST_EIGHT_WORD_PREFIX:197,
 PRIORITY_EARLY_DIVERGENCE:15,PARTIAL_PREFIX:28,
 selectedProperVerified:0,facsimileApproved:0,promotions:0,
});
assert.deepEqual(out.records.filter(r=>r.status==="PRIORITY_EARLY_DIVERGENCE").map(r=>r.gregobaseId),
 [539,551,686,697,703,748,792,798,837,903,1167,1185,1256,1376,1380]);
assert.equal(out.records.find(x=>x.gregobaseId===792).bestCommonInitialWords,2);
assert.ok(out.records.every(x=>x.release==="NONE"&&x.selection1962==="NOT_VERIFIED"));
assert.throws(()=>compareLast795Continuations({...input,
 evidence:{...input.evidence,hits:[{...input.evidence.hits[0],text:"Invented false source line"},...input.evidence.hits.slice(1)]}}),/Unsourced/);
for(const p of ["src/mass/reader-dom.js","src/mass/reader-chant-score-pilot.js",
 "src/mass/reader-proper-chant-crosswalk.js"])
 assert.doesNotMatch(read(p),/gr1961-remaining795-text-discrimination/);
console.log("PASS last-795 GABC initial-text review: 197 long, 28 partial, 15 short only, zero promotions");
