import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const batch=read("data/geography/research/place-media-candidates-r59.v1.json");
const old=read("data/geography/research/place-media-publication-review-r58.v1.json");
const published=read("data/geography/approved-place-media.v1.json");
const places=read("data/geography/seed-registry.v1.json");
assert.equal(batch.schema,"AO_EXPLORE_PLACE_MEDIA_R59_CANDIDATES_V1");
assert.equal(batch.candidates.length,10);
const oldHolds=[...old.needs_replacement,...old.held].map(p=>p.place_id);
const ids=batch.candidates.map(p=>p.place_id);
assert.deepEqual(new Set(ids),new Set(oldHolds));
assert.equal(new Set(ids).size,10);
const known=new Set(places.places.map(p=>p.place_id));
const live=new Set(published.items.map(p=>p.place_id));
const r59Review=read("data/geography/research/place-media-publication-review-r59.v1.json");
assert.equal(r59Review.schema,"AO_EXPLORE_PLACE_MEDIA_PUBLICATION_REVIEW_R59_V1");
assert.deepEqual(r59Review.counts,{existing_approved:10,newly_approved:8,total_approved:18,secondary_or_held:2,curated_sites:20});
assert.equal(r59Review.approved.length,8);
assert.equal(r59Review.held.length,2);
const reviewed=new Set(r59Review.approved.map(x=>x.place_id));
for(const row of r59Review.approved){
 const record=published.items.find(x=>x.place_id===row.place_id);
 assert.ok(record,"Approved image identity must resolve: "+row.place_id);
 assert.equal(record.status,"APPROVED");
 assert.equal(record.asset_path,row.asset_path);
 assert.ok(record.rights_verified&&record.subject_verified&&record.crop_reviewed);
 const file=readFileSync(record.asset_path);
 assert.ok(file.length>50000);
 assert.equal(file.toString("ascii",0,4),"RIFF");
 assert.equal(file.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(file).digest("hex"),record.derivative_sha256);
 const candidate=batch.candidates.find(x=>x.place_id===row.place_id);
 assert.equal(record.source_url,candidate?.source_page_url);
 assert.equal(record.license,candidate.expected_license);
 assert.equal(record.license_url,candidate.license_url);
 assert.equal(record.orientation,record.height>record.width?"portrait":"landscape");
 assert.ok(record.credit&&record.changes_en&&record.changes_fr&&record.alt_en&&record.alt_fr);
}
for(const row of r59Review.held){
 const historic=batch.candidates.find(x=>x.place_id===row.place_id);
 assert.ok(!reviewed.has(row.place_id)&&historic);
 assert.equal(published.items.some(x=>x.place_id===row.place_id&&x.source_url===historic.source_page_url),false,
   "The precise photograph held by R59 must stay unpublished, even if later independently sourced imagery is accepted");
}
let four=0,two=0,three=0;
for(const c of batch.candidates){
  assert.ok(known.has(c.place_id),"Must only describe a canonical physical Place");
  if(c.expected_license==="CC-BY-SA-4.0")assert.ok(live.has(c.place_id),"R59 photo release must include all eight reviewed updates");
  else assert.ok(!published.items.some(x=>x.place_id===c.place_id&&x.source_url===c.source_page_url),
   "Older-licence original R59 photograph itself must remain unpublished");
  assert.equal(c.publication_approved,false);
  assert.equal(c.subject_crop_reviewed,false);
  assert.equal(c.status,"RESEARCH_UNREVIEWED");
  assert.match(c.source_page_url,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.ok(c.alt_en&&c.alt_fr);
  assert.equal(c.license_url,"https://creativecommons.org/licenses/by-sa/"+c.expected_license.slice(-3)+"/");
  if(c.expected_license==="CC-BY-SA-4.0")four++;
  else if(c.expected_license==="CC-BY-SA-3.0")three++;
  else if(c.expected_license==="CC-BY-SA-2.0")two++;
  else assert.fail("Unreviewed licence "+c.expected_license);
}
assert.deepEqual([four,three,two],[8,1,1]);
assert.equal(published.items.length,31+read("data/geography/research/directory-p95-first-two-photo-covers.v1.json").photos.length+read("data/geography/research/directory-p102-three-approved-covers.v1.json").photos.length,
 "Eight original R59 approved replacements plus six separate, independently certified shrine photographs");
const historical=new Set([
 ...old.approved.map(x=>x.place_id),...r59Review.approved.map(x=>x.place_id)
]);
assert.equal(historical.size,18,"The R58/R59 release must retain its original eighteen unique site photos");
assert.equal(published.items.filter(x=>historical.has(x.place_id)).length,18,
 "Later shrine photography must not replace or erase original R58/R59 approvals");
assert.deepEqual(batch.candidates.filter(p=>p.expected_license!=="CC-BY-SA-4.0").map(p=>p.place_id).sort(),[
"place:GB:walsingham-catholic-shrine","place:MU:pere-laval-sainte-croix"
]);
const script=readFileSync("tools/stage-place-media-r59.py","utf8");
assert.match(script,/STAGED_NOT_APPROVED/);
assert.doesNotMatch(script,/APPROVED\.write_text|PUBLISHED\.write_text/);
console.log("PASS R59 research manifest: 8 CC BY-SA 4 + 2 older-licence candidates, no auto-publication");
