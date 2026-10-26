import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const get=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const html=get("prototypes/historia-salutis-p3-continuous-reader-20261021.html");
const dataMatch=html.match(/<script id="sourceData" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(dataMatch,"Prototype must embed offline Scripture data");
const data=JSON.parse(dataMatch[1]);
assert.equal(data.chapters.length,37);
assert.equal(data.edition,"Douay–Rheims (uncollated source witness)");
assert.equal(data.chapters[0].title,"Creation and the human vocation");
assert.equal(data.chapters.at(-1).title,"The New Creation");
assert.ok(html.includes('<meta name="viewport"'));
assert.ok(html.includes('id="movementIndex"'));
assert.ok(html.includes('id="sourcePanel"'));
assert.ok(html.includes('id="searchPanel"'));
assert.ok(html.includes('class="fine-progress"'));
assert.ok(html.includes("prefers-reduced-motion:reduce"));
assert.ok(!/<(?:link|script)\s+[^>]*src\s*=/.test(html),"Offline prototype must not require external assets");
assert.ok(!/https?:\/\/(?:fonts|cdn|unpkg)\./.test(html),"No external fonts/assets");
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,2);
new vm.Script(scripts[1][1],{filename:"historia-reader-inline.js"});
const source=JSON.parse(get("data/research/historia-salutis-v18-continuous-reading-proof.v1.json"));
const witnessCache=new Map();
const indices=book=>{
 if(!witnessCache.has(book)){
  const f=JSON.parse(get("data/scripture/witness/dr-challoner/"+book+".json"));
  assert.equal(f.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  witnessCache.set(book,new Map(f.verses.map(([c,v,t])=>[c+":"+v,t])));
 }
 return witnessCache.get(book);
};
const refsToText=ref=>{
 const m=ref.match(/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](?:(\d+):)?(\d+))?$/);
 assert.ok(m,"Illegal source ref "+ref);
 const startC=+m[2],endC=+(m[4]||m[2]);
 assert.equal(startC,endC,"Expected scoped Historia source range");
 const w=indices(m[1]),out=[];
 for(let v=+m[3];v<=+(m[5]||m[3]);v++){
   const val=w.get(startC+":"+v);
   assert.ok(val,"Missing actual witness verse "+ref+" v"+v);
   out.push(val);
 }
 return out.join(" ");
};
const originalSourceRefs=new Set();
const trialSourceRefs=new Set();
const editorText=new Set();
const expectedProjected=new Map();
const projectedReaderParts=new Map();
for(const m of source.movements)for(const b of m.beats){
 if(b.kind==="SCRIPTURE")for(const ref of (b.semanticEditionAlignment?.selectedReferencesByEdition?.["dr-challoner"]||b.refs))originalSourceRefs.add(ref);
 for(const ref of [...(b.readthroughTrial?.refs||[]),...(b.afterSelectedReadthroughTrial?.refs||[])])trialSourceRefs.add(ref);
 if(b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE")editorText.add(b.editorialReadingCandidate?.text||b.explanation);
 if(b.beforeScriptureConnectorCandidate)editorText.add(b.beforeScriptureConnectorCandidate.text);
 if(b.readthroughTrial?.editorialPreface)editorText.add(b.readthroughTrial.editorialPreface.text);
 if(b.literaryEconomyOption?.readingDecision?.decision==="USE_SHORTENED_PASSAGES_IN_RESEARCH_READING_ONLY"){
   const original=b.literaryEconomyOption.sourceReferencesUnderReview[0];
   const proposals=b.literaryEconomyOption.readingDecision.projectedReferences;
   expectedProjected.set(original,proposals);
   for(const sub of proposals)projectedReaderParts.set(sub,original);
 }
}
let scriptCount=0,railCount=0,bridgeCount=0,connectors=0;
const seenRefs=new Set(),allEditorial=new Set();
for(const [ci,m] of data.chapters.entries()){
 assert.equal(m.n,ci+1);
 for(const b of m.blocks){
  if(b.type==="scripture"){
   scriptCount++;
   assert.ok(originalSourceRefs.has(b.reference)||trialSourceRefs.has(b.reference)||projectedReaderParts.has(b.reference),
      "Prototype invents source range "+b.reference);
   bridgeCount+=b.trial?1:0;
   assert.equal(b.trial,trialSourceRefs.has(b.reference),"Trial must retain its source status "+b.reference);
   const expected=expectedProjected.get(b.reference)||[b.reference];
   const flat=[];
   for(const part of b.parts){
     railCount++;assert.equal(part.text,refsToText(part.ref),"Exact source wording/rail parity: "+part.ref);
     flat.push(part.text);
   }
   const originalText=refsToText(b.reference);
   if(expectedProjected.has(b.reference)){
     const originalKeys=source.movements.flatMap(x=>x.beats).find(x=>x.literaryEconomyOption?.sourceReferencesUnderReview?.includes(b.reference));
     assert.ok(originalKeys);
     assert.equal(b.parts.length,expected.length);
     assert.deepEqual(b.parts.map(v=>v.ref),expected);
     assert.ok(flat.join(" ").length<originalText.length);
   }else{
     assert.equal(flat.join(" "),originalText,"Unabridged passage must equal witness "+b.reference);
   }
   seenRefs.add(b.reference);
  }else{
   assert.equal(b.type,"editorial");
   connectors++;assert.ok(editorText.has(b.text),"Every prose connector must come from P3 research source: "+b.text.slice(0,55));
   assert.ok(b.references.length>0);allEditorial.add(b.text);
  }
 }
}
assert.equal(scriptCount,181);
assert.equal(railCount,222);
assert.equal(bridgeCount,12);
assert.equal(connectors,41);
assert.equal(allEditorial.size,41);
assert.ok(expectedProjected.size===2);
assert.equal(projectedReaderParts.size,5);
for(const [part,original] of projectedReaderParts){
 assert.ok(originalSourceRefs.has(original),"Abridgment needs a canonical source owner");
 assert.ok(!trialSourceRefs.has(part),"Abridgment must never create trial status");
}
assert.ok(data.chapters.at(-1).blocks.some(b=>b.type==="scripture"&&b.reference==="Revelation 22:1–5"));
const manuscript=get("data/research/historia-salutis-p3-continuous-research-reading-dr-challoner.v1.md");
assert.ok(manuscript.includes("**UNAPPROVED RESEARCH READING — NOT FOR PUBLICATION**"));
assert.ok(html.toLowerCase().includes("uncollated")&&html.toLowerCase().includes("not yet approved"));
console.log("PASS offline Historia reader prototype: 37 movements, 181 biblical paragraphs, 222 exact rail citations, 41 source-owned connectors, 12 held Scripture trials, two source-faithful reading-only abridgments; app script parses");
