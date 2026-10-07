import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const readJson=path=>JSON.parse(readFileSync(path,"utf8"));

assert.equal(LEARN_MODULE_IDS.includes("learn.catholic_life"),false,"retired Catholic Life route returned to Formation");
assert.doesNotMatch(readFileSync("src/learn/presentation.js","utf8"),/learn\.catholic_life|Catholic Life/,"retired Catholic Life launcher returned");
assert.doesNotMatch(readFileSync("src/learn/browser-entry.js","utf8"),/catholic-life\.js|AO_CATHOLIC_LIFE_V1|learn\.catholic_life/,"retired Catholic Life runtime wiring returned");

const audit=readJson("data/learn/catholic-life-retirement-audit.v1.json");
assert.equal(audit.totals.claims,409);
assert.equal(audit.totals.sources,101);

const resolutionFiles=[
  "data/learn/catholic-life-retirement-resolution.batch1.json",
  "data/learn/catholic-life-retirement-resolution.batch2.json",
  "data/learn/catholic-life-retirement-resolution.batch3.json",
];
const resolved=resolutionFiles.flatMap(path=>readJson(path).resolutions||[]).map(item=>item.claim_id);
assert.equal(resolved.length,409,"retirement resolutions no longer account for all 409 claims");
assert.equal(new Set(resolved).size,409,"retirement resolutions contain duplicate claim ownership");
const auditClaimIds=new Set(audit.claim_ledger.map(item=>item.claim_id));
for(const claimId of resolved)assert.ok(auditClaimIds.has(claimId),"resolution references unknown claim "+claimId);
for(const claimId of auditClaimIds)assert.ok(resolved.includes(claimId),"unresolved Catholic Life claim "+claimId);

const ownerArtifacts=[
  "data/learn/sacramental-formation-catholic-life-salvage.v1.json",
  "data/pray/confession-catholic-life-salvage.v1.json",
  "data/reference/catholic-glossary-catholic-life-salvage.v1.json",
  "data/mass/catholic-life-gesture-posture-salvage.v1.json",
  "data/customary/catholic-life-salvage.v1.json",
  "data/learn/scapular-catholic-life-salvage.v1.json",
  "data/learn/spiritual-life-superstition-salvage.v1.json",
  "data/mass/catholic-life-prep-thanksgiving-salvage.v1.json",
  "data/pray/catholic-life-devotional-salvage.v1.json",
  "data/calendar/catholic-life-temporal-salvage.v1.json",
  "data/explore/catholic-life-shrine-pilgrimage-salvage.v1.json",
  "data/learn/focused-formation-gaps-catholic-life-salvage.v1.json",
];
const rehomedSourceIds=new Set();
for(const path of ownerArtifacts){
  const artifact=readJson(path);
  for(const source of artifact.sources||[])if(source?.source_id)rehomedSourceIds.add(source.source_id);
}
assert.equal(rehomedSourceIds.size,101,"rehomed owner corpora no longer cover all 101 Catholic Life sources");
for(const source of audit.source_ledger)assert.ok(rehomedSourceIds.has(source.source_id),"source lost during Catholic Life retirement: "+source.source_id);

const gaps=readJson("data/learn/focused-formation-gaps-catholic-life-salvage.v1.json");
assert.equal(gaps.status,"RESEARCH_ONLY_NOT_PUBLISHABLE_AS_IS");
assert.match(gaps.decision,/Do not create Catholic Life 2\.0/);

console.log(JSON.stringify({
  routeRetired:true,
  claimsResolved:new Set(resolved).size,
  sourcesRehomed:rehomedSourceIds.size,
  focusedGapsPublishable:false,
},null,2));
