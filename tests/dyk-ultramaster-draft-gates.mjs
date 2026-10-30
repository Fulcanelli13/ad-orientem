import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizeDraftStatement} from "../tools/dyk/statement-normalizer.mjs";
const root=new URL("../data/research/did-you-know/",import.meta.url);
const load=name=>JSON.parse(readFileSync(new URL(name,root),"utf8"));
const map=load("dyk-customs-ultramaster-source-map.v1.json");
const legacy=load("dyk-legacy-reconciliation-v1.json");
const triage=load("dyk-legacy-18-claim-semantic-triage.v1.json");
const routes=load("dyk-destination-readiness-v1.json");
const original=load("dyk-ultramaster-batch01.v1.json");
const weiser=load("dyk-ultramaster-batch02a-weiser.v1.json");
const pitre=load("dyk-ultramaster-batch02b-pitre.v1.json");
const wider=load("dyk-ultramaster-batch03-wider-corpus.v1.json");
const supplement=load("dyk-source-first-batch01.v1.json");
const facts=[...original.facts,...weiser.facts,...pitre.facts,...wider.facts,...supplement.facts];
assert.equal(map.counts.total_source_observations,3703);
assert.equal(map.bucket_summary.reduce((n,x)=>n+x.source_observations,0),3703);
assert.equal(map.counts.weiser_observations,1025);
assert.equal(map.counts.pitre_original_1900_observations,718);
assert.equal(map.counts.other_observations,1960);
assert.equal(original.facts.length,30);
assert.equal(weiser.facts.length,25);
assert.equal(pitre.facts.length,25);
assert.equal(wider.facts.length,50);
assert.equal(supplement.facts.length,15);
assert.equal(supplement.deferred_canonical_customs_illustrations.length,16);
assert.equal(supplement.deferred_legacy_semantic_duplicates.length,9);
assert.equal(facts.length,145);
const ids=new Set(facts.map(x=>x.id));
assert.equal(ids.size,145);
const sourceCounters={WEISER_1958:0,PITRE_1900:0,glossary:0,mass_ceremonial:0};
const observed=new Set();
for(const f of facts){
 const owner=f.source_family||f.category;
 assert.ok(owner in sourceCounters,f.id+": unknown source");
 sourceCounters[owner]++;
 assert.match(f.text.en,/^Did you know that /);
 assert.match(f.text.fr,/^Saviez-vous qu/);
 assert.ok(f.publication_authorized!==true,f.id+": must remain unpublished");
 const en=normalizeDraftStatement(f.text.en,"en");
 const fr=normalizeDraftStatement(f.text.fr,"fr");
 assert.doesNotMatch(en,/Did you know that|\?/);
 assert.doesNotMatch(fr,/Saviez-vous qu|\?/);
 assert.ok(en.length<300&&fr.length<340,f.id+": too long");
 assert.ok(!/^[,;:]/.test(en)&&!/^[,;:]/.test(fr));
 if(owner==="WEISER_1958"||owner==="PITRE_1900"){
  const src=f.original_source||f.source;
  const references=src.observation_ids||src.original_observation_ids||[];
  assert.ok(references.length>0,f.id+": lacks source observation");
  for(const obs of references){
   const scoped=owner+":"+obs;
   assert.ok(!observed.has(scoped),f.id+": duplicate source action "+obs);
   observed.add(scoped);
  }
  assert.ok(f.scoping||f.scope,f.id+": missing local scope");
  assert.ok(f.editorial_state||f.editorial_status,f.id+": missing editorial hold");
  assert.equal(f.publication_authorized,false);
 }else{
  assert.match(f.state,/NOT_APPROVED/,f.id+": should not inherit upstream approval");
 }
}
assert.deepEqual(sourceCounters,{WEISER_1958:70,PITRE_1900:60,glossary:10,mass_ceremonial:5});
assert.equal(observed.size,131);
for(const f of pitre.facts){
 assert.equal(f.source.source_page_checked,true);
 assert.equal(f.source.independent_witness_certified,false);
 assert.ok(Number.isInteger(f.source.original_printed_page));
 assert.ok(f.source.italian_text_anchor);
}
for(const f of wider.facts.filter(x=>x.source_family==="PITRE_1900")){
 assert.equal(f.source.original_page_location_checked,true);
 assert.equal(f.source.source_page_image_reviewed,true);
 assert.equal(f.source.independent_original_witness_verified,false);
}
for(const f of wider.facts.filter(x=>x.source_family==="WEISER_1958"))
 assert.equal(f.source.original_page_narrow_action_checked,true);
assert.equal(triage.records.length,18);
assert.equal(triage.counts.defer_same_fact,9);
assert.equal(triage.counts.retain_distinct_claim,9);
assert.equal(legacy.flagged_public_drafts.length,18);
assert.equal(legacy.reconciliation_phase.baseline_before_claim_triage,154);
assert.equal(legacy.reconciliation_phase.current_active_drafts_after_triage,145);
const deferred=new Set(supplement.deferred_legacy_semantic_duplicates.map(x=>x.id));
assert.equal(deferred.size,9);
for(const x of triage.records){
 if(x.classification==="DEFER_AS_SEMANTIC_DUPLICATE"){
  assert.ok(deferred.has(x.draft_id));
  assert.ok(!ids.has(x.draft_id));
 }else{
  assert.equal(x.classification,"KEEP_AS_DISTINCT_FACT");
  assert.ok(ids.has(x.draft_id));
 }
}
assert.equal(routes.counts.active_drafts_total,145);
assert.equal(routes.ready_for_browser_testing.length,10);
assert.equal(routes.unresolved_mass.length,5);
assert.equal(routes.unresolved_customs.count,130);
assert.equal(routes.counts.exact_browser_verified,0);
const glossary=new Map(supplement.facts.filter(f=>f.category==="glossary").map(f=>[f.id,f]));
for(const x of routes.ready_for_browser_testing){
 assert.ok(glossary.has(x.draft_id));
 assert.equal(x.destination.type,"route");
 assert.equal(x.destination.id,"learn.glossary");
 assert.equal(x.destination.entryId,glossary.get(x.draft_id).source.record_id);
 assert.match(x.destination.entryId,/^G\d{3}$/);
 assert.equal(x.can_feed_production,false);
}
for(const x of routes.unresolved_mass){
 assert.equal(x.destination,null);
 assert.equal(x.can_feed_production,false);
}
assert.equal(triage.counts.published,0);
assert.equal(legacy.reconciliation_phase.publication_count,0);
console.log("DYK: 145 active source-first drafts structurally valid; 9 deferred semantic overlaps; 10 glossary routes pending browser acceptance; 0 published.");
