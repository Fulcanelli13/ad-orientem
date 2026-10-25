#!/usr/bin/env node
/**
 * P41 one-off sequential OSM Nominatim cache fill for exactly the 44
 * transport failures from P39. NEVER publish a Place or geometry.
 *
 * OSMF Nominatim policy: https://operations.osmfoundation.org/policies/nominatim/
 * Small ONE-TIME query, ONE machine, ONE thread, <=1 req/sec (1.6 sec spacing),
 * identifying User-Agent, permanent cache from CI run. No autocomplete or grids.
 * Source output is for inspection; do not use OSM centers as building footprints.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const prior=read("data/geography/research/sacred-places-p39-open68-osm-evidence.v1.json");
const source=read("data/geography/research/sacred-places-p39-global500-open68-reconciliation.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const p40=read("data/geography/research/sacred-places-p40-twelve-verified-catholic-buildings.v1.json");
if(prior.results.length!==68||source.open_mapping_68.length!==68||p40.published_new.length!==12)throw Error("Historical P39/P40 baseline mismatch");
const old=new Map(prior.results.map(r=>[r.queue_row,r]));
const failed=source.open_mapping_68.filter(row=>old.get(row.queue_row)?.status==="REMOTE_QUERY_FAILED");
if(failed.length!==44)throw Error("Must retry exactly 44 transport failures, not previously successful sites");
const refs=new Set(geo.places.map(x=>x.geo?.source_ref).filter(Boolean));
const frozen=new Set(p40.published_new.map(x=>x.candidate_id));
if(failed.some(r=>r.candidate_ids.some(id=>frozen.has(id))))throw Error("Already released candidate cannot be retried");
const countryCodes={AU:"Australia",BR:"Brazil",CH:"Switzerland",CL:"Chile",DE:"Germany",EC:"Ecuador",ES:"Spain",FR:"France",GB:"United Kingdom",HU:"Hungary",IT:"Italy",PH:"Philippines",PL:"Poland",US:"United States",VN:"Vietnam"};
const rad=Math.PI/180;
const distanceM=(a,b,c,d)=>{const p=(c-a)*rad,q=(d-b)*rad,h=Math.sin(p/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(q/2)**2;return Math.round(12742000*Math.asin(Math.sqrt(h)));};
export const targets=()=>failed.map(x=>({queue_row:x.queue_row,candidate_ids:x.candidate_ids,site_name:x.site_name,country:x.country,query:x.site_name+", "+(countryCodes[x.country]||x.country),countrycodes:x.country.toLowerCase(),search_centre:x.research_search_center}));
export const formatCandidate=(row,item)=>{
 const typ={W:"way",N:"node",R:"relation"}[String(item.osm_type||"").toUpperCase()]||String(item.osm_type||"").toLowerCase();
 if(!["way","node","relation"].includes(typ)||!Number.isInteger(item.osm_id))return null;
 const lat=Number(item.lat),lon=Number(item.lon);
 if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
 const d=distanceM(row.search_centre.lat,row.search_centre.lng,lat,lon);
 return {osm_ref:"osm:"+typ+":"+item.osm_id,osm_url:"https://www.openstreetmap.org/"+typ+"/"+item.osm_id,display_name:item.display_name||null,namedetails:item.namedetails||{},class:item.class||null,type:item.type||null,addresstype:item.addresstype||null,extratags:item.extratags||{},boundingbox:item.boundingbox||null,geo_candidate:{lat,lng:lon,meaning:"UNVERIFIED_NOMINATIM_CENTER_DO_NOT_PUBLISH"},distance_from_unverified_search_centre_m:d,within_1800m:d<=1800,canonical_geometry_collision:refs.has("osm:"+typ+":"+item.osm_id),status:"UNVERIFIED_NOMINATIM_SEARCH_HIT_NOT_EXACT_BUILDING_IDENTITY"};
};
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
async function query(row){
 const u=new URL("https://nominatim.openstreetmap.org/search");
 for(const [k,v] of Object.entries({q:row.query,countrycodes:row.countrycodes,format:"jsonv2",addressdetails:"1",extratags:"1",namedetails:"1",limit:"8"}))u.searchParams.set(k,v);
 const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),10000);
 try{
  const r=await fetch(u,{headers:{"User-Agent":"AdOrientemOneTimeSacredPlaceAudit/1.0 (https://github.com/Fulcanelli13/ad-orientem)","Accept":"application/json","Accept-Language":"en"},signal:ctrl.signal});
  if(!r.ok)throw Error("Nominatim HTTP "+r.status);
  const x=await r.json();
  if(!Array.isArray(x))throw Error("Invalid response schema");
  return {status:x.length?"CANDIDATES_FOUND_NOT_VERIFIED":"NOMINATIM_TEXT_SEARCH_EMPTY_NOT_ABSENCE_OF_SITE",candidates:x.map(v=>formatCandidate(row,v)).filter(Boolean),remote_error:null};
 }catch(e){return{status:"NOMINATIM_REMOTE_FAILURE",candidates:[],remote_error:String(e?.message||e)};}
 finally{clearTimeout(timeout);}
}
export async function run({network=false,output="data/geography/research/sacred-places-p41-retry44-nominatim-evidence.v1.json"}={}){
 const rows=targets();
 if(!network)return{mode:"dry-run",targets:rows.length,p39_prior_successes:24,p39_network_failures:44,already_published_p40:12,queries_in_response_order:rows.map(x=>x.queue_row),single_thread:true,min_spacing_ms:1600,publication_authorized:false};
 const records=[];let failedStreak=0,halted=false,last=0;
 for(const row of rows){
  let answer;
  if(halted)answer={status:"SKIPPED_AFTER_REMOTE_OUTAGE_RETRY_REQUIRED",candidates:[],remote_error:"Remote lookup halted after four consecutive transport failures; did not query this record"};
  else{
   const wait=Math.max(0,1600-(Date.now()-last));if(wait>0)await sleep(wait);
   last=Date.now();
   answer=await query(row);
   failedStreak=answer.status==="NOMINATIM_REMOTE_FAILURE"?failedStreak+1:0;
   if(failedStreak>=4)halted=true;
  }
  const record={...row,status:answer.status,candidates:answer.candidates,remote_error:answer.remote_error,publication_authorized:false};
  records.push(record);
  // GitHub Actions logs are the durable recovery fallback until JSON is committed.
  console.log("P41_EVIDENCE_ROW "+JSON.stringify(record));
  console.log("P41_PROGRESS "+JSON.stringify({processed:records.length,total:rows.length,candidate_rows:records.filter(r=>r.status==="CANDIDATES_FOUND_NOT_VERIFIED").length,remote_failure:records.filter(r=>r.status==="NOMINATIM_REMOTE_FAILURE").length,skipped:records.filter(r=>r.status==="SKIPPED_AFTER_REMOTE_OUTAGE_RETRY_REQUIRED").length}));
 }
 if(records.length!==44||new Set(records.map(x=>x.queue_row)).size!==44)throw Error("Partial P41 output");
 const counter=status=>records.filter(r=>r.status===status).length,osmRefs=new Set(records.flatMap(r=>r.candidates.map(x=>x.osm_ref)));
 const doc={schema:"AO_SACRED_PLACES_P41_ONE_TIME_NOMINATIM_RETRY44_V1",generated_at:new Date().toISOString(),status:"DISCOVERY_ONLY_NOT_RELEASE",source:"© OpenStreetMap contributors, ODbL 1.0",policy:"https://operations.osmfoundation.org/policies/nominatim/",prior_manifest:"data/geography/research/sacred-places-p39-open68-osm-evidence.v1.json",safety:["The input is EXACTLY 44 P39 transport-failed rows; all 24 P39 successful rows are excluded.","No repeat queries, no parallel calls, and the outcome is permanently cached after source review.","Nominatim search failure, zero text hits or missing building polygons cannot invalidate a real Catholic site.","Nominatim search coordinates are not proven exact church building centroids.","Do not confuse P40 already-published Places with new candidate identities."],summary:{input_failed_rows:44,with_search_candidates:counter("CANDIDATES_FOUND_NOT_VERIFIED"),empty_name_search:counter("NOMINATIM_TEXT_SEARCH_EMPTY_NOT_ABSENCE_OF_SITE"),remote_failed:counter("NOMINATIM_REMOTE_FAILURE"),skipped_after_outage:counter("SKIPPED_AFTER_REMOTE_OUTAGE_RETRY_REQUIRED"),distinct_candidate_osm_refs:osmRefs.size,published_new_places:0},rows:records};
 const filename=resolve(root,output);mkdirSync(dirname(filename),{recursive:true});writeFileSync(filename,JSON.stringify(doc,null,2)+"\n");
 console.log("P41_RETRY_SUMMARY "+JSON.stringify({summary:doc.summary,output,all44_preserved:true}));
 if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,["# P41 read-only 44 failed searches","",JSON.stringify(doc.summary),"","**No new canonical Place was published. Record per-row findings before re-querying.**"].join("\n"));
 return doc;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))run({network:process.argv.includes("--network")}).then(x=>{if(!process.argv.includes("--network"))console.log(JSON.stringify(x))}).catch(e=>{console.error(e);process.exitCode=1});
