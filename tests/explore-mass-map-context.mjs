import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mappedVenueViewportStats,mappedVenueViewportLabel}
  from "../src/find/mass-map-viewport-context.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";

const rows=[
 {item_id:"place:A",lens:"tlm",map_publishable:true,geo:{lat:47,lng:3}},
 {item_id:"place:B",lens:"tlm",map_publishable:true,geo:{lat:48,lng:4}},
 {item_id:"place:C",lens:"tlm",map_publishable:true,geo:{lat:-25,lng:57}},
 {item_id:"address-only",lens:"tlm",map_publishable:false,geo:{lat:49,lng:5}},
 {item_id:"bad",lens:"tlm",map_publishable:true,geo:{lat:91,lng:5}},
];
const features=exploreMapFeatures(rows);
assert.equal(features.length,3,"Never count ungeocoded or nonpublishable site leads as map venues");
const local={contains:([lng,lat])=>lng>=0&&lng<=5&&lat>=40&&lat<=50};
const stats=mappedVenueViewportStats(features,local);
assert.deepEqual(stats,{visible:2,mapped:3});
assert.equal(mappedVenueViewportLabel(stats,"en"),"In this view: 2 / 3 mapped venues");
assert.equal(mappedVenueViewportLabel(stats,"fr"),"Dans cette vue : 2 / 3 lieux cartographiés");
assert.deepEqual(mappedVenueViewportStats(features,null),{visible:null,mapped:3});
assert.equal(mappedVenueViewportLabel(null,"fr"),"Dans cette vue : …");
assert.equal(mappedVenueViewportLabel({visible:null,mapped:3}),"In this view: …");
const all={contains:()=>true};
assert.deepEqual(mappedVenueViewportStats(features,all),{visible:3,mapped:3});
const none={contains:()=>false};
assert.deepEqual(mappedVenueViewportStats(features,none),{visible:0,mapped:3});
const dateline=[{type:"Feature",geometry:{type:"Point",coordinates:[179,12]}}];
assert.deepEqual(mappedVenueViewportStats(dateline,{contains:([lng])=>lng<-180&&lng>-182}),
 {visible:1,mapped:1},"A wrapped longitude must count one canonical point exactly once");
assert.deepEqual(mappedVenueViewportStats(dateline,{contains:()=>{throw Error("bad map bounds")}}),
 {visible:null,mapped:1},"Unusable bounds must not mislead with a zero count");

const presentation=readFileSync("src/find/explore-presentation.js","utf8");
const runtime=readFileSync("src/find/browser-entry.js","utf8");
const map=readFileSync("src/find/map-runtime.js","utf8");
const css=readFileSync("src/find/explore-atlas-layout-style.js","utf8");
assert.match(presentation,/data-tlm-viewport-count aria-live="polite"/);
assert.match(runtime,/mapHandle\.map\?\.on\?\.\("moveend",syncMassViewport\)/);
assert.match(runtime,/mapHandle\.map\?\.on\?\.\("load",syncMassViewport\)/);
assert.match(runtime,/if\(reuseMap\)\{syncJourneyMarkers\(\);syncDiscoverViewport\(\);syncMassViewport\(\)/);
assert.match(map,/viewportVenueStats\(\)\{return mappedVenueViewportStats\(features,map\.getBounds\?\.\(\)\)\}/);
assert.match(map,/Show all matching mapped venues/);
assert.doesNotMatch(css,/\.aoExploreMapReset\s*\{[^}]*font-size:0/);
assert.match(css,/\.aoTlmViewportContext\{/);
console.log("PASS Mass map context: canonical viewport counts, EN/FR, antimeridian, pan/zoom and readable global reset");
