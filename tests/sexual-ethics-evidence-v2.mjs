import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP,CSE_DEBATE_FIELDS,CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const evidence=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-evidence.v2.json","utf8"));
const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-audit.v1.json","utf8"));
const opponent=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-source-audit.v1.json","utf8"));
assert.equal(evidence.version,"CSE_CERTIFICATION_EVIDENCE_V2");
assert.equal(evidence.cases.length,55);
assert.equal(evidence.summary.total_stages,440);
assert.equal(evidence.summary.substantive_case_reviews,55);
assert.equal(evidence.summary.individually_assessed_stages,440);
assert.equal(evidence.summary.full_case_certifications,0);
assert.equal(audit.statistics.full_certifications,0);
assert.equal(audit.statistics.publication_approval,false);
assert.equal(opponent.summary.stage_full_text_certified,0);
assert.deepEqual(evidence.cases.map(c=>c.id).sort(),[...CSE_DEBATE_IDS].sort());
const enriched=new Set(audit.linked_evidence_v2.reviewed_cases);
assert.equal(enriched.size,55);
let stageCount=0,individuallyReviewed=0;
for(const row of evidence.cases){
  const question=CSE_QUESTION_MAP[row.id],debate=CSE_DEBATE_MAP[row.id];
  assert.ok(question&&debate);
  assert.equal(row.full_eight_stage_certified,false);
  assert.equal(row.stages.length,8);
  assert.deepEqual(row.stages.map(s=>s.stage),[...CSE_DEBATE_FIELDS]);
  for(const stage of row.stages){
    assert.deepEqual(stage.selected_source_ids,paragraphRefsFor(question,"debate",stage.stage).map(x=>x[0]),row.id+"."+stage.stage+" stage evidence drift");
    assert.ok(debate[stage.stage][0]&&debate[stage.stage][1]);
    assert.equal(stage.author_quote_verified,false);
    assert.equal(stage.exact_full_passage_collated,false);
    for(const id of stage.selected_source_ids){
      assert.ok(CSE_SOURCE_MAP[id]?.canonical_url?.startsWith("https://"));
    }
    if(stage.explanation_en){
      assert.ok(stage.explanation_fr?.length>=20,row.id+"."+stage.stage+" missing French reason");
      assert.ok(enriched.has(row.id));
      individuallyReviewed++;
    }
    stageCount++;
  }
}
assert.equal(stageCount,440);
assert.equal(individuallyReviewed,440);
for(const key of ["VS","HV","CASTI","PH","DP","DONUMV","ASRM_GC","ACOG_ECTOPIC","ABORTCLAR"])
 assert.ok(evidence.sources_checked[key]?.url?.startsWith("https://"));
assert.match(CSE_DEBATE_MAP.CSE101.catholicCase[0],/Donum Vitae II\.B\.5 rejects homologous IVF/);
assert.match(CSE_DEBATE_MAP.CSE101.catholicCase[1],/Donum Vitae \(II\.B\.5\) rejette la FIV homologue/);
assert.match(CSE_DEBATE_MAP.CSE104.appeal[0],/unpaid arrangements can still involve family pressure/);
assert.match(CSE_DEBATE_MAP.CSE104.appeal[1],/pressions familiales/);
const verifiedCounts={};
for(const dossier of evidence.cases)for(const stage of dossier.stages)
  verifiedCounts[stage.assessment]=(verifiedCounts[stage.assessment]||0)+1;
assert.deepEqual(evidence.summary.stage_verdict_counts,verifiedCounts,
  "Frozen 440-stage summary must describe actual per-stage source verdicts");
assert.equal(verifiedCounts.DIGITIZED_ORIGINAL_AUTHOR_PASSAGE_BOUNDED,6,
  "Fletcher primary-source passage upgrades must remain bounded");
assert.equal(evidence.summary.stage_verdict_counts.DIRECT_ORIGINAL_CLINICAL_CONTEXT,2);
assert.equal(evidence.summary.stage_verdict_counts.ORIGINAL_PASSAGE_COLLATION_STILL_REQUIRED,1);
console.log("PASS: 55 bilingual debate records; 440 individual stage-semantic assessments; IVF/surrogacy corrections; ZERO full source-text certifications.");
