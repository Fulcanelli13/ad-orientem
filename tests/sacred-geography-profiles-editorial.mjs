import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectShrineItems} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=path=>JSON.parse(readFileSync(path,"utf8"));
const corpus=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sourceRegistry=read("data/shrines/source-registry.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const mediaAudit=read("data/shrines/research/sacred-geography-shrine-image-audit-2026-10-10.v1.json");

assert.equal(corpus.shrines.length,216,"expected canonical 216 shrine baseline, not world coverage");
assert.ok(corpus.shrines.every(s=>s.origin_summary?.trim()),"a shrine intro is missing");
assert.ok(corpus.shrines.every(s=>s.source_ids?.length),"a shrine has no identifiable source");
const updated=corpus.shrines.filter(s=>Object.hasOwn(s,"origin_summary_fr"));
assert.equal(updated.length,38,"the specific 38 previously empty profiles must be complete in both languages");
const sourceMap=new Map(sourceRegistry.sources.map(s=>[s.id,s]));
assert.equal(sourceMap.size,sourceRegistry.sources.length,"source IDs must be unique");
assert.equal(sourceRegistry.sources.length,349,"12 additional original sources must be retained");
for(const site of updated){
  assert.ok(site.origin_summary.length>=110&&site.origin_summary_fr.length>=110,site.shrine_id+" has a placeholder synopsis");
  assert.notEqual(site.origin_summary,site.origin_summary_fr,site.shrine_id+" was not translated");
  assert.ok(site.source_ids.some(id=>sourceMap.get(id)?.url?.startsWith("https://")),site.shrine_id+" has no linked full original");
  assert.ok(!/^\s*(?:Lorem ipsum|TODO|TBD)/i.test(site.origin_summary),site.shrine_id+" has editorial text instead of a brief");
}
const projected=projectShrineItems({shrines:corpus.shrines,places:geography.places,sources:sourceRegistry.sources});
assert.equal(projected.length,216);
for(const site of updated){
  const item=projected.find(p=>p.source_id===site.shrine_id);
  assert.ok(item&&item.summary===site.origin_summary&&item.summary_fr===site.origin_summary_fr,"bilingual projection lost "+site.shrine_id);
  assert.ok(item.source_links.length>=2,"the map provenance and Catholic place source must remain clickable: "+site.shrine_id);
}
// Exercise the actual preview and expanded place source renderer in French.
const testPlace="place:FR:sanctuary-of-our-lady-of-rocamadour";
const projection={byLens:{shrines:projected,tlm:[],relics:[],apparitions:[],traditions:[],pilgrimages:[]}};
const profiles=buildExplorePlaceProfiles({geography,shrines:{shrines:corpus.shrines,sources:sourceRegistry.sources}},projection,{today:"2026-10-10"});
const candidate=profiles.find(p=>p.place_id===testPlace);
assert.ok(candidate);
const vm=options=>buildExploreViewModel({lens:"heritage",view:"map",items:projected,language:"fr",filters:{heritageCategories:["shrines"]},placeProfiles:profiles,selectedPlaceId:testPlace,...options});
const preview=renderExploreToString(vm());
assert.match(preview,/aoHeritageSynopsis/,"French place preview missing");
assert.match(preview,/Accroché aux falaises/,"French source-owned summary not selected");
assert.doesNotMatch(preview,/class="aoFindList"/,"map discovery regressed to directory");
const expanded=renderExploreToString(vm({expandPlace:true}));
assert.match(expanded,/aoHeritageOverview/,"expanded reader lost source-grounded context");
assert.match(expanded,/Sources et références géographiques/,"expanded reader must link original sources");
assert.match(expanded,/data-explore-place-item=/,"source-owned detailed records must remain available");
assert.equal(mediaAudit.counts.canonical_shrines,216);
assert.equal(mediaAudit.counts.curated_place_photo_links,0,"do not claim undocumented image coverage");
assert.equal(mediaAudit.sites.length,216);
assert.deepEqual(new Set(mediaAudit.sites.map(s=>s.shrine_id)),new Set(corpus.shrines.map(s=>s.shrine_id)));
assert.ok(mediaAudit.sites.every(s=>s.photo_status==="NOT_CURATED"&&s.approved_asset===null));
console.log("PASS 38 bilingual shrine introductions, 12 primary sources, linked originals, honest 216-place image audit");
