import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {rogationsLatinPrayerStages,loadRogationsLatinPrayer,ROGATIONS_PRAYER_SOURCE_URL} from "../src/pray/rogations-latin-prayer.v1.js";
import {BATCH03_LITANY_EDITION_POLICY,BATCH03_LITANY_SOURCE_STATUS} from "../src/pray/litany-1962-use-policy.js";
const p=JSON.parse(readFileSync(new URL("../data/presentation/reader-rogations.v1.json",import.meta.url),"utf8"));
const stages=rogationsLatinPrayerStages(p);
assert.equal(stages.length,14);
assert.equal(stages.reduce((n,s)=>n+s.rows.length,0),186);
assert.deepEqual(stages.map(s=>s.rows.length),[4,18,16,16,16,16,16,16,16,11,24,5,5,7]);
assert.equal(stages[2].rows[0].latin,"Sancta Maria, ora pro nobis.");
assert.equal(stages[2].scope,"PROCESSION_BEGINS_SANCTA_MARIA");
assert.equal(p.authority.rule.includes("not doubled"),true);
const expected=[
 p.opening.antiphon,p.opening.psalm,p.opening.gloria,p.opening.repeat,
 ...p.litanyBeforeProcession.map(x=>x[1]),...p.processionLitany,
 p.postLitany.pater,p.postLitany.versicle,p.postLitany.response,
 ...p.postLitany.psalm69,...p.postLitany.suffrages.map(x=>x[1]),
 ...p.postLitany.orations,...p.postLitany.final.map(x=>x[1])
];
assert.deepEqual(stages.flatMap(s=>s.rows.map(r=>r.latin)),expected,
 "All Latin entries must be copied unchanged and in the exact original Mass/Rogations source order");
assert.equal(expected.length,186);
assert.equal(stages.filter(s=>s.id.startsWith("collects")).flatMap(s=>s.rows).length,10);
assert.equal(stages.filter(s=>s.id.startsWith("procession")).flatMap(s=>s.rows).length,112);
const source=await loadRogationsLatinPrayer({fetcher:async url=>{
 assert.equal(url,ROGATIONS_PRAYER_SOURCE_URL);
 return {ok:true,json:async()=>p};
}});
assert.equal(source.printedEditionCertified,false);
assert.equal(source.frenchLiturgicalEditionAvailable,false);
assert.equal(source.stages.length,14);
const invalid={...p,processionLitany:p.processionLitany.slice(1)};
await assert.rejects(()=>loadRogationsLatinPrayer({fetcher:async()=>({ok:true,json:async()=>invalid})}),/112 procession entries/);
const doubled={...p,authority:{...p.authority,rule:"Duplicate each invocation"}};
assert.throws(()=>rogationsLatinPrayerStages(doubled),/non-doubling/);
const early={...p,postLitany:{...p.postLitany,orations:p.postLitany.orations.slice(0,9)}};
assert.throws(()=>rogationsLatinPrayerStages(early),/10 concluding orations/);
assert.equal(BATCH03_LITANY_EDITION_POLICY.major.liturgical1962Certified,false);
assert.match(BATCH03_LITANY_EDITION_POLICY.major.reader,/LOCAL_R25_LATIN_SOURCE/);
assert.match(BATCH03_LITANY_SOURCE_STATUS.offlineComplete1962,/PRINT_EDITION_CERTIFICATION_PENDING/);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.match(ui,/loadRogationsLatinPrayer\(\)/);
assert.match(ui,/data-ao-rogations-source="R25_LATIN_UNCOLLATED"/);
assert.match(ui,/data-p435930-rog-retry/);
assert.match(ui,/data-p435930-rog-done/);
assert.match(ui,/if\(LIT.use==='major'\)return renderMajorRogationsLatin\(\)/);
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
assert.ok(sw.includes("OFFLINE_CRITICAL_ROGATIONS_LATIN")&&sw.includes("data/presentation/reader-rogations.v1.json"));
assert.match(sw,/\.\.\.OFFLINE_CRITICAL_PRIVATE_LITANY,OFFLINE_CRITICAL_ROGATIONS_LATIN/);
console.log("PASS R25 Rogations Latin source: 186/186 verbatim entries, 14 stages, 18 kneeling, 112 procession, 8 Psalm 69, 24 suffrage rows, 10 orations, 7 final responses");
console.log("PASS no altered Mass source, no false printed-1962/French certification, offline snapshot includes exact shared R25 JSON");
