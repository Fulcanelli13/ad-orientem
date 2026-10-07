import fs from "node:fs";
import path from "node:path";
import { auditDirectoryGeo, isMapPublishableGeo } from "../../src/find/geo-provenance.js";

const providers=(process.env.AO_GEOCODE_PROVIDERS??"fssp,icksp,ibp").split(",").map(x=>x.trim()).filter(Boolean);
const aggregatePath=path.resolve("data/directory/generated/geocoding-report.v1.json");
const aggregate=JSON.parse(fs.readFileSync(aggregatePath,"utf8"));
let total=0,totalUnresolved=0,failed=false;
for(const provider of providers){
  const base=path.resolve("data/directory/generated",provider);
  const venues=JSON.parse(fs.readFileSync(path.join(base,"venues.v1.json"),"utf8")).records??[];
  const geojson=JSON.parse(fs.readFileSync(path.join(base,"geo.v1.geojson"),"utf8"));
  const report=JSON.parse(fs.readFileSync(path.join(base,"import-report.v1.json"),"utf8"));
  const featureIds=new Set((geojson.features??[]).map(f=>f?.properties?.venue_id));
  const publishable=venues.filter(v=>isMapPublishableGeo(v?.geo,v?.address?.country_code));
  const errors=[];
  for(const venue of publishable){
    const issues=auditDirectoryGeo(venue.geo,{countryCode:venue?.address?.country_code,path:"venue:"+venue.venue_id+".geo"});
    if(issues.length)errors.push(...issues.map(x=>x.code+" "+venue.venue_id));
    if(!featureIds.has(venue.venue_id))errors.push("MISSING_GEOJSON_FEATURE "+venue.venue_id);
  }
  if(featureIds.size!==publishable.length)errors.push("GEOJSON_COUNT_MISMATCH "+featureIds.size+" != "+publishable.length);
  if(Number(report.geo_feature_count)!==publishable.length)errors.push("IMPORT_REPORT_GEO_COUNT_MISMATCH");
  total+=publishable.length;
  const unresolved=venues.length-publishable.length;
  totalUnresolved+=unresolved;
  const aggregateProvider=aggregate?.providers?.[provider];
  if(!aggregateProvider){
    errors.push("AGGREGATE_PROVIDER_MISSING "+provider);
  }else{
    if(Number(aggregateProvider.total)!==venues.length)errors.push("AGGREGATE_TOTAL_MISMATCH "+aggregateProvider.total+" != "+venues.length);
    if(Number(aggregateProvider.mapped)!==publishable.length)errors.push("AGGREGATE_MAPPED_MISMATCH "+aggregateProvider.mapped+" != "+publishable.length);
    if(Number(aggregateProvider.unresolved)!==unresolved)errors.push("AGGREGATE_UNRESOLVED_MISMATCH "+aggregateProvider.unresolved+" != "+unresolved);
  }
  if(errors.length){
    failed=true;
    console.error(provider.toUpperCase()+": FAIL — "+errors.slice(0,20).join("; "));
  }else{
    const byPrecision=publishable.reduce((acc,v)=>{const p=v.geo.precision;acc[p]=(acc[p]??0)+1;return acc},{});
    console.log(provider.toUpperCase()+": PASS — "+publishable.length+"/"+venues.length+" mapped "+JSON.stringify(byPrecision));
  }
}
const aggregateMapped=providers.reduce((sum,p)=>sum+Number(aggregate?.providers?.[p]?.mapped??0),0);
const aggregateUnresolved=providers.reduce((sum,p)=>sum+Number(aggregate?.providers?.[p]?.unresolved??0),0);
if(aggregateMapped!==total){
  failed=true;
  console.error("Aggregate mapped total mismatch: "+aggregateMapped+" != "+total);
}
if(aggregateUnresolved!==totalUnresolved){
  failed=true;
  console.error("Aggregate unresolved total mismatch: "+aggregateUnresolved+" != "+totalUnresolved);
}
if(total===0){
  failed=true;
  console.error("No map-publishable directory coordinates were produced.");
}
if(failed)process.exitCode=1;
else console.log("Directory geocoded snapshot validation: PASS — "+total+" total map pins");
