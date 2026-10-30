import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync("docs/research/directory/p79-canonical-place-photo-review.html","utf8");
const block=html.match(/const SOURCE=(\{.*\});\nconst STORAGE=/);
assert.ok(block,"Inline P79 source snapshot missing");
const snapshot=JSON.parse(block[1]);
assert.equal(snapshot.schema,"AO_P79_PLACE_PHOTO_RAPID_REVIEW_V1");
assert.equal(snapshot.candidate_count,snapshot.sites.reduce((sum,s)=>sum+s.candidates.length,0));
assert.equal(snapshot.site_count,snapshot.sites.length);
assert.equal(snapshot.unapproved_site_count,snapshot.sites.filter(s=>!s.approved).length);
assert.equal(snapshot.candidate_count,430);
assert.equal(snapshot.site_count,109);
assert.equal(snapshot.unapproved_site_count,79);
const seen=new Set();
for(const s of snapshot.sites){
 assert.match(s.id,/^place:[A-Z]{2}:/);
 for(const c of s.candidates){
  assert.ok(!seen.has(c.id),"Duplicate P79 candidate");
  seen.add(c.id);
  assert.match(c.file,/^File:/);
  assert.match(c.page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(c.sha1,/^[a-f0-9]{40}$/);
  assert.ok(c.rightsLane==="CANDIDATE_LICENSE_RECHECK"||c.rightsLane==="RIGHTS_MANUAL_HOLD");
  if(c.priorEditorial==="REJECT"||c.priorTriage?.startsWith("EXCLUDE_"))assert.equal(c.blocked,true);
 }
}
assert.match(html,/source_rights_verified:false/);
assert.match(html,/original_bytes_verified:false/);
assert.match(html,/app_media_approved:false/);
assert.match(html,/published:false/);
assert.match(html,/editorial_approvals/);
assert.match(html,/exact_building_editorially_confirmed/);
assert.match(html,/AO_P79_PLACE_PHOTO_SELECTIONS_V2/);
assert.match(html,/ao-p79-photo-review-v2-/);
assert.match(html,/No approved-media entry/);
console.log("P79 grouped photo-review contracts: pass; 430 candidates / 109 Places / 79 without approved media.");
