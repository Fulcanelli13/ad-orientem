// Internal review of 29 unresolved French/English Canon copies.
// No LIVE reader consumer may infer an act from text, placement, or scrolling.
const ID=/^AO[.]CANON[.]R62[.][0-9]{3}$/;
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const REVIEW_STATUS="ALL_29_FLAGGED_SOURCE_AND_COPY_ISSUES_TRIAGED_NOT_CERTIFIED";
function immutable(v){return Object.freeze(v);}
const OFF=immutable({status:"EDITORIAL_REVIEW_DISABLED",canPublish:false,rows:immutable([])});

export function validateCanon29FlaggedAdjudication({risks,triage,bilingual,french,triggers}={}){
 if(risks?.schema!=="ao-canon-29-flagged-bilingual-adjudication-v1"||
    risks.status!==REVIEW_STATUS||risks.rows?.length!==29||
    risks.counts?.flagged!==29||risks.counts.highPriority!==21||
    risks.counts.standardPriority!==8||
    risks.counts.originalSourceSignedOff!==0||
    risks.counts.bilingualCopyApproved!==0||risks.counts.published!==0||
    triage?.status!=="COMPLETE_FLAG_TRIAGE_ONLY_NO_COPY_SIGNOFF"||
    triage.rows?.length!==29||bilingual?.rows?.length!==62||
    bilingual.counts?.published!==0||french?.rows?.length!==62||
    french.status!=="SOURCE_RECHECKED_ORIGINAL_FRENCH_DRAFT_NOT_PUBLISHED"||
    triggers?.rows?.length!==62)
  throw Error("29 Canon flagged copies require complete unpublished source ledgers");
 const flags=new Map(triage.rows.map(x=>[x.actionId,x]));
 const br=new Map(bilingual.rows.map(x=>[x.actionId,x]));
 const fr=new Map(french.rows.map(x=>[x.id,x]));
 const source=new Map(triggers.rows.map(x=>[x.id,x]));
 const seen=new Set(),reviewCodes=new Set(),rows=[];
 for(const [i,r] of risks.rows.entries()){
  const t=flags.get(r?.actionId),b=br.get(r?.actionId),
   f=fr.get(r?.actionId),s=source.get(r?.actionId);
  if(!ID.test(String(r?.actionId??""))||r.actionId!==triage.rows[i].actionId||
     seen.has(r.actionId)||!t||!b||!f||!s||
     t.cueId!==r.cueId||b.cueId!==r.cueId||f.cueId!==r.cueId||
     s.cueId!==r.cueId||t.actor!==r.actor||b.actor!==r.actor||
     f.actor!==r.actor||s.actor!==r.actor||
     r.priority!==t.priority||r.ritusLocator!==t.ritusLocator||
     r.sourceAnchorType!==s.sourceAnchorType||
     r.wordAnchor!==s.verifiedSourceWordAnchor||
     JSON.stringify(r.existingRiskFlags)!==JSON.stringify(t.issues)||
     JSON.stringify(r.sourceUrls)!==JSON.stringify(t.sourceUrls)||
     JSON.stringify(r.orderedStageIds)!==JSON.stringify(s.stageSequence.map(x=>x.id))||
     r.editorialDisplaySurface!==b.reviewSurface||
     !/^[A-Z_]+$/.test(String(r.reviewCode))||
     !String(r.unresolvedIssue?.en??"").trim()||
     !String(r.unresolvedIssue?.fr??"").trim()||
     r.unresolvedIssue.en.length<30||r.unresolvedIssue.fr.length<30||
     f.editorialFlags.length===0||
     f.reviewState!=="ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY"||
     b.copyApproval!=="NOT_APPROVED"||
     !Array.isArray(r.sourceUrls)||r.sourceUrls.length<2||
     !r.sourceUrls.every(u=>u.startsWith("https://"))||
     r.sourceSignoff!=="NOT_APPROVED"||
     r.copyApproval!=="NOT_APPROVED"||
     r.livePublication!=="DO_NOT_PUBLISH"||
     r.canPublish!==false||r.observedNow!==false||
     !Array.isArray(r.evidenceStillRequired)||
     r.evidenceStillRequired.join(",")!==
      "ORIGINAL_1962_SOURCE_CHECK,INDEPENDENT_BILINGUAL_COPY_SIGNOFF,SOURCE_FORM_AND_ACTOR_EVENT_REVIEW,FOUR_FORM_R17_MOBILE_ACCEPTANCE")
   throw Error("Canon flagged-source/actor/copy identity or publication drift: "+r?.actionId);
  if(r.actor==="SERVER"&&
     !["SERVER_ACTION","ANTICIPATORY_SERVER","MASS_FORM"].includes(r.reviewCode))
   throw Error("Canon server event wrongly classed as priest gesture: "+r.actionId);
  if(r.reviewCode==="CONSECRATION_FOCUS"&&
     b.reviewSurface!=="FOCUS_WORDS_NO_DUPLICATE")
   throw Error("Consecratory text must not get duplicate ribbon caption");
  if(r.reviewCode==="INDEPENDENT_EVENT"&&
     b.reviewSurface!=="INDEPENDENT_STAGE_EDITORIAL_ONLY")
   throw Error("Elevation/genuflection requires witnessed clock");
  if(r.reviewCode==="PERSISTENT_STATE"&&
     ["INLINE_ATOMIC_EDITORIAL","INDEPENDENT_STAGE_EDITORIAL_ONLY"].includes(b.reviewSurface))
   throw Error("Sustained states must not become flash gestures");
  if(r.reviewCode==="DEACON_CONDITION"&&
     !["028","034","055","059"].includes(r.actionId.slice(-3)))
   throw Error("Only independently sourced conditional chalice roles");
  seen.add(r.actionId);reviewCodes.add(r.reviewCode);
  rows.push(immutable({actionId:r.actionId,cueId:r.cueId,actor:r.actor,
   priority:r.priority,ritusLocator:r.ritusLocator,reviewCode:r.reviewCode,
   displaySurface:r.editorialDisplaySurface,
   sourceUrls:immutable([...r.sourceUrls]),
   unresolvedIssue:immutable({...r.unresolvedIssue}),
   shortDraft:immutable({...b.shortDraft}),
   guideDraft:immutable({en:b.guideDraft.en,fr:f.revisedFrenchRubric}),
   sourceSignoff:"NOT_APPROVED",copyApproval:"NOT_APPROVED",
   observedNow:false,canPublish:false}));
 }
 if(seen.size!==29||rows.filter(x=>x.priority==="HIGH").length!==21||
    rows.filter(x=>x.priority==="STANDARD").length!==8||
    rows.filter(x=>x.actor==="SERVER").length!==4||
    reviewCodes.size<12)
  throw Error("Canon 29-issue review coverage, severity or minister roles drift");
 return immutable({status:"29_FLAGGED_BILINGUAL_ISSUES_CROSSCHECKED_NOT_APPROVED",
  pending:29,approved:0,published:0,canPublish:false,
  uniqueRiskClasses:reviewCodes.size,rows:immutable(rows)});
}

export function createCanon29FlaggedAdjudicationController(data){
 const audit=validateCanon29FlaggedAdjudication(data);
 const byId=new Map(audit.rows.map(x=>[x.actionId,x]));
 function project({editorialPreview=false,form="LOW",actionIds=null}={}){
  if(editorialPreview!==true||!FORMS.has(String(form).toUpperCase()))return OFF;
  const selected=actionIds==null?audit.rows:
   Array.isArray(actionIds)?actionIds.map(x=>byId.get(x)):[];
  if(selected.some(x=>!x))throw Error("Unknown flagged Canon review action");
  return immutable({status:"EDITORIAL_FLAGGED_COPY_REVIEW_ONLY",
   canPublish:false,sourceSignoff:"NOT_APPROVED",
   rows:immutable([...selected])});
 }
 return immutable({audit,project});
}
