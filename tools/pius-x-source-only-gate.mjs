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
    wave.status!=='PRIVATE_BOUNDED_SOURCE_RESEARCH_WITH_IMMUTABLE_P6_PARTIAL_HOLDS'||
    wave.summary?.documents!==6||wave.summary?.screenedExistingNodeIDs!==51||
    wave.summary?.newlyMappedNodes!==46||wave.summary?.originalP6PartialHolds!==5||
    wave.summary?.eligibleOriginalSubjects!==21||
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
 const seen2=new Set(),waveChapters=new Set();let heldPartial=0;
 for(const r of wave.records){
  const c=chapters.get(r.chapterId);
  if(!c||
     r.translationApproved!==false||r.fullAnswerApproved!==false||
     r.publicationApproved!==false||
     seen2.has(r.nodeId)||!r.witnessIds?.length)
   throw new Error('Invalid source-owner wave two research mapping '+r.nodeId);
  if(c.partial||c.sourceClass==='SOURCE_SCOPE_EDITORIAL_HOLD'){
   if(!c.partial||r.status!=='HOLD_ORIGINAL_P6_PARTIAL_EVIDENCE'||
      r.narrowClaimScope!==null||!r.holdReason||gate.has(c.id))
    throw new Error('A partially sourced papal subject cannot enter live inference');
   heldPartial++;continue;
  }
  if(c.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION'||
     r.status!=='ORIGINAL_LANGUAGE_SOURCE_SPOTCHECK_NOT_FULL_ANSWER_CERTIFIED'||
     !r.narrowClaimScope||r.narrowClaimScope.length<12)
   throw new Error('Wave-two source owner is not approved for even narrow inference');
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
 if(seen2.size!==46||heldPartial!==5||waveChapters.size!==21||gate.size!==33||
    [...gate.values()].reduce((n,x)=>n+x.size,0)!==82)
  throw new Error('Wave-two source-only coverage must equal 33 subjects and 82 nodes while preserving five partial holds');

 // Wave 3: exhaustive remaining-node triage for six existing original-language
 // Vatican document families. Existing candidate mappings are never overwritten.
 const third=json('pius-x-six-document-wave3-20261023.v1.json');
 if(third.schema!=='AO_SPX_P2_SIX_DOCUMENT_WAVE3_EVIDENCE_TRIAGE_V1'||
   third.status!=='PRIVATE_ORIGINAL_LANGUAGE_NODE_TRIAGE_WITH_EXPLICIT_HOLDS'||
   third.summary?.documents!==6||third.summary?.sourceNodesInSixDocuments!==84||
   third.summary?.previouslySourceMappedNodes!==31||
   third.summary?.previouslyUnmappedNodesScreened!==53||
   third.summary?.newBoundedResearchCandidates!==38||
   third.summary?.newResearchHolds!==15||
   third.summary?.newOriginalVaticanSnippets!==40||
   third.summary?.approvedTranslations!==0||
   third.summary?.approvedCompleteAnswers!==0||
   third.summary?.publishedReplies!==0||
   third.witnesses?.length!==40||third.records?.length!==53)
  throw new Error('Six-document wave3 source research contract drift');
 const originalByDocument={
  H:'haerent-animo',P:'pieni-l-animo',S:'singulari-quadam',
  A:'ad-diem-illum-laetissimum',E:'editae-saepe',T:'tribus-circiter'};
 const thirdWitnesses=new Map();
 for(const w of third.witnesses){
  if(thirdWitnesses.has(w.id)||!originalByDocument[w.documentGroup]||
     w.originalLanguage!==(w.documentGroup==='P'?'it':'la')||
     !w.originalText||!w.readingNote||!Number.isInteger(w.webLine)||
     w.webLine<=0||!w.sourceUrl?.startsWith('https://www.vatican.va/content/pius-x/')||
     !w.sourceUrl.includes(originalByDocument[w.documentGroup])||
     w.verificationStatus!=='VERBATIM_SHORT_SPAN_ON_OFFICIAL_VATICAN_WEB_PAGE_RESEARCH_ONLY'||
     w.translationApproved!==false||w.publishingApproved!==false||
     !['PIUS_X_AUTHOR','LEO_XIII_1902_QUOTED_BY_PIUS_X',
       'ST_CHARLES_BORROMEO_QUOTED_BY_PIUS_X'].includes(w.speaker))
   throw new Error('Wave3 historical source witness or attribution invalid '+w.id);
  thirdWitnesses.set(w.id,w);
 }
 let wave3Mapped=0,wave3Held=0;
 const wave3IDs=new Set(),wave3Groups=new Set(),wave3DocGroups=new Set();
 for(const r of third.records){
  const chapter=chapters.get(r.chapterId),node=chapter?.nodes.find(x=>x.id===r.nodeId);
  if(!chapter||!node||wave3IDs.has(r.nodeId)||
     r.questionEn!==node.q.en||!originalByDocument[r.documentGroup]||
     !chapter.source?.url?.includes(originalByDocument[r.documentGroup])||
     normalize(r.sourceUrl)!==normalize(chapter.source.url)||
     r.translationCertified!==false||r.completeAnswerApproved!==false||
     r.historicalSpeakerApproval!==false||r.publishingApproved!==false||
     Boolean(r.ownerPartial)!==Boolean(chapter.partial)||
     gate.get(chapter.id)?.has(r.nodeId))
   throw new Error('Wave3 source owner overlap, question drift, or approval '+r.nodeId);
  wave3IDs.add(r.nodeId);wave3DocGroups.add(r.documentGroup);
  if(r.status!=='BOUNDED_VATICAN_EXCERPT_CANDIDATE_UNAPPROVED'){
   if(!['HOLD_NO_SUFFICIENT_NARROW_SOURCE_ATTESTATION',
         'HOLD_IMMUTABLE_ORIGINAL_SOURCE_PARTIAL'].includes(r.status)||
      r.witnessIds.length||!r.holdReason||r.narrowClaimScope!==null||
      (r.status==='HOLD_IMMUTABLE_ORIGINAL_SOURCE_PARTIAL'&&!chapter.partial))
    throw new Error('Wave3 ungrounded node cannot be admitted '+r.nodeId);
   wave3Held++;continue;
  }
  if(chapter.partial||chapter.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION'||
     !r.narrowClaimScope||!r.witnessIds?.length)
   throw new Error('Wave3 cannot bypass original source-owner papal hold');
  const pieces=r.witnessIds.map(id=>{
   const w=thirdWitnesses.get(id);
   if(!w||w.documentGroup!==r.documentGroup||
      normalize(w.sourceUrl)!==normalize(chapter.source.url))
    throw new Error('Wave3 excerpt document mismatch '+r.nodeId+' '+id);
   return {id:w.id,text:w.originalText,originalLanguage:w.originalLanguage,
    speaker:w.speaker,sourceUrl:w.sourceUrl,readingNote:w.readingNote,
    locus:'Vatican webpage line '+w.webLine};
  });
  if(new Set(pieces.map(x=>x.originalLanguage)).size!==1)
   throw new Error('Wave3 mixed original-language evidence');
  if(!gate.has(chapter.id))gate.set(chapter.id,new Map());
  gate.get(chapter.id).set(node.id,{
   status:'WAVE_THREE_NARROW_ORIGINAL_TEXT_RESEARCH_ONLY',
   pieces,caution:[
    'Only a narrow source-grounded research candidate, never a full approved papal reply',
    'Permitted proposition: '+r.narrowClaimScope,
    'Preserve named earlier authority when a text is quoted by Pius X',
    'Do not infer a present-day personal, sacramental or canonical judgement',
    'Neither the original P6 English nor French answer is authenticated']
  });
  wave3Mapped++;wave3Groups.add(chapter.id);
 }
 if(wave3DocGroups.size!==6||wave3IDs.size!==53||
    wave3Mapped!==38||wave3Held!==15||
    gate.size!==41||
    [...gate.values()].reduce((n,x)=>n+x.size,0)!==120)
  throw new Error('Wave3 safe research gate should contain 41 subjects, 120 source-bounded nodes and 15 holds');

 // Final half of the original twelve Vatican-source-document discovery batch:
 // reuse the immutable P6 node identifiers and earlier literal witnesses.
 const fourth=json('pius-x-six-document-wave4-remaining60-20261023.v1.json');
 if(fourth.schema!=='AO_SPX_P2_SIX_DOCUMENT_WAVE4_REMAINING60_V1'||
    fourth.status!=='PRIVATE_BOUNDED_SNIPPET_RESEARCH_WITH_EXPLICIT_HOLDS'||
    fourth.summary?.documents!==6||fourth.summary?.sourceOwnerNodesInSixDocuments!==111||
    fourth.summary?.previouslyMappedNodesInSixDocuments!==51||
    fourth.summary?.remainingNodesScreened!==60||
    fourth.summary?.newBoundedResearchCandidates!==24||
    fourth.summary?.newHeldNodes!==36||
    fourth.summary?.newOriginalVaticanExcerpts!==23||
    fourth.summary?.fullAnswerCertifications!==0||
    fourth.summary?.bilingualTranslationCertifications!==0||
    fourth.summary?.publishingApprovals!==0||
    fourth.witnesses?.length!==23||fourth.records?.length!==60)
  throw new Error('Six-document remaining-node research contract drift');
 const fourthDocuments=new Map([
  ['P','pascendi-dominici-gregis'],['A','acerbo-nimis'],
  ['E','e-supremi'],['I','il-fermo-proposito'],
  ['M','sollecitudini'],['R','divino-afflatu']]);
 const fourthWitnesses=new Map();
 for(const w of fourth.witnesses){
  if(fourthWitnesses.has(w.id)||!fourthDocuments.has(w.documentGroup)||
     !w.id.startsWith('W4-'+w.documentGroup+'-')||
     w.originalLanguage!==(['I','M'].includes(w.documentGroup)?'it':'la')||
     !w.originalText||!w.claimSupported||!Number.isInteger(w.sourcePageLine)||
     !w.sourceUrl?.startsWith('https://www.vatican.va/content/pius-x/')||
     !w.sourceUrl.includes(fourthDocuments.get(w.documentGroup))||
     w.verification!=='OFFICIAL_VATICAN_EXACT_SHORT_TEXT_NOT_COMPLETE_SOURCE_CERTIFICATION'||
     w.translationApproved!==false||w.publishingApproved!==false||
     !['PIUS_X_AUTHOR','PIUS_X_REPORTS_MODERNIST_VIEW',
       'VATICAN_I_QUOTED_BY_PIUS_X','ST_BASIL_QUOTED_BY_PIUS_X'].includes(w.speaker))
   throw new Error('Invalid new papal-language witness '+w.id);
  fourthWitnesses.set(w.id,{id:w.id,text:w.originalText,
   readingNote:w.claimSupported,locus:'Vatican webpage line '+w.sourcePageLine,
   sourceUrl:w.sourceUrl,originalLanguage:w.originalLanguage,speaker:w.speaker,
   documentGroup:w.documentGroup});
 }
 let fourthAdmitted=0,fourthHeld=0,partialStillHeld=0;
 const wave4NodeIDs=new Set(),wave4Groups=new Set(),wave4Books=new Set();
 for(const r of fourth.records){
  const c=chapters.get(r.chapterId),node=c?.nodes.find(n=>n.id===r.nodeId);
  if(!c||!node||wave4NodeIDs.has(r.nodeId)||
     r.questionEn!==node.q.en||!fourthDocuments.has(r.documentGroup)||
     !c.source?.url?.includes(fourthDocuments.get(r.documentGroup))||
     normalize(r.sourceUrl)!==normalize(c.source.url)||
     Boolean(c.partial)!==r.ownerPartial||
     r.translationApproved!==false||r.completeAnswerApproved!==false||
     r.publishingApproved!==false||gate.get(c.id)?.has(node.id))
   throw new Error('Wave4 overlap, original source-owner mismatch or false approval '+r.nodeId);
  wave4NodeIDs.add(node.id);wave4Books.add(r.documentGroup);
  if(r.status!=='BOUNDED_ORIGINAL_LANGUAGE_EXCERPT_CANDIDATE'){
   if(!['HOLD_ORIGINAL_SOURCE_PARTIAL','HOLD_MISSING_PRECISE_ORIGINAL_EVIDENCE',
          'HOLD_NO_PRECISE_SOURCE_FOR_SPECIFIC_PROPOSITION'].includes(r.status)||
      r.witnessIds.length||!r.holdReason||r.narrowClaimScope!==null||
      (c.partial&&r.status!=='HOLD_ORIGINAL_SOURCE_PARTIAL'))
    throw new Error('Unattested or P6 partial answer cannot enter inference');
   fourthHeld++;if(c.partial)partialStillHeld++;continue;
  }
  if(c.partial||c.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION'||
     !r.witnessIds?.length||!r.narrowClaimScope)
   throw new Error('Wave4 full papal-source ownership required for each narrow candidate');
  const parts=r.witnessIds.map(id=>{
   const p=fourthWitnesses.get(id)||allPieces.get(id);
   if(!p||!p.text||!p.readingNote||!p.locus||
      normalize(p.sourceUrl)!==normalize(c.source.url))
    throw new Error('Wave4 missing or wrong-document source excerpt '+id);
   return p;
  });
  if(new Set(parts.map(w=>w.originalLanguage)).size!==1)
   throw new Error('Wave4 original source languages inconsistent');
  if(!gate.has(c.id))gate.set(c.id,new Map());
  gate.get(c.id).set(node.id,{status:'WAVE_FOUR_NARROW_ORIGINAL_SOURCE_CANDIDATE_UNAPPROVED',
   pieces:parts,caution:[
    'Research scope only: '+r.narrowClaimScope,
    'These snippets do not authenticate a whole P6 answer in either language',
    'Quoted council or Father and reported Modernist positions must retain attribution',
    'No live-person judgment or present-day canonical/liturgical determination is supplied']});
  fourthAdmitted++;wave4Groups.add(c.id);
 }
 if(wave4NodeIDs.size!==60||wave4Books.size!==6||
    fourthAdmitted!==24||fourthHeld!==36||partialStillHeld!==18||
    gate.size!==47||
    [...gate.values()].reduce((n,x)=>n+x.size,0)!==144)
  throw new Error('Wave4 research must preserve 36 holds and reach 47 subjects/144 original-text nodes');
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
