import {CSE_CANONICAL_FAMILIES,CSE_CANONICAL_DOSSIERS,CSE_CANONICAL_DOSSIER_MAP} from "./sexual-ethics-data/canonical.js";
import {CSE_PUBLIC_QUESTION_MAP} from "./sexual-ethics-data/index.js";

/**
 * A reading path through EXISTING published questions in canonical dossier
 * order. No new doctrinal text, invented Q&A or unpublished CSE055/056/058.
 */
export function sexualEthicsStudyIds(scope,id){
 const key=String(id??"");
 let dossiers;
 if(scope==="family"){
  if(!CSE_CANONICAL_FAMILIES.some(f=>f.id===key))return Object.freeze([]);
  dossiers=CSE_CANONICAL_DOSSIERS.filter(d=>d.family===key);
 }else if(scope==="dossier"){
  const d=CSE_CANONICAL_DOSSIER_MAP[key];
  if(!d)return Object.freeze([]);
  dossiers=[d];
 }else return Object.freeze([]);
 const seen=new Set();
 const ids=[];
 for(const dossier of dossiers)for(const questionId of dossier.questionIds){
  if(!CSE_PUBLIC_QUESTION_MAP[questionId]||seen.has(questionId))continue;
  seen.add(questionId);ids.push(questionId);
 }
 return Object.freeze(ids);
}
export function sexualEthicsStudyStep(scope,id,currentId){
 const ids=sexualEthicsStudyIds(scope,id);
 const index=ids.indexOf(String(currentId??""));
 if(index<0)return null;
 return Object.freeze({
  scope,id:String(id),index,total:ids.length,currentId:ids[index],
  previousId:index>0?ids[index-1]:null,
  nextId:index<ids.length-1?ids[index+1]:null,
 });
}
