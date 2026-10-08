import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";
import { TRADITIONAL_LEARN_ALIASES, TRADITIONAL_LEARN_ROUTES } from "../src/learn/traditional-life.js";
import { CSE_QUESTION_MAP } from "../src/learn/sexual-ethics-data/index.js";

const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));
const apologetics=JSON.parse(readFileSync("data/learn/apologetics-canonical.v1.json","utf8"));
const apologeticsReconciliation=JSON.parse(readFileSync("data/learn/apologetics-reconciliation.v1.json","utf8"));
const crisis=JSON.parse(readFileSync("data/learn/church-crisis-canonical.v1.json","utf8"));
const crisisReconciliation=JSON.parse(readFileSync("data/learn/church-crisis-reconciliation.v1.json","utf8"));

assert.equal(ownership.version,"CONTENT_OWNERSHIP_REGISTRY_V1");
assert.equal(ownership.status,"ACTIVE_CONVERGENCE_BASELINE");

for(const forbidden of ["learn.catholic_life","learn.seasonal_rites","learn.apologetics","learn.church_crisis"]){
  assert.equal(LEARN_MODULE_IDS.includes(forbidden),false,forbidden+" surfaced as a Formation launcher");
}

assert.equal(Object.hasOwn(TRADITIONAL_LEARN_ROUTES,"learn.seasonal_rites"),false,"seasonal compatibility route returned as an active Learn owner");
assert.equal(TRADITIONAL_LEARN_ALIASES["learn.seasonal_rites"]?.target,"calendar","seasonal compatibility alias no longer resolves to Calendar");

const categories=Object.fromEntries(Object.entries(TRADITIONAL_LEARN_ROUTES).map(([id,def])=>[id,def.category]));
for(const id of [
  "learn.rites.sick","learn.rites.baptism","learn.rites.first_communion",
  "learn.rites.confirmation","learn.rites.holy_orders","learn.rites.matrimony"
]) assert.equal(categories[id],"sacramental-formation",id+" retained retired catholic-life taxonomy");
assert.equal(categories["learn.scapular"],"spiritual-moral","Brown Scapular retained retired catholic-life taxonomy");
assert.equal(categories["learn.serve_mass.responses"],"mass-formation");
assert.equal(Object.values(categories).includes("catholic-life"),false,"retired catholic-life category survived in active Traditional Learn routes");

assert.equal(apologetics.status,"FROZEN_TARGET_NOT_YET_PUBLISHED");
assert.equal(apologetics.navigation_families.length,9);
assert.equal(apologetics.dossiers.length,60);
assert.equal(new Set(apologetics.dossiers.map(x=>x.id)).size,60);
assert.equal(apologetics.dossiers[0].id,"APOL-001");
assert.equal(apologetics.dossiers.at(-1).id,"APOL-060");
assert.equal(apologeticsReconciliation.status,"FROZEN_NO_INVENTED_LEGACY_IDS");
assert.equal(apologeticsReconciliation.confirmed_live.length,8);

assert.equal(crisis.status,"FROZEN_TARGET_NOT_YET_PUBLISHED");
assert.equal(crisis.dossiers.length,81);
assert.equal(new Set(crisis.dossiers.map(x=>x.id)).size,81);
assert.deepEqual(
  Object.fromEntries(crisis.families.map(f=>[f.id,crisis.dossiers.filter(d=>d.family===f.id).length])),
  {"origins":9,"liturgical":12,"doctrinal":10,"ecclesiological":12,"authority":10,"moral":8,"identity-mission":10,"governance":10}
);
assert.equal(crisisReconciliation.status,"FROZEN_NO_INVENTED_PER_ID_MAPPING");

for(const id of ["CSE138","CSE140"]){
  assert.ok(CSE_QUESTION_MAP[id].cross.includes("learn.spiritual_life"),id+" did not move its practical recovery handoff to Spiritual Life");
  assert.equal(CSE_QUESTION_MAP[id].cross.includes("learn.catholic_life"),false,id+" still points to retired Catholic Life");
}

console.log(JSON.stringify({
  activeCatholicLifeCategories:0,
  seasonalOwner:"COMPATIBILITY_ALIAS_TO_CALENDAR",
  apologeticsDossiers:60,
  crisisDossiers:81,
  apologeticsPublished:false,
  crisisPublished:false
},null,2));
