import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 buildMassExplorerCatalog,massExplorerMomentHtml,
 massExplorerCss
} from "../src/learn/mass-explorer.js";
import {
 MASS_EXPLORER_PUBLISHED_PRAYER_CONTEXT_VERSION,
 projectPublishedMassPrayerContexts,publishedMassPrayerContextHtml
} from "../src/learn/mass-explorer-published-prayer-context.js";

const data=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const guides=data("data/presentation/guide-registry.v1.json");
const sung=data("data/presentation/reader-text-sung.v1.json");
const french=data("data/presentation/reader-french-ordinary.v1.json");
const formation=data("data/learn/mass-formation-campion.v1.json");
const release=data("data/learn/mass-explorer-approved-studies.v1.json");
const catalog=buildMassExplorerCatalog(guides,sung,french,formation,release);

assert.equal(MASS_EXPLORER_PUBLISHED_PRAYER_CONTEXT_VERSION,"ao-mass-explorer-p1-prayer-context-v1");
assert.equal(catalog.byBlock.size,96);
assert.equal(catalog.sequence.length,32);
assert.equal(catalog.publishedPrayerContextByBlock.size,19);
assert.equal(catalog.approvedStudyByBlock.size,0,"New Canon studies remain unreleased");
assert.equal(projectPublishedMassPrayerContexts(catalog,null).size,0);
assert.equal(projectPublishedMassPrayerContexts(catalog,{...formation,status:"EDITORIAL_DRAFT_NOT_RELEASED"}).size,0);

const certified=new Map(formation.stages.flatMap(stage=>stage.claims.map(claim=>[claim.id,claim])));
const covered=new Set(),claims=new Set();
for(const [blockId,edges] of catalog.publishedPrayerContextByBlock){
 assert.ok(catalog.byBlock.has(blockId));
 assert.ok(edges.length<=2);
 const owner=catalog.byBlock.get(blockId);
 assert.equal(owner.source.Branch_Status,"NORMATIVE_1962");
 assert.equal(owner.source.Proper_Slot,null);
 assert.ok(owner.source.units.length>0);
 const id=owner.key;
 for(const row of edges){
  const source=certified.get(row.id);
  assert.ok(source,"Unpublished claim must not be visible");
  assert.equal(row.text.en,source.text.en);
  assert.equal(row.text.fr,source.text.fr);
  assert.ok(row.claimSourceIds.every(id=>formation.sources.some(s=>s.id===id)));
  assert.match(row.id,/^MF0[1-8]-C0[1-9]$/);
  claims.add(row.id);
 }
 const en=massExplorerMomentHtml(catalog,id,{blockId,french:false});
 const fr=massExplorerMomentHtml(catalog,id,{blockId,french:true});
 for(const [language,html] of [["en",en],["fr",fr]]){
  assert.ok(html.includes('data-ao-mx-anchor="meaning"'),"Missing live in-place source context");
  assert.ok(html.includes('data-ao-mx-jump="meaning"'),"Cannot jump to prayer teaching");
  assert.ok(html.includes('data-ao-mx-cue='),"Original prayer text missing");
  assert.ok(html.includes('id="ao-mx-guide"'),"Original Guide section missing");
  assert.doesNotMatch(html,/data-ao-mx-study-owner=/,"Unreviewed P2 study leaked");
  for(const edge of edges){
   assert.ok(html.includes('data-ao-mx-published-claim="'+edge.id+'"'));
   assert.ok(html.includes(edge.text[language].replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),"Exact P1 claim diverged from source registry");
  }
 }
 covered.add(blockId);
}
assert.equal(covered.size,19);
assert.ok(claims.size>=9);
assert.match(massExplorerCss(),/aoMXPrayerMeaning/);
assert.ok(!massExplorerMomentHtml(catalog,catalog.byBlock.get("AO.SM.B090").key,{blockId:"AO.SM.B090"}).includes('data-ao-mx-anchor="meaning"'),
 "No generic, unverified paragraph should fill uncovered source blocks");
assert.ok(!massExplorerMomentHtml(catalog,catalog.byBlock.get("AO.SM.B059").key,{blockId:"AO.SM.B059"}).includes('data-ao-mx-anchor="meaning"'),
 "No unrelated doctrine should be forced onto Per quem");

const files=[
 "data/learn/research/mass-formation-before-offertory-prayer-reading-pilot-20261016.v1.json",
 "data/learn/research/mass-formation-offertory-prayer-reading-pilot-20261016.v1.json",
 "data/learn/research/mass-formation-orate-preface-reading-pilot-20261016.v1.json",
 "data/learn/research/mass-formation-roman-canon-reading-pilot-20261016.v1.json",
 "data/learn/research/mass-formation-communion-prayer-reading-pilot-20261016.v1.json",
 "data/learn/research/mass-formation-conclusion-prayer-reading-pilot-20261016.v1.json"
];
const candidates=files.map(data);
assert.deepEqual(candidates.map(f=>f.entries.length),[23,8,6,15,23,9]);
const allEntries=candidates.flatMap(f=>f.entries);
assert.equal(allEntries.length,84);
assert.equal(new Set(allEntries.map(e=>e.block_id)).size,84);
for(const source of candidates)assert.equal(source.status,"EDITORIAL_DRAFT_NOT_RELEASED");
for(const entry of allEntries){
 assert.equal(catalog.byBlock.get(entry.block_id)?.key,entry.moment_id,"Editorial crosswalk must not lose Guide moment ID");
 assert.ok(entry.reading.en.length>40&&entry.reading.fr.length>40);
 assert.ok(entry.heading.en&&entry.heading.fr);
}
const explorer=readFileSync(new URL("../src/learn/mass-explorer.js",import.meta.url),"utf8");
const published=readFileSync(new URL("../src/learn/mass-explorer-published-prayer-context.js",import.meta.url),"utf8");
const input=explorer+published;
assert.doesNotMatch(input,/mass-formation-(?:before-offertory|offertory|roman-canon|communion|conclusion)-prayer-reading-pilot/);
assert.doesNotMatch(input,/mass-explorer-remaining-six-release-candidates/);
assert.doesNotMatch(input,/from .*mass-prayer-reading-pilot/);
console.log("PASS live Mass Explorer: 19 source-specific published Formation contexts, 21 cited P1 claims, 84 draft prayer units correctly mapped/held, 32 Guide moments, 96 Sung blocks, zero unreleased essays.");
