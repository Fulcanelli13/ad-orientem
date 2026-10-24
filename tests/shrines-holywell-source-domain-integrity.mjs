import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const reg=read("data/shrines/source-registry.v1.json");
const sites=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const audit=read("data/shrines/research/holywell-source-url-drift-20261016.v1.json");
const byId=new Map(reg.sources.map(x=>[x.id,x]));

assert.equal(reg.sources.length,659);
assert.equal(byId.size,reg.sources.length);
assert.equal(audit.schema,"ao.shrines.source-url-drift-review.v1");
assert.equal(audit.status,"SOURCE_OWNER_URL_REPAIR_NO_SHRINE_PLACE_ID_OR_FEAST_AUTHORITY_CHANGE");
assert.equal(audit.records.length,2);
assert.equal(audit.original_source_id_contract,"ORIGINAL_SOURCE_IDS_PRESERVED");
assert.equal(audit.independent_ecclesial_confirmation,"https://www.cbcew.org.uk/jubilee-churches/");
assert(reg.sources.every(x=>{
  try{return !["stwinefrideswell.org.uk","www.stwinefrideswell.org.uk"].includes(new URL(x.url).hostname.toLowerCase());}
  catch{return true;}
}),"Compromised or obsolete St Winefride host still appears in authoritative source URLs");

const expected={
 "SHR-HOLYWELL-CONTACT":"https://www.stwinefridesshrine.org/blank-2",
 "PIL-HOLYWELL-FEAST":"https://www.stwinefridesshrine.org/pilgrimages"
};
for(const [id,url] of Object.entries(expected)){
 const x=byId.get(id);
 const a=audit.records.find(y=>y.source_id===id);
 assert(x&&a,"Preserve source record ID "+id);
 assert.equal(x.url,url);
 assert.equal(a.replacement_url,url);
 assert(a.historical_url.startsWith("https://www.stwinefrideswell.org.uk/"));
 assert.equal(x.directness,"OFFICIAL_SHRINE");
 assert.equal(new URL(x.url).hostname,"www.stwinefridesshrine.org");
 assert(a.evidence_scope&&a.claim_limit);
}
assert(/does not independently certify an immutable 3 November/i.test(byId.get("PIL-HOLYWELL-FEAST").contribution??""),
  "Retain explicit non-certification of a fixed liturgical feast from a year-specific programme");
assert(/year-specific programme/i.test(byId.get("PIL-HOLYWELL-FEAST").contribution??""));
const shrine=sites.shrines.find(x=>x.shrine_id===audit.affected_shrine_id);
assert(shrine);
assert.equal(shrine.place_id,audit.affected_place_id);
assert(shrine.associated_saints.includes("Saint Winefride"));
assert(shrine.associated_saints.includes("Saint Beuno"));
assert(shrine.source_ids.includes("SHR-HOLYWELL-CONTACT"));
assert(shrine.source_ids.includes("PIL-HOLYWELL-FEAST"));
assert(shrine.source_ids.includes("PIL-HOLYWELL-LMS"));
assert.equal(byId.get("SHR-HOLYWELL-PARISH").url,"https://www.stwinefridesholywell.co.uk/");
console.log("PASS Holywell source-domain repair: 449 existing source IDs preserved plus 66 R87 Place evidence sources, two official URLs, old host blocked, one unchanged physical shrine");
