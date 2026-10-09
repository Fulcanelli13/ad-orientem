import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP,CSE_DEBATE_IDS,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {paragraphRefsFor,validateParagraphRefs} from "../src/learn/sexual-ethics-data/provenance.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
const caseMaps={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
const questionMap=new Map(CSE_QUESTIONS.map(q=>[q.id,q]));
const prev=JSON.parse(readFileSync("data/learn/sexual-ethics-catholic-side-original-context-11-20261009.v1.json","utf8"));
const current=JSON.parse(readFileSync("data/learn/sexual-ethics-catholic-side-remaining44-20261009.v1.json","utf8"));
const frozen=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-attribution-55-20261009.v1.json","utf8"));
const evidence=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-evidence.v2.json","utf8"));
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(Object.keys(caseMaps).length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(new Set([...prev.cases,...current.cases].map(x=>x.id)).size,55);
let n=0, catholic=0, opponent=0;
for(const id of CSE_DEBATE_IDS){
 const item=questionMap.get(id);const debate=CSE_DEBATE_MAP[id],stage=caseMaps[id];
 assert.ok(item&&debate&&stage,id+" incomplete canonical stage mapping");
 for(const name of CSE_DEBATE_FIELDS){
  const intended=stage[name];
  assert.ok(Array.isArray(intended)&&intended.length>0,id+" "+name+" missing intended sources");
  const actual=paragraphRefsFor(item,"debate",name);
  assert.equal(actual.length,intended.length,id+" "+name+" stage fallback or duplicate source");
  assert.deepEqual(actual.map(ref=>ref[0]),intended,id+" "+name+" stage source ID mismatch; silent fallback suspected");
  assert.ok(validateParagraphRefs(item,actual),id+" "+name+" invalid source URLs or locators");
  for(const [sourceId,locator] of actual){
   assert.ok(CSE_SOURCE_MAP[sourceId]?.canonical_url,id+" "+name+" unregistered source "+sourceId);
   assert.ok(String(locator).trim().length>0,id+" "+name+" source has no locator");
  }
  assert.ok(debate[name]?.[0]&&debate[name]?.[1],id+" "+name+" missing EN/FR text");
  n++;
  if(["opposition","appeal","counter"].includes(name))opponent++;else catholic++;
 }
}
assert.equal(n,440);
assert.equal(catholic,275);
assert.equal(opponent,165);
for(const id of ["CSE040","CSE125"]){
 const item=questionMap.get(id);
 const refs=paragraphRefsFor(item,"debate","catholicCase").map(x=>x[0]);
 assert.ok(refs.includes("CIC")||refs.includes("USCCB_DIRECT2010"),id+" lacks essential primary source");
}
assert.deepEqual(paragraphRefsFor(questionMap.get("CSE044"),"debate","appeal").map(x=>x[0]),["CIC"]);
assert.equal(CSE_SOURCE_MAP.USCCB_DIRECT2010.canonical_url,"https://www.usccb.org/resources/direct-abortion-statement2010-06-23.pdf");
assert.match(questionMap.get("CSE125").d[0],/2009 CDF clarification expressly contrasts/);
assert.match(questionMap.get("CSE125").d[1],/clarification de la CDF de 2009 distingue expressément/);
assert.match(debateText("CSE125","catholicCase",0),/CDF's 2009 clarification explicitly distinguishes/);
assert.equal(frozen.cases.length,55);
assert.equal(evidence.cases.length,55);
assert.ok(evidence.cases.every(r=>r.full_eight_stage_certified===false));
console.log("PASS all 440 canonical eight-stage citations resolve exactly (275 Catholic-side + 165 opposition-side), no silent fallbacks; 55/55 source records; CDF 2009/USCCB 2010 attribution correct; zero false certifications");
function debateText(id,field,lang){return CSE_DEBATE_MAP[id][field][lang];}
