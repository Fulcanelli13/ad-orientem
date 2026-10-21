import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {selectCatenaPericopes} from "../src/scripture/catena-inline.js";
import {LIVING_CATENA_SCHEMA,indexCatenaMessages,retrieveCatenaMessages,mountCatenaMessenger} from "../src/scripture/catena-messenger.js";
assert.equal(LIVING_CATENA_SCHEMA,"ao.catena.messenger.v1");
const packet=JSON.parse(readFileSync(new URL("../data/scripture/catena/chunks/john-01-04.json",import.meta.url),"utf8"));
const passage={book:"John",chapter:1,verseStart:1,verseEnd:1};
const sections=selectCatenaPericopes(packet.pericopes,passage);
assert.ok(sections.length>0,"John 1:1 exists in the actual Catena corpus");
const messages=indexCatenaMessages(sections);
assert.equal(messages.length,sections.reduce((n,p)=>n+p.segments.length,0),
 "No Father-attributed segment may silently disappear");
for(const section of sections){
 for(const [ordinal,seg] of section.segments.entries()){
  const msg=messages.find(m=>m.id===section.id+":"+ordinal);
  assert.ok(msg);
  assert.equal(msg.father,seg.father,"Source author label is unchanged");
  assert.equal(msg.text,seg.text,"Original Oxford/Newman words are unchanged");
  assert.equal(msg.citation,section.citation);
  assert.equal(msg.sourceUrl,section.source.url);
  assert.ok(msg.sourceUrl.startsWith("https://www.ecatholic2000.com/"));
 }
}
assert.ok(messages.some(m=>m.father==="Augustine"));
assert.ok(messages.some(m=>m.father==="Chrysostom"));
assert.ok(messages.some(m=>m.father==="Basil"));
const reason=retrieveCatenaMessages(messages,"Why is He called the Word and Reason?");
assert.ok(reason.length);
assert.ok(reason.some(m=>m.father==="Augustine"&&m.text.includes("logos")));
const human=retrieveCatenaMessages(messages,"Was this a human word?");
assert.ok(human.some(m=>m.father==="Basil"));
assert.deepEqual(retrieveCatenaMessages(messages,"What is purgatory?"),[],
 "Unsupported question must not produce simulated Church Father speech");
assert.deepEqual(retrieveCatenaMessages(messages,"why?"),[],
 "Empty generic questions must not yield invented replies");
assert.deepEqual(indexCatenaMessages([{id:"forged",citation:"forged",
 source:{url:"https://attacker.example/catena"},segments:[{father:"Augustine",text:"invented"}]}]),[],
 "No arbitrary or untrusted source can be presented as canonical");
assert.equal(mountCatenaMessenger(null,sections),null);
assert.equal(mountCatenaMessenger({},sections,{language:"fr"}),null,
 "French is not silently translated or replaced with English");
const library=readFileSync(new URL("../src/scripture/library.js",import.meta.url),"utf8");
assert.match(library,/mountCatenaMessenger\(area,nodes,\{language:lang\}\)/,
 "Canonical Scripture owner must render the real source-backed messenger");
assert.match(library,/loadCatenaForPassage\(location,\{fetcher:fetchCommentary\}\)/,
 "Keep the existing source-pinned, integrity-checked lazy loader");
console.log("PASS Living Catena messenger source parity, lexical fallback and Scripture overlay integration");
