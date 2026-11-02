import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";

const prayers=PRAY_CANONICAL_DATA_V435930.prayers;
assert.equal(Object.keys(prayers).length,48,"Preserve 48 historical canonical prayer identities");
assert.equal(Object.values(prayers).filter(p=>p.la?.trim()).length,47,
  "Restore existing Latin; do not manufacture a missing Fatima witness");
assert.ok(COMMUNION_TREASURY_V383.beforeThomas.la?.trim(),
  "Latin of Aquinas's pre-Communion prayer is already in v38.3");
assert.ok(COMMUNION_TREASURY_V383.afterThomas.la?.trim(),
  "Latin of Aquinas's post-Communion prayer is already in v38.3");
assert.ok(COMMUNION_TREASURY_V383.enEgo.la?.trim(),
  "Latin of En ego is already in v38.3");
const legacy=JSON.parse(readFileSync(new URL("../legacy/v43.33.parts/IMPORT-STATUS.json",import.meta.url),"utf8"));
assert.equal(legacy.complete,true);
assert.equal(legacy.fullBytes,37954985);
assert.equal(legacy.fullSha256,legacy.importedPrefixSha256);
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.ok(runtime.includes('const canonicalLatinReader=!!holyRecord?.la'),
  "Library action must be scoped to existing Latin texts");
assert.ok(runtime.includes('data-p435930-library-latin aria-pressed='),
  "Original canonical Latin must be directly accessible");
assert.ok(runtime.includes('PRAYER_LIBRARY_LATIN_PREF.active=!PRAYER_LIBRARY_LATIN_PREF.active'),
  "Latin mode must be reversible");
assert.ok(runtime.includes('data-ao-canonical-latin="true"'),
  "Reader must render the stored Latin without translating");
assert.ok(runtime.includes('lang="la">${nl(latin)}'),
  "Direct Latin reader must render the canonical text field");
assert.ok(runtime.includes("!CHOIR_SOURCE_IDS.includes(holyId)")&&
  runtime.includes("&&holyId!=='mass_devotion_leonine'"),
  "Keep existing specialized Choir and Leonine language controls");
assert.ok(runtime.includes('const holy=!!holyRecord&&ESSENTIAL_HOLY_CARD_IDS_V1.includes(holyId)'),
  "Keep the approved essential Holy Card language menu");
const traditionalRuntime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
const traditionalStyles=readFileSync(new URL("../src/pray/traditional-pray-styles.js",import.meta.url),"utf8");
assert.ok(traditionalRuntime.includes("function existingLatinSwitch(both)"),
  "Explicit Latin control must be reusable across both historical prayer-card renderers");
assert.equal(traditionalRuntime.split("${existingLatinSwitch(both)}").length-1,2,
  "Both canonical and source-owned communion cards must expose actual inherited Latin");
assert.match(traditionalRuntime,/data-tp381-latin-switch aria-pressed="false"/);
assert.ok(traditionalRuntime.includes('b.matches("[data-tp381-latin-switch],[data-tp381-flip]")'),
  "Direct Latin and text-tap gestures must operate the same two source faces");
assert.ok(traditionalRuntime.includes("la.hidden=!showLatin;v.hidden=showLatin"),
  "Latin switch must preserve every word of both stored witnesses");
assert.ok(traditionalStyles.includes("position:absolute;top:10px"),
  "The additional control must not push the Mass/Communion text down a phone screen");
console.log("PASS · 47 preserved canonical Latin prayer faces, v43.33 archived donor, existing Aquinas/En ego, reversible ordinary + Communion Prayer Library Latin control");
