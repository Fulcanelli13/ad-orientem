import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
const output="dist/catena-mark-blind-review-offline.html";
const logged=JSON.parse(execFileSync(process.execPath,
 ["tools/scripture/build-catena-mark-blind-offline.mjs","--output",output],
 {encoding:"utf8"}));
assert.equal(logged.cases,23);
assert.ok(logged.excerptCount>=1);
const html=readFileSync(output,"utf8");
const match=/<script type="application\/json" id="catenaPacket">([\s\S]*?)<\/script>/.exec(html);
assert.ok(match,"Missing self-contained canonical payload");
const packet=JSON.parse(match[1]);
const cases=JSON.parse(readFileSync("data/scripture/catena/editorial-mark-blind-cases.v1.json","utf8"));
assert.equal(packet.schema,"ao.catena.mark-offline-blind-packet.v1");
assert.equal(packet.sourceResearchCommit,cases.sourceResearchCommit);
assert.equal(packet.publicationApproval,false);
assert.equal(packet.cases.length,23);
assert.equal(packet.fullPericopeContextIsNotRetrievedAnswer,true);
assert.ok(Object.keys(packet.contexts).length>=8);
assert.deepEqual(packet.cases.map(x=>x.id),cases.cases.map(x=>x.id));
assert.deepEqual(packet.cases.map(x=>x.question),cases.cases.map(x=>x.question));
assert.equal(logged.excerptCount,packet.cases.reduce((n,c)=>n+c.results.length,0));
assert.ok(!html.includes("contextualGradeAIAssessment")&&
 !html.includes("negativeExpected")&&
 !html.includes("editorial-mark-ai-adjudication"));
assert.ok(!html.includes("__CATENA_MARK_BLIND_PAYLOAD__"));
assert.ok(!/<script\b[^>]*\bsrc\s*=/i.test(html));
assert.ok(!/<link\b[^>]*\brel\s*=\s*["']stylesheet/i.test(html));
assert.equal((html.match(/id="catenaPacket"/g)||[]).length,1);
for(const c of packet.cases){
 assert.ok(c.results.length<=4);
 const context=packet.contexts[c.contextPericopeId];
 assert.ok(context&&Array.isArray(context.segments)&&context.segments.length>=1,
  "Every blind case needs original pericope context to assess missed answers");
 assert.match(context.sourceUrl,/^https:\/\/www\.ecatholic2000\.com\//);
 for(const unit of context.segments){
  assert.equal(createHash("sha256").update(unit.originalWords,"utf8").digest("hex"),
   unit.sourceSHA256);
 }
 assert.ok(!Object.hasOwn(c,"targetSourcePointer"));
 assert.ok(!Object.hasOwn(c,"aiGrade"));
 for(const r of c.results){
  assert.ok(/^catena\.mark\.\d+\.\d+:\d+$/.test(r.id));
  assert.ok(/^https:\/\/www\.ecatholic2000\.com\//.test(r.sourceUrl));
  assert.ok(r.originalWords.length>30);
  assert.equal(createHash("sha256").update(r.originalWords,"utf8").digest("hex"),r.sourceSHA256);
  assert.equal(r.speakerUnits.map(x=>x.originalWords).join(""),r.originalWords);
 }
}
const lower=html.toLowerCase();
assert.ok(lower.includes("independent mark retrieval review"));
assert.ok(lower.includes("sourceResearchCommit".toLowerCase())||html.includes("sourceResearchCommit"));
assert.ok(html.includes("Export JSON progress")&&html.includes("Resume from previously exported JSON"));
assert.ok(html.includes("contextual reference only, NOT a retrieved answer"));
assert.equal(packet.cases.filter(c=>!c.results.length).length,20,
 "Intentional fixed diagnostic: 20 unanswered cases require full-pericope context");
console.log("PASS: offline Mark reviewer packet: 23 cases, frozen canonical excerpts, no answer key, no external runtime resources");
