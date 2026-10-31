import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49} from "../src/find/preliminary-directory-r49.js";
import {
  MASS_EMBLEM_GROUPS,MASS_INSTITUTION_EMBLEMS,massInstitutionEmblem,
  massInstitutionImageId,registerMassInstitutionImages,
} from "../src/find/institution-emblems.js";
import { exploreMapFeatures, MASS_MAP_GROUP_COLORS } from "../src/find/map-runtime.js";
import {renderDirectoryIdentityFallback} from "../src/find/directory-card.js";
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

// Source-reported affiliation, not ecclesial proof. All current R49 records
// get either their exact-source provider emblem or the neutral church fallback.
const r49=JSON.parse(readFileSync(new URL("../data/directory/preliminary-map-r49.v1.json",import.meta.url),"utf8"));
const provisionalSites=projectPreliminaryR49(r49);
const pictured=provisionalSites.filter(item=>massInstitutionEmblem(item.community_id));
const neutral=provisionalSites.filter(item=>!massInstitutionEmblem(item.community_id));
assert.equal(provisionalSites.length,1879);
assert.equal(pictured.length,1188,"Do not lose exact-source institute emblems; sister communities have separate identities");
assert.equal(neutral.length,691,"Do not fabricate institute logos for other sources or reuse SSPX arms for distinct sister communities");
assert.equal(provisionalSites.filter(x=>x.community_id==="SSPX").length,729);
assert.equal(provisionalSites.filter(x=>x.community_id==="SSPX_SISTERS").length,3,
  "Three source-named sister-community venues must remain separate from SSPX priestly houses");
assert.ok(provisionalSites.filter(x=>x.community_id==="SSPX_SISTERS").every(x=>
  x.preliminary_group==="SSPX"&&massInstitutionEmblem(x.community_id)===null),
  "Do not infer sister-community insignia from source-group classification");
assert.equal(provisionalSites.filter(x=>x.community_id==="FSSP").length,307);
assert.equal(provisionalSites.filter(x=>x.community_id==="ICKSP").length,128);
assert.equal(provisionalSites.filter(x=>x.community_id==="IBP").length,19);
assert.equal(provisionalSites.filter(x=>x.community_id==="AASJMV").length,5);

// Preserve distinct named source affiliates even without an exact emblem.
// R49 source group UNKNOWN stays UNKNOWN; the name-only mapping is never a
// classification of ecclesial position or individual Masses.
const sourceNamedGroups=new Map([
 ["Canons of St John Cantius",["CANONS_ST_JOHN_CANTIUS",2]],
 ["Capucins de Morgon",["CAPUCHINS_MORGON",5]],
 ["Fraternité de la Transfiguration",["TRANSFIGURATION",5]],
 ["Oratorians",["ORATORIAN",5]],
 ["Carmélites",["CARMELITE",4]],
 ["Bénédictines",["BENEDICTINE",1]],
 ["Dominicains",["DOMINICAN",1]],
]);
for(const [sourceLabel,[code,expected]] of sourceNamedGroups){
 const items=provisionalSites.filter(x=>x.eyebrow===sourceLabel);
 assert.equal(items.length,expected,sourceLabel+" source count");
 assert.equal(items.filter(x=>x.community_id===code).length,expected,sourceLabel+" group code");
 for(const item of items){
  assert.equal(item.affiliation_scope,"SOURCE_LABEL_ONLY");
  assert.equal(massInstitutionEmblem(item.community_id),null,"Uncleared heraldry must not be published");
  const fallback=renderDirectoryIdentityFallback(item,"en","preview");
  assert.match(fallback,/data-visual-kind="named"/);
  assert.ok(fallback.includes(sourceLabel),"Preserve the original source's community name");
  assert.doesNotMatch(fallback,/<img /,"No unrelated heraldic substitute");
 }
}
const noInventedLogo=renderDirectoryIdentityFallback({
  community_id:"CMRI",eyebrow:"CMRI directory / affiliated clergy"
},"en","card");
assert.match(noInventedLogo,/data-visual-kind="named"/);
assert.doesNotMatch(noInventedLogo,/CMRI_emblem\.(png|svg)/);
assert.match(renderDirectoryIdentityFallback({community_id:"DIOCESAN",eyebrow:"Diocesan"}),/data-visual-kind="neutral"/);
const researchQueue=JSON.parse(readFileSync(new URL("../data/directory/research/tlm-emblem-acquisition-queue-20261030.v1.json",import.meta.url),"utf8"));
assert.equal(researchQueue.schema,"AO_TLM_EMBLEM_ACQUISITION_QUEUE_V1");
assert.equal(researchQueue.groups.length,41);
assert.equal(researchQueue.cl2_source_affiliation_audit.distinct_source_labels,138);
assert.equal(researchQueue.cl2_source_affiliation_audit.venue_source_rows,2687);
assert.equal(researchQueue.cl2_source_affiliation_audit.labels.reduce((n,x)=>n+x.venue_source_rows,0),2687);
assert.equal(researchQueue.groups.filter(x=>x.state==="EXACT_CANDIDATE_IN_DRAFT").length,5);
assert.equal(researchQueue.groups.find(x=>x.group_code==="CMRI").rights,"THIRD_PARTY_IMAGE_RIGHTS_NOT_CLEARED");

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

// Institute filter stays compact for a 320px phone; community names are
// legible while stable source group codes are retained for search/filtering.
for(const lang of ["en","fr"]){
 const items=["FSSP","CANONS_ST_JOHN_CANTIUS","BENEDICTINE","SSPX_SISTERS"].map((id,j)=>({
  kind:"TLM_VENUE",item_id:"test:"+j,source_id:"test:"+j,lens:"tlm",
  title:"Test venue "+j,community_id:id,preliminary_group:"ROME",
  search_text:"test",geo:null,map_publishable:false,source_links:[],
 }));
 const html=renderExploreToString(buildExploreViewModel({
  lens:"tlm",items,view:"list",filters:{affiliations:[],directoryGroup:"ALL"},language:lang,
 }));
 assert.match(html,/class="aoTlmMoreInstitutes"/);
 assert.match(html,/data-find-affiliation="CANONS_ST_JOHN_CANTIUS"/);
 assert.match(html,/data-find-affiliation="BENEDICTINE"/);
 assert.match(html,/data-find-affiliation="SSPX_SISTERS"/);
 assert.doesNotMatch(html,/>CANONS_ST_JOHN_CANTIUS</);
 assert.doesNotMatch(html,/>SSPX_SISTERS</);
 assert.match(html,lang==="fr"?/Autres communautés/:/Other communities/);
 assert.match(html,lang==="fr"?/Bénédictins/:/Benedictines/);
 assert.match(html,lang==="fr"?/Chanoines de Saint-Jean-de-Cantius/:/Canons of St John Cantius/);
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
