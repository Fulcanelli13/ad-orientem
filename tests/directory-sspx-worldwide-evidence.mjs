import assert from "node:assert/strict";
import fs from "node:fs";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const base="data/directory/research/staging/sspx-world-map/";
const v1=load(base+"worldwide-reconciliation.v1.json");
const v2=load(base+"worldwide-evidence-crosswalk.v2.json");
assert.equal(v2.schema,"AO_DIRECTORY_SSPX_WORLD_MAP_EVIDENCE_CROSSWALK_V2");
assert.equal(v2.source_index_identity_count,941);
assert.equal(v2.canonical_snapshot_records,576);
assert.equal(v2.official_approved_geo_links,336);
assert.equal(v2.official_geo_links_found_in_941,336);
assert.equal(v2.unresolved_v1_total,210);
assert.equal(v2.review_counts.prior_official_source_links,30);
assert.equal(v2.review_counts.same_city_without_confirmed_physical_identity,85);
assert.equal(v2.review_counts.no_registered_locality_candidate,95);
assert.equal(v2.official_geo_by_previous_bucket.NO_SUNDAY_BADGE.official_overlay_matched,41);
assert.equal(v2.cases.length,210);
assert.equal(new Set(v2.cases.map(x=>x.source_place_id)).size,210);
assert.deepEqual(new Set(v2.cases.map(x=>x.source_place_id)),
 new Set(v1.cases.filter(x=>x.review_bucket==="UNRESOLVED_SUNDAY_IDENTITY").map(x=>x.source_place_id)));
assert.ok(v2.cases.every(x=>x.publication_eligible===false));
assert.equal(v2.controls.new_published_mass_records,0);
assert.equal(v2.controls.definitive_missing_public_mass_venues,null);
assert.equal(v2.cases.filter(x=>x.prior_official_geo_link).length,30);
assert.equal(v2.cases.filter(x=>x.mx_official_district_sunday_evidence).length,23);
assert.equal(v2.cases.filter(x=>x.mx_official_district_sunday_evidence?.physical_street_address).length,10);
assert.ok(v2.cases.filter(x=>x.prior_official_geo_link).every(x=>
 x.prior_official_geo_link.source_url.includes("/places/")&&x.prior_official_geo_link.crm_source_ref.startsWith("SSPX:OPE-")));
console.log("SSPX worldwide evidence crosswalk: PASS — 210 reviewed, 30 prior source links, 85 same-city hints, 95 no-locality candidates, 10 MX street leads");
