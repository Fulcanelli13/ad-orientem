import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCatechismGuidedStudy} from "../src/learn/catechism-guided-study.js";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const first=load("data/learn/learn-the-faith-certification-001-018.v1.json");
const second=load("data/learn/learn-the-faith-certification-019-054.v1.json");
const crosswalk=load("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json");
const english=load("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
const italian=load("data/learn/ltfaith-pius-x-it-witness-index.v1.json");
const witness=new Map(italian.entries.map(x=>[x.q,x]));
assert.equal(witness.size,433);
assert.equal(first.lessons.reduce((n,l)=>n+l.claims.length,0),56);
assert.equal(second.lessons.reduce((n,l)=>n+l.claims.length,0),122);
assert.equal(second.batchFindings.sourceScopeDeskReview20261009.reviewed,122);
assert.equal(crosswalk.metrics.sourceScopeDeskReviewedClaims,181);
assert.equal(crosswalk.metrics.sourceScopeDeskReviewedLessonCount,55);
let assessed=0,flagged=0,italianCitations=0,external=0;
const parent=new Map(crosswalk.lessons.map(l=>[l.historicalOriginalLessonId,l]));
for(const lesson of second.lessons){
 assert.ok(parent.has(lesson.id),"Historical lesson lost primary display owner: "+lesson.id);
 for(const [n,claim] of lesson.claims.entries()){
  const v=claim.sourceScopeDeskReview;
  assert.ok(v,lesson.id+" "+n+" missing individual scope assessment");
  assert.match(v.status,/^SOURCE_SCOPE_RECONCILED/);
  assert.equal(v.independentDoctrinalApproved,false);
  assert.equal(v.original1912PrintedFacsimileVerified,false);
  assert.equal(v.nativeFrenchEditorApproved,false);
  assert.equal(v.canonicalSpecialistApproved,false);
  assert.equal(v.humanPublicationApproved,false);
  assert.ok(claim.en&&claim.fr);
  assessed++;
  if(v.reviewFlags.length)flagged++;
  const expectedRefs=claim.sources.filter(s=>s.source==="PIUS_X_1912").flatMap(s=>s.refs.map(ref=>"PX1912-Q"+ref.slice(-3)));
  assert.deepEqual(v.italianQuestionRefs,[...new Set(expectedRefs)]);
  for(const ref of expectedRefs){
    const actual=witness.get(Number(ref.slice(-3)));
    assert.ok(actual,ref);
    assert.ok(v.originalLanguageLinks.includes(actual.italianSourceFileUrl),lesson.id+" "+ref);
    italianCitations++;
  }
  for(const s of claim.sources.filter(s=>s.source!=="PIUS_X_1912")){
    assert.equal(s.url,second.supplementarySourceRegistry[s.source]?.url,"unknown external authority "+s.source);
    assert.ok(v.supplementaryAuthorityLinks.includes(s.url));
    external++;
  }
 }
}
assert.equal(assessed,122);
assert.equal(flagged,31);
assert.equal(second.batchFindings.sourceScopeDeskReview20261009.bilingualTextRevisions,4);
assert.equal(second.batchFindings.sourceScopeDeskReview20261009.numberedItalianRefs,italianCitations);
assert.equal(second.batchFindings.sourceScopeDeskReview20261009.supplementaryAuthorityReferences,external);
for(const [lesson,n,key] of [["LTF-030",2,"CCC_1554_ORDERS"],["LTF-049",2,"PIUS_IX_INEFFABILIS_DEUS"],["LTF-052",2,"CIC_1983_PENANCE"]]){
 const row=second.lessons.find(l=>l.id===lesson).claims[n-1];
 assert.ok(row.sources.some(s=>s.source===key));
}
const precepts=crosswalk.lessons[45];
assert.equal(precepts.displayLessonId,"LTF-046");
assert.equal(precepts.historicalOriginalLessonId,null);
assert.equal(precepts.teachingClaims.length,3);
for(const claim of precepts.teachingClaims){
 assert.equal(claim.sourceScopeDeskReview.status,"SOURCE_SCOPE_RECONCILED_QUALIFIED");
 assert.equal(claim.sourceScopeDeskReview.humanPublicationApproved,false);
 assert.equal(claim.sourceScopeDeskReview.originalPrintedFacsimileVerified,false);
 assert.ok(claim.sourceScopeDeskReview.italianQuestionRefs.length>0);
 for(const ref of claim.sourceScopeDeskReview.italianQuestionRefs) assert.ok(witness.has(Number(ref.slice(-3))));
}
assert.equal(crosswalk.lessons[46].historicalOriginalLessonId,"LTF-046");
const guided=buildCatechismGuidedStudy(crosswalk,first,second,english,{preview:true});
assert.equal(guided.lessons.length,55);
assert.equal(guided.lessons.reduce((n,l)=>n+l.claims.length,0),181);
assert.equal(Object.keys(guided.questionToLesson).length,433);
assert.equal(buildCatechismGuidedStudy(crosswalk,first,second,english).available,false);
for(const k of ["fullOriginalPassageHumanVerification","editorialApproval","canonicalReview","frenchOriginalCollation","nativeFrenchEdit","publicRouteAdded"])assert.equal(crosswalk.publicationGate[k],false);
assert.equal(second.reviewGate.publicationApproved,false);
console.log(JSON.stringify({status:"PASS",claimsDeskReviewed:181,claimsInThisPass:125,claimsInRemainingHistoricalLessons:assessed,precepts:3,flags:flagged+3,italianQACitations:italianCitations,externalAuthorities:external,public:false}));
