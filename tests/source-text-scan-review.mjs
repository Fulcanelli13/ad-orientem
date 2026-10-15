import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validatePrintPagePlan,buildScanReviewQueue,prepareReviewedScanDocument}
 from "../src/source-text/scan-review.js";
import {packageSourceDocument} from "../src/source-text/package.js";
import {createSourceTextReader} from "../src/source-text/reader.js";
const json=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const plan=json("data/source-text/fortescue-1908-print-page-plan.v1.json");
const sample=json("data/source-text/fortescue-1908-print-excerpts.v1.json");
const witness=json("data/source-text/witness-profiles.v1.json").profiles
 .find(p=>p.id===sample.work.witnessId);
assert.equal(validatePrintPagePlan(plan).size,13);
assert.equal(plan.scanEdition,"1913_SPECIAL_EDITION");
assert.equal(plan.editionId,"ED-CE1913-V3-KOC-SPECIAL");
assert.deepEqual(plan.pagesVisuallyComparedForShortExcerpts,[255,256,257]);
const ocr=json("data/source-text/fortescue-1913-p257-ocr-triage.v1.json");
assert.equal(ocr.editionId,plan.editionId);
assert.equal(ocr.cases.length,6);
assert.equal(ocr.uncertaintyCount,1);
assert.ok(ocr.cases.every(c=>c.automaticSubstitutionAllowed===false&&c.humanRecheckRequired===true));

assert.equal(plan.pages[0].printedPage,255);
assert.equal(plan.pages.at(-1).printedPage,267);
assert.equal(plan.pages[0].scanPage,303);
assert.equal(plan.pages.at(-1).scanPage,315);
assert.equal(plan.approvedFullPageCount,0);
assert.ok(plan.pages.every(p=>p.fullPageTextApproved===false));
const candidates=[];
for(let page=255;page<=267;page++){
 for(let j=1;j<=25;j++){
  const cross=page<267&&j===25;
  candidates.push({id:"SYN-"+page+"-"+j,locator:"p"+page+":s"+String(j).padStart(3,"0"),
   pages:cross?[page,page+1]:[page],kind:j%17===0?"footnote":"body",
   column:j%13===0?"unknown":j%2?"left":"right",
   articleStatus:j%19===0?"UNKNOWN":"CONFIRMED_IN_SCOPE",
   text:j%23===0?"Synthetic OCR contains dou-\nbt about a word.":
    j%19===0?"Synthetic replacement \uFFFD character.":"Synthetic staging line "+page+"."+j+" — not from Fortescue."});
 }
}
const queue=buildScanReviewQueue({plan,candidates});
assert.equal(queue.candidateCount,325);
assert.equal(queue.approvalCount,0);
assert.equal(queue.packageEligible,false);
assert.equal(queue.items.length,325);
assert.ok(queue.flagCounts.OCR_LINE_END_HYPHENATION>0);
assert.ok(queue.flagCounts.OCR_CHARACTER_UNCERTAINTY>0);
assert.ok(queue.flagCounts.CROSS_PAGE_CONTINUATION_REVIEW>0);
assert.ok(queue.flagCounts.NON_BODY_MATERIAL>0);
assert.ok(queue.flagCounts.ARTICLE_BOUNDARY_REVIEW>0);
assert.ok(queue.flagCounts.COLUMN_ORDER_UNCERTAIN>0);
assert.ok(!JSON.stringify(queue).includes("Synthetic staging line"),
 "OCR text must not leak into review metadata");
assert.ok(queue.items.every(x=>x.status==="HELD_FOR_INDEPENDENT_PRINT_COLLATION"));
assert.throws(()=>buildScanReviewQueue({plan,candidates:[candidates[0],candidates[0]]}),/DUPLICATE/);
assert.throws(()=>buildScanReviewQueue({plan,candidates:[{...candidates[0],pages:[254]}]}),/OUTSIDE_PAGE_PLAN/);
assert.throws(()=>buildScanReviewQueue({plan,candidates:[{...candidates[0],pages:[255,257]}]}),/NONCONTIGUOUS_SPAN/);
assert.throws(()=>validatePrintPagePlan({...plan,pages:[plan.pages[0],plan.pages[2]]}),/SEQUENCE_GAP/);
assert.throws(()=>validatePrintPagePlan({...plan,pages:[{...plan.pages[0],url:"https://fake.invalid/303"}]}),/PAGE_INVALID/);
assert.throws(()=>validatePrintPagePlan({...plan,scanPageBaseUrl:"http://example.invalid"}),/PLAN_INVALID/);

// Only existing 1913 scanned excerpt paragraphs qualify for real-source
// excerpt packaging; no bulk OCR or synthetic text is promoted.
const realCandidates=sample.records.map((r,i)=>({id:"PRINT-"+(i+1),
 locator:r.locator,pages:[r.printedPage],kind:"body",column:r.column??"right",sourceExtent:r.sourceExtent,
 articleStatus:"CONFIRMED_IN_SCOPE",text:r.text}));
const realQueue=buildScanReviewQueue({plan,candidates:realCandidates});
const approvals=realQueue.items.map((item,i)=>({
 candidateId:item.id,status:"PRELIMINARY_IMAGE_COLLATED",
 reviewerId:"AO-TECHNICAL-REVIEW-20261015",reviewEvidenceId:sample.review.collationReviewId,
 approvedText:sample.records[i].text,
 resolvedFlags:item.flags,reviewedScanUrls:item.scanImages
}));
const prepared=prepareReviewedScanDocument({
 plan,candidates:realCandidates,approvals,profile:witness,work:sample.work,
 review:sample.review,heading:sample.heading});
assert.equal(prepared.selectedCount,4);
assert.equal(prepared.document.passages[3].sourceExtent,"PARAGRAPH_OPENING_FRAGMENT");
assert.equal(prepared.heldCount,0);
assert.equal(prepared.productionPublishApproved,false);
assert.equal(prepared.document.passages[0].sourcePages[0].printedPage,255);
const bundled=packageSourceDocument(prepared.document,{chunkSize:1});
assert.equal(bundled.manifest.passages[0].sourcePages[0].scanPage,303);
let requests=0;
const reader=createSourceTextReader({manifest:bundled.manifest,loadChunk:async p=>{
 requests++;return bundled.chunks[p];
}});
assert.equal(reader.searchMetadata("p256:s001").length,1);
assert.equal(requests,0);
assert.equal((await reader.open(reader.firstId)).passage.sourcePages[0].printedPage,255);
assert.equal(requests,1);
const tampered=createSourceTextReader({manifest:bundled.manifest,loadChunk:async p=>{
 const chunk=JSON.parse(bundled.chunks[p]);
 chunk.passages[0].sourcePages[0].scanPage=999;
 return chunk;
}});
await assert.rejects(tampered.open(tampered.firstId),/PAGE_SPAN_IDENTITY_MISMATCH/);
const corrupt=structuredClone(approvals);
corrupt[0].approvedText+=" OCR addition";
assert.throws(()=>prepareReviewedScanDocument({plan,candidates:realCandidates,
 approvals:corrupt,profile:witness,work:sample.work,review:sample.review,
 heading:sample.heading}),/OUTSIDE_APPROVED_EXCERPTS/);
const missingReview=structuredClone(approvals);
missingReview[0].resolvedFlags=[];
assert.throws(()=>prepareReviewedScanDocument({plan,candidates:realCandidates,
 approvals:missingReview,profile:witness,work:sample.work,review:sample.review,
 heading:sample.heading}),/FLAGS_UNRESOLVED/);
const badUrl=structuredClone(approvals);
badUrl[0].reviewedScanUrls=[plan.pages[1].url];
assert.throws(()=>prepareReviewedScanDocument({plan,candidates:realCandidates,
 approvals:badUrl,profile:witness,work:sample.work,review:sample.review,
 heading:sample.heading}),/PAGE_IMAGES_NOT_VERIFIED/);
const nonBody=structuredClone(realCandidates);nonBody[0].kind="footnote";
assert.throws(()=>prepareReviewedScanDocument({plan,candidates:nonBody,
 approvals,profile:witness,work:sample.work,review:sample.review,
 heading:sample.heading}),/APPROVAL_INCOMPLETE/);
// Cross-page continuation tested with entirely synthetic text and its own
// project-authored demo rights; this is not a claim that original Fortescue
// p255 text actually spans into p256.
const demo=json("data/source-text/pilot/manifest.json").work;
const testWork={...demo,id:"WORK-AO-PRINT-SPAN-DEMO",
 witnessId:"WIT-AO-PRINT-SPAN-DEMO"};
const testProfile={...witness,id:testWork.witnessId,sourceWorkId:testWork.id};
const testPlan={...plan,articleWorkId:testWork.id,editionId:testWork.editionId,
 witnessId:testWork.witnessId};
const text="A project-authored line crossing two synthetic printed page territories.";
const cross=[{id:"SYN-CROSS",locator:"p255:s001",pages:[255,256],
 kind:"body",column:"right",articleStatus:"CONFIRMED_IN_SCOPE",text}];
const q2=buildScanReviewQueue({plan:testPlan,candidates:cross});
const approved=[{candidateId:"SYN-CROSS",status:"PRELIMINARY_IMAGE_COLLATED",
 reviewerId:"AO-SYNTHETIC-REVIEW",reviewEvidenceId:"AO-SYNTHETIC-CROSS",
 approvedText:text,resolvedFlags:q2.items[0].flags,
 reviewedScanUrls:q2.items[0].scanImages,crossPageJoinVerified:true}];
const demoReview={workId:testWork.id,editionId:testWork.editionId,
 witnessId:testWork.witnessId,reproductionReviewId:testWork.rights.reviewId,
 sourceDocumentId:"SYNTHETIC-PRINT-SPAN",collationReviewId:"SYNTHETIC-SPAN-COLLATION"};
const joined=prepareReviewedScanDocument({
 plan:testPlan,candidates:cross,approvals:approved,profile:testProfile,work:testWork,
 review:demoReview,heading:"Synthetic continuation test"});
assert.deepEqual(joined.document.passages[0].sourcePages.map(x=>x.printedPage),[255,256]);
const held=structuredClone(approved);delete held[0].crossPageJoinVerified;
assert.throws(()=>prepareReviewedScanDocument({plan:testPlan,candidates:cross,
 approvals:held,profile:testProfile,work:testWork,
 review:demoReview,heading:"Synthetic test"}),/CROSS_PAGE_JOIN_UNVERIFIED/);
console.log("PASS 13 original scan-page entries + 325 synthetic OCR review candidates; no unreviewed text released");
console.log(JSON.stringify({scanPagesIndexed:13,originalFullPagesCollated:0,
 stagedSyntheticCandidates:325,stagedTextExported:false,
 realApprovedShortExcerpts:4,reviewRequired:true,
 crossPageContinuationTestedSynthetic:true,productionPublishApproved:false}));
