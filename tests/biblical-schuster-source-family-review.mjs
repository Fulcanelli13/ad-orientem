import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const j=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const fam=j("data/explore/biblical-schuster-knecht-source-family-review.v1.json");
const canon=j("data/explore/biblical-reading-continuity-review.v1.json");
const books=j("data/explore/biblical-73-book-event-denominator-audit.v1.json");
const sels=j("data/explore/biblical-existing-author-selection-review.v1.json");
assert.equal(fam.sourceFamilies[0].workId,"WORK-SCHUSTER-BIBLE-HISTORY");
assert.equal(fam.openingEnglishTocSections.length,8);
assert.equal(fam.witnesses.length,7);
const schuster1925=fam.witnesses.find(w=>w.id==="SCHUSTER-EN-1925-HERDER-LONDON-19TH");
assert.ok(schuster1925);
assert.equal(schuster1925.tocReadFromArchiveOCR,true);
assert.equal(schuster1925.physicalImagesDirectlyInspected,false);
assert.equal(fam.counts.historicEnglish1925PageImagesProofread,0);
assert.equal(fam.counts.sourceParagraphsApproved,0);
assert.equal(fam.policy.faithfulAITranslationAllowedAfterExactOriginalTextVerified,true);
assert.equal(fam.policy.noAiCreatedRetelling,true);
assert.equal(fam.policy.doNotTreatKnechtAsIndependentNarrative,true);
assert.equal(sels.sourceFamilyReconciliation.primaryNarrativeWorkId,"WORK-SCHUSTER-BIBLE-HISTORY");
for(const x of [canon.policy,sels.policy]){
 assert.equal(x.aiOriginalNarrativeProhibited,true);
 assert.equal(x.aiFaithfulTranslationOfVerifiedExistingAuthorAllowed,true);
 assert.equal(x.translationRequiresEditorialReviewBeforePublication,true);
}
const real=fam.openingEnglishTocSections;
assert.deepEqual(real.map(x=>x.originalEnglishChapterNumber),["I","II","III","IV","V","VI","VII","VIII"]);
assert.deepEqual(real.map(x=>x.englishEditionPrintPageFromPublisherPreview),[1,3,4,5,8,10,13,15]);
assert.equal(real.filter(x=>x.atlasEventKeys.length===0).length,2);
assert.equal(new Set(real.flatMap(x=>x.atlasEventKeys)).size,6);
for(const x of real)for(const key of x.atlasEventKeys)assert.ok(canon.events.slice(0,6).some(e=>e.eventKey===key));
assert.equal(books.books.length,73);
assert.equal(books.atlasMilestones,151);
assert.equal(books.booksDirectlyRepresentedBySelectedEventReferences,28);
assert.equal(books.booksWithoutDirectSelectedEventReference,45);
assert.equal(books.books.reduce((sum,b)=>sum+b.selectedAtlasMilestoneCount,0),151);
assert.equal(books.books.filter(x=>x.testament==="OLD").length,46);
assert.equal(books.books.filter(x=>x.testament==="NEW").length,27);
assert.equal(books.policy.doNotConflateNarrativeHistoryWithInspiredScripture,true);

// Page-linked Knecht 1910 transcriptions: boundaries only, not approved historical words.
const domains=fam.wikisource1910TerritoryReview;
assert.equal(domains.unproofreadTranscriptions,true);
assert.equal(domains.scanImagesUnavailableToReview,false);
assert.equal(domains.authorProseCertified,0);
assert.equal(domains.territories.length,18);
assert.equal(domains.territories.filter(t=>t.kind==="HISTORICAL_NARRATIVE").length,9);
assert.equal(domains.territories.filter(t=>t.kind==="KNECHT_COMMENTARY").length,9);
for(const t of domains.territories){
  assert.equal(t.originalPageImagesIndependentlyInspected,false);
  assert.equal(t.printedPageWordsCertified,false);
  assert.equal(t.sourceTextImported,false);
  assert.equal(t.publicationApproved,false);
  assert.ok(t.startPageTranscriptionUrl.includes("/"+t.djvuStart));
  assert.ok(t.endPageTranscriptionUrl.includes("/"+t.djvuEnd));
}
assert.deepEqual(domains.territories.map(t=>[t.djvuStart,t.djvuEnd]),[[41,43],[43,47],[47,48],[48,51],[51,53],[53,57],[57,59],[59,62],[62,64],[64,66],[66,69],[69,72],[72,76],[76,79],[79,82],[82,84],[84,86],[86,89]]);
assert.equal(domains.chapterRange.count,8);
assert.equal(domains.chapterRange.narrativeParts,9);
assert.equal(domains.chapterRange.commentaryParts,9);
assert.equal(new Set(domains.territories.map(t=>t.id)).size,18);
assert.ok(domains.prohibitedAutoMetadataImport.length>=4);
for(const page of domains.sampledWikisourceProofreadingStates){assert.ok(["PROOFREAD_NOT_VALIDATED","NOT_PROOFREAD"].includes(page.status));}


const roleAudit=domains.roleSubspanOverlays;
assert.equal(roleAudit.commentaryEnvelopesContainingApplication,9);
assert.equal(roleAudit.commentaryEnvelopesApplicationNotYetReviewed,0);
assert.equal(roleAudit.distinctTextRolesCountExcludingFootnotes,27);
assert.equal(roleAudit.overlays.length,9);
assert.deepEqual(roleAudit.overlays.map(x=>x.applicationSubspan.from.djvuPage),[46,50,56,61,66,72,79,84,88]);
assert.equal(new Set(roleAudit.overlays.map(x=>x.sourceParentId)).size,9);
for(const span of roleAudit.overlays){
 const parent=domains.territories.find(x=>x.id===span.sourceParentId);
 assert.ok(parent);
 assert.equal(parent.kind,"KNECHT_COMMENTARY");
 assert.equal(parent.containsDistinctApplication,true);
 assert.equal(parent.homogeneousCommentary,false);
 assert.equal(span.status,"DETECTED_SOURCE_ROLE_ONLY_NOT_TRANSCRIBED_NOT_PRINT_IMAGE_CERTIFIED");
 assert.equal(span.textImported,false);
 assert.equal(span.translationPermittedNow,false);
 assert.equal(span.commentarySubspan.until.heading,"Application.");
 assert.equal(span.applicationSubspan.from.heading,"Application.");
 assert.equal(span.commentarySubspan.until.djvuPage,span.applicationSubspan.from.djvuPage);
 assert.ok(span.sourceHeadingEvidenceUrl.endsWith("/"+span.applicationSubspan.from.djvuPage));
}
assert.equal(fam.counts.wikisource1910OriginsRoleSpansExcludingFootnotes,27);
assert.equal(fam.counts.wikisource1910OriginalPrintedParagraphsApproved,0);


const images=domains.originalPrintImageSpotAudit;
assert.equal(images.imageInspectedCount,25);
assert.equal(images.originalPrintedPages.length,25);
assert.equal(new Set(images.originalPrintedPages.map(x=>x.sourceDjvuPage)).size,25);
assert.equal(images.imageVerifiedBoundarySets.narrativeToCommentary.length,9);
assert.equal(images.imageVerifiedBoundarySets.commentaryToApplication.length,9);
assert.equal(images.imageVerifiedBoundarySets.narrativeStarts.length,9);
assert.deepEqual(images.remainingNarrativeStartUnobserved,[]);
assert.equal(images.defectsAgainstUnproofreadTranscription.length,2);
assert.equal(images.originalSourceProseApprovedForApp,0);
assert.equal(images.sourceParagraphsFullyProofread,0);
for(const x of images.originalPrintedPages){
 assert.equal(x.imageActuallyDisplayed,true);
 assert.equal(x.printedPage,x.sourceDjvuPage-38);
 assert.ok(x.wikisourcePageUrl.endsWith("/"+x.sourceDjvuPage));
 assert.equal(x.fullPageVerbatimTranscriptionCertified,false);
 assert.equal(x.fullNarrativeParagraphProofread,false);
 assert.equal(x.eligibleToImportText,false);
}
for(const defect of images.defectsAgainstUnproofreadTranscription){
 assert.equal(defect.printImageVerified,true);
 assert.equal(defect.fullParagraphCertified,false);
 assert.ok(images.originalPrintedPages.some(x=>x.sourceDjvuPage===defect.djvuPage));
}
assert.ok(images.defectsAgainstUnproofreadTranscription.some(x=>x.djvuPage===79&&x.confirmedPrintExcerpt==="and after a hundred and fifty days"));
assert.ok(images.defectsAgainstUnproofreadTranscription.some(x=>x.djvuPage===84&&x.transcribedExcerpt.includes("Gen. xx")));


const preliminary=images.narrativeParagraphVisualComparisonPilot;
assert.equal(preliminary.status,"PRELIMINARY_VISUAL_BODY_TEXT_COMPARISON_NOT_FULL_CHARACTER_CERTIFICATION_NOT_IMPORTABLE");
assert.equal(preliminary.preliminaryComparedCount,7);
assert.deepEqual(preliminary.comparedDayUnits.map(x=>x.day),[1,2,3,4,5,6,7]);
assert.deepEqual(preliminary.comparedDayUnits[3].scanPages,[42,43]);
assert.equal(preliminary.fullParagraphWordByWordCertification,false);
assert.equal(preliminary.sourceTextCopiedToRepository,false);
assert.equal(preliminary.originalSourceTextApprovedForPublication,false);
assert.deepEqual(images.imageVerifiedBoundarySets.narrativeStarts,[41,47,51,57,62,66,72,79,84]);
assert.equal(fam.counts.wikisource1910NarrativeStartsVisuallyVerified,9);
assert.equal(fam.counts.wikisource1910NarrativeParagraphsPreliminarilyCompared,7);
assert.equal(fam.counts.wikisource1910OriginalPrintedImagePagesInspected,25);

const quality=fam.wikisource1910SourceQualityReview;
assert.equal(quality.status,"25_ORIGINAL_PRINT_PAGE_IMAGES_SPOT_CHECKED_TWO_TRANSCRIPTION_DEFECTS_NO_WHOLE_PARAGRAPH_APPROVAL");
assert.equal(quality.printedImagePagesChecked,25);
assert.equal(quality.initialImageFetchFailuresNowSuperseded,true);
assert.equal(quality.displayedPrimaryNarrativeTextApproved,false);
assert.equal(quality.sourceTextBytesImported,0);
assert.equal(quality.aiAuthoredNarrativeWords,0);
assert.equal(quality.issueCases.length,9);
assert.equal(new Set(quality.issueCases.map(x=>x.id)).size,9);
assert.deepEqual(quality.requiredTextLayers,["AUTHOR_NARRATIVE","KNECHT_COMMENTARY","CATECHETICAL_APPLICATION","ORIGINAL_FOOTNOTE","HEADING_OR_CHAPTER_REFERENCE","EDITORIAL_SOURCE_CONTEXT"]);
for(const x of quality.issueCases){
 assert.ok(["BLOCK_IMPORT","NO_CANONICAL_DATA_PROMOTION","EDITORIAL_HOLD","BLOCK_AUTHORIAL_WORD_CERTIFICATION","NO_AUTOMATIC_EDITION_EQUIVALENCE"].includes(x.severity));
 assert.ok(x.sourcePageUrl.includes(String(x.sourcePage)));
 assert.ok(x.required&&x.effect);
}
assert.equal(quality.issueCases.find(x=>x.id==="WITNESS-RACIST-PATRIARCHAL-COMMENTARY").severity,"EDITORIAL_HOLD");
assert.equal(quality.issueCases.find(x=>x.id==="WITNESS-FOOTNOTE-MARKER-LOSS").severity,"BLOCK_IMPORT");
assert.ok(quality.physicalScanImageAttemptLog.every(x=>x.status==="BLOCKED_NO_PRINT_VERIFICATION"));

const historical=fam.historicalAccessAndProvenanceReview;
assert.equal(historical.authorIdentity.canonicalPerson,"Ignaz Schuster");
assert.equal(historical.authorIdentity.authorityIdentifier,"GND:117321656");
assert.equal(historical.authorIdentity.knownCatalogueMisattribution.catalogueLabel,"Ildefonso Schuster");
assert.equal(historical.alternativeWitnesses.length,2);
assert.equal(historical.primaryWitnessAccess.length,2);
assert.equal(historical.alternativeWitnesses[0].permittedRole,"HISTORICAL_COMPARATIVE_REFERENCE_ONLY");
assert.equal(historical.sourceParagraphsCertifiedNew,0);
assert.equal(historical.appReleaseAffected,false);
assert.ok(historical.primaryWitnessAccess.every(x=>x.originalPrintedPagesNewlyRead===0&&x.completeVerbatimParagraphsCertified===0));

const spanish1908=fam.spanish1908ReadingAndSourceReview;
assert.ok(spanish1908);
assert.equal(spanish1908.witnessId,"SCHUSTER-ES-1908-HERDER-ORTI-12TH");
assert.ok(fam.witnesses.some(w=>w.id===spanish1908.witnessId && w.physicalPageImagesDirectlyInspected===false));
assert.equal(fam.witnesses.length,6);
assert.equal(spanish1908.openingTocNineSpanishUnits.length,9);
assert.deepEqual(spanish1908.openingTocNineSpanishUnits.map(x=>x.spanishNumber),[1,2,3,4,5,6,7,8,9]);
assert.deepEqual(spanish1908.openingTocNineSpanishUnits.map(x=>x.printedPage),[1,2,3,4,5,6,8,10,12]);
assert.deepEqual(spanish1908.openingTocNineSpanishUnits.map(x=>x.english32ndCandidateIds[0]),["schuster:chapter:OT-I","schuster:chapter:OT-II","schuster:chapter:OT-III","schuster:chapter:OT-IV","schuster:chapter:OT-IV","schuster:chapter:OT-V","schuster:chapter:OT-VI","schuster:chapter:OT-VII","schuster:chapter:OT-VIII"]);
assert.equal(new Set(spanish1908.openingTocNineSpanishUnits.flatMap(x=>x.english32ndCandidateIds)).size,8);
assert.deepEqual(spanish1908.historicalLevelPolicy.rawSourceParagraphMarkers.map(x=>x.marker),["NONE","**","*","CROSS"]);
assert.equal(spanish1908.historicalLevelPolicy.levelsCumulative,true);
assert.equal(spanish1908.historicalLevelPolicy.notAnInvitationToAiAbridgement,true);
assert.equal(spanish1908.historicalLevelPolicy.originalSourceMarkerTypographyIndependentlyCertified,false);
assert.equal(spanish1908.historicalLevelPolicy.wholeParagraphMarkersVerifiedInPrint,0);
assert.equal(spanish1908.sourceTextCopiedIntoRepository,false);
assert.equal(spanish1908.fullyPrintCertifiedParagraphs,0);
assert.equal(spanish1908.eligibleEnglishTranslationsNow,0);
assert.equal(spanish1908.releasedReaderSourceParagraphs,0);
assert.equal(fam.counts.spanish1908OriginalPrintedImagesInspected,0);
assert.equal(fam.counts.spanish1908ParagraphsPrintCertified,0);
assert.equal(fam.counts.spanish1908OpeningTocUnitsReadFromOCR,9);

// Earlier historical English Sadlier witness is a scan acquisition candidate, not certified prose.
const earlySadlier=fam.earlyEnglishSadlierScanAcquisitionReview;
assert.ok(earlySadlier);
const earlyWitness=fam.witnesses.find(w=>w.id===earlySadlier.newWitnessId);
assert.ok(earlyWitness);
assert.equal(earlyWitness.language,"en");
assert.equal(earlyWitness.workId,"WORK-SCHUSTER-BIBLE-HISTORY");
assert.equal(earlyWitness.sourcePdfContentBytesReportedByWeb,23008160);
assert.equal(earlyWitness.scanImagePrintedPagesIndependentlyRead,0);
assert.equal(earlyWitness.authorParagraphsCertified,0);
assert.equal(earlyWitness.samePrintEditionAs1896Catalog,"NOT_VERIFIED");
assert.equal(earlyWitness.samePrintEditionAs1925Nineteenth,"NOT_VERIFIED");
assert.equal(earlySadlier.independentPublisherPrimarySource.cataloguePdfPageIndex0,26);
assert.equal(earlySadlier.originalPrintedPagesCertifiedNow,0);
assert.equal(earlySadlier.authorNarrativeParagraphsCertifiedNow,0);
assert.equal(earlySadlier.automaticSourceImportAllowed,false);
assert.equal(earlySadlier.appChanged,false);
assert.equal(fam.counts.earlyEnglishSadlierEleventhScansLocated,1);
assert.equal(fam.counts.earlyEnglishSadlierEleventhPagesPrintInspected,0);
assert.equal(fam.counts.earlyEnglishSadlierEleventhParagraphsCertified,0);

console.log("Schuster-Knecht source ownership: 8 headings, 6 Atlas linked, 2 source-only chapters; 73 canon books audited; no prose copied.");
