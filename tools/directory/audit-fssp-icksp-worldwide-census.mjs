import fs from "node:fs";
import assert from "node:assert/strict";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../../src/find/data-service.js";
import {applyIndicativeOtherCommunities} from "../../src/find/sspx-indicative-geo.js";
import {isMapPublishableGeo} from "../../src/find/geo-provenance.js";

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const registry=read("data/directory/research/fssp-icksp-worldwide-source-registry.v1.json");
const verifiedUrl=s=>{try{return new URL(s).protocol==="https:"}catch{return false}};
assert.ok(registry.sources.length>=15);
assert.ok(registry.sources.every(s=>verifiedUrl(s.url)&&["FSSP","ICKSP"].includes(s.community)));
assert.equal(new Set(registry.sources.map(s=>s.community+":"+s.region)).size,registry.sources.length);

function reportRows(provider,joined){
 const enriched=applyIndicativeOtherCommunities(joined).records;
 const byCountry={};
 for(const r of enriched){
  const cc=r.venue.address.country_code||"UNKNOWN";
  const bucket=byCountry[cc]??={sourceRecords:0,confirmedSchedule:0,noMassSchedule:0,mapped:0,indicative:0,unmapped:0};
  bucket.sourceRecords++;
  if(r.ministries.some(m=>m.schedules.some(s=>s.service_type==="MASS"&&String(s.payload?.raw||"").trim())))bucket.confirmedSchedule++;
  else bucket.noMassSchedule++;
  if(isMapPublishableGeo(r.venue.geo,cc))bucket.mapped++;else bucket.unmapped++;
  if(r.venue.geo?.indicative_only)bucket.indicative++;
 }
 return {provider,total:joined.length,byCountry:Object.fromEntries(Object.entries(byCountry).sort(([a],[b])=>a.localeCompare(b)))};
}
const fssp={
 venues:read("data/directory/generated/fssp/venues.v1.json").records,
 ministries:read("data/directory/generated/fssp/ministries.v1.json").records,
 schedules:read("data/directory/generated/fssp/schedules.v1.json").records,
 sources:read("data/directory/generated/fssp/sources.v1.json").records
};
assert.equal(fssp.venues.length,404);
assert.equal(fssp.ministries.length,404);
const sourceIds=new Set(fssp.sources.map(s=>s.source_id));
const ministryIds=new Set(fssp.ministries.map(m=>m.ministry_id));
for(const m of fssp.ministries)assert.ok(m.source_ids?.some(id=>sourceIds.has(id)),"Missing FSSP provenance");
for(const s of fssp.schedules)assert.ok(ministryIds.has(s.ministry_id),"Orphan FSSP Mass schedule");
const fsspJoined=publishableDirectoryRecords(joinDirectoryRecords(fssp));
const fsspReport=reportRows("FSSP",fsspJoined);
const fsspMass=Object.values(fsspReport.byCountry).reduce((n,c)=>n+c.confirmedSchedule,0);
const fsspNoMass=Object.values(fsspReport.byCountry).reduce((n,c)=>n+c.noMassSchedule,0);
assert.equal(fsspMass,196);
assert.equal(fsspNoMass,208);
assert.equal(Object.values(fsspReport.byCountry).reduce((n,c)=>n+c.mapped,0),404);

const raw=read("data/directory/generated/v19/icksp-federated.v1.json");
const geo=read("data/directory/generated/v19/icksp-federated.geo.v1.json");
const icksp=expandResearchProviderSnapshot(raw,{geoRecords:geo.records});
const ickspJoined=publishableDirectoryRecords(joinDirectoryRecords(icksp))
 .filter(r=>r.ministries.some(m=>m.community_id==="ICKSP"&&m.schedules.some(s=>s.service_type==="MASS")));
const ickspReport=reportRows("ICKSP_FEDERATED",ickspJoined);
const ickspPriorCensusTotal=104; // Historical baseline; the current registry is the source of the present count.
assert.ok(ickspReport.total>0,"Current ICKSP register must not be empty");
assert.equal(Object.values(ickspReport.byCountry).reduce((n,c)=>n+c.mapped,0),ickspReport.total,"Current ICKSP mapped subset must match the currently accepted publishable set");
const result={
 scope:"EXISTING_IMPORTED_RECORDS_ONLY",
 warning:"Indicative map coverage is not independent global inventory completeness. FSSP unscheduled/administrative entries must not be counted as current public Mass sites.",
 sourcesReviewed:registry.sources.length,
 fssp:{...fsspReport,scheduledMassVenues:fsspMass,otherOrUnscheduled:fsspNoMass},
 icksp:{...ickspReport,previousCensusTotal:ickspPriorCensusTotal,censusDelta:ickspReport.total-ickspPriorCensusTotal,requiresPhysicalReconciliation:ickspReport.total!==ickspPriorCensusTotal}
};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
