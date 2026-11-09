import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const fixture=read("./fixtures/office/advent-iii-feria-ii-compline-la.json");
const proof=read("../data/office/research/compline-monday-2026-independent-clementine-fullword.v1.json");
const words=text=>String(text).replace(/\u009c/gu,"œ")
 .replace(/[ǽǼæÆ]/gu,"ae").replace(/[œŒ]/gu,"oe")
 .normalize("NFD").replace(/\p{M}/gu,"")
 .toLowerCase().replaceAll("j","i").replaceAll("v","u")
 .match(/[a-z]+/gu)||[];
function original(number){
 return fixture.psalms[number].text.trim().split(/\r?\n/u).map(row=>{
  assert.match(row,new RegExp("^"+number+":\\d+[ab]?\\s","u"));
  return row.replace(/^\d+:\d+[ab]?\s+/u,"")
   .replace(/\(\d+[ab]?\)/gu,"")
   .replace(/[†‡*]/gu,"");
 }).join(" ");
}
test("Monday Psalm 6 and Psalm 7 are complete independently archived pinned and Clementine 337-word originals",()=>{
 assert.equal(fixture.sourceRevision,proof.pinned.revision);
 assert.equal(proof.independent.revision,
  "1f7093a14fa61374b0fe85db1965d9bd45dfdae1");
 assert.equal(proof.independent.path,"latin/Ps.lat");
 assert.equal(proof.originalMame1961PsalterLeafCollated,false);
 assert.deepEqual(Object.keys(fixture.psalms),["6","7"]);
 assert.equal(fixture.sources[6].sha,
  "5b4988836f690268e2a029f7ef8c27eb0ecfd814");
 assert.equal(fixture.sources[7].sha,
  "2b6d1a429ff50523279a6f794a44067e00ff76ea");
 assert.equal(proof.fullLatinWords,337);
 assert.equal(proof.recitationStichs,28);
 assert.deepEqual(proof.orthographicExceptions,[]);
 assert.equal(proof.substantiveDifferences,0);
 assert.equal(proof.missingWords,0);
});
test("all 337 Latin words and all 28 original source stichs are exact, with zero orthographic deviations",()=>{
 let totalWords=0,totalStichs=0;
 for(const number of [6,7]){
  const originalWords=words(original(number));
  const independentlyTranscribed=words(proof.psalms[number].latin);
  const stichs=fixture.psalms[number].text.trim().split(/\r?\n/u);
  assert.deepEqual(originalWords,independentlyTranscribed,
   "Unapproved complete Latin difference Psalm "+number);
  assert.equal(stichs.length,proof.psalms[number].recitationStichs);
  assert.equal(originalWords.length,proof.psalms[number].pinnedWords);
  assert.equal(independentlyTranscribed.length,
   proof.psalms[number].independentWords);
  totalWords+=originalWords.length;
  totalStichs+=stichs.length;
 }
 assert.equal(totalWords,337);
 assert.equal(totalStichs,28);
});
test("original Psalm 7 source preserves two split recitation stichs and parenthetical canonical numbering stays unspoken",()=>{
 const lines=fixture.psalms[7].text.trim().split(/\r?\n/u);
 assert.deepEqual(lines.map(x=>x.split(/\s/u)[0]),[
  "7:2","7:3","7:4","7:5","7:6",
  "7:7a","7:7b","7:8b","7:9b","7:10",
  "7:11","7:12","7:13","7:14",
  "7:15","7:16","7:17","7:18"
 ]);
 assert.match(lines[6],/\(8a\)/u);
 assert.match(lines[7],/\(9a\)/u);
 assert.equal(words(original(7)).length,214);
});
test("mutation, missing or extra Latin words never compare equal to independent Psalm 6/7 source",()=>{
 for(const number of [6,7]){
  const all=words(original(number));
  const independently=words(proof.psalms[number].latin);
  assert.deepEqual(all,independently);
  const changed=[...all];changed[Math.floor(changed.length/2)]="alteratum";
  assert.notDeepEqual(changed,independently);
  assert.notDeepEqual(all.slice(1),independently);
  assert.notDeepEqual([...all,"insertum"],independently);
 }
});
