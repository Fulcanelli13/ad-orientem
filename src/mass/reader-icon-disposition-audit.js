/**
 * Decision-support audit for the final 17 unbound Mass gesture records.
 * This is NOT consumed by LIVE/MISSAL. Sources, clocks, user-approved artwork,
 * posture profiles, R17 published events and v4.6 assets remain unchanged.
 */
const P=new Set(["REDESIGN_REQUIRED","EXACT_ARTWORK_NOT_PRESENT"]);
const F=new Set(["SOURCE_PROFILE_GUIDANCE","SEQUENCE_TEXT_ONLY",
 "LOCAL_CUSTOM_TEXT_ONLY","DEVOTIONAL_TEXT_ONLY"]);
const known=/^GM\.[PF]\.C\d{4}\.\d{2}$/;
const safePath=/^assets\/review\/mass-icon-candidates\/[a-z0-9-]+\.svg$/;
const expected=Object.freeze({
 "GM.P.C0117.01":"REDESIGN_REQUIRED",
 "GM.P.C0155.01":"EXACT_ARTWORK_NOT_PRESENT",
 "GM.P.C0161.01":"REDESIGN_REQUIRED",
 "GM.P.C0169.01":"EXACT_ARTWORK_NOT_PRESENT",
 "GM.P.C0193.01":"EXACT_ARTWORK_NOT_PRESENT",
 "GM.P.C0204.01":"EXACT_ARTWORK_NOT_PRESENT",
 "GM.P.C0263.01":"REDESIGN_REQUIRED",
 "GM.F.C0021.01":"SOURCE_PROFILE_GUIDANCE",
 "GM.F.C0023.01":"SEQUENCE_TEXT_ONLY",
 "GM.F.C0056.01":"LOCAL_CUSTOM_TEXT_ONLY",
 "GM.F.C0096.01":"SOURCE_PROFILE_GUIDANCE",
 "GM.F.C0173.01":"SEQUENCE_TEXT_ONLY",
 "GM.F.C0174.01":"SEQUENCE_TEXT_ONLY",
 "GM.F.C0179.01":"SEQUENCE_TEXT_ONLY",
 "GM.F.C0235.01":"LOCAL_CUSTOM_TEXT_ONLY",
 "GM.F.C0237.01":"LOCAL_CUSTOM_TEXT_ONLY",
 "GM.F.C0242.01":"DEVOTIONAL_TEXT_ONLY",
});
export const NO_AUTO_GESTURE_ICON_PROMOTION=true;
export function auditGestureIconDispositions({dispositions,matrix,bank}={}){
 const issues=[],items=dispositions?.items;
 const issue=(code,id)=>issues.push(id?code+":"+id:code);
 if(dispositions?.schema!=="ao-mass-gesture-icon-disposition-v1" ||
    dispositions?.authority!=="EDITORIAL_REVIEW_ONLY_NO_RUNTIME_BINDINGS" ||
    !Array.isArray(items))issue("INVALID_DISPOSITION_REGISTRY");
 if(matrix?.schema!=="ao-mass-gesture-matrix-v1"||
    matrix?.status!=="CANONICAL_GESTURE_SOT"||
    matrix?.invariants?.primaryRubricalAuthority!=="ROMAN_MISSAL_1962" ||
    !Array.isArray(matrix.items))issue("INVALID_CANONICAL_MATRIX");
 if(bank?.schema!=="ao-mass-v46-master-icon-bank-v1"||
    !Array.isArray(bank.assets))issue("INVALID_FROZEN_MASTER_BANK");
 const pending=matrix?.items?.filter(x=>x.iconStatus==="PENDING_EXACT_MASTER")??[];
 const bound=matrix?.items?.filter(x=>x.iconStatus==="V46_SEMANTIC_BINDING")??[];
 if(matrix?.items?.length!==142||bound.length!==125||pending.length!==17)
   issue("CANONICAL_142_125_17_PARITY");
 if(bank?.assets?.length!==67)issue("FROZEN_MASTER_67_PARITY");
 const compare=new Set(bank?.assets?.map(x=>x.key)??[]);
 const pendingById=new Map(pending.map(x=>[x.id,x]));
 const seen=new Set;
 for(const row of items??[]){
  const id=row?.id;
  if(!known.test(id??"")||seen.has(id))issue("INVALID_OR_DUPLICATE_ID",id);
  seen.add(id);
  const original=pendingById.get(id);
  if(!original)issue("NO_EXACT_PENDING_SOURCE_ROW",id);
  if(original && (row.actor!==original.actor||
     row.actor!==(id.startsWith("GM.P.")?"PRIEST":"FAITHFUL")||
     original.iconKey!=null||original.displayPrimary!==(row.actor==="PRIEST")||
     original.cueId!== "AO.SM."+id.slice(5,10)))issue("SOURCE_OR_ACTOR_DRIFT",id);
  if(row.disposition!==expected[id])issue("UNREVIEWED_DISPOSITION_CHANGE",id);
  if(row.actor==="PRIEST"){
   if(!P.has(row.disposition)||original?.authorityClass!=="1962_NORMATIVE"||
     !original?.sources?.includes("MR62_RITUS")||row.requiresUserArtApproval!==true)
     issue("INVALID_PRIEST_ART_AUTHORITY",id);
  }else if(row.actor==="FAITHFUL"){
   if(!F.has(row.disposition)||original?.authorityClass!=="FAITHFUL_CUE_SOT"||
      original?.runtimeProfile!=="CURRENT_GESTURE_PROFILE_RULES"||
      row.requiresUserArtApproval!==false)issue("FAITHFUL_PROFILE_GUARD",id);
  }
  if(!compare.has(row.comparisonMasterKey))issue("UNKNOWN_APPROVED_COMPARISON_MASTER",id);
  if(row.disposition==="REDESIGN_REQUIRED"){
   // Failed review files remain historical comparison artifacts only. They
   // may NEVER become an active image, even if a renderer starts accepting
   // SVG candidate paths as master keys in a future refactor.
   if(!safePath.test(row.reviewCandidate??""))
     issue("INVALID_REJECTED_REVIEW_PATH",id);
   const result=row.artworkReview;
   if(result?.verdict!=="EDITORIAL_NOT_RELEASE_ELIGIBLE"||
      result?.candidateCanBePromoted!==false||
      result?.userRejection!==false||
      result?.redesignNeedsFreshSourceReference!==true||
      JSON.stringify(result?.visualInspectedAtPx)!=="[32,48,64]"||
      !/^https:\/\//.test(result?.sourceUrl??"")||
      !Array.isArray(result.issues)||result.issues.length<3)
      issue("BLOCKED_ART_REVIEW_INCOMPLETE",id);
  }else if(row.reviewCandidate!==null||row.artworkReview!=null)
    issue("FORBIDDEN_CANDIDATE_ON_TEXT_HOLD",id);
  if(row.releaseAssetKey!==null||row.sourceTextRetained!==true||
     row.actorSpecific!==true||typeof row.reason!=="string"||row.reason.length<36)
    issue("SILENT_ART_PROMOTION_OR_MISSING_REASON",id);
 }
 for(const original of pending)if(!seen.has(original.id))issue("MISSING_EXACT_SOURCE_CUE",original.id);
 const reviewed=[...(items??[])].filter(x=>x.actor==="PRIEST");
 const guidance=[...(items??[])].filter(x=>x.actor==="FAITHFUL");
 if(reviewed.length!==7||guidance.length!==10)issue("SEVEN_TEN_ACTOR_SPLIT");
 const candidates=reviewed.filter(x=>x.disposition==="REDESIGN_REQUIRED");
 if(candidates.length!==3||new Set(candidates.map(x=>x.reviewCandidate)).size!==2)
   issue("TWO_UNAPPROVED_DRAWINGS_THREE_REDRAW_CUES");
 if(dispositions?.policy?.noAutoPromotion!==true||
    dispositions?.policy?.authenticSourceRequired!==true||
    dispositions?.policy?.userArtApprovalRequired!==true)
   issue("SOURCE_FIRST_USER_APPROVAL_POLICY");
 return Object.freeze({
  ok:issues.length===0,issues:Object.freeze(issues),
  matrixRows:matrix?.items?.length??0,alreadyBound:bound.length,
  stillUnbound:pending.length,priestExactArtHolds:reviewed.length,
  faithfulNoStandaloneIcon:guidance.length,
  artworkProposalCueUses:candidates.length,
  distinctUnapprovedCandidateFiles:new Set(candidates.map(x=>x.reviewCandidate)).size,
  artworkReadyForUserApproval:0,
  redesignRequiredCueUses:candidates.length,
  productionChangesAuthorized:0,
  reviewStatus:"SOURCE_AND_SIZE_REVIEW_FAILED_REDRAW_REQUIRED",
 });
}
