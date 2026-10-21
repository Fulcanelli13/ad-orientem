/*
 * Living Catena: verify research-only Augustine/Eusebius Quaestiones joins.
 * Checks only CANONICAL Catena text identity, ordinal and Scripture mapping.
 * Does not establish modern critical-edition authorship or translation rights.
 * Run: node tests/scripture-catena-quaestiones-crosswalk.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const q=read("data/scripture/catena/research/quaestiones-primary-source-crosswalk.v1.json");
const manifest=read("data/scripture/catena/manifest.v1.json");
assert.equal(manifest.totalPericopes,814);
assert.equal(manifest.totalFragments,12692);
assert.equal(q.schema,"ao.catena.primary-quaestiones-crosswalk.v1");
assert.equal(q.status,"research_only_not_publication_approved");
assert.equal(q.records.length,7);
const corpus=new Map();
const keys=new Set();
for(const gospel of ["matthew","mark","luke","john"]){
  const pack=read("data/scripture/catena/"+gospel+".json");
  for(const p of pack.pericopes){
    assert.ok(!corpus.has(p.id),"duplicate pericope "+p.id);
    corpus.set(p.id,p);
    for(const v of p.verse_keys)keys.add(v);
  }
}
assert.equal(corpus.size,814);
const ids=new Set();
let sameWork=0,nonDirect=0;
const allowed=new Set(q.originDistinction);
for(const r of q.records){
  assert.ok(!ids.has(r.id),"duplicate source issue "+r.id); ids.add(r.id);
  assert.ok(allowed.has(r.questionOrigin),"unclassified historic question origin");
  assert.ok(r.primaryTextUrl.startsWith("https://"),"missing primary source URL");
  assert.ok(r.sourceAnchor.length>12,"missing source-language anchor");
  assert.ok(r.readerFacingQuestionEditorial.endsWith("?"),"modern question missing marker");
  assert.ok(r.scriptureKeys.length>0);
  for(const key of r.scriptureKeys)assert.ok(keys.has(key),"missing canonical verse "+key);
  assert.ok(!("generatedFatherReply" in r),"no authored fake dialogue is permitted");
  assert.ok(!("fullAnswerTranslation" in r),"translations must not bypass provenance gate");
  for(const m of r.catenaMatches){
    const p=corpus.get(m.pericopeId);
    assert.ok(p,"missing Catena pericope "+m.pericopeId);
    assert.ok(m.ordinal>=1&&m.ordinal<=p.segments.length,"invalid source segment ordinal");
    const segment=p.segments[m.ordinal-1];
    assert.equal(segment.father,m.attributionAsInCatena,"changed historical Father label");
    assert.ok(segment.text.includes(m.sourceTextAnchor),"unmatched original segment phrase");
    assert.ok(p.verse_keys.some(k=>r.scriptureKeys.includes(k)),"unrelated verse");
    if(m.relation==="quoted_same_ancient_work_in_catena"){
      sameWork++;
      assert.equal(r.author,"Augustine of Hippo");
      assert.match(segment.text.slice(0,100),/\(.*(?:Quæst|Qu\. Ev)/i,
        "same-work assertion must be explicitly cited within Catena");
    }else{
      nonDirect++;
      assert.ok(["thematically_related_different_augustine_work","probable_parallel_pending_line_by_line_alignment"].includes(m.relation),
        "unknown relationship class");
      assert.ok(!m.relation.includes("quoted_same"),"do not upgrade weaker parallels");
    }
  }
}
assert.equal(sameWork,4,"four direct Augustine same-work excerpts");
assert.equal(nonDirect,3,"two other-work links and one Eusebius parallel");
assert.equal(q.records.filter(r=>r.author==="Eusebius of Caesarea").length,2);
assert.equal(q.records.filter(r=>r.questionOrigin==="historical_correspondent_question_as_reported_by_author").length,1);
assert.ok(q.englishTranslationPolicy.includes("No new independently publishable"));
console.log("PASS: 7 source-anchored research issues; 4 same-work Catena links, 3 qualified related links.");
