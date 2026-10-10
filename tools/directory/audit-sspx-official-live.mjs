import fs from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {loadDirectoryDataset} from "../../src/find/data-service.js";
import {directoryStats} from "../../src/find/data-service.js";

let apiCalls=0,errors=[],apiResponses=[];
const fetchImpl=async (url,opts={})=>{
 const value=String(url);
 if(value.startsWith("file:")){
  try{const json=JSON.parse(await fs.readFile(fileURLToPath(value),"utf8"));return {ok:true,json:async()=>json}}
  catch{return {ok:false,status:404}}
 }
 if(value.startsWith("https://map.fsspx.org/api/v1/places?")){
  apiCalls++;
  try{const response=await fetch(url,opts);apiResponses.push({status:response.status,content_type:response.headers?.get?.("content-type")||null,url:value});return response}
  catch(e){errors.push(String(e));return {ok:false,status:503}}
 }
 return {ok:false,status:404};
};
const data=await loadDirectoryDataset({fetchImpl});
const s=data.officialSspxDiscoverySummary;
const official=data.records.filter(r=>r.venue?.publication_state==="OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED");
const stats=directoryStats(data.records);
const report={
 schema:"AO_SSPX_OFFICIAL_API_LIVE_AUDIT_V1",
 generated_at:new Date().toISOString(),api_calls:apiCalls,
 source:"https://map.fsspx.org/api/v1/places?lang=en&limit=1000",
 parsed_source_count:s?.official_rows??0,api_responses:apiResponses,
 official_sspx_mass_places_seen:s?.sspx_mass_locations??0,
 already_owned_or_exact_matches:s?.already_in_directory??0,
 additional_source_listed_mass_venues:official.length,
 held_for_ambiguous_identity:s?.ambiguous_same_locality??0,
 other_or_nonmass:s?.invalid_or_nonmass??0,
 directory_records_after_supplement:stats.venues,
 country_count_after_supplement:stats.countries,
 api_errors:errors,
 warning:"Source counts are official map places, not independently deduplicated current parishes. Supplemental venues have no published times in Ad Orientem."
};
console.log("SSPX_OFFICIAL_LIVE_AUDIT="+JSON.stringify(report));
if(apiCalls===0||!s?.official_rows){console.error("SSPX official live API unavailable to CI: production retains its existing first-party offline corpus.");process.exitCode=1}
