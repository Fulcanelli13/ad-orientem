import {scriptureSegmentContext} from "../scripture/segments.js";
import {VERIFIED_EXTENDED_LESSON_READINGS} from "./scripture-extended-lesson-index.js";
function normal(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replaceAll("æ","ae").replaceAll("Æ","ae").replaceAll("œ","oe").replaceAll("Œ","oe")
   .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
/**
 * For authentic source-ordered preparatory Lesson cards only. This is not an
 * index-number guess, a Proper slot fallback, or a calendar-date inference.
 */
export function extendedLessonScriptureContext(card,prepared){
 if(!card?.emberInsertion||card.emberNodeType!=="LESSON")return null;
 const resolved=prepared?.session?.resolvedMass;
 const manifest=resolved?.proper?.data??resolved?.proper;
 if(manifest?.schema!=="ao-proper-manifest-v2")return null;
 const path=manifest.sourcePath;
 const candidates=VERIFIED_EXTENDED_LESSON_READINGS.filter(x=>
   x.sourcePath===path&&x.sourceSectionId===card.sourceSectionKey);
 if(candidates.length!==1)return null;
 const row=candidates[0],sequence=manifest.preGospelSequence;
 const proof=manifest.preGospelSequenceProvenance;
 if(!Array.isArray(sequence)||proof?.orderAuthority!=="SOURCE_ORDER"||
    proof.sourcePath!==path || !Array.isArray(proof.sourceOrder))return null;
 const n=Number(card.sourceOrderIndex);
 if(!Number.isInteger(n)||n<0||n>=sequence.length||
    proof.sourceOrder[n]!==row.sourceSectionId)return null;
 const source=sequence[n];
 if(!source||source.id!==card.emberNodeId||source.sourceSectionId!==row.sourceSectionId||
    String(source.type).toUpperCase()!=="LESSON"||
    source.sourceRef!==card.sourceRef||!String(source.sourceRef).includes(path)||
    source.sourceOrderIndex!==n)return null;
 for(const label of [source.scriptureReference,source.scriptureRef,source.reference]){
  if(typeof label==="string"&&label.trim()&&label.trim()!==row.reference)return null;
 }
 const paragraphs=card.paragraphs??[];
 const latin=paragraphs.map(p=>String(p.alternate??p.latin??"")).join(" ");
 const expected=normal(row.latinIncipit);
 if(expected.length<20||!normal(latin).includes(expected))return null;
 // A fifth Ember-Saturday lesson (Daniel) is proclaimed in a different
 // verse order from the canonical Bible. Its Context is allowed only if
 // the full, distinct source moments match in the right liturgical order.
 if(row.liturgicalArrangement){
  if(row.liturgicalArrangement.schema!=="ao-liturgical-bible-verse-order-v1" ||
     row.liturgicalArrangement.canonicalReference!==row.reference||
     !row.liturgicalArrangement.noteEn||!row.liturgicalArrangement.noteFr||
     !Array.isArray(row.latinContinuityGuard)||
     row.latinContinuityGuard.length!==3)return null;
  const text=normal(latin);
  let cursor=-1;
  for(const marker of row.latinContinuityGuard){
    const i=text.indexOf(normal(marker),cursor+1);
    if(i<=cursor)return null;
    cursor=i;
  }
 }
 const citation=scriptureSegmentContext(row.segments,{
   reference:row.reference,provenance:"EXTENDED_LESSON_SOURCE_ORDER_AND_LATIN_BOUND"});
 return Object.freeze({state:"READY",...citation,role:row.role,
   ...(row.liturgicalArrangement?{liturgicalArrangement:row.liturgicalArrangement}:{}),
   sourceSectionId:row.sourceSectionId,witnessUrl:row.witnessUrl});
}
