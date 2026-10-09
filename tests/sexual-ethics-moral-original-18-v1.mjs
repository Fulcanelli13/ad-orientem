import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
const earlier=JSON.parse(readFileSync("data/learn/sexual-ethics-moral-reasoning-source-batch-20261009.v1.json","utf8"));
const ledger=JSON.parse(readFileSync("data/learn/sexual-ethics-moral-reasoning-original-18-20261009.v1.json","utf8"));
const ids=["CSE012","CSE013","CSE014","CSE016","CSE018","CSE021","CSE020"];
assert.equal(ledger.summary.debates_touched,7);
assert.equal(ledger.summary.original_passage_checks_added,18);
assert.equal(ledger.summary.previous_bounded_original_stage_scopes,38);
assert.equal(ledger.summary.new_scope_records_with_partial_or_direct_evidence,14);
assert.equal(ledger.summary.new_opponent_context_checks_without_thesis_attribution,4);
assert.equal(ledger.summary.full_case_certifications,0);
assert.equal(ledger.summary.independent_french_approvals,0);
assert.equal(ledger.summary.independent_theology_approvals,0);
assert.equal(ledger.records.length,18);
assert.deepEqual([...new Set(ledger.records.map(x=>x.id))].sort(),ids.filter(x=>x!=="CSE020").sort());
assert.equal(new Set(ledger.records.map(x=>x.id+"."+x.stage)).size,18);
const types={};
for(const x of ledger.records){
 const previous=earlier.cases.find(y=>y.id===x.id)?.stages.find(y=>y.stage===x.stage);
 assert.ok(previous,"Not in original case record: "+x.id+"."+x.stage);
 assert.notEqual(previous.status,"PRIMARY_DOCUMENT_SCOPE_REVIEWED_NOT_FULL_CERTIFICATION","already bounded "+x.id+"."+x.stage);
 assert.equal(x.previous_status,previous.status);
 assert.ok(previous.source_references.some(y=>y.id===x.source_id),"source not in stage "+x.id);
 assert.equal(x.canonical_source_url,CSE_SOURCE_MAP[x.source_id].canonical_url);
 assert.ok(CSE_DEBATE_FIELDS.includes(x.stage));
 assert.ok(CSE_DEBATE_MAP[x.id][x.stage][0].length>45);
 assert.ok(CSE_DEBATE_MAP[x.id][x.stage][1].length>45);
 assert.ok(x.exact_locator.length>4&&x.passage_supports_en.length>75&&x.passage_does_not_support_en.length>75);
 assert.ok(x.original_passage_urls.length>0&&x.original_passage_urls.every(y=>y.startsWith("https://")));
 assert.equal(x.original_english_or_latin_passage_examined,true);
 assert.equal(x.original_author_language_collated,false);
 assert.ok(x.edition_scope.length>60);
 for(const gate of ["whole_english_stage_claim_by_claim_certified","full_original_opponent_work_collated","french_translation_independently_collated","independent_theological_signoff","final_debate_certified"])assert.equal(x[gate],false);
 if(x.source_id==="SCR"){
   assert.ok(x.original_passage_urls.every(y=>y.includes("vatican.va/archive/bible/nova_vulgata/documents/")));
   assert.match(x.edition_scope,/NOT the original Greek/);
 }
 types[x.passage_scope_status]=(types[x.passage_scope_status]||0)+1;
}
assert.deepEqual(types,ledger.summary.scope_status_counts);
const contextual=ledger.records.filter(x=>x.passage_scope_status==="ORIGINAL_AUTHOR_CONTEXT_NOT_THIS_OBJECTION");
assert.deepEqual(contextual.map(x=>x.id),["CSE016","CSE016","CSE018","CSE018"]);
for(const x of contextual){assert.equal(x.source_id,"CURRAN1987");assert.match(x.passage_does_not_support_en,/(does not|not)/i);}
const freud=ledger.records.filter(x=>x.id==="CSE021");
assert.equal(freud.length,2);
assert.ok(freud.every(x=>x.original_passage_urls.every(u=>u.includes("freudedition.net"))));
assert.equal(earlier.summary.fully_certified,0);
console.log("PASS 18 source passages across 6 debates, 14 bounded-support stages, 4 contextual author checks; zero publication certification.");
