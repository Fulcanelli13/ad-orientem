import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAYER_DOOR_ORDER_V1} from "../src/pray/prayer-design-pilot.js";
import {INTERNAL_PRAYER_VIEWS} from "../src/pray/internal-route-owner.js";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from "../src/pray/icksp-divine-infant-king-novena.v1.js";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from "../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";
import {auditPrayerLanguageCoverageV1} from "../src/pray/prayer-language-coverage.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
const matrix=read("data/pray/prayer-language-route-matrix.v1.json");
const reach=read("data/app/content-reachability-audit.v1.json");
const legacy=reach.routes.filter(r=>r.kind==="PRAY_FAMILY_ITEM").map(r=>r.id);
const doors=[...new Set(Object.values(PRAYER_DOOR_ORDER_V1).flat())];
const all=[...new Set([...legacy,...doors])];
assert.equal(matrix.schema,"ao.pray.route-language-matrix.v1");
assert.equal(legacy.length,23,"Keep the original catalogue denominator explicit");
assert.equal(doors.length,39,"Reconcile an added or removed nine-door destination");
assert.equal(all.length,41,"Do not silently call 23 routes the entire current Prayer surface");
assert.equal(matrix.routes.length,all.length);
assert.deepEqual(matrix.routes.map(r=>r.id).sort(),all.slice().sort());
assert.equal(new Set(matrix.routes.map(r=>r.id)).size,41);
assert.equal(matrix.summary.legacyRoutes,23);
assert.equal(matrix.summary.currentDoorRoutes,39);
assert.equal(matrix.summary.additionalDoorRoutes,18);
assert.equal(matrix.summary.moduleStageAuditComplete,false,
 "Route inventory alone must not certify every language face in every prayer");
const core=PRAY_CANONICAL_DATA_V435930.prayers;
const audit=auditPrayerLanguageCoverageV1({
 prayers:core,novenas:NOVENA_CORPUS_V4,supplementalNovenas:{
  [ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id]:ICKSP_DIVINE_INFANT_KING_NOVENA_V1,
  [ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,
  [NOVENA_HOLY_FACE_1887_B25.id]:NOVENA_HOLY_FACE_1887_B25
 }
});
assert.equal(matrix.summary.coreCanonicalPrayers,audit.summary.corePrayerCount);
assert.equal(matrix.summary.coreCanonicalLatinPresent,audit.summary.coreLatinTextPresent);
assert.equal(matrix.summary.sourceOwnedNovenaProgrammes,audit.summary.novenaProgrammeCount);
assert.equal(matrix.summary.coreCanonicalLatinPresent,47);
assert.equal(audit.summary.missingLatinCoreIds.length,1);
let canonical=0;
for(const row of matrix.routes){
 assert.equal(row.legacy23,legacy.includes(row.id),row.id+" legacy flag");
 assert.deepEqual(row.doors,Object.keys(PRAYER_DOOR_ORDER_V1).filter(k=>PRAYER_DOOR_ORDER_V1[k].includes(row.id)),row.id+" door crosswalk");
 assert.ok(Array.isArray(row.sourceFiles)&&row.sourceFiles.length>0,row.id+" missing source-owner path");
 for(const path of row.sourceFiles){
  assert.ok(path.startsWith("src/pray/"),row.id+" unexpected owner path");
  assert.ok(existsSync(resolve(root,path)),row.id+" missing code file "+path);
 }
 assert.ok(row.readerLanguageEvidence&&row.nextAction,row.id+" needs an explicit evidence and review class");
 assert.match(row.scope,/NOT_EVERY_VARIANT_BROWSER_TESTED/,row.id+" must not claim full stage certification");
 if(row.sourceFamily==="canonical-prayer"){
  canonical++;
  const record=core[row.id];
  assert.ok(record,row.id+" missing original canonical prayer");
  assert.deepEqual(row.canonicalSourceLanguages,Object.fromEntries(["en","fr","la"].map(k=>[k,typeof record[k]==="string"&&!!record[k].trim()])),row.id+" exact language presence");
 }else{
  assert.equal(row.canonicalSourceLanguages,null,row.id+" aggregate must not be represented as one trilingual prayer");
 }
 if(row.sourceFamily==="internal-devotion"){
  assert.ok(Object.hasOwn(INTERNAL_PRAYER_VIEWS,row.id)||row.id.startsWith("programme."),row.id+" new owner needs reconciliation");
 }
}
assert.equal(canonical,9);
assert.deepEqual(matrix.summary.sourceHeldCanonical,["marian_consecration_immaculate_heart"]);
assert.ok(matrix.routes.find(r=>r.id==="pray.rosary").readerLanguageEvidence.includes("SIGNATURE_BEAD_READER"));
assert.ok(matrix.routes.find(r=>r.id==="pray.novenas").readerLanguageEvidence.includes("HISTORIC_PROPER_TEXTS_UNCLAIMED"));
assert.ok(matrix.routes.find(r=>r.id==="pray.montfort_consecration").readerLanguageEvidence.includes("HISTORIC_SOURCE_EXCLUDED"));
// The historical private Litany has two distinct original-language witnesses.
// Its shared in-reader language switch must expose both, and discard the old
// edition's cached pages when the locale changes. No Latin is certified here.
const presentation=readFileSync(resolve(root,"src/pray/presentation-runtime.js"),"utf8");
assert.match(presentation,/\['adoration','benediction','stations','confession','litany'\]\.includes\(view\)/);
assert.match(presentation,/if\(LIT\.language!==lang\(\)\)/);
assert.match(presentation,/LIT\.sections=null;LIT\.review=null/);
const litanySources=readFileSync(resolve(root,"src/pray/litany-source.js"),"utf8");
assert.match(litanySources,/en:Object\.freeze\(/);
assert.match(litanySources,/fr:Object\.freeze\(/);
assert.ok(matrix.routes.find(r=>r.id==="pray.litany_saints").readerLanguageEvidence.includes("EN_FR_WITNESS_SWITCH"));

console.log("PASS · 41 distinct Prayer routes, 23 legacy + 18 additional; 9 source-audited canonical destinations, 48 canonical prayer witnesses, 19 separate Novena programmes");
console.log(JSON.stringify({routes:matrix.summary.uniqueRoutes,canonical:matrix.summary.coreCanonicalLatinPresent,novena:matrix.summary.sourceOwnedNovenaProgrammes,held:matrix.summary.sourceHeldCanonical}));
