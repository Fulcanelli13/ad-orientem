import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ICKSP_THERESE_DEVOTIONS_V1 as d} from "../src/pray/icksp-therese-devotions.v1.js";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";

assert.equal(Object.keys(d).length,3,"Exactly three Institute source selections");
const institute=d.perennialInstituteNovena,mission=d.missionaryIntercession,prayer=d.prayerFromNovena;
assert.equal(institute.status,"ORIGINAL_ICKSP_SOURCE_LINK_ONLY");
assert.match(institute.periodicity,/TUESDAY_CONTINUOUS_PUBLIC_DEVOTION/);
assert.match(institute.preservation,/Little Flower Recurring Gift Society/);
assert.equal(institute.en,undefined,"The institution-specific version must not be silently generalized");
assert.match(institute.source_url,/institute-christ-king\.org/);
assert.equal(mission.status,"ORIGINAL_ICKSP_SOURCE_LINK_ONLY");
assert.match(mission.historicalContext,/Raccolta no\. 573/);
assert.match(mission.preservation,/Institute/);
assert.equal(mission.en,undefined,"Do not import a later translation as a proved public-domain witness");

assert.equal(prayer.attributedAuthor,"UNCONFIRMED_PAPAL_ATTRIBUTION");
assert.match(prayer.en,/O little Therese of the Child Jesus/);
assert.match(prayer.en,/whole-hearted abandonment to God/);
assert.ok(prayer.en.trim().endsWith("straight on to a happy eternity."),"The historical prayer body must stop before the separate Hail Holy Queen");
assert.doesNotMatch(prayer.en,/Hail, holy Queen/);
assert.equal(prayer.concludingInstruction,"Hail, holy Queen.");
assert.equal(prayer.fr,undefined,"Historical French witness not yet sourced");
assert.equal(prayer.la,undefined,"Historical Latin witness not yet sourced");
assert.match(prayer.source_url,/distantreader\.org\/stacks\/pamphlets\/pdf\/005457174\.pdf/);
assert.deepEqual(prayer.printedPdfPagesZeroBased,[39,40]);
assert.ok(NOVENA_CORPUS_V4.st_therese,"Existing Twenty-Four Glory Bes novena lost");
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16,"Do not change frozen sixteen novenas");
assert.ok(PRAY_CANONICAL_DATA_V435930.prayers.marian_hail_holy_queen,"Canonical Salve Regina missing");
const files={
 runtime:readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8"),
 hub:readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8"),
 lazy:readFileSync(new URL("../src/pray/lazy-module-registry.js",import.meta.url),"utf8"),
 novenas:readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8")
};
assert.match(files.runtime,/"pray\.st_therese_devotions":Object\.freeze/);
assert.match(files.runtime,/function renderThereseDevotions\(\)/);
assert.match(files.runtime,/S\.route==="pray\.st_therese_devotions"\?renderThereseDevotions\(\)/);
assert.match(files.runtime,/prayerCard\("marian_hail_holy_queen"/,"Reuse original canonical Salve Regina, not duplicate");
assert.match(files.hub,/\['external','pray\.st_therese_devotions'/);
assert.match(files.lazy,/\["pray\.st_therese_devotions"/);
assert.match(files.novenas,/data-n1-icksp-therese/);
assert.match(files.novenas,/pray\.st_therese_devotions/);
console.log("ICKSP Thérèse: 3 distinct source records, 1925 body, canonical Salve Regina, 24 Glory Bes preservation PASS");
