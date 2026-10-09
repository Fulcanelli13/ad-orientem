import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CSE_DEBATE_FIELDS, CSE_DEBATE_MAP } from "../src/learn/sexual-ethics-data/debates.js";
import { CSE_QUESTION_MAP } from "../src/learn/sexual-ethics-data/index.js";
import { CSE_SOURCE_MAP } from "../src/learn/sexual-ethics-data/sources.js";
import { paragraphRefsFor, CSE_CONTEXT_ONLY_POSITION_IDS } from "../src/learn/sexual-ethics-data/provenance.js";

const ledger=JSON.parse(readFileSync("data/learn/sexual-ethics-original-passage-scope-batch-2026-10-09.v4.json","utf8"));
assert.equal(ledger.version,"CSE_ORIGINAL_PASSAGE_SCOPE_BATCH_2026_10_09_V4");
for(const id of ["CSE051","CSE063","CSE064","CSE070"])assert.ok(CSE_CONTEXT_ONLY_POSITION_IDS.includes(id),id+" may not masquerade as an original author position");
assert.equal(ledger.status,"PARTIAL_SOURCE_SCOPE_REVIEW_NOT_EIGHT_STAGE_CERTIFICATION");
assert.deepEqual(ledger.cases.map(x=>x.id),["CSE006","CSE051","CSE061","CSE063","CSE064","CSE070"]);
assert.equal(ledger.summary.debates_reviewed,6);
assert.equal(ledger.summary.stages_reviewed,48);
assert.equal(ledger.summary.source_scope_supported,34);
assert.equal(ledger.summary.synthetic_objections_explicitly_identified,8);
assert.equal(ledger.summary.original_checks_still_open,6);
assert.equal(ledger.summary.full_eight_stage_certifications,0);

let supported=0,illustrative=0,stillOpen=0;
for(const record of ledger.cases){
  assert.equal(record.full_eight_stage_certified,false,record.id+" falsely certified");
  assert.deepEqual(record.stages.map(x=>x.stage),[...CSE_DEBATE_FIELDS]);
  const q=CSE_QUESTION_MAP[record.id],debate=CSE_DEBATE_MAP[record.id];
  assert.ok(q&&debate);
  for(const stage of record.stages){
    assert.ok(stage.claim_scope_en.length>25&&stage.claim_scope_fr.length>25,record.id+"."+stage.stage+" insufficient EN/FR claim scope");
    assert.ok(stage.precise_original_locator.length>10);
    assert.ok(debate[stage.stage][0]&&debate[stage.stage][1]);
    assert.equal(stage.independent_french_editorial_approval,false);
    assert.equal(stage.verbatim_opponent_quote_verified,false);
    assert.deepEqual(stage.selected_sources.map(x=>x.id),paragraphRefsFor(q,"debate",stage.stage).map(x=>x[0]),record.id+"."+stage.stage+" references drift");
    for(const source of stage.selected_sources){
      assert.equal(source.url,CSE_SOURCE_MAP[source.id].canonical_url,record.id+"."+stage.stage+" wrong original URL");
      assert.ok(source.url.startsWith("https://"));
    }
    for(const checked of stage.original_passages_examined){
      assert.ok(stage.selected_sources.some(x=>x.id===checked.id&&x.url===checked.url),record.id+"."+stage.stage+" examined source not cited");
    }
    if(stage.status==="ORIGINAL_PASSAGE_SCOPE_SUPPORTED"){
      supported++;
      assert.ok(stage.original_passages_examined.length>0,"verified without a document");
    }else if(stage.status==="ILLUSTRATIVE_ARGUMENT_NOT_AUTHOR_QUOTE"){
      illustrative++;assert.equal(stage.original_passages_examined.length,0);
    }else if(stage.status==="ORIGINAL_PASSAGE_CHECK_STILL_OPEN"){
      stillOpen++;assert.equal(stage.original_passages_examined.length,0);
    }else throw Error("Unexpected certification state "+stage.status);
  }
}
assert.equal(supported,34);
assert.equal(illustrative,8);
assert.equal(stillOpen,6);
assert.match(CSE_DEBATE_MAP.CSE061.opposition[0],/Charles E\. Curran argues/);
assert.match(CSE_DEBATE_MAP.CSE061.appeal[0],/Curran identifies/);
assert.match(CSE_DEBATE_MAP.CSE006.response[0],/does not automatically warrant civil prohibition/);
console.log("PASS CSE original-passage batch: 6 debates, 48 stages, 34 bounded passage comparisons, 8 illustrative objections, 6 original checks open; zero full certifications.");
