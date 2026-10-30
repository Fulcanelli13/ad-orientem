// Pure, source-derived summaries used by MapLibre's GeoJSON clustering.
// Group membership is never inferred from proximity, juridical standing, or una-cum practice.
export const MASS_CLUSTER_GROUPS=Object.freeze(["DIOCESAN","FSSP","ICKSP","SSPX","IBP","AASJMV","OTHER"]);
export const CLUSTER_PAGE_SIZE=36;
export function exploreClusterProperties(){
  return Object.fromEntries(MASS_CLUSTER_GROUPS.map(group=>[
    "mass_"+group.toLowerCase(),
    ["+",["case",["all",
      ["==",["get","lens"],"tlm"],
      ["==",["get","provider_group"],group]],1,0]]
  ]));
}
// These are based on the complete Supercluster aggregate, not the first N leaves.
// A cluster with no absolute majority is labelled MIXED, not misleadingly
// assigned to whichever group happens to be drawn on top.
export function exploreClusterMajorityExpression(valueForGroup){
  const pairs=[];
  for(const group of MASS_CLUSTER_GROUPS){
    pairs.push([">",["*",2,["get","mass_"+group.toLowerCase()]],["get","point_count"]],
      valueForGroup(group));
  }
  // Typed string fallback: MapLibre rejects null inside a string-valued
  // symbol/icon expression, silently removing the entire cluster layer.
  return ["case",...pairs,"MIXED"];
}
export function clusterPageBounds(total,offset=0,pageSize=CLUSTER_PAGE_SIZE){
  const count=Math.max(0,Math.floor(Number(total)||0));
  const size=Math.max(1,Math.min(100,Math.floor(Number(pageSize)||CLUSTER_PAGE_SIZE)));
  const start=Math.min(count,Math.max(0,Math.floor(Number(offset)||0)));
  return Object.freeze({offset:start,limit:Math.min(size,count-start),total:count,
    nextOffset:Math.min(count,start+size),hasMore:start+size<count});
}
export function clusterChoiceDescription({provider_group="OTHER",approximate=false}={}){
  const known=MASS_CLUSTER_GROUPS.includes(provider_group)?provider_group:"OTHER";
  return Object.freeze({group:known,approximate:Boolean(approximate)});
}
