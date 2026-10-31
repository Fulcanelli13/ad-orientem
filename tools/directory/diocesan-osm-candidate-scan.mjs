// Batch candidate discovery ONLY. Never updates Explore pins or photo approvals.
// Source: OpenStreetMap / Overpass API (ODbL); preserve OSM provenance.
// Usage: node tools/directory/diocesan-osm-candidate-scan.mjs --offset=0 --limit=100
// Use --all to screen every pending inherited marker. No keys or paid services.
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,join} from "node:path";
import {setTimeout as delay} from "node:timers/promises";

const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const source=join(root,"data/directory/research/diocesan-coordinate-quality-audit-20261031.v1.json");
const noAuto="CANDIDATE_ONLY_NOT_VERIFIED_NOT_PHOTO_APPROVED";
const stop=new Set(["saint","st","st.","s","santa","santo","san","sao","são","church","catholic","parish","chapel","capela","igreja","chiesa","kostol","kaplica","kościół","our","lady","of","the","and","holy","roman","notre","dame","de","di","del","da","do","dos","du","la","le","der","die","von","sv","svateho","svatej"]);
const normalize=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const words=s=>new Set(normalize(s).split(/\s+/).filter(w=>w.length>=3&&!stop.has(w)));
const radians=Math.PI/180;
export function metres(a,b,c,d){
 const p=(c-a)*radians,q=(d-b)*radians;
 const h=Math.sin(p/2)**2+Math.cos(a*radians)*Math.cos(c*radians)*Math.sin(q/2)**2;
 return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));
}
export function pendingRecords(ledger){
 return (ledger?.records??[]).filter(r=>r.coordinate_origin==="R49_INHERITED"&&
 r.precision==="source_marker_unassessed"&&Number.isFinite(r.lat)&&Number.isFinite(r.lng))
 .sort((a,b)=>a.physical_group_id.localeCompare(b.physical_group_id));
}

export function reviewQueueRows(ledger){
 return pendingRecords(ledger).map(r=>({
  physical_group_id:r.physical_group_id,source_id:r.source_ids[0],name:r.name,country:r.country,
  source_description:r.source_description,lat:r.lat,lng:r.lng,
  photo_gate:r.photo_gate,operator_scope:r.operator_scope,
  review_status:"OSM_CANDIDATES_NOT_YET_FETCHED",photo_approved:false
 }));
}

export function overpassQuery(records,radius=180){
 if(!Number.isInteger(radius)||radius<20||radius>300)throw Error("Invalid radius");
 if(!records.length||records.length>20)throw Error("Review at most 20 pins per public API request");
 // Call with one site from network code: never union distant countries into one costly query.
 const coords=r=>[r.lat,r.lng].map(n=>Number(n).toFixed(6)).join(",");
 for(const r of records)if(!Number.isFinite(r.lat)||!Number.isFinite(r.lng)||
  Math.abs(r.lat)>90||Math.abs(r.lng)>180)throw Error("Bad source coordinates");
 const requests=records.flatMap(r=>[
 "nwr(around:"+radius+","+coords(r)+")[\"amenity\"=\"place_of_worship\"];",
 "nwr(around:"+radius+","+coords(r)+")[\"building\"~\"^(church|chapel)$\"];"
 ]);
 return "[out:json][timeout:25];(\n"+requests.join("\n")+"\n);out center tags;";
}
export function rankCandidate(site,feature,radius=180){
 const lat=Number(feature?.lat??feature?.center?.lat),lng=Number(feature?.lon??feature?.center?.lon);
 if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
 const dist=metres(site.lat,site.lng,lat,lng);
 if(dist>radius)return null;
 const tags=feature.tags||{},kind=String(feature.type||"");
 if(!["node","way","relation"].includes(kind)||!Number.isInteger(feature.id))return null;
 const religion=normalize(tags.religion),denom=normalize(tags.denomination);
 if(religion&&religion!=="christian")return null;
 if(denom&&/anglican|lutheran|orthodox|methodist|baptist|protestant|evangelical|pentecostal/.test(denom))return null;
 const identity=tags.name||tags["name:en"]||tags.official_name||"";
 const a=words(site.name),b=words(identity);
 const shared=[...a].filter(w=>b.has(w));
 const nameScore=a.size?shared.length/a.size:0;
 const churchType=tags.building==="church"||tags.building==="chapel"||tags.amenity==="place_of_worship";
 const score=Math.round(58*nameScore+25*Math.max(0,1-dist/radius)+(churchType?12:0)+(denom.includes("catholic")?5:0));
 return {osm_ref:kind+":"+feature.id,source_url:"https://www.openstreetmap.org/"+kind+"/"+feature.id,
  name:identity||null,lat,lng,distance_m:Math.round(dist),
  name_shared_tokens:shared,score,feature_tags:{
   amenity:tags.amenity||null,building:tags.building||null,religion:tags.religion||null,
   denomination:tags.denomination||null,operator:tags.operator||null,
   "addr:street":tags["addr:street"]||null,"addr:housenumber":tags["addr:housenumber"]||null
  },review_status:noAuto};
}
export function candidatesForSite(site,features,{radius=180}={}){
 const matches=(features||[]).map(f=>rankCandidate(site,f,radius)).filter(Boolean);
 const unique=[...new Map(matches.map(x=>[x.osm_ref,x])).values()]
 .sort((a,b)=>b.score-a.score||a.distance_m-b.distance_m).slice(0,8);
 const top=unique[0];
 const ambiguous=Boolean(unique[1]&&top&&unique[1].score>=top.score-12);
 return {physical_group_id:site.physical_group_id,source_id:site.source_ids[0],
  name:site.name,country:site.country,source_lat:site.lat,source_lng:site.lng,
  source_description:site.source_description,operator_scope:site.operator_scope,
  photo_gate:site.photo_gate,candidates:unique,ambiguous,
  review_status:top?(ambiguous?"MULTIPLE_NEARBY_CHURCHES_REVIEW":"CANDIDATE_NOT_INDEPENDENTLY_VERIFIED"):"NO_MATCHED_OSM_CHURCH",
  promote_automatically:false,photo_approved:false};
}

export function validatedOverpassPayload(data){
 if(!data||!Array.isArray(data.elements))throw Error("Malformed Overpass response");
 if(data.remark && /runtime error|out of memory|timed out|query killed|failed|rate limit/i.test(String(data.remark)))
  throw Error("Overpass runtime failure: "+String(data.remark).slice(0,180));
 return data.elements;
}
const argumentsMap=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith("--")&&x.includes("="))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const hasAll=process.argv.includes("--all");
const endpoints=[
 process.env.AO_OVERPASS_ENDPOINT,
 "https://overpass.private.coffee/api/interpreter",
 "https://overpass-api.de/api/interpreter",
 "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
].filter((url,i,all)=>url&&all.indexOf(url)===i);
if(endpoints.some(url=>!/^https:\/\//.test(url)))throw Error("Only HTTPS Overpass endpoints allowed");
export async function requestOverpassSite(site,{request=fetch,timeoutMs=18000,providers=endpoints}={}){
 const query=overpassQuery([site]);
 const errors=[];
 for(const provider of providers){
  try{
   const response=await request(provider,{method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded",
     "User-Agent":"Ad-Orientem-Open-Source-Atlas-Research/1.0"},
    body:new URLSearchParams({data:query}).toString(),
    signal:AbortSignal.timeout(timeoutMs)});
   if(!response.ok)throw Error("HTTP "+response.status);
   const features=validatedOverpassPayload(await response.json());
   return {success:true,features,provider,errors};
  }catch(err){
   errors.push({provider,message:String(err.message||err).slice(0,200)});
  }
 }
 return {success:false,features:[],provider:null,errors};
}
function failedRow(site,status,errors=[]){
 return {...candidatesForSite(site,[]),review_status:status,
  fetch_status:status,fetch_provider:null,fetch_errors:errors,
  candidates:[],ambiguous:false,promote_automatically:false,photo_approved:false};
}
async function main(){
 const ledger=JSON.parse(readFileSync(source,"utf8"));
 const pending=pendingRecords(ledger);
 const offset=Number(argumentsMap.offset??0),limit=hasAll?pending.length:Number(argumentsMap.limit??100);
 if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>pending.length||offset+limit>pending.length)
  throw Error("Invalid batch offset or limit. Pending: "+pending.length);
 const batch=pending.slice(offset,offset+limit);
 const file=resolve(argumentsMap.output||join(root,"data/directory/research/diocesan-osm-candidates-"+
  String(offset).padStart(4,"0")+"-"+String(batch.length).padStart(3,"0")+".v1.json"));
 const rows=[];
 let consecutiveFailures=0;
 const startedAt=new Date().toISOString();
 for(const site of batch){
  let result;
  if(consecutiveFailures>=3){
   result=failedRow(site,"NOT_QUERIED_PROVIDER_OUTAGE");
  }else{
   const response=await requestOverpassSite(site);
   if(response.success){
    consecutiveFailures=0;
    result={...candidatesForSite(site,response.features),
      fetch_status:"FETCH_SUCCESS",fetch_provider:response.provider,fetch_errors:response.errors};
   }else{
    consecutiveFailures++;
    result=failedRow(site,"NETWORK_FAILED",response.errors);
   }
   await delay(600);
  }
  rows.push(result);
  // Checkpoint each group of ten so interrupted runs preserve processed evidence.
  if(rows.length%10===0||rows.length===batch.length){
   const summary=rows.reduce((o,r)=>(o[r.review_status]=(o[r.review_status]||0)+1,o),{});
   const successful=rows.filter(r=>r.fetch_status==="FETCH_SUCCESS");
   const output={schema:"AO_DIOCESAN_OVERPASS_PIN_CANDIDATES_V1",
    started_at:startedAt,as_of:new Date().toISOString(),
    source_audit:"data/directory/research/diocesan-coordinate-quality-audit-20261031.v1.json",
    source_count:pending.length,offset,limit:batch.length,rows_written:rows.length,
    provider:"OpenStreetMap Overpass / ODbL",query_style:"ONE_SOURCE_SITE_PER_BOUNDED_REQUEST",
    policy:"Only research candidates. No automatic coordinate promotion, operator proof or photograph approvals. Network errors and skipped sites are NOT no-matches.",
    fetched_count:successful.length,unqueried_count:rows.filter(r=>r.fetch_status==="NOT_QUERIED_PROVIDER_OUTAGE").length,
    matched_count:successful.filter(r=>r.candidates.length>0).length,
    summary,rows};
   writeFileSync(file,JSON.stringify(output,null,2)+"\n");
   process.stdout.write(JSON.stringify({checkpoint:rows.length,requested:batch.length,
    fetched:output.fetched_count,matched:output.matched_count,summary})+"\n");
  }
 }
 const out=JSON.parse(readFileSync(file,"utf8"));
 process.stdout.write(JSON.stringify({output:file,requested:batch.length,fetched:out.fetched_count,
  matched:out.matched_count,summary:out.summary})+"\n");
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main().catch(err=>{process.stderr.write(err.stack+"\n");process.exitCode=1;});
