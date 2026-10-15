import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 explorePhoneOverview,boundedWorldMapOptions,EXPLORE_WORLD_BOUNDS,
} from "../src/find/map-runtime.js";
const features=[
 [-178.4,40],[-62.8,-34],[3.3,47],[80.2,22],[178.7,-36],
].map(coordinates=>({geometry:{coordinates}}));
for(const width of [320,390,430]){
 const fit=explorePhoneOverview(features,width);
 assert.ok(fit,width+"px wide-world fit missing");
 assert.ok(fit.edge>=52,width+"px halo/touch edge missing");
 assert.ok(fit.center[0]>-10&&fit.center[0]<10,
   "Global centre must not wrap across date line");
 const ppd=512*Math.pow(2,fit.zoom)/360;
 const westX=width/2+(fit.west-fit.center[0])*ppd;
 const eastX=width/2+(fit.east-fit.center[0])*ppd;
 assert.ok(westX>=fit.edge-.2&&eastX<=width-fit.edge+.2,
   width+"px west/east edges must remain fully visible: "+[westX,eastX]);
}
// The actual published Place seed spans about 297° (-121.92° to +175.14°):
// the previous >300° gate never entered the phone overview at any width.
const realCorpusEnvelope=[
 [-121.9203,-40.74667],[175.14219,55.53062],
].map(coordinates=>({geometry:{coordinates}}));
for(const w of [320,390,430]){
 assert.ok(explorePhoneOverview(realCorpusEnvelope,w),
   w+"px production longitudes must activate edge-safe fit");
}
assert.equal(explorePhoneOverview(features,768),null);
assert.equal(explorePhoneOverview(features,220),null);
assert.equal(explorePhoneOverview(features,NaN),null);
assert.equal(explorePhoneOverview(features.slice(0,2),320),null,
  "Regional maps retain source-bounded camera");
const camera=boundedWorldMapOptions();
assert.equal(camera.renderWorldCopies,false);
assert.deepEqual(camera.maxBounds,EXPLORE_WORLD_BOUNDS,
  "Normal/restored camera constraints must not be changed");
const source=readFileSync(new URL("../src/find/map-runtime.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/find/heritage-style.js",import.meta.url),"utf8");
assert.match(source,/camera\.center=phoneOverview\.center/);
assert.match(source,/camera\.zoom=phoneOverview\.zoom/);
assert.doesNotMatch(source,/map\.fitBounds\(phoneOverview\.bounds/,
  "Never allow MapLibre to choose a wrapped short path across the date line");
assert.match(source,/new maplibre\.AttributionControl\(\{compact:true\}\),"bottom-left"/);
assert.match(source,/attributionControl:!compactAttribution/);
assert.match(styles,/\.aoFindMap \.maplibregl-ctrl-bottom-left/);
assert.match(styles,/\.aoHeritageMapHint\{[\s\S]*?bottom:67px/);
assert.match(styles,/\.aoHeritageNearby\{[\s\S]*?bottom:13px/);
assert.doesNotMatch(styles,/\.maplibregl-ctrl-attrib\s*\{[^}]*display\s*:\s*none/,
  "Required map attribution may not be hidden");
console.log("PASS phone world fit 320/390/430; one world, halo margin, compact accessible attribution and isolated controls");
