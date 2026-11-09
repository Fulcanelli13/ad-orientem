import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 localPenitentialPsalmWitness, PENITENTIAL_LOCAL_VULGATE_TO_CRAMPON_V1,
 PENITENTIAL_LOCAL_SOURCE_METADATA_V1,PENITENTIAL_LOCAL_SOURCE_STATUS
} from "../src/pray/penitential-psalms-local-witnesses.v1.js";
import {PENITENTIAL_PSALMS_VULGATE} from "../src/pray/penitential-psalms-source.js";

const original=edition=>JSON.parse(readFileSync(new URL(
 "../data/scripture/witness/"+edition+"/Psalms.json",import.meta.url),"utf8"));
const samples=[
 ["dr-challoner","en"],["cpdv-2009","en"],["crampon-1923","fr"]
];
assert.equal(PENITENTIAL_LOCAL_SOURCE_STATUS,"UNCOLLATED_SOURCE_WITNESS");
assert.deepEqual(PENITENTIAL_PSALMS_VULGATE.map(p=>p.trad),[6,31,37,50,101,129,142]);
assert.deepEqual(PENITENTIAL_PSALMS_VULGATE.map(p=>p.modern),[6,32,38,51,102,130,143]);
assert.deepEqual(Object.values(PENITENTIAL_LOCAL_VULGATE_TO_CRAMPON_V1),[6,32,38,51,102,130,143]);
let checked=0,verses=0;
for(const [edition,language] of samples){
 const source=original(edition);
 const meta=PENITENTIAL_LOCAL_SOURCE_METADATA_V1[edition];
 assert.equal(meta.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
 assert.equal(meta.sourceRepository,source.sourceRepository);
 assert.equal(meta.sourcePath,source.sourcePath);
 assert.equal(meta.sourceCommit,source.sourceCommit||null);
 assert.equal(meta.sourceBlobSha,source.sourceBlobSha||null);
 assert.equal(source.book,"Psalms");
 for(const p of PENITENTIAL_PSALMS_VULGATE){
  const chapter=edition==="crampon-1923"?p.modern:p.trad;
  const expected=source.verses.filter(row=>row[0]===chapter).map(([c,verse,text])=>({verse,text}));
  const actual=localPenitentialPsalmWitness(p.trad,language,edition);
  assert.equal(actual.editionId,edition);
  assert.equal(actual.sourceChapter,chapter);
  assert.equal(actual.traditionalChapter,p.trad);
  assert.equal(actual.language,language);
  assert.equal(actual.status,source.sourceStatus);
  assert.deepEqual(actual.rows,expected,"No altered, invented, omitted or reordered Psalm verses: "+edition+" "+chapter);
  assert.ok(actual.rows.length>=8,"Unexpectedly short complete Psalm");
  assert.ok(actual.rows.every((row,index)=>row.verse===index+1 && row.text.trim()));
  checked++;verses+=actual.rows.length;
 }
}
assert.equal(checked,21);
assert.equal(verses,345); // Three full local witness sets; seven traditional Psalms in each.
assert.equal(localPenitentialPsalmWitness(7),null);
assert.equal(localPenitentialPsalmWitness(150),null);
const reader=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const mark of [
 "import {localPenitentialPsalmWitness}",
 "function penitentialLocalWitnessMarkup(traditionalChapter)",
 "penitentialLocalWitnessMarkup(p.trad)",
 'data-ao-scripture-content="local-witness"',
 'data-ao-penitential-source-status="UNCOLLATED_SOURCE_WITNESS"',
 "penitentialScriptureReferences(p)",
 'if(kind==="psalm"&&box.dataset.aoScriptureContent==="local-witness"',
 "data-p435930-pen-litany"
])assert.ok(reader.includes(mark),"Missing offline-first Psalm/legacy reader contract "+mark);
assert.ok(reader.includes('fr:"Psalms "+p.modern+":1"'),"Do not load the wrong Crampon chapter on online refresh");
assert.ok(!reader.includes("PENITENTIAL_LOCAL_1962_CERTIFIED"),"Uncollated material must never be claimed certified");
console.log("PASS "+checked+"/21 original-source Psalm chapters, "+verses+" unchanged verses, FR Hebrew/Vulgate chapter mapping, offline-first reader with honest source status.");
