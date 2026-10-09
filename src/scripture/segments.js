import {scripturePassage} from "./catalogue.js";

/**
 * A cited liturgical reading can contain ordered chapter spans or omissions.
 * These are coordinates only: they never certify a Bible translation, silently
 * supply missing verses, or assign the passages to a Mass/rite state.
 */
export function scriptureSegments(segments) {
 if(!Array.isArray(segments)||segments.length<1||segments.length>24)
  throw new Error("Scripture segment list must contain 1–24 ranges");
 const accepted=[];
 for(const source of segments){
  const p=scripturePassage(source);
  const previous=accepted.at(-1);
  if(previous){
   if(p.book!==previous.book)throw new Error("One reading must retain its source biblical book");
   if(p.chapter<previous.chapter||(p.chapter===previous.chapter&&p.verseStart<=previous.verseEnd))
    throw new Error("Scripture segments must be strictly ordered and non-overlapping");
  }
  accepted.push(p);
 }
 return Object.freeze(accepted);
}
export function scriptureSegmentsReference(segments) {
 const parts=scriptureSegments(segments);
 const first=parts[0];
 return first.book+" "+parts.map(p=>p.chapter+":"+p.verseStart+
   (p.verseEnd!==p.verseStart?"–"+p.verseEnd:"")).join("; ");
}
export function scriptureSegmentContext(segments,{reference=null,provenance=null}={}) {
 const confirmed=scriptureSegments(segments);
 const canonical=scriptureSegmentsReference(confirmed);
 if(reference!=null && String(reference).trim()!==canonical)
  throw new Error("Displayed biblical citation does not match segment coordinates");
 return Object.freeze({
  reference:canonical, passage:confirmed[0],segments:confirmed,
  numbering:confirmed[0].book==="Psalms"?"SOURCE_EDITION_REQUIRED":"STANDARD_UNVERIFIED_PARALLEL",
  provenance:provenance??"EXPLICIT_SEGMENTED_CITATION"
 });
}
