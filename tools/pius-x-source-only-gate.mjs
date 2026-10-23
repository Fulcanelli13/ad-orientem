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
   perNode.set(node.id,{status:'BOUNDED_ORIGINAL_EXCERPTS_UNAPPROVED',pieces,
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
 if(gate.size!==12)throw new Error('Expected 12 distinct source-scoped study subjects');
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
