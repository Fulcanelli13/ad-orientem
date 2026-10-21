/*
 * Check that Father-authored Latin question spans are kept distinct from
 * quoted Gospel questions and imagined objections. Research-only evidence;
 * never generate patristic responses from editorial question wording.
 * Run: node tests/scripture-catena-augustine-original-spans.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const spans=read("data/scripture/catena/research/augustine-original-question-spans.v1.json");
const sections=read("data/scripture/catena/research/augustine-quaestiones-continuation.v1.json");
assert.equal(spans.schema,"ao.catena.augustine-historical-questions-extract.v1");
assert.equal(spans.status,"research_only_not_licensed_published_dialogue");
assert.equal(spans.records.length,17);
assert.equal(spans.excludedQuotedOrHypotheticalQuestions.length,5);
const index=new Map(sections.records.map(s=>[s.id,s]));
const ids=new Set(),covered=new Set();
for(const row of spans.records){
 assert.ok(!ids.has(row.id),"duplicate source question"); ids.add(row.id);
 const parent=index.get(row.sourceSectionId);
 assert.ok(parent,"missing historical source section");
 assert.equal(row.sourceSectionLocator.startsWith(parent.sourceLocator),true);
 assert.equal(row.speakerAttribution,"Augustine, as narrator/interpreter");
 assert.equal(row.language,"la");
 assert.ok(row.originalLatinExactSpan.length>=20,"missing exact source phrase");
 assert.ok(row.sourceUrl.startsWith("https://la.wikisource.org/"));
 assert.equal(row.readerTranslation,"none_until_human_review");
 assert.equal(row.status,"research_only_primary_witness_read_not_independent_critical_edition_verified");
 assert.ok(!Object.prototype.hasOwnProperty.call(row,"fatherReply"));
 assert.ok(!Object.prototype.hasOwnProperty.call(row,"generatedAnswer"));
 assert.equal(parent.originalQuestionKind,"original_authorial_question_within_section",
   "the parent must identify genuine authorial question evidence");
 covered.add(row.sourceSectionId);
}
assert.equal(covered.size,12,"multiple questions per section are valid");
assert.equal(sections.records.filter(r=>r.originalQuestionKind==="original_authorial_question_within_section").length,12);
for(const bad of spans.excludedQuotedOrHypotheticalQuestions){
 assert.ok(bad.speaker&&bad.reason,"excluded examples require voice and reason");
 assert.ok(!spans.records.some(x=>x.originalLatinExactSpan===bad.verbatim),
   "Biblical questions/imaginary objection must not be attributed to Augustine");
}
console.log("PASS: 17 original Augustinian Latin question spans in 12 sections; five distinct quoted/hypothetical exclusions");
