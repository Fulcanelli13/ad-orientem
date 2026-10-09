
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAY_COLLATION_NOTICES_V1} from "../src/pray/source-collation-notices.v1.js";
const d=JSON.parse(readFileSync("data/pray/prayer-compendium-whole-form-comparison.v1.json","utf8"));
const ids=[...new Set(d.items.map(x=>x.prayer_id))];
assert.equal(d.schema,"AO_PRAY_COMPENDIUM_WHOLE_FORM_COMPARISON_V1");
assert.equal(ids.length,10);
assert.equal(d.results.prayers,10);
assert.equal(d.items.length,30);
assert.equal(d.results.language_cells,30);
assert.equal(d.results.whole_form_comparisons,30);
assert.equal(d.results.fully_verbatim_certified,0);
assert.equal(new Set(d.items.map(x=>x.prayer_id+"|"+x.language)).size,30);
const freq={};
for(const item of d.items){
 const p=PRAY_CANONICAL_DATA_V435930.prayers[item.prayer_id];
 assert.ok(p,"not a canonical prayer: "+item.prayer_id);
 assert.ok(p[item.language].includes(item.canonical_witness),"canonical wording changed for "+item.prayer_id+" "+item.language);
 assert.equal(item.whole_prayer_form_compared,true);
 assert.equal(item.verbatim_text_certified,false);
 assert.equal(item.source_republication_approved,false);
 assert.match(item.source_url,/^https:\/\/www\.vatican\.va\/archive\/compendium_ccc/);
 assert.equal(item.web_extraction_line_span.length,2);
 assert.ok(item.comparison_notes.length>55);
 freq[item.outcome]=(freq[item.outcome]||0)+1;
}
assert.deepEqual(freq,d.results.by_outcome);
for(const id of ["foundations_act_of_faith","foundations_act_of_love","sacrament_act_of_contrition"]){
 const n=PRAY_COLLATION_NOTICES_V1[id];
 assert.ok(n,"source note missing: "+id);
 assert.ok(n.notice.en.length>100 && n.notice.fr.length>100);
}
assert.match(PRAY_COLLATION_NOTICES_V1.sacrament_act_of_contrition.notice.fr,/Amen/);
assert.match(PRAY_COLLATION_NOTICES_V1.foundations_grace_after_meals.notice.en,/primary historical source prints/);
assert.equal(PRAY_COLLATION_NOTICES_V1.foundations_act_of_hope,undefined,"French printed hope anomaly uses one existing disclosure");
const prayerRuntime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(prayerRuntime,/const collation=prayCollationNotice\(p\.id\)/);
assert.match(prayerRuntime,/collationDisclosure/);
console.log("PASS Prayer Compendium whole-form review: 30 source comparisons, ten language notes, no false certification");
