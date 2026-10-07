import { isApproximateDirectoryGeo, isMapPublishableGeo } from "./geo-provenance.js";
const MAPLIBRE_MODULE="https://unpkg.com/maplibre-gl@^6.13.0/dist/maplibre-gl.mjs";
const MAPLIBRE_CSS="https://unpkg.com/maplibre-gl@^6.13.0/dist/maplibre-gl.css";
const DEFAULT_STYLE="https://tiles.openfreemap.org/styles/liberty";

export function directoryMapFeatures(records){
  const out=[];
  for(const record of Array.isArray(records)?records:[]){
    const venue=record?.venue??{},g=venue?.geo??{};
    if(!isMapPublishableGeo(g,venue?.address?.country_code))continue;
    out.push({
      type:"Feature",
      geometry:{type:"Point",coordinates:[Number(g.lng),Number(g.lat)]},
      properties:{
        venue_id:venue.venue_id,
        name:venue?.name?.official??"",
        precision:String(g.precision??"unknown"),
        approximate:isApproximateDirectoryGeo(g),
        geocoding_source:String(g.geocoding_source??""),
      },
    });
  }
  return out;
}
function ensureCss(doc){
  if(doc?.getElementById?.("ao-find-maplibre-css"))return;
  const link=doc?.createElement?.("link");if(!link)return;
  link.id="ao-find-maplibre-css";link.rel="stylesheet";link.href=MAPLIBRE_CSS;doc.head?.append?.(link);
}
async function loadMapLibre(win){
  if(win?.AO_FIND_MAPLIBRE_MODULE)return win.AO_FIND_MAPLIBRE_MODULE;
  const mod=await import(MAPLIBRE_MODULE);
  win.AO_FIND_MAPLIBRE_MODULE=mod;
  return mod;
}
export async function mountFindMap(container,records,{win=globalThis,onSelect=()=>{}}={}){
  const features=directoryMapFeatures(records);
  if(!container||!features.length||!win?.document)return null;
  ensureCss(win.document);
  const maplibre=await loadMapLibre(win);
  container.innerHTML="";
  const map=new maplibre.Map({
    container,
    style:win.AO_DIRECTORY_MAP_STYLE_URL||DEFAULT_STYLE,
    center:[0,20],
    zoom:1.2,
    attributionControl:true,
  });
  map.addControl?.(new maplibre.NavigationControl({showCompass:false}),"top-right");
  map.on("load",()=>{
    map.addSource("ao-venues",{type:"geojson",data:{type:"FeatureCollection",features},cluster:true,clusterMaxZoom:10,clusterRadius:48});
    map.addLayer({id:"ao-clusters",type:"circle",source:"ao-venues",filter:["has","point_count"],paint:{"circle-radius":["step",["get","point_count"],18,25,24,100,30],"circle-color":"#a98b55","circle-opacity":0.82}});
    map.addLayer({id:"ao-cluster-count",type:"symbol",source:"ao-venues",filter:["has","point_count"],layout:{"text-field":["get","point_count_abbreviated"],"text-size":12},"paint":{"text-color":"#080c12"}});
    map.addLayer({id:"ao-points",type:"circle",source:"ao-venues",filter:["!",["has","point_count"]],paint:{"circle-radius":["case",["get","approximate"],6,7],"circle-color":"#d9c59a","circle-opacity":["case",["get","approximate"],0.5,0.9],"circle-stroke-width":1,"circle-stroke-color":"#080c12"}});
    map.on("click","ao-points",event=>{
      const id=event.features?.[0]?.properties?.venue_id;
      if(id)onSelect(id);
    });
    map.on("click","ao-clusters",async event=>{
      const feature=event.features?.[0],clusterId=feature?.properties?.cluster_id,source=map.getSource("ao-venues");
      if(clusterId===undefined||!source?.getClusterExpansionZoom)return;
      const zoom=await source.getClusterExpansionZoom(clusterId);
      map.easeTo({center:feature.geometry.coordinates,zoom});
    });
  });
  return Object.freeze({map,destroy(){try{map.remove()}catch{}}});
}
export const FIND_MAP_RUNTIME=Object.freeze({module:MAPLIBRE_MODULE,style:DEFAULT_STYLE});
