import fs from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
const root = process.cwd();
const dir = path.join(root, "data/research/did-you-know");
const read = file => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
const historical = [
 "dyk-ultramaster-batch01.v1.json",
 "dyk-ultramaster-batch02a-weiser.v1.json",
 "dyk-ultramaster-batch02b-pitre.v1.json",
 "dyk-ultramaster-batch03-wider-corpus.v1.json",
].flatMap(f => read(f).facts);
const olderComplement = read("dyk-source-first-batch01.v1.json").facts;
const expansion = read("dyk-source-backed-glossary-expansion-440.v1.json");
const insights = read("dyk-glossary-second-insights-200.v1.json");
const existing = [...historical, ...olderComplement];
assert.equal(historical.length, 130, "Customs original draft count");
assert.equal(olderComplement.length, 15, "Glossary/Mass original draft count");
assert.equal(existing.length, 145);
assert.equal(expansion.records.length, 440);
assert.equal(insights.records.length, 200);
assert.equal(existing.length + expansion.records.length + insights.records.length, 785);
const all = [...existing, ...expansion.records, ...insights.records];
const ids = all.map(x => x.id);
assert.equal(new Set(ids).size, ids.length, "IDs must not collide");
const baselineGlossary = new Set(olderComplement.filter(x => x.category === "glossary").map(x => x.source.record_id));
assert.equal(baselineGlossary.size, 10);
assert.equal(expansion.records.filter(x => baselineGlossary.has(x.origin.record_id)).length, 0);
assert.equal(insights.records.filter(x => baselineGlossary.has(x.source.record_id)).length, 0);
for (const item of expansion.records) {
 assert.ok(item.fact.en && item.fact.fr && item.subject.en && item.subject.fr && item.origin.source_ids.length, item.id);
 assert.equal(item.editorial_approved, false);
 assert.equal(item.publication_authorized, false);
 assert.equal(item.origin.record_id, item.destination.id);
 assert.ok(item.origin.path.startsWith("data/glossary/concepts-") && item.origin.path.endsWith(".v1.json"), item.id);
}
for (const item of insights.records) {
 assert.ok(item.fact.en && item.fact.fr && item.differentiated_from_definition.en && item.source.source_ids.length, item.id);
 assert.ok(item.measured_within_entry_lexical_jaccard < 0.4, item.id);
 assert.equal(item.approved, false);
 assert.equal(item.published, false);
 assert.equal(item.source.record_id, item.deep_link.id);
}
assert.equal(expansion.counts.net_new_glossary_fact_seeds, 440);
assert.equal(expansion.counts.priority_liturgy_devotion_customs, 327);
assert.equal(insights.counts.combined_provisional_seeds, 785);
console.log("DYK source-only candidate expansion: 145 prior + 440 definition microfacts + 200 contextual insights = 785. Structural gates PASS; substantive accuracy, semantic uniqueness and publication approval NOT TESTED.");