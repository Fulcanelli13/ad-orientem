import { isApproximateDirectoryGeo, isMapPublishableGeo } from "./geo-provenance.js";
const MAPLIBRE_MODULE="https://unpkg.com/maplibre-gl@^6.13.0/dist/maplibre-gl.mjs";
const MAPLIBRE_CSS="https://unpkg.com/maplibre-gl@^6.13.0/dist/maplibre-gl.css";
const DEFAULT_STYLE="https://tiles.openfreemap.org/styles/dark";
export const MASS_MAP_GROUP_COLORS=Object.freeze({
  FSSP:"#c9ae75",ICKSP:"#aa9bc5",SSPX:"#85a9b7",IBP:"#b6aa94",
  DIOCESAN:"#87ac9b",OTHER:"#b8b1a2",
});
export function massMapProviderGroup(value){
  const key=String(value??"").toUpperCase();
  return Object.hasOwn(MASS_MAP_GROUP_COLORS,key)?key:"OTHER";
}
const POINT_COLOR=["match",["get","provider_group"],
  "FSSP",MASS_MAP_GROUP_COLORS.FSSP,
  "ICKSP",MASS_MAP_GROUP_COLORS.ICKSP,
  "SSPX",MASS_MAP_GROUP_COLORS.SSPX,
  "IBP",MASS_MAP_GROUP_COLORS.IBP,
  "DIOCESAN",MASS_MAP_GROUP_COLORS.DIOCESAN,
  MASS_MAP_GROUP_COLORS.OTHER];

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
        provider_group:massMapProviderGroup(record?.ministries?.[0]?.community_id),
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

export function exploreMapFeatures(items){
  const out=[];
  for(const item of Array.isArray(items)?items:[]){
    const g=item?.geo??{},lat=Number(g.lat),lng=Number(g.lng);
    if(!item?.map_publishable||!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lng)||lng<-180||lng>180)continue;
    out.push({
      type:"Feature",
      geometry:{type:"Point",coordinates:[lng,lat]},
      properties:{
        item_id:String(item.item_id??""),
        lens:String(item.lens??""),
        name:String(item.title??""),
        precision:String(g.precision??"unknown"),
        approximate:Boolean(g.approximate),
        provider_group:item?.lens==="tlm"?massMapProviderGroup(item?.community_id):"OTHER",
      },
    });
  }
  return out;
}

export function mapFitBounds(features){
  const points=(Array.isArray(features)?features:[]).map(f=>f?.geometry?.coordinates)
    .filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite));
  if(points.length<2)return null;
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const bounds=[[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]];
  if(bounds[1][0]-bounds[0][0]>300||bounds[1][1]-bounds[0][1]>140)return null;
  return bounds;
}
export function mapViewport(map){
  const center=map?.getCenter?.(),zoom=map?.getZoom?.();
  if(!center||!Number.isFinite(center.lng)||!Number.isFinite(center.lat)||!Number.isFinite(zoom))return null;
  return {center:[center.lng,center.lat],zoom};
}
export async function mountExploreMap(container,items,{
  win=globalThis,onSelect=()=>{},initialViewport=null,
}={}){
  const features=exploreMapFeatures(items);
  if(!container||!features.length||!win?.document)return null;
  ensureCss(win.document);
  const maplibre=await loadMapLibre(win);
  container.innerHTML="";
  const reducedMotion=win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
  const map=new maplibre.Map({
    container,
    style:win.AO_EXPLORE_MAP_STYLE_URL||win.AO_DIRECTORY_MAP_STYLE_URL||DEFAULT_STYLE,
    center:initialViewport?.center??[0,20],
    zoom:initialViewport?.zoom??1.2,
    attributionControl:true,
  });
  map.addControl?.(new maplibre.NavigationControl({showCompass:false}),"top-right");
  if(maplibre.FullscreenControl)map.addControl?.(new maplibre.FullscreenControl({pseudo:true}),"top-right");
  map.on("load",()=>{
    const sourceId="ao-explore-items",prefix="ao-explore";
    map.addSource(sourceId,{type:"geojson",data:{type:"FeatureCollection",features},
      cluster:true,clusterMaxZoom:12,clusterRadius:52});
    map.addLayer({id:prefix+"-cluster-halo",type:"circle",source:sourceId,filter:["has","point_count"],
      paint:{"circle-radius":["step",["get","point_count"],23,20,29,100,35],
        "circle-color":"#101924","circle-stroke-color":"#d7c294",
        "circle-stroke-opacity":0.35,"circle-stroke-width":1.5,"circle-opacity":0.91}});
    map.addLayer({id:prefix+"-clusters",type:"circle",source:sourceId,filter:["has","point_count"],
      paint:{"circle-radius":["step",["get","point_count"],18,20,24,100,30],
        "circle-color":"#c9b388","circle-opacity":0.95}});
    map.addLayer({id:prefix+"-cluster-count",type:"symbol",source:sourceId,filter:["has","point_count"],
      layout:{"text-field":["get","point_count_abbreviated"],"text-size":12},
      paint:{"text-color":"#080c12"}});
    map.addLayer({id:prefix+"-points",type:"circle",source:sourceId,filter:["!",["has","point_count"]],
      paint:{"circle-radius":["case",["get","approximate"],6,8],
        "circle-color":POINT_COLOR,
        "circle-opacity":["case",["get","approximate"],0.65,0.97],
        "circle-stroke-width":["case",["get","approximate"],1.6,2.4],
        "circle-stroke-color":["case",["get","approximate"],"#17212d","#f0e7d4"]}});
    if(!initialViewport){
      const bounds=mapFitBounds(features);
      if(bounds)map.fitBounds(bounds,{padding:48,maxZoom:10,duration:0});
      else if(features.length===1)map.jumpTo({center:features[0].geometry.coordinates,zoom:9});
    }
    map.on("click",prefix+"-points",event=>{
      const id=event.features?.[0]?.properties?.item_id;
      if(id)onSelect(id);
    });
    map.on("click",prefix+"-clusters",async event=>{
      const feature=event.features?.[0],clusterId=feature?.properties?.cluster_id,
        source=map.getSource(sourceId);
      if(clusterId===undefined||!source?.getClusterExpansionZoom)return;
      try{
        const zoom=await source.getClusterExpansionZoom(clusterId);
        const coords=feature.geometry?.coordinates;
        if(coords)map.easeTo({center:coords,zoom,duration:reducedMotion?0:420});
      }catch{}
    });
    for(const layer of [prefix+"-points",prefix+"-clusters"]){
      map.on("mouseenter",layer,()=>{map.getCanvas().style.cursor="pointer"});
      map.on("mouseleave",layer,()=>{map.getCanvas().style.cursor=""});
    }
  });
  return Object.freeze({map,destroy(){try{map.remove()}catch{}}});
}

export const FIND_MAP_RUNTIME=Object.freeze({module:MAPLIBRE_MODULE,style:DEFAULT_STYLE});
