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
 assert.ok(fit.fit.padding.left>=52&&fit.fit.padding.right>=52,
   width+"px halo and touch-target safety margin missing");
 assert.equal(fit.fit.duration,0);
 assert.ok(fit.bounds[0][0]<-170&&fit.bounds[1][0]>170,
   "Must show both geographic ends, not suppress distant places");
 assert.ok(width-fit.fit.padding.left-fit.fit.padding.right>=200,
   "Do not squeeze usable phone map below 200px");
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
assert.match(source,/if\(phoneOverview\)map\.fitBounds\(phoneOverview\.bounds,phoneOverview\.fit\)/);
assert.match(source,/new maplibre\.AttributionControl\(\{compact:true\}\),"bottom-left"/);
assert.match(source,/attributionControl:!compactAttribution/);
assert.match(styles,/\.aoFindMap \.maplibregl-ctrl-bottom-left/);
assert.match(styles,/\.aoHeritageMapHint\{[\s\S]*?bottom:67px/);
assert.match(styles,/\.aoHeritageNearby\{[\s\S]*?bottom:13px/);
assert.doesNotMatch(styles,/\.maplibregl-ctrl-attrib\s*\{[^}]*display\s*:\s*none/,
  "Required map attribution may not be hidden");
console.log("PASS phone world fit 320/390/430; one world, halo margin, compact accessible attribution and isolated controls");
