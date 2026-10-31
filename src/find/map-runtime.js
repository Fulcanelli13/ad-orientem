import {attachAtlasCoverageLayers} from "./mapcn-atlas-controller.js";
import { isApproximateDirectoryGeo, isMapPublishableGeo } from "./geo-provenance.js";
import { attachExploreMapStatus } from "./map-status.js";
import { mappedVenueViewportStats } from "./mass-map-viewport-context.js";
import { applyExploreDarkCartography } from "./explore-cartography-style.js";
import { registerMassInstitutionImages, massInstitutionEmblem } from "./institution-emblems.js";
import { installMassMapEmblemOverlays } from "./institution-map-overlay.js";
import {
  registerExploreCategoryMedallions,exploreCategoryMedallionExpression,
  EXPLORE_MEDALLION_ID_PREFIX,
} from "./explore-map-medallions.js";
import { MASS_CLUSTER_GROUPS,CLUSTER_PAGE_SIZE,exploreClusterProperties,
  exploreClusterMajorityExpression,clusterPageBounds } from "./cluster-presentation.js";
const MAPLIBRE_MODULE="https://unpkg.com/maplibre-gl@^6.13.0/dist/maplibre-gl.mjs";
const MAPLIBRE_CSS="https://unpkg.com/maplibre-gl@^6.13.0/dist/maplibre-gl.css";
const DEFAULT_STYLE="https://tiles.openfreemap.org/styles/dark";
// OpenFreeMap Dark serves Noto Sans glyphs. MapLibre’s implicit default
// requests an absent Open Sans/Arial Unicode font stack (HTTP 404), delaying
// our own labels and cluster counts even though the provider labels work.
export function defaultExploreGlyphStack(style,styleOverride=null){
  return style===DEFAULT_STYLE&&!styleOverride?["Noto Sans Regular"]:null;
}
// Web Mercator has finite latitude, and the atlas intentionally has one world.
// MapLibre's default wrapped copies make multiple apparent Europes/Africas at
// low zoom. Keep every physical Place on a single world, including after re-renders.
export const EXPLORE_WORLD_BOUNDS=Object.freeze([Object.freeze([-179.99,-85.051129]),Object.freeze([179.99,85.051129])]);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function boundedWorldViewport(viewport=null){
  const rawCenter=Array.isArray(viewport?.center)?viewport.center:[0,16];
  const longitude=Number(rawCenter[0]),latitude=Number(rawCenter[1]),zoom=Number(viewport?.zoom);
  return Object.freeze({
    center:[clamp(Number.isFinite(longitude)?longitude:0,-179.99,179.99),clamp(Number.isFinite(latitude)?latitude:16,-85,85)],
    zoom:clamp(Number.isFinite(zoom)?zoom:1,0,18),
  });
}
export function boundedWorldMapOptions(viewport=null){
  const position=boundedWorldViewport(viewport);
  return {
    center:position.center,zoom:position.zoom,
    // A full 360-degree maxBounds span triggers a MapLibre singular camera
    // matrix; 359.98 degrees avoids it while retaining the finite world.
    renderWorldCopies:false,
    maxBounds:EXPLORE_WORLD_BOUNDS.map(pair=>[...pair]),
    minZoom:0,maxZoom:18,
    maxPitch:0,dragRotate:false,touchPitch:false,
  };
}

// Electric outline/selection palette; actual institute identity is the emblem sprite.
export const MASS_MAP_GROUP_COLORS=Object.freeze({
  FSSP:"#00E5FF",ICKSP:"#BC65FF",SSPX:"#347CFF",IBP:"#FF9D24",
  AASJMV:"#21CFB7",
  DIOCESAN:"#A3FF12",OTHER:"#93A3B9",
});
export function massMapProviderGroup(value){
  const key=String(value??"").toUpperCase();
  return Object.hasOwn(MASS_MAP_GROUP_COLORS,key)?key:"OTHER";
}
const HERITAGE_POINT_COLOR=["match",["get","heritage_primary"],
  "shrines","#FFBF2E","relics","#B65CFF","pilgrimages","#00E6A7",
  "apparitions","#23B8FF","traditions","#FF5497","#93A3B9"];
const POINT_COLOR=["match",["get","provider_group"],
  "FSSP",MASS_MAP_GROUP_COLORS.FSSP,
  "ICKSP",MASS_MAP_GROUP_COLORS.ICKSP,
  "SSPX",MASS_MAP_GROUP_COLORS.SSPX,
  "IBP",MASS_MAP_GROUP_COLORS.IBP,
  "AASJMV",MASS_MAP_GROUP_COLORS.AASJMV,
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
    ...boundedWorldMapOptions(),
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
      try{
        const zoom=await source.getClusterExpansionZoom(clusterId);
        const currentZoom=map.getZoom?.()??0;
        if(zoom<=10&&currentZoom<10){
          map.easeTo({center:feature.geometry.coordinates,zoom});
          return;
        }
        // Several country-only indicators can share a geographic reference point.
        // Never make those chapels inaccessible by stacking unclickable markers.
        const leaves=await source.getClusterLeaves(clusterId,100,0);
        if(!leaves?.length)return;
        const list=win.document.createElement("div");
        list.className="aoFindClusterChoice";
        list.style.cssText="max-height:260px;min-width:220px;overflow:auto;padding:8px;color:#18212b";
        const title=win.document.createElement("strong");
        title.textContent="Select a chapel · Choisir une chapelle";
        list.append(title);
        for(const leaf of leaves){
          const id=leaf?.properties?.venue_id;if(!id)continue;
          const btn=win.document.createElement("button");
          btn.type="button";btn.textContent=leaf.properties.name||"Mass location";
          btn.style.cssText="display:block;width:100%;padding:8px 3px;text-align:left;border:0;border-bottom:1px solid #ddd;background:transparent;cursor:pointer";
          btn.addEventListener("click",()=>onSelect(id));
          list.append(btn);
        }
        if(Number(feature.properties?.point_count)>leaves.length){
          const note=win.document.createElement("small");
          note.textContent="More locations: use the search/list view · Autres lieux : utilisez la liste";
          list.append(note);
        }
        if(maplibre.Popup)new maplibre.Popup({closeButton:true,maxWidth:"340px"})
          .setLngLat(feature.geometry.coordinates).setDOMContent(list).addTo(map);
      }catch{}
    });
  });
  return Object.freeze({map,destroy(){try{map.remove()}catch{}}});
}

export function exploreMapFeatures(items){
  const out=[];
  const relicPlaces=new Set();
  for(const item of Array.isArray(items)?items:[]){
    const g=item?.geo??{},lat=Number(g.lat),lng=Number(g.lng);
    if(!item?.map_publishable||!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lng)||lng<-180||lng>180)continue;
    // One map marker per physical relic custodian; individual records remain available in place profiles.
    if(item.lens==="relics"&&item.place_id){
      if(relicPlaces.has(item.place_id))continue;
      relicPlaces.add(item.place_id);
    }
    out.push({
      type:"Feature",
      geometry:{type:"Point",coordinates:[lng,lat]},
      properties:{
        item_id:String(item.item_id??""),
        lens:String(item.lens??""),
        heritage_primary:String(item.heritage_primary??""),
        place_type:String(item.place_type??"other"),
        name:String(item.title??""),
        ...(typeof item.atlas_label==="string"&&item.atlas_label.trim()&&item.atlas_label_basis==="existing_settlement_anchor"
         ?{atlas_label:item.atlas_label.trim()}:{}),
        precision:String(g.precision??"unknown"),
        approximate:Boolean(g.approximate||g.indicative_only),
        indicative_only:Boolean(g.indicative_only),
        provider_group:item?.lens==="tlm"?massMapProviderGroup(item?.community_id):"OTHER",
      },
    });
  }
  return out;
}

// Cluster expansion eventually stops, but distinct Places can still occupy the
// same touch target at street zoom. Never let a drawn-on-top marker hide its peers.
export function exploreDistinctPointChoices(features){
  const seen=new Set(),choices=[];
  for(const feature of Array.isArray(features)?features:[]){
    const properties=feature?.properties??{},id=String(properties.item_id??"");
    if(!id||seen.has(id))continue;
    seen.add(id);
    choices.push({item_id:id,name:String(properties.name??"").trim()||"Sacred place",
      lens:String(properties.lens??""),provider_group:massMapProviderGroup(properties.provider_group),
      approximate:properties.approximate===true||properties.approximate==="true"});
  }
  return choices;
}
// A quiet circular bubble, not a geometric dashboard counter.
// Affiliation accents are source-derived; clusters never impersonate a venue.
export const EXPLORE_CLUSTER_BADGE_COLORS=Object.freeze({
  ...MASS_MAP_GROUP_COLORS,MIXED:"#C4AB78",PLACES:"#C4AB78",
});
export function registerExploreClusterBadge(map,win=globalThis){
  if(!win?.document?.createElement||!map?.addImage)return false;
  const canvas=win.document.createElement("canvas");
  canvas.width=96;canvas.height=96; // 48 CSS px at pixelRatio 2
  const ctx=canvas.getContext?.("2d");
  if(!ctx)return false;
  try{
    for(const group of Object.keys(EXPLORE_CLUSTER_BADGE_COLORS)){
      ctx.clearRect(0,0,96,96);
      ctx.beginPath();ctx.arc(48,48,37,0,Math.PI*2);
      ctx.fillStyle="#10212C";ctx.fill();
      ctx.lineWidth=4;ctx.strokeStyle="#CAB17C";ctx.stroke();
      if(group!=="MIXED"&&group!=="PLACES"&&group!=="OTHER"){
        ctx.beginPath();ctx.arc(48,48,37,-Math.PI/2-0.18,-Math.PI/2+0.18);
        ctx.lineWidth=6;ctx.strokeStyle=EXPLORE_CLUSTER_BADGE_COLORS[group];ctx.stroke();
      }
      const id="ao-explore-cluster-badge-"+group;
      if(!map.hasImage?.(id))map.addImage(id,ctx.getImageData(0,0,96,96),{pixelRatio:2});
    }
    return true;
  }catch{return false;}
}
function explorePlaceChoicePopup({win,map,maplibre,coordinates,choices,onSelect,
  total=choices.length,fetchMore=null,initialOffset=choices.length}){
  if((choices.length<2&&!fetchMore)||!maplibre.Popup||!win?.document)return false;
  const doc=win.document,fr=win.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
  const list=doc.createElement("div");
  list.className="aoExplorePlaceChoices";
  list.style.cssText="max-height:min(62dvh,420px);min-width:min(280px,72vw);max-width:min(360px,84vw);overflow:auto;padding:9px;color:#e8f4ff;background:#0b1622;border-radius:8px";
  list.setAttribute("role","group");
  const title=doc.createElement("strong");
  title.textContent=fr?"Lieux à cet endroit":"Places at this location";
  title.style.cssText="display:block;padding:7px 6px 9px;font:600 14px/1.3 system-ui,sans-serif";
  list.append(title);
  const count=doc.createElement("small");
  count.style.cssText="display:block;padding:0 6px 8px;color:#92bacc";
  count.textContent=String(total)+" "+(fr?"lieux répertoriés":"listed places");
  list.append(count);
  const popup=new maplibre.Popup({closeButton:true,maxWidth:"390px"});
  const seen=new Set();
  function appendChoices(rows){
    for(const choice of rows){
      if(!choice.item_id||seen.has(choice.item_id))continue;
      seen.add(choice.item_id);
      const button=doc.createElement("button");
      button.type="button";
      button.style.cssText="display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:9px 7px;text-align:left;border:0;border-top:1px solid #294153;background:transparent;color:#ecf8ff;cursor:pointer";
      const emblem=choice.lens==="tlm"?massInstitutionEmblem(choice.provider_group):null;
      if(emblem){
        const img=doc.createElement("img");img.src=emblem.image;img.alt="";
        img.style.cssText="flex:none;object-fit:contain;width:29px;height:29px";
        button.append(img);
      }
      const description=doc.createElement("span");
      description.style.cssText="display:flex;flex-direction:column;gap:3px;min-width:0";
      const name=doc.createElement("span");
      name.textContent=choice.name;
      name.style.cssText="font:600 13px/1.3 system-ui,sans-serif";
      description.append(name);
      if(choice.lens==="tlm"){
        const category=doc.createElement("small");
        category.textContent=(choice.provider_group==="OTHER"?(fr?"Affiliation non précisée":"Affiliation unspecified"):choice.provider_group)
          +(choice.approximate?(fr?" · position indicative":" · approximate pin"):"");
        category.style.cssText="color:#a7c8d8;font:11px/1.25 system-ui,sans-serif";
        description.append(category);
      }
      button.append(description);
      button.setAttribute("aria-label",choice.name);
      button.addEventListener("click",()=>{popup.remove?.();onSelect(choice.item_id)});
      list.append(button);
    }
  }
  appendChoices(choices);
  let offset=initialOffset;
  if(fetchMore&&offset<total){
    const loadMore=doc.createElement("button");
    loadMore.type="button";
    loadMore.style.cssText="display:block;width:100%;min-height:46px;margin-top:7px;padding:8px;background:#123548;border:1px solid #18b6e0;border-radius:8px;color:#e9faff;font:600 13px system-ui,sans-serif;cursor:pointer";
    const label=()=>fr?`Afficher plus · ${Math.min(offset,total)}/${total}`:`Show more · ${Math.min(offset,total)}/${total}`;
    loadMore.textContent=label();
    loadMore.addEventListener("click",async()=>{
      if(loadMore.disabled)return;
      loadMore.disabled=true;loadMore.textContent=fr?"Chargement…":"Loading…";
      try{
        const next=await fetchMore(offset);
        // Offset tracks returned leaves, not only distinct IDs. The source
        // can legitimately yield two records with the same display name.
        if(!next.length){loadMore.remove();return}
        offset+=next.length;
        loadMore.remove();appendChoices(next);
        if(offset<total){loadMore.disabled=false;loadMore.textContent=label();list.append(loadMore)}
      }catch{
        loadMore.disabled=false;loadMore.textContent=fr?"Réessayer":"Retry";
      }
    });
    list.append(loadMore);
  }
  popup.setLngLat(coordinates).setDOMContent(list).addTo(map);
  popup.getElement?.()?.classList?.add("aoExploreDarkPopup");
  return true;
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
// A phone cannot display an almost global Place corpus at zoom 1: clusters
// at the sides become half-circles with no usable touch centre. Use a bounded,
// one-copy geographic overview with explicit space for the largest 35px halo.
// Coordinates and per-place publication authority are never changed.
export function explorePhoneOverview(features,width){
  if(!Number.isFinite(width)||width<250||width>430)return null;
  const points=(Array.isArray(features)?features:[]).map(f=>f?.geometry?.coordinates)
    .filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite));
  if(points.length<2)return null;
  const west=Math.min(...points.map(p=>p[0])),east=Math.max(...points.map(p=>p[0]));
  // Only wide-world collections need this exception; regional maps retain
  // their existing automatic fit or previously restored camera.
  if(east-west<=240)return null;
  const south=Math.min(...points.map(p=>p[1])),north=Math.max(...points.map(p=>p[1]));
  const edge=width<=350?52:width<=400?54:58;
  // MapLibre fitBounds may choose the *short* route across the date line
  // for a nearly global west/east pair. Compute a nonwrapping camera instead.
  // 512 CSS pixels is the world width at zoom 0 in Web Mercator.
  const usable=Math.max(1,width-2*edge);
  const zoom=Math.log2(usable*360/(512*(east-west)));
  return {
    center:[(west+east)/2,(south+north)/2],
    zoom:Math.max(-2,Math.min(10,zoom)),
    edge,
    west,east,
  };
}
export function mapViewport(map){
  const center=map?.getCenter?.(),zoom=map?.getZoom?.();
  if(!center||!Number.isFinite(center.lng)||!Number.isFinite(center.lat)||!Number.isFinite(zoom))return null;
  return boundedWorldViewport({center:[center.lng,center.lat],zoom});
}
export async function mountExploreMap(container,items,{
  win=globalThis,onSelect=()=>{},initialViewport=null,allowEmpty=false,
  styleOverride=null,atlasCoverage=null,atlasMode="places",onAtlasCountry=()=>{},
}={}){
  let features=exploreMapFeatures(items);
  if(!container||(!features.length&&!allowEmpty)||!win?.document)return null;
  ensureCss(win.document);
  const maplibre=await loadMapLibre(win);
  container.innerHTML="";
  const reducedMotion=win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
  const phoneWidth=Number(container.getBoundingClientRect?.().width||container.clientWidth||0);
  const phoneOverview=!initialViewport?explorePhoneOverview(features,phoneWidth):null;
  const camera=boundedWorldMapOptions(initialViewport);
  if(phoneOverview){
    camera.minZoom=-2;
    delete camera.maxBounds;
    camera.center=phoneOverview.center;
    camera.zoom=phoneOverview.zoom;
  }
  const compactAttribution=phoneWidth>0&&phoneWidth<=430&&typeof maplibre.AttributionControl==="function";
  const selectedStyle=styleOverride??win.AO_EXPLORE_MAP_STYLE_URL??win.AO_DIRECTORY_MAP_STYLE_URL??DEFAULT_STYLE;
  const glyphStack=defaultExploreGlyphStack(selectedStyle,styleOverride);
  const map=new maplibre.Map({
    container,
    style:selectedStyle,
    ...camera,
    attributionControl:!compactAttribution,
  });
  if(compactAttribution)map.addControl?.(new maplibre.AttributionControl({compact:true}),"bottom-left");
  if(phoneOverview){
    map.on?.("moveend",()=>{
      const position=map.getCenter?.();
      if(!position)return;
      const lng=clamp(position.lng,-179.99,179.99);
      const lat=clamp(position.lat,-85,85);
      if(Math.abs(lng-position.lng)>0.01||Math.abs(lat-position.lat)>0.01)
        map.jumpTo?.({center:[lng,lat],zoom:map.getZoom?.()});
    });
  }
  map.addControl?.(new maplibre.NavigationControl({showCompass:false}),"top-right");
  if(maplibre.FullscreenControl)map.addControl?.(new maplibre.FullscreenControl({pseudo:true}),"top-right");
  const visualStatus=attachExploreMapStatus(container,map,{win});
  let emblemOverlays=null;
  if(features.some(feature=>feature.properties?.lens==="tlm")){
    const reset=win.document.createElement("button");
    reset.type="button";reset.className="aoExploreMapReset";
    reset.setAttribute("data-explore-map-reset","");
    const fr=win.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
    reset.textContent=fr?"Tous les lieux":"All mapped";
    reset.setAttribute("aria-label",fr?"Afficher tous les lieux cartographiés correspondant aux filtres":"Show all matching mapped venues");
    reset.addEventListener("click",()=>{
      const bounds=mapFitBounds(features);
      const duration=reducedMotion?0:360;
      if(phoneOverview)map.easeTo({center:phoneOverview.center,zoom:phoneOverview.zoom,duration});
      else if(bounds)map.fitBounds(bounds,{padding:48,maxZoom:10,duration});
      else map.easeTo({center:[0,16],zoom:1,duration});
    });
    container.append?.(reset);
  }
  map.on("load",()=>{
    // Default heritage map only: improve OpenFreeMap Dark typography and
    // land/sea contrast before drawing source-owned Places and medallions.
    // The Bible Atlas, special-rite maps and custom styles remain untouched.
    if(selectedStyle===DEFAULT_STYLE&&!styleOverride){
      const palette=applyExploreDarkCartography(map);
      // Exposes paint completion for real Chromium acceptance, not a user
      // setting; no success claim for missing or changed provider layers.
      if(palette.applied>=10)container.dataset.aoCartography="enhanced-dark";
    }
    const sourceId="ao-explore-items",prefix="ao-explore";
    map.addSource(sourceId,{type:"geojson",data:{type:"FeatureCollection",features},
      cluster:true,clusterMaxZoom:12,clusterRadius:52,
      clusterProperties:exploreClusterProperties()});
    const clusterBadgeReady=registerExploreClusterBadge(map,win);
    const categoryEmblemsReady=!styleOverride&&registerExploreCategoryMedallions(map,win);
    // The ~50px cluster hit surface and scalable circular bubble are separate.
    map.addLayer({id:prefix+"-cluster-halo",type:"circle",source:sourceId,filter:["has","point_count"],
      paint:{"circle-radius":25,"circle-color":"#10212C",
        "circle-stroke-color":"#CAB17C","circle-stroke-opacity":clusterBadgeReady?0:0.9,
        "circle-stroke-width":clusterBadgeReady?0:2,"circle-opacity":clusterBadgeReady?0.005:0.92}});
    map.addLayer({id:prefix+"-clusters",type:"circle",source:sourceId,filter:["has","point_count"],
      paint:{"circle-radius":24,"circle-color":"#10212C",
        "circle-opacity":clusterBadgeReady?0.005:0.94}});
    map.addLayer({id:prefix+"-cluster-count",type:"symbol",source:sourceId,filter:["has","point_count"],
      layout:{"text-field":["get","point_count_abbreviated"],"text-size":12,
        ...(glyphStack?{"text-font":glyphStack}:{}),
        "visibility":clusterBadgeReady?"none":"visible"},
      paint:{"text-color":"#F0DEB5"}});
    if(clusterBadgeReady){
      const majority=exploreClusterMajorityExpression(group=>group);
      const countSum=["+",...MASS_CLUSTER_GROUPS.map(group=>["get","mass_"+group.toLowerCase()])];
      const clusterKind=["case",[">",countSum,0],majority,"PLACES"];
      map.addLayer({id:prefix+"-cluster-badges",type:"symbol",source:sourceId,
        filter:["has","point_count"],
        layout:{"icon-image":["concat","ao-explore-cluster-badge-",clusterKind],
          "icon-size":1,"icon-allow-overlap":true,"icon-ignore-placement":true,
          "text-field":["get","point_count_abbreviated"],
          ...(glyphStack?{"text-font":glyphStack}:{}),
          "text-size":12,"text-anchor":"center",
          "text-allow-overlap":true,"text-ignore-placement":true},
        paint:{"text-color":"#F0DEB5","text-halo-color":"#10212C","text-halo-width":0.5}});
    }
    // Every physical location gets one large ivory bubble. The circle
    // preserves a large hit target when a symbol image is unavailable.
    const pointPaint=styleOverride?{
      // The Bible Atlas is a separate map owner: settlement anchors are not
      // silently represented as churches or shrines.
      "circle-radius":["case",["get","approximate"],6,
        ["==",["get","lens"],"heritage"],
        ["match",["get","place_type"],"cathedral",11,"basilica",10,"shrine",9,8],8],
      "circle-color":["case",["==",["get","lens"],"heritage"],HERITAGE_POINT_COLOR,POINT_COLOR],
      "circle-opacity":["case",["get","approximate"],0.65,0.97],
      "circle-stroke-width":["case",["get","approximate"],1.6,2.2],
      "circle-stroke-color":["case",["==",["get","lens"],"tlm"],POINT_COLOR,
        ["case",["get","approximate"],"#17212d","#f0e7d4"]]
    }:{
      "circle-radius":22,
      "circle-color":["case",["get","approximate"],"#D4D8D2","#EBE2D1"],
      "circle-opacity":["case",["get","approximate"],0.78,0.97],
      "circle-stroke-width":2,
      "circle-stroke-color":["case",["get","approximate"],"#82928B","#B99C6B"]
    };
    map.addLayer({id:prefix+"-points",type:"circle",source:sourceId,
      filter:["!",["has","point_count"]],paint:pointPaint});
    const categoryLayer=prefix+"-category-medallions";
    if(categoryEmblemsReady){
      map.addLayer({id:categoryLayer,type:"symbol",source:sourceId,
        filter:["!",["has","point_count"]],
        layout:{"icon-image":["concat",EXPLORE_MEDALLION_ID_PREFIX,
          exploreCategoryMedallionExpression(),
          ["case",["get","approximate"],"-indicative",""]],
          "icon-size":1,"icon-allow-overlap":true,"icon-ignore-placement":true}});
    }
    // Selected place gets an understated halo outside the emblem itself.
    // It never creates a second point or changes the shared Place ID.
    const selectedLayer=prefix+"-selected-point";
    if(!styleOverride)map.addLayer({id:selectedLayer,type:"circle",source:sourceId,
      filter:["all",["!",["has","point_count"]],["==",["get","item_id"],"__none__"]],
      paint:{"circle-radius":27,"circle-color":"#000000","circle-opacity":0,
        "circle-stroke-color":"#D6BA82","circle-stroke-width":3,
        "circle-stroke-opacity":0.78}});
    const selectMapPlace=id=>{
      if(!styleOverride&&map.getLayer?.(selectedLayer))
        map.setFilter(selectedLayer,["all",["!",["has","point_count"]],
          ["==",["get","item_id"],String(id)]]);
      onSelect(id);
    };
    // Editorial hierarchy is derived only from canonical physical site type.
    // This does not assert ecclesiastical prominence or authenticated status.
    // Labels emerge only after zooming into an area; collisions stay hidden.
    map.addLayer({id:prefix+"-place-labels",type:"symbol",source:sourceId,
      minzoom:9,filter:["all",["!",["has","point_count"]],["==",["get","lens"],"heritage"]],
      layout:{"text-field":["get","name"],"text-size":11,"text-max-width":12,
        ...(glyphStack?{"text-font":glyphStack}:{}),
        "text-variable-anchor":["top","bottom"],"text-radial-offset":1.5,
        "text-optional":true},
      paint:{"text-color":"#e9dfcc","text-halo-color":"#08121b",
        "text-halo-width":1.4,"text-opacity":0.92}});
    // The review-only physical atlas labels its existing source-qualified
    // settlements. Never label traditional event sites or create map points.
    if(styleOverride){
      map.addLayer({id:prefix+"-scripture-settlement-labels",type:"symbol",source:sourceId,
        minzoom:4.5,
        filter:["all",["!",["has","point_count"]],["has","atlas_label"]],
        layout:{"text-field":["get","atlas_label"],
          ...(glyphStack?{"text-font":glyphStack}:{}),
          "text-size":["interpolate",["linear"],["zoom"],4.5,10,8,13],
          "text-anchor":"top","text-offset":[0,1.1],
          "text-allow-overlap":false,"text-ignore-placement":false,
          "text-optional":true},
        paint:{"text-color":"#efe0b8","text-halo-color":"#142631",
          "text-halo-width":2,"text-halo-blur":0.35}});
    }
    // Real source-attributed logos replace the category icon inside the
    // SAME bubble. A failed SVG fetch leaves an interactive church symbol.
    if(features.some(feature=>feature.properties?.lens==="tlm")){
      const loadedGroups=new Set();
      // Cross-origin SVGs sometimes render in toolbar <img> but cannot be
      // copied into MapLibre canvas sprites. Show the SAME real emblems
      // using bounded, pointer-transparent DOM overlays at visible pins.
      emblemOverlays=installMassMapEmblemOverlays(map,maplibre,{
        // A fetched sprite does not count as a usable logo unless its layer
        // actually exists. MapLibre may reject a symbol expression even after
        // canvas registration succeeds.
        win,hasSprite:group=>loadedGroups.has(group)
          &&Boolean(map.getLayer?.(prefix+"-institution-emblems")),
      });
      const refreshEmblems=()=>{
        if(!map.getSource?.(sourceId)||!loadedGroups.size)return;
        const withEmblem=["all",["==",["get","lens"],"tlm"],
          ["in",["get","provider_group"],["literal",[...loadedGroups]]]];
        if(categoryEmblemsReady&&map.getLayer?.(categoryLayer))
          map.setFilter(categoryLayer,["all",["!",["has","point_count"]],["!",withEmblem]]);
        const layer=prefix+"-institution-emblems",
          filter=["all",["!",["has","point_count"]],withEmblem];
        if(map.getLayer?.(layer)){map.setFilter(layer,filter);return;}
        map.addLayer({id:layer,type:"symbol",source:sourceId,filter,
          layout:{"icon-image":["concat","ao-mass-institution-",["get","provider_group"]],
            "icon-size":0.86,"icon-allow-overlap":true,"icon-ignore-placement":true}});
      };
      void registerMassInstitutionImages(map,{win,onRegistered:group=>{
        loadedGroups.add(group);
        try{refreshEmblems();emblemOverlays?.refresh()}catch(error){
          console.warn("Explore affiliation emblem presentation failed",error);
        }
      }}).catch(()=>{});
    }
    if(!initialViewport){
      const bounds=mapFitBounds(features);
      if(!phoneOverview&&bounds)map.fitBounds(bounds,{padding:48,maxZoom:10,duration:0});
      else if(features.length===1)map.jumpTo({center:features[0].geometry.coordinates,zoom:9});
    }
    map.on("click",prefix+"-points",event=>{
      const id=event.features?.[0]?.properties?.item_id;
      if(!id)return;
      const point=event.point,nearby=point&&map.queryRenderedFeatures?.(
        [[point.x-18,point.y-18],[point.x+18,point.y+18]],
        {layers:[prefix+"-points"]}
      );
      const choices=exploreDistinctPointChoices(nearby?.length?nearby:event.features);
      if(explorePlaceChoicePopup({win,map,maplibre,
        coordinates:event.lngLat??event.features?.[0]?.geometry?.coordinates,
        choices,onSelect:selectMapPlace}))return;
      selectMapPlace(id);
    });
    map.on("click",prefix+"-clusters",async event=>{
      const feature=event.features?.[0],clusterId=feature?.properties?.cluster_id,
        source=map.getSource(sourceId);
      if(clusterId===undefined||!source?.getClusterExpansionZoom)return;
      try{
        const zoom=await source.getClusterExpansionZoom(clusterId);
        const coords=feature.geometry?.coordinates;
        if(!coords)return;
        const currentZoom=map.getZoom?.()??0;
        if(zoom>currentZoom+0.25&&currentZoom<12.5){
          map.easeTo({center:coords,zoom,duration:reducedMotion?0:420});
          return;
        }
        // Always allow pagination through *all* source-backed leaves. A fixed
        // 500-result cap made dense city clusters silently inaccessible.
        const total=Math.max(0,Number(feature.properties?.point_count)||0);
        const first=clusterPageBounds(total);
        const leaves=await source.getClusterLeaves?.(clusterId,first.limit,first.offset);
        const choices=exploreDistinctPointChoices(leaves);
        if(!choices.length)return;
        const fetchMore=async offset=>{
          const page=clusterPageBounds(total,offset);
          if(!page.limit)return [];
          return exploreDistinctPointChoices(await source.getClusterLeaves(clusterId,page.limit,page.offset));
        };
        if(!explorePlaceChoicePopup({win,map,maplibre,coordinates:coords,
          choices,total,fetchMore,initialOffset:first.nextOffset,onSelect:selectMapPlace})
          &&choices.length===1)selectMapPlace(choices[0].item_id);
      }catch(error){
        // Keep the map interactive when a provider's cluster API is unavailable.
        console.warn("Explore cluster selection failed",error);
      }
    });
    for(const layer of [prefix+"-points",prefix+"-clusters"]){
      map.on("mouseenter",layer,()=>{map.getCanvas().style.cursor="pointer"});
      map.on("mouseleave",layer,()=>{map.getCanvas().style.cursor=""});
    }
  });
  const atlasLayers=!styleOverride&&atlasCoverage
    ?attachAtlasCoverageLayers(map,{win,coverage:atlasCoverage,onCountrySelect:onAtlasCountry}):null;
  if(atlasLayers)atlasLayers.setMode(atlasMode,atlasCoverage);
  const journeySiteMarkers=[];
  const clearJourneySiteMarkers=()=>{
    while(journeySiteMarkers.length){
      try{journeySiteMarkers.pop().remove()}catch{}
    }
  };
  return Object.freeze({map,
    viewportVenueStats(){return mappedVenueViewportStats(features,map.getBounds?.())},
    setAtlasOverlay(mode,coverage){return atlasLayers?.setMode(mode,coverage)??false},
    focusAtlasCountry(code){return atlasLayers?.focusCountry(code)??false},
    atlasStatus(){return atlasLayers?.status()??null},
    // Overlay exact canonical sacred-place points only. These medallions
    // identify named places, not line geometry or geocoded pilgrimage stages.
    setJourneyStageAnchors(anchors=[],onActivate=()=>{}){
      clearJourneySiteMarkers();
      if(!maplibre?.Marker||!win?.document?.createElement)return 0;
      const distinct=new Set();
      for(const stage of (Array.isArray(anchors)?anchors:[]).slice(0,25)){
        const id=String(stage?.id??"");
        const lng=Number(stage?.lng),lat=Number(stage?.lat),number=Number(stage?.ordinal);
        if(!id||distinct.has(id)||!Number.isFinite(lng)||!Number.isFinite(lat)
          ||Math.abs(lng)>180||Math.abs(lat)>90||!Number.isInteger(number)
          ||number<1||number>99||!stage?.sourceUrl||!stage?.placeId)continue;
        distinct.add(id);
        const medallion=win.document.createElement("button");
        medallion.type="button";medallion.className="aoJourneyMapStageMarker";
        medallion.textContent=String(number);
        medallion.dataset.journeyMapStage=id;
        medallion.setAttribute("aria-label",String(stage.name||stage.label||"Pilgrimage site"));
        medallion.title=String(stage.name||stage.label||"Pilgrimage site");
        medallion.addEventListener("click",event=>{
          event.preventDefault();event.stopPropagation();
          onActivate(id);
        });
        try{
          const marker=new maplibre.Marker({element:medallion,anchor:"center"})
            .setLngLat([lng,lat]).addTo(map);
          journeySiteMarkers.push(marker);
        }catch{}
      }
      return journeySiteMarkers.length;
    },
    updateItems(nextItems){
      features=exploreMapFeatures(nextItems);
      const source=map.getSource?.("ao-explore-items");
      source?.setData?.({type:"FeatureCollection",features});
    },
    mapStatus:()=>visualStatus.status(),
    destroy(){atlasLayers?.destroy();clearJourneySiteMarkers();emblemOverlays?.dispose();visualStatus.dispose();try{map.remove()}catch{}}
  });
}

export const FIND_MAP_RUNTIME=Object.freeze({module:MAPLIBRE_MODULE,style:DEFAULT_STYLE});
