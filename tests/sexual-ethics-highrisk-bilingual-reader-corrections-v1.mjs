import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_MAP,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const ledger=JSON.parse(readFileSync("data/learn/sexual-ethics-highrisk-bilingual-reader-corrections-20261009.v1.json","utf8"));
assert.equal(ledger.summary.debates_touched,10);
assert.equal(ledger.summary.live_bilingual_stage_pairs_corrected,15);
assert.equal(ledger.summary.verified_primary_opponent_excerpt_english_with_official_french_parallel,4);
assert.equal(ledger.summary.illustrative_counterquestions_disclaimed,3);
assert.equal(ledger.summary.all_55_eight_stage_debates_fully_certified,0);
assert.equal(ledger.summary.independent_french_language_approval,0);
assert.equal(ledger.summary.independent_doctrinal_signoff,0);
assert.equal(ledger.records.length,15);
const seen=new Set(),cases=new Set();
for(const row of ledger.records){
 const key=row.id+"."+row.stage;assert.ok(!seen.has(key),"repeated "+key);seen.add(key);cases.add(row.id);
 const d=CSE_DEBATE_MAP[row.id];assert.ok(d&&CSE_DEBATE_FIELDS.includes(row.stage),"unknown "+key);
 assert.ok(d[row.stage][0].length>80 && d[row.stage][1].length>80,"underdeveloped bilingual case "+key);
 assert.ok(CSE_QUESTION_MAP[row.id],"missing question "+row.id);
 assert.ok(paragraphRefsFor(CSE_QUESTION_MAP[row.id],"debate",row.stage).some(([id])=>id===row.source_id),"live source mismatch "+key);
 assert.equal(row.source_url,CSE_SOURCE_MAP[row.source_id].canonical_url,"source URL mismatch "+key);
 assert.equal(row.en_fr_reader_revised,true);
 assert.ok(row.scope_limit.length>28);
 for(const gate of ["independent_full_original_book_collation","independent_french_reader_translation_certified","complete_eight_stage_debate_certified","theology_signoff"])assert.equal(row[gate],false);
 if(row.source_scope==="FARLEY_DIRECT_EXCERPT_BILINGUAL_VIA_CDF"){
  assert.equal(row.source_id,"FARLEY_QUOTED2012");
  assert.equal(row.original_opponent_english_words_located_in_cdf,true);
  assert.equal(row.french_translation_of_opponent_excerpt_available_and_checked,true);
  assert.ok(row.french_official_excerpt_url.startsWith("https://www.vatican.va/"));
 }else {
  assert.equal(row.original_opponent_english_words_located_in_cdf,false);
  assert.equal(row.french_translation_of_opponent_excerpt_available_and_checked,false);
 }
}
assert.equal(cases.size,10);
for(const [id,page] of [["CSE043","p.293"],["CSE049","pp.304"],["CSE050","p.310"],["CSE071","p.236"]]){
 assert.ok(CSE_DEBATE_MAP[id].opposition[0].includes("Farley"));
 assert.ok(CSE_DEBATE_MAP[id].opposition[0].includes(page),id+" no original opponent locator");
 assert.ok(CSE_DEBATE_MAP[id].opposition[1].includes("Farley"));
}
for(const id of ["CSE049","CSE050","CSE071"]){
 const stage=ledger.records.find(x=>x.id===id&&x.stage==="counter");
 assert.equal(stage.source_scope,"EDITORIAL_SYNTHESIS_NOT_AUTHOR_QUOTE",id+" synthetic objection cannot be credited to Farley");
 assert.match(stage.scope_limit,/not (present|quoted|an additional|a quotation|in Farley|from Farley)|not a/i);
 assert.ok(CSE_DEBATE_MAP[id].counter[0].length>75&&CSE_DEBATE_MAP[id].counter[1].length>75);
}
for(const stage of ["breakpoint","response"]){
 const [en,fr]=CSE_DEBATE_MAP.CSE038[stage];
 assert.ok(!/second, possessive look/.test(en));
 assert.ok(en.includes("not")&&fr.includes("pas"));
}
assert.match(CSE_DEBATE_MAP.CSE040.concession[0],/q\.154 a\.4/);
assert.match(CSE_DEBATE_MAP.CSE043.response[0],/1084/);
assert.match(CSE_DEBATE_MAP.CSE044.catholicCase[0],/sterility/);
assert.match(CSE_DEBATE_MAP.CSE054.concession[0],/reply to objection 2/);
assert.match(CSE_DEBATE_MAP.CSE076.concession[0],/does not classify/);
assert.ok(!ledger.records.some(x=>["CSE055","CSE056","CSE058"].includes(x.id)));
console.log("PASS 15 bilingual live-stage corrections across 10 cases; 4 first-hand opponent excerpts in English + official French; 3 counterquestions clearly editorial; no full certification.");
