import { CATHOLIC_BOOK_IDS } from "../../src/scripture/canon.js";
const PREFIXES = Object.freeze({"I ":"1","II ":"2","III ":"3"});
const SPECIAL=Object.freeze({"Song of Solomon":"SongOfSongs","Revelation of John":"Revelation"});
const CATHOLIC=new Set(CATHOLIC_BOOK_IDS);
const HELD=new Set(["Prayer of Manasses","I Esdras","II Esdras","Additional Psalm","Laodiceans"]);
export function mapHistoricalBookName(name) {
 if(typeof name!=="string")return null;
 if(HELD.has(name))return null;
 const t=Object.entries(PREFIXES).reduce((current,[prefix,value])=>
   current.startsWith(prefix)?value+current.slice(prefix.length):current,name);
 const proposed=(SPECIAL[name]||t).replace(/\s+/g,"");
 return CATHOLIC.has(proposed)?proposed:null;
}
/** Converts Scrollmapper's named 73/78-book nested source to canonical records.
 * Output is RESEARCH-ONLY regardless of public-domain edition assertions.
 */
export function normalizeScrollmapperSource(raw,editionId,{requireCompleteCanon=true}={}){
 if(!Array.isArray(raw?.books))throw new Error("Upstream must contain books array");
 const mapped=[],held=[],seen=new Set(),issues=[];
 for(const book of raw.books) {
   const id=mapHistoricalBookName(book?.name);
   if(!id){
     held.push(String(book?.name??"<missing>"));
     if(!HELD.has(book?.name))issues.push("Unrecognized source book "+String(book?.name));
     continue;
   }
   if(seen.has(id)){issues.push("Duplicate Catholic book "+id);continue;}
   seen.add(id);
   if(!Array.isArray(book.chapters)||!book.chapters.length){issues.push(id+" chapters missing");continue;}
   const chapters=[];
   for(const ch of book.chapters){
     const chapter=ch?.chapter;
     if(!Number.isSafeInteger(chapter)||chapter<1 || !Array.isArray(ch?.verses)){
       issues.push(id+" malformed chapter");continue;
     }
     const verses=ch.verses.map(v=>({number:v?.verse,text:v?.text}));
     const invalid=verses.filter(v=>!Number.isSafeInteger(v.number)||v.number<1||
       typeof v.text!=="string" || !v.text.trim());
     if(!verses.length||invalid.length)issues.push(id+" "+chapter+" invalid verses "+
       JSON.stringify(invalid.slice(0,5).map(v=>({number:v.number,type:typeof v.text,length:typeof v.text==="string"?v.text.length:null}))));
     chapters.push({number:chapter,verses});
   }
   mapped.push({id,chapters});
 }
 if(requireCompleteCanon && mapped.length!==73)issues.push("Expected all 73 Catholic books, got "+mapped.length);
 if(requireCompleteCanon && seen.size!==73)issues.push("Missing Catholic IDs: "+CATHOLIC_BOOK_IDS.filter(x=>!seen.has(x)).join(", "));
 if(issues.length)throw new Error("Source conversion failed: "+issues.join("; "));
 const chapterCount=mapped.reduce((n,b)=>n+b.chapters.length,0);
 const verseCount=mapped.reduce((n,b)=>n+b.chapters.reduce((m,c)=>m+c.verses.length,0),0);
 if(requireCompleteCanon&&(chapterCount<1100||verseCount<30000))throw new Error("Incomplete source chapter/verse coverage");
 return Object.freeze({editionId,books:mapped,held,
   bookCount:mapped.length,chapterCount,verseCount,
   status:"RESEARCH_ONLY_REQUIRES_EDITION_VERSIFICATION_RIGHTS_REVIEW"});
}
