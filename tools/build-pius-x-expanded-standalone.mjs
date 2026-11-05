/**
 * Compiles the existing standalone Pius X study and the 82-chapter research
 * graph into ONE OFFLINE HTML file. No external scripts or requests.
 * Source files are edited only by their original research owner.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {applyPiusEditorialReview} from './spx-p0-editorial-normalization.mjs';
import {applyPiusFollowupEditorLayer} from './spx-p2-followup-editorial-layer.mjs';

const root='previews/pius-x-study/';
const load=name=>JSON.parse(readFileSync(root+name,'utf8'));
const first=load('source-stage-37.v1.json');
const second=load('source-stage-25.v1.json');
const third=load('source-stage-20.v1.json');
const deep=load('source-stage-depth36.v1.json');
assert.deepEqual([first.version,second.version,third.version,deep.version],
 ['SPX_CHAPTERS_STAGE_37','SPX_CHAPTERS_STAGE_25','SPX_CHAPTERS_STAGE_20','SPX_CHAPTERS_STAGE_36_DEPENDENT']);
const chapters=[...first.chapters,...second.chapters,...third.chapters];
const byId=new Map(chapters.map(c=>[c.id,c]));
assert.equal(chapters.length,82);
assert.equal(byId.size,82);
assert.equal(chapters.reduce((n,c)=>n+c.nodes.length,0),291);
let depthCount=0;
for(const item of deep.records){
 const chapter=byId.get(item.chapterId);
 assert(chapter,'unknown dependent chapter '+item.chapterId);
 assert(chapter.nodes.some(n=>n.id===item.parentId),
  'orphaned third-level reply '+item.node.id);
 const n={...item.node,parentId:item.parentId};
 assert(!chapter.nodes.some(x=>x.id===n.id),'duplicate deep node');
 chapter.nodes.push(n);depthCount++;
}
assert.equal(depthCount,36);
const all=chapters.flatMap(c=>c.nodes);
assert.equal(all.length,327);
assert.equal(new Set(all.map(x=>x.id)).size,327);
const sourceClass=c=>{
 const a=(c.mode+" "+c.source.genre+" "+c.source.tier+" "+c.source.url).toUpperCase();
 // Some catalogue modes are mixed; the original encyclical's witness
 // controls attribution, not an inherited catechism-oriented UI label.
 if(/PIUS_X_ENCYCLICAL_TEXT/.test(a)||
    (/PAPAL_PRIMARY_TEXT_OR_APPROVED_CATECHISM/.test(a)&&/\/ENCYCLICALS\//.test(a)))
   return "PAPAL_DOCUMENT_ADAPTATION";
 if(/SECONDARY_BIOGRAPHICAL_NARRATION|EDITORIAL_HISTORICAL_NARRATION_NO_SPRITE/.test(a))return "BIOGRAPHICAL_NARRATOR";
 if(/CATECHISMO|CATECHISM|CATECHETICAL|SALZANO|PREPAPAL_MANUSCRIPT/.test(a))return "CATECHETICAL_ADAPTATION";
 if(/SOURCE_SCOPE_NOTE_NOT_PAPAL_CHARACTER_SPEECH/.test(a))return "SOURCE_SCOPE_EDITORIAL_HOLD";
 if(/PAPAL_DOCUMENT|AUTHORED_PAPAL|PIUS_X_SOURCE_BOUNDED|SOURCE_BOUND_PIUS_X/.test(a))return "PAPAL_DOCUMENT_ADAPTATION";
 return "SOURCE_BOUNDED_EDITORIAL_EXPLANATION";
};
let biographical=0,partial=0,heldExternalRelated=0;
const sourceClassCounts={};
for(const c of chapters){
 assert(c.source?.url?.startsWith('https://'),'invalid original source URL '+c.id);
 assert(c.source.locus,'no original source locator '+c.id);
 assert(c.nodes[0].q.en&&c.nodes[0].q.fr,'no chapter entry');
 c.sourceClass=sourceClass(c);
 if(c.partial&&c.sourceClass==="PAPAL_DOCUMENT_ADAPTATION")c.sourceClass="SOURCE_SCOPE_EDITORIAL_HOLD";
 sourceClassCounts[c.sourceClass]=(sourceClassCounts[c.sourceClass]||0)+1;
 if(c.partial)partial++;
 if(/NARRATION/.test(c.mode))biographical++;
 const linked=c.related||[];
 heldExternalRelated+=linked.filter(id=>!byId.has(id)).length;
 c.related=linked.filter(id=>byId.has(id)); // navigation-only hold, never invent a missing chapter
 for(const n of c.nodes){
  for(const lang of ['en','fr']){
   assert.equal(typeof n.q?.[lang],'string',n.id+' question/'+lang);
   assert.equal(typeof n.a?.[lang],'string',n.id+' answer/'+lang);
   assert(n.a[lang].length>20,n.id+' unusable reply/'+lang);
  }
  const source=n.source?.url?n.source:c.source;
  assert(source.url.startsWith('https://'),'no source URL '+n.id);
  assert(source.locus,'no source locator '+n.id);
  assert(!n.approvedReply,'unreviewed turn cannot claim approval');
 }
}
// Unapproved archival content is classified before it reaches the speaker UI.
assert.equal(Object.values(sourceClassCounts).reduce((a,b)=>a+b,0),82);
assert.equal(sourceClassCounts.BIOGRAPHICAL_NARRATOR,9);
const p0=load('spx-p0-enriched-openings.v1.json');
const p1Files=['spx-p1-openings-bio-partial-16.v1.json',
 'spx-p1-openings-doctrine-16.v1.json',
 'spx-p1-openings-morals-eschatology-16.v1.json'];
const p1=p1Files.map(load);
assert.equal(p0.records.length,34);
for(const batch of p1){
 assert.equal(batch.schema,'AO_SPX_P1_BILINGUAL_EXPANSION_BATCH_16_V1');
 assert.equal(batch.status,'UNAPPROVED_EDITORIAL_PROPOSALS');
 assert.equal(batch.records.length,16);
}
const combinedRecords=[...p0.records,...p1.flatMap(batch=>batch.records)];
assert.equal(combinedRecords.length,82);
assert.equal(new Set(combinedRecords.map(x=>x.chapterId)).size,82);
for(const chapter of chapters)
 assert(combinedRecords.some(x=>x.chapterId===chapter.id),
 'missing substantive bilingual opening for '+chapter.id);
const editorialReview=applyPiusEditorialReview(chapters,{
 schema:'AO_SPX_82_BILINGUAL_SOURCE_ADAPTATION_LAYER_V2',
 status:'EDITORIAL_ONLY_UNPUBLISHED',records:combinedRecords
});
assert(editorialReview.expandedOpenings===82);
assert(editorialReview.unexpandedOpenings===0);
const followupBatchNames=[
 'spx-p2-followups-early-biography-18.v1.json',
 'spx-p2-followups-early-documentary-a-28.v1.json',
 'spx-p2-followups-early-documentary-b-28.v1.json',
 'spx-p2-followups-catechism-a-39.v1.json',
 'spx-p2-followups-catechism-b-36.v1.json',
 'spx-p2-followups-pastoral-a-30.v1.json',
 'spx-p2-followups-pastoral-b-30.v1.json',
 'spx-p2-followups-dependent-a-18.v1.json',
 'spx-p2-followups-dependent-b-18.v1.json'
];
const followupReview=applyPiusFollowupEditorLayer(chapters,followupBatchNames.map(load));
assert.equal(followupReview.extended,245);
assert.equal(followupReview.unexpanded,0);
assert.equal(followupReview.unexpandedNodeIds.length,0);

const payload={
 version:'SPX_82_CHAPTER_327_NODE_UNAPPROVED_LIBRARY_V1',
 counts:{chapters:82,regularNodes:291,dependentNodes:36,allNodes:327,
   editorialBiographicalChapters:biographical,partialReviewChapters:partial,heldExternalRelated,sourceClassCounts,editorialReview,followupReview},
 originalOwner:'formation/1457-pius-x-conversation-evidence',
 contentStatus:'UNAPPROVED_SOURCE_BOUNDED_RECONSTRUCTION_NOT_PAPAL_TRANSCRIPT',
 approvals:{history:false,source:false,doctrine:false,english:false,french:false,voice:false,publishing:false},
 chapters
};
const base=readFileSync(root+'SPX_Study_Standalone_20261021.html','utf8');
const style=readFileSync(root+'spx-expanded-style.css','utf8');
const runtime=readFileSync(root+'spx-expanded-runtime.js','utf8');
assert.equal(base.match(/<script type="application\/json" id="spxData">/g)?.length,1);
assert(!base.includes('id="spxExpandedCorpus"'));
assert(!/<\/script/i.test(style));
assert(!/<\/script/i.test(runtime));
const safeJSON=JSON.stringify(payload).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
const insertion="<script type=\"application/json\" id=\"spxExpandedCorpus\">"+safeJSON+"</script>"+
 "<style>"+style+"</style><script>"+runtime+"</script>";
assert.equal(base.split('</body>').length,2);
const result=base.replace('</body>',insertion+'</body>');
assert(!/<script[^>]+src=/.test(result));
assert(!/<link[^>]+https?:\/\//.test(result));
mkdirSync('artifacts/pius-x-study-expanded',{recursive:true});
const output='artifacts/pius-x-study-expanded/SPX_Study_Expanded_82.html';
writeFileSync(output,result);
const sourceLedger={
 schema:'AO_SPX_82_DOCUMENT_WITNESS_AND_EDITORIAL_PROVENANCE_LEDGER_V1',
 policy:'Research navigation and original-document locators are not claim-level verification, approved translations or papal quotations.',
 published:false,
 counts:{chapters:82,nodes:327,enrichedOpenings:editorialReview.expandedOpenings,
  enrichedFollowups:followupReview.extended,allEditorialReplies:327,
  pendingOriginalPassageCollation:82,verifiedOriginalPassageExcerpts:0},
 entries:chapters.map(c=>({
  chapterId:c.id,question:c.nodes[0].q,
  sourceClass:c.sourceClass,sourceGenre:c.source.genre,
  sourceTier:c.source.tier||null,originalDocumentUrl:c.source.url,
  originalSourceLocator:c.source.locus,
  partialEvidence:!!c.partial,
  currentEditorialOpeningId:c.nodes[0].id,
  originalShortDraftPreserved:!!c.nodes[0].originalDraft,
  englishTranslationApproved:false,frenchTranslationApproved:false,
  historicalLocusIndependentlyCollated:false,
  directSupportingExcerptInSourceRegistry:false,
  publicationEligible:false,
  allTurnNodes:c.nodes.map(n=>({id:n.id,parentId:n.parentId||null,
   supportingDocumentUrl:n.source?.url||c.source.url,
   sourceLocator:n.source?.locus||c.source.locus,
   claimExcerptStatus:'NOT_YET_COLLATED',
   sourceBoundButNotVerified:true}))
 }))
};
writeFileSync('artifacts/pius-x-study-expanded/SPX_82_Source_Closure_Ledger.json',
 JSON.stringify(sourceLedger,null,2)+'\n');

console.log('PASS SPX_82_CHAPTER_OFFLINE_BUILD '+JSON.stringify({output,bytes:Buffer.byteLength(result),
 chapters:82,turnNodes:327,depth:36,biographical,partial,editorialReview,followupReview,requests:0,published:0}));
