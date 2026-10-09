import {parseScriptureContext} from "../scripture/context.js";
import {VERIFIED_MASS_SCRIPTURE_READINGS} from "./scripture-reading-witness-index.js";

/**
 * Fail-closed link from the selected canonical 1962 reading to supplemental
 * study. The Mass Proper, 48-card LIVE progression and its actor/gesture states
 * are not touched. Never guess a verse from the liturgical reading's wording.
 */
const SLOT_FIELDS=Object.freeze({
  GOSPEL:["gospel","GOSPEL"],
  EPISTLE_OR_LESSON:["epistle","epistleOrLesson","EPISTLE_OR_LESSON"],
});
function properOf(prepared){
  const value=prepared?.session?.resolvedMass?.proper;
  return value?.data??value??null;
}
function fromReading(reading){
  if(!reading||typeof reading!=="object")return [];
  return [reading.scriptureReference,reading.scriptureRef,reading.reference,
    reading.citation,reading.source?.scriptureReference,
    reading.source?.reference,reading.provenance?.scriptureReference,
    reading.passage?.reference,
    ...["en","fr","lat","la","vernacular"].flatMap(key=>
      typeof reading[key]==="string"
        ?reading[key].split(/\r?\n/).slice(0,12).map(line=>line.trim())
          .filter(line=>parseScriptureContext(line))
        :[])
  ].filter(value=>typeof value==="string"&&value.trim());
}
function candidateReferences(proper,slot){
  const names=SLOT_FIELDS[slot]??[];
  const candidates=[];
  for(const field of names){
    candidates.push(...fromReading(proper?.[field]));
    for(const holder of [proper?.scriptureReferences,proper?.readingReferences,proper?.references]){
      if(typeof holder?.[field]==="string")candidates.push(holder[field]);
      else candidates.push(...fromReading(holder?.[field]));
    }
  }
  return candidates;
}
const WITNESS_BY_PATH=new Map(VERIFIED_MASS_SCRIPTURE_READINGS.map(item=>[item.sourcePath,item]));
function normalizeWitnessLatin(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replaceAll("æ","ae").replaceAll("Æ","ae").replaceAll("œ","oe")
   .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
function readingForSlot(proper,slot){
 return (SLOT_FIELDS[slot]??[]).map(field=>proper?.[field])
   .find(value=>value&&typeof value==="object"&&(typeof value.lat==="string"||typeof value.la==="string"))??null;
}
/** An explicit, primary text-bound source witness; never a date-based default. */
export function registeredMassReading(proper,slot,{sourcePath=null}={}){
 const path=String(sourcePath??proper?.sourcePath??"").trim();
 const witness=WITNESS_BY_PATH.get(path);
 const spec=witness?.readings?.[slot],reading=readingForSlot(proper,slot);
 if(!spec||!reading)return null;
 const latin=normalizeWitnessLatin(reading.lat??reading.la);
 const expected=normalizeWitnessLatin(spec.latinIncipit);
 if(expected.length<10||!latin.includes(expected))return null;
 const parsed=parseScriptureContext(spec.reference);
 return parsed?Object.freeze({...parsed,slot,witnessUrl:witness.witnessUrl,
   provenance:"MATCHED_1962_PROPER_PATH_AND_LATIN_INCIPIT"}):null;
}
function sameCoordinates(first,second){
 return first?.book===second?.book&&first?.chapter===second?.chapter&&
   first?.verseStart===second?.verseStart&&first?.verseEnd===second?.verseEnd;
}
export function massScriptureContextForCard(card,prepared){
  const slots=[...new Set((card?.blocks??[]).map(b=>String(b?.properSlot??"")))];
  const relevant=slots.filter(slot=>Object.hasOwn(SLOT_FIELDS,slot));
  if(!relevant.length)return null;
  const proper=properOf(prepared);
  const matched=relevant.flatMap(slot=>candidateReferences(proper,slot)
    .map(label=>({slot,parsed:parseScriptureContext(label)}))
    .filter(entry=>entry.parsed));
  const unique=[...new Map(matched.map(row=>[
    [row.slot,row.parsed.passage.book,row.parsed.passage.chapter,row.parsed.passage.verseStart,row.parsed.passage.verseEnd].join(":"),
    row
  ])).values()];
  const path=String(prepared?.session?.resolvedMass?.proper?.sourcePath??proper?.sourcePath??"").trim();
  const candidates=relevant.map(slot=>registeredMassReading(proper,slot,{sourcePath:path})).filter(Boolean);
  const explicitLabels=relevant.flatMap(slot=>candidateReferences(proper,slot));
  if(unique.length>1 || candidates.length>1 ||
    (unique.length===0 && explicitLabels.length>0) ||
    (unique.length===1 && candidates.length===1 &&
      !sameCoordinates(unique[0].parsed.passage,candidates[0].passage))){
    return Object.freeze({state:"UNRESOLVED_REFERENCE",slot:relevant.join(","),
      explanation:"Conflicting or unrecognized explicit citations; study reference withheld."});
  }
  if(unique.length===1)return Object.freeze({state:"READY",slot:unique[0].slot,...unique[0].parsed,
    provenance:"EXPLICIT_RESOLVED_PROPER_REFERENCE"});
  if(candidates.length===1)return Object.freeze({state:"READY",...candidates[0]});
  return Object.freeze({state:"UNRESOLVED_REFERENCE",slot:relevant.join(","),
    explanation:"No matching verified source and Latin incipit for this reading."});
}
