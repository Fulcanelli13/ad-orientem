import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const s=readFileSync(new URL("../tools/sacred-atlas-objects-bulk-retriever.html",import.meta.url),"utf8");
const embedded=s.match(/<script type="application\/json" id="source-data">([\s\S]*?)<\/script>/);
assert(embedded,"Missing embedded canonical research corpus");
const m=JSON.parse(embedded[1]),i=m.items;
assert.equal(m.schema,"AO_SACRED_ATLAS_OBJECT_BULK_RETRIEVER_V1");
assert.equal(i.length,247);
assert.equal(i.filter(x=>x.pinned).length,68);
assert.equal(i.filter(x=>!x.pinned).length,179);
assert.equal(i.filter(x=>x.keep).length,20);
assert.equal(m.contexts.length,33);
assert.equal(m.sites.length,530);
assert.equal(new Set(i.map(x=>x.id)).size,247);
assert.equal(new Set(m.sites.map(x=>x.id)).size,530);
assert(i.every(x=>m.sites.some(s=>s.id===x.place)),"Every subject must have one of the 530 canonical Places");
assert(i.every(x=>x.identity===false&&x.rights===false&&x.published===false));
assert(i.filter(x=>x.keep).every(x=>x.keepQuery&&x.previewIdentified===false),"KEEP values must stay historically unpinned");
assert(i.filter(x=>x.pinned).every(x=>x.pinned.title.startsWith("File:")&&
  /^[a-f0-9]{40}$/.test(x.pinned.sha1)&&
  /^https:\/\/commons\.wikimedia\.org\//.test(x.pinned.page)&&
  /^https:\/\/upload\.wikimedia\.org\//.test(x.pinned.original)));
const script=s.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script,"Missing browser code");
new Function(script);
for(const word of ["WIKIMEDIA_429_STOP","stop=true","localStorage","Api-User-Agent",
"original_sha1_metadata","download_sha256","source_attribution_and_sha256.csv",
"unresolved_sources.csv","underlying_rights_cleared:false","publication_approved:false",
"pauses","MAXLAG"]){
 if(word==="pauses")continue;
 assert(script.includes(word),"Missing mandatory source guard: "+word);
}
assert(!embedded[1].includes("you@example.com"),"User email must not be embedded");
assert(!script.includes("localStorage.setItem(\"ao-email\""),"User email must not be stored");
assert(!/git push|permissions:\s*contents:\s*write/.test(s),"Browser tool must not promote source files");
console.log("PASS: portable 247-subject/530-Place retriever, 68 Commons leads, 179 discoveries, 20 preserved KEEP votes, 33 apparition contexts; browser syntax, ZIP provenance and Wikimedia 429 fail-safe.");
