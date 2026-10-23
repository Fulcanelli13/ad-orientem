import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {indexCatenaMessages,retrieveCatenaQuestionMatches,catenaQuestionHasSufficientEvidence} from "../src/scripture/catena-messenger.js";
import {catenaRelatedTopic,retrieveCatenaRelatedMessages} from "../src/scripture/catena-related-vocabulary.js";

const dataset=JSON.parse(readFileSync(new URL("../data/scripture/catena/editorial-acceptance.v1.json",import.meta.url),"utf8"));
assert.equal(dataset.schema,"ao.catena.editorial-acceptance.v1");
assert.equal(dataset.edition,"Oxford/Newman 1841–45");
assert.ok(dataset.positives.length>=10&&dataset.negatives.length>=5);
const corpus=new Map();
for(const gospel of ["matthew","mark","luke","john"]){
 const pack=JSON.parse(readFileSync(new URL("../data/scripture/catena/"+gospel+".json",import.meta.url),"utf8"));
 for(const p of pack.pericopes)corpus.set(p.id,p);
}
function sourceRows(id){
 const record=corpus.get(id);
 assert.ok(record,"Pericope absent from original source: "+id);
 const sourceBook=id.split(".")[1];
 assert.ok(record.verse_keys.every(k=>k.startsWith(sourceBook+"/")));
 return indexCatenaMessages([{
  id:record.id,citation:record.citation,
  source:{url:record.source_url},segments:record.segments
 }]);
}
function retrieved(rows,question){
 return retrieveCatenaQuestionMatches(rows,question,{limit:4}).map(x=>x.id);
}
assert.equal(catenaQuestionHasSufficientEvidence("Who won the World Cup in 2026?"),false,
 "Do not use a solitary generic word to fabricate relevance in a long query");
assert.equal(catenaQuestionHasSufficientEvidence("Why do we say Our Father and not My Father?"),true,
 "Repeated subject phrase remains eligible for source lookup");
assert.equal(catenaQuestionHasSufficientEvidence("Grace"),true);
let rank4=0;
const misses=[];
for(const c of dataset.positives){
 const rows=sourceRows(c.pericope);
 const exact=rows.find(r=>r.ordinal===c.sourceOrdinal);
 assert.ok(exact,"Missing original ordinal for "+c.id);
 assert.equal(exact.father,c.father,"Original attributed author mismatch: "+c.id);
 assert.ok(exact.text.includes(c.evidence),"Original literal evidence lost: "+c.id);
 assert.ok(exact.citation.includes(c.passage.split(" ")[0]),
  "Source biblical book does not match question label: "+c.id);
 const ranking=retrieved(rows,c.question);
 if(ranking.includes(exact.id))rank4++;
 else misses.push(c.id);
}
for(const c of dataset.negatives){
 const rows=sourceRows(c.pericope);
 assert.equal(catenaRelatedTopic(c.question),null,
  "Unsupported modern question must never enter the theological synonym set");
 assert.deepEqual(retrieved(rows,c.question),[],
  "Unsupported modern question must not produce patristic messages: "+c.id);
}
const rate=rank4/dataset.positives.length;
console.log("Editorial top-four retrieval: "+rank4+"/"+dataset.positives.length+
 " ("+(100*rate).toFixed(1)+"%); missed reference exemplars: "+(misses.join(", ")||"none"));
assert.ok(rate>=.7,
 "Gold-source retrieval fell below the initial 70% benchmark; examine misses above");
console.log("PASS Catena editorial benchmark: source fidelity, topic caveats, and negative queries");
