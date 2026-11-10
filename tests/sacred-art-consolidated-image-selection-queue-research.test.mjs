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

assert.equal(queue.schema,'AO_SACRED_ART_CONSOLIDATED_IMAGE_SELECTION_QUEUE_V1');
assert.equal(queue.status,'OWNER_REVIEW_AND_SOURCE_ACQUISITION_STAGING_NO_PUBLICATION_AUTHORITY');
const works=queue.works,photos=queue.photographs,dates=queue.dates;
assert.equal(baseline.works.length,151);
assert.equal(baseline.edges.length,198);
assert.equal(works.length,155);
assert.equal(photos.length,8);
assert.equal(dates.length,170);
assert.equal(new Set(works.map(x=>x.artworkKey)).size,155);
assert.equal(new Set(photos.map(x=>x.artworkKey)).size,8);
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
assert.deepEqual(works.filter(x=>x.sourcePool==='OUTSIDE_198_EDGE_POOL_UNAPPROVED_ALTERNATIVE').map(x=>x.artworkKey),['Pinakothek:909']);
assert.deepEqual(
 works.filter(x=>x.sourcePool==='SUPPLEMENTAL_MARCH_RESEARCH_NOT_IN_198_EDGE_CENSUS').map(x=>x.artworkKey).sort(),
 supplement.records.map(x=>x.candidate.researchKey).sort()
);
assert.equal(works.filter(x=>x.sourcePool==='198_EDGE_CALENDAR_RESEARCH').length,151);
assert.equal(works.filter(x=>x.directOilPriorityPool).length,68);
assert.equal(works.filter(x=>x.exactOilObjectAuditCompleted).length,68);
assert.equal(works.filter(x=>x.sourcePool==='198_EDGE_CALENDAR_RESEARCH'&&!x.directOilPriorityPool&&x.mediumClasses.includes('OIL_PAINTING')).length,9);
assert.equal(photos.filter(x=>baselineKeys.has(x.artworkKey)).length,7);
assert.equal(photos.filter(x=>!baselineKeys.has(x.artworkKey)).length,1);
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
assert.equal(photos.filter(x=>x.licence==='CC0_MET_OPEN_ACCESS').length,4);
assert.equal(photos.filter(x=>x.licence==='CC0_WALTERS').length,1);
assert.equal(photos.filter(x=>x.licence.startsWith('CC_BY_4_HISTORICAL')).length,1);
assert.equal(photos.filter(x=>x.licence==='CC_BY_SA_4_PINAKOTHEK').length,1);
assert.equal(photos.filter(x=>x.licence==='RIJKSMUSEUM_PUBLIC_DOMAIN_IIIF').length,1);
assert.deepEqual(photos.filter(x=>x.artworkKey.startsWith('Met:')).map(x=>x.exactBytesSha256).sort(),met.records.map(x=>x.sha256).sort());
assert.equal(photoByKey.get('Walters:37.453').exactBytesSha256,wal.candidate.sourcePhotoVerification.sha256);
assert.equal(photoByKey.get('Wellcome:45078i').exactBytesSha256,well.verifiedPhoto.sha256);
assert.equal(photoByKey.get('Pinakothek:909').exactBytesSha256,rib.photo.sha256);
assert.equal(photoByKey.get('Rijks:SK-A-868').exactBytesSha256,batch2.download.sha256);
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
assert.equal(queue.counts.verifiedColourJpegSources,8);
assert.equal(queue.counts.verifiedSourcePhotosInOriginal151Pool,7);
assert.equal(queue.reviewLaneCounts.C_LOCATE_REUSABLE_COLOUR_SOURCE,49);
assert.equal(queue.counts.newOwnerApprovedPlacements,0);
assert.equal(queue.counts.newPublicArtworkReleases,0);
assert.equal(Object.values(queue.reviewLaneCounts).reduce((a,b)=>a+b,0),155);
const policies=queue.releaseRules.join(' ');
assert.match(policies,/103 historically globally rejected/);
assert.match(policies,/507 explicitly owner-accepted Prayer alternatives/);
assert.match(policies,/27 Prayer NONE slots/);
assert.match(policies,/Commons/);
assert.match(policies,/Prado/);
console.log('PASS: 155 artwork keys, original 198 edges, 170 date holds, 68 audited priority oils, 8 verified source hashes and zero releases.');
