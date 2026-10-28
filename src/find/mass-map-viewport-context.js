// Counts actual source-approved mapped venues in the current map camera.
// Clusters are presentation only: count underlying features once, never the
// rendered cluster bubbles. No inferred coordinates or external geocoder.
export function mappedVenueViewportStats(features,bounds){
  const mapped=(Array.isArray(features)?features:[])
    .filter(feature=>feature?.geometry?.type==="Point"
      &&Array.isArray(feature.geometry.coordinates)
      &&feature.geometry.coordinates.length===2
      &&feature.geometry.coordinates.every(Number.isFinite));
  if(!bounds||typeof bounds.contains!=="function")
    return {visible:null,mapped:mapped.length};
  let visible=0;
  for(const feature of mapped){
    const [lng,lat]=feature.geometry.coordinates;
    // MapLibre can express a viewport that straddles the antimeridian in
    // wrapped longitude coordinates. Count one source feature at most once.
    try{
      if([lng,lng-360,lng+360].some(x=>bounds.contains([x,lat])))visible++;
    }catch{return {visible:null,mapped:mapped.length}}
  }
  return {visible,mapped:mapped.length};
}
export function mappedVenueViewportLabel(stats,language="en"){
  if(!stats||!Number.isInteger(stats.visible)||!Number.isInteger(stats.mapped)
    ||stats.visible<0||stats.mapped<0)return language==="fr"?"Dans cette vue : …":"In this view: …";
  return language==="fr"
    ?`Dans cette vue : ${stats.visible} / ${stats.mapped} lieux cartographiés`
    :`In this view: ${stats.visible} / ${stats.mapped} mapped venues`;
}
