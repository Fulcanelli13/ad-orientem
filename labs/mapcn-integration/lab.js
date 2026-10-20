// MapCN blocks adapted to the current MapLibre-only shell.
// Ported from the interaction grammar of Store Locator, Uptime Monitor,
// Heatmap and Choropleth; no imported demo fixtures or React runtime.
import {loadLabModel,selectedItems,countryCounts,calendarContext,WORLD_GEOJSON_URL,MAPCN_BLOCKS} from "./adapter.js";

const $=s=>document.querySelector(s);
const arr=v=>Array.isArray(v)?v:[];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const s={mode:"discover",scope:"all",query:"",active:null,model:null,map:null,mapReady:false,countryReady:false,
  selectedDate:new Date().toISOString().slice(0,10)};
const names={discover:["MAPCN / STORE LOCATOR","Sacred places","Browse documented shrines and traditional Mass locations. Select any result to inspect its source.",
    "Published places · not every Catholic church is catalogued"],
  time:["MAPCN / UPTIME MONITOR","Time & Mass","A date-aware overview of source-published Mass schedules and the liturgical season. Never a live availability claim.",
    "Published schedule assertions are not calculated next-Mass times"],
  density:["MAPCN / HEATMAP","Documented density","A geographic density map of our published points. It measures database coverage—not Catholic attendance or population.",
    "Heat indicates mapped records, not prevalence of Catholic practice"],
  regions:["MAPCN / CHOROPLETH","Country coverage","Compare the number of catalogued mapped records by country using a regional fill layer.",
    "Counts represent catalogued points only; absence is not proof of zero Catholic activity"]};
const texts={SOURCE_ATTESTED:"Official-source schedule · check latest changes",PUBLISHED_UNNORMALIZED:"Schedule text · not normalised",NO_PUBLISHED_TIME:"No verified time available",NOT_APPLICABLE:"Documented sacred place"};
let moduleMap=null,featureCollection={type:"FeatureCollection",features:[]},countryPop=null;
let filtered=[],mapSourceReady=false;
const addLayer=(id,type,source,paint,other={})=>{
  if(!s.map.getLayer(id))s.map.addLayer({id,type,source,paint,...other});
};
const emptyFeatureCollection=()=>({type:"FeatureCollection",features:[]});
function makeFeatures(items){return {type:"FeatureCollection",features:items.map(item=>({
 type:"Feature",id:item.id,geometry:{type:"Point",coordinates:[item.lng,item.lat]},
 properties:{id:item.id,lens:item.lens,name:item.name,indicative:item.indicative?1:0}
}))};}
function legendContent(mode){
 if(mode==="density")return "<strong>Documented density</strong>Concentration of mapped records<br><small>Not a survey of Catholic practice</small>";
 if(mode==="regions")return "<strong>Country records</strong><i class='scale'></i>0 · 1–5 · 6–20 · 21–60 · 61+<br><small>Coverage, not population</small>";
 if(mode==="time")return "<strong>Schedule evidence</strong>Gold: documented Mass venue<br><small>Raw published times; no live availability</small>";
 return "";
}
async function worldSource(){
 if(s.countryReady||!s.mapReady)return;
 try{
  const response=await fetch(WORLD_GEOJSON_URL,{headers:{accept:"application/json"}});
  if(!response.ok)throw new Error("Country boundary fetch returned "+response.status);
  const world=await response.json();
  const count=countryCounts(filtered);
  const byName=new Map([...s.model.countryNames.entries()].map(([k,v])=>[v.toLowerCase(),k]));
  const features=arr(world.features).map(f=>{
   const prop=f.properties||{};
   const candidate=[prop.ISO_A2_EH,prop.ISO_A2,prop.ISO_A2_EH,prop.ISO_A2_EH,prop.WB_A2].map(x=>String(x||"").toUpperCase()).find(x=>count.has(x));
   const country=candidate||(byName.get(String(prop.NAME_LONG||"").toLowerCase())||"");
   const n=count.get(country)||0;
   return {...f,properties:{...prop,aoCount:n,aoCountry:country||String(prop.NAME_LONG||prop.ADMIN||"Unknown")}};
  });
  s.map.addSource("lab-countries",{type:"geojson",data:{type:"FeatureCollection",features}});
  addLayer("lab-country-fill","fill","lab-countries",{
   "fill-color":["step",["get","aoCount"],"#25313c",1,"#506a64",6,"#728774",21,"#bfa975",61,"#e2c58b"],
   "fill-opacity":0.75}, {layout:{visibility:"none"}});
  addLayer("lab-country-outline","line","lab-countries",{"line-color":"#978769","line-width":0.55,"line-opacity":0.65},
    {layout:{visibility:"none"}});
  s.map.on("click","lab-country-fill",e=>{
   const p=e.features?.[0]?.properties||{};
   if(countryPop)countryPop.remove();
   countryPop=new moduleMap.Popup({closeButton:true}).setLngLat(e.lngLat).setHTML(
      "<strong>"+esc(p.NAME_LONG||p.ADMIN||p.aoCountry)+"</strong><p>"+Number(p.aoCount||0)
       +" published mapped records</p><small>No claim of complete Catholic coverage</small>").addTo(s.map);
  });
  s.map.on("mouseenter","lab-country-fill",()=>{s.map.getCanvas().style.cursor="pointer"});
  s.map.on("mouseleave","lab-country-fill",()=>{s.map.getCanvas().style.cursor=""});
  s.countryReady=true;
  if(s.mode==="regions")applyMap();
 }catch(error){
  $("#map-status").textContent="Country boundaries unavailable; list still works.";
  $("#list").insertAdjacentHTML("afterbegin","<p class='notice'>The MapCN Natural Earth boundary source could not load. No country shapes are invented.</p>");
 }
}
function setupLayers(){
 if(mapSourceReady)return;mapSourceReady=true;
 s.map.addSource("lab-points",{type:"geojson",data:emptyFeatureCollection(),cluster:true,clusterRadius:54,maxzoom:16});
 s.map.addSource("lab-density",{type:"geojson",data:emptyFeatureCollection()});
 addLayer("lab-heat","heatmap","lab-density",{
   "heatmap-weight":1,"heatmap-intensity":["interpolate",["linear"],["zoom"],1,0.6,8,2],
   "heatmap-color":["interpolate",["linear"],["heatmap-density"],0,"rgba(16,34,45,0)",0.2,"#315b65",0.4,"#627966",0.7,"#b99b65",1,"#f0d49d"],
   "heatmap-radius":["interpolate",["linear"],["zoom"],0,9,6,26,11,38],
   "heatmap-opacity":0.78}, {layout:{visibility:"none"}});
 addLayer("lab-clusters","circle","lab-points",{"circle-color":"#5e685d","circle-radius":["step",["get","point_count"],19,60,24,250,30],
   "circle-stroke-color":"#d7c393","circle-stroke-width":1.8}, {filter:["has","point_count"]});
 addLayer("lab-cluster-label","symbol","lab-points",{"text-color":"#f5e3c0","text-halo-color":"#101a24","text-halo-width":1},
  {filter:["has","point_count"],layout:{"text-field":["get","point_count_abbreviated"],"text-size":12}});
 addLayer("lab-pins","circle","lab-points",{"circle-color":["match",["get","lens"],"tlm","#b7a076","#647f83"],
   "circle-radius":["case",["boolean",["feature-state","selected"],false],11,7.5],
   "circle-stroke-color":"#eed9a8","circle-stroke-width":1.8},
  {filter:["!",["has","point_count"]]});
 s.map.on("click","lab-clusters",e=>{
  const f=e.features?.[0],cluster=f?.properties?.cluster_id;
  const src=s.map.getSource("lab-points");
  if(!src||cluster==null)return;
  src.getClusterExpansionZoom(cluster).then(z=>s.map.easeTo({center:f.geometry.coordinates,zoom:z,duration:550}));
 });
 s.map.on("click","lab-pins",e=>{
  const id=e.features?.[0]?.properties?.id;if(id)selectRecord(id);
 });
 for(const id of ["lab-clusters","lab-pins"]){
  s.map.on("mouseenter",id,()=>{s.map.getCanvas().style.cursor="pointer"});
  s.map.on("mouseleave",id,()=>{s.map.getCanvas().style.cursor=""});
 }
}
function fit(){
 if(!s.mapReady||!filtered.length)return;
 if(filtered.length===1){s.map.flyTo({center:[filtered[0].lng,filtered[0].lat],zoom:10,duration:650});return;}
 const bounds=new moduleMap.LngLatBounds();
 filtered.forEach(p=>bounds.extend([p.lng,p.lat]));
 s.map.fitBounds(bounds,{padding:window.innerWidth<750?{top:90,right:35,bottom:260,left:35}:65,maxZoom:11,duration:650});
}
function selectRecord(id){
 const item=filtered.find(x=>x.id===id);if(!item)return;
 s.active=id;
 const t=item.lens==="tlm"?"Traditional Mass directory":"Canonical sacred place";
 const precision=item.indicative?"Indicative location, not an entrance":"Source-attributed geographic point";
 const schedule=item.lens==="tlm"
  ?"<p><b>Schedule:</b> "+esc(texts[item.scheduleState])+"</p>"
   +(item.scheduleText?"<p>"+esc(item.scheduleText)+"</p>":"")
   +(item.checkedAt?"<p><small>Upstream check: "+esc(item.checkedAt)+"</small></p>":"")
  :"";
 $("#selected").innerHTML="<button type='button' class='close' aria-label='Close record'>×</button><span class='meta'>"+esc(t)+"</span>"
  +"<h3>"+esc(item.name)+"</h3><p>"+esc(item.subtitle||item.country)+"</p><p>"+esc(precision)+"</p>"+schedule
  +(item.source?"<a target='_blank' rel='noopener noreferrer' href='"+esc(item.source.url)+"'>"+esc(item.source.name)+" ↗</a>":"<p>Source URL not present on this projection.</p>");
 $("#selected").hidden=false;$("#selected .close").addEventListener("click",()=>{$("#selected").hidden=true;s.active=null;renderList()});
 renderList();
 if(s.mapReady)s.map.flyTo({center:[item.lng,item.lat],zoom:Math.max(s.map.getZoom(),7),duration:650});
}
function renderList(){
 const host=$("#list");
 if(!filtered.length){host.innerHTML="<p class='notice'>No source-published mapped records match these filters.</p>";return;}
 if(s.mode==="regions"){
  const counts=countryCounts(filtered);
  const rows=[...counts].sort((a,b)=>b[1]-a[1]);
  host.innerHTML=rows.map(([code,n])=>"<button type='button' class='place-row' data-country='"+esc(code)+"'><span class='type'>"+esc(code)+" · COUNTRY COVERAGE</span>"
    +"<strong>"+esc(s.model.countryNames.get(code)||code)+"</strong><small>"+n+" mapped records</small></button>").join("");
  host.querySelectorAll("[data-country]").forEach(b=>b.addEventListener("click",()=>{
    const places=filtered.filter(p=>p.countryCode===b.dataset.country);if(!places.length)return;
    const bounds=new moduleMap.LngLatBounds();places.forEach(p=>bounds.extend([p.lng,p.lat]));
    s.map?.fitBounds(bounds,{padding:90,maxZoom:7,duration:650});
  }));
  return;
 }
 const rows=s.mode==="time"?filtered.filter(x=>x.lens==="tlm"):filtered;
 host.innerHTML=rows.slice(0,250).map(p=>"<button type='button' class='place-row' data-id='"+esc(p.id)+"' data-active='"+(s.active===p.id)+"'>"
 +"<span class='type'>"+(p.lens==="tlm"?"MASS VENUE":"SACRED PLACE")+(p.indicative?" · APPROXIMATE":"")+"</span>"
 +"<strong>"+esc(p.name)+"</strong><small>"+esc(p.subtitle||p.country||"Location documented")+"</small>"
 +(s.mode==="time"?"<span class='attest'>"+esc(texts[p.scheduleState])+"</span>":"")+"</button>").join("");
 if(rows.length>250)host.insertAdjacentHTML("beforeend","<p class='notice'>Showing first 250 of "+rows.length+" records. Narrow the search to see more.</p>");
 host.querySelectorAll("[data-id]").forEach(b=>b.addEventListener("click",()=>selectRecord(b.dataset.id)));
}
function renderSummary(){
 $("#total").textContent=String(s.mode==="time"?filtered.filter(x=>x.lens==="tlm").length: s.mode==="regions"?countryCounts(filtered).size:filtered.length);
 $("#total-label").textContent=s.mode==="regions"?"countries with documented points":s.mode==="time"?"Mass venues with location evidence":"source-published mapped records";
 if(s.mode==="time"){
  const context=calendarContext(s.selectedDate);
  $("#season").textContent=context.season+" · "+context.colour+" (season only; daily feast must be confirmed in Calendar)";
 }else $("#season").textContent="";
}
function applyMap(){
 if(!s.mapReady)return;
 const data=makeFeatures(s.mode==="time"?filtered.filter(x=>x.lens==="tlm"):filtered);
 s.map.getSource("lab-points").setData(data);
 s.map.getSource("lab-density").setData(data);
 for(const name of ["lab-clusters","lab-cluster-label","lab-pins"])s.map.setLayoutProperty(name,"visibility",s.mode==="density"||s.mode==="regions"?"none":"visible");
 s.map.setLayoutProperty("lab-heat","visibility",s.mode==="density"?"visible":"none");
 if(s.countryReady)for(const name of ["lab-country-fill","lab-country-outline"])s.map.setLayoutProperty(name,"visibility",s.mode==="regions"?"visible":"none");
 const show=s.mode==="density"||s.mode==="regions"||s.mode==="time";
 $("#legend").hidden=!show;
 $("#legend").innerHTML=legendContent(s.mode);
 $("#map-caption").textContent=s.mode==="density"?"MapCN Heatmap · mapped record concentration":
   s.mode==="regions"?"MapCN Choropleth · sourced record counts":
   s.mode==="time"?"MapCN Uptime Monitor · published schedule evidence":
   "MapCN Store Locator · canonical records";
 if(s.mode==="regions"&&!s.countryReady)worldSource();
}
function render(){
 const [kicker,title,description,disclaimer]=names[s.mode];
 $("#mode-kicker").textContent=kicker;$("#mode-title").textContent=title;
 $("#mode-description").textContent=description;$("#disclaimer").textContent=disclaimer;
 $("#original").href=MAPCN_BLOCKS[s.mode];$("#date-field").hidden=s.mode!=="time";
 document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.mode===s.mode)));
 filtered=selectedItems(s.model,{scope:s.scope,query:s.query});
 if(s.active&&!filtered.some(p=>p.id===s.active)){$("#selected").hidden=true;s.active=null;}
 renderSummary();renderList();applyMap();
 $("#map-status").textContent=filtered.length+" documented map records · "+(s.mode==="time"?"no live Mass claims":"indicative pins distinguished");
}
function switchMode(mode){
 if(!names[mode])return;s.mode=mode;
 if(mode==="time"){s.scope="tlm";$("#scope").value=s.scope}
 else if(s.scope==="tlm"){s.scope="all";$("#scope").value="all"}
 s.active=null;$("#selected").hidden=true;
 render();if(s.mapReady)fit();
}
async function start(){
 try{
  s.model=await loadLabModel();
  $("#selected-date").value=s.selectedDate;
  render();
  const maplibregl=await import("https://unpkg.com/maplibre-gl@6.13.0/dist/maplibre-gl.mjs");
  moduleMap=maplibregl;
  s.map=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/dark",
    center:[5,25],zoom:1.5,renderWorldCopies:false,attributionControl:true,
    maxPitch:0,pitch:0,dragRotate:false,touchPitch:false});
  s.map.addControl(new maplibregl.NavigationControl({showCompass:false}),"bottom-right");
  s.map.once("load",()=>{s.mapReady=true;setupLayers();applyMap();s.map.resize();requestAnimationFrame(()=>{s.map.resize();fit()});$("#map-status").textContent=filtered.length+" mapped records · ready"});
  s.map.on("error",e=>{if(!s.mapReady)$("#map-status").textContent="Map tiles unavailable; records remain visible"});
 }catch(error){
  $("#map-status").textContent="Could not load laboratory";
  $("#list").innerHTML="<p class='notice'>"+esc(error?.message||error)+". The existing Explore production screen is unaffected.</p>";
  console.error("MapCN laboratory failed",error);
 }
}
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>switchMode(b.dataset.mode)));
$("#search").addEventListener("input",e=>{s.query=e.target.value;render()});
$("#scope").addEventListener("change",e=>{s.scope=e.target.value;render();fit()});
$("#selected-date").addEventListener("change",e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){s.selectedDate=e.target.value;render()}});
$("#reset").addEventListener("click",()=>{s.query="";$("#search").value="";s.scope=s.mode==="time"?"tlm":"all";$("#scope").value=s.scope;render();fit()});
$("#fit").addEventListener("click",fit);
window.addEventListener("resize",()=>{if(s.mapReady){s.map.resize();if(!s.active)requestAnimationFrame(fit)}});
$("#hide-sidebar").addEventListener("click",()=>{const closed=$("#lab").classList.toggle("panel-closed");
 $("#hide-sidebar").setAttribute("aria-pressed",String(!closed));$("#hide-sidebar").textContent=closed?"Show panel":"Panel";
 if(s.map)setTimeout(()=>s.map.resize(),280)});
start();
