/**
 * Independently adds the next 12 bilingual dialogues to the verified 94/375
 * offline review. Existing 94 chapters and their original evidence remain
 * structurally untouched. Does not certify historical wording or publish.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const dir='previews/pius-x-study/';
const out='artifacts/pius-x-study-expanded/';
const load=f=>JSON.parse(readFileSync(dir+f,'utf8'));
const batches=['spx-p4-new-chapters-priestly-4.v1.json',
 'spx-p4-new-chapters-interior-4.v1.json',
 'spx-p4-new-chapters-catechesis-4.v1.json'].map(load);
const older=readFileSync(out+'SPX_Study_Expanded_94.html','utf8');
const hit=older.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(hit,'missing offline source-owner registry in existing 94-chapter build');
const base=JSON.parse(hit[1]);
assert.equal(base.version,'SPX_94_CHAPTER_375_NODE_UNAPPROVED_LIBRARY_V1');
assert.equal(base.counts.chapters,94);
assert.equal(base.counts.allNodes,375);
assert.equal(base.approvals.publishing,false);
const baseline=JSON.stringify(base.chapters);
const incoming=batches.flatMap(b=>{
 assert.equal(b.schema,'AO_SPX_P4_NEW_CHAPTER_BATCH_V1');
 assert.equal(b.status,'UNAPPROVED_SOURCE_LOCATOR_BOUND_BILINGUAL');
 assert.equal(b.chapters.length,4);
 return b.chapters;
});
assert.equal(incoming.length,12);
// P5 editorial voice is an overlay, never a rewrite of the P4 source-owned drafts.
const voiceBatches=[
 'spx-p5-conversational-voice-revisions-4.v1.json',
 'spx-p5-conversational-voice-next8-a.v1.json',
 'spx-p5-conversational-voice-next8-b1.v1.json',
 'spx-p5-conversational-voice-next8-b2.v1.json'
].map(load);
for(const b of voiceBatches){
 assert.equal(b.schema,'AO_SPX_P5_CONVERSATIONAL_VOICE_OVERLAY_V1');
 assert.equal(b.status,'UNAPPROVED_REVIEW_ONLY');
 assert.equal(b.revisions.length,b.chapters.length*4);
}
const voice={chapters:voiceBatches.flatMap(b=>b.chapters),
 revisions:voiceBatches.flatMap(b=>b.revisions)};
assert.equal(voice.revisions.length,48);
assert.deepEqual([...voice.chapters].sort(),
 Array.from({length:12},(_,i)=>'SPX-NEW-'+String(13+i).padStart(3,'0')));
const incomingNodes=new Map(incoming.flatMap(c=>c.nodes.map(n=>[n.id,n])));
const voiceIds=new Set();
for(const r of voice.revisions){
 assert(!voiceIds.has(r.nodeId),'duplicate P5 editorial override');
 voiceIds.add(r.nodeId);
 const n=incomingNodes.get(r.nodeId);
 assert(n,'P5 overlay has unknown or baseline-owned node '+r.nodeId);
 const opening=r.nodeId.endsWith('.OPEN');
 for(const l of ['en','fr']){
  assert(typeof r.answer[l]==='string'&&r.answer[l].trim().split(/\s+/).length>=(opening?90:30),
   'P5 answer too short '+r.nodeId+'/'+l);
 }
 assert(!/\b(?:avatar|editorial reconstruction|publication|historical instruction)\b/i.test(r.answer.en),
  'editorial apparatus leaked into P5 papal voice '+r.nodeId);
 n.originalDraft={...n.a};
 n.a={...r.answer};
 n.editorialVoiceReview=true;
 if(r.sourceDrawerNote){
  assert(opening,'source caveat should attach to opening');
  assert(r.sourceDrawerNote.en&&r.sourceDrawerNote.fr);
  n.sourceDrawerNote={...r.sourceDrawerNote};
 }
}
assert.equal(incoming.filter(c=>voice.chapters.includes(c.id)).flatMap(c=>c.nodes).filter(n=>n.editorialVoiceReview).length,48);

const ids=new Set(base.chapters.map(c=>c.id));
const nodeIds=new Set(base.chapters.flatMap(c=>c.nodes.map(n=>n.id)));
const incomingIds=new Set(incoming.map(c=>c.id));
assert.equal(incomingIds.size,12);
const allIds=new Set([...ids,...incomingIds]);
assert.equal(allIds.size,106);
const minWords=(s)=>s?.trim().split(/\s+/).filter(Boolean).length||0;
const all=new Set();
for(const chapter of incoming){
 assert(/^SPX-NEW-0(?:1[3-9]|2[0-4])$/.test(chapter.id),'unplanned supplemental chapter '+chapter.id);
 assert(!ids.has(chapter.id),'prior chapter overwritten '+chapter.id);
 assert(!all.has(chapter.id),'duplicate new chapter '+chapter.id);all.add(chapter.id);
 assert(chapter.source?.url?.startsWith('https://www.vatican.va/'));
 assert(chapter.source.locus);
 assert(chapter.source.genre==='PAPAL_DOCUMENT_ENCYCLICAL'||
        chapter.source.genre==='PAPAL_DOCUMENT_APOSTOLIC_EXHORTATION');
 assert(chapter.nodes.length===4);
 assert(JSON.stringify(chapter.title)===JSON.stringify(chapter.nodes[0].q));
 for(const x of chapter.related||[])assert(allIds.has(x),'dangling related target '+x);
 assert(chapter.mode==='SOURCE_BOUND_PIUS_X_EDUCATIONAL_RECONSTRUCTION');
 assert(chapter.partial===false);
 chapter.sourceClass='PAPAL_DOCUMENT_ADAPTATION';
 for(let i=0;i<chapter.nodes.length;i++){
  const n=chapter.nodes[i];
  assert(!nodeIds.has(n.id),'duplicate node ID '+n.id);nodeIds.add(n.id);
  assert.equal(n.mode,'UNAPPROVED_SOURCE_BOUNDED_EDITORIAL_REVIEW');
  for(const l of ['en','fr']){
   assert(minWords(n.q[l])>=5,'missing reader question '+n.id+'/'+l);
   const w=minWords(n.a[l]);
   assert(w>=(i?30:90),'too little independent explanation '+n.id+'/'+l+' '+w);
  }
  assert(!/\b(?:I|my|me|mine|myself)\b/.test(n.a.en),
    'papal first-person singular in EN '+n.id);
  assert(!/(?<![\p{L}\p{N}])(?:je|mon|ma|mes|moi|me)(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])j[’']/iu.test(n.a.fr),
    'papal first-person singular in FR '+n.id);
  assert(!/[“”«»]/.test(n.a.en),
    'unverified quotation embedded in editorial EN prose '+n.id);
  n.approvedReply=false;
  n.publicationEligible=false;
  n.editorialDepth=n.editorialVoiceReview?'P5_VOICE_EDIT_UNAPPROVED':'NEW_P4_DIALOGUE_UNAPPROVED';
  n.depthSourceStatus='DOCUMENT_LOCATOR_REVIEWED_CLAIMS_NOT_INDEPENDENTLY_COLLATED';
 }
}
assert.equal(JSON.stringify(base.chapters),baseline,
 'existing 94 topics must not be modified by the new extension');
const chapters=[...base.chapters,...incoming];
assert.equal(chapters.length,106);
assert.equal(chapters.flatMap(c=>c.nodes).length,423);
const sourceClassCounts={...base.counts.sourceClassCounts};
sourceClassCounts.PAPAL_DOCUMENT_ADAPTATION+=12;
const totalNew={addedChapters:12,addedNodes:48,addedOpenings:12,addedFollowups:36,
 englishFrenchParity:true,previous375Unchanged:true,independentlyCollatedSupportingPassages:0,
 allPublicationApprovals:false};
const expanded={...base,
 version:'SPX_106_CHAPTER_423_NODE_UNAPPROVED_LIBRARY_V1',
 counts:{...base.counts,chapters:106,regularNodes:387,dependentNodes:36,allNodes:423,
 sourceClassCounts,thirdDialogueExpansion:totalNew},
 chapters};
const safe=JSON.stringify(expanded).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
let html=older.replace(hit[0],
 '<script type="application/json" id="spxExpandedCorpus">'+safe+'</script>');

html=html.replace(
 'const starters=["SPX-NEW-001","SPX-NEW-010","SPX-NEW-003","SPX-001"]',
 'const starters=["SPX-NEW-020","SPX-NEW-014","SPX-NEW-021","SPX-NEW-010"]');
assert(html.includes('launch:"Explore {count} conversations"'),'shared stage count template missing');
assert(html.includes('const starters=["SPX-NEW-020"'));
assert(!/<script[^>]+src=/.test(html),'external script forbidden in offline build');
const filename=out+'SPX_Study_Expanded_106.html';
writeFileSync(filename,html);
const priorLedger=JSON.parse(readFileSync(out+'SPX_94_Source_Closure_Ledger.json','utf8'));
assert.equal(priorLedger.entries.length,94);
const supplemental=incoming.map(c=>({
 chapterId:c.id,question:c.nodes[0].q,sourceClass:c.sourceClass,
 sourceGenre:c.source.genre,sourceTier:c.source.tier||null,
 originalDocumentUrl:c.source.url,originalSourceLocator:c.source.locus,
 partialEvidence:false,currentEditorialOpeningId:c.nodes[0].id,
 originalShortDraftPreserved:!!c.nodes[0].originalDraft,
 editorialVoiceReview:!!c.nodes[0].editorialVoiceReview,
 englishTranslationApproved:false,
 frenchTranslationApproved:false,historicalLocusIndependentlyCollated:false,
 directSupportingExcerptInSourceRegistry:false,publicationEligible:false,
 allTurnNodes:c.nodes.map(n=>({
  id:n.id,parentId:null,editorialVoiceReview:!!n.editorialVoiceReview,
  sourceOwnedDraftPreserved:!!n.originalDraft,
  supportingDocumentUrl:c.source.url,
  sourceLocator:c.source.locus,claimExcerptStatus:'NOT_YET_COLLATED',
  sourceBoundButNotVerified:true}))
}));
const ledger={...priorLedger,
 schema:'AO_SPX_106_DOCUMENT_WITNESS_AND_EDITORIAL_PROVENANCE_LEDGER_V1',
 counts:{...priorLedger.counts,chapters:106,nodes:423,allEditorialReplies:423,
  pendingOriginalPassageCollation:106,verifiedOriginalPassageExcerpts:0,
  thisBatchOpeningAnswers:12,thisBatchFollowupAnswers:36},
 entries:[...priorLedger.entries,...supplemental]};
const ledgerFile=out+'SPX_106_Source_Closure_Ledger.json';
writeFileSync(ledgerFile,JSON.stringify(ledger,null,2)+'\n');
console.log('PASS SPX_106_PASTORAL_DIALOGUES '+JSON.stringify({
 filename,ledgerFile,chapters:106,nodes:423,
 added:48,original375Unchanged:true,
 publicationEligible:false,offline:true}));
