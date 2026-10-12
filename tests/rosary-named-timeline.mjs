import assert from "node:assert/strict";
import {rosaryNamedChapters,rosaryCurrentChapter} from "../src/pray/rosary-card-chapters.js";
import {rosaryAdjacentChapter} from "../src/pray/rosary-active-card.js";
const rows=[{kind:"prayer"},{kind:"opening"},{mi:0,kind:"mystery"},{mi:0,kind:"bead"},{mi:0,kind:"bead"},{mi:1,kind:"mystery"},{mi:1,kind:"bead"},{kind:"closing"}];
const chapters=rosaryNamedChapters(rows,{titles:["Annunciation","Visitation"]});
assert.deepEqual(chapters.map(x=>[x.id,x.start,x.end]),[
 ["opening",0,1],["mystery-1",2,4],["mystery-2",5,6],["conclusion",7,7]]);
assert.equal(chapters[1].title,"Annunciation");
assert.deepEqual(rows.map((_,i)=>rosaryCurrentChapter(chapters,i)),[0,0,1,1,1,2,2,3]);
assert.equal(rosaryNamedChapters([],{}).length,0);
assert.equal(rosaryAdjacentChapter(chapters,2,1)?.id,"mystery-2");
assert.equal(rosaryAdjacentChapter(chapters,5,-1)?.id,"mystery-1");
assert.equal(rosaryAdjacentChapter(chapters,7,1),null);
assert.equal(rosaryAdjacentChapter(chapters,0,-1),null);

assert.equal(rosaryNamedChapters([{kind:"prayer"}],{french:true})[0].title,"Prières du Rosaire");
const source=(await import("node:fs")).readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(source,/installRosaryNamedTimeline\(r\)/);
assert.match(source,/AO_ROSARY_V381\.setStep\(start\)/);
assert.doesNotMatch(source,/rosaryNamedChapters\([^\n]+\)\.splice/);
console.log("PASS source-owned Rosary named chapter grouping and canonical step delegation");
