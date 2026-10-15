import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const j=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const fam=j("data/explore/biblical-schuster-knecht-source-family-review.v1.json");
const canon=j("data/explore/biblical-reading-continuity-review.v1.json");
const books=j("data/explore/biblical-73-book-event-denominator-audit.v1.json");
const sels=j("data/explore/biblical-existing-author-selection-review.v1.json");
assert.equal(fam.sourceFamilies[0].workId,"WORK-SCHUSTER-BIBLE-HISTORY");
assert.equal(fam.openingEnglishTocSections.length,8);
assert.equal(fam.witnesses.length,5);
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
assert.equal(domains.scanImagesUnavailableToReview,true);
assert.equal(domains.authorProseCertified,0);
assert.equal(domains.territories.length,6);
assert.equal(domains.territories.filter(t=>t.kind==="HISTORICAL_NARRATIVE").length,3);
assert.equal(domains.territories.filter(t=>t.kind==="KNECHT_COMMENTARY").length,3);
for(const t of domains.territories){
  assert.equal(t.originalPageImagesIndependentlyInspected,false);
  assert.equal(t.printedPageWordsCertified,false);
  assert.equal(t.sourceTextImported,false);
  assert.equal(t.publicationApproved,false);
  assert.ok(t.startPageTranscriptionUrl.includes("/"+t.djvuStart));
  assert.ok(t.endPageTranscriptionUrl.includes("/"+t.djvuEnd));
}
assert.deepEqual(domains.territories.map(t=>[t.djvuStart,t.djvuEnd]),[[41,43],[43,47],[57,59],[59,62],[62,64],[64,66]]);
console.log("Schuster-Knecht source ownership: 8 headings, 6 Atlas linked, 2 source-only chapters; 73 canon books audited; no prose copied.");
