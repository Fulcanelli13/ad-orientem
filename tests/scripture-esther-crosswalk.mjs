import assert from "node:assert/strict";
import {ESTHER_SOURCE_BLOCKS,ESTHER_CROSSWALK_STATUS,estherParallelVerse,estherCrosswalkCoverage} from "../src/scripture/esther-catholic-crosswalk.js";
import {scriptureParallelReferenceState} from "../src/scripture/reference-safety.js";
assert.equal(ESTHER_SOURCE_BLOCKS.length,25);
assert.deepEqual(estherCrosswalkCoverage(),{cpdv:274,douayRheims:275});
assert.equal(ESTHER_CROSSWALK_STATUS.theologicalApproval,"not-implied");
for(const [cpch,cpv,drch,drv] of [[1,1,11,2],[2,1,12,1],[3,1,1,1],[6,8,3,14],
 [7,10,15,2],[7,16,15,1],[7,20,13,8],[8,1,14,1],[9,1,15,4],[9,17,5,1],
 [13,25,8,13],[15,14,11,1]]){
 const cp={book:"Esther",chapter:cpch,verseStart:cpv,verseEnd:cpv};
 const dr=estherParallelVerse(cp,"cpdv-2009","dr-challoner");
 assert.deepEqual(dr,{book:"Esther",chapter:drch,verseStart:drv,verseEnd:drv});
 const reverse=estherParallelVerse({book:"Esther",chapter:drch,verseStart:drv,verseEnd:drv},"dr-challoner","cpdv-2009");
 assert.deepEqual(reverse,cp);
}
assert.deepEqual(estherParallelVerse({book:"Esther",chapter:7,verseStart:14,verseEnd:14},"cpdv-2009","dr-challoner"),
 {book:"Esther",chapter:4,verseStart:12,verseEnd:13});
for(const verse of [12,13])assert.deepEqual(
 estherParallelVerse({book:"Esther",chapter:4,verseStart:verse,verseEnd:verse},"dr-challoner","cpdv-2009"),
 {book:"Esther",chapter:7,verseStart:14,verseEnd:14});
assert.equal(estherParallelVerse({book:"Esther",chapter:4,verseStart:11,verseEnd:15},"dr-challoner","cpdv-2009"),null);
assert.equal(scriptureParallelReferenceState({book:"Esther",chapter:4,verseStart:11,verseEnd:15},"dr-challoner","cpdv-2009").canAutoParallel,false);
assert.equal(scriptureParallelReferenceState({book:"SongOfSongs",chapter:1,verseStart:1},"dr-challoner","cpdv-2009").canAutoParallel,true);
assert.equal(scriptureParallelReferenceState({book:"Psalms",chapter:22,verseStart:1},"dr-challoner","cpdv-2009").canAutoParallel,false);
assert.equal(scriptureParallelReferenceState({book:"Esther",chapter:11,verseStart:2},"dr-challoner","cpdv-2009").reference.chapter,1);
console.log("Catholic Esther 274-to-275 chapter/verse crosswalk and merged-verse safeguards passed");
