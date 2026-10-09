import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TRADITIONAL_LEARN_ROUTES } from "../src/learn/traditional-life.js";

const sot=JSON.parse(readFileSync("data/learn/sacramental-formation-sot.v1.json","utf8"));
const learnRuntime=readFileSync("src/learn/traditional-life.js","utf8");
const learnPresentation=readFileSync("src/learn/presentation.js","utf8");
const prayRuntime=readFileSync("src/pray/presentation-runtime.js","utf8");

assert.equal(sot.version,"SACRAMENTAL_FORMATION_SOT_V1");
assert.equal(sot.status,"FROZEN");
assert.equal(sot.audit_summary?.sacramental_families,7);
assert.equal(sot.audit_summary?.formation_coverage_complete,true);
assert.equal(sot.audit_summary?.missing_primary_owners,0);
assert.equal(sot.audit_summary?.duplicate_primary_owners,0);

const expectedFamilies=[
  "baptism",
  "confirmation",
  "eucharist_first_communion",
  "penance",
  "anointing_sick",
  "holy_orders",
  "matrimony",
];
assert.deepEqual(sot.sacraments.map(x=>x.family_key),expectedFamilies);

const owners=sot.sacraments.map(x=>x.primary_formation_owner);
assert.equal(new Set(owners).size,owners.length,"Sacramental SOT introduced a duplicate primary formation owner");
assert.equal(sot.sacraments.find(x=>x.family_key==="penance")?.primary_formation_owner,"pray.confession");
assert.equal(sot.sacraments.find(x=>x.family_key==="eucharist_first_communion")?.live_ritual_owner,"Mass reader");
assert.match(sot.sacraments.find(x=>x.family_key==="anointing_sick")?.aftercare_owner||"",/dying_companion/);
assert.match(sot.sacraments.find(x=>x.family_key==="matrimony")?.live_ritual_owner||"",/Nuptial Mass reader/);

for(const item of sot.sacraments){
  assert.equal(item.coverage?.source_authority?.startsWith("covered"),true,item.sacrament+": source authority is not covered");
  const sources=[...(item.traditional_sources||[]),...(item.current_sources||[]),...(item.french_world_sources||[])];
  assert.ok(sources.length>=2,item.sacrament+": insufficient frozen source coverage");
  for(const source of sources)assert.match(source.url,/^https:\/\//,item.sacrament+": non-HTTPS SOT source");
}

for(const route of [
  "learn.rites.baptism",
  "learn.rites.first_communion",
  "learn.rites.confirmation",
  "learn.rites.sick",
  "learn.rites.holy_orders",
  "learn.rites.matrimony",
]){
  assert.ok(TRADITIONAL_LEARN_ROUTES[route],route+": frozen Learn owner disappeared");
}

assert.match(prayRuntime,/function renderConfession\(\)/,"Canonical Confession owner disappeared");
assert.match(prayRuntime,/const stages=\[L\('Prepare','Préparer'\),L\('Examination','Examen'\),L\('Before entering','Avant d’entrer'\),L\('After','Après'\)\]/,"Confession four-stage practical flow changed");
assert.match(prayRuntime,/confessionSingleCard\(/,"Guided Confession card owner missing");
assert.match(prayRuntime,/confessionRiteCards\(CONF\.path\)/,"Pre-confessional instruction must precede the priest");
assert.doesNotMatch(prayRuntime,/\[L\('Doctrine','Doctrine'\)/,"Confession doctrine must remain in the optional Guide, not a mandatory stage");
assert.match(prayRuntime,/devotionalGuide\('confession'\)/,"Confession lost its accessible doctrine/history Guide");
assert.match(prayRuntime,/put the phone away/i,"Confession lost the sacramental privacy boundary");

assert.match(learnRuntime,/route:"pray\.confession"/,"Sacramental Learn handoffs lost Confession reuse");
assert.match(learnRuntime,/route:"mass\.prepare"/,"First Communion lost Before Mass ownership handoff");
assert.match(learnRuntime,/route:"mass\.thanksgiving"/,"First Communion lost After Mass ownership handoff");
assert.match(learnRuntime,/route:"pray\.communion_treasury"/,"First Communion lost Communion treasury handoff");
assert.match(learnRuntime,/route:"pray\.dying_companion"/,"Serious Illness lost Dying Companion handoff");
assert.match(learnRuntime,/nuptial:true/,"Matrimony lost certified Nuptial Mass handoff");
assert.match(learnRuntime,/route:"pray\.litany_saints"/,"Holy Orders lost Litany handoff");

for(const forbidden of [
  "learn.rites.penance",
  "learn.rites.eucharist",
  "learn.rites.anointing",
  "pray.first_communion",
  "pray.baptism",
  "pray.confirmation",
  "pray.holy_orders",
  "pray.matrimony",
]){
  assert.doesNotMatch(learnRuntime+learnPresentation+prayRuntime,new RegExp(forbidden.replaceAll(".","\\.")),forbidden+": duplicate sacramental owner appeared");
}

assert.match(learnRuntime,/priestCeremonialExposed:false/,"Lay-only sacramental formation boundary disappeared");
assert.match(readFileSync("docs/SACRAMENTAL-FORMATION-SOT-V1.md","utf8"),/one concern -> one canonical owner -> explicit handoffs/);

console.log("PASS frozen seven-sacrament formation SOT v1 ownership and no-duplication contract");
