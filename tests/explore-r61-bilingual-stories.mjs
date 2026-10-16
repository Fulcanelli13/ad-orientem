import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,explorePlaceProfile} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const batch=read("data/shrines/research/explore-r61-bilingual-story-batch.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const source=read("data/shrines/source-registry.v1.json");
const sourceDrift=read("data/shrines/research/holywell-source-url-drift-20261016.v1.json");
const approvedDrift=new Map(sourceDrift.records.map(x=>[x.source_id,x]));
const geography=read("data/geography/seed-registry.v1.json");
const featured=read("data/geography/major-places-editorial.v1.json");
const novenaSot=read("data/pray/novena-sot.v1.json");
const novenaBridge=read("data/customs/novena-context-links.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const customSources=read("data/customs/source-registry.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");

assert.equal(batch.schema,"AO_EXPLORE_R61_BILINGUAL_STORY_BATCH_V1");
assert.equal(batch.items.length,50);
assert.equal(batch.release.newShrinesFrench,50);
assert.equal(batch.release.newPilgrimageFrench,70);
assert.equal(batch.release.featuredMenuAdditions,0);
assert.ok(shrines.shrines.length>=216);
assert.ok(shrines.pilgrimages.length>=206);
assert.equal(featured.items.length,20,"R61 must not crowd the featured discovery menu");
const featuredSet=new Set(featured.items.map(x=>x.place_id));
const sourceMap=new Map(source.sources.map(s=>[s.id,s]));
const shrineMap=new Map(shrines.shrines.map(s=>[s.shrine_id,s]));
const pilgrimageMap=new Map(shrines.pilgrimages.map(p=>[p.pilgrimage_id,p]));
const byPlace=new Map(geography.places.map(place=>[place.place_id,place]));
const selected=new Set(batch.items.map(x=>x.place_id));
assert.equal(selected.size,50);
let translations=0;
for(const row of batch.items){
  assert.ok(byPlace.has(row.place_id),"Unresolved physical Place "+row.place_id);
  assert.ok(!featuredSet.has(row.place_id),"R61 must not replace original 20");
  const shrine=shrineMap.get(row.shrine_id);
  assert.equal(shrine?.place_id,row.place_id);
  assert.ok(shrine.origin_summary_fr?.length>=38);
  assert.ok(shrine.origin_summary?.length>=35);
  assert.notEqual(shrine.origin_summary_fr,shrine.origin_summary);
  assert.ok(row.pilgrimage_ids.length>=1);
  assert.ok(shrine.source_ids.every(k=>sourceMap.get(k)?.url?.startsWith("https://")),
    "Every story requires its original shrine source "+row.place_id);
  for(const pId of row.pilgrimage_ids){
    const p=pilgrimageMap.get(pId);
    assert.equal(p?.destination_shrine_id,row.shrine_id);
    assert.ok(p.scope_note_fr?.length>=30);
    assert.notEqual(p.scope_note_fr,p.scope_note);
    assert.ok(p.source_ids.every(k=>sourceMap.get(k)?.url?.startsWith("https://")),
      "Every pilgrim passage must retain independently cited source "+row.place_id);
    translations++;
  }
  assert.ok(row.original_sources.length>=1);
  assert.ok(row.original_sources.every(original=>{
    const live=sourceMap.get(original.source_id),change=approvedDrift.get(original.source_id);
    if(!live)return false;
    if(original.url===live.url)return true;
    // Original R61 research URL is immutable historical evidence. A verified
    // source-domain replacement must be explicit in the owner drift ledger.
    return Boolean(change&&change.historical_url===original.url&&
      change.replacement_url===live.url&&
      new URL(live.url).hostname===sourceDrift.current_official_domain);
  }),"Archived R61 source URLs must equal current registry or have an exact source-owner drift record");
}
assert.equal(translations,70);

const dataset={
  directory:{records:[],communities:[]},
  geography:{places:geography.places,geoAreas:geography.geoAreas,directoryPlaceLinks:geography.directoryPlaceLinks},
  shrines:{shrines:shrines.shrines,pilgrimages:shrines.pilgrimages,routes:shrines.routes,
    temporalLinks:shrines.temporalLinks,sources:source.sources},
  customs:{customs:customs.customs,attestations:customs.attestations,sources:customSources.sources},
  sacredPhenomena:phenomena,
  novenas:{records:novenaSot.novenas,links:novenaBridge.links,sources:novenaBridge.sources},
  editorial:{featured:featured.items}
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-11"});
assert.equal(profiles.length,geography.places.length);
assert.ok(projection.byLens.shrines.length>=216);
assert.ok(projection.byLens.pilgrimages.length>=206);
for(const row of batch.items){
  const profile=explorePlaceProfile(profiles,row.place_id);
  assert.ok(profile,"Missing source-owned Place profile");
  assert.equal(profile.editorial_feature,null,"R61 must not enter featured 20-menu");
  const stories=profile.story_chapters;
  assert.ok(stories.length>=2,"R61 physical site needs two source-owned chapters "+row.place_id);
  assert.equal(stories[0].kind,"ORIGIN","Opening must be a supported Shrine claim");
  assert.equal(stories.filter(ch=>ch.kind==="PILGRIMAGE").length,Math.min(3,row.pilgrimage_ids.length));
  for(const ch of stories){
    assert.ok(ch.body_fr?.length>25&&ch.body_en?.length>25);
    assert.notEqual(ch.body_fr,ch.body_en);
    assert.ok(ch.sources.length>0,"Uncited user-facing paragraph "+row.place_id);
    const owner=[...profile.shrines,...profile.pilgrimages,...profile.relics,
      ...profile.apparitions,...profile.traditions].find(item=>item.item_id===ch.item_id);
    assert.ok(owner,"Cross-Place narrative joined by proximity "+row.place_id);
    assert.ok(ch.sources.every(e=>owner.source_links.some(source=>source.url===e.url)),
      "Source must belong to exact original record "+row.place_id);
  }
}

const pairs=[
 ["place:FR:pontmain","apparition de 1871","Pèlerinage annuel du 17 janvier"],
 ["place:IE:lough-derg-station-island","pèlerinage pénitentiel","pieds nus"],
 ["place:DE:bettbrunn-st-salvator","pèlerinage eucharistique","Grand pèlerinage annuel des hommes"],
 ["place:NG:nne-enyemaka-umuaka","Fraternité sacerdotale Saint-Pierre","processions du rosaire"],
 ["place:CA:notre-dame-du-cap","Cap-de-la-Madeleine","neuvaine de l'Assomption"]
];
for(const [placeId,origin,pilgrim] of pairs){
 const profile=explorePlaceProfile(profiles,placeId);
 const html=renderExploreToString(buildExploreViewModel({
   language:"fr",lens:"heritage",view:"map",items:projection.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:placeId,expandPlace:true
 }));
 assert.match(html,/aoExploreSourcedStory/);
 assert.match(html,/aoExplorePlaceChapters/,"Nonfeatured source-complete site needs reader navigation");
 const visibleText=html.replace(/&#039;|&#39;/g,"'").replace(/&amp;/g,"&");
 assert.ok(visibleText.includes(origin),"Expected source-owned French site introduction "+placeId);
 assert.ok(visibleText.includes(pilgrim),"Expected source-owned French pilgrimage witness "+placeId);
 assert.match(html,/aoExploreStoryEvidence/);
 assert.match(html,/Sources de ce paragraphe/);
 assert.match(html,/data-explore-place-jump="sources"/);
}
// Source completeness alone must not synthesize a Mass venue or promote an
// unexplained physical pin into the editorial discovery menu.
const lough=explorePlaceProfile(profiles,"place:IE:lough-derg-station-island");
assert.equal(lough.exact_tlm_link_state,"NONE");
assert.equal(lough.editorial_feature,null);
const untranslated=shrines.shrines.filter(s=>!s.origin_summary_fr);
assert.ok(untranslated.length<=108,"Later sourced French batches must preserve or improve R61 coverage");
assert.ok(untranslated.every(s=>!selected.has(s.place_id)));

console.log("PASS Explore R61: 50 bilingual sourced Places, 70 canonical pilgrim passages, 20 featured unchanged; no invented Mass/place joins");
