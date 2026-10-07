import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SACRED_HYMNS_V381,
  MORNING_PRAYER_SEQUENCE_V381,
  EVENING_PRAYER_SEQUENCE_V381,
  TRADITIONAL_PRAY_SOURCES_V381,
} from "../src/pray/traditional-pray-data.js";

assert.deepEqual(Object.keys(SACRED_HYMNS_V381),["te_deum","veni_creator","ave_maris_stella"],"v38.1 hymn corpus identity/order changed");
assert.equal(MORNING_PRAYER_SEQUENCE_V381.length,10,"v38.1 morning sequence changed");
assert.equal(EVENING_PRAYER_SEQUENCE_V381.length,9,"v38.1 evening sequence changed");
assert.equal(MORNING_PRAYER_SEQUENCE_V381[0][0],"foundations_sign_of_cross");
assert.equal(EVENING_PRAYER_SEQUENCE_V381[5][0],"pray.confession","Evening examination route changed");
assert.match(TRADITIONAL_PRAY_SOURCES_V381.holyname,/Litany_of_the_Holy_Name_of_Jesus/);

const runtime=readFileSync("src/pray/traditional-pray-runtime.js","utf8");
const styles=readFileSync("src/pray/traditional-pray-styles.js","utf8");
const browser=readFileSync("src/pray/browser-entry.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

for(const id of ["pray.morning_evening","pray.sacred_hymns","pray.holy_name_litany"]){
  assert.match(runtime,new RegExp(id.replace(".","\\.")),id+" is not owned by the modular traditional PRAY runtime");
}
assert.match(runtime,/BASE_OPEN\("pray\.hub",opts\)/,"Traditional PRAY modules no longer mount inside the shared PRAY shell");
assert.match(runtime,/legacyTraditionOwner:false/,"Extraction must not restore AO_TRADITION_V38 ownership");
assert.match(runtime,/SOURCE_LOAD_FAIL_CLOSED/,"Holy Name source failure policy changed");
assert.match(runtime,/data-tp381-daypart/,"Morning/Evening daypart control disappeared");
assert.match(runtime,/data-tp381-hymn-lang/,"Hymn language control disappeared");
assert.match(runtime,/data-tp381-prayer/,"Canonical prayer reuse disappeared");
assert.match(styles,/aoTP381Reader/);
assert.match(styles,/aoTP381PrayerList/);
assert.match(runtime,/These are source-led lay sequences derived from the Baltimore Manual’s “another form”/,"Morning\/Evening donor introduction drifted");
assert.match(runtime,/A deliberately small source-locked collection/,"Sacred Hymns donor introduction drifted");
assert.match(runtime,/Historical approved form\. The full wording is loaded directly from the public-domain source witness/,"Holy Name donor introduction drifted");
assert.doesNotMatch(runtime,/aoTP381Hero/,"v38.1 traditional PRAY regained non-donor hero cards");
assert.doesNotMatch(styles,/aoTP381Hero/,"v38.1 traditional PRAY regained non-donor hero styling");
assert.match(styles,/aoTP381Intro/,"v38.1 donor intro geometry is absent");
assert.match(styles,/aoTP381Lang/,"v38.1 donor hymn-language row is absent");
assert.match(styles,/background:transparent/,"v38.1 flat donor surface hierarchy disappeared");
assert.match(styles,/border-bottom:1px solid/,"v38.1 flat prayer-row separators disappeared");
assert.match(browser,/import "\.\/traditional-pray-runtime\.js";/,"PRAY browser owner no longer installs v38.1 extracted modules");
assert.match(assets,/"pray\.morning_evening"\s*:\s*"ao-rich-begin-end-day"/);
assert.match(assets,/"pray\.sacred_hymns"\s*:\s*"ao-refined-devotions"/);
assert.match(assets,/"pray\.holy_name_litany"\s*:\s*"ao-refined-devotions"/);

console.log("PASS modular v38.1 traditional PRAY extraction");
