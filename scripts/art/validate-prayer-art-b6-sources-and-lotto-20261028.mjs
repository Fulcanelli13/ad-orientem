import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const r=read("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
const b=read("assets/staged/prayer-art-b6-twelve-source-fingerprint-20261028/source-fingerprints.json");
const l=read("assets/staged/prayer-art-b5b-lotto-exterior-matte-20261028/matte-proofs.json");
assert.equal(r.primary_artworks.length,22);
assert.equal(r.placement_records.length,118);
assert.equal(r.sections.length,31);
assert.equal(r.totals.masters_archived,20);
assert.equal(r.totals.masters_missing,2);
assert.equal(r.totals.pristine_publication_ready,0);
assert.equal(r.totals.production_activated,0);
assert.equal(b.total_cases,12);
assert.equal(b.archived_sha256_verified,12);
assert.equal(b.archived_source_failures,0);
assert.equal(b.commons_file_pages_checked_in_one_query,10);
assert.equal(b.commons_titles_returned,10);
assert.equal(b.exact_commons_source_bytes_matched,9);
assert.equal(b.source_version_or_hash_discrepancies,1);
assert.equal(b.source_api_unavailable,0);
assert.equal(b.photo_rights_final_certified,0);
assert.equal(b.pristine_final_certified,0);
assert.equal(b.production_released,0);
assert.equal(new Set(b.records.map(x=>x.case_id)).size,12);
for(const x of b.records){
 const h=r.primary_artworks.find(y=>y.module_id===x.case_id) ||
         (r.supplementary_photographic_candidates||[]).find(y=>y.case_id===x.case_id);
 assert.ok(h, "Unrecognised photo source "+x.case_id);
 const canonicalSha=h.original?.sha256||h.source_sha256;
 assert.equal(x.sha256_rechecked,canonicalSha);
 assert.equal(x.status,"ARCHIVED_SOURCE_FINGERPRINT_VERIFIED");
 assert.equal(x.rights_final_certified,false);
 assert.equal(x.pristine_final_certified,false);
 assert.equal(x.production_allowed,false);
 if(x.case_id==="morning"){
   assert.equal(x.commons_binary_sha1_match,false);
   assert.equal(h.quality.batch6_external_source_fingerprint.prevent_auto_replace_with_commons_png,true);
 }else if(x.source_label.startsWith("COMMONS")){
   assert.equal(x.commons_binary_sha1_match,true,x.case_id);
   assert.equal(x.commons_native_dimensions_match,true,x.case_id);
   assert.equal(h.quality?.batch6_external_source_fingerprint?.exact_commons_file_bytes_verified ??
    h.batch6_external_source_fingerprint?.exact_commons_file_bytes_verified, true, x.case_id);
 }
}
const lsrc=r.primary_artworks.find(h=>h.module_id==="rosary");
assert.equal(l.source_sha256,lsrc.original.sha256);
assert.deepEqual(l.unchanged_full_native_dimensions,[1880,2886]);
assert.equal(l.research_variants.length,3);
assert.equal(l.all_fifteen_roundels_required,true);
assert.equal(l.pristine_final_certified,false);
const selected=l.research_variants.find(v=>v.threshold_min_channel===238);
assert.ok(selected);
assert.equal(selected.central_column_all_opaque,true);
assert.ok(selected.transparent_pixel_fraction>0.05&&selected.transparent_pixel_fraction<0.1);
const path=selected.full_native_alpha_proof.path;
const raw=readFileSync(path);
assert.equal(createHash("sha256").update(raw).digest("hex"),selected.full_native_alpha_proof.sha256);
assert.equal(raw.subarray(1,4).toString("ascii"),"PNG");
assert.equal(raw.readUInt32BE(16),1880);
assert.equal(raw.readUInt32BE(20),2886);
const d=lsrc.quality.batch5b_lotto_curved_panel_matte;
assert.equal(d.source_sha256,l.source_sha256);
assert.equal(d.all_fifteen_medallions_visually_present,true);
assert.equal(d.pristine_certified,false);
assert.equal(d.production_activated,false);
assert.equal(r.totals.batch6_source_fingerprints_verified,12);
assert.equal(r.totals.batch6_exact_commons_binary_matches,9);
assert.equal(r.totals.batch6_new_pristine_certifications,0);
console.log(JSON.stringify({status:"PASS_B6_SOURCE_EXACT_RIGHTS_AND_LOTTO_ALPHA_INTEGRITY",
 source_cases:12,originals_sha256_verified:12,commons_sha1_exact_binary:9,
 source_version_hold:1,institutional_non_commons:2,lotto_native_arch_png_verified:1,
 rights_certified:0,pristine_certified:0,production_released:0,cost_eur:0}));
