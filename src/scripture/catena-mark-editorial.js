/* Research-only Mark question-to-source navigation for the existing Living Catena
 * editorial workbench. Never surface this registry as an approved Father answer.
 * Canonical words are loaded exclusively from the integrity-checked chapter loader.
 */
import {loadCatenaForPassage} from "./catena-inline.js";

export const CATENA_MARK_RESEARCH_COMMIT="a1c1f9cd68d74f8543ead64a7ca27aa35fdb0dec";
export const CATENA_MARK_RESEARCH_SCHEMA="ao.catena.mark-ten-original-work-crosswalk.v1";
const ALLOWED=new Set([
 "original_work_translation_located","original_language_work_located",
 "original_language_work_located_with_catena_abridgment",
 "only_secondary_work_attribution_excerpt_found"
]);
function exactQuestion(text){
 return String(text||"").normalize("NFKC").toLocaleLowerCase("en")
  .replace(/[\u2019\u2018]/g,"'").replace(/[^a-z0-9]+/g," ").trim();
}
export function validateCatenaMarkEditorial(data){
 if(data?.schema!==CATENA_MARK_RESEARCH_SCHEMA||
   data.importedFromResearchCommit!==CATENA_MARK_RESEARCH_COMMIT||
   data.sourceResearchStatus!=="AI_assisted__not_independent_human_verification"||
   data.importPurpose!=="READ_ONLY_EDITORIAL_WORKBENCH_NO_PUBLIC_MESSENGER_ROUTING"||
   data.reviewOnly!==true||data.state!=="research_only_not_human_approved"||
   data.canonicalPack!=="data/scripture/catena/mark.json"||
   data.counts?.records!==10||data.counts?.independentWorkTextInspected!==9||
   data.counts?.originalLanguageInspected!==3||
   data.counts?.criticalEditionChecked!==0||data.counts?.humanApproved!==0||
   !Array.isArray(data.rows)||data.rows.length!==10)
  throw Error("CATENA_MARK_RESEARCH_INVALID");
 const seen=new Map(),questions=new Set();
 for(const row of data.rows){
  if(!/^catena\.mark\.(?:[1-9]|1[0-6])\.\d{1,3}:\d+$/.test(row.sourcePointer||"")||
    seen.has(row.sourcePointer)||row.inheritedFatherLabel?.length<3||
    !Number.isSafeInteger(row.canonicalCharLength)||row.canonicalCharLength<30||
    row.canonicalExcerptCopied!==false||
    typeof row.editorialQuestion!=="string"||!row.editorialQuestion.endsWith("?")||
    exactQuestion(row.editorialQuestion).length<15||
    questions.has(exactQuestion(row.editorialQuestion))||
    row.originalWork?.length<10||row.originalWorkLocus?.length<10||
    row.contextFinding?.length<30||row.readerGuard?.length<30||
    row.witnessAnchor?.length<10||!ALLOWED.has(row.witnessAssessment)||
    typeof row.independentWorkTextInspected!=="boolean"||
    typeof row.originalLanguageInspected!=="boolean"||
    row.originalLanguageInspected&&!row.independentWorkTextInspected||
    row.witnessAssessment==="only_secondary_work_attribution_excerpt_found"&&row.independentWorkTextInspected||
    row.originalGreekOrLatinCriticalCollation!==false||
    row.criticalEditionChecked!==false||
    row.independentHumanEditorApproved!==false||
    row.publicationEligibility!=="blocked_research_only")
   throw Error("CATENA_MARK_RESEARCH_RECORD_INVALID");
  try{
   const u=new URL(row.witnessUrl);
   if(u.protocol!=="https:"||u.username||u.password)
    throw Error("invalid witness");
  }catch{throw Error("CATENA_MARK_EXTERNAL_LINK_INVALID")}
  seen.set(row.sourcePointer,Object.freeze({...row}));
  questions.add(exactQuestion(row.editorialQuestion));
 }
 if([...seen.values()].filter(x=>x.independentWorkTextInspected).length!==9||
    [...seen.values()].filter(x=>x.originalLanguageInspected).length!==3)
  throw Error("CATENA_MARK_RESEARCH_COUNTS_INVALID");
 return Object.freeze({rows:Object.freeze([...seen.values()]),byPointer:seen,reviewOnly:true});
}
/* This accepts only an EXACT existing editorial research question, allowing
 * punctuation/case variation. It does not try to infer theological equivalence
 * or turn an unapproved contextual association into a direct answer.
 */
export function findCatenaMarkResearchQuestion(registry,input){
 if(!registry?.reviewOnly)return null;
 const key=exactQuestion(input);
 if(!key)return null;
 const r=registry.rows.find(x=>exactQuestion(x.editorialQuestion)===key);
 if(!r)return null;
 return Object.freeze({kind:"unapproved_research_navigation",sourcePointer:r.sourcePointer,
  question:r.editorialQuestion,publicationEligibility:"blocked_research_only",
  doesNotCertifyAnswer:true});
}
export async function loadCatenaMarkEditorialSource(registry,pointer,{
 loader=loadCatenaForPassage,options={}
}={}){
 const record=registry?.byPointer?.get(pointer);
 if(!registry?.reviewOnly||!record)throw Error("CATENA_MARK_UNKNOWN_RESEARCH_POINTER");
 const match=/^catena\.mark\.(\d+)\.(\d+):(\d+)$/.exec(pointer);
 if(!match)throw Error("CATENA_MARK_BAD_POINTER");
 const chapter=Number(match[1]),verse=Number(match[2]),ordinal=Number(match[3]);
 const sections=await loader({book:"Mark",chapter,verseStart:verse,verseEnd:verse},options);
 const section=sections?.find(x=>x.id===pointer.slice(0,pointer.lastIndexOf(":")));
 const segment=section?.segments?.[ordinal];
 if(!segment||segment.father!==record.inheritedFatherLabel||
    segment.text.length!==record.canonicalCharLength||
    (Array.isArray(section.verse_keys)&&!section.verse_keys.includes("mark/"+chapter+"/"+verse))||
    !/^https:\/\/www\.ecatholic2000\.com\//.test(section.source?.url||""))
  throw Error("CATENA_MARK_CANONICAL_SOURCE_MISMATCH");
 return Object.freeze({section,segment,ordinal,sourcePointer:pointer,
  inheritedFatherLabel:record.inheritedFatherLabel,
  publicationEligibility:"blocked_research_only"});
}
