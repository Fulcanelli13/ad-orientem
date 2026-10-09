import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCatechismGuidedStudy,guidedStudyReleaseApproved} from "../src/learn/catechism-guided-study.js";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const c=read("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json");
const a=read("data/learn/learn-the-faith-certification-001-018.v1.json");
const b=read("data/learn/learn-the-faith-certification-019-054.v1.json");
const w=read("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
assert.equal(c.lessons.length,55);
assert.equal(c.claimLevelReleaseReview.claimCount,181);
assert.equal(c.claimLevelReleaseReview.independentlyVerifiedClaims,0);
assert.equal(c.claimLevelReleaseReview.nativeFrenchClaimsApproved,0);
assert.equal(c.claimLevelReleaseReview.releaseOwnerAuthorized,false);
assert.equal(c.claimLevelReleaseReview.criticalEditionOfAll433HistoricFrenchPrintRequired,false);
assert.equal(guidedStudyReleaseApproved(c),false);
assert.equal(buildCatechismGuidedStudy(c,a,b,w).available,false);
const preview=buildCatechismGuidedStudy(c,a,b,w,{preview:true});
assert.equal(preview.lessons.length,55);
assert.equal(preview.lessons.reduce((x,l)=>x+l.claims.length,0),181);
assert.equal(new Set(preview.lessons.flatMap(x=>x.primaryQuestions)).size,433);
assert.equal(w.entries.length,433);
let pairs=0,revisionCount=0;
const expected=new Set(["LTF-019:3","LTF-023:3","LTF-031:2","LTF-036:1","LTF-040:2","LTF-051:3","LTF-053:3"]);
for(const batch of [a,b])for(const lesson of batch.lessons)for(const [i,claim] of lesson.claims.entries()){
  pairs++;
  assert.ok(claim.en.trim().length>25&&claim.fr.trim().length>25);
  assert.ok(!/ad orientem|this module|ce module|in this app|dans cette application/i.test(claim.en+" "+claim.fr));
  assert.ok(claim.sources.length>0);
  for(const src of claim.sources){
    assert.ok(src.refs.length>0);
    const refs=src.locators?.length?src.locators:[{url:src.url}];
    assert.ok(refs.length>0);
    for(const x of refs)assert.match(x.url,/^https:\/\//);
  }
  const change=claim.practicalEditorialPass20261009;
  if(change){
    revisionCount++;
    assert.equal(expected.delete(lesson.id+":"+(i+1)),true,"Unexpected bilingual source edit");
    assert.equal(change.independentTheologyApproved,false);
    assert.equal(change.nativeFrenchEditorApproved,false);
    assert.equal(change.canonicalSignoff,false);
  }
}
assert.equal(pairs,178);
assert.equal(revisionCount,7);
assert.equal(expected.size,0);
const find=(l,n)=>b.lessons.find(x=>x.id===l).claims[n-1];
assert.ok(find("LTF-019",3).sources[0].refs.includes("PXQ364"));
assert.equal(find("LTF-051",3).sources.at(-1).source,"CCC_1667_1671");
assert.ok(find("LTF-031",2).fr.includes("soumis à la forme canonique"));
assert.ok(find("LTF-036",1).fr.includes("pleine connaissance"));
assert.ok(!find("LTF-036",1).fr.includes("advertance"));
assert.ok(find("LTF-023",3).en.includes("appropriate to that sacrament"));
// Exercise both accepted human-certification routes only with SYNTHETIC fixture values.
const approvedFixture={
  ...c,
  publicationGate:{...c.publicationGate,fullOriginalPassageHumanVerification:true,editorialApproval:true,canonicalReview:true,nativeFrenchEdit:true,publicRouteAdded:true,frenchOriginalCollation:false},
  lessons:c.lessons.map(x=>({...x,publicationApproved:true,humanSourceApproval:true,nativeFrenchApproval:true}))
};
assert.equal(guidedStudyReleaseApproved(approvedFixture),false,"Desk-review-only content must fail closed");
approvedFixture.claimLevelReleaseReview={...c.claimLevelReleaseReview,independentlyVerifiedClaims:181,nativeFrenchClaimsApproved:181,historicalCanonLawReviewApproved:true,originalLanguageEvidenceApproved:true,releaseOwnerAuthorized:true,approvalRecord:"review-ledger/signed-181-claims"};
assert.equal(guidedStudyReleaseApproved(approvedFixture),true,"Claim-bounded review must be a feasible alternative to 433-page critical collation");
approvedFixture.claimLevelReleaseReview={...approvedFixture.claimLevelReleaseReview,nativeFrenchClaimsApproved:180};
assert.equal(guidedStudyReleaseApproved(approvedFixture),false,"A single unapproved French claim blocks release");
console.log(JSON.stringify({status:"PASS",lessons:55,originalQuestions:433,claims:181,correctedClaims:7,fullCriticalEditionNeeded:false,actualPublicationApproved:false}));
