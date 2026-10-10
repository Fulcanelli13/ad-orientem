import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_IDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {cseSourceTargets} from "../src/learn/sexual-ethics-data/source-targets.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";

const report=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-audit.v1.json","utf8"));
const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-source-audit.v1.json","utf8"));
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(report.cases.length,55);
assert.deepEqual(report.cases.map(x=>x.id).sort(),[...CSE_DEBATE_IDS].sort());
assert.equal(report.statistics.stages,440);
assert.equal(report.statistics.direct_registered_source_references,636);
assert.equal(report.statistics.bibliographic_only_rendered,0);
assert.equal(report.statistics.full_certifications,0);
assert.equal(report.statistics.publication_approval,false);
assert.equal(report.reconciliation?.changed_stage_selections,31);
assert.equal(report.reconciliation?.bibliographic_only_rendered,0);
assert.equal(report.reconciliation?.full_eight_stage_certifications,0);
assert.equal(audit.summary.stage_full_text_certified,0);
assert.equal(audit.summary.book_catalog_preview_cases,31);
assert.equal(audit.catalogue_cleanup_v1.remaining_live_book_catalogue_references,0);
assert.deepEqual(report.statistics.excerpt_via_secondary_case_ids,["CSE145"]);
assert.deepEqual(report.statistics.bounded_original_fletcher_1966_case_ids,["CSE008","CSE010"]);
const sources={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
let stages=0,refs=0;
for(const review of report.cases){
 const id=review.id,d=CSE_DEBATE_MAP[id],q=CSE_QUESTION_MAP[id],linked=audit.cases.find(x=>x.id===id);
 assert.ok(d&&q&&linked,id+" not in original corpora");
 assert.equal(review.full_8_stage_certified,false);
 assert.ok(review.doctrinal_evidence_note.length>30);
 assert.ok(CSE_SOURCE_MAP[review.source_id],"no primary normative/empirical anchor "+id);
 assert.equal(linked.certification_audit_v1.fully_certified,false);
 assert.equal(review.stage_reviews.length,8);
 assert.deepEqual(review.stage_reviews.map(x=>x.stage),[...CSE_DEBATE_FIELDS]);
 for(const stage of review.stage_reviews){
   assert.ok(d[stage.stage]?.[0]&&d[stage.stage]?.[1],id+"."+stage.stage+" missing EN/FR");
   assert.ok(d[stage.stage][0].trim().length>=12&&d[stage.stage][1].trim().length>=12,id+"."+stage.stage+" missing substantive bilingual text");
   assert.deepEqual(stage.selected_source_ids,sources[id][stage.stage],id+"."+stage.stage+" source drift");
   const actual=paragraphRefsFor(q,"debate",stage.stage);
   assert.deepEqual(actual.map(x=>x[0]),stage.selected_source_ids);
   assert.equal(stage.evidence_validation,"REGISTERED_DIRECT_LINK_NO_FULL_PARAGRAPH_PROOF");
   for(const [sid,locator] of actual){
     const source=CSE_SOURCE_MAP[sid];
     assert.ok(source?.canonical_url?.startsWith("https://"),id+" "+sid+" URL invalid");
     // Source links must be checked *after* the canonical resolver: Fletcher's
     // index is bibliographic, but bounded 1966 locators are routed to the
     // original digitized text. Unscoped books must never pass as evidence.
     const targets=cseSourceTargets(sid,locator,source);
     assert.ok(targets.length>0,id+" "+sid+" has no rendered citation");
     for(const target of targets){
       assert.match(target.url,/^https:\/\//);
       assert.ok(!["catalogue","unverified"].includes(target.scope),id+" "+sid+" rendered a preview as passage proof");
       if(sid==="FLETCHER1966"){
         assert.equal(target.scope,"digitized-original");
         assert.equal(target.url,source.original_digitized_text_url);
       }
     }
     refs++;
   }
   stages++;
 }
}
assert.equal(stages,440);
assert.equal(refs,636);
for(const id of ["CSE008","CSE010"]){
  const q=report.cases.find(x=>x.id===id);
  assert.equal(q.editorial_status,"BOUNDED_ORIGINAL_FLETCHER_1966_DIGITIZATION_NOT_EIGHT_STAGE_CERTIFIED");
  assert.ok(sources[id].opposition.includes("FLETCHER1966"));
  const x=cseSourceTargets("FLETCHER1966",paragraphRefsFor(CSE_QUESTION_MAP[id],"debate","opposition").find(([sid])=>sid==="FLETCHER1966")[1],CSE_SOURCE_MAP.FLETCHER1966)[0];
  assert.equal(x.scope,"digitized-original");
}
const secondary=report.cases.find(x=>x.id==="CSE145");
assert.equal(secondary.editorial_status,"ATTRIBUTED_ORIGINAL_AUTHOR_EXCERPTS_VIA_SECONDARY_FULL_BOOK_NOT_REVIEWED");
assert.ok(sources.CSE145.opposition.includes("FLETCHER_EXCERPTS"));
assert.deepEqual(sources.CSE123.opposition,["ACOG_ABORTION","SINGER_KUHSE1990"]);
assert.equal(sources.CSE012.counter[0],"CURRAN_CDF1986");
assert.ok(!JSON.stringify(sources).includes('"LBM"'));
assert.ok(!JSON.stringify(sources).includes('"SINGER2011"'));
assert.ok(!JSON.stringify(sources).includes('"CURRAN1978"'));
console.log("PASS evidence-audit: 55 debates, all 440 bilingual stages, 636 live non-catalogue links; 0 unjustified complete certifications.");
