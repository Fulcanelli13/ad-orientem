import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const research=read("data/geography/research/place-media-candidates-r58.v1.json");
const curated=read("data/geography/major-places-editorial.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const approved=read("data/geography/approved-place-media.v1.json");
assert.equal(research.schema,"AO_EXPLORE_PLACE_MEDIA_RESEARCH_V1");
assert.equal(curated.schema,"AO_EXPLORE_MAJOR_PLACES_EDITORIAL_V1");
assert.equal(approved.schema,"AO_APPROVED_PLACE_MEDIA_V1");
assert.equal(approved.items.length,10,"Exactly ten screened site photographs are in the first publishable batch");
const approvedIds=new Set();
for(const item of approved.items){
  assert.ok(!approvedIds.has(item.place_id));approvedIds.add(item.place_id);
  assert.equal(item.status,"APPROVED");
  assert.ok(item.rights_verified&&item.subject_verified&&item.crop_reviewed);
  assert.match(item.asset_path,/^assets\/approved\/place-media\/[a-zA-Z0-9_.-]+\.webp$/);
  assert.equal(item.license,"CC-BY-SA-4.0");
  assert.equal(item.license_url,"https://creativecommons.org/licenses/by-sa/4.0/");
  assert.ok(item.source_sha1&&item.derivative_sha256);
  assert.ok(item.changes_en&&item.changes_fr&&item.alt_en&&item.alt_fr);
  assert.ok(Number(item.width)>=640&&Number(item.height)>=480);
  assert.equal(item.orientation,item.height>item.width?"portrait":"landscape");
  const related=research.candidates.find(row=>row.place_id===item.place_id);
  assert.equal(item.source_url,related?.source_page_url,"Approved image must match original Commons source identity");
  const asset=readFileSync(item.asset_path);
  assert.ok(asset.length>50000,"Approved file must contain image bytes");
  assert.equal(asset.toString("ascii",0,4),"RIFF","Optimized asset must be WebP");
  assert.equal(asset.toString("ascii",8,12),"WEBP","Optimized asset must be WebP");
  assert.equal(createHash("sha256").update(asset).digest("hex"),item.derivative_sha256,
    "Approved photo bytes must match source stage report for "+item.place_id);
}
for(const held of research.held){
 assert.equal(approvedIds.has(held.place_id),false,"Older-licensed or identity-held photo cannot publish");
}
assert.equal(research.candidates.length,18);
assert.equal(research.held.length,2);

const ids=new Set(curated.items.map(x=>x.place_id));
const known=new Set(geography.places.map(x=>x.place_id));
const seen=new Set();
for(const entry of [...research.candidates,...research.held]){
  assert.ok(ids.has(entry.place_id)&&known.has(entry.place_id),"Unknown canonical site "+entry.place_id);
  assert.ok(!seen.has(entry.place_id),"Duplicate image subject "+entry.place_id);
  seen.add(entry.place_id);
  assert.match(entry.source_page_url,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
}
assert.deepEqual([...ids].sort(),[...seen].sort(),"Every in-focus site needs an explicit reviewed target or hold");
for(const entry of research.candidates){
  assert.equal(entry.status,"STAGE_ONLY_LICENSE_API_RECHECK_REQUIRED");
  assert.equal(entry.expected_license,"CC BY-SA 4.0");
  assert.equal(entry.publication_approved,false);
  assert.equal(entry.subject_crop_reviewed,false);
  assert.match(entry.license_url,/^https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\//);
  assert.ok(entry.alt_en&&entry.alt_fr&&entry.commons_title.startsWith("File:"));
}
assert.deepEqual(new Set(research.held.map(x=>x.place_id)),new Set([
  "place:MU:pere-laval-sainte-croix","place:GB:walsingham-catholic-shrine"
]));
const stagingScript=readFileSync("tools/stage-place-media.py","utf8");
assert.match(stagingScript,/STAGED_NOT_APPROVED/);
assert.match(stagingScript,/rights|license|LicenseUrl|LicenseShortName/i);
assert.doesNotMatch(stagingScript,/APPROVED\.write_text|APPROVED\.open\(/,
  "Importer must not write directly into the publication registry");
console.log("PASS Explore R58: 20/20 site-specific photo targets; 18 CC BY-SA 4 candidates, 2 held, 0 approved");
