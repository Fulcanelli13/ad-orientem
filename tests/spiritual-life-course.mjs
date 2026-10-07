import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const sot=JSON.parse(readFileSync("data/learn/spiritual-life-sot.v1.json","utf8"));
const course=JSON.parse(readFileSync("data/learn/spiritual-life-course.v1.json","utf8"));

assert.equal(course.version,"SPIRITUAL_LIFE_COURSE_V1");
assert.equal(course.status,"BILINGUAL_CONTENT_READY_NOT_PUBLISHED");
assert.equal(course.future_route,"learn.spiritual_life");
assert.equal(course.lesson_count,14);
assert.deepEqual(course.language_parity,["en","fr"]);
assert.equal(course.exercise_policy,"NON_SCORED_APPLICATION_AND_UNDERSTANDING_ONLY");
assert.equal(LEARN_MODULE_IDS.includes("learn.spiritual_life"),false,"Spiritual Life published before runtime/final audit gate");

const claimSet=new Set(sot.curriculum.stages.flatMap(stage=>stage.claims.map(claim=>claim.id)));
const used=new Set();
assert.deepEqual(course.lessons.map(x=>x.id),Array.from({length:14},(_,i)=>"SL"+String(i+1).padStart(2,"0")));

for(const lesson of course.lessons){
  assert.ok(lesson.title?.en&&lesson.title?.fr,lesson.id+" lost bilingual title");
  assert.ok(lesson.summary?.en&&lesson.summary?.fr,lesson.id+" lost bilingual summary");
  assert.equal(lesson.blocks.length,3,lesson.id+" should keep the frozen three-block lesson rhythm");
  for(const block of lesson.blocks){
    assert.ok(block.h?.en&&block.h?.fr,lesson.id+" block lost bilingual heading");
    assert.ok(block.t?.en&&block.t?.fr,lesson.id+" block lost bilingual text");
    assert.ok(block.claims.length>0,lesson.id+" block lost provenance");
    for(const id of block.claims){assert.ok(claimSet.has(id),lesson.id+" unresolved claim "+id);used.add(id);}
  }
  assert.ok(lesson.practice?.type,lesson.id+" lost practice");
  assert.ok(lesson.practice?.prompt?.en&&lesson.practice?.prompt?.fr,lesson.id+" practice lost bilingual prompt");
  assert.ok(lesson.practice?.guidance?.en&&lesson.practice?.guidance?.fr,lesson.id+" practice lost bilingual guidance");
  assert.ok(lesson.practice.claims.length>0,lesson.id+" practice lost provenance");
  for(const id of lesson.practice.claims){assert.ok(claimSet.has(id),lesson.id+" practice unresolved claim "+id);used.add(id);}
  for(const handoff of lesson.handoffs||[]){
    assert.ok(handoff.surface&&handoff.target&&handoff.reason,lesson.id+" malformed owner handoff");
    assert.notEqual(handoff.target,"learn.catholic_life",lesson.id+" points back to retired Catholic Life");
  }
}

assert.equal(used.size,76,"not every Spiritual Life SOT claim is represented in user-facing lesson copy");
assert.equal([...claimSet].filter(id=>!used.has(id)).length,0);

assert.equal(sot.publication_gates.research_complete,true);
assert.equal(sot.publication_gates.all_claims_sourced,true);
assert.equal(sot.publication_gates.english_claim_copy_ready,true);
assert.equal(sot.publication_gates.french_parity_ready,true);
assert.equal(sot.publication_gates.prayer_owner_handoffs_mapped,true);
assert.equal(sot.publication_gates.ui_runtime_ready,false);
assert.equal(sot.publication_gates.final_content_audit_ready,true);

const allCopy=JSON.stringify(course).toLowerCase();
for(const forbidden of ["holiness score","spiritual score","streak","learn.catholic_life"]){
  assert.equal(allCopy.includes(forbidden),false,"forbidden Spiritual Life product concept leaked into course: "+forbidden);
}
assert.match(course.lessons.find(x=>x.id==="SL04").summary.en,/one traditional|traditional method/i);
assert.match(course.lessons.find(x=>x.id==="SL07").blocks.map(x=>x.t.en).join(" "),/never the spiritual goal|score/i);
assert.match(course.lessons.find(x=>x.id==="SL09").blocks.map(x=>x.t.en).join(" "),/not the property of one modern movement/i);
assert.match(course.lessons.find(x=>x.id==="SL14").blocks.map(x=>x.t.en).join(" "),/less dependent on the app/i);

console.log(JSON.stringify({
  lessons:course.lessons.length,
  teachingBlocks:course.lessons.reduce((n,l)=>n+l.blocks.length,0),
  practices:course.lessons.length,
  claimsRepresented:used.size,
  englishReady:true,
  frenchReady:true,
  routePublished:false
},null,2));
