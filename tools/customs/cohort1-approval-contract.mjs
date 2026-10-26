import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {calendarCustomArticle} from "../../src/calendar/customs-read-model.js";

export const COHORT_IDS=Object.freeze(["EPIP-003","CRIB-001"]);
export const REVIEW_PARTS=Object.freeze(["final_en","final_fr","final_claims","final_identity_calendar"]);
const FIELDS=["title","description","history","meaning","practice","caution","scope","occasion"];
const load=path=>JSON.parse(readFileSync(new URL("../../"+path,import.meta.url),"utf8"));
const seed=load("data/customs/customs-atlas-seed.v1.json");
const historical=load("data/customs/customs-historical-folios.v1.json");
const temporal=load("data/customs/customs-temporal-projection.v1.json");
const registered=load("data/customs/source-registry.v1.json");

export function fingerprint(id,part){
 if(!COHORT_IDS.includes(id))throw Error("Unknown cohort identity "+id);
 if(!REVIEW_PARTS.includes(part))throw Error("Unknown review part "+part);
 const article=calendarCustomArticle(id);
 const canonical=seed.customs.find(c=>c.custom_id===id);
 if(!article||!canonical)throw Error("Missing canonical Calendar article "+id);
 let material;
 if(part==="final_en"||part==="final_fr"){
  const lang=part==="final_en"?"en":"fr";
  material=Object.fromEntries(FIELDS.map(key=>[key,article[key]?.[lang]??null]));
 }else if(part==="final_claims"){
  const attestations=seed.attestations.filter(x=>x.custom_id===id);
  const folio=historical.entries.find(x=>x.custom_id===id);
  const sourceIds=[...new Set([...attestations.flatMap(a=>a.source_ids||[]),...(folio?.source_ids||[]),
   ...(article.sources||[]).map(s=>s.id),...(article.history_sources||[]).map(s=>s.id),
   ...(article.supporting_sources||[]).map(s=>s.id)])].sort();
  material={sources:sourceIds.map(key=>registered.sources.find(x=>x.id===key)||{missing:key}),
   articleSources:article.sources,historySources:article.history_sources,
   supportingSources:article.supporting_sources,history:folio,attestations,
   guardrail:canonical.guardrail};
 }else{
  material={canonical,temporal:temporal.records.find(x=>x.custom_id===id),
   occasion:article.occasion,scope:article.scope,releaseSubject:article.sourceResearchUnit,
   publicationContext:"DRAFT_BRANCH_ONLY_UNTIL_FORMALLY_AUTHORIZED"};
 }
 return createHash("sha256").update(JSON.stringify(material)).digest("hex");
}

export function validateCohortApproval(manifest){
 const errors=[];
 if(manifest?.schema!=="AO_CUSTOMS_COHORT1_FINAL_APPROVAL_V1")errors.push("Invalid approval schema");
 if(manifest?.policy?.no_ai_generated_approval!==true||manifest?.policy?.require_all_four_human_decisions_for_both_customs!==true)
  errors.push("Approval safeguards absent");
 const rows=manifest?.records;
 if(!Array.isArray(rows)||rows.length!==2)return {errors:[...errors,"Expected exactly two cohort records"],authorized:false};
 const ids=rows.map(x=>x.custom_id);
 if(new Set(ids).size!==2||COHORT_IDS.some(id=>!ids.includes(id)))errors.push("Cohort identities changed");
 let allApproved=true;
 for(const row of rows){
  if(!COHORT_IDS.includes(row.custom_id))continue;
  for(const part of REVIEW_PARTS){
   const v=row[part]||{};
   if(!["PENDING","APPROVED","CHANGES_REQUESTED"].includes(v.decision)){
    errors.push(row.custom_id+" "+part+": invalid decision");allApproved=false;continue;
   }
   if(v.decision!=="APPROVED")allApproved=false;
   if(v.decision==="PENDING"){
    for(const k of ["reviewer","reviewed_on","content_sha256","review_note"]){
     if(v[k]!==null)errors.push(row.custom_id+" "+part+": pending review cannot carry signoff");
    }
   }else{
    if(typeof v.reviewer!=="string"||v.reviewer.trim().length<3||
       /^(human editor|reviewer|chatgpt|automated|ai)$/i.test(v.reviewer.trim()))
      errors.push(row.custom_id+" "+part+": requires an actual responsible reviewer name");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(v.reviewed_on||""))
      errors.push(row.custom_id+" "+part+": invalid review date");
    if(typeof v.review_note!=="string"||v.review_note.trim().length<12)
      errors.push(row.custom_id+" "+part+": decision note missing");
    if(v.content_sha256!==fingerprint(row.custom_id,part))
      errors.push(row.custom_id+" "+part+": approval not for current content");
   }
  }
 }
 const expected=allApproved?"AUTHORIZED_FOR_MERGE":"BLOCKED_PENDING_HUMAN_REVIEW";
 if(manifest.release_decision!==expected)errors.push("Release decision must match four reviews on both customs");
 return {errors,authorized:allApproved&&errors.length===0,pending:rows.flatMap(row=>
  REVIEW_PARTS.filter(part=>row[part]?.decision!=="APPROVED").map(part=>row.custom_id+":"+part))};
}
const invoked=process.argv[1]&&fileURLToPath(import.meta.url)===fileURLToPath(new URL("file://"+process.argv[1]));
if(invoked){
 const manifest=load("data/customs/cohort1-final-approval.v1.json");
 const outcome=validateCohortApproval(manifest);
 if(process.argv.includes("--fingerprints")){
  for(const id of COHORT_IDS)for(const part of REVIEW_PARTS)console.log(id+" "+part+" "+fingerprint(id,part));
 }
 console.log("COHORT1_APPROVAL "+JSON.stringify(outcome));
 if(outcome.errors.length||process.argv.includes("--require-approval")&&!outcome.authorized)process.exitCode=1;
}
