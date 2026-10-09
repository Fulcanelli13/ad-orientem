import { SCRIPTURE_EDITIONS } from "./catalogue.js";
import { CATHOLIC_BOOK_IDS } from "./canon.js";
import { buildScriptureStore } from "./passages.js";

function isReady(id) {
 const edition=SCRIPTURE_EDITIONS[id];
 return Boolean(edition?.enabled && edition.rights==="cleared");
}
const fileRoot="/data/scripture/";
async function getText(url,{fetcher,cacheStorage}){
 let response=null;
 try {
   response=await fetcher(url,{cache:"no-cache"});
   if(!response?.ok)response=null;
 }catch{}
 if(!response && cacheStorage?.open){
   const cache=await cacheStorage.open("ao-scripture-assets-v1");
   response=await cache.match(url);
 }
 if(!response)throw new Error("No approved Scripture file is available online or offline");
 return response.text();
}
async function sha256(text,cryptoProvider){
 if(!cryptoProvider?.subtle)throw new Error("Cannot validate Scripture checksum");
 const input=new TextEncoder().encode(text);
 const output=await cryptoProvider.subtle.digest("SHA-256",input);
 return Array.from(new Uint8Array(output),x=>x.toString(16).padStart(2,"0")).join("");
}
/**
 * Loads only an explicitly approved and SHA-256-bound local chapter source.
 * No external Bible website is proxied or scraped.
 */
export async function loadScriptureBook(editionId,book,{
 fetcher=globalThis.fetch,cacheStorage=globalThis.caches,cryptoProvider=globalThis.crypto
}={}){
 if(!isReady(editionId))throw new Error("Scripture edition not cleared for local display");
 if(!CATHOLIC_BOOK_IDS.includes(book))throw new Error("Invalid Catholic Scripture book ID");
 if(typeof fetcher!=="function")throw new Error("No fetch available");
 const base=fileRoot+encodeURIComponent(editionId)+"/";
 const rawManifest=await getText(base+"manifest.json",{fetcher,cacheStorage});
 const manifest=JSON.parse(rawManifest);
 const p=manifest?.provenance;
 if(manifest?.editionId!==editionId || manifest?.bookCount!==73 ||
   !p || p.rightsReview!=="approved" || p.editionReview!=="approved" ||
   p.versificationReview!=="approved" || !p.sourceUrl || !p.licenceId ||
   !p.sourceEdition || !p.reviewer || !p.reviewDate)throw new Error("Uncertified Scripture manifest");
 const entry=manifest.books?.find(x=>x.id===book);
 if(!entry || entry.file!==book+".json" || !/^[a-f0-9]{64}$/.test(entry.sha256))throw new Error("Missing Scripture book hash");
 const url=base+entry.file;
 const raw=await getText(url,{fetcher,cacheStorage});
 // Compiler hashes without its final newline.
 if(await sha256(raw.trimEnd(),cryptoProvider)!==entry.sha256)throw new Error("Scripture book checksum mismatch");
 const records=JSON.parse(raw);
 if(!Array.isArray(records) || records.length!==entry.verseCount ||
   !records.every(x=>x.editionId===editionId && x.book===book &&
     x.sourceEdition===p.sourceEdition && x.licenceId===p.licenceId && x.reviewed===true))
   throw new Error("Scripture book provenance mismatch");
 buildScriptureStore(records);
 if(cacheStorage?.open){
   const cache=await cacheStorage.open("ao-scripture-assets-v1");
   await cache.put(base+"manifest.json",new Response(rawManifest,{headers:{"Content-Type":"application/json"}}));
   await cache.put(url,new Response(raw,{headers:{"Content-Type":"application/json"}}));
 }
 return Object.freeze(records);
}
