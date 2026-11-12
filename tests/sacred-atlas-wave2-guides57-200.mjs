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
  "data/shrines/research/sacred-atlas-wave2-guides137-146-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides147-156-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides157-166-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides167-176-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides177-188-20261110.v1.json",
  "data/shrines/research/sacred-atlas-wave2-guides189-200-20261110.v1.json",
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
assert.deepEqual(parts.map(p => p.guides.length), [10,10,10,10,10,10,10,10,10,10,10,10,12,12]);
assert.ok(parts.every(p => p.status==="RESEARCH_DRAFT_BILINGUAL_NOT_PUBLISHED"));
assert.equal(guides.length, 144);
assert.equal(new Set(guides.map(g => g.place_id)).size, 144);
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
assert.equal(paragraphCount,432);
const written = new Set([...publishedIDs,...wave1IDs,...guides.map(g=>g.place_id)]);
assert.equal(written.size,233,"33 published + 56 Wave 1 + 144 Wave 2 = 233 unique shrine guides");
assert.equal(shrineSeed.shrines.length-written.size,24);

const titus = guides.find(g => g.place_id === "place:GR:saint-titus-heraklion");
assert.ok(titus,"Titus historical church must have distinct treatment");
assert.match(titus.sections.find(x=>x.id==="identity").paragraphs[0].en,/now a functioning Orthodox church/i);
assert.match(titus.sections.find(x=>x.id==="identity").paragraphs[0].fr,/une église orthodoxe en activité/i);
assert.match(titus.sections.find(x=>x.id==="pilgrimage").paragraphs[0].en,/not mistake it for a present-day Catholic Mass venue/i);
const sensitive = [
 "place:IT:duomo-torino-sindone",
 "place:DE:trierer-dom-heiliger-rock",
 "place:FR:cathedrale-saint-etienne-cahors",
 "place:ES:catedral-san-salvador-oviedo",
 "place:FR:abbatiale-sainte-trinite-fecamp",
 "place:IT:santuario-volto-santo-manoppello",
];
for(const id of sensitive) {
  const g=guides.find(x=>x.place_id===id);
  assert.ok(g,"Missing sensitive relic history "+id);
  const prose=g.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" ").toLowerCase();
  assert.match(prose,/tradition|attribut|contested|disputed|independent|authentication/,
   "Sensitive relic prose must retain attribution caveat "+id);
}


const holyLandIds = [
 "place:IL:basilica-of-the-annunciation-nazareth",
 "place:IL:basilica-of-the-transfiguration-mount-tabor",
 "place:IL:church-of-the-multiplication-tabgha",
 "place:IL:church-of-the-visitation-ein-karem",
 "place:IL:dominus-flevit-church-mount-of-olives",
 "place:IL:capernaum-saint-peter-memorial",
];
for(const id of holyLandIds) {
  const g=guides.find(x=>x.place_id===id);
  assert.ok(g,"Missing named holy-land Place "+id);
  assert.match(g.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" ").toLowerCase(),
    /tradition|traditional|longstanding christian remembrance.*not archaeological proof/, "Biblical-site geography must preserve historical attribution and uncertainty "+id);
}
const lusaka = guides.find(x=>x.place_id==="place:ZM:archdiocese-lusaka-marian-shrine");
assert.ok(lusaka);
assert.match(lusaka.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" "),/15 August 2025/);
assert.match(lusaka.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" "),/not an automatically recurring route/);


const mariapocs = guides.find(x=>x.place_id==="place:HU:mariapocs-greek-catholic-basilica");
assert.ok(mariapocs);
const mariapocsEn=mariapocs.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" ");
assert.match(mariapocsEn,/Byzantine tradition/);
assert.match(mariapocsEn,/not independently establish/);
const westminster=guides.find(x=>x.place_id==="place:GB:westminster-cathedral");
assert.ok(westminster);
assert.match(westminster.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" "),/distinct from Westminster Abbey/);
const orvieto=guides.find(x=>x.place_id==="place:IT:duomo-orvieto");
assert.ok(orvieto);
assert.match(orvieto.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" "),/geographically to Bolsena/);
const elCobre=guides.find(x=>x.place_id==="place:CU:el-cobre-caridad-basilica");
assert.ok(elCobre);
assert.match(elCobre.sections.flatMap(x=>x.paragraphs.map(p=>p.en)).join(" "),/1977/);

console.log("PASS Sacred Atlas 144 newly authored Wave-2 bilingual guides, 432 EN/FR section pairs, 233/257 written and 24 unwritten");
