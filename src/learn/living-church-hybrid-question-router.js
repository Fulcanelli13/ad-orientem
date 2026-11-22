/**
 * Review-only hybrid retrieval for Living Church.
 *
 * "Semantic" means deterministic source-topic concept indexing (NOT embeddings,
 * NLI, a language model or historical answer composition). Lexical ranking uses
 * per-topic query-variant token overlap with corpus inverse document frequency.
 * Every inferred match stays unconfirmed; topic and handoff confirmations differ.
 */
import {createSharedQuestionRouter} from "./living-church-shared-question-router.js";

export const HYBRID_QUESTION_RETRIEVAL_VERSION="AO_LC_LEXICAL_SYMBOLIC_HYBRID_V1";
const fold=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g," ")
  .replace(/\s+/g," ").trim();
const stop=new Set("a an and are as at be can could did do does for from had has have how i if in is it me my of on or our please that the there this to us was were what when where which who why will with would you your de des du en est la le les l d au aux un une pour que quel quelle quels quelles qui quoi comment dans par suis sont je tu vous nous votre mon ma mes ce cette cet il elle mais se lui leur est ils elles et y a t".split(" "));
const stem=t=>{ // deliberately minimal bilingual normalisation; no claims of lemmatisation
 if(t.length>5&&t.endsWith("ies"))return t.slice(0,-3)+"y";
 if(t.length>5&&t.endsWith("ing"))return t.slice(0,-3);
 if(t.length>5&&t.endsWith("es"))return t.slice(0,-2);
 if(t.length>4&&t.endsWith("s"))return t.slice(0,-1);
 return t;
};
const words=text=>fold(text).split(" ").filter(t=>t.length>2&&!stop.has(t)).map(stem);
const unique=xs=>[...new Set(xs)];
const includesPhrase=(hay,needle)=>(" "+hay+" ").includes(" "+needle+" ");
const variants=(topic,lang)=>[...(topic.questionVariants?.[lang]||[]),topic.title?.[lang]||""];
const topicSnap=(t,lang)=>({topicId:t.id,character:t.character,title:t.title[lang]||t.title.en,
 coverage:t.coverage,sourceRefs:t.sourceRefs.map(x=>({...x})),approvedReply:false,answerText:null});
const round=v=>Number(v.toFixed(3));
export function createHybridQuestionRouter(catalog,conceptRegistry,{historicalPointers=null,sourceConceptRegistry=null}={}){
 if(conceptRegistry?.schema!=="AO_LIVING_CHURCH_SYMBOLIC_CONCEPTS_V1"
  ||conceptRegistry.status!=="RESEARCH_ONLY_NO_EMBEDDINGS"
  ||conceptRegistry.policy?.neverOverrideBlockedRules!==true)
  throw Error("Source-constrained symbolic concept registry required");
 const legacy=createSharedQuestionRouter(catalog,{historicalPointers,sourceConceptRegistry});
 const byId=new Map(catalog.topics.map(t=>[t.id,t]));
 const byHistoricalRef=new Map((historicalPointers?.records||[]).map(x=>[x.id,x]));
 const issuedDecisions=new WeakMap();
 const remember=result=>{
  if(!result||!["source_navigation","offer_handoff"].includes(result.kind))return result;
  const canonical=byId.get(result.topicId);
  const immutable=Object.freeze({...result,
   sourceRefs:Object.freeze(canonical.sourceRefs.map(x=>Object.freeze({...x}))),
   matchEvidence:result.matchEvidence?Object.freeze({...result.matchEvidence}):null,
   requiresQuestionConfirmation:result.requiresQuestionConfirmation===true});
  issuedDecisions.set(immutable,Object.freeze({
   originalQuestion:immutable.originalQuestion,
   topicId:canonical.id,
   kind:immutable.kind,
   needsConfirmation:immutable.requiresQuestionConfirmation,
   original:immutable}));
  return immutable;
 };
 const issued=proposal=>proposal&&issuedDecisions.get(proposal);

 const glossary=conceptRegistry.concepts.map(c=>{
  if(!c.id||!c.terms?.en?.length||!c.terms?.fr?.length||!Object.keys(c.targets||{}).length
    ||c.provenance!=="EDITORIAL_TOPIC_MATCHING_ONLY")
    throw Error("Unsafe concept record "+c.id);
  for(const [id,weight] of Object.entries(c.targets))
   if(!byId.has(id)||!Number.isFinite(weight)||weight<=0||weight>1)
    throw Error("Invalid conceptual target "+id);
  return {...c,normalised:{
   en:c.terms.en.map(fold),fr:c.terms.fr.map(fold)
  }};
 });
 // Corpus-local document frequencies; do not equate keyword statistics with theology.
 const docs=catalog.topics.map(t=>({id:t.id,en:unique(variants(t,"en").flatMap(words)),
  fr:unique(variants(t,"fr").flatMap(words))}));
 const idf={};
 for(const lang of ["en","fr"]){
  const counts=new Map();
  for(const d of docs)for(const token of d[lang])counts.set(token,(counts.get(token)||0)+1);
  const total=docs.length;
  idf[lang]=new Map([...counts].map(([k,n])=>[k,Math.log(1+(total-n+.5)/(n+.5))]));
 }
 // Interpretation features are general structural cues, not source assertions.
 const cues=input=>{
  const n=fold(input);
  return {
   humanRole:/\b(who|which person|man|person|fellow|qui|quel ministre|qui est)\b/.test(n),
   ceremonialAction:/\b(raise|raises|raised|lift|lifts|lifting|elevate|elevation|bow|bows|kneel|kneels|genuflect|sing|sings|chant|chante|chante-t-il|eleve|soule?ve|s agenouille)\b/.test(n),
   offeringAction:/\b(offer|offers|offering|offertoire|offertory|offre|offrent)\b/.test(n),
   personOrObject:/\b(what is|what does|what are|which object|qu est ce|quel objet|quelle chose)\b/.test(n),
   presenceClaim:/\b(christ|jesus|christ himself|j esus|jesus christ|symbol|symbole)\b/.test(n),
   secondAction:/\b(second time|second elevation|raised again|deuxieme fois|seconde fois|second lifting)\b/.test(n),
   beforeSanctus:/\b(before|avant)\b.*\b(sanctus)\b/.test(n),
   incensory:/\b(incense|encens|thurible|encensoir)\b/.test(n),
   lamps:/\b(lamp|light|candle|lampe|lumiere)\b/.test(n),
   altarObject:/\b(chalice|calice|paten|patene|host|hostie)\b/.test(n),
   liturgyContext:/\b(mass|messe|altar|autel|priest|pretre|canon|consecration)\b/.test(n),
   personalMoral:/\b(is that a sin|is it a sin|is it wrong if|if i|should i|am i allowed|est ce un peche|est ce mal si)\b/.test(n),
   uncertainRealWorld:/\b(today|right now|this week|aujourd hui|maintenant)\b/.test(n),
   raw:n
  };
 };
 const lexical=(input,t,lang)=>{
  const q=unique(words(input));if(!q.length)return 0;
  const corpusWeights=idf[lang];
  const totalW=q.reduce((a,k)=>a+(corpusWeights.get(k)||1.5),0);
  let best=0;
  for(const phrase of variants(t,lang)){
   const v=unique(words(phrase));
   if(!v.length)continue;
   const vset=new Set(v),qset=new Set(q);
   const shared=q.filter(k=>vset.has(k)).reduce((a,k)=>a+(corpusWeights.get(k)||1.5),0);
   if(!shared)continue;
   const precision=shared/totalW;
   const coverage=v.filter(k=>qset.has(k)).length/v.length;
   // Most significant words must match, but partial visitor sentences are normal.
   best=Math.max(best,.65*precision+.35*coverage);
  }
  return Math.min(1,best);
 };
 const semantic=(input,lang)=>{
  const n=fold(input), hits=[];
  for(const concept of glossary){
   const matched=concept.normalised[lang].filter(t=>t.length>2&&includesPhrase(n,t));
   if(!matched.length)continue;
   const longest=Math.max(...matched.map(t=>t.length));
   // A phrase with discriminative words outranks one generic noun.
   const strength=Math.min(1,.42+.15*Math.min(4,words(matched.sort((a,b)=>b.length-a.length)[0]).length)+.025*Math.min(10,longest/5));
   hits.push({concept:concept.id,targets:concept.targets,strength:round(strength),
    term:matched.sort((a,b)=>b.length-a.length)[0]});
  }
  return hits;
 };
 function rank(question,{language="en",context={}}={}){
  const lang=language==="fr"?"fr":"en", hits=semantic(question,lang);
  const intent=cues(question);
  const previous=byId.get(context?.activeTopicId);
  return catalog.topics.map(t=>{
   const lex=lexical(question,t,lang);
   let sem=0;
   const used=[];
   for(const hit of hits){
    const strength=hit.targets[t.id];
    if(strength){
     // Max symbolic concept support, plus small corroboration for independent notions.
     sem=Math.max(sem,hit.strength*strength);
     used.push(hit.concept);
    }
   }
   const supplement=Math.min(.13,.065*Math.max(0,used.length-1));
   sem=Math.min(1,sem+supplement);
   const contextBoost=previous?.relatedTopics?.some(x=>x.id===t.id)? .04:0;
   let frame=0;
   // Lexical similarity alone cannot distinguish object, ritual, role and doctrine.
   // The frame influences *navigation*, never authorises answer text.
   const object=t.id.startsWith("objects.");
   const ritual=t.id.startsWith("mass.");
   const role=t.id==="objects.glossary_g221";
   if(intent.humanRole&&intent.incensory){
    if(role)frame+=.24;
    else if(object)frame-=.13;
   }
   if(intent.ceremonialAction&&intent.liturgyContext){
    if(ritual)frame+=.08;
    if(object)frame-=.12;
   }
   if(intent.offeringAction&&ritual)frame+=.07;
   if(intent.presenceClaim&&intent.altarObject){
    if(t.id==="faith.whole_christ")frame+=.22;
    if(object)frame-=.18;
   }
   if(intent.secondAction){
    if(t.id==="mass.minor_elevation")frame+=.28;
    if(object)frame-=.10;
   }
   if(intent.beforeSanctus){
    if(t.id==="mass.preface")frame+=.27;
    if(t.id==="mass.sanctus")frame-=.20;
   }
   if(intent.lamps&&t.id==="objects.sanctuary_lamp")frame+=.16;
   if(intent.lamps&&t.id==="objects.tabernacle")frame-=.11;
   // Preserve unknown personal moral judgments as gaps rather than inventing applications.
   if(intent.personalMoral&&t.id==="pius.catechism_q135")frame-=.20;
   // Do not automatically prefer a source-backed record to a research-gap record.
   const score=Math.max(0,Math.min(1,.52*lex+.45*sem+contextBoost+frame));
   return {t,score:round(score),lex:round(lex),semantic:round(sem),
    frame:round(frame),concepts:used,covered:t.coverage==="SOURCE_NAVIGATION_ONLY"};
  }).sort((a,b)=>b.score-a.score||a.t.id.localeCompare(b.t.id));
 }
 function match(question,opts={}){
  const lang=opts.language==="fr"?"fr":"en",base=legacy.match(question,opts);
  if(opts.chosenTopicId||base.kind==="clarify"||base.reason==="EMPTY_QUESTION"
   ||(base.kind==="no_coverage"&&catalog.blockedPatterns.some(x=>x.id===base.reason))
   ||base.reason==="TOPIC_SOURCE_GAP"
   ||base.reason==="HISTORICAL_SOURCE_POINTER_NOT_RESOLVED"
   ||base.reason==="UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT"
   ||base.reason==="CONTEMPORARY_DISCIPLINE_NOT_IN_HISTORICAL_SOURCE"
   ||base.reason==="LAY_MASS_PRAYER_SOURCE_NOT_IDENTIFIED"
   ||base.reason==="POST_RECEPTION_SCOPE_UNSPECIFIED"
   ||base.reason==="LITURGICAL_POSTCOMMUNION_NOT_PRIVATE_THANKSGIVING"
   ||base.reason==="HISTORICAL_SCOPE_OWNER_NOT_INDEXED"
   ||base.reason==="EXPLICIT_TOPIC_SOURCE_SCOPE_CONFLICT"
   ||base.matchEvidence?.basis==="EXACT_VARIANT"
   ||base.matchEvidence?.basis==="EXPLICIT_REFORMULATION_CHOICE"
   ||base.matchEvidence?.basis==="CONTEXT_FOLLOW_UP_RULE"
   ||base.matchEvidence?.basis==="DOCUMENTARY_LITURGICAL_SCOPE"
   ||base.matchEvidence?.basis==="DOCUMENTARY_TWO_FACET_CONCEPT"
   ||base.matchEvidence?.basis==="DOCUMENTARY_ANCHORED"
   ||base.matchEvidence?.basis==="DOCUMENTARY_CONFIRMED_FOLLOWUP")
   return remember(base);
  const intent=cues(question);
  if(intent.personalMoral&&/\b(is that a sin|is it a sin|est ce un peche)\b/.test(intent.raw))
   return {kind:"no_coverage",reason:"UNSUPPORTED_PERSONAL_MORAL_APPLICATION",
    originalQuestion:question,approvedReply:false,answerText:null,
    model:HYBRID_QUESTION_RETRIEVAL_VERSION};
  const ranked=rank(question,{language:lang,context:opts.context});
  const [first,second]=ranked;
  // Avoid a false confident route when only an incidental word matched.
  if(!first||first.score<.31||(first.lex<.12&&first.semantic<.35)
   ||(first.semantic===0&&first.lex<.82))
   return {kind:"no_coverage",reason:"HYBRID_INSUFFICIENT_EVIDENCE",
    originalQuestion:question,approvedReply:false,answerText:null,
    model:HYBRID_QUESTION_RETRIEVAL_VERSION};
  const overlap=second&&second.score>=.30&&first.score-second.score<.085;
  if(overlap){
   const options=ranked.filter(x=>x.score>=.30&&first.score-x.score<=.11)
    .slice(0,catalog.pilotLimits.maxClarifications).map(x=>({
     ...topicSnap(x.t,lang),confidenceLabel:"CANDIDATE_NOT_CERTIFIED",
     similarity:{score:x.score,lexical:x.lex,concepts:x.concepts}}));
   if(options.length>=2)return {kind:"clarify",reason:"HYBRID_CLOSE_TOPICS",
    originalQuestion:question,language:lang,
    clarification:lang==="fr"?"De quelle question parlez-vous ?":"Which question did you mean?",
    options,approvedReply:false,answerText:null};
  }
  // Use canonical legacy resolution to enforce source ownership/referral gates.
  // Then revoke its explicit-choice assumption: an inferred ranking is not a user choice.
  const out=legacy.match(question,{...opts,chosenTopicId:first.t.id});
  const basis={basis:"SYMBOLIC_HYBRID_RANKED",score:first.score,
   lexicalScore:first.lex,conceptScore:first.semantic,concepts:first.concepts,
   model:HYBRID_QUESTION_RETRIEVAL_VERSION,usesEmbeddings:false};
  if(out.kind==="offer_handoff"||out.kind==="source_navigation")
   return remember({...out,matchEvidence:basis,requiresQuestionConfirmation:true,
    approvedReply:false,answerText:null});
  return remember({...out,matchEvidence:basis,approvedReply:false,answerText:null});
 }

 function confirmSourceNavigation(proposal,{confirmQuestion=false}={}){
  const decision=issued(proposal);
  const topic=byId.get(decision?.topicId);
  const historical=topic?.category==="pius_historical_source_navigation";
  const historicRef=historical?topic.sourceRefs.find(x=>x.owner==="PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1"):null;
  const original=historicRef&&byHistoricalRef.get(historicRef.ref);
  const expectedRoute=historical?"historical.external_document":catalog.owners[topic?.character]?.navigateTo;
  if(!decision||decision.kind!=="source_navigation"||!topic
   ||topic.coverage!=="SOURCE_NAVIGATION_ONLY"||!topic.sourceRefs.length
   ||topic.character!==proposal.character
   ||JSON.stringify(proposal.sourceRefs)!==JSON.stringify(topic.sourceRefs)
   ||proposal.navigationRoute!==expectedRoute
   ||(historical&&(!original||proposal.documentNavigation?.sourceRef!==original.id
     ||proposal.documentNavigation?.url!==original.originalDocumentUrl
     ||proposal.documentNavigation?.sourceLocator!==original.sourceLocator
     ||proposal.documentNavigation?.witnessClassification!==original.witnessClassification
     ||JSON.stringify(proposal.documentNavigation)!==JSON.stringify(decision.original.documentNavigation))))
   return {kind:"invalid_navigation",reason:"UNVERIFIED_OR_FORGED_SOURCE_REFERENCE",answerText:null};
  if(decision.needsConfirmation&&!confirmQuestion)
   return {kind:"needs_question_confirmation",topicId:topic.id,
    originalQuestion:proposal.originalQuestion,answerText:null};
  return {kind:"confirmed_source_navigation",topicId:topic.id,
   character:topic.character,originalQuestion:proposal.originalQuestion,
   navigationRoute:expectedRoute,
   ...(historical?{documentNavigation:{...decision.original.documentNavigation}}:{}),
   sourceRefs:topic.sourceRefs.map(x=>({...x})),
   approvedReply:false,answerText:null,reviewOnly:true};
 }
 function acceptIssuedHandoff(proposal,args={}){
  const decision=issued(proposal);
  if(!decision||decision.kind!=="offer_handoff")
   return {kind:"invalid_handoff",reason:"UNISSUED_OR_FORGED_HANDOFF",answerText:null};
  // Do not trust caller-modified confirmation flags, references or routing fields.
  return legacy.acceptHandoff(decision.original,{
   ...args,
   confirmQuestion:decision.needsConfirmation?args.confirmQuestion===true:true
  });
 }
  return Object.freeze({version:HYBRID_QUESTION_RETRIEVAL_VERSION,
  status:"RESEARCH_ONLY_NO_EMBEDDINGS",
  topicCount:catalog.topics.length,conceptCount:glossary.length,
  match,rank,confirmSourceNavigation,acceptHandoff:acceptIssuedHandoff,
  listTopics:legacy.listTopics});
}
