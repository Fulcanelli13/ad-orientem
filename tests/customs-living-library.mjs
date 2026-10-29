import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createCustomsLibrary,selectCustoms,selectResearch} from "../src/customs/customs-library.js";
import {installCustomsBrowserOwner} from "../src/customs/customs-browser.js";

const json=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const data={
  customs:json("data/customs/customs-atlas-seed.v1.json"),
  temporal:json("data/customs/customs-temporal-projection.v1.json"),
  archive:json("data/customs/research/weiser-public-reference-index.v1.json"),
  sources:json("data/customs/source-registry.v1.json"),
  p0:json("data/customs/customs-p0-guidance-en-fr.v1.json"),
  p1:json("data/customs/customs-p1-guidance-en-fr.v1.json"),
  frCopy:json("data/customs/customs-fr-canonical-copy.v1.json"),
  historical:json("data/customs/customs-historical-folios.v1.json")
};
const library=createCustomsLibrary(data);

const art=json("data/customs/customs-approved-art-reuse-review.v1.json");
assert.equal(art.schema,"AO_CUSTOMS_APPROVED_ART_REUSE_REVIEW_V1");
assert.equal(art.status,"NON_PUBLISHING_CURATORIAL_CROSSWALK");
assert.equal(art.candidate_placements.length,19,"19 possible uses of previously approved paintings");
assert.equal(art.unmatched_customs.length,19,"19 unresolved artwork matches remain visible");
assert.equal(art.counts.canonical_customs,38);
const artIDs=new Set([...art.candidate_placements,...art.unmatched_customs].map(x=>x.custom_id));
assert.equal(artIDs.size,38,"every custom needs exactly one art review disposition");
assert.deepEqual(artIDs,new Set(library.items.filter(x=>x.id!=="PENT-001").map(x=>x.id)),"Historic art selection covers the old 38 only; new article has no assigned art");
assert.ok(art.candidate_placements.every(x=>x.cross_module_placement_status==="PROPOSED_NEEDS_CURATOR_APPROVAL" &&
  x.image_release_status==="NOT_VERIFIED" && !x.artwork_display_enabled && x.asset_path==null &&
  /^OCT(12|19)_/.test(x.original_selection_origin) && x.approval_locator && x.selected_artist && x.selected_title),
  "approved originals must never be auto-published as new custom placements");
assert.ok(art.unmatched_customs.every(x=>x.placement_status==="NO_SUITABLE_APPROVED_ORIGINAL_MATCH_ESTABLISHED" && !x.artwork_display_enabled),
  "no unsuitable visual substitution allowed");

assert.equal(library.stats.canonical,39,"38 current canonical IDs retained");
assert.equal(data.temporal.records.filter(x=>x.calendar_hint).length,26,"exactly 26 dated seasonal notices");
assert.equal(data.temporal.records.filter(x=>x.calendar_hint).every(x=>x.calendar_hint_fr),true,
  "every dated seasonal notice must be bilingual");
assert.equal(data.historical.entries.length,27,"historical folio parity");

assert.equal(data.historical.entries.length,27,"27 historical research-bound folios required");
assert.equal(library.items.filter(c=>c.history).length,27,"all shorter customs get detailed historical context");
assert.equal(library.items.filter(c=>c.history).every(c=>
  c.history.source_ids.length>0&&c.history.source_ids.every(id=>c.sources.some(s=>s.id===id))),true,
  "historical claims must retain valid canonical source links");
assert.equal(library.items.filter(c=>c.history).every(c=>
  c.history.history_fr&&c.history.history_en),true,"historical folios fully bilingual");

assert.equal(library.items.every(c=>c.title_fr&&c.description_fr&&c.caution_fr),true,"all 39 canonical records have French title, description and pastoral qualification");
assert.equal(new Set(data.frCopy.entries.map(c=>c.custom_id)).size,28,"exactly 27 supplementary French records");
assert.equal(library.published,36,"publication boundary preserved");
assert.equal(library.contextOnly,3,"three contextual customs not promoted into published practices");
assert.equal(library.stats.research,568,"all Weiser observations accessible in research index");
assert.equal(library.stats.researchByTriage.EXCLUDE,34,"excluded observations remain classified");
assert.equal(library.stats.researchByTriage.HISTORY_ONLY,117,"historical source rows retained");
assert.equal(library.stats.researchByTriage.REGIONAL,145,"regional source rows retained");
assert.equal(library.stats.researchByTriage.CANDIDATE,131,"candidate source rows retained");
assert.equal(library.stats.researchByTriage.COVERED,85,"already covered sources remain accounted for");
assert.equal(library.stats.researchByTriage.ENRICH,56,"enrichment sources remain accounted for");
assert.equal(new Set(library.items.map(x=>x.id)).size,39);
assert.equal(new Set(library.research.map(x=>x.id)).size,568);
assert.equal(library.items.every(x=>x.temporal&&x.attestations.length>0&&x.sources.length>0),true,"all canonical profiles retain time placement, evidence and sources");
const throughYear=selectCustoms(library,{view:"year"});
const life=selectCustoms(library,{view:"life"});
assert.equal(throughYear.length+life.length,39,"dated and undated views form an exhaustive, non-overlapping partition");
assert.equal(selectCustoms(library,{view:"all"}).length,39);
assert.equal(selectResearch(library).length,568);
assert.equal(selectResearch(library,{triage:"EXCLUDE"}).length,34);
assert.equal(life.some(x=>x.id==="DOM-002"),true,"household holy-water fonts not hidden by absence of a date");
assert.equal(throughYear.some(x=>x.id==="ADVT-001"),true,"Advent family custom appears in temporal experience");
assert.equal(library.research.every(r=>r.publication_state==="RESEARCH_ONLY_NOT_APP_APPROVED"),true,"research never masquerades as app-publication approval");
assert.equal(library.research.every(r=>!r.canonical||library.byId.has(r.canonical.id)),true);
assert.equal(typeof installCustomsBrowserOwner,"function","standalone browser owner loadable in Node");
const calendar=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
assert.match(calendar,/data-cal-customs-open/,"Calendar links to first-class Customs library");
assert.match(calendar,/import\("\.\.\/customs\/customs-browser\.js"\)/,"Calendar entry is lazy and independent");
const explorePresentation=readFileSync(new URL("../src/find/explore-presentation.js",import.meta.url),"utf8");
const exploreBrowser=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
assert.match(explorePresentation,/data-explore-customs-library/,"Explore Traditions must lead to the full independent collection");
assert.match(exploreBrowser,/import\("\.\.\/customs\/customs-browser\.js"\)/,"Explore must use the canonical Customs owner");
console.log("Customs living-library gate: 38 canonical + 568 research, dated/undated parity, research boundaries and Calendar entry pass.");
