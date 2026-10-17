import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";
import {verifiedMassExplorerPrayerReadings,MASS_EXPLORER_PRAYER_READINGS_VERSION} from "../src/learn/mass-explorer-prayer-readings.js";
const data=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const source=data("data/presentation/reader-text-sung.v1.json");
const guides=data("data/presentation/guide-registry.v1.json");
const french=data("data/presentation/reader-french-ordinary.v1.json");
const formation=data("data/learn/mass-formation-campion.v1.json");
const readings=data("data/learn/mass-explorer-prayer-readings.v1.json");
assert.equal(readings.schema,MASS_EXPLORER_PRAYER_READINGS_VERSION);
assert.equal(readings.scope,"EXPLORER_ONLY");
assert.equal(readings.status,"EDUCATIONAL_SOURCE_READING");
assert.equal(readings.entries.length,84);
assert.deepEqual(readings.counts,{before_offertory:23,offertory:8,orate_preface:6,canon:15,communion:23,conclusion:9});
const catalog=buildMassExplorerCatalog(guides,source,french,formation,readings);
assert.equal(catalog.byBlock.size,96);
assert.equal(catalog.sequence.length,32);
assert.equal(catalog.formationStages.length,8);
assert.equal(catalog.publishedPrayerContextByBlock.size,19);
assert.equal(catalog.explanatoryReadingByBlock.size,84);
assert.equal(buildMassExplorerCatalog(guides,source,french,formation,null).explanatoryReadingByBlock.size,0,
 "Explorer must still render canonical original text without optional reading file");
let count=0;
for(const r of readings.entries){
 const owner=catalog.byBlock.get(r.block_id);
 assert.equal(owner?.key,r.moment_id,"Canonical source/Guide mismatch "+r.block_id);
 const entry=catalog.explanatoryReadingByBlock.get(r.block_id);
 assert.equal(entry?.relation,"DIRECT_DESCRIPTION_OF_SOURCE_TEXT");
 for(const [fr,lang] of [[false,"en"],[true,"fr"]]){
  const html=massExplorerMomentHtml(catalog,owner.key,{blockId:r.block_id,french:fr});
  assert.ok(html.includes('data-ao-mx-text-reading="'+r.block_id+'"'),"Missing bilingual reading "+r.block_id+" "+lang);
  assert.ok(html.includes('data-ao-mx-anchor="meaning"'));
  assert.ok(html.includes('data-ao-mx-jump="meaning"'));
  assert.ok(html.includes('data-ao-mx-cue='),"Source words missing "+r.block_id);
  assert.ok(html.includes('id="ao-mx-guide"'),"Original Guide omitted "+r.block_id);
  assert.ok(html.includes(fr?"Comprendre cette prière":"Understand this prayer"));
  assert.ok(html.includes(r.title[lang].replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")));
  if(r.conditionality&&!["STANDARD_FIXED",null].includes(r.conditionality))
   assert.ok(html.includes('data-ao-mx-conditional="'+r.conditionality+'"'));
  count++;
 }
}
assert.equal(count,168);
for(const id of ["AO.SM.B014","AO.SM.B019","AO.SM.B020","AO.SM.B026","AO.SM.B030","AO.SM.B040","AO.SM.B045","AO.SM.B085","AO.SM.B088","AO.SM.B096"]){
 const owner=catalog.byBlock.get(id);
 const html=massExplorerMomentHtml(catalog,owner.key,{blockId:id});
 assert.doesNotMatch(html,/data-ao-mx-text-reading=/,"Variable Proper/non-prayer block must have no substituted summary "+id);
}
for(const id of ["AO.SM.B077","AO.SM.B078","AO.SM.B079"]){
 const record=catalog.explanatoryReadingByBlock.get(id);
 assert.equal(record.sourceStatus,"LOCAL_CUSTOM_PRE1960_SURVIVAL");
 assert.equal(record.conditionality,"OPTIONAL_LOCAL_OLDER_CUSTOM");
 const html=massExplorerMomentHtml(catalog,catalog.byBlock.get(id).key,{blockId:id});
 assert.ok(html.includes("not a universal 1962 requirement"),id+" must not be misrepresented as normative");
}
assert.ok(massExplorerMomentHtml(catalog,catalog.byBlock.get("AO.SM.B025").key,{blockId:"AO.SM.B025"}).includes("not the Gospel appointed for every day"));
assert.ok(massExplorerMomentHtml(catalog,catalog.byBlock.get("AO.SM.B095").key,{blockId:"AO.SM.B095"}).includes("not prescribed in every circumstance"));
assert.ok(massExplorerMomentHtml(catalog,catalog.byBlock.get("AO.SM.B003").key,{blockId:"AO.SM.B003"}).includes("omitted when the rubrics require"));
assert.ok(massExplorerMomentHtml(catalog,catalog.byBlock.get("AO.SM.B046").key,{blockId:"AO.SM.B046"}).includes("Holy, Holy, Holy"));
for(const id of ["AO.SM.B031","AO.SM.B039","AO.SM.B047","AO.SM.B052","AO.SM.B055","AO.SM.B057","AO.SM.B074","AO.SM.B076","AO.SM.B081","AO.SM.B082","AO.SM.B086","AO.SM.B087"]){
 const owner=catalog.byBlock.get(id);
 const html=massExplorerMomentHtml(catalog,owner.key,{blockId:id});
 assert.ok(html.includes('data-ao-mx-published-claim='),id+" must retain released doctrinal context");
 assert.equal((html.match(/data-ao-mx-anchor="meaning"/g)||[]).length,1,"Two duplicate Understand panels: "+id);
}
const bad=[
 c=>{c.status="EDITORIAL_DRAFT_NOT_RELEASED";},
 c=>{c.entries.pop();},
 c=>{c.entries[0].block_id="AO.SM.B014";},
 c=>{c.entries[0].text_anchor_en="word not present in the Roman Missal here";},
 c=>{c.entries[0].reading.fr="";},
 c=>{c.entries[0].moment_id="AO.CARD.029";},
 c=>{c.entries[0].family="unknown";},
 c=>{c.entries[0].source_status="LOCAL_CUSTOM_PRE1960_SURVIVAL";},
 c=>{c.entries[0].conditionality="OPTIONAL_LOCAL_OLDER_CUSTOM";},
 c=>{c.entries[1].block_id=c.entries[0].block_id;},
 c=>{c.entries.find(x=>x.block_id==="AO.SM.B077").conditionality="STANDARD_FIXED";}
];
for(const [i,mutate] of bad.entries()){
 const test=structuredClone(readings);mutate(test);
 assert.equal(verifiedMassExplorerPrayerReadings(test,catalog).size,0,"Bad registry must fail closed "+i);
}
const ritual=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
const module=readFileSync(new URL("../src/learn/mass-explorer.js",import.meta.url),"utf8");
assert.ok(!ritual.includes("mass-explorer-prayer-readings"));
assert.ok(!module.includes("mass-formation-canon-deep-exemplar"));
assert.ok(!module.includes("mass-explorer-remaining-six-release-candidates"));
console.log("PASS Mass Explorer: 84/84 bilingual prayer readings, 84 canonical text anchors, 168 render checks, 19 P1 doctrinal panels preserved, all 96 original source blocks, 32 Guide moments; conditional branches distinguished and original ritual reader untouched.");
