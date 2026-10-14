// Phase 3 release-blocked editorial evidence checks for Mystery of the Mass.
// node tests/mystery-mass-phase3-editorial-evidence.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=read("data/learn/research/mystery-mass-phase3-48-unit-editorial-certification-ledger-20261014.v1.json");
const extras=read("data/learn/research/mystery-mass-four-additional-subtopic-drafts-20261014.v1.json");
const select=read("data/learn/research/mystery-mass-selected20-bilingual-mystagogy-20261014.v1.json");
const gaps=read("data/learn/research/mystery-mass-24-bilingual-gap-manuscript-20261014.v1.json");
const lessons=read("data/learn/research/mystery-mass-eight-lesson-bilingual-synthesis-20261014.v1.json");
const original=read("data/learn/research/mystery-mass-canonical-39-owner-inventory-20261014.v1.json");
const validOwners=new Set(original.sections.map(x=>x.sectionId));
const keys=new Map();
for(const item of [...select.records,...gaps.records,...extras.records]){
 assert(!keys.has(item.id),"draft unit duplicated");
 keys.set(item.id,item);
}
assert.equal(keys.size,48);
assert.equal(select.records.length,20);
assert.equal(gaps.records.length,24);
assert.equal(extras.records.length,4);
assert.equal(extras.counts.distinctExistingOwners,4);
assert.deepEqual(extras.records.map(x=>x.sourceManuscriptId),["MB03","MB12","N02","MB20"]);
const expectedExtra=new Map([["MB03","AO.CARD.001"],["MB12","AO.CARD.013"],["N02","AO.CARD.010"],["MB20","AO.CANON.09"]]);
for(const extra of extras.records){
 assert.equal(extra.sourceFirstOwner,expectedExtra.get(extra.sourceManuscriptId));
 assert.equal(extra.ownership,"SUBTOPIC_UNDER_EXISTING_SECTION_NO_SECOND_CANONICAL_EXPLANATION");
 assert(extra.short.en.includes("https://")&&extra.short.fr.includes("https://"));
 assert(extra.deep.en.includes("https://")&&extra.deep.fr.includes("https://"));
 assert.equal(extra.sourceApproval.publish,false);
 assert.equal(extra.sourceApproval.exact1962PageCollation,false);
 assert.equal(extra.sourceApproval.independentFrenchTheologicalApproval,false);
}
assert.equal(audit.units.length,48);
assert.equal(audit.census.explanatoryUnits,48);
assert.equal(audit.census.canonicalSections,39);
assert.equal(audit.census.bilingualComplete,48);
assert.equal(audit.census.deepCopyBothLanguagesLinked,48);
assert.equal(audit.census.lessonStages,8);
assert.equal(audit.census.lessonParagraphs,16);
assert.deepEqual(audit.census.sourceClasses,{POLISHED_BIBLE_SUBTOPIC:20,ADDITIONAL_SECTION:24,SUPPLEMENTAL_BIBLE_SUBTOPIC:4});
assert.equal(audit.census.onlyTranslatedRitusWitness,4);
assert.deepEqual(audit.census.prioritized,{P1_PROPER_SCRIPTURE_OR_DUAL_MODE:12,P2_SUBSTANTIVE_SOURCE_EDITION:16,P0_LITURGICAL_FORM_OR_DOCTRINE:20});
assert.equal(audit.census.externallySourceCertifiedAllClaims,0);
assert.equal(audit.census.independentlyNativeFrenchApproved,0);
assert.equal(audit.census.publicationApproved,0);
const pattern=/\]\(https:\/\//;
const ids=new Set(),owners=new Set();
for(const unit of audit.units){
 assert(!ids.has(unit.itemId),"same approved unit twice");
 ids.add(unit.itemId);
 const original=keys.get(unit.itemId);
 assert(original,"unit in certification ledger missing original draft: "+unit.itemId);
 assert.equal(unit.owner,original.sourceFirstOwner);
 assert(validOwners.has(unit.owner));
 owners.add(unit.owner);
 assert.equal(unit.enDraftPresent,true);
 assert.equal(unit.frDraftPresent,true);
 assert(unit.enParagraphLinks>0&&unit.frParagraphLinks>0);
 assert(pattern.test(original.deep.en));
 assert(pattern.test(original.deep.fr));
 assert(unit.conditionalFlags.length>=1,"untracked rite risk: "+unit.itemId);
 assert.equal(unit.claimSpecificSourceReview,"REQUIRED_NOT_CONDUCTED_FOR_ALL_ASSERTIONS");
 assert.equal(unit.frenchDoctrinalNativeReview,"REQUIRED");
 assert.equal(unit.published,false);
 assert(unit.sourceWitnessUrls.every(x=>x.startsWith("https://")));
 assert(unit.editionAndPsalterNormalization);
}
assert.equal(ids.size,48);
assert.equal(owners.size,39);
const byDraft=name=>select.records.find(x=>x.sourceManuscriptId===name);
const byGap=owner=>gaps.records.find(x=>x.sourceFirstOwner===owner);
assert(byDraft("MB02").conditionalDisplay.includes("JUDICA_ME_PS42_OMITTED_WHERE_1962_RUBRICS_REQUIRE"));
assert(byDraft("MB23").conditionalDisplay.includes("REQUIEM_AGNUS_DEI_DONA_EIS_REQUIEM_NO_BREAST_STRIKE"));
assert(byDraft("MB23").deep.fr.includes("frappements de poitrine"));
assert(byDraft("N05").conditionalDisplay.includes("REQUIEM_OMITS_FIRST_PRECOMMUNION_PRAYER_AND_KISS_OF_PEACE"));
assert(byDraft("N05").deep.en.includes("kiss of peace"));
assert(byDraft("N04").deep.en.includes("ordinary Low Mass"));
assert(byDraft("MB24").conditionalDisplay.includes("PRIEST_DOMINE_NON_SUM_DIGNUS_NOT_FAITHFUL_RESPONSE"));
assert(byGap("AO.CARD.024").conditionalityFlags.includes("SECOND_CONFITEOR_NOT_PRESCRIBED_IN_1962"));
assert(byGap("AO.CARD.024").deep.en.includes("not prescribed"));
assert(byGap("AO.CARD.020").conditionalityFlags.includes("REQUIEM_PAX_EXCEPTIONS_APPLY"));
assert(byGap("AO.CARD.028").conditionalityFlags.includes("REQUIEM_REQUIESCANT_IN_PACE"));
assert(byGap("AO.CARD.029").conditionalityFlags.includes("BLESSING_OMITTED_AT_REQUIEM"));
const joseph=byGap("AO.CANON.03");
assert(joseph.conditionalityFlags.includes("SPECIAL_COMMUNICANTES_ALSO_INCLUDES_JOSEPH"));
assert(joseph.deep.en.includes("special Communicantes"));
assert(joseph.deep.fr.includes("formule propre du Communicantes"));
assert(joseph.primarySourceHierarchy.some(x=>x.kind==="1962_SACRED_CONGREGATION_OF_RITES_NOVIS_HISCE_TEMPORIBUS_FRENCH_TRANSLATION"&&x.verifiedEffectiveDate==="1962-12-08"));
assert(audit.firstPassExternalCorroboration.length>=2);
assert(audit.firstPassExternalCorroboration.every(x=>x.primaryPrintedOriginalReviewed===false));
assert.equal(audit.blockingEditorialIssues.length,7);
assert(audit.blockingEditorialIssues.every(x=>x.blocking===true));
assert.equal(audit.publication.canPublish,false);
assert.equal(audit.publication.canMergeToMainAsProductContent,false);
assert.equal(audit.publication.liveReaderChanged,false);
assert.equal(lessons.records.length,8);
let paragraphs=0;
for(const lesson of lessons.records){
 for(const x of lesson.paragraphs){
 assert(pattern.test(x.en)&&pattern.test(x.fr));
 paragraphs++;
 }
}
assert.equal(paragraphs,16);
console.log("PASS Mystery of Mass Phase 3: 48/48 bilingual units under 39/39 owners, 16 course paragraphs, 7 publication blockers; Requiem/Joseph/Confiteor conditionality and no-publication safeguards.");
