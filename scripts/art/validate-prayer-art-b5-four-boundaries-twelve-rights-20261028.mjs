import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";

const read = p=>JSON.parse(readFileSync(p,"utf8"));
const r=read("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
const b=read("assets/staged/prayer-art-b5-four-boundary-candidates-20261028/boundary-proofs.json");
const q=read("data/research/prayer-art-b5-twelve-photo-source-rights-evidence-20261028.v1.json");
assert.equal(r.primary_artworks.length,22);
assert.equal(r.placement_records.length,118);
assert.equal(r.sections.length,31);
assert.equal(r.totals.masters_archived,20);
assert.equal(r.totals.pristine_publication_ready,0);
assert.equal(r.totals.production_activated,0);
assert.equal(b.proven_originals_checked,4);
assert.equal(b.cases.length,4);
assert.equal(b.no_paint_loss_certified,0);
assert.equal(b.pristine_certified,0);
assert.equal(b.production_released,0);
assert.deepEqual(b.cases.map(x=>x.case_id).sort(),["adoration","angelus","king","rosary"]);
let realCrops=0,boxes=0, noop=0;
for(const c of b.cases){
 const m=r.primary_artworks.find(h=>h.module_id===c.case_id);
 assert.ok(m);
 assert.equal(c.original_sha256,m.original.sha256);
 assert.deepEqual(c.original_pixels,m.original.dimensions_px);
 assert.equal(c.original_preserved,true);
 assert.equal(m.quality.batch5_painted_boundary_proposals.source_original_sha256,c.original_sha256);
 assert.equal(m.quality.batch5_painted_boundary_proposals.correctly_painted_edges_certified,false);
 assert.equal(m.quality.batch5_painted_boundary_proposals.pristine_certified,false);
 const pw=c.original_pixels[0],ph=c.original_pixels[1];
 for(const proposal of c.candidate_files){
  const [x0,y0,x1,y1]=proposal.source_crop_box;
  assert.ok(x0>=0&&y0>=0&&x1<=pw&&y1<=ph&&x1>x0&&y1>y0);
  boxes++;
  if(x0===0&&y0===0&&x1===pw&&y1===ph)noop++;
  if(proposal.path){
    const buf=readFileSync(proposal.path);
    assert.equal(createHash("sha256").update(buf).digest("hex"),proposal.sha256);
    assert.equal(buf.subarray(1,4).toString("ascii"),"PNG");
    assert.equal(buf.readUInt32BE(16),x1-x0);
    assert.equal(buf.readUInt32BE(20),y1-y0);
    realCrops++;
  }
 }
 const proof=c.proof_contact_sheet;
 assert.ok(existsSync(proof.path));
 assert.equal(createHash("sha256").update(readFileSync(proof.path)).digest("hex"),proof.sha256);
}
assert.equal(boxes,8);
assert.equal(realCrops,2);
assert.equal(noop,1);
assert.equal(q.records.length,12);
assert.equal(q.counts.total_sources,12);
assert.equal(q.counts.COMMONS_PD_ART_FAITHFUL_2D,10);
assert.equal(q.counts.NGA_OFFICIAL_OPEN_ACCESS,1);
assert.equal(q.counts.MNAC_OBJECT_PUBLIC_DOMAIN_LABEL,1);
assert.equal(q.counts.photo_rights_final_certified,0);
assert.equal(q.counts.pristine_certified,0);
assert.equal(q.counts.production_allowed,0);
const all12=[...r.primary_artworks,...r.supplementary_photographic_candidates];
for(const e of q.records){
 const x=all12.find(h=>h.module_id===e.id||h.case_id===e.id);
 assert.ok(x,"12-source case not in master "+e.id);
 assert.equal(e.sha256,x.original?.sha256||x.source_sha256);
 assert.equal(e.photo_rights_final_certified,false);
 assert.equal(e.pristine_certified,false);
 assert.equal(e.production_allowed,false);
 assert.ok(e.evidence_source?.startsWith("https://"));
 assert.ok(e.source_url?.startsWith("https://"));
}
assert.equal(r.totals.batch5_painting_boundary_case_proofs,4);
assert.equal(r.totals.batch5_source_rights_evidence_documented,12);
assert.equal(r.totals.batch5_final_pristine_certifications,0);
console.log(JSON.stringify({result:"PASS_B5_FOUR_BOUNDARY_AND_TWELVE_SOURCE_RIGHTS",
   original_source_proofs:4,crop_coordinate_proposals:boxes,
   actual_full_size_png_derivatives:realCrops,nonproductive_rosary_crop:noop,
   independent_rights_evidence_sources:12,final_photo_rights_certified:0,
   pristine_certified:0,production_activated:0,cost_eur:0}));
