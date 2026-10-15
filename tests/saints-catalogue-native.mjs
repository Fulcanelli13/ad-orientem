import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectSaintCatalogueItems} from "../src/find/saints-catalogue.js";
import {projectSaintPlaceItems} from "../src/find/saints-lens.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const dataset={
 saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
 saintsDoctors:read("data/saints/holiness-first-eight-doctors-research-20261015.v1.json"),
 saintsVocations:read("data/saints/holiness-first-sixteen-cross-vocation-research.v1.json"),
 saintsCalendarBridge:read("data/saints/parallel-owner-identity-bridge-20261015.v1.json"),
 geography:{places:read("data/geography/seed-registry.v1.json").places},
 shrines:{shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json").shrines}
};
const people=projectSaintCatalogueItems(dataset);
const places=projectSaintPlaceItems(dataset);
assert.equal(people.length,30,"One catalogue card per research person, not per shrine");
assert.equal(places.length,9,"Existing physical Places count may not be expanded by biographies");
assert.equal(places.filter(x=>x.map_publishable).length,8,"Only eight published-precision original pins");
assert.equal(new Set(people.map(x=>x.saint_id)).size,30);
assert(people.every(x=>x.kind==="SAINT_CATALOGUE_PROFILE"&&x.map_publishable===false&&x.geo===null));
assert(people.every(x=>x.saints.length===1&&x.saint_id===x.saints[0].saint_id));
assert(people.every(x=>x.saints[0].artwork_id===null),"No unapproved art assets");
assert(people.every(x=>x.saints[0].why_en&&x.saints[0].why_fr),"English and French must coexist");
assert.equal(people.filter(x=>x.saints[0].editorial_status==="RESEARCH_READER_PREVIEW_ONLY").length,24);
assert.equal(people.filter(x=>x.saints[0].editorial_status!=="RESEARCH_READER_PREVIEW_ONLY").length,6);
assert.deepEqual(people.map(x=>x.title),[...people.map(x=>x.title)].sort((a,b)=>a.localeCompare(b)));
assert(people.find(x=>x.saint_id==="saint:ignatius-antioch").saints[0].life.birth.date_precision==="UNKNOWN");
assert(people.find(x=>x.saint_id==="saint:vincent-de-paul").saints[0].life.birth.date_precision==="CONTESTED_DATE_OR_YEAR");
assert(people.find(x=>x.saint_id==="saint:louise-de-marillac").saints[0].life.birth.date_precision==="EXACT_DATE_PLACE_DISPUTED");
assert(people.find(x=>x.saint_id==="saint:teresa-benedicta-cross-stein").saints[0].life.death.date_precision==="PROBABLE_EXACT_DAY");
assert(people.find(x=>x.saint_id==="saint:francis-assisi").search_text.includes("françois")||people.find(x=>x.saint_id==="saint:francis-assisi").search_text.includes("francois"));
assert(people.some(x=>x.search_text.includes("missionary")),"Role labels must be searchable");
assert.equal(projectSaintCatalogueItems({...dataset,saintsDoctors:null,saintsVocations:null}).length,6,
 "Optional research data failure may never invent a person record");
assert.equal(projectSaintCatalogueItems({...dataset,saintsDoctors:{schema:"INVALID"},saintsVocations:null}).length,6);
for(const language of ["en","fr"]){
 const selected=people.find(x=>x.saint_id==="saint:ignatius-antioch");
 const vm=buildExploreViewModel({
   language,lens:"saints",view:"list",items:people,selectedId:selected.item_id,filters:{query:""}
 });
 const html=renderExploreToString(vm);
 assert(html.includes('data-explore-item="'+selected.item_id+'"'),"One-per-saint list must be rendered");
 assert(html.includes('data-saint-id="saint:ignatius-antioch"'));
 assert(html.includes(language==="fr"?"Inconnue":"Unknown"),"No fabricated birth for Ignatius");
 assert(html.includes("aoSaintIdentity"),"Portrait and chronology should retain approved compact layout");
 assert(html.includes("aoSaintLife"),"Full native biography visible, no internal Read more");
 assert(html.includes(language==="fr"?"Pour approfondir":"Read further"),"Only external reading folded");
 assert(!html.includes('data-explore-open-place="undefined"'),"No invented Saint/Place relation");
 assert(!html.includes('data-explore-open-place="null"'));
 assert(!html.includes("data-calendar-mass"),"No auto-created 1962 Mass");
 assert(html.includes(language==="fr"?"30</strong><span>notices de saints":"30</strong><span>saint profiles"),
 "Reader list must count people, not pins");
}
const kolbe=people.find(x=>x.saint_id==="saint:maximilian-kolbe");
assert(kolbe.saints[0].why_en.includes("Franciszek Gajowniczek"),"Personal sacrifice central to biography");
assert(!kolbe.saints[0].biography_facts.length,"Historical fact ledger not duplicated as visible paragraphs");
assert(people.filter(x=>x.place_id).length===6,"Six original pilot Saints may link a source-backed Place");
assert(people.filter(x=>!x.place_id).length===24,"Do not invent Places for held biographies");
console.log("PASS: 30 source-owned research catalogue lives, EN/FR profile UI, original 9 Places/8 pins, no artworks or liturgical promotion");
