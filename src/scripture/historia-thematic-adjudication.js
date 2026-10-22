/**
 * Full-corpus Historia Salutis research crosswalk.
 * Adds reviewed source matches and editorial recommendations to the original
 * 19-pilot evidence. None becomes an approved canonical ID, a location, a
 * published narrative addition, or a Scripture-text copy.
 */
export function composeHistoriaResearchEvidence(base,atlasReview,restorationReview,collections){
 if(base?.schema!=='AO_HISTORIA_THEMATIC_IDENTITY_AND_COVENANT_CONTEXT_V1' ||
    !Array.isArray(base.entries)||base.entries.length!==19 ||
    atlasReview?.schema!=='AO_HISTORIA_28_ATLAS_NAMED_SCENE_REVIEW_V1' ||
    atlasReview.status!=='SCOPED_MATCH_EVIDENCE_NOT_CANONICAL_ATLAS_IDENTITY_APPROVAL' ||
    atlasReview?.entries?.length!==28 ||
    restorationReview?.schema!=='AO_HISTORIA_CORE_RESTORATION_46_EDITORIAL_ADJUDICATION_V1' ||
    restorationReview.status!=='SOURCE_SCREENED_RECOMMENDATIONS_NOT_ACCEPTED' ||
    restorationReview?.entries?.length!==46 ||
    !Array.isArray(collections)||collections.length!==9)
  throw new Error('Historia source evidence owner/version has changed');
 const episodes=collections.flatMap(g=>g.episodes);
 if(episodes.length!==217||new Set(episodes.map(e=>e.id)).size!==217)
  throw new Error('Full classified Scripture inventory is not preserved');
 const source=new Map(episodes.map(e=>[e.id,e]));
 const combined=new Map();
 for(const e of base.entries){
  if(combined.has(e.episodeId)||!source.has(e.episodeId))
   throw new Error('Original thematic evidence ID mismatch');
  combined.set(e.episodeId,{...e});
 }
 for(const e of atlasReview.entries){
  const original=source.get(e.episodeId);
  if(!original ||
    (original.originalInventoryReference??original.reference)!==e.scriptureReference ||
    e.sourceEvidence?.atlasRef!==e.scriptureReference ||
    e.sourceEvidence?.sourceMatch!==true ||
    e.publicationApproved!==false ||
    e.approvedCanonicalEpisodeIdentity!==false ||
    e.authoredCanonicalEpisodeId!==null ||
    e.geographicalGeolocationVerified!==false)
   throw new Error('Atlas source mismatch or accidental approval: '+e.episodeId);
  if(combined.has(e.episodeId))throw new Error('Atlas proposal incorrectly replaces the 19 initial pilots');
  if(e.navigation?.eventKey && (
    e.recommendedRelationship!=='SAME_NAMED_SCRIPTURAL_SCENE_RESEARCH_MATCH' ||
    e.navigation.status!=='PRESENT_IN_VERIFIED_ATLAS_151_STOP_INDEX' ||
    e.navigation.eventKey!=='biblical:event:'+e.sourceEvidence.eventId))
   throw new Error('Unverified Atlas runtime navigation: '+e.episodeId);
  combined.set(e.episodeId,{
   episodeId:e.episodeId,
   atlasIdentity:{
    atlasPlaceId:e.sourceEvidence.placeId,
    atlasEventId:e.sourceEvidence.eventId,
    atlasEventTitle:e.sourceEvidence.atlasLabel,
    atlasSourceReference:e.sourceEvidence.atlasRef,
    relation:e.recommendedRelationship,
    confirmedCanonicalEpisodeId:null,
    geographicalBasis:'SOURCE_NAMED_MATCH_ONLY',
    reviewCaveat:e.sourceScopeCaveat
   },
   atlasRuntimeNavigation:e.navigation?.eventKey?
    {status:'EVENT_PRESENT_IN_ATLAS_151_SEQUENCE',eventKey:e.navigation.eventKey}:
    {status:'DOCUMENTED_NOT_LIVE_OR_SAME_PASSAGE_ONLY',eventKey:null}
  });
 }
 for(const e of restorationReview.entries){
  const original=source.get(e.episodeId);
  if(!original||
    (original.originalInventoryReference??original.reference)!==e.originalInventoryReference ||
    !Array.isArray(e.sourcePartsInResearchReader) ||
    !e.sourcePartsInResearchReader.length ||
    e.publicationApproved!==false || e.mainReaderUpdateApproved!==false ||
    e.namedCanonEventId!==null ||
    e.status!=='EDITORIAL_PROPOSAL_REQUIRES_ACCEPTANCE')
   throw new Error('Restoration review source mismatch or accidental approval: '+e.episodeId);
  if(!e.nearestProposedResearchMovement?.id?.startsWith('HS-M'))
   throw new Error('Missing research-only movement context: '+e.episodeId);
  const current=combined.get(e.episodeId)||{episodeId:e.episodeId};
  if(current.editorialRecommendation)throw new Error('Duplicate main reader recommendation');
  current.editorialRecommendation={
   proposedEditorialDisposition:e.proposedEditorialDisposition,
   reviewRationale:e.editorialRationale,
   nearestMovementId:e.nearestProposedResearchMovement.id,
   selectedSourceOverlapCount:e.selectedScriptureVerseIntersections.length,
   approval:'RESEARCH_RECOMMENDATION_NOT_ACCEPTED',
   insertionApproved:false
  };
  combined.set(e.episodeId,current);
 }
 if(atlasReview.entries.filter(e=>e.navigation?.eventKey).length!==9 ||
    restorationReview.entries.filter(e=>e.selectedScriptureVerseIntersections.length).length!==2 ||
    combined.size!==59)throw new Error('Merged research evidence cardinality changed');
 return Object.freeze({
  schema:'AO_HISTORIA_THEMATIC_RESEARCH_COMPOSED_EVIDENCE_V1',
  status:'RESEARCH_ONLY_NO_PUBLICATION_OR_CANONICAL_IDENTITY_PROMOTION',
  entries:Object.freeze([...combined.values()].map(e=>Object.freeze(e)))
 });
}
