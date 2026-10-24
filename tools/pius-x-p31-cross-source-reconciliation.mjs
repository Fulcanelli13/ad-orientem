/**
 * P2.31 / P0 cross-source reconciliation: a read-only research report.
 * Consumes ORIGINAL P6 corpus and original pinned 1912 en/it indexes.
 * Does not rewrite a catechism, approve an intent merge, or copy Q&A answers.
 * Externally-owned 1905/Salzano/feast registries remain references until
 * their authoritative full-text artifacts are formally reconciled.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';

const root='artifacts/pius-x-study-expanded/';
const load=path=>JSON.parse(readFileSync(path,'utf8'));
const html=readFileSync(root+'SPX_Study_Expanded_106_P6.html','utf8');
const embedded=html.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(embedded,'Missing original source-owner study');
const corpus=JSON.parse(embedded[1]);
const english=load('data/learn/ltfaith-pius-x-en-witness-index.v1.json');
const italian=load('data/learn/ltfaith-pius-x-it-witness-index.v1.json');
assert.equal(corpus.counts.chapters,106);
assert.equal(corpus.counts.allNodes,423);
assert.equal(corpus.approvals.publishing,false);
assert.equal(english.entries.length,433);
assert.equal(italian.entries.length,433);
assert(english.originalPrintedFacsimileCollated!==true,'Uncertified modern English index is not an original 1912 facsimile');
assert.equal(italian.originalPrintedFacsimileCollated,false);
const en=new Map(english.entries.map(x=>[x.q,x]));
const it=new Map(italian.entries.map(x=>[x.q,x]));
assert.equal(en.size,433);assert.equal(it.size,433);
for(let q=1;q<=433;q++){
 assert(en.has(q)&&it.has(q),'Broken numbered catechism bridge '+q);
 assert(en.get(q).file===it.get(q).file,'Edition locator conflict '+q);
 assert(en.get(q).source_file_url.startsWith('https://github.com/'));
 assert(it.get(q).italianSourceFileUrl.startsWith('https://github.com/'));
}
const stop=new Set('a an and are as at be been by can could did do does for from have how i in into is it its me my of on or our the their there these this to us was were what when where which who whom why with would you your catholic church god jesus christ mean means meaning explain please tell'.split(' '));
const tokens=value=>new Set(
 String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
 .replace(/[^a-z0-9]+/g,' ').split(/\s+/)
 .filter(x=>x.length>=4&&!stop.has(x))
);
const stems=[...en.values()].sort((a,b)=>a.q-b.q).map(x=>({...x,terms:tokens(x.q_stem)}));
const candidatesFor=question=>{
 const q=tokens(question);if(q.size<2)return [];
 const rows=[];
 for(const s of stems){
  if(s.terms.size<2)continue;
  const shared=[...q].filter(x=>s.terms.has(x));
  if(shared.length<2)continue;
  const shortShare=shared.length/Math.min(q.size,s.terms.size);
  const balanced=shared.length/Math.sqrt(q.size*s.terms.size);
  if(shortShare<0.60||balanced<0.37)continue;
  rows.push({sourceQid:'PX1912-Q'+s.q,number:s.q,
   sharedTerms:shared,termOverlap:+balanced.toFixed(3),
   evidenceType:'LEXICAL_TOPIC_LEAD_ONLY_NOT_SAME_INTENT',
   mergeApproved:false,sourceTextCertified:false,
   originalLanguagePrintCertified:false});
 }
 return rows.sort((a,b)=>b.termOverlap-a.termOverlap||
   b.sharedTerms.length-a.sharedTerms.length||a.number-b.number).slice(0,5);
};
const numberLocus=(locus,system)=>{
 const text=String(locus||'');
 if(!new RegExp(system==='1905'?'1905|Catechismo maggiore':'Salzano','i').test(text))return [];
 const m=/\bQ\s*(\d{1,4})(?:\s*[–—-]\s*(\d{1,4}))?/i.exec(text);
 if(!m)return [];
 const from=Number(m[1]),to=Number(m[2]||m[1]);
 if(to<from||to-from>80||from<1||to>(system==='1905'?993:577))return [];
 return Array.from({length:to-from+1},(_,i)=>system+'-EDITORIAL-Q'+(from+i));
};
const rows=[],ids=new Set(),byChapter=new Set();
let proposedLexical=0,noLexical=0,source1905=0,sourceSalzano=0;
for(const c of corpus.chapters){
 assert(!byChapter.has(c.id));byChapter.add(c.id);
 for(const node of c.nodes){
  assert(!ids.has(node.id),'Duplicated source-owner node');ids.add(node.id);
  assert(typeof node.q.en==='string'&&typeof node.q.fr==='string');
  assert(typeof node.a.en==='string'&&typeof node.a.fr==='string');
  const source=node.source?.url?node.source:c.source;
  const loc=source?.locus||'';
  const all=source?.url||'';
  const matched1912=candidatesFor(node.q.en);
  if(matched1912.length)proposedLexical++;else noLexical++;
  const cited1905=/catechismo-maggiore|catechismo.maggiore/i.test(all+' '+loc);
  const citedSalzano=/salzano|arciprete-di-salzano/i.test(all+' '+loc);
  const printed1905=cited1905?numberLocus(loc,'1905'):[];
  const printedSalzano=citedSalzano?numberLocus(loc,'Salzano'):[];
  if(printed1905.length)source1905++;
  if(printedSalzano.length)sourceSalzano++;
  rows.push({
   nodeId:node.id,chapterId:c.id,sourceClass:c.sourceClass,
   chapterPartial:!!c.partial,sourceGenre:source?.genre||c.source?.genre||null,
   originalDocumentUrl:all,originalLocus:loc,
   visitorQuestion:{en:node.q.en,fr:node.q.fr},
   provenance:{owner:'ORIGINAL_P6_NODE',sourceAnswerUnchanged:true,
    sourceUrlIsContentCertification:false},
   candidate1912:matched1912,
   original1905EditorialLocusQids:printed1905,
   originalSalzanoEditorialLocusQids:printedSalzano,
   statuses:{exactSemanticDuplicatesApproved:0,questionMergesApproved:0,
    originalPrintedPassageCollated:false,translationApproved:false,
    doctrinalApproved:false,publishingApproved:false},
   followupKind:node.kind||null
  });
 }
}
assert.equal(ids.size,423);assert.equal(byChapter.size,106);
assert.equal(rows.length,423);assert.equal(proposedLexical+noLexical,423);
assert.equal(rows.filter(x=>x.statuses.questionMergesApproved!==0).length,0);
const countClass={};for(const row of rows)countClass[row.sourceClass]=(countClass[row.sourceClass]||0)+1;
const result={
 schema:'AO_SPX_P31_P0_READONLY_CROSS_SOURCE_RECONCILIATION_V1',
 date:'2026-10-24',status:'RESEARCH_ONLY_NEVER_CLAIM_SEMANTIC_MERGE_OR_ANSWER_CERTIFICATION',
 originalOwner:{repository:'Fulcanelli13/ad-orientem',asset:'P6-106-423',
  publicationApproved:false,unchanged:true},
 dataOwners:{
  catechism1912:{enIndex:'data/learn/ltfaith-pius-x-en-witness-index.v1.json',
   itIndex:'data/learn/ltfaith-pius-x-it-witness-index.v1.json',
   rawQuestionCount:433,original1912PrintCollated:false,
   editionWarning:'Digital Italian witness contains post-1929 material; 1912 edition discrepancies require expert resolution.'},
  catechism1905:{rawQuestionCount:993,sourceResearchPR:1458,
   upstreamCrosswalk:'data/learn/research/pius-x-sacraments-339-topical-overlap-crosswalk-20261020.v2.json',
   upstreamCrosswalkQuestionCount:339,upstreamReportedApprovedMerges:0,
   treatment:'INDEXED_CATECHISM_QUESTIONS_NOT_AUTHOR_VERBATIM_SPEECH'},
  salzano:{rawEditorialReferenceCount:577,sourceResearchPR:1458,
   treatment:'EDITORIAL_NUMBERING_ISSUES; ORIGINAL_MS_QIDS_NOT_CERTIFIED'},
  feastInstructions:{rawReportedCount:219,observedExtractedPairs:218,
   extractionHold:1,sourceResearchPR:1458},
  external200:{sourceResearchPR:1458,
   path:'data/learn/research/pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json',
   reviewedComparisonRecords:200,published:0},
  personalStyle:{sourceResearchPR:1419,
   relation:'STYLE_ONLY_NOT_AUTHORITY_TO_ADD_ANY_DOCTRINE'}
 },
 safeguards:{
  crossEditionSemanticMergesApproved:0,catechismAnswersCopied:0,
  originalP6AnswersChanged:0,
  distinctHistoricalQuestionIntentsVerified:null,
  printedItalianFacsimileCollationsFromThisPass:0,
  bilingualTranslationCertificationsFromThisPass:0,
  originalQuestionTextCopiedFrom1912:0,
  onlyEnglishQuestionStemsUsedForLexicalScreening:true
 },
 counts:{
  chapters:106,existingDialogueNodes:423,bilingualAnswerVersions:846,
  historicalRawSourceReferencesReported:2222,
  indexed1912Pairs:433,indexed1905RawQuestionCount:993,
  salzanoRawEditorialReferences:577,feastRawPublishedCount:219,
  chaptersBySourceClass:corpus.counts.sourceClassCounts,
  dialogueNodesBySourceClass:countClass,
  provisional1912LexicalLeadNodes:proposedLexical,
  without1912LexicalLead:noLexical,
  with1905EditorNumberLocator:source1905,
  withSalzanoEditorNumberLocator:sourceSalzano,
  approvedSameIntentMatches:0,
  approvedCrossEditionMerges:0
 },
 rows
};
const destination=process.env.AO_SPX_RECONCILIATION_OUTPUT||
 root+'SPX_P31_Readonly_Question_Reconciliation.json';
mkdirSync(dirname(resolve(destination)),{recursive:true});
writeFileSync(destination,JSON.stringify(result,null,2)+'\n');
console.log('PASS SPX_P31_P0_CROSS_SOURCE '+JSON.stringify({
 path:destination,counts:result.counts,safeguards:result.safeguards
}));
