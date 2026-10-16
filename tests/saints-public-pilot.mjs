import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {ACTIVE_SAINTS_CHANNEL,SAINTS_CHANNELS,applySaintsReleaseBoundary} from "../src/find/saints-release-policy.js";
import {projectSaintCatalogueItems} from "../src/find/saints-catalogue.js";
import {projectSaintSourceIndexItems} from "../src/find/saints-source-index.js";
import {projectSaintPlaceItems} from "../src/find/saints-lens.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const path=p=>new URL("../"+p,import.meta.url);
const read=p=>JSON.parse(readFileSync(path(p),"utf8"));
const data={
 saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
 saintsCalendarBridge:read("data/saints/parallel-owner-identity-bridge-20261015.v1.json"),
 geography:{places:read("data/geography/seed-registry.v1.json").places},
 shrines:{shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json").shrines},
};
assert.equal(ACTIVE_SAINTS_CHANNEL,SAINTS_CHANNELS.PILOT_SIX,"Production code must default to six pilot lives");
for(const name of [
 "data/saints/holiness-first-eight-doctors-research-20261015.v1.json",
 "data/saints/holiness-first-sixteen-cross-vocation-research.v1.json",
 "data/saints/read-only-calendar-art-index-20261015.v1.json"
])assert(!existsSync(path(name)),"Uncertified research file copied into public release: "+name);
const dataset=applySaintsReleaseBoundary(data);
assert.equal(dataset.saintsRelease.channel,"PILOT_SIX");
assert.equal(dataset.saintsRelease.researchEnabled,false);
assert.equal(dataset.saintsDoctors,null);
assert.equal(dataset.saintsVocations,null);
assert.equal(dataset.saintsOwnerIndex,null);
assert.equal(dataset.saintsRelease.publicPortraitsApproved,false);
assert.equal(dataset.saintsRelease.allowUncertified1962Mass,false);
const sampleNarratives=new Map();
for(const original of data.saints.people){
  assert.equal(original.publication,"EDITORIAL_REVIEW_ONLY");
  assert.equal(original.biography_facts.length,3);
  for(const lang of ["en","fr"]){
    const paragraphs=[original.why_honoured[lang],...original.biography_facts.map(f=>f[lang])];
    assert(paragraphs.every(Boolean),"Missing substantial bilingual biography text");
    const count=paragraphs.join(" ").trim().split(/\\s+/).length;
    assert(count>=110&&count<=165,"Underdeveloped/overlong Saints profile: "+original.saint_id+" "+lang+" "+count);
    sampleNarratives.set(original.saint_id+":"+lang,count);
  }
  for(const fact of original.biography_facts){
    assert(fact.source_ids.length>0);
    for(const id of fact.source_ids)assert(data.saints.sources[id]?.url?.startsWith("https://"),"Unsourced new biographical claim "+original.saint_id+" "+id);
  }
}
const requiredInstitutionalFurtherReading=new Map([
 ["saint:bernadette-soubirous","www.sainte-bernadette-soubirous-nevers.com"],
 ["saint:margaret-mary-alacoque","www.vaticanstate.va"],
 ["saint:peter-chanel","www.maristfathers.ie"]
]);
const people=projectSaintCatalogueItems(dataset),sites=projectSaintPlaceItems(dataset);
assert.equal(people.length,6,"Exactly six Saints/Blessed in public pilot");
assert.equal(new Set(people.map(x=>x.saint_id)).size,6);
assert.equal(sites.length,9);
assert.equal(sites.filter(x=>x.map_publishable).length,8);
assert(people.every(x=>x.kind==="SAINT_CATALOGUE_PROFILE"&&x.saints.length===1&&x.saints[0].artwork_id===null));
assert(people.some(x=>x.saint_id==="blessed:jacques-desire-laval"));
assert(!people.some(x=>x.saint_id==="saint:thomas-aquinas"));
for(const [id,domain] of requiredInstitutionalFurtherReading){
  const person=people.find(x=>x.saint_id===id)?.saints?.[0];
  assert(person&&person.sources.some(x=>new URL(x.url).hostname===domain),
    "Missing original institutional life source in public Read further: "+id);
}

for(const scope of ["historical","later","doctors"])
 assert.equal(projectSaintSourceIndexItems(dataset,scope).length,0,"Research index exposed: "+scope);
const therese=people.find(x=>x.saint_id==="saint:therese-of-lisieux");
assert.equal(therese.saints[0].calendar_context?.observed1962?.civilDate,"2026-10-03");
for(const lang of ["en","fr"]){
 const vm=buildExploreViewModel({language:lang,view:"list",lens:"saints",items:people,
   saintsRelease:dataset.saintsRelease,filters:{saintScope:"profiles",saintCategory:"ALL"},
   selectedId:therese.item_id});
 const html=renderExploreToString(vm);
 assert(html.includes('data-saint-id="saint:therese-of-lisieux"'));
 assert(html.includes('data-explore-calendar-date="2026-10-03"'));
 assert(html.includes(lang==="fr"?"Six notices pilotes sourcées":"Six source-linked Saints pilot profiles"));
 assert(!html.includes('data-find-filter="saintScope"'));
 assert(!html.includes("24 additional lives"));
 assert(!html.includes('data-saint-crosslink-target="saints:doctor:'));
 assert(!html.includes('data-calendar-mass'));
 for(const [id,domain] of requiredInstitutionalFurtherReading){
  const profile=people.find(x=>x.saint_id===id);
  const details=renderExploreToString(buildExploreViewModel({
    language:lang,view:"list",lens:"saints",items:people,
    saintsRelease:dataset.saintsRelease,filters:{saintScope:"profiles",saintCategory:"ALL"},
    selectedId:profile.item_id
  }));
  assert(details.includes(domain),"Missing genuine research biography in rendered public profile: "+id);
  assert(!details.includes('data-saint-crosslink-target="saints:doctor:'));
 }

}
console.log("PASS six pilot Saints profiles, nine source-owned sites/eight precise pins, absent research JSON, no unapproved artwork or 1962 Mass");
