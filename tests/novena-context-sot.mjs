import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NOVENA_CORPUS_V4_IDS } from "../src/pray/novena-corpus-v4.js";
import { NOVENA_CONTEXT_V1, novenaContext } from "../src/pray/novena-context-v1.js";
import { calendarNovenaEvents } from "../src/calendar/intelligence.js";

const sot=JSON.parse(readFileSync("data/pray/novena-context-sot.v1.json","utf8"));
const frozen=JSON.parse(readFileSync("data/pray/novena-sot.v1.json","utf8"));
const bridge=JSON.parse(readFileSync("data/customs/novena-context-links.v1.json","utf8"));
const customs=JSON.parse(readFileSync("data/customs/customs-atlas-seed.v1.json","utf8"));
const customSources=JSON.parse(readFileSync("data/customs/source-registry.v1.json","utf8"));
const geography=JSON.parse(readFileSync("data/geography/seed-registry.v1.json","utf8"));
const shrines=JSON.parse(readFileSync("data/shrines/shrines-pilgrimages-seed.v1.json","utf8"));
const runtime=readFileSync("src/pray/novena-runtime.js","utf8");
const home=readFileSync("src/home/enrichers.js","utf8");

assert.equal(sot.schema,"NOVENA_CONTEXT_SOT_V1");
assert.equal(sot.status,"ACTIVE_CONTEXT_LAYER");
assert.equal(sot.version,"1.1.0");
assert.equal(sot.research_status,"COMPLETE_16_TARGET_CONTEXT_AND_CROSS_DOMAIN_V1");
assert.equal(sot.bridge_dependency,"NOVENA_CUSTOMS_GEOGRAPHY_BRIDGE_V1@1.1.0");
assert.equal(sot.coverage.targets,16);
assert.equal(sot.coverage.cross_domain_evidence,16);
assert.equal(sot.coverage.cross_domain_unresolved,0);
for(const key of ["history","guide","practice","current_indulgence","temporal","cross_domain_policy"]){
  assert.equal(sot.coverage[key],16,"context coverage lost: "+key);
}
assert.deepEqual(sot.novenas.map(x=>x.id),NOVENA_CORPUS_V4_IDS);
assert.deepEqual(sot.novenas.map(x=>x.id),frozen.novenas.map(x=>x.id));

const sourceIds=new Set(sot.source_registry.map(x=>x.id));
assert.ok(sourceIds.has("EI4-22"),"current public-novena indulgence authority disappeared");
for(const row of sot.novenas){
  assert.equal(row.history.status,"SOURCE_BACKED_RENDERED",row.id+" history is not source-backed");
  assert.equal(row.guide.status,"SOURCE_BACKED_RENDERED",row.id+" guide is not source-backed");
  assert.ok(row.practice.en&&row.practice.fr,row.id+" lost bilingual practice/gesture guidance");
  assert.equal(row.practice.sign_of_cross.historical_rubric,false,row.id+" generic Sign of Cross was misrepresented as historical rubric");
  assert.equal(row.indulgence.current_public_novena.classification,"CURRENT_PARTIAL_PUBLIC_NOVENA",row.id+" lost current public-novena indulgence classification");
  assert.equal(row.indulgence.current_public_novena.source_id,"EI4-22",row.id+" lost current indulgence authority");
  assert.equal(row.indulgence.historical.classification,"HISTORICAL_CONTEXT_ONLY",row.id+" historical/current indulgence boundary disappeared");
  for(const item of row.indulgence.related_current_works||[]){
    assert.ok(sourceIds.has(item.source_id),row.id+" related indulgenced work has unresolved source "+item.source_id);
  }
  assert.equal(row.temporal.date_owner,"CALENDAR_INTELLIGENCE",row.id+" gained a second date owner");
  assert.equal(row.temporal.calendar,"LIVE",row.id+" lost Calendar integration");
  assert.equal(row.temporal.home_now_next,"LIVE_VIA_CALENDAR_INTELLIGENCE",row.id+" lost Now/Next integration");
  assert.equal(row.cross_domain.customs_policy,"EVIDENCE_BACKED_BRIDGE_ONLY",row.id+" weakened Customs evidence rule");
  assert.equal(row.cross_domain.geography_policy,"NO_ASSOCIATION_FROM_PROXIMITY",row.id+" weakened Geography association rule");
  const runtimeContext=novenaContext(row.id);
  assert.ok(runtimeContext,row.id+" missing runtime context projection");
  assert.equal(runtimeContext.crossDomain?.researchStatus,"COMPLETE_16_TARGET_CLASSIFICATION",row.id+" runtime cross-domain research is not complete");
  assert.ok((runtimeContext.crossDomain?.links||[]).length>=1,row.id+" runtime lost its researched cross-domain links");
}

assert.match(runtime,/Practice & gestures/);
assert.match(runtime,/Indulgences/);
assert.match(runtime,/Customs & places/);
assert.match(runtime,/novenaContext/,"Novena runtime stopped consuming the context SOT");
assert.match(runtime,/Historical indulgence context/);
assert.match(runtime,/Historical grants are not carried forward automatically/);
assert.match(home,/calendarIntelligenceForDate/,"Home Now/Next no longer consumes Calendar Intelligence");
assert.match(home,/for\(let i=1;i<=14;i\+\+\)/,"Home Coming Up horizon changed without Novena integration review");

const pentecostPrep=calendarNovenaEvents("2026-05-15",{fr:false});
assert.ok(pentecostPrep.some(x=>x.novenaId==="holy_ghost"&&x.status.kind==="active"),"Holy Ghost novena no longer surfaces as Calendar active");
const pentecostComing=calendarNovenaEvents("2026-05-10",{fr:false,upcomingDays:14});
assert.ok(pentecostComing.some(x=>x.novenaId==="holy_ghost"&&x.status.kind==="upcoming"),"Holy Ghost novena no longer surfaces in Coming Up");

const customIds=new Set(customs.customs.map(x=>x.custom_id));
const geoIds=new Set(geography.geoAreas.map(x=>x.geo_area_id));
assert.equal(bridge.version,"1.1.0");
assert.equal(bridge.research_status,"COMPLETE_16_TARGET_CROSS_DOMAIN_CLASSIFICATION");
assert.equal(bridge.research_summary?.target_count,16);
assert.equal(bridge.research_summary?.targets_with_bridge,16);
assert.equal(bridge.research_summary?.unresolved_target_count,0);
assert.deepEqual(bridge.negative_knowledge,[],"Completed Novena bridge regained unresolved targets");

const customsSourceIds=new Set(customSources.sources.map(x=>x.id));
const bridgeSourceIds=new Set(bridge.sources.map(x=>x.id));
const shrineIds=new Set(shrines.shrines.map(x=>x.shrine_id));
const placeIds=new Set(geography.places.map(x=>x.place_id));
const bridgeNovenaIds=new Set();
for(const link of bridge.links){
  assert.ok(NOVENA_CORPUS_V4_IDS.includes(link.novena_id),"bridge has unknown novena "+link.novena_id);
  bridgeNovenaIds.add(link.novena_id);
  if(link.custom_id)assert.ok(customIds.has(link.custom_id),"bridge has unknown custom "+link.custom_id);
  if(link.geo_area_id)assert.ok(geoIds.has(link.geo_area_id),"bridge has unknown geography "+link.geo_area_id);
  if(link.shrine_id)assert.ok(shrineIds.has(link.shrine_id),"bridge has unknown shrine "+link.shrine_id);
  if(link.map_policy==="PLACE"){
    assert.ok(link.place_id,"PLACE novena bridge lost canonical place");
    assert.ok(placeIds.has(link.place_id),"PLACE novena bridge references unknown canonical place "+link.place_id);
  }
  if(link.map_policy==="PLACE_PENDING"){
    assert.ok(link.place_name_hint,"PLACE_PENDING novena bridge lost its place hint");
    assert.equal(link.place_id,null,"PLACE_PENDING novena bridge must not masquerade as canonical place");
  }
  for(const sourceId of link.source_ids){
    assert.ok(customsSourceIds.has(sourceId)||bridgeSourceIds.has(sourceId),"bridge has unresolved source "+sourceId);
  }
}
assert.ok(bridgeNovenaIds.has("sacred_heart"),"Sacred Heart lost Paray/customs bridge");
assert.ok(bridge.links.filter(x=>x.novena_id==="sacred_heart").every(x=>x.place_id==="place:FR:sanctuaire-sacre-coeur-paray"&&x.shrine_id==="shrine:FR:paray-sacred-heart"),"Sacred Heart bridge is not promoted to canonical Paray place/shrine");
assert.ok(bridgeNovenaIds.has("holy_souls"),"Holy Souls lost cemetery/customs bridge");
assert.ok(bridgeNovenaIds.has("st_therese"),"St Therese lost Lisieux geography context");
assert.ok(bridgeNovenaIds.has("st_joseph"),"St Joseph lost French geography context");

assert.deepEqual([...bridgeNovenaIds].sort(),[...NOVENA_CORPUS_V4_IDS].sort(),"Novena bridge is not complete 16/16");

const exactChristmas=bridge.links.find(x=>x.novena_id==="christmas");
assert.equal(exactChristmas.relationship,"EXACT_FORM_FRENCH_ATTESTATION");
assert.match(exactChristmas.place_name_hint,/Corsica/);

const corpusOrigin=bridge.links.find(x=>x.novena_id==="corpus_christi");
assert.equal(corpusOrigin.map_policy,"PLACE");
assert.equal(corpusOrigin.place_id,"place:BE:sanctuaire-sainte-julienne-cornillon");

const immaculateLourdes=bridge.links.find(x=>x.novena_id==="immaculate_conception");
assert.equal(immaculateLourdes.place_id,"place:FR:sanctuaire-notre-dame-de-lourdes");
assert.equal(immaculateLourdes.shrine_id,"shrine:FR:lourdes-our-lady");

const christKing=bridge.links.find(x=>x.novena_id==="christ_the_king");
assert.equal(christKing.map_policy,"NOT_MAPPED","French textual Christ-the-King evidence must not invent a geographic pin");
assert.equal(christKing.geo_area_id,"geo:culture:french-catholic-world");

const stMichael=bridge.links.find(x=>x.novena_id==="st_michael");
assert.equal(stMichael.map_policy,"PLACE");
assert.equal(stMichael.place_id,"place:FR:abbaye-mont-saint-michel");
const assumptionParis=bridge.links.find(x=>x.link_id==="novena-place:assumption:notre-dame-paris");
assert.equal(assumptionParis.map_policy,"PLACE");
assert.equal(assumptionParis.place_id,"place:FR:notre-dame-paris");
assert.ok(bridge.links.filter(x=>x.map_policy==="PLACE_PENDING").length===0,"All seven named novena sites must be linked to canonical Places");

for(const id of ["holy_ghost","annunciation","assumption","seven_sorrows","perpetual_help","st_anthony_nine_tuesdays","immaculate_heart"]){
  assert.ok(bridgeNovenaIds.has(id),id+" lost its researched French-world bridge");
}

const exploreData=readFileSync("src/find/explore-data-service.js","utf8");
const exploreProjection=readFileSync("src/find/explore-projection.js","utf8");
const explorePresentation=readFileSync("src/find/explore-presentation.js","utf8");
const exploreBrowser=readFileSync("src/find/browser-entry.js","utf8");
assert.match(exploreData,/novenaBridge/,"Explore no longer loads the Novena bridge");
assert.match(exploreData,/novenaSot/,"Explore no longer loads Novena identities");
assert.match(exploreProjection,/projectNovenaContextItems/,"Explore no longer projects Novena context records");
assert.match(exploreProjection,/Related novena/,"Explore shrine/custom records lost reverse Novena relationships");
assert.match(explorePresentation,/data-explore-open-novena/,"Explore presentation lost Novena deep link");
assert.match(exploreBrowser,/AO_PRAY_V435930\?\.open\?\.\("pray\.novenas"/,"Explore browser stopped routing related records into PRAY");
assert.match(runtime,/data-n1-explore/,"Novena detail lost the reverse Explore link");
assert.ok(runtime.includes("AO_FIND_APP_V1?.open?.({lens:'traditions',view:'list',query}"),"Novena detail no longer prefilters Explore by its own identity");

console.log("PASS Novena context v1: 16/16 history-guide-practice-indulgence-temporal and cross-domain coverage with bidirectional Explore links");
