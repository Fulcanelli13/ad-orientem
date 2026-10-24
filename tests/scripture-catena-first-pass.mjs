/*
 * Living Catena first-pass integrity. Run after generator:
 * node tests/scripture-catena-first-pass.mjs
 *
 * Verify each original excerpt is referenced once, every 300-item review
 * queue is exhaustive, and no machine-derived question owns a Father voice.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const dir="data/scripture/catena/research/full-corpus-pass-20261021/";
const pinned=read("data/scripture/catena/manifest.v1.json");
const summary=read(dir+"summary.v1.json");
assert.equal(summary.schema,"ao.catena.first-pass-summary.v1");
assert.equal(summary.sourceOriginCommit,pinned.originCommit);
assert.equal(summary.totals.analyzedFragments,12692);
assert.equal(summary.totals.analyzedPericopes,814);
let fragments=0,pericopes=0,qRows=0,qMarks=0,batches=0,multiFatherGroups=0;
const knownPointers=new Set();
for(const b of pinned.books){
  const pack=read("data/scripture/catena/"+b.gospel+".json");
  const x=read(dir+b.gospel+"-index.v1.json");
  assert.equal(x.schema,"ao.catena.first-pass-book.v1");
  assert.equal(x.gospel,b.gospel);
  assert.equal(x.status,"research_only__not_a_patristic_dialogue");
  assert.equal(pack.pericopes.length,b.pericopes);
  assert.equal(x.rows.length,b.fragments);
  assert.equal(x.pericopeGroups.length,b.pericopes);
  assert.equal(x.totals.fragments,b.fragments);
  assert.equal(x.totals.pericopes,b.pericopes);
  const pericopeMap=new Map(pack.pericopes.map(p=>[p.id,p]));
  const topicMap=new Map(x.pericopeGroups.map(p=>[p[0],p]));
  assert.equal(topicMap.size,b.pericopes);
  let bookQ=0,bookMarks=0,bookGroups=0;
  for(let i=0;i<x.rows.length;i++){
    const r=x.rows[i];
    assert.equal(r.length,7);
    const [pericopeId,ordinal,father,topics,flags,chars,marks]=r;
    const p=pericopeMap.get(pericopeId);
    assert.ok(p,"missing canonical passage: "+pericopeId);
    assert.ok(Number.isInteger(ordinal)&&ordinal>=0&&ordinal<p.segments.length);
    const original=p.segments[ordinal];
    assert.equal(original.father,father,"inherited Father label changed");
    assert.equal(original.text.length,chars,"original source excerpt changed");
    const count=(original.text.match(/\?/g)||[]).length;
    assert.equal(count,marks,"punctuation count changed");
    assert.equal(flags.includes("Q"),count>0,"false question presence flag");
    assert.ok(Array.isArray(topics)&&Array.isArray(flags));
    if(count){bookQ++;bookMarks+=count;}
    const key=pericopeId+":"+ordinal;
    assert.ok(!knownPointers.has(key),"duplicated Catena source pointer "+key);
    knownPointers.add(key);
  }
  for(const gp of x.pericopeGroups){
    const [id,verses,n,fathers,questionEntries,topicGroups]=gp;
    const p=pericopeMap.get(id);
    assert.ok(p);
    assert.deepEqual(verses,p.verse_keys);
    assert.equal(n,p.segments.length);
    assert.equal(fathers,new Set(p.segments.map(s=>s.father)).size);
    assert.equal(questionEntries,p.segments.filter(s=>s.text.includes("?")).length);
    for(const [topic,distinctFathers,ordinals] of topicGroups){
      assert.ok(distinctFathers>=2&&Array.isArray(ordinals)&&ordinals.length>=2);
      const sources=new Set(ordinals.map(i=>{
        assert.ok(Number.isInteger(i)&&i>=0&&i<p.segments.length);
        return p.segments[i].father;
      }));
      assert.equal(sources.size,distinctFathers);
      assert.ok(typeof topic==="string");
      bookGroups++;
    }
  }
  assert.equal(bookQ,x.totals.questionPunctuationFragments);
  assert.equal(bookMarks,x.totals.questionPunctuationMarks);
  assert.equal(bookGroups,x.totals.multiFatherLexicalGroups);
  const indexed=[];
  for(const batch of x.reviewBatches300){
    assert.ok(batch.rowIndexes.length>=1&&batch.rowIndexes.length<=300);
    assert.equal(batch.batchNumber,indexed.length===0?1:Math.ceil(indexed.length/300)+1);
    for(const n of batch.rowIndexes){
      assert.ok(Number.isInteger(n)&&n>=0&&n<x.rows.length);
      indexed.push(n);
    }
  }
  assert.equal(indexed.length,x.rows.length);
  assert.equal(new Set(indexed).size,x.rows.length,"missing or repeated review queue pointer");
  fragments+=x.rows.length;pericopes+=pack.pericopes.length;
  qRows+=bookQ;qMarks+=bookMarks;multiFatherGroups+=bookGroups;batches+=x.reviewBatches300.length;
}
assert.equal(fragments,pinned.totalFragments);
assert.equal(pericopes,pinned.totalPericopes);
assert.equal(knownPointers.size,12692);
assert.equal(qRows,summary.totals.questionPunctuationFragments);
assert.equal(qMarks,summary.totals.questionPunctuationMarks);
assert.equal(multiFatherGroups,summary.totals.multiFatherLexicalGroups);
assert.equal(batches,summary.totals.reviewBatches300);
assert.ok(summary.reviewPolicy.some(s=>s.includes("no questioner identity is inferred")));
assert.ok(summary.status.includes("requires_human_question_author_answer_alignment"));
console.log("PASS: all "+fragments+" original excerpts preserved; "+pericopes+" pericopes; "+qRows+" question-mark excerpts; "+batches+" complete, nonduplicating review batches");
