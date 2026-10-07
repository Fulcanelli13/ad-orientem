import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sot=JSON.parse(readFileSync("data/glossary/glossary-navigation-sot.v1.json","utf8"));

assert.equal(sot.schema,"GLOSSARY_NAVIGATION_SOT_V1");
assert.equal(sot.status,"FROZEN_NAVIGATION_BASELINE");
assert.equal(sot.scope.conceptual_inventory,450);
assert.equal(sot.navigation_policy.default_surface,"CATEGORY_CARDS");
assert.equal(sot.navigation_policy.prohibited_default,"FLAT_450_ITEM_SCROLL");
assert.equal(sot.navigation_policy.category_count,13);
assert.equal(sot.categories.length,13);
assert.equal(sot.entry_index.length,450);

const numbers=new Set();
const ids=new Set();
const homes=new Map();

for(const category of sot.categories){
  assert.ok(category.id);
  assert.ok(category.label?.en&&category.label?.fr,category.id+" lost bilingual label");
  assert.ok(category.sections?.length>=1,category.id+" has no browse sections");
  for(const section of category.sections){
    assert.ok(section.label?.en&&section.label?.fr,category.id+"/"+section.id+" lost bilingual label");
    assert.ok(section.entry_numbers.length>=1,category.id+"/"+section.id+" is empty");
    for(const n of section.entry_numbers){
      assert.ok(Number.isInteger(n)&&n>=1&&n<=450,"invalid glossary number "+n);
      assert.ok(!homes.has(n),"duplicate primary home for G"+String(n).padStart(3,"0"));
      homes.set(n,{category:category.id,section:section.id});
    }
  }
}

for(const row of sot.entry_index){
  assert.ok(!numbers.has(row.number),"duplicate number "+row.number);
  assert.ok(!ids.has(row.id),"duplicate id "+row.id);
  numbers.add(row.number);
  ids.add(row.id);
  const expected="G"+String(row.number).padStart(3,"0");
  assert.equal(row.id,expected,"number/id mismatch");
  const home=homes.get(row.number);
  assert.ok(home,row.id+" has no primary browse home");
  assert.equal(row.primary_category,home.category,row.id+" category/index drift");
  assert.equal(row.browse_section,home.section,row.id+" section/index drift");
}

for(let n=1;n<=450;n++) assert.ok(numbers.has(n),"missing G"+String(n).padStart(3,"0"));
assert.equal(homes.size,450);

assert.equal(sot.entry_index.find(x=>x.number===382)?.kind,"LATIN_PHRASE");
assert.equal(sot.entry_index.find(x=>x.number===400)?.kind,"LATIN_PHRASE");
for(let n=361;n<=399;n++){
  if(n===382) continue;
  assert.equal(sot.entry_index.find(x=>x.number===n)?.kind,"LATIN_LEXEME","G"+n+" lost lexeme ownership");
}

const requiredFacets=new Set(["temporal_layer","authority","surface","content_type","user_need"]);
for(const facet of sot.facet_dimensions) requiredFacets.delete(facet.id);
assert.equal(requiredFacets.size,0,"required navigation facets missing");

console.log("Glossary navigation SOT: 450/450 entries have one primary home across 13 categories.");
