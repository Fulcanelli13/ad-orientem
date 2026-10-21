/**
 * Review-only St Pius X documentary answer selection.
 * Consumes the EXISTING PR #1443 router's source_navigation result, then
 * picks whole, unchanged English/French segments from PR #1458's derivative.
 * It cannot generate prose, certify source text, or publish character replies.
 */
import assert from 'node:assert/strict';

const fold=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[’‘']/g," ").replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const containsPhrase=(text,phrase)=>(' '+fold(text)+' ').includes(' '+fold(phrase)+' ');
const locatorSections=value=>{
 const found=new Set();
 // Pius X printed locators can enumerate noncontiguous spans: §§15, 24–25.
 for(const block of String(value).matchAll(/§{1,2}\s*([\d\s,–-]+)/g))
  for(const part of block[1].split(',')){
   const match=part.trim().match(/^(\d+)(?:\s*[–-]\s*(\d+))?$/);
   assert(match,'unparsed source locator '+value);
   const first=Number(match[1]),last=Number(match[2]||match[1]);
   assert(last>=first&&last-first<=30,'unexpected source locator '+value);
   for(let n=first;n<=last;n++)found.add(n);
  }
 return found;
};
const locusSections=value=>{
 const found=new Set();
 for(const m of String(value).matchAll(/§{1,2}\s*(\d+)(?:\s*[–-]\s*(\d+))?/g)){
  const first=Number(m[1]),last=Number(m[2]||m[1]);
  for(let n=first;n<=last;n++)found.add(n);
 }
 return found;
};
const stop=(kind,props={})=>Object.freeze({kind,approvedReply:false,answerText:null,...props});
export function createPiusDocumentFirstReviewSelector({router,benchmark,registry,pointers}){
 assert(router&&typeof router.match==='function','existing shared router required');
 assert.equal(benchmark?.schema,'AO_SPX_DOCUMENT_FIRST_THREE_COMPLETE_BENCHMARKS_V2');
 assert.equal(benchmark?.status,'UNAPPROVED_COMPLETE_34_TURN_BILINGUAL_CLAIM_MAP');
 assert.equal(benchmark?.counts?.exchanges,34);
 assert.equal(benchmark?.counts?.published,0);
 assert(Object.values(benchmark.reviewGates).every(v=>v===false));
 assert.equal(registry?.schema,'AO_SPX_DOCUMENT_FIRST_ROUTER_TO_CLAIMS_BRIDGE_V1');
 assert.equal(registry?.status,'RESEARCH_ONLY_UNAPPROVED_ADAPTED_VOICE_NOT_PUBLISHED');
 assert(Object.values(registry.approvals).every(v=>v===false));
 assert.equal(pointers?.schema,'AO_LIVING_CHURCH_PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1');
 const pointersById=new Map(pointers.records.map(p=>[p.id,p]));
 const bySegment=new Map();
 for(const scene of benchmark.scenes){
  for(const turn of scene.turns){
   for(const seg of turn.segments){
    assert(!bySegment.has(seg.id),'duplicate segment '+seg.id);
    bySegment.set(seg.id,{seg,turn,doc:scene.sourceId});
   }
  }
 }
 const bySource=new Map();
 for(const entry of registry.entries){
  assert(!bySource.has(entry.sourceRef),'duplicate linked document');
  const source=pointersById.get(entry.sourceRef);
  assert(source&&source.approvedReply===false);
  assert.equal(source.sourceLocator,entry.locator);
  assert.equal(source.sourceAttestation,'PASSAGE_SCREEN_ONLY_NOT_ORIGINAL_FACSIMILE_COLLATED');
  const canonicalUrl=benchmark.sources[entry.document]?.comparisons;
  assert(canonicalUrl&&Object.values(canonicalUrl).includes(source.originalDocumentUrl),
    'historical original source URL drift '+entry.sourceRef);
  const available=locatorSections(source.sourceLocator);
  assert(available.size>0);
  assert.equal(entry.selectionPlans[0]?.role,'DEFAULT');
  assert(entry.selectionPlans.length<=4);
  for(const plan of entry.selectionPlans){
   assert(plan.segmentIds.length>=1&&plan.segmentIds.length<=3,
      'long/scripted response not permitted');
   if(plan.role==='SCOPED_ALTERNATE')
    for(const lang of ['en','fr'])
     assert(plan.trigger?.[lang]?.length>=2,'must derive selection from bilingual scoped intent');
   else assert.equal(plan.role,'DEFAULT');
   const claims=new Set();
   for(const id of plan.segmentIds){
    const owned=bySegment.get(id);
    assert(owned,'missing source segment '+id);
    assert.equal(owned.doc,entry.document,'cross-document authoring prohibited');
    assert.equal(owned.seg.kind,'SOURCE_BOUNDED_ADAPTATION');
    assert.equal(owned.turn.speaker,'PIUS_X_CONVERSATIONAL_SOURCE_ADAPTATION');
    assert.equal(owned.turn.speechMode,'ADAPTED_PAPAL_VOICE_NOT_HISTORICAL_QUOTE');
    for(const claimId of owned.seg.claimIds){
     const claim=benchmark.claims[claimId];assert(claim,'unknown claim');
     assert.equal(claim.doc,entry.document);
     const sections=locusSections(claim.locus);
     assert(sections.size>0,'unparsed claim '+claimId);
     for(const section of sections)
      assert(available.has(section),'out-of-scope claim '+claimId+' at '+claim.locus);
     claims.add(claimId);
    }
    for(const lang of ['en','fr'])assert(owned.seg[lang]?.length>15);
   }
   assert.deepEqual([...claims],plan.claimIds,'claim sequence must be complete and exact');
  }
  bySource.set(entry.sourceRef,{entry,source});
 }
 assert.equal(bySource.size,registry.entries.length);
 assert(bySource.size>=3&&bySource.size<=30,'unexpected source-bridge expansion size');
 function evaluate(question,{language='en',confirmed=false,context=null}={}){
  const lang=language==='fr'?'fr':'en';
  const routing=router.match(question,{language:lang,currentCharacter:'pius-x',...(context?{context}:{})});
  if(routing.kind!=='source_navigation')
   return stop('no_review_answer',{routerDecision:routing.kind,reason:routing.reason||'NOT_SINGLE_SOURCE_NAVIGATION'});
  const ref=routing.documentNavigation?.sourceRef;
  if(!bySource.has(ref))return stop('outside_benchmark',{topicId:routing.topicId||null});
  const {entry,source}=bySource.get(ref);
  if(routing.topicId!==entry.topicId||routing.navigationRoute!=='historical.external_document'
   ||routing.documentNavigation.url!==source.originalDocumentUrl
   ||routing.documentNavigation.sourceLocator!==source.sourceLocator
   ||routing.documentNavigation.approvedReply!==false
   ||routing.approvedReply!==false||routing.answerText!==null)
    return stop('source_mismatch',{reason:'CANONICAL_ROUTER_RESULT_MISMATCH'});
  // Even an exact catalog phrase does not authorize an unreviewed character line.
  if(!confirmed)
   return stop('confirm_source',{topicId:entry.topicId,sourceRef:ref,
    sourceTitle:benchmark.sources[entry.document].title,sourceLocator:entry.locator,
    needsConfirmation:true});
  const alternate=entry.selectionPlans.slice(1).find(p=>
    (p.trigger?.[lang]||[]).some(term=>containsPhrase(question,term)));
  const plan=alternate||entry.selectionPlans[0];
  const segments=plan.segmentIds.map(id=>{
   const {seg}=bySegment.get(id);
   return {segmentId:seg.id,text:seg[lang],claimIds:[...seg.claimIds],
    sourceLoci:[...new Set(seg.claimIds.map(cid=>benchmark.claims[cid].locus))],
    secondaryAuthority:seg.secondaryAuthority||null};
  });
  return stop('editorial_candidate',{
   sourceRef:ref,topicId:entry.topicId,document:benchmark.sources[entry.document].title,
   documentGenre:benchmark.sources[entry.document].genre,
   originalAudience:benchmark.sources[entry.document].originalAudience,
   sourceUrl:source.originalDocumentUrl,sourceLocator:source.sourceLocator,
   selectionPlan:plan.id,segments,displayAdaptation:segments.map(s=>s.text).join(' '),
   claimIds:[...plan.claimIds],
   speechMode:'ADAPTED_PAPAL_VOICE_NOT_HISTORICAL_QUOTE',
   publicationEligible:false,independentlyVerified:false,
   contextualSelection:!!context?.confirmedActiveTopicId,
   reviewNotice:'Editorially adapted historical speech; unapproved EN/FR rendering, not original papal quotation.'});
 }
 return Object.freeze({status:'RESEARCH_ONLY',evaluate,linkedSources:[...bySource.keys()]});
}
