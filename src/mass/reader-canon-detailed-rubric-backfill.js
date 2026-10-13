// Editorial-only coverage of the 42 Canon cues without a published detailed
// rubric. The single French text owner remains the existing R62 draft corpus.
// This bridge MUST NOT change live R17 priest rails, Missal text or cues.
const ID=/^AO\.CANON\.DET\.C\d{4}$/;
const CUE=/^AO\.SM\.C\d{4}$/;
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const STAT="SOURCE_RECONCILED_42_EDITORIAL_ONLY_NOT_PUBLISHED";
const KINDS=new Set(["SOURCE_LATIN_WORDS","ORDERED_NON_TEXT_CEREMONY"]);

export function validateCanonDetailedRubricBackfill({backfill,canonData,gapData,triggerAudit,frenchReview}={}){
  if(backfill?.schema!=="ao-canon-42-detailed-rubric-editorial-backfill-v1" ||
     backfill.status!==STAT ||!Array.isArray(backfill.items)||
     backfill.items.length!==42||backfill.counts?.publishedByThisBatch!==0||
     canonData?.rows?.length!==58||gapData?.rows?.length!==58||
     triggerAudit?.rows?.length!==62||frenchReview?.rows?.length!==62)
    throw Error("Canon detailed-rubric backfill requires complete unpublished source witnesses");
  const missing=canonData.rows.filter(x=>x.gapPending===true);
  const missingGap=gapData.rows.filter(x=>x.isPriestRubricCoverageGap===true);
  if(missing.length!==42||missingGap.length!==42||
     canonData.rows.filter(x=>x.existingDetailedRubricIds?.length).length!==13)
    throw Error("Canon existing-published versus missing coverage denominator drift");
  const canon=new Map(canonData.rows.map(x=>[x.cueId,x]));
  const gaps=new Map(gapData.rows.map(x=>[x.cueId,x]));
  const triggers=new Map(triggerAudit.rows.map(x=>[x.id,x]));
  const french=new Map(frenchReview.rows.map(x=>[x.id,x]));
  const seen=new Set(),kinds={SOURCE_LATIN_WORDS:0,ORDERED_NON_TEXT_CEREMONY:0},rows=[];
  for(const [index,row] of backfill.items.entries()){
    const c=canon.get(row?.cueId),gap=gaps.get(row?.cueId),t=triggers.get(row?.sourceActionId),fr=french.get(row?.sourceActionId);
    if(!ID.test(String(row?.id??""))||!CUE.test(String(row?.cueId??""))||
       row.id!=="AO.CANON.DET."+row.cueId.split(".").at(-1)||
       seen.has(row.cueId)||row.cueId!==missing[index]?.cueId||
       !c?.gapPending||c.existingDetailedRubricIds?.length!==0||
       gap?.isPriestRubricCoverageGap!==true||
       row.existingDetailedRubricIds?.length!==0||
       c.candidateActions.filter(a=>a.actor==="PRIEST").length!==1)
      throw Error("Canon detailed-rubric cue ownership drift at "+row?.cueId);
    const a=c.candidateActions.find(a=>a.actor==="PRIEST");
    if(a.id!==row.sourceActionId||row.frenchDraftActionId!==a.id||
       row.sourceTriggerActionId!==a.id||gap.sourceVerifiedPriestMicroActionIds?.[0]!==a.id||
       !t||!fr||t.cueId!==row.cueId||fr.cueId!==row.cueId||
       t.actor!=="PRIEST"||fr.actor!=="PRIEST"||
       row.ritusLocator!==t.rubricSource||row.ritusLocator!==fr.ritusLocator||
       !KINDS.has(row.anchorClass)||row.anchorClass!==t.sourceAnchorType||
       row.latinAnchor!==t.verifiedSourceWordAnchor||
       JSON.stringify(row.ceremonialStageIds)!==JSON.stringify(t.stageSequence.map(s=>s.id))||
       !Array.isArray(row.sources)||row.sources.length===0||
       JSON.stringify(row.sources)!==JSON.stringify(t.directSourceUrls)||
       !row.sources.every(url=>String(url).startsWith("https://"))||
       !String(fr.revisedFrenchRubric??"").trim()||
       fr.reviewState!=="ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY"||
       row.publication!=="DO_NOT_DISPLAY"||
       row.editorialState!=="SOURCE_CROSSWALK_DRAFT_NOT_APPROVED"||
       row.voice!=="SOURCE_EVENT_ACTUAL_CLOCK_NOT_READER_SCROLL"||
       JSON.stringify(row.reviewFlags)!==JSON.stringify([...new Set([...t.editorialRiskFlags,...fr.editorialFlags])]))
      throw Error("Canon source/French/trigger linkage drift at "+row?.cueId);
    // A genuine word anchor may coexist with separately ordered non-text
    // micro-stages (C0180). Word focus must never activate those stages.
    if(row.anchorClass==="SOURCE_LATIN_WORDS"&&!row.latinAnchor)
      throw Error(row.id+": Latin-word rubric is missing its genuine word anchor");
    if(row.anchorClass==="ORDERED_NON_TEXT_CEREMONY"&&
       (row.latinAnchor!==null||row.ceremonialStageIds.length===0))
      throw Error(row.id+": ceremonial event may not invent word anchors");
    const expectedFormOwned=row.cueId==="AO.SM.C0205"
      ?[{stageId:"AO.CANON.R62.059.02",lowAndCantataActor:"PRIEST",
          solemnActor:"DEACON_WHEN_REQUIRED",solemnMinisterActionId:"AO.CANON.MIN.008",
          currentState:"INDEPENDENT_ROLE_OBSERVATION_REQUIRED"}]:[];
    if(JSON.stringify(row.formOwnedStages)!==JSON.stringify(expectedFormOwned))
      throw Error(row.id+": form-specific stage actor ownership changed");
    seen.add(row.cueId);kinds[row.anchorClass]++;
    rows.push(Object.freeze({cueId:row.cueId,rubricId:row.id,
      actionId:row.sourceActionId,actor:"PRIEST",sourceLocator:row.ritusLocator,
      sourceUrls:Object.freeze([...row.sources]),latinAnchor:row.latinAnchor,
      stageIds:Object.freeze([...row.ceremonialStageIds]),
      formOwnedStages:Object.freeze(row.formOwnedStages.map(x=>Object.freeze({...x}))),
      draftFrenchRubric:fr.revisedFrenchRubric,
      reviewerFlags:Object.freeze([...row.reviewFlags]),
      reviewState:row.editorialState,canPublish:false,publishable:false}));
  }
  if(kinds.SOURCE_LATIN_WORDS!==40||kinds.ORDERED_NON_TEXT_CEREMONY!==2||
     backfill.counts?.candidateCoverage!==42||
     backfill.counts?.sourceGapCues!==42||
     backfill.counts?.existingDetailedRubricCues!==13||
     backfill.counts?.sourceCuesNoDistinctPrescribedMoment!==3||
     backfill.counts?.exactLatinWordAnchored!==40||
     backfill.counts?.orderedNonTextCeremonies!==2)
    throw Error("Canon 42 editorial completion counts have diverged");
  return Object.freeze({sourceGaps:42,candidateCoverage:42,
    publishedDetailedCues:13,newlyPublished:0,
    pendingPublicationApprovals:42,anchorClasses:Object.freeze(kinds),
    rows:Object.freeze(rows),canPublish:false});
}

export function createCanonDetailedRubricEditorialController(witnesses={}){
  const audit=validateCanonDetailedRubricBackfill(witnesses);
  const byCue=new Map(audit.rows.map(row=>[row.cueId,row]));
  function project(cueId,{editorialPreview=false,form="LOW"}={}){
    const id=String(cueId??"");
    const allowed=editorialPreview===true&&FORMS.has(String(form).toUpperCase());
    const candidate=allowed?byCue.get(id)??null:null;
    return Object.freeze({cueId:id,previewEnabled:allowed,canPublish:false,
      candidate:candidate?Object.freeze({...candidate,
        formReviewRequired:true,actorClock:"INDEPENDENT_OBSERVATION_REQUIRED",
        isObservedNow:false,publishable:false}):null,
      status:allowed?"EDITORIAL_DRAFT_NOT_LIVE":"PREVIEW_DISABLED_OR_UNSUPPORTED_FORM"});
  }
  return Object.freeze({audit,project});
}
