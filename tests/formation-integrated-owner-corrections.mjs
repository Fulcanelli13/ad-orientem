import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP,CSE_SOURCE_MAP,CSE_QUESTIONS,CSE_PUBLIC_QUESTIONS} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";

const load=p=>JSON.parse(readFileSync(p,"utf8"));
const integration=load("docs/formation-integration-source-manifest-20261014.json");
const originalCases=load("data/learn/formation-retained-evolution-china-case-records-20261014.v1.json");
const paths=[
 "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch3-2026-10-09.v1.json",
 "formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
 "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch6-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch7-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch8-2026-10-09.v1.json"
];
const dossiers=[];
let sectionsRevised=0;
for(const name of paths){
 const pack=load("data/learn/"+name);
 assert.equal(pack.publication_allowed,false,"Do not silently publish "+name);
 const sources=new Map(pack.source_registry.map(s=>[s.id,s]));
 assert.equal(sources.size,pack.source_registry.length,"Ambiguous source IDs "+name);
 for(const record of pack.dossiers){
  assert.equal(record.sections.length,4,record.id+" lost four-role structure");
  for(const gate of ["publication_allowed","original_claim_by_claim_source_context_certified",
    "independent_theological_canonical_approval","native_french_copyapproval"])
   assert.equal(record[gate],false,record.id+" has an unearned approval");
  for(const section of record.sections){
   assert.ok(section.text.en?.trim()&&section.text.fr?.trim(),record.id+" missing bilingual paragraph");
   assert.ok(section.source_ids?.length,record.id+" missing references");
   for(const sid of section.source_ids)
    assert.match(sources.get(sid)?.url||"",/^https:\/\//,record.id+"/"+sid+" missing source URL");
   if(section.role==="documented_position")assert.ok(section.attribution?.length>=18,record.id+" lacks original-speaker attribution");
   if(section.integration_source)sectionsRevised++;
  }
  dossiers.push(record);
 }
}
assert.equal(dossiers.length,141);
assert.equal(new Set(dossiers.map(d=>d.id)).size,141);
assert.equal(dossiers.filter(d=>d.id.startsWith("APOL-")).length,60);
assert.equal(dossiers.filter(d=>d.id.startsWith("CR-")).length,81);
const stage=integration.owners.filter(e=>!e.id.startsWith("CSE"));
assert.equal(stage.length,27);
assert.equal(stage.reduce((n,d)=>n+d.sections.length,0),55);
assert.equal(sectionsRevised,55);
const byId=new Map(dossiers.map(d=>[d.id,d]));
for(const item of stage)assert.ok(byId.get(item.id)?.integration_provenance,item.id+" was not integrated");

const faith=byId.get("APOL-002");
assert.match(faith.sections[0].text.en,/Faith and reason are not rival sources/);
assert.match(faith.sections[1].text.en,/David Hume/);
assert.doesNotMatch(faith.sections[0].text.en,/Humani generis/);
const government=byId.get("CR-GOV-01");
assert.match(government.sections[0].text.en,/postconciliar period/);
assert.doesNotMatch(government.sections[0].text.en,/Vatican–China/);
assert.match(byId.get("CR-ECC-12").sections[0].text.en,/ordinary Magisterium/);
assert.match(byId.get("CR-ECC-12").sections[0].text.en,/not 'strictly normative'/);
assert.match(byId.get("CR-LIT-07").sections[0].text.en,/Offertory/);
const apol58=byId.get("APOL-058");
assert.ok(apol58.sections[1].source_ids.includes("TRC-2015-OPP"),
 "Don't overwrite Indigenous survivor and commission evidence with papal accounts");
assert.match(apol58.sections[1].text.en,/Truth and Reconciliation Commission/);

assert.deepEqual(originalCases.cases.map(c=>c.former_owner),["APOL-002","CR-GOV-01"]);
for(const original of originalCases.cases){
 assert.equal(original.original_draft.length,4,original.former_owner+" original case not preserved");
 assert.ok(original.source_registry.length>0);
 assert.equal(original.publication_allowed,false);
}
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_PUBLIC_QUESTIONS.length,147);
const headship=CSE_DEBATE_MAP.CSE045;
assert.ok(headship,"CSE045 missing debate");
assert.match(headship.opposition[0],/Pius XI/);
assert.match(headship.response[0],/Mulieris dignitatem/);
assert.ok(CSE_QUESTION_MAP.CSE045.refs.some(([id])=>id==="MULIERIS"));
assert.ok(CSE_QUESTION_MAP.CSE068.refs.some(([id])=>id==="QUAEC"));
assert.match(CSE_SOURCE_MAP.QUAEC.canonical_url,/vatican.va.+quae[c]?cumque-sterilizatio_en.html$/i);
assert.match(CSE_DEBATE_MAP.CSE031.catholicCase[0],/Matrimonial consent/);
console.log(JSON.stringify({result:"PASS",owners:dossiers.length,apologetics:60,crisis:81,
 revisions:sectionsRevised,sexualEthics:150,originalResearchCases:originalCases.cases.length,
 publication:false}));
