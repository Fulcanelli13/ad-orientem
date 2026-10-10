import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49} from "../src/find/preliminary-directory-r49.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const raw=JSON.parse(readFileSync(new URL("../data/directory/preliminary-map-r49.v1.json",import.meta.url),"utf8"));
const venues=projectPreliminaryR49(raw);
assert.equal(venues.length,1879);
const first=venues.find(x=>x.preliminary_group==="ROME"&&x.source_links.length>0);
assert.ok(first);
const base={language:"en",lens:"tlm",view:"map",items:[first],counts:{tlm:1879},
  filters:{directoryGroup:"ROME"},selectedId:first.item_id};
const preview=renderExploreToString(buildExploreViewModel(base));
assert.match(preview,/class="aoFindSheet aoExploreQuickPreview"/);
assert.match(preview,/data-explore-expand-detail/);
assert.match(preview,/Details &amp; sources/);
assert.match(preview,/Provisional venue/);
assert.match(preview,/sources? in details/);
assert.doesNotMatch(preview,/class="aoFindSources"/,"Must not expose bibliography before opening full record");
assert.doesNotMatch(preview,/class="aoFindFacts"/,"Must not open with an information dashboard");
assert.doesNotMatch(preview,/class="aoExploreSections"/,"No detailed sections in first sheet");
const full=renderExploreToString(buildExploreViewModel({...base,expandDetail:true}));
assert.match(full,/data-explore-collapse-detail/);
assert.match(full,/class="aoFindSources"/);
assert.match(full,/target="_blank" rel="noopener"/);
assert.doesNotMatch(full,/data-explore-expand-detail/,"Full record must not retain preview action");
assert.doesNotMatch(full,/SUNDAY 10:30/,"Must not invent Mass times");

const sample={
 item_id:"shrine:test",lens:"shrines",kind:"SHRINE",title:"Notre-Dame des Sources",
 subtitle:"Loire, France",summary:"This is source-owned factual material describing the place and its history. ".repeat(7),
 eyebrow:"Sanctuary",status:"DOCUMENTED",map_publishable:true,
 address:{formatted:"Loire, France"},source_links:[
  {issuer:"Original archive",url:"https://example.org/archive"},
  {issuer:"Official sanctuary",url:"https://example.org/sanctuary"}],
 facts:[{label:"Dedication",value:"Our Lady"}],sections:[{label:"History",body:"Long contextual source-owned account"}],
 actions:[],geo:{lat:45,lng:4,indicative_only:true,attribution:"© OpenStreetMap contributors"},note:"Use original sources",
};
const shrPreview=renderExploreToString(buildExploreViewModel({
 lens:"shrines",view:"list",items:[sample],selectedId:sample.item_id,language:"fr",
}));
assert.match(shrPreview,/class="aoFindSheet aoExploreQuickPreview"/);
assert.match(shrPreview,/Détails et sources/);
assert.doesNotMatch(shrPreview,/Long contextual source-owned account/);
assert.doesNotMatch(shrPreview,/example.org\/archive/);
const shrFull=renderExploreToString(buildExploreViewModel({
 lens:"shrines",view:"list",items:[sample],selectedId:sample.item_id,language:"fr",expandDetail:true,
}));
assert.match(shrFull,/Long contextual source-owned account/);
assert.match(shrFull,/https:\/\/example.org\/archive/);
assert.match(shrFull,/data-explore-collapse-detail/);
const person={item_id:"tradition:custom:test",lens:"traditions",kind:"CANONICAL_CUSTOM",
 title:"Devotional practice",summary:"Sourced devotional practice",source_links:[{issuer:"Original",url:"https://example.org/custom"}]};
const heritagePreview=renderExploreToString(buildExploreViewModel({
 lens:"heritage",view:"map",items:[],selectedOverride:person,selectedId:person.item_id,language:"en",filters:{heritageCategories:["traditions"]},
}));
assert.match(heritagePreview,/aoExploreQuickPreview/);
assert.doesNotMatch(heritagePreview,/href="https:\/\/example.org\/custom"/);
console.log("PASS R54: Mass, shrine and heritage custom preview-first disclosure with verified source links only in full record");
