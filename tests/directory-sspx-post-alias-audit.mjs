import assert from "node:assert/strict";
import fs from "node:fs";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const root="data/directory/research/";
const pl=load(root+"sspx-priority-same-city-physical-review-20261009.v2.json");
const mx=load(root+"sspx-mexico-seven-alias-review-20261009.v2.json");
const total=load(root+"sspx-worldwide-210-case-disposition-20261009.v3.json");
const originals=load(root+"staging/sspx-world-map/worldwide-reconciliation.v1.json");
const files=["sspx-asia-central-americas","sspx-district-seed","sspx-four-district-bulk","sspx-france-first-party","sspx-france-second-pass","sspx-north-america-20261008","sspx-oct26-americas","sspx-oct26-europe","sspx-oct26-poland","sspx-mexico-completion-20261009","sspx-priority-europe-pacific-20261009"];
const registry=files.flatMap(name=>load("data/directory/generated/v19/"+name+".v1.json").records);
const ids=new Set(registry.map(x=>x.u));
assert.equal(registry.length,597);
assert.equal(ids.size,597);
assert.equal(pl.schema,"AO_DIRECTORY_SSPX_SAME_CITY_PHYSICAL_AUDIT_V2");
assert.equal(pl.cases.length,26);
assert.equal(pl.status_counts.EXISTING_PHYSICAL_MASS_VENUE_ALIAS,24);
assert.equal(pl.status_counts.SAME_CHAPEL_IDENTITY_ADDRESS_DISAGREEMENT,2);
assert.ok(pl.cases.every(x=>x.map_place_page==="https://map.fsspx.org/de/places/"+x.official_source_place_id));
assert.ok(pl.cases.every(x=>x.official_map_observed_address&&x.registered_address&&ids.has(x.registered_venue_id)));
const conflicts=pl.cases.filter(x=>x.adjudication==="SAME_CHAPEL_IDENTITY_ADDRESS_DISAGREEMENT");
assert.deepEqual(conflicts.map(x=>x.official_source_place_id).sort(),[
"centrum-sw-ludwika-marii-grignion-de-montfort","kaplica-pw-matki-bozej-bolesnej"
]);
assert.ok(conflicts.every(x=>x.add_new_venue===false&&x.change_canonical_address===false));
assert.equal(mx.schema,"AO_DIRECTORY_SSPX_MEXICO_SEVEN_ALIAS_RESOLUTION_V2");
assert.equal(mx.cases.length,7);
assert.ok(mx.cases.every(x=>x.decision==="EXISTING_PHYSICAL_VENUE_ALIAS"&&x.new_venue===false&&ids.has(x.registered_venue_id)));
assert.equal(total.schema,"AO_DIRECTORY_SSPX_210_CASES_POST_ALIAS_AUDIT_V3");
assert.equal(total.cases.length,210);
assert.deepEqual(new Set(total.cases.map(x=>x.source_place_id)),new Set(originals.cases.filter(x=>x.review_bucket==="UNRESOLVED_SUNDAY_IDENTITY").map(x=>x.source_place_id)));
assert.equal(new Set(total.cases.map(x=>x.source_place_id)).size,210);
assert.deepEqual(total.disposition_counts,{
 PENDING_PLACE_DETAIL_ADJUDICATION:120,
 EXISTING_PHYSICAL_ALIAS:37,
 NEW_VERIFIED_MASS_VENUE:21,
 EXISTING_OFFICIAL_CRM_LINK:30,
 ADDRESS_CONFLICT_HOLD:2,
});
assert.equal(total.fully_adjudicated,88);
assert.equal(total.pending_total,122);
assert.equal(total.current_sspx_mass_evidenced_records,597);
assert.ok(total.cases.filter(x=>x.status==="EXISTING_PHYSICAL_ALIAS").every(x=>x.venue_ids.length===1&&ids.has(x.venue_ids[0])));
assert.ok(total.cases.filter(x=>x.status==="ADDRESS_CONFLICT_HOLD").every(x=>x.discrepancy&&ids.has(x.venue_ids[0])));
assert.ok(total.cases.filter(x=>x.status==="NEW_VERIFIED_MASS_VENUE").every(x=>x.venue_ids.length===1&&ids.has(x.venue_ids[0])));
assert.ok(total.cases.every(x=>x.new_mass_record_count===(x.status==="NEW_VERIFIED_MASS_VENUE"?1:0)));
assert.equal(total.cases.reduce((acc,x)=>acc+x.new_mass_record_count,0),21);
assert.equal(total.controls.no_new_publication_in_this_audit,true);
console.log("SSPX source reconciliation post-Mexico/priority audit: PASS — 210 cases, 88 settled (31 new alias resolutions), 2 source address disputes, 120 other pending, 597 SSPX Mass rows");
