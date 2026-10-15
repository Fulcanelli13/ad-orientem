import {validatePrintPagePlan,buildScanReviewQueue} from "./scan-review.js";

const CONTENT_STATES=new Set(["COMPLETE_PARAGRAPH_PRELIMINARY","PARAGRAPH_OPENING_PRELIMINARY",
 "CONTINUATION_CANDIDATE","PARAGRAPH_CANDIDATE","CROSSES_COLUMN_BREAK",
 "LATIN_QUOTATION_CANDIDATE","CONTINUES_ON_NEXT_PRINTED_PAGE"]);
const BLOCK_KIND=new Set(["body","attributed-quotation"]);
const PAGE_ID=/^P[1-9][0-9]{0,3}-[0-9]{2}[a-z]?$/;
// Safe research metadata from a draft full-page OCR transcription.
// Does not authorize text reproduction, page certification, or packaging.
export function auditProvisionalPage({plan,pageDraft}={}){
 const pages=validatePrintPagePlan(plan);
 const page=pages.get(pageDraft?.printedPage);
 if(!page||pageDraft.schema!=="AO_SOURCE_TEXT_PRELIMINARY_PAGE_TRANSCRIPTION_V1"||
    pageDraft.workId!==plan.articleWorkId||
    pageDraft.editionId!==plan.editionId||pageDraft.witnessId!==plan.witnessId||
    page.scanPage!==pageDraft.scanImagePage||
    pageDraft.imageUrl!==page.url||
    pageDraft.nextImageUrl!==pages.get(page.printedPage+1)?.url||
    pageDraft.passagePromotionAllowed!==false||
    pageDraft.publicationApproved!==false||
    pageDraft.fullTextProofread!==false||
    pageDraft.sourceStatus!=="OCR_ASSISTED_PARTIAL_IMAGE_REVIEW__NOT_INDEPENDENTLY_PROOFREAD"||
    !Array.isArray(pageDraft.blocks)||!pageDraft.blocks.length||
    pageDraft.blocks.length>1000)
  throw new Error("SOURCE_PROVISIONAL_PAGE_UNSAFE_OR_INVALID");
 const ids=new Set(),candidates=[],flags=[],heldItems=[];
 let wordCount=0,referencedExisting=0,latinQuotes=0,crossPage=0;
 for(const b of pageDraft.blocks){
  if(!PAGE_ID.test(b?.id??"")||ids.has(b.id)||
     !BLOCK_KIND.has(b.kind)||!CONTENT_STATES.has(b.extent)||
     !["left","right","left-to-right"].includes(b.column)||
     typeof b.review!=="string"||!b.review.trim())
   throw new Error("SOURCE_PROVISIONAL_BLOCK_INVALID");
  ids.add(b.id);
  if(b.text===null){
   if(!Array.isArray(b.anchors)||b.anchors.length!==1||b.anchors[0].indexOf("p"+page.printedPage+":")!==0)
    throw new Error("SOURCE_PROVISIONAL_REFERENCE_INVALID");
   referencedExisting++;
   heldItems.push({id:b.id,scope:"EXISTING_RESTRICTED_EXCERPT_ONLY",status:"HELD"});
   continue;
  }
  if(typeof b.text!=="string"||b.text.length<15||b.text.length>30000||
     b.text.includes("\u0000"))
   throw new Error("SOURCE_PROVISIONAL_TEXT_INVALID");
  const words=b.text.trim().split(/\s+/).length;
  wordCount+=words;
  if(b.kind==="attributed-quotation")latinQuotes++;
  if(b.extent==="CONTINUES_ON_NEXT_PRINTED_PAGE"){
   crossPage++;
   if(b!==pageDraft.blocks.at(-1))
    throw new Error("SOURCE_PROVISIONAL_UNVERIFIED_PAGE_JOIN");
  }
  const reviewFlags=["NOT_INDEPENDENTLY_PROOFREAD","NO_AUTHORIAL_PARAGRAPH_CERTIFICATION"];
  if(b.kind==="attributed-quotation")reviewFlags.push("PRIMARY_LATIN_QUOTATION_REQUIRES_COLLATION");
  if(b.column==="left-to-right")reviewFlags.push("COLUMN_BREAK_REQUIRES_COLLATION");
  if(b.extent==="CONTINUES_ON_NEXT_PRINTED_PAGE")reviewFlags.push("PAGE_JOIN_REQUIRES_COLLATION");
  flags.push(...reviewFlags);
  heldItems.push({id:b.id,scope:b.kind==="attributed-quotation"?
   "EMBEDDED_PATRISTIC_QUOTE_NOT_EDITED_OR_PUBLISHED":"PRELIMINARY_ORIGINAL_ARTICLE_TEXT",
   wordCount:words,reviewFlags,status:"HELD"});
  candidates.push({id:b.id,locator:"draft-"+b.id,pages:[page.printedPage],
   kind:"body",column:b.column==="left-to-right"?"unknown":b.column,
   articleStatus:"CONFIRMED_IN_SCOPE",text:b.text});
 }
 if(pageDraft.blockCount!==pageDraft.blocks.length||
    pageDraft.draftTextBlocks!==candidates.length||
    latinQuotes<1||crossPage!==1||referencedExisting<1)
  throw new Error("SOURCE_PROVISIONAL_SCOPE_INCOMPLETE");
 const join=pageDraft.pageJoinCandidate;
 if(!join||join.sourceBlockId!==pageDraft.blocks.at(-1)?.id||
    !Array.isArray(join.printedPageSequence)||
    join.printedPageSequence[0]!==page.printedPage||
    join.printedPageSequence[1]!==page.printedPage+1||
    !Array.isArray(join.scanPageSequence)||
    join.scanPageSequence[0]!==page.scanPage||
    join.scanPageSequence[1]!==pages.get(page.printedPage+1)?.scanPage||
    typeof join.lastWordsOnCurrentPage!=="string"||join.lastWordsOnCurrentPage.length<8||
    !pageDraft.blocks.at(-1).text.endsWith(join.lastWordsOnCurrentPage)||
    typeof join.continuedTextDraft!=="string"||
    typeof join.firstWordsOnNextPage!=="string"||join.firstWordsOnNextPage.length<12||
    !join.continuedTextDraft.startsWith(join.firstWordsOnNextPage)||
    join.continuedTextDraft.length<join.firstWordsOnNextPage.length+20||
    join.mergeApproved!==false||
    join.independentImageProofread!==false||
    join.reviewStatus!=="PROVISIONAL_IMAGE_ASSISTED_NOT_WORD_BY_WORD_COLLATED")
  throw new Error("SOURCE_PROVISIONAL_PAGE_JOIN_UNVERIFIED");
 const reviewQueue=buildScanReviewQueue({plan,candidates});
 // Guardrail: export only metadata, and exclude all raw draft text.
 return Object.freeze({schema:"AO_SOURCE_TEXT_PROVISIONAL_PAGE_AUDIT_V1",
  workId:pageDraft.workId,editionId:pageDraft.editionId,witnessId:pageDraft.witnessId,
  printedPage:page.printedPage,scanImagePage:page.scanPage,
  sourceUrl:page.url,reviewOnly:true,publicationApproved:false,
  eligibleForProduction:false,pageWordCountProvisional:wordCount,
  existingExcerptReferences:referencedExisting,transcribedDraftBlocks:candidates.length,
  pageJoinStatus:"HELD_AND_UNPROOFREAD",nextPrintedPage:page.printedPage+1,
  embeddedPrimaryQuoteBlocks:latinQuotes,crossPageContinuations:crossPage,
  heldItems,reviewQueueMetrics:{candidateCount:reviewQueue.candidateCount,
   flagCounts:reviewQueue.flagCounts},humanReviewRequired:true});
}
