import assert from "node:assert/strict";
import {SONG_CROSSWALK_ENDS,SONG_CROSSWALK_STATUS,songParallelVerse,songCrosswalkCoverage} from "../src/scripture/song-catholic-crosswalk.js";
import {PSALTER_SOURCE_REGIONS,PSALTER_EXCEPTION_STATUS,psalterParallelVerse} from "../src/scripture/psalter-exception-crosswalk.js";
import {scriptureParallelReferenceState} from "../src/scripture/reference-safety.js";
assert.deepEqual(songCrosswalkCoverage(),{cpdv:127,douayRheims:116});
assert.equal(SONG_CROSSWALK_STATUS.doctrinalCertification,"NOT_CLAIMED");
for(const [chText,ends] of Object.entries(SONG_CROSSWALK_ENDS)){
 const chapter=Number(chText),last=ends.at(-1);
 for(let dr=1;dr<=ends.length;dr++){
  const forward=songParallelVerse({book:"SongOfSongs",chapter,verseStart:dr,verseEnd:dr},"dr-challoner","cpdv-2009");
  assert.equal(forward.verseStart,(ends[dr-2]||0)+1);
  assert.equal(forward.verseEnd,ends[dr-1]);
  for(let cp=forward.verseStart;cp<=forward.verseEnd;cp++){
   const rev=songParallelVerse({book:"SongOfSongs",chapter,verseStart:cp,verseEnd:cp},"cpdv-2009","dr-challoner");
   assert.equal(rev.verseStart,dr);assert.equal(rev.verseEnd,dr);
  }
 }
 assert.ok(last>=ends.length);
}
assert.deepEqual(songParallelVerse({book:"SongOfSongs",chapter:1,verseStart:1,verseEnd:1},"dr-challoner","cpdv-2009"),
 {book:"SongOfSongs",chapter:1,verseStart:1,verseEnd:2});
assert.deepEqual(songParallelVerse({book:"SongOfSongs",chapter:5,verseStart:2,verseEnd:2},"dr-challoner","cpdv-2009"),
 {book:"SongOfSongs",chapter:5,verseStart:3,verseEnd:4});
assert.equal(songParallelVerse({book:"SongOfSongs",chapter:1,verseStart:1,verseEnd:3},"dr-challoner","cpdv-2009"),null);
assert.equal(PSALTER_SOURCE_REGIONS.length,27);
for(const x of PSALTER_SOURCE_REGIONS){
 const f=psalterParallelVerse({book:"Psalms",chapter:x.chapter,verseStart:x.cpdvVerse,verseEnd:x.cpdvVerse},"cpdv-2009","dr-challoner");
 assert.deepEqual(f,{book:"Psalms",chapter:x.chapter,verseStart:x.douayStart,verseEnd:x.douayEnd});
}
assert.equal(psalterParallelVerse({book:"Psalms",chapter:92,verseStart:1,verseEnd:1},"cpdv-2009","dr-challoner"),null);
assert.equal(psalterParallelVerse({book:"Psalms",chapter:150,verseStart:6,verseEnd:6},"dr-challoner","cpdv-2009"),null);
assert.deepEqual(psalterParallelVerse({book:"Psalms",chapter:42,verseStart:5,verseEnd:5},"dr-challoner","cpdv-2009"),
 {book:"Psalms",chapter:42,verseStart:4,verseEnd:5});
assert.deepEqual(PSALTER_EXCEPTION_STATUS.unmappedCpdv,["92:1"]);
assert.equal(scriptureParallelReferenceState({book:"SongOfSongs",chapter:7,verseStart:1},"cpdv-2009","dr-challoner").canAutoParallel,true);
assert.equal(scriptureParallelReferenceState({book:"Psalms",chapter:13,verseStart:5},"cpdv-2009","dr-challoner").reference.verseStart,3);
assert.equal(scriptureParallelReferenceState({book:"Psalms",chapter:88,verseStart:37},"cpdv-2009","dr-challoner").canAutoParallel,false);
assert.equal(scriptureParallelReferenceState({book:"Psalms",chapter:92,verseStart:1},"cpdv-2009","dr-challoner").canAutoParallel,false);
console.log("Complete Song 127↔116 crosswalk and 27 Psalm exception spans: canonical source safety passed");
