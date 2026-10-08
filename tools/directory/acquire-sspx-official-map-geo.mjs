import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {isMapPublishableGeo} from "../../src/find/geo-provenance.js";
import {tokenSimilarity} from "../../src/find/entity-resolution.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const BASE="https://map.fsspx.org";
const API=BASE+"/api/v1/places";
const asText=x=>String(x??"").trim();
const fold=x=>asText(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const common=(a,b)=>{
  const x=fold(a),y=fold(b);
  return x&&y&&(x===y||x.includes(y)||y.includes(x));
};
export function parseOfficialMapJson(raw){
  if(typeof raw==="object"&&raw!==null)return raw;
  const text=asText(raw);
  const a=text.indexOf('{"total":');
  if(a<0)throw new Error("Official map feed is not parseable JSON / total marker absent");
  let parsed;
  try{parsed=JSON.parse(text.slice(a).trim())}
  catch(error){
    // Jina sometimes adds a trailing markdown block terminator.
    const last=text.lastIndexOf("}");
    if(last<a)throw error;
    parsed=JSON.parse(text.slice(a,last+1));
  }
  return parsed;
}
export function assertOfficialMapPage(p,{offset}={}){
  if(!Number.isInteger(p?.total)||p.total<500||!Array.isArray(p.items))
    throw new Error("Official SSPX map list count or item array missing");
  if(!Number.isInteger(p.offset)||p.offset!==offset)
    throw new Error("Official SSPX map pagination offset drift");
  if(!Number.isInteger(p.limit)||p.limit<=0||p.limit>1000)
    throw new Error("Official SSPX map pagination limit invalid");
  if(!p.items.length)throw new Error("Official SSPX map returned an empty page");
  if(p.items.some(x=>!x?.crmId||!x?.slug||!x?.countryCode))
    throw new Error("Official SSPX map identity data missing");
}
async function fetchPage(url,fetchImpl=fetch){
  const variants=[url,"https://r.jina.ai/"+url];
  const errors=[];
  for(const target of variants){
    try{
      const response=await fetchImpl(target,{headers:{"Accept":"application/json,text/plain",
        "User-Agent":"AdOrientemDirectoryResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"}});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const result=parseOfficialMapJson(await response.text());
      return {result,transport:target===url?"FIRST_PARTY_DIRECT":"THIRD_PARTY_RETRIEVAL"};
    }catch(error){errors.push(target+" "+String(error));}
  }
  throw new Error("Official SSPX map inaccessible: "+errors.join("; "));
}
export async function acquireOfficialMap({fetchImpl=fetch}={}){
  const seen=new Set(),all=[],transports=[];
  let expectedTotal=null,offset=0,page=0;
  do{
    const url=API+"?lang=en&limit=1000&offset="+offset;
    const {result,transport}=await fetchPage(url,fetchImpl);
    assertOfficialMapPage(result,{offset});
    if(expectedTotal===null)expectedTotal=result.total;
    if(expectedTotal!==result.total)throw new Error("SSPX official map changed total during acquisition");
    for(const item of result.items){
      const id=asText(item.crmId);
      if(seen.has(id))throw new Error("SSPX official map duplicate CRM id "+id);
      seen.add(id);all.push(item);
    }
    transports.push(transport);
    offset+=result.items.length;page++;
    if(page>20||offset>10000)throw new Error("SSPX official map unexpected pagination");
  }while(offset<expectedTotal);
  if(all.length!==expectedTotal)throw new Error("SSPX official map incomplete acquisition");
  return {items:all,total:expectedTotal,pages:page,transports};
}
export function eligibleMapPlaces(items){
  return items.filter(item=>item.relationship==="fsspx" && item.sundayMass===true &&
    /^[-A-Z]{2,3}$/i.test(asText(item.countryCode)) &&
    Number.isFinite(Number(item.lat))&&Number.isFinite(Number(item.lng)) &&
    item.lat!==null&&item.lng!==null &&
    !["school","convent","monastery","retirement_home"].includes(item.kind) &&
    !["friend","affiliated","ecclesia_dei"].includes(item.relationship));
}
export function matchOfficialMapPlaces(snapshots,items){
  const source=eligibleMapPlaces(items);
  const matches=[],holds=[],unmatched=[];
  const byCountryCity=new Map();
  for(const item of source){
    const key=asText(item.countryCode).toUpperCase()+"|"+fold(item.city);
    const group=byCountryCity.get(key)||[];
    group.push(item);byCountryCity.set(key,group);
  }
  for(const {provider,filename,records} of snapshots){
    for(const row of records){
      if(!["CURRENT_PUBLIC_MASS","CONDITIONAL_MASS"].includes(row.ps))continue;
      const city=fold(row.l).replace(/\b(?:county|region|province)\b/g,"").trim();
      const country=asText(row.cc).toUpperCase();
      let cityList=byCountryCity.get(country+"|"+city)||[];
      if(!cityList.length){
        // A city may be followed by state/province in older provider sources.
        const cityFirst=city.split(",")[0].trim();
        cityList=(byCountryCity.get(country+"|"+cityFirst)||[]);
      }
      if(!cityList.length){unmatched.push({provider,id:row.u,reason:"CITY_NOT_IN_OFFICIAL_GEO_SOURCE"});continue;}
      const scored=cityList.map(item=>({
        item,score:Math.max(tokenSimilarity(row.n,item.name),
          tokenSimilarity(row.n,item.churchTitle??"")),
      })).sort((a,b)=>b.score-a.score);
      const best=scored[0],next=scored[1];
      if(!best||best.score<0.79 || (next&&next.score>=best.score-0.09)){
        holds.push({provider,id:row.u,city:row.l,country,reason:"NAME_IDENTITY_AMBIGUOUS",
          best_score:best?.score??0,candidates:scored.slice(0,3).map(s=>({
            crmId:s.item.crmId,name:s.item.name,score:s.score,
          }))});
        continue;
      }
      const item=best.item;
      const url=new URL(item.url||"/en/places/"+item.slug,BASE).href;
      const geo={lat:Number(item.lat),lng:Number(item.lng),
        // CRM geocoordinates may designate a priory, associated chapel,
        // or neighbourhood. Do not claim building-level precision.
        precision:"locality",geocoding_source:"OFFICIAL_SOURCE",
        source_ref:"SSPX:"+item.crmId,source_url:url,
        matched_country_code:country,matched_on:"OFFICIAL_NAME_AND_CITY",
        source_observed_at:"2026-10-08"};
      if(!isMapPublishableGeo(geo,country)){holds.push({
        provider,id:row.u,reason:"OFFICIAL_GEO_COORDINATE_CONTRACT_FAILED"});continue;}
      matches.push({provider,filename,upstream_id:row.u,official_crm_id:item.crmId,
        official_name:item.name,official_city:item.city,geo,
        match_score:Number(best.score.toFixed(4)),country_code:country});
    }
  }
  const bySourceId=new Map();
  for(const row of matches){
    const siblings=bySourceId.get(row.official_crm_id)||[];
    siblings.push(row);bySourceId.set(row.official_crm_id,siblings);
  }
  const safe=matches.filter(row=>{
    if(bySourceId.get(row.official_crm_id).length===1)return true;
    holds.push({provider:row.provider,id:row.upstream_id,
      reason:"OFFICIAL_CRM_MATCHES_MULTIPLE_RESEARCH_VENUES",crm_id:row.official_crm_id});
    return false;
  });
  return {eligible_source_places:source.length,matched:safe,holds,unmatched,
    rejected_non_mass_or_non_sspx:items.length-source.length};
}
export async function runOfficialGeoHarvest({root=ROOT,out=null,fetchImpl=fetch}={}){
  const feed=await acquireOfficialMap({fetchImpl});
  const dir=path.join(root,"data/directory/generated/v19");
  const files=(await fs.readdir(dir)).filter(n=>n.endsWith(".v1.json")&&!n.includes(".geo."));
  const snapshots=[];
  for(const name of files){
    const doc=JSON.parse(await fs.readFile(path.join(dir,name),"utf8"));
    if(doc.schema==="AO_DIRECTORY_RESEARCH_PROVIDER_V1"&&
      String(doc.provider).startsWith("SSPX_"))
      snapshots.push({provider:doc.provider,filename:name,records:doc.records});
  }
  const result=matchOfficialMapPlaces(snapshots,feed.items);
  const report={schema:"AO_SSPX_OFFICIAL_MAP_GEO_MATCH_REPORT_V1",
    source_url:API,source_place_entities:feed.total,source_pages:feed.pages,
    transport:[...new Set(feed.transports)],
    existing_sspx_source_records:snapshots.reduce((a,s)=>a+s.records.length,0),
    official_geolocated_sunday_sspx_source_entities:result.eligible_source_places,
    strict_name_city_coordinate_matches:result.matched.length,
    identity_or_provenance_holds:result.holds.length,
    unmatched_research_records:result.unmatched.length,
    source_only:true,publication_eligible_without_adjudication:0,
    note:"Official source coordinates are conservatively locality-precision. One CRM must not map to two physical church records.",
  };
  if(out){
    await fs.mkdir(out,{recursive:true});
    await fs.writeFile(path.join(out,"official-sspx-source-geo-report.v1.json"),JSON.stringify(report,null,2)+"\n");
    await fs.writeFile(path.join(out,"official-sspx-source-geo-matches.v1.json"),
      JSON.stringify({schema:"AO_SSPX_MAP_GEO_CANDIDATES_V1",source_url:API,records:result.matched},null,2)+"\n");
    await fs.writeFile(path.join(out,"official-sspx-source-geo-holds.v1.json"),
      JSON.stringify({schema:"AO_SSPX_MAP_GEO_HOLDS_V1",records:result.holds},null,2)+"\n");
  }
  return {report,...result};
}
const direct=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(direct){
  const out=process.argv.slice(2).find(x=>x.startsWith("--out="))?.slice(6);
  runOfficialGeoHarvest({out}).then(({report,matched})=>{
    console.log(JSON.stringify(report,null,2));
    console.log("AO_OFFICIAL_MATCHES_BEGIN");
    console.log(JSON.stringify(matched));
    console.log("AO_OFFICIAL_MATCHES_END");
  }).catch(error=>{console.error(error);process.exitCode=1;});
}
