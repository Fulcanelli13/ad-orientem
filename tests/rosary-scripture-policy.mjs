import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSARY_SCRIPTURE_REFERENCE_V1,ROSARY_SCRIPTURE_POLICY_V1,rosaryScripturePassage} from "../src/pray/rosary-scripture-policy.js";

const audit=JSON.parse(readFileSync("data/pray/rosary-scripture-editorial-inventory.v1.json","utf8"));
const entries=Object.entries(ROSARY_SCRIPTURE_REFERENCE_V1);
assert.equal(entries.length,20,"twenty historical+optional Rosary mysteries require a passage");
assert.deepEqual(entries.map(([id])=>id),[
  "joy1","joy2","joy3","joy4","joy5","lum1","lum2","lum3","lum4","lum5",
  "sor1","sor2","sor3","sor4","sor5","glo1","glo2","glo3","glo4","glo5"
]);
assert.equal(audit.rows.length,200,"all 200 original cues must remain accounted for in the editorial archive");
assert.equal(new Set(audit.rows.map(x=>x.id)).size,200,"original bead identities were lost");
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.donorExcerptCount,200);
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.publicPerBeadExcerptStatus,"WITHHELD_UNTIL_PASSAGE_CERTIFICATION");
assert.ok(audit.rows.every(x=>x.reviewStatus==="PRIMARY_PASSAGE_COLLATION_PENDING"),
 "cannot relabel unattributed original snippets as independently verified");
for(const [id,ref] of entries){
  assert.match(ref.reference,/^[A-Z][\w\s]+\s+\d+:\d+(?:-\d+)?$/,"unsupported scriptural reference format: "+id);
  assert.match(rosaryScripturePassage(id).href,/^https:\/\/www\.biblegateway\.com\/passage\/\?/);
  assert.equal(ref.type==="traditional_typology",id==="glo4"||id==="glo5","typology classification drift: "+id);
}
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(runtime,/applyRosaryScripturePolicy\(r,info/,"Rosary active player must use the curation policy");
assert.match(runtime,/decorateRosaryExact\(r\)/,"canonical player should remain the runtime owner");
const policy=readFileSync("src/pray/rosary-scripture-policy.js","utf8");
assert.match(policy,/\.lab-prayer-sheet \.lab-scripture-cue/,"uncertified excerpt display not gated");
assert.match(policy,/\.lab-prayer-sheet \.lab-scripture-actions/,"unreviewed per-bead commentary/action pairing not gated");
assert.match(policy,/passage\.type==="traditional_typology"/);
assert.ok(!policy.includes("window.AO_ROSARY_V381="),"no replacement Rosary player allowed");
console.log("PASS Rosary Scripture policy: 20 sourced opening references, 200 cue records preserved as review-only, no unverified per-bead quotations");
