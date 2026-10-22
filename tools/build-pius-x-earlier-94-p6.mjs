/**
 * P6: non-destructive voice review of original document-based chapters.
 * Input P5 106-subject HTML and ledger remain unchanged.
 * The 94 original chapters remain 94 distinct subjects and 375 total answers.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const root='previews/pius-x-study/';
const out='artifacts/pius-x-study-expanded/';
const readJSON=(p)=>JSON.parse(readFileSync(p,'utf8'));
const file=out+'SPX_Study_Expanded_106.html';
const html=readFileSync(file,'utf8');
const pattern=/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/;
const hit=html.match(pattern);
assert(hit,'missing P5 corpus');
const original=JSON.parse(hit[1]);
assert.equal(original.counts.chapters,106);
assert.equal(original.counts.allNodes,423);
assert.equal(original.approvals.publishing,false);
const snapshots=original.chapters.map(c=>JSON.stringify(c));
const inputs=['spx-p6-earlier-documentary-a.v1.json','spx-p6-earlier-documentary-b.v1.json'];
const batches=inputs.map(name=>readJSON(root+name));
const idSet=new Set(original.chapters.slice(0,94).map(c=>c.id));
const byId=new Map(original.chapters.map(c=>[c.id,c]));
const revisedIds=new Set();
const chapterNotes=new Set();
let revised=0;
for(const batch of batches){
 assert.equal(batch.schema,'AO_SPX_P6_PREVIOUS_94_VOICE_REVIEW_V1');
 assert.equal(batch.status,'UNAPPROVED_PRIVATE_EDITORIAL');
 for(const chapterId of batch.chapters){
  assert(idSet.has(chapterId),'P6 may only revise prior 94 subjects: '+chapterId);
  assert(!chapterNotes.has(chapterId),'duplicate P6 chapter '+chapterId);
  chapterNotes.add(chapterId);
 }
 for(const item of batch.revisions){
  const chapter=byId.get(item.chapterId);
  assert(idSet.has(item.chapterId),'unknown or later chapter '+item.chapterId);
  assert.equal(chapter.sourceClass,'PAPAL_DOCUMENT_ADAPTATION',
   'non-papal source requires narrated/catechism ownership: '+item.chapterId);
  assert(Number.isInteger(item.nodeIndex)&&item.nodeIndex>=0&&item.nodeIndex<chapter.nodes.length);
  const node=chapter.nodes[item.nodeIndex];
  const key=item.chapterId+':'+item.nodeIndex;
  assert(!revisedIds.has(key),'duplicate P6 revision '+key);
  revisedIds.add(key);
  for(const lang of ['en','fr']){
   const answer=item.answer?.[lang];
   assert(typeof answer==='string');
   assert(answer.trim().split(/\s+/).length>=(item.nodeIndex===0?85:30),'short P6 '+key+' '+lang);
  }
  assert(!/\b(?:avatar|editorial reconstruction|publication eligible|modern canon law)\b/i.test(item.answer.en),
   'apparatus leaked into character voice '+key);
  assert(!/\b(?:avatar|reconstitution éditoriale)\b/i.test(item.answer.fr));
  assert(!/^(?:In |Dans )(?:E supremi|Acerbo nimis|Haerent animo|Il fermo proposito|Tra le sollecitudini)\b/i.test(item.answer.en));
  node.previousEditorialDraft={...node.a};
  node.a={...item.answer};
  node.p6VoiceReview=true;
  node.p6SourceClass='PAPAL_DOCUMENT_ADAPTATION_NOT_QUOTE';
  node.approvedReply=false;
  node.publicationEligible=false;
  if(item.sourceDrawerNote){
   assert.equal(item.nodeIndex,0,'P6 source note must be at chapter opening');
   assert(item.sourceDrawerNote.en&&item.sourceDrawerNote.fr);
   node.sourceDrawerNote={...item.sourceDrawerNote};
  }
  revised++;
 }
}
assert.equal(chapterNotes.size,12);
assert.equal(revised,22);
for(let i=0;i<original.chapters.length;i++){
 const current=original.chapters[i],prior=JSON.parse(snapshots[i]);
 if(!chapterNotes.has(current.id))assert.deepEqual(current,prior,'unexpected chapter mutation '+current.id);
 else {
  assert.equal(current.nodes.length,prior.nodes.length);
  assert.deepEqual(current.source,prior.source);
  for(let n=0;n<current.nodes.length;n++){
   const oldNode=prior.nodes[n],newNode=current.nodes[n],key=current.id+':'+n;
   if(!revisedIds.has(key))assert.deepEqual(newNode,oldNode,'unselected node changed '+key);
   else {
    const restored={...newNode};
    delete restored.previousEditorialDraft;
    delete restored.p6VoiceReview;
    delete restored.p6SourceClass;
    restored.a=oldNode.a;
    restored.sourceDrawerNote=oldNode.sourceDrawerNote;
    if(oldNode.sourceDrawerNote===undefined)delete restored.sourceDrawerNote;
    if('approvedReply' in oldNode)restored.approvedReply=oldNode.approvedReply;
    else delete restored.approvedReply;
    if('publicationEligible' in oldNode)restored.publicationEligible=oldNode.publicationEligible;
    else delete restored.publicationEligible;
    assert.deepEqual(restored,oldNode,'other fields changed '+key);
   }
  }
 }
}
assert.equal(original.chapters.flatMap(c=>c.nodes).length,423);
const enhanced={...original,
 version:'SPX_106_CHAPTER_423_NODE_P6_PRIVATE_VOICE_REVIEW_V1',
 counts:{...original.counts,p6VoiceReview:{chapters:12,answerPairs:revised,
     untouchedOriginalPrior94Chapters:82,untouchedNewP4Chapters:12}},
 chapters:original.chapters};
const encode=JSON.stringify(enhanced).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
const updated=html.replace(hit[0],'<script type="application/json" id="spxExpandedCorpus">'+encode+'</script>');
assert(!/<script[^>]+src=/.test(updated));
assert(!/<link[^>]+https?:\/\//.test(updated));
const dest=out+'SPX_Study_Expanded_106_P6.html';
writeFileSync(dest,updated);
const ledger=readJSON(out+'SPX_106_Source_Closure_Ledger.json');
assert.equal(ledger.entries.length,106);
for(const entry of ledger.entries){
 if(!chapterNotes.has(entry.chapterId))continue;
 entry.p6VoiceReview=true;
 entry.allTurnNodes.forEach((n,index)=>{
  if(!revisedIds.has(entry.chapterId+':'+index))return;
  n.p6VoiceReview=true;
  n.p6PreviousEditorialDraftPreserved=true;
  n.claimExcerptStatus='NOT_YET_COLLATED';
 });
}
ledger.schema='AO_SPX_106_P6_PRIVATE_VOICE_REVIEW_LEDGER_V1';
ledger.counts.p6VoiceRevisions=revised;
ledger.counts.p6Chapters=12;
ledger.published=false;
ledger.allPublicationApprovals=false;
writeFileSync(out+'SPX_106_P6_Source_Closure_Ledger.json',JSON.stringify(ledger,null,2)+'\n');
console.log('PASS SPX_P6_OLD_DOC_VOICE '+JSON.stringify({chapters:106,answers:423,revisedChapters:12,
revisedBilingualPairs:revised,untouchedBaseline:94-chapterNotes.size,untouchedP4:12,
published:false,output:dest}));
