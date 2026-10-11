import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const research=read("data/geography/research/place-media-candidates-r58.v1.json");
const curated=read("data/geography/major-places-editorial.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const approved=read("data/geography/approved-place-media.v1.json");
assert.equal(research.schema,"AO_EXPLORE_PLACE_MEDIA_RESEARCH_V1");
assert.equal(curated.schema,"AO_EXPLORE_MAJOR_PLACES_EDITORIAL_V1");
assert.equal(approved.schema,"AO_APPROVED_PLACE_MEDIA_V1");
assert.equal(approved.items.length,0,"Research may not publish unreviewed site images");
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
