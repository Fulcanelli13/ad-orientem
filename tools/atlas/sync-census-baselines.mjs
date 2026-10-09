#!/usr/bin/env node
// Synchronise derived atlas count assertions without weakening named identity locks.
// Usage: node tools/atlas/sync-census-baselines.mjs --check|--write
import {readFileSync,writeFileSync} from "node:fs";
import {isMapPublishablePlaceGeo} from "../../src/find/geography-contracts.js";
const mode=process.argv[2];
if(!["--check","--write"].includes(mode))throw Error("Specify --check or --write");
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const geography=read("data/geography/seed-registry.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const source=read("data/shrines/source-registry.v1.json");
const count={
 places:geography.places.length,shrines:shrines.shrines.length,
 pilgrimages:shrines.pilgrimages.length,apparitions:phenomena.apparitions.length,
 relics:phenomena.relics.length,sources:source.sources.length,
 mappedPlaces:geography.places.filter(p=>isMapPublishablePlaceGeo(p.geo,p.address?.country_code)).length,
 mappedShrines:shrines.shrines.filter(s=>{const p=geography.places.find(p=>p.place_id===s.place_id);return p&&isMapPublishablePlaceGeo(p.geo,p.address?.country_code)}).length
};
const files={
 "tests/sacred-geography-atlas.mjs":[
  [/\bgeo\.places\.length,\d+/g,`geo.places.length,${count.places}`],
  [/\bsacred\.apparitions\.length,\d+/g,`sacred.apparitions.length,${count.apparitions}`],
  [/\bsacred\.relics\.length,\d+/g,`sacred.relics.length,${count.relics}`],
  [/\bcounts\.places,\d+/g,`counts.places,${count.places}`],
  [/\bprofiles\.length,\d+/g,`profiles.length,${count.places}`]
 ],
 "tests/shrines-pilgrimages-contracts.mjs":[
  [/\bshrines:\d+,/g,`shrines:${count.shrines},`],
  [/\bpilgrimages:\d+,/g,`pilgrimages:${count.pilgrimages},`],
  [/\bsources:\d+,/g,`sources:${count.sources},`]
 ],
 "tests/explore-surface.mjs":[
  [/\bshrines:\d+,/g,`shrines:${count.shrines},`],
  [/\bpilgrimages:\d+,/g,`pilgrimages:${count.pilgrimages},`],
  [/\brelics:\d+,/g,`relics:${count.relics},`],
  [/\bapparitions:\d+,/g,`apparitions:${count.apparitions},`],
  [/exploreMapFeatures\(projection\.byLens\.shrines\)\.length,\d+/g,`exploreMapFeatures(projection.byLens.shrines).length,${count.mappedShrines}`]
 ],
 "tests/explore-place-profiles.mjs":[[/\bprofiles\.length,\d+/g,`profiles.length,${count.places}`]],
 "tests/customs-atlas-place-pins.mjs":[[/\bpublished\.length,\d+/g,`published.length,${count.mappedPlaces}`]],
 "tests/pilgrimage-associations.mjs":[
  [/\bshrines\.shrines\.length,\d+/g,`shrines.shrines.length,${count.shrines}`],
  [/\bshrines\.pilgrimages\.length,\d+/g,`shrines.pilgrimages.length,${count.pilgrimages}`],
  [/\bprojection\.byLens\.pilgrimages\.length,\d+/g,`projection.byLens.pilgrimages.length,${count.pilgrimages}`]
 ]
};
let dirty=0;
for(const [path,patterns] of Object.entries(files)){
 const before=readFileSync(path,"utf8");let after=before;
 for(const [regex,value] of patterns){if(!regex.test(after))throw Error(`Missing tracked assertion in ${path}: ${regex}`);regex.lastIndex=0;after=after.replace(regex,value)}
 if(after!==before){dirty++;if(mode==="--write")writeFileSync(path,after);console.log(`${mode==="--write"?"UPDATED":"STALE"} ${path}`)}
}
if(mode==="--check"&&dirty)process.exitCode=1;
else console.log(`Atlas census baselines ${mode==="--check"?"in sync":"updated"}; ${JSON.stringify(count)}. Named Place locks remain manual.`);
