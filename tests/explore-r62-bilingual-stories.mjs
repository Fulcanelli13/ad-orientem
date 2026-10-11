import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,explorePlaceProfile} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const batch=read("data/shrines/research/explore-r62-bilingual-story-batch.v1.json");
const seed=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const featured=read("data/geography/major-places-editorial.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const customsSources=read("data/customs/source-registry.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const novenas=read("data/pray/novena-sot.v1.json");
const novenaBridge=read("data/customs/novena-context-links.v1.json");
assert.equal(batch.schema,"AO_EXPLORE_R62_BILINGUAL_STORY_BATCH_V1");
assert.equal(batch.items.length,50);
assert.equal(batch.release.newShrinesFrench,50);
assert.equal(batch.release.newPilgrimageFrench,54);
assert.equal(batch.release.featuredMenuAdditions,0);
assert.equal(seed.shrines.length,216);
assert.equal(seed.pilgrimages.length,206);
assert.equal(seed.shrines.filter(s=>!!s.origin_summary_fr).length,158);
assert.equal(seed.pilgrimages.filter(p=>!!p.scope_note_fr).length,148);
assert.equal(featured.items.length,20,"Do not inflate the In Focus feature rail");
const srcMap=new Map(sources.sources.map(s=>[s.id,s]));
const shrineMap=new Map(seed.shrines.map(s=>[s.shrine_id,s]));
const pilMap=new Map(seed.pilgrimages.map(p=>[p.pilgrimage_id,p]));
const places=new Set(geo.places.map(p=>p.place_id));
const featuredSet=new Set(featured.items.map(x=>x.place_id));
const seen=new Set();
let pilgrims=0;
for(const row of batch.items){
 assert.ok(places.has(row.place_id),"Unresolved physical Place "+row.place_id);
 assert.ok(!featuredSet.has(row.place_id),"R62 must not add featured Place "+row.place_id);
 assert.ok(!seen.has(row.place_id),"Duplicate place in batch");
 seen.add(row.place_id);
 const s=shrineMap.get(row.shrine_id);
 assert.equal(s?.place_id,row.place_id);
 assert.ok(s.origin_summary_fr.length>=40&&s.origin_summary.length>=30);
 assert.notEqual(s.origin_summary_fr,s.origin_summary);
 assert.doesNotMatch(s.origin_summary_fr,/l'application|source liée|documenté par une source|messe traditionnelle supposée/i);
 assert.ok(row.pilgrimage_ids.length>=1);
 for(const id of row.pilgrimage_ids){
   const p=pilMap.get(id);
   assert.equal(p?.destination_shrine_id,s.shrine_id,"Wrong pilgrimage owner "+id);
   assert.ok(p.scope_note_fr.length>=40&&p.scope_note.length>=25);
   assert.notEqual(p.scope_note_fr,p.scope_note);
   assert.ok(p.source_ids.every(k=>srcMap.get(k)?.url?.startsWith("https://")),"Missing pilgrimage evidence "+id);
   pilgrims++;
 }
 assert.ok(s.source_ids.every(k=>srcMap.get(k)?.url?.startsWith("https://")),"Missing shrine evidence "+row.shrine_id);
 const expectedSourceIds=new Set([...s.source_ids,...row.pilgrimage_ids.flatMap(id=>pilMap.get(id).source_ids)]);
 assert.equal(row.original_sources.length,expectedSourceIds.size);
 for(const source of row.original_sources){
   assert.ok(expectedSourceIds.has(source.source_id));
   assert.equal(source.url,srcMap.get(source.source_id)?.url,"Misattributed original URL");
 }
}
assert.equal(pilgrims,54);
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:seed.shrines,pilgrimages:seed.pilgrimages,routes:seed.routes,temporalLinks:seed.temporalLinks,sources:sources.sources},
 customs:{customs:customs.customs,attestations:customs.attestations,sources:customsSources.sources},
 sacredPhenomena:phenomena,
 novenas:{records:novenas.novenas,links:novenaBridge.links,sources:novenaBridge.sources},
 editorial:{featured:featured.items}
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-11"});
for(const row of batch.items){
 const profile=explorePlaceProfile(profiles,row.place_id);
 assert.ok(profile,"Missing place reader "+row.place_id);
 assert.equal(profile.editorial_feature,null);
 assert.equal(profile.exact_tlm_link_state==="NONE"||typeof profile.exact_tlm_link_state==="string",true);
 const chapters=profile.story_chapters;
 assert.ok(chapters.length>=2,"Bilingual Place reader missing chapters "+row.place_id);
 assert.equal(chapters[0].kind,"ORIGIN");
 assert.equal(chapters.filter(c=>c.kind==="PILGRIMAGE").length,Math.min(3,row.pilgrimage_ids.length));
 for(const chapter of chapters){
   assert.ok(chapter.body_fr?.length>25 && chapter.body_en?.length>25,"Incomplete bilingual paragraph");
   assert.ok(chapter.sources.length,"No paragraph citations "+row.place_id);
   const exactOwner=[...profile.shrines,...profile.pilgrimages,...profile.relics,
     ...profile.apparitions,...profile.traditions].find(x=>x.item_id===chapter.item_id);
   assert.ok(exactOwner,"Place crossed source owner "+row.place_id);
   assert.ok(chapter.sources.every(s=>exactOwner.source_links.some(e=>e.url===s.url)),
     "Source attribution crossed record "+row.place_id);
 }
}
for(const [placeId,required] of [
 ["place:US:auriesville-martyrs","pèlerinage traditionnel"],
 ["place:PS:holy-sepulchre-jerusalem","franciscains catholiques"],
 ["place:CA:oratoire-saint-joseph-montreal","frère André"],
 ["place:FR:basilique-saint-denys-argenteuil","Sainte Tunique"],
 ["place:DE:aachener-dom-four-textiles","pèlerinage pour 2028"]
]){
 const html=renderExploreToString(buildExploreViewModel({
   language:"fr",lens:"heritage",view:"map",items:projection.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:placeId,expandPlace:true
 }));
 const visible=html.replace(/&#039;|&#39;/g,"'").replace(/&amp;/g,"&");
 assert.ok(visible.includes(required),"Missing site-specific FR reader text "+placeId);
 assert.match(html,/aoExplorePlaceChapters/);
 assert.match(html,/aoExploreStoryEvidence/);
 assert.match(html,/Sources de ce paragraphe/);
}
assert.equal(seed.shrines.filter(s=>!s.origin_summary_fr).length,58,"Do not invent text for remaining unsupported records");
console.log("PASS Explore R62: 50 source-owned bilingual Places, 54 pilgrimage accounts, 20 featured unchanged");
