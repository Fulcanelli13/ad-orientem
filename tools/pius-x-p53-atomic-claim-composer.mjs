/**
 * P2.53: claim cues, not ready-made prose. PRIVATE E SUPREMI pilot only.
 * Only the composer receives these short, noncanonical EN/FR descriptions
 * alongside immutable Latin fragments. The verifier STILL receives original
 * source-only evidence from selectEvidence(). Not a translator/certifier.
 */
export const SPX_P53_PROFILE='P53_ATOMIC_CLAIM_CUES';
const pairs=new Map([
 ['ES-INTRO-TEARS',{en:'reluctance to assume the pontificate; tears and prayers',fr:'réticence devant le pontificat; larmes et prières'}],
 ['ES-2-UNWORTHY',{en:'sense of personal unworthiness',fr:'sentiment personnel d’indignité'}],
 ['ES-2-PREDECESSOR',{en:'weight of succeeding a greatly esteemed predecessor',fr:'poids de succéder à un prédécesseur estimé'}],
 ['ES-3-FEAR',{en:'awareness of personal weakness amid society’s difficulties',fr:'conscience de sa faiblesse face aux difficultés de la société'}],
 ['ES-4-STRENGTH',{en:'reliance upon strength granted by God in accepting office',fr:'force reçue de Dieu pour assumer la charge'}],
 ['ES-4-MOTTO',{en:'restoration of all things in Christ as pontifical purpose',fr:'restauration de toutes choses dans le Christ comme dessein du pontificat'}],
 ['ES-8-CHRIST',{en:'bringing humanity to Christ and through Christ to God',fr:'conduire les hommes au Christ et, par le Christ, à Dieu'}]
]);
export function makeP53AtomicComposerContext(chosen,voiceMode){
 if(chosen?.status!=='eligible'||chosen.chapterId!=='SPX-PILOT-01'||
  !['en','fr'].includes(chosen.language)||chosen.evidence?.length!==1)
  throw new Error('P53 atomic profile is limited to the eligible original papal pilot');
 const lang=chosen.language;
 const e=chosen.evidence[0];
 if(!e.originalLanguageWitnesses?.length||e.originalLanguageWitnesses.some(w=>
  w.originalLanguage!=='la'||w.speaker!=='PIUS_X_AUTHOR'||
  !w.text||!pairs.has(w.id)||!w.sourceUrl?.startsWith('https://www.vatican.va/')))
  throw new Error('P53 evidence would lose original papal Latin provenance');
 const witnesses=e.originalLanguageWitnesses.map(w=>({
  id:w.id,originalLanguage:w.originalLanguage,originalText:w.text,
  speaker:w.speaker,locus:w.locus,sourceUrl:w.sourceUrl,
  // Concepts are NOT authentic source text, only a narrow reading aid.
  draftClaimCue:pairs.get(w.id)[lang]
 }));
 return {
  task:'ANSWER_ONE_VISITOR_QUESTION_IN_NATURAL_CONVERSATION',
  outputLanguage:lang,
  question:chosen.question,
  chapterId:chosen.chapterId,
  voiceMode,
  history:(chosen.history||[]).map(x=>({
   question:x.question,contextOnly:true
  })),
  formatRequirements:lang==='fr'?
   'Une ou deux phrases naturelles en français. Ni liste de thèmes ni commentaire sur les paragraphes ou les sources.':
   'One or two natural English sentences, never a note list or commentary about paragraphs.',
  evidence:[{
   id:e.id,question:e.question,
   status:e.status,
   originalLatinWitnesses:witnesses,
   explicitLimits:'Use only these fragment-supported propositions; do not add memories, new historical facts, ecclesiastical judgments or invented speech.'
  }],
  outputReferenceRequirements:{
   evidenceIds:[e.id],
   allowedWitnessIds:witnesses.map(w=>w.id),
   includeExactEvidenceIds:true,includeExactWitnessIds:true
  },
  editorialCuesNotPrimaryEvidence:true,
  publishingApproved:false
 };
}
export function p53WitnessIDs(){return [...pairs.keys()].sort();}
