import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {
 PRELIMINARY_R49_URL,PRELIMINARY_R49_TOTAL,PRELIMINARY_R49_ROME,
 validateR49Snapshot,projectPreliminaryR49,filterPreliminaryR49,
} from "../src/find/preliminary-directory-r49.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {renderHeritageToString} from "../src/find/heritage-presentation.js";

const raw=JSON.parse(readFileSync(fileURLToPath(PRELIMINARY_R49_URL),"utf8"));
assert.doesNotThrow(()=>validateR49Snapshot(raw));
const records=projectPreliminaryR49(raw);
assert.equal(records.length,PRELIMINARY_R49_TOTAL);
assert.equal(new Set(records.map(x=>x.item_id)).size,records.length);
const rome=filterPreliminaryR49(records,{directoryGroup:"ROME"});
const sspx=filterPreliminaryR49(records,{directoryGroup:"SSPX"});
const unknown=filterPreliminaryR49(records,{directoryGroup:"UNKNOWN"});
const all=filterPreliminaryR49(records,{directoryGroup:"ALL"});
assert.equal(rome.length,PRELIMINARY_R49_ROME);
assert.equal(sspx.length,732);
assert.equal(unknown.length,125);
assert.equal(all.length,1879);
assert.equal(filterPreliminaryR49(records).length,1879,
  "Worldwide Mass map must include every provisional source-backed venue by default");
assert.equal(exploreMapFeatures(records).length,1879);
assert.ok(rome.every(x=>x.preliminary_group==="ROME"));
assert.equal(sspx.filter(x=>x.community_id==="SSPX").length,729);
assert.equal(sspx.filter(x=>x.community_id==="SSPX_SISTERS").length,3,
  "Exact Sisters of the SSPX source names must not be collapsed into generic SSPX institute identity");
assert.ok(rome.every(x=>x.map_publishable&&x.geo.approximate));
assert.ok(records.every(x=>x.source_links.length>0&&x.source_links.every(y=>/^https?:\/\/[^\s]+$/.test(y.url))));
assert.ok(records.every(x=>x.actions.length===0&&x.sections.length===0),"Unverified timetables/directions must not appear");
assert.ok(records.every(x=>/provisional/i.test(x.summary)));
assert.ok(filterPreliminaryR49(records,{directoryGroup:"ROME",affiliations:["FSSP"]}).every(x=>x.community_id==="FSSP"));
assert.equal(filterPreliminaryR49(records,{directoryGroup:"ALL",query:"aononexistentrecordxqz2026"}).length,0);
assert.equal(filterPreliminaryR49(records,{directoryGroup:"ALL",query:"église"}).length,
  filterPreliminaryR49(records,{directoryGroup:"ALL",query:"eglise"}).length,"Search accent insensitivity lost");
const vm=buildExploreViewModel({language:"fr",items:rome,lens:"tlm",view:"map",
 counts:{tlm:1879},loadedProviders:[],unavailableProviders:[],
 filters:{directoryGroup:"ROME",affiliations:[],query:""}});
const html=renderExploreToString(vm);
assert.match(html,/data-find-filter="directoryGroup"/);
assert.match(html,/data-find-filter-value="ROME"/);
assert.match(html,/data-find-filter-value="ALL"/);
assert.match(html,/aoTlmToolbar/,"Mass map search and view switch should share a compact toolbar");
assert.match(html,/aoTlmProviderStrip/,"Institution filters must be visible, not hidden in a details disclosure");
assert.match(html,/aoPreliminaryDirectoryNotice/,"The provisional-directory warning must remain available");
assert.ok(html.indexOf("aoFindExternalSource")>html.indexOf('data-find-view="map"'),
  "Secondary directory links belong below the map, not above it");
assert.match(html,/data-find-filter-value="SSPX"/);
assert.match(html,/data-find-map/);
assert.doesNotMatch(html,/data-find-filter="day"/,"Preliminary directory must not claim day-by-day timetable filters");
assert.match(html,/non vérifiés|à vérifier/);
const heritage=renderHeritageToString({
 language:"en",items:[],customCards:[],filters:{heritageCategories:["shrines","relics","pilgrimages","apparitions","traditions"],query:""}
},{placeSheet:()=>"",detailSheet:()=>""});
assert.match(heritage,/aoHeritageMassShortcut/);
assert.equal((heritage.match(/data-find-filter-value="tlm"/g)||[]).length,1,"One primary Mass map entry only");
assert.ok(heritage.indexOf("Find a traditional Mass")>=0);
const invalid=structuredClone(raw);invalid.records[1][0]=invalid.records[0][0];
assert.throws(()=>validateR49Snapshot(invalid),/duplicate/);
console.log("PASS R49 historical baseline: 1,879 provisional source-backed pins, 1,022 Rome-classified, 732 SSPX-family (including 3 explicitly named sisters), 125 unknown; full CL2 worldwide integration separately gated");
