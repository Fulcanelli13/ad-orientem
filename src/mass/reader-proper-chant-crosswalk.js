// Text-and-slot evidence gate for Gregorian Proper scores. One local
// catalogued Christmas-in-die set is a pilot, NOT a calendar lookup.
// The *actual resolved* 1962 Proper owns the text. No guessed feast,
// commemoration, missing-source fallbacks or performance confirmation.
import {CHRISTMAS_DAY_PROPER_SCORES_1961} from "./reader-christmas-proper-scores-1961.js";
import {PENT21_PROPER_SCORES_1961} from "./reader-pent21-proper-scores-1961.js";
const PROPER_1961_REFERENCE_CATALOGUE=Object.freeze([
  ...CHRISTMAS_DAY_PROPER_SCORES_1961,...PENT21_PROPER_SCORES_1961,
]);

export const PROPER_CHANT_SOURCE_SCHEMA="ao-reader-proper-chant-crosswalk-v1";
const ALLOWED=new Set(["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"]);
export function normalizeChantLatin(value){
  return String(value??"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[⁂†℣℟*]/g," ").replace(/[^a-zA-Z]+/g," ").trim().toLowerCase()
    .replace(/\s+/g," ");
}
function sourceEnvelopeFor(mapped,trackId){
  const item=mapped?.slots?.[trackId];
  if(item?.status!=="READY")return null;
  const rows=item?.data?.paragraphs;
  if(!Array.isArray(rows)||rows.length===0)return null;
  const latin=rows.map(row=>String(row?.latin??row?.lat??"").trim()).filter(Boolean);
  if(!latin.length)return null;
  // Multiple pre-Gospel independent chants may share one container; never
  // attach a single GABC to an ambiguous multiple-piece sequence.
  if(trackId==="ALLELUIA_TRACT_SEQUENCE" && latin.length>1){
    const other=latin.slice(1).some(value=>
      !/^(?:alleluia|alleluja|v\.?|versus)\.?\s*$/i.test(normalizeChantLatin(value)));
    if(other)return null;
  }
  return latin.join(" ");
}
export function matchSourceOwnedProperScores(mapped,{catalogue=PROPER_1961_REFERENCE_CATALOGUE}={}){
  const path=String(mapped?.sourcePath??"").trim();
  if(mapped?.schema!=="ao-reader-proper-slots-v1"||!path)
    return Object.freeze({schema:PROPER_CHANT_SOURCE_SCHEMA,sourcePath:path||null,status:"SOURCE_UNREADY",
      candidates:Object.freeze([]),matchedTracks:Object.freeze([])});
  const selected=[];
  for(const track of ALLOWED){
    const latin=sourceEnvelopeFor(mapped,track);
    if(!latin)continue;
    const normalized=normalizeChantLatin(latin);
    const matches=catalogue.filter(record=>{
      if(record.trackId!==track||!record.gabc?.includes("%%"))return false;
      if(record.sourcePathAllowlist?.length && !record.sourcePathAllowlist.includes(path))return false;
      const witness=normalizeChantLatin(record.incipit);
      if(!witness||witness.split(" ").length<3)return false;
      // Allow only a short head rubric/Alleluia intonation before the
      // verified incipit; never accept a chant buried later in a composite.
      const at=normalized.indexOf(witness);
      return at>=0&&at<= (track==="ALLELUIA_TRACT_SEQUENCE"?80:35) &&
        (at===0||normalized[at-1]===" ");
    });
    if(matches.length===1){
      const row=matches[0];
      selected.push(Object.freeze({trackId:track,scoreId:row.id,
        title:row.title,sourcePath:path,
        matchBasis:"RESOLVED_1962_PROPER_SLOT_LATIN_INCIPIT_AND_1961_EDITION",
        certainty:"TEXT_MATCH_NOT_LOCAL_CHANT_OBSERVED"}));
    }
  }
  return Object.freeze({
    schema:PROPER_CHANT_SOURCE_SCHEMA,sourcePath:path,
    status:selected.length?"PARTIALLY_MATCHED":"NO_SOURCE_MATCH",
    candidates:Object.freeze(selected),
    matchedTracks:Object.freeze(selected.map(c=>c.trackId)),
  });
}
// Binding a source record to a Schola track does not imply it was performed.
export function scoreForSourceOwnedProperTrack(crosswalk,trackId){
  if(crosswalk?.schema!==PROPER_CHANT_SOURCE_SCHEMA ||
     crosswalk?.status!=="PARTIALLY_MATCHED")return null;
  const candidate=crosswalk.candidates?.find(row=>row.trackId===trackId);
  if(!candidate)return null;
  return PROPER_1961_REFERENCE_CATALOGUE.find(record=>
    record.trackId===trackId&&record.id===candidate.scoreId)??null;
}
