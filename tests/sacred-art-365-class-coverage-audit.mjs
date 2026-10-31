import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/calendar/sacred-art-2026-all-classes-365-coverage.v1.json",import.meta.url);
const j=JSON.parse(readFileSync(root,"utf8"));
const master=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-class-i-ii-multiwork-crosswalk.v1.json",import.meta.url),"utf8"));
const map=new Map(j.days.map(x=>[x.date,x]));
assert.equal(j.days.length,365,"one record for every observed principal date in 2026");
assert.equal(map.size,365,"no duplicate dates");
assert.deepEqual(Object.fromEntries(["I","II","III","IV"].map(k=>[k,j.summary[k].total])),{I:53,II:76,III:165,IV:71});
for(const x of j.days){assert.ok(x.observedPrincipalId);assert.equal(x.noPublishedArtworkCertificationsFromResearch,true);assert.ok(["I","II","III","IV"].includes(x.rank));}
for(const x of master.dates){let y=map.get(x.date);assert.equal(y.observedPrincipalId,x.observedPrincipalId);assert.equal(y.rank,x.liturgicalRank);assert.deepEqual(y.linkedCatalogueArt.slice(0,x.exactSubjectCatalogueCandidates.length).map(z=>z.artworkId),x.exactSubjectCatalogueCandidates.map(z=>z.artworkId));}
assert.equal(j.summary.I.datedPrimaryAssociations,53);
assert.equal(j.summary.I.anyCatalogueIdentityCandidate,25);
assert.equal(j.summary.I.noCatalogueIdentityCandidate,28);
assert.equal(j.summary.II.anyCatalogueIdentityCandidate,18);
assert.equal(j.summary.II.sanctoralPrincipalCount,24);
assert.equal(j.summary.II.sanctoralWithoutIdentified383Candidate,7);
assert.equal(j.summary.III.anyCatalogueIdentityCandidate,36);
assert.equal(j.summary.III.sanctoralPrincipalCount,131);
assert.equal(j.summary.III.sanctoralWithoutIdentified383Candidate,95);
assert.equal(j.summary.III.specialSeasonalReuseRequired,34);
assert.equal(j.summary.IV.total,71);
assert.equal(j.summary.IV.sanctoralPrincipalCount,0);
assert.equal(j.summary.IV.marianSaturdayReuseRequired,12);
assert.equal(j.summary.IV.specialSeasonalReuseRequired,59);
assert.equal(j.unmatched.I.length,0);
assert.equal(j.unmatched.II.length,58);
assert.equal(j.unmatched.III.length,129);
assert.equal(j.unmatched.IV.length,71);
function art(date){return map.get(date)?.linkedCatalogueArt.map(a=>a.title.toLowerCase())||[]}
assert.ok(art("2026-01-17").every(t=>!t.includes("padua")),"Abbot is not Anthony of Padua");
assert.ok(art("2026-06-13").some(t=>t.includes("padua")),"Padua feast has correct artist titles");
assert.ok(art("2026-06-18").some(t=>t.includes("effremo")),"Ephrem is identified by Italian title");
assert.ok(art("2026-02-09").some(t=>t.includes("cyril of alexandria")),"Alexandria not Jerusalem");
assert.ok(!art("2026-02-05").some(t=>t.includes("shrine of saint agatha")),"Lucy shrine scene is not portrait of Agatha");
assert.ok(art("2026-05-11").some(t=>t.includes("saint philip")),"Phillip group has partial role");
assert.ok(map.get("2026-05-11").linkedCatalogueArt.every(a=>a.status==="PARTIAL_GROUP_ONLY"||a.status==="LEGACY_EXACT_TITLE_RESEARCH_LINK"));
assert.ok(map.get("2026-09-15").additionalStudy.some(a=>a.title.includes("Seven Sorrows")),"Preserve Seven Sorrows approved module reuse");
assert.ok(map.get("2026-10-07").additionalStudy.some(a=>a.title.includes("Madonna del Rosario")),"Preserve selected Lotto Rosary artwork");
assert.ok(map.get("2026-10-03").linkedCatalogueArt.some(a=>a.status==="PAINTING_COPYRIGHT_RIGHTS_HOLD"),"Celine Martin identity is preserved but artwork rights remain held");
assert.ok(j.days.filter(x=>x.rank==="IV").every(x=>!x.dateSelectedArt&&!x.linkedCatalogueArt.length),"No unapproved seasonal paintings auto-assigned");
const selected=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-accepted-source-match-batch1.v1.json",import.meta.url),"utf8"));
const institutional=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-museum-multiwork-match-batch2.v1.json",import.meta.url),"utf8"));
assert.equal(selected.statistics.acceptedSourceLedgerTotal,856);
assert.equal(selected.statistics.newStrictClassIIIDates,12);
assert.equal(selected.statistics.newStrictAcceptedSourceLeads,17);
assert.equal(selected.strictExactSaintResearch.reduce((n,x)=>n+x.entries.length,0),17);
assert.equal(new Set(selected.strictExactSaintResearch.map(x=>x.date)).size,12);
for(const row of selected.strictExactSaintResearch){
  const d=map.get(row.date);
  assert.equal(d.rank,"III");
  assert.equal(d.observedPrincipalId,row.principalId);
  assert.ok(!d.linkedCatalogueArt.length,"must close a previous 383 catalogue gap");
  assert.deepEqual(d.additionalAcceptedSourceLeads.map(x=>x.sourceCardId),row.entries.map(x=>x.sourceCardId));
  for(const a of row.entries){
    assert.equal(a.canonicalArtworkId,null,"must not fabricate canonical IDs");
    assert.equal(a.editorialApprovalForFeast,false);
    assert.equal(a.imageRightsForProductionVerified,false);
    assert.equal(a.homepageRotationApproved,false);
  }
}
assert.equal(j.summary.III.additionalUnlinked856ExactSubjectDateCandidates,16);
assert.equal(j.summary.III.identifiedDateSubjectOrCatalogueCandidates,123);
assert.equal(j.summary.III.remainingWithoutDatedSelectionOrAnyExactSourceCandidate,42);
assert.equal(j.days.filter(x=>x.rank==="III"&&x.observedPrincipalId.startsWith("sancti:")&&!x.linkedCatalogueArt.length&&!x.additionalAcceptedSourceLeads?.length&&!x.additionalLegacyNamedFileLeads?.length&&!x.additionalBreviariumSourceLeads?.length&&!x.additionalNewMuseumLeads?.length).length,8);
assert.equal(selected.partialOrExcludedGroupOrDifferentSaint.find(x=>x.date==="2026-07-10").entries.length,1);
assert.ok(!map.get("2026-07-10").additionalAcceptedSourceLeads,"Seville Rufina is not Roman Rufina or Secunda");
assert.ok(map.get("2026-01-20").partialOrExcludedAcceptedSourceLeads.length>=4);
assert.equal(institutional.totals.museumStudyLinks,9);
assert.equal(institutional.totals.groupPartialLinks,2);
assert.equal(institutional.totals.tentativeUnconfirmedSubjectLinks,1);
assert.equal(new Set(institutional.workDateLinks.map(x=>x.date)).size,8);
for(const x of institutional.workDateLinks){
  assert.equal(map.get(x.date).observedPrincipalId,x.principalId);
  assert.equal(x.editorialDateApproved,false);
  assert.equal(x.rotationEligible,false);
}
assert.ok(institutional.workDateLinks.find(x=>x.entryId==="B20-01")?.acceptedSourceCardAlias==="nga:72037","deduplicate Ribera martyrdom against accepted 856");
assert.ok(institutional.workDateLinks.find(x=>x.entryId==="B20-02")?.acceptedSourceCardAlias==="cma:111479","deduplicate Coypel against accepted 856");
assert.ok(institutional.workDateLinks.find(x=>x.entryId==="B22-03")?.role.startsWith("TENTATIVE"),"Matthias is not exact");
const classI=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-classi-selected-museum-object-match-batch3.v1.json",import.meta.url),"utf8"));
assert.equal(classI.statistics.datePaintingSourceRelationships,14);
assert.equal(classI.statistics.distinctClassIDatesWithResearch,13);
assert.equal(classI.statistics.distinctClassIDatesWithPhysicalObjectResearchVerified,11);
assert.equal(j.summary.I.daysWithExplicitSelectedPaintingPhysicalObjectResearch,11);
assert.equal(j.days.filter(x=>x.rank==="I"&&!x.linkedCatalogueArt.length&&x.selectedPaintingPhysicalSourceLeads?.some(q=>q.physicalOriginalObjectVerified)).length,9);
for(const link of classI.records){
  const d=map.get(link.date);
  assert.equal(d.rank,"I");
  assert.equal(d.observedPrincipalId,link.principalId);
  assert.equal(link.productionMasterCertified,false);
  assert.equal(link.photoRightsForCommercialAppApproved,false);
  assert.equal(link.productionMobileCropApproved,false);
  assert.ok(d.selectedPaintingPhysicalSourceLeads.some(y=>y.sourceRecordId===link.sourceRecordId));
}
assert.ok(classI.records.find(x=>x.sourceRecordId==="B11-01").status.includes("REUSE_BLOCKED"),"Tissot museum photo not app-licensed");
assert.equal(classI.records.find(x=>x.sourceRecordId==="B18-02").physicalOriginalObjectVerified,false,"Carracci exact object unresolved");
assert.equal(classI.records.find(x=>x.sourceRecordId==="B11-09").physicalOriginalObjectVerified,false,"Sacchi physical accession unresolved");
const batch4=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-existing-source-matches-batch4.v1.json",import.meta.url),"utf8"));
assert.equal(batch4.counts.newMatchedClassIIISanctoralDates,7);
assert.equal(batch4.counts.newCanonical383MatchedDates,3);
assert.equal(batch4.counts.newAcceptedSourceOnlyMatchedDates,3);
assert.equal(batch4.counts.newLegacyNamedFileOnlyMatchedDates,1);
assert.equal(batch4.counts.nowUnmatchedClassIIISanctoral,79);
assert.equal(j.summary.III.additionalLegacyNamedFileExactSubjectDates,1);
assert.equal(j.summary.III.remainingUnmatchedSanctoralAcrossAllThreeSourceRegisters,8);
assert.equal(batch4.rows.length,7);
for(const row of batch4.rows){
  const d=map.get(row.date);
  assert.equal(d.rank,"III");
  assert.equal(d.observedPrincipalId,row.principalId);
  assert.equal(d.sourceMatchingStatus,"EXACT_SAINT_FEAST_RESEARCH_MATCH_PENDING_PUBLICATION_AND_DATE_APPROVAL");
  assert.equal(row.dateSpecificEditorialApprovalNew,false);
  assert.equal(row.liveHomeRotationEnabled,false);
  assert.ok(row.works.length);
  for(const w of row.works){assert.equal(w.photoReleaseCertified,false);assert.equal(w.rotationEligible,false);}
}
assert.ok(art("2026-10-02").some(t=>t.includes("guardian angel")));
assert.ok(art("2026-07-31").some(t=>t.includes("ignatius")));
assert.ok(art("2026-10-24").some(t=>t.includes("rafael")));
const raphael=map.get("2026-10-24").linkedCatalogueArt[0];
assert.equal(raphael.historicalW72Score,5);
assert.equal(raphael.editorial,"UNREVIEWED");
assert.ok(map.get("2026-02-12").additionalLegacyNamedFileLeads[0].sourceFile.includes("Masucci"));
assert.ok(map.get("2026-06-05").identityUncertaintyWarnings.join(" ").includes("not sure who this chap is"));
assert.ok(map.get("2026-02-04").identityUncertaintyWarnings.join(" ").includes("may depict one original"));

const batch5=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-existing-source-matches-batch5.v1.json",import.meta.url),"utf8"));
assert.equal(batch5.counts.newMatchedClassIIISanctoralDates,1);
assert.equal(batch5.counts.nowUnmatchedClassIIISanctoral,78);
assert.equal(batch5.rows[0].principalId,map.get("2026-08-12").observedPrincipalId);
assert.deepEqual(map.get("2026-08-12").additionalAcceptedSourceLeads.map(x=>x.sourceCardId),["walters:18326","rijks:200110753"]);
assert.equal(map.get("2026-08-12").linkedCatalogueArt.length,0,"No false 383 identity");
for(const w of batch5.rows[0].works){assert.equal(w.photoReleaseCertified,false);assert.equal(w.rotationEligible,false);assert.equal(w.editorialApprovalForFeast,false);assert.equal(w.canonicalArtworkId,null);}

const partial6=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-partial-groups-existing-archive-batch6.v1.json",import.meta.url),"utf8"));
assert.equal(partial6.counts.classIIISanctoralDatePartsNew,3);
assert.equal(partial6.counts.completeFeastDateNew,0);
assert.equal(partial6.counts.classIIISanctoralCompleteUnmatchedStill,78);
assert.deepEqual(partial6.rows.map(x=>x.date),["2026-01-22","2026-07-10","2026-07-28"]);
assert.deepEqual(partial6.rows.map(x=>x.works.length),[1,1,2]);
for(const row of partial6.rows){
  const observed=map.get(row.date);
  assert.equal(row.principalId,observed.observedPrincipalId);
  assert.equal(row.strictFullFeastMatch,false);
  assert.equal(row.subjectIdentityVerified,false);
  assert.equal(observed.partialGroupFeastFullMatch,false);
  assert.equal(observed.linkedCatalogueArt.length,0);
  assert.ok(!observed.additionalAcceptedSourceLeads?.length);
  assert.ok(!observed.additionalLegacyNamedFileLeads?.length);
  for(const w of row.works){assert.equal(w.photoReleaseCertified,false);assert.equal(w.rotationEligible,false);}
}
assert.equal(map.get("2026-01-22").partialOrExcludedAcceptedSourceLeads[0].sourceCardId,"met:435847");
assert.equal(map.get("2026-07-10").partialGroupLegacyNamedFileLeads[0].historicalFile,"File:SevenBrothers.jpg");
assert.equal(map.get("2026-07-28").partialGroupLegacyNamedFileLeads.length,2);
assert.ok(map.get("2026-07-10").partialOrExcludedAcceptedSourceLeads.some(x=>x.sourceCardId==="commons:29858581"));
assert.equal(j.summary.III.identifiedDateSubjectOrCatalogueCandidates,123,"partial feast groups do not inflate exact subject matches");
assert.equal(j.summary.III.remainingUnmatchedSanctoralAcrossAllThreeSourceRegisters,8);


const batch7=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-breviarium-existing-subject-match-batch7.v1.json",import.meta.url),"utf8"));
assert.equal(batch7.counts.newFeastSubjectsReconciled,3);
assert.equal(batch7.counts.nowIdentifiedClassIIISanctoral,56);
assert.equal(batch7.counts.nowUnmatchedClassIIISanctoral,75);
assert.equal(batch7.olderCatalogue451Exclusion.extraRecords,68);
assert.equal(batch7.olderCatalogue451Exclusion.reintroducedRejections,0);
for (const x of batch7.rows){
  const d=map.get(x.date);
  assert.equal(d.observedPrincipalId,x.principalId);
  assert.equal(d.rank,"III");
  assert.equal(d.linkedCatalogueArt.length,0);
  assert.equal(d.additionalBreviariumSourceLeads.length,1);
  assert.equal(d.additionalBreviariumSourceLeads[0].breviarumPlateId,x.works[0].breviarumPlateId);
  assert.equal(x.dateSpecificEditorialApprovalNew,false);
  assert.equal(x.productionPhotoCertified,false);
  assert.equal(x.rotationEligible,false);
  assert.equal(x.works[0].canonical383ArtworkId,null);
  assert.equal(x.works[0].homeRotationEligible,false);
  assert.equal(x.works[0].exactImageRightsForAppVerified,false);
}
assert.deepEqual(batch7.rows.map(x=>x.date),["2026-02-11","2026-05-04","2026-08-07"]);
assert.ok(batch7.rows[0].works[0].commonsNativePixels[0]<1000,"Lourdes needs new photo QA");
assert.ok(batch7.rows[1].works[0].commonsNativePixels[0]<1000,"Monica needs new photo QA");
assert.ok(batch7.rows[2].works[0].commonsNativePixels[0]>6000,"Tiepolo is large but must not be auto-published");

const batch8=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-exact-sanctoral-research-batch8.v1.json",import.meta.url),"utf8"));
assert.equal(batch8.counts.unique2026FeastDates,11);
assert.equal(batch8.counts.distinctResearchSourceRecords,12);
assert.equal(batch8.counts.toIdentifiedSubjectDates,67);
assert.equal(batch8.counts.toUnmatchedSanctoralDates,64);
assert.equal(batch8.counts.newUserEditorialApprovals,0);
assert.equal(batch8.counts.newCanonical383ArtworkIds,0);
assert.equal(batch8.counts.newLiveAppImages,0);
assert.equal(j.summary.III.additionalNewExternalExactSubjectDates,67);
assert.equal(j.summary.III.remainingUnmatchedSanctoralAcrossAllSourceRegistries,8);
const q8=new Set();
for(const row of batch8.rows) {
  const observed=map.get(row.date);
  assert.equal(observed.observedPrincipalId,row.principalId);
  assert.equal(observed.rank,"III");
  assert.ok(!observed.linkedCatalogueArt.length);
  assert.ok(!observed.additionalAcceptedSourceLeads?.length);
  assert.ok(row.candidateSources.length>=1);
  assert.equal(row.appReleaseCertified,false);
  assert.equal(row.newDateUserApproval,false);
  assert.deepEqual(observed.additionalNewMuseumLeads.map(x=>x.researchSourceId),row.candidateSources.map(x=>x.researchSourceId));
  for(const lead of row.candidateSources) {
    assert.ok(!q8.has(lead.researchSourceId),"duplicate source identity in Batch 8");
    q8.add(lead.researchSourceId);
    assert.equal(lead.artworkOriginalAcquired,false);
    assert.equal(lead.finalFeastArtworkUserApproval,false);
    assert.equal(lead.homeRotationEligible,false);
    assert.equal(lead.exactPhotoLicenceVerified,false);
    assert.equal(lead.nativeFramelessMobileHeroQA,false);
    assert.ok(lead.sourceObjectUrl.startsWith("https://"));
  }
}
assert.equal(q8.size,12);
assert.equal(map.get("2026-05-05").additionalNewMuseumLeads.length,2,"distinct Pius V paintings remain separate");
assert.equal(j.days.filter(x=>x.rank==="III"&&x.observedPrincipalId.startsWith("sancti:")&&!x.linkedCatalogueArt.length&&!x.additionalAcceptedSourceLeads?.length&&!x.additionalLegacyNamedFileLeads?.length&&!x.additionalBreviariumSourceLeads?.length&&!x.additionalNewMuseumLeads?.length).length,8);


const batch9=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-exact-sanctoral-research-batch9.v1.json",import.meta.url),"utf8"));
assert.equal(batch9.counts.newDateSubjects,17);
assert.equal(batch9.counts.newSourcePaintingLeads,22);
assert.equal(batch9.counts.classIIISanctoralMatchedAfter,84);
assert.equal(batch9.counts.classIIISanctoralUnmatchedAfter,47);
assert.equal(batch9.counts.newUserApprovals,0);
assert.equal(batch9.counts.newProductionCertified,0);
assert.equal(batch9.rows.length,17);
const q9=new Set();
for(const row of batch9.rows){
 const d=map.get(row.date);
 assert.equal(d.observedPrincipalId,row.principalId);
 assert.equal(d.rank,"III");
 assert.equal(d.linkedCatalogueArt.length,0);
 assert.deepEqual(d.additionalNewMuseumLeads.map(z=>z.researchSourceId).filter(id=>row.works.some(w=>w.researchSourceId===id)),row.works.map(w=>w.researchSourceId));
 assert.equal(row.dateArtworkApproved,false);
 assert.equal(row.productionCertified,false);
 for(const w of row.works){
  assert.ok(!q9.has(w.researchSourceId));
  q9.add(w.researchSourceId);
  assert.equal(w.originalFileAcquired,false);
  assert.equal(w.editorialApprovalForFeast,false);
  assert.equal(w.homeRotationEligible,false);
  assert.equal(w.photoRightsForProductionVerified,false);
  assert.equal(w.nativeFramelessMobileHeroQA,false);
 }
}
assert.equal(q9.size,22);
assert.equal(batch9.rows.find(x=>x.date==="2026-01-30").works.length,2);
assert.equal(batch9.rows.find(x=>x.date==="2026-10-08").works.length,2);
assert.equal(batch9.rows.find(x=>x.date==="2026-09-28").works.length,2);


const batch10=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-exact-sanctoral-research-batch10.v1.json",import.meta.url),"utf8"));
assert.equal(batch10.counts.newSubjectDates,23);
assert.equal(batch10.counts.newPaintingSourceRecords,36);
assert.equal(batch10.counts.classIIIMatchedAfter,107);
assert.equal(batch10.counts.unmatchedSanctoralAfter,24);
assert.equal(batch10.rows.length,23);
assert.equal(j.summary.III.additionalNewExternalPaintingCandidateRecords,93);
assert.equal(j.summary.III.additionalNewExternalExactSubjectDates,67);
const q10=new Set();
for(const row of batch10.rows){
 const d=map.get(row.date);
 assert.equal(d.observedPrincipalId,row.principalId);
 assert.equal(d.rank,"III");
 assert.equal(d.linkedCatalogueArt.length,0);
 assert.equal(row.newUserDateArtworkApproval,false);
 assert.equal(row.photoReleaseCertified,false);
 assert.equal(row.homeRotationEligible,false);
 assert.deepEqual(d.additionalNewMuseumLeads.map(x=>x.researchSourceId),row.works.map(x=>x.researchSourceId));
 for(const lead of row.works){
  assert.ok(!q10.has(lead.researchSourceId));
  q10.add(lead.researchSourceId);
  assert.equal(lead.canonical383ArtworkId,null);
  assert.equal(lead.sourceOriginalDownloaded,false);
  assert.equal(lead.photoLicenseVerifiedForApp,false);
  assert.equal(lead.newArtEditorApproval,false);
  assert.equal(lead.productionPublicationAllowed,false);
  assert.equal(lead.rotationEligible,false);
 }
}
assert.equal(q10.size,36);
assert.equal(map.get("2026-09-16").additionalNewMuseumLeads.length,1,"Veronese depicts both Cornelius and Cyprian");
assert.ok(map.get("2026-11-26").additionalNewMuseumLeads.every(x=>/abbot|gozzolini|silvester abate|sylvester/i.test(x.titleAsSource)),"Nov 26 must be Sylvester Gozzolini, not Pope Sylvester I");
assert.ok(map.get("2026-09-03").additionalNewMuseumLeads.some(x=>x.verificationHolds.includes("Getty/Mondadori")),"do not clear modern Getty photo");
assert.ok(batch10.rows.every(x=>x.works.length>=1));


const batch11=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-exact-sanctoral-research-batch11.v1.json",import.meta.url),"utf8"));
assert.equal(batch11.counts.newExactDates,16);
assert.equal(batch11.counts.newNamedArtworkSourceRecords,23);
assert.equal(batch11.counts.matchedDatesAfter,123);
assert.equal(batch11.counts.remainingFullSubjectGapsAfter,8);
assert.equal(batch11.counts.finalArtworksApproved,0);
assert.equal(batch11.counts.productionImagesAdded,0);
assert.equal(batch11.rows.length,16);
const new11=new Set();
for(const row of batch11.rows){
 const observed=map.get(row.date);
 assert.equal(observed.observedPrincipalId,row.principalId);
 assert.equal(observed.rank,"III");
 assert.equal(observed.linkedCatalogueArt.length,0);
 assert.equal(row.editorialFeastApproval,false);
 assert.deepEqual(observed.additionalNewMuseumLeads.map(x=>x.researchSourceId),row.candidateArtworks.map(x=>x.researchSourceId));
 for(const artwork of row.candidateArtworks){
   assert.ok(!new11.has(artwork.researchSourceId));
   new11.add(artwork.researchSourceId);
   assert.equal(artwork.originalFileDownloaded,false);
   assert.equal(artwork.canonical383ArtId,null);
   assert.equal(artwork.finalUserArtworkSelection,false);
   assert.equal(artwork.sourcePhotoRightsAppCleared,false);
   assert.equal(artwork.rotationEligible,false);
 }
}
assert.equal(new11.size,23);
assert.equal(batch11.partialFeasts.length,1);
assert.equal(batch11.partialFeasts[0].date,"2026-05-12");
assert.equal(map.get("2026-05-12").partialGroupFeastFullMatch,false);
assert.deepEqual(map.get("2026-05-12").partialGroupNewResearchLeads[0].missingSaints,["Saint Pancras"]);
assert.equal(map.get("2026-01-20").additionalNewMuseumLeads.length,2,"all Fabian and Sebastian together");
assert.equal(map.get("2026-06-26").additionalNewMuseumLeads.length,1,"both John and Paul together");
assert.equal(map.get("2026-09-12").additionalNewMuseumLeads[0].artistAsSource,"Cristóbal de Villalpando");
assert.deepEqual(j.days.filter(x=>x.rank==="III"&&x.observedPrincipalId.startsWith("sancti:")&&!x.linkedCatalogueArt.length&&!x.additionalAcceptedSourceLeads?.length&&!x.additionalLegacyNamedFileLeads?.length&&!x.additionalBreviariumSourceLeads?.length&&!x.additionalNewMuseumLeads?.length).map(x=>x.date),["2026-01-16","2026-01-22","2026-02-06","2026-04-22","2026-05-12","2026-07-10","2026-07-28","2026-11-18"]);

const everyArt=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-all383-four-class-reverse-index.v1.json",import.meta.url),"utf8"));
assert.equal(everyArt.counts.canonicalArtworkIds,383);
assert.equal(everyArt.counts.canonicalIdsLinkedAnyClass,178);
assert.equal(everyArt.counts.canonicalIdsNoObservedClassLink,205);
assert.equal(everyArt.counts.dateWorkLinks,186);
assert.deepEqual(Object.fromEntries(["I","II","III","IV"].map(k=>[k,everyArt.counts.perRank[k].links])),{I:65,II:42,III:79,IV:0});
assert.equal(everyArt.counts.worksOnMoreThanOneDate,8);
assert.equal(new Set(everyArt.artworks.map(x=>x.artworkId)).size,383);
for(const art of everyArt.artworks){
  assert.equal(art.publicationStatus,"NO_NEW_RELEASE_APPROVED");
  for(const linked of art.allFourClasses2026DateLinks){
    assert.equal(linked.homeRotationEligible,false);
    assert.equal(linked.photoReleaseCertified,false);
    assert.equal(linked.newDateApprovalIntroducedByThisMatchingPass,false);
    const matched=map.get(linked.date);
    assert.equal(matched.observedPrincipalId,linked.observedPrincipalId);
    assert.ok(matched.linkedCatalogueArt.some(x=>x.artworkId===art.artworkId));
  }
}
console.log("Sacred Art 2026: 365 exact dates, four-class reporting, anti-confusion and external reuse gates PASS");
