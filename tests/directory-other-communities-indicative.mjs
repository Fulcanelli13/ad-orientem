import assert from "node:assert/strict";
import fs from "node:fs";
import {applyIndicativeOtherCommunities} from "../src/find/sspx-indicative-geo.js";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";
import {isMapPublishableGeo} from "../src/find/geo-provenance.js";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const names=["diocesan","sspx-district-seed","sspx-france-first-party","sspx-france-second-pass",
 "sspx-four-district-bulk","sspx-oct26-europe","sspx-oct26-americas",
 "sspx-oct26-poland","sspx-asia-central-americas","sspx-north-america-20261008",
 "sspx-priority-europe-pacific-20261009","sspx-mexico-completion-20261009",
 "sspx-oct26-followup-65","sspx-global-completion-20261009",
 "sspx-official-route-oct26-20261009","aasjmv","fsvf","canons-st-john-cantius",
 "cmri","rci","cspv","smmd","icksp-federated"];
const collected={venues:[],ministries:[],schedules:[],sources:[]};
for(const name of names){
 const d=read("data/directory/generated/v19/"+name+".v1.json");
 const p="data/directory/generated/v19/"+name+".geo.v1.json";
 const geo=fs.existsSync(p)?read(p).records:[];
 const expanded=expandResearchProviderSnapshot(d,{geoRecords:geo});
 for(const k of Object.keys(collected))collected[k].push(...expanded[k]);
}
const records=publishableDirectoryRecords(joinDirectoryRecords(collected));
const other=records.filter(r=>!r.ministries.some(m=>m.community_id==="SSPX"));
const before=other.filter(r=>isMapPublishableGeo(r.venue.geo,r.venue.address.country_code)).length;
const result=applyIndicativeOtherCommunities(records);
const after=result.records.filter(r=>!r.ministries.some(m=>m.community_id==="SSPX"));
assert.equal(after.length,other.length);
assert.equal(result.summary.eligible,other.length);
assert.equal(result.summary.already_mapped,before);
assert.equal(result.summary.eligible,result.summary.already_mapped+
 result.summary.locality_added+result.summary.region_added+result.summary.country_added+result.summary.unresolved);
assert.ok(result.summary.locality_added+result.summary.country_added>0,"Bulk pass must add real indicative markers");
assert.equal(new Set(result.records.map(r=>r.venue.venue_id)).size,result.records.length);
for(let i=0;i<records.length;i++){
 const source=records[i],target=result.records[i];
 assert.equal(source.venue.venue_id,target.venue.venue_id);
 assert.deepEqual(source.ministries,target.ministries);
 assert.deepEqual(source.sources,target.sources);
 if(isMapPublishableGeo(source.venue.geo,source.venue.address.country_code))
  assert.strictEqual(target,source,"Never move existing verified pins");
 if(source.ministries.some(m=>m.community_id==="SSPX"))
  assert.strictEqual(target,source,"SSPX records owned by prior enrichment pass");
 if(target.venue.geo.indicative_only){
  assert.equal(target.venue.geo.routing_eligible,false);
  assert.equal(target.venue.geo.matched_country_code,target.venue.address.country_code);
  assert.ok(isMapPublishableGeo(target.venue.geo,target.venue.address.country_code));
 }
}
console.log("Other traditional communities map: PASS — "+before+" existing of "+other.length+
  ", new indicative localities "+result.summary.locality_added+
  ", regions "+result.summary.region_added+", countries "+result.summary.country_added+
  ", no-country-anchor "+result.summary.unresolved);
