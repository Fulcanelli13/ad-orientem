import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP,CSE_PUBLIC_QUESTION_MAP,CSE_EDITORIAL_ARCHIVE_IDS,CSE_QUESTIONS,CSE_PUBLIC_QUESTIONS} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_MAP,CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const d=JSON.parse(readFileSync("data/learn/sexual-ethics-archived-three-source-batch-20261009.v1.json","utf8"));
const ids=["CSE055","CSE056","CSE058"];
assert.deepEqual(d.cases.map(x=>x.id),ids);
assert.deepEqual([...CSE_EDITORIAL_ARCHIVE_IDS],ids);
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_PUBLIC_QUESTIONS.length,147);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(d.summary.archived_debates,3);
assert.equal(d.summary.archived_stages,24);
assert.equal(d.summary.full_certifications,0);
const totals={};let stages=0;
for(const row of d.cases){
 assert.equal(row.public,false);assert.equal(row.full_case_certified,false);
 assert.ok(CSE_QUESTION_MAP[row.id]&&CSE_DEBATE_MAP[row.id]);
 assert.equal(CSE_PUBLIC_QUESTION_MAP[row.id],undefined);
 assert.ok(row.summary_en.length>170&&row.summary_fr.length>170);
 assert.deepEqual(row.stages.map(x=>x.stage),[...CSE_DEBATE_FIELDS]);
 for(const x of row.stages){
  assert.equal(x.original_full_paragraph_reviewed,false);
  assert.equal(x.fully_certified_en_fr,false);
  assert.equal(x.independent_approval,false);
  assert.ok(x.finding_en.length>200&&x.finding_fr.length>200);
  assert.deepEqual(x.source_refs.map(x=>x.id),paragraphRefsFor(CSE_QUESTION_MAP[row.id],"debate",x.stage).map(x=>x[0]));
  for(const r of x.source_refs){assert.equal(r.canonical_url,CSE_SOURCE_MAP[r.id].canonical_url);assert.equal(r.canonical_url_fr??null,CSE_SOURCE_MAP[r.id].canonical_url_fr??null);}
  totals[x.status]=(totals[x.status]||0)+1;stages++;
 }
}
assert.equal(stages,24);assert.deepEqual(totals,d.summary.source_status_counts);
console.log("PASS archived Sexual Ethics: 3 debates / 24 sources stages, no public exposure, original/clinical evidence clearly qualified, 55 historical debates preserved.");
