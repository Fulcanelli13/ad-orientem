import fs from "node:fs/promises";
import path from "node:path";
import { auditVenue } from "../../../src/find/contracts.js";
import { isMapPublishableGeo } from "../../../src/find/geo-provenance.js";
import { findDuplicateCandidates } from "../../../src/find/entity-resolution.js";

async function writeJson(file,value){
  await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,JSON.stringify(value,null,2)+"\n","utf8");
}

export async function writeDirectoryDataset(outDir,{
  provider,
  retrievedAt=new Date().toISOString(),
  venues=[],
  ministries=[],
  schedules=[],
  sources=[],
  coverage={},
  discovery=[],
}={}){
  const validationIssues=[];
  for(const venue of venues){
    for(const issue of auditVenue(venue,`venue:${venue.venue_id}`))validationIssues.push(issue);
  }
  const duplicateCandidates=findDuplicateCandidates(venues);
  const geojson={
    type:"FeatureCollection",
    features:venues
      .filter(v=>isMapPublishableGeo(v?.geo,v?.address?.country_code))
      .map(v=>{
        const ministry=ministries.find(m=>m.venue_id===v.venue_id);
        return {
          type:"Feature",
          geometry:{type:"Point",coordinates:[Number(v.geo.lng),Number(v.geo.lat)]},
          properties:{
            venue_id:v.venue_id,
            name:v?.name?.official??null,
            venue_type:v.venue_type??null,
            country_code:v?.address?.country_code??null,
            city:v?.address?.city??null,
            community_id:ministry?.community_id??"UNKNOWN",
            precision:v?.geo?.precision??"unknown",
            approximate:["street","locality"].includes(String(v?.geo?.precision??"").toLowerCase()),
            geocoding_source:v?.geo?.geocoding_source??null
          }
        };
      })
  };
  const report={
    schema:"AO_DIRECTORY_SOURCE_IMPORT_REPORT_V1",
    provider,
    retrieved_at:retrievedAt,
    venue_count:venues.length,
    ministry_count:ministries.length,
    schedule_assertion_count:schedules.length,
    source_count:sources.length,
    geo_feature_count:geojson.features.length,
    validation_issue_count:validationIssues.length,
    duplicate_candidate_count:duplicateCandidates.length,
    auto_merge_safe_count:duplicateCandidates.filter(x=>x.classification==="AUTO_MERGE_SAFE").length,
    review_candidate_count:duplicateCandidates.filter(x=>x.classification==="REVIEW").length,
    coverage
  };
  await fs.mkdir(outDir,{recursive:true});
  await writeJson(path.join(outDir,"venues.v1.json"),{schema:"AO_DIRECTORY_VENUES_V1",generated_at:retrievedAt,records:venues});
  await writeJson(path.join(outDir,"ministries.v1.json"),{schema:"AO_DIRECTORY_MINISTRIES_V1",generated_at:retrievedAt,records:ministries});
  await writeJson(path.join(outDir,"schedules.v1.json"),{schema:"AO_DIRECTORY_SCHEDULE_ASSERTIONS_V1",generated_at:retrievedAt,records:schedules});
  await writeJson(path.join(outDir,"sources.v1.json"),{schema:"AO_DIRECTORY_SOURCES_V1",generated_at:retrievedAt,records:sources});
  await writeJson(path.join(outDir,"geo.v1.geojson"),geojson);
  await writeJson(path.join(outDir,"dedupe-review.v1.json"),{schema:"AO_DIRECTORY_DEDUPE_REVIEW_V1",generated_at:retrievedAt,candidates:duplicateCandidates});
  await writeJson(path.join(outDir,"validation-issues.v1.json"),{schema:"AO_DIRECTORY_VALIDATION_ISSUES_V1",generated_at:retrievedAt,issues:validationIssues});
  await writeJson(path.join(outDir,"discovery.v1.json"),{schema:"AO_DIRECTORY_DISCOVERY_V1",generated_at:retrievedAt,records:discovery});
  await writeJson(path.join(outDir,"import-report.v1.json"),report);
  return Object.freeze({report,validationIssues,duplicateCandidates,geojson});
}
