import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const shrineSeed = read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sourceSeed = read("data/shrines/source-registry.v1.json");
const wave1 = read("data/shrines/research/sacred-atlas-wave1-batch56-editorial-closure-20261105.v1.json");
const wave2Paths = [
  "data/shrines/research/sacred-atlas-wave2-guides57-66-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides67-76-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides77-86-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides87-96-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides97-106-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides107-116-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides117-126-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides127-136-20261110.v1.json",
];
const publishedPaths = [
  "data/shrines/illustrated-place-guides-france.v1.json",
  "data/shrines/illustrated-place-guides-france-r67.v1.json",
  "data/shrines/illustrated-place-guides-global-marian-b2.v1.json",
  "data/shrines/illustrated-place-guides-global-saints-r1.v1.json",
  "data/shrines/illustrated-place-guides-ireland.v1.json",
  "data/shrines/illustrated-place-guides-world-marian-r1.v1.json",
];
const shrineByPlace = new Map(shrineSeed.shrines.map(s => [s.place_id,s]));
const researchOnlySources = read("data/shrines/research/sacred-atlas-institutional-source-supplement-20261111.v1.json").sources;
const sourceById = new Map([...sourceSeed.sources,...researchOnlySources].map(s => [s.id,s]));
const publishedIDs = new Set(publishedPaths.flatMap(p =>
  read(p).guides.filter(g => g.publication==="PUBLISHED").map(g => g.place_id)));
const wave1IDs = new Set(wave1.rows.map(r => r.place_id));
const parts = wave2Paths.map(read);
const guides = parts.flatMap(p => p.guides);
assert.equal(shrineSeed.shrines.length, 257);
assert.equal(publishedIDs.size, 33);
assert.equal(wave1IDs.size, 56);
assert.deepEqual(parts.map(p => p.guides.length), [10,10,10,10,10,10,10,10]);
assert.ok(parts.every(p => p.status==="RESEARCH_DRAFT_BILINGUAL_NOT_PUBLISHED"));
assert.equal(guides.length, 80);
assert.equal(new Set(guides.map(g => g.place_id)).size, 80);
let paragraphCount = 0;
for (let i=0; i<guides.length; i++) {
  const guide = guides[i], shrine = shrineByPlace.get(guide.place_id);
  assert.ok(shrine, "Unknown canonical Place " + guide.place_id);
  assert.ok(!publishedIDs.has(guide.place_id), "Already published " + guide.place_id);
  assert.ok(!wave1IDs.has(guide.place_id), "Already drafted in Wave 1 " + guide.place_id);
  assert.equal(guide.shrine_id, shrine.shrine_id);
  assert.equal(guide.place_name, shrine.name);
  assert.equal(guide.country_code, guide.place_id.split(":")[1]);
  assert.equal(guide.draft_order, 57+i);
  assert.equal(guide.publication_authorized, false);
  assert.equal(guide.state, "BILINGUAL_EXTENDED_DRAFT_SECOND_EDITOR_REQUIRED_NOT_PUBLISHED");
  assert.equal(guide.image_policy, "APPROVED_CANONICAL_PLACE_MEDIA_ONLY");
  assert.equal(guide.sections.length, 3);
  assert.equal(new Set(guide.sections.map(s=>s.id)).size,3);
  assert.ok(guide.subtitle_en.length>35 && guide.subtitle_fr.length>35);
  for (const section of guide.sections) {
    assert.ok(section.title_en.length>=10 && section.title_fr.length>=10);
    assert.equal(section.paragraphs.length,1);
    for (const p of section.paragraphs) {
      const source = sourceById.get(p.source_id);
      assert.ok(source, "No matching source " + p.source_id);
      assert.ok(shrine.source_ids.includes(p.source_id)||
        (guide.research_source_ids?.includes(p.source_id)&&
          source.scope==="RESEARCH_ONLY"&&source.place_id===guide.place_id&&
          guide.bibliography_urls.includes(p.source_url)),
        "A source must belong to its canonical site");
      assert.equal(p.source_url,source.url);
      assert.match(p.source_url,/^https:\/\//);
      assert.ok(p.en.length>=145 && p.fr.length>=145,"Missing bilingual substance " + guide.place_id);
      paragraphCount++;
    }
  }
}
assert.equal(paragraphCount,240);
const written = new Set([...publishedIDs,...wave1IDs,...guides.map(g=>g.place_id)]);
assert.equal(written.size,169,"33 published + 56 Wave 1 + 80 Wave 2 = 169 unique shrine guides");
assert.equal(shrineSeed.shrines.length-written.size,88);
console.log("PASS Sacred Atlas 80 newly authored Wave-2 bilingual guides, 240 EN/FR section pairs, 169/257 written and 88 unwritten");
