/**
 * Read-only SOURCE CONTEXT audit. It deliberately authorizes NO source-text
 * reproduction, historical quotation, translation or 1962 Mass rubric.
 * The original 37-locus batch catalogue remains the source owner.
 */
export const MASS_FIRST10_AUDIT_SCHEMA="AO_MASS_SOURCE_FIRST10_TEXT_CONTEXT_AUDIT_V1";
const auditUrl=new URL("../../data/learn/research/mass-source-first10-transcription-context-audit-20261016.v1.json",import.meta.url);
const assert=(v,reason)=>{if(!v)throw new Error("MASS_FIRST10_AUDIT_"+reason);};
export function validateMassFirst10ContextAudit(audit,batches){
 assert(audit?.schema===MASS_FIRST10_AUDIT_SCHEMA&&audit.status===
  "TRANSCRIPTION_CONTEXT_ONLY__NO_PAGE_IMAGE_COLLATION","SCHEMA");
 assert(audit.locusCount===10&&audit.researchClaimCount===18&&
   audit.latinCriticalTextContextsLocated===2&&
   audit.originalEnglishEditionOcrContextsLocated===7&&
   audit.partialOcrContextsLocated===1&&
   audit.independentPrintedPageImageChecks===0&&
   audit.certifiedSourcePassages===0&&
   audit.editoriallyApprovedHistoricalQuotations===0&&
   audit.publicTextExcerpts===0,"PUBLICATION_GATE");
 assert(Array.isArray(audit.rows)&&audit.rows.length===10,"LOCI");
 assert(Array.isArray(audit.witnesses)&&audit.witnesses.length===2,"WITNESSES");
 const items=new Map(batches?.loci?.map(l=>[l.id,l])||[]),ids=new Set();
 let latin=0,english=0,partial=0,citations=0;
 for(const r of audit.rows){
  assert(typeof r.locusId==="string"&&!ids.has(r.locusId),"DUPLICATE");
  ids.add(r.locusId);
  const owner=items.get(r.locusId);
  if(batches)assert(owner&&r.workId===owner.workId&&
    JSON.stringify(r.claimIds)===JSON.stringify(owner.claimIds)&&
    JSON.stringify(r.momentIds)===JSON.stringify(owner.momentIds),"SOURCE_OWNER");
  assert(["LATIN_CRITICAL_TEXT_LOCATED","EARLY_ENGLISH_EDITION_OCR_LOCATED","EARLY_ENGLISH_EDITION_OCR_PARTIAL"].includes(r.witnessLevel),"WITNESS");
  assert(["MATCHED_IN_CRITICAL_DIGITAL_LATIN_TEXT","ORIGINAL_1902_BOOK_OCR_CONTEXT_LOCATED","PRIMARY_CONTEXT_LOCATED_SECONDARY_CROSS_REFERENCE_NOT_CHECKED"].includes(r.contextCheck),"CONTEXT");
  assert(typeof r.contextDescription==="string"&&r.contextDescription.length>=40&&
    typeof r.additionalHold==="string"&&r.additionalHold.length>=35,"CAUTION");
  assert(/^https:\/\//.test(r.observedAt),"SOURCE_URL");
  for(const field of ["printedPageImageInspected","originalEditionCertified",
   "claimScopePublicationApproved","originalTextReproduced","translationApproved","releaseApproved"])
   assert(r[field]===false,"RELEASE_GATES");
  if(r.witnessLevel==="LATIN_CRITICAL_TEXT_LOCATED")latin++;
  else if(r.witnessLevel==="EARLY_ENGLISH_EDITION_OCR_LOCATED")english++;
  else partial++;
  citations+=r.claimIds.length;
 }
 assert(latin===2&&english===7&&partial===1&&citations===18,"COUNTS");
 if(batches)assert(items.size===37&&[...ids].every(id=>items.has(id)),"BATCH_MATCH");
 return audit;
}
export async function loadMassFirst10ContextAudit({fetchImpl=globalThis.fetch,batches}={}){
 if(typeof fetchImpl!=="function")throw new TypeError("fetch required");
 const response=await fetchImpl(auditUrl);
 if(!response?.ok)throw new Error("Source context audit unavailable");
 return validateMassFirst10ContextAudit(await response.json(),batches);
}
export function massFirst10ContextForLocus(audit,id){
 return audit?.rows?.find(x=>x.locusId===id)||null;
}
export function massFirst10ContextSummary(audit,{french=false}={}){
 validateMassFirst10ContextAudit(audit);
 const title=french?"Vérification du contexte original":"Original source context audit";
 const trans=french?"contextes numériques identifiés":"digital text contexts located";
 const pages=french?"pages originales collationnées":"original pages collated";
 return '<div class="aoSourceContextSummary" data-ao-source-context-summary>'+
  '<strong>'+title+'</strong><p>10 / 37 '+trans+' · 0 / 37 '+pages+
  '</p><progress value="10" max="37">10 / 37</progress></div>';
}
export function massFirst10ContextStatusHtml(audit,id,{french=false}={}){
 if(!audit)return "";
 const row=massFirst10ContextForLocus(audit,id);if(!row)return "";
 const partial=row.witnessLevel==="EARLY_ENGLISH_EDITION_OCR_PARTIAL";
 const latin=row.witnessLevel==="LATIN_CRITICAL_TEXT_LOCATED";
 const label=partial?(french?"Contexte OCR partiel":"Partial OCR context"):
  latin?(french?"Texte latin localisé":"Latin text located"):
  (french?"Contexte OCR localisé":"OCR context located");
 return '<p class="aoSourceContextLocus" data-ao-source-context-locus="'+id+'">'+
  '<strong>'+label+'</strong> · '+
  (french?"Pages imprimées non vérifiées":"Printed page images unchecked")+
  '<small>'+row.target+' · '+row.textUnit+'</small>'+
  '<small>'+row.additionalHold.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</small></p>';
}
export function massFirst10ContextCss(){
 return '.aoSourceContextSummary{margin:12px 0 20px;padding:12px 0;border-top:1px solid var(--ao-rule,rgba(255,255,255,.13))}'+
 '.aoSourceContextSummary p,.aoSourceContextLocus{font:.78rem/1.5 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,#a9a5a0)}'+
 '.aoSourceContextSummary progress{display:block;width:100%;height:6px;accent-color:var(--liturgical,#c9ad78)}'+
 '.aoSourceContextLocus{margin:9px 0 13px;overflow-wrap:anywhere}'+
 '.aoSourceContextLocus>small{display:block;font-size:.73rem;margin-top:5px;overflow-wrap:anywhere}';
}
