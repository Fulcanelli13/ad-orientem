/*
 * Source-pinned Catena Aurea reading inside Ad Orientem.
 * Four Gospels (814 pericopes, 12,692 Father-attributed excerpts) are
 * served from this repository. Each Gospel loads lazily and can be cached
 * locally after its first successful read. No live third-party dependency.
 */
export const CATENA_SOURCE_COMMIT="efe1bd084d918a34ca22ffeef2ecf711c593b392";
export const CATENA_LOCAL_BASE=new URL("../../data/scripture/catena/",import.meta.url).href;
const BOOKS=Object.freeze({Matthew:"matthew",Mark:"mark",Luke:"luke",John:"john"});
const EXPECTED=Object.freeze({
 matthew:Object.freeze({pericopes:278,fragments:4825,sourceSha:"7c19218587120dd9cf8efb51826fca8d13bb884e"}),
 mark:Object.freeze({pericopes:104,fragments:1451,sourceSha:"efeb0ee731a0631c8d15bc1a41891a6178210272"}),
 luke:Object.freeze({pericopes:245,fragments:3660,sourceSha:"57cad8bab1624b2fc3559868513a963622eae492"}),
 john:Object.freeze({pericopes:187,fragments:2756,sourceSha:"cc99fe62a303aadfd3fcfea79429103cf80b5acd"})
});
const memory=new Map();
const URL_HOST="www.ecatholic2000.com";
const CACHE="ao-scripture-catena-local-v1";
export function isCatenaGospel(p) {
 return Boolean(p&&BOOKS[p.book]&&Number.isInteger(p.chapter)&&p.chapter>0&&
 Number.isInteger(p.verseStart)&&p.verseStart>0&&Number.isInteger(p.verseEnd)&&p.verseEnd>=p.verseStart);
}
function safeSourceUrl(value) {
 try {const u=new URL(value);return u.protocol==="https:"&&u.hostname===URL_HOST?u.href:null;}
 catch{return null;}
}
export function validateCatenaPack(packet,gospel) {
 const expected=EXPECTED[gospel],p=packet?.provenance;
 if(!expected||packet?.schema!=="ao.catena-aurea.pericopes.v1"||packet.gospel!==gospel||
  p?.commit!==CATENA_SOURCE_COMMIT||p?.origin!=="AlvaroBalbin/catena"||
  p?.originBlobSha!==expected.sourceSha||p?.license!=="public-domain"||
  !Array.isArray(packet.pericopes)||packet.pericopes.length!==expected.pericopes)
    throw new Error("Unverified local Catena Gospel pack");
 let fragments=0;const ids=new Set();
 for(const n of packet.pericopes){
   if(typeof n.id!=="string"||ids.has(n.id)||!n.id.startsWith("catena."+gospel+".")||
    typeof n.citation!=="string"||!n.citation.startsWith("Catena Aurea, ")||
    !Array.isArray(n.verse_keys)||!n.verse_keys.length||
    !n.verse_keys.every(k=>typeof k==="string"&&k.startsWith(gospel+"/"))||
    !Array.isArray(n.segments)||!n.segments.length||!safeSourceUrl(n.source_url))
      throw new Error("Unverified Catena pericope");
   ids.add(n.id);
   for(const s of n.segments){
     if(!s||typeof s.father!=="string"||!s.father.trim()||
       typeof s.text!=="string"||!s.text.trim())throw new Error("Unattributed Catena fragment");
     fragments++;
   }
 }
 if(fragments!==expected.fragments)throw new Error("Catena fragment census mismatch");
 return true;
}
export function selectCatenaPericopes(records,p) {
 if(!isCatenaGospel(p)||!Array.isArray(records))return [];
 const gospel=BOOKS[p.book],wanted=new Set();
 for(let n=p.verseStart;n<=Math.min(p.verseEnd,200);n++)wanted.add(gospel+"/"+p.chapter+"/"+n);
 return records.filter(n=>Array.isArray(n.verse_keys)&&n.verse_keys.some(k=>wanted.has(k)))
  .map(n=>Object.freeze({id:n.id,citation:n.citation,
    source:Object.freeze({url:safeSourceUrl(n.source_url)}),
    segments:Object.freeze(n.segments.map(s=>Object.freeze({father:s.father,text:s.text})))}));
}
async function fetchWithOfflineFallback(url,fetcher,cacheStorage) {
 let networkError;
 try {
   const response=await fetcher(url,{cache:"force-cache"});
   if(response?.ok){
     if(cacheStorage?.open) {
       // Cache once, after successful source validation by the caller.
       return {response,cacheStorage,url};
     }
     return {response,cacheStorage:null,url};
   }
   networkError=new Error("Catena HTTP fetch failed");
 }catch(error){networkError=error;}
 if(cacheStorage?.open){
   try {const local=await(await cacheStorage.open(CACHE)).match(url);
     if(local?.ok)return {response:local,cacheStorage:null,url};}catch{}
 }
 throw networkError||new Error("Local Catena unavailable");
}
export async function loadCatenaForPassage(p,{
 fetcher=globalThis.fetch?.bind(globalThis),
 cacheStorage=globalThis.caches
}={}) {
 if(!isCatenaGospel(p))return [];
 if(typeof fetcher!=="function")throw new Error("Catena transport unavailable");
 const gospel=BOOKS[p.book];
 if(!memory.has(gospel)){
   const loading=(async()=>{
     const url=CATENA_LOCAL_BASE+gospel+".json";
     const {response,cacheStorage:storage}=await fetchWithOfflineFallback(url,fetcher,cacheStorage);
     const payload=await response.clone().json();
     validateCatenaPack(payload,gospel);
     if(storage?.open) {
       try {const cache=await storage.open(CACHE);await cache.put(url,response);}catch{}
     }
     return payload.pericopes;
   })().catch(e=>{memory.delete(gospel);throw e;});
   memory.set(gospel,loading);
 }
 return selectCatenaPericopes(await memory.get(gospel),p);
}
