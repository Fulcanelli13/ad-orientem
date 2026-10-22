import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {selectCatenaPericopes} from "../src/scripture/catena-inline.js";
import {LIVING_CATENA_SCHEMA,indexCatenaMessages,retrieveCatenaMessages,suggestCatenaTopics,suggestCatenaQuestions,mountCatenaMessenger} from "../src/scripture/catena-messenger.js";
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
const topics=suggestCatenaTopics(messages);
assert.ok(topics.includes("Word")&&topics.includes("Beginning"),
  "Topic chips must refer to words actually found in the original texts");
assert.ok(!suggestCatenaTopics(messages).includes("Baptism"),
  "No arbitrary topical suggestion may appear unless grounded in the selected source");
const sourceQuestions=suggestCatenaQuestions(messages,{limit:5});
assert.ok(sourceQuestions.length>=2&&sourceQuestions.length<=5);
assert.ok(sourceQuestions.some(q=>q.topic==="Word"));
for(const q of sourceQuestions){
 assert.equal(q.kind,"source-vocabulary-navigation");
 const owner=messages.find(x=>x.id===q.sourcePointer);
 assert.ok(owner,"Every reader question must dereference an actual original source");
 assert.ok(new RegExp("\\b"+q.topic+"\\b","i").test(owner.text),
  "Reader questions may use only source-attested topic language");
 assert.ok(retrieveCatenaMessages(messages,q.lookupTerm).length>0);
 assert.ok(q.question.includes(q.topic));
}
assert.deepEqual(suggestCatenaQuestions([],{}),[],
 "No questions may be invented when an original-source passage is unavailable");
const augustine=retrieveCatenaMessages(messages,"What does Augustine say about Word?",{limit:4});
assert.ok(augustine.length>0&&augustine.every(m=>m.father==="Augustine"),
  "Explicitly asking for Augustine must not return a different Father");
const basil=retrieveCatenaMessages(messages,"Basil",{limit:4});
assert.ok(basil.length>0&&basil.every(m=>m.father==="Basil"),
  "Selecting just a Father name navigates his real excerpts");
const seen=new Set([reason[0].id]);
const unseen=retrieveCatenaMessages(messages,"Word and Reason",{limit:3,excludeIds:seen});
assert.ok(unseen.length>0&&unseen[0].id!==reason[0].id,
  "Prefer relevant unseen original excerpts in continuing dialogue");
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
assert.match(library,/mountCatenaMessenger\(area,nodes,\{language:lang,fetcher:fetchCommentary\}\)/,
 "Canonical Scripture owner must render the real source-backed messenger");
const messengerSource=readFileSync(new URL("../src/scripture/catena-messenger.js",import.meta.url),"utf8");
assert.match(messengerSource,/const questions=suggestCatenaQuestions\(rows\)/);
assert.match(messengerSource,/dataset\.catenaSourceQuestion=item\.topic/);
assert.match(messengerSource,/editorialResearchEnabled=false/);
assert.match(library,/loadCatenaForPassage\(location,\{fetcher:fetchCommentary\}\)/,
 "Keep the existing source-pinned, integrity-checked lazy loader");
console.log("PASS Living Catena messenger source parity, lexical fallback and Scripture overlay integration");
