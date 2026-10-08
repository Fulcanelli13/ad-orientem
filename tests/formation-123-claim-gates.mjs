import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load = file => JSON.parse(readFileSync(file,"utf8"));
const audit = load("data/learn/formation-123-source-claim-gates-2026-10-09.v1.json");
const ledger = load("data/learn/formation-recoverable-research-ledger-2026-10-08.v1.json");
const drafts = load("data/learn/contemporary-controversies-bulk-21-debates-2026-10-08.v1.json");
const historical = new Map(ledger.recovered_research.map(row=>[row.id,row]));
const current = new Map(drafts.cases.map(row=>[row.id,row]));

assert.equal(audit.entries.length,123);
assert.equal(new Set(audit.entries.map(row=>row.id)).size,123);
assert.equal(historical.size,102);
assert.equal(current.size,21);
assert.equal(audit.metrics.records,123);
assert.equal(audit.metrics.paragraphs,622);
assert.equal(audit.metrics.french_draft_paragraphs,622);
assert.equal(audit.metrics.source_link_occurrences,1508);
assert.equal(audit.metrics.human_editorially_approved_records,0);
assert.equal(audit.metrics.fully_independently_certified_records,0);
assert.equal(audit.metrics.published_records,0);
assert.equal(audit.metrics.records_with_at_least_one_original_text_spot_check,17);
assert.equal(audit.metrics.original_text_passages_spot_checked,18);
assert.equal(ledger.source_claim_quality_gate_20261009.all_research_entries,123);
assert.equal(ledger.source_claim_quality_gate_20261009.exact_original_text_passages_spot_checked,18);
assert.equal(ledger.source_claim_quality_gate_20261009.human_theological_signoffs,0);

assert.equal(audit.quality_gates.public_release,false);
assert.equal(audit.quality_gates.every_substantive_paragraph_claim_matched_to_exact_original_passage,"NOT_DONE");

let blocks=0,fr=0,links=0,spotChecks=0,fullyCert=0;
for(const row of audit.entries){
 const old=historical.get(row.id);
 const draft=current.get(row.id);
 assert.ok(Boolean(old)!==Boolean(draft),"not exactly one corpus: "+row.id);
 assert.equal(row.canonical_owner,old?.canonical_owner??draft?.canonical_owner??null,"ownership changed "+row.id);
 const expectedBlocks=old?.source_metrics.source_bearing_blocks??draft.paragraphs.length;
 const expectedFrench=old?.source_metrics.blocks_with_fr??draft.paragraphs.filter(p=>p.text.en&&p.text.fr).length;
 const expectedLinks=old?.source_metrics.source_id_links??draft.paragraphs.reduce((n,p)=>n+p.source_ids.length,0);
 const sourceIds=old?.source_metrics.source_ids??[...new Set(draft.paragraphs.flatMap(p=>p.source_ids))];
 assert.equal(row.source_bearing_blocks,expectedBlocks,row.id);
 assert.equal(row.french_draft_blocks,expectedFrench,row.id);
 assert.equal(row.source_link_occurrences,expectedLinks,row.id);
 assert.deepEqual([...row.distinct_source_ids].sort(),[...sourceIds].sort(),row.id);
 for(const check of row.original_text_spot_checks){
  assert.ok(row.distinct_source_ids.includes(check.source_id),"spot check without source: "+row.id);
  assert.ok(check.locator?.length>15 && check.scope?.length>20,"spot check needs contextual scope: "+row.id);
  spotChecks++;
 }
 assert.equal(row.claim_by_claim_independent_source_context_certified,false,row.id);
 assert.equal(row.formal_theological_or_canonical_approval,false,row.id);
 assert.equal(row.native_french_edit_approved,false,row.id);
 assert.equal(row.publishable,false,row.id);
 if(draft){
  assert.equal(draft.paragraphs.length,4,row.id);
  assert.ok(draft.paragraphs.every(p=>p.source_ids.length===p.source_links.length &&
     p.source_links.every(l=>draft.source_registry.some(s=>s.id===l.id&&s.url===l.url))),row.id);
 }
 blocks+=row.source_bearing_blocks;
 fr+=row.french_draft_blocks;
 links+=row.source_link_occurrences;
 fullyCert+=Number(row.claim_by_claim_independent_source_context_certified);
}
assert.equal(blocks,622);
assert.equal(fr,622);
assert.equal(links,1508);
assert.equal(fullyCert,0);
assert.equal(spotChecks,audit.metrics.original_text_passages_spot_checked);
assert.equal(audit.metrics.records_with_at_least_one_original_text_spot_check,
  audit.entries.filter(x=>x.original_text_spot_checks.length>0).length);
assert.equal(ledger.counts.blocks_without_french,0);
assert.equal(ledger.counts.source_id_links,1306);
assert.equal(drafts.metrics.primary_link_instances,202);
const adam=drafts.cases.find(x=>x.id==="adam-monogenism");
assert.ok(adam.paragraphs[0].text.en.includes("not free to embrace"));
assert.ok(adam.paragraphs[0].text.fr.includes("ne sont pas libres d'embrasser"));
const baq=load("data/learn/biblical-patristic-answers.v1.json");
const justin=baq.answers.find(x=>x.question_id==="BAQ-03");
assert.ok(justin.answer_paragraphs[1].text.includes("remained in some Jewish synagogue copies"));
assert.ok(justin.answer_paragraphs[1].text_fr.includes("certaines copies des synagogues"));
const firstPack=load("data/learn/contemporary-controversies-source-pack.v1.json");
const mariology=firstPack.cases.find(x=>x.id==="CO-REDEMPTRIX");
assert.ok(mariology.short_answer[1].text_fr.includes("toujours inopportun"));
assert.ok(mariology.short_answer[1].original_french_primary_source.url.includes("mater-populi-fidelis_fr.html"));
console.log(JSON.stringify({status:"PASS",records:audit.entries.length,sourceBearingBlocks:blocks,frenchDrafts:fr,
  sourceIdLinks:links,sourceSpotChecks:spotChecks,fullyCertified:fullyCert,publicRelease:false}));
