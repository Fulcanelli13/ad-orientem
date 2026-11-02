import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as corpus} from "../src/pray/canonical-data.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const prior=read("data/pray/compendium-witness-collation-b01.v1.json");
const batch=read("data/pray/compendium-witness-collation-b02.v1.json");
const audit=read("data/pray/prayer-source-presentation-audit.v1.json");
assert.equal(batch.schema,"AO_PRAYER_COMPENDIUM_WITNESS_COLLATION_B02_V1");
assert.equal(batch.items.length,12);
assert.equal(batch.counts.batchComparisons,12);
assert.equal(batch.counts.priorBatchComparisons,4);
assert.equal(batch.counts.languageComparisons,36);
assert.equal(batch.counts.fullVerbatimCertified,0);
assert.equal(batch.policy.fullVerbatimCertified,false);
const priorReviewed=new Set(prior.items.filter(x=>x.status!=="NOT_REVIEWED_IN_BATCH_01").map(x=>x.id));
const ids=new Set(batch.items.map(x=>x.id));
assert.equal(ids.size,12);
for(const id of ids)assert.ok(!priorReviewed.has(id),"Source witness reviewed twice: "+id);
const expected=new Set(prior.items.map(x=>x.id));
const represented=new Set([...priorReviewed,...ids]);
assert.deepEqual(represented,expected,"All 16 Compendium-linked prayers must now have comparative witness records");
const auditFamily=new Set(audit.identities.filter(x=>
 x.actual_runtime_source_selection?.url===prior.sourceWitnesses.en.url).map(x=>x.id));
assert.deepEqual(represented,auditFamily,"No Compendium-linked prayer may be silently omitted or invented");
for(const row of batch.items){
 assert.ok(corpus.prayers[row.id],"Missing existing canonical prayer: "+row.id);
 assert.equal(row.sourceGroup,"VATICAN_2005_COMPENDIUM");
 assert.equal(row.reviewState,"PRIMARY_WITNESS_COMPARED_ALL_THREE_LANGUAGE_FORMS");
 assert.equal(row.fullVerbatimCertified,false);
 assert.equal(row.canonicalTextChanged,false);
 for(const lang of ["en","fr","la"]){
  assert.ok(corpus.prayers[row.id][lang]?.length>20,"Canonical language missing: "+row.id+" "+lang);
  assert.ok(row.languageFindings[lang]?.length>30,"No documented witness finding: "+row.id+" "+lang);
 }
 for(const witness of ["en","fr"])assert.match(row.witnessLines[witness],/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)?$/);
 assert.ok(row.editorialNext.length>30);
}
const byId=Object.fromEntries(batch.items.map(x=>[x.id,x]));
assert.equal(byId.foundations_act_of_hope.classification,"PRINTED_FRENCH_ANOMALY_NOT_EMENDED");
assert.match(byId.foundations_act_of_hope.languageFindings.fr,/Dans cette foi/);
assert.match(byId.foundations_act_of_hope.languageFindings.la,/In hac spe/);
assert.match(corpus.prayers.foundations_act_of_hope.fr,/Dans cette foi/);
assert.match(byId.adoration_anima_christi.languageFindings.en,/rhymed translation/);
assert.match(byId.marian_hail_holy_queen.languageFindings.fr,/vouvoiement/);
for(const id of ["weekday_magnificat","weekday_benedictus"]){
 assert.equal(byId[id].classification,"MIXED_TRANSLATION_AND_MISSING_DOXOLOGY");
 assert.match(byId[id].languageFindings.la,/omits the.*Gloria Patri|omits the concluding Gloria Patri/);
 assert.ok(!corpus.prayers[id].la.includes("Gloria Patri"),"Unreviewed doxology must not be inserted into the legacy text");
}
assert.match(corpus.prayers.foundations_eternal_rest.fr,/lumière éternelle/);
assert.match(corpus.prayers.marian_hail_holy_queen.fr,/Vers vous/);
console.log("PASS Compendium B02: 12 trilingual comparisons, complete 16/16 comparative family, no text rewrites or false certifications.");
