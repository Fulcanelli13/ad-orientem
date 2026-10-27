// Source-owned *textual* reconciliation for the 342 staged 1961 GABC candidates.
// Research only. The production DayResolver and its actual selected Proper own
// each candidate date; never infer from a calendar label, institute or old index.
// No import in src/mass/reader-* and NO six-gate musical promotion.
import {properToReaderSlots} from "../../src/mass/proper-reader-slots.js";
import {validatedPreGospelChantParts} from "../../src/mass/reader-pre-gospel-chant-source.js";
import {normalizeChantLatin} from "../../src/mass/reader-proper-chant-crosswalk.js";

export const SELECTED_1962_GREGORIAN_REVIEW_SCHEMA="ao-gr1961-342-selected-1962-proper-review-v1";
const SUPPORTED=new Set(["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"]);
const NONPRE=new Set(["INTROIT","OFFERTORY","COMMUNION"]);
const START_WORDS=8;
const asString=value=>String(value??"");
const prefixWords=value=>normalizeChantLatin(value).replace(/^(?:v|versus|verse)\s+/,"").split(" ").filter(Boolean);
const begins=(haystack,needle)=>{
  const h=prefixWords(haystack),n=prefixWords(needle).slice(0,START_WORDS);
  return n.length>=START_WORDS&&n.every((word,i)=>h[i]===word);
};
const fullPrefix=(a,b)=>begins(a,b)&&begins(b,a);
function evidenceSectionFits(chant,row,proofPart){
  if(NONPRE.has(chant.trackId)){
    return row.section===({INTROIT:"Introitus",OFFERTORY:"Offertorium",COMMUNION:"Communio"})[chant.trackId];
  }
  if(!proofPart)return false;
  const section=asString(proofPart.sourceSectionId);
  const expected=chant.officePart==="gr"?"GRADUAL":chant.officePart==="al"?"ALLELUIA":"TRACT";
  if(proofPart.kind!==expected)return false;
  return row.section===section||section==="Graduale#"+expected&&row.section==="Graduale";
}
function proofPartFor(proper,chant){
  if(!proper?.readerChantSourceProof)return null;
  let parts;
  try{parts=validatedPreGospelChantParts(proper);}catch{return null;}
  const kind=chant.officePart==="gr"?"GRADUAL":chant.officePart==="al"?"ALLELUIA":"TRACT";
  return parts?.find(part=>part.kind===kind)??null;
}
function paragraphs(mapped,track){
  const cell=mapped?.slots?.[track];
  if(cell?.status!=="READY"||!Array.isArray(cell?.data?.paragraphs))return null;
  return cell.data.paragraphs;
}
function verifyCandidate(candidate,proper,mappedEn,mappedFr){
  const track=candidate.trackId;
  if(!SUPPORTED.has(track)||candidate.tier!=="STRONG_INITIAL_TEXT")
    return {status:"TEXT_QUALITY_REVIEW",reason:"NOT_EIGHT_WORD_INITIAL_TEXT"};
  if(!candidate.evidence?.some(r=>r.path===proper.sourcePath))
    return {status:"NOT_SOURCE_SELECTED",reason:"NO_EXACT_RESOLVED_PROPER_PATH"};
  const english=paragraphs(mappedEn,track),french=paragraphs(mappedFr,track);
  if(!english?.length||!french?.length)
    return {status:"SLOT_NOT_READY",reason:"SOURCE_SELECTED_CHANT_SLOT_INCOMPLETE"};
  const pre=!NONPRE.has(track);
  const proofPart=pre?proofPartFor(proper,candidate):null;
  if(pre&&!proofPart)return {status:"SEGMENT_UNVERIFIED",reason:"NO_CERTIFIED_TRILINGUAL_PRE_GOSPEL_PART"};
  // Exactly one independently identified chant row. Sequence plus Alleluia
  // and other multi-piece containers are never assigned one speculative score.
  const latinEn=pre?proofPart.lat:english.length===1?english[0].latin:null;
  const latinFr=pre?proofPart.lat:french.length===1?french[0].latin:null;
  if(!latinEn||!latinFr||normalizeChantLatin(latinEn)!==normalizeChantLatin(latinFr))
    return {status:"COMPOSITE_OR_LANGUAGE_HOLD",reason:"MULTIPLE_CHANTS_OR_LANGUAGES_DIFFER"};
  const matches=candidate.evidence.filter(e=>e.path===proper.sourcePath&&
    e.initialWords>=START_WORDS&&evidenceSectionFits(candidate,e,proofPart)&&
    fullPrefix(latinEn,e.text));
  if(!matches.length)return {status:"TEXT_NOT_SELECTED",reason:"MATCHED_WITNESS_NOT_OPENING_OF_ACTUAL_SELECTED_SLOT"};
  return {status:"SELECTED_1962_TEXT_EVIDENCE",reason:"EXACT_SELECTED_PATH_ROLE_AND_EIGHT_WORD_LATIN_OPENING",
    sourcePath:proper.sourcePath,sourceBlobSha:matches[0].sourceBlobSha,
    chantSourceRef:proofPart?.sourceRef??proper.sourcePath,
    matchCount:matches.length};
}
export function reconcile342WithSelectedMass(ledger,actual,{date=actual?.date,language="en"}={}){
  if(ledger?.schema!=="ao-gr1961-342-source-slot-triage-v1"||
     ledger.researchOnly!==true||ledger.records?.length!==342||
     !ledger.records.every(r=>r.promoted===false))
    throw Error("GR1961_342_RESEARCH_LEDGER_REQUIRED");
  const selectedDate=asString(date),p=actual?.proper;
  const selected=p?.data??p;
  const properSource=asString(selected?.sourcePath);
  const valid=actual?.status==="ready"&&["ready","cached"].includes(asString(p?.status).toLowerCase())&&
    actual?.date===selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)&&
    properSource.length>0&&(!p.sourcePath||p.sourcePath===properSource);
  if(!valid)return Object.freeze({schema:SELECTED_1962_GREGORIAN_REVIEW_SCHEMA,date:selectedDate,
    status:"DAY_RESOLVER_NOT_READY",properSource:null,matched:Object.freeze([]),
    unresolved:Object.freeze([]),musicalApprovals:0,readerPromotions:0});
  const candidates=ledger.records.filter(r=>r.sourcePaths.includes(properSource));
  let en=null,fr=null;
  try{en=properToReaderSlots(selected,{language:"en"});
      fr=properToReaderSlots(selected,{language:"fr"});}
  catch{return Object.freeze({schema:SELECTED_1962_GREGORIAN_REVIEW_SCHEMA,date:selectedDate,
    status:"HOST_READER_SLOTS_UNAVAILABLE",properSource,matched:Object.freeze([]),
    unresolved:Object.freeze(candidates.map(r=>Object.freeze({id:r.id,status:"SLOT_PROJECTION_FAILED"}))),
    musicalApprovals:0,readerPromotions:0});}
  if(en.sourcePath!==properSource||fr.sourcePath!==properSource)
    throw Error("GR1961_342_SELECTED_SOURCE_PATH_DRIFT");
  const checks=candidates.map(c=>({id:c.id,trackId:c.trackId,
    ...verifyCandidate(c,selected,en,fr)}));
  // Two scores for the same selected textual chant are variants; retaining
  // both is evidence, but neither may auto-select without musical review.
  const grouped=new Map();
  for(const c of checks.filter(x=>x.status==="SELECTED_1962_TEXT_EVIDENCE")){
    const key=c.trackId+"|"+c.chantSourceRef;
    grouped.set(key,[...(grouped.get(key)??[]),c]);
  }
  for(const entries of grouped.values()){
    if(entries.length>1)for(const row of entries){
      row.status="AMBIGUOUS_SCORE_VARIANT";
      row.reason="MORE_THAN_ONE_SOURCE_COMPATIBLE_TRANSCRIPTION_FOR_SELECTED_CHANT";
    }
  }
  const matched=checks.filter(x=>x.status==="SELECTED_1962_TEXT_EVIDENCE"||x.status==="AMBIGUOUS_SCORE_VARIANT");
  return Object.freeze({
    schema:SELECTED_1962_GREGORIAN_REVIEW_SCHEMA,date:selectedDate,
    status:"ACTUAL_DAY_RESOLVER_RESEARCH_SCREENED",
    properSource,selectedMainId:asString(actual?.day?.main?.id)||null,
    candidatesInspected:candidates.length,
    matched:Object.freeze(matched.map(x=>Object.freeze(x))),
    unresolved:Object.freeze(checks.filter(x=>!matched.includes(x)).map(x=>Object.freeze(x))),
    musicalApprovals:0,readerPromotions:0,
    autoAssignedScore:null,actualChoirProgramme:"UNKNOWN",
  });
}
export function summarize342SelectedMassSweep(ledger,dayRows,{year}={}){
 if(ledger?.schema!=="ao-gr1961-342-source-slot-triage-v1"||!Array.isArray(dayRows))
   throw Error("GR1961_342_SWEEP_INPUT_INVALID");
 const passed=dayRows.filter(x=>x.status==="ACTUAL_DAY_RESOLVER_RESEARCH_SCREENED");
 const observations=passed.flatMap(r=>r.matched.map(m=>({id:m.id,trackId:m.trackId,
   date:r.date,properSource:r.properSource,status:m.status,reason:m.reason,sourceBlobSha:m.sourceBlobSha})));
 const unique=new Set(observations.map(x=>x.id));
 const contested=observations.filter(x=>x.status==="AMBIGUOUS_SCORE_VARIANT");
 return Object.freeze({schema:"ao-gr1961-342-selected-mass-sweep-v1",year:year??null,
   daysChecked:dayRows.length,daysSourceReady:passed.length,
   dayResolverFailures:dayRows.length-passed.length,
   sourceMatchOccurrences:observations.length,
   distinctTextMatchedCandidateIds:unique.size,
   ambiguousVariantOccurrences:contested.length,
   researchCandidatesNotObservedInSweep:ledger.records.length-unique.size,
   musicalFacsimileApprovals:0,editorialPromotions:0,
   observations:Object.freeze(observations),
   exceptions:Object.freeze(dayRows.filter(r=>r.status!=="ACTUAL_DAY_RESOLVER_RESEARCH_SCREENED").map(x=>({date:x.date,status:x.status}))),
 });
}
