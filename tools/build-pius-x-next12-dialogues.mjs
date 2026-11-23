/**
 * Adds 12 new research-review conversations (48 EN/FR nodes) to the already
 * validated 82/327 study, without modifying the 82 source-owner records or
 * their editorial overlays. Output is a second, offline prototype.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const dir='previews/pius-x-study/';
const root='artifacts/pius-x-study-expanded/';
const batches=[
 'spx-p3-new-chapters-communion-liturgy-4.v1.json',
 'spx-p3-new-chapters-saints-social-4.v1.json',
 'spx-p3-new-chapters-justice-pastoral-4.v1.json'
].map(file=>JSON.parse(readFileSync(dir+file,'utf8')));
const base=readFileSync(root+'SPX_Study_Expanded_82.html','utf8');
const mark=base.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(mark,'original corpus was not embedded');
const library=JSON.parse(mark[1]);
assert.equal(library.chapters.length,82);
assert.equal(library.counts.allNodes,327);
assert.equal(library.approvals.publishing,false);
const oldSerialized=JSON.stringify(library.chapters);
const appended=batches.flatMap(b=>{
 assert.equal(b.schema,'AO_SPX_P3_NEW_CHAPTER_BATCH_V1');
 assert.equal(b.status,'UNAPPROVED_SOURCE_LOCATOR_BOUND_BILINGUAL');
 assert.equal(b.chapters.length,4);
 return b.chapters;
});
assert.equal(appended.length,12);
const currentIds=new Set(library.chapters.map(c=>c.id));
const addIds=new Set(appended.map(c=>c.id));
assert.equal(addIds.size,12);
const allIds=new Set([...currentIds,...addIds]);
assert.equal(allIds.size,94);
const allNodeIds=new Set(library.chapters.flatMap(c=>c.nodes.map(n=>n.id)));
let newNodes=0,partialNew=0,englishOpenings=0,frenchOpenings=0;
for(const c of appended){
 assert(/^SPX-NEW-\d{3}$/.test(c.id));
 assert(!currentIds.has(c.id),'collision with original research corpus: '+c.id);
 assert(['CATECHESIS_AND_LITURGY','FOUNDATIONS_AND_BIOGRAPHY',
   'DOCTRINE_AND_REASON','PASTORAL_AND_PERSONAL','HISTORICAL_CHURCH_STATE'].includes(c.category));
 assert(c.source.url.startsWith('https://')&&c.source.locus&&c.source.genre);
 assert(c.nodes.length===4);
 assert(JSON.stringify(c.title)===JSON.stringify(c.nodes[0].q));
 for(const linked of c.related||[])assert(allIds.has(linked),'orphan related topic '+linked);
 c.sourceClass=c.mode==='SOURCE_SCOPE_NOTE_NOT_PAPAL_CHARACTER_SPEECH'
   ?'SOURCE_SCOPE_EDITORIAL_HOLD':'PAPAL_DOCUMENT_ADAPTATION';
 if(c.sourceClass==='SOURCE_SCOPE_EDITORIAL_HOLD'){
  assert(c.partial,'approved-but-not-authored material requires visible source hold');
  assert(c.source.genre==='CONGREGATIONAL_DECREE_PAPAL_APPROVAL_NOT_PAPAL_AUTHORSHIP');
  partialNew++;
 }else{
  assert(c.source.genre.startsWith('PAPAL_DOCUMENT_'));
 }
 for(let i=0;i<c.nodes.length;i++){
  const n=c.nodes[i];
  assert(!allNodeIds.has(n.id),'duplicate conversation node '+n.id);
  allNodeIds.add(n.id);
  assert(n.mode==='UNAPPROVED_SOURCE_BOUNDED_EDITORIAL_REVIEW');
  for(const language of ['en','fr']){
   const words=n.a?.[language]?.trim().split(/\s+/).length;
   const question=n.q?.[language];
   assert(typeof question==='string'&&question.length>15,
    'empty question in '+c.id+'/'+i+'/'+language);
   assert(words>=(i?30:85),
    'insubstantial unreviewed dialogue '+c.id+'/'+i+'/'+language+': '+words);
  }
  if(c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'){
   assert(!/\b(?:I|my|me|mine|myself)\b/.test(n.a.en),
    'singular EN papal-document voice '+n.id);
   assert(!/(?<![\p{L}\p{N}])(?:je|mon|ma|mes|moi|me)(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])j[’']/iu.test(n.a.fr),
    'singular FR papal-document voice '+n.id);
  }
  assert(!/[“”«»]/.test(n.a.en),'unattributed quote '+n.id);
  n.approvedReply=false;
  n.publicationEligible=false;
  n.editorialDepth='NEW_DIALOGUE_UNAPPROVED';
  n.depthSourceStatus='DOCUMENT_LOCATOR_CHECKED_EDITORIAL_CLAIMS_NOT_COLLATED';
  newNodes++;
 }
 englishOpenings++;frenchOpenings++;
}
assert.equal(newNodes,48);
assert.equal(partialNew,1);
assert.equal(JSON.stringify(library.chapters),oldSerialized,
 'original 82 chapters must remain byte-for-byte identical');
const extendedChapters=[...library.chapters,...appended];
assert.equal(extendedChapters.flatMap(c=>c.nodes).length,375);
const classCounts={...library.counts.sourceClassCounts};
for(const c of appended)classCounts[c.sourceClass]=(classCounts[c.sourceClass]||0)+1;
const review={
 ...library,
 version:'SPX_94_CHAPTER_375_NODE_UNAPPROVED_LIBRARY_V1',
 supplementalResearchOwner:'prototype/pius-x-standalone-study-20261021',
 counts:{...library.counts,chapters:94,regularNodes:339,dependentNodes:36,
   allNodes:375,partialReviewChapters:library.counts.partialReviewChapters+partialNew,
   sourceClassCounts:classCounts,newDialogueReview:{
    addedChapters:12,addedBilingualNodes:48,addedOpeningAnswers:12,
    addedFollowupAnswers:36,independentlyCollatedSupportingPassages:0,
    approvalCount:0,originalChaptersUnchanged:true
   }},
 chapters:extendedChapters
};
const encoded=JSON.stringify(review).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
let output=base.replace(mark[0],
 '<script type="application/json" id="spxExpandedCorpus">'+encoded+'</script>');

output=output.replace('const starters=["SPX-001","SPX-009","SPX-EXP-012","SPX-EXP-001"]',
 'const starters=["SPX-NEW-001","SPX-NEW-010","SPX-NEW-003","SPX-001"]');
assert(output.includes('launch:"Explore {count} conversations"'),'shared stage count template missing');
assert(output.includes('const starters=["SPX-NEW-001"'));
assert(!/<script[^>]+src=/.test(output),'single file must be offline');
const htmlPath=root+'SPX_Study_Expanded_94.html';
writeFileSync(htmlPath,output);
const originalLedger=JSON.parse(readFileSync(root+'SPX_82_Source_Closure_Ledger.json','utf8'));
assert.equal(originalLedger.entries.length,82);
const newLedgerEntries=appended.map(c=>({
 chapterId:c.id,question:c.nodes[0].q,sourceClass:c.sourceClass,
 sourceGenre:c.source.genre,sourceTier:c.source.tier,
 originalDocumentUrl:c.source.url,originalSourceLocator:c.source.locus,
 partialEvidence:!!c.partial,currentEditorialOpeningId:c.nodes[0].id,
 originalShortDraftPreserved:false,englishTranslationApproved:false,
 frenchTranslationApproved:false,historicalLocusIndependentlyCollated:false,
 directSupportingExcerptInSourceRegistry:false,publicationEligible:false,
 allTurnNodes:c.nodes.map(n=>({
  id:n.id,parentId:null,supportingDocumentUrl:c.source.url,
  sourceLocator:c.source.locus,claimExcerptStatus:'NOT_YET_COLLATED',
  sourceBoundButNotVerified:true
 }))
}));
const ledger={
 ...originalLedger,schema:'AO_SPX_94_DOCUMENT_WITNESS_AND_PROVENANCE_LEDGER_V1',
 counts:{...originalLedger.counts,chapters:94,nodes:375,
  allEditorialReplies:375,pendingOriginalPassageCollation:94,
  newlyAddedOpeningAnswers:12,newlyAddedFollowups:36,verifiedOriginalPassageExcerpts:0},
 entries:[...originalLedger.entries,...newLedgerEntries]
};
const ledgerPath=root+'SPX_94_Source_Closure_Ledger.json';
writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
console.log('PASS SPX_94_NEW_DIALOGUES '+JSON.stringify({
 htmlPath,ledgerPath,chapters:94,nodes:375,addedChapters:12,
 addedNodes:48,originalUnchanged:true,sourceHolds:partialNew,
 releaseApproved:false,offline:true}));
