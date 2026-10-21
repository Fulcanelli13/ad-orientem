import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {indexCatenaMessages,retrieveCatenaMessages} from "../src/scripture/catena-messenger.js";
import {catenaRelatedTopic,retrieveCatenaRelatedMessages} from "../src/scripture/catena-related-vocabulary.js";

const fixture=JSON.parse(readFileSync(
 new URL("../data/scripture/catena/editorial-challenge.v1.json",import.meta.url),"utf8"));
assert.equal(fixture.schema,"ao.catena.editorial-challenge.v1");
assert.equal(fixture.edition,"Oxford/Newman 1841–45");
assert.ok(fixture.status.includes("independent theological relevance review pending"));
assert.ok(fixture.positives.length>=35&&fixture.negatives.length>=15);
const corpus=new Map();
for(const gospel of ["mark","matthew","luke","john"]){
 const pack=JSON.parse(readFileSync(new URL("../data/scripture/catena/"+gospel+".json",import.meta.url),"utf8"));
 for(const p of pack.pericopes)corpus.set(p.id,p);
}
function rowsFor(id){
 const record=corpus.get(id);
 assert.ok(record,"Unknown canonical original pericope "+id);
 return indexCatenaMessages([{
  id:record.id,citation:record.citation,
  source:{url:record.source_url},segments:record.segments
 }]);
}
function retrieve(rows,question){
 const topic=catenaRelatedTopic(question);
 const related=topic?retrieveCatenaRelatedMessages(rows,question,{limit:4}):[];
 return related.length?related.map(x=>x.row):retrieveCatenaMessages(rows,question,{limit:4});
}
const ids=new Set(),byGospel=new Map();
const misses=[];
let topFour=0;
for(const caseFile of fixture.positives){
 assert.ok(!ids.has(caseFile.id),"Duplicate editorial challenge ID");
 ids.add(caseFile.id);
 const gospel=caseFile.pericope.split(".")[1];
 const record=corpus.get(caseFile.pericope);
 assert.ok(record,"Selected original passage does not exist: "+caseFile.id);
 assert.equal(caseFile.passage.split(" ")[0].toLowerCase(),gospel);
 const rows=rowsFor(caseFile.pericope);
 const source=rows.find(r=>r.ordinal===caseFile.sourceOrdinal);
 assert.ok(source,"Original commentary segment missing: "+caseFile.id);
 assert.equal(source.father,caseFile.father,"Original Father-attribution drift: "+caseFile.id);
 assert.ok(source.text.includes(caseFile.evidence),"Verbatim evidence missing: "+caseFile.id);
 assert.ok(record.verse_keys.some(k=>k===gospel+"/"+caseFile.passage.split(" ")[1].replace(":","/")),
  "Target Bible verse not covered by pericope: "+caseFile.id);
 const results=retrieve(rows,caseFile.question);
 const found=results.some(x=>x.id===source.id);
 const g=byGospel.get(gospel)||{total:0,hits:0};
 g.total++;
 if(found){topFour++;g.hits++}else misses.push(caseFile.id);
 byGospel.set(gospel,g);
}
for(const gospel of ["matthew","mark","luke","john"])
 assert.ok(byGospel.get(gospel)?.total>=8,"Insufficient challenge sample for "+gospel);
let falsePositives=0;
const falsePositiveIds=[];
for(const caseFile of fixture.negatives){
 assert.ok(!ids.has(caseFile.id),"Duplicate challenge or negative ID: "+caseFile.id);
 ids.add(caseFile.id);
 const source=rowsFor(caseFile.pericope);
 const results=retrieve(source,caseFile.question);
 if(results.length){falsePositives++;falsePositiveIds.push(caseFile.id)}
}
console.log("Patristic editorial challenge, top-four selected exact exemplar: "+
 topFour+"/"+fixture.positives.length+" ("+
 (100*topFour/fixture.positives.length).toFixed(1)+"%).");
for(const [g,x] of [...byGospel].sort())
 console.log("  "+g+": "+x.hits+"/"+x.total+" ("+(100*x.hits/x.total).toFixed(1)+"%)");
console.log("Missed reference exemplars: "+(misses.join(", ")||"none"));
console.log("Unsupported query false positives: "+falsePositives+"/"+fixture.negatives.length+
 " ("+(falsePositiveIds.join(", ")||"none")+")");
assert.equal(falsePositives,0,
 "Editorial safety: unsupported modern questions must never receive spurious Father messages");
assert.ok(topFour/fixture.positives.length>=0.4,
 "Expanded challenge recall fell below conservative initial 40% floor");
console.log("PASS Catena expanded editorial challenge: exact source integrity, coverage and unsupported queries");
