import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),"utf8"));
const docs=await read("data/learn/magisterium-ultra-master-documents.v1.json");
const doctrines=await read("data/learn/magisterium-ultra-master-doctrines.v1.json");
const passages=await read("data/learn/magisterium-source-passages-pilot.v1.json");
const apol=await read("data/learn/apologetics-canonical.v1.json");
const crisis=await read("data/learn/church-crisis-canonical.v1.json");
const pius=await read("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
assert.equal(docs.schema,"AO_MAGISTERIUM_ULTRA_MASTER_DOCUMENTS_V1");
assert.equal(doctrines.schema,"AO_MAGISTERIUM_ULTRA_MASTER_DOCTRINES_V1");
assert.equal(passages.schema,"AO_MAGISTERIUM_SOURCE_PASSAGE_PILOT_V1");
assert.equal(docs.status,"P0_P1_RESEARCH_ONLY");
assert.equal(doctrines.policy.publishable,false);
assert.equal(passages.publicationAllowed,false);
const ids=new Set(docs.records.map(x=>x.id));
assert.equal(ids.size,docs.records.length);
assert.equal(ids.size,83);
assert.equal(docs.metrics.documentCandidates,83);
assert.equal(docs.records.filter(x=>x.historicalLayer==="HISTORICAL_THROUGH_1962").length,68);
assert.equal(docs.records.filter(x=>x.historicalLayer==="AFTER_1962").length,15);
assert.equal(docs.records.filter(x=>x.primarySource.verifiedAtDocumentLevel).length,7);
assert.equal(docs.records.filter(x=>x.existingResearchReferences.length).length,27);
assert.equal(docs.records.reduce((sum,x)=>sum+x.existingResearchReferences.length,0),31);
const fams=new Set(docs.families.map(x=>x.id));
const validForms=new Set(["ecumenical_council","encyclical","papal_bull","motu_proprio","apostolic_constitution","apostolic_letter","congregational_decree","congregational_declaration","papal_syllabus","apostolic_exhortation","catechism"]);
for(const item of docs.records){
 assert.ok(validForms.has(item.documentForm),item.id);
 assert.ok(item.year>=325&&item.year<=2026);
 assert.equal(item.year<=1962,item.historicalLayer==="HISTORICAL_THROUGH_1962");
 assert.ok(item.doctrineFamilies.every(x=>fams.has(x)));
 assert.equal(item.publicationGate,"INDEX_ONLY");
 assert.equal(item.originalPassagesImported,0);
 assert.equal(item.claimLevelAuthorityReview,"NOT_ASSESSED");
 assert.equal(item.denzingerCrosswalk.matchStatus,"NOT_VERIFIED");
 for(const key of ["oldDenzinger","denzingerSchonmetzer","denzingerHunermann"])
  assert.equal(item.denzingerCrosswalk[key],null,"Denzinger concordance not yet edition certified "+item.id);
 for(const source of item.existingResearchReferences){
  assert.match(source.sourcePack,/^data\/learn\//);
  assert.ok(source.sourceId);
  assert.equal(source.editorialStatus,"RESEARCH_LINK_ONLY_UNAPPROVED");
 }
}
const sourcePacks=[...new Set(docs.records.flatMap(x=>x.existingResearchReferences.map(r=>r.sourcePack)))];
const sourceRowsByPath=new Map();
for(const path of sourcePacks){
 const pack=await read(path);
 assert.ok(Array.isArray(pack.source_registry),path);
 sourceRowsByPath.set(path,new Set(pack.source_registry.map(x=>x.id)));
}
for(const entry of docs.records)for(const ref of entry.existingResearchReferences)
 assert.ok(sourceRowsByPath.get(ref.sourcePack).has(ref.sourceId),
  "Unresolved original repository source: "+entry.id+" "+ref.sourcePack+" "+ref.sourceId);
const apolIds=new Set(apol.dossiers.map(x=>x.id));
const crisisIds=new Set(crisis.dossiers.map(x=>x.id));
const qids=new Set(pius.entries.map(x=>"PX1912-Q"+String(x.q).padStart(3,"0")));
const subjectIds=new Set(doctrines.records.map(x=>x.id));
assert.equal(subjectIds.size,doctrines.records.length);
assert.equal(subjectIds.size,51);
let links=0,apolCount=0,crCount=0;
for(const subject of doctrines.records){
 assert.ok(fams.has(subject.family),subject.id);
 assert.equal(subject.allPassagesVerified,false);
 for(const item of subject.documentCandidates){
  assert.ok(ids.has(item.documentId),subject.id+"->"+item.documentId);
  assert.equal(item.linkStatus,"TOPIC_RELATIONSHIP_PROPOSED_UNVERIFIED_PASSAGE");
  links++;
 }
 for(const link of subject.existingOwners){
  if(link.owner==="APOLOGETICS_CANONICAL_V1"){assert.ok(apolIds.has(link.ref));apolCount++;}
  else if(link.owner==="CHURCH_CRISIS_CANONICAL_V1"){assert.ok(crisisIds.has(link.ref));crCount++;}
  else if(link.owner==="LTF_PIUS_X_CATECHISM_INDEX")assert.ok(qids.has(link.ref));
  else throw Error("Unexpected owner "+link.owner);
 }
}
assert.equal(links,106);
assert.equal(apolCount,53);
assert.equal(crCount,10);
assert.equal(doctrines.metrics.originalPassageCertifications,0);
assert.equal(passages.records.length,61);
assert.equal(passages.records.filter(x=>x.crosswalkCandidate.modernNumber).length,44);
const passageIds=new Set();
for(const p of passages.records){
 assert.ok(!passageIds.has(p.passageId));passageIds.add(p.passageId);
 assert.ok(ids.has(p.documentId));
 assert.ok(p.doctrineIds.length&&p.doctrineIds.every(id=>subjectIds.has(id)));
 assert.ok(/^https:\/\//.test(p.verifiedSourceUrl));
 assert.equal(p.textCopied,false);
 assert.equal(p.publisherFacingApproved,false);
 assert.equal(p.sourceTextVerificationLevel,"LATIN_UNIT_LOCATOR_NOT_TEXT_COLLATION");
 assert.ok(p.canonicalLatinWitnessLocator?.startsWith("https://"));
 assert.ok(p.witnessGranularity?.includes("NOT_CRITICALLY_COLLATED"));
 for(const doctrineId of p.doctrineIds){
  const doctrine=doctrines.records.find(d=>d.id===doctrineId);
  assert.ok(doctrine.documentCandidates.some(link=>link.documentId===p.documentId),`Orphan passage-doctrine edge: ${p.passageId} ${doctrineId}`);
 }
 assert.equal(p.primaryLatinChecked,true);
 assert.equal(p.publisherFacingApproved,false);
 assert.ok(p.sourceWitnesses.length>0);
 for(const w of p.sourceWitnesses){assert.match(w.url,/^https:\/\//);assert.equal(w.editionAndRightsStatus,"NOT_CERTIFIED_FOR_REPRODUCTION");}
 assert.equal(p.teologicalClaimCertified,undefined);
 assert.equal(p.theologicalClaimCertified,false);
 assert.equal(p.publicationPermission,"NOT_CLEARED");
 if(p.crosswalkCandidate.modernNumber!==null){
  assert.equal(p.exactCrosswalkStatus,"CANDIDATE_NEEDS_EDITION_CONFIRMATION");
  assert.ok(p.crosswalkCandidate.sourceEvidence);
 }
}
assert.equal(passages.metrics.authoritativeFullOriginalPassagesCertified,0);
assert.equal(passages.editionVerifiedCrosswalks,0);
assert.equal(passages.metrics.additionalLocatorRecords,53);
assert.equal(passages.metrics.b4CanonRecordsAudited,24);
assert.equal(passages.metrics.b4PassageTopicEdgesChecked,75);
assert.equal(passages.metrics.b4UnmatchedPassageTopicEdges,0);
assert.equal(passages.metrics.b4RepairedCrosswalkPairs,4);
assert.equal(doctrines.metrics.topicToDocumentCandidates,106);
assert.equal(doctrines.metrics.b4AddedDocumentCandidatePairs,5);
assert.equal(passages.metrics.b3AddedLocatorRecords,35);
assert.equal(passages.metrics.publicationReadyRecords,0);
assert.equal(passages.sourceMethodology.authoritativeSourceQuoteGate,"CLOSED");
assert.deepEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],passages.records.filter(p=>p.documentId==="TRENT-XIV-1551"&&p.canonNumber).map(p=>p.canonNumber).sort((a,b)=>a-b));
assert.deepEqual([1,2,3,4,5,6,7,8,9],passages.records.filter(p=>p.documentId==="TRENT-XXII-1562"&&p.canonNumber).map(p=>p.canonNumber).sort((a,b)=>a-b));
for(const [id,n,o] of [["MG-P017",1746,943],["MG-P023",1709,919],["MG-P018",1751,948],["MG-P019",1753,950]]){
 const p=passages.records.find(x=>x.passageId===id);
 assert.deepEqual([p.crosswalkCandidate.modernNumber,p.crosswalkCandidate.oldNumber],[n,o],id);
 assert.equal(p.exactCrosswalkStatus,"CANDIDATE_NEEDS_EDITION_CONFIRMATION");
}
assert.ok(passages.records.every(x=>x.publisherFacingApproved===false&&!x.theologicalClaimCertified));
assert.equal(passages.metrics.originalLatinLocatorChecks,passages.records.filter(x=>x.primaryLatinChecked).length);
// An example of why document authorship cannot be inferred from pontifical approval:
assert.equal(docs.records.find(x=>x.id==="QUAM-SINGULARI-1910").documentForm,"congregational_decree");
assert.match(docs.records.find(x=>x.id==="QUAM-SINGULARI-1910").issuer,/Sacred Congregation/);
assert.equal(docs.records.find(x=>x.id==="SACRA-TRIDENTINA-SYNODUS-1905").documentForm,"congregational_decree");

const claimReviews=await read("data/learn/magisterium-doctrinal-claim-reviews.v1.json");
assert.equal(claimReviews.schema,"AO_MAGISTERIUM_DOCTRINAL_CLAIM_REVIEW_V1");
assert.equal(claimReviews.metrics.reviewedClaims,59);
assert.equal(claimReviews.metrics.sourceScopedCanons,28);
assert.equal(claimReviews.metrics.totalSourcePassageLocators,61);
assert.equal(claimReviews.metrics.remainingPassagesWithoutEditorialClaim,0);
assert.equal(claimReviews.rules.notVisitorFacing,true);
const idMap=new Map(passages.records.map(p=>[p.passageId,p]));
const claimPassageIds=new Set();
for(const c of claimReviews.records){
 assert.ok(!claimPassageIds.has(c.passageId),"duplicate scoped claim "+c.passageId);
 claimPassageIds.add(c.passageId);
 const p=idMap.get(c.passageId);
 assert.ok(p,"unknown passage in review "+c.passageId);
 assert.equal(c.documentId,p.documentId);
 assert.deepEqual(c.doctrineIds,p.doctrineIds);
 assert.ok(c.sourceWitness.url.startsWith("https://"));
 assert.equal(c.reviewStatus,"SOURCE_SCOPE_EDITORIAL_REVIEW_ONLY");
 assert.equal(c.rightsCleared,false);
 assert.equal(c.doctrinallyCertified,false);
 assert.equal(c.publiclyUsable,false);
 assert.equal(c.translation,null);
 assert.equal(c.exactOriginalQuote,null);
 assert.equal(c.characterVoiceAttribution,"NEVER_INFER_FROM_MAGISTERIUM");
 assert.ok(c.editorialProposition.length>30);
 assert.ok(c.interpretationGuard.length>25);
 assert.ok(c.classification.magisterialNote==="NOT_THEOLOGICALLY_ADJUDICATED");
}
assert.deepEqual(claimReviews.notYetScopedPassageIds,[]);
assert.equal(claimReviews.nonStandalonePassageAliases.length,2);
assert.equal(claimReviews.metrics.allPassagesDispositioned,61);
const aliases=new Set();
for(const a of claimReviews.nonStandalonePassageAliases){
 assert.ok(!claimPassageIds.has(a.passageId),"Nonstandalone alias must not also be a claim");
 assert.ok(claimPassageIds.has(a.canonicalPassageId),"Alias must point to canonical claim");
 assert.ok(!aliases.has(a.passageId));aliases.add(a.passageId);
}
assert.equal(claimPassageIds.size+aliases.size,passages.records.length);
for(const p of passages.records){
 assert.ok(claimPassageIds.has(p.passageId)||aliases.has(p.passageId));
 assert.equal(p.b6Disposition,claimPassageIds.has(p.passageId)?"INTERNAL_CLAIM_EDITORIAL_NOT_CERTIFIED":"NON_STANDALONE_SOURCE_ALIAS");
 assert.equal(p.publisherFacingApproved,false);
}
assert.equal(claimReviews.records.filter(c=>c.passageGenre==="SOLEMN_DEFINITION_FORMULA").length,2);
assert.ok(claimReviews.records.filter(c=>c.classification.temporalLawReview==="REQUIRED").length>=3);


const bridges=await read("data/learn/magisterium-source-owner-bridges.v1.json");
assert.equal(bridges.schema,"AO_MAGISTERIUM_SOURCE_OWNER_BRIDGES_V1");
assert.equal(bridges.metrics.bridgeTopicGroups,7);
assert.equal(bridges.metrics.massExplorerCandidateContexts,4);
assert.equal(bridges.metrics.approvedPublishedLinks,0);
assert.equal(bridges.bridgeRules.noConjecturalMassCardIds,true);
for(const b of bridges.bridges){
 assert.equal(b.approvedForCharacterAnswer,false);
 assert.equal(b.approvedForUI,false);
 for(const pid of b.passages)assert.ok(claimPassageIds.has(pid));
 for(const link of b.originalOwnerRefs){
   if(link.owner==="APOLOGETICS_CANONICAL_V1")assert.ok(apolIds.has(link.ref));
   else if(link.owner==="LTF_PIUS_X_CATECHISM_INDEX")assert.ok(qids.has(link.ref));
   else throw Error("Unrecognized source-owned character bridge");
 }
}
for(const b of bridges.massExplorerContextCandidates){
 assert.equal(b.specificCardId,null);
 assert.equal(b.approvedForUI,false);
 for(const p of b.evidence)assert.ok(claimPassageIds.has(p));
}

const b7qa=await read("data/learn/magisterium-pius-x-catechism-qa-crosswalk.v1.json");
assert.equal(b7qa.schema,"AO_MAGISTERIUM_PIUS_X_1912_QA_CROSSWALK_V1");
assert.equal(b7qa.records.length,28);
assert.equal(b7qa.metrics.previousQuestions,8);
assert.equal(b7qa.metrics.addedQuestions,20);
assert.equal(b7qa.metrics.directPairs,24);
assert.equal(b7qa.metrics.contextOnlyPairs,4);
assert.equal(b7qa.metrics.originalPrintCollated,0);
assert.equal(b7qa.metrics.published,0);
const qidSet=new Set(),reviewMap=new Map();
for(const q of b7qa.records){
 assert.ok(!qidSet.has(q.questionId));qidSet.add(q.questionId);
 assert.ok(qids.has(q.questionId),q.questionId);
 assert.equal(q.questionId,"PX1912-Q"+String(q.questionNumber).padStart(3,"0"));
 assert.ok(q.englishWitnessUrl.startsWith("https://github.com/gustavo-depaula/ember/blob/65d10046c19b610a4307ef273a751ceeb3c4f153/"));
 assert.ok(q.italianWitnessUrl.startsWith("https://"));
 assert.ok(idMap.has(q.passageId),q.passageId);
 assert.equal(q.printOriginalCollated,false);
 assert.equal(q.englishRightsCleared,false);
 assert.equal(q.publiclyUsable,false);
 reviewMap.set(q.questionId,q);
}
const b7Pius=new Set(bridges.bridges.flatMap(g=>g.pius));
assert.equal(b7Pius.size,28);
assert.deepEqual([...b7Pius].sort(),[...qidSet].sort());
assert.equal(bridges.metrics.uniquePiusQuestionIds,28);
assert.equal(bridges.metrics.b7BilingualFullAnswerReviews,28);
assert.equal(bridges.metrics.approvedPublishedLinks,0);
for(const g of bridges.bridges)for(const ref of g.pius){
 const row=reviewMap.get(ref);assert.ok(row);
 assert.equal(row.group,g.id);
 const owner=g.originalOwnerRefs.find(o=>o.owner==="LTF_PIUS_X_CATECHISM_INDEX"&&o.ref===ref);
 assert.equal(owner.status,"FULL_DIGITAL_BILINGUAL_QA_READ_NOT_PRINT_OR_COPYRIGHT_CLEARED");
 assert.equal(owner.precision,row.precision);
}
assert.equal(reviewMap.get("PX1912-Q355").italianNumberIssue!==null,true);
assert.equal(reviewMap.get("PX1912-Q359").precision,"PASTORAL_METHOD_ONLY");
assert.equal(reviewMap.get("PX1912-Q363").precision,"CONTRAST_ONLY");
const editions=await read("data/learn/magisterium-denzinger-edition-bibliography.v1.json");
assert.equal(editions.schema,"AO_MAGISTERIUM_DENZINGER_EDITION_BIBLIOGRAPHY_V1");
assert.equal(editions.editions.length,8);
assert.equal(editions.metrics.printedEntryNumbersChecked,0);
assert.equal(editions.metrics.approvedCrosswalks,0);
for(const edition of editions.editions){
 assert.ok(edition.url.startsWith("https://"));
 assert.equal(edition.editionEntryConcordanceChecked,false);
 assert.equal(edition.rightsCleared,false);
}


const italianPius=await read("data/learn/ltfaith-pius-x-it-witness-index.v1.json");
const frenchPius=await read("data/learn/ltfaith-pius-x-1913-french-print-page-evidence.v1.json");
const frenchPages=await read("data/learn/ltfaith-pius-x-fr-1913-scan-page-candidates.v1.json");
const italianOriginal=await read("data/learn/ltfaith-pius-x-italian-1912-original-print-acquisition.v1.json");
assert.equal(italianPius.questionCount,433);
assert.equal(frenchPages.questionCount,433);
assert.equal(frenchPius.verifiedPageSamples.length,70);
assert.equal(italianOriginal.original1912PrintEditionLocatedAndVerified,false);
assert.equal(b7qa.metrics.originalFrench1913QAPageImageVerified,5);
assert.equal(b7qa.metrics.originalFrench1913PageCandidatesOnly,23);
assert.equal(b7qa.metrics.pinnedItalianDigitalQALocations,28);
assert.equal(b7qa.metrics.originalItalian1912PrintPhotosVerified,0);
const italianByQ=new Map(italianPius.entries.map(x=>[x.q,x]));
const frenchPhotoByQ=new Map(frenchPius.verifiedPageSamples.map(x=>[x.question,x]));
const frenchCandidatesByQ=new Map(frenchPages.entries.map(x=>[x.q,x]));
for(const q of b7qa.records){
 const it=italianByQ.get(q.questionNumber);
 const fr=frenchPhotoByQ.get(q.questionNumber);
 const candidate=frenchCandidatesByQ.get(q.questionNumber);
 assert.ok(it&&candidate,"Missing existing Pius source owner record for "+q.questionId);
 assert.equal(q.originalItalianSourceOwner.canonicalIndex,"data/learn/ltfaith-pius-x-it-witness-index.v1.json");
 assert.equal(q.originalItalianSourceOwner.sourceFileUrl,it.italianSourceFileUrl);
 assert.equal(q.originalItalianSourceOwner.numberMatchedPinnedEnglish,true);
 assert.equal(q.printFrench1913.sourcePdf,frenchPius.pdfUrl);
 assert.equal(q.printFrench1913.pdfPageOneIndexed,fr?fr.pdfPageOneIndexed:candidate.pdfPageOneIndexedCandidates[0]);
 assert.equal(q.printFrench1913.status,fr?
  "FULL_QA_VISUALLY_PAGE_CONFIRMED_IN_1913_FRENCH_PRINT":
  "OCR_NUMBER_HEADING_PAGE_CANDIDATE_ONLY_NOT_PAGE_PHOTOGRAPHICALLY_COLLATED");
 assert.equal(q.printFrench1913.original1912ItalianPrintClaim,false);
 assert.equal(q.printOriginalCollated,false);
 assert.equal(q.publiclyUsable,false);
}
assert.equal(editions.metrics.bibliographicEditions,8);
assert.equal(editions.metrics.scannedHistoricalLatinVolumesLocated,1);
assert.equal(editions.metrics.editionVerifiedConcordances,0);
const year1900=editions.editions.find(x=>x.id==="DZ_1900_LATIN_PRINT");
assert.ok(year1900&&year1900.printedVolumeDigitized);
assert.equal(year1900.editionEntryConcordanceChecked,false);
assert.equal(bridges.b8CharacterSermonSourceGate.verifiedSermonPassagesInThisBranch,0);
assert.equal(bridges.b8CharacterSermonSourceGate.approvedFirstPersonChanoineResponses,0);
assert.equal(bridges.b8CatechismPrintReview.frenchPrintVerifiedQAsInBridge,5);
assert.equal(bridges.b8CatechismPrintReview.original1912ItalianFacsimileVerifiedQAs,0);


const legacy1911=await read("data/learn/magisterium-denzinger-1911-ocr-entry-review.v1.json");
assert.equal(legacy1911.schema,"AO_MAGISTERIUM_1911_DENZINGER_OCR_ENTRY_LEADS_V1");
assert.equal(legacy1911.metrics.named1911OcrMatches,13);
assert.equal(legacy1911.metrics.photographicPrintPageNumberCertifications,0);
assert.equal(legacy1911.metrics.DSDHModernEditionCertifications,0);
assert.equal(legacy1911.metrics.readyForPublicUse,0);
assert.equal(legacy1911.records.length,13);
const legIds=new Set(),legNums=new Set();
for(const r of legacy1911.records){
 assert.ok(!legIds.has(r.passageId));legIds.add(r.passageId);
 assert.ok(!legNums.has(r.legacyDzNumber));legNums.add(r.legacyDzNumber);
 assert.equal(idMap.get(r.passageId)?.crosswalkCandidate?.oldNumber,r.legacyDzNumber);
 assert.equal(r.editionId,"DZ11_BANNWART_1911");
 assert.match(r.sourceOcrUrl,/^https:\/\/archive.org\/stream\/enchiridionsymbo00denz\//);
 assert.equal(r.legacyEntryNumberAndTopicObservedInOCR,true);
 assert.equal(r.printedPageImageExamined,false);
 assert.equal(r.facsimileNumberCertified,false);
 assert.equal(r.modernDSDHNumberCertified,false);
 assert.equal(r.publicationApproved,false);
}
assert.equal(editions.metrics.namedEditionLegacyNumberOcrLeads,13);
assert.ok(editions.editions.some(e=>e.id==="DZ11_BANNWART_1911"));
assert.equal(editions.metrics.printedEntryNumbersChecked,0);
assert.equal(passages.editionVerifiedCrosswalks,0);
const homilyLeads=await read("data/learn/magisterium-chanoine-external-sermon-leads.v1.json");
assert.equal(homilyLeads.schema,"AO_MAGISTERIUM_CHANOINE_EXTERNAL_SERMON_LEADS_V1");
assert.equal(homilyLeads.metrics.externalAttributedSermonPagesReviewed,6);
assert.equal(homilyLeads.metrics.provisionalMagisteriumPassageRelations,12);
assert.equal(homilyLeads.metrics.certifiedHomilyBankIds,0);
assert.equal(homilyLeads.metrics.approvedCharacterDialogues,0);
assert.equal(homilyLeads.metrics.publishedLinks,0);
assert.equal(homilyLeads.policy.noQuotedSermonTextStored,true);
const sermonUrls=new Set();
for(const s of homilyLeads.records){
 assert.ok(s.sourceUrl.startsWith("https://laportelatine.org/"));
 assert.ok(!sermonUrls.has(s.sourceUrl));sermonUrls.add(s.sourceUrl);
 assert.equal(s.originalHomilyBankCanonicalId,null);
 assert.equal(s.sourceTextCopied,false);
 assert.equal(s.approvedFirstPersonSpeech,false);
 assert.equal(s.sourceRightsClearance,"NOT_CLEARED");
 assert.ok(s.provisionalMatches.length>0);
 for(const link of s.provisionalMatches){
  assert.ok(idMap.has(link.passageId),link.passageId);
  assert.equal(link.published,false);
 }
}
assert.equal(bridges.b9ChanoinePrimaryWebWitnesses.externallyDatedSeromsWithTranscripts,6);
assert.equal(bridges.b9ChanoinePrimaryWebWitnesses.canonicalHomilyRegistryIdsVerified,0);
assert.equal(bridges.b9ChanoinePrimaryWebWitnesses.approvedFirstPersonDialogue,0);

console.log("PASS Magisterium P0/P1: 83 distinct documents; 51 canonical doctrine subjects; 106 provisional links; 61 nonpublished source locators; no fabricated Denzinger crosswalks or new answers");
