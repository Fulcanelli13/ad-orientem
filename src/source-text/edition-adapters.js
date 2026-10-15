// Edition-locked preparation of editorially selected source extracts.
// Input is an inspected local extract, never raw scraped web HTML or OCR.
// Review records are supplied by the owning editorial pipeline; this module
// validates their identity, but cannot itself grant copyright permission.
import {validateSourceWork} from "./contracts.js";
import {parsePlainSource,parseCleanHtmlSource} from "./parse.js";
const ADAPTERS=new Set(["numbered-paragraphs-v1","anchored-clean-html-v1","reviewed-plain-sections-v1"]);
const ANCHOR=/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const nonblank=x=>typeof x==="string"&&x.trim().length>0;
const escapeHtml=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
 .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function prepareNumbered(input){
 const rows=input.replace(/\r\n?/g,"\n").split("\n"),out=[];
 let headings=0,paragraphs=0;
 for(const raw of rows){
  const row=raw.trim();
  if(!row)continue;
  const h=row.match(/^(#{1,3})[ \t]+(.+)$/);
  if(h){
   headings++;out.push("<h"+h[1].length+">"+escapeHtml(h[2])+"</h"+h[1].length+">");
   continue;
  }
  const p=row.match(/^\[([A-Za-z0-9][A-Za-z0-9._-]{0,79})\][ \t]+(.+)$/);
  if(!p)throw new Error("SOURCE_EDITION_NUMBERED_LINE_INVALID");
  if(!ANCHOR.test(p[1]))throw new Error("SOURCE_EDITION_ANCHOR_INVALID");
  paragraphs++;out.push('<p data-source-anchor="'+p[1]+'">'+escapeHtml(p[2])+"</p>");
 }
 if(!headings||!paragraphs)throw new Error("SOURCE_EDITION_NUMBERED_STRUCTURE_REQUIRED");
 return "<article>"+out.join("")+"</article>";
}
function requireAnchoredHtml(input){
 const opening=[...input.matchAll(/<(p|li|blockquote)\b([^<>]*)>/gi)];
 if(!opening.length)throw new Error("SOURCE_EDITION_ANCHORED_PASSAGES_REQUIRED");
 for(const [,tag,attrs] of opening){
  if(!/\bdata-source-anchor\s*=\s*["'][a-zA-Z0-9][a-zA-Z0-9._-]{0,79}["']/i.test(attrs))
   throw new Error("SOURCE_EDITION_ANCHOR_REQUIRED");
 }
 return input;
}
export function extractReviewedEdition({work,review,sourceText}={}){
 validateSourceWork(work,{requireReproduction:true});
 if(!review||typeof review!=="object"||!ADAPTERS.has(review.adapter)||
    !nonblank(review.sourceDocumentId)||!nonblank(review.collationReviewId)||
    review.workId!==work.id||review.editionId!==work.editionId||
    review.witnessId!==work.witnessId||review.reproductionReviewId!==work.rights.reviewId)
  throw new Error("SOURCE_EDITION_REVIEW_IDENTITY_REQUIRED");
 if(typeof sourceText!=="string"||!sourceText.trim())
  throw new Error("SOURCE_EDITION_INPUT_REQUIRED");
 if(review.adapter==="numbered-paragraphs-v1")
  return parseCleanHtmlSource(work,prepareNumbered(sourceText));
 if(review.adapter==="anchored-clean-html-v1")
  return parseCleanHtmlSource(work,requireAnchoredHtml(sourceText));
 if(review.locatorStability!=="ORDINAL_REVIEWED")
  throw new Error("SOURCE_EDITION_ORDINAL_LOCATOR_REVIEW_REQUIRED");
 return parsePlainSource(work,sourceText);
}
