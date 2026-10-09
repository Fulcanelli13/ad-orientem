import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const cert=JSON.parse(readFileSync("data/learn/learn-the-faith-certification-001-018.v1.json","utf8"));
const recovered=JSON.parse(readFileSync("data/learn/learn-the-faith-recovered-54.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));
const learn=readFileSync("src/learn/presentation.js","utf8");

assert.equal(cert.status,"SOURCE_MAPPING_RECONCILED_EDITORIAL_REVIEW_PENDING");
assert.equal(cert.scope.lessonCount,18);
assert.equal(cert.lessons.length,18);
assert.equal(new Set(cert.lessons.map(x=>x.id)).size,18);
assert.equal(cert.lessons[0].id,"LTF-001");
assert.equal(cert.lessons.at(-1).id,"LTF-018");
assert.equal(cert.batchFindings.sourceReconciledLessons,18);
assert.equal(cert.batchFindings.publicationApprovedLessons,0);
assert.equal(cert.reviewGate.sourceContextVerifiedForSelectedClaims,true);
assert.equal(cert.reviewGate.catechismEnglishWordingCollated,true);
assert.equal(cert.reviewGate.frenchSourceWitnessCollated,false);
assert.equal(cert.reviewGate.frenchNativeEdited,false);
assert.equal(cert.reviewGate.crossModuleDeduplicationReviewed,true);
assert.equal(cert.reviewGate.publicationApproved,false);
assert.equal(recovered.lessons.length,54);

for(const lesson of cert.lessons){
  assert.match(lesson.id,/^LTF-0(0[1-9]|1[0-8])$/);
  assert.ok(lesson.summary?.en&&lesson.summary?.fr,lesson.id+" missing bilingual summary");
  assert.ok(lesson.claims.length>=3,lesson.id+" is too thin after reconciliation");
  for(const ref of lesson.canonicalCatechismRefs){
    assert.match(ref,/^PX1912-Q[0-9]{3}$/);
    const n=Number(ref.slice(-3));
    assert.ok(n>=1&&n<=433,lesson.id+" invalid Pius X question ref "+ref);
  }
  for(const claim of lesson.claims){
    assert.ok(claim.en&&claim.fr,lesson.id+" lost bilingual claim");
    assert.ok(claim.sources?.length,lesson.id+" claim lost source");
    for(const source of claim.sources){
      assert.ok(["PIUS_X_1912","VATICAN_I_DEI_FILIUS"].includes(source.source),lesson.id+" unknown certification source "+source.source);
      assert.ok(source.refs?.length,lesson.id+" source lacks locators");
    }
  }
}

const byId=Object.fromEntries(cert.lessons.map(x=>[x.id,x]));
assert.ok(byId["LTF-009"].removedRefs.includes("PX1912-Q067"));
assert.ok(byId["LTF-009"].movedContent.some(x=>x.to.includes("LTF-011")));
assert.ok(byId["LTF-012"].internalHandoffs.includes("LTF-013"));
assert.ok(byId["LTF-016"].canonicalCatechismRefs.includes("PX1912-Q106"));
assert.ok(byId["LTF-016"].canonicalCatechismRefs.includes("PX1912-Q115"));
for(const q of ["PX1912-Q124","PX1912-Q125","PX1912-Q126","PX1912-Q127","PX1912-Q128","PX1912-Q129","PX1912-Q130"]){
  assert.equal(byId["LTF-018"].canonicalCatechismRefs.includes(q),false,"Communion of Saints retained unnecessary ecclesial-status ref "+q);
}

assert.equal(
  ownership.learn_the_faith_certification.batch_001_018.overlay,
  "data/learn/learn-the-faith-certification-001-018.v1.json"
);
assert.equal(ownership.learn_the_faith_certification.batch_001_018.publicationApproved,false);
assert.ok(!learn.includes('id:"learn.faith"'),"Certification batch accidentally published Learn the Faith");

console.log(JSON.stringify({
  status:"PASS",
  lessons:18,
  sourceReconciled:18,
  publicationApproved:0,
  englishCatechismCollation:true,
  frenchEditorialPending:true
},null,2));
