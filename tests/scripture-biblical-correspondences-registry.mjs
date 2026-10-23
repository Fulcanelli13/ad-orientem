import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (name) => JSON.parse(readFileSync(new URL("../data/scripture/correspondences/" + name, import.meta.url), "utf8"));
const catholic = read("catholic-deuterocanon-candidates.v1.json");
const ubs = read("ubs-parallel-passages.v1.json");
const thematic = read("thematic-seed.v1.json");

assert.equal(catholic.status, "research_only_unreviewed");
assert.equal(catholic.source.commit, "e7b233ab9403b89a223c37017d3d12e8732fdcf0");
assert.deepEqual(catholic.columns, ["from_verse","raw_to_address","target_scope","source_key","upstream_weight"]);
assert.equal(catholic.rows.length, 565);
assert.equal(catholic.audit.source_verses, 457);
assert.equal(catholic.audit.candidate_certified_count, 0);
assert.deepEqual(catholic.audit.by_source, { douay: 232, na27: 333 });
const seen = new Set();
const catholicLinks = new Set();
const refs = new Set();
const counts = { chapter: 0, verse: 0, douay: 0, na27: 0 };
for (const row of catholic.rows) {
  assert.equal(row.length, 5);
  const [from,to,scope,source,weight] = row;
  assert.match(from, /^[1-3]?[A-Z]{2,3}\.\d+\.\d+$/);
  assert.match(to, /^[1-3]?[A-Z]{2,3}\.\d+\.\d+$/);
  assert.ok(["chapter","verse"].includes(scope));
  assert.ok(["douay","na27"].includes(source));
  assert.equal(weight, source === "douay" ? 100 : 90);
  assert.equal(scope, source === "douay" ? "chapter" : "verse");
  const key = [from,to,scope,source].join("|");
  assert.ok(!seen.has(key), "Duplicate import " + key);
  seen.add(key);
  catholicLinks.add(from + ">" + to + (scope==="chapter" ? ";chapter" : ""));
  refs.add(from);
  counts[scope]++;
  counts[source]++;
}
assert.equal(counts.chapter, 232);
assert.equal(counts.verse, 333);
assert.equal(refs.size, 457);
assert.deepEqual(counts, { chapter: 232, verse: 333, douay: 232, na27: 333 });
const exceptions = catholic.audit.chapter_anchor_exceptions;
assert.equal(exceptions.length, 4);
const suffixExceptions = catholic.rows.filter((r)=>r[2]==="chapter" && !r[1].endsWith(".1"));
assert.deepEqual(new Set(exceptions.map(x=>x.from + ">" + x.raw_to_address)), new Set(suffixExceptions.map(r=>r[0] + ">" + r[1])));
assert.equal(catholic.normalization.no_autopublish,true);

assert.equal(ubs.source.license, "CC BY-SA 4.0");
assert.equal(ubs.source.commit, "a15a96cfaa4ca18a6c0339016645ba1e534db3c8");
assert.equal(ubs.groups.length, 2193);
assert.equal(ubs.audit.deuterocanonical_entries, 0);
let entries=0;
for (const group of ubs.groups) {
  assert.ok(group.length>=2);
  for (const [address,tradition,marks] of group) {
    entries++;
    assert.match(address, /^[1-3]?[A-Z]{2,3} \d+:\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/);
    assert.ok(["HEB","GRK"].includes(tradition));
    assert.match(marks,/^[0-8]+$/);
  }
}
assert.equal(entries,5266);
function hasUBSGroup(refsToFind) { return ubs.groups.some(g=>refsToFind.every(r=>g.some(e=>e[0]===r))); }
assert.ok(hasUBSGroup(["DEU 8:3","MAT 4:4","LUK 4:4"]));
assert.ok(hasUBSGroup(["EXO 12:46","NUM 9:12","JHN 19:36"]));

assert.equal(thematic.topics.length,8);
assert.equal(thematic.families.length,11);
const familyIds = new Set(thematic.families.map(x=>x[0]));
let relations=0;
for (const topic of thematic.topics) {
  assert.ok(familyIds.has(topic.family), "Unknown family "+topic.family);
  assert.ok(thematic.review_outcomes.includes(topic.status));
  assert.ok(topic.status!=="certified" && topic.status!=="published");
  for (const relation of topic.relationships) {
    relations++;
    if (relation.witness.startsWith("ubs:")) {
      const i=Number(relation.witness.slice(4));
      assert.ok(Number.isInteger(i) && ubs.groups[i], "Bad UBS reference "+relation.witness);
      const addresses=new Set(ubs.groups[i].map(x=>x[0].replace(" ", ".").replace(":", ".")));
      assert.ok(addresses.has(relation.from) && addresses.has(relation.to), "Mismatch "+relation.witness);
    } else {
      assert.match(relation.witness, /^catholic:/);
      const witness=relation.witness.slice(9);
      assert.ok(catholicLinks.has(witness), "Unsupported source link "+witness);
    }
  }
}
assert.equal(relations,13);
const word=thematic.topics.find(x=>x.id==="bread-by-the-word");
assert.ok(word?.qualification.includes("NOT Wisdom 16:26"));
const passover=thematic.topics.find(x=>x.id==="passover-unbroken-bones");
assert.ok(passover.passages.includes("NUM.9.12"));
assert.ok(thematic.purpose.includes("Historia Salutis"));
console.log("Biblical Correspondences registry: 565 Catholic candidates; 2,193 UBS groups (5,266 verse entries); eight thematic review clusters and 13 relationships; structural gates PASS.");
