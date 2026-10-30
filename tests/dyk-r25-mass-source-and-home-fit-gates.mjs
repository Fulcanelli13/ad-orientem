import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/research/did-you-know/";
const read=n=>JSON.parse(readFileSync(dir+n,"utf8"));
const prior=read("dyk-r21-168-integrated-bilingual-review.v1.json");
const added=read("dyk-r22-21-added-review-cards.v1.json");
const master=read("dyk-r22-189-review-index.v1.json");
const r24=read("dyk-r24-26-weiser-facsimile-review.v1.json");
const r25=read("dyk-r25-15-roman-mass-direct-source-audit.v1.json");
const triage=read("dyk-r25-eight-glossary-home-fit-triage.v1.json");
const cards=new Map(prior.cards.map(x=>[x.id,x]));
assert.equal(cards.size,168);
assert.equal(added.cards.length,21);
assert.equal(master.all_review_ids.length,189);
assert.deepEqual(new Set([...prior.cards,...added.cards].map(x=>x.id)),new Set(master.all_review_ids));
assert.equal(r24.records.length,26);
assert.equal(r25.rows.length,15);
assert.equal(r25.counts.roman_canon,12);
assert.equal(r25.counts.mass_gesture,3);
assert.equal(r25.counts.overall_189_source_text_checked,62);
assert.equal(new Set(r25.rows.map(x=>x.id)).size,15);
assert.equal(new Set(r25.rows.map(x=>x.action_id)).size,15);
const I="https://icrspfrance.fr/textes-liturgiques.php?article=a0003_ancien";
for(const row of r25.rows) {
 const card=cards.get(row.id);
 assert.ok(card,row.id);
 assert.equal(card.source.r25_primary_text_witness.url,I);
 assert.equal(card.source.r25_primary_text_witness.witnessed_action_or_primitive_id,row.action_id);
 assert.deepEqual(card.r25_direct_text_review.source_line_span,row.source_line_span);
 assert.equal(card.r25_direct_text_review.status,"PRIMARY_ORDO_HTML_TEXT_CROSSCHECKED");
 assert.equal(card.r25_direct_text_review.independent_linguist_signoff,false);
 assert.equal(card.r25_direct_text_review.reader_source_view_verified,false);
 assert.equal(card.r25_direct_text_review.final_approval,false);
 assert.equal(card.r25_direct_text_review.publication_authorized,false);
 assert.equal(card.gates.french_editorial_approved,false);
 assert.equal(card.gates.publication_authorized,false);
 for(const lang of ["en","fr"]){
  assert.ok(card.statement[lang].length>45,row.id);
  assert.ok(!/[?？]\s*$/.test(card.statement[lang]),row.id);
 }
}
assert.match(cards.get("DYK-M04-CANON-014").statement.en,/Host at Corpus.+chalice at Sanguis/);
assert.match(cards.get("DYK-M04-CANON-060").statement.en,/says or sings/);
assert.match(cards.get("DYK-SF01-038").statement.en,/corporal, and genuflects again/);
assert.match(cards.get("DYK-M04-CANON-058").statement.en,/small elevation/);
assert.equal(triage.decisions.length,8);
assert.equal(triage.counts.glossary_preferred,5);
assert.equal(triage.counts.home_rewrite_candidates,3);
for(const d of triage.decisions) {
 const card=cards.get(d.id);
 assert.ok(card,d.id);
 assert.equal(card.r25_home_fit.publication_hold,true);
 assert.equal(card.r25_home_fit.decision,d.decision);
 assert.equal(d.publication_authorized,false);
 assert.equal(d.home_preview_612_novelty_checked,false);
 assert.equal(card.gates.publication_authorized,false);
}
assert.equal(r25.counts.final_approved,0);
assert.equal(r25.counts.published,0);
console.log(JSON.stringify({status:"PASS",sourceTextCheckedTotal:62,mass15:15,glossaryTriage:8,shortlist:189,finalApproved:0,published:0}));
