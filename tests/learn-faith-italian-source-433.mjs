import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCatechismGuidedStudy} from "../src/learn/catechism-guided-study.js";
const load=path=>JSON.parse(readFileSync(path,"utf8"));
const it=load("data/learn/ltfaith-pius-x-it-witness-index.v1.json");
const en=load("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
const a=load("data/learn/learn-the-faith-certification-001-018.v1.json");
const b=load("data/learn/learn-the-faith-certification-019-054.v1.json");
const c=load("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json");
assert.equal(it.questionCount,433);assert.equal(it.entries.length,433);
assert.equal(it.sectionCount,21);
assert.equal(it.originalPrintedFacsimileCollated,false);
assert.equal(it.humanDoctrinalApproved,false);
const im=new Map(it.entries.map(x=>[x.q,x]));
assert.equal(im.size,433);
for(const e of en.entries){
 const x=im.get(e.q);
 assert.equal(x?.file,e.file);
 assert.ok(x.italianSourceFileUrl.includes(it.source.split("/tree/")[1].split("/")[0]));
 assert.ok(x.italianSourceFileUrl.includes("/pius-x-catechism/it/"));
}
let scoped=0,remaining=0,nonPius=0,englishItalianPairs=0;
for(const batch of [a,b])for(const l of batch.lessons)for(const claim of l.claims){
 if(batch===a){scoped++;assert.equal(claim.witnessPassageReview.italian1912TranscriptionRead,true);}
 else remaining++;
 for(const source of claim.sources){
  if(source.source!=="PIUS_X_1912"){nonPius++;continue;}
  assert.equal(source.italianOriginalLanguageLocators.length,source.refs.length);
  for(let i=0;i<source.refs.length;i++){
   const n=Number(source.refs[i].slice(-3));
   assert.equal(source.italianOriginalLanguageLocators[i].url,im.get(n).italianSourceFileUrl);
   assert.equal(source.italianOriginalLanguageLocators[i].ref,`PX1912-Q${String(n).padStart(3,"0")}`);
   englishItalianPairs++;
  }
 }
}
assert.equal(scoped,56);assert.equal(remaining,122);assert.equal(nonPius,16);
for(const lesson of c.lessons){
 for(const q of lesson.sourceWitnesses){
  assert.equal(q.italianOriginalLanguageUrl,im.get(+q.ref.slice(-3)).italianSourceFileUrl);
 }
}
assert.equal(c.metrics.originalLanguageItalianQuestionLocators,433);
assert.equal(c.publicationGate.italianOriginalPrintedEditionCollated,false);
assert.equal(c.publicationGate.nativeFrenchEdit,false);
assert.equal(c.lessons[45].teachingClaims.length,3);
for(const claim of c.lessons[45].teachingClaims){
 assert.ok(claim.sourceOriginalItalianUrlList?.length);
 for(const url of claim.sourceOriginalItalianUrlList) assert.ok(url.includes("/pius-x-catechism/it/"));
}
const draft=buildCatechismGuidedStudy(c,a,b,en,{preview:true});
assert.equal(draft.lessons.length,55);
assert.equal(draft.lessons.reduce((n,l)=>n+l.claims.length,0),181);
let originalLinks=0;
for(const lesson of draft.lessons)for(const claim of lesson.claims)for(const source of claim.sources){
 if(source.originalLanguageUrl){
  assert.ok(source.originalLanguageUrl.includes("/pius-x-catechism/it/"));
  originalLinks++;
 }
}
assert.ok(originalLinks>400);
assert.equal(buildCatechismGuidedStudy(c,a,b,en).available,false);
assert.equal(b.batchFindings.bilingualSourceScopeRewrites20261009.count,4);
for(const id of ["LTF-029","LTF-031","LTF-042","LTF-054"]) {
 const lesson=b.lessons.find(l=>l.id===id),edited=lesson.claims.filter(x=>x.passageReview20261009);
 assert.equal(edited.length,1,id+" lost source-scope correction");
 assert.equal(edited[0].passageReview20261009.publicationApproved,false);
}
assert.ok(!b.lessons.find(l=>l.id==="LTF-042").claims[2].en.includes("require their own careful application"));
assert.ok(!b.lessons.find(l=>l.id==="LTF-054").claims[3].en.includes("dedicated Serious Illness"));

console.log(JSON.stringify({status:"PASS",questions:433,sections:21,lessons:55,claims:181,sourceScopedClaims:56,locatorOnlyClaims:125,englishItalianPairs,originalLinks,publicationApproved:false}));
