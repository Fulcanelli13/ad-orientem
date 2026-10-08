import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=path=>JSON.parse(readFileSync(path,"utf8"));
const forensic=load("data/learn/forensic-recovery-register-2026-10-08.v1.json");
const bridge=load("data/learn/formation-recoverable-research-ledger-2026-10-08.v1.json");
const ap=load("data/learn/apologetics-canonical.v1.json");
const cr=load("data/learn/church-crisis-canonical.v1.json");
const owners=new Set([...ap.dossiers,...cr.dossiers].map(x=>x.id));
const idList=(prefix,start,end)=>Array.from({length:end-start+1},(_,i)=>prefix+String(start+i).padStart(3,"0"));
const unique=(rows,label)=>assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,label+" duplicate ID");
const confirmIds=(actual,prefix,from,to)=>assert.deepEqual(actual.map(x=>x.id),idList(prefix,from,to));

assert.equal(forensic.status,"AUDIT_ONLY_NOT_PUBLISHED");
assert.equal(bridge.status,"AUDIT_ONLY_NEITHER_SOURCE_VERIFIED_NOR_PUBLISHED");
assert.equal(ap.status,"FROZEN_TARGET_NOT_YET_PUBLISHED");
assert.equal(cr.status,"FROZEN_TARGET_NOT_YET_PUBLISHED");
assert.equal(ap.dossiers.length,60);
assert.equal(cr.dossiers.length,81);
const {legacy_apologetics:a,legacy_church_crisis:c,traditional_mass_objections:t}=forensic;
confirmIds(a,"A",1,318);
confirmIds(c,"C",1,233);
confirmIds(t,"TLM",1,75);
assert.equal(a.filter(x=>x.evidence==="BATCH_THEME_ONLY").length,75);
assert.equal(a.filter(x=>x.evidence==="NO_TRUSTWORTHY_PER_ID_TEXT").length,243);
assert.equal(c.filter(x=>x.evidence==="BAND_ONLY_NO_VERBATIM_QUESTION").length,233);
for(const x of [...a,...c]){
  assert.equal(x.original_question,null,x.id+" may not fabricate its original question");
  assert.equal(x.original_answer,null,x.id+" may not fabricate its original answer");
  assert.equal(x.canonical_owner_verified,false,x.id+" has band-level, not per-ID, mapping");
}
assert.equal(t.filter(x=>x.original_title_en).length,50);
assert.equal(t.filter(x=>!x.original_title_en).length,25);
assert.equal(forensic.canonical_dossiers.apologetics.length,60);
assert.equal(forensic.canonical_dossiers.church_crisis.length,81);
assert.equal(bridge.recovered_research.length,102);
unique(bridge.recovered_research,"research pack");
const recordMap=new Map(bridge.recovered_research.map(x=>[x.id,x]));
for(const id of idList("TLM",26,75))assert.equal(recordMap.has(id),true,id+" missing");
for(const id of idList("BAQ-",1,26).map(id=>id.replace("BAQ-0","BAQ-")))assert.ok(recordMap.has(id));
for(const record of bridge.recovered_research){
  assert.equal(record.publication_status,"UNPUBLISHED");
  if(record.canonical_owner?.startsWith("APOL-")||record.canonical_owner?.startsWith("CR-"))assert.ok(owners.has(record.canonical_owner),record.id+" missing canonical owner");
  const m=record.source_metrics;
  assert.equal(m.source_links.length,new Set(m.source_ids).size);
  assert.ok(m.source_links.every(x=>x.id && /^https:\/\//.test(x.url)),record.id+" invalid source pointer");
  assert.equal(m.unresolved_source_ids.length,0,record.id+" unknown source");
}
assert.equal(bridge.controversy_topics.records.length,43);
assert.equal(bridge.controversy_topics.counts.with_case_association,22);
assert.equal(bridge.controversy_topics.counts.without_case_association,21);
assert.equal(bridge.recovered_research.reduce((s,r)=>s+r.source_metrics.source_bearing_blocks,0),bridge.counts.source_bearing_blocks);
assert.equal(bridge.recovered_research.reduce((s,r)=>s+r.source_metrics.blocks_without_source_ids,0),bridge.counts.blocks_without_source_ids);
assert.equal(bridge.recovered_research.reduce((s,r)=>s+r.source_metrics.blocks_with_fr+r.source_metrics.blocks_no_fr,0),bridge.counts.source_bearing_blocks);
assert.equal(bridge.recovered_research.filter(x=>x.bank==="BAQ" && x.content_status==="QUESTION_ONLY_NO_ANSWER").length,0);
assert.deepEqual(bridge.counts.biblical_patristic_question_only,[]);
for (const id of ["BAQ-13","BAQ-14","BAQ-15","BAQ-16"]){
 const record=bridge.recovered_research.find(x=>x.id===id);
 assert.equal(record.content_status,"NEW_BILINGUAL_SUBSTANTIVE_ANSWER_DRAFT_20261008_NOT_LEGACY_VERBATIM");
 assert.ok(record.source_metrics.source_bearing_blocks>=6);
 assert.equal(record.publication_status,"UNPUBLISHED");
}
assert.equal(bridge.baq_13_16_new_answer_pass_20261008.newly_written_not_legacy_recovery,true);
assert.equal(bridge.recovered_research.filter(x=>x.bank==="TRADITIONAL_MASS_OBJECTION" && x.originality==="VERBATIM_ENGLISH_RECOVERED").length,25);
assert.equal(bridge.recovered_research.filter(x=>x.bank==="TRADITIONAL_MASS_OBJECTION" && x.originality==="NORMALIZED_ENGLISH_NOT_VERBATIM_ORIGINAL").length,15);
console.log(JSON.stringify({forensicLegacyIds:a.length+c.length+t.length,
  recoverableResearchRecords:bridge.recovered_research.length,
  canonicalDossiers:owners.size,
  contemporaryTopicAssociations:bridge.controversy_topics.counts,
  sourceBearingTextBlocks:bridge.counts.source_bearing_blocks,
  status:"AUDIT_COVERAGE_ONLY_NOT_PUBLICATION_CERTIFICATION"},null,2));
