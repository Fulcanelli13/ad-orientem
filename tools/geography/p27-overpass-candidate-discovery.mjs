#!/usr/bin/env node
// P27 research-only OSM shortlist generator; never changes canonical geography.
import {readFileSync,writeFileSync} from "node:fs";
const path=new URL("../../data/geography/research/sacred-places-p27-osm-search-seeds.v1.json",import.meta.url);
const src=JSON.parse(readFileSync(path,"utf8"));
if(src.status!=="DISCOVERY_ONLY_NOT_RELEASE")throw Error("non-discovery input");
if(src.candidates.some(x=>x.ready_for_publication||x.exact_identity_verified||x.osm_feature))throw Error("seeds must not claim mapping approval");
const qstr=x=>JSON.stringify(x).replaceAll(/\\u[0-9a-f]{4}/ig,m=>m);
const variants=arr=>arr.map(x=>x.replaceAll(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|");
const query="[out:json][timeout:100];\n(\n"+src.candidates.map(x=>{
 const p=x.discovery_center;
 if(p.meaning!=="APPROXIMATE_SEARCH_CENTRE_ONLY_NOT_A_PLACE_GEO")throw Error("discovery centre provenance missing");
 if(p.radius_m>5000||p.radius_m<500)throw Error("unexpected radius");
 return 'nwr(around:'+p.radius_m+','+p.lat+','+p.lng+')["name"~'+qstr(variants(x.name_variants))+',i];';
}).join("\n")+"\n);\nout center tags;";
const rad=Math.PI/180;
const km=(a,b,c,d)=>{let p=(c-a)*rad,q=(d-b)*rad;let v=Math.sin(p/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(q/2)**2;return 12742*Math.asin(Math.sqrt(v));};
async function main(){
 if(process.argv.includes("--dry-run")){console.log(JSON.stringify({candidates:src.candidates.length,query_bytes:query.length,countries:src.scope.countries}));return;}
 const u=process.env.AO_OVERPASS_ENDPOINT||"https://overpass.private.coffee/api/interpreter";
 const ctrl=new AbortController();const alarm=setTimeout(()=>ctrl.abort(),135000);
 let obj;
 try{
  const res=await fetch(u,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"AdOrientemSacredPlacesResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"},body:new URLSearchParams({data:query}),signal:ctrl.signal});
  if(!res.ok)throw Error("Overpass HTTP "+res.status);
  obj=await res.json();if(!Array.isArray(obj.elements))throw Error("missing elements");
 }finally{clearTimeout(alarm)}
 const results=src.candidates.map(c=>{
  const p=c.discovery_center;
  const nameMatch=new RegExp(variants(c.name_variants),"i");
  let matched=(obj.elements||[]).filter(x=>{
   const lat=x.lat??x.center?.lat,lon=x.lon??x.center?.lon;
   if(typeof lat!=="number"||typeof lon!=="number")return false;
   if(km(lat,lon,p.lat,p.lng)*1000>p.radius_m)return false;
   const tags=x.tags||{};
   return [tags.name,tags["name:en"],tags["name:local"]].some(v=>v&&nameMatch.test(v));
  }).map(x=>({osm_type:x.type,osm_id:x.id,osm_url:"https://www.openstreetmap.org/"+x.type+"/"+x.id,lat:x.lat??x.center.lat,lng:x.lon??x.center.lon,name:x.tags?.name??null,amenity:x.tags?.amenity??null,religion:x.tags?.religion??null,denomination:x.tags?.denomination??null,building:x.tags?.building??null,warning:"SEARCH_HIT_ONLY_NOT_GEO_VERIFIED"}));
  return {candidate_id:c.candidate_id,country:c.country,label:c.label,identity_source_url:c.identity_source_url,matched_features:matched,discovery_status:matched.length?"HAS_UNVERIFIED_OSM_HITS":"NO_NAME_MATCH_IN_SEARCH_RADIUS",published_place:false};
 });
 const result={schema:"AO_SACRED_PLACES_P27_OSM_UNVERIFIED_HITS_V1",generated_at:new Date().toISOString(),status:"DISCOVERY_ONLY_NOT_RELEASE",osm_attribution:"© OpenStreetMap contributors (ODbL 1.0)",overpass_url:u,query_count:1,query_sha256:null,results};
 const json=JSON.stringify(result,null,2)+"\n";
 writeFileSync("/tmp/sacred-places-p27-osm-hits.json",json);
 console.log("P27_RESULT_JSON_START");console.log(json);console.log("P27_RESULT_JSON_END");
 const found=results.filter(x=>x.matched_features.length);
 console.log("P27: "+results.length+" searched; "+found.length+" have unverified OSM name hits; 0 released");
 if(process.env.GITHUB_STEP_SUMMARY){
  writeFileSync(process.env.GITHUB_STEP_SUMMARY,"# P27 OSM discovery (not verified)\n\n"+found.map(x=>"- "+x.candidate_id+" "+x.label+": "+x.matched_features.map(z=>z.osm_url).join(", ")).join("\n")+"\n\nMissing exact-name OSM results: "+(results.length-found.length)+"\n");
 }
}
main().catch(e=>{console.error("P27 Overpass unavailable or inconclusive: "+e.message);process.exitCode=1});
