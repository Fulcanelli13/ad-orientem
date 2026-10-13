// Editorial Canon review packet: join verified R17 source spans with the
// single 42-cue detailed-rubric draft owner. NEVER wire this into LIVE output.
// No draft French or inferred actor event can cross the public reader boundary.
const CUE=/^AO[.]SM[.]C[0-9]{4}$/;
const ACTION=/^AO[.]CANON[.]R62[.][0-9]{3}$/;
const EMPTY=Object.freeze([]);
const SUPPORTED_FORMS=new Set([
  "LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN",
]);
function freezeRows(rows){return Object.freeze(rows.map(x=>Object.freeze(x)));}
export function buildCanon42EditorialReviewPacket({
  inlineProjection=null,backfillController=null,
  form="LOW",editorialPreview=false,
}={}){
  // A plain production invocation receives no rubrics and no draft text.
  if(editorialPreview!==true||!SUPPORTED_FORMS.has(String(form).toUpperCase()))
    return Object.freeze({
      status:"EDITORIAL_REVIEW_DISABLED",canPublish:false,publicationReady:0,
      reviewedCueCount:0,rows:EMPTY,
    });
  if(inlineProjection?.status!=="EDITORIAL_PREVIEW_ONLY"||
     inlineProjection?.canPublish!==false||
     inlineProjection?.publicationReady!==0||
     !Array.isArray(inlineProjection.paragraphs)||
     typeof backfillController?.project!=="function"||
     backfillController?.audit?.candidateCoverage!==42||
     backfillController?.audit?.newlyPublished!==0)
    throw new Error("Complete unpublished Canon source/backfill evidence required");
  const records=[],seen=new Set();
  for(const paragraph of inlineProjection.paragraphs){
    if(paragraph?.canPublish!==false)throw new Error("Inline projection attempted LIVE publication");
    for(const placement of paragraph.placements??[]){
      const cue=placement.cueId;
      if(!CUE.test(String(cue))||!ACTION.test(String(placement.actionId))||
         seen.has(cue)||placement.canPublish!==false||
         placement.publication!=="NOT_APPROVED_NOT_VISIBLE"||
         placement.displayText!==null||
         placement.priestActionNow!==null||placement.faithfulPosture!==null)
        throw new Error("Canon rubric source identity, duplicate or publication leak at "+cue);
      seen.add(cue);
      const detail=backfillController.project(cue,{form,editorialPreview:true});
      const backfill=detail.candidate;
      if(detail.canPublish!==false||detail.previewEnabled!==true||
         !backfill||backfill.cueId!==cue||backfill.actionId!==placement.actionId||
         backfill.actor!=="PRIEST"||
         backfill.canPublish!==false||backfill.publishable!==false||
         backfill.isObservedNow!==false||!backfill.draftFrenchRubric ||
         backfill.sourceLocator==null||!Array.isArray(backfill.sourceUrls))
        throw new Error(cue+": Canon R17 placement/backfill identity mismatch");
      // The preview is useful to an editor but may not claim that the
      // French is approved, that a priest event is happening now, or
      // that a form-dependent deacon operation is a priest gesture.
      const spanRows=freezeRows(placement.spans.map(span=>({
        start:span.start,end:span.end,latin:span.latin,
        sourceCharactersUnchanged:span.sourceCharactersUnchanged===true,
      })));
      const stageRows=freezeRows(backfill.stageIds.map(id=>({id})));
      const formRoles=freezeRows(backfill.formOwnedStages.map(x=>({...x})));
      records.push(Object.freeze({
        cueId:cue,actionId:placement.actionId,
        paragraphId:paragraph.paragraphId,
        reviewTrack:placement.reviewTrack,reviewGate:placement.reviewGate,
        placementPolicy:placement.placementPolicy,
        sourceAnchorKind:placement.sourceAnchorKind,
        anchorStatus:placement.status,
        sourceLatinField:placement.surfaceField,
        canonicalCorrectionId:placement.canonicalCorrectionId,
        spans:spanRows,
        ritusLocator:backfill.sourceLocator,
        sourceUrls:Object.freeze([...backfill.sourceUrls]),
        ceremonialStageIds:stageRows,conditionalMinisterStages:formRoles,
        reviewFlags:Object.freeze([...backfill.reviewerFlags]),
        frenchCopyDraft:backfill.draftFrenchRubric,
        copyApproval:"NOT_APPROVED",
        ceremonialApproval:"NOT_APPROVED",
        readerAcceptance:"NOT_APPROVED",
        readerDisplayText:null,priestActionNow:null,faithfulPosture:null,
        canPublish:false,publication:"EDITORIAL_REVIEW_ONLY",
      }));
    }
  }
  if(seen.size!==42||inlineProjection.unmatchedGapCueIds?.length!==0)
    throw new Error("Editorial Canon review needs all 42 gap cues exactly once");
  if(records.some(r=>(r.sourceAnchorKind==="SOURCE_LATIN_WORDS"&&
     (r.anchorStatus!=="WORD_MATCH_EXACT"||r.spans.length===0))||
    (r.sourceAnchorKind==="ORDERED_NON_TEXT_CEREMONY"&&
     (r.anchorStatus!=="NON_TEXT_SOURCE_EVENT"||r.spans.length!==0))))
    throw new Error("Unverified Canon Latin word placement must not enter editorial signoff");
  return Object.freeze({
    status:"COMPLETE_SOURCE_REFERENCED_EDITORIAL_PACKET_NOT_PUBLISHED",
    canPublish:false,publicationReady:0,reviewedCueCount:records.length,
    rows:Object.freeze(records),
    approvalRequirements:Object.freeze([
      "INDEPENDENT_ORIGINAL_FRENCH_COPY_SIGNOFF",
      "RITUS_AND_FORM_DEPENDENT_CEREMONY_SIGNOFF",
      "R17_FOUR_FORM_PHONE_AND_GESTURE_ACCEPTANCE",
      "SEPARATE_EXPLICIT_PRODUCTION_RELEASE",
    ]),
  });
}
