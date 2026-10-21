// MapCN-inspired, isolated MapLibre atlas layers. Works on EXISTING map.
// A failed Natural Earth request displays a source warning, never fake borders.
import {atlasCoverageFeatures,enrichAtlasCountryFeatures,NATURAL_EARTH_COUNTRIES_URL} from "./mapcn-atlas-coverage.js";
const id="ao-atlas",source=id+"-points",boundary=id+"-countries";
const baseLayers=["ao-explore-cluster-halo","ao-explore-clusters","ao-explore-cluster-count",
 "ao-explore-cluster-badges","ao-explore-points","ao-explore-category-medallions",
 "ao-explore-selected-point","ao-explore-place-labels","ao-explore-institution-emblems"];
const modes=new Set(["places","heatmap","countries"]);
function bboxOf(feature){
 const geometry=feature?.geometry?.coordinates;if(!geometry)return null;
 let left=181,right=-181,bottom=91,top=-91;
 const visit=v=>{
   if(!Array.isArray(v))return;
   if(v.length>=2&&typeof v[0]==="number"&&typeof v[1]==="number"){
     left=Math.min(left,v[0]);right=Math.max(right,v[0]);bottom=Math.min(bottom,v[1]);top=Math.max(top,v[1]);
   }else v.forEach(visit);
 };
 visit(geometry);
 return left<=right&&bottom<=top&&right-left<270?[[left,bottom],[right,top]]:null;
}
export function attachAtlasCoverageLayers(map,{win=globalThis,coverage,onCountrySelect=()=>{}}={}){
 let ready=false,dead=false,loading=false,countryReady=false,world=null,selectedMode="places",selectedCoverage=coverage;
 const setVisible=(name,visible)=>{
   if(map.getLayer?.(name))map.setLayoutProperty(name,"visibility",visible?"visible":"none");
 };
 const apply=()=>{
   if(!ready||dead)return;
   const layerMode=selectedMode;
   for(const name of baseLayers)setVisible(name,layerMode==="places");
   setVisible(id+"-heat",layerMode==="heatmap");
   setVisible(id+"-fill",layerMode==="countries"&&countryReady);
   setVisible(id+"-outline",layerMode==="countries"&&countryReady);
   const points=map.getSource?.(source);
   points?.setData?.(atlasCoverageFeatures(selectedCoverage));
   if(countryReady&&world){
     const data=enrichAtlasCountryFeatures(world,selectedCoverage);
     map.getSource(boundary)?.setData?.(data);
   }
 };
 const label=state=>{
   const el=win.document?.querySelector?.("[data-atlas-boundary-status]");
   if(!el)return;
   const fr=win.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
   el.textContent=state==="ready"
      ?(fr?"Frontières documentées · Natural Earth":"Documented boundaries · Natural Earth")
      :(fr?"Frontières indisponibles ; les comptes par pays restent visibles.":"Boundaries unavailable; country counts remain visible.");
 };
 const loadCountries=async()=>{
   if(loading||countryReady||dead)return;
   loading=true;
   try{
     const response=await win.fetch(NATURAL_EARTH_COUNTRIES_URL,{headers:{accept:"application/json"}});
     if(!response?.ok)throw new Error("Boundary source HTTP "+response?.status);
     const json=await response.json();
     if(dead)return;
     // Keep original Natural Earth geometry. Code assignment is explicit ISO
     // or existing registry name, never a point-in-polygon guess.
     const collection=enrichAtlasCountryFeatures(json,selectedCoverage);
     world={type:"FeatureCollection",features:json.features};
     map.addSource(boundary,{type:"geojson",data:collection});
     map.addLayer({id:id+"-fill",type:"fill",source:boundary,
       layout:{visibility:"none"},
       paint:{"fill-color":["step",["get","aoCount"],"#25313c",1,"#506a64",6,"#728774",21,"#bfa975",61,"#e2c58b"],
         "fill-opacity":0.76}}, "ao-explore-cluster-halo");
     map.addLayer({id:id+"-outline",type:"line",source:boundary,
       layout:{visibility:"none"},
       paint:{"line-color":"#96876a","line-width":0.55,"line-opacity":0.65}},"ao-explore-cluster-halo");
     map.on("click",id+"-fill",event=>{
       if(selectedMode!=="countries")return;
       const code=String(event.features?.[0]?.properties?.aoCountryCode||"");
       if(code)onCountrySelect(code);
     });
     countryReady=true;label("ready");apply();
   }catch(error){
     if(dead)return;
     label("unavailable");
     try{win.console?.warn?.("Atlas Natural Earth boundaries unavailable",error)}catch{}
   }finally{loading=false}
 };
 const setMode=(mode,nextCoverage)=>{
   if(!modes.has(mode))return false;
   selectedMode=mode;
   if(nextCoverage)selectedCoverage=nextCoverage;
   apply();
   if(ready&&mode==="countries"){
     if(countryReady)label("ready");
     else void loadCountries();
   }
   return true;
 };
 const init=()=>{
   if(dead||ready)return;
   ready=true;
   map.addSource(source,{type:"geojson",data:atlasCoverageFeatures(selectedCoverage)});
   map.addLayer({id:id+"-heat",type:"heatmap",source,
     layout:{visibility:"none"},
     paint:{"heatmap-weight":1,
       "heatmap-intensity":["interpolate",["linear"],["zoom"],1,0.6,8,2],
       "heatmap-color":["interpolate",["linear"],["heatmap-density"],
         0,"rgba(16,34,45,0)",0.2,"#315b65",0.4,"#627966",0.7,"#b99b65",1,"#f0d49d"],
       "heatmap-radius":["interpolate",["linear"],["zoom"],0,9,6,26,11,38],
       "heatmap-opacity":0.80}},"ao-explore-cluster-halo");
   apply();
   if(selectedMode==="countries")void loadCountries();
 };
 map.on("load",init);
 if(map.isStyleLoaded?.()&&map.getLayer?.("ao-explore-cluster-halo"))init();
 return Object.freeze({setMode,focusCountry(code){
   if(!countryReady||!world||!code)return false;
   const f=enrichAtlasCountryFeatures(world,selectedCoverage).features
     .find(x=>x.properties.aoCountryCode===code);
   const bounds=f&&bboxOf(f);
   if(!bounds)return false;
   const motion=win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
   try{map.fitBounds(bounds,{padding:50,maxZoom:7,duration:motion?0:420});return true}catch{return false}
 },status(){return {ready,mode:selectedMode,countryReady,loading}},
 destroy(){dead=true}});
}
