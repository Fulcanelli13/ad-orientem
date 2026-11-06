import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditGeoArea, assertExploreGeographyRegistry } from "../src/find/geography-contracts.js";
import { LIVE, RELEASES } from "./helpers/sacred-places-live-baseline.mjs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const geo = read("data/geography/seed-registry.v1.json");
const v10 = read("data/geography/research/sacred-places-v10-c9-three-country-area-preflight-20261106.v1.json");
const intake = read("data/geography/research/sacred-atlas-169-owner-review-intake-20261106.v1.json");
const previous = read("data/geography/research/sacred-places-v10-b21-two-marian-site-admissions-20261106.v1.json");
const codes = ["AO", "GQ", "IQ"];
const ids = codes.map(code => "geo:country:" + code);
assert.ok(RELEASES.some(x => x.id === "V10-C9"), "C9 must be appended to the immutable release chain");
assert.equal(RELEASES.at(-1)?.id, "V10-C9", "New extension must follow B21");
assert.deepEqual(v10.baseline, previous.proposed);
assert.equal(v10.nonproduction, true);
assert.equal(v10.new_places, 0);
assert.equal(v10.published_new.length, 0);
assert.deepEqual(v10.new_geo_areas, ids);
assert.equal(v10.proposed.geo_areas, 155);
assert.equal(v10.proposed.geo_areas - v10.baseline.geo_areas, 3);
assert.equal(geo.places.length, 535);
assert.equal(geo.places.length, LIVE.places);
assert.equal(geo.geoAreas.length, LIVE.areas);
assert.equal(geo.geoAreas.length, 155);
const areaIds = geo.geoAreas.map(x => x.geo_area_id);
assert.equal(new Set(areaIds).size, areaIds.length);
for (const code of codes) {
 const area = geo.geoAreas.find(x => x.geo_area_id === "geo:country:" + code);
 assert.ok(area, code + " missing");
 assert.equal(area.area_type, "country");
 assert.equal(area.area_system, "CIVIL");
 assert.deepEqual(area.parent_geo_area_ids, ["geo:world"]);
 assert.equal(area.codes.iso_alpha2, code);
 assert.deepEqual(auditGeoArea(area), []);
}
assert.deepEqual(v10.resolved_intake_candidates.map(x => x.candidate_id).sort(),
  ["SG-INV-0687", "SG-INV-0720", "SG-INV-0731"]);
assert.deepEqual(intake.candidates.filter(x => !geo.geoAreas.some(a => a.geo_area_id === "geo:country:" + x.country_code)), []);
assert.equal(intake.counts.missing_country_area, 0);
assert.equal(intake.counts.owner_approved, 0);
assert.equal(intake.counts.authorized_for_production, 0);
assert.equal(intake.candidates.filter(x => x.publication_authorized || x.imported_to_live).length, 0);
assert.equal(assertExploreGeographyRegistry(geo).pass, true);
console.log("PASS C9: three country areas complete 169-stage structure; 535 existing draft Places intact, 0 new pins or owner admissions");
