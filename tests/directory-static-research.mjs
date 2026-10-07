import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { expandStaticDirectoryBundle } from "../src/find/static-directory-research.js";
import { auditVenue } from "../src/find/contracts.js";

const readJson=path=>JSON.parse(readFileSync(path,"utf8"));
const diocesan=readJson("data/directory/static/diocesan.v1.json");
const provider=readJson("data/directory/static/provider-research.v1.json");
const residue=readJson("data/directory/static/us-residue.v1.json");

assert.equal(diocesan.records.length,43);
assert.equal(provider.records.length,204);
assert.deepEqual(provider.distribution,{
  AASJMV:6,
  FSVF:1,
  CANONS_ST_JOHN_CANTIUS:4,
  SSPV_CSPV:19,
  RCI:31,
  CMRI:142,
  SMMD:1,
});
assert.deepEqual(residue.summary,{total:13,promoted:1,provider_routed:4,rejected_current:1,staged:7});

const expandedDiocesan=expandStaticDirectoryBundle(diocesan);
const expandedProvider=expandStaticDirectoryBundle(provider);
assert.equal(expandedDiocesan.issues.length,0);
assert.equal(expandedProvider.issues.length,0);
assert.equal(expandedDiocesan.venues.length+expandedProvider.venues.length,247);

for(const venue of [...expandedDiocesan.venues,...expandedProvider.venues]){
  assert.deepEqual(auditVenue(venue),[],venue.venue_id+" failed canonical venue audit");
  assert.ok(venue.address.country_code,venue.venue_id+" lost country code");
}
for(const schedule of [...expandedDiocesan.schedules,...expandedProvider.schedules]){
  assert.ok(schedule.source_ids.length>0,schedule.schedule_id+" lost source provenance");
}
assert.ok(expandedDiocesan.ministries.every(m=>m.community_id==="DIOCESAN"));
assert.ok(expandedDiocesan.ministries.every(m=>m.liturgical_usage.family==="ROMAN"&&m.liturgical_usage.books==="1962"));
assert.equal(expandedDiocesan.ministries.some(m=>["FSSP","ICKSP","CANONS_ST_JOHN_CANTIUS"].includes(m.community_id)),false);

const byCommunity=id=>expandedProvider.ministries.filter(m=>m.community_id===id);
assert.ok(byCommunity("RCI").every(m=>m.liturgical_usage.books==="PRE_1955"));
assert.ok(byCommunity("CMRI").every(m=>m.liturgical_usage.books==="MIXED_OR_LOCAL"));
assert.ok(byCommunity("SSPV_CSPV").every(m=>m.liturgical_usage.books==="UNKNOWN"));
assert.ok(byCommunity("AASJMV").every(m=>m.liturgical_usage.books==="1962"));
assert.ok(byCommunity("CANONS_ST_JOHN_CANTIUS").every(m=>m.liturgical_usage.books==="1962"));

const charleston=diocesan.records.find(x=>x.id==="DIO-US-CHARLESTON-SACREDHEART");
assert.ok(charleston);
assert.equal(charleston.frequency,"SUNDAY_12:00");
assert.equal(charleston.books,"1962");
assert.ok(charleston.sources.some(x=>x.role==="schedule"&&/carolinaliturgy\.org/.test(x.url)));
assert.ok(charleston.sources.some(x=>x.role==="authorization"&&/charlestondiocese\.org/.test(x.url)));

const lahaina=residue.records.find(x=>x.exception_id==="USB-EX-006");
const sacredHeart=residue.records.find(x=>x.exception_id==="USB-EX-012");
assert.equal(lahaina.resolution,"REJECT_CURRENT_VENUE");
assert.equal(sacredHeart.resolution,"PROMOTED_DIOCESAN_2026_10_07");
assert.equal(residue.records.filter(x=>x.resolution==="PROVIDER_ROUTED").length,4);
assert.equal(residue.records.filter(x=>x.resolution==="STAGED").length,7);

const lawton=provider.records.find(x=>x.id==="SJC-004");
assert.equal(lawton.verification,"OFFICIAL_LIVE");

console.log("PASS Directory static diocesan/provider research projection");
