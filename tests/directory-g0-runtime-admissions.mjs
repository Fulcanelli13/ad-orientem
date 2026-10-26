import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stageG0ResearchVenues} from "../src/find/g0-research-venues.js";
import {loadDirectoryDataset} from "../src/find/data-service.js";
import {directoryMapFeatures} from "../src/find/map-runtime.js";

const path="data/directory/research/canonical-g0-site-admissions-b84-b90-20261026.v1.json";
const input=JSON.parse(readFileSync(path,"utf8"));
assert.equal(input.records.length,36);
const result=stageG0ResearchVenues(input);
assert.deepEqual(result.summary,{total:36,staged:34,linked:2,held:0,public_pins:0,verified_mass_rows:0});
assert.deepEqual(new Set(result.linked.map(x=>x.upstream_id)),
  new Set(["AASJMV-EXT-001","VG19-PL-LODZ-ALL-SAINTS"]));
assert.ok(result.records.every(r=>r.venue.publication_state==="G0_RESEARCH_ONLY"));
assert.ok(result.records.every(r=>r.ministries.length===0&&r.sources.length===1));
assert.ok(result.records.every(r=>r.venue.geo.lat===null&&r.venue.geo.lng===null));
assert.equal(directoryMapFeatures(result.records).length,0);
const sorted=result.records.map(r=>r.research.group_id);
assert.equal(new Set(sorted).size,34);
// An existing physically identical church must hold its new research identity.
const duplicate=result.records[0];
const existing=[{venue:{venue_id:"existing-building",
  name:{official:duplicate.venue.name.official},
  address:{country_code:duplicate.venue.address.country_code,
    city:duplicate.venue.address.city,line1:duplicate.venue.address.line1}}}];
const screened=stageG0ResearchVenues(input,{existingRecords:existing});
assert.ok(screened.held.some(x=>x.id===duplicate.research.group_id&&
  x.reason==="POTENTIAL_SAME_PHYSICAL_BUILDING"));
assert.equal(screened.summary.staged,33);
const bad=structuredClone(input);
bad.records.push({...bad.records[0]});bad.record_count++;
assert.throws(()=>stageG0ResearchVenues(bad),/duplicate frozen G0/);
// Simulate the actual Find data loader without external network or provider snapshots.
const fetchImpl=async url=>({
  ok:url.includes("canonical-g0-site-admissions-b84-b90-20261026.v1.json"),
  json:async()=>input,
  status:404,
});
const loaded=await loadDirectoryDataset({providers:[],researchProviders:[],fetchImpl});
assert.equal(loaded.records.length,0,"Private G0 admissions leaked into public Find");
assert.equal(loaded.privateResearchVenues.length,34);
assert.equal(loaded.privateResearchLinkedIds.length,2);
assert.equal(loaded.privateResearchHolds.length,0);
assert.equal(loaded.g0ResearchSummary.public_pins,0);
assert.equal(directoryMapFeatures(loaded.privateResearchVenues).length,0);
console.log("PASS directory G0 runtime intake: 36 source identities; 34 privately staged, 2 existing, zero public pins and no schedules");
