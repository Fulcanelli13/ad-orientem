/**
 * Non-authoritative period-voice review layer. Changes only source-bound
 * editorial draft renderings in the generated prototype, not original texts.
 * Do not use with verbatim quotations or catechism/biography records.
 */
import assert from 'node:assert/strict';

const EN_SINGULAR=/\b(I|my|me|mine|myself)\b/g;
const FR_SINGULAR=/(?<![\p{L}\p{N}])(?:je|mon|ma|mes|moi|me)(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])j[’']/giu;

function pluralEnglish(s){
 return s.replace(/\bmyself\b/gi,m=>m[0]==='M'?'Ourselves':'ourselves')
  .replace(/\bmine\b/gi,m=>m[0]==='M'?'Ours':'ours')
  .replace(/\bmy\b/gi,m=>m[0]==='M'?'Our':'our')
  .replace(/\bme\b/gi,m=>m[0]==='M'?'Us':'us')
  .replace(/\bI\b/g,'We');
}
function pluralFrench(s){
 let out=s;
 // Match full inflected finite verbs before touching possessives or objects.
 const rules=[
  [/\bje n['’]ai\b/gi,'Nous n’avons'],
  [/\bj['’]ai\b/gi,'Nous avons'],
  [/\bj['’]aurais\b/gi,'Nous aurions'],
  [/\bje me suis adressé\b/gi,'Nous nous sommes adressés'],
  [/\bje résolus\b/gi,'Nous résolûmes'],
  [/\bje résistais\b/gi,'Nous résistions'],
  [/\bje répondais\b/gi,'Nous répondions'],
  [/\bje donnai\b/gi,'Nous donnâmes'],
  [/\bje voulais\b/gi,'Nous voulions'],
  [/\bje critiquais\b/gi,'Nous critiquions'],
  [/\bje contestais\b/gi,'Nous contestions'],
  [/\bje visais\b/gi,'Nous visions'],
  [/\bje combattais\b/gi,'Nous combattions'],
  [/\bje proposais\b/gi,'Nous proposions'],
  [/\bj['’]appelais\b/gi,'Nous appelions'],
  [/\bj['’]évoquais\b/gi,'Nous évoquions'],
  [/\bj['’]indiquais\b/gi,'Nous indiquions'],
  [/\bj['’]insistais\b/gi,'Nous insistions'],
  [/(?<![\p{L}\p{N}])je(?![\p{L}\p{N}])/giu,'Nous'],
  [/(?<![\p{L}\p{N}])mon(?![\p{L}\p{N}])/giu,'Notre'],
  [/(?<![\p{L}\p{N}])ma(?![\p{L}\p{N}])/giu,'Notre'],
  [/(?<![\p{L}\p{N}])mes(?![\p{L}\p{N}])/giu,'Nos'],
  [/(?<![\p{L}\p{N}])me(?![\p{L}\p{N}])/giu,'nous'],
  [/(?<![\p{L}\p{N}])m['’]/giu,'nous ']
 ];
 for(const [pattern,replacement] of rules)out=out.replace(pattern,replacement);
 return out;
}
export function applyPiusEditorialReview(chapters,overlay){
 assert.equal(overlay.schema,'AO_SPX_82_BILINGUAL_SOURCE_ADAPTATION_LAYER_V2');
 assert.equal(overlay.status,'EDITORIAL_ONLY_UNPUBLISHED');
 const byId=new Map(chapters.map(c=>[c.id,c]));
 let voiceChanges=0,papalNodes=0,unchangedNodes=0;
 for(const c of chapters){
  if(c.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION')continue;
  for(const n of c.nodes){
   papalNodes++;
   const en=pluralEnglish(n.a.en),fr=pluralFrench(n.a.fr);
   // A new inflected construction should be authored, never guessed.
   assert(!EN_SINGULAR.test(en),'unreconciled English singular: '+n.id);
   assert(!FR_SINGULAR.test(fr),'unreconciled French singular: '+n.id);
   EN_SINGULAR.lastIndex=0; FR_SINGULAR.lastIndex=0;
   if(en!==n.a.en||fr!==n.a.fr){
    n.originalDraft={...n.a};
    n.a={en,fr};
    n.voiceReview='MECHANICALLY_RECONCILED_FOR_EDITORIAL_REVIEW_NOT_APPROVED';
    voiceChanges++;
   }else unchangedNodes++;
  }
 }
 const ids=new Set();let expansions=0;
 for(const item of overlay.records){
  assert(!ids.has(item.chapterId),'duplicate P0 opening '+item.chapterId);
  ids.add(item.chapterId);
  const c=byId.get(item.chapterId);
  assert(c,'no authoring owner for '+item.chapterId);
  assert(c.source.url.startsWith('https://'));
  assert(c.nodes[0].id&&c.nodes[0].a.en&&c.nodes[0].a.fr);
  assert(item.target==='OPENING');
  assert(item.editorialStatus==='UNAPPROVED_SOURCE_BOUNDED_SYNTHESIS_NOT_VERBATIM');
  for(const lang of ['en','fr']){
   assert(typeof item.answer[lang]==='string');
   assert(item.answer[lang].split(/\s+/).length>=90,
    'enriched response must have substantial argument: '+item.chapterId+' '+lang);
  }
  c.nodes[0].originalDraft=c.nodes[0].originalDraft||{...c.nodes[0].a};
  c.nodes[0].a={...item.answer};
  c.nodes[0].editorialDepth='ENRICHED_OPENING_UNAPPROVED';
  c.nodes[0].depthSourceStatus='INHERITED_CHAPTER_LOCATOR_NOT_INDEPENDENTLY_COLLATED';
  if(c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'){
   assert(!EN_SINGULAR.test(c.nodes[0].a.en));
   assert(!FR_SINGULAR.test(c.nodes[0].a.fr));
   EN_SINGULAR.lastIndex=0;FR_SINGULAR.lastIndex=0;
  }
  expansions++;
 }
 assert(expansions===82);
 return {papalNodes,voiceChanges,unchangedNodes,expandedOpenings:expansions,
  unexpandedOpenings:chapters.length-expansions};
}
