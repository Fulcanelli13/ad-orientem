#!/usr/bin/env node
// P27 read-only OSM discovery. Output never changes the canonical registry.
import {readFileSync,writeFileSync} from "node:fs";
const src=JSON.parse(readFileSync(new URL("../../data/geography/research/sacred-places-p27-osm-search-seeds.v1.json",import.meta.url),"utf8"));
if(src.status!=="DISCOVERY_ONLY_NOT_RELEASE" || src.candidates.some(x=>x.ready_for_publication||x.exact_identity_verified||x.osm_feature))throw Error("discovery-only input required");
const escapeRx=x=>x.replace(/[|\\{}()[\]^$+*?.]/g,"\\$&");
const variants=arr=>arr.map(escapeRx).join("|");
const makeQuery=rows=>"[out:json][timeout:30];\n(\n"+rows.map(x=>{
 const p=x.discovery_center;
 if(p.meaning!=="APPROXIMATE_SEARCH_CENTRE_ONLY_NOT_A_PLACE_GEO"||p.radius_m>5000||p.radius_m<500)throw Error("untrusted search region");
 return "nwr(around:"+p.radius_m+","+p.lat+","+p.lng+')[\"name\"~'+JSON.stringify(variants(x.name_variants))+",i];";
}).join("\n")+"\n);\nout center tags;";
if(process.argv.includes("--dry-run")){
 console.log(JSON.stringify({candidates:src.candidates.length,countries:src.scope.countries,queries:Math.ceil(src.candidates.length/4),first_query_bytes:makeQuery(src.candidates.slice(0,4)).length}));
 process.exit(0);
}
const rad=Math.PI/180;
function km(a,b,c,d){const p=(c-a)*rad,q=(d-b)*rad,v=Math.sin(p/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(q/2)**2;return 12742*Math.asin(Math.sqrt(v));}
const endpoint=process.env.AO_OVERPASS_ENDPOINT||"https://maps.mail.ru/osm/tools/overpass/api/interpreter";
async function fetchBatch(batch){
 const abort=new AbortController(),alarm=setTimeout(()=>abort.abort(),35000);
 try{
  const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"AdOrientemSacredPlacesResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"},body:new URLSearchParams({data:makeQuery(batch)}),signal:abort.signal});
  if(!r.ok)throw Error("Overpass HTTP "+r.status);
  const data=await r.json();if(!Array.isArray(data.elements))throw Error("missing OSM elements");
  return {elements:data.elements,error:null};
 }catch(err){return {elements:[],error:String(err?.message||err)};}
 finally{clearTimeout(alarm);}
}
function assess(candidate,discovered){
 const p=candidate.discovery_center,rx=new RegExp(variants(candidate.name_variants),"i");
 const features=discovered.elements.filter(x=>{
  const lat=x.lat??x.center?.lat,lng=x.lon??x.center?.lon;
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||km(lat,lng,p.lat,p.lng)*1000>p.radius_m)return false;
  return [x.tags?.name,x.tags?.["name:en"],x.tags?.["name:local"]].some(n=>typeof n==="string"&&rx.test(n));
 }).map(x=>({osm_type:x.type,osm_id:x.id,osm_url:"https://www.openstreetmap.org/"+x.type+"/"+x.id,lat:x.lat??x.center?.lat,lng:x.lon??x.center?.lon,name:x.tags?.name??null,amenity:x.tags?.amenity??null,religion:x.tags?.religion??null,denomination:x.tags?.denomination??null,building:x.tags?.building??null,verification:"UNVERIFIED_OSM_SEARCH_HIT"}));
 return {candidate_id:candidate.candidate_id,country:candidate.country,label:candidate.label,identity_source_url:candidate.identity_source_url,discovery_status:discovered.error?"REMOTE_QUERY_FAILED":features.length?"HAS_UNVERIFIED_OSM_HITS":"NO_NAME_MATCH_IN_SEARCH_RADIUS",remote_error:discovered.error,matched_features:features,published_place:false};
}
async function main(){
 const results=[];
 for(let i=0;i<src.candidates.length;i+=4){
  const batch=src.candidates.slice(i,i+4),response=await fetchBatch(batch);
  results.push(...batch.map(x=>assess(x,response)));
  console.log("P27 batch "+(Math.floor(i/4)+1)+"/"+Math.ceil(src.candidates.length/4)+": "+(response.error?"ERROR "+response.error:response.elements.length+" OSM search elements"));
 }
 const full={schema:"AO_SACRED_PLACES_P27_OSM_UNVERIFIED_HITS_V1",generated_at:new Date().toISOString(),status:"DISCOVERY_ONLY_NOT_RELEASE",osm_attribution:"© OpenStreetMap contributors (ODbL 1.0)",endpoint,query_count:Math.ceil(src.candidates.length/4),canonical_reuses:src.existing_canonical_reuses,results};
 const json=JSON.stringify(full,null,2)+"\n";
 writeFileSync("/tmp/sacred-places-p27-osm-hits.json",json);
 console.log("P27_RESULT_JSON_START");console.log(json);console.log("P27_RESULT_JSON_END");
 const hits=results.filter(x=>x.matched_features.length),failed=results.filter(x=>x.remote_error);
 console.log("P27 SUMMARY: "+results.length+" discovery candidates, "+hits.length+" with unverified OSM matches, "+failed.length+" unable to query, 2 existing reuses, zero new Places");
 if(process.env.GITHUB_STEP_SUMMARY){
  const lines=["# P27 OSM candidate search — NOT verified","",
   "Searched "+results.length+", name hits "+hits.length+", remote query failures "+failed.length+", canonical reuses 2.","",
   ...hits.map(x=>"- "+x.candidate_id+" "+x.label+": "+x.matched_features.map(y=>y.osm_url).join(", ")),
   ...failed.map(x=>"- REMOTE ERROR "+x.candidate_id+": "+x.remote_error),"","**No candidate here is automatically publishable.**"];
  writeFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join("\n")+"\n");
 }
}
main().catch(e=>{console.error("P27 script failure: "+e);process.exitCode=1});
