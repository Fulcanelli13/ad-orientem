import {normalizePassageText,assertPassageReproductionScope} from "./contracts.js";
import {extractReviewedWitnessDocument,normalizeWitnessLocator} from "./witness-locators.js";

// OCR candidates and proofing metadata never imply an import licence.
// This is an intermediate in-memory review queue, not a fetcher or a runtime route.
const ID=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/;
const KINDS=new Set(["body","heading","footnote","running_header","other_article"]);
const COLUMNS=new Set(["left","right","unknown"]);
const nonblank=x=>typeof x==="string"&&x.trim().length>0;
export function validatePrintPagePlan(plan){
 if(plan?.schema!=="AO_SOURCE_TEXT_PRINT_PAGE_PLAN_V1"||
    !nonblank(plan.articleWorkId)||!nonblank(plan.editionId)||!nonblank(plan.witnessId)||
    !nonblank(plan.scanPageBaseUrl)||!plan.scanPageBaseUrl.startsWith("https://")||
    !Array.isArray(plan.pages)||!plan.pages.length||plan.pages.length>2000)
  throw new Error("SOURCE_SCAN_PLAN_INVALID");
 const byPage=new Map(),seenScan=new Set();
 for(let i=0;i<plan.pages.length;i++){
  const p=plan.pages[i];
  if(!Number.isInteger(p?.printedPage)||p.printedPage<1||
     !Number.isInteger(p.scanPage)||p.scanPage<1||
     !nonblank(p.url)||p.url!==plan.scanPageBaseUrl+"/"+p.scanPage||
     byPage.has(p.printedPage)||seenScan.has(p.scanPage))
   throw new Error("SOURCE_SCAN_PAGE_INVALID");
  if(i>0&&(p.printedPage!==plan.pages[i-1].printedPage+1||
     p.scanPage!==plan.pages[i-1].scanPage+1))
   throw new Error("SOURCE_SCAN_SEQUENCE_GAP");
  byPage.set(p.printedPage,p);seenScan.add(p.scanPage);
 }
 return byPage;
}
function inspectCandidate(candidate,byPage){
 if(!candidate||!ID.test(candidate.id??"")||!KINDS.has(candidate.kind)||
    !COLUMNS.has(candidate.column)||!Array.isArray(candidate.pages)||
    !candidate.pages.length||candidate.pages.length>12||
    !nonblank(candidate.locator)||!nonblank(candidate.text)||
    candidate.text.length>40000)
  throw new Error("SOURCE_SCAN_CANDIDATE_INVALID");
 const pages=candidate.pages.map(n=>{
  if(!Number.isInteger(n)||!byPage.has(n))throw new Error("SOURCE_SCAN_OUTSIDE_PAGE_PLAN");
  return byPage.get(n);
 });
 for(let i=1;i<pages.length;i++)
  if(pages[i].printedPage!==pages[i-1].printedPage+1)
   throw new Error("SOURCE_SCAN_NONCONTIGUOUS_SPAN");
 if(candidate.text.includes("\u0000"))
  throw new Error("SOURCE_SCAN_NUL_REJECTED");
 const flags=["PRINT_IMAGE_COLLATION"];
 if(candidate.kind!=="body")flags.push("NON_BODY_MATERIAL");
 if(candidate.column==="unknown")flags.push("COLUMN_ORDER_UNCERTAIN");
 if(candidate.articleStatus!=="CONFIRMED_IN_SCOPE"||
    pages.some(p=>p.articleBoundary!=="FULL_PAGE_ARTICLE_SPAN_TO_BE_COLLATED"))
  flags.push("ARTICLE_BOUNDARY_REVIEW");
 if(pages.length>1)flags.push("CROSS_PAGE_CONTINUATION_REVIEW");
 if(/[\uFFFD\u00AD]/u.test(candidate.text))flags.push("OCR_CHARACTER_UNCERTAINTY");
 if(/[A-Za-zÀ-ÿ]-\s*\n\s*[A-Za-zÀ-ÿ]/u.test(candidate.text))
  flags.push("OCR_LINE_END_HYPHENATION");
 if(/[<>]/u.test(candidate.text))flags.push("OCR_POSSIBLE_MARKUP");
 return {pages,flags};
}
export function buildScanReviewQueue({plan,candidates}={}){
 const byPage=validatePrintPagePlan(plan);
 if(!Array.isArray(candidates)||candidates.length>10000)
  throw new Error("SOURCE_SCAN_CANDIDATE_LIST_INVALID");
 const ids=new Set(),items=[],flagCounts={};
 for(const c of candidates){
  if(ids.has(c?.id))throw new Error("SOURCE_SCAN_DUPLICATE_CANDIDATE");
  const {pages,flags}=inspectCandidate(c,byPage);
  ids.add(c.id);
  flags.forEach(f=>flagCounts[f]=(flagCounts[f]??0)+1);
  // Raw candidate text is intentionally NOT stored in an exportable queue.
  items.push({id:c.id,locator:c.locator,kind:c.kind,pages:pages.map(p=>p.printedPage),
   scanImages:pages.map(p=>p.url),characterCount:c.text.length,
   flags,status:"HELD_FOR_INDEPENDENT_PRINT_COLLATION"});
 }
 return Object.freeze({schema:"AO_SOURCE_TEXT_SCAN_REVIEW_QUEUE_V1",
  articleWorkId:plan.articleWorkId,editionId:plan.editionId,witnessId:plan.witnessId,
  reviewOnly:true,packageEligible:false,candidateCount:items.length,
  approvalCount:0,flagCounts,items});
}
// Explicit promotion of only selected, approved original-print excerpts.
// Existing rights/excerpt whitelist is checked *again* after parsing.
// A reviewer assertion here is a technical input, never automatic legal certification.
export function prepareReviewedScanDocument({
 plan,candidates,approvals,profile,work,review,heading
}={}){
 const queue=buildScanReviewQueue({plan,candidates}),byPage=validatePrintPagePlan(plan);
 if(!work||work.id!==plan.articleWorkId||work.editionId!==plan.editionId||
    work.witnessId!==plan.witnessId||profile?.id!==plan.witnessId||
    profile?.sourceWorkId!==plan.articleWorkId)
  throw new Error("SOURCE_SCAN_WORK_EDITION_MISMATCH");
 if(!Array.isArray(approvals)||!approvals.length)throw new Error("SOURCE_SCAN_NO_APPROVALS");
 const approvalIds=new Set(),sourceCandidates=new Map(candidates.map(c=>[c.id,c]));
 const records=[],pageLinks=[];
 for(const a of approvals){
  if(!ID.test(a?.candidateId??"")||approvalIds.has(a.candidateId))
   throw new Error("SOURCE_SCAN_APPROVAL_DUPLICATE_OR_INVALID");
  approvalIds.add(a.candidateId);
  const c=sourceCandidates.get(a.candidateId);
  if(!c||c.kind!=="body"||a.status!=="PRELIMINARY_IMAGE_COLLATED"||
     !nonblank(a.reviewerId)||!nonblank(a.reviewEvidenceId)||
     !nonblank(a.approvedText)||!Array.isArray(a.resolvedFlags))
   throw new Error("SOURCE_SCAN_APPROVAL_INCOMPLETE");
  const item=queue.items.find(x=>x.id===a.candidateId);
  if(item.flags.some(f=>!a.resolvedFlags.includes(f)))
   throw new Error("SOURCE_SCAN_REVIEW_FLAGS_UNRESOLVED");
  if(item.pages.length>1&&a.crossPageJoinVerified!==true)
   throw new Error("SOURCE_SCAN_CROSS_PAGE_JOIN_UNVERIFIED");
  const scanned=item.pages.map(n=>byPage.get(n));
  if(a.reviewedScanUrls?.length!==scanned.length||
     scanned.some((p,i)=>a.reviewedScanUrls[i]!==p.url))
   throw new Error("SOURCE_SCAN_PAGE_IMAGES_NOT_VERIFIED");
  // OCR may differ from approved transcription; never silently repair.
  // Only exact approved text from the existing rights ledger may be packaged.
  const text=normalizePassageText(a.approvedText);
  assertPassageReproductionScope(work,[{locator:"page#"+normalizeWitnessLocator(profile,c.locator).sourceAnchor,text}]);
  records.push({locator:c.locator,text,hostUrl:scanned[0].url});
  pageLinks.push(scanned.map(p=>({printedPage:p.printedPage,
    scanPage:p.scanPage,url:p.url})));
 }
 const parsed=extractReviewedWitnessDocument({profile,work,review,heading,records});
 const passages=parsed.passages.map((p,i)=>Object.freeze({
  ...p,sourcePages:Object.freeze(pageLinks[i])
 }));
 assertPassageReproductionScope(work,passages);
 return Object.freeze({schema:"AO_SOURCE_TEXT_REVIEWED_SCAN_SELECTION_V1",
  queue,selectedCount:passages.length,heldCount:queue.candidateCount-passages.length,
  document:Object.freeze({...parsed,passages:Object.freeze(passages)}),
  productionPublishApproved:false});
}
