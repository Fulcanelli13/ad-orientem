/* Build a distributable, single-file, offline Mark blind-review packet.
 * Canonical words and exact Messenger retrieval are imported from existing
 * source-owned code. The separate AI answer-key research is NOT read here.
 * Usage: node tools/scripture/build-catena-mark-blind-offline.mjs
 * Optional: --output /your/file.html
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {createHash} from "node:crypto";
import {selectCatenaPericopes,validateCatenaChapterPack,
 validateCatenaChunkManifest} from "../../src/scripture/catena-inline.js";
import {validateMarkBlindFixture,retrieveMarkBlindCase}
 from "../../src/scripture/catena-mark-blind-review.js";
const read=path=>readFileSync(path,"utf8");
const fixture=validateMarkBlindFixture(JSON.parse(read("data/scripture/catena/editorial-mark-blind-cases.v1.json")));
const manifest=JSON.parse(read("data/scripture/catena/chunks/manifest.v1.json"));
validateCatenaChunkManifest(manifest);
const cache=new Map();
const getSection=entry=>{
 const hit=/^catena\.mark\.(\d+)\.(\d+)$/.exec(entry.pericopeId);
 assert.ok(hit,"Bad Mark pericope id");
 const chapter=Number(hit[1]),verse=Number(hit[2]);
 const start=1+4*Math.floor((chapter-1)/4);
 const row=manifest.chunks.find(x=>x.gospel==="mark"&&x.firstChapter===start);
 assert.ok(row,"Missing canonical Mark chapter range");
 const path="data/scripture/catena/chunks/"+row.file;
 if(!cache.has(path)){
  const raw=read(path);
  const sha=createHash("sha1").update("blob "+Buffer.byteLength(raw)+"\0").update(raw).digest("hex");
  assert.equal(sha,row.blobSha,"Unverified Git blob of canonical Mark chapter pack");
  const parsed=JSON.parse(raw);
  validateCatenaChapterPack(parsed,"mark",row);
  cache.set(path,parsed);
 }
 const section=cache.get(path).pericopes.find(x=>x.id===entry.pericopeId);
 assert.ok(section,"Missing frozen Mark pericope");
 const selected=selectCatenaPericopes([section],{book:"Mark",chapter,verseStart:verse,verseEnd:verse});
 assert.equal(selected.length,1);
 return selected[0];
};
const cases=fixture.cases.map(c=>{
 const section=getSection(c);
 const results=retrieveMarkBlindCase(c,section).map(r=>({
  id:r.id,father:r.father,citation:r.citation,sourceUrl:r.sourceUrl,
  originalWords:r.originalWords,
  sourceSHA256:createHash("sha256").update(r.originalWords,"utf8").digest("hex"),
  speakerUnits:r.speakerUnits.map(u=>({father:u.father,originalWords:u.originalWords}))
 }));
 assert.ok(results.length<=4);
 return {id:c.id,question:c.question,citation:section.citation,results};
});
assert.equal(cases.length,23);
assert.equal(new Set(cases.map(c=>c.id)).size,23);
const packet={
 schema:"ao.catena.mark-offline-blind-packet.v1",
 sourceResearchCommit:fixture.sourceResearchCommit,
 reviewOnly:true,publicationApproval:false,
 edition:"Oxford/Newman Catena Aurea 1841–45",
 source:"Ad Orientem integrity-checked local chapter packs; native pericope-local Messenger retrieval",
 cases
};
const template=read("previews/living-catena-mark-blind-offline-template.html");
const placeholder="__CATENA_MARK_BLIND_PAYLOAD__";
assert.equal(template.split(placeholder).length,2,"Missing or duplicate template payload marker");
const json=JSON.stringify(packet)
 .replace(/</g,"\\u003c")
 .replace(/>/g,"\\u003e")
 .replace(/&/g,"\\u0026")
 .replace(/\u2028/g,"\\u2028")
 .replace(/\u2029/g,"\\u2029");
const html=template.replace(placeholder,json);
assert.ok(!html.includes(placeholder));
assert.ok(!html.includes("contextualGradeAIAssessment")&&!html.includes("negativeExpected"));
assert.ok(!html.includes("editorial-mark-ai-adjudication"));
assert.ok(!/<script\b[^>]*\bsrc\s*=/i.test(html),"Standalone packet must have no external JavaScript");
assert.ok(!/<link\b[^>]*\brel\s*=\s*["']stylesheet/i.test(html),"Standalone packet must have no external CSS");
const args=process.argv.slice(2);
const outFlag=args.indexOf("--output");
const output=outFlag>=0?args[outFlag+1]:"dist/catena-mark-blind-review-offline.html";
assert.ok(output&&output.endsWith(".html"));
mkdirSync(dirname(resolve(output)),{recursive:true});
writeFileSync(output,html,"utf8");
const stats={
 output,cases:cases.length,
 nonempty:cases.filter(c=>c.results.length>0).length,
 noResult:cases.filter(c=>!c.results.length).length,
 excerptCount:cases.reduce((n,c)=>n+c.results.length,0),
 bytes:Buffer.byteLength(html),
 sourceResearchCommit:fixture.sourceResearchCommit
};
process.stdout.write(JSON.stringify(stats)+"\n");
