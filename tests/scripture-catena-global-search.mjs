import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {webcrypto} from "node:crypto";
import {CATENA_LOCAL_BASE} from "../src/scripture/catena-inline.js";
import {catenaSearchTerms,indexCatenaMessages} from "../src/scripture/catena-messenger.js";
import {
 CATENA_GLOBAL_SCHEMA,CATENA_LEXICON_BASE,validateCatenaGospelLexicon,
 rankCatenaPassages,searchCatenaAcrossGospels
} from "../src/scripture/catena-global-search.js";
const gospels=["matthew","mark","luke","john"];
const index=gospels.map(g=>JSON.parse(readFileSync(new URL("../data/scripture/catena/lexicon/"+g+".v1.json",import.meta.url),"utf8")));
assert.equal(CATENA_GLOBAL_SCHEMA,"ao.catena.gospel-lexicon.v1");
assert.ok(CATENA_LEXICON_BASE.startsWith(CATENA_LOCAL_BASE));
for(const x of index)assert.equal(validateCatenaGospelLexicon(x,x.gospel),x);
assert.equal(index.reduce((a,x)=>a+x.pericopeCount,0),814);
assert.equal(index.reduce((a,x)=>a+x.fragmentCount,0),12692);
assert.throws(()=>validateCatenaGospelLexicon({...index[0],sourceCommit:"tampered"},"matthew"),/INVALID_CATENA_LEXICON/);
const forbidden=rankCatenaPassages(index,"zebrapineapplefoobar");
assert.deepEqual(forbidden,[],"Unsupported keywords must have no invented passage");
const john=index.find(x=>x.gospel==="john");
const home="catena.john.1.1";
const ranked=rankCatenaPassages(index,"Word of God",{currentPericopeIds:[home]});
assert.ok(ranked.length>0);
assert.ok(ranked.every(r=>r.id!==home),"Original selected pericope must not be presented as an elsewhere result");
const multi=rankCatenaPassages(index,"resurrection life");
assert.ok(multi.length>0,"Multi-term query must discover other relevant Gospel pericopes");
assert.ok(multi.every(r=>r.matched>=2),"Multiword discovery requires overlapping actual vocabulary");
const fetcher=async url=>{
 const u=new URL(url);
 if(u.protocol!=="file:"||!u.pathname.includes("/data/scripture/catena/"))
  throw Error("No unverified external source may be fetched");
 const raw=readFileSync(u,"utf8");
 return {ok:true,clone(){return {text:async()=>raw,json:async()=>JSON.parse(raw)}}};
};
const found=await searchCatenaAcrossGospels("resurrection",{
 currentPericopeIds:[home],fetcher,cacheStorage:null,cryptoProvider:webcrypto,limit:2
});
assert.equal(found.searched,4,"All four Gospel indices must have been checked");
assert.deepEqual(found.unavailable,[]);
assert.ok(found.results.length>0,"Cross-Gospel search returns an actual original extract");
for(const row of found.results){
 assert.ok(row.fromAnotherPassage);
 assert.ok(row.reference.startsWith("Catena Aurea, "));
 assert.ok(row.sourceUrl.startsWith("https://www.ecatholic2000.com/"));
 assert.ok(row.text.length>30);
 const pack=JSON.parse(readFileSync(new URL("../data/scripture/catena/"+row.pericopeId.split(".")[1]+".json",import.meta.url),"utf8"));
 const original=pack.pericopes.find(x=>x.id===row.pericopeId);
 assert.ok(original,"Every message points to an original source pericope");
 assert.equal(original.segments[row.ordinal-1].text,row.text,
  "Displayed text is exactly the source fragment, never a generated paraphrase");
 assert.equal(original.segments[row.ordinal-1].father,row.father);
}
const none=await searchCatenaAcrossGospels("zebrapineapplefoobar",{
 currentPericopeIds:[home],fetcher,cacheStorage:null,cryptoProvider:webcrypto
});
assert.deepEqual(none.results,[]);
assert.deepEqual(none.unavailable,[]);
assert.deepEqual(catenaSearchTerms("Why is the WORD called Word?"),["word","called"]);
assert.ok(indexCatenaMessages([{id:"unverified",citation:"Catena Aurea",source:{url:"https://evil.invalid"},
 segments:[{father:"Augustine",text:"fake"}]}]).length===0);
console.log("PASS four-Gospel concordance: 814 pericopes, 12,692 excerpts, source-hash-verified extraction, no invented Father speech");
