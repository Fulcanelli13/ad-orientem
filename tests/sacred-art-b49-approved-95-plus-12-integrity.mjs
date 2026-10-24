#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert/strict";
const p="data/research/";
const c=JSON.parse(fs.readFileSync(p+"sacred-art-b49-107-approved-95-firstpass-12-exceptions.json","utf8"));
const stats=JSON.parse(fs.readFileSync(p+"sacred-art-b49-383-photo-license-and-git-image-summary.json","utf8"));
function csv(s){
  let a=[],row=[],cell="",q=false;
  for(let i=0;i<s.length;i++){let z=s[i];if(z==='"'){if(q&&s[i+1]==='"'){cell+='"';i++;}else q=!q;}
    else if(z===','&&!q){row.push(cell);cell="";}
    else if((z==='\n'||z==='\r')&&!q){if(z==='\r'&&s[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))a.push(row);row=[];cell='';}
    else cell+=z;
  }
  const names=a.shift();return a.map(r=>Object.fromEntries(names.map((h,i)=>[h,r[i]])));
}
const source=csv(fs.readFileSync(p+"sacred-art-b49-383-release-photo-rights-and-repo-mapping.csv","utf8"));
const priority=csv(fs.readFileSync(p+"sacred-art-b49-95-frozen-approved-rights-review-queue.csv","utf8"));
assert.equal(c.schema,"AO_B49_HISTORICALLY_APPROVED_107_PICTURE_RIGHTS_TRIAGE_V1");
assert.equal(c.frozen_approved_artwork_decisions,107);
assert.equal(c.first_pass_complete_source_plus_open_license_metadata,95);
assert.equal(c.exceptions_without_sufficient_first_pass_evidence,12);
assert.equal(c.exceptions.length,12);
assert.equal(c.source_complete_painting_missing_in_approved_cohort,1);
assert.equal(c.known_exact_original_missing,"G25-003");
assert.equal(c.all_107_have_final_photo_permission,false);
assert.equal(c.open_license_metadata_alone_is_not_reuse_clearance,true);
assert.equal(c.strictly_zero_euro,true);
assert.equal(c.source_library_id_modified,0);
assert.equal(c.photo_rights_approved_this_wave,0);
assert.equal(c.publication_or_production_modified,false);
assert.equal(source.length,383);
assert.equal(priority.length,95);
assert.equal(new Set(priority.map(x=>x.artwork_id)).size,95);
assert.equal(new Set(c.exceptions.map(x=>x.artwork_id)).size,12);
const approved=source.filter(r=>r.frozen_decision==="APPROVED_LOCKED"||r.frozen_decision==="APPROVED_5");
assert.equal(approved.length,107);
const approvedIds=new Set(approved.map(x=>x.artwork_id));
assert.deepEqual(new Set([...priority.map(x=>x.artwork_id),...c.exceptions.map(x=>x.artwork_id)]),approvedIds);
assert.ok(priority.every(x=>approvedIds.has(x.artwork_id)));
assert.ok(priority.every(x=>x.ready_to_publish==="False"));
assert.ok(priority.every(x=>x.historically_approved_artwork==="True"));
assert.ok(priority.every(x=>x.license_final_review_status==="NOT_CLEARED_AS_EXACT_COMMERCIALLY_REUSABLE_PHOTO"));
assert.ok(c.exceptions.every(x=>x.publication_approved===false && x.original_editorial_approval_preserved===true));
assert.ok(!priority.some(x=>x.artwork_id==="G25-003"));
assert.equal(stats.historically_approved_with_complete_object_and_open_photo_metadata_claim,95);
assert.equal(stats.historically_approved_other_requiring_additional_sources_or_licensing,12);
console.log("B49_APPROVED_TRIAGE_PASS 383 originals, 107 historical choices, 95 open-metadata/complete-source first passes, 12 explicit exceptions, 0 wrongly approved/released, strictly €0");
