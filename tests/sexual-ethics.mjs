import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SEXUAL_ETHICS_VERSION,
  SEXUAL_ETHICS_ROUTE,
  SEXUAL_ETHICS_RESEARCH_LEAD,
  CSE_QUESTIONS,
  CSE_SECTIONS,
  CSE_SOURCES,
  CSE_SOURCE_MAP,
  CSE_VALIDATION,
} from "../src/learn/sexual-ethics-data/index.js";

assert.equal(SEXUAL_ETHICS_VERSION,"1.0.0");
assert.equal(SEXUAL_ETHICS_ROUTE,"learn.sexual_ethics");
assert.equal(SEXUAL_ETHICS_RESEARCH_LEAD,"LBM");
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_SECTIONS.length,15);
assert.equal(CSE_VALIDATION.ok,true,CSE_VALIDATION.errors.join("\n"));
assert.deepEqual(CSE_VALIDATION.depthCounts,{STANDARD:100,EXPANDED:25,DEBATE:25});

const ids=new Set();
for(const [index,item] of CSE_QUESTIONS.entries()){
  const n=index+1;
  const id=`CSE${String(n).padStart(3,"0")}`;
  assert.equal(item.id,id);
  assert.equal(ids.has(id),false,id);
  ids.add(id);
  assert.ok(item.q[0]&&item.q[1],`${id}: bilingual question`);
  assert.ok(item.a[0]&&item.a[1],`${id}: bilingual answer`);
  if(item.depth!=="STANDARD")assert.ok(item.d?.[0]&&item.d?.[1],`${id}: deeper explanation`);
  assert.ok(item.refs.length>0,`${id}: sources`);
  for(const [sourceId,locator] of item.refs){
    assert.ok(CSE_SOURCE_MAP[sourceId],`${id}: ${sourceId}`);
    assert.ok(locator,`${id}: source locator`);
  }
}
assert.equal(ids.size,150);
assert.equal(CSE_SOURCES.some(source=>source.id==="LBM"&&source.role==="argument_lead"),true);
assert.equal(CSE_SECTIONS.every(section=>CSE_QUESTIONS.filter(item=>item.section===section.id).length===10),true);

const presentation=readFileSync("src/learn/presentation.js","utf8");
const owner=readFileSync("src/learn/browser-entry.js","utf8");
const runtime=readFileSync("src/learn/sexual-ethics.js","utf8");
assert.match(presentation,/id:"learn\.sexual_ethics"/);
assert.match(owner,/installSexualEthicsModule/);
assert.match(owner,/ensureSexualEthicsRegistry/);
assert.match(owner,/AO_SEXUAL_ETHICS_V1/);
assert.match(runtime,/Search all 150 questions/);
assert.match(runtime,/Sources & provenance/);
assert.match(runtime,/Lawler · Boyle · May/);

console.log(JSON.stringify({
  version:SEXUAL_ETHICS_VERSION,
  route:SEXUAL_ETHICS_ROUTE,
  questions:CSE_QUESTIONS.length,
  sections:CSE_SECTIONS.length,
  sources:CSE_SOURCES.length,
  depth:CSE_VALIDATION.depthCounts,
  bilingual:true,
  validation:"PASS",
},null,2));
