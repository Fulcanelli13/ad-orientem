import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const root='data/artwork/research/';
const queue=read(root+'m2m-consolidated-image-selection-queue-20261110.v1.json');
const baseline=read(root+'m2m-calendar-prepublication-triage-198-20261110.v1.json');
const oldAudits=[
 'm2m-exact-oil-source-rights-audit18-20261110.v1.json',
 'm2m-exact-oil-source-rights-followup10-20261110.v1.json',
 'm2m-exact-oil-source-rights-followup10b-20261110.v1.json',
 'm2m-exact-oil-source-rights-followup15-20261110.v1.json',
 'm2m-exact-oil-source-rights-final15-20261110.v1.json'
].flatMap(file=>read(root+file).records);
const supplement=read(root+'m2m-three-unresolved-march-gospel-leads-20261110.v1.json');
const met=read(root+'m2m-met-original-image-verification4-20261110.v1.json');
const well=read(root+'m2m-wellcome-v0017627-verified-native-photo-20261110.v1.json');
const rib=read(root+'m2m-ribera-alcantara-pinakothek909-verified-native-photo-20261110.v1.json');
const wal=read(root+'m2m-walters-37-453-photo-research-20261110.v1.json');
const batch2=read(root+'m2m-open-colour-batch2-source-verification-20261110.v1.json');
const msk=read(root+'m2m-msk-s43-verified-image-original-20261110.v1.json');
const wenceslas=read(root+'m2m-met-437005-verified-native-photo-20261110.v1.json');
const screening=read(root+'m2m-cc0-batch4-exact-iconographic-screening-20261110.v1.json');

assert.equal(queue.schema,'AO_SACRED_ART_CONSOLIDATED_IMAGE_SELECTION_QUEUE_V1');
assert.equal(queue.status,'OWNER_REVIEW_AND_SOURCE_ACQUISITION_STAGING_NO_PUBLICATION_AUTHORITY');
const works=queue.works,photos=queue.photographs,dates=queue.dates;
assert.equal(baseline.works.length,151);
assert.equal(baseline.edges.length,198);
assert.equal(works.length,156);
assert.equal(photos.length,10);
assert.equal(dates.length,170);
assert.equal(new Set(works.map(x=>x.artworkKey)).size,156);
assert.equal(new Set(photos.map(x=>x.artworkKey)).size,10);
assert.equal(new Set(dates.map(x=>x.date)).size,170);
const workByKey=new Map(works.map(x=>[x.artworkKey,x]));
const photoByKey=new Map(photos.map(x=>[x.artworkKey,x]));
const baselineKeys=new Set(baseline.works.map(w=>w.artworkKey));
const oilKeys=new Set(baseline.edges.filter(x=>x.priority==='P2_EXACT_OIL_MUSEUM_SOURCE_AND_IMAGE_QA').map(x=>x.artworkKey));
const auditedKeys=new Set(oldAudits.map(x=>x.workKey));
assert.equal(oilKeys.size,68);
assert.equal(oldAudits.length,68);
assert.equal(auditedKeys.size,68);
assert.deepEqual([...oilKeys].sort(),[...auditedKeys].sort());
assert.ok([...baselineKeys].every(k=>workByKey.has(k)));
assert.deepEqual(works.filter(x=>x.sourcePool==='OUTSIDE_198_EDGE_POOL_UNAPPROVED_ALTERNATIVE').map(x=>x.artworkKey).sort(),['Met:437005','Pinakothek:909']);
assert.deepEqual(
 works.filter(x=>x.sourcePool==='SUPPLEMENTAL_MARCH_RESEARCH_NOT_IN_198_EDGE_CENSUS').map(x=>x.artworkKey).sort(),
 supplement.records.map(x=>x.candidate.researchKey).sort()
);
assert.equal(works.filter(x=>x.sourcePool==='198_EDGE_CALENDAR_RESEARCH').length,151);
assert.equal(works.filter(x=>x.directOilPriorityPool).length,68);
assert.equal(works.filter(x=>x.exactOilObjectAuditCompleted).length,68);
assert.equal(works.filter(x=>x.sourcePool==='198_EDGE_CALENDAR_RESEARCH'&&!x.directOilPriorityPool&&x.mediumClasses.includes('OIL_PAINTING')).length,9);
assert.equal(photos.filter(x=>baselineKeys.has(x.artworkKey)).length,8);
assert.equal(photos.filter(x=>!baselineKeys.has(x.artworkKey)).length,2);
for(const edge of baseline.edges){
 const w=workByKey.get(edge.artworkKey);
 assert.ok(w,'original artwork key missing: '+edge.artworkKey);
 assert.ok(w.edgeIds.includes(edge.edgeId),'relationship missing: '+edge.edgeId);
 assert.ok(w.candidateDates.includes(edge.date),'date association missing: '+edge.edgeId);
}
for(const w of works){
 assert.equal(w.ownerApprovalForAnyNewDate,false,w.artworkKey);
 assert.equal(w.preexistingOwnerSelectionNotSuperseded,true,w.artworkKey);
 assert.equal(w.globalArtworkRejectionChecksRequired,true,w.artworkKey);
 assert.equal(w.releaseReady,false,w.artworkKey);
 if(w.verifiedPhotoId) assert.equal(photoByKey.get(w.artworkKey)?.photographId,w.verifiedPhotoId);
}
assert.equal(photos.filter(x=>x.licence==='CC0_MET_OPEN_ACCESS').length,5);
assert.equal(photos.filter(x=>x.licence==='CC0_WALTERS').length,1);
assert.equal(photos.filter(x=>x.licence.startsWith('CC_BY_4_HISTORICAL')).length,1);
assert.equal(photos.filter(x=>x.licence==='CC_BY_SA_4_PINAKOTHEK').length,1);
assert.equal(photos.filter(x=>x.licence==='RIJKSMUSEUM_PUBLIC_DOMAIN_IIIF').length,1);
assert.equal(photos.filter(x=>x.licence.startsWith('MSK_COLLECTION_PUBLIC_DOMAIN_MARK')).length,1);
assert.deepEqual(photos.filter(x=>x.sourceManifest==='data/artwork/research/m2m-met-original-image-verification4-20261110.v1.json').map(x=>x.exactBytesSha256).sort(),met.records.map(x=>x.sha256).sort());
assert.equal(photoByKey.get('Met:437005').exactBytesSha256,wenceslas.photo.sha256);
assert.deepEqual(wenceslas.photo.downloadedPixels,[2453,3832]);
assert.equal(wenceslas.photo.bytesIndependentHashVerified,true);
assert.equal(wenceslas.editorial.ownerReplacementOfSkreta,false);
assert.equal(wenceslas.editorial.ownerHistoricalApproval,false);
assert.equal(workByKey.get('Met:437005').risk,'PROVENANCE_VERIFIED_EXACT_SAINT_DIFFERENT_SCENE_NOT_OWNER_APPROVED_OR_REJECTION_CLEARED');
assert.equal(workByKey.get('Met:437005').globalArtworkRejectionChecksRequired,true);
assert.equal(photoByKey.get('Met:437005').publicationEligible,false);
assert.equal(photoByKey.get('Walters:37.453').exactBytesSha256,wal.candidate.sourcePhotoVerification.sha256);
assert.equal(photoByKey.get('Wellcome:45078i').exactBytesSha256,well.verifiedPhoto.sha256);
assert.equal(photoByKey.get('Pinakothek:909').exactBytesSha256,rib.photo.sha256);
assert.equal(photoByKey.get('Rijks:SK-A-868').exactBytesSha256,batch2.download.sha256);
assert.equal(photoByKey.get('MSKGent:S-43').exactBytesSha256,msk.image.sha256);
assert.deepEqual([msk.image.downloadedPixels[0],msk.image.downloadedPixels[1]],[2000,3887]);
assert.equal(msk.image.independentArtifactByteHashVerified,true);
assert.equal(msk.rights.exactAppCommercialUseConfirmed,false);
assert.equal(msk.crop.ownerMobileCropApproval,false);
assert.equal(msk.gates.publicReleaseReady,false);
assert.deepEqual([batch2.download.pixelWidth,batch2.download.pixelHeight],[6132,4483]);
assert.equal(batch2.download.hashVerifiedFromDownloadedActionsArtifact,true);
assert.equal(batch2.holds.filter(x=>x.result==='HTTP_403').length,2);
assert.equal(workByKey.get('Rijks:SK-A-868').risk,'SOURCE_VERIFIED_BUT_MOBILE_GOSPEL_SUBJECT_TOO_SMALL');
assert.equal(photoByKey.get('Wellcome:45078i').sourceDateSpecificLicenceFinal,false);
for(const p of photos){
 assert.match(p.exactBytesSha256,/^[0-9a-f]{64}$/);
 assert.ok(p.pixelWidth>=1170&&p.pixelHeight>=1170);
 assert.ok(p.sourceBytes>100_000);
 assert.ok(p.originalPhotoSourceUrl.startsWith('https://'));
 assert.ok(p.sourceFileAcquired&&p.checksumsVerified&&p.colourFront);
 assert.equal(p.imageInPublicAssets,false);
 assert.equal(p.ownerDateApproval,false);
 assert.equal(p.formalAppCropCertification,false);
 assert.equal(p.publicationEligible,false);
}
assert.equal(workByKey.get('Walters:37.1146').risk,'ONLY_MONOCHROME_AVAILABLE');
assert.equal(workByKey.get('ICCD:0900053335').risk,'UNVERIFIED_ORIGINAL_OBJECT_KEY');
assert.equal(workByKey.get('ICCD:0500404703').risk,'ARTWORK_COPYRIGHT_UNRESOLVED');
assert.equal(dates.filter(x=>x.originalResearchEdges.length>0).length,167);
assert.equal(dates.reduce((n,x)=>n+x.originalResearchEdges.length,0),198);
assert.deepEqual(dates.filter(x=>x.originalResearchEdges.length===0).map(x=>x.date),['2026-03-02','2026-03-10','2026-03-11']);
assert.deepEqual(dates.filter(x=>x.supplementalUnintegratedArtworkKeys.length).map(x=>x.date),['2026-03-02','2026-03-10','2026-03-11']);
assert.ok(dates.every(x=>x.editorialDateApproval===false&&x.publishedImageAssignmentCreated===false));
assert.equal(queue.counts.verifiedColourJpegSources,10);
assert.equal(queue.counts.totalSelectionQueueWorkKeys,156);
assert.equal(queue.counts.externalRiberaAlternateKeys,1);
assert.equal(queue.counts.externalWenceslasAlternateKeys,1);
assert.equal(queue.counts.verifiedColourJpegExternalAlternate,2);
assert.equal(queue.counts.cc0Batch4RawSearchArtworks,35);
assert.equal(queue.counts.cc0Batch4IconographicIrrelevant,33);
assert.equal(screening.total.screenedWrongSubject,33);
assert.equal(screening.total.retainedForSeparateEditorialResearch,2);
assert.ok(screening.perTarget.some(x=>x.originalKey==='Thoma:AthanasiusOfAlexandria'&&x.exactMatches[0]?.id===111444));
assert.equal(queue.counts.verifiedSourcePhotosInOriginal151Pool,8);
assert.equal(queue.reviewLaneCounts.C_LOCATE_REUSABLE_COLOUR_SOURCE??0,0);
assert.equal(queue.reviewLaneCounts.C_OBJECT_RECORD_WITHOUT_PHOTO_BYTES,2);
assert.equal(queue.reviewLaneCounts.C_UNVERIFIED_IMAGE_RIGHTS_OR_ATTRIBUTION,2);
assert.equal(queue.counts.directRecordsWithoutOriginalPhoto,2);
assert.equal(queue.counts.sourceImageRightsOrAttributionUnresolved,2);
assert.equal(queue.counts.additionalRestrictedInstitutionPhotosFromEight,4);
const finalSourceAudit=read(root+'m2m-eight-priority-oil-source-closure-20261110.v1.json');
assert.equal(finalSourceAudit.counts.reviewed,8);
assert.equal(finalSourceAudit.counts.restrictedInstitutionalPhotoSources,4);
assert.equal(finalSourceAudit.counts.objectRecordsWithoutDownloadablePhoto,2);
assert.equal(finalSourceAudit.counts.sourceRightsOrAttributionUnresolved,2);
assert.equal(finalSourceAudit.counts.sourceImageBytesDownloaded,0);
for(const item of finalSourceAudit.sources){
 const work=workByKey.get(item.artworkKey);
 assert.ok(work);
 assert.equal(work.lane,item.classification);
 assert.equal(work.directSourceTriage10November.exactOfficialPhotoAppUseEligible,false);
 assert.equal(work.directSourceTriage10November.newSourceFileDownloaded,false);
 assert.equal(work.verifiedPhotoId,null);
 assert.equal(work.releaseReady,false);
}
assert.equal(queue.reviewLaneCounts.C_CLIENT_RENDERED_MUSEUM_PORTAL_REQUIRES_NEW_METHOD,4);
assert.equal(queue.counts.clientRenderedFirstPartyPortalImageHolds,4);
assert.equal(queue.counts.unverifiedPhotoSearchLaneRemaining,queue.reviewLaneCounts.C_LOCATE_REUSABLE_COLOUR_SOURCE??0);
assert.equal(queue.counts.firstPartyMediaRecordInvestigations,4);
assert.equal(queue.counts.museumPortalsNeedingClientRenderedAccess,4);
const portalBlockers=read(root+'m2m-museum-portal-static-client-blockers-20261110.v1.json');
assert.equal(portalBlockers.counts.investigated,4);
assert.equal(portalBlockers.counts.newImageByteAcquisitions,0);
assert.equal(portalBlockers.counts.totalVerifiedPhotoTotal,9);
assert.equal(portalBlockers.counts.publicReleases,0);
assert.deepEqual(portalBlockers.records.map(x=>x.key),[
 'Nationalmuseum:NM420','Nationalmuseum:NM1134','MNK:II-a-448','MNK:II-a-9'
]);
for(const row of portalBlockers.records){
 const w=workByKey.get(row.key);
 assert.equal(w.firstPartyDownloadLinkInvestigation.status,'CLIENT_SIDE_RENDERED_MUSEUM_PORTAL_STATIC_HTTP_PATH_EXHAUSTED');
 assert.equal(w.lane,'C_CLIENT_RENDERED_MUSEUM_PORTAL_REQUIRES_NEW_METHOD');
 assert.equal(w.firstPartyDownloadLinkInvestigation.originalSourceBytesVerified,false);
 assert.equal(w.firstPartyDownloadLinkInvestigation.retryStaticHtml,false);
 assert.equal(w.verifiedPhotoId,null);
 assert.equal(w.ownerApprovalForAnyNewDate,false);
}
const cantius=workByKey.get('MNK:II-a-448');
const stanislaus=workByKey.get('MNK:II-a-9');
assert.equal(cantius.verifiedSubjectIconography.saintIdentity,'JOHN_CANTIUS');
assert.equal(cantius.verifiedSubjectIconography.narrativeRole,'EXACT_SAINT_LEGEND_SCENE');
assert.equal(cantius.verifiedSubjectIconography.ownerImageApproval,false);
assert.equal(stanislaus.verifiedSubjectIconography.exactEventDepicted,'EXCOMMUNICATION_OF_KING');
assert.ok(stanislaus.verifiedSubjectIconography.eventsNotDepicted.includes('MARTYRDOM'));
assert.equal(stanislaus.verifiedSubjectIconography.suitableAsMartyrdomScene,false);
assert.equal(stanislaus.verifiedSubjectIconography.ownerImageApproval,false);

for(const [key,accession] of [
 ['Nationalmuseum:NM420','NM 420'],
 ['Nationalmuseum:NM1134','NM 1134'],
 ['MNK:II-a-448','MNK II-a-448'],
 ['MNK:II-a-9','MNK II-a-9']
]){
 const r=workByKey.get(key);
 assert.ok(r);
 assert.equal(r.firstPartyDownloadLinkInvestigation.accession,accession);
 assert.equal(r.firstPartyDownloadLinkInvestigation.identifiedExactMediaId,null);
 assert.equal(r.firstPartyDownloadLinkInvestigation.imageFileSha256,null);
 assert.equal(r.firstPartyDownloadLinkInvestigation.ownerApproved,false);
 assert.equal(r.verifiedPhotoId,null);
 assert.equal(r.releaseReady,false);
}
assert.equal(queue.reviewLaneCounts.C_RESTRICTED_PHOTO_FIND_OPEN_EQUIVALENT,49);
assert.equal(queue.counts.newInstitutionPhotoPolicyHolds,40);
assert.equal(queue.counts.iccdOfficialPhotoRightsHoldsAdded,27);
const policyFile=read(root+'m2m-open-source-batch3-msk-mnk-20261110.v1.json');
const policyKeys=policyFile.policyHolds.flatMap(x=>x.workKeys);
assert.equal(policyKeys.length,9);
assert.equal(new Set(policyKeys).size,9);
const iccdHeld=works.filter(x=>x.artworkKey.startsWith('ICCD:') && x.risk==='ICCD_OFFICIAL_PHOTO_RIGHTS_REQUIRE_AUTHORISATION');
assert.equal(iccdHeld.length,27);
assert.ok(iccdHeld.every(x=>x.institutionPhotoPolicyHold.policyUrl==='https://www.catalogo.beniculturali.it/termini-uso'));
assert.ok(iccdHeld.every(x=>x.institutionPhotoPolicyHold.alternativeImageSearchAllowed===true && x.institutionPhotoPolicyHold.paidRequestOrOwnerContactAllowed===false));
for(const key of policyKeys){
 const work=workByKey.get(key);
 assert.ok(work, 'policy hold missing '+key);
 assert.equal(work.lane,'C_RESTRICTED_PHOTO_FIND_OPEN_EQUIVALENT');
 assert.equal(work.institutionPhotoPolicyHold.alternativeImageSearchAllowed,true);
 assert.equal(work.institutionPhotoPolicyHold.paidRequestOrOwnerContactAllowed,false);
 assert.equal(work.ownerApprovalForAnyNewDate,false);
}
assert.equal(queue.counts.newOwnerApprovedPlacements,0);
assert.equal(queue.counts.newPublicArtworkReleases,0);
assert.equal(Object.values(queue.reviewLaneCounts).reduce((a,b)=>a+b,0),156);
assert.equal(queue.reviewLaneCounts.A_VERIFIED_SOURCE_PHOTO_EDITORIAL_AND_MOBILE_QA,10);
const wenceslasDay=dates.find(x=>x.date==='2026-09-28');
assert.deepEqual(wenceslasDay.unapprovedExternalAlternativeArtworkKeys,['Met:437005']);
assert.equal(wenceslasDay.editorialDateApproval,false);
assert.equal(wenceslasDay.publishedImageAssignmentCreated,false);
const policies=queue.releaseRules.join(' ');
assert.match(policies,/103 historically globally rejected/);
assert.match(policies,/507 explicitly owner-accepted Prayer alternatives/);
assert.match(policies,/27 Prayer NONE slots/);
assert.match(policies,/Commons/);
assert.match(policies,/Prado/);
console.log('PASS: 156 artwork keys (151 original + 2 alternatives + 3 supplemental), original 198 edges, 170 date holds, 68 audited priority oils, 10 verified source hashes and zero releases.');
