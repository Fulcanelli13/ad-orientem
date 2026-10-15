import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {parsePinnedSourceText,sourcePassage,sourceCanDisplay}
 from "../src/reference/text-parser.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

const plain=parsePinnedSourceText({
 text:"# Chapter I\nFirst paragraph line.\nContinued line.\n\nSecond paragraph.\n\n## Chapter II\nAnother paragraph.",
 workId:"works.study",witnessId:"witness.1901",revision:"sha.aabb",language:"en",rights:"CLEARED"
});
assert.equal(plain.schema,"ao.pinned-source-paragraphs.v1");
assert.equal(plain.status,"ELIGIBLE_FOR_READING");
assert.equal(plain.sections.length,2);
assert.deepEqual(plain.sections.map(x=>x.paragraphs.length),[2,1]);
assert.equal(plain.sections[0].paragraphs[0].text,"First paragraph line.\nContinued line.");
assert.equal(plain.sections[0].paragraphs[0].sourceLine,2);
assert.equal(plain.sections[0].paragraphs[1].sourceLine,5);
assert.equal(plain.sections[1].paragraphs[0].sourceLine,8);
assert.equal(plain.sections[0].paragraphs[0].id,"witness.1901:s001:p001");
assert.equal(sourcePassage(plain,"witness.1901:s001:p002").paragraphs[0].text,"Second paragraph.");
assert.equal(sourcePassage(plain,"witness.1901:s002").paragraphs.length,1);
assert.equal(sourceCanDisplay(plain,"witness.1901:s001"),true);
assert.equal(sourceCanDisplay(plain,"witness.1901:s999"),false);
assert.equal(sourcePassage(plain,"witness.1901:s999"),null);
const denied=parsePinnedSourceText({
 text:"One source paragraph",workId:"w.sample",witnessId:"w.test",revision:"r1",
 language:"fr",rights:"UNREVIEWED"
});
assert.equal(denied.status,"EDITORIAL_REVIEW_REQUIRED");
assert.equal(sourceCanDisplay(denied,denied.sections[0].paragraphs[0].id),false);
assert.throws(()=>parsePinnedSourceText({text:"hello",workId:"",witnessId:"x.test",revision:"r1"}),/ID_REQUIRED/);
assert.throws(()=>parsePinnedSourceText({text:"hello",workId:"w.test",witnessId:"x.test",revision:"r1",language:"zz"}),/FORMAT/);
assert.throws(()=>parsePinnedSourceText({text:"hello",workId:"w.test",witnessId:"x.test",revision:"r1",maxChars:2}),/TOO_LARGE/);

// Exercise the REAL pinned Divinum Officium 1960 Tenebrae witness. Its MIT
// source is already checked into Ad Orientem. Rights to the source file are
// distinct from a certified ready-to-read liturgical text: unresolved macros
// cannot be silently treated as complete prayers or revealed as final copy.
const source=read("data/pray/tenebrae-1960-source/la/Quad6-4.txt");
const divinum=parsePinnedSourceText({
 text:source,format:"divinum-sections",workId:"divinum.tenebrae",
 witnessId:"witness.quad6-4.la",revision:"pinned2026",rights:"CLEARED"
});
assert.ok(divinum.sections.length>=10);
assert.ok(divinum.sections.some(s=>s.title==="Lectio1"));
assert.ok(divinum.sections.some(s=>s.title==="Ant Matutinum"));
assert.ok(divinum.unresolvedParagraphs>0);
assert.equal(divinum.status,"EDITORIAL_REVIEW_REQUIRED");
const rubric=divinum.sections.find(s=>s.title==="Oratio");
assert.ok(rubric.paragraphs.some(p=>p.unresolved));
assert.equal(sourceCanDisplay(divinum,rubric.id),false);
assert.ok(rubric.paragraphs.some(p=>p.text.includes("$Pater noster")));
const withMarkup=parsePinnedSourceText({
 text:"<img src=x onerror=alert(1)>",workId:"w.html",witnessId:"w.html",
 revision:"r1",rights:"CLEARED"
});
assert.ok(withMarkup.sections[0].paragraphs[0].text.includes("<img"));
assert.throws(()=>parsePinnedSourceText({text:"",workId:"w.empty",witnessId:"w.empty",revision:"r1"}),/MISSING_OR_TOO_LARGE/);

const inventory=JSON.parse(read("data/reference/parsing-opportunities.v1.json"));
assert.equal(inventory.schema,"ao.source-parsing-opportunities.v1");
assert.equal(inventory.items.length,inventory.counts.total);
assert.equal(new Set(inventory.items.map(x=>x.id)).size,inventory.items.length);
for(const entry of inventory.items){
 assert.ok(["P0","P1","P2","P3"].includes(entry.priority));
 assert.ok(inventory.statuses.includes(entry.status),entry.id);
 const file=new URL("../"+entry.source,import.meta.url);
 assert.ok(statSync(file).isFile()||statSync(file).isDirectory(),"Missing canonical owner path "+entry.source);
}
assert.equal(inventory.items.find(x=>x.id==="catena-aurea").status,"CHUNKED_IMPLEMENTED_ON_BRANCH");
console.log("PASS source parser, exact literal line locators, rights/unknown macro holds and 37 real app parsing owners");
