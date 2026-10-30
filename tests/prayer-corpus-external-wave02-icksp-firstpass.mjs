import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const external = JSON.parse(readFileSync(new URL("../data/pray/prayer-corpus-external-discovery-wave02-icksp-firstpass.v1.json", import.meta.url), "utf8"));
const owned = JSON.parse(readFileSync(new URL("../data/pray/prayer-corpus-ownership-foundation.v1.json", import.meta.url), "utf8"));

assert.equal(external.schema, "ao.prayer.corpus-external-discovery.v1");
assert.equal(external.records.length, 40);
assert.equal(new Set(external.records.map(x => x.lead_id)).size, external.records.length);
assert.equal(external.baseline.baseline_ownership_records, 94);
assert.equal(owned.records.length, 94);
assert.equal(external.summary.external_units, 40);
assert.equal(external.summary.canonical_imports, 0);
assert.equal(external.summary.confirmed_unique_additions, 0);
assert.equal(external.summary.original_print_certs, 0);
assert.equal(external.records.filter(x => x.evidence === "INDEX_ONLY").length, 2);
assert.equal(external.records.filter(x => x.evidence === "SOURCE_TEXT_VISIBLE").length, 38);
assert.ok(external.records.every(x => x.text_imported === false && x.source_edition_print_verified === false));
assert.ok(external.records.every(x => typeof x.source_url === "string" && x.source_url.startsWith("https://")));
const existingKeys = new Set(owned.records.map(x => x.key));
assert.ok(external.records.filter(x => x.existing_anchor_candidate).length >= 7);
assert.ok(external.records.filter(x => x.existing_anchor_candidate).every(x => existingKeys.has(x.existing_anchor_candidate)));
assert.ok(external.records.some(x => x.review === "HOLD_RITUAL_VERIFICATION"));
assert.ok(external.records.some(x => x.review === "SAME_WORK_RECENSION_REVIEW"));
assert.ok(external.records.some(x => x.review === "CROSS_SOURCE_CANDIDATE"));
console.log("Prayer corpus W02: 40 source units / 38 text-visible / 2 index-only; 94-owner keys and import guards PASS");
