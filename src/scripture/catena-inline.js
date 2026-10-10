/* Verbatim, Father-attributed Catena Aurea: pinned public-domain Oxford/Newman corpus. */
export const CATENA_SOURCE_COMMIT="efe1bd084d918a34ca22ffeef2ecf711c593b392";
export const CATENA_SOURCE_ROOT="https://raw.githubusercontent.com/AlvaroBalbin/catena/"+CATENA_SOURCE_COMMIT+"/data/catena/";
const BOOKS=Object.freeze({Matthew:"matthew",Mark:"mark",Luke:"luke",John:"john"});
const cache=new Map();
export function isCatenaGospel(p){
 return Boolean(p&&BOOKS[p.book]&&Number.isInteger(p.chapter)&&Number.isInteger(p.verseStart)&&Number.isInteger(p.verseEnd));
}
export function selectCatenaPericopes(records,p){
 if(!isCatenaGospel(p)||!Array.isArray(records))return [];
 const keys=new Set();
 for(let n=p.verseStart;n<=Math.min(p.verseEnd,200);n++)keys.add(BOOKS[p.book]+"/"+p.chapter+"/"+n);
 return records.filter(n=>n.work==="catena-aurea"&&n.source?.license==="public-domain"&&
   Array.isArray(n.segments)&&n.segments.some(s=>s?.father&&s?.text)&&
   Array.isArray(n.commented_verse_keys)&&n.commented_verse_keys.some(key=>keys.has(key)))
   .map(n=>Object.freeze({id:n.id,citation:n.citation,source:n.source,
     segments:Object.freeze(n.segments.filter(s=>s?.father&&s?.text).map(s=>Object.freeze({father:s.father,text:s.text})))}));
}
export async function loadCatenaForPassage(p,{fetcher=globalThis.fetch?.bind(globalThis)}={}){
 if(!isCatenaGospel(p))return [];
 if(typeof fetcher!=="function")throw new Error("Commentary transport unavailable");
 const book=BOOKS[p.book];
 if(!cache.has(book)){
   const pending=(async()=>{
     const response=await fetcher(CATENA_SOURCE_ROOT+book+".jsonl",{cache:"force-cache"});
     if(!response?.ok)throw new Error("Original Catena source unavailable");
     const raw=await response.text();
     if(raw.length>10000000)throw new Error("Unexpected Catena corpus size");
     return raw.split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
   })().catch(error=>{cache.delete(book);throw error});
   cache.set(book,pending);
 }
 return selectCatenaPericopes(await cache.get(book),p);
}
