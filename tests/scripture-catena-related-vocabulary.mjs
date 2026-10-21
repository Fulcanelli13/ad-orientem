import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {webcrypto} from "node:crypto";
import {selectCatenaPericopes} from "../src/scripture/catena-inline.js";
import {indexCatenaMessages} from "../src/scripture/catena-messenger.js";
import {
 CATENA_TOPICS_SCHEMA,CATENA_RELATED_TOPICS,catenaRelatedTopic,
 catenaTopicEvidence,retrieveCatenaRelatedMessages
} from "../src/scripture/catena-related-vocabulary.js";
import {
 rankCatenaRelatedPassages,searchCatenaAcrossGospels
} from "../src/scripture/catena-global-search.js";

assert.equal(CATENA_TOPICS_SCHEMA,"ao.catena.related-vocabulary.v1");
assert.equal(CATENA_RELATED_TOPICS.length,6);
assert.equal(new Set(CATENA_RELATED_TOPICS.map(t=>t.id)).size,6);
for(const topic of CATENA_RELATED_TOPICS){
 assert.ok(topic.probes.length&&topic.evidence.length);
 assert.ok(topic.probes.every(p=>/^[a-z]{4,}$/.test(p)));
 assert.equal(catenaRelatedTopic(topic.label.toLowerCase())?.id,topic.id,
   "Every approved topic label must be a usable research question");
}
assert.equal(catenaRelatedTopic("Did Christ exist before creation?")?.id,"preexistence");
assert.equal(catenaRelatedTopic("Is Christ eternal?")?.id,"preexistence");
assert.equal(catenaRelatedTopic("Who is the Holy Ghost?")?.id,"holy-spirit");
assert.equal(catenaRelatedTopic("Does charity always mean love?"),null,
 "Do not introduce unreviewed theological equivalence");
assert.equal(catenaRelatedTopic("Explain purgatory"),null);
assert.equal(catenaRelatedTopic("resurrection".repeat(50)),null,
 "Unbounded user text must not trigger concept expansion");

const john=JSON.parse(readFileSync(new URL("../data/scripture/catena/chunks/john-01-04.json",import.meta.url),"utf8"));
const verses=selectCatenaPericopes(john.pericopes,{book:"John",chapter:1,verseStart:1,verseEnd:1});
const original=indexCatenaMessages(verses);
const related=retrieveCatenaRelatedMessages(original,"Did Christ exist before creation?",{limit:4});
assert.ok(related.length,"John 1:1 includes source-grounded discussion of eternity");
for(const hit of related){
 assert.ok(original.some(row=>row.id===hit.row.id&&row.text===hit.row.text),
  "Retrieval may select, but never rewrite, source excerpts");
 assert.equal(hit.evidence.status,"RELATED_SOURCE_WORDING_NOT_AN_ANSWER");
 assert.ok(hit.row.text.includes(hit.evidence.sourcePhrase),
  "Source evidence must literally occur in the attributed fragment");
}
assert.deepEqual(retrieveCatenaRelatedMessages(original,"Tell me about purgatory"),[]);
assert.equal(catenaTopicEvidence(catenaRelatedTopic("Holy Ghost"),
 "He spoke of a ghost in a tomb"),null,
 "Generic language does not prove a Holy Spirit passage");
assert.equal(catenaTopicEvidence(catenaRelatedTopic("Did Christ exist before creation?"),
 "Before dinner, there was no wine"),null,
 "Incidental uses of 'before' are not qualifying evidence");

const gospels=["matthew","mark","luke","john"];
const indexes=gospels.map(g=>JSON.parse(readFileSync(new URL("../data/scripture/catena/lexicon/"+g+".v1.json",import.meta.url),"utf8")));
const ranked=rankCatenaRelatedPassages(indexes,"Did Christ exist before creation?",{
 currentPericopeIds:["catena.john.1.1"]
});
assert.ok(ranked.length>0);
assert.ok(!ranked.some(p=>p.id==="catena.john.1.1"));
assert.deepEqual(rankCatenaRelatedPassages(indexes,"What is purgatory?"),[]);

const fetcher=async url=>{
 const u=new URL(url);
 if(u.protocol!=="file:"||!u.pathname.includes("/data/scripture/catena/"))throw Error("unverified url");
 const raw=readFileSync(u,"utf8");
 return {ok:true,clone(){return {text:async()=>raw,json:async()=>JSON.parse(raw)}}};
};
const search=await searchCatenaAcrossGospels("Did Christ exist before creation?",{
 currentPericopeIds:["catena.john.1.1"],fetcher,cacheStorage:null,cryptoProvider:webcrypto,limit:2
});
assert.equal(search.searched,4);
assert.deepEqual(search.unavailable,[]);
assert.ok(search.results.length>0,"Related query locates original words in other Gospel commentaries");
const preexistence=catenaRelatedTopic("Did Christ exist before creation?");
for(const row of search.results){
 assert.ok(row.fromAnotherPassage);
 assert.ok(row.sourceUrl.startsWith("https://www.ecatholic2000.com/"));
 assert.equal(row.relatedSourceEvidence?.status,"RELATED_SOURCE_WORDING_NOT_AN_ANSWER");
 assert.ok(catenaTopicEvidence(preexistence,row.text));
 const gospel=row.pericopeId.split(".")[1];
 const pack=JSON.parse(readFileSync(new URL("../data/scripture/catena/"+gospel+".json",import.meta.url),"utf8"));
 const p=pack.pericopes.find(p=>p.id===row.pericopeId);
 assert.ok(p);
 assert.equal(p.segments[row.ordinal-1].text,row.text,
  "Cross-Gospel related hit is not paraphrased or interpolated");
}
const absent=await searchCatenaAcrossGospels("unrelatedzebraphrase",{
 currentPericopeIds:["catena.john.1.1"],fetcher,cacheStorage:null,cryptoProvider:webcrypto
});
assert.deepEqual(absent.results,[]);
console.log("PASS Living Catena related vocabulary: six bounded topics, literal source evidence, original-text-only cross-Gospel messages");
