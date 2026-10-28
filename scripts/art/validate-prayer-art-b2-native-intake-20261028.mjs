import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="assets/staged/";
const a=read("data/research/prayer-sacred-art-b2-reconciled-intake-20261028.v1.json");
const r=read("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
const intake=read(root+"prayer-art-bulk-acquisition-b2-20261028/intake-results.json");
const second=read(root+"prayer-art-bulk-acquisition-b2b-20261028/parallel-results.json");
assert.equal(a.case_count,14);
assert.equal(a.records.length,14);
assert.equal(a.archived_count,7);
assert.equal(a.pristine_certified_count,0);
assert.equal(a.cost_eur,0);
assert.equal(r.totals.batch2_artwork_groups_processed,14);
assert.equal(r.totals.batch2_native_source_candidates_archived,7);
assert.equal(r.totals.batch2_photo_candidates_pristine,0);
assert.equal(r.totals.pristine_publication_ready,0);
assert.equal(r.totals.production_activated,0);
assert.equal(intake.attempted,14);
assert.equal(intake.original_native_sources_archived,1);
assert.equal(second.attempted,6);
assert.equal(second.cases.filter(x=>x.native_archive).length,6);
const unique=new Set(a.records.map(x=>x.case_id));
assert.equal(unique.size,14);
const archived=a.records.filter(x=>x.archived_native);
assert.equal(archived.length,7);
for(const item of archived){
 const original=item.evidence_file;
 assert.ok(original,"missing archived path "+item.case_id);
 const data=readFileSync(original);
 const sha=createHash("sha256").update(data).digest("hex");
 assert.equal(sha,item.source_original_sha256,item.case_id+" source sha");
 assert.ok(item.pixels?.every(n=>Number.isInteger(n)&&n>0));
 assert.equal(item.pristine_certified,false);
 assert.equal(item.publication_allowed,false);
 assert.equal(item.final_photo_licence_certified,false);
}
for(const id of ["reni-michael","paired-hearts-lopez","carracci-burial-met"]){
 assert.match(a.records.find(x=>x.case_id===id)?.photographic_assessment,/REJECT_AS_PRISTINE_EXTERNAL_/);
}
assert.match(a.records.find(x=>x.case_id==="tiepolo-station12")?.photographic_assessment,/REJECT_AS_PRISTINE_SEVERE_/);
for(const id of ["tiepolo-prado-descent","teniers-agony-antwerp","vandyck-holy-spirit"]){
 assert.equal(a.records.find(x=>x.case_id===id)?.photographic_assessment,"PRELIMINARY_PAINTED_SURFACE_HOLD");
}
assert.deepEqual(r.batch_execution.B1_IMAGE_ACQUISITION.remaining_exact_groups_not_native_archived.sort(),
 a.records.filter(x=>!x.archived_native).map(x=>x.case_id).sort());
assert.equal(r.primary_artworks.length,22);
assert.equal(r.placement_records.length,118);
console.log(JSON.stringify({result:"PASS_B2_14_GROUP_7_ARCHIVE_NATIVE_SHA_VERIFIED",
 groups:14,source_originals_verified:7,photographically_rejected:4,
 preliminary_source_candidates:3,unresolved_source_groups:7,pristine_certified:0,production_releases:0,cost_eur:0}));
