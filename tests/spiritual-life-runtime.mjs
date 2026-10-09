import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";
import {
  SPIRITUAL_LIFE_ROUTE_ID,
  SPIRITUAL_LIFE_VERSION,
  SPIRITUAL_LIFE_LESSONS,
  SPIRITUAL_LIFE_CLAIM_MAP,
  SPIRITUAL_LIFE_SOURCE_MAP,
  SPIRITUAL_LIFE_RUNTIME_AUDIT,
} from "../src/learn/spiritual-life-data.js";
import {
  SPIRITUAL_LIFE_ROOT_ID,
  createSpiritualLifeRuntime,
  ensureSpiritualLifeRegistry,
  installSpiritualLifeModule,
} from "../src/learn/spiritual-life.js";

assert.equal(SPIRITUAL_LIFE_ROUTE_ID,"learn.spiritual_life");
assert.equal(SPIRITUAL_LIFE_VERSION,"SPIRITUAL_LIFE_RUNTIME_V1");
assert.equal(SPIRITUAL_LIFE_ROOT_ID,"ao-spiritual-life-root");
assert.equal(SPIRITUAL_LIFE_LESSONS.length,14);
assert.equal(Object.keys(SPIRITUAL_LIFE_CLAIM_MAP).length,76);
assert.equal(Object.keys(SPIRITUAL_LIFE_SOURCE_MAP).length,12);
assert.deepEqual(SPIRITUAL_LIFE_RUNTIME_AUDIT,{
  lessons:14,
  claims:76,
  sources:12,
  bilingual:true,
  allClaimsResolved:true,
  allSourcesResolved:true,
});
assert.equal(LEARN_MODULE_IDS.includes(SPIRITUAL_LIFE_ROUTE_ID),true,"published Spiritual Life route missing from Formation launcher");

const baseDefinition={id:"learn.catechism",type:"module",domain:"learn"};
const base={
  get:id=>id==="learn.catechism"?baseDefinition:null,
  resolve:id=>id==="learn.catechism"?{ok:true,id,definition:baseDefinition}:{ok:false,input:id},
  async open(id){return {ok:id==="learn.catechism",canonicalId:id};},
  list:()=>[baseDefinition],
};
const win={
  AO_MODULES:base,
  document:{getElementById:()=>null,documentElement:{lang:"en"}},
};
const runtime=installSpiritualLifeModule(win);
assert.ok(runtime);
assert.equal(runtime.status().installed,true);
assert.equal(runtime.status().open,false);
assert.equal(runtime.status().scoring,false);
assert.equal(runtime.status().persistence,false);
assert.equal(runtime.status().visibleLauncher,true);

const registry=ensureSpiritualLifeRegistry(win);
assert.equal(registry.get(SPIRITUAL_LIFE_ROUTE_ID).hidden,false);
assert.equal(registry.resolve(SPIRITUAL_LIFE_ROUTE_ID).ok,true);
assert.equal(registry.list().some(item=>item.id===SPIRITUAL_LIFE_ROUTE_ID),true,"published Spiritual Life route missing from module registry");
assert.equal(registry.list().some(item=>item.id==="learn.catechism"),true);

for(const [id,item] of Object.entries(SPIRITUAL_LIFE_SOURCE_MAP)){
  assert.match(item.canonical_url,/^https:\/\//,id+" has an invalid public source destination");
}
const source=readFileSync("src/learn/spiritual-life.js","utf8");
assert.match(source,/Sources & provenance/);
assert.match(source,/claimSourceMarkup\(win,block\.claims\)/,"Lesson explanations must carry claim-specific links");
assert.match(source,/claimSourceMarkup\(win,lesson\.practice\.claims\)/,"Practical counsel must carry claim-specific links");
assert.match(source,/Practice · not scored/);
assert.match(source,/SPIRITUAL_LIFE_SOURCE_MAP/);
assert.match(source,/data-ao-sl-prev/);
assert.match(source,/data-ao-sl-next/);
assert.match(source,/data-ao-sl-handoff/);
assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB/,"Spiritual Life runtime introduced persistent spiritual tracking");
assert.doesNotMatch(source,/data-ao-sl-reveal|revealAnswer|score\s*\+=|streak\s*\+=/,"Spiritual Life runtime regressed to reveal/scoring pedagogy");

for(const lesson of SPIRITUAL_LIFE_LESSONS){
  const ids=[...lesson.blocks.flatMap(block=>block.claims||[]),...(lesson.practice?.claims||[])];
  assert.ok(ids.length>0,lesson.id+" lost provenance");
  for(const id of ids){
    const claim=SPIRITUAL_LIFE_CLAIM_MAP[id];
    assert.ok(claim,lesson.id+" unresolved claim "+id);
    assert.ok(claim.source_ids.length>0,id+" lost sources");
    for(const sourceId of claim.source_ids)assert.ok(SPIRITUAL_LIFE_SOURCE_MAP[sourceId],id+" unresolved source "+sourceId);
  }
}

console.log(JSON.stringify({
  route:SPIRITUAL_LIFE_ROUTE_ID,
  published:true,
  lessons:SPIRITUAL_LIFE_LESSONS.length,
  claims:Object.keys(SPIRITUAL_LIFE_CLAIM_MAP).length,
  sources:Object.keys(SPIRITUAL_LIFE_SOURCE_MAP).length,
  scoring:false,
  persistence:false,
},null,2));
