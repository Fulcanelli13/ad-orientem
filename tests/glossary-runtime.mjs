import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GLOSSARY_DEFINITION, GLOSSARY_ROUTE_ID } from "../src/glossary/browser-entry.js";

assert.equal(GLOSSARY_ROUTE_ID,"learn.glossary");
assert.equal(GLOSSARY_DEFINITION.type,"reference");
assert.equal(GLOSSARY_DEFINITION.domain,"learn");

const runtime=readFileSync("src/glossary/browser-entry.js","utf8");
const nav=JSON.parse(readFileSync("data/glossary/glossary-navigation-sot.v1.json","utf8"));
const sources=JSON.parse(readFileSync("data/glossary/source-registry.v1.json","utf8"));
const concepts=[
  ...JSON.parse(readFileSync("data/glossary/concepts-001-150.v1.json","utf8")).entries,
  ...JSON.parse(readFileSync("data/glossary/concepts-151-300.v1.json","utf8")).entries,
  ...JSON.parse(readFileSync("data/glossary/concepts-301-450.v1.json","utf8")).entries,
];

assert.equal(nav.categories.length,13);
assert.equal(concepts.length,450);
assert.equal(sources.sources.length,137);

assert.match(runtime,/GLOBAL|Search English, French or Latin/);
assert.match(runtime,/data-gloss-category/);
assert.match(runtime,/data-gloss-section/);
assert.match(runtime,/data-gloss-entry/);
assert.match(runtime,/openEntry/);
assert.match(runtime,/openTerms/);
assert.match(runtime,/AO_GLOSSARY_V1/);
assert.match(runtime,/source-registry\.v1\.json/);
assert.match(runtime,/concepts-001-150\.v1\.json/);
assert.doesNotMatch(runtime,/FLAT_450_ITEM_SCROLL/);

const categoryNumbers=new Set(nav.categories.flatMap(c=>c.sections.flatMap(s=>s.entry_numbers)));
assert.equal(categoryNumbers.size,450);
for(let n=1;n<=450;n++)assert.ok(categoryNumbers.has(n),"uncategorized G"+String(n).padStart(3,"0"));

const sourceIds=new Set(sources.sources.map(x=>x.id));
for(const e of concepts)for(const id of e.source_ids)assert.ok(sourceIds.has(id),e.id+" unresolved runtime source "+id);

console.log("PASS glossary runtime contract: 13 categories, 450 records, contextual API and source resolution.");
