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
 const coords=r=>[r.lat,r.lng].map(n=>Number(n).toFixed(6)).join(",");
 for(const r of records)if(!Number.isFinite(r.lat)||!Number.isFinite(r.lng)||
  Math.abs(r.lat)>90||Math.abs(r.lng)>180)throw Error("Bad source coordinates");
 const requests=records.flatMap(r=>[
 "nwr(around:"+radius+","+coords(r)+")[\"amenity\"=\"place_of_worship\"];",
 "nwr(around:"+radius+","+coords(r)+")[\"building\"~\"^(church|chapel)$\"];"
 ]);
 return "[out:json][timeout:85];(\n"+requests.join("\n")+"\n);out center tags;";
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
const argumentsMap=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith("--")&&x.includes("="))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const hasAll=process.argv.includes("--all");
async function main(){
 const ledger=JSON.parse(readFileSync(source,"utf8"));
 const pending=pendingRecords(ledger);
 const offset=Number(argumentsMap.offset??0),limit=hasAll?pending.length:Number(argumentsMap.limit??100);
 if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>pending.length||offset+limit>pending.length)
   throw Error("Invalid batch offset or limit. Pending: "+pending.length);
 const batch=pending.slice(offset,offset+limit),rows=[];
 const url=process.env.AO_OVERPASS_ENDPOINT||"https://overpass.private.coffee/api/interpreter";
 if(!/^https:\/\//.test(url))throw Error("HTTPS Overpass endpoint required");
 for(let i=0;i<batch.length;i+=20){
  const group=batch.slice(i,i+20);const query=overpassQuery(group);
  let result=null;
  for(let attempt=0;attempt<3;attempt++){
   try{
    const response=await fetch(url,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","User-Agent":"Ad-Orientem-Open-Source-Atlas-Research/1.0"},
      body:new URLSearchParams({data:query}).toString(),signal:AbortSignal.timeout(100000)});
    if(!response.ok)throw Error("HTTP "+response.status);
    result=await response.json();
    if(!Array.isArray(result.elements))throw Error("Malformed Overpass payload");
    break;
   }catch(err){
    if(attempt===2)throw Error("Overpass batch "+i+" failed: "+err.message);
    await delay(3500*(attempt+1));
   }
  }
  for(const r of group)rows.push(candidatesForSite(r,result.elements));
  if(i+20<batch.length)await delay(2500);
 }
 const summary=rows.reduce((a,x)=>(a[x.review_status]=(a[x.review_status]||0)+1,a),{});
 const output={schema:"AO_DIOCESAN_OVERPASS_PIN_CANDIDATES_V1",as_of:new Date().toISOString(),
   source_audit:"data/directory/research/diocesan-coordinate-quality-audit-20261031.v1.json",
   source_count:pending.length,offset,limit:batch.length,provider:"OpenStreetMap Overpass / ODbL",
   policy:"Research-only candidates. Do NOT auto-promote coordinates, change ecclesial attribution, search photographs or treat an OSM feature as a reviewed church identity.",
   summary,rows};
 const file=argumentsMap.output||join(root,"data/directory/research/diocesan-osm-candidates-"+String(offset).padStart(4,"0")+"-"+String(batch.length).padStart(3,"0")+".v1.json");
 writeFileSync(resolve(file),JSON.stringify(output,null,2)+"\n");
 process.stdout.write(JSON.stringify({output:file,scanned:batch.length,pending_total:pending.length,summary})+"\n");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main().catch(err=>{process.stderr.write(err.stack+"\n");process.exitCode=1;});
