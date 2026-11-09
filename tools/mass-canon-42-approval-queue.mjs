// Editorial-only closure queue for the 42 unresolved 1962 Canon rubric cues.
// Source readiness is NOT liturgical, linguistic or live-action approval.
// All 65-card LIVE/MISSAL presentation and the priest/Schola clocks stay untouched.
const CUE=/^AO\.SM\.C\d{4}$/;
const ACTION=/^AO\.CANON\.R62\.\d{3}$/;
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const EMPTY=Object.freeze([]);
const fail=message=>{throw new Error("Canon approval queue: "+message);};
const count=(items,fn)=>items.filter(fn).length;
const sourceUrls=links=>{
  if(!Array.isArray(links)||!links.length||
     !links.every(x=>typeof x==="string"&&x.startsWith("https://")))
    fail("source locations absent or unsupported");
  return Object.freeze([...links]);
};
export function buildCanon42ApprovalQueue({
  promotion,firstPass,complex,printed,form="LOW",editorialPreview=false,
}={}){
  // No production reader may acquire the research queue by default.
  if(editorialPreview!==true||!FORMS.has(String(form).toUpperCase()))
    return Object.freeze({status:"EDITORIAL_REVIEW_DISABLED",
      canPublish:false,publicationReady:0,rows:EMPTY});
  if(promotion?.schema!=="ao-mass-canon-42-rubric-promotion-review-v1"||
     promotion.status!=="EDITORIAL_TRIAGE_REQUIRES_INDEPENDENT_SOURCE_AND_COPY_APPROVAL"||
     promotion.counts?.gapCandidates!==42||
     firstPass?.schema!=="ao-canon-first-pass-19-ritus-source-review-v1"||
     firstPass.status!=="SOURCE_EVENTS_CHECKED_FRENCH_PUBLICATION_NOT_APPROVED"||
     firstPass.totals?.reviewed!==19||firstPass.totals?.published!==0||
     firstPass.totals?.draftAligned!==18||firstPass.totals?.copyPrecisionHold!==1||
     complex?.schema!=="ao-canon-complex-23-ritus-source-review-v1"||
     complex.status!=="CEREMONIAL_SEQUENCING_AND_SOURCE_REVIEW_COMPLETE_PUBLICATION_BLOCKED"||
     complex.totals?.complexReviewed!==23||complex.totals?.publicationReady!==0||
     printed?.schema!=="ao-canon-29-printed-page-witness-crosswalk-v1"||
     printed.status!=="ALL_29_SOURCE_CASES_PAGE_LOCATED_NO_INDEPENDENT_SIGNOFF"||
     printed.counts?.cases!==29||
     ["independent1962FacsimileApproved","bilingualCopyApproved",
      "actionClockApproved","livePublished"].some(k=>printed.counts?.[k]!==0)||
     !Array.isArray(promotion.decisions)||promotion.decisions.length!==42||
     !Array.isArray(firstPass.rows)||firstPass.rows.length!==19||
     !Array.isArray(complex.rows)||complex.rows.length!==23||
     !Array.isArray(printed.records)||printed.records.length!==29)
    fail("complete original unpublished 19/23/29 source ledgers required");
  const first=new Map(),second=new Map(),page=new Map();
  for(const row of firstPass.rows){
    if(!CUE.test(row?.cueId)||!ACTION.test(row?.actionId)||
       first.has(row.actionId)||row.eventSourceCheck!=="CHECKED_AGAINST_1962_RITUS"||
       row.publication!=="BLOCKED_PENDING_APPROVAL"||
       row.originalDraftRemainsUnpublished!==true||
       row.priestClock!=="INDEPENDENT_OBSERVED_PRIEST_ACTION_REQUIRED"||
       row.faithfulPosture!=="NO_AUTOMATIC_DERIVATION"||
       row.frenchDraftId!==row.actionId)
      fail("unverified first-pass source or proposed LIVE state");
    sourceUrls(row.sourceUrls);
    first.set(row.actionId,row);
  }
  for(const row of complex.rows){
    if(!CUE.test(row?.cueId)||!ACTION.test(row?.actionId)||
       first.has(row.actionId)||second.has(row.actionId)||
       row.preserveSourceCueId!==true||row.copyApproval!=="REQUIRED"||
       row.displayInLive!=="BLOCKED_PENDING_INDEPENDENT_EDITORIAL_AND_RUNTIME_ACCEPTANCE"||
       row.sourceClock!=="PRIEST_AND_MINISTER_OBSERVATION_INDEPENDENT_FROM_READER"||
       !row.issueClass||!row.requiredPresentationGate)
      fail("unverified complex source or actor/ceremony clock");
    sourceUrls(row.checkedSources);
    second.set(row.actionId,row);
  }
  for(const row of printed.records){
    if(!CUE.test(row?.cueId)||!ACTION.test(row?.actionId)||
       page.has(row.actionId)||row.canPublish!==false||
       row.independentCopySignoff!=="NOT_GRANTED"||
       row.independentCeremonialSignoff!=="NOT_GRANTED"||
       row.exactLiveClockObserved!==false||
       row.witness?.primary1962PrintedFacsimileVerified!==false||
       !Array.isArray(row.witness?.pdfPageNumbers)||
       !row.witness.pdfPageNumbers.length)
      fail("29 flagged source witnesses unexpectedly claim approval");
    page.set(row.actionId,row);
  }
  const seen=new Set(),rows=[];
  for(const decision of promotion.decisions){
    const id=decision?.candidateActionId, cue=decision?.cueId;
    if(!CUE.test(cue)||!ACTION.test(id)||seen.has(id)||
       decision.publication!=="NOT_APPROVED_NOT_VISIBLE")
      fail("noncanonical, duplicated or approved promotion decision");
    seen.add(id);
    const one=first.get(id),two=second.get(id);
    if(Boolean(one)===Boolean(two)||
       (one??two).cueId!==cue||
       decision.reviewGate!==(one
         ?"FIRST_PASS_REVIEW_READY_FOR_EDITORIAL_SIGNOFF"
         :"SECOND_PASS_REQUIRED_BEFORE_EDITORIAL_SIGNOFF"))
      fail("19/23 review-gate identity drift at "+id);
    const witness=page.get(id);
    if(witness&&witness.cueId!==cue)
      fail("printed witness action and Canon cue mismatch at "+id);
    const copyPrecision=one?.copyReview==="EDIT_PRECISION_BEFORE_EDITOR_SIGNOFF";
    if(one&&!copyPrecision&&one.copyReview!=="SOURCE_ALIGNED_PENDING_EDITOR_SIGNOFF")
      fail("unknown first-pass copy adjudication at "+id);
    if(copyPrecision&&(!one.proposedOriginalFrenchCorrection||
       !one.qualificationNote))
      fail("first-pass text correction evidence missing at "+id);
    rows.push(Object.freeze({
      cueId:cue,actionId:id,phase:decision.phase,
      form:String(form).toUpperCase(),
      queue:one?"FIRST_PASS_FRENCH_COPY":"SECOND_PASS_CEREMONIAL",
      sourceStatus:one?"RITUS_SOURCE_EVENT_CHECKED":"COMPLEX_SOURCE_REVIEW_ONLY",
      sourceSection:one?one.sourceSection:two.sourceSection,
      sourceLinks:sourceUrls(one?one.sourceUrls:two.checkedSources),
      reviewIssue:one?(copyPrecision?"COPY_PRECISION_HOLD":"EDITORIAL_SIGNOFF_PENDING"):two.issueClass,
      gate:decision.reviewGate,
      copyCorrectionCandidate:copyPrecision?one.proposedOriginalFrenchCorrection:null,
      copyCorrectionQualification:copyPrecision?one.qualificationNote:null,
      actorAndClockApproval:"INDEPENDENT_OBSERVATION_REQUIRED",
      independentSourceApproval:"NOT_GRANTED",
      bilingualCopyApproval:"NOT_GRANTED",
      readerAcceptance:"NOT_GRANTED",
      printedWitnessStatus:witness?"PAGE_LOCATED_NOT_FACSIMILE_APPROVED":"NOT_IN_29_FLAGGED_CASES",
      printedPageNumbers:Object.freeze([...(witness?.witness.pdfPageNumbers??[])]),
      printedWitnessIndependentlyApproved:false,
      canPublish:false,publication:"EDITORIAL_ONLY_NOT_VISIBLE",
      liveText:null,priestActionNow:null,faithfulPosture:null,
    }));
  }
  if(seen.size!==42||first.size!==19||second.size!==23||
     count(rows,x=>x.queue==="FIRST_PASS_FRENCH_COPY")!==19||
     count(rows,x=>x.queue==="SECOND_PASS_CEREMONIAL")!==23||
     count(rows,x=>x.reviewIssue==="COPY_PRECISION_HOLD")!==1||
     !rows.some(x=>x.cueId==="AO.SM.C0187"&&
       x.reviewIssue==="COPY_PRECISION_HOLD")||
     count(rows,x=>x.printedWitnessStatus==="PAGE_LOCATED_NOT_FACSIMILE_APPROVED")!==18||
     rows.some(x=>x.canPublish||x.liveText!==null||x.priestActionNow!==null||
       x.faithfulPosture!==null))
    fail("42-cue source coverage, known C0187 hold or no-publication gate drift");
  // Editors review source-aligned copy first, the precision correction next,
  // and the source/ceremony-dependent 23 in a separate lane.
  const priority={"EDITORIAL_SIGNOFF_PENDING":0,"COPY_PRECISION_HOLD":1};
  rows.sort((a,b)=>(a.queue==="FIRST_PASS_FRENCH_COPY"?0:1)-
                    (b.queue==="FIRST_PASS_FRENCH_COPY"?0:1)||
                    (priority[a.reviewIssue]??2)-(priority[b.reviewIssue]??2)||
                    a.cueId.localeCompare(b.cueId));
  return Object.freeze({
    status:"42_CANON_CUES_SOURCE_TRIAGED_NOT_APPROVED",
    canPublish:false,publicationReady:0,
    counts:Object.freeze({total:42,sourceAlignedCopy:18,copyPrecisionHold:1,
      complexCeremonial:23,flaggedPrintedWitnessHolds:18,
      originalPrintedCases:29,independentlyApproved:0,livePublished:0}),
    rows:Object.freeze(rows),
  });
}
