import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const source=read("data/geography/research/sacred-atlas-original-integrity-100-20261031.v1.json");
const receipt=read("data/geography/research/sacred-atlas-original-integrity-100-20261031.results.json");
const backlog=read("data/geography/research/sacred-atlas-after-2119-cover-backlog-388.v1.json");
const script=readFileSync("tools/sacred-atlas-verify-originals-100.mjs","utf8");
assert.equal(source.items.length,100);
assert.equal(receipt.results.length,100);
assert.equal(backlog.items.length,388);
assert.equal(new Set(source.items.map(x=>x.place_id)).size,100);
assert.equal(new Set(source.items.map(x=>x.expected_original_sha1)).size,100);
assert.deepEqual(new Set(source.items.map(x=>x.place_id)),
 new Set(backlog.items.filter(x=>x.status==="BATCH_100_ORIGINAL_SOURCE_VERIFICATION").map(x=>x.place_id)));
const original=new Map(source.items.map(x=>[x.place_id,x]));
const histogram={};
let verified=0;
for(const row of receipt.results){
 const item=original.get(row.place_id);
 assert(item,"Result cannot identify unknown Place "+row.place_id);
 assert.equal(row.commons_title,item.commons_title);
 assert.equal(row.source_sha1,item.expected_original_sha1);
 assert.equal(row.published,false);
 assert.equal(row.publishable,false);
 assert.equal(row.derivative_archived,false);
 assert.equal(row.underlying_artwork_rights_cleared,false);
 if(row.source_bytes_verified){
  assert.equal(row.status,"SOURCE_BYTES_SHA1_VERIFIED");
  assert.equal(row.actual_sha1,item.expected_original_sha1);
  assert.ok(row.bytes>0);
  verified++;
 }else{
  assert.notEqual(row.status,"SOURCE_BYTES_SHA1_VERIFIED");
 }
 histogram[row.error??row.status]=(histogram[row.error??row.status]||0)+1;
}
assert.equal(verified,6,"Historical successful source hashes must be preserved");
assert.equal(histogram.HTTP_429,94,"Historical Wikimedia throttle must not be recast as rejected images");
assert.equal(receipt.summary.published,0);
assert.equal(receipt.summary.newly_archived_image_files,0);
assert.match(script,/if\(!params\.has\("--run"\)\)/);
assert.match(script,/if\(res\.status===429\)/);
assert.match(script,/stop_all_requests:true/);
assert.match(script,/rateLimitSeen=true/);
assert.match(script,/attempts>=maxNew/);
assert.match(script,/delayMs<15000/);
assert.match(script,/validPrevious\(item\)/);
assert.doesNotMatch(script,/git push|create\/update|ApprovedPlaceMedia/);
console.log("PASS: 100 pinned Place sources, six original SHA1 successes retained, 94 Wikimedia 429 holds distinguished, secure bounded retry, zero publication.");
