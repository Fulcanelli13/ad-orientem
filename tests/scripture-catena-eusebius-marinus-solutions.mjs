/*
 * Research-only structure of solutions to Marinus I–IV.
 * Checks that every argument remains source-anchored, qualified,
 * independent of copyrighted translations and Father-speech generation.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/scripture/catena/research/";
const doc=read(root+"eusebius-marinus-solution-structure.v1.json");
const index=read(root+"eusebius-epitome-20-questions.v1.json");
const suppl=read(root+"eusebius-marinus-supplement-problem-index.v1.json");
assert.equal(doc.schema,"ao.catena.eusebius-marinus-solution-structure.v1");
assert.equal(doc.status,"research_only_no_user_facing_answers");
assert.deepEqual(doc.quantities,{questions:4,argumentRecords:18,withProvisionalFullLogic:3,requiresBoundaryReview:1});
assert.equal(doc.records.length,4);
const bible=new Set();
for(const gospel of ["matthew","mark","luke","john"]){
 const pack=read("data/scripture/catena/"+gospel+".json");
 for(const p of pack.pericopes)for(const k of p.verse_keys)bible.add(k);
}
const ids=new Set(),spans=new Set();
for(const rec of doc.records){
 assert.ok(!ids.has(rec.questionId));ids.add(rec.questionId);
 assert.ok(index.records.some(x=>x.id===rec.questionId&&x.recipient==="marinus"),"missing inventory question");
 assert.equal(rec.editorialUse,"scholarly_internal_locator_only__NOT_user_facing_Father_paraphrase");
 assert.ok(!("fatherAnswer" in rec));
 assert.ok(rec.spans.length>=4);
 for(const s of rec.spans){
  assert.ok(!spans.has(s.id));spans.add(s.id);
  assert.equal(s.status,"editorial_research_only_not_a_historical_quote");
  assert.ok(s.analyticalDescription.length>45);
  assert.ok(s.locator.startsWith("I.")||s.locator.startsWith("II.")||s.locator.startsWith("III.")||s.locator.startsWith("IV.")||s.locator==="cross-witness");
  assert.ok(bible.has(s.bibleKey),"unrecognized Scripture key "+s.bibleKey);
  assert.ok(s.logicalStatus.length>12);
  assert.ok(!("spokenAnswer" in s));
  assert.ok(!("englishTranslation" in s));
  if(s.shortGreekVerificationAnchor){
    assert.ok(s.shortGreekVerificationAnchor.length>=9);
    assert.equal(s.shortGreekAnchorValidation,"observed_in_online_Greek_excerpts_or_secondary_source__not_manuscript_collated");
  } else assert.equal(s.shortGreekAnchorValidation,"not_captured");
  if(s.sourceUrl)assert.ok(s.sourceUrl.startsWith("https://"));
 }
}
assert.equal(spans.size,18);
assert.ok(spans.has("M1-A")&&spans.has("M1-B")&&spans.has("M1-C"));
assert.ok(spans.has("M2-D")&&spans.has("M2-E"));
assert.ok(spans.has("M3-C")&&spans.has("M3-D"));
const iv=doc.records.find(x=>x.questionId==="eusebius-marinus-04");
assert.equal(iv.argumentStatus,"partially_recovered_editorially_mixed");
assert.ok(iv.spans.some(s=>s.id==="M4-C"&&s.logicalStatus.includes("textual_boundary_quarantine")));
assert.ok(iv.spans.some(s=>s.id==="M4-D"&&s.logicalStatus==="separate_witness_not_replace_or_merge"));
assert.ok(suppl.entries.some(x=>x.id==="eusebius-marinus-supp-05"));
console.log("PASS: four Marinus questions; 18 source-qualified argument spans, separate witnesses and textual/voice safeguards");
