// MapLibre's sprite canvas requires cross-origin image permissions. The
// source-owned Wikimedia SVGs can display in ordinary <img> tags even when
// their CORS headers prevent canvas rasterisation. This bounded overlay makes
// the real logos visible INSIDE unclustered map pins, without thousands of
// permanent DOM markers or a second geographical registry.
import {massInstitutionEmblem} from "./institution-emblems.js";

const MAX_VISIBLE_EMBLEMS=90;
export function installMassMapEmblemOverlays(map,maplibre,{
  win=globalThis,hasSprite=()=>false,
}={}){
  if(!map?.queryRenderedFeatures||!maplibre?.Marker||!win?.document?.createElement)
    return Object.freeze({refresh(){},dispose(){},count:()=>0});
  const visible=new Map(),brokenGroups=new Set();
  const diagnostics={refreshes:0,candidates:0,attempted:0,failed:0};
  map.__aoInstitutionEmblemDiagnostics=()=>({...diagnostics,visible:visible.size,broken:[...brokenGroups]});
  let disposed=false;
  function remove(id){
    const item=visible.get(id);
    if(!item)return;
    item.marker.remove();visible.delete(id);
  }
  function refresh(){
    diagnostics.refreshes++;
    if(disposed||!map.getLayer?.("ao-explore-points"))return;
    let features;
    try{features=map.queryRenderedFeatures({layers:["ao-explore-points"]})||[]}
    catch{return}
    diagnostics.lastRawCount=features.length;
    diagnostics.lastSample=features.slice(0,5).map(feature=>({
      lens:feature?.properties?.lens,group:feature?.properties?.provider_group,
      sprite:hasSprite(String(feature?.properties?.provider_group||"").toUpperCase()),
      coords:Array.isArray(feature?.geometry?.coordinates),
    }));
    const targets=new Map();
    for(const feature of features){
      if(targets.size>=MAX_VISIBLE_EMBLEMS)break;
      const p=feature?.properties||{},id=String(p.item_id||""),
        group=String(p.provider_group||"").toUpperCase(),
        coords=feature?.geometry?.coordinates;
      if(p.lens!=="tlm"||!id||targets.has(id)||hasSprite(group)||
         brokenGroups.has(group)||!massInstitutionEmblem(group)||
         !Array.isArray(coords)||coords.length<2)continue;
      targets.set(id,{group,coords});
    }
    diagnostics.candidates=targets.size;
    for(const id of visible.keys())if(!targets.has(id))remove(id);
    for(const [id,{group,coords}] of targets){
      if(visible.has(id))continue;
      const definition=massInstitutionEmblem(group);
      const holder=win.document.createElement("span");
      holder.className="aoExploreInstitutionMapPin";
      holder.dataset.aoInstitutionPin=id;
      holder.dataset.institute=group;
      holder.style.cssText="width:35px;height:35px;pointer-events:none;display:grid;place-items:center;background:#ebe2d1;border-radius:50%;padding:2px;box-sizing:border-box";
      const img=win.document.createElement("img");
      img.alt="";img.loading="eager";img.decoding="async";
      img.style.cssText="display:block;width:31px;height:31px;object-fit:contain;border-radius:50%;pointer-events:none";
      holder.append(img);
      diagnostics.attempted++;
      const marker=new maplibre.Marker({element:holder,anchor:"center"})
        .setLngLat(coords).addTo(map);
      visible.set(id,{marker,group});
      // The generic icon below remains visible if this source-hosted insignia
      // fails. Never use an institute's logo as a verification badge.
      img.onerror=()=>{diagnostics.failed++;brokenGroups.add(group);remove(id)};
      img.src=definition.image;
    }
  }
  map.on?.("idle",refresh);
  map.on?.("moveend",refresh);
  refresh();
  return Object.freeze({
    refresh, count:()=>visible.size,
    dispose(){
      disposed=true;
      map.off?.("idle",refresh);map.off?.("moveend",refresh);
      for(const id of [...visible.keys()])remove(id);
    },
  });
}
