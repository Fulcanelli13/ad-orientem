import assert from "node:assert/strict";
import {existsSync,readFileSync,readdirSync} from "node:fs";
import {join} from "node:path";

// Run after "node tools/build-web-preview.mjs"; checks the actual Vercel output.
// URL review flags, robots.txt and noindex do not protect static JSON.
const output="dist/web-preview";
const metadata="data/learn/formation-canon-migration-provenance-20261018.v1.json";
assert.ok(existsSync(join(output,"index.html")),"Run production build before security gate");
const original=JSON.parse(readFileSync(metadata,"utf8"));
assert.equal(original.schema,"AO_CANON_SOURCE_MIGRATION_SHA_P3_V1");
assert.equal(original.files.length,27);
const prohibited=[
 ...original.files.map(x=>x.path),
 metadata,
 "data/learn/research/formation-canon-primary-source-pinpoint-review-20261018.v1.json",
 "data/learn/research/formation-canon-older-28-archive-reference-holds-20261018.v1.json"
];
for(const item of prohibited)
 assert.equal(existsSync(join(output,item)),false,"UNPUBLISHED_CANON_JSON_EXPOSED: "+item);
const folder=join(output,"data/learn/research");
for(const name of readdirSync(folder)){
 assert.doesNotMatch(name,/^formation-.*-20261013\.v1\.json$/,"Other original research exposed: "+name);
 assert.doesNotMatch(name,/^formation-canon-.*\.json$/,"Other Canon draft research exposed: "+name);
}
assert.ok(existsSync(join(output,"src/learn/living-church-character-folio.js")),"Do not break published P3 source import graph");
assert.ok(existsSync(join(output,"src/learn/formation-canon-question-catalog.mjs")),"Retain import graph; private DATA must fail closed");
assert.ok(existsSync(join(output,"data/learn/formation-canonical-sourcefirst-batch5-2026-10-09.v1.json")),"Don't remove current published-owned Formation data");
console.log("PASS Canon research deployment: 27 unpublished historical source files and all editor audits absent from actual public output; existing live assets preserved.");
