import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_MAP,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_QUESTION_MAP,CSE_PUBLIC_QUESTION_MAP,CSE_EDITORIAL_ARCHIVE_IDS} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-last14-public-source-batch-20261009.v1.json","utf8"));
const ids=["CSE083","CSE084","CSE087","CSE088","CSE089","CSE093","CSE094","CSE095","CSE096","CSE141","CSE142","CSE143","CSE145","CSE149"];
assert.equal(doc.summary.public_debates,14);
assert.equal(doc.summary.stages,112);
assert.equal(doc.summary.archived_remaining,3);
assert.equal(doc.summary.full_debate_certifications,0);
assert.deepEqual(doc.cases.map(x=>x.id),ids);
assert.deepEqual([...CSE_EDITORIAL_ARCHIVE_IDS].sort(),["CSE055","CSE056","CSE058"]);
let counts={};let stages=0;
for(const row of doc.cases){
 assert.equal(row.full_debate_certified,false);
 assert.ok(row.scope_summary_en.length>85&&row.scope_summary_fr.length>85);
 assert.ok(row.original_case_anchor in CSE_SOURCE_MAP);
 const q=CSE_QUESTION_MAP[row.id];assert.ok(q&&CSE_PUBLIC_QUESTION_MAP[row.id]&&CSE_DEBATE_MAP[row.id]);
 assert.deepEqual(row.stages.map(x=>x.stage),[...CSE_DEBATE_FIELDS]);
 for(const stage of row.stages){
  assert.equal(stage.original_entire_paragraph_collated,false);
  assert.equal(stage.translation_theological_approval,false);
  assert.equal(stage.full_stage_certified,false);
  assert.ok(stage.finding_en.length>145&&stage.finding_fr.length>145,row.id+"."+stage.stage+" incomplete finding");
  const historical=stage.source_links.map(x=>x.id);
  const live=paragraphRefsFor(q,"debate",stage.stage).map(x=>x[0]);
  // This dated 14-case review is preserved as a source-scope snapshot.
  // Later direct authors/policy/Scripture-context links are separately
  // verified in the current source-map regression, not backdated as reviewed.
  const later={
    "CSE083.opposition":["FARLEY_QUOTED2012","FARLEY_RESPONSE2012"],
    "CSE089.opposition":["FARLEY_QUOTED2012","FARLEY_RESPONSE2012"],
    "CSE094.opposition":["APA_TRANSCARE_FULL2024","APA_TRANSCARE"],
    "CSE094.appeal":["APA_TRANSCARE_FULL2024","APA_TRANSCARE"],
    "CSE094.counter":["APA_TRANSCARE_FULL2024","APA_TRANSCARE"],
    "CSE095.opposition":["APA_TRANSCARE_FULL2024","APA_TRANSCARE"],
    "CSE095.appeal":["APA_TRANSCARE_FULL2024","APA_TRANSCARE"],
    "CSE095.counter":["APA_TRANSCARE_FULL2024","APA_TRANSCARE"],
    "CSE141.catholicCase":["ST151","SACRA","FRANCIS_SPADARO2013"],
    "CSE142.opposition":["FREUD1924_FULL","FREUD1908"],
    "CSE142.appeal":["FREUD1924_FULL","FREUD1908"],
    "CSE142.counter":["FREUD1924_FULL","FREUD1908"],
  };
  assert.deepEqual(live,later[row.id+"."+stage.stage]||historical,row.id+"."+stage.stage+" source drift");
  for(const x of stage.source_links){assert.equal(x.canonical_url,CSE_SOURCE_MAP[x.id].canonical_url);assert.equal(x.canonical_url_fr??null,CSE_SOURCE_MAP[x.id].canonical_url_fr??null);}
  counts[stage.status]=(counts[stage.status]||0)+1;stages++;
 }
}
assert.equal(stages,112);
assert.deepEqual(counts,doc.summary.states);
assert.match(CSE_DEBATE_MAP.CSE083.opposition[0],/Farley/);
assert.match(CSE_DEBATE_MAP.CSE089.opposition[0],/Farley/);
assert.match(CSE_DEBATE_MAP.CSE088.catholicCase[0],/not a psychiatric diagnosis/);
assert.match(CSE_DEBATE_MAP.CSE094.opposition[0],/2024 policy/);
assert.match(CSE_DEBATE_MAP.CSE096.catholicCase[0],/abnormalities/);
assert.match(CSE_DEBATE_MAP.CSE141.opposition[0],/Pope Francis/);
assert.match(CSE_DEBATE_MAP.CSE145.opposition[0],/not a quotation/);
assert.match(CSE_QUESTION_MAP.CSE096.a[0],/§60/);
assert.match(CSE_QUESTION_MAP.CSE095.d[1],/pronoms/);
assert.match(CSE_SOURCE_MAP.FRANCIS_SPADARO2013.canonical_url,/vatican\.va/);
assert.match(CSE_SOURCE_MAP.FARLEY_QUOTED2012.canonical_url_fr,/nota-farley_fr\.html/);
assert.deepEqual(paragraphRefsFor(CSE_QUESTION_MAP.CSE094,"debate","opposition").map(x=>x[0]),["APA_TRANSCARE_FULL2024","APA_TRANSCARE"]);
console.log("PASS last 14 public Sexual Ethics debates: 112 EN/FR stage findings, precise opposing-author and clinical links, 3 archived unchanged, zero false certification.");
