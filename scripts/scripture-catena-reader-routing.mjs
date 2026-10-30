/* Living Catena: deterministic reader-first research metadata, no patristic text generation */
import {readFileSync,writeFileSync} from "node:fs";
const dir="data/scripture/catena/research/full-corpus-pass-20261021/";
const read=n=>JSON.parse(readFileSync(dir+n,"utf8"));
const [idx,b1,b2a,b2b,rec,b3,cmp2,cmp3]=["matthew-index.v1.json","matthew-batch-01-curated-spot-review.v1.json","matthew-batch-02-47-meaning-checks.v1.json","matthew-batch-02-curated-review.v1.json","matthew-batch-02-parallel-review-reconciliation.v1.json","matthew-batch-03-contextual-reader-questions.v1.json","matthew-batch-02-seven-comparison-leads.v1.json","matthew-batch-03-14-comparison-leads.v1.json"].map(read);
const build=function build(idx,b1,b2a,b2b,rec,b3,cmp2,cmp3){
 const rows=idx.rows.map((r,i)=>({p:r[0]+":"+r[1],i,verse:r[0],author:r[2],len:r[5],flags:r[4],questions:r[6]})),by=new Map(rows.map(r=>[r.p,r]));
 if(by.size!==4825)throw Error("Incorrect canonical size");
 const order=idx.reviewBatches300.flatMap(b=>b.rowIndexes),screened=new Set(order.slice(0,900).map(i=>rows[i].p));
 const reviewed=new Map();
 function take(origin,entries,ptr,question,scope,note){
  for(const r of entries){
   const p=ptr(r),s=by.get(p),q=question(r);
   if(!s||!screened.has(p)||s.author!==r.inheritedFatherLabel||!q||!q.endsWith("?"))throw Error("Invalid review "+origin+":"+p);
   if(!reviewed.has(p))reviewed.set(p,{sourcePointer:p,pericopeId:s.verse,inheritedFatherLabel:s.author,originalCharacterCount:s.len,editorialQuestions:[],AIReviews:[],publicationEligibility:"blocked_research_only",humanApproved:false,sourceText:"canonical_pointer_only"});
   const v=reviewed.get(p);if(!v.editorialQuestions.includes(q))v.editorialQuestions.push(q);
   v.AIReviews.push({reviewSource:origin,contextualScope:scope(r),caveat:note(r)||""});
  }
 }
 take("batch01",b1.records,r=>r.pointer,r=>r.readerQuestion,r=>r.answerCoverageInThisExcerpt,r=>r.editorialRisks);
 take("batch02_A",b2a.records,r=>r.pointer,r=>r.modernReaderQuestion,r=>r.argumentCoverage,r=>r.qualification);
 take("batch02_B",b2b.records,r=>r.sourcePointer,r=>r.readerQuestionEditorial,r=>r.relationToExistingCatenaText,r=>r.reviewNotes);
 take("batch03",b3.records,r=>r.sourcePointer,r=>r.modernReaderQuestion,r=>r.claimScope,r=>r.interpretativeAndAttributionCaveat);
 const b2Union=new Set([...b2a.records.map(r=>r.pointer),...b2b.records.map(r=>r.sourcePointer)]);
 if(reviewed.size!==192||b2Union.size!==86||rec.reviewCoveragePointers.length!==86||rec.reviewCoveragePointers.some(p=>!b2Union.has(p)))throw Error("Reviewed coverage mismatch");
 const disputes=new Set(rec.assessmentDiscrepancies.map(r=>r.pointer)),splits=new Set(["catena.matthew.26.26:12","catena.matthew.27.45:1"]);
 const reviewedEntries=[...reviewed.values()].map(x=>({...x,modernEditorialQuestionsNotPatristicUtterances:true,AIReviewerDisagreement:disputes.has(x.sourcePointer),confirmedIntraFragmentAuthorSplit:splits.has(x.sourcePointer)})).sort((a,b)=>by.get(a.sourcePointer).i-by.get(b.sourcePointer).i);
 const qa=[
 "Why did Christ cry out in abandonment on the Cross?",
 "How do the Fathers respond to the accusation that the disciples stole Christ's body?",
 "Why do Matthew and Luke give different fathers for Joseph?",
 "How does Matthew count fourteen generations?",
 "What do the Magi's gold, frankincense, and myrrh signify?",
 "Why was Christ tempted, and how did He resist?",
 "How do the Beatitudes guide a Christian toward holiness?",
 "Why does Christ distinguish anger, insult, and judgment?",
 "Who is the adversary in Christ's teaching about reconciliation?",
 "What does the petition for daily bread mean?",
 "What does it mean to pray not to be led into temptation?",
 "What does the centurion's faith teach, and why do Gospel accounts differ?",
 "What do the apostles' miracles teach about the Church's spiritual work?",
 "What are the old and new treasures in the scribe's house?"
 ];
 const groups=[];
 function route(label,gs,Q,P,T,N){
  for(let i=0;i<gs.length;i++){
   const r=gs[i],q=Q(r,i),p=[...new Set(P(r))];
   if(!q||!q.endsWith("?")||p.length<2||p.some(x=>!reviewed.has(x)))throw Error("Invalid comparison "+label+":"+i+":"+q);
   groups.push({routeId:label+"-"+(i+1),modernEditorialReaderQuestion:q,sourcePointers:p,separateInheritedAuthorLabels:p.map(x=>by.get(x).author),sourceRelation:T(r),interpretativeCaution:N(r),neverSynthesizeOrMergeAuthorSpeech:true,publicationEligibility:"blocked_research_only",humanApproved:false});
  }
 }
 route("b1",b1.contrastOrComplementGroups,r=>r.readerQuestion,r=>r.links,r=>r.status,r=>r.relationship);
 route("b2a",cmp2.groups,r=>r.modernReaderQuestion,r=>r.originalAnswerPointers,r=>r.relationKind,r=>r.analyticalComparison+" "+r.sourceDifferenceOrRisk);
 route("b2b",b2b.comparisonGroups,r=>r.question,r=>r.sourcePointers,r=>r.status,r=>r.relation);
 route("b3",cmp3.records,(_,i)=>qa[i],r=>r.sourcePointers,r=>r.relation,r=>r.editorialRelationshipNotes);
 if(groups.length!==31)throw Error("Expected 31 source comparison leads");
 const originalPriority=new Map(order.map((i,k)=>[i,k+1])),weights={Q:4,O:5,C:5,V:2,D:2,R:2,S:1,L:1,T:1,U:0};
 const pending=rows.filter(x=>!reviewed.has(x.p)).map(x=>{
  const score=x.flags.reduce((a,f)=>a+(weights[f]||0),0);
  return {sourcePointer:x.p,initialQueueRank:originalPriority.get(x.i),inheritedFatherLabel:x.author,firstPassRiskFlags:x.flags,literalQuestionMarks:x.questions,metadataPriorityScore:score,riskTier:score>=8?"high":score>=4?"medium":"routine",previousCoverage:screened.has(x.p)?"source_screened_only":"indexed_only",contextualReviewRequired:true,publicationEligibility:"blocked_research_only"};
 }).sort((a,b)=>b.metadataPriorityScore-a.metadataPriorityScore||a.initialQueueRank-b.initialQueueRank);
 if(pending.length!==4633||pending.filter(x=>x.previousCoverage==="source_screened_only").length!==708||pending.filter(x=>x.previousCoverage==="indexed_only").length!==3925)throw Error("Contextual review queue doesn't partition");
 return {
  catalogue:{schema:"ao.catena.matthew-reader-catalogue.v1",date:"2026-10-21",status:"unapproved_research_only",totals:{indexed:4825,previouslySourceScreened:900,distinctAIContextReviewed:192,totalAIAssessments:211,duplicateAIReviewsOnSamePointer:19,independentlyHumanApproved:0},policy:"Modern editorial questions only; dereference unchanged canonical excerpts, preserve speaker ownership and alternatives; no invented answers or publication.",records:reviewedEntries},
  comparisons:{schema:"ao.catena.matthew-reader-comparison-routes.v1",date:"2026-10-21",status:"31_overlapping_research_leads_not_single_consensus_answers",total:31,records:groups},
  queue:{schema:"ao.catena.matthew-entire-book-review-queue.v1",date:"2026-10-21",status:"automated_metadata_priority_no_new_semantic_review",totals:{allIndexed:4825,previouslyScreened:900,AIContextReviewed:192,pending:4633,previouslyScreenedButNotAIContextReviewed:708,onlyIndexed:3925},riskWeights:weights,riskLimitations:"Flags are structural/lexical; not a theological score, true historical authorship, or a completed new source review.",records:pending}
 };
};
const data=build(idx,b1,b2a,b2b,rec,b3,cmp2,cmp3);
for(const [name,obj] of [["matthew-reader-catalogue.v1.json",data.catalogue],["matthew-reader-comparison-routes.v1.json",data.comparisons],["matthew-entire-book-review-queue.v1.json",data.queue]])writeFileSync(dir+name,JSON.stringify(obj)+"\n");
console.log("Generated: 192 source-linked reader candidates; 31 comparison leads; 4,633 outstanding contextual reviews");
