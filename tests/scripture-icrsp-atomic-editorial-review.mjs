import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../data/scripture/correspondences/",import.meta.url);
const read = (filename) => JSON.parse(readFileSync(new URL(filename,root),"utf8"));
const queue=read("icrsp-lent-atomic-editorial-review.v1.json");
const seed=read("thematic-seed.v1.json");
const leads=read("thematic-source-leads.v1.json");
const books=read("external-book-crosswalk.v1.json");
const ubs=read("ubs-parallel-passages.v1.json");
const catholic=read("catholic-deuterocanon-candidates.v1.json");

assert.equal(queue.status,"scripture_owner_research_only_not_approved_not_user_visible");
assert.equal(queue.owner.pr,1553);
assert.equal(queue.owner.sourceOwnerPr,1666);
assert.match(queue.owner.sourceOwnerPinnedCommit,/^[0-9a-f]{40}$/);
assert.equal(seed.topics.length,8,"the existing editorial topics remain the canonical seed");
assert.equal(leads.research_topics.length,56,"research-only imported subjects remain unchanged");
assert.equal(ubs.groups.length,2193);
assert.equal(catholic.rows.length,565);
const families=new Set(seed.families.map(([id])=>id));
const canonicalBooks=new Set(books.books.map(b=>b.standard_source_code));
const expected={
  "ICRSP-B12-CLM-001":["Tempora/Quad3-1","2Kings 5:1–15","Luke 4:23–30"],
  "ICRSP-B12-CLM-002":["Tempora/Quad3-1","2Kings 5:1–15","Luke 4:23–30"],
  "ICRSP-B12-CLM-003":["Tempora/Quad3-6","Daniel 13:1–9; 13:15–17; 13:19–30; 13:33–62","John 8:1–11"],
  "ICRSP-B12-CLM-004":["Tempora/Quad3-6","Daniel 13:1–9; 13:15–17; 13:19–30; 13:33–62","John 8:1–11"],
  "ICRSP-B12-CLM-005":["Tempora/Quad4-4","2Kings 4:25–38","Luke 7:11–16"],
  "ICRSP-B12-CLM-006":["Tempora/Quad4-5","1Kings 17:17–24","John 11:1–45"],
  "ICRSP-B12-CLM-007":["Tempora/Quad2-5","Genesis 37:6–22","Matthew 21:33–46"]
};
assert.equal(queue.claims.length,7);
assert.equal(new Set(queue.claims.map(x=>x.id)).size,7);
assert.deepEqual(new Set(queue.claims.map(x=>x.id)),new Set(Object.keys(expected)));
assert.equal(new Set(queue.claims.map(x=>x.day)).size,5);
const states={editorial_review_candidate:0,context_only_not_typology:0,source_critical_hold:0,existing_chapter_overlap_hold:0};
for(const claim of queue.claims){
  assert.deepEqual([claim.day,claim.existingMassProper.lesson,claim.existingMassProper.gospel],expected[claim.id],"never rewrite a 1962 Proper from interpretive evidence");
  assert.ok(families.has(claim.family),"use real existing theme families");
  assert.ok(Object.hasOwn(states,claim.state),"unknown editorial state");
  states[claim.state]++;
  assert.match(claim.sourceUrl,new RegExp("article="+claim.article+"$"));
  assert.ok(claim.sourceResearchUrl.includes(queue.owner.sourceOwnerPinnedCommit),"immutable source trace");
  assert.ok(claim.passages.length>0);
  for(const p of claim.passages){
    assert.match(p,/^[1-3]?[A-Z]{2,3}\.\d+(?:\.\d+(?:-\d+)?)?$/,"use existing Catholic canonical book codes");
    assert.ok(canonicalBooks.has(p.split(".")[0]),"unknown canonical book");
  }
  for(const key of ["acceptedForPublication","humanTheologicalReviewCompleted","criticalEditionPublicationCleared","corpusWideSemanticDedupCompleted"]){
    assert.equal(claim[key],false,"research evidence is never automatically published");
  }
  assert.ok(claim.gate.length>15,"each proposal must describe a real editorial review gate");
}
assert.deepEqual(states,queue.reviewStates);
assert.equal(queue.release.humanReviewed,0);
assert.equal(queue.release.sourceEditionVerifiedForDisplay,0);
assert.equal(queue.release.theologicalClaimsApproved,0);
assert.equal(queue.release.productionChanges,0);
assert.equal(queue.release.licenceGrants,0);
assert.equal(queue.release.closed,false);

const joseph=queue.claims.find(c=>c.id==="ICRSP-B12-CLM-007");
assert.equal(joseph.state,"existing_chapter_overlap_hold");
assert.equal(joseph.existingOverlap.topicId,"wisdom-recounts-joseph");
const existing=seed.topics.find(t=>t.id===joseph.existingOverlap.topicId);
assert.ok(existing,"the chapter-level Joseph overlap is real, not guessed");
assert.ok(existing.passages.includes("GEN.37") && existing.passages.includes("WIS.10.13-14"));
assert.ok(existing.relationships.every(r=>r.type==="scripture_retells_scripture"),"existing Joseph source is Scripture-retells-Scripture, not automatically Christological typology");
assert.ok(!joseph.passages.includes("GEN.37.28"),"Joseph sale is outside the actual Mass lesson");
assert.equal(joseph.existingMassProper.lesson,"Genesis 37:6–22");
const susanna=queue.claims.filter(c=>c.day==="Tempora/Quad3-6");
assert.equal(susanna.length,2);
assert.ok(susanna.every(c=>c.passages.includes("DAN.13.1-9") && c.passages.includes("DAN.13.33-62")));
assert.ok(susanna.every(c=>!c.passages.includes("DAN.13.1-62")),"preserve disjoint Susanna lesson segments");
const first=queue.claims.find(c=>c.id==="ICRSP-B12-CLM-001");
assert.ok(first.passages.includes("LUK.4.27") && first.kind==="direct_biblical_named_reference");
const baptism=queue.claims.find(c=>c.id==="ICRSP-B12-CLM-002");
assert.ok(!baptism.passages.some(r=>["MAT","LUK","JHN"].includes(r.split(".")[0])),"a Baptism patristic parallel is not an invented NT explicit quotation");
const elisha=queue.claims.find(c=>c.id==="ICRSP-B12-CLM-005");
assert.ok(elisha.gate.includes("not") || elisha.gate.includes("Never"));
const elijah=queue.claims.find(c=>c.id==="ICRSP-B12-CLM-006");
assert.ok(elijah.gate.includes("NOT a direct prediction"));

// None of these exact historical-typological pairs is a directly encoded UBS word-alignment group.
// This does NOT imply an absence of similar interpretations in other corpora.
const linkGroups=[["2KI 5:14","LUK 4:27"],["2KI 4:32","LUK 7:14"],["1KI 17:22","JHN 11:43"],["GEN 37:20","MAT 21:39"]];
for(const pair of linkGroups)assert.equal(ubs.groups.some(g=>pair.every(address=>g.some(row=>row[0]===address))),false);
console.log("ICRSP editorial intake: 7 claims, 4 review candidates, 1 context only, 2 held; existing Joseph chapter overlap and no automatic publication PASS.");
