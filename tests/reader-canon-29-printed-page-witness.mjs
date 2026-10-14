import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const evidence=read("../data/research/mass-canon-29-printed-page-witness-crosswalk-20261014.json");
const issues=read("../data/research/mass-canon-29-flagged-bilingual-adjudication-20261014.json");
const latin=read("../data/research/mass-canon-29-external-ritus-witness-20261014.json");
const french=read("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json");
const bilingual=read("../data/research/mass-canon-62-bilingual-two-layer-review-20261014.json");
const promotion=read("../data/research/mass-canon-42-rubric-promotion-review-20261013.json");
assert.equal(evidence.schema,"ao-canon-29-printed-page-witness-crosswalk-v1");
assert.equal(evidence.status,"ALL_29_SOURCE_CASES_PAGE_LOCATED_NO_INDEPENDENT_SIGNOFF");
assert.deepEqual(evidence.counts,{cases:29,englishEvidenceNotes:29,
 frenchEvidenceNotes:29,printedPageLocations:29,
 independent1962FacsimileApproved:0,bilingualCopyApproved:0,
 actionClockApproved:0,livePublished:0});
assert.equal(issues.rows.length,29);
assert.equal(latin.rows.length,29);
assert.equal(french.rows.length,62);
assert.equal(bilingual.rows.length,62);
assert.equal(evidence.records.length,29);
const originalFrench=new Map(french.rows.map(x=>[x.id,x]));
const bilingualOwner=new Map(bilingual.rows.map(x=>[x.actionId,x]));
const sourceById=new Map(latin.rows.map(x=>[x.actionId,x]));
const byId=new Map();const PAGE_URL=
 "https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
for(let i=0;i<29;i++){
 const x=evidence.records[i],q=issues.rows[i],l=sourceById.get(x.actionId),
  fr=originalFrench.get(x.actionId),en=bilingualOwner.get(x.actionId);
 assert.equal(x.actionId,q.actionId,"Evidence ID must retain 29 canonical risk order");
 assert.equal(x.cueId,q.cueId);
 assert.equal(x.actor,q.actor);
 assert.equal(x.reviewCode,q.reviewCode);
 assert.equal(x.sourceRitus,q.ritusLocator);
 assert.equal(x.latinLocator,l.shortLatinLocator);
 assert.equal(x.originalFrenchShortOwner,fr.id);
 assert.equal(x.originalEnglishShortOwner,en.actionId);
 assert.equal(en.shortDraft.frCanonicalActionId,fr.id);
 assert.ok(!Object.hasOwn(en.shortDraft,"fr"));
 assert.equal(x.witness.documentUrl,PAGE_URL);
 assert.ok(x.englishFinding.length>45&&x.frenchFinding.length>45);
 assert.ok(x.witness.pdfPageNumbers.length>=1&&x.witness.pdfPageNumbers.length<=2);
 assert.deepEqual(x.witness.zeroBasedPageIndexes,
  x.witness.pdfPageNumbers.map(p=>p-1));
 assert.deepEqual(x.witness.exactPageLinks,
  x.witness.pdfPageNumbers.map(p=>PAGE_URL+"#page="+p));
 assert.ok(x.witness.pdfPageNumbers.every(p=>p>=13&&p<=17));
 assert.equal(x.witness.primary1962PrintedFacsimileVerified,false);
 assert.equal(x.witness.separateLatinTranscriptionUrl,l.externalLatinWitnessUrl);
 assert.equal(x.independentCopySignoff,"NOT_GRANTED");
 assert.equal(x.independentCeremonialSignoff,"NOT_GRANTED");
 assert.equal(x.exactLiveClockObserved,false);
 assert.equal(x.canPublish,false);
 assert.equal(fr.shortRubricReviewState,"ORIGINAL_FRENCH_SHORT_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.equal(en.copyApproval,"NOT_APPROVED");
 assert.ok(!byId.has(x.actionId),"No duplicated rubric research record");
 byId.set(x.actionId,x);
}
assert.equal(byId.size,29);
function get(n){const x=byId.get("AO.CANON.R62."+n);assert.ok(x,n);return x;}
assert.deepEqual(get("001").witness.pdfPageNumbers,[13]);
assert.equal(get("001").claimClass,"SEQUENCE_EYES_THEN_JOINED_HANDS");
assert.deepEqual(get("017").witness.pdfPageNumbers,[14,15]);
assert.equal(get("017").claimClass,"RETROSPECTIVE_SOURCE_ORDER");
assert.match(originalFrench.get("AO.CANON.R62.017").revisedFrenchRubric,/découvre d’abord ce récipient de la main droite\. À « accépit panem »/);
assert.match(bilingualOwner.get("AO.CANON.R62.017").guideDraft.en,/first uncovers it with his right hand\. At accepit panem/);
assert.match(get("017").englishFinding,/before taking the principal Host/);
assert.match(get("017").frenchFinding,/avant la prise de l'Hostie principale/);
assert.match(get("017").latinLocator,/antequam accipiat hostiam/i);
assert.match(originalFrench.get("AO.CANON.R62.017").shortFrenchRubricDraft,
 /découvre d’abord leur vase ; puis, à « accépit panem »/);
assert.match(bilingualOwner.get("AO.CANON.R62.017").shortDraft.en,
 /first uncovers their vessel; then, at accepit panem/);
assert.equal(get("044").claimClass,"UNVERIFIED_DONOR_CROSS_OFFSET");
assert.deepEqual(get("044").witness.pdfPageNumbers,[16]);
assert.match(get("044").englishFinding,/after omni benedictione and before caelesti/);
assert.equal(bilingualOwner.get("AO.CANON.R62.044").reviewSurface,"GUIDE_ONLY");
const held=promotion.decisions.find(x=>x.candidateActionId==="AO.CANON.R62.044");
assert.equal(held.placement,"GUIDE_ONLY_PENDING_CROSS_SIGN_OFFSET");
assert.equal(held.reviewGate,"SECOND_PASS_REQUIRED_BEFORE_EDITORIAL_SIGNOFF");
assert.equal(get("062").claimClass,"ANTICIPATORY_SERVER_EVENT");
assert.equal(get("062").actor,"SERVER");
assert.match(get("062").englishFinding,/not precisely when Hanc igitur/);
assert.equal(get("061").claimClass,"FORM_DEPENDENT_RESPONDENT");
assert.deepEqual(get("061").witness.pdfPageNumbers,[17]);
for(const n of ["023","024","025","027","028","033","034","035","055","058","059","062"])
 assert.equal(get(n).exactLiveClockObserved,false);

const secondary=evidence.records.filter(x=>Object.hasOwn(x,"supplementalAuthority"));
assert.deepEqual(secondary.map(x=>x.actionId),[
 "AO.CANON.R62.008","AO.CANON.R62.017","AO.CANON.R62.061",
],"Do not silently promote or duplicate other review cases");
const proper=get("008").supplementalAuthority;
assert.equal(proper.ruleOrigin,"RUBRICAE_GENERALES_MISSALIS_ROMANI_1962_501");
assert.match(proper.latinLocator,/Communicantes, Hanc igitur et Qui pridie/);
assert.ok(proper.documentUrl.startsWith("https://"));
assert.deepEqual(proper.formsWithProperSelection,[
 "COMMUNICANTES","HANC_IGITUR","QUI_PRIDIE",
]);
assert.deepEqual(proper.octaveRule.octaves,["NATIVITY","EASTER","PENTECOST"]);
assert.deepEqual(proper.octaveRule.forms,["COMMUNICANTES","HANC_IGITUR"],
 "Do not generalize the octave carryover to Qui pridie");
assert.equal(proper.octaveRule.appliesWhenCelebratedMassIsNotOfOctave,true);
assert.equal(proper.octaveRule.mayHaveDistinctProperPreface,true);
assert.equal(proper.fixedOrdinaryTextAlwaysValid,false);
assert.equal(proper.automaticSelectionCertified,false);
assert.equal(proper.readerPublicationAuthorized,false);
assert.equal(get("008").sourceRitus,"VIII.4",
 "Keep primary canonical rubric owner distinct from proper selection authority");
const hosts=get("017").supplementalAuthority;
assert.equal(get("017").sourceRitus,hosts.cueSourceRitus);
assert.equal(hosts.cueSourceRitus,"VIII.4");
assert.equal(hosts.conditionalInstructionRitus,"VIII.5");
assert.match(hosts.exactLatinCondition,/antequam accipiat Hostiam/);
assert.equal(hosts.condition,"ADDITIONAL_HOSTS_FOR_CONSECRATION_IN_A_COVERED_VESSEL");
assert.deepEqual(hosts.orderedEvents,[
 "UNCOVER_ADDITIONAL_HOSTS_VESSEL_WITH_RIGHT_HAND",
 "TAKE_PRINCIPAL_HOST_AT_ACCEPIT_PANEM",
],"The vessel must be uncovered BEFORE taking the principal Host");
assert.equal(hosts.printOrderDeterminesActionOrder,false);
assert.equal(hosts.postAccepitUncoveringAuthorized,false);
assert.equal(hosts.newExactClockAuthorized,false);
assert.equal(hosts.readerPublicationAuthorized,false);
const amen=get("061").supplementalAuthority;
assert.equal(amen.inheritedLedgerActor,get("061").actor);
assert.equal(amen.inheritedLedgerActor,"SERVER");
assert.equal(amen.inheritedActorIsUniversalSpeaker,false);
assert.equal(amen.sourceDocuments.length,3);
assert.deepEqual(amen.sourceDocuments.map(x=>x.locator),[
 "Ritus servandus X.1",
 "De musica sacra et sacra liturgia (1958), nn. 25-26",
 "De musica sacra et sacra liturgia (1958), n. 31",
]);
assert.ok(amen.sourceDocuments.every(x=>x.url.startsWith("https://")));
assert.deepEqual(amen.formRules.map(x=>x.form),["LOW","MISSA_CANTATA","SOLEMN"]);
assert.equal(amen.formRules[0].respondentClass,"MINISTER_BY_DEFAULT");
assert.equal(amen.formRules[0].congregationalParticipation,"POSSIBLE_IF_DIALOGUE_MASS");
assert.ok(amen.formRules.slice(1).every(x=>x.congregationalParticipation==="PERMITTED_NOT_IMPLIED"));
assert.equal(amen.actualRespondentObserved,false);
assert.equal(amen.newSpeakerClockAuthorized,false);
assert.equal(amen.readerPublicationAuthorized,false);
for(const x of secondary){
 assert.equal(x.canPublish,false);
 assert.equal(x.independentCopySignoff,"NOT_GRANTED");
 assert.equal(x.independentCeremonialSignoff,"NOT_GRANTED");
 assert.equal(x.exactLiveClockObserved,false);
 assert.equal(x.witness.primary1962PrintedFacsimileVerified,false);
}


const originalEditionProvenanceFiles=[
 "../data/research/mass-canon-14-ritus1962-french-microactions-20261013.json",
 "../data/research/mass-canon-42-detailed-rubric-editorial-backfill-20261013.json",
 "../data/research/mass-canon-flagged-french-copy-triage-20261013.json",
 "../data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json",
 "../data/research/mass-canon-complex-23-ritus-source-review-20261013.json",
 "../data/research/mass-canon-62-source-trigger-audit-20261013.json",
 "../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json",
 "../data/research/mass-canon-62-bilingual-two-layer-review-20261014.json",
 "../data/research/mass-canon-29-flagged-bilingual-adjudication-20261014.json",
 "../data/research/mass-canon-20-minister-stage-acceptance-20261014.json",
];
const latin1962="https://summorum-pontificum.de/z_archive/vorort/ritus_servandus_62.html";
const parallelLatinFrench1962="https://fr.scribd.com/document/542057936/Ritus-Servandus-1962";
for(const path of originalEditionProvenanceFiles){
 const raw=readFileSync(new URL(path,import.meta.url),"utf8");
 const obj=JSON.parse(raw);
 assert.ok(!raw.includes("https://www.intratext.com/IXT/LAT0820/"),
  path+": pre-1962 rubrical witness cannot be cited as 1962 typical edition");
 assert.ok(raw.includes(latin1962)||raw.includes(parallelLatinFrench1962),
  path+": must link a separately labeled 1962 Latin witness");
 assert.ok(obj.status&&obj.schema,path+": research document identity must survive");
}
const firstOwner=read("../data/research/mass-canon-14-ritus1962-french-microactions-20261013.json");
assert.equal(firstOwner.microActions.length,62);
assert.equal(firstOwner.sourceWitnesses.englishTranslationNotOriginalEdition,
 "https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/");
assert.equal(firstOwner.sourceWitnesses.original1962TypicalEditionFacsimileVerified,false);
assert.equal(firstOwner.sourceWitnesses.anachronisticIntraTextReferenceExcluded,true);
assert.ok(!Object.hasOwn(firstOwner.sourceWitnesses,"officialPrimary"),
 "English translated witness cannot be misdescribed as original official edition");
assert.equal(french.rows.length,62);
assert.equal(bilingual.rows.length,62);
assert.equal(issues.rows.length,29);
assert.equal(evidence.records.length,29);
assert.ok(evidence.records.every(x=>x.canPublish===false));

console.log("PASS: 29 original 1962 Ritus review cases independently page-located in English witness, 17 conditional/sequence checks, 0 facsimile/linguistic/source-clock approvals, 0 publication.");
