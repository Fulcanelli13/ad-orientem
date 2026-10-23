/* Editor-only blind retrieval assessment: no author impersonation, no publication.
 * Modern questions are navigation prompts. Every displayed Father-attributed
 * word must be taken from the existing validated Catena loader.
 */
import {indexCatenaMessages,retrieveCatenaQuestionMatches,catenaOwnerUnits} from "./catena-messenger.js";
export const CATENA_MARK_BLIND_SCHEMA="ao.catena.mark-blind-retrieval-cases.v1";
export const CATENA_MARK_BLIND_EXPORT_SCHEMA="ao.catena.mark-blind-human-grades.v1";
const PIN="ec5f5717b8196b27e056ad4c5fd93b61ca31c856";
const DIGEST=/^[a-f0-9]{64}$/;
const ABSTAIN=new Set(["appropriate","missed_source","uncertain"]);
export function validateMarkBlindFixture(data){
 if(data?.schema!==CATENA_MARK_BLIND_SCHEMA||
  data.sourceResearchCommit!==PIN||
  data.canonicalCorpus!=="data/scripture/catena/mark.json"||
  data.mode!=="independent_editor_source_grade_only"||
  data.reviewerCountRequired!==2||
  data.publicReleaseApproval!==false||data.sourceTextEmbedded!==false||
  data.cases?.length!==23)throw Error("CATENA_MARK_BLIND_FIXTURE_INVALID");
 const seenIds=new Set(),seenQuestions=new Set();
 for(let i=0;i<23;i++){
  const c=data.cases[i];
  const normalized=String(c?.question||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  if(c.id!=="MARK_BLIND_"+String(i+1).padStart(2,"0")||c.displayOrder!==i+1||
   !/^catena\.mark\.(?:[1-9]|1[0-6])\.\d{1,3}$/.test(c.pericopeId||"")||
   !c.question.endsWith("?")||normalized.length<25||
   Object.keys(c).sort().join(",")!=="displayOrder,id,pericopeId,question"||
   seenIds.has(c.id)||seenQuestions.has(normalized))
    throw Error("CATENA_MARK_BLIND_CASE_INVALID");
  seenIds.add(c.id);seenQuestions.add(normalized);
 }
 return Object.freeze({cases:Object.freeze(data.cases.map(x=>Object.freeze({...x}))),
  sourceResearchCommit:data.sourceResearchCommit,reviewOnly:true});
}
export function retrieveMarkBlindCase(caseFile,section){
 if(!caseFile||!section||section.id!==caseFile.pericopeId||
  !Array.isArray(section.segments)||!section.segments.length||
  typeof section.citation!=="string"||
  !/^https:\/\/www\.ecatholic2000\.com\//.test(section.source?.url||""))
  throw Error("CATENA_MARK_BLIND_SOURCE_UNAVAILABLE");
 const original=indexCatenaMessages([section]);
 if(original.length!==section.segments.length)
  throw Error("CATENA_MARK_BLIND_SOURCE_UNVERIFIED");
 const retrieved=retrieveCatenaQuestionMatches(original,caseFile.question,{limit:4});
 return Object.freeze(retrieved.map(row=>{
  const orig=original.find(x=>x.id===row.id);
  if(!orig||orig.father!==row.father||orig.text!==row.text||
   orig.citation!==row.citation||orig.sourceUrl!==row.sourceUrl)
   throw Error("CATENA_MARK_BLIND_NONCANONICAL_MESSAGE");
  const units=catenaOwnerUnits(orig);
  if(!units)throw Error("CATENA_MARK_BLIND_MIXED_AUTHOR_UNRESOLVED");
  if(units.map(x=>x.originalWords).join("")!==orig.text)
   throw Error("CATENA_MARK_BLIND_SOURCE_WORDS_MODIFIED");
  return Object.freeze({id:row.id,father:orig.father,citation:orig.citation,
   sourceUrl:orig.sourceUrl,originalWords:orig.text,
   sourceMatchEvidence:row.sourceMatchEvidence||null,
   relatedSourceEvidence:row.relatedSourceEvidence||null,
   speakerUnits:Object.freeze(units)});
 }));
}
export function validateMarkBlindCaseDecision(fixture,caseId,messages,entry){
 if(!fixture?.reviewOnly||!fixture.cases.some(c=>c.id===caseId)||
   !Array.isArray(messages)||messages.length>4||
   messages.some(m=>!m?.id||!m.originalWords)||
   !entry||entry.caseId!==caseId||
   entry.publicationApproval!==false)
  throw Error("CATENA_MARK_BLIND_DECISION_INVALID");
 const notes=String(entry.overallRationale||"").trim();
 if(notes.length<25||notes.length>4000)
  throw Error("CATENA_MARK_BLIND_RATIONALE_REQUIRED");
 if(!messages.length){
  if(!ABSTAIN.has(entry.abstentionGrade)||entry.messageGrades?.length)
   throw Error("CATENA_MARK_BLIND_ABSTENTION_GRADE_REQUIRED");
  return Object.freeze({caseId,abstentionGrade:entry.abstentionGrade,
   overallRationale:notes,messageGrades:[],publicationApproval:false});
 }
 if(entry.abstentionGrade!==null||entry.messageGrades?.length!==messages.length)
  throw Error("CATENA_MARK_BLIND_MESSAGES_INCOMPLETE");
 const seen=new Set();
 const rows=messages.map((msg,index)=>{
  const data=entry.messageGrades[index],originalWords=msg.originalWords;
  if(!data||data.sourcePointer!==msg.id||seen.has(msg.id)||
   ![0,1,2,3].includes(data.grade)||
   typeof data.justification!=="string"||data.justification.trim().length<25||
   data.justification.length>4000||
   !DIGEST.test(String(data.sourceSHA256||""))||
   typeof data.supportingOriginalWords!=="string"||
   (data.supportingOriginalWords.length>200)||
   (data.grade>=2&&data.supportingOriginalWords.trim().length<6)||
   (data.supportingOriginalWords&&
    !originalWords.includes(data.supportingOriginalWords)))
   throw Error("CATENA_MARK_BLIND_MESSAGE_GRADE_INVALID");
  seen.add(msg.id);
  return Object.freeze({sourcePointer:msg.id,grade:data.grade,
   justification:data.justification.trim(),
   supportingOriginalWords:data.supportingOriginalWords,
   sourceSHA256:data.sourceSHA256});
 });
 return Object.freeze({caseId,abstentionGrade:null,overallRationale:notes,
  messageGrades:rows,publicationApproval:false});
}
export function buildMarkBlindReviewExport(fixture,reviewer,decisions){
 if(!fixture?.reviewOnly||!(decisions instanceof Map)||
   typeof reviewer!=="string"||reviewer.trim().length<3||
   reviewer.trim().length>100)
  throw Error("CATENA_MARK_BLIND_EXPORT_INVALID");
 const validIds=new Set(fixture.cases.map(c=>c.id));
 const entries=[];
 for(const [id,value] of decisions){
  if(!validIds.has(id)||value.caseId!==id||
   value.publicationApproval!==false||
   value.messageGrades?.some(m=>!DIGEST.test(m.sourceSHA256)||
    ![0,1,2,3].includes(m.grade)))throw Error("CATENA_MARK_BLIND_EXPORT_RECORD_INVALID");
  entries.push(value);
 }
 entries.sort((a,b)=>a.caseId.localeCompare(b.caseId));
 return Object.freeze({schema:CATENA_MARK_BLIND_EXPORT_SCHEMA,
  sourceResearchCommit:fixture.sourceResearchCommit,
  reviewMode:"independent_blind_editor_retrieval_grade",
  reviewerId:reviewer.trim(),casesTotal:23,completedCases:entries.length,
  entries,fullCanonicalExcerptsIncluded:false,
  independentApprovalNotAuthenticated:true,
  publicationApproval:false,
  mayAutoPromoteToMessenger:false});
}
export function reconcileMarkBlindReviews(fixture,first,second){
 if(!fixture?.reviewOnly||!first||!second||
   first.schema!==CATENA_MARK_BLIND_EXPORT_SCHEMA||
   second.schema!==CATENA_MARK_BLIND_EXPORT_SCHEMA||
   first.sourceResearchCommit!==fixture.sourceResearchCommit||
   second.sourceResearchCommit!==fixture.sourceResearchCommit||
   !first.reviewerId||!second.reviewerId||
   first.reviewerId.trim().toLowerCase()===second.reviewerId.trim().toLowerCase()||
   first.publicationApproval!==false||second.publicationApproval!==false||
   first.completedCases!==23||second.completedCases!==23||
   first.entries?.length!==23||second.entries?.length!==23)
  throw Error("CATENA_MARK_BLIND_SECOND_REVIEW_REQUIRED");
 const expected=new Set(fixture.cases.map(x=>x.id)),a=new Map(),b=new Map();
 for(const [data,map] of [[first,a],[second,b]]){
  for(const entry of data.entries){
   if(!expected.has(entry.caseId)||map.has(entry.caseId))throw Error("CATENA_MARK_BLIND_CASE_SET_INVALID");
   map.set(entry.caseId,entry);
  }
  if(map.size!==23)throw Error("CATENA_MARK_BLIND_CASE_SET_INVALID");
 }
 const disagreements=[];
 for(const id of expected){
  const x=a.get(id),y=b.get(id);
  const score=z=>z.messageGrades.map(t=>t.sourcePointer+":"+t.grade).join("|");
  if(x.abstentionGrade!==y.abstentionGrade||score(x)!==score(y))
   disagreements.push(Object.freeze({caseId:id,first:x.abstentionGrade||score(x),
    second:y.abstentionGrade||score(y)}));
 }
 return Object.freeze({comparedCases:23,disagreements,
  humanAdjudicationStillRequired:true,publicationApproval:false});
}
