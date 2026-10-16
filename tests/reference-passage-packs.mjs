import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {webcrypto} from "node:crypto";
import {parsePinnedSourceHtml} from "../src/reference/html-parser.js";
import {parsePinnedSourceText} from "../src/reference/text-parser.js";
import {compileSourcePassagePacks,createSourcePackReader}
 from "../src/reference/passage-packs.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=read("tests/fixtures/source-passage-original.html");
const opts={workId:"demo.original.notes",witnessId:"demo.v1",revision:"r1",
 language:"en",rights:"CLEARED"};
const document=parsePinnedSourceHtml({text:html,...opts});
assert.equal(document.schema,"ao.pinned-source-paragraphs.v1");
assert.equal(document.format,"clean-html");
assert.equal(document.sections.length,2);
assert.equal(document.status,"ELIGIBLE_FOR_READING");
assert.equal(document.sections[0].sourceAnchor,"principle");
assert.equal(document.sections[0].paragraphs[0].sourceAnchor,"first");
assert.equal(document.sections[0].paragraphs[0].sourceLine,3);
assert.equal(document.sections[1].paragraphs[0].sourceLine,6);
assert.equal(document.sections[0].paragraphs[1].id,"demo.v1:s001:p002");
assert.equal(document.sections[1].paragraphs[1].text,
 "Load a section only when someone chooses to read it.");
// Strong/italic HTML is not copied as executable markup.
const italic=parsePinnedSourceHtml({...opts,text:"<article><h2>Heading</h2><p id='x'>This <em>is</em> a &amp; b.</p></article>"});
assert.equal(italic.sections[0].paragraphs[0].text,"This is a & b.");
const prefaced=parsePinnedSourceHtml({...opts,
 text:"<article><p id='preface'>Introductory text.</p><h2 id='chapter'>Main chapter</h2><p>Body.</p></article>"});
assert.equal(prefaced.sections[0].title,"Text");
assert.equal(prefaced.sections[0].sourceAnchor,null);
assert.equal(prefaced.sections[0].paragraphs[0].sourceAnchor,"preface");
assert.equal(prefaced.sections[1].sourceAnchor,"chapter");
for(const forbidden of [
 "<article><script>alert(1)</script></article>",
 "<article><p onclick='evil()'>Unsafe</p></article>",
 "<article><p>x</p><p>y",
 "<article><p id='a'>x</p><p id='a'>y</p></article>",
 "<article><p><iframe src='https://evil.test'></iframe></p></article>",
 "<article><p>A &notRecognized;</p></article>"
]){
 assert.throws(()=>parsePinnedSourceHtml({text:forbidden,...opts}),
  /PINNED_HTML_/,"Ambiguous, unsafe or malformed markup must fail");
}
assert.equal(parsePinnedSourceHtml({text:"<p>first</p>",...opts,rights:"UNREVIEWED"}).status,
 "EDITORIAL_REVIEW_REQUIRED");
assert.equal(parsePinnedSourceHtml({text:"<p>$Pater noster</p>",...opts}).status,
 "EDITORIAL_REVIEW_REQUIRED");
await assert.rejects(compileSourcePassagePacks(
 parsePinnedSourceHtml({text:"<p>$Pater noster</p>",...opts}),
 {cryptoProvider:webcrypto}),/RIGHTS_OR_TEXT_NOT_CLEARED/);
await assert.rejects(compileSourcePassagePacks(
 parsePinnedSourceHtml({text:html,...opts,rights:"UNREVIEWED"}),
 {cryptoProvider:webcrypto}),/RIGHTS_OR_TEXT_NOT_CLEARED/);
const built=await compileSourcePassagePacks(document,{cryptoProvider:webcrypto});
const manifest=JSON.parse(read("data/reference/source-demo/manifest.v1.json"));
assert.deepEqual(built.manifest,manifest,"Committed manifest must be reproducible from original clean HTML");
for(const chunk of built.chunks){
 assert.equal(chunk.raw,read("data/reference/source-demo/"+chunk.file),
  "Committed chunk must match deterministic parser bytes, not a manually edited transcription");
}
const manifestBytes=Buffer.byteLength(JSON.stringify(manifest));
const packBytes=built.chunks.reduce((sum,x)=>sum+Buffer.byteLength(x.raw),0);
assert.ok(manifestBytes<packBytes,"Initial lightweight manifest is smaller than all passage payloads");
assert.equal(manifestBytes,712);
assert.equal(packBytes,1065);

let fetches=0;
const reader=createSourcePackReader(manifest,{
 cryptoProvider:webcrypto,maxCachedSections:1,
 loadChunk:async file=>{fetches++;return read("data/reference/source-demo/"+file)}
});
assert.equal(fetches,0,"Listing available sections must not fetch their content");
assert.equal(reader.sections().length,2);
assert.equal(fetches,0);
const first=await reader.open("demo.v1:s001:p001");
assert.equal(first.sourceLine,3);
assert.equal(first.sourceAnchor,"first");
assert.equal(first.nextId,"demo.v1:s001:p002");
assert.equal(first.previousId,null);
assert.equal(fetches,1);
const second=await reader.open("demo.v1:s001:p002");
assert.equal(second.text,"Commentary should keep the name of its author.");
assert.equal(second.nextId,"demo.v1:s002:p001");
assert.equal(fetches,1,"The previous section remains cached");
const third=await reader.open(second.nextId);
assert.equal(third.sectionTitle,"Reading with Context");
assert.equal(fetches,2,"Only a newly opened section is downloaded");
assert.equal(reader.cachedSections(),1,"Bounded cache prevents whole-library residency");
await reader.open("demo.v1:s001:p001");
assert.equal(fetches,3,"Evicted section can be loaded again on demand");
const results=await reader.search("context",{limit:5});
assert.equal(results.length,0);
assert.ok((await reader.search("source",{limit:10})).length>0);
await assert.rejects(reader.open("demo.v1:s003:p001"),/UNKNOWN_PASSAGE/);
assert.throws(()=>createSourcePackReader({...manifest,rights:"UNREVIEWED"},
 {loadChunk:async()=>"",cryptoProvider:webcrypto}),/RIGHTS_OR_TEXT_NOT_CLEARED/);
assert.throws(()=>createSourcePackReader({...manifest,
 sections:[{...manifest.sections[0],file:"../../other-site.json"}]},
 {loadChunk:async()=>"",cryptoProvider:webcrypto}),/SECTION_INVALID/);
assert.throws(()=>createSourcePackReader({...manifest,
 sections:[{...manifest.sections[0],passageIds:[
  manifest.sections[0].passageIds[0],manifest.sections[0].passageIds[0]]}]},
 {loadChunk:async()=>"",cryptoProvider:webcrypto}),/SECTION_INVALID/);
const altered=createSourcePackReader(manifest,{cryptoProvider:webcrypto,
 loadChunk:async file=>read("data/reference/source-demo/"+file).replace("A reliable","A forged")});
await assert.rejects(altered.open("demo.v1:s001:p001"),/CHECKSUM_MISMATCH/);
const mismatched=createSourcePackReader(manifest,{cryptoProvider:webcrypto,
 loadChunk:async file=>read("data/reference/source-demo/"+(file==="section-001.json"?"section-002.json":"section-001.json"))});
await assert.rejects(mismatched.open("demo.v1:s001:p001"),/CHECKSUM_MISMATCH/);

// The preexisting plain and Divinum contract must remain the only owners
// of their original formats. Do not modify their text or rubric handling.
assert.equal(parsePinnedSourceText({text:"# A\nOne.",...opts}).format,"plain-paragraphs");
console.log("PASS clean HTML / rights / deterministic bytes / SHA-256 / lazy passage navigation / source anchors / bounded cache / tamper defense");
console.log(JSON.stringify({manifestBytes,allSectionBytes:packBytes,initialSectionFetches:0,
 sourceWorksRegistered:1,passages:4}));
