import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const nav=JSON.parse(readFileSync("data/glossary/glossary-navigation-sot.v1.json","utf8"));
const parts=[
  JSON.parse(readFileSync("data/glossary/concepts-001-150.v1.json","utf8")),
  JSON.parse(readFileSync("data/glossary/concepts-151-300.v1.json","utf8")),
  JSON.parse(readFileSync("data/glossary/concepts-301-450.v1.json","utf8")),
];
const lex=JSON.parse(readFileSync("data/glossary/lexemes.v1.json","utf8"));
const phr=JSON.parse(readFileSync("data/glossary/phrases.v1.json","utf8"));
const concepts=parts.flatMap(x=>x.entries);
const navById=new Map(nav.entry_index.map(x=>[x.id,x]));
const allowedLayers=new Set(nav.facet_dimensions.find(x=>x.id==="temporal_layer").values);

assert.equal(concepts.length,450);
assert.equal(new Set(concepts.map(x=>x.id)).size,450);
assert.equal(new Set(concepts.map(x=>x.number)).size,450);

for(let n=1;n<=450;n++){
  const id="G"+String(n).padStart(3,"0");
  const row=concepts.find(x=>x.id===id);
  assert.ok(row,id+" missing");
  assert.equal(row.number,n,id+" number drift");
  assert.ok(row.labels?.en&&row.labels?.fr,id+" missing bilingual labels");
  assert.ok(Object.hasOwn(row.labels,"la"),id+" missing Latin label slot");
  assert.ok(row.source_ids?.length,id+" has no source owner");
  assert.ok(!row.source_ids.includes("SOURCE_OWNER_PENDING"),id+" has unresolved source owner");
  assert.ok(allowedLayers.has(row.temporal_layer),id+" has invalid temporal layer "+row.temporal_layer);
  const navRow=navById.get(id);
  assert.ok(navRow,id+" missing navigation row");
  assert.equal(row.primary_category,navRow.primary_category,id+" category drift");
  assert.equal(row.browse_section,navRow.browse_section,id+" section drift");
  assert.equal(row.kind,navRow.kind,id+" kind drift");
}

assert.equal(lex.schema,"GLOSSARY_LATIN_LEXEMES_V1");
assert.equal(lex.items.length,350);
assert.equal(new Set(lex.items.map(x=>x.id)).size,350);
assert.deepEqual(lex.items.map(x=>x.core_rank),Array.from({length:350},(_,i)=>i+1));
assert.ok(lex.items.every(x=>x.lemma&&x.status==="FROZEN_CORE"));

assert.equal(phr.schema,"GLOSSARY_LATIN_PHRASES_V1");
assert.equal(phr.items.length,60);
assert.equal(new Set(phr.items.map(x=>x.id)).size,60);
for(const p of phr.items){
  assert.ok(p.latin,p.id+" missing Latin");
  assert.ok(p.translations?.en&&p.translations?.fr,p.id+" missing EN/FR translation");
  assert.ok(p.source_ids?.length,p.id+" missing source");
}

for(const [a,b] of [["G181","G336"],["G245","G403"],["G192","G416"],["G050","G131"],["G061","G134"],["G034","G178"],["G031","G149"],["G036","G395"]]){
  assert.notEqual(a,b);
  assert.ok(navById.has(a)&&navById.has(b),"collision lock target missing "+a+"/"+b);
}

console.log("Glossary corpus integrity: 450 concepts + 350 frozen lexemes + 60 phrases clean.");
