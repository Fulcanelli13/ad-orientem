import assert from "node:assert/strict";
import fs from "node:fs";
import {auditTravellerMarkets} from "../tools/directory/audit-traveller-markets.mjs";

const market=JSON.parse(fs.readFileSync("data/directory/research/traveller-priority-markets-20261009.v1.json","utf8"));
const audit=auditTravellerMarkets({today:"2026-10-09"});
assert.equal(market.schema,"AO_FIND_TRAVELLER_MARKETS_V1");
assert.equal(audit.schema,"AO_FIND_TRAVELLER_MARKET_AUDIT_V1");
assert.deepEqual(audit.priority_markets.map(c=>c.country_code),["US","GB","FR","ES","PT","IT","MU","IN"]);
assert.equal(audit.priority_markets.length,8);
assert.ok(audit.secondary_markets.some(x=>x.country_code==="IE"));
assert.ok(audit.secondary_markets.some(x=>x.country_code==="CA"));
assert.ok(audit.secondary_markets.some(x=>x.country_code==="RE"));
assert.ok(!audit.priority_markets.some(x=>["PL","DE","BR"].includes(x.country_code)));
assert.equal(audit.background_worldwide_countries_deprioritized,true);
assert.ok(audit.summary.primary_source_rows>500);
assert.ok(audit.summary.primary_mass_asserted_rows>400);
for(const c of [...audit.priority_markets,...audit.secondary_markets]){
 assert.ok(Number.isInteger(c.source_records)&&c.source_records>=0);
 assert.ok(c.mass_asserted_source_records<=c.source_records);
 assert.equal(c.original_link_present+c.original_link_missing,c.source_records);
 assert.equal(c.mass_asserted_source_records+c.without_schedule_mass_evidence,c.source_records);
 assert.ok(c.scheduled_records_review_due+c.scheduled_records_review_unknown<=c.mass_asserted_source_records);
 assert.equal(c.verified_unique_physical_mass_venues,null,"Do not invent a deduplicated total");
 assert.equal(c.official_inventory_completeness,null,"Do not invent exhaustive percentage");
 assert.equal(c.traveller_ready_percentage,null,"Do not invent traveller-ready score");
 assert.equal(c.third_party_discovery_is_not_completeness_denominator,true);
}
for(const cc of ["US","GB","FR","ES","PT","IT","MU","IN"]){
 const record=audit.priority_markets.find(c=>c.country_code===cc);
 assert.ok(record.source_records>0,"Priority country lacks any source: "+cc);
}
const france=market.primary.find(x=>x.code==="FR");
assert.ok(france.sources.some(x=>/icrspfrance\.fr/.test(x.url)));
const portugal=market.primary.find(x=>x.code==="PT");
assert.ok(portugal.sources.some(x=>/fssp\.pt/.test(x.url)));
const india=market.primary.find(x=>x.code==="IN");
assert.ok(india.sources.some(x=>x.url.includes("/countries/in")));
const mauritius=market.primary.find(x=>x.code==="MU");
assert.ok(mauritius.sources.some(x=>x.url.includes("icrspmaurice.org")));
assert.equal(market.display_languages.join("/"),"en/fr");
assert.equal(market.quality.targets.original_source_links,"100% of visible listings");
assert.ok(market.quality.release_rules.some(x=>/ordinariate/i.test(x)));
assert.ok(market.quality.release_rules.some(x=>/No made-up coordinates/i.test(x)));
const later=auditTravellerMarkets({today:"2027-07-01"});
assert.ok(later.summary.primary_source_rows===audit.summary.primary_source_rows);
assert.ok(later.priority_markets.reduce((n,c)=>n+c.scheduled_records_review_due,0)
 >=audit.priority_markets.reduce((n,c)=>n+c.scheduled_records_review_due,0));
console.log("Traveller Find market focus: PASS — eight primary markets, independent original sources, unverified country-level completion disclosed");
console.log("TRAVELLER_MARKET_SUMMARY_JSON="+JSON.stringify({as_of:audit.as_of,primary:audit.priority_markets.map(({country_code,source_records,mass_asserted_source_records,scheduled_records_review_due,scheduled_records_review_unknown,known_exact_address_collision_groups})=>({country_code,source_records,mass_asserted_source_records,scheduled_records_review_due,scheduled_records_review_unknown,known_exact_address_collision_groups})),missing_provider_files:audit.summary.unmounted_provider_source_files}));
