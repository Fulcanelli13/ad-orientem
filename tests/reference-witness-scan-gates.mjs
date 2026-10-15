import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 validateSourceWork,assertPassageReproductionScope,validateSourcePageSpan
} from "../src/reference/edition-witness-contracts.js";
import {
 normalizeWitnessLocator,validateExternalLocatorBinding,editionQualifiedCitation
} from "../src/reference/witness-locators.js";
import {validatePrintPagePlan,buildScanReviewQueue}
 from "../src/reference/scan-staging.js";
import {parsePinnedSourceHtml} from "../src/reference/html-parser.js";
import {compileSourcePassagePacks,createSourcePackReader}
 from "../src/reference/passage-packs.js";
import {webcrypto} from "node:crypto";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const registry=read("data/reference/canonical-works-pilot.v1.json");
const witness=read("data/reference/research/witness-profiles.v1.json");
const plan=read("data/reference/research/fortescue-1913-scan-page-plan.v1.json");
const triage=read("data/reference/research/fortescue-1913-ocr-triage.v1.json");
assert.equal(registry.works.length,13,"Reuse 13 existing work identities, do not create a replacement canon");
assert.equal(witness.profiles.length,9);
assert.equal(witness.metrics.reproductionCleared,0);
assert.equal(witness.metrics.thirdPartyTextImported,0);
const profile=id=>{const p=witness.profiles.find(p=>p.id===id);assert.ok(p,id);return p};
for(const p of witness.profiles){
 assert.ok(p.sourceWorkId.startsWith("WORK-"));
 assert.notEqual(p.rights,"REPRODUCTION_CLEARED","Source witnesses are link/index evidence, not rights approvals");
}
const mediator=profile("WIT-MEDIATOR-DEI-EN-VATICAN");
assert.equal(normalizeWitnessLocator(mediator,"§23").sourceAnchor,"md-en-p023");
assert.throws(()=>normalizeWitnessLocator(mediator,"211"),/PARAGRAPH_INVALID/);
assert.throws(()=>normalizeWitnessLocator(mediator,"footnote 23"),/PARAGRAPH_INVALID/);
assert.throws(()=>validateExternalLocatorBinding({profile:mediator,locator:"23",
 hostUrl:mediator.witnessUrl,nodeKind:"footnote"}),/NONBODY_LOCATOR_REFUSED/);
assert.throws(()=>normalizeWitnessLocator(profile("WIT-MEDIATOR-DEI-LA-VATICAN"),"23"),
 /LOCATOR_UNREVIEWED/);
const tan=profile("WIT-TANQUEREY-EN-EWTN");
assert.equal(normalizeWitnessLocator(tan,"#643").sourceAnchor,"tanquerey-s0643");
assert.equal(validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://www.ewtn.com/catholicism/library/spiritual-life-12636"}).sourceLocator,"§643");
assert.throws(()=>validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://www.ewtn.com/catholicism/library/spiritual-life-12632"}),/LOCATOR_WRONG_PAGE/);
assert.throws(()=>validateExternalLocatorBinding({profile:tan,locator:"#644",
 hostUrl:"https://www.ewtn.com/catholicism/library/spiritual-life-12636"}),/LOCATOR_PAGE_UNVERIFIED/);
const hume=profile("WIT-HUME-E10-ONLINE");
assert.equal(normalizeWitnessLocator(hume,"E 10.12").sourceAnchor,"hume-e10-p012");
assert.throws(()=>normalizeWitnessLocator(hume,"SBN 114-5"),/HUME_LOCATOR_INVALID/);
const sales=profile("WIT-DESA-EN-CCEL");
assert.notEqual(normalizeWitnessLocator(sales,"I.17").sourceAnchor,
 normalizeWitnessLocator(sales,"II.17").sourceAnchor);
const d31=profile("WIT-DENZINGER-31-1960-CATALOGUE");
const d32=profile("WIT-DENZINGER-32-1963-CATALOGUE");
assert.notEqual(d31.referencePrefix,d32.referencePrefix);
assert.throws(()=>normalizeWitnessLocator(d31,"DS 1234"),/CONTENT_NOT_INSPECTED/);

assert.equal(plan.editionId,"ED-CE1913-V3-KOC-SPECIAL");
assert.equal(plan.witnessId,"WIT-CE1913-V3-KOC-PRINT-FORTESCUE");
assert.equal(plan.coverage.printedStart,255);
assert.equal(plan.coverage.scanStart,303);
assert.equal(plan.scanEdition,"1913_SPECIAL_EDITION");
assert.equal(validatePrintPagePlan(plan).size,13);
assert.ok(plan.pages.every(x=>x.fullPageTextApproved===false));
assert.equal(plan.approvedFullPageCount,0);
const print=profile(plan.witnessId);
assert.equal(print.sourceWorkId,plan.articleWorkId);
assert.equal(normalizeWitnessLocator(print,"p257:s001").sourceAnchor,"ce1913-v3-p257-s001");
const sample={id:"SYN-257-01",kind:"body",column:"unknown",pages:[257,258],
 locator:"p257:s001",articleStatus:"UNKNOWN",
 text:"Synthetic text only, with OCR replacement \uFFFD and a hy-\nphenation."};
const queue=buildScanReviewQueue({plan,candidates:[sample]});
assert.equal(queue.candidateCount,1);
assert.equal(queue.approvalCount,0);
assert.equal(queue.packageEligible,false);
assert.ok(queue.items[0].flags.includes("PRINT_IMAGE_COLLATION"));
assert.ok(queue.items[0].flags.includes("CROSS_PAGE_CONTINUATION_REVIEW"));
assert.ok(queue.items[0].flags.includes("COLUMN_ORDER_UNCERTAIN"));
assert.ok(queue.items[0].flags.includes("OCR_CHARACTER_UNCERTAINTY"));
assert.ok(queue.items[0].flags.includes("OCR_LINE_END_HYPHENATION"));
assert.ok(!JSON.stringify(queue).includes("Synthetic text only"),
 "Never export OCR candidates through the metadata review queue");
assert.throws(()=>buildScanReviewQueue({plan,candidates:[sample,sample]}),/DUPLICATE/);
assert.throws(()=>buildScanReviewQueue({plan,candidates:[{...sample,pages:[254]}]}),/OUTSIDE_PAGE_PLAN/);
assert.throws(()=>buildScanReviewQueue({plan,candidates:[{...sample,pages:[257,259]}]}),/NONCONTIGUOUS_SPAN/);
assert.throws(()=>validatePrintPagePlan({...plan,pages:[plan.pages[0],plan.pages[2]]}),/SEQUENCE_GAP/);
assert.equal(triage.workId,plan.articleWorkId);
assert.equal(triage.editionId,plan.editionId);
assert.equal(triage.witnessId,plan.witnessId);
assert.equal(triage.productionPromotionAllowed,false);
assert.ok(triage.cases.every(x=>x.humanRecheckRequired&&x.automaticSubstitutionAllowed===false));

// Independent work, exact edition, and witness must qualify citations.
const demo={id:"WORK-AO-SYNTHETIC",title:"Test authored text",
 editionId:"ED-AO-SYNTHETIC-1",witnessId:"WIT-AO-SYNTHETIC-1",language:"en",
 demoOnly:true,rights:{status:"PROJECT_AUTHORED_DEMO",reviewId:"TEST-ONLY"}};
validateSourceWork(demo,{requireReproduction:true});
assert.throws(()=>validateSourceWork({...demo,rights:{status:"UNREVIEWED"}},{requireReproduction:true}),
 /REPRODUCTION_NOT_CLEARED/);
assert.throws(()=>validateSourceWork({...demo,demoOnly:false},{requireReproduction:true}),
 /DEMO_CANNOT_BE_PUBLIC/);
const scoped={...demo,rights:{status:"REPRODUCTION_CLEARED",reviewId:"REVIEW-SYNTHETIC",
 scope:"REVIEWED_EXCERPTS_ONLY",approvedExcerpts:[{anchor:"p1",text:"Original test sentence."}]}};
assertPassageReproductionScope(scoped,[{locator:"test#p1",text:"Original test sentence."}]);
assert.throws(()=>assertPassageReproductionScope(scoped,[{locator:"test#p1",
 text:"Altered test sentence."}]),/OUTSIDE_APPROVED_EXCERPTS/);
assert.throws(()=>assertPassageReproductionScope(scoped,[{locator:"test#p2",
 text:"Original test sentence."}]),/OUTSIDE_APPROVED_EXCERPTS/);
const citation=editionQualifiedCitation({work:demo,passageId:demo.id+"/section/p1",
 sourceAnchor:"p1"});
assert.notEqual(citation,editionQualifiedCitation({work:{...demo,editionId:"ED-AO-SYNTHETIC-2"},
 passageId:demo.id+"/section/p1",sourceAnchor:"p1"}));
assert.throws(()=>editionQualifiedCitation({work:demo,passageId:"WORK-OTHER/s/p1",sourceAnchor:"p1"}),
 /QUALIFICATION_INVALID/);
validateSourcePageSpan({sourcePage:plan.pages[0].url,sourcePages:[
 {printedPage:255,scanPage:303,url:plan.pages[0].url},
 {printedPage:256,scanPage:304,url:plan.pages[1].url}
]});
assert.throws(()=>validateSourcePageSpan({sourcePage:plan.pages[0].url,sourcePages:[
 {printedPage:255,scanPage:303,url:plan.pages[0].url},
 {printedPage:257,scanPage:305,url:plan.pages[2].url}
]}),/NONCONTIGUOUS/);

// Canonical existing reader stays the only chunk/reader owner; no second source-text reader.
const parsed=parsePinnedSourceHtml({text:"<article><h2>Demo</h2><p id='a'>Original text.</p></article>",
 workId:"demo.sample",witnessId:"demo.witness",revision:"r1",language:"en",rights:"CLEARED"});
const pack=await compileSourcePassagePacks(parsed,{cryptoProvider:webcrypto});
let calls=0;const loader=createSourcePackReader(pack.manifest,{
 cryptoProvider:webcrypto,loadChunk:async()=>{calls++;return pack.chunks[0].raw;}});
assert.equal(calls,0);
assert.equal((await loader.open(pack.manifest.sections[0].passageIds[0])).text,"Original text.");
assert.equal(calls,1);
console.log("PASS canonical witness, edition, 1913 scan staging, excerpt scope, external locators, and one source reader");
