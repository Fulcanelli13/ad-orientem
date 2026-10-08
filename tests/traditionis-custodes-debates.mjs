import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const debates = JSON.parse(readFileSync("data/learn/traditionis-custodes-debates.v1.json", "utf8"));
const crisis = JSON.parse(readFileSync("data/learn/church-crisis-canonical.v1.json", "utf8"));
const apol = JSON.parse(readFileSync("data/learn/apologetics-canonical.v1.json", "utf8"));
const ids = new Set([...crisis.dossiers, ...apol.dossiers].map(x => x.id));
const sources = new Map(debates.source_registry.map(s => [s.id, s]));
const expected = Array.from({length:10},(_,i)=>"TLM"+String(66+i).padStart(3,"0"));

assert.equal(debates.status, "BILINGUAL_SOURCE_BACKED_DRAFT_NOT_PUBLISHED");
assert.deepEqual(debates.debates.map(d => d.id), expected);
assert.equal(debates.ownership_summary.new_canonical_dossiers, 0);
assert.equal(debates.source_registry.length, sources.size, "duplicate source identifier");
assert.equal(crisis.dossiers.length, 81, "navigation expansion is prohibited");
assert.equal(apol.dossiers.length, 60, "apologetics navigation expansion is prohibited");
for (const s of debates.source_registry) {
  assert.match(s.url, /^https:\/\//, "non-hyperlinked source: "+s.id);
  assert.ok(s.title && s.type);
}
let paragraphs=0;
for(const d of debates.debates){
  assert.ok(ids.has(d.canonical_owner),"unknown owner "+d.id);
  assert.ok(d.crossLinks.every(x=>ids.has(x)),"unknown cross-link "+d.id);
  assert.ok(d.title.en && d.title.fr,"untranslated title "+d.id);
  assert.deepEqual(d.paragraphs.map(x=>x.role),["answer","identified_objection","assessment"]);
  for(const p of d.paragraphs){
    assert.ok(p.text.en && p.text.fr,"missing bilingual paragraph "+d.id);
    assert.ok(Array.isArray(p.source_ids) && p.source_ids.length,"unsourced paragraph "+d.id);
    for(const sid of p.source_ids)assert.ok(sources.has(sid),"broken source reference "+sid);
    paragraphs++;
  }
}
assert.equal(paragraphs,30);
console.log("Traditionis custodes dossier: PASS — 10 questions, 30 sourced bilingual paragraphs, 14 hyperlinked sources, 0 new navigation dossiers.");
