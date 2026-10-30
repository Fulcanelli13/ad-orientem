import assert from "node:assert/strict";
import {
  MASS_EMBLEM_GROUPS,MASS_INSTITUTION_EMBLEMS,massInstitutionEmblem,
  massInstitutionImageId,registerMassInstitutionImages,
} from "../src/find/institution-emblems.js";
import { exploreMapFeatures, MASS_MAP_GROUP_COLORS } from "../src/find/map-runtime.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

assert.deepEqual([...MASS_EMBLEM_GROUPS].sort(),
  ["FSSP","IBP","ICKSP","SSPX","AASJMV"].sort(),
  "Only institutions with a sourced emblem may receive one");
assert.equal(massInstitutionEmblem("diocesan"),null,
  "A diocesan venue is not the Holy See and must use a neutral identity");
assert.equal(massInstitutionImageId("DIOCESAN"),null,
  "Neutral diocesan pins must not register the Holy See arms");
assert.equal(massInstitutionEmblem("OTHER"),null,
  "Never invent a logo for unspecified providers");
assert.equal(massInstitutionImageId("UNKNOWN"),null);
for(const group of MASS_EMBLEM_GROUPS){
  const item=MASS_INSTITUTION_EMBLEMS[group];
  assert.ok(item.source.startsWith("https://commons.wikimedia.org/wiki/File:"));
  assert.ok(item.image.startsWith("https://"));
  assert.ok(item.rights.length>12);
  assert.match(item.licenseUrl,/^https:\/\/creativecommons\.org\/(?:licenses\/by-sa\/[34]\.0|publicdomain\/zero\/1\.0)\/$/,group+" needs a usable licence hyperlink");
  assert.equal(item.reviewBeforeCommercialRelease,true);
  assert.match(MASS_MAP_GROUP_COLORS[group],/^#[0-9a-fA-F]{6}$/);
}

const mapped=exploreMapFeatures([
  {item_id:"tlm:r49:diocese",lens:"tlm",community_id:"DIOCESAN",
    map_publishable:true,geo:{lat:-20.2,lng:57.5,approximate:true}},
  {item_id:"tlm:r49:fssp",lens:"tlm",community_id:"FSSP",
    map_publishable:true,geo:{lat:48.8,lng:2.3,approximate:true}},
  {item_id:"tlm:r49:uncertain",lens:"tlm",community_id:"UNKNOWN",
    map_publishable:true,geo:{lat:12,lng:13,approximate:true}},
]);
assert.deepEqual(mapped.map(x=>x.properties.provider_group),
  ["DIOCESAN","FSSP","OTHER"]);
assert.equal(mapped.every(x=>x.properties.approximate),true,
  "A logo must never upgrade geographical precision");

// Source-owned independent community groups remain selectable without a visual emblem.
for(const view of ["list","map"]){
  const samples=["CMRI","SSPV","RCI","AASJMV","OTHER"].map((id,index)=>({
    kind:"TLM_VENUE",item_id:"tlm:source:"+id,source_id:"src:"+id,
    lens:"tlm",title:id+" listed venue",subtitle:"Source city",community_id:id,
    map_publishable:view==="map",geo:{lat:10+index,lng:20+index},source_links:[],
  }));
  const html=renderExploreToString(buildExploreViewModel({
    lens:"tlm",items:samples,view,filters:{affiliations:[],directoryGroup:"ALL"},language:"en"
  }));
  for(const group of ["CMRI","SSPV","RCI","AASJMV","OTHER"])
    assert.match(html,new RegExp('data-find-affiliation="'+group+'"'),group+" must remain available without logo");
  assert.doesNotMatch(html,/data-find-affiliation="IMBC"/,"Do not promote a research-only classification into published venue filters");
}

// Image load and cross-origin failures must not prevent clicking original markers.
const loaded=new Map();
class GoodImage{
  constructor(){this.naturalWidth=80;this.naturalHeight=100}
  set src(value){this._src=value;queueMicrotask(()=>this.onload?.())}
}
const document={createElement(tag){
  assert.equal(tag,"canvas");
  return {width:0,height:0,getContext(){return {
    drawImage(){},getImageData(){return {width:72,height:72,data:new Uint8ClampedArray(72*72*4)}},
  }}};
}};
const map={
  hasImage(id){return loaded.has(id)},
  addImage(id,image,opts){loaded.set(id,{image,opts})},
};
const registered=[];
const success=await registerMassInstitutionImages(map,{win:{Image:GoodImage,document},
  onRegistered:group=>registered.push(group)});
assert.deepEqual([...registered].sort(),[...MASS_EMBLEM_GROUPS].sort(),
  "Fast emblems should be revealed individually as soon as each image loads");
assert.deepEqual(success.sort(),[...MASS_EMBLEM_GROUPS].sort());
for(const group of success){
  assert.ok(loaded.has(massInstitutionImageId(group)));
  assert.equal(loaded.get(massInstitutionImageId(group)).opts.pixelRatio,2);
}
class FailedImage{set src(_value){queueMicrotask(()=>this.onerror?.())}}
assert.deepEqual(await registerMassInstitutionImages(map,{win:{Image:FailedImage,document}}),[],
  "Network failures must leave circle markers available");

class HangingImage{set src(_value){/* network request never resolves */}}
const timers=[];
assert.deepEqual(await registerMassInstitutionImages(map,{win:{
  Image:HangingImage,document,
  setTimeout(fn){timers.push(fn);queueMicrotask(fn);return timers.length},
  clearTimeout(){},
},timeoutMs:500}),[],
  "An indefinitely stalled emblem must not hold the map hostage");
assert.equal(timers.length,MASS_EMBLEM_GROUPS.length);
console.log("Explore institutional emblems contract: pass");
