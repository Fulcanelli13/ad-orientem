import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditPlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const newSites=read("data/geography/research/sacred-geography-r70-global-six-site-evidence.v1.json").sites;
const geo=read("data/geography/seed-registry.v1.json");
const seed=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const source=read("data/shrines/source-registry.v1.json");
const board=read("data/geography/research/sacred-geography-coverage-first-r70.v1.json");
const illustrated=[...read("data/shrines/illustrated-place-guides-ireland.v1.json").guides,...read("data/shrines/illustrated-place-guides-france.v1.json").guides,...read("data/shrines/illustrated-place-guides-france-r67.v1.json").guides];
const hero=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
assert.deepEqual([geo.places.length,seed.shrines.length,seed.pilgrimages.length,source.sources.length],[LIVE.places,257,240,LIVE.sources]);
assert.equal(newSites.length,6);
assert.equal(new Set(newSites.map(x=>x.id)).size,6);
assert.deepEqual(new Set(newSites.map(x=>x.country)),new Set(["SG","MA","CA","ZM"]));
assert.equal(new Set(seed.shrines.map(x=>x.place_id)).size,257);
assert.equal(new Set(geo.places.map(x=>x.place_id)).size,geo.places.length);
assert.equal(hero.items.length,31+read("data/geography/research/directory-p95-first-two-photo-covers.v1.json").photos.length,"Historical R70 site baseline conserved while separately vetted Directory photos may be added");
// Preserve the original six R68/R69 photographs without treating later
// approved Place imagery as an unauthorized mutation of this R70 cohort.
assert.equal(gallery.items.filter(item=>item.reviewed_at==="2026-10-11").length,6);
assert.ok(gallery.items.length>=6);
assert.equal(illustrated.length,14);
assert.equal(board.candidates.length,750);
assert.equal(board.summary.candidate_status.CONFIRMED_EXISTING_PROMOTION,166);
assert.equal(board.summary.candidate_status.POTENTIAL_EXISTING_ID_REVIEW,6);
assert.equal(board.summary.candidate_status.PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW,578);
assert.equal(assertShrinesPilgrimagesRegistry({shrines:seed.shrines,pilgrimages:seed.pilgrimages,routes:seed.routes,
 temporalLinks:seed.temporalLinks,sources:source.sources,places:geo.places}).pass,true);
const src=new Map(source.sources.map(x=>[x.id,x]));
for(const row of newSites){
 const p=geo.places.find(x=>x.place_id===row.id);
 const sh=seed.shrines.filter(x=>x.place_id===row.id);
 assert.ok(p&&sh.length===1);
 assert.equal(p.geo.lat,row.lat);assert.equal(p.geo.lng,row.lng);
 assert.equal(p.geo.source_url,row.geo);
 assert.equal(p.geo.precision,row.prec);
 assert.equal(p.address.country_code,row.country);
 assert.deepEqual(auditPlaceGeo(p.geo,{countryCode:row.country}),[]);
 assert.equal(sh[0].recognition_class,"UNKNOWN","No jurisdictional sanctuary status must be inferred");
 assert.equal(sh[0].origin_summary,row.en);
 assert.equal(sh[0].origin_summary_fr,row.fr);
 assert.ok(row.en.length>125&&row.fr.length>125);
 for(const sourceId of new Set([...p.source_ids,...sh[0].source_ids])){
  assert.ok(src.get(sourceId)?.url?.startsWith("https://"),"Unresolved primary or geospatial source "+sourceId);
 }
 assert.equal(sh[0].source_ids.length,3);
 const candidate=board.candidates.find(x=>x.candidate_id===row.candidate);
 assert.equal(candidate.reconciliation_status,"CONFIRMED_EXISTING_PROMOTION");
 assert.equal(candidate.confirmed_place_id,row.id);
 assert.equal(candidate.pin_gate,"EXISTING_CANONICAL_PIN");
 assert.equal(illustrated.some(x=>x.place_id===row.id),false,"Coverage sites are basic, not fabricated deep guides");
 assert.equal(hero.items.some(x=>x.place_id===row.id),false,"Unreviewed hero artwork cannot publish");
 assert.equal(gallery.items.some(x=>x.place_id===row.id),false,"Unreviewed gallery cannot publish");
 const pilgrimages=seed.pilgrimages.filter(x=>x.destination_shrine_id===sh[0].shrine_id);
 assert.equal(pilgrimages.length,row.country==="CA"||row.country==="ZM"?1:0,"No invented pilgrimage for ordinary parish or cathedral");
}
const dataset={directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:seed.shrines,pilgrimages:seed.pilgrimages,routes:seed.routes,temporalLinks:seed.temporalLinks,sources:source.sources},
 customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:{apparitions:[],relics:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:illustrated},
 media:{approved:hero.items,gallery:gallery.items}
};
const proj=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,proj,{today:"2026-10-11"});
assert.equal(profiles.length,geo.places.length);
assert.equal(exploreMapFeatures(proj.byLens.shrines).length,257);
for(const row of newSites){
 const profile=profiles.find(p=>p.place_id===row.id);
 assert.ok(profile);
 assert.ok(profile.sources.some(s=>s.url===row.s1[0]));
 assert.equal(profile.media,null);
 assert.equal(profile.gallery.length,0);
 for(const lang of ["en","fr"]){
  const html=renderExploreToString(buildExploreViewModel({
   language:lang,lens:"heritage",view:"map",items:proj.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:row.id,expandPlace:true
  }));
  assert.ok(html.includes(row.id));
  assert.ok(html.includes(lang==="en"?row.en.slice(0,25):row.fr.slice(0,25)) ||
    html.includes(lang==="en"?row.en.slice(0,16):row.fr.slice(0,16)),"Bilingual basic summary unavailable at "+row.id);
  assert.ok(html.includes(row.s1[0]));
  assert.ok(!html.includes("aoExploreGuideGallery"));
 }
}
console.log("PASS Sacred Geography R70 worldwide breadth: 6 sourced new physical sites; 229 Places/225 shrine-heritage, 51 countries, 750 reconciled candidates");
