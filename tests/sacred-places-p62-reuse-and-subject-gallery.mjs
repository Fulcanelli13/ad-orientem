import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p => JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=read("data/geography/research/sacred-places-p62-reuse-adjudication.v1.json");
const gallery=read("data/geography/research/sacred-places-p62-subject-gallery-pilot.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const photoResearch=read("data/geography/research/sacred-places-p61-photo-candidates.v1.json");
assert.equal(audit.schema,"AO_SACRED_PLACES_P62_P60_ADDITIONAL_REUSE_ADJUDICATION_V1");
assert.equal(gallery.schema,"AO_SACRED_PLACES_P62_SUBJECT_PHOTOGRAPHY_PILOT_V1");
assert.deepEqual([geo.places.length,sources.sources.length,media.items.length],[516,818,31]);
assert.equal(audit.records.length,26);
assert.equal(audit.input.already_accounted_p59,8);
assert.equal(audit.input.p60_additional_reuse_proposals,34);
const actual={};
const canonical=new Set(geo.places.map(x=>x.place_id));
for(const r of audit.records){
  actual[r.decision]=(actual[r.decision]||0)+1;
  assert.ok(!r.publish_new_place && !r.replace_existing_geometry && !r.add_tlm_association && !r.link_subject_as_separate_map_pin);
  assert.ok(canonical.has(r.claimed_canonical_place_id));
  assert.equal(/^SG-INV-[0-9]{4}$/.test(r.candidate_id),true);
  assert.ok(r.notes.length>40);
}
assert.deepEqual(actual,audit.dispositions);
assert.deepEqual(actual,{
 REUSE_EXISTING_PLACE_SITE_SCOPE:19,
 REJECT_WRONG_BUILDING:1,
 HOLD_MULTI_BUILDING_SCOPE:1,
 NESTED_SUBJECT_NOT_SEPARATE_PLACE:3,
 ALIAS_ONLY_NO_NEW_EVIDENCE:2
});
const byid=new Map(audit.records.map(r=>[r.candidate_id,r]));
assert.equal(byid.size,26);
assert.equal(byid.get("SG-INV-0049").decision,"REJECT_WRONG_BUILDING");
assert.equal(byid.get("SG-INV-0049").claimed_canonical_place_id,"place:IT:scala-santa-rome");
assert.equal(byid.get("SG-INV-0091").decision,"HOLD_MULTI_BUILDING_SCOPE");
assert.equal(byid.get("SG-INV-0391").decision,"NESTED_SUBJECT_NOT_SEPARATE_PLACE");
assert.equal(byid.get("SG-INV-0594").decision,"NESTED_SUBJECT_NOT_SEPARATE_PLACE");
assert.equal(byid.get("SG-INV-0734").decision,"NESTED_SUBJECT_NOT_SEPARATE_PLACE");
assert.equal(byid.get("SG-INV-0530").decision,"REUSE_EXISTING_PLACE_SITE_SCOPE");
const photoCandidateIds=new Set(photoResearch.candidates.map(x=>x.candidate_id));
const subjectids=new Set(),photoIds=new Set();let count=0;
for(const p of gallery.places){
 assert.ok(canonical.has(p.place_id));
 for(const s of p.subjects){
  assert.ok(gallery.subject_types.includes(s.kind));
  assert.ok(!subjectids.has(s.subject_id));subjectids.add(s.subject_id);
  assert.ok(s.source_url.startsWith("https://"));
  if(s.reuse_existing_photo_candidate_id)assert.ok(photoCandidateIds.has(s.reuse_existing_photo_candidate_id));
  for(const f of s.photographs){
   count++;
   assert.ok(!f.approved && !f.publish_authorized);
   assert.equal(f.asset_path,null);
   assert.equal(f.original_sha1,null);
   assert.equal(f.derivative_sha256,null);
   assert.equal(f.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"),true);
   assert.ok(f.photographer.length>2 && f.license_url.startsWith("https://"));
   assert.ok(!photoIds.has(f.commons_file));photoIds.add(f.commons_file);
  }
 }
}
assert.equal(gallery.places.length,8);
assert.equal(subjectids.size,13);
assert.equal(count,2);
assert.ok(subjectids.has("ndp-holy-crown")&&subjectids.has("ndp-dubuisson-2024-reliquary"));
assert.ok(gallery.places.find(x=>x.place_id==="place:FR:notre-dame-paris").subjects.find(x=>x.subject_id==="ndp-true-cross"));
assert.ok(!media.items.some(x=>x.place_id==="place:FR:notre-dame-paris"));
console.log("PASS P62: 26 adjudications, rejected Lateran merge, protected two-basilica hold, 13 multi-subject records, 2 unapproved Commons photo candidates; 516 Places and 31 approved media unchanged.");
