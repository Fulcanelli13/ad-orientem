#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert/strict";
const root="data/research/";
const j=JSON.parse(fs.readFileSync(root+"sacred-art-b42-25-case-zero-euro-rights-triage.json","utf8"));
const b41=JSON.parse(fs.readFileSync(root+"sacred-art-b41-383-research-source-coverage-closeout.json","utf8"));
const m=JSON.parse(fs.readFileSync(root+"sacred-art-b42-five-iccd-exact-photo-targets.json","utf8"));
assert.equal(j.schema,"AO_B42_25_FROZEN_ARTWORKS_ZERO_EURO_PUBLICATION_READINESS_V1");
assert.equal(j.active_artworks,383);
assert.equal(j.complete_object_source_baseline,358);
assert.equal(j.remaining_full_object_source_gaps,25);
assert.equal(j.perpetual_cost_ceiling_eur,0);
assert.equal(j.marketing_or_editorial_publication_approvals,0);
assert.equal(j.canonical_master_changed,false);
assert.equal(j.production_security_gate_relaxed,false);
const expected=b41.records.filter(r=>!r.B41_new_complete_object_source);
assert.equal(expected.length,25);
assert.equal(j.cases.length,25);
assert.deepEqual(new Set(j.cases.map(x=>x.artwork_id)),new Set(expected.map(x=>x.artwork_id)));
assert.equal(new Set(j.cases.map(x=>x.artwork_id)).size,25);
const counts={};
for(const c of j.cases){
 counts[c.category]=(counts[c.category]||0)+1;
 assert.equal(c.no_new_catalogue_object,true);
 assert.equal(c.photo_app_reuse_license_verified,false);
 assert.equal(c.public_photo_published,false);
 assert.equal(c.full_original_photo_verified,false);
 assert.ok(c.next_verified_gate.length>25);
}
assert.deepEqual(counts,j.buckets);
assert.equal(counts.UNDERLYING_ARTWORK_RIGHTS_HOLD,2);
assert.equal(counts.SPECIFIC_EXACT_PHOTO_REUSE_HOLD,4);
assert.equal(counts.EXACT_INSTITUTIONAL_PHOTO_RECOVERY,15);
assert.equal(counts.MULTI_FACE_OBJECT_INCOMPLETE,1);
assert.equal(counts.FROZEN_OBJECT_IDENTITY_HOLD,3);
assert.equal(m.candidates.length,5);
assert.equal(new Set(m.candidates.map(c=>c.id)).size,5);
for(const c of m.candidates){
 assert.equal(j.cases.some(x=>x.artwork_id===c.id),true);
 assert.equal(/^\d{10}$/.test(c.accession),true);
}
assert.equal(m.strictly_zero_euro,true);
assert.equal(m.publication_approvals,0);
console.log("B42_TRIAGE_PASS: 25 stable full-object exceptions; 2 copyright, 4 photo reuse, 15 exact institution, 1 double-sided, 3 object identity; €0 and zero publication");
