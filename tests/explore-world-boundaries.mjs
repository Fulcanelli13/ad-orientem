import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  EXPLORE_WORLD_BOUNDS,boundedWorldViewport,boundedWorldMapOptions,
  mountExploreMap,exploreMapFeatures,mapViewport,
} from "../src/find/map-runtime.js";

assert.deepEqual(EXPLORE_WORLD_BOUNDS,[[-180,-85.051129],[180,85.051129]]);
const opts=boundedWorldMapOptions();
assert.equal(opts.renderWorldCopies,false,"repeated map continents must not be rendered");
assert.equal(opts.minZoom,0);
assert.deepEqual(opts.maxBounds,EXPLORE_WORLD_BOUNDS);
assert.ok(opts.maxPitch===0&&opts.dragRotate===false,"keep the world map north-up");
assert.deepEqual(boundedWorldViewport({center:[580,145],zoom:-8}),{center:[180,85],zoom:0});
assert.deepEqual(boundedWorldViewport({center:[-540,-145],zoom:99}),{center:[-180,-85],zoom:18});
assert.deepEqual(boundedWorldViewport({center:[NaN,Infinity],zoom:NaN}),{center:[0,16],zoom:1});
const mapConfigs=[];
class MapMock{
  constructor(config){this.config=config;mapConfigs.push(config);}
  addControl(){}
  on(){}
  getCenter(){return {lng:this.config.center[0],lat:this.config.center[1]};}
  getZoom(){return this.config.zoom;}
  remove(){}
}
const win={
  document:{getElementById(){return true;}},
  AO_FIND_MAPLIBRE_MODULE:{
    Map:MapMock,NavigationControl:class{},FullscreenControl:class{},
  },
  matchMedia(){return {matches:true};},
};
const item={
  item_id:"heritage:place:FR:test",place_id:"place:FR:test",lens:"heritage",map_publishable:true,
  title:"Test sanctuary",geo:{lat:43,lng:-1,precision:"site"},heritage_primary:"shrines",
};
assert.equal(exploreMapFeatures([item]).length,1);
const mounted=await mountExploreMap({},[item],{win,initialViewport:{center:[420,110],zoom:-2}});
assert.ok(mounted?.map,"Explore should open with mock map");
assert.equal(mapConfigs.length,1);
assert.equal(mapConfigs[0].renderWorldCopies,false);
assert.deepEqual(mapConfigs[0].maxBounds,EXPLORE_WORLD_BOUNDS);
assert.deepEqual(mapViewport(mounted.map),{center:[180,85],zoom:0});
const mapSource=readFileSync(new URL("../src/find/map-runtime.js",import.meta.url),"utf8");
assert.equal((mapSource.match(/spreadBoundedWorldNeverUsed/g)||[]).length,0);
assert.equal((mapSource.match(/\.\.\.boundedWorldMapOptions\(/g)||[]).length,2,
  "both the traditional Mass map and the Sacred Geography map must apply one-world options");
mounted.destroy();
console.log("PASS bounded Explore world: one longitude span, no repeated copies, finite restored viewport");
