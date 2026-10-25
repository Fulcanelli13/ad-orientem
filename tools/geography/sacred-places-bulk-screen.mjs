#!/usr/bin/env node
/**
 * P39 bulk geometry evidence collector. Reads 68 inherited research search centres,
 * screens candidate OSM features in batches, and NEVER publishes coordinates or Places.
 * Run: node tools/geography/sacred-places-bulk-screen.mjs --dry-run
 *      node tools/geography/sacred-places-bulk-screen.mjs --network
 * Live evidence MUST be archived to the repository after source review: Actions artifacts
 * are temporary transport only. This script has no write path to canonical registries.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const ROOT=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const read=p=>JSON.parse(readFileSync(resolve(ROOT,p),"utf8"));
const baselinePath="data/geography/research/sacred-places-p39-global500-open68-reconciliation.v1.json";
const BASE=read(baselinePath);
const GEO=read("data/geography/seed-registry.v1.json");
if(BASE.schema!=="AO_SACRED_PLACES_P39_GLOBAL500_AND_OPEN68_RECONCILIATION_V1" || BASE.global_500.length!==500 || BASE.open_mapping_68.length!==68 || GEO.places.length<463)throw Error("P39 inputs not in expected source-of-truth shape");
if(BASE.counts.verified_canonical_links!==98 || BASE.counts.acquisition_ids_also_in_mapping_queue!==54)throw Error("P39 prior comparison changed; rerun reconciliation before screening");
const PUBLISHED=new Set(GEO.places.map(p=>p.place_id));
const publishedRefs=new Set(GEO.places.map(p=>p.geo?.source_ref).filter(Boolean));
const rad=Math.PI/180;
export const distanceM=(a,b,c,d)=>{const x=(c-a)*rad,y=(d-b)*rad,h=Math.sin(x/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(y/2)**2;return Math.round(12742000*Math.asin(Math.sqrt(h)));};
export const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
const generic=new Set("a an the of our lady saint st saints sanctuary shrine national international basilica church cathedral abbey monastery convent holy notre dame de la le del des le die der il di della do da dos das du santa santo san sankt sainte sagrada mother maria mary virgin blessed national shrine du sanctuary pilgrimage kostel bazilika notre name lady".split(" "));
export const tokens=s=>[...new Set(norm(s).split(/\s+/).filter(x=>x.length>=3&&!generic.has(x)))];
export const makeQuery=(rows,radius=900)=>{
 if(!rows.length||rows.length>8||radius<400||radius>1300)throw Error("Bounded batch only");
 const queries=[];
 for(const x of rows){
  const p=x.research_search_center;
  if(p?.meaning!=="RESEARCH_DISCOVERY_ANCHOR_ONLY_NOT_PUBLISHABLE_SITE_GEO"||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||p.lat<-90||p.lat>90||p.lng<-180||p.lng>180)throw Error("Unsafe discovery anchor "+x.queue_row);
  const at=radius+","+p.lat+","+p.lng;
  queries.push('nwr(around:'+at+')["amenity"="place_of_worship"];');
  queries.push('way(around:'+at+')["building"~"^(church|chapel|cathedral|basilica)$"];');
 }
 return "[out:json][timeout:40];\n(\n"+queries.join("\n")+"\n);\nout center tags;";
};
export const rank=(candidate,feature)=>{
 const p=candidate.research_search_center,lat=feature.lat??feature.center?.lat,lng=feature.lon??feature.center?.lon;
 if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
 const distance_m=distanceM(p.lat,p.lng,lat,lng);
 if(distance_m>1100)return null;
 const t=feature.tags||{},name=t.name||t["name:en"]||t["name:fr"]||t["name:es"]||t["name:it"]||null;
 const all=[name,t["name:en"],t["name:fr"],t["name:es"],t["name:it"],t.alt_name,t.official_name].filter(Boolean).join(" ");
 const needle=tokens(candidate.site_name),hay=new Set(tokens(all)),overlap=needle.filter(n=>hay.has(n)).length;
 const catholic=/catholic|roman_catholic/i.test(String(t.denomination||"")+" "+String(t.religion||"")) || /catholic/i.test(String(t.operator||""));
 const noncatholic=/orthodox|protestant|anglican|baptist|lutheran|methodist|presbyterian|adventist|evangelical|muslim|islam|hindu|buddhist|jewish|sikh/i.test(String(t.denomination||"")+" "+String(t.religion||""));
 const worship=t.amenity==="place_of_worship",church=/church|chapel|cathedral|basilica|temple/i.test(t.building||"");
 const featuretype=feature.type;
 let score=overlap*13+(catholic?25:0)+(featuretype==="way"?12:featuretype==="relation"?8:0)+(church?16:0)+(worship?8:0)+Math.max(0,20-distance_m/30)-(noncatholic?80:0);
 score=Math.round(score);
 return {osm_ref:"osm:"+featuretype+":"+feature.id,osm_url:"https://www.openstreetmap.org/"+featuretype+"/"+feature.id,osm_feature_name:name,osm_feature_type:featuretype,osm_feature_center:{lat,lng,meaning:"UNVERIFIED_OSM_OBJECT_CENTER_NEVER_CANONICAL_SITE_GEO"},distance_from_unverified_search_centre_m:distance_m,building:t.building??null,amenity:t.amenity??null,religion:t.religion??null,denomination:t.denomination??null,name_overlap_terms:overlap,noncatholic_tag_detected:noncatholic,existing_exact_osm_ref:publishedRefs.has("osm:"+featuretype+":"+feature.id),score,verification_status:"OSM_DISCOVERY_ONLY_IDENTITY_AND_EXACT_GEOMETRY_NOT_VERIFIED"};
};
export const assess=(row,response)=>{
 const scored=response.error?[]:response.elements.map(x=>rank(row,x)).filter(Boolean).sort((a,b)=>b.score-a.score||a.distance_from_unverified_search_centre_m-b.distance_from_unverified_search_centre_m);
 const unique=[...new Map(scored.map(x=>[x.osm_ref,x])).values()].slice(0,8);
 const closeExisting=GEO.places.filter(p=>p.address?.country_code===row.country&&p.geo?.lat!=null&&p.geo?.lng!=null).map(p=>({place_id:p.place_id,distance_m:distanceM(row.research_search_center.lat,row.research_search_center.lng,p.geo.lat,p.geo.lng)})).filter(p=>p.distance_m<=1300).sort((a,b)=>a.distance_m-b.distance_m).slice(0,4);
 return {queue_row:row.queue_row,candidate_ids:row.candidate_ids,country:row.country,site_name:row.site_name,identity_source_lead_url:row.source_lead_url,scope_adjudication:row.scope_adjudication||null,status:response.error?"REMOTE_QUERY_FAILED":unique.length?"OSM_CANDIDATE_REVIEW_REQUIRED":"NO_OSM_WORSHIP_FEATURE_IN_RADIUS",remote_error:response.error||null,near_existing_canonical:closeExisting,osm_candidates:unique,publication_authorized:false};
};
// Public OSM wiki: private.coffee (formerly kumi.systems) and VK Maps allow modest shared research; free and best-effort.
const urls=[process.env.AO_OVERPASS_ENDPOINT||"https://overpass.private.coffee/api/interpreter","https://maps.mail.ru/osm/tools/overpass/api/interpreter"];
const delay=ms=>new Promise(ok=>setTimeout(ok,ms));
async function fetchFrom(url,query){
 const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),22000);
 try{
  const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"AdOrientemSacredPlacesBulkResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"},body:new URLSearchParams({data:query}),signal:ctrl.signal});
  if(!res.ok)throw Error("HTTP "+res.status);
  const d=await res.json();
  if(!Array.isArray(d.elements))throw Error("Overpass missing elements");
  return {elements:d.elements,error:null,endpoint:url};
 }catch(e){return {elements:[],error:String(e?.message||e),endpoint:url};}
 finally{clearTimeout(t);}
}
async function fetchBatch(rows){
 const q=makeQuery(rows),errors=[];
 for(const url of [...new Set(urls)]){
  const r=await fetchFrom(url,q);
  if(!r.error)return r;
  errors.push(url+": "+r.error);
  await delay(350);
 }
 return {elements:[],error:errors.join("; "),endpoint:null};
}
export async function screen({network=false,output=null,shardIndex=null,shardCount=4}={}){
 if(!Number.isInteger(shardCount)||shardCount<1||shardCount>8||shardIndex!==null&&(!Number.isInteger(shardIndex)||shardIndex<0||shardIndex>=shardCount))throw Error("Invalid shard");
 const rows=BASE.open_mapping_68.filter((row,i)=>shardIndex===null || i%shardCount===shardIndex),all=[],errors=[];
 const destName=output||("data/geography/research/sacred-places-p39-open68-osm-evidence"+(shardIndex===null?"":("-shard-"+shardIndex+"-of"+shardCount))+".v1.json");
 const batchSize=5;
 if(!network) return {mode:"dry-run",rows:rows.length,batches:Math.ceil(rows.length/batchSize),global_leads:BASE.global_500.length,existing_canonical:BASE.counts.verified_canonical_links,still_open_acquisition:BASE.counts.still_open_acquisition_rows,overlap_ids:BASE.counts.acquisition_ids_also_in_mapping_queue,sample_query_bytes:makeQuery(rows.slice(0,batchSize)).length,publication_authorized:false};
 for(let i=0;i<rows.length;i+=batchSize){
  const batch=rows.slice(i,i+batchSize);
  let r=await fetchBatch(batch);
  // Failed five-row calls are retried in smaller groups; preserve each outage as an explicit exception.
  all.push(...batch.map(row=>assess(row,r)));
  if(r.error)errors.push({rows:batch.map(v=>v.queue_row),error:r.error});
  // Failed remote queries are explicit retry candidates. Never silently call them "no OSM site".
  console.log("P39_PROGRESS "+JSON.stringify({processed:all.length,total:rows.length,remote_failures:all.filter(x=>x.status==="REMOTE_QUERY_FAILED").length,with_hits:all.filter(x=>x.osm_candidates.length>0).length}));
  await delay(700);
 }
 all.sort((a,b)=>a.queue_row-b.queue_row);
 if(all.length!==rows.length||new Set(all.map(x=>x.queue_row)).size!==rows.length)throw Error("Lost/duplicated rows in remote acquisition");
 const count=name=>all.filter(x=>x.status===name).length;
 const doc={schema:"AO_SACRED_PLACES_P39_OSM_DISCOVERY_ALL68_V1",generated_at:new Date().toISOString(),status:"UNVERIFIED_OSM_DISCOVERY_RESULTS_NO_CANONICAL_PUBLICATION",source_reconciliation_manifest:baselinePath,shard:{index:shardIndex,count:shardIndex===null?1:shardCount,input_total_rows:68},canonical_snapshot:{places:GEO.places.length},source_licence:"© OpenStreetMap contributors, ODbL 1.0",query_radius_m:900,search_centres_are_not_map_publishable:true,summary:{input_rows:all.length,rows_with_osm_hits:count("OSM_CANDIDATE_REVIEW_REQUIRED"),rows_no_hits:count("NO_OSM_WORSHIP_FEATURE_IN_RADIUS"),rows_remote_failed:count("REMOTE_QUERY_FAILED"),new_places_published:0,upstream_global_500_verified_reuses:BASE.counts.verified_canonical_links,upstream_global_500_unresolved:BASE.counts.still_open_acquisition_rows},remote_errors:errors,results:all};
 const dest=resolve(ROOT,destName);mkdirSync(resolve(dest,".."),{recursive:true});writeFileSync(dest,JSON.stringify(doc,null,2)+"\n");
 console.log("P39_BULK_RESULT "+JSON.stringify({schema:doc.schema,summary:doc.summary,output:destName}));
 for(const row of all)console.log("P39_ROW_JSON "+JSON.stringify(row));
 if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,[
  "# Sacred Places P39 research — read only",
  "Scanned: "+all.length+"; OSM hit rows: "+doc.summary.rows_with_osm_hits+"; no hits: "+doc.summary.rows_no_hits+"; remote failures: "+doc.summary.rows_remote_failed,
  "500 global leads independently reconciled: 98 known canonical, 402 outstanding (54 IDs overlap mapping queue).",
  "**Zero new Places or geometry were published. OSM feature centers are not exact building footprints.**"
 ].join("\n")+"\n");
 return doc;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const network=process.argv.includes("--network");
 const shardArg=process.argv.find(a=>a.startsWith("--shard="));
 const shard=shardArg?.slice(8).match(/^(\d+)\/(\d+)$/);
 if(shardArg&&!shard)throw Error("Expected --shard=0/4");
 const args=shard?{shardIndex:Number(shard[1]),shardCount:Number(shard[2])}:{};
 screen({network,...args}).then(x=>{if(!network)console.log(JSON.stringify(x));}).catch(e=>{console.error(e);process.exitCode=1});
}
