import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const registry=JSON.parse(await readFile(new URL("../data/learn/pius-x-documentary-voice-style.v1.json",import.meta.url),"utf8"));
assert.equal(registry.schema,"AO_PIUS_X_DOCUMENTARY_VOICE_STYLE_V1");
const prepapal=JSON.parse(await readFile(new URL("../data/learn/pius-x-prepapal-conversational-evidence.v1.json",import.meta.url),"utf8"));
assert.equal(prepapal.schema,"AO_PIUS_X_PREPAPAL_CONVERSATIONAL_STYLE_V1");
assert.equal(prepapal.sourceOwner,"STYLE_ONLY");
assert.equal(prepapal.evidence.length,6);
assert.equal(prepapal.release.newDoctrinalStatementsApproved,false);
assert.equal(prepapal.release.historicalSpeechReenactmentApproved,false);
assert.equal(prepapal.conclusions.humour,"EVIDENCED_IN_INFORMAL_DOCUMENTS_OCCASIONAL_NOT_AUTO_INSERTED");
assert.ok(prepapal.evidence.some(x=>x.trait==="SELF_DEPRECATING_HUMOUR"));
assert.ok(prepapal.evidence.some(x=>x.trait==="QUESTION_AND_OBJECTION_PEDAGOGY"));
assert.ok(prepapal.evidence.some(x=>x.trait==="ENERGETIC_BUT_SELF_CORRECTING"));
for(const item of prepapal.evidence){
 assert.ok(item.primaryEditionPages||item.discussionPages);
 assert.ok(item.limits.length>=25);
 assert.ok(item.styleRule.length>50);
 assert.ok(item.briefOriginal===null||item.briefOriginal.split(/\\s+/).length<=12);
}

assert.equal(registry.scope,"STYLE_AND_RHETORICAL_EVIDENCE_ONLY");
const controls=JSON.parse(await readFile(new URL("../data/learn/pius-x-period-catholic-prose-controls.v1.json",import.meta.url),"utf8"));
assert.equal(controls.schema,"AO_PIUS_X_PERIOD_CATHOLIC_PROSE_COMPARATORS_V1");
assert.equal(controls.scope,"RHETORICAL_CONTROL_NOT_DOCTRINE_OR_VOICE_OF_PIUS_X");
assert.equal(controls.appliedToAvatar,false);
assert.equal(controls.approval,false);
assert.equal(controls.theologicalAnswersCopied,0);
assert.equal(controls.comparisonDocs.length,2);
const controlAuthors=new Set(controls.comparisonDocs.map(x=>x.author));
assert.deepEqual([...controlAuthors].sort(),["Benedict XV","Leo XIII"]);
assert.ok(controls.comparisonDocs.every(x=>x.url.startsWith("https://www.vatican.va/")));
assert.ok(controls.periodConventionsNotEvidenceOfDistinctivePiusVoice.some(x=>x.includes("first-person plural")));
assert.ok(controls.periodConventionsNotEvidenceOfDistinctivePiusVoice.some(x=>x.includes("Scripture")));
assert.equal(controls.candidateSartoSignalsNeedingRepeatedInternalWitnesses.length,3);
for(const candidate of controls.candidateSartoSignalsNeedingRepeatedInternalWitnesses){
 assert.equal(candidate.uniqueToPius,false,"two control authors do not prove uniqueness");
 assert.ok(candidate.piusDocuments.length>=2);
 assert.ok(candidate.distinction.length>=50);
}

assert.equal(registry.publication,"DRAFT_NOT_RUNTIME");
assert.equal(registry.acceptance.publicationAllowed,false);
assert.equal(registry.acceptance.doctrinalClaimsCopied,0);
assert.equal(registry.sourceDocuments.length,8);
assert.equal(registry.blindTestPrompts.length,10);
assert.equal(registry.sourceDocuments.some(d=>d.genre==="FORMAL_PERSONAL_LETTER"),true);
assert.equal(registry.sourceDocuments.some(d=>d.genre==="FORMAL_LATIN_LETTER"),true);
assert.equal(registry.sourceDocuments.some(d=>d.genre==="PAPAL_ENCYCLICAL_TRANSLATION"),true);
assert.equal(registry.sourceDocuments.some(d=>d.genre==="APOSTOLIC_EXHORTATION"),true);
const seen=new Set();
for(const d of registry.sourceDocuments){
 assert.ok(!seen.has(d.id),d.id+" duplicated");seen.add(d.id);
 assert.match(d.url,/^https:\/\/www\.vatican\.va\/content\/pius-x\//);
 assert.match(d.date,/^19(0[3-9]|1[0-4])-\d\d-\d\d$/);
 assert.ok(["it","fr","la","en"].includes(d.language));
 assert.ok(d.audience.length>15&&d.location.length>10&&d.caveat.length>30);
 assert.ok(d.snippets.length>=1);
 const words=d.snippets.join(" ").split(/\s+/).filter(Boolean);
 assert.ok(words.length<=25,"copyright quotation budget must not be exceeded for "+d.id);
 assert.ok(d.signals.length>=2);
 assert.ok(d.claim.length>25);
 if(d.language==="en")assert.equal(d.originalLanguageUnconfirmed,true,
    "Published English papal translations are not automatic personal English witnesses");
}
const ids=new Set(registry.sourceDocuments.map(d=>d.id));
for(const c of controls.candidateSartoSignalsNeedingRepeatedInternalWitnesses){
 for(const id of c.piusDocuments)assert.ok(ids.has(id),"Comparative styles must use the same genuine Pius documents");
 assert.ok(registry.styleFeatures.some(f=>f.id===c.featureId));
}
for(const feature of registry.styleFeatures){
 assert.ok(feature.docIds.length>=2,"inferences need more than one distinct documentary witness");
 for(const id of feature.docIds)assert.ok(ids.has(id),feature.id+" referenced missing "+id);
 assert.ok(feature.rule.length>=55&&feature.doNot.length>=35);
 assert.match(feature.evidence,/^(DIRECTLY_SUPPORTED_|SUPPORTED_|DOCUMENTED_)/);
}
assert.ok(registry.baselinePeriod.includes("twentieth-century"));
assert.equal(registry.registers.CATECHETICAL.periodIntensity,"MODERATE");
assert.equal(registry.registers.SOLEMN.periodIntensity,"HIGH_ONLY_WHEN_WARRANTED");
assert.equal(registry.registers.HISTORICAL_LIMIT.periodIntensity,"NONE_FOR_INVENTED_PERSONAL_OPINION");
assert.ok(registry.mustNot.some(x=>x.includes("accent")));
assert.ok(registry.notOwned.some(x=>x.includes("433 canonical Catechism answers")));
for(const p of registry.blindTestPrompts){
 assert.ok(ids.has(p.styleSourceId));
 assert.equal(p.substanceOwner,"EXISTING_CATECHISM_OR_CONTENT_PIPELINE");
 assert.equal(p.generatedAnswerApproved,false);
 assert.ok(registry.registers[p.register]);
 assert.ok(p.prompt.length>=15);
}
const raw=JSON.stringify(registry);
assert.equal(raw.includes("answerText"),false,"no competing Catechism/answer corpus");
assert.equal(raw.includes("voiceAudio"),false,"not an audio reconstruction");

const calibr=registry.userCalibration20261019;
assert.equal(calibr.mean,17/6);
assert.equal(calibr.scores.length,6);
assert.deepEqual(calibr.scores.map(x=>x.rating),[3,3,2,3,3,3]);
assert.equal(calibr.replacementRule,"SOURCE_LOCKED_SUBSTANCE_WITH_DOCUMENTED_CONVERSATIONAL_VOICE");
assert.equal(calibr.contentInferenceAllowed,false);
assert.equal(calibr.stylisticConnectivesAllowed,true);
assert.equal(calibr.stylisticConnectivesRequireSemanticNeutrality,true);
assert.equal(calibr.unattributedNewPastoralAdviceAllowed,false);
assert.equal(calibr.originalPastoralTextAllowed,true);
assert.equal(calibr.notPrescribingTelegraphicStyle,true);
assert.equal(calibr.additionsMustShowSource,true);
assert.equal(calibr.published,false);
assert.equal(calibr.historicalSpeechVerified,false);
assert.equal(calibr.canonicalContentModified,false);
assert.equal(calibr.beforeAfterRegisterRewrite,true);
assert.equal(calibr.modifiedRegisters.length,4);
assert.match(registry.registers.CATECHETICAL.use,/Light conversational links are permitted/);
assert.match(registry.registers.PASTORAL.use,/does NOT authorize editorial pastoral advice/);
for(const f of registry.styleFeatures.filter(x=>["EFFICIENT_CATECHESIS","CHRISTIAN_ENCOURAGEMENT","SOBRIETY_AND_PRECISION"].includes(x.id))){
 assert.match(f.rule,/source|Source|SOURCE|cited/,f.id+" must gate editorial expansions");
}
const humanCalibr=JSON.parse(await readFile(new URL("../data/learn/pius-x-unified-documentary-voice-review.v1.json",import.meta.url),"utf8")).userRatedMinimalVoiceCalibration;
assert.equal(humanCalibr.status,"SOURCE_LOCKED_REVISED_5_SOURCE_SUPPORTED_1_HELD_FOR_ADDITIONAL_SOURCE");
assert.equal(humanCalibr.contentInferenceAllowed,false);
assert.equal(humanCalibr.stylisticConnectivesAllowed,true);
assert.deepEqual(humanCalibr.calibrationStatus,{reviewed:6,sourceLocked:5,heldForSource:1,previousScoresPreserved:true,published:0});
assert.equal(humanCalibr.baselineMean,17/6);
assert.equal(humanCalibr.testCorpus.length,6);
assert.deepEqual(humanCalibr.testCorpus.map(x=>x.qid),["PX1912-Q433","PX1912-Q325","PX1912-Q363","PX1912-Q116","PX1912-Q206","PX1912-Q85"]);
for(const c of humanCalibr.testCorpus){
 assert.ok(c.visitor&&c.revised&&c.evidence&&c.addition&&c.removedPadding);
 assert.ok(c.revised.length>50);
 assert.ok(c.evidence.includes("Q"));
 assert.equal(c.reviewedForSemanticAdditions,true);
 assert.equal(c.approved,false);
 assert.ok(c.sourceLoci.includes(c.qid));
 assert.ok(c.connectiveClassification.length>30);
 assert.match(c.addition,/No editorial pastoral advice or AI conclusion/);
}
for(const flag of ["userReRated","doctrinal","historical","english","french","runtime"])assert.equal(humanCalibr.approval[flag],false);
const livelihood=humanCalibr.testCorpus.find(c=>c.qid==="PX1912-Q85");
assert.equal(livelihood.contentDecision,"HOLD_PERSONAL_LIVELIHOOD_NOT_ANSWERED");
assert.ok(humanCalibr.sourceGapsHeld.some(x=>x.includes("PX1912-Q85")));
assert.ok(!livelihood.revised.includes("That does not forbid an honest livelihood"));
assert.ok(!humanCalibr.testCorpus.find(c=>c.qid==="PX1912-Q116").revised.includes("every judgment or remark"));
assert.equal(humanCalibr.testCorpus.filter(x=>x.contentDecision==="SOURCE_PROPOSITION_ONLY").length,5);
assert.equal(humanCalibr.testCorpus.filter(x=>x.contentDecision==="HOLD_PERSONAL_LIVELIHOOD_NOT_ANSWERED").length,1);

console.log("PASS eight documentary style witnesses, two comparative period controls, six rhetorical rules, ten blind tests and zero doctrinal duplication");
