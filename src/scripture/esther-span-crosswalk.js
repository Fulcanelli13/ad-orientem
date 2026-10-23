/**
 * Research-only, source-order Esther passage crosswalk.
 *
 * Uses the existing source-collated individual verse correspondences;
 * DOES NOT invent a new crosswalk or certify translated text.
 * A single CPDV verse can match two consecutive Challoner verses (7:14).
 * A source span can map to multiple discontiguous destination spans.
 */
import {estherParallelVerse} from "./esther-catholic-crosswalk.js";

export function estherParallelSpans(passage,fromEdition,toEdition){
 if(passage?.book!=="Esther"||
    !Number.isInteger(passage.chapter)||
    !Number.isInteger(passage.verseStart)||
    !Number.isInteger(passage.verseEnd)||
    passage.verseStart<1||passage.verseEnd<passage.verseStart||
    passage.verseEnd-passage.verseStart>=100||
    !["cpdv-2009","dr-challoner"].includes(fromEdition)||
    !["cpdv-2009","dr-challoner"].includes(toEdition))
  return null;
 if(fromEdition===toEdition)
  return Object.freeze([Object.freeze({...passage})]);
 const spans=[];
 for(let verse=passage.verseStart;verse<=passage.verseEnd;verse++){
  const mapped=estherParallelVerse({
   book:"Esther",chapter:passage.chapter,verseStart:verse,verseEnd:verse
  },fromEdition,toEdition);
  if(!mapped)return null; // Fail closed if any source verse lacks collation.
  const last=spans.at(-1);
  if(last&&last.chapter===mapped.chapter&&
     last.verseStart===mapped.verseStart&&last.verseEnd===mapped.verseEnd)
   continue; // Douay 4:12 and 4:13 both correspond to CPDV 7:14.
  if(last&&last.chapter===mapped.chapter&&mapped.verseStart===last.verseEnd+1)
   last.verseEnd=mapped.verseEnd;
  else spans.push({...mapped});
 }
 return Object.freeze(spans.map(p=>Object.freeze(p)));
}
