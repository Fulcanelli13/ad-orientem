import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readJson=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const core200=await readJson("data/learn/core-latin-200.v0.2.json");
const core350=await readJson("data/learn/core-latin-201-350.v1.0.json");

assert.equal(core200.status,"FROZEN");
assert.equal(core200.items.length,200);
assert.deepEqual(core200.items.map(x=>x.rank),Array.from({length:200},(_,i)=>i+1));

assert.equal(core350.status,"FROZEN");
assert.equal(core350.dependsOn,"core-latin-200-v0.2");
assert.equal(core350.items.length,150);
assert.deepEqual(core350.items.map(x=>x.rank),Array.from({length:150},(_,i)=>i+201));

const lemmas200=new Set(core200.items.map(x=>x.lemma));
const lemmas350=core350.items.map(x=>x.lemma);
assert.equal(new Set(lemmas350).size,150,"Core 201-350 must contain 150 unique lemma families");
assert.deepEqual(lemmas350.filter(x=>lemmas200.has(x)),[],"Core 201-350 must not duplicate Core 200");

assert.ok(lemmas350.includes("neque/nec"),"neque/nec must remain one lemma family");
assert.equal(lemmas350.includes("neque"),false);
assert.equal(lemmas350.includes("nec"),false);
for(const lemma of ["secundum","tempus","gens","propheta","mons","hora","discipulus","virtus","iterum","invicem","aio","conspectus","iudicium","vir","abeo","respicio","mirabilis"]){
  assert.ok(lemmas350.includes(lemma),`Certified Proper-corpus lemma missing: ${lemma}`);
}
for(const lemma of ["ager","porta","vinum","ira","lapis","familia","filia","corona","sol","caelestis"]){
  assert.equal(lemmas350.includes(lemma),false,`Deferred lemma leaked back into Core 201-350: ${lemma}`);
}

console.log("Core Latin freeze: 200 + 150 lemma families locked");
