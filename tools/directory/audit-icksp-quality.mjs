import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expandResearchProviderSnapshot } from "../../src/find/data-service.js";
import { compareVenueCandidates, normalizeAddress } from "../../src/find/entity-resolution.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
function readJson(rel){return JSON.parse(fs.readFileSync(path.join(ROOT,rel),"utf8"))}
function maybeRead(rel){
  const p=path.join(ROOT,rel);
  return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,"utf8")):null;
}
function safeArray(v){return Array.isArray(v)?v:[]}
function norm(v){return String(v??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function cityKey(v){return norm(v?.address?.city??"")}
function exactAddress(a,b){
  const aa=normalizeAddress(a?.address?.formatted??a?.address?.line1??"");
  const bb=normalizeAddress(b?.address?.formatted??b?.address?.line1??"");
  return aa.length>=10&&aa===bb;
}
function exactNameCity(a,b){
  const an=norm(a?.name?.official),bn=norm(b?.name?.official);
  return an.length>=5&&an===bn&&cityKey(a)&&cityKey(a)===cityKey(b);
}
function pairKey(a,b){return [a.venue_id,b.venue_id].sort().join("::")}
const dispositions=maybeRead("data/directory/research/icksp-overlap-dispositions.v1.json")??{records:[]};
const reviewed=new Map(safeArray(dispositions.records).map(x=>[x.pair_key,x]));

const ickspSnapshot=readJson("data/directory/generated/v19/icksp-federated.v1.json");
const ickspExpanded=expandResearchProviderSnapshot(ickspSnapshot);
const icksp=ickspExpanded.venues;

const corpora=[];
for(const [label,rel] of [
  ["ICKSP_LIVE","data/directory/generated/icksp/venues.v1.json"],
  ["FSSP","data/directory/generated/fssp/venues.v1.json"],
  ["IBP","data/directory/generated/ibp/venues.v1.json"],
]){
  const doc=maybeRead(rel);
  if(doc?.records)corpora.push({label,venues:doc.records});
}
for(const [label,rel] of [
  ["DIOCESAN","data/directory/generated/v19/diocesan.v1.json"],
  ["CANONS_ST_JOHN_CANTIUS","data/directory/generated/v19/canons-st-john-cantius.v1.json"],
]){
  const doc=maybeRead(rel);
  if(doc?.records)corpora.push({label,venues:expandResearchProviderSnapshot(doc).venues});
}

const internal=[],cross=[];
for(let i=0;i<icksp.length;i++){
  for(let j=i+1;j<icksp.length;j++){
    const a=icksp[i],b=icksp[j];
    if(a?.address?.country_code!==b?.address?.country_code)continue;
    const comparison=compareVenueCandidates(a,b);
    if(comparison.classification==="AUTO_MERGE_SAFE"||exactAddress(a,b)||exactNameCity(a,b)){
      const item={pair_key:pairKey(a,b),left:a.venue_id,right:b.venue_id,left_name:a?.name?.official,right_name:b?.name?.official,country:a?.address?.country_code,classification:comparison.classification,exact_address:exactAddress(a,b),exact_name_city:exactNameCity(a,b)};
      if(!reviewed.has(item.pair_key))internal.push(item);
    }
  }
}
for(const a of icksp){
  for(const corpus of corpora){
    for(const b of corpus.venues){
      if(a?.address?.country_code!==b?.address?.country_code)continue;
      const comparison=compareVenueCandidates(a,b);
      if(comparison.classification==="AUTO_MERGE_SAFE"||exactAddress(a,b)||exactNameCity(a,b)){
        const item={pair_key:pairKey(a,b),left:a.venue_id,right:b.venue_id,left_name:a?.name?.official,right_name:b?.name?.official,country:a?.address?.country_code,other_corpus:corpus.label,classification:comparison.classification,exact_address:exactAddress(a,b),exact_name_city:exactNameCity(a,b)};
        if(!reviewed.has(item.pair_key))cross.push(item);
      }
    }
  }
}
const massRows=ickspSnapshot.records.filter(row=>row.svc==="MASS");
const missingVerification=massRows.filter(row=>!/^20\d{2}-\d{2}-\d{2}$/.test(String(row.vv??"")));
const missingSource=massRows.filter(row=>!/^https:\/\//.test(String(row.su??"")));
const missingLocation=icksp.filter(v=>!(v?.address?.formatted||v?.address?.city));

const report={
  schema:"AO_DIRECTORY_ICKSP_QUALITY_AUDIT_V1",
  generated_at:new Date().toISOString(),
  candidate_records:ickspSnapshot.records.length,
  physical_venues:icksp.length,
  internal_unreviewed_overlap_count:internal.length,
  cross_provider_unreviewed_overlap_count:cross.length,
  current_mass_rows_missing_verified_on:missingVerification.map(x=>x.u),
  current_mass_rows_missing_source:missingSource.map(x=>x.u),
  physical_venues_missing_location:missingLocation.map(x=>x.venue_id),
  internal_unreviewed_overlaps:internal,
  cross_provider_unreviewed_overlaps:cross,
};
console.log(JSON.stringify(report,null,2));
if(missingVerification.length||missingSource.length||missingLocation.length||internal.length){
  process.exitCode=1;
}
