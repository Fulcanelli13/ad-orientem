import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createSpiritualLifeRuntime} from "../src/learn/spiritual-life.js";
import {
 SPIRITUAL_LIFE_LESSONS,SPIRITUAL_LIFE_CLAIM_MAP,SPIRITUAL_LIFE_SOURCE_MAP
} from "../src/learn/spiritual-life-data.js";

function fakeWindow(lang="en"){
 const nodes=new Map();
 const body={classList:{add(){},remove(){}},append(el){nodes.set(el.id,el);}};
 const document={
  documentElement:{lang},body,
  getElementById(id){return nodes.get(id)||null;},
  createElement(){
   return {id:"",dataset:{},innerHTML:"",hidden:false,setAttribute(){},removeAttribute(){},
    addEventListener(){},scrollTo(){},querySelector(){return null;},
    remove(){nodes.delete(this.id);}};
  }
 };
 return {document,AO_RUNTIME_V8:{store:{getState:()=>({language:lang})}}};
}
let totalLessonSections=0;
const seenClaims=new Set();
for(const lang of ["en","fr"]){
 const win=fakeWindow(lang);
 const runtime=createSpiritualLifeRuntime(win);
 for(const lesson of SPIRITUAL_LIFE_LESSONS){
  assert.equal(runtime.open({lessonId:lesson.id}),true);
  const markup=win.document.getElementById("ao-spiritual-life-root")?.innerHTML;
  assert.ok(markup,lesson.id+" missing lesson content");
  const start=markup.indexOf('<main class="aoSLWrap">');
  const disclosure=markup.indexOf('<details class="aoSLSources" data-ao-sl-source-disclosure');
  assert.ok(start>0 && disclosure>start,lesson.id+" missing source drawer");
  const defaultContent=markup.slice(start,disclosure);
  assert.ok(!defaultContent.includes("data-ao-sl-claim-sources="),
   lesson.id+" visible teaching block still contains inline source links");
  const inside=markup.slice(disclosure);
  const cited=[...new Set([...lesson.blocks.flatMap(b=>b.claims),...lesson.practice.claims]
   .flatMap(id=>SPIRITUAL_LIFE_CLAIM_MAP[id].source_ids))];
  const index=inside.split('<details class="aoSLWorks">')[0];
  assert.match(index,/<ul class="aoSLSourceIndex" data-ao-sl-source-index>/,
   lesson.id+" first-tap source list missing");
  assert.ok(index.includes(lang==="fr"?"Sources citées":"Cited sources"),
   lesson.id+" missing bilingual cited-source heading");
  assert.ok(inside.includes("<summary>Sources · "+cited.length+"</summary>"));
  assert.equal((index.match(/data-ao-sl-cited-source=/g)||[]).length,cited.length,
   lesson.id+" cited works not unique at first tap");
  for(const id of cited){
   assert.equal((index.match(new RegExp('data-ao-sl-cited-source="'+id+'"','g'))||[]).length,1,
    lesson.id+" source missing or duplicated in index: "+id);
  }
  const curated=[...index.matchAll(/data-ao-sl-curated-reading="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(curated.length<=4&&curated.every(id=>cited.includes(id)),
   lesson.id+" promoted an uncited work as further reading");
  if(lesson.id==="SL01")assert.deepEqual(curated,["SL-FRANCIS-SALES-DEVOUT-LIFE"]);
  if(lesson.id==="SL11"||lesson.id==="SL13")assert.equal(curated.length,0);
  assert.match(index,lang==="fr"?/Ces liens ne vérifient pas/:/Document links do not by themselves verify/);
  assert.ok(!index.includes('class="aoSLFurtherReading"'),"Duplicate further-reading bibliography returned");
  assert.ok(inside.includes(lang==="fr"?"Sources par section":"Evidence by section"));
  assert.ok(inside.includes('<details class="aoSLEvidence">'));
  assert.equal((inside.match(/data-ao-sl-evidence-block=/g)||[]).length,4);
  assert.equal((inside.match(/data-ao-sl-claim-sources=/g)||[]).length,4,
   lesson.id+" lost per-block citations");
  for(const block of lesson.blocks){
   for(const claimId of block.claims){
    seenClaims.add(claimId);
    for(const sourceId of SPIRITUAL_LIFE_CLAIM_MAP[claimId].source_ids){
     assert.ok(SPIRITUAL_LIFE_SOURCE_MAP[sourceId],claimId+" source lost");
    }
   }
  }
  for(const claimId of lesson.practice.claims)seenClaims.add(claimId);
  totalLessonSections++;
 }
 runtime.close();
}
assert.equal(SPIRITUAL_LIFE_LESSONS.length,14);
assert.equal(totalLessonSections,28);
assert.equal(seenClaims.size,76);
assert.equal(Object.keys(SPIRITUAL_LIFE_SOURCE_MAP).length,12);
const source=readFileSync("src/learn/spiritual-life.js","utf8");
assert.ok(source.includes("resolveSpiritualLifeSourceTarget"),"Certified passage target routing lost");
assert.ok(source.includes("lessonEvidenceMarkup(win,lesson)"));
console.log("PASS 14 Spiritual Life lessons in EN/FR: 56 folded evidence sections, 76 claims and 12 sources retained.");
