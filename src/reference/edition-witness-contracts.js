// Canonical reference metadata guard, imported from PR #1229; no runtime reader or acquisition.\n// Shared source-text import contract. This is not a declaration that an
// external work is in the public domain: editorial clearance is independent.
export const SOURCE_TEXT_SCHEMA="AO_SOURCE_TEXT_V1";
export const SOURCE_TEXT_MANIFEST_SCHEMA="AO_SOURCE_TEXT_MANIFEST_V1";
const ALLOWED_RIGHTS=new Set(["PROJECT_AUTHORED_DEMO","REPRODUCTION_CLEARED"]);
function nonblank(value){return typeof value==="string"&&value.trim().length>0;}
export function validateSourceWork(work,{requireReproduction=false}={}){
 if(!work||typeof work!=="object")throw new TypeError("SOURCE_WORK_REQUIRED");
 if(!/^WORK-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(work.id??""))
  throw new Error("SOURCE_WORK_ID_INVALID");
 for(const field of ["title","editionId","witnessId","language"])
  if(!nonblank(work[field]))throw new Error("SOURCE_WORK_"+field.toUpperCase()+"_REQUIRED");
 if(!work.rights||typeof work.rights!=="object"||!nonblank(work.rights.status))
  throw new Error("SOURCE_WORK_RIGHTS_STATUS_REQUIRED");
 if(requireReproduction){
  if(!ALLOWED_RIGHTS.has(work.rights.status)||!nonblank(work.rights.reviewId))
   throw new Error("SOURCE_TEXT_REPRODUCTION_NOT_CLEARED");
  if(work.rights.status==="PROJECT_AUTHORED_DEMO"&&work.demoOnly!==true)
   throw new Error("SOURCE_TEXT_DEMO_CANNOT_BE_PUBLIC");
  if(work.rights.scope==="REVIEWED_EXCERPTS_ONLY"&&
   (work.rights.status!=="REPRODUCTION_CLEARED"||
    !Array.isArray(work.rights.approvedExcerpts)||!work.rights.approvedExcerpts.length))
   throw new Error("SOURCE_TEXT_EXCERPT_RIGHTS_LIST_REQUIRED");
 }
 return work;
}
export function slugLocator(text){
 const value=String(text??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
 return value||"section";
}
export function normalizePassageText(value){
 if(typeof value!=="string"||value.includes("\u0000"))throw new Error("SOURCE_TEXT_INVALID");
 const text=value.normalize("NFC").replace(/\r\n?/g,"\n").replace(/[ \t\f\n]+/g," ").trim();
 if(!text)throw new Error("SOURCE_TEXT_EMPTY_PARAGRAPH");
 return text;
}

// Limited public-domain transcription review is not clearance for a whole
// book or for another source's OCR. Enforce exact anchor + exact approved text
// both when packaging and when opening potentially forged chunks.
export function assertPassageReproductionScope(work,passages){
 if(work?.rights?.scope!=="REVIEWED_EXCERPTS_ONLY")return;
 const permitted=new Map(),entries=work.rights.approvedExcerpts;
 if(!Array.isArray(entries)||entries.length===0)throw new Error("SOURCE_TEXT_EXCERPT_RIGHTS_LIST_REQUIRED");
 for(const p of entries){
  if(!p||typeof p.anchor!=="string"||typeof p.text!=="string"||
    !/^[a-z0-9][a-z0-9._-]{0,79}$/.test(p.anchor)||!p.text.trim()||
    permitted.has(p.anchor))throw new Error("SOURCE_TEXT_EXCERPT_APPROVAL_INVALID");
  permitted.set(p.anchor,normalizePassageText(p.text));
 }
 if(!Array.isArray(passages))throw new Error("SOURCE_TEXT_EXCERPTS_REQUIRED");
 for(const p of passages){
  const anchor=typeof p.locator==="string"?p.locator.split("#").pop():null;
  if(!anchor||!permitted.has(anchor)||
    normalizePassageText(p.text)!==permitted.get(anchor))
   throw new Error("SOURCE_TEXT_OUTSIDE_APPROVED_EXCERPTS");
 }
}

export function validateSourcePageSpan(p){
 if(p?.sourcePages===undefined)return;
 const pages=p.sourcePages;
 if(!Array.isArray(pages)||pages.length<1||pages.length>12||
    typeof p.sourcePage!=="string"||p.sourcePage!==pages[0]?.url)
  throw new Error("SOURCE_SCAN_PAGE_SPAN_INVALID");
 for(let i=0;i<pages.length;i++){
  const page=pages[i];
  if(!Number.isInteger(page?.printedPage)||page.printedPage<1||
     !Number.isInteger(page?.scanPage)||page.scanPage<1||
     typeof page.url!=="string"||!page.url.startsWith("https://"))
   throw new Error("SOURCE_SCAN_PAGE_SPAN_INVALID");
  if(i&&(page.printedPage!==pages[i-1].printedPage+1||
     page.scanPage!==pages[i-1].scanPage+1))
   throw new Error("SOURCE_SCAN_PAGE_SPAN_NONCONTIGUOUS");
 }
}
