import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const dir='artifacts/pius-x-study-expanded/';
const data=JSON.parse(readFileSync(dir+'SPX_P31_Readonly_Question_Reconciliation.json','utf8'));
const html=readFileSync(dir+'SPX_Study_Expanded_106_P6.html','utf8');
const block=html.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(block);
const owner=JSON.parse(block[1]);
const en=JSON.parse(readFileSync('data/learn/ltfaith-pius-x-en-witness-index.v1.json','utf8'));
const it=JSON.parse(readFileSync('data/learn/ltfaith-pius-x-it-witness-index.v1.json','utf8'));
assert.equal(data.schema,'AO_SPX_P31_P0_READONLY_CROSS_SOURCE_RECONCILIATION_V1');
assert.equal(data.status,'RESEARCH_ONLY_NEVER_CLAIM_SEMANTIC_MERGE_OR_ANSWER_CERTIFICATION');
assert.equal(data.rows.length,423);assert.equal(owner.chapters.length,106);
assert.equal(data.counts.existingDialogueNodes,423);
assert.equal(data.counts.bilingualAnswerVersions,846);
assert.equal(data.counts.indexed1912Pairs,433);
assert.equal(data.counts.historicalRawSourceReferencesReported,2222);
assert.equal(data.counts.approvedCrossEditionMerges,0);
assert.equal(data.counts.approvedSameIntentMatches,0);
assert.equal(data.safeguards.originalP6AnswersChanged,0);
assert.equal(data.safeguards.catechismAnswersCopied,0);
assert.equal(data.safeguards.distinctHistoricalQuestionIntentsVerified,null);
assert.equal(data.safeguards.originalQuestionTextCopiedFrom1912,0);
assert.equal(data.dataOwners.catechism1905.upstreamReportedApprovedMerges,0);
assert.equal(data.dataOwners.external200.reviewedComparisonRecords,200);
assert.equal(data.dataOwners.feastInstructions.extractionHold,1);
const rows=new Map(data.rows.map(r=>[r.nodeId,r]));
assert.equal(rows.size,423);
const indexedEnglish=new Map(en.entries.map(e=>[e.q,e]));
const indexedItalian=new Map(it.entries.map(e=>[e.q,e]));
assert.equal(indexedEnglish.size,433);
assert.equal(indexedItalian.size,433);
let lexicalCount=0,noLead=0,from1905=0,fromSalzano=0;
for(const c of owner.chapters){
 for(const n of c.nodes){
  const row=rows.get(n.id);
  assert(row);
  assert.equal(row.chapterId,c.id);
  assert.deepEqual(row.visitorQuestion,n.q);
  assert.equal(row.sourceClass,c.sourceClass);
  assert.equal(row.statuses.questionMergesApproved,0);
  assert.equal(row.statuses.exactSemanticDuplicatesApproved,0);
  assert.equal(row.statuses.publishingApproved,false);
  assert.equal(row.statuses.translationApproved,false);
  assert.equal(row.statuses.doctrinalApproved,false);
  assert(!('reply' in row)&&!('answer' in row),
   'No original full editorial or catechism answer copied into join');
  assert(row.candidate1912.length<=5);
  if(row.candidate1912.length)lexicalCount++;else noLead++;
  const candidateNumbers=new Set();
  for(const candidate of row.candidate1912){
   assert.equal(candidate.evidenceType,'LEXICAL_TOPIC_LEAD_ONLY_NOT_SAME_INTENT');
   assert.equal(candidate.mergeApproved,false);
   assert.equal(candidate.sourceTextCertified,false);
   assert.equal(candidate.originalLanguagePrintCertified,false);
   assert(candidate.sharedTerms.length>=2);
   assert(!candidateNumbers.has(candidate.number));
   candidateNumbers.add(candidate.number);
   assert.equal(candidate.sourceQid,'PX1912-Q'+candidate.number);
   assert(indexedEnglish.has(candidate.number)&&indexedItalian.has(candidate.number));
  }
  if(row.original1905EditorialLocusQids.length)from1905++;
  if(row.originalSalzanoEditorialLocusQids.length)fromSalzano++;
  assert(row.original1905EditorialLocusQids.every(x=>/^1905-EDITORIAL-Q\d+$/.test(x)));
  assert(row.originalSalzanoEditorialLocusQids.every(x=>/^Salzano-EDITORIAL-Q\d+$/.test(x)));
 }
}
assert.equal(lexicalCount,data.counts.provisional1912LexicalLeadNodes);
assert.equal(noLead,data.counts.without1912LexicalLead);
assert.equal(from1905,data.counts.with1905EditorNumberLocator);
assert.equal(fromSalzano,data.counts.withSalzanoEditorNumberLocator);
assert.equal(lexicalCount+noLead,423);
console.log('PASS SPX_P31_P0_INVARIANTS '+JSON.stringify({
 dialogueNodes:423,indexedCatechism1912:433,preliminaryTopicLeads:lexicalCount,
 no1912Lead:noLead,original1905LocatorNodes:from1905,
 salzanoLocatorNodes:fromSalzano,autoMerged:0,published:0
}));
