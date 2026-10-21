import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url),"utf8"));
const crosswalk=read("../data/research/historia-p4-movement-theatre-citation-crosswalk.v1.json");
const seam=read("../data/research/historia-p4-m20-m37-literary-review-queue.v1.json");
const patriarchs=read("../data/research/historia-p4-patriarchs-witness-desk-audit.v1.json");
const deliverance=read("../data/research/historia-p4-deliverance-witness-desk-audit.v1.json");
const wilderness=read("../data/research/historia-p4-wilderness-sinai-witness-desk-audit.v1.json");
const wanderings=read("../data/research/historia-p4-wanderings-three-witness-desk-audit.v1.json");
const incarnation=read("../data/research/historia-p4-incarnation-three-witness-desk-audit.v1.json");
const ministry=read("../data/research/historia-p4-public-ministry-three-witness-desk-audit.v1.json");
const passionRisen=read("../data/research/historia-p4-passion-risen-three-witness-desk-audit.v1.json");
const actsMission=read("../data/research/historia-p4-apostles-missions-rome-three-witness-desk-audit.v1.json");
const html=readFileSync(new URL("../labs/historia-salutis-theatre-p4.html",import.meta.url),"utf8");
const C=crosswalk.counts;
assert.equal(crosswalk.status,"RESEARCH_ONLY_SOURCE_OVERLAP_NOT_IDENTITY_NOT_APPROVED");
assert.deepEqual([C.movements,C.scenes,C.atlasEvents],[37,183,151]);
assert.deepEqual([C.movementsWithSceneCitationOverlap,C.movementsWithoutSceneCitationOverlap],[24,13]);
assert.deepEqual([C.scenesWithMovementCitationOverlap,C.scenesWithoutMovementCitationOverlap],[57,126]);
assert.equal(C.totalMovementSceneCitationLinks,57);
assert.equal(C.totalMovementP0AtlasCitationLinks,60);
assert.equal(C.sceneLocationRowAuditsApproved,0);
assert.equal(crosswalk.policy.indexPositionNeverUsedAsIdentity,true);
assert.equal(crosswalk.policy.p0ReadingChapterNotMatchedToP3MovementByOrdinal,true);
assert.equal(crosswalk.policy.canonicalAtlasOwnershipUnchanged,true);
assert.equal(crosswalk.policy.createsNoCoordinates,true);
assert.equal(crosswalk.policy.sourceBridgesRemainHeld,true);
const movementIds=new Set(crosswalk.movements.map(m=>m.movementId));
const sceneIds=new Set(crosswalk.sceneAuditQueue.map(s=>s.sceneKey));
assert.equal(movementIds.size,37);
assert.equal(sceneIds.size,183);
assert.deepEqual(crosswalk.movements.map(m=>m.sequence),Array.from({length:37},(_,i)=>i+1));
assert.deepEqual(crosswalk.sceneAuditQueue.map(s=>s.originalIndex).sort((a,b)=>a-b),Array.from({length:183},(_,i)=>i));
const legal=new Set(["IDENTICAL_CITATION_SPAN","SCENE_OR_EVENT_CONTAINED_IN_SELECTED_PASSAGE","SELECTED_PASSAGE_CONTAINED_IN_SCENE_OR_EVENT","PARTIAL_CITATION_OVERLAP_REVIEW_ONLY"]);
for(const m of crosswalk.movements){
 assert.equal(m.publicationApproved,false);
 assert.equal(m.oralAccepted,false);
 assert.ok(m.selectedScriptureBeats.length>0);
 for(const v of m.sceneCitationLinks){
  assert.ok(sceneIds.has(v.sceneKey));assert.ok(legal.has(v.citationRelation));
  const row=crosswalk.sceneAuditQueue.find(s=>s.sceneKey===v.sceneKey);
  assert.ok(row.movementCitationLinks.some(b=>b.movementId===m.movementId&&b.citationRelation===v.citationRelation));
 }
 for(const v of m.p0AtlasCitationLinks)assert.ok(legal.has(v.citationRelation));
 for(const v of m.sourceBridgeCandidates)assert.equal(v.approval,"HOLD");
}
for(const s of crosswalk.sceneAuditQueue){
 assert.equal(s.chronologyAndTextActorsAudit,"NOT_REVIEWED");
 assert.equal(s.locationEvidenceClass,"NOT_REVIEWED");
 assert.equal(s.historicalGeographyCitationsVerified,false);
 assert.equal(s.coordinatesImported,false);
 assert.equal(s.approvedForStorytelling,false);
 for(const v of s.originalCandidateAtlasEvents)assert.equal(v.p0EventExists,true);
 for(const x of s.movementCitationLinks)assert.ok(movementIds.has(x.movementId));
}
assert.deepEqual(C.sceneAtlasStatuses.EXACT_REFERENCE,67);
assert.deepEqual(C.sceneAtlasStatuses.PASSAGE_OVERLAP_REVIEW_ONLY,29);
assert.deepEqual(C.sceneAtlasStatuses.NO_DIRECT_PASSAGE_MATCH,87);
assert.equal(seam.movements.length,18);
assert.equal(seam.counts.issueCount,35);
for(const [i,m] of seam.movements.entries()){
 assert.equal(m.movementId,"HS-M"+String(i+20).padStart(2,"0"));
 assert.equal(m.decision,"HOLD_PENDING_VERSE_BY_VERSE_REVIEW");
 assert.equal(m.readAloudAccepted,false);assert.equal(m.publicationApproved,false);
 assert.ok(m.reviewFindings.length>0);
}
assert.equal(patriarchs.reviewedRows.length,25);
assert.equal(patriarchs.counts.rowsWithVersePresenceBothWitnesses,25);
assert.equal(patriarchs.counts.rowsApprovedForGeocoding,0);
assert.equal(patriarchs.counts.rowsPublished,0);
assert.equal(patriarchs.counts.criticalLocationCorrections,1);
for(const [i,x] of patriarchs.reviewedRows.entries()){
 assert.equal(x.index,i);
 assert.ok(sceneIds.has(x.sceneKey));
 assert.equal(x.publicationApproval,false);
 assert.equal(x.definitiveModernCoordinatesApproved,false);
 assert.equal(x.witnessSpanChecks.coordinatePresenceVerified,true);
 assert.ok(x.witnessSpanChecks.douayChallonerVerseEntries>0);
 assert.equal(x.witnessSpanChecks.douayChallonerVerseEntries,x.witnessSpanChecks.cpdv2009VerseEntries);
}
const isaacBirth=patriarchs.reviewedRows.find(x=>x.sceneKey==="biblical:scene:abraham:021");
assert.ok(isaacBirth);
assert.equal(isaacBirth.geographicalAction,"CORRECTION_REQUIRED_NO_BEERSHEBA_BIRTH_PIN");
assert.equal(isaacBirth.locationEvidenceClass,"UNLOCATED_EVENT");
assert.equal(deliverance.reviewedRows.length,13);
assert.deepEqual([deliverance.counts.firstIndex,deliverance.counts.lastIndex],[25,37]);
assert.equal(deliverance.counts.rowsWithVersePresenceBothWitnesses,13);
assert.equal(deliverance.counts.rowsApprovedForGeocoding,0);
assert.equal(deliverance.counts.rowsPublished,0);
for(const [i,x] of deliverance.reviewedRows.entries()){
 assert.equal(x.index,i+25);
 assert.ok(sceneIds.has(x.sceneKey));
 assert.equal(x.publicationApproval,false);
 assert.equal(x.definitiveModernCoordinatesApproved,false);
 assert.equal(x.witnessSpanChecks.coordinatePresenceVerified,true);
 assert.ok(x.witnessSpanChecks.douayChallonerVerseEntries>0);
 assert.equal(x.witnessSpanChecks.douayChallonerVerseEntries,x.witnessSpanChecks.cpdv2009VerseEntries);
}
assert.equal(deliverance.reviewedRows.find(x=>x.index===36).geographicalAction,"KEEP_NO_PIN");
assert.equal(wilderness.reviewedRows.length,11);
assert.deepEqual([wilderness.counts.firstIndex,wilderness.counts.lastIndex],[38,48]);
assert.equal(wilderness.counts.ordinarySameNumberedVerseCounts,10);
assert.equal(wilderness.counts.editionSpecificReferenceMismatches,1);
assert.equal(wilderness.counts.geocodesApproved,0);
for(const [i,x] of wilderness.reviewedRows.entries()){
 assert.equal(x.index,i+38);
 assert.ok(sceneIds.has(x.sceneKey));
 assert.equal(x.scenePublicationApproved,false);
 assert.equal(x.modernCoordinatesApproved,false);
 assert.equal(x.witnessSpanChecks.coordinatePresenceVerified,true);
}
const tabernacle=wilderness.reviewedRows.find(x=>x.index===48);
assert.equal(tabernacle.scriptureReference,"Exodus 40:1–38");
assert.equal(tabernacle.witnessSpanChecks.douayChallonerEntries,36);
assert.equal(tabernacle.witnessSpanChecks.cpdv2009Entries,36);
assert.equal(tabernacle.witnessSpanChecks.crampon1923Entries,38);
assert.equal(tabernacle.witnessSpanChecks.editionReferenceMismatch,true);
assert.equal(wilderness.controls.exodus40.automaticVerseAlignmentForbidden,true);
assert.equal(wilderness.controls.exodus40.doNotFabricateVerses37Or38,true);
assert.equal(wanderings.reviewedRows.length,8);
assert.deepEqual([wanderings.counts.firstIndex,wanderings.counts.lastIndex],[49,56]);
assert.equal(wanderings.counts.versePresenceAllThree,8);
assert.equal(wanderings.counts.approvedGeocodes,0);
for(const [i,x] of wanderings.reviewedRows.entries()){
 assert.equal(x.index,i+49);
 assert.ok(sceneIds.has(x.sceneKey));
 assert.equal(x.productionApproved,false);
 assert.equal(x.siteCoordinatesApproved,false);
 assert.equal(x.witnessSpanChecks.spanPresenceVerified,true);
 for(const ed of ["douayChallonerEntries","cpdv2009Entries","crampon1923Entries"])assert.ok(x.witnessSpanChecks[ed]>0);
}
const mosesBurial=wanderings.reviewedRows.find(x=>x.index===55);
assert.equal(mosesBurial.geographicalAction,"TRADITIONAL_MOUNTAIN_ONLY_NEVER_TOMB_PIN");
assert.equal(incarnation.reviewedRows.length,13);
assert.deepEqual(incarnation.counts.indices,[57,58,59,60,61,62,63,64,65,66,67,68,181]);
assert.equal(incarnation.counts.exactModernSiteApprovals,0);
assert.equal(incarnation.counts.versesAvailableInThreeWitnesses,13);
const allAudited=[...patriarchs.reviewedRows.map(x=>x.index),...deliverance.reviewedRows.map(x=>x.index),...wilderness.reviewedRows.map(x=>x.index),...wanderings.reviewedRows.map(x=>x.index),...incarnation.reviewedRows.map(x=>x.originalIndex)];
assert.equal(allAudited.length,70);
assert.equal(new Set(allAudited).size,70,"No scene can be counted twice across desk audits");
assert.deepEqual(allAudited.slice(0,69),Array.from({length:69},(_,i)=>i));
assert.equal(allAudited.at(-1),181);
for(const x of incarnation.reviewedRows){
 assert.ok(sceneIds.has(x.sceneKey));
 assert.equal(x.scenePublicationApproved,false);
 assert.equal(x.preciseCoordinatesApproved,false);
 assert.equal(x.witnessSpanChecks.spanPresenceVerified,true);
 assert.equal(x.witnessSpanChecks.douayChallonerEntries,x.witnessSpanChecks.cpdv2009Entries);
 assert.equal(x.witnessSpanChecks.douayChallonerEntries,x.witnessSpanChecks.crampon1923Entries);
}
const holyInnocents=incarnation.reviewedRows.find(x=>x.originalIndex===181);
assert.equal(holyInnocents.scriptureReference,"Matthew 2:16–18");
assert.equal(holyInnocents.geographicalAction,"NO_SPECIFIC_VICTIM_PINS_OR_DATATION");
assert.equal(incarnation.reviewedRows.find(x=>x.originalIndex===62).geographicalAction,"NO_SANCTUARY_CIRCUMCISION_PIN");
assert.equal(incarnation.reviewedRows.find(x=>x.originalIndex===59).geographicalAction,"HILL_COUNTRY_REGION_ONLY_EIN_KAREM_TRADITION");
assert.equal(ministry.reviewedRows.length,46);
assert.deepEqual([ministry.counts.firstIndex,ministry.counts.lastIndex],[69,114]);
assert.equal(ministry.counts.nominalRangeBoundaryDiscrepancies,1);
assert.equal(ministry.counts.editionSpecificSemanticVerseAlignmentFlags,2);
assert.equal(ministry.counts.historicalCoordinatesApproved,0);
assert.equal(ministry.counts.publicationApproved,0);
const ministryIds=ministry.reviewedRows.map(x=>x.originalIndex);
assert.deepEqual(ministryIds,Array.from({length:46},(_,i)=>i+69));
const fullEvidence=[...allAudited,...ministryIds];
assert.equal(fullEvidence.length,116);
assert.equal(new Set(fullEvidence).size,116,"No duplicated scene across the seven audited batches");
for(const m of ministry.reviewedRows){
 assert.ok(sceneIds.has(m.sceneKey),"Unknown ministry scene "+m.sceneKey);
 assert.equal(m.publicationApproved,false);
 assert.equal(m.exactHistoricalCoordinatesApproved,false);
 assert.equal(m.synopticEpisodeIdentitiesMerged,false);
 assert.equal(m.readAloudAccepted,false);
 assert.equal(m.sourceSpan.witnessTextsUncollated,true);
 for(const ed of ["douayChallonerEntries","cpdv2009Entries","crampon1923Entries"])assert.ok(m.sourceSpan[ed]>0);
}
const mk= ministry.reviewedRows.find(x=>x.originalIndex===90);
assert.equal(mk.scriptureReference,"Mark 4:35–41");
assert.equal(mk.sourceSpan.douayChallonerEntries,6);
assert.equal(mk.sourceSpan.hasExactRequestedEndVerse,false);
assert.equal(ministry.highPriority.mark4Storm.doNotInventVerse41,true);
const jn= ministry.reviewedRows.find(x=>x.originalIndex===97);
assert.equal(jn.editorialAction,"EDITION_SPECIFIC_JOHN_6_59_60_AND_CAPERNAUM_CONTEXT");
assert.equal(ministry.highPriority.john6Synagogue.duayChallonerSynagogueVerse,"John 6:60");
assert.equal(ministry.highPriority.john6Synagogue.cpdvSynagogueVerse,"John 6:60");
assert.equal(ministry.highPriority.john6Synagogue.cramponSynagogueVerse,"John 6:59");
assert.equal(ministry.highPriority.feedingBeforeWalking.proposedReview,"REVIEW_SOURCE_ORDER_NOT_AUTO_REORDER");
assert.equal(ministry.highPriority.feedingBeforeWalking.gospelParallelIdentityApproved,false);
for(const n of [89,108,110]){
 const x=ministry.reviewedRows.find(v=>v.originalIndex===n);
 assert.ok(x?.editorialAction?.startsWith("NO_")||x?.editorialAction?.includes("PARABLE"),"Unlocatable parable must not get historical incident pin");
}
assert.equal(passionRisen.reviewedRows.length,23);
assert.equal(passionRisen.counts.passion,16);
assert.equal(passionRisen.counts.risen,7);
assert.equal(passionRisen.counts.spanPresenceAcrossThree,23);
assert.equal(passionRisen.counts.coordinatesCertified,0);
assert.equal(passionRisen.counts.publicationApproved,0);
const allPassionRisen=[...fullEvidence,...passionRisen.reviewedRows.map(x=>x.originalIndex)];
assert.equal(allPassionRisen.length,139);
assert.equal(new Set(allPassionRisen).size,139);
for(const [j,x] of passionRisen.reviewedRows.entries()){
 assert.equal(x.originalIndex,115+j);
 assert.ok(sceneIds.has(x.sceneKey));
 assert.equal(x.exactModernCoordinatesCertified,false);
 assert.equal(x.personIdentitiesCertified,false);
 assert.equal(x.gospelParallelIdentityCertified,false);
 assert.equal(x.readAloudApproved,false);
 assert.equal(x.publicationApproved,false);
 assert.equal(x.witnessSpan.allRequestedNumberedVersesPresent,true);
 assert.equal(x.witnessSpan.douayChallonerEntries,x.witnessSpan.cpdv2009Entries);
 assert.equal(x.witnessSpan.douayChallonerEntries,x.witnessSpan.crampon1923Entries);
}
assert.equal(passionRisen.guards.john20Overlap.relationship,"SELECTED_PASSAGE_OVERLAP_NOT_TWO_RESURRECTIONS");
assert.equal(passionRisen.reviewedRows.find(x=>x.originalIndex===128).geographicAction,"NO_ANCIENT_STREET_TRACE");
assert.equal(passionRisen.reviewedRows.find(x=>x.originalIndex===135).geographicAction,"EMMAUS_REGION_DISPUTED_NO_EXACT_ROUTE");
assert.equal(passionRisen.reviewedRows.find(x=>x.originalIndex===133).geographicAction,"NO_CERTIFIED_APPEARANCE_ROOM");
assert.equal(actsMission.reviewedRows.length,44);
assert.deepEqual([actsMission.counts.firstIndex,actsMission.counts.lastContiguousIndex,actsMission.counts.appendIndex],[138,180,182]);
assert.equal(actsMission.counts.sourceRangeEndpointDiscrepancies,2);
assert.equal(actsMission.counts.sourceGeographicApprovals,0);
assert.equal(actsMission.counts.publicationApprovals,0);
const allAuditIndices=[...allPassionRisen,...actsMission.reviewedRows.map(x=>x.originalIndex)].sort((a,b)=>a-b);
assert.equal(allAuditIndices.length,183,"Every research source scene should be audited once");
assert.deepEqual(allAuditIndices,Array.from({length:183},(_,i)=>i),"All 183 original scene indexes must occur exactly once");
for(const row of actsMission.reviewedRows){
 assert.ok(sceneIds.has(row.sceneKey),"Unknown Acts scene "+row.sceneKey);
 assert.equal(row.actorIdentityCertification,false);
 assert.equal(row.routeGeometryCertification,false);
 assert.equal(row.modernPointCertification,false);
 assert.equal(row.publicationApproval,false);
 assert.equal(row.witnessSpan.uncollatedWitness,true);
 for(const ed of ["douayChallonerEntries","cpdv2009Entries","crampon1923Entries"])assert.ok(row.witnessSpan[ed]>0);
}
for(const [sceneIndex,range,tail] of [[151,"Acts 14:20–28",27],[167,"Acts 19:23–41",40]]){
 const row=actsMission.reviewedRows.find(x=>x.originalIndex===sceneIndex);
 assert.equal(row.scriptureReference,range);
 assert.equal(row.witnessSpan.requestedFinalVersePresent,false);
 assert.equal(row.witnessSpan.douayChallonerEntries,row.witnessSpan.cpdv2009Entries);
 assert.equal(row.witnessSpan.douayChallonerEntries,row.witnessSpan.crampon1923Entries);
}
assert.equal(actsMission.highPriority.acts14.insertedVerseForbidden,true);
assert.equal(actsMission.highPriority.acts19.insertedVerseForbidden,true);
assert.equal(actsMission.highPriority.galatia.pisidianAntiochNotNamedInPassage,true);
assert.equal(actsMission.highPriority.shipwreck.preciseShipwreckPinForbidden,true);
assert.equal(actsMission.highPriority.pentecost.noAuthenticatedUpperRoom,true);
assert.equal(actsMission.reviewedRows.find(x=>x.originalIndex===182).chapter,"APOSTLES");
for(const token of ["maplibregl.Map","prefers-reduced-motion","ATLAS_GEO.cenacle","ATLAS_GEO.transfiguration","HS-M37","sourceBridgeCandidates"]) {
 if(token==="sourceBridgeCandidates") continue;
 assert.ok(html.includes(token),"Theatre lab missing "+token);
}
assert.ok(html.includes("No cinematic-scene identity exists"));
assert.ok(html.includes("No painting imported"));
assert.ok(!html.includes("<script type=\"module\" src=\"../src/"),"Research lab must not import production modules");
console.log("PASS: Historia P4 crosswalk, 183-row evidence queue, 18 seam holds, 183 source-reviewed scenes and four-state theatre laboratory source contracts");
