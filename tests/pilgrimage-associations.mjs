import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pilgrimagePlacesForCalendarKeys } from "../src/calendar/pilgrimage-places.js";
import { calendarIntelligenceForDate } from "../src/calendar/intelligence.js";
import { projectExploreDataset } from "../src/find/explore-projection.js";
import { buildExplorePlaceProfiles } from "../src/find/place-profiles.js";
import { buildExploreViewModel, renderExploreToString } from "../src/find/explore-presentation.js";

const read=name=>JSON.parse(readFileSync(name,"utf8"));
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const shrineSources=read("data/shrines/source-registry.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const customSources=read("data/customs/source-registry.v1.json");
const novenas=read("data/pray/novena-sot.v1.json");
const bridge=read("data/customs/novena-context-links.v1.json");
const dataset={
  directory:{records:[],communities:[]},
  geography,
  shrines:{...shrines,sources:shrineSources.sources},
  customs:{...customs,sources:customSources.sources},
  novenas:{records:novenas.novenas,links:bridge.links,sources:bridge.sources},
};
assert.equal(shrines.shrines.length,72);
assert.equal(shrines.pilgrimages.length,100);
assert.equal(shrines.routes.length,20);
assert.equal(shrines.temporalLinks.length,69);
const projection=projectExploreDataset(dataset);
assert.equal(projection.byLens.pilgrimages.length,100);
const allShrineIds=new Set(shrines.shrines.map(shrine=>shrine.shrine_id));
assert.ok(shrines.pilgrimages.every(p=>allShrineIds.has(p.destination_shrine_id)),
  "a pilgrimage lost its actual destination shrine");
const lourdes=projection.byLens.pilgrimages.find(p=>p.source_id==="pilgrimage:FR:lourdes-destination");
assert.ok(lourdes);
assert.ok(lourdes.sections.some(section=>section.label==="Saints & patronage"&&section.title.includes("Bernadette")));
assert.ok(lourdes.sections.some(section=>section.label==="Related novena"&&/Immaculate Conception/.test(section.title)));
assert.ok(lourdes.actions.some(action=>action.novena_id==="immaculate_conception"));
assert.ok(lourdes.calendar_keys.includes("feast.our_lady_of_lourdes"));
assert.ok(!lourdes.sections.some(section=>section.label==="Attested local devotion"&&/Paray/.test(section.body)),
  "another sanctuary's custom leaked into Lourdes");
const paray=projection.byLens.pilgrimages.find(p=>p.place_id==="place:FR:sanctuaire-sacre-coeur-paray");
assert.ok(paray&&paray.actions.some(a=>a.novena_id==="sacred_heart"));
assert.ok(paray.sections.some(a=>a.label==="Attested local devotion"&&/consecration/i.test(a.title)));
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-09"});
const parayProfile=profiles.find(p=>p.place_id==="place:FR:sanctuaire-sacre-coeur-paray");
assert.equal(parayProfile.counts.novenas,1,"two family devotions must not multiply the same Sacred Heart novena");
assert.equal(parayProfile.novenas[0].id,"sacred_heart");
assert.equal(parayProfile.novenas[0].notes.length,2,"both source-specific novena relationships must survive");
const lourdesProfile=profiles.find(p=>p.place_id==="place:FR:sanctuaire-notre-dame-de-lourdes");
assert.equal(lourdesProfile.novenas[0].id,"immaculate_conception");
const loughDergProfile=profiles.find(p=>p.place_id==="place:IE:lough-derg-station-island");
assert.equal(loughDergProfile.calendar.length,0,"seasonal journey must not invent a fixed date");
assert.equal(loughDergProfile.seasonal_pilgrimages.length,1);
assert.match(loughDergProfile.seasonal_pilgrimages[0].title,/Three Day Pilgrimage/);
const ui=renderExploreToString(buildExploreViewModel({
  language:"fr",lens:"pilgrimages",items:projection.byLens.pilgrimages,view:"list",
  placeProfiles:profiles,selectedPlaceId:parayProfile.place_id,counts:projection.counts,
}));
assert.match(ui,/NEUVAINES ET DÉVOTIONS ASSOCIÉES/);
assert.match(ui,/data-explore-open-novena="sacred_heart"/);
assert.match(ui,/data-explore-calendar-date=/,"dated pilgrimage must link back to Calendar");

const bound=shrines.temporalLinks.filter(t=>t.binding_state==="BOUND_TO_CALENDAR");
assert.equal(bound.length,41,"SOT bound Calendar relationships drifted");
const keys=[...new Set(bound.map(t=>t.calendar_semantic_key))];
assert.equal(keys.length,32);
for(const key of keys){
  const places=pilgrimagePlacesForCalendarKeys([key],shrines);
  assert.ok(places.length,"Calendar lost exact shrine-place associations for "+key);
  assert.ok(places.every(row=>row.semantic_key===key&&row.place_id&&row.shrine_id));
  for(const place of places){
    assert.ok(place.pilgrimage_ids.every(id=>shrines.pilgrimages.some(p=>p.pilgrimage_id===id)));
    assert.ok(projection.byLens.pilgrimages.some(p=>p.place_id===place.place_id&&p.calendar_keys.includes(key)));
  }
}
const feb11=calendarIntelligenceForDate("2027-02-11",{fr:true});
const events=feb11.semantic.map(event=>event.key);
const linked=pilgrimagePlacesForCalendarKeys(events,shrines);
assert.ok(linked.some(place=>place.place_id==="place:FR:sanctuaire-notre-dame-de-lourdes"));
assert.ok(!pilgrimagePlacesForCalendarKeys(["not-a-real-calendar-key"],shrines).length);
assert.ok(!pilgrimagePlacesForCalendarKeys(["feast.our_lady_of_lourdes"],{}).length);
const calendarBrowser=readFileSync("src/calendar/browser-entry.js","utf8");
const exploreBrowser=readFileSync("src/find/browser-entry.js","utf8");
assert.match(calendarBrowser,/pilgrimagePlacesForCalendarKeys/);
assert.match(calendarBrowser,/find:pilgrimages:/);
assert.match(exploreBrowser,/state\.calendarKey/);
assert.match(exploreBrowser,/data-explore-calendar-date/);
console.log("PASS 72 shrines; 100 pilgrimages; saints, novenas, local devotions, 41 bound links/32 Calendar keys, date navigation");
