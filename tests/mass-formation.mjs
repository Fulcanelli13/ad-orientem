import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MASS_FORMATION_ROUTE,
  MASS_FORMATION_VERSION,
  ensureMassFormationRegistry,
} from "../src/learn/mass-formation.js";

const data=JSON.parse(readFileSync("data/learn/mass-formation-campion.v1.json","utf8"));
assert.equal(data.schema,"ao-mass-formation-campion-v1");
assert.equal(data.version,"1.0.0");
assert.equal(data.route,"learn.mass");
assert.equal(data.status,"SOURCE_BACKED_FORMATION");
assert.equal(data.stages.length,8);
assert.equal(data.stages.reduce((n,s)=>n+s.claims.length,0),24);
assert.equal(MASS_FORMATION_ROUTE,"learn.mass");
assert.equal(MASS_FORMATION_VERSION,"mass-formation-campion-v1");

const sources=new Map(data.sources.map(s=>[s.id,s]));
assert.equal(sources.get("SRC-MR62").role,"NORMATIVE_1962");
assert.equal(sources.get("SRC-CAMPION-1954").role,"DISCOVERY_AND_EXPLANATORY");
assert.equal(sources.get("SRC-MEDIATOR-DEI").authority_type,"PAPAL_ENCYCLICAL");
for(const source of data.sources){
  assert.match(source.canonical_url,/^https:\/\//,source.id);
}
const ids=new Set();
for(const stage of data.stages){
  assert.ok(stage.title?.en&&stage.title?.fr,stage.id);
  assert.ok(stage.summary?.en&&stage.summary?.fr,stage.id);
  assert.equal(ids.has(stage.id),false,stage.id);ids.add(stage.id);
  for(const claim of stage.claims){
    assert.equal(ids.has(claim.id),false,claim.id);ids.add(claim.id);
    assert.ok(claim.text?.en&&claim.text?.fr,claim.id);
    assert.ok(claim.sources.length>0,claim.id);
    for(const sourceId of claim.sources)assert.ok(sources.has(sourceId),claim.id+" -> "+sourceId);
  }
}
const text=JSON.stringify(data);
assert.doesNotMatch(text,/Ad Orientem/,"Mass formation leaked product-brand commentary into learner content");
assert.match(text,/sacramental immolation is performed by the priest alone/);
assert.match(text,/Holy Communion pertains to the integrity of the Mass/);
assert.match(text,/The Victim is the same Christ/);

const base={
  get:id=>({id:"base."+id}),
  resolve:id=>({ok:true,id:"base."+id}),
  open:async()=>({ok:true,canonicalId:"base"}),
  list:()=>[{id:"base.item"}],
};
const fakeRuntime={open:async()=>true};
const win={AO_MODULES:base,AO_MASS_FORMATION_V1:fakeRuntime};
ensureMassFormationRegistry(win);
assert.equal(win.AO_MODULES.get("learn.mass").title,"Understand the Mass");
assert.equal((await win.AO_MODULES.open("learn.mass")).ok,true);
assert.equal((await win.AO_MODULES.open("other")).canonicalId,"base");
assert.equal(win.AO_MODULES.list({domain:"learn"}).filter(x=>x.id==="learn.mass").length,1);

console.log("PASS Campion Mass formation: 8 source-backed stages, 24 bilingual claims, modular learn.mass owner.");
