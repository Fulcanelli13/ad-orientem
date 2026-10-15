import {validatePrintPagePlan} from "./scan-review.js";
// A batch report is a controlled image-index and review-status handoff;
// it never materializes or approves OCR text, and cannot mint passage IDs.
const nonblank=x=>typeof x==="string"&&x.trim().length>0;
const pageUrl=(root,n)=>root+"/"+n;
export function validateHistoricalPrintBatch({plan,batch,previousPageDraft}={}){
 const catalog=validatePrintPagePlan(plan);
 if(batch?.schema!=="AO_SOURCE_TEXT_PRINT_BATCH_REVIEW_V1"||
    batch.workId!==plan.articleWorkId||
    batch.editionId!==plan.editionId||batch.witnessId!==plan.witnessId||
    batch.scanRoot!==plan.scanPageBaseUrl||
    batch.publicationApproved!==false||
    batch.productionIngestAllowed!==false||
    batch.copyTextIntoCanonicalReader!==false||
    batch.passageWhitelistChangeRequested!==false||
    !Array.isArray(batch.pages)||batch.pages.length<2||batch.pages.length>8)
  throw new Error("SOURCE_PRINT_BATCH_NOT_REVIEW_ONLY");
 let prev=null;
 for(const p of batch.pages){
  const registered=catalog.get(p?.printedPage);
  if(!registered||p.scanPage!==registered.scanPage||
     p.sourceImage!==registered.url||
     p.sourceImage!==pageUrl(batch.scanRoot,p.scanPage)||
     p.imageReviewDone!==true||p.fullPageTextCollated!==false||
     !nonblank(p.beginsWith)||!Array.isArray(p.themes)||!p.themes.length||
     p.themes.some(t=>!nonblank(t))||
     !nonblank(p.authorialAssertionClass)||
     !Array.isArray(p.proofreadingNext)||!p.proofreadingNext.length||
     p.proofreadingNext.some(t=>!nonblank(t)))
   throw new Error("SOURCE_PRINT_BATCH_PAGE_EVIDENCE_INVALID");
  if(prev&&(p.printedPage!==prev.printedPage+1||
     p.scanPage!==prev.scanPage+1||p.beginsMidParagraphFromPrintedPage!==prev.printedPage))
   throw new Error("SOURCE_PRINT_BATCH_PAGE_ORDER_INVALID");
  if(p.importantOriginalTextWitness){
   const w=p.importantOriginalTextWitness;
   if(w.printedPage!==p.printedPage||w.sourceImage!==p.sourceImage||
      w.textVariantsMustRemainDistinct!==true||
      !nonblank(w.quotationOpening)||!nonblank(w.relatedPage257Quotation))
    throw new Error("SOURCE_PRINT_BATCH_TEXT_WITNESSES_CONFLATED");
  }
  if(p.newSectionOnPage&&
     (p.newSectionOnPage.semanticType!=="PRINTED_SUBSECTION_HEADING_NOT_COMPLETE_ARTICLE_BOUNDARY"||
      !nonblank(p.newSectionOnPage.heading)))
   throw new Error("SOURCE_PRINT_BATCH_SUBSECTION_INVALID");
  prev=p;
 }
 const first=batch.pages[0],c=batch.transcribedContinuation;
 if(!previousPageDraft||previousPageDraft.workId!==batch.workId||
    previousPageDraft.editionId!==batch.editionId||
    previousPageDraft.witnessId!==batch.witnessId||
    !c||c.sourceBlockId!==previousPageDraft.pageJoinCandidate?.sourceBlockId||
    c.sourceFile!=="data/source-text/fortescue-1913-p257-provisional-transcription.v1.json"||
    c.firstPhysicalPage!==first.printedPage-1||
    c.secondPhysicalPage!==first.printedPage||
    c.firstImagePage!==catalog.get(c.firstPhysicalPage)?.scanPage||
    c.secondImagePage!==first.scanPage||
    c.printParagraphStartsOn!==c.firstPhysicalPage||
    c.printParagraphEndsOn!==first.printedPage||
    c.contentIsReusedNotDuplicated!==true||
    c.completeTextReproductionClearance!==false||
    c.approvedForAutoJoin!==false||
    previousPageDraft.pageJoinCandidate.mergeApproved!==false||
    previousPageDraft.pageJoinCandidate.independentImageProofread!==false||
    !first.beginsWith.startsWith(previousPageDraft.pageJoinCandidate.firstWordsOnNextPage.slice(0,30)))
  throw new Error("SOURCE_PRINT_BATCH_PAGE_HANDOFF_UNSAFE");
 const boundaries=batch.pageBoundaryChain;
 if(!Array.isArray(boundaries)||boundaries.length!==batch.pages.length)
  throw new Error("SOURCE_PRINT_BATCH_BOUNDARY_LIST_INVALID");
 const sequence=[catalog.get(first.printedPage-1),...batch.pages];
 for(let i=0;i<boundaries.length;i++){
  const item=boundaries[i],before=sequence[i],after=sequence[i+1];
  if(!before||!after||item.fromPrintedPage!==before.printedPage||
     item.toPrintedPage!==after.printedPage||
     item.fromImage!==before.scanPage||item.toImage!==after.scanPage||
     !(i===0?
       item.state==="SAME_PRINTED_PARAGRAPH_CROSS_PAGE_CONFIRMED_STRUCTURALLY_NOT_LETTER_BY_LETTER":
       item.state==="LEFT_UNJOINED__PHYSICAL_MID_ARGUMENT_CONTINUATION_REVIEW_ONLY"))
   throw new Error("SOURCE_PRINT_BATCH_CONTINUATION_UNVERIFIED");
 }
 const m=batch.reviewMetrics;
 if(m?.originalScanPagesInspected!==batch.pages.length||
    m.pagesWithFullyProofreadEntireText!==0||
    m.sourceParagraphsCertified!==0||
    m.newlyPublishedThirdPartyParagraphs!==0||
    m.alreadyAllowedTestExcerptsUnchanged!==4||
    m.independentHumanProofreadersSignedOff!==0||
    batch.crossModuleRestrictions?.mustNotOverwrite65CardMassReader!==true||
    batch.crossModuleRestrictions.mustNotImply1962RubricAuthority!==true)
  throw new Error("SOURCE_PRINT_BATCH_CLEARANCE_CONTRADICTION");
 // Never include raw hosted OCR or provisional joins in the exportable record.
 return Object.freeze({schema:"AO_SOURCE_TEXT_PRINT_BATCH_AUDIT_V1",
  editionId:batch.editionId,witnessId:batch.witnessId,
  imagePages:batch.pages.map(p=>({printedPage:p.printedPage,scanPage:p.scanPage,url:p.sourceImage})),
  scannedPages:batch.pages.length,approvedWholePages:0,
  independentlyCertifiedParagraphs:0,alreadyAllowedTestExcerptsUnchanged:4,
  physicalPageHandoffStatus:"STRUCTURAL_ONLY_NOT_PROOFREAD",
  humanEditorialReviewRequired:true,
  publicationApproved:false,productionIngestAllowed:false});
}
