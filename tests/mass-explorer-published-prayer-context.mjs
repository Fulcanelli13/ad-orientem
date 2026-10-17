import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMassExplorerCatalog,massExplorerMomentHtml,massExplorerCss} from "../src/learn/mass-explorer.js";
import {projectPublishedMassPrayerContexts} from "../src/learn/mass-explorer-published-prayer-context.js";
const data=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const guides=data("data/presentation/guide-registry.v1.json");
const sung=data("data/presentation/reader-text-sung.v1.json");
const french=data("data/presentation/reader-french-ordinary.v1.json");
const formation=data("data/learn/mass-formation-campion.v1.json");
const catalog=buildMassExplorerCatalog(guides,sung,french,formation);
assert.equal(catalog.byBlock.size,96);
assert.equal(catalog.sequence.length,32);
assert.equal(catalog.publishedPrayerContextByBlock.size,19);
assert.equal(projectPublishedMassPrayerContexts(catalog,null).size,0);
assert.equal(projectPublishedMassPrayerContexts(catalog,{...formation,status:"DRAFT"}).size,0);
const claims=new Map(formation.stages.flatMap(s=>s.claims.map(c=>[c.id,c])));
let links=0;
for(const [blockId,rows] of catalog.publishedPrayerContextByBlock){
 const owner=catalog.byBlock.get(blockId);
 assert.equal(owner.source.Branch_Status,"NORMATIVE_1962");
 assert.ok(!owner.source.Proper_Slot);
 assert.ok(rows.length<=2);
 links+=rows.length;
 for(const row of rows){
  assert.equal(row.text.en,claims.get(row.id).text.en);
  assert.equal(row.text.fr,claims.get(row.id).text.fr);
  assert.ok(row.claimSourceIds.every(src=>formation.sources.some(x=>x.id===src)));
 }
 for(const [fr,lg] of [[false,"en"],[true,"fr"]]){
  const html=massExplorerMomentHtml(catalog,owner.key,{blockId,french:fr});
  assert.match(html,/data-ao-mx-anchor="meaning"/);
  assert.match(html,/data-ao-mx-jump="meaning"/);
  assert.match(html,/data-ao-mx-cue=/);
  assert.match(html,/id="ao-mx-guide"/);
  for(const row of rows){
   assert.ok(html.includes('data-ao-mx-published-claim="'+row.id+'"'));
   const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
   assert.ok(html.includes(escape(row.text[lg])));
  }
 }
}
assert.equal(links,21);
for(const id of ["AO.SM.B059","AO.SM.B090","AO.SM.B040","AO.SM.B077"]){
 const owner=catalog.byBlock.get(id);
 const html=massExplorerMomentHtml(catalog,owner.key,{blockId:id});
 assert.doesNotMatch(html,/data-ao-mx-anchor="meaning"/);
}
assert.match(massExplorerCss(),/aoMXPrayerMeaning/);
const real=readFileSync(new URL("../src/learn/mass-explorer.js",import.meta.url),"utf8");
const sourced=readFileSync(new URL("../src/learn/mass-explorer-published-prayer-context.js",import.meta.url),"utf8");
assert.doesNotMatch(real+sourced,/mass-formation-roman-canon-reading-pilot|mass-explorer-remaining-six-release-candidates|mass-formation-canon-deep-exemplar/);
console.log("PASS live Mass Explorer in-place explanations: 19 exact published-prayer blocks, 21 certified P1 claim edges, 32 Guide moments, 96 original Sung blocks, no P2 research imports.");
