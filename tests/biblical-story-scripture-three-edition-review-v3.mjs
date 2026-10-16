import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const d=read("data/explore/biblical-story-scripture-three-edition-witness-collation.v3.json");
const h=readFileSync(new URL("../data/explore/biblical-story-scripture-review-offline.v3.html",import.meta.url),"utf8");
const tri=read("data/explore/biblical-story-first-editorial-triage.v1.json");
const canon=read("data/explore/biblical-reading-continuity-review.v1.json");
const prior=read("data/explore/biblical-story-scripture-three-edition-witness-collation.v2.json");
const editions=["cpdv-2009","dr-challoner","crampon-1923"];
assert.equal(d.schema,"AO_STORY_SCRIPTURE_THREE_EDITION_WITNESS_COLLATION_V3");
assert.equal(d.metadata.storyCount,30);
assert.equal(d.metadata.cohort1Count,14);
assert.equal(d.metadata.cohort2Count,16);
assert.equal(d.metadata.cohort2Pending,false);
assert.equal(d.storyRows.length,30);
assert.equal(d.metadata.distinctChapters,29);
assert.equal(d.verseSlotChecks.length,87);
assert.equal(d.metadata.verseSlots,3708);
assert.equal(d.verseSlotChecks.reduce((n,x)=>n+x.verseCount,0),3708);
assert.equal(d.metadata.approvedFinalRanges,0);
assert.equal(d.metadata.blankSlots,0);
assert.equal(d.metadata.missingSlotNumbers,0);
assert.deepEqual(d.productionChanges,[]);
assert.deepEqual(d.approvedChoices,[]);
assert.equal(canon.events.length,151);
assert.equal(canon.readingChapters.length,37);
assert.equal(d.editionPolicy.productContemporaryEnglishAlternative,"cpdv-2009");
assert.equal(d.editionPolicy.productTraditionalDefault,"dr-challoner");
assert.equal(d.editionPolicy.productFrenchDefault,"crampon-1923");
assert.equal(d.editionPolicy.productionDefaultsChanged,false);
assert.ok(h.includes('value="cpdv-2009">CPDV · contemporary'));
assert.ok(h.includes('englishEdition:"cpdv-2009"'));
assert.ok(h.includes('AO_STORY_SCRIPTURE_EDITORIAL_RATINGS_V3'));
assert.ok(h.includes('AO_STORY_SCRIPTURE_EDITORIAL_RATINGS_V2'));
assert.ok(h.includes("Judith 13: English witnesses have 31 numbered verses"));
assert.ok(h.includes("Susanna / Daniel 13: English versions have 65 verse slots"));
const embed=h.match(/<script type="application\/json" id="source">([\s\S]*?)<\/script>/);
assert.ok(embed);
assert.deepEqual(JSON.parse(embed[1]),d);
const js=h.match(/<\/script><script>([\s\S]*?)<\/script><\/body>/);
assert.ok(js);
new Script(js[1],{filename:"AO_30_story_review_v3.js"});
assert.ok(!/<script[^>]+src=/.test(h));
const ids=new Set(),slugs=new Set();
for(const item of d.storyRows) {
 assert.ok(!slugs.has(item.slug));slugs.add(item.slug);
 assert.ok(d.chapters[item.book]?.[item.chapter]);
 if(item.atlasIndex!==null){
   assert.equal(canon.events[item.atlasIndex].reference,item.reference);
   assert.ok(tri.atlasEventDecisions.some(x=>x.eventIndex===item.atlasIndex&&x.proposedClass==="CORE_STORY"));
 }else{
   assert.ok(tri.additionalReadingDecisions.some(x=>x.proposalId===item.supplementId&&x.proposedClass==="CORE_STORY"));
 }
 assert.equal(item.status,"SOURCE_WITNESS_ONLY_UNCOLLATED_TEXT_UNAPPROVED");
 assert.ok(item.necessary.length>=3);
 assert.ok(item.risk.length>=1);
 assert.ok(item.options.length>=2);
 for(const opt of item.options){
    assert.ok(!ids.has(opt.id));ids.add(opt.id);
    assert.ok(opt.id.startsWith(item.slug+"-"));
    for(const [a,b] of opt.segments){assert.ok(a>0&&b>=a);
      for(const ed of editions)assert.ok(b<=d.chapters[item.book][item.chapter][ed].length,item.slug+":"+ed+":"+a+"-"+b);
    }
 }
}
assert.equal(d.storyRows.reduce((n,s)=>n+s.options.length,0),92);
for(const p of prior.storyRows){
 assert.ok(d.storyRows.some(n=>n.slug===p.slug&&JSON.stringify(n.options)===JSON.stringify(p.options)),"original 14 review choices must survive");
}
for(const c of d.verseSlotChecks){
 const original=read("data/scripture/witness/"+c.edition+"/"+c.book+".json");
 assert.equal(original.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
 const exact=original.verses.filter(v=>v[0]===c.chapter).map(v=>[v[1],v[2]]);
 assert.deepEqual(d.chapters[c.book][c.chapter][c.edition],exact,"source witness verse transcription must be byte-exact");
 assert.equal(exact.length,c.verseCount);
 assert.deepEqual(c.blank,[]);
 assert.deepEqual(c.missing,[]);
}
const j=d.chapters.Judith[13],su=d.chapters.Daniel[13],jo=d.chapters.John[6];
assert.equal(j["cpdv-2009"].length,31);
assert.equal(j["crampon-1923"].length,20);
assert.equal(su["cpdv-2009"].length,65);
assert.equal(su["crampon-1923"].length,64);
assert.equal(jo["cpdv-2009"].length,72);
assert.equal(jo["crampon-1923"].length,71);
assert.ok(d.criticalWarnings.some(x=>x.code==="JUDITH13_ENGLISH_FRENCH_CHAPTER_SCOPE_DIVERGENCE"));
assert.ok(d.criticalWarnings.some(x=>x.code==="DANIEL13_ENDING_VERSE_MERGE"));
console.log("Story review v3: 30 stories, 92 excerpt choices, 29 chapters, 87 edition chapter witnesses, 3708 verse slots byte-equal to source files; no production or Scripture approvals.");
