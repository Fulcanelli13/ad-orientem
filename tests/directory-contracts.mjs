import fs from "node:fs";
import assert from "node:assert/strict";
import {
  auditCommunionProfile,
  auditStatusAssertion,
  auditVenue,
} from "../src/find/contracts.js";
import {
  compareVenueCandidates,
  normalizeAddress,
} from "../src/find/entity-resolution.js";
import {
  buildCanonicalSspxDataset,
  mapSspxPlace,
} from "../tools/directory/import-sspx.mjs";

function readJson(relative) {
  return JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), "utf8"));
}

const contract = readJson("../data/directory/directory-contract.v1.json");
const communities = readJson("../data/directory/communities.v1.json");
const sources = readJson("../data/directory/source-registry.v1.json");
const status = readJson("../data/directory/status-assertions.v1.json");

assert.equal(contract.schema, "DIRECTORY_SOT_V1");
assert.equal(contract.version, "1.0.0");
assert.ok(contract.invariants.some(value => /una-cum/i.test(value)));
assert.ok(contract.invariants.some(value => /UNKNOWN/.test(value)));

assert.ok(communities.communities.some(item => item.id === "SSPX"));
assert.equal(communities.upstreamRelationshipPolicy.sspx.fsspx.defaultCommunityId, "SSPX");
assert.equal(communities.upstreamRelationshipPolicy.sspx.friend.defaultCommunityId, "OTHER");
assert.equal(communities.upstreamRelationshipPolicy.sspx.friend.canonicalConfidence, "REVIEW");

const sourceIds = new Set(sources.sources.map(item => item.id));
for (const required of [
  "SRC_SSPX_MAP_API",
  "SRC_SSPX_UNA_CUM_POLICY",
  "SRC_SSPX_UNA_CUM_2026",
  "SRC_DDF_SSPX_2026_07_02",
]) {
  assert.ok(sourceIds.has(required), `missing source registry id ${required}`);
}

const sspxProfile = status.communityProfiles.find(item => item.communityId === "SSPX");
assert.ok(sspxProfile);
assert.equal(sspxProfile.communionProfile.pope_named_in_canon, "YES");
assert.equal(sspxProfile.communionProfile.ordinary_named_in_canon, "YES");
assert.equal(auditCommunionProfile(sspxProfile.communionProfile).length, 0);
assert.equal(sspxProfile.statusAssertions[0].effectiveDate, "2026-07-02");
assert.equal(sspxProfile.statusAssertions[0].sourceId, "SRC_DDF_SSPX_2026_07_02");
assert.equal(auditStatusAssertion(sspxProfile.statusAssertions[0]).length, 0);

const unsupportedClaim = {
  recognises_current_pontiff: "YES",
  pope_named_in_canon: "YES",
  ordinary_named_in_canon: "UNKNOWN",
  position_family: "ROMAN_PONTIFF_RECOGNISED",
  evidence_source_ids: [],
};
assert.ok(auditCommunionProfile(unsupportedClaim).some(item => item.code === "MISSING_COMMUNION_EVIDENCE"));

const honestUnknown = {
  recognises_current_pontiff: "UNKNOWN",
  pope_named_in_canon: "UNKNOWN",
  ordinary_named_in_canon: "UNKNOWN",
  position_family: "UNKNOWN",
  evidence_source_ids: [],
};
assert.equal(auditCommunionProfile(honestUnknown).length, 0);

const sspxFixture = {
  crmId: "OPE-009999",
  slug: "saint-joseph-test-chapel",
  url: "https://map.fsspx.org/en/places/saint-joseph-test-chapel",
  name: "Saint Joseph Test Chapel",
  churchTitle: "St Joseph Church",
  kind: "chapel",
  alsoKinds: [],
  relationship: "fsspx",
  community: null,
  city: "Testville",
  countryCode: "FR",
  region: "Test Region",
  lat: 48.8566,
  lng: 2.3522,
  sundayMass: true,
  weekdayMass: false,
  address: {
    line1: "10 Rue Exemple",
    postalCode: "75000",
    city: "Testville",
    countryCode: "FR",
    country: "France",
  },
  phone: "+33 1 00 00 00 00",
  contactUrl: "https://example.test/contact",
  website: "https://example.test/",
  schedules: [
    {
      source: "drupal",
      kind: "sections",
      priority: 1,
      lang: "fr",
      payload: {
        title: "Horaires",
        sections: [{ label: "Dimanche", role: "sunday", lines: ["10h30 Messe chantée"] }],
      },
      updatedAt: "2026-10-06T08:00:00Z",
    },
  ],
  sources: { drupal: "https://example.test/schedule" },
  updatedAt: "2026-10-06T09:00:00Z",
};

const mapped = mapSspxPlace(sspxFixture);
assert.equal(mapped.ministry.community_id, "SSPX");
assert.equal(mapped.ministry.community_profile_ref, "SSPX");
assert.deepEqual(mapped.venue.contact.email, []);
assert.equal(mapped.venue.contact.contact_form[0], "https://example.test/contact");
assert.equal(mapped.schedules.length, 1);
assert.equal(mapped.schedules[0].payload.sections[0].role, "sunday");
assert.equal(auditVenue(mapped.venue).length, 0);

const noLocation = structuredClone(mapped.venue);
noLocation.venue_id = "ao-test-no-location";
noLocation.geo = { lat: null, lng: null };
noLocation.address = {
  line1: null,
  line2: null,
  postal_code: null,
  city: null,
  region: null,
  country_code: "FR",
  country: "France",
  formatted: null,
};
assert.ok(auditVenue(noLocation).some(item => item.code === "MISSING_LOCATION"));

const nullGeoFixture = {
  ...sspxFixture,
  crmId: "OPE-009997",
  slug: "no-geo-chapel",
  lat: null,
  lng: null,
};
const nullGeoMapped = mapSspxPlace(nullGeoFixture);
assert.equal(nullGeoMapped.venue.geo.lat, null);
assert.equal(nullGeoMapped.venue.geo.lng, null);

const friendFixture = {
  ...sspxFixture,
  crmId: "OPE-009998",
  slug: "friend-chapel",
  relationship: "friend",
  community: "Example Traditional Community",
};
const friendMapped = mapSspxPlace(friendFixture);
assert.equal(friendMapped.ministry.community_id, "OTHER");
assert.equal(friendMapped.ministry.affiliation_confidence, "REVIEW");
assert.equal(friendMapped.ministry.external_community_name, "Example Traditional Community");

assert.equal(normalizeAddress("10, Rue Exemple."), normalizeAddress("10 rue exemple"));

const sameVenueA = mapped.venue;
const sameVenueB = structuredClone(mapped.venue);
sameVenueB.venue_id = "ao-test-second";
sameVenueB.name.official = "Saint Joseph Church";
sameVenueB.geo = { ...sameVenueB.geo, lat: 48.85661, lng: 2.35221 };
assert.equal(compareVenueCandidates(sameVenueA, sameVenueB).classification, "AUTO_MERGE_SAFE");

const houseSameProperty = structuredClone(mapped.venue);
houseSameProperty.venue_id = "ao-test-house";
houseSameProperty.venue_type = "priory";
houseSameProperty.name.official = "Priory of Saint Joseph";
assert.notEqual(compareVenueCandidates(sameVenueA, houseSameProperty).classification, "AUTO_MERGE_SAFE");

const dataset = buildCanonicalSspxDataset([sspxFixture, friendFixture], {
  retrievedAt: "2026-10-07T09:00:00Z",
});
assert.equal(dataset.report.place_count, 2);
assert.equal(dataset.report.ministry_count, 2);
assert.equal(dataset.report.schedule_assertion_count, 2);
assert.equal(dataset.report.geo_feature_count, 2);
assert.equal(dataset.report.duplicate_upstream_id_count, 0);

console.log("directory source-of-truth and SSPX importer: PASS");
