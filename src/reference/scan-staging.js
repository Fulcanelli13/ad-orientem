// Metadata-only scan/OCR staging: no approval, promotion or source-body export.\n
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
