import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CATHOLIC_GLOSSARY_ROUTE,
  CATHOLIC_GLOSSARY_VERSION,
  ensureCatholicGlossaryRegistry,
} from "../src/learn/catholic-glossary.js";

const salvage=JSON.parse(readFileSync("data/reference/catholic-glossary-catholic-life-salvage.v1.json","utf8"));
const campion=JSON.parse(readFileSync("data/reference/catholic-glossary-campion.v1.json","utf8"));
const salvageFr=JSON.parse(readFileSync("data/reference/catholic-glossary-salvage-fr.v1.json","utf8"));
assert.equal(salvage.status,"CANONICAL_REFERENCE_ANNEX");
assert.equal(campion.schema,"ao-catholic-glossary-campion-v1");
assert.equal(campion.status,"CANONICAL_REFERENCE_EXTENSION");
assert.equal(salvageFr.schema,"ao-catholic-glossary-salvage-fr-v1");
assert.equal(Object.keys(salvageFr.translations).length,33);
assert.equal(campion.entries.length,24);
assert.equal(CATHOLIC_GLOSSARY_ROUTE,"learn.glossary");
assert.equal(CATHOLIC_GLOSSARY_VERSION,"catholic-glossary-v1");

const campionSources=new Map(campion.sources.map(s=>[s.id,s]));
const entryIds=new Set();
for(const entry of campion.entries){
  assert.equal(entryIds.has(entry.id),false,entry.id);entryIds.add(entry.id);
  assert.ok(entry.term?.en&&entry.term?.fr&&entry.term?.latin,entry.id);
  assert.ok(entry.definition?.en&&entry.definition?.fr,entry.id);
  assert.ok(entry.sources.length>0,entry.id);
  for(const sourceId of entry.sources)assert.ok(campionSources.has(sourceId),entry.id+" -> "+sourceId);
  assert.ok(entry.campion_pages.length>0,entry.id);
}
for(const source of campion.sources)assert.match(source.canonical_url,/^https:\/\//,source.id);

const salvageSources=new Set((salvage.sources??[]).map(s=>s.source_id));
const salvageClaims=Object.values(salvage.domains??{}).flat();
assert.ok(salvageClaims.length>=33,"Catholic Life reference salvage unexpectedly shrank");
for(const claim of salvageClaims){
  for(const sourceId of claim.source_ids??[])assert.ok(salvageSources.has(sourceId),claim.claim_id+" -> "+sourceId);
  assert.ok(salvageFr.translations[claim.claim_id]?.title,claim.claim_id+" missing French title");
  assert.ok(salvageFr.translations[claim.claim_id]?.text,claim.claim_id+" missing French definition");
}
assert.ok(campion.entries.some(e=>e.id==="amice"));
assert.ok(campion.entries.some(e=>e.id==="altar-stone"));
assert.ok(campion.entries.some(e=>e.id==="canon"));
assert.ok(campion.entries.some(e=>e.id==="mass-catechumens"));

const base={
  get:id=>({id:"base."+id}),
  resolve:id=>({ok:true,id:"base."+id}),
  open:async()=>({ok:true,canonicalId:"base"}),
  list:()=>[{id:"base.item"}],
};
const fakeRuntime={open:async()=>true};
const win={AO_MODULES:base,AO_CATHOLIC_GLOSSARY_V1:fakeRuntime};
ensureCatholicGlossaryRegistry(win);
assert.equal(win.AO_MODULES.get("learn.glossary").title,"Catholic Glossary");
assert.equal((await win.AO_MODULES.open("learn.glossary")).ok,true);
assert.equal((await win.AO_MODULES.open("other")).canonicalId,"base");
assert.equal(win.AO_MODULES.list({domain:"learn"}).filter(x=>x.id==="learn.glossary").length,1);

console.log("PASS Catholic Glossary: salvage annex plus 24 Campion liturgical terms with source links.");
