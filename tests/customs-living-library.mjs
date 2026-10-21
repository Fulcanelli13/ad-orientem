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
  frCopy:json("data/customs/customs-fr-canonical-copy.v1.json")
};
const library=createCustomsLibrary(data);
assert.equal(library.stats.canonical,38,"38 current canonical IDs retained");
assert.equal(library.items.every(c=>c.title_fr&&c.description_fr&&c.caution_fr),true,"all 38 canonical records have French title, description and pastoral qualification");
assert.equal(new Set(data.frCopy.entries.map(c=>c.custom_id)).size,27,"exactly 27 supplementary French records");
assert.equal(library.published,35,"publication boundary preserved");
assert.equal(library.contextOnly,3,"three contextual customs not promoted into published practices");
assert.equal(library.stats.research,568,"all Weiser observations accessible in research index");
assert.equal(library.stats.researchByTriage.EXCLUDE,34,"excluded observations remain classified");
assert.equal(library.stats.researchByTriage.HISTORY_ONLY,117,"historical source rows retained");
assert.equal(library.stats.researchByTriage.REGIONAL,145,"regional source rows retained");
assert.equal(library.stats.researchByTriage.CANDIDATE,131,"candidate source rows retained");
assert.equal(library.stats.researchByTriage.COVERED,85,"already covered sources remain accounted for");
assert.equal(library.stats.researchByTriage.ENRICH,56,"enrichment sources remain accounted for");
assert.equal(new Set(library.items.map(x=>x.id)).size,38);
assert.equal(new Set(library.research.map(x=>x.id)).size,568);
assert.equal(library.items.every(x=>x.temporal&&x.attestations.length>0&&x.sources.length>0),true,"all canonical profiles retain time placement, evidence and sources");
const throughYear=selectCustoms(library,{view:"year"});
const life=selectCustoms(library,{view:"life"});
assert.equal(throughYear.length+life.length,38,"dated and undated views form an exhaustive, non-overlapping partition");
assert.equal(selectCustoms(library,{view:"all"}).length,38);
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
