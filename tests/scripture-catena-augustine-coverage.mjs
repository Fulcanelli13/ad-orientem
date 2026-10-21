/*
 * Numbered-locus completeness for Augustine's Quaestiones Evangeliorum.
 * 98 sections indexed (I.1–47; II.1–51) across source-preserving registries.
 * This does not certify 98 authenticated question/answer pairs.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/scripture/catena/research/";
const manifest=load(root+"augustine-quaestiones-numbering-coverage.v1.json");
const sequential=load(root+"augustine-quaestiones-sequential-index.v1.json");
const continuation=load(root+"augustine-quaestiones-continuation.v1.json");
const missing=load(root+"augustine-quaestiones-missing-sections.v1.json");
const primary=load(root+"quaestiones-primary-source-crosswalk.v1.json");
assert.equal(manifest.schema,"ao.catena.augustine-quaestiones-numbering-coverage.v1");
assert.equal(manifest.distinctNumberedSectionCoverage,98);
assert.equal(sequential.entries.length,30);
assert.equal(continuation.records.length,62);
assert.equal(missing.records.length,2);
const ledger=new Map(),duplicates=[];
function add(book,section,origin){
 const key=book+"."+section;
 if(ledger.has(key))duplicates.push({key,old:ledger.get(key),new:origin});
 else ledger.set(key,origin);
}
for(const row of sequential.entries)add(row.book,row.section,"sequential");
for(const row of continuation.records)add(row.book,row.section,"continuation");
for(const row of missing.records)add(row.book,row.section,"gap_reconciliation");
assert.equal(ledger.size,94);
assert.deepEqual(duplicates,[],"the three main registers must not duplicate");
for(const row of primary.records.filter(r=>r.author==="Augustine of Hippo")){
 const parts=row.locator.match(/^(I|II)\.(\d+)(?:\.\d+)?$/);
 assert.ok(parts,"invalid historic Augustine locus");
 const key=parts[1]+"."+Number(parts[2]);
 if(ledger.has(key)){
  assert.equal(key,"I.7","only intentional overlapping earlier pilot section");
 }else add(parts[1],Number(parts[2]),"primary_pilot");
}
assert.equal(ledger.size,98);
assert.deepEqual([...ledger.entries()].filter(([key,v])=>v==="primary_pilot").map(([key])=>key).sort(),["II.1","II.3","II.5","II.6"]);
for(let n=1;n<=47;n++)assert.ok(ledger.has("I."+n),"missing Matthew §"+n);
for(let n=1;n<=51;n++)assert.ok(ledger.has("II."+n),"missing Luke §"+n);
for(const row of missing.records){
 assert.equal(row.publicationState,"research_only_context_edition_translation_review_pending");
 assert.equal(row.readerQuestionOrigin,"modern_editorial_rephrasing_not_father_quote");
 assert.ok(row.catenaLinks.length);
 for(const link of row.catenaLinks){
   assert.equal(link.attributionAsInCatena,"Augustine");
   assert.ok(link.sourceTextAnchor.startsWith("("));
 }
}
assert.ok(manifest.countsMeaning.includes("NOT 98 original authorial questions"));
console.log("PASS: Augustine Quaestiones Evangeliorum complete numerical section coverage, I.1–47 + II.1–51 = 98 sections");
