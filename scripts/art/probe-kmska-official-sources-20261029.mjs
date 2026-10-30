/**
 * Diagnostic-only KMSKA public institution endpoint discovery, €0.
 * Intentionally probes only 3 frozen accepted KMSKA source IDs.
 * No artwork, metadata, photo, rights, or production approvals are changed.
 */
import {readFileSync,writeFileSync} from "node:fs";
const source=JSON.parse(readFileSync("data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json","utf8"));
const sampleIds=["kmska:0csw4p","kmska:7v3wb4","kmska:9tct5i"];
const samples=sampleIds.map(id=>source.rows.find(r=>r.sourceId===id));
if(samples.some(x=>!x)||source.rows.filter(r=>r.museum==="kmska").length!==89)throw Error("Frozen KMSKA source baseline incorrect");
const timeouts=9000;
async function request(url) {
 const started=Date.now();
 try {
  const response=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(timeouts),headers:{"Accept":"application/json, application/ld+json, text/html;q=0.8, */*;q=0.5","User-Agent":"AdOrientem-Research-ObjectIdentity/1.0 (public collection verification)"}});
  const ct=response.headers.get("content-type")||"";
  const raw=(await response.text()).slice(0,12000);
  const title=(raw.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i)||[])[1]||null;
  let dataShape=null;
  if(ct.includes("json")||raw.trimStart().startsWith("{")) {
   try {const v=JSON.parse(raw);dataShape={keys:Object.keys(v).slice(0,25),records:Array.isArray(v)?v.length:null,smallPreview:JSON.stringify(v).slice(0,900)}}catch{}
  }
  return {requestUrl:url,status:response.status,finalUrl:response.url,contentType:ct,bytesRead:raw.length,title,
   containsInventoryNumber:null,containsTitle:null,dataShape,
   textSample:raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/ig,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/ig,"").slice(0,800),
   elapsedMs:Date.now()-started};
 } catch(error) {return {requestUrl:url,error:String(error).slice(0,250),elapsedMs:Date.now()-started};}
}
const results=[];
for(const s of samples){
 const id=s.sourceId.split(":")[1],acc=s.sourceAccession;
 const candidates=[
  "https://datahub.kmska.be/api/v1/data/"+encodeURIComponent(id)+".json",
  "https://datahub.kmska.be/api/v1/data/"+encodeURIComponent(id),
  "https://kmska.be/collection/work/data/"+encodeURIComponent(id),
  "https://productionbackend.kmska.be/meesterwerk/"+encodeURIComponent(acc),
  "https://kmska.be/nl/meesterwerk/"+encodeURIComponent(acc)
 ];
 const requests=[];
 for(const url of candidates) {
  const r=await request(url);
  r.containsInventoryNumber=typeof r.textSample==="string"&&r.textSample.includes(acc);
  r.containsTitle=typeof r.textSample==="string"&&r.textSample.toLowerCase().includes(s.title.toLowerCase());
  requests.push(r);
 }
 results.push({sourceId:s.sourceId,accession:s.sourceAccession,reviewedTitle:s.title,requests});
}
const result={schema:"AO_KMSKA_OFFICIAL_ENDPOINT_PROBE_20261029_V1",at:new Date().toISOString(),
 readOnly:true,source:"data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json",
 sampleSize:3,recordsAwaitingAuthoritativeVerification:89,objectsVerifiedByThisProbe:0,
 blockedPromotion:true,results};
const dest="data/calendar/sacred-art-phase1-kmska-source-endpoint-probe-20261029.v1.json";
writeFileSync(dest,JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({dest,summary:results.map(r=>({id:r.sourceId,tests:r.requests.map(x=>({status:x.status,error:x.error,final:x.finalUrl,ct:x.contentType,keys:x.dataShape?.keys,title:x.title}))}))},null,2));
