import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const original=read("../data/customs/research/weiser-handbook-inventory.v0.json");
const all=read("../data/customs/research/weiser-canonical-crosswalk.v1.json");
const p1=read("../data/customs/research/weiser-p1-wave02-full-reconciliation.v1.json");
const cards=read("../data/customs/research/weiser-p1-wave02-bilingual-editorial-cards.v1.json");

const priority=all.records.filter(x=>x.priority==="P1");
assert.equal(priority.length,144);
assert.equal(p1.crosswalk.length,144);
assert.equal(p1.audit.priority_1_observations,144);
assert.equal(p1.audit.app_published,0);
assert.equal(p1.audit.cluster_count,28);
assert.equal(p1.audit.clustered_observations,76);
assert.equal(p1.audit.singleton_unclustered_observations,68);
assert.equal(p1.audit.independent_bounded_observations,14);
assert.equal(p1.audit.independent_source_topics,10);
assert.equal(original.records.length,568);
assert.equal(new Set(p1.crosswalk.map(x=>x.weiser_id)).size,144);
const canon=new Map(priority.map(x=>[x.weiser_id,x]));
const originals=new Map(original.records.map(x=>[x.id,x]));
const clusters=new Map(p1.editorial_clusters.map(x=>[x.id,x]));
const evidence=new Map(p1.source_witnesses.map(x=>[x.evidence_id,x]));
const coverage=new Map();
assert.equal(evidence.size,10);
assert.equal(clusters.size,28);
for(const row of p1.crosswalk){
 const input=canon.get(row.weiser_id);
 const src=originals.get(row.weiser_id);
 assert.ok(input && src, "P1 row does not exist in canonical Weiser corpus: "+row.weiser_id);
 assert.equal(row.title,input.source_title);
 assert.equal(row.printed_page,src.page);
 assert.equal(row.initial_triage,src.triage);
 assert.equal(row.release,"RESEARCH_ONLY_NO_APP_PUBLICATION");
 assert.notEqual(row.initial_triage,"EXCLUDE");
 assert.notEqual(row.initial_triage,"HISTORY_ONLY");
 if(row.canonical_cluster_id){
   assert.ok(clusters.get(row.canonical_cluster_id)?.observation_ids.includes(row.weiser_id),"orphan P1 cluster "+row.weiser_id);
   coverage.set(row.weiser_id,(coverage.get(row.weiser_id)||0)+1);
 }
 if(row.independent_evidence_id){
   const record=evidence.get(row.independent_evidence_id);
   assert.ok(record && record.observation_ids.includes(row.weiser_id),"orphan source witness "+row.weiser_id);
 }
}
for(const g of clusters.values()){
 assert.equal(g.publishable,false);
 assert.ok(g.observation_ids.length>=1);
 assert.equal(new Set(g.observation_ids).size,g.observation_ids.length);
 for(const id of g.observation_ids)assert.ok(canon.has(id),"bad cluster "+id);
 assert.ok(g.relationship && g.caution && g.owner_candidate);
}
assert.equal(coverage.size,76);
assert.ok([...coverage.values()].every(v=>v===1),"one P1 observation in >1 editorial cluster");
const seen=new Set();
for(const s of p1.source_witnesses){
 assert.ok(/^https:\/\//.test(s.url),"missing source URL");
 assert.ok(s.claim_scope.length>40);
 for(const id of s.observation_ids){
   assert.ok(canon.has(id),"source evidence outside selected P1 "+id);
   assert.ok(!seen.has(id),"duplicate source-topic ownership "+id);
   seen.add(id);
 }
}
assert.equal(seen.size,14);
assert.equal(cards.cards.length,7);
assert.equal(cards.totals.source_mapped_observations,11);
assert.equal(cards.totals.other_source_topics_held,3);
assert.equal(cards.totals.published_cards,0);
const cardTopics=new Set(cards.cards.map(c=>c.source_topic_id));
assert.equal(cardTopics.size,7);
for(const c of cards.cards){
 const s=evidence.get(c.source_topic_id);
 assert.ok(s && s.source_assessment==="VERIFIED_BOUNDED_CONTEXT");
 assert.deepEqual(c.source_observation_ids,s.observation_ids);
 assert.equal(c.publication_state,"NOT_PUBLISHED");
 assert.ok(c.guardrails.length>=5);
 assert.ok(c.source_locator.length===c.source_observation_ids.length);
 assert.equal(c.independent_witness.url,s.url);
 for(const f of ["title_en","title_fr","description_en","description_fr","meaning_en","meaning_fr","observe_en","observe_fr"]){
  assert.ok(c[f]?.length>15,"missing bilingual editorial field "+f+" "+c.id);
 }
 for(const loc of c.source_locator)assert.equal(loc.printed_page,originals.get(loc.weiser_id).page);
}
for(const s of p1.source_witnesses.filter(x=>!cardTopics.has(x.evidence_id))){
 assert.ok(cards.other_bounded_source_topics_to_hold.some(x=>x.source_topic_id===s.evidence_id&&x.release==="HOLD"));
}
const negative=original.records.filter(x=>x.triage==="EXCLUDE");
assert.equal(negative.length,34);
assert.ok(negative.every(x=>!p1.crosswalk.some(row=>row.weiser_id===x.id)));
console.log("PASS Weiser P1 Wave02: 144 source-mapped, 28 guarded clusters/76 grouped, 68 singleton, 14 source-bounded across 10 topics, 7 bilingual editorial drafts/11 observations, 3 topic holds, 34 exclusions intact, 0 app publication.");
