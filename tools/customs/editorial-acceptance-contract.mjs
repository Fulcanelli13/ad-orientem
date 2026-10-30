import {createHash} from "node:crypto";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../../src/calendar/customs-read-model.js";
const COPY_FIELDS=["title","description","history","meaning","practice","caution","scope","occasion"];
export {COPY_FIELDS};
export const publishedIds=()=>[...CALENDAR_CUSTOM_ARTICLE_IDS];
export function articleFor(id){return calendarCustomArticle(id);}
export function fingerprint(id,part){
  const article=articleFor(id);
  if(!article)throw new Error("No published article: "+id);
  let material;
  if(part==="final_en"||part==="final_fr"){
    const lang=part==="final_en"?"en":"fr";
    material=Object.fromEntries(COPY_FIELDS.map(key=>[key,article[key]?.[lang]??null]));
  }else if(part==="final_claims"){
    material={copy:Object.fromEntries(COPY_FIELDS.map(key=>[key,article[key]])),
      sources:article.sources||[],historical_sources:article.history_sources||[],supporting_sources:article.supporting_sources||[]};
  }else throw new Error("Unknown review dimension: "+part);
  return createHash("sha256").update(JSON.stringify(material)).digest("hex");
}
export function validationErrors(manifest){
  const errors=[],ids=publishedIds(),publicSet=new Set(ids);
  if(manifest.schema!=="AO_CUSTOMS_FINAL_HUMAN_EDITORIAL_SIGNOFF_V1")errors.push("Wrong schema");
  if(manifest.policy?.source_retrieval_not_final_editorial_approval!==true)errors.push("Missing evidence/approval separation");
  if(!Array.isArray(manifest.records)||manifest.records.length!==ids.length)return [...errors,"Expected exactly "+ids.length+" published rows"];
  const seen=new Set();
  for(const row of manifest.records){
    const id=row.custom_id;
    if(!publicSet.has(id)||seen.has(id))errors.push(id+": unpublished or duplicate identity");
    seen.add(id);
    for(const part of ["final_en","final_fr","final_claims"]){
      const value=row[part]||{};
      if(!["PENDING","APPROVED","CHANGES_REQUESTED"].includes(value.decision))errors.push(id+": invalid "+part+" decision");
      if(value.decision==="PENDING"){
        for(const k of ["reviewer","reviewed_on","content_sha256","review_note"])if(value[k]!==null)errors.push(id+": pending "+part+" has fabricated signoff metadata");
      }else{
        if(!String(value.reviewer||"").trim()||value.reviewer==="ChatGPT"||value.reviewer==="AI")errors.push(id+": "+part+" requires real responsible reviewer");
        if(!/^\d{4}-\d{2}-\d{2}$/.test(value.reviewed_on||"")||!Number.isFinite(Date.parse(value.reviewed_on||"")))errors.push(id+": "+part+" requires review date");
        if(value.content_sha256!==fingerprint(id,part))errors.push(id+": "+part+" approval was not for current text");
        if(value.decision==="CHANGES_REQUESTED"&&!String(value.review_note||"").trim())errors.push(id+": "+part+" rejected without explanation");
      }
    }
    const approved=["final_en","final_fr","final_claims"].every(k=>row[k]?.decision==="APPROVED");
    const requiredStatus=approved?"FINAL_HUMAN_SIGNOFF_RECORDED":"BLOCKED_PENDING_HUMAN_SIGNOFF";
    if(row.final_status!==requiredStatus)errors.push(id+": incorrect derived final status");
  }
  for(const id of ids)if(!seen.has(id))errors.push("Missing published "+id);
  return errors;
}
