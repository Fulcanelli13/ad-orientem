import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const load=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const base=load("data/pray/prayer-language-route-matrix.v1.json");
const audit=load("data/pray/prayer-multitext-reader-crosswalk.v1.json");
const candidates=base.routes.filter(r=>r.sourceFamily!=="canonical-prayer");
const ids=new Set(candidates.map(x=>x.id));

assert.equal(base.routes.length,41);
assert.equal(candidates.length,32);
assert.equal(audit.routes.length,32);
assert.equal(audit.summary.completeTextFaceCertification,false);
assert.deepEqual(audit.routes.map(x=>x.route).sort(),[...ids].sort(),
 "All multi-text routes must be mapped once, not just the 23 legacy destinations");
assert.equal(new Set(audit.routes.map(x=>x.route)).size,32);
const ownerCache=new Map();
for(const row of audit.routes){
 assert.equal(row.audit,"READER_ENTRYPOINT_AND_STAGE_HELPER_EVIDENCE_ONLY");
 assert.equal(row.sourceLanguageWitnesses,"REQUIRES_COMPONENT_BY_COMPONENT_COLLATION");
 assert.match(row.browser,/PENDING_EN_FR_LA_FACE/);
 assert.ok(Array.isArray(row.stageHelpers)&&row.stageHelpers.length>0,row.route+" needs concrete text-stage helpers");
 assert.ok(row.owner.startsWith("src/pray/")&&existsSync(resolve(root,row.owner)),row.route+" missing reader owner");
 if(!ownerCache.has(row.owner))ownerCache.set(row.owner,readFileSync(resolve(root,row.owner),"utf8"));
 const source=ownerCache.get(row.owner);
 const functionPresent=name=>new RegExp("function\\s+"+name+"\\s*\\(").test(source);
 assert.ok(functionPresent(row.renderer),row.route+" reader renderer missing: "+row.renderer);
 for(const name of row.stageHelpers){
  assert.match(name,/^[A-Za-z][A-Za-z0-9]*$/,row.route+" invalid stage symbol");
  assert.ok(functionPresent(name)||new RegExp("\\b"+name+"\\b").test(source),
   row.route+" text-stage component missing: "+name);
 }
}
const owners=Object.fromEntries([...ownerCache.keys()].map(key=>[key,audit.routes.filter(x=>x.owner===key).length]));
assert.deepEqual(owners,{
 "src/pray/presentation-runtime.js":22,
 "src/pray/traditional-pray-runtime.js":9,
 "src/pray/novena-runtime.js":1
});
const litany=audit.routes.find(x=>x.route==="pray.litany_saints");
assert.ok(litany.stageHelpers.includes("ensureLitany"));
const novena=audit.routes.find(x=>x.route==="pray.novenas");
assert.ok(novena.stageHelpers.includes("canonicalPrayer")&&novena.stageHelpers.includes("sourceWitness"));
const rosary=audit.routes.find(x=>x.route==="pray.rosary");
assert.ok(rosary.stageHelpers.includes("setRosaryPrayerLanguage"));
console.log("PASS · all 32 multi-text Prayer routes mapped to concrete reader/stage entrypoints across three reader owners; text-face certification explicitly remains pending");
