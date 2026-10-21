import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createCatenaResearchRegistry,searchCatenaResearch,parseMatthewReference,loadCatenaResearchExcerpt,deriveCatenaHumanReviewQueue} from "../src/scripture/catena-research-retrieval.js";
const d="data/scripture/catena/research/full-corpus-pass-20261021/";
const read=n=>JSON.parse(readFileSync(d+n,"utf8"));
const registry=createCatenaResearchRegistry(read("matthew-reader-catalogue.v1.json"),
 read("matthew-reader-comparison-routes.v1.json"),read("matthew-index.v1.json"));
assert.equal(registry.entries.size,192);
const daily=searchCatenaResearch(registry,"What does daily bread mean?");
assert.ok(daily.some(x=>x.kind==="comparison"&&x.pointers.includes("catena.matthew.6.11:2")&&x.pointers.includes("catena.matthew.6.11:9")));
assert.ok(searchCatenaResearch(registry,"Matthew 6:11").length>0);
assert.ok(searchCatenaResearch(registry,"What does daily bread mean in Matthew 6:11?").length>0);
assert.deepEqual(searchCatenaResearch(registry,"World Cup smartphone"),[]);
assert.deepEqual(searchCatenaResearch(registry,"John 3:16"),[]);
assert.deepEqual(searchCatenaResearch(registry,"How do smartphones receive the daily bread through bluetooth?"),[]);
assert.deepEqual(parseMatthewReference("Matthew 6:11-13").reference,{chapter:6,verseStart:11,verseEnd:13});
assert.equal(parseMatthewReference("Mark 6:11").unsupportedBook,true);
const queue=deriveCatenaHumanReviewQueue(registry);
assert.equal(queue.length,30);
assert.ok(queue.every(x=>x.humanReviewStatus==="unreviewed"&&x.needs.includes("independent_second_editor")));
const p="catena.matthew.27.45:1";
const file=JSON.parse(readFileSync("data/scripture/catena/chunks/matthew-25-28.json","utf8"));
const loader=async()=>file.pericopes.filter(n=>n.id==="catena.matthew.27.45").map(n=>({
 id:n.id,citation:n.citation,source:{url:n.source_url},
 segments:n.segments.map(s=>({father:s.father,text:s.text}))
}));
const anomaly=read("matthew-batch-03-mixed-owner-anomaly.v1.json");
const result=await loadCatenaResearchExcerpt(registry,p,{loader,anomalies:[anomaly]});
assert.deepEqual(result.units.map(u=>u.printedAttribution),["Origen","Pseudo-Dionysius"]);
const sourceText=file.pericopes.find(p=>p.id==="catena.matthew.27.45").segments[1].text;
assert.equal(result.units.map(u=>u.originalWords).join(""),sourceText);
await assert.rejects(()=>loadCatenaResearchExcerpt(registry,p,{loader}),/CATENA_MIXED_OWNER_BOUNDARIES_REQUIRED/);
await assert.rejects(()=>loadCatenaResearchExcerpt(registry,p,{loader,anomalies:[{...anomaly,fullFragmentCharacterLength:1}]}),/CATENA_MIXED_OWNER_BOUNDARIES_REQUIRED/);
const corrupt=async()=>[{...file.pericopes.find(n=>n.id==="catena.matthew.27.45"),
 source:{url:"https://attacker.example/"},segments:file.pericopes.find(n=>n.id==="catena.matthew.27.45").segments}];
await assert.rejects(()=>loadCatenaResearchExcerpt(registry,p,{loader:corrupt,anomalies:[anomaly]}),/CATENA_CANONICAL_EXCERPT_MISMATCH/);
console.log("PASS: scripture-first editorial question retrieval, abstention, canonical words, mixed authorship, and pending human-review queue");
