import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const prior=read("data/research/sacred-visual-w64-rated5-bible-atlas-and-saints-map-exact-subject-reuse-20261015.v1.json");
const release=read("data/research/sacred-visual-w65-first-user-five-saints-technical-release-gates-20261015.v1.json");
assert.equal(release.schema,"AO_SACRED_VISUAL_W65_SAINT_ARTWORK_TECHNICAL_REVIEW_V1");
assert.equal(release.sourceOwner,"data/research/sacred-visual-w64-rated5-bible-atlas-and-saints-map-exact-subject-reuse-20261015.v1.json");
assert.equal(prior.saintPilotPortraitArtworkCandidates.length,2);
assert.equal(release.entries.length,prior.saintPilotPortraitArtworkCandidates.length);
assert.equal(release.nativePilotCount,6);
assert.equal(release.publishedPortraitAssets,0);
assert.equal(release.guardrails.singleCanonicalArtId,true);
assert.equal(release.guardrails.noNewPaintingOrNewRating,true);
assert.equal(release.guardrails.neverReleaseWhenRightsUnknown,true);
const canonicalFive=read("data/research/sacred-visual-w64-explicit-user-5star-physical-record-authority-20261015.v1.json");
const ids=new Set();
for(const r of release.entries){
 const original=prior.saintPilotPortraitArtworkCandidates.find(x=>x.canonicalSaintId===r.saintId);
 assert.ok(original,"Not linked to art owner's existing saint identity");
 assert.equal(r.artworkId,original.artworkId,"Never rename or copy a physical work identity");
 assert.equal(r.aestheticRating,original.sourceScore);
 assert.equal(r.aestheticRating,5,"Only previously user-approved aesthetic originals");
 assert.equal(r.noAestheticRerating,true);
 assert.equal(original.releaseAllowed,false);
 assert.equal(r.releaseAllowed,false);
 assert.equal(r.provenance.ratedImageMatched,false);
 assert.equal(r.provenance.originalObjectId,null);
 const w64=canonicalFive.personAndSubjectOwnedRating5Records.find(x=>x.recordId===r.artworkId);
 assert.ok(w64,"Technical gate must reference originally rated physical record");
 assert.equal(r.provenance.ratedSourceLandingPageUrl,w64.museumSourceURL);
 assert.equal(r.provenance.ratedSourceLandingPageMatchesW64,true);
 assert.equal(r.provenance.ratedFileSha256,null,"Matching webpage must not be misreported as exact original pixels");
 assert.equal(r.media.localAsset,null);
 assert.equal(r.media.rightsVerified,false);
 assert.equal(r.media.phoneVisualQA,false);
 assert.equal(r.media.cropVerified,false);
 assert.ok(!ids.has(r.artworkId),"Duplicate work");ids.add(r.artworkId);
 assert.ok(r.rights.state && r.nextAction);
}
const therese=release.entries.find(x=>x.saintId==="saint:therese-of-lisieux");
assert.equal(therese.artistDied,1959);
assert.ok(therese.rights.note.includes("2029"));

assert.equal(therese.provenance.physicalOriginal.dimensionsCm.height,86);
assert.equal(therese.provenance.physicalOriginal.dimensionsCm.width,65);
assert.equal(therese.provenance.physicalOriginal.custodian,"Carmel of Lisieux");
assert.equal(therese.provenance.physicalOriginal.exactPhotoOfThisOriginalCertified,false);


assert.equal(therese.media.alternateSourceCandidate.sourceMedium,"ENGRAVING");
assert.equal(therese.media.alternateSourceCandidate.maySubstituteForFiveRatedPainting,false);
assert.equal(therese.media.alternateSourceCandidate.releaseAllowed,false);
const margaret=release.entries.find(x=>x.saintId==="saint:margaret-mary-alacoque");
assert.equal(margaret.subjectType,"MYSTICAL_APPARITION_SCENE_NOT_SOLO_PORTRAIT");
assert.equal(margaret.media.originalListedWidth,800);
assert.equal(margaret.media.originalListedHeight,600);
assert.equal(margaret.provenance.claimedMuseum,"Vatican Museums");
assert.match(margaret.source,/commons\.wikimedia\.org\/wiki\/File:/);

assert.equal(margaret.provenance.commonsExactFile.sha1AsDeclaredByCommons,"8274c6a9570d4ab8941874933989f0d50e175dc1");
assert.equal(margaret.provenance.commonsExactFile.sourceFileSha1IndependentlyRehashed,false);
assert.equal(margaret.provenance.commonsExactFile.originalPublishedPixels.width,800);
assert.equal(margaret.provenance.commonsExactFile.originalPublishedPixels.height,600);
assert.equal(margaret.provenance.commonsExactFile.rightsLegalReviewComplete,false);


assert.equal(margaret.provenance.primaryMuseumAccessionVerified,false);
assert.equal(margaret.provenance.independentPublishedObjectAttribution.status,
"SECONDARY_SCHOLARLY_CORROBORATION_OF_ARTIST_AND_COLLECTION_NOT_PRIMARY_ACCESSION_CERTIFICATION");
assert.deepEqual(prior.saintPilotWithoutMatchedFiveStarInThisPass.map(x=>x.saintId).sort(),
["blessed:jacques-desire-laval","saint:bernadette-soubirous","saint:claude-la-colombiere","saint:peter-chanel"].sort());
assert.equal(release.policyUpdate.userDecision,"DO_NOT_ASK_ANYONE_FOR_PERMISSIONS");
assert.equal(release.guardrails.noPermissionRequestsOrExternalRightsHolderContact,true);
assert.equal(release.guardrails.noPaidImageLicenses,true);
assert.equal(release.guardrails.allowOnlyPreexistingOpenLicenceOrPublicDomainWithVerifiedSource,true);
for(const entry of release.entries){
 assert.equal(entry.rights.outreachAllowed,false,"No requests to any art owner");
 assert.equal(entry.rights.paidLicenceAcquisitionAllowed,false,"No paid licence route");
 assert.equal(entry.rights.discoveryPolicy,"EXISTING_PUBLIC_DOMAIN_OR_PREEXISTING_OPEN_LICENSE_ONLY_NO_CONTACT");
 assert.equal("outreach" in entry.rights,false);
 assert.equal("permissionProof" in entry.rights,false);
 assert.match(entry.nextAction,/No |no outreach|no museum contact/i);
}
assert.equal(release.sourceVerificationUpdate.verifiedExactImageFiles,0);
assert.equal(release.sourceVerificationUpdate.releaseApprovals,0);
console.log("PASS: W65 two existing user-five saint artworks retain aesthetic approval, exact original rights/file/mobile holds, no publication");
