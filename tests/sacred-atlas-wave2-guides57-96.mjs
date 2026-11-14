import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const seeds = read("data/shrines/shrines-pilgrimages-seed.v1.json");
const source = read("data/shrines/source-registry.v1.json");
const closure = read("data/shrines/research/sacred-atlas-wave1-batch56-editorial-closure-20261105.v1.json");
const wave2Paths = [
  "data/shrines/research/sacred-atlas-wave2-guides57-66-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides67-76-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides77-86-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides87-96-20261110.v1.json",
];
const publishedFiles = [
  "data/shrines/illustrated-place-guides-france.v1.json",
  "data/shrines/illustrated-place-guides-france-r67.v1.json",
  "data/shrines/illustrated-place-guides-global-marian-b2.v1.json",
  "data/shrines/illustrated-place-guides-global-saints-r1.v1.json",
  "data/shrines/illustrated-place-guides-ireland.v1.json",
  "data/shrines/illustrated-place-guides-world-marian-r1.v1.json",
];
const shrineByPlace = new Map(seeds.shrines.map(s => [s.place_id,s]));
const researchOnlySources = read("data/shrines/research/sacred-atlas-institutional-source-supplement-20261111.v1.json").sources;
const sourceById = new Map([...source.sources,...researchOnlySources].map(s => [s.id,s]));
const published = new Set(publishedFiles.flatMap(p => read(p).guides.filter(g => g.publication==="PUBLISHED").map(g => g.place_id)));
const wave1 = new Set(closure.rows.map(x=>x.place_id));
const parts = wave2Paths.map(read);
assert.equal(seeds.shrines.length,257);
assert.equal(published.size,33);
assert.equal(wave1.size,56);
assert.deepEqual(parts.map(p=>p.guides.length),[10,10,10,10]);
assert.ok(parts.every(p=>p.status==="RESEARCH_DRAFT_BILINGUAL_NOT_PUBLISHED"));
const guides=parts.flatMap(p=>p.guides);
assert.equal(guides.length,40);
assert.equal(new Set(guides.map(g=>g.place_id)).size,40);
let sectionCount=0;
for(let i=0;i<guides.length;i++){
  const guide=guides[i], shrine=shrineByPlace.get(guide.place_id);
  assert.ok(shrine,"Unknown physical Place "+guide.place_id);
  assert.ok(!wave1.has(guide.place_id),"Wave-1 content already written: "+guide.place_id);
  assert.ok(!published.has(guide.place_id),"Guide already published: "+guide.place_id);
  assert.equal(guide.draft_order,57+i);
  assert.equal(guide.shrine_id,shrine.shrine_id);
  assert.equal(guide.place_name,shrine.name);
  assert.equal(guide.country_code,guide.place_id.split(":")[1]);
  assert.equal(guide.publication_authorized,false);
  assert.equal(guide.state,"BILINGUAL_EXTENDED_DRAFT_SECOND_EDITOR_REQUIRED_NOT_PUBLISHED");
  assert.equal(guide.image_policy,"APPROVED_CANONICAL_PLACE_MEDIA_ONLY");
  assert.equal(guide.source_evidence_scope,
    guide.draft_order<=76?"PRIMARY_CUSTODIAN_SOURCE_RECHECK_20261111_RESEARCH_ONLY_NOT_RELEASED":
    "CANONICAL_SOURCE_REGISTRY_EVIDENCE_REUSED_NO_NEW_EXTERNAL_PAGE_FETCH");
  assert.equal(guide.sections.length,3);
  assert.equal(new Set(guide.sections.map(s=>s.id)).size,3);
  assert.ok(guide.subtitle_en.length>35&&guide.subtitle_fr.length>35);
  for(const section of guide.sections){
    assert.ok(section.title_en.length>=10&&section.title_fr.length>=10);
    assert.equal(section.paragraphs.length,1);
    for(const p of section.paragraphs){
      const src=sourceById.get(p.source_id);
      assert.ok(src,"Unknown source record: "+p.source_id);
      assert.ok(shrine.source_ids.includes(p.source_id)||
        (guide.research_source_ids?.includes(p.source_id)&&
          src.scope==="RESEARCH_ONLY"&&src.place_id===guide.place_id&&
          guide.bibliography_urls.includes(p.source_url)),
        "Source belongs to a different Shrine");
      assert.equal(p.source_url,src.url);
      assert.match(p.source_url,/^https:\/\//);
      assert.ok(p.en.length>=145&&p.fr.length>=145,"Incomplete bilingual section "+guide.place_id);
      sectionCount++;
    }
  }
}
assert.equal(sectionCount,120);
const written=new Set([...published,...wave1,...guides.map(g=>g.place_id)]);
assert.equal(written.size,129,"Existing 33 published + 56 Wave-1 + 40 Wave-2 must remain nonoverlapping");
assert.equal(seeds.shrines.length-written.size,128,"Exactly 128 shrine histories remain unwritten");
console.log("PASS Atlas Wave 2: 40 distinct new bilingual guides, 120 bilingual sections; 129/257 written, 128 unwritten, 33 published");
