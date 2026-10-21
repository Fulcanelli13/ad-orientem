/*
 * Research-only Eusebius Marinus supplements: identifiers and source linkage.
 * This test guards navigation; it does not license an English translation,
 * certify an ancient attribution, or produce dialogue.
 * Run: node tests/scripture-catena-eusebius-supplement.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const x=load("data/scripture/catena/research/eusebius-marinus-supplement-problem-index.v1.json");
assert.equal(x.schema,"ao.catena.eusebius-marinus-supplement-problem-index.v1");
assert.equal(x.status,"research_only_no_father_dialogue_publication");
assert.equal(x.entries.length,3);
assert.equal(x.relationToCanonicalCatena,"independent_external_witness_not_a_copied_catena_excerpt");
const verseSet=new Set();
for(const gospel of ["matthew","mark","luke","john"]){
 const pack=load("data/scripture/catena/"+gospel+".json");
 for(const p of pack.pericopes)for(const key of p.verse_keys)verseSet.add(key);
}
const ids=new Set(),numbers=new Set();
for(const item of x.entries){
 assert.ok(!ids.has(item.id));ids.add(item.id);
 assert.match(item.workLocator,/^Supplement (IV|V|XI)$/);
 numbers.add(item.workLocator);
 assert.ok(item.sourceGreekAnchor.length>15);
 assert.ok(item.primarySourceUrl.startsWith("https://catholiclibrary.org/library/view?chunk.id="));
 assert.ok(item.editorialQuestion.endsWith("?"));
 assert.ok(item.sourceContextNote.length>30);
 assert.ok(!("answer" in item),"do not copy modern copyrighted translations");
 assert.ok(!("speakerReply" in item),"do not create Father dialogue");
 for(const key of item.scriptureKeys)assert.ok(verseSet.has(key),"missing canonical Scripture key "+key);
}
assert.deepEqual([...numbers].sort(),["Supplement IV","Supplement V","Supplement XI"].sort());
console.log("PASS: three independent, non-published Eusebius issues anchored to canonical Scripture keys");
