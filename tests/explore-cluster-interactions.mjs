import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MASS_CLUSTER_GROUPS,CLUSTER_PAGE_SIZE,exploreClusterProperties,
  exploreClusterMajorityExpression,clusterPageBounds} from "../src/find/cluster-presentation.js";
import {registerExploreClusterBadge,exploreDistinctPointChoices,exploreMapFeatures}
  from "../src/find/map-runtime.js";
const props=exploreClusterProperties();
assert.deepEqual(Object.keys(props).sort(),MASS_CLUSTER_GROUPS.map(x=>"mass_"+x.toLowerCase()).sort());
for(const group of MASS_CLUSTER_GROUPS){
  const rule=props["mass_"+group.toLowerCase()];
  assert.equal(rule[0],"+");
  assert.equal(rule[1][0],"case");
  assert.deepEqual(rule[1][1],["all",["==",["get","lens"],"tlm"],
    ["==",["get","provider_group"],group]]);
}
const majority=exploreClusterMajorityExpression(x=>x);
assert.equal(majority[0],"case");
assert.equal(majority.at(-1),"MIXED","Undominated affiliations must get a MapLibre string, never null");
assert.equal(majority.length,2*MASS_CLUSTER_GROUPS.length+2);
assert.equal(majority[1][0],">");
assert.deepEqual(majority[1][1],["*",2,["get","mass_diocesan"]]);
assert.deepEqual(majority[1][2],["get","point_count"]);
let offset=0,passes=0;
while(offset<1879){
  const page=clusterPageBounds(1879,offset);
  assert.equal(page.offset,offset);
  assert.ok(page.limit<=CLUSTER_PAGE_SIZE&&page.limit>0);
  offset=page.nextOffset;
  passes++;
}
assert.equal(offset,1879,"No dense cluster venue may be dropped by paging");
assert.equal(passes,Math.ceil(1879/CLUSTER_PAGE_SIZE));
assert.deepEqual(clusterPageBounds(0),{offset:0,limit:0,total:0,nextOffset:0,hasMore:false});
assert.deepEqual(clusterPageBounds(11,40),{offset:11,limit:0,total:11,nextOffset:11,hasMore:false});
assert.equal(clusterPageBounds(250,0,1000).limit,100,"Block pathological cluster leaf requests");
const features=exploreMapFeatures([
  {item_id:"a",title:"Church A",lens:"tlm",community_id:"DIOCESAN",map_publishable:true,
    geo:{lat:48,lng:2,approximate:true}},
  {item_id:"b",title:"Church B",lens:"tlm",community_id:"ICKSP",map_publishable:true,
    geo:{lat:48,lng:2,approximate:false}},
]);
assert.equal(features.length,2);
const distinct=exploreDistinctPointChoices([...features,features[0]]);
assert.equal(distinct.length,2,"Overlapping venues must remain individually reachable");
assert.equal(distinct[0].provider_group,"DIOCESAN");
assert.equal(distinct[0].approximate,true);
assert.equal(distinct[1].provider_group,"ICKSP");
assert.equal(distinct[1].approximate,false);
const sprites=new Map();
const ctx={
  clearRect(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
  fill(){},stroke(){},fillRect(){},
  getImageData(x,y,w,h){return {width:w,height:h}},
  set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},
};
const document={createElement(type){
  assert.equal(type,"canvas");
  return {width:0,height:0,getContext(){return ctx}};
}};
const map={hasImage(id){return sprites.has(id)},
  addImage(id,data,options){sprites.set(id,{data,options})}};
assert.equal(registerExploreClusterBadge(map,{document}),true);
for(const group of ["DIOCESAN","FSSP","ICKSP","SSPX","IBP","OTHER","MIXED","PLACES"]){
  const badge=sprites.get("ao-explore-cluster-badge-"+group);
  assert.ok(badge,"Required source-derived badge missing for "+group);
  assert.equal(badge.options.pixelRatio,2);
}
assert.equal(sprites.size,8,"Every known group and mixed/heritage fallback must have its own colour");
assert.equal(registerExploreClusterBadge({},{}),false,"Non-browser tests must degrade gracefully");
const runtimeSource=readFileSync(new URL("../src/find/map-runtime.js",import.meta.url),"utf8");
assert.match(runtimeSource,/clusterProperties:exploreClusterProperties\(\)/);
assert.match(runtimeSource,/clusterBadgeReady=registerExploreClusterBadge/);
assert.match(runtimeSource,/getClusterLeaves\(clusterId,page.limit,page.offset\)/);
assert.doesNotMatch(runtimeSource,/getClusterLeaves\?\.\(clusterId,500,0\)/);
console.log("PASS Explore badges, cluster affiliation summaries and complete paged selection");
