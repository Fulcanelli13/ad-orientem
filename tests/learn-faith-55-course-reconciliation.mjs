import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=x=>JSON.parse(readFileSync(x,"utf8"));
const w=load("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
const old=load("data/learn/learn-the-faith-recovered-54.v1.json");
const a=load("data/learn/learn-the-faith-certification-001-018.v1.json");
const b=load("data/learn/learn-the-faith-certification-019-054.v1.json");
const c=load("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json");
const owners=load("data/learn/content-ownership-registry.v1.json");
const qq=new Map(w.entries.map(x=>[x.q,x]));
assert.equal(old.lessons.length,54);
assert.equal(a.lessons.length,18);
assert.equal(b.lessons.length,36);
assert.equal(c.lessons.length,55);
assert.equal(c.metrics.uniquePrimaryQuestionNumbers,433);
assert.equal(c.metrics.primaryQuestionReferences,433);
assert.equal(c.metrics.historyMapped,54);
assert.equal(c.metrics.proposedAddedLessons,1);
assert.equal(c.metrics.humanApprovedLessons,0);
assert.equal(c.publicationGate.publicRouteAdded,false);
assert.equal(c.publicationGate.frenchOriginalCollation,false);
assert.equal(c.publicationGate.fullOriginalPassageHumanVerification,false);
const n=new Set(),m=new Set();
for(let i=0;i<55;i++){
 const e=c.lessons[i];assert.equal(e.displayLessonId,"LTF-"+String(i+1).padStart(3,"0"));
 assert.equal(e.publicationApproved,false);
 if(i===45){
  assert.equal(e.historicalOriginalLessonId,null);
  assert.equal(e.title.en,"The Precepts of the Church");
  assert.equal(e.teachingClaims.length,3);
  assert.equal(e.sourceScopeAlert.includes("Q226"),true);
 }else{
  const idx=i-(i>45?1:0);
  const oldEntry=old.lessons[idx];
  assert.equal(e.historicalOriginalLessonId,oldEntry.id);
  assert.deepEqual(e.title,oldEntry.title);
  m.add(oldEntry.id);
 }
 for(const x of e.primaryCatechismQuestionNumbers){
  assert.ok(x>=1&&x<=433);
  assert.ok(!n.has(x),"Catechism Q"+x+" assigned to multiple primary lessons");n.add(x);
 }
 for(const x of e.sourceWitnesses){
  const q=+x.ref.slice(-3);
  assert.equal(x.questionStem,qq.get(q)?.q_stem);
  assert.equal(x.sourceUrl,qq.get(q)?.source_file_url);
  assert.ok(x.sourceUrl.includes(w.upstreamCommit));
 }
}
assert.equal(n.size,433);
assert.equal(m.size,54);
assert.equal(c.lessons[46].historicalOriginalLessonId,"LTF-046");
assert.equal(c.lessons[46].title.en,"What prayer is");
assert.ok(owners.learn_the_faith_certification?.canonical_course_review_20261009);
assert.equal(owners.learn_the_faith_certification?.canonical_course_review_20261009?.publicRoute,false);
const presentation=readFileSync("src/learn/presentation.js","utf8");
assert.ok(!presentation.includes('id:"learn.faith"'));
console.log(JSON.stringify({status:"PASS",archivalLessons:m.size,proposedLessonOrder:c.lessons.length,addedCandidate:"Precepts",primaryCatechismQuestions:n.size,published:0}));
