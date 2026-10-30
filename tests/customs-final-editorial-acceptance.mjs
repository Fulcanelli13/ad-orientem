import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validationErrors,articleFor,fingerprint,publishedIds} from "../tools/customs/editorial-acceptance-contract.mjs";
import {renderReviewPacket} from "../tools/customs/export-final-editorial-review.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const m=read("data/customs/editorial-final-acceptance.v1.json");
const seed=read("data/customs/customs-atlas-seed.v1.json");
assert.deepEqual(validationErrors(m),[]);
assert.equal(m.records.length,36);
assert.equal(m.records.filter(x=>x.priority==="CRITICAL_SCOPE").length,13);
assert.equal(new Set(m.records.map(x=>x.custom_id)).size,36);
assert.deepEqual(new Set(m.records.map(x=>x.custom_id)),new Set(publishedIds()));
assert.equal(seed.customs.filter(x=>x.publication_state==="PUBLISHED").length,36);
assert.equal(seed.customs.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
for(const row of m.records){
  const article=articleFor(row.custom_id);
  assert.ok(article,"Published custom must have existing Calendar article");
  for(const key of ["final_en","final_fr","final_claims"]){
    if(row.custom_id==="PENT-001"){
      assert.equal(row[key].decision,"APPROVED","Only explicitly owner-approved PENT-001 may have final signoff");
      assert.equal(row[key].reviewer,"Fulcanelli13");
      assert.equal(row[key].reviewed_on,"2026-10-30");
      assert.equal(row[key].content_sha256,fingerprint(row.custom_id,key),"Approved fingerprint must match current text");
    }else{
      assert.equal(row[key].decision,"PENDING","Unapproved historical records must retain pending signoff");
      assert.equal(row[key].reviewer,null);
      assert.equal(row[key].content_sha256,null);
    }
    assert.match(fingerprint(row.custom_id,key),/^[a-f0-9]{64}$/);
  }
  assert.equal(row.final_status,row.custom_id==="PENT-001"?"FINAL_HUMAN_SIGNOFF_RECORDED":"BLOCKED_PENDING_HUMAN_SIGNOFF");
}
const review=renderReviewPacket();
assert.equal((review.match(/\n## \d+\. /g)||[]).length,36);
assert.match(review,/ADVT-001/);
assert.match(review,/SNIC-001/);
assert.match(review,/hostie/); // Some articles may contain the word when warning against confusion; full text is shown faithfully
assert.match(review,/source|Source/);
assert.ok(review.length>60000,"Reviewer packet must include full existing bilingual copy, not only abstracts");
const mutation=structuredClone(m);
mutation.records[0].final_en.decision="APPROVED";
assert.ok(validationErrors(mutation).some(x=>x.includes("requires real responsible reviewer")),"Never accept approval without a reviewer");
mutation.records[0].final_en.reviewer="Human Editor";
mutation.records[0].final_en.reviewed_on="2026-10-23";
mutation.records[0].final_en.content_sha256="0".repeat(64);
assert.ok(validationErrors(mutation).some(x=>x.includes("not for current text")),"Stale or invented digest must be rejected");
console.log("PASS customs final-editorial review packet 36/36, 13 scope-critical, one owner-approved current-text signoff and all other records pending");
