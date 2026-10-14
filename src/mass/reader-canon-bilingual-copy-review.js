// Original bilingual Canon copy proposals. This is an EDITORIAL data
// accessor, not a reader renderer or a priest/server observation engine.
// Never use a paragraph scroll, canonical cue, or inferred liturgical time
// to mark these suggestions as approved, published, or observed.
const STATUS="ORIGINAL_BILINGUAL_COPY_DRAFT_REQUIRES_SOURCE_EDITORIAL_SIGNOFF_NOT_PUBLISHED";
const ID=/^AO[.]CANON[.]R62[.][0-9]{3}$/;
const CUE=/^AO[.]SM[.]C[0-9]{4}$/;
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const REVIEW_SURFACES=new Set([
 "GUIDE_ONLY","FOCUS_WORDS_NO_DUPLICATE","PRIEST_RIBBON_STATE_ONLY",
 "PRIEST_VOICE_STATE_ONLY","SERVER_RIBBON_ONLY",
 "PRIEST_MULTI_STAGE_EDITORIAL","INLINE_ATOMIC_EDITORIAL","GUIDE_AND_FORM_CONTEXT",
 "INDEPENDENT_STAGE_EDITORIAL_ONLY",
]);
function immutable(x){return Object.freeze(x);}
const NO_COPY=immutable({status:"EDITORIAL_REVIEW_DISABLED",canPublish:false,
 sourceRows:0,publicationReady:0,rows:immutable([])});

export function validateCanonBilingualCopyReview({bilingual,french,trigger,triage}={}){
 if(bilingual?.schema!=="ao-canon-62-bilingual-two-layer-editorial-review-v1"||
    bilingual.status!==STATUS||!Array.isArray(bilingual.rows)||bilingual.rows.length!==62||
    french?.schema!=="ao-canon-62-french-rubric-review-batch-v1"||
    french.status!=="SOURCE_RECHECKED_ORIGINAL_FRENCH_DRAFT_NOT_PUBLISHED"||
    !Array.isArray(french.rows)||french.rows.length!==62||
    !Array.isArray(trigger?.rows)||trigger.rows.length!==62||
    triage?.status!=="COMPLETE_FLAG_TRIAGE_ONLY_NO_COPY_SIGNOFF"||
    !Array.isArray(triage.rows)||triage.rows.length!==29||
    bilingual.counts?.published!==0||
    bilingual.counts?.linguisticallyApproved!==0||
    bilingual.counts?.ceremoniallyApproved!==0||
    bilingual.counts?.shortEnglish!==62||bilingual.counts?.shortFrench!==62||
    bilingual.counts?.shortFrenchCanonicalLinks!==62||
    bilingual.counts?.guideEnglish!==62||bilingual.counts?.guideFrenchLinked!==62)
  throw Error("Canon bilingual rubric proposals need complete unpublished source witnesses");
 const sourceActions=new Map(french.rows.map(x=>[x.id,x]));
 const triggers=new Map(trigger.rows.map(x=>[x.id,x]));
 const flagged=new Set(triage.rows.map(x=>x.actionId));
 const currentFlags=french.rows.filter(x=>x.editorialFlags.length).map(x=>x.id);
 if(currentFlags.length!==29||flagged.size!==29||
    currentFlags.some(id=>!flagged.has(id)))
  throw Error("Canon source-risk review denominator is not reconciled");
 const ids=new Set(),kindCounts={},surfaceCounts={},rows=[];
 for(const [index,row] of bilingual.rows.entries()){
  const n=String(index+1).padStart(3,"0"),f=sourceActions.get(row?.actionId),
    t=triggers.get(row?.actionId);
  if(!ID.test(String(row?.actionId??""))||!CUE.test(String(row?.cueId??""))||
     row.actionId!=="AO.CANON.R62."+n||ids.has(row.actionId)||
     !f||!t||f.id!==row.actionId||f.cueId!==row.cueId||
     t.cueId!==row.cueId||row.actor!==f.actor||
     row.ritusLocator!==f.ritusLocator||
     row.sourceAnchorType!==t.sourceAnchorType||
     JSON.stringify(row.sourceUrls)!==JSON.stringify(f.sourceURLs)||
     !row.sourceUrls.every(x=>typeof x==="string"&&x.startsWith("https://"))||
     !row.sourceUrls.length||
     row.guideDraft?.frCanonicalActionId!==row.actionId||
     row.shortDraft?.frCanonicalActionId!==row.actionId||
     Object.hasOwn(row.shortDraft??{},"fr")||
     f.shortRubricReviewState!=="ORIGINAL_FRENCH_SHORT_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY"||
     f.reviewState!=="ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY"||
     !String(row.guideDraft?.en??"").trim()||
     /\b(?:reader|scroll|source trigger|generic paragraph|actor ownership|implementation|render|dashboard)\b/i.test(row.guideDraft.en)||
     !String(f.shortFrenchRubricDraft??"").trim()||
     !String(row.shortDraft?.en??"").trim()||
     f.shortFrenchRubricDraft.length>190||row.shortDraft.en.length>190||
     !REVIEW_SURFACES.has(row.reviewSurface)||!row.semanticKind||
     row.displayPolicy!=="EDITORIAL_PREVIEW_ONLY_NOT_LIVE"||
     row.copyApproval!=="NOT_APPROVED"||
     row.ritusFormApproval!=="NOT_APPROVED"||
     row.stageTimingApproval!=="NOT_APPROVED"||
     row.mobileReaderAcceptance!=="NOT_APPROVED"||
     row.canPublish!==false||row.currentlyVisible!==false||
     row.previewPermitted!==true||
     row.automaticallyTriggeredByScroll!==false||
     row.timedStageVerified!==false||
     row.readerDisplayText!==null||row.priestActionNow!==null||
     row.faithfulPosture!==null)
   throw Error("Unapproved Canon bilingual copy/actor/source drift at "+row?.actionId);
  if(f.actor==="SERVER" && !["SERVER_RIBBON_ONLY","GUIDE_ONLY"].includes(row.reviewSurface))
   throw Error(row.actionId+": a respondent/server is not a priest rubric");
  if(row.sourceAnchorType==="ORDERED_NON_TEXT_CEREMONY" &&
    row.reviewSurface==="INLINE_ATOMIC_EDITORIAL")
   throw Error(row.actionId+": non-text ceremony requires independently observed timing");
  if(row.reviewSurface==="FOCUS_WORDS_NO_DUPLICATE" &&
    !["AO.CANON.R62.022","AO.CANON.R62.032"].includes(row.actionId))
   throw Error(row.actionId+": sacramental-focus exception identity mismatch");
  if(row.actionId==="AO.CANON.R62.028"&&
    /^(Il découvre|He uncovers)/.test(f.shortFrenchRubricDraft+"|"+row.shortDraft.en))
   throw Error("Conditional deacon chalice uncovering cannot be the priest's universal action");
  ids.add(row.actionId);
  kindCounts[row.semanticKind]=(kindCounts[row.semanticKind]||0)+1;
  surfaceCounts[row.reviewSurface]=(surfaceCounts[row.reviewSurface]||0)+1;
  rows.push(immutable({actionId:row.actionId,cueId:row.cueId,actor:row.actor,
   sourceAnchorType:row.sourceAnchorType,ritusLocator:row.ritusLocator,
   sourceUrls:immutable([...row.sourceUrls]),
   reviewSurface:row.reviewSurface,semanticKind:row.semanticKind,
   riskReviewRequired:flagged.has(row.actionId),
   shortDraft:immutable({fr:f.shortFrenchRubricDraft,en:row.shortDraft.en}),
   shortFrenchOwnerId:f.id,
   guideDraft:immutable({en:row.guideDraft.en,fr:f.revisedFrenchRubric}),
   guideFrenchOwnerId:f.id,
   canPublish:false,observedNow:false,faithfulPosture:null,
   copyApproval:"NOT_APPROVED"}));
 }
 if(ids.size!==62||rows.filter(x=>x.actor==="PRIEST").length!==58||
    rows.filter(x=>x.actor==="SERVER").length!==4||
    rows.filter(x=>x.riskReviewRequired).length!==29||
    Object.keys(bilingual.counts.reviewSurfaces??{}).length!==REVIEW_SURFACES.size||
    [...REVIEW_SURFACES].some(k=>surfaceCounts[k]!==bilingual.counts.reviewSurfaces[k])||
    rows.filter(x=>x.reviewSurface==="FOCUS_WORDS_NO_DUPLICATE").length!==2)
  throw Error("Canon two-layer complete coverage or anti-duplication counts diverged");
 return immutable({status:"COMPLETE_BILINGUAL_EDITORIAL_COPY_REVIEW_NOT_PUBLISHED",
  count:62,priest:58,minister:4,flagged:29,guideFrenchOwner:"CANONICAL_R62",
  publicationReady:0,canPublish:false,surfaceCounts:immutable(surfaceCounts),
  kindCounts:immutable(kindCounts),rows:immutable(rows)});
}

export function createCanonBilingualCopyReviewController(witnesses={}){
 const audit=validateCanonBilingualCopyReview(witnesses);
 const index=new Map(audit.rows.map(row=>[row.actionId,row]));
 function project({editorialPreview=false,form="LOW",actionIds=null}={}){
  const permitted=editorialPreview===true&&FORMS.has(String(form).toUpperCase());
  if(!permitted)return NO_COPY;
  const chosen=actionIds==null?audit.rows:
   (Array.isArray(actionIds)?actionIds.map(id=>index.get(id)):[]);
  if(chosen.some(x=>!x))throw Error("Unknown Canon source action");
  return immutable({status:"EDITORIAL_BILINGUAL_PREVIEW_NOT_LIVE",
   sourceRows:chosen.length,publicationReady:0,canPublish:false,
   rows:immutable([...chosen])});
 }
 return immutable({audit,project});
}
