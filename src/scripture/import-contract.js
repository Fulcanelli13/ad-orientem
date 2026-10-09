import { CATHOLIC_BOOK_IDS } from "./canon.js";
import { SCRIPTURE_EDITIONS } from "./catalogue.js";

/**
 * Accepts only an explicitly normalised source; no guessed book or verse
 * crosswalk, and no automatically upgraded editorial/licensing assertions.
 * Input {editionId, provenance, books:[{id, chapters:[{number, verses:[{number,text}]}]}]}
 */
export function validateScriptureImport(input,{requireCompleteCanon=true}={}){
 const failures=[], ids=new Set(), verses=[];
 const edition=SCRIPTURE_EDITIONS[input?.editionId];
 if(!edition)failures.push("Unknown Catholic edition");
 const provenance=input?.provenance;
 if(!provenance || provenance.rightsReview!=="approved" ||
   provenance.versificationReview!=="approved" || provenance.editionReview!=="approved" ||
   !provenance.sourceUrl || !provenance.sourceEdition || !provenance.licenceId ||
   !provenance.reviewer || !provenance.reviewDate)failures.push("Source, numbering, rights or human editorial clearance missing");
 if(!Array.isArray(input?.books))failures.push("Books array missing");
 for(const book of Array.isArray(input?.books)?input.books:[]){
   if(!CATHOLIC_BOOK_IDS.includes(book?.id)||ids.has(book.id)){
     failures.push("Unknown or repeated book "+String(book?.id));continue;
   }
   ids.add(book.id);
   if(!Array.isArray(book.chapters)||!book.chapters.length){
     failures.push(book.id+" has no chapters");continue;
   }
   const chapters=new Set();
   for(const chapter of book.chapters){
     if(!Number.isSafeInteger(chapter?.number)||chapter.number<1||chapters.has(chapter.number)){
       failures.push(book.id+" invalid chapter");continue;
     }
     chapters.add(chapter.number);
     if(!Array.isArray(chapter.verses)||!chapter.verses.length){
       failures.push(book.id+" "+chapter.number+" has no verses");continue;
     }
     const numbers=new Set();
     for(const verse of chapter.verses){
       if(!Number.isSafeInteger(verse?.number)||verse.number<1||numbers.has(verse.number)||
         typeof verse.text!=="string"||!verse.text.trim()){
         failures.push(book.id+" "+chapter.number+" invalid verse");continue;
       }
       numbers.add(verse.number);
       verses.push(Object.freeze({
         editionId:input.editionId,book:book.id,chapter:chapter.number,
         verseStart:verse.number,verseEnd:verse.number,text:verse.text.trim(),
         reviewed:true,sourceUrl:provenance.sourceUrl,
         sourceEdition:provenance.sourceEdition,licenceId:provenance.licenceId
       }));
     }
   }
   if(Math.max(...chapters)!==chapters.size)failures.push(book.id+" chapter sequence has gaps");
 }
 if(requireCompleteCanon&&ids.size!==73)failures.push("Incomplete Catholic canon: "+ids.size+"/73 books");
 return Object.freeze({
   valid:failures.length===0,
   bookCount:ids.size,verseCount:verses.length,
   failures:Object.freeze(failures),
   records:Object.freeze(failures.length?[]:verses)
 });
}
