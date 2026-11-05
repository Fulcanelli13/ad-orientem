/**
 * Applies substantive, explicitly unapproved bilingual editorial expansions to
 * existing follow-up nodes. Never mutates the source stage; preserves the
 * original short Q&A, same original source locator, and parent-turn lineage.
 */
import assert from 'node:assert/strict';
const countWords=s=>s.trim().split(/\s+/).filter(Boolean).length;
export function applyPiusFollowupEditorLayer(chapters,batches){
 const byChapter=new Map(chapters.map(c=>[c.id,c]));
 let extended=0,reviewedFrench=0,sourceHolds=0;
 const seen=new Set();
 for(const batch of batches){
  assert.equal(batch.schema,'AO_SPX_FOLLOWUP_EDITORIAL_ADDITIONS_V1');
  assert.equal(batch.status,'UNAPPROVED_EDITORIAL_EXTENSION_NOT_QUOTATION');
  for(const rec of batch.entries){
   const c=byChapter.get(rec.chapterId);
   assert(c,'unrecognized chapter '+rec.chapterId);
   assert(Number.isInteger(rec.ordinal)&&rec.ordinal>=1&&rec.ordinal<c.nodes.length,
     'invalid follow-up ordinal '+rec.chapterId+'/'+rec.ordinal);
   const n=c.nodes[rec.ordinal],key=c.id+'/'+rec.ordinal;
   assert(!seen.has(key),'duplicate editorial extension '+key);seen.add(key);
   assert(n.q.en&&n.q.fr&&n.a.en&&n.a.fr,'missing original EN/FR');
   for(const lang of ['en','fr']){
    assert(typeof rec[lang]==='string'&&countWords(rec[lang])>=25,
      'insufficient separately authored follow-up support '+key+'/'+lang);
    assert(!/[“”«»]/.test(rec[lang]),'unattributed putative quotation '+key+'/'+lang);
   }
   if(c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'){
    assert(!/(?<![\p{L}\p{N}])(?:I|my|me|mine|myself)(?![\p{L}\p{N}])/iu.test(rec.en),
      'singular personal voice in papal EN extension '+key);
    assert(!/(?<![\p{L}\p{N}])(?:je|mon|ma|mes|moi|me)(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])j[’']/iu.test(rec.fr),
      'singular personal voice in papal FR extension '+key);
   }
   // Earlier period-voice reconciliation has already saved the literal
   // short research draft in originalDraft. Keep that immutable witness;
   // independently preserve the normalized pre-expansion reading.
   n.previousDraft={...n.a};
   n.originalDraft=n.originalDraft||{...n.a};
   n.a={en:n.a.en.trim()+'\n\n'+rec.en.trim(),fr:n.a.fr.trim()+'\n\n'+rec.fr.trim()};
   assert(countWords(n.a.en)>=45&&countWords(n.a.fr)>=45,
     'combined answer remains short '+key);
   n.editorialDepth='ENRICHED_FOLLOWUP_UNAPPROVED';
   n.depthSourceStatus='INHERITED_CHAPTER_LOCATOR_NOT_INDEPENDENTLY_COLLATED';
   n.followupExpansionOwner='spx-p2-source-bound-editorial-layer';
   if(c.partial||c.sourceClass==='SOURCE_SCOPE_EDITORIAL_HOLD')sourceHolds++;
   extended++;reviewedFrench++;
  }
 }
 const count=chapters.reduce((n,c)=>n+c.nodes.length-1,0);
 assert.equal(count,245,'changing follow-up baseline requires source reconciliation');
 const holdIds=chapters.flatMap(c=>c.nodes.slice(1).filter(n=>!n.editorialDepth).map(n=>n.id));
 return {allFollowups:count,extended,unexpanded:count-extended,
  frenchExtensions:reviewedFrench,partialEvidenceExtended:sourceHolds,
  unexpandedNodeIds:holdIds};
}
