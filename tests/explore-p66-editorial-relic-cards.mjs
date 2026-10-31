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
assert.equal(relics.relics.length,127,"The original 122 records plus five source-backed later site holdings");
assert.equal(new Set(relics.relics.map(x=>x.place_id)).size,97);
assert.ok(profiles.length>=516);
const perelaval=profile("place:MU:pere-laval-sainte-croix");
assert.ok(perelaval,"The canonical Père Laval shrine must exist");
assert.ok(perelaval.sacred_treasures.some(x=>x.id==="relic:MU:jacques-desire-laval-sainte-croix"),
 "Source-attested Père Laval tomb must be linked to exactly the correct Sainte-Croix Place");
const lavalRecord=relics.relics.find(x=>x.id==="relic:MU:jacques-desire-laval-sainte-croix");
assert.equal(lavalRecord.source_claim,"LOCATION_AND_VENERATION_ATTESTED");
assert.equal(lavalRecord.authentication,"NOT_INDEPENDENTLY_CERTIFIED_BY_APP");
assert.match(lavalRecord.source_url,/^https:\/\/dioceseportlouis\.org\//);
const newSiteRelics=[
  ["place:IE:st-peters-oliver-plunkett-drogheda","relic:IE:oliver-plunkett-head-drogheda","BODILY_FRAGMENT","www.saintpetersdrogheda.ie"],
  ["place:GB:westminster-cathedral","relic:GB:john-southworth-westminster","BODILY_REMAINS","westminstercathedral.org.uk"],
  ["place:IN:santhome-cathedral-basilica-chennai","relic:IN:thomas-santhome-mylapore","REPUTED_BODILY_REMAINS","santhomechurch.org"],
  ["place:IT:pompei-rosary-shrine","relic:IT:bartolo-longo-pompei","BODILY_REMAINS","www.santuario.it"]
];
for(const [placeId,relicId,kind,host] of newSiteRelics){
 const record=relics.relics.find(r=>r.id===relicId);
 assert.ok(record&&record.place_id===placeId,"Relic must use exactly the custodian's canonical Place");
 assert.equal(record.relic_kind,kind);
 assert.equal(record.authentication,"NOT_INDEPENDENTLY_CERTIFIED_BY_APP");
 assert.equal(record.source_claim,"LOCATION_AND_VENERATION_ATTESTED");
 assert.equal(new URL(record.source_url).hostname,host);
 assert.ok(record.title_en&&record.title_fr&&record.summary_en&&record.summary_fr);
 const page=profile(placeId);
 assert.ok(page?.sacred_treasures.some(r=>r.id===relicId),
   "Place profile must show the sourced relic without new editorial approval");
 const english=render(placeId);
 assert.ok(english.includes('data-sacred-object-id="'+relicId+'"'),
   "Relic object must be present on the existing Place card");
}
const candidateRelicImages=[
 "relic:IE:oliver-plunkett-head-drogheda",
 "relic:GB:john-southworth-westminster",
 "relic:IN:thomas-santhome-mylapore",
 "relic:IT:bartolo-longo-pompei"
];
const gallery=read("data/geography/approved-place-gallery.v1.json");
for(const id of candidateRelicImages){
 const relic=relics.relics.find(x=>x.id===id);
 const c=relic?.photo_candidate;
 assert.equal(c?.status,"COMMONS_SOURCE_CANDIDATE_NOT_APPROVED");
 assert.ok(c.source_page.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.ok(c.commons_title.startsWith("File:"));
 assert.ok(c.author_claim&&c.licence_claim&&c.subject_note);
 assert.equal(c.rights_verified,false);
 assert.equal(c.original_bytes_verified,false);
 assert.equal(c.editorial_approved,false);
 assert.equal(c.published,false);
 assert.ok(!gallery.items.some(x=>x.subject_relic_id===id),
  "A researched relic image must not quietly become approved gallery media");
}
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
assert.ok(!renderPlaceSacredTreasures(notre,"fr").includes("Lieu de conservation ou de vénération décrit par la source citée"),
  "new editorial relic cards must not repeat the generic French placeholder");

const paray=profile("place:FR:sanctuaire-sacre-coeur-paray");
assert.ok(paray.editorial_intro,"existing published place story must not be rewritten");
assert.ok(paray.sacred_treasures.some(x=>x.id==="relic:FR:margaret-mary-paray"));
assert.ok(paray.site_customs.some(x=>x.id==="DOM-006"));
const parayHtml=render(paray.place_id);
assert.ok(parayHtml.includes("aoExploreEditorialOpening"));

// The published guide supplies the same original paragraph used as the opening.
// Preserve it once, not twice on the same expanded Place page.
const encodeText=value=>String(value).replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
})[c]);
const openingEnglish=encodeText(paray.editorial_intro.introduction.en);
assert.equal(parayHtml.split(openingEnglish).length-1,1,
  "The shared sourced sanctuary opening must not repeat inside the full guide");
const frenchOnce=render(paray.place_id,"fr");
const openingFrench=encodeText(paray.editorial_intro.introduction.fr);
assert.equal(frenchOnce.split(openingFrench).length-1,1,
  "French must not duplicate the original source paragraph either");

assert.ok(parayHtml.includes("aoExplorePlaceCustoms"));
assert.ok(parayHtml.includes("Family consecration"));
assert.ok(parayHtml.includes('data-explore-place-jump="treasures"'));
assert.ok(parayHtml.includes('data-explore-place-jump="customs"'));
assert.ok(!parayHtml.includes("Read Saint biography"),"Saints editorial review stays held");

const openingPosition=parayHtml.indexOf('class="aoExploreEditorialOpening"');
const treasuresPosition=parayHtml.indexOf('data-explore-place-chapter="treasures"');
const storyContinuation=parayHtml.indexOf('class="aoExplorePlaceOpening aoExploreSourcedStory"');
assert(openingPosition>=0&&treasuresPosition>openingPosition,
  "Sourced sacred objects must follow the established sanctuary introduction");
if(storyContinuation>=0)assert(treasuresPosition<storyContinuation,
  "Sacred objects should precede the long sourced historical continuation");
assert.equal((parayHtml.match(/data-explore-place-chapter="story"/g)||[]).length,1,
  "An illustrated Place must not emit duplicate jump anchors");
assert.ok(!parayHtml.includes("TLM AT THIS EXACT PLACE"),
  "A shrine without an exact Mass Directory link must not display an empty TLM accordion");
const parayFrench=render(paray.place_id,"fr");
assert.ok(parayFrench.includes('data-explore-place-chapter="treasures"'));
assert.ok(parayFrench.includes("HISTOIRE ET DÉVOTION")||!parayFrench.includes("aoExploreSourcedStory"),
  "French chapter continuation must retain French heading");
const linkedJourney=renderExploreToString(buildExploreViewModel({
  language:"en",lens:"heritage",view:"map",items:projection.byLens.shrines,
  filters:{heritageCategories:[]},selectedPlaceId:paray.place_id,
  placeProfiles:profiles,expandPlace:true,journeys:[{
    id:"test-sourced-route",name:"Sourced journey fixture",edition:"test",
    destinationPlaceId:paray.place_id,destinationRelation:"DESTINATION_PLACE",
    sources:[{url:"https://example.org/source"}],namedStages:[]
  }]
}));
assert.ok(linkedJourney.includes('data-explore-place-jump="journeys"'),
  "Sourced journeys need a visible chapter shortcut");
assert.ok(linkedJourney.includes('data-explore-place-chapter="journeys"'),
  "The journey shortcut must have a destination");
assert.ok(linkedJourney.indexOf('data-explore-place-chapter="journeys"')>
          linkedJourney.indexOf('data-explore-place-chapter="guide"'),
  "Journeys must not precede the sanctuary story or the published guide");


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

