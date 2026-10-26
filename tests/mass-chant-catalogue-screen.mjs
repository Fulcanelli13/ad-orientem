import assert from "node:assert/strict";
import {SCHEMA} from "../tools/mass/ingest-gregobase-1961.mjs";
import {screenCatalogue,batchForEditorialReview,SCREEN_SCHEMA} from "../tools/mass/screen-gregobase-1961.mjs";
const entry=(id,props={})=>({
  id:"GREGOBASE-"+id,gregobaseId:id,
  sourceUrl:"https://gregobase.selapa.net/chant.php?id="+id,
  trackHint:"INTROIT",incipit:"Puer natus est",hasGabcPayload:true,
  copyright:false,duplicateOf:null,pages:[{page:"33",sequence:1}],
  ...props,
});
const manifest={schema:SCHEMA,sha256:"testsha",summary:{total:5},shards:[{file:"one"},{file:"two"}]};
const shards=[
 {schema:SCHEMA,sourceSha256:"testsha",index:1,total:2,
   records:[entry(10),entry(12,{hasGabcPayload:false}),entry(30,{copyright:true})]},
 {schema:SCHEMA,sourceSha256:"testsha",index:2,total:2,
   records:[entry(40,{duplicateOf:10}),entry(50,{trackHint:null})]},
];
const result=screenCatalogue(manifest,shards);
assert.equal(result.schema,SCREEN_SCHEMA);
assert.equal(result.counts.rows,5);
assert.equal(result.counts.screenable,1);
assert.equal(result.counts.exceptions,4);
assert.equal(result.counts.approved,0);
assert.equal(result.counts.reasonCounts.COPYRIGHT_REVIEW,1);
assert.equal(result.counts.reasonCounts.MISSING_GABC,1);
assert.equal(result.counts.reasonCounts.DUPLICATE_CANDIDATE,1);
assert.equal(result.counts.reasonCounts.UNCLASSIFIED_OR_NON_MASS,1);
assert.ok(result.ready[0].releaseGates.includes("HUMAN_EDITORIAL_APPROVAL"));
assert.deepEqual(batchForEditorialReview(result.exceptions,2).map(x=>x.candidates.length),[2,2]);
assert.throws(()=>screenCatalogue({...manifest,sha256:"other"},shards),/checksum/);
assert.throws(()=>screenCatalogue(manifest,[shards[0]]),/Missing expected/);
assert.throws(()=>screenCatalogue(manifest,[shards[0],{
  ...shards[1],records:[entry(10),entry(50)]}]),/Duplicate source/);
assert.throws(()=>screenCatalogue(manifest,[shards[0],{
  ...shards[1],records:[entry(40,{sourceUrl:"https://fake.test/40"}),entry(50)]}]),/Invalid source identity/);
console.log("PASS 1961 bulk metadata screening: five gates, checksum, duplicate IDs, and review/exception queues");
