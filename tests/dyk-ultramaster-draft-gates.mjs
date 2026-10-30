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

const customsScreen=load("dyk-customs-130-source-editorial-screen.v1.json");
const pitreStories=load("dyk-pitre-12-festival-stories.v1.json");
const folioAudit=load("dyk-weiser-14-original-folio-adjudication.v1.json");
assert.equal(folioAudit.verified.length,14);
assert.equal(folioAudit.holds.length,8);
assert.equal(folioAudit.counts.approved,0);
assert.equal(folioAudit.counts.published,0);
const folioIndex=new Set(folioAudit.verified.map(x=>x.draft_id));
assert.equal(folioIndex.size,14);
const heldIndex=new Map(folioAudit.holds.map(x=>[x.draft_id,x]));
assert.equal(heldIndex.size,8);

const historical=facts.filter(x=>["WEISER_1958","PITRE_1900"].includes(x.source_family));
assert.equal(historical.length,130);
assert.equal(customsScreen.records.length,130);
assert.equal(customsScreen.counts.weiser,70);
assert.equal(customsScreen.counts.pitre,60);
assert.equal(customsScreen.counts.source_page_narrow_action_or_original_page_checked,130);
assert.equal(customsScreen.counts.source_pages_still_needing_specific_individual_weiser_link,0);
assert.deepEqual(customsScreen.counts.decision_groups,{
 PRIORITY_FACT_EDITORIAL_REVIEW:31,
 SECONDARY_CULTURAL_CONTEXT_REVIEW:31,
 FESTIVAL_STORY_CLUSTER_REVIEW:60,
 DEFER_LOW_CURIOSITY_OR_GROUP_WEEKDAY:8,
});
const caseIds=new Set(customsScreen.records.map(x=>x.draft_id));
assert.equal(caseIds.size,130);
for(const f of historical)assert.ok(caseIds.has(f.id),f.id+" lacks editorial source review");
assert.equal(customsScreen.records.filter(x=>x.source_family==="PITRE_1900").length,60);
assert.equal(customsScreen.records.filter(x=>x.evidence_stage==="ORIGINAL_PITRE_FOLIO_LOCATED_AND_IMAGE_REVIEWED").length,60);
assert.equal(customsScreen.records.filter(x=>x.evidence_stage==="ORIGINAL_WEISER_FOLIO_NOT_CHECKED_IN_RECORD").length,0);
for(const id of folioIndex){
 const row=customsScreen.records.find(x=>x.draft_id===id);
 assert.ok(row);
 assert.equal(row.evidence_stage,"WEISER_ORIGINAL_PRINTED_FOLIO_DIRECTLY_CHECKED_20261030");
 const source=folioAudit.verified.find(x=>x.draft_id===id);
 assert.deepEqual(row.evidence_locator.printed_folios_checked,source.printed_pages);
 assert.ok(source.page_image_checked);
 assert.equal(source.claim_and_french_approved,false);
}
for(const [id,held] of heldIndex){
 const row=customsScreen.records.find(x=>x.draft_id===id);
 assert.equal(row.source_precision_hold_resolved_20261030,true);
 assert.equal(row.decision,held.new_triage);
 assert.ok(row.remaining_publication_gates.length>0);
}
assert.equal(customsScreen.counts.source_precision_holds_resolved_in_direct_page_pass,8);

assert.equal(pitreStories.candidates.length,12);
assert.equal(pitreStories.counts.net_addition_to_active_fact_pool,0);
assert.equal(pitreStories.counts.approved,0);
assert.equal(pitreStories.counts.published,0);
const priorById=new Map(historical.map(x=>[x.id,x]));
let storyReferences=0;
for(const story of pitreStories.candidates){
 assert.equal(story.publish,false);
 assert.equal(story.source_fact_ids.length,story.source_provenance.length);
 assert.equal(story.independent_historical_witnesses_certified,0);
 assert.ok(story.statement.en&&story.statement.fr);
 for(const item of story.source_provenance){
  const prior=priorById.get(item.fact_id);
  assert.ok(prior&&prior.source_family==="PITRE_1900",item.fact_id+" not retained");
  assert.equal(item.original_1900_page_source_verified,true);
  assert.ok(Number.isInteger(item.printed_1900_page));
  assert.ok(item.italian_anchor);
  storyReferences++;
 }
}
assert.equal(storyReferences,27);
for(const f of original.facts.filter(x=>x.source_family==="PITRE_1900")){
 assert.equal(f.original_source.original_page_image_reviewed,true);
 assert.ok(Number.isInteger(f.original_source.original_1900_printed_page));
 assert.ok(f.original_source.italian_text_layer_anchor);
}
const narrowed=weiser.facts.find(x=>x.id==="DYK-UM02-006");
assert.ok(narrowed&&!/reconcil/i.test(narrowed.text.en));
assert.ok(/UNSUPPORTED_DETAIL_REMOVED/.test(customsScreen.records.find(x=>x.draft_id===narrowed.id).concerns.join(" ")));
assert.equal(weiser.facts.filter(x=>x.source.original_page_checked_in_later_sweep===true).length,6);

console.log("DYK: 145 active source-first drafts structurally valid; 9 deferred semantic overlaps; 10 glossary routes pending browser acceptance; 0 published.");
