import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {webcrypto} from "node:crypto";
import {selectCatenaPericopes,loadCatenaForPassage} from "../src/scripture/catena-inline.js";
import {catenaOwnerUnits,mountCatenaMessenger} from "../src/scripture/catena-messenger.js";
import {validateCatenaEditorialRoutes,discoverCatenaEditorialRoutes,
 parseMatthewEditorialReference,retrieveCatenaEditorialPassages} from "../src/scripture/catena-editorial-routes.js";
const raw=JSON.parse(readFileSync("data/scripture/catena/editorial-matthew-routes.v1.json","utf8"));
const catalogue=validateCatenaEditorialRoutes(raw);
assert.equal(catalogue.byPointer.size,192);
assert.equal(catalogue.data.groups.length,31);
const source=JSON.parse(readFileSync("data/scripture/catena/matthew.json","utf8"));
const pericopes=new Map(source.pericopes.map(p=>[p.id,p]));
for(const r of raw.records){
 const colon=r.sourcePointer.lastIndexOf(":");
 const section=pericopes.get(r.sourcePointer.slice(0,colon)),seg=section?.segments[Number(r.sourcePointer.slice(colon+1))];
 assert.ok(seg,"Missing canonical source pointer "+r.sourcePointer);
 assert.equal(seg.father,r.inheritedFatherLabel);
 assert.equal(seg.text.length,r.sourceCharacterCount);
 assert.deepEqual(r.verseKeys,section.verse_keys);
 assert.equal(r.humanApproved,false);
 assert.equal(r.publicationEligibility,"blocked_research_only");
}
const daily=discoverCatenaEditorialRoutes(catalogue,"What does daily bread mean?");
assert.ok(daily.some(x=>x.kind==="comparison"&&
 x.sourcePointers.includes("catena.matthew.6.11:2")&&x.sourcePointers.includes("catena.matthew.6.11:9")));
const verse=discoverCatenaEditorialRoutes(catalogue,"Matthew 6:11?");
assert.ok(verse.length>0);
assert.ok(verse.every(r=>r.sourcePointers.every(p=>
 catalogue.byPointer.get(p).verseKeys.includes("matthew/6/11"))));
assert.ok(discoverCatenaEditorialRoutes(catalogue,"",{
 currentPericopeIds:["catena.matthew.6.11"]}).length>0);
assert.deepEqual(discoverCatenaEditorialRoutes(catalogue,"smartphone World Cup 2026"),[]);
assert.deepEqual(discoverCatenaEditorialRoutes(catalogue,"smartphones receive daily bread by bluetooth"),[]);
assert.deepEqual(discoverCatenaEditorialRoutes(catalogue,"John 3:16"),[]);
assert.deepEqual(parseMatthewEditorialReference("Matthew 1:16-17").ref,
 {chapter:1,first:16,last:17});
const sourceFetch=async url=>{
 const u=new URL(url);
 if(u.protocol!=="file:"||!u.pathname.includes("/data/scripture/catena/"))
  throw Error("Unexpected non-local Catena fetch: "+url);
 const content=readFileSync(u,"utf8");
 return {ok:true,clone(){return {text:async()=>content,json:async()=>JSON.parse(content)}},
  json:async()=>JSON.parse(content)};
};
const citation=discoverCatenaEditorialRoutes(catalogue,"Matthew 6:11")[0];
const actual=await retrieveCatenaEditorialPassages(catalogue,citation,{
 fetcher:sourceFetch,cacheStorage:null,cryptoProvider:webcrypto
});
assert.ok(actual.length>0);
for(const excerpt of actual){
 const sect=pericopes.get(excerpt.pericopeId);
 assert.equal(excerpt.text,sect.segments[excerpt.ordinal-1].text);
 assert.equal(excerpt.father,sect.segments[excerpt.ordinal-1].father);
 assert.ok(excerpt.editorialResearchLead);
 assert.ok(excerpt.sourceUrl.startsWith("https://www.ecatholic2000.com/"));
}
const mixedPointers=["catena.matthew.26.26:12","catena.matthew.27.45:1"];
for(const ptr of mixedPointers){
 const colon=ptr.lastIndexOf(":"),section=pericopes.get(ptr.slice(0,colon)),s=section.segments[Number(ptr.slice(colon+1))];
 const ownership=catenaOwnerUnits({id:ptr,father:s.father,text:s.text});
 assert.equal(ownership.length,2);assert.deepEqual(ownership.map(x=>x.father),[s.father,"Pseudo-Dionysius"]);
 assert.equal(ownership.map(x=>x.originalWords).join(""),s.text);
 assert.equal(catenaOwnerUnits({id:ptr,father:s.father,text:s.text+" corruption"}),null,
  "Mixed-author source corruption must prevent publication");
}
assert.deepEqual(catenaOwnerUnits({id:"catena.matthew.1.16:1",father:"Jerome",text:"Full original"}),[
 {father:"Jerome",originalWords:"Full original"}]);
assert.equal(mountCatenaMessenger(null,[],{editorialResearchEnabled:true}),null);
const script=readFileSync("src/scripture/catena-messenger.js","utf8");
assert.match(script,/editorialResearchEnabled=false/,"Research routes must remain disabled in normal app");
assert.match(script,/EDITORIAL SOURCE LEAD.*NOT A VERIFIED ANSWER/);
assert.match(script,/catenaOwnerUnits\(r\)/);
assert.match(script,/loadCatenaEditorialRoutes/);
console.log("PASS: 192 source-backed Matthew research leads, 31 distinct comparisons, canonical loader, mixed-owner boundaries and explicit opt-in");
