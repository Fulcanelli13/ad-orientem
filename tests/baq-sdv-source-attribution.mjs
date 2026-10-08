import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load = file => JSON.parse(readFileSync(file,"utf8"));
const baq = load("data/learn/biblical-patristic-answers.v1.json");
const sdv = load("data/learn/sedevacantism-preconciliar-debates.v1.json");
const questionBank = load("data/learn/biblical-patristic-and-sedevacantist-question-supplement.v1.json");
const audit = load("data/learn/baq-sdv-claim-provenance-audit-2026-10-08.v1.json");
const bridge = load("data/learn/formation-recoverable-research-ledger-2026-10-08.v1.json");
const ap = load("data/learn/apologetics-canonical.v1.json");
const cr = load("data/learn/church-crisis-canonical.v1.json");
const owners = new Set([...ap.dossiers,...cr.dossiers].map(x=>x.id));
const sourceMap = r => new Map(r.map(x=>[x.id,x]));
const aSources = sourceMap(baq.source_registry), sSources = sourceMap(sdv.source_registry);
assert.equal(baq.answers.length,22);
assert.equal(sdv.debates.length,8);
assert.equal(questionBank.questions.length,26);
assert.deepEqual(questionBank.questions.filter(q=>!baq.answers.some(a=>a.question_id===q.id)).map(q=>q.id),["BAQ-13","BAQ-14","BAQ-15","BAQ-16"]);
assert.equal(aSources.size,56);
assert.equal(sSources.size,32);
for (const row of [...baq.answers,...sdv.debates])assert.ok(owners.has(row.canonical_owner));
const editorial=new Set(["BAQ-06","BAQ-07","BAQ-17","BAQ-18","BAQ-19","BAQ-24","BAQ-26"]);
const actual=new Set();
for(const row of baq.answers){
  assert.equal(row.editorial_attribution_audit.publication_ready,false);
  for(const ob of row.objections||[]){
    if(ob.attribution_status==="HYPOTHETICAL_ARGUMENT_NOT_DOCUMENTED_EXTERNAL_WORDING"){
      actual.add(row.question_id);
      assert.equal(ob.source_scope,"TOPICAL_CONTEXT_ONLY");
      assert.equal(ob.proponent_kind,"EDITORIAL_STRAWMAN_RISK_NOT_AN_ATTRIBUTED_OPPONENT");
      assert.ok(ob.provenance_warning&&ob.proponent.includes("Editorially framed"));
    }else assert.ok(["SOURCE_LINKED_WORDING_PARAPHRASE_NOT_QUOTATION","SOURCE_LINKED_PARAPHRASE_NOT_QUOTATION"].includes(ob.attribution_status));
    assert.ok(ob.argument?.source_ids?.length && ob.response?.source_ids?.length);
    for(const id of [...ob.argument.source_ids,...ob.response.source_ids])assert.ok(aSources.has(id));
  }
}
assert.deepEqual([...actual].sort(),[...editorial].sort());
const iren=baq.answers.find(x=>x.question_id==="BAQ-20");
assert.match(iren.objections[0].proponent,/Irenaeus/);
assert.ok(iren.objections[0].argument.source_ids.includes("IRENAEUS-V33"));
assert.ok(iren.objections[0].response.source_ids.includes("AUG20"));
assert.ok(iren.objections[0].argument.text_fr && iren.objections[0].response.text_fr);
assert.equal(iren.editorial_attribution_audit.patristic_counter_position_located,true);
assert.ok(aSources.get("IRENAEUS-V33").url.endsWith("/0103533.htm"));
const g=sSources.get("GUERARD-FR");
assert.ok(g.url.startsWith("https://www.sodalitium.eu/interview-de-"));
const sdv06=sdv.debates.find(x=>x.id==="SDV-06");
assert.equal(sdv06.evidence_review_20261008.primary_proponent_found,true);
assert.equal(sdv06.evidence_review_20261008.original_cahiers_editional_collation_completed,false);
assert.ok(sdv06.sedevacantist_case.paragraphs[0].source_ids.includes("GUERARD-FR"));
assert.ok(sdv06.question_provenance_ids.includes("GUERARD-FR"));
assert.ok(sSources.get("BEL-2-30").url.includes("de-romano-pontifice-book2-chapter30"));
assert.ok(sSources.get("BEL-4-67").url.includes("de-romano-pontifice-book4-chapters6-7"));
assert.equal(sdv.debates.every(x=>x.source_integrity_review.human_theological_approval===false),true);
assert.equal(audit.status,"AUDIT_ONLY_SOURCE_LINKED_DRAFTS_UNPUBLISHED");
assert.equal(audit.reviewed_records,30);
assert.equal(audit.claims.length,238);
assert.equal(audit.cases.length,30);
assert.equal(audit.cases.filter(x=>x.id.startsWith("BAQ-")).reduce((s,x)=>s+x.source_bearing_blocks,0),103);
assert.equal(audit.cases.filter(x=>x.id.startsWith("SDV-")).reduce((s,x)=>s+x.source_bearing_blocks,0),135);
assert.equal(new Set(audit.claims.map(x=>x.record_id+"|"+x.path)).size,238);
for(const row of audit.claims){
 assert.ok(row.sources.length);
 assert.ok(row.sources.every(x=>/^https:\/\//.test(x.url)));
 assert.equal(row.source_status,"REFERENCES_REGISTERED_NOT_PARAGRAPH_CERTIFIED");
}
assert.equal(audit.cases.every(x=>x.human_claim_context_approval===false),true);
assert.equal(bridge.recovered_research.length,102);
assert.equal(bridge.counts.source_bearing_blocks,508);
assert.equal(bridge.counts.unknown_source_ids,0);
assert.equal(bridge.baq_sdv_source_pass_20261008.public_release,false);
for(const rec of bridge.recovered_research.filter(x=>(x.bank==="BAQ"||x.bank==="SEDEVACANTISM")&&audit.cases.some(y=>y.id===x.id))){
 const original=audit.cases.find(x=>x.id===rec.id);
 assert.ok(original);
 assert.equal(rec.source_metrics.source_bearing_blocks,original.source_bearing_blocks);
 assert.equal(rec.source_metrics.source_id_links,original.registered_source_links);
}
assert.equal(bridge.counts.indexed_questions_and_cases,102);
assert.equal(bridge.recovered_research.filter(x=>x.bank==="BAQ"&&!audit.cases.some(y=>y.id===x.id)).length,4,"four unanswered BAQ slots must stay separately held");
assert.equal(ap.dossiers.length,60);
assert.equal(cr.dossiers.length,81);
const browser=readFileSync("src/learn/browser-entry.js","utf8");
assert.ok(browser.includes("aoFormationRecoveryReview=1"));
console.log(JSON.stringify({status:"PASS",cases:30,baq:22,sdv:8,sourceBearingBlocks:238,
  syntheticUnattributedNotMislabelled:editorial.size,firstPersonGuérard:"DIRECT_FRENCH_REPRINT_LOCATED",
  canonDossiers:141,published:0,verifiedSourceRegistryLinks:true,certifiedAllClaims:false},null,2));
