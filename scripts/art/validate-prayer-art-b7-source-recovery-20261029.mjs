import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root=read("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
const b7=read("assets/staged/prayer-art-b7-three-institution-native-20261028/institution-native-source-audit.json");
const b7b=read("assets/staged/prayer-art-b7b-breton-mnac-exact-commons-20261029/two-case-results.json");
const h=Object.fromEntries(root.primary_artworks.map(x=>[x.module_id,x]));
assert.equal(root.primary_artworks.length,22);
assert.equal(root.placement_records.length,118);
assert.equal(root.sections.length,31);
assert.equal(root.totals.masters_archived,20);
assert.equal(root.totals.masters_missing,2);
assert.equal(root.totals.pristine_publication_ready,0);
assert.equal(root.totals.production_activated,0);
assert.equal(b7.cases.length,3);
assert.equal(b7b.cases.length,2);
assert.equal(b7.totals.institutional_original_binary_candidates_archived,1);
assert.equal(b7b.totals.archived_source_exact_morning_identifications,1);
assert.equal(b7b.totals.higher_resolution_sorrows_candidate_archived,1);
const mr=b7b.cases.find(x=>x.id==="morning");
assert.equal(mr.archived_primary_is_exact_second_commons_file,true);
assert.equal(mr.existing_primary_sha256,h.morning.original.sha256);
assert.equal(h.morning.source.page,mr.commons_metadata.file_page);
assert.equal(h.morning.quality.batch7_institution_and_exact_commons.canonical_source_pointer_repaired,true);
assert.equal(h.morning.quality.batch7_institution_and_exact_commons.aic_artwork_id,94841);
assert.equal(h.morning.quality.batch7_institution_and_exact_commons.aic_iiif_image_acquisition,"HTTP_403_HOLD");
const other=b7.cases.find(x=>x.case_id==="confession-nga-donated-cc0");
const src=b7b.cases.find(x=>x.id==="sorrows");
assert.ok(other.candidate_image&&src.candidate_image);
assert.equal(h.confession.original.sha256,other.registered_hero_sha256);
assert.equal(h.sorrows.original.sha256,src.existing_primary_sha256);
assert.equal(other.commons_institution_donated_source.licence,"CC0");
const files=[
 {hero:"confession",v:other.candidate_image,filepath:other.candidate_image.path,
 sha:other.candidate_image.source_sha256},
 {hero:"sorrows",v:src.candidate_image,filepath:src.candidate_image.path,
 sha:src.candidate_image.sha256}
];
for(const x of files){
 const raw=readFileSync(x.filepath);
 assert.equal(createHash("sha256").update(raw).digest("hex"),x.sha);
 assert.ok(raw[0]===0xff&&raw[1]===0xd8&&raw[2]===0xff,"Expected unmodified JPEG bytes");
}
for(const x of files){
 const p=readFileSync(x.filepath);
 const embedded=h[x.hero].quality[x.hero==="confession"?"batch7_nga_cc0_photo":"batch7_mnac_google_art_photo"];
 assert.equal(embedded.sha256,createHash("sha256").update(p).digest("hex"));
 assert.equal(embedded.existing_primary_preserved??embedded.original_primary_preserved,true);
 assert.equal(embedded.pristine_certified,false);
 assert.equal(embedded.production_activated,false);
}
assert.equal(root.institutional_photo_candidates.length,2);
assert.equal(root.totals.batch7_exact_source_mislink_resolved,1);
assert.equal(root.totals.batch7_added_original_research_photo_candidates,2);
assert.equal(root.totals.batch7_official_aic_iiif_403_holds,1);
assert.equal(root.totals.batch7_new_pristine_photo_certifications,0);
assert.equal(root.totals.batch7_new_production_activations,0);
assert.equal(root.batch_execution.B7_THREE_INSTITUTION_AND_TWO_EXACT_COMMONS.cost_eur,0);
console.log(JSON.stringify({status:"PASS_B7_THREE_INSTITUTIONAL_AND_TWO_EXACT_COMMONS",
 hero_identities:22,primary_masters_unchanged:20,placement_rows:118,
 source_pointer_repairs:1,additional_photo_candidates_sha_verified:2,
 denied_institutional_iiif:1,photo_rights_final_certified:0,
 pristine_certified:0,production_activated:0,cost_eur:0}));
