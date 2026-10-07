import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SACRED_HYMNS_V381,
  MORNING_PRAYER_SEQUENCE_V381,
  EVENING_PRAYER_SEQUENCE_V381,
  HOLY_NAME_LITANY_V381,
  SACRED_HEART_DEVOTIONS_V382,
  COMMUNION_TREASURY_V383,
  TRADITIONAL_PRAY_SOURCES_V381,
} from "../src/pray/traditional-pray-data.js";

assert.deepEqual(Object.keys(SACRED_HYMNS_V381),["te_deum","veni_creator","ave_maris_stella"],"v38.1 hymn corpus identity/order changed");
assert.equal(MORNING_PRAYER_SEQUENCE_V381.length,11,"v38.1 morning sequence changed");
assert.equal(EVENING_PRAYER_SEQUENCE_V381.length,13,"v38.1 evening sequence changed");
assert.equal(MORNING_PRAYER_SEQUENCE_V381[0][0],"foundations_sign_of_cross");
assert.equal(EVENING_PRAYER_SEQUENCE_V381[8][0],"pray.nightly_examen","Evening prayer must own a lightweight nightly examination");
assert.equal(MORNING_PRAYER_SEQUENCE_V381.at(-1)[0],"foundations_glory_be","Morning prayer lost its doxological conclusion");
assert.equal(EVENING_PRAYER_SEQUENCE_V381.at(-1)[0],"foundations_glory_be","Evening prayer lost its doxological conclusion");
assert.ok(["en","fr","la"].every(k=>HOLY_NAME_LITANY_V381[k]?.length>500),"Holy Name litany must be complete and offline in EN/FR/LA");
assert.match(TRADITIONAL_PRAY_SOURCES_V381.holyname,/Litany_of_the_Holy_Name_of_Jesus/);
assert.ok(["en","fr","la"].every(k=>SACRED_HEART_DEVOTIONS_V382.litany[k]?.length>2000),"Sacred Heart Litany must remain complete and source-locked in EN/FR/LA");
assert.ok(["en","fr","la"].every(k=>SACRED_HEART_DEVOTIONS_V382.humanRaceConsecration[k]?.length>1000),"Traditional Christ-the-King consecration must remain complete in EN/FR/LA");
assert.match(SACRED_HEART_DEVOTIONS_V382.humanRaceConsecration.note,/pre-conciliar period/,"Sacred Heart consecration lost its historical-version warning");
for(const id of ["beforeThomas","beforeAmbrose","afterThomas","afterBonaventure","enEgo"]){
  const p=COMMUNION_TREASURY_V383[id];
  assert.ok(p,"Communion treasury prayer missing: "+id);
  assert.ok(["en","fr","la"].every(k=>String(p[k]||"").length>300),"Communion treasury language gap: "+id);
}
assert.match(COMMUNION_TREASURY_V383.sources.beforeFrenchLatin,/opusdei\.org\/fr\/prayers/,"Communion treasury lost French-world preparation witness");
assert.match(COMMUNION_TREASURY_V383.sources.afterFrenchLatin,/opusdei\.org\/fr-fr\/prayers/,"Communion treasury lost French-world thanksgiving witness");
assert.match(COMMUNION_TREASURY_V383.sources.currentIndulgences,/vatican\.va/,"Communion treasury indulgence metadata lost Apostolic Penitentiary authority");
assert.match(COMMUNION_TREASURY_V383.enEgo.currentIndulgence,/Friday of Lent/,"En ego current plenary-indulgence condition disappeared");

const runtime=readFileSync("src/pray/traditional-pray-runtime.js","utf8");
const styles=readFileSync("src/pray/traditional-pray-styles.js","utf8");
const browser=readFileSync("src/pray/browser-entry.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

for(const id of ["pray.morning_evening","pray.sacred_hymns","pray.holy_name_litany","pray.nightly_examen","pray.meal_prayers","pray.sacred_heart","pray.communion_treasury"]){
  assert.match(runtime,new RegExp(id.replace(".","\\.")),id+" is not owned by the modular traditional PRAY runtime");
}
assert.match(runtime,/BASE_OPEN\("pray\.hub",opts\)/,"Traditional PRAY modules no longer mount inside the shared PRAY shell");
assert.match(runtime,/legacyTraditionOwner:false/,"Extraction must not restore AO_TRADITION_V38 ownership");
assert.match(runtime,/OFFLINE_SOURCE_LOCKED/,"Holy Name litany is no longer declared offline/source-locked");
assert.doesNotMatch(runtime,/ensureHolyName|en\.wikisource\.org\/w\/api\.php/,"Holy Name litany regained a runtime network dependency");
assert.match(runtime,/data-tp381-daypart/,"Morning/Evening daypart control disappeared");
assert.match(runtime,/data-tp381-hymn-lang/,"Hymn language control disappeared");
assert.match(runtime,/data-tp381-prayer/,"Canonical prayer reuse disappeared");
assert.match(styles,/aoTP381Reader/);
assert.match(styles,/aoTP381PrayerList/);
assert.match(runtime,/Foundational prayers may recur later in the Rosary or another devotion/,"Morning\/Evening repetition guide disappeared");
assert.match(runtime,/A deliberately small source-locked collection/,"Sacred Hymns donor introduction drifted");
assert.match(runtime,/Historical approved Roman form, stored locally for complete offline prayer/,"Holy Name offline donor introduction drifted");
assert.match(runtime,/38\.3-communion-treasury/,"Communion treasury convergence version marker missing");
assert.match(runtime,/SOURCE_LOCKED_TRADITIONAL/,"Sacred Heart source-lock policy disappeared");
assert.match(runtime,/FRENCH_WORLD_SOURCE_LOCKED/,"Communion treasury lost French-world admission lock");
assert.match(runtime,/data-tp381-communion="before"/,"Communion preparation tab disappeared");
assert.match(runtime,/data-tp381-communion="after"/,"Communion thanksgiving tab disappeared");
assert.match(runtime,/Come, Holy Ghost/,"Communion preparation lost Holy Ghost invocation");
assert.match(runtime,/not a checklist to be completed before every Communion/,"Communion treasury again became a compulsory checklist");
assert.match(runtime,/Historical days-or-years grants printed in old missals are not the current way indulgences are measured/,"Communion treasury indulgence guide lost current-vs-historical distinction");
assert.match(runtime,/data-tp381-heart="litany"/,"Sacred Heart litany tab disappeared");
assert.match(runtime,/data-tp381-heart="reparation"/,"Sacred Heart reparation tab disappeared");
assert.match(runtime,/data-tp381-heart="consecration"/,"Sacred Heart consecration tab disappeared");
assert.match(runtime,/current Enchiridion prints an abbreviated form/,"Traditional/current Sacred Heart version distinction disappeared");
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
assert.match(assets,/"pray\.nightly_examen"\s*:\s*"ao-rich-examination-of-conscience"/);
assert.match(assets,/"pray\.meal_prayers"\s*:\s*"ao-refined-pray-now"/);
assert.match(assets,/"pray\.sacred_heart"\s*:\s*"ao-rich-sacred-heart"/);
assert.match(assets,/"pray\.communion_treasury"\s*:\s*"ao-rich-eucharistic-life"/);

console.log("PASS modular v38.3 traditional PRAY + Communion treasury convergence");
