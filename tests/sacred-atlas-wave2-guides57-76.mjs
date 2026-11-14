import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const source = read("data/shrines/source-registry.v1.json");
const seeds = read("data/shrines/shrines-pilgrimages-seed.v1.json");
const closure = read("data/shrines/research/sacred-atlas-wave1-batch56-editorial-closure-20261105.v1.json");
const part1 = read("data/shrines/research/sacred-atlas-wave2-guides57-66-20261110.v1.json");
const part2 = read("data/shrines/research/sacred-atlas-wave2-guides67-76-20261110.v1.json");
const publishedFiles = [
  "data/shrines/illustrated-place-guides-france.v1.json",
  "data/shrines/illustrated-place-guides-france-r67.v1.json",
  "data/shrines/illustrated-place-guides-global-marian-b2.v1.json",
  "data/shrines/illustrated-place-guides-global-saints-r1.v1.json",
  "data/shrines/illustrated-place-guides-ireland.v1.json",
  "data/shrines/illustrated-place-guides-world-marian-r1.v1.json",
];
const researchOnlySources = read("data/shrines/research/sacred-atlas-institutional-source-supplement-20261111.v1.json").sources;
const sourceById = new Map([...source.sources,...researchOnlySources].map(s => [s.id,s]));
const shrineByPlace = new Map(seeds.shrines.map(s => [s.place_id, s]));
const wave1 = new Set(closure.rows.map(r => r.place_id));
const published = new Set(publishedFiles.flatMap(path =>
  read(path).guides.filter(g => g.publication === "PUBLISHED").map(g => g.place_id)));
assert.equal(seeds.shrines.length, 257);
assert.equal(closure.rows.length, 56);
assert.equal(wave1.size, 56);
assert.equal(published.size, 33, "Published baseline should remain 33 distinct guides");
assert.equal(part1.status, "RESEARCH_DRAFT_BILINGUAL_NOT_PUBLISHED");
assert.equal(part2.status, "RESEARCH_DRAFT_BILINGUAL_NOT_PUBLISHED");
assert.deepEqual([part1.guides.length, part2.guides.length], [10,10]);
const guides = [...part1.guides, ...part2.guides];
assert.equal(guides.length,20);
assert.equal(new Set(guides.map(g => g.place_id)).size,20);
let paragraphs = 0;
for (let i = 0; i < guides.length; i++) {
  const g=guides[i];
  const shrine=shrineByPlace.get(g.place_id);
  assert.ok(shrine, "Guide for unknown canonical shrine: " + g.place_id);
  assert.ok(!wave1.has(g.place_id), "Redrafts an existing Wave-1 shrine " + g.place_id);
  assert.ok(!published.has(g.place_id), "Redrafts an already-published guide " + g.place_id);
  assert.equal(g.shrine_id, shrine.shrine_id);
  assert.equal(g.place_name, shrine.name);
  assert.equal(g.country_code, g.place_id.split(":")[1]);
  assert.equal(g.draft_order,57+i);
  assert.equal(g.state,"BILINGUAL_EXTENDED_DRAFT_SECOND_EDITOR_REQUIRED_NOT_PUBLISHED");
  assert.equal(g.publication_authorized,false);
  assert.equal(g.sections.length,3);
  assert.ok(g.subtitle_en.length>35 && g.subtitle_fr.length>35);
  assert.equal(g.image_policy,"APPROVED_CANONICAL_PLACE_MEDIA_ONLY");
  assert.equal(g.source_evidence_scope,
    g.draft_order<=76?"PRIMARY_CUSTODIAN_SOURCE_RECHECK_20261111_RESEARCH_ONLY_NOT_RELEASED":
    "CANONICAL_SOURCE_REGISTRY_EVIDENCE_REUSED_NO_NEW_EXTERNAL_PAGE_FETCH");
  assert.equal(g.next_gate,"SUBSTANTIVE_EDITORIAL_FACT_AND_BILINGUAL_QA_BEFORE_PUBLICATION");
  assert.equal(new Set(g.sections.map(s => s.id)).size,3);
  for(const section of g.sections) {
    assert.ok(section.title_en?.length>9 && section.title_fr?.length>9);
    assert.equal(section.paragraphs.length,1);
    for(const paragraph of section.paragraphs) {
      const citation=sourceById.get(paragraph.source_id);
      assert.ok(citation, "Unknown existing source " + paragraph.source_id);
      assert.ok(shrine.source_ids.includes(paragraph.source_id)||
        (g.research_source_ids?.includes(paragraph.source_id)&&
          citation.scope==="RESEARCH_ONLY"&&citation.place_id===g.place_id&&
          g.bibliography_urls.includes(paragraph.source_url)),
        "A source must belong to its canonical site");
      assert.equal(paragraph.source_url,citation.url,"Must preserve original sourced URL");
      assert.match(paragraph.source_url,/^https:\/\//);
      assert.ok(paragraph.en.length >= 145 && paragraph.fr.length >= 145,
        "Incomplete bilingual paragraph for " + g.place_id);
      paragraphs++;
    }
  }
  assert.ok(g.bibliography_urls.every(u=>/^https:\/\//.test(u)));
}
assert.equal(paragraphs,60);
assert.equal(new Set([...wave1,...published,...guides.map(g=>g.place_id)]).size,109,
  "Written corpus should cover 109 distinct shrines after this research tranche");
assert.equal(seeds.shrines.length - 109,148,
  "148 shrine histories remain unwritten; 76 are in the research/editorial pipeline");
console.log("PASS Sacred Atlas Wave 2: 20 new distinct EN/FR guides, 60 paired sections, 33 published and 76 drafts, 148 unwritten");
