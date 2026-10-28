import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {renderPlaceEditorialOpening,renderPlaceSacredTreasures,renderPlaceCustoms}
  from "../src/find/place-editorial-presentation.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const sources=read("data/shrines/source-registry.v1.json");
const g=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const relics=read("data/explore/sacred-phenomena-seed.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const saints=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const guidePaths=[
  "france","france-r67","ireland","world-marian-r1","global-saints-r1","global-marian-b2"
].map(x=>"data/shrines/illustrated-place-guides-"+x+".v1.json");
const placeGuides=guidePaths.flatMap(path=>read(path).guides);
const dataset={
  directory:{records:[],communities:[]},
  geography:{places:g.places,geoAreas:g.geoAreas,directoryPlaceLinks:g.directoryPlaceLinks},
  shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,
    temporalLinks:shr.temporalLinks,sources:sources.sources},
  customs:{customs:customs.customs,attestations:customs.attestations,sources:[]},
  sacredPhenomena:{relics:relics.relics,apparitions:relics.apparitions},
  saints, novenas:{records:[],links:[],sources:[]},
  editorial:{featured:[],placeGuides},
  media:{approved:read("data/geography/approved-place-media.v1.json").items,
    gallery:read("data/geography/approved-place-gallery.v1.json").items},
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-29"});
const profile=id=>profiles.find(x=>x.place_id===id);
const render=(id,language="en")=>renderExploreToString(buildExploreViewModel({
  language,lens:"heritage",view:"map",items:projection.byLens.shrines,
  filters:{heritageCategories:[]},
  selectedPlaceId:id,placeProfiles:profiles,expandPlace:true,
}));
assert.equal(relics.relics.length,122,"source-count change requires review");
assert.equal(new Set(relics.relics.map(x=>x.place_id)).size,92);
assert.ok(profiles.length>=516);
const notre=profile("place:FR:notre-dame-paris");
const notreHtml=render(notre.place_id);
assert.equal(notre.sacred_treasures.length,3);
for(const id of ["relic:FR:crown-of-thorns-paris","relic:FR:cross-paris","relic:FR:holy-nail-paris"]){
 assert.ok(notre.sacred_treasures.some(x=>x.id===id));
 assert.ok(notreHtml.includes('data-sacred-object-id="'+id+'"'));
}
assert.ok(notreHtml.includes("Sacred treasures"));
assert.ok(notreHtml.includes("Custody source"));
assert.ok(notreHtml.includes("precise indoor position"));
assert.ok(notreHtml.includes("data-explore-place-item="));
assert.ok(!notreHtml.includes("Authenticity verified"));
assert.ok(!notreHtml.includes("Read Saint biography"));
assert.ok(!notreHtml.includes('data-explore-place-chapter="customs"'));
assert.ok(!notreHtml.includes("RELICS & CUSTODY · 3"),"source records must not be duplicated");
const french=render(notre.place_id,"fr");
assert.ok(french.includes("Trésors sacrés"));
assert.ok(french.includes("Sainte Couronne"));
assert.ok(french.includes("Source de conservation"));
assert.ok(french.includes("exposition au public"));
assert.ok(!french.includes("Lieu de conservation ou de vénération décrit par la source citée"));

const paray=profile("place:FR:sanctuaire-sacre-coeur-paray");
assert.ok(paray.editorial_intro,"existing published place story must not be rewritten");
assert.ok(paray.sacred_treasures.some(x=>x.id==="relic:FR:margaret-mary-paray"));
assert.ok(paray.site_customs.some(x=>x.id==="DOM-006"));
const parayHtml=render(paray.place_id);
assert.ok(parayHtml.includes("aoExploreEditorialOpening"));
assert.ok(parayHtml.includes("aoExplorePlaceCustoms"));
assert.ok(parayHtml.includes("Grand"),"PLACE STORY fixture test should verify existing guide section"); // replaced below if guide differs
assert.ok(parayHtml.includes("Family consecration"));
assert.ok(parayHtml.includes('data-explore-place-jump="treasures"'));
assert.ok(parayHtml.includes('data-explore-place-jump="customs"'));
assert.ok(!parayHtml.includes("Read Saint biography"),"Saints editorial review stays held");

const anne=profile("place:FR:sainte-anne-d-auray");
assert.ok(anne.editorial_intro);
assert.ok(!anne.site_customs.some(x=>x.id==="DEV-007"),"CONTEXT_ONLY Grand Pardon not published as Customs");
const chartres=profile("place:FR:chartres-notre-dame");
assert.ok(chartres.editorial_intro);
assert.ok(render(chartres.place_id).includes("aoExploreEditorialOpening"));
assert.ok(render(chartres.place_id,"fr").includes("L’HISTOIRE"));
const lisieux=profile("place:FR:basilique-sainte-therese-lisieux");
assert.ok(!lisieux.sacred_treasures.some(x=>x.id==="relic:FR:therese-carmel"),
  "Carmel relic must not leak into a different physical basilica");
assert.ok(profile("place:FR:carmel-lisieux").sacred_treasures
  .some(x=>x.id==="relic:FR:therese-carmel"));

assert.equal(renderPlaceEditorialOpening({ownership:"EDITORIAL_REVIEW_ONLY"}),"");
assert.equal(renderPlaceSacredTreasures({sacred_treasures:[{
 id:"relic:test",title:{en:"<script>alert(1)</script>",fr:"Test"},
 description:{en:"",fr:""},kind:"BODILY_FRAGMENT",source_url:"https://example.org",
}]}).includes("<script>"),false,"source text must be HTML escaped");
assert.equal(renderPlaceCustoms({site_customs:[]}),"");
assert.ok(!render("place:FR:notre-dame-paris").includes("aoExplorePlaceCustoms"));
assert.ok(render("place:FR:chartres-notre-dame").includes("aoExploreGuideGallery"));
console.log("P66 Places: published stories, bilingual sourced relic cards, published site Customs and distinct physical identities PASS");
