/**
 * Private P2 inference evidence boundary. This is NOT a new canonical source registry.
 * It consumes existing immutable source-owner nodes and the already-reviewed
 * original-language evidence files. Full EN/FR P6 answers are never sent to a model.
 */
import {readFileSync} from 'node:fs';

function json(name){
 return JSON.parse(readFileSync(new URL('../previews/pius-x-study/evidence/'+name,import.meta.url),'utf8'));
}

export function loadSourceOnlyGate(chapters,oldAnnexes){
 const research=json('pius-x-next12-eight-opening-context-evidence-20261023.v1.json');
 const claims=json('pius-x-eight-opening-source-claims-20261023.v1.json');
 if(research.schema!=='AO_SPX_P2_NEXT12_EIGHT_OPENING_CONTEXT_EVIDENCE_V1'||
   research.status!=='PRIVATE_CLAIM_SCOPED_PRIMARY_EVIDENCE_NOT_MODEL_PROMOTED'||
   claims.schema!=='AO_SPX_P2_EIGHT_OPENING_SOURCE_CLAIM_MAP_V1'||
   claims.status!=='CLAIM_LEVEL_ORIGINAL_EXCERPT_SUPPORT_ONLY'||
   claims.summary?.claimSupportLinks!==41||claims.summary?.fullAnswersCertified!==0||
   research.summary?.newModelEvidencePromotions!==0||
   research.items?.length!==8||claims.items?.length!==8||
   oldAnnexes.size!==4)throw new Error('Original-language evidence contract drifted');
 const gate=new Map();
 for(const [id,a] of oldAnnexes){
  const chapter=chapters.get(id);
  if(!chapter||chapter.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION'||
    chapter.nodes.length!==a.dialogueMappings.length)throw new Error('Papal original witness chapter mismatch');
  const originals=new Map(a.sourceWitnesses.map(w=>[w.id,w]));
  const perNode=new Map();
  for(const m of a.dialogueMappings){
   const node=chapter.nodes.find(n=>n.id===m.nodeId);
   if(!node||perNode.has(m.nodeId))throw new Error('Duplicate or unknown source node');
   const pieces=m.witnessIds.map(wid=>{
    const w=originals.get(wid);
    if(!w||!w.meaning||!(w.text||w.latin))throw new Error('Incomplete old primary witness: '+wid);
    return {id:wid,locus:w.locus,text:w.text||w.latin,
     originalLanguage:a.document.languageOfOriginal||'la',
     sourceUrl:a.document.sites.original||a.document.sites.la,
     speaker:w.speaker,readingNote:w.meaning};
   });
   perNode.set(node.id,{status:'BOUNDED_'+((a.document.languageOfOriginal||'la')==='it'?'ITALIAN':'LATIN')+'_SPOTCHECK_NOT_FULL_VERIFICATION',pieces,
    caution:[...(m.editorialWarnings||m.editorialFlags||[])]});
  }
  gate.set(id,perNode);
 }
 for(const d of research.items){
  const chapter=chapters.get(d.chapterId);
  const map=claims.items.find(x=>x.chapterId===d.chapterId);
  if(!chapter||chapter.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION'||
    chapter.partial||gate.has(d.chapterId)||!map||
    map.documentKey!==d.documentKey||map.answerFullyApproved!==false||
    d.fullDialogueClaimVerified!==false||d.publicationApproved!==false||
    d.translationApproved!==false||d.nodeIds?.length!==1||
    chapter.nodes[0].id!==d.nodeIds[0]||
    !['la','it'].includes(d.originalLanguage)||
    !d.originalUrl?.startsWith('https://www.vatican.va/')||
    map.sourceBackedClaims?.length!==d.witnesses?.length)
   throw new Error('Uncertified eight-opening evidence would cross model gate');
  const byWitness=new Map(d.witnesses.map(w=>[w.id,w]));
  if(byWitness.size!==d.witnesses.length)throw new Error('Duplicate witness ID');
  const pieces=map.sourceBackedClaims.map(link=>{
   const w=byWitness.get(link.witnessId);
   if(!w||w.originalText!==link.originalText||w.speaker!==link.speaker||
     !w.webLine||!link.claim||w.language!==d.originalLanguage)
    throw new Error('Original-language source/claim mismatch: '+d.chapterId);
   return {id:w.id,locus:'Vatican webpage line '+w.webLine,
    text:w.originalText,originalLanguage:d.originalLanguage,
    speaker:w.speaker,sourceUrl:d.originalUrl,readingNote:link.claim};
  });
  gate.set(d.chapterId,new Map([[d.nodeIds[0],{
   status:'NARROW_SOURCE_CLAIM_CANDIDATES_UNAPPROVED',pieces,
   caution:[...d.unresolvedClaims,'The complete existing editorial answer remains unverified and is excluded from inference']
  }]]));
 }

 // Extend evidence *inside the same 8 existing source-owner subjects*.
 // Every unmapped follow-up remains held before model inference.
 const batch=json('pius-x-eight-document-followup-triage-20261023.v1.json');
 if(batch.schema!=='AO_SPX_P2_EIGHT_DOCUMENT_FOLLOWUP_TRIAGE_V1'||
    batch.status!=='PRIVATE_FOLLOWUP_EVIDENCE_BOUNDED_UNAPPROVED'||
    batch.summary?.followupNodes!==22||
    batch.summary?.boundedFollowupCandidates!==14||
    batch.summary?.heldFollowupNodes!==8||
    batch.additionalOriginalWitnesses?.length!==3||
    batch.followups?.length!==22)throw new Error('Follow-up original witness audit drifted');
 const supplemental=new Map(batch.additionalOriginalWitnesses.map(w=>[w.id,w]));
 if(supplemental.size!==3)throw new Error('Duplicated supplemental original excerpt');
 for(const w of supplemental.values()){
  if(w.originalLanguage!=='it'||w.speaker!=='PIUS_X_AUTHOR'||
     !w.sourceUrl?.startsWith('https://www.vatican.va/content/pius-x/it/')||
     !w.originalText||!w.webLine||!w.readingNote)
   throw new Error('Supplemental witness incomplete');
 }
 const classified=new Set();let admitted=0,rejected=0;
 for(const item of batch.followups){
  const c=chapters.get(item.chapterId),src=research.items.find(x=>x.chapterId===item.chapterId);
  const entry=gate.get(item.chapterId);
  if(!c||!src||!entry||src.documentKey!==item.documentKey||
     classified.has(item.nodeId)||item.translationApproved!==false||
     item.completeAnswerApproved!==false||item.publicationApproved!==false)
   throw new Error('Follow-up candidate cannot cross source-only contract');
  const node=c.nodes.find(n=>n.id===item.nodeId);
  if(!node||node.id===c.nodes[0].id||node.q.en!==item.questionEn)
   throw new Error('Follow-up source-owner question drift');
  classified.add(item.nodeId);
  if(item.status==='HOLD_FOLLOWUP_OUTSIDE_CURRENT_EXCERPTS'){
   if(item.witnessIds.length||!item.holdReason)throw new Error('Invalid follow-up hold');
   rejected++;continue;
  }
  if(item.status!=='BOUNDED_ORIGINAL_LANGUAGE_FOLLOWUP_CANDIDATE'||
     !item.narrowAnswerScope||!item.witnessIds.length)
   throw new Error('Unclassified follow-up source');
  const originals=new Map(src.witnesses.map(w=>[w.id,w]));
  const parts=item.witnessIds.map(id=>{
   const w=originals.get(id)||supplemental.get(id);
   if(!w||w.language&&w.language!==src.originalLanguage||
      w.originalLanguage&&w.originalLanguage!==src.originalLanguage||
      !(w.originalText||w.text)||!(w.webLine)||!(w.speaker))
    throw new Error('Unattested follow-up witness '+id);
   const note=w.claimSupported||w.readingNote;
   if(!note)throw new Error('Unexplained source witness '+id);
   return {id,locus:'Vatican webpage line '+w.webLine,text:w.originalText||w.text,
    originalLanguage:src.originalLanguage,speaker:w.speaker,
    sourceUrl:src.originalUrl,readingNote:note};
  });
  entry.set(node.id,{status:'NARROW_SOURCE_FOLLOWUP_CANDIDATE_UNAPPROVED',
    pieces:parts,caution:[item.caution,
     'Answer only this bounded scope: '+item.narrowAnswerScope,
     'The original P6 bilingual full reply is NOT evidence and has not been certified']});
  admitted++;
 }
 if(classified.size!==22||admitted!==14||rejected!==8||
    [...gate.values()].reduce((a,g)=>a+g.size,0)!==36)
  throw new Error('Follow-up source coverage must equal 36 of 423 nodes');

 if(gate.size!==12)throw new Error('Expected twelve initial source-scoped study subjects');
 // Six-document evidence wave: original text is admitted only with an explicit
 // canonical node ID and narrow-proposition claim. Never load full P6 answers.
 const wave=json('pius-x-six-document-wave2-20261023.v1.json');
 if(wave.schema!=='AO_SPX_P2_SIX_DOCUMENT_BULK_WAVE2_V1'||
    wave.status!=='PRIVATE_BOUNDED_SOURCE_RESEARCH_ONLY'||
    wave.summary?.documents!==6||wave.summary?.newlyMappedNodes!==51||
    wave.summary?.distinctChapters!==25||wave.summary?.newOriginalLanguageSnippets!==35||
    wave.summary?.completeAnswersCertified!==0||wave.summary?.publicationApprovals!==0||
    wave.witnesses?.length!==35||wave.records?.length!==51)
  throw new Error('Wave-two original-language registry counts or research status drifted');
 const allPieces=new Map();
 for(const d of research.items)for(const w of d.witnesses)allPieces.set(w.id,{
  id:w.id,text:w.originalText,readingNote:w.claimSupported,
  sourceUrl:d.originalUrl,originalLanguage:d.originalLanguage,speaker:w.speaker,
  locus:'Vatican webpage line '+w.webLine});
 for(const [id,d] of oldAnnexes)for(const w of d.sourceWitnesses)if(!allPieces.has(w.id))
  allPieces.set(w.id,{id:w.id,text:w.text||w.latin,readingNote:w.meaning,
   sourceUrl:d.document.sites.original||d.document.sites.la,
   originalLanguage:d.document.languageOfOriginal||'la',speaker:w.speaker,
   locus:'Vatican webpage line '+w.webTextVerification?.sourcePageLine});
 for(const w of wave.witnesses){
  if(allPieces.has(w.id)||!w.originalText||!w.readingNote||!w.webLine||
     w.speaker!=='PIUS_X_AUTHOR'||!['it','la'].includes(w.originalLanguage)||
     !w.sourceUrl?.startsWith('https://www.vatican.va/content/pius-x/'))
   throw new Error('New wave original excerpt is missing or conflicts: '+w.id);
  allPieces.set(w.id,{id:w.id,text:w.originalText,readingNote:w.readingNote,
   sourceUrl:w.sourceUrl,originalLanguage:w.originalLanguage,speaker:w.speaker,
   locus:'Vatican webpage line '+w.webLine});
 }
 const normalize=url=>{
  const u=new URL(url);
  return u.pathname.replace(/\/(?:en|fr|it|la|de|es|pt|pl|ar)\//,'/{lang}/');
 };
 const seen2=new Set(),waveChapters=new Set();
 for(const r of wave.records){
  const c=chapters.get(r.chapterId);
  if(!c||c.partial||c.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION'||
     r.translationApproved!==false||r.fullAnswerApproved!==false||
     r.publicationApproved!==false||
     r.status!=='ORIGINAL_LANGUAGE_SOURCE_SPOTCHECK_NOT_FULL_ANSWER_CERTIFIED'||
     seen2.has(r.nodeId)||!r.witnessIds?.length||
     !r.narrowClaimScope||r.narrowClaimScope.length<12)
   throw new Error('Invalid source-owner wave two research mapping '+r.nodeId);
  if(gate.get(c.id)?.has(r.nodeId))throw new Error('Cannot overwrite older original-language research mapping');
  const node=c.nodes.find(x=>x.id===r.nodeId);
  if(!node||node.q.en!==r.questionEn)throw new Error('Original P6 dialogue ID/question mismatch');
  const pieces=r.witnessIds.map(wid=>{
   const piece=allPieces.get(wid);
   if(!piece||!piece.text||!piece.readingNote||!piece.locus||
      normalize(piece.sourceUrl)!==normalize(c.source.url))
    throw new Error('Wrong document or missing Vatican excerpt for '+r.nodeId+': '+wid);
   return piece;
  });
  if(new Set(pieces.map(x=>x.originalLanguage)).size!==1)
   throw new Error('Mixed original-source languages on one node');
  seen2.add(r.nodeId);waveChapters.add(c.id);
  if(!gate.has(c.id))gate.set(c.id,new Map());
  gate.get(c.id).set(r.nodeId,{status:'WAVE_TWO_BOUNDED_ORIGINAL_EXCERPT_CANDIDATE_UNAPPROVED',
   pieces,caution:[
    'Only the following narrow statements are source-grounded: '+r.narrowClaimScope,
    'This is an excerpt-level research sample, not a verified complete dialogue',
    'Any contemporary personal judgement, later liturgical law, or quoted authority requires separate sources',
    'Do not treat original P6 English or French editorial wording as papal quotation']});
 }
 if(seen2.size!==51||waveChapters.size!==25||gate.size!==37||
    [...gate.values()].reduce((n,x)=>n+x.size,0)!==87)
  throw new Error('Wave-two source-only coverage must equal 37 subjects and 87 of 423 nodes');
 return gate;
}

export function sourceOnlyEvidence(gate,chapter,node,language){
 const nodes=gate.get(chapter.id);
 if(!nodes)return {held:'no_original_language_witness_for_selected_subject'};
 if(!nodes.has(node.id))return {held:'followup_not_mapped_to_primary_source_claim'};
 const selected=nodes.get(node.id);
 const pieces=selected.pieces;
 if(!pieces?.length||pieces.some(w=>!w.text||!w.readingNote||
   !w.sourceUrl?.startsWith('https://www.vatican.va/')||!w.locus))
  return {held:'missing_original_language_witness'};
 const originalLanguage=pieces[0].originalLanguage;
 if(pieces.some(w=>w.originalLanguage!==originalLanguage))
  throw new Error('Mixed source-language evidence in one mapped source node');
 const loc=node.source?.locus||chapter.source.locus;
 const evidence=[{
  id:node.id,question:node.q[language],
  text:pieces.map(w=>w.readingNote).join('; '),
  sourceUrl:pieces[0].sourceUrl,locus:loc,
  status:'UNVERIFIED_EDITORIAL_ADAPTATION_NOT_ORIGINAL_QUOTATION',
  primaryWitnessStatus:selected.status,
  originalLanguageWitnesses:pieces,
  originalLatinWitnesses:originalLanguage==='la'?pieces.map(w=>({
   id:w.id,locus:w.locus,latin:w.text,speaker:w.speaker,
   sourceUrl:w.sourceUrl,readingNote:w.readingNote})):[],
  editorialWarnings:[...selected.caution,
   'Only these narrow evidence glosses and original text were sent; no existing full P6 answer']
 }];
 return {evidence};
}
