import {parseScriptureContext} from "../scripture/context.js";

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
  if(unique.length!==1)return Object.freeze({state:"UNRESOLVED_REFERENCE",slot:relevant.join(","),
    explanation:"The Mass Proper has no single verified Bible reference for this card."});
  return Object.freeze({state:"READY",slot:unique[0].slot,...unique[0].parsed,
    provenance:"EXPLICIT_RESOLVED_PROPER_REFERENCE"});
}
