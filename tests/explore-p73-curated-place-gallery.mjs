import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveApprovedPlaceGallery} from "../src/find/place-profiles.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const p73=read("data/geography/research/p73-curated-place-gallery-bundle.v1.json");
const p72=readFileSync(new URL("../data/geography/research/p72-priority-original-byte-results.v1.jsonl",import.meta.url),"utf8").trim().split("\n").map(JSON.parse);
const existing=read("data/geography/approved-place-gallery.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const relics=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(p73.schema,"AO_P73_CURATED_PLACE_GALLERY_BUNDLE_V1");
assert.equal(p73.candidates.length,6);
assert.equal(new Set(p73.candidates.map(x=>x.media_id)).size,6);
assert.equal(new Set(p73.candidates.map(x=>x.place_id)).size,4);
assert.equal(p73.held_without_canonical_relic.length,1);
assert.equal(relics.relics.filter(x=>x.place_id==="place:IE:st-peters-oliver-plunkett-drogheda").length,0,
 "If canonical relic added, reopen the held object-photo review before publishing");
const owned=new Set(geo.places.map(x=>x.place_id));
for(const row of p73.candidates){
  assert.ok(owned.has(row.place_id));
  assert.match(row.expected_source_sha1,/^[a-f0-9]{40}$/);
  assert.ok(row.expected_artist&&row.label_en&&row.label_fr&&row.alt_en&&row.alt_fr);
  assert.ok(row.entire_original_frame_no_crop);
  const evidence=p72.find(x=>x.commons_file_title===row.commons_title);
  assert.ok(evidence?.original_bytes_verified);
  assert.equal(evidence.observed_sha1,row.expected_source_sha1);
  assert.notEqual(evidence.visual_decision,"REJECT");
  const fixture={
    media_id:row.media_id,place_id:row.place_id,status:"APPROVED",kind:"PHOTO",
    asset_path:"assets/approved/place-gallery/"+row.asset_filename,
    rights_verified:true,subject_verified:true,crop_reviewed:true,
    license:row.expected_license,license_url:row.expected_license_url,
    source_url:row.source_url,source_sha1:row.expected_source_sha1,
    derivative_sha256:"a".repeat(64),credit:row.expected_artist,
    alt_en:row.alt_en,alt_fr:row.alt_fr,label_en:row.label_en,label_fr:row.label_fr,
    width:960,height:640,orientation:"landscape",
  };
  assert.equal(resolveApprovedPlaceGallery([fixture],row.place_id).length,1,"Licensed fixture should enter exact Place gallery");
  assert.equal(resolveApprovedPlaceGallery([{...fixture,license_url:"https://creativecommons.org/licenses/by-sa/4.0/" }],row.place_id).length,
    row.expected_license_url==="https://creativecommons.org/licenses/by-sa/4.0/"?1:0,
    "Wrong Creative Commons version must not enter gallery");
  assert.equal(resolveApprovedPlaceGallery([{...fixture,source_url:"https://example.com/file.jpg"}],row.place_id).length,0,"No unsourced hotlinks");
  assert.equal(resolveApprovedPlaceGallery([{...fixture,rights_verified:false}],row.place_id).length,0,"Rights gate remains mandatory");
  assert.equal(resolveApprovedPlaceGallery([fixture],"place:FR:chartres-notre-dame").length,0,"No cross-Place photo leakage");
}
for(const candidate of p73.held_without_canonical_relic){
  assert.ok(!p73.candidates.some(x=>x.commons_title===candidate.commons_title),"Held relic photo must not appear as a Place gallery photo");
}
for(const title of p73.rejected_source_titles){
  assert.ok(!p73.candidates.some(x=>x.commons_title===title),"Rejected source may not publish");
}
const existingIds=new Set(existing.items.map(x=>x.media_id));
for(const row of p73.candidates){
  if(existingIds.has(row.media_id)){
    const record=existing.items.find(x=>x.media_id===row.media_id);
    assert.equal(record.source_sha1,row.expected_source_sha1);
  }
}
console.log("P73 PASS: 6 Place-true shortlisted images, held unmatched relic, exact Creative Commons licence version gate");
