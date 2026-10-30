/**
 * Private, opt-in Living Church visitor evaluation intake.
 *
 * No visitor questions are bundled in the repository. This validator is for a
 * private local JSON dataset collected with consent and independent labels.
 * Synthetic examples can test schema only and NEVER claim measured accuracy.
 */
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const choices=["route","clarify","source_gap","unknown"];
const member=x=>typeof x==="string"&&x.length>0;
const privateSignals=[/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,/\b(?:\+?\d[\s-]*){10,}\b/];
export function validateLivingChurchEvaluation(dataset,{catalog,knownQuestions=[],testOnly=false}={}){
 const issues=[],data=dataset;
 if(data?.schema!=="AO_LC_PRIVATE_VISITOR_EVALUATION_V1")issues.push("SCHEMA");
 if(!Array.isArray(data?.questions))issues.push("QUESTIONS");
 const ids=new Set(catalog?.topics?.map(t=>t.id)||[]);
 const normalizedSource=new Set([
  ...knownQuestions.map(norm),
  ...(catalog?.topics||[]).flatMap(t=>(t.questionVariants?.en||[]).concat(t.questionVariants?.fr||[]).map(norm))
 ]);
 const seen=new Set(),langs={en:0,fr:0},permittedOrigin=["REAL_VISITOR_OPT_IN","SYNTHETIC_TEST_ONLY"];
 for(const [i,q] of (data?.questions||[]).entries()){
  if(!member(q.id)||seen.has(q.id))issues.push("ID_AT_"+i);
  seen.add(q.id);
  if(!["en","fr"].includes(q.language))issues.push("LANG_AT_"+i);
  else langs[q.language]++;
  if(!member(q.question)||q.question.length>600)issues.push("QUESTION_AT_"+i);
  if(privateSignals.some(regex=>regex.test(q.question||"")))issues.push("UNREDACTED_PRIVATE_DATA_AT_"+i);
  const key=norm(q.question);
  if(normalizedSource.has(key))issues.push("TRAIN_TEST_LEAK_AT_"+i);
  if(q.origin!=="REAL_VISITOR_OPT_IN"&&!(testOnly&&q.origin==="SYNTHETIC_TEST_ONLY"))
   issues.push("ORIGIN_AT_"+i);
  if(!q.consentForPrivateResearch&&q.origin==="REAL_VISITOR_OPT_IN")
   issues.push("CONSENT_AT_"+i);
  if(q.dataMinimized!==true)issues.push("MINIMIZATION_AT_"+i);
  if(!Array.isArray(q.independentAnnotations)||q.independentAnnotations.length<2)
   issues.push("DOUBLE_REVIEW_AT_"+i);
  else{
   const reviewers=new Set(q.independentAnnotations.map(x=>x.reviewerId));
   if(reviewers.size<2)issues.push("SAME_REVIEWER_AT_"+i);
   for(const a of q.independentAnnotations){
    if(!choices.includes(a.action)||!Array.isArray(a.topicIds)
     ||a.topicIds.some(id=>!ids.has(id)))issues.push("INVALID_ANNOTATION_AT_"+i);
   }
  }
  if(!q.adjudicated||!choices.includes(q.adjudicated.action)
   ||!Array.isArray(q.adjudicated.topicIds)
   ||q.adjudicated.topicIds.some(id=>!ids.has(id)))
   issues.push("ADJUDICATION_AT_"+i);
  if(["unknown","source_gap"].includes(q.adjudicated?.action)
   &&q.adjudicated.topicIds.length>1)issues.push("UNCLEAR_GAP_LABEL_AT_"+i);
 }
 if(data?.questions?.length===0)issues.push("NO_EVALUATION_DATA_YET");
 const independent=data?.questions?.length>0&&
  data.questions.every(x=>x.origin==="REAL_VISITOR_OPT_IN"&&x.consentForPrivateResearch===true);
 const bilingual=langs.en>=25&&langs.fr>=25;
 const eligible=issues.length===0&&independent&&bilingual&&!testOnly;
 return {eligibleForIndependentQualityReport:eligible,issueCodes:[...new Set(issues)],
  counts:{total:data?.questions?.length||0,...langs},researchOnly:!eligible,
  neverPublishRawVisitorQuestions:true};
}
export function scoreLivingChurchDecisions(items,decisions){
 if(items.length!==decisions.length)throw Error("Missing matched results");
 const x={total:items.length,correct:0,wrongSpecific:0,unresolved:0,wrongClarification:0};
 for(let i=0;i<items.length;i++){
  const label=items[i].adjudicated,decision=decisions[i];
  if(decision.answerText!==null)throw Error("No authorial answers in routing evaluation");
  if(decision.kind==="source_navigation"||decision.kind==="offer_handoff"){
   if(label.action==="route"&&label.topicIds.includes(decision.topicId))x.correct++;
   else x.wrongSpecific++;
  }else if(decision.kind==="clarify"){
   if(label.action==="clarify"||decision.options?.some(o=>label.topicIds.includes(o.topicId)))x.correct++;
   else x.wrongClarification++;
  }else if(decision.kind==="no_coverage"){
   if(["source_gap","unknown"].includes(label.action))x.correct++;
   else x.unresolved++;
  }else throw Error("Unrecognised router result "+decision.kind);
 }
 return Object.freeze(x);
}
