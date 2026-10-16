import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const c=read("data/explore/biblical-story-scripture-bilingual-witness-collation.v1.json");
const audit=read("data/explore/biblical-story-context-fidelity-audit.v1.json");
const html=readFileSync(new URL("../data/explore/biblical-story-scripture-review-offline.v1.html",import.meta.url),"utf8");
assert.equal(c.schema,"AO_STORY_SCRIPTURE_BILINGUAL_WITNESS_COLLATION_V1");
assert.equal(c.metadata.storyCount,14);
assert.equal(c.metadata.distinctChapters,13);
assert.equal(c.metadata.chapterSlotChecks,26);
assert.equal(c.metadata.blankSlots,0);
assert.equal(c.metadata.missingSlotNumbers,0);
assert.equal(c.metadata.approvedFinalRanges,0);
assert.equal(c.storyRows.length,14);
assert.equal(audit.reviewedStories.length,14);
assert.equal(c.productionChanges.length,0);
assert.equal(c.approvedChoices.length,0);
assert.ok(c.criticalWarnings.some(x=>x.code==="JOHN6_SPLIT_VERSE_AND_OFFSET"));
assert.ok(c.criticalWarnings.some(x=>x.code==="JOHN6_TEXT_VARIANT_PETER"));
assert.ok(c.criticalWarnings.some(x=>x.code==="GENESIS3_15_MARIAN_TEXT"));
assert.ok(c.criticalWarnings.some(x=>x.code==="HALF_VERSE_CUTS"));
assert.ok(c.metadata.notes.includes("UNCOLLATED_SOURCE_WITNESS"));
assert.ok(html.includes("AO_STORY_SCRIPTURE_EDITORIAL_RATINGS_V1"));
assert.ok(html.includes("Export my ratings"));
assert.ok(html.includes("UNCO")); // warning visible
assert.ok(!html.match(/<script[^>]+src=/));
const embedded=html.match(/<script type="application\/json" id="source">([\s\S]*?)<\/script>/);
assert.ok(embedded,"one valid embedded source script");
const inside=JSON.parse(embedded[1]);
assert.deepEqual(inside,c,"offline preview must be built from exactly the committed source audit");
const code=html.match(/<\/script><script>([\s\S]*?)<\/script><\/body>/);
assert.ok(code,"browser JavaScript embedded and parseable");
new Script(code[1],{filename:"ao-review-inline.js"}); // syntax only, not execution
const pair=c.chapters.John[6];
assert.equal(pair["dr-challoner"].length,72);
assert.equal(pair["crampon-1923"].length,71);
const item=(s,n)=>s.find(x=>x[0]===n)?.[1];
assert.ok(item(pair["dr-challoner"],52).includes("bread that I will give"));
assert.ok(item(pair["crampon-1923"],51).includes("pain que je donnerai"));
assert.ok(item(pair["dr-challoner"],70).includes("Christ, the Son of God"));
assert.ok(item(pair["crampon-1923"],69).includes("Saint de Dieu"));
const enGenesis=c.chapters.Genesis[3]["dr-challoner"],frGenesis=c.chapters.Genesis[3]["crampon-1923"];
assert.ok(item(enGenesis,15).includes("she shall crush"));
assert.ok(item(frGenesis,15).includes("celle-ci te meurtrira"));
for(const src of c.verseSlotChecks){
 const book=c.chapters[src.book]?.[src.chapter]?.[src.edition];
 assert.ok(book,src.book+"/"+src.chapter+"/"+src.edition);
 assert.equal(book.length,src.verseCount);
 assert.equal(src.blank.length,0);
 assert.equal(src.missing.length,0);
 const file=read("data/scripture/witness/"+src.edition+"/"+src.book+".json");
 assert.equal(file.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
 const original=file.verses.filter(v=>v[0]===src.chapter).map(v=>[v[1],v[2]]);
 assert.deepEqual(book,original,"do not edit Scripture witness text in research tool");
}
for(const row of c.storyRows){
 assert.ok(audit.reviewedStories.some(x=>x.storySlug===row.slug));
 const ch=c.chapters[row.book][row.chapter];
 assert.ok(ch["dr-challoner"]&&ch["crampon-1923"]);
 assert.ok(row.options.length>=1);
 assert.equal(row.status,"SOURCE_WITNESS_ONLY_UNCOLLATED_TEXT_UNAPPROVED");
 for(const opt of row.options){
  assert.equal(opt.id.startsWith(row.slug+"-"),true);
  for(const [a,b] of opt.segments){assert.ok(a>0&&b>=a);
   assert.ok(b<=ch["dr-challoner"].length);
  }
 }
}
console.log("Bilingual story-review guard: 14 stories; 13 exact source chapters, 26 witness files; 1,133 whole-verse source slots, John 6 offset and Gen 3:15 textual warning retained; HTML syntax and self-contained payload validated; no approved passages.");
