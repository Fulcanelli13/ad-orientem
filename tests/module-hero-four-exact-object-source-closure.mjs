import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const rows=read("data/research/module-hero-four-exact-object-source-closure-20261101.v1.json");
const approved=read("data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json");
const ready=read("data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json");
assert.equal(rows.status,"RESEARCH_ONLY_NO_PUBLICATION");
assert.equal(rows.publication_approvals,0);
assert.equal(rows.new_publishable_originals,0);
assert.equal(rows.no_contact_without_authorization,true);
assert.equal(rows.cost_policy,"EUR_0_ONLY");
assert.equal(rows.source_url_is_not_reuse_permission,true);
assert.equal(rows.records.length,4);
const ids=new Set(["angel","evening","holy-spirit","salvation"]);
const noRelease=new Set([
"EXCLUDE_OBJECT_DIFFERENT_SMALLER_REPLICA","EXCLUDE_OBJECT_LATER_COPY",
"EXCLUDE_FEE_RESTRICTED","EXCLUDE_RESTRICTED_REPRODUCTION",
"EXCLUDE_PAID_REPRODUCTION","EXCLUDE_IMAGE_WITHOUT_AUTHORIZATION",
"REJECTED_PHOTOGRAPH_GLARE_AND_NOISE",
"REJECTED_GALLERY_INSTALLATION_NOT_PAINTING_MASTER",
]);
for(const r of rows.records){
  assert.ok(ids.delete(r.module_id),"Unexpected/duplicate targeted module: "+r.module_id);
  const a=approved.final_approved_heroes.find(x=>x.module_id===r.module_id);
  const m=ready.entries.find(x=>x.module_id===r.module_id);
  assert.ok(a&&m,"Missing approved source of truth: "+r.module_id);
  assert.equal(a.artwork_id,m.artwork_id,"Frozen artwork ID conflict: "+r.module_id);
  assert.equal(a.title,m.title);
  assert.equal(a.artist,m.artist);
  assert.equal(a.editorial_status,"user_approved_final");
  assert.equal(r.module_id==="holy-spirit"?"Jean Restout":r.artist,a.artist,
    "Unreviewed artist substitution: "+r.module_id);
  assert.equal(r.title,a.title,"Unreviewed painting-title substitution: "+r.module_id);
  assert.equal(m.app_released,false);
  assert.equal(m.production_release,"BLOCKED");
  assert.ok(r.blockers.length>=2);
  assert.ok(r.object.object_evidence.startsWith("https://"));
  assert.ok(r.existing_media.source.startsWith("https://"));
  assert.ok(r.new_evidence.length>=2);
  for(const candidate of r.new_evidence){
    assert.match(candidate.url,/^https:\/\//,"No ambiguous source link");
    assert.ok(candidate.verdict!=="APPROVED"&&candidate.verdict!=="RELEASED",
      "Unapproved image candidate auto-promoted: "+r.module_id);
    assert.ok(candidate.reason.length>=30);
    if(noRelease.has(candidate.verdict))
      assert.notEqual(candidate.verdict,"RELEASED");
  }
}
assert.equal(ids.size,0,"Missing art blocker(s): "+[...ids]);
const angel=rows.records.find(r=>r.module_id==="angel");
assert.ok(angel.new_evidence.some(x=>x.verdict==="EXCLUDE_OBJECT_DIFFERENT_SMALLER_REPLICA"));
assert.ok(angel.new_evidence.some(x=>x.verdict==="EXCLUDE_OBJECT_LATER_COPY"));
assert.ok(rows.records.find(r=>r.module_id==="salvation").blockers.includes("DO_NOT_SUBSTITUTE_PREPARATORY_STUDY"));
for(const r of rows.records)console.log("HOLD "+r.module_id+": "+r.blockers.join(" | "));
console.log("PASS 4 exact-object source blocks, 22 editorial selections preserved; 0 publication changes");
