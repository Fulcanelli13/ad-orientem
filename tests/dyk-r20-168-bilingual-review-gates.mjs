import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/research/did-you-know/";
const read=name=>JSON.parse(readFileSync(dir+name,"utf8"));
const master=read("dyk-r20-unified-1001-first-pass-ledger.v1.json");
const review=read("dyk-r20-168-bilingual-review-cards.v1.json");
const checkpoint=read("dyk-r20-execution-checkpoint.v1.json");
assert.equal(master.ledger.length,1001);
assert.equal(master.metrics.featured_for_review,168);
assert.equal(review.cards.length,168);
assert.equal(new Set(review.cards.map(x=>x.id)).size,168);
assert.equal(review.counts.ORIGINAL_145,74);
assert.equal(review.counts.GLOSSARY_CONTEXTUAL_200,8);
assert.equal(review.counts.SOURCE_FIRST_216,86);
assert.equal(review.counts.manual_legacy_rewrites,10);
assert.equal(review.counts.mechanical_old_question_removals,64);
assert.equal(checkpoint.review_pack_counts.total,168);
const selected=new Set(master.ledger.filter(x=>x.status==="FEATURED_FOR_REVIEW").map(x=>x.id));
assert.equal(selected.size,168);
assert.deepEqual(new Set(review.cards.map(x=>x.id)),selected);
let manual=0,mechanical=0,sourceR19=0;
for(const card of review.cards){
 assert.equal(card.release,"R20_BILINGUAL_REVIEW_NOT_APPROVED");
 assert.equal(card.gates.claim_editorial_approved,false);
 assert.equal(card.gates.french_editorial_approved,false);
 assert.equal(card.gates.full_semantic_uniqueness_approved,false);
 assert.equal(card.gates.destination_browser_verified,false);
 assert.equal(card.gates.publication_authorized,false);
 assert.equal(card.source.source_visual_checked,false);
 for(const language of ["en","fr"]){
  assert.ok(typeof card.statement[language]==="string"&&card.statement[language].length>24,card.id);
  assert.equal(/[?？]\s*$/.test(card.statement[language]),false,card.id);
  assert.equal(/^(Did you know that|Saviez-vous que|Saviez-vous qu['’])/i.test(card.statement[language]),false,card.id);
 }
 if(card.source_batch==="ORIGINAL_145"){
  assert.ok(card.original_language_text?.en.startsWith("Did you know that"),card.id);
  assert.ok(card.original_language_text?.fr.startsWith("Saviez-vous"),card.id);
  if(card.editorial_copy_method==="HUMAN_DRAFT_REWRITE_NOT_SOURCE_SIGNOFF")manual++;
  else if(card.editorial_copy_method==="MECHANICAL_QUESTION_TO_STATEMENT_NEEDS_EDITOR")mechanical++;
  else assert.fail("Unaccounted legacy copy mode "+card.id);
 }else if(card.source_batch==="SOURCE_FIRST_216"){
  sourceR19++;
  assert.ok(["home.historical-source","home.mass-source"].includes(card.source.deep_link.id));
  assert.equal(card.source.deep_link.factId,card.id);
 }else assert.equal(card.source_batch,"GLOSSARY_CONTEXTUAL_200");
}
assert.equal(manual,10);assert.equal(mechanical,64);assert.equal(sourceR19,86);
assert.equal(review.counts.approval,0);
assert.equal(review.counts.published,0);
console.log(JSON.stringify({status:"PASS",reviewCards:168,bilingual:168,
 questionPrefixesRemoved:74,manualCopyDrafts:10,mechanicalCopyDrafts:64,
 exactSourceContractsPrepared:86,published:0,editoriallyApproved:0}));
