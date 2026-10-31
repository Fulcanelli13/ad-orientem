import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const dir="data/research/did-you-know/";
const read=name=>JSON.parse(readFileSync(dir+name,"utf8"));
const ledger=read("dyk-r20-unified-1001-first-pass-ledger.v1.json");
const index=read("dyk-r20-glossary-640-dedupe-crosswalk.v1.json");
const checkpoint=read("dyk-r20-execution-checkpoint.v1.json");
const old=[
 "dyk-ultramaster-batch01.v1.json","dyk-ultramaster-batch02a-weiser.v1.json",
 "dyk-ultramaster-batch02b-pitre.v1.json","dyk-ultramaster-batch03-wider-corpus.v1.json",
 "dyk-source-first-batch01.v1.json"
].flatMap(name=>read(name).facts);
const definitions=read("dyk-source-backed-glossary-expansion-440.v1.json").records;
const context=read("dyk-glossary-second-insights-200.v1.json").records;
const recent=[
 "dyk-customs-weiser-folio-expansion-04a.v1.json","dyk-customs-weiser-folio-expansion-04b.v1.json",
 "dyk-customs-pitre-new-feasts-04c.v1.json","dyk-mass-canon-discoveries-04d.v1.json"
].flatMap(name=>read(name).facts);
const previous=read("dyk-r19-216-source-fact-adjudication.v1.json");
const source=[...old,...definitions,...context,...recent];
assert.equal(source.length,1001);
assert.equal(new Set(source.map(x=>x.id)).size,1001);
assert.equal(ledger.ledger.length,1001);
assert.equal(new Set(ledger.ledger.map(x=>x.id)).size,1001);
assert.deepEqual(new Set(ledger.ledger.map(x=>x.id)),new Set(source.map(x=>x.id)));
assert.equal(ledger.metrics.total,1001);
assert.equal(ledger.metrics.final_approved,0);
assert.equal(ledger.metrics.published_new,0);
assert.equal(checkpoint.counts.total,1001);
assert.equal(checkpoint.counts.featured_for_review,168);
assert.equal(ledger.metrics.featured_for_review,168);
assert.equal(ledger.metrics.glossary_unique_entry_ids,440);
assert.equal(ledger.metrics.contextual_exact_EN_home,142);
assert.equal(ledger.metrics.contextual_same_source_home_variants,14);
assert.equal(ledger.metrics.contextual_source_not_in_home,44);
assert.equal(ledger.metrics.definition_source_ids_already_in_home,343);
const rowById=new Map(ledger.ledger.map(x=>[x.id,x]));
const groups={};
for(const x of ledger.ledger){
 assert.equal(x.approved,false,x.id);assert.equal(x.published,false,x.id);
 assert.ok(x.source_record_id||x.batch==="SOURCE_FIRST_216",x.id);
 if(x.related_lead)assert.ok(rowById.has(x.related_lead)||/^DYK-R0[456]-/.test(x.related_lead),x.id);
 groups[x.status]=(groups[x.status]||0)+1;
}
assert.deepEqual(groups,ledger.metrics.by_status);
assert.equal(groups.FEATURED_FOR_REVIEW,168);
assert.equal(groups.EXACT_HOME_PREVIEW_ALIAS,142);
assert.equal(groups.SAME_SOURCE_HOME_VARIANT,14);
assert.equal(groups.LEARN_GLOSSARY_REFERENCE_ONLY,440);
assert.equal(groups.CONSOLIDATE_WITH_RELATED,41);
assert.equal(groups.CONSOLIDATE_OR_SPREAD_FESTIVAL,33);
assert.equal(groups.HOLD_SOURCE_OR_SCOPE,23);
assert.equal(groups.HOLD_SCOPE_OR_QUALITY,19);
assert.equal(groups.RESERVE_FOR_BALANCE,100);
assert.equal(groups.LEARN_REFERENCE_OR_MASS_RESERVE,21);
const definitionIDs=new Set(definitions.map(x=>x.origin.record_id));
assert.equal(definitionIDs.size,440);
for(const x of definitions){
 const row=rowById.get(x.id);
 assert.equal(row.batch,"GLOSSARY_DEFINITIONS_440");
 assert.equal(row.status,"LEARN_GLOSSARY_REFERENCE_ONLY");
 assert.equal(row.source_record_id,x.origin.record_id);
}
for(const x of context){
 assert.ok(definitionIDs.has(x.source.record_id),x.id);
 const row=rowById.get(x.id);
 assert.equal(row.batch,"GLOSSARY_CONTEXTUAL_200");
 assert.equal(row.source_record_id,x.source.record_id);
 assert.equal(row.copy_en,x.fact.en);
 assert.equal(row.copy_fr,x.fact.fr);
 if(row.status==="EXACT_HOME_PREVIEW_ALIAS")assert.ok(row.home_existing_exact,x.id);
 if(row.status==="SAME_SOURCE_HOME_VARIANT"){
  assert.equal(row.home_existing_exact,null,x.id);
  assert.ok(row.home_preview_matching_source.length>0,x.id);
 }
}
for(const x of previous.adjudications){
 const row=rowById.get(x.id);
 assert.equal(row.batch,"SOURCE_FIRST_216");
 assert.equal(row.status,x.disposition);
}
assert.equal(rowById.get("DYK-SF01-020").status,"LEARN_REFERENCE_OR_MASS_RESERVE");
assert.equal(rowById.get("DYK-SF01-020").related_lead,null);
assert.equal(index.matching_records.length,200);
assert.equal(index.metrics.exact_english_preview,142);
assert.equal(index.metrics.same_source_preview_nonexact,14);
assert.equal(ledger.approval_gates.published,false);
assert.equal(ledger.approval_gates.final_human_editorial_review,false);
console.log(JSON.stringify({status:"PASS",sourceRecords:1001,classified:1001,
 featuredForReview:168,glossaryDefinitionRefs:440,
 exactPrivateHomeENAliases:142,sameGlossarySourceHomeVariants:14,
 historicalAndMassOriginals:145,newHistoricalAndMass:216,
 editorialFinal:0,newPublished:0,privateHomeImported:false}));
