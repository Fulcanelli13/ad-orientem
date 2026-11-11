// The LIVE preview may inspect EXACT source-owned 1961 Proper references.
// Reuse the editor's established 1962 Proper-to-score registry: never
// infer a chant from an incipit, civil date alone, parish, or priest card.
import {referenceScoresForParagraph} from "./reader-inline-proper-reference.js";

const freeze=Object.freeze;
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const PROPER=new Set(["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"]);
const RESEARCH_STATUS=new Set([
 "RESEARCH_TRANSCRIPTION_NOT_MUSICALLY_CERTIFIED",
 "ARCHIVED_REFERENCE_TRANSCRIPTION_NOT_MUSICALLY_CERTIFIED",
 "ARCHIVED_GR1961_TEXT_REFERENCE_NOT_MUSICALLY_CERTIFIED"
]);
const clean=v=>String(v??"").trim();
const normalize=v=>clean(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[æœ]/gi,x=>x.toLowerCase()==="æ"?"ae":"oe")
  .toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");

/**
 * This is the reference-preview gate, NOT a Schola approval gate.
 * The source-owning native track must already exist and its current
 * paragraph must agree with the resolved Proper programme. The separate
 * registry subsequently matches the 1962 source path, date guard, Latin
 * incipit and musical role. A combined Gradual/Alleluia may yield TWO
 * references; caller must offer a manual choice, not guess which was sung.
 */
export function selectLiveHandoffProperReferences({
 schola,form,resolvedMass,itinerary,sourceGate=false,approvedScoreVisible=false
}={}){
 const track=clean(schola?.trackId),segmentId=clean(schola?.segmentId);
 if(sourceGate!==true||approvedScoreVisible===true||
    !SUNG.has(clean(form).toUpperCase())||!PROPER.has(track)||
    schola?.owner!=="R17_NATIVE_SCHOLA"||
    schola?.musicStatus!=="EXPECTED_NOT_OBSERVED"||
    schola?.composedWorkId||!segmentId||!clean(schola?.latin)||
    itinerary?.supported!==true||
    !Array.isArray(itinerary.properProgramme))return freeze([]);
 // Select a sole resolved source owner. Repeated/ambiguous source-programme
 // entries must not present a plausible score without a unique text owner.
 const owners=itinerary.properProgramme.filter(entry=>
   entry?.trackId===track&&entry.source==="THIS_MASS_RESOLVED_1962_PROPER"&&
   entry.status==="SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE"&&
   Array.isArray(entry.lines)&&entry.lines.some(line=>
     line?.id===segmentId && normalize(line.latin)===normalize(schola.latin)));
 if(owners.length!==1)return freeze([]);
 const paragraph={id:segmentId,kind:"TEXT",primary:clean(schola.latin)};
 const matches=referenceScoresForParagraph({paragraph,resolvedMass,form});
 if(!matches.length||matches.length>4)return freeze([]);
 const chosen=[];
 for(const score of matches){
   if(score?.publicScoreApproved!==false ||
      !RESEARCH_STATUS.has(score.sourceStatus)||
      !/^GREGOBASE-\d+$/.test(clean(score.id))||
      !/^https:\/\//.test(clean(score.sourceUrl))||
      typeof score.gabc!=="string" || !score.gabc.includes("%%") ||
      !/^[a-f0-9]{64}$/.test(clean(score.sha256))||
      chosen.some(item=>item.scoreId===score.id))return freeze([]);
   chosen.push(freeze({
     status:"REFERENCE_ONLY_NOT_APPROVED",
     trackId:track,sourceSegmentId:segmentId,
     scoreId:score.id,title:clean(score.incipit??score.sourceName??score.id),
     printedWitness:clean(score.folio??score.sourceName??"1961 source"),
     sourceUrl:score.sourceUrl,gabc:score.gabc,
     scoreRole:score.key,
     musicalPerformance:"NOT_OBSERVED",sourceScoreApproved:false
   }));
 }
 return freeze(chosen);
}
