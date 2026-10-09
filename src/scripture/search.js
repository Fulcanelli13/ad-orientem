import { SCRIPTURE_EDITIONS } from "./catalogue.js";
import { CATHOLIC_BOOK_IDS } from "./canon.js";
/** Search locally reviewed Scripture records only; never returns generated or remote guesses. */
export function searchCertifiedScripture(records,{query="",editionId=null,limit=50}={}) {
  if(!Array.isArray(records)) throw new TypeError("Expected a Scripture record array");
  const needle=String(query).trim().toLocaleLowerCase();
  if(needle.length<2)return [];
  if(!Number.isSafeInteger(limit)||limit<1||limit>200)throw new Error("Invalid result limit");
  const results=[];
  for(const record of records) {
    if(SCRIPTURE_EDITIONS[record?.editionId]?.enabled!==true || SCRIPTURE_EDITIONS[record?.editionId]?.rights!=="cleared" ||
      record?.reviewed!==true || typeof record.text!=="string" ||
      !record.licenceId || !record.sourceEdition || !record.sourceUrl ||
      !CATHOLIC_BOOK_IDS.includes(record.book) || (editionId && record.editionId!==editionId))continue;
    if(!(record.text.toLocaleLowerCase().includes(needle) ||
      (record.book+" "+record.chapter+":"+record.verseStart).toLocaleLowerCase().includes(needle)))continue;
    results.push(Object.freeze({book:record.book,chapter:record.chapter,verseStart:record.verseStart,
      verseEnd:record.verseEnd ?? record.verseStart,editionId:record.editionId,text:record.text,sourceEdition:record.sourceEdition}));
    if(results.length===limit)break;
  }
  return results;
}
/** Book search works before any full edition has been imported. */
export function searchScriptureBooks(query) {
 const q=String(query??"").trim().toLocaleLowerCase();
 return q ? CATHOLIC_BOOK_IDS.filter(x=>x.toLocaleLowerCase().includes(q)):CATHOLIC_BOOK_IDS.slice();
}
