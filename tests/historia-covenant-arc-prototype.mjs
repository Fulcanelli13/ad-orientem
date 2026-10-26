import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const jsonData=html=>{
  const x=html.match(/<script id="sourceData" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(x,"No offline JSON embedded");return JSON.parse(x[1]);
};
const oldHtml=read("prototypes/historia-salutis-p3-continuous-reader-20261021.html");
const arcHtml=read("prototypes/historia-salutis-covenant-arcs-20261021.html");
const old=jsonData(oldHtml),newData=jsonData(arcHtml);
const recon=JSON.parse(read("data/research/historia-salutis-p3-covenant-arc-chapter-reconciliation-20261021.v1.json"));
const consolidation=JSON.parse(read("data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json"));
assert.equal(old.chapters.length,37);
assert.equal(newData.acts.length,4);
assert.equal(newData.chapters.length,12);
assert.equal(newData.covenants.length,7);
assert.equal(newData.chapters.flatMap(a=>a.outlines).length,78);
assert.equal(consolidation.readingChapters.length,54);
assert.equal(consolidation.readingChapters.flatMap(c=>c.originalChapterIds).length,78);
assert.equal(newData.chapters.flatMap(a=>a.readingChapters).length,54);
assert.deepEqual(newData.chapters.flatMap(a=>a.readingChapters).map(x=>x.id),consolidation.readingChapters.map(x=>x.id));
assert.equal(consolidation.readingChapters.every(g=>g.mainReadingSourceParagraphs>0),true);
assert.equal(consolidation.totals.sourceWordsRemoved,0);
assert.equal(consolidation.totals.fewerMajorChapterStops,24);
const groupedByH=new Map(consolidation.readingChapters.flatMap(g=>g.originalChapterIds.map(id=>[id,g])));
for(const arc of newData.chapters){
 const ordered=arc.blocks.map(x=>x.readingChapterId).filter((x,i,items)=>i===0||x!==items[i-1]);
 assert.deepEqual(ordered,arc.readingChapters.map(g=>g.id),"Every reading chapter must be contiguous and source-ordered "+arc.n);
 for(const b of arc.blocks){
  const g=groupedByH.get(b.owner);
  assert.ok(g&&g.arcNumber===arc.n);
  assert.equal(b.readingChapterId,g.id);
 }
}
assert.deepEqual(newData.acts.map(x=>x.title),["The Promise","The People of the Covenant","The Fulfilment","The Church and Consummation"]);
assert.deepEqual(newData.chapters.map(x=>x.title),recon.arcs.map(x=>x.title_en));
assert.deepEqual(newData.chapters.map(x=>x.act),recon.arcs.map(x=>x.act));
assert.equal(newData.sourceIntegrity.sourceReordered,false);
assert.equal(newData.sourceMovements,37);
assert.deepEqual(newData.sourceIntegrity.unpopulatedChapterOutlines,recon.unresolved.withoutCompulsoryP3Beats);
const oldBlocks=old.chapters.flatMap(c=>c.blocks);
const newBlocks=newData.chapters.flatMap(c=>c.blocks);
assert.equal(oldBlocks.length,222);
assert.equal(newBlocks.length,222);
assert.equal(oldBlocks.filter(b=>b.type==="scripture").length,181);
assert.equal(oldBlocks.filter(b=>b.type==="editorial").length,41);
assert.equal(newBlocks.filter(b=>b.type==="scripture"&&b.trial).length,12);
assert.equal(newBlocks.filter(b=>b.type==="scripture").reduce((n,b)=>n+b.parts.length,0),222);
const hit=new Set();
for(let i=0;i<oldBlocks.length;i++){
 const a=oldBlocks[i],b=newBlocks[i];
 assert.equal(a.type,b.type,"Reading text type changed at "+i);
 assert.equal(a.type==="scripture"?a.reference:a.text,b.type==="scripture"?b.reference:b.text,"Original source order changed at "+i);
 if(a.type==="scripture"){
  assert.equal(a.trial,b.trial);
  assert.deepEqual(a.parts,b.parts,"Exact source/rail text changed at "+i);
 }else assert.deepEqual(a.references,b.references,"Editorial source evidence changed at "+i);
 assert.match(b.owner,/^H\d{2}$/);
 assert.equal(b.ownerTitle,recon.chapterOutlines.find(x=>x.id===b.owner)?.title);
 hit.add(b.owner);
}
assert.equal(hit.size,70);
assert.equal(newData.chapters.flatMap(a=>a.outlines).filter(c=>c.coverage==="NO_COMPULSORY_P3_BEAT").length,8);
assert.equal(newData.chapters[0].phaseType,"promise");
assert.equal(newData.chapters[6].phaseType,"prophecy");
assert.equal(newData.chapters[7].phaseType,"anticipation");
assert.equal(newData.chapters[8].phaseType,"anticipation");
assert.equal(newData.chapters[9].phaseType,"fulfilment");
const hIdx=newBlocks.findIndex(x=>x.owner==="H52"),nextBack=newBlocks.slice(hIdx+1).findIndex(x=>x.owner==="H51");
assert.ok(hIdx>=0 && nextBack>=0,"Preserve H52->H51 Mark/John source-order exception, do not force naive sorting");
assert.ok(arcHtml.includes("COVENANTAL ARC "));
assert.ok(arcHtml.includes('heading.id="chapter-"+sub.id'));
assert.ok(arcHtml.includes("54 provisional reading chapters"));
assert.ok(arcHtml.includes("no Scripture has been invented"));
assert.ok(arcHtml.includes('CHAPTER "+sub.id.slice(1)+" / 54'));
assert.ok(arcHtml.includes("Twelve covenant-led narrative arcs"));
assert.ok(arcHtml.includes("not yet instituted"));
assert.ok(!arcHtml.includes('"arcs":['),"Do not duplicate the full embedded manuscript");
assert.equal(arcHtml.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)?.length,2);
const js=arcHtml.match(/<script>\n([\s\S]*?)<\/script>/);
assert.ok(js);
new vm.Script(js[1],{filename:"historia-covenant-arc-inline.js"});
assert.ok(!/<(?:link|script)\s+[^>]*src\s*=/.test(arcHtml),"Offline HTML must not depend on external assets");
assert.ok(arcHtml.includes("No parallels or invented narrative."));
console.log("PASS Historia covenant navigation: four acts; 12 covenant-led arcs; 54 source-backed reading chapters from 78 proposed H topics; 222 unmodified reading blocks; 222 source-anchored rail sections; seven covenant/promise stages; full source-order parity");
