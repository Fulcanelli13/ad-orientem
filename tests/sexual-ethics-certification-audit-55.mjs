import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_IDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
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
assert.equal(report.statistics.direct_registered_source_references,612);
assert.equal(report.statistics.bibliographic_only_rendered,0);
assert.equal(report.statistics.full_certifications,0);
assert.equal(report.statistics.publication_approval,false);
assert.equal(audit.summary.stage_full_text_certified,0);
assert.equal(audit.summary.book_catalog_preview_cases,31);
assert.equal(audit.catalogue_cleanup_v1.remaining_live_book_catalogue_references,0);
assert.equal(report.statistics.excerpt_via_secondary_case_ids.length,3);
const sources={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
let stages=0,refs=0,liveRefs=0;
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
   // The dated certification report is an earlier, deliberately cautious
   // 612-link snapshot. The evolving live eight-stage map now contains 636
   // selected references, some still bibliographic-only. Do not silently
   // rewrite the old historical review or certify the newer links by proxy.
   const actual=paragraphRefsFor(q,"debate",stage.stage);
   assert.deepEqual(actual.map(x=>x[0]),sources[id][stage.stage],
     id+"."+stage.stage+" live source selection drift");
   liveRefs+=actual.length;
   assert.equal(stage.evidence_validation,"REGISTERED_DIRECT_LINK_NO_FULL_PARAGRAPH_PROOF");
   for(const sid of stage.selected_source_ids){
     assert.ok(CSE_SOURCE_MAP[sid]?.canonical_url?.startsWith("https://"),id+" "+sid+" historical link invalid");
     assert.ok(!CSE_SOURCE_MAP[sid].canonical_url.includes("books.google.com"),
       id+" historical certification cited only a bibliographic preview");
     refs++;
   }
   stages++;
 }
}
assert.equal(stages,440);
assert.equal(refs,612);
assert.equal(liveRefs,636,"new live source-map projection must retain its separate current 636-reference gate");
for(const id of ["CSE008","CSE010","CSE145"]){
  const q=report.cases.find(x=>x.id===id);
  assert.equal(q.editorial_status,"ATTRIBUTED_ORIGINAL_AUTHOR_EXCERPTS_VIA_SECONDARY_FULL_BOOK_NOT_REVIEWED");
  assert.ok(report.cases.find(x=>x.id===id).stage_reviews.find(x=>x.stage==="opposition").selected_source_ids.includes("FLETCHER_EXCERPTS"),"historical Fletcher original-excerpt witness not preserved");
}
assert.deepEqual(sources.CSE123.opposition,["ACOG_ABORTION","SINGER_KUHSE1990"]);
assert.equal(sources.CSE012.counter[0],"CURRAN_CDF1986");
assert.ok(!JSON.stringify(sources).includes('"LBM"'));
assert.ok(!JSON.stringify(sources).includes('"SINGER2011"'));
assert.ok(!JSON.stringify(sources).includes('"CURRAN1978"'));
console.log("PASS evidence-audit: 55 debates, all 440 bilingual stages, 612 live non-catalogue links; 0 unjustified complete certifications.");
