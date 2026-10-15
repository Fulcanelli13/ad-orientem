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

const PERMITTED_ROLE=new Set([
 "AUTHORIAL_HISTORICAL_ARGUMENT","PRINTED_MAJOR_SECTION",
 "PRINTED_SUBHEADING_AND_PRAYER_COMMENTARY",
 "PRAYER_COMMENTARY_CONTINUATION","PRINTED_PRAYER_SUBHEADING",
 "PRINTED_INLINE_PHRASE_ANALYSIS_NOT_STANDALONE_PRAYER"]);
const meaningful=x=>typeof x==="string"&&x.trim().length>4;
// Generic contiguous follow-on review, using source images as stable page
// locators but NOT claiming direct original-image collation from OCR alone.
export function validateFollowOnHistoricalPrintBatch({plan,previousBatch,batch}={}){
 const catalog=validatePrintPagePlan(plan);
 if(batch?.schema!=="AO_SOURCE_TEXT_PRINT_BATCH_REVIEW_V2"||
    batch.workId!==plan.articleWorkId||
    batch.editionId!==plan.editionId||batch.witnessId!==plan.witnessId||
    batch.precedingBatchFile!=="data/source-text/fortescue-1913-print-batch-258-260.v1.json"||
    batch.publicationApproved!==false||batch.productionIngestAllowed!==false||
    batch.scanImageDirectlyVerified!==false||
    batch.sourceEvidence!=="UNPROOFREAD_WIKISOURCE_PAGE_TRANSCRIPTIONS_READ__ORIGINAL_IMAGE_LINKS_RESOLVED__DIRECT_IMAGE_MAGNIFIED_COLLATION_NOT_COMPLETED"||
    previousBatch?.schema!=="AO_SOURCE_TEXT_PRINT_BATCH_REVIEW_V1"||
    previousBatch.editionId!==batch.editionId||
    previousBatch.witnessId!==batch.witnessId||
    !Array.isArray(previousBatch.pages)||!previousBatch.pages.length||
    !Array.isArray(batch.pages)||batch.pages.length<2||batch.pages.length>8)
  throw new Error("SOURCE_FOLLOWON_BATCH_EDITION_OR_APPROVAL_INVALID");
 const p0=previousBatch.pages.at(-1);
 const pages=[],ids=new Set(),segments=[];
 for(let i=0;i<batch.pages.length;i++){
  const p=batch.pages[i],prev=i===0?p0:batch.pages[i-1];
  const mapped=catalog.get(p?.printedPage);
  if(!mapped||p.scanPage!==mapped.scanPage||p.url!==mapped.url||
     p.printedPage!==prev.printedPage+1||
     p.scanPage!==prev.scanPage+1||
     p.startsInContinuationFrom!==prev.printedPage||
     p.fullPageTextCollated!==false||p.paragraphStartsApproved!==false||
     p.sourceImageMagnified!==false||
     !meaningful(p.firstVisibleWordsCandidate)||
     !Array.isArray(p.segments)||p.segments.length<2||
     !Array.isArray(p.sourceCitationsNeedingExactCheck)||
     !p.sourceCitationsNeedingExactCheck.length||
     !Array.isArray(p.highRiskClaims)||!p.highRiskClaims.length)
   throw new Error("SOURCE_FOLLOWON_PAGE_ORDER_OR_CLAIMS_INVALID");
  for(const s of p.segments){
   if(!meaningful(s?.label)||!PERMITTED_ROLE.has(s.role)||
      !meaningful(s.note)||!meaningful(s.owner))
    throw new Error("SOURCE_FOLLOWON_SECTION_INVALID");
   const k=p.printedPage+":"+s.label;
   if(ids.has(k))throw new Error("SOURCE_FOLLOWON_DUPLICATED_SECTION");
   ids.add(k);
   segments.push({printedPage:p.printedPage,label:s.label,role:s.role});
  }
  pages.push({printedPage:p.printedPage,scanPage:p.scanPage,sourcePage:p.url});
 }
 if(!batch.pages[0].majorSectionTransition||
    batch.pages[0].majorSectionTransition.kind!=="MAJOR_SECTION_WITHIN_SAME_ARTICLE"||
    batch.pages[0].majorSectionTransition.humanImageVerification!==false||
    !batch.pages[0].majorSectionTransition.heading.includes("Text and Rubrics")||
    !batch.pages[1].segments.some(s=>s.label==="Communicantes")||
    !batch.pages[2].segments.some(s=>s.label==="Quam oblationem")||
    !batch.pages[2].segments.some(s=>s.label==="Qui pridie")||
    !batch.pages[2].segments.some(s=>s.label==="Gratias agens"&&
       s.role==="PRINTED_INLINE_PHRASE_ANALYSIS_NOT_STANDALONE_PRAYER"))
   throw new Error("SOURCE_FOLLOWON_SECTION_TOPOLOGY_INVALID");
 if(!Array.isArray(batch.transitionChecks)||batch.transitionChecks.length!==pages.length)
  throw new Error("SOURCE_FOLLOWON_BOUNDARY_COUNT_INVALID");
 const all=[{printedPage:p0.printedPage,scanPage:p0.scanPage},...batch.pages];
 for(let i=0;i<batch.transitionChecks.length;i++){
  const c=batch.transitionChecks[i],a=all[i],b=all[i+1];
  if(c.fromPage!==a.printedPage||c.toPage!==b.printedPage||
     c.fromImage!==a.scanPage||c.toImage!==b.scanPage||
     c.textJoinProofread!==false||!meaningful(c.relation))
   throw new Error("SOURCE_FOLLOWON_BOUNDARY_CLAIM_INVALID");
 }
 if(batch.editorialRouting?.operation!=="RECORD_SOURCE_PARALLELS_ONLY__NO_CARD_REORDER_OR_CUE_CHANGE"||
    batch.editorialRouting?.rubricAuthority!=="HISTORICAL_1913_EXPLANATION_NOT_1962_RITUS_SERVANDUS"||
    batch.editorialRouting?.bibliographyNumbering!=="DENZINGER_819_830_LEGACY_EDITION_SPECIFIC_DO_NOT_MAP_TO_DH_DIRECTLY"||
    batch.editorialRouting?.noPermissionRequests!==true||
    batch.metrics?.sourcePagesIndexed!==batch.pages.length||
    batch.metrics.newFullyProofreadPages!==0||
    batch.metrics.newlyApprovedSourceExcerpts!==0||
    batch.metrics.existingScopeLimitedExcerptsUnchanged!==4||
    batch.metrics.independentEditorialSignoffs!==0||
    batch.metrics.directFullResolutionScanImagesVerified!==0||
    batch.metrics.productionImports!==0)
  throw new Error("SOURCE_FOLLOWON_PUBLICATION_OR_MASS_OWNERSHIP_INVALID");
 return Object.freeze({schema:"AO_SOURCE_TEXT_FOLLOWON_BATCH_AUDIT_V1",
  pages:Object.freeze(pages),
  sectionCount:segments.length,
  sections:Object.freeze(segments),
  transitionsChecked:batch.transitionChecks.length,
  originalImagesDirectlyMagnified:0,
  printPagesFullyProofread:0,passagesNewlyCleared:0,
  massCardChangesAllowed:false,
  pageToPageTextJoinsApproved:false,
  productionImportAllowed:false});
}
