import assert from "node:assert/strict";
import {auditWorldwideDirectory} from "../tools/directory/audit-worldwide-corpus.mjs";

const result=auditWorldwideDirectory();
assert.equal(result.schema,"AO_DIRECTORY_WORLDWIDE_COVERAGE_AUDIT_V1");
assert.equal(result.source_venue_records,1419);
assert.equal(result.mass_evidenced_records,1182);
assert.equal(result.without_mass_assertion,237);
assert.equal(result.by_provider.length,21);
const byId=new Map(result.by_provider.map(p=>[p.provider,p]));
assert.equal(byId.get("FSSP_LIVE").records,404);
assert.equal(byId.get("FSSP_LIVE").mass_evidenced_records,196);
assert.equal(byId.get("ICKSP_LIVE").records,27);
assert.equal(byId.get("ICKSP_FEDERATED_V13").records,120);
assert.equal(byId.get("ICKSP_FEDERATED_V13").mass_evidenced_records,104);
assert.equal(byId.get("SSPX_DISTRICT_SEED").records,34);
assert.equal(byId.get("SSPX_DISTRICT_SEED").mass_evidenced_records,34);
assert.equal(byId.get("SSPX_FRANCE_FIRST_PARTY").records,89);
assert.equal(byId.get("SSPX_FRANCE_FIRST_PARTY").mass_evidenced_records,89);
assert.equal(byId.get("SSPX_FRANCE_SECOND_PASS").records,30);
assert.equal(byId.get("SSPX_FRANCE_SECOND_PASS").mass_evidenced_records,30);
assert.equal(byId.get("SSPX_FOUR_DISTRICT_BULK").records,113);
assert.equal(byId.get("SSPX_FOUR_DISTRICT_BULK").mass_evidenced_records,113);
assert.equal(byId.get("SSPX_OCT26_MULTIREGION").records,61);
assert.equal(byId.get("SSPX_OCT26_MULTIREGION").mass_evidenced_records,61);
assert.equal(byId.get("SSPX_OCT26_AMERICAS").records,44);
assert.equal(byId.get("SSPX_OCT26_AMERICAS").mass_evidenced_records,44);
assert.equal(byId.get("SSPX_OCT26_POLAND").records,38);
assert.equal(byId.get("SSPX_OCT26_POLAND").mass_evidenced_records,38);
assert.equal(byId.get("SSPX_ASIA_CENTRAL_AMERICAS_20261008").records,47);
assert.equal(byId.get("SSPX_ASIA_CENTRAL_AMERICAS_20261008").mass_evidenced_records,47);
assert.equal(byId.get("SSPX_NA_DISTRICTS_20261008").records,120);
assert.equal(byId.get("SSPX_NA_DISTRICTS_20261008").mass_evidenced_records,120);
assert.equal(result.benchmark_context.sspx_raw_count_shortfall_non_authoritative,222);
assert.equal(result.controls.missing_worldwide_venue_count,null,
  "Do not invent missing venue count from incompatible global indexes");
assert.equal(result.controls.has_worldwide_physical_dedupe,false);
assert.ok(result.countries_represented>=30);
for(const p of result.by_provider){
  assert.equal(p.mass_evidenced_records+p.without_mass_assertion,p.records);
  assert.ok(p.mass_evidenced_records>=0&&p.mass_evidenced_records<=p.records);
}
console.log("Worldwide Directory coverage audit: PASS — "+
  result.source_venue_records+" records, "+result.mass_evidenced_records+
  " with Mass evidence; missing unique venue count intentionally unknown.");
