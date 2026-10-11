import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,explorePlaceProfile} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const batch=read("data/shrines/research/explore-r63-source-enrichment-batch.v1.json");
const seed=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const source=read("data/shrines/source-registry.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const featured=read("data/geography/major-places-editorial.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const customsSources=read("data/customs/source-registry.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const novenas=read("data/pray/novena-sot.v1.json");
const novenaBridge=read("data/customs/novena-context-links.v1.json");

assert.equal(batch.schema,"AO_EXPLORE_R63_SOURCE_ENRICHED_STORIES_V1");
assert.equal(batch.items.length,58);
assert.equal(batch.release.rewrittenOriginsEnglish,58);
assert.equal(batch.release.rewrittenOriginsFrench,58);
assert.equal(batch.release.rewrittenPilgrimagesEnglish,58);
assert.equal(batch.release.rewrittenPilgrimagesFrench,58);
assert.equal(batch.release.newOriginalSourceUrls,6);
assert.equal(seed.shrines.length,216);
assert.equal(seed.pilgrimages.length,206);
assert.ok(seed.shrines.every(s=>s.origin_summary_fr?.length>=30),"Untranslated shrine in final corpus");
assert.ok(seed.pilgrimages.every(p=>p.scope_note_fr?.length>=30),"Untranslated pilgrimage in final corpus");
assert.equal(featured.items.length,20,"Featured discoverability is strictly curated");
const featuredSet=new Set(featured.items.map(x=>x.place_id));
const src=new Map(source.sources.map(x=>[x.id,x]));
const shrines=new Map(seed.shrines.map(x=>[x.shrine_id,x]));
const pilgrimages=new Map(seed.pilgrimages.map(x=>[x.pilgrimage_id,x]));
const placeIds=new Set(geo.places.map(x=>x.place_id));
const seen=new Set();
const placeholders=/^(documented catholic shrine|source-documented pilgrimage destination|historic catholic sanctuary and documented|historic devotional and reputed relic destination|documented destination pilgrimage or shrine visit|check visiting and veneration arrangements directly)/i;
for(const row of batch.items){
 assert.ok(!seen.has(row.place_id),"Repeated R63 physical place "+row.place_id);seen.add(row.place_id);
 assert.ok(placeIds.has(row.place_id),"Missing canonical Place "+row.place_id);
 assert.ok(!featuredSet.has(row.place_id),"No automatic promotion "+row.place_id);
 const s=shrines.get(row.shrine_id);
 assert.equal(s?.place_id,row.place_id);
 assert.ok(s.origin_summary.length>100&&s.origin_summary_fr.length>100,"Insufficient site narrative "+row.place_id);
 assert.notEqual(s.origin_summary,s.origin_summary_fr);
 assert.doesNotMatch(s.origin_summary,placeholders,"English placeholder survived "+row.place_id);
 assert.doesNotMatch(s.origin_summary_fr,/the linked source|cette application|source liée|aucune affirmation.*application/i);
 assert.equal(row.pilgrimage_ids.length,1,"Current batch has one canonical pilgrimage per Place");
 const ids=new Set([...s.source_ids]);
 for(const pId of row.pilgrimage_ids){
  const p=pilgrimages.get(pId);
  assert.equal(p?.destination_shrine_id,s.shrine_id);
  assert.ok(p.scope_note.length>90&&p.scope_note_fr.length>90,"Thin pilgrimage practice "+row.place_id);
  assert.doesNotMatch(p.scope_note,placeholders,"English generic pilgrimage survived "+pId);
  assert.notEqual(p.scope_note,p.scope_note_fr);
  assert.notEqual(p.scope_note,s.origin_summary,"Site and pilgrim accounts duplicated in English "+pId);
  for(const sid of p.source_ids)ids.add(sid);
 }
 assert.equal(row.source_links.length,ids.size);
 for(const originalSource of row.source_links){
  assert.ok(ids.has(originalSource.source_id));
  assert.ok(src.has(originalSource.source_id),"Missing original source ID");
  assert.equal(originalSource.url,src.get(originalSource.source_id).url,"Wrong source URL for original owner");
  assert.match(originalSource.url,/^https:\/\//);
 }
}
assert.equal(seen.size,58);
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:seed.shrines,pilgrimages:seed.pilgrimages,routes:seed.routes,temporalLinks:seed.temporalLinks,sources:source.sources},
 customs:{customs:customs.customs,attestations:customs.attestations,sources:customsSources.sources},
 sacredPhenomena:phenomena,
 novenas:{records:novenas.novenas,links:novenaBridge.links,sources:novenaBridge.sources},
 editorial:{featured:featured.items}
};
const projection=projectExploreDataset(dataset);
assert.equal(projection.byLens.shrines.length,216);
assert.equal(projection.byLens.pilgrimages.length,206);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-11"});
assert.equal(profiles.length,geo.places.length);
for(const row of batch.items){
 const profile=explorePlaceProfile(profiles,row.place_id);
 assert.ok(profile,"Missing current Place "+row.place_id);
 assert.equal(profile.editorial_feature,null);
 const chapters=profile.story_chapters;
 assert.ok(chapters.length>=2,"Not a fully sourced bilingual Place "+row.place_id);
 assert.equal(chapters[0].kind,"ORIGIN");
 assert.equal(chapters.filter(c=>c.kind==="PILGRIMAGE").length,1);
 for(const chapter of chapters){
  assert.ok(chapter.body_en.length>30&&chapter.body_fr.length>30);
  assert.ok(chapter.sources.length,"Missing reader paragraph evidence "+row.place_id);
  const owner=[...profile.shrines,...profile.pilgrimages,...profile.relics,...profile.apparitions,...profile.traditions]
   .find(x=>x.item_id===chapter.item_id);
  assert.ok(owner,"Story borrowed neighbouring Place "+row.place_id);
  assert.ok(chapter.sources.every(s=>owner.source_links.some(x=>x.url===s.url)),"Wrong source owner "+row.place_id);
 }
}
for(const [placeId,phrase] of [
 ["place:BE:sanctuaire-sainte-julienne-cornillon","Fête-Dieu"],
 ["place:FR:cathedrale-notre-dame-le-puy","Compostelle"],
 ["place:FR:saint-joseph-bessillon","Bessillon"],
 ["place:IT:scala-santa-rome","Scala Santa"],
 ["place:GB:westminster-abbey-st-edward","anglican"],
 ["place:GR:saint-titus-heraklion","orthodoxe"],
 ["place:IT:montecassino-abbey","Mont-Cassin"]
]){
 const html=renderExploreToString(buildExploreViewModel({
  language:"fr",lens:"heritage",view:"map",items:projection.byLens.shrines,
  filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
  placeProfiles:profiles,selectedPlaceId:placeId,expandPlace:true
 }));
 const visible=html.replace(/&#039;|&#39;/g,"'").replace(/&amp;/g,"&");
 assert.ok(visible.includes(phrase),"Reader lacks specific French evidence "+placeId);
 assert.match(html,/aoExplorePlaceChapters/);
 assert.match(html,/aoExploreStoryEvidence/);
 assert.match(html,/Sources de ce paragraphe/);
}
const westminster=explorePlaceProfile(profiles,"place:GB:westminster-abbey-st-edward");
const titus=explorePlaceProfile(profiles,"place:GR:saint-titus-heraklion");
assert.equal(westminster.exact_tlm_link_state,"NONE");
assert.equal(titus.exact_tlm_link_state,"NONE");
console.log("PASS Explore R63: all 216 shrine and 206 pilgrimage narratives bilingual; 58 placeholder pairs replaced and source-owned");
