import { SCRIPTURE_EDITIONS } from "./catalogue.js";
const CACHE="ao-scripture-certified-v1";
function approved(pack) {
 const edition=SCRIPTURE_EDITIONS[pack?.editionId];
 return Boolean(edition?.enabled && edition?.rights==="cleared" &&
   pack?.editionId===edition.id && pack?.provenance?.reviewed===true &&
   typeof pack.provenance.licenceId==="string" && pack.provenance.licenceId.length>0 &&
   typeof pack.provenance.sourceEdition==="string" && pack.provenance.sourceEdition.length>0 &&
   typeof pack.provenance.sourceUrl==="string" && pack.provenance.sourceUrl.length>0 &&
   Array.isArray(pack.records) && pack.records.length>0 &&
   pack.records.every(r=>r.editionId===pack.editionId && r.reviewed===true &&
     r.sourceEdition===pack.provenance.sourceEdition && r.licenceId===pack.provenance.licenceId));
}
/** Save *already cleared* text for offline lookup, not external links or unreviewed snippets. */
export async function cacheApprovedScripturePack(pack,{cacheStorage=globalThis.caches}={}) {
 if(!approved(pack))throw new Error("Scripture offline pack not certified or rights-cleared");
 if(!cacheStorage?.open)throw new Error("Offline CacheStorage unavailable");
 const key="/__ao_scripture_cache__/"+encodeURIComponent(pack.editionId)+"/"+encodeURIComponent(pack.id||"default");
 const cache=await cacheStorage.open(CACHE);
 await cache.put(key,new Response(JSON.stringify(pack),{headers:{"Content-Type":"application/json"}}));
 return key;
}
export async function readOfflineScripturePack(key,{cacheStorage=globalThis.caches}={}) {
 if(typeof key!=="string" || !key.startsWith("/__ao_scripture_cache__/"))throw new Error("Invalid cache key");
 const cache=await cacheStorage?.open?.(CACHE);
 const result=await cache?.match?.(key);
 if(!result)return null;
 const pack=await result.json();
 if(!approved(pack))throw new Error("Cached Scripture pack no longer authorised");
 return pack;
}
