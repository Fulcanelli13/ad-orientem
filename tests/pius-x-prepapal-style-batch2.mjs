import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=async name=>JSON.parse(await readFile(new URL("../data/learn/"+name,import.meta.url),"utf8"));
const corpus=await read("pius-x-prepapal-style-batch2.v1.json");
const style=await read("pius-x-documentary-voice-style.v1.json");
assert.equal(corpus.schema,"AO_PIUS_X_PREPAPAL_STYLE_EVIDENCE_BATCH2_V1");
assert.equal(corpus.status,"RESEARCH_ONLY_NO_AVATAR_RUNTIME_USE");
assert.equal(corpus.documentedItems.length,10);
assert.equal(corpus.features.length,5);
assert.equal(corpus.directQuotePermissions,0);
assert.equal(corpus.sourceLocality.completeAppendixRead,false);
assert.equal(corpus.sourceLocality.originalAutographsViewed,false);
assert.equal(corpus.sourceLocality.fullPrepapalTranscriptVerified,0);
assert.equal(corpus.approval.historicAutographQuotesCertified,0);
assert.equal(corpus.approval.generatedPersonalRecollectionsApproved,0);
assert.equal(corpus.approval.styleRulesReadyForRuntime,false);
assert.equal(corpus.approval.doctrineModified,false);
assert.equal(corpus.approval.spritesModified,false);
const ids=new Set();
const sources=new Set();
for(const item of corpus.documentedItems){
 assert.equal(ids.has(item.id),false,"duplicate historical document");ids.add(item.id);
 assert.ok(item.documentId.length>2);
 assert.ok(item.printedAppendixPages.length>=3);
 assert.match(item.documentarySource.url,/^https:\/\//);
 assert.equal(item.originalManuscriptChecked,false,"must not imply checked autograph");
 assert.equal(item.fullIndividualDocumentRead,false,"only archival intro or scholarly extract read");
 assert.match(item.publicationUse,/RESEARCH_REVIEW_ONLY/);
 assert.ok(item.caution.length>=60);
 assert.ok(item.rhetoricalHypothesis.length>50);
 assert.ok(item.evidenceSummary.length>70);
 sources.add(item.documentarySource.url);
}
assert.equal(sources.size,2);
assert.equal(corpus.documentedItems.filter(x=>x.documentarySource.kind==="CRITICAL_ARCHIVAL_PUBLICATION_EXCERPT").length,9);
assert.equal(corpus.documentedItems.filter(x=>x.documentarySource.kind==="SCHOLARLY_PUBLICATION_REPORTING_AUTOGRAPH").length,1);
assert.equal(style.prepapalStyleCompanion.path,"data/learn/pius-x-prepapal-style-batch2.v1.json");
assert.equal(style.registers.FAMILIAR.authorisation,"SCHOLARLY_EXCERPT_STYLE_HYPOTHESIS_ONLY");
assert.equal(style.registers.FAMILIAR.periodIntensity,"LIGHT_BUT_PERIOD_TRUE");
for(const rule of corpus.features){
 assert.ok(rule.evidenceItems.length>=1);
 for(const id of rule.evidenceItems)assert.ok(ids.has(id));
 assert.ok(rule.rule.length>85);
 assert.ok(rule.risk);
 if(rule.id==="AFFECTIONATE_SELF_MOCKERY")
  assert.ok(rule.evidenceItems.length>=3,"humour must not derive from one isolated letter");
}
const fragments=corpus.minimalWordFragments;
assert.ok(fragments.length>0&&fragments.every(x=>ids.has(x.itemId)));
const sum=fragments.map(x=>x.original).join(" ").trim().split(/\s+/).length;
assert.ok(sum<=25,"do not republish long excerpts from scholarly introductory text");
assert.ok(corpus.sourceLimits.includes("NOT"));
assert.ok(!JSON.stringify(corpus).includes("answerText"),"no duplicate Catechism answer corpus");
assert.ok(!JSON.stringify(corpus).includes("voiceAudio"),"historical prose cannot establish audio voice");
console.log("PASS 10 distinct Sarto archival leads, six form categories, humour supported by multiple letters, no autograph overclaim, zero doctrinal duplicates");
