import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectSaintResearchShrinePlaces,mergeSaintPilotAndResearchPlaces} from "../src/find/saints-shrine-map-research.js";
import {projectSaintPlaceItems} from "../src/find/saints-lens.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {applySaintsReleaseBoundary,SAINTS_CHANNELS} from "../src/find/saints-release-policy.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const original={
 geography:read("data/geography/seed-registry.v1.json"),
 shrines:{...read("data/shrines/shrines-pilgrimages-seed.v1.json"),sources:read("data/shrines/source-registry.v1.json").sources},
 saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
 saintsCalendarBridge:read("data/saints/parallel-owner-identity-bridge-20261015.v1.json"),
 saintsShrineReadiness:read("data/saints/existing-shrine-geography-readiness-20261016.v1.json")
};
const publicData=applySaintsReleaseBoundary(original);
assert.equal(publicData.saintsShrineReadiness,null);
assert.equal(projectSaintResearchShrinePlaces(publicData).length,0);
assert.equal(projectExploreDataset(publicData).byLens.saints.length,9);
const data=applySaintsReleaseBoundary(original,SAINTS_CHANNELS.RESEARCH_PREVIEW);
const research=projectSaintResearchShrinePlaces(data);
assert.equal(research.length,121);
assert.equal(new Set(research.map(x=>x.place_id)).size,121);
assert.equal(research.filter(x=>x.map_publishable).length,119);
assert.equal(research.filter(x=>!x.map_publishable).length,2);
assert.equal(research.filter(x=>x.geo===null).length,2);
assert.equal(research.reduce((n,x)=>n+x.associated_saint_name_sources.length,0),145);
assert(research.every(x=>x.associated_saint_name_sources.every(a=>a.official_source_links.length>=1)),
 "Every original shrine-name relationship must expose at least one original HTTPS source");
assert(research.flatMap(x=>x.associated_saint_name_sources).every(a=>a.official_source_links.every(s=>s.href.startsWith("https://"))));
assert(research.every(x=>x.kind==="SAINTS_SOURCE_SHRINE_PLACE"&&x.saints.length===0));
assert(research.every(x=>x.artwork_id===null&&x.editorial_status==="RESEARCH_SHRINE_ASSOCIATION_NO_PERSON_IDENTITY_CERTIFIED"));
assert(research.every(x=>x.associated_saint_name_sources.every(a=>a.source_ids.length&&
 a.interpretation==="SHRINE_SOURCE_NAME_ONLY_NOT_CERTIFIED_PERSON_PLACE")));
const originalPilot=projectSaintPlaceItems(data);
assert.equal(originalPilot.length,9);
assert.equal(originalPilot.filter(x=>x.map_publishable).length,8);
const union=mergeSaintPilotAndResearchPlaces(originalPilot,research);
assert.equal(union.length,121);
assert.equal(union.filter(x=>x.map_publishable).length,119);
assert.equal(union.filter(x=>x.kind==="SAINTS_SOURCE_SHRINE_PLACE").length,112);
assert.equal(union.filter(x=>x.kind==="SAINTS_AT_PHYSICAL_PLACE").length,9);
assert.equal(new Set(union.map(x=>x.place_id)).size,121);
assert.equal(projectExploreDataset(data).byLens.saints.length,121,"Real native map must select research when gated");
const sourceOnly=union.find(x=>x.kind==="SAINTS_SOURCE_SHRINE_PLACE"&&x.map_publishable&&x.geo?.source_url?.startsWith("https://"));
assert(sourceOnly);
for(const language of ["en","fr"]){
 const vm=buildExploreViewModel({language,lens:"saints",view:"map",items:union,
   saintsRelease:data.saintsRelease,selectedId:sourceOnly.item_id});
 const html=renderExploreToString(vm);
 assert(html.includes('aoSaintSourceShrineSheet'),"Research site must render a source-only detail sheet");
 assert(html.includes(sourceOnly.title));
 assert(html.includes(sourceOnly.associated_saint_name_sources[0].source_saint_name));
 assert(html.includes("aoSaintSourceShrineInstitution"),"Original source URLs must be actionable from research map sheet");
 assert(html.includes('rel="noopener noreferrer"'),"External shrine evidence must open safely");
 assert(!html.includes('data-calendar-mass'),"Source-name association must not invent a Mass");
 assert(!html.includes('data-explore-calendar-date'),"No feast inferred from shrine names");
 assert(!html.includes("aoSaintLifeEvents"),"No invented birth or death event");
 assert(html.includes(language==="fr"?"identité non confirmée":"person identity unconfirmed"));
}
console.log("PASS W77 research map: 121 existing physical shrine sites, 119 precise pins, 145 association edges; public 9 original Places and 8 pins unchanged");
