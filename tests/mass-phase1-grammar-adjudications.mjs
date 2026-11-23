// Read-only integrity gate: adjudicated excerpts must genuinely occur in the
// stored output of the random, production-resolver Proper sample.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
const relative=name=>fileURLToPath(new URL("../"+name,import.meta.url));
const corpus=JSON.parse(await readFile(relative("artifacts/proper-grammar/phase1-random24-2026.json"),"utf8"));
const register=JSON.parse(await readFile(relative(
 "data/research/mass-proper-grammar-phase1-adjudications-20261018.v1.json"),"utf8"));
assert.equal(corpus.sampled.length,24,"Sampling gate: not 24 Propers");
assert.equal(new Set(corpus.sampled.map(p=>p.sourcePath)).size,24,"Duplicate source");
assert.equal(register.sampling.seed,corpus.seed,"Sample seed drifted");
assert.equal(register.sampling.propers,corpus.sampled.length);
assert.equal(register.sampling.readerParagraphsAcrossEnglishFrench,
 corpus.sampled.reduce((n,p)=>n+["en","fr"].reduce((sum,lang)=>
   sum+Object.values(p.languages[lang].slots).reduce(
    (subtotal,slot)=>subtotal+slot.paragraphs.length,0),0),0),
 "Paragraph count changed");
const ids=new Set(),sampleWithIssues=new Set();
for(const row of register.findings){
 assert.ok(row.id&&!ids.has(row.id),"Duplicate adjudication: "+row.id);
 ids.add(row.id);
 assert.equal(row.productionPatched,false,"An audit claim must never assert text was patched");
 const proper=corpus.sampled.find(p=>p.date===row.date && p.sourcePath===row.sourcePath);
 assert.ok(proper,"Finding has no sampled source: "+row.id);
 sampleWithIssues.add(row.sourcePath);
 const slot=String(row.slot);
 const entries=lang=>proper.languages[lang].slots[slot]?.paragraphs??[];
 const has=(lang,needle,key="vernacular")=>entries(lang).some(p=>String(p[key]??"").includes(needle));
 if(row.lang==="en+fr"){
  const [en,fr]=row.observed.split(" / ");
  assert.ok(has("en",en),"Unverified EN excerpt: "+row.id);
  assert.ok(has("fr",fr),"Unverified FR excerpt: "+row.id);
 }else if(row.lang==="la+en+fr"){
  const [la,en]=row.observed.split(" / ");
  assert.ok(has("en",la,"latin"),"Unverified Latin reading: "+row.id);
  assert.ok(has("en",en),"Unverified English reading: "+row.id);
  assert.ok(has("fr","Damasum"),"No French same-source noun: "+row.id);
 }else{
  assert.ok(["en","fr"].includes(row.lang),"Unknown language: "+row.id);
  assert.ok(has(row.lang,row.observed),"Unverified excerpt: "+row.id);
 }
 assert.ok(["VERIFIED_GRAMMAR","SOURCE_TEXT_ISSUE","TYPOGRAPHY"].includes(row.classification),
   "Unsupported classification: "+row.id);
}
assert.equal(register.distinctPropersWithSpecificFindings.length,sampleWithIssues.size);
assert.deepEqual(new Set(register.distinctPropersWithSpecificFindings),sampleWithIssues);
assert.equal(register.findings.length,18);
console.log("PASS Phase 1 adjudications: "+register.findings.length+
 " exact output excerpts checked across "+sampleWithIssues.size+" of 24 sampled Propers");
