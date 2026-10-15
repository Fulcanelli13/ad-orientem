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
// A chapter-range pack is fetched only on explicit commentary demand.
const memory=new Map();
let manifestPromise=null;
export const CATENA_CHUNK_BASE=CATENA_LOCAL_BASE+"chunks/";
const CHAPTERS=Object.freeze({matthew:28,mark:16,luke:24,john:21});
const PACK_COUNTS=Object.freeze({matthew:7,mark:4,luke:6,john:6});
const INTEGRITY="CATENA_SOURCE_INTEGRITY_MISMATCH";
const bad=()=>{throw new Error(INTEGRITY)};
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
export function validateCatenaChunkManifest(manifest){
 if(manifest?.schema!=="ao.catena-aurea.chapter-packs-manifest.v1"||
    manifest.sourceCommit!==CATENA_SOURCE_COMMIT||
    manifest.license!=="public-domain"||
    !Array.isArray(manifest.chunks)||manifest.chunks.length!==23||
    manifest.totals?.packs!==23||manifest.totals?.pericopes!==814||
    manifest.totals?.fragments!==12692)bad();
 for(const [gospel,limit] of Object.entries(CHAPTERS)){
   const book=manifest.books?.[gospel],expected=EXPECTED[gospel];
   if(book?.chapters!==limit||book.pericopes!==expected.pericopes||
     book.fragments!==expected.fragments||book.originBlobSha!==expected.sourceSha)bad();
   const rows=manifest.chunks.filter(x=>x.gospel===gospel);
   if(rows.length!==PACK_COUNTS[gospel]||
     rows.reduce((a,x)=>a+x.pericopes,0)!==expected.pericopes||
     rows.reduce((a,x)=>a+x.fragments,0)!==expected.fragments)bad();
   for(let i=0;i<rows.length;i++){
     const row=rows[i],from=1+i*4,to=from+3;
     const filename=gospel+"-"+String(from).padStart(2,"0")+"-"+String(to).padStart(2,"0")+".json";
     if(row.firstChapter!==from||row.lastChapter!==to||
       row.file!==filename||!/^[a-f0-9]{40}$/.test(row.blobSha)||
       !Number.isInteger(row.bytes)||row.bytes<1000||
       !Number.isInteger(row.pericopes)||row.pericopes<1||
       !Number.isInteger(row.fragments)||row.fragments<row.pericopes)bad();
   }
 }
 return true;
}
export function validateCatenaChapterPack(packet,gospel,row){
 const expected=EXPECTED[gospel],p=packet?.provenance;
 if(!expected||!row||packet?.schema!=="ao.catena-aurea.chapter-pack.v1"||
  packet.gospel!==gospel||packet.firstChapter!==row.firstChapter||
  packet.lastChapter!==row.lastChapter||
  p?.commit!==CATENA_SOURCE_COMMIT||p?.origin!=="AlvaroBalbin/catena"||
  p?.originBlobSha!==expected.sourceSha||p?.license!=="public-domain"||
  !Array.isArray(packet.pericopes)||packet.pericopes.length!==row.pericopes)bad();
 const ids=new Set();let count=0;
 for(const item of packet.pericopes){
  if(typeof item?.id!=="string"||!item.id.startsWith("catena."+gospel+".")||
   ids.has(item.id)||!Array.isArray(item.verse_keys)||!item.verse_keys.length||
   !item.verse_keys.every(k=>{
      const x=/^([a-z]+)\/(\d+)\/(\d+)$/.exec(String(k));
      return x?.[1]===gospel&&Number(x[2])>=row.firstChapter&&
         Number(x[2])<=Math.min(CHAPTERS[gospel],row.lastChapter)&&Number(x[3])>=1;
   })||!Array.isArray(item.segments)||!item.segments.length||
   !item.citation?.startsWith("Catena Aurea, ")||!safeSourceUrl(item.source_url))bad();
  ids.add(item.id);
  for(const seg of item.segments){
   if(typeof seg?.father!=="string"||!seg.father.trim()||
      typeof seg?.text!=="string"||!seg.text.trim())bad();
   count++;
  }
 }
 if(count!==row.fragments)bad();
 return true;
}
async function verifyGitBlob(raw,expectedSha,cryptoProvider){
 if(!cryptoProvider?.subtle||typeof TextEncoder==="undefined")bad();
 const enc=new TextEncoder(),bytes=enc.encode(raw),header=enc.encode("blob "+bytes.length+"\0");
 const input=new Uint8Array(header.length+bytes.length);
 input.set(header);input.set(bytes,header.length);
 const digest=await cryptoProvider.subtle.digest("SHA-1",input);
 const sha=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("");
 if(sha!==expectedSha)bad();
}
async function getManifest(fetcher,cacheStorage){
 if(!manifestPromise){
  manifestPromise=(async()=>{
   const url=CATENA_CHUNK_BASE+"manifest.v1.json";
   const {response,cacheStorage:storage}=await fetchWithOfflineFallback(url,fetcher,cacheStorage);
   const raw=await response.clone().text(),data=JSON.parse(raw);
   validateCatenaChunkManifest(data);
   if(storage?.open)try{await(await storage.open(CACHE)).put(url,response)}catch{}
   return data;
  })().catch(error=>{manifestPromise=null;throw error});
 }
 return manifestPromise;
}
async function legacyCachedGospel(gospel,cacheStorage){
 if(!cacheStorage?.open)return null;
 try{
  const cache=await cacheStorage.open(CACHE);
  const response=await cache.match(CATENA_LOCAL_BASE+gospel+".json");
  if(!response?.ok)return null;
  const old=await response.json();
  validateCatenaPack(old,gospel);
  return old.pericopes;
 }catch{return null}
}
/**
 * Loads and verifies only the four-chapter pack containing the requested
 * verse, retaining the Gospel-level legacy cache solely as an offline fallback.
 * Never fetches 4–6 MB of unrelated commentary for a single passage.
 */
export async function loadCatenaForPassage(p,{
 fetcher=globalThis.fetch?.bind(globalThis),
 cacheStorage=globalThis.caches,
 cryptoProvider=globalThis.crypto
}={}) {
 if(!isCatenaGospel(p))return [];
 if(typeof fetcher!=="function")throw new Error("Catena transport unavailable");
 const gospel=BOOKS[p.book],from=1+4*Math.floor((p.chapter-1)/4);
 if(p.chapter>CHAPTERS[gospel])return [];
 const key=gospel+":"+from;
 if(!memory.has(key)){
  memory.set(key,(async()=>{
   try{
    const manifest=await getManifest(fetcher,cacheStorage);
    const row=manifest.chunks.find(x=>x.gospel===gospel&&x.firstChapter===from);
    if(!row)bad();
    const url=CATENA_CHUNK_BASE+row.file;
    const {response,cacheStorage:storage}=await fetchWithOfflineFallback(url,fetcher,cacheStorage);
    const raw=await response.clone().text();
    await verifyGitBlob(raw,row.blobSha,cryptoProvider);
    const packet=JSON.parse(raw);
    validateCatenaChapterPack(packet,gospel,row);
    if(storage?.open)try{await(await storage.open(CACHE)).put(url,response)}catch{}
    return packet.pericopes;
   }catch(error){
    if(String(error?.message||"").includes(INTEGRITY))throw error;
    const legacy=await legacyCachedGospel(gospel,cacheStorage);
    if(legacy)return legacy;
    throw error;
   }
  })().catch(error=>{memory.delete(key);throw error}));
 }
 return selectCatenaPericopes(await memory.get(key),p);
}
