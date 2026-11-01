import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root="data/research/did-you-know/";
const load=name=>JSON.parse(readFileSync(root+name,"utf8"));
const audit=load("dyk-600-fixed-random20-sampled-source-review-20261031.v1.json");
const batches=[
 load("dyk-next-501-520-bilingual-source-checked-drafts.v1.json"),
 load("dyk-next-521-560-pitre-inherited-folio-bilingual-drafts.v1.json"),
 load("dyk-next-561-600-pitre-inherited-folio-bilingual-drafts.v1.json")
];
const facts=batches.flatMap(x=>x.facts);
assert.equal(facts.length,100);
assert.equal(audit.population_size,100);
assert.equal(audit.publication_authorized,false);
assert.equal(audit.entire_new_100_final_editorial_approved,false);
const indices=Array.from({length:100},(_,i)=>i);
let state=audit.fixed_draw.seed>>>0;
for(let i=99;i>0;i--){
 state=(Math.imul(1664525,state)+1013904223)>>>0;
 const j=state%(i+1);
 [indices[i],indices[j]]=[indices[j],indices[i]];
}
const expected=indices.slice(0,20).map(i=>i+501);
assert.deepEqual(audit.fixed_draw.sequence_order,expected);
assert.deepEqual(audit.sample.map(x=>x.sequence),expected);
assert.equal(audit.sample.length,20);
assert.equal(new Set(expected).size,20);
for(const [slot,item] of audit.sample.entries()){
 assert.equal(item.draw_slot,slot+1);
 const fact=facts[item.sequence-501];
 assert.equal(fact.id,item.id);
 assert.equal(fact.review.publication_authorized,false);
 assert.equal(item.record_approved_for_publication,false);
 assert.ok(fact.statement.en.length>30&&fact.statement.fr.length>30);
 assert.equal(item.printed_source_page,fact.source.printed_pages?.[0]??fact.source.original_folio??fact.source.printed_page);
}
assert.equal(audit.sample.filter(x=>x.source_audit.startsWith("WEISER")).length,8);
assert.equal(audit.sample.filter(x=>x.source_audit.startsWith("PITRE")).length,12);
assert.equal(audit.counts.pitre_new_original_page_image_checks,0);
assert.equal(audit.corrections.length,4);
const byId=new Map(facts.map(f=>[f.id,f]));
assert.equal(byId.get("DYK-G560-P-032").source.original_scan_pdf_page_1based,188);
assert.equal(byId.get("DYK-G560-P-032").source.scan_pdf_page_1based,188);
assert.equal(byId.get("DYK-G600-P-032").source.scan_pdf_page_1based,416);
assert.equal(byId.get("DYK-G600-P-032").source.original_scan_pdf_page_1based,undefined);
assert.match(byId.get("DYK-G520-W-017").statement.en,/1025/);
assert.match(byId.get("DYK-G520-W-020").statement.en,/minstrels/);
assert.match(byId.get("DYK-G600-P-011").statement.en,/maccu/);
console.log("PASS fixed DYK random20 audit: 8 direct Weiser PDF pages, 12 inherited Pitre folios, 4 traceable repairs, no releases");
