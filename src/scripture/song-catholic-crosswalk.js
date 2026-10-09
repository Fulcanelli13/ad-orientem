/**
 * Song of Songs: complete source-order correspondence.
 * Each array gives the final CPDV verse of one successive D–R verse.
 * Chapters with unchanged verse divisions are identity.
 * Source witnesses: CPDV author's current /catholic/OT-24_Song2.htm
 * and pinned Douay–Rheims Challoner 73-book source.
 *
 * CPDV has 127 verses across eight chapters, D–R has 116.
 * Eleven CPDV verse breaks split existing Catholic D–R verses.
 * This is textual verse correspondence, NOT ecclesiastical approval.
 */
const ENDS=Object.freeze({
 1:Object.freeze([2,3,7,8,10,11,12,13,14,15,16,17,18,19,20,21]),
 2:Object.freeze([1,2,3,4,5,6,7,8,10,12,13,14,15,16,17,18,19]),
 3:Object.freeze(Array.from({length:11},(_,i)=>i+1)),
 4:Object.freeze(Array.from({length:16},(_,i)=>i+1)),
 5:Object.freeze([2,4,...Array.from({length:15},(_,i)=>i+5)]),
 6:Object.freeze(Array.from({length:12},(_,i)=>i+1)),
 7:Object.freeze(Array.from({length:13},(_,i)=>i+2)),
 8:Object.freeze([1,2,3,4,6,...Array.from({length:9},(_,i)=>i+7)])
});
export const SONG_CROSSWALK_ENDS=ENDS;
const cpToDr=new Map(),drToCp=new Map();
for(const [chapterText,ends] of Object.entries(ENDS)){
 const chapter=Number(chapterText);
 let prev=0;
 for(let i=0;i<ends.length;i++){
  const final=ends[i],drVerse=i+1;
  if(final<=prev)throw Error("Unordered Song source alignment");
  const douay={book:"SongOfSongs",chapter,verseStart:drVerse,verseEnd:drVerse};
  const cpdv={book:"SongOfSongs",chapter,verseStart:prev+1,verseEnd:final};
  drToCp.set(chapter+":"+drVerse,Object.freeze(cpdv));
  for(let c=prev+1;c<=final;c++){
   const key=chapter+":"+c;
   if(cpToDr.has(key))throw Error("Repeated Song CPDV verse "+key);
   cpToDr.set(key,Object.freeze(douay));
  }
  prev=final;
 }
}
if(cpToDr.size!==127||drToCp.size!==116)
 throw Error("Incomplete Catholic Song crosswalk 127 ↔ 116");
export const SONG_CROSSWALK_STATUS=Object.freeze({
 cpdvVerses:127,douayVerses:116,
 sourceReview:"both Catholic editions compared sequentially",
 doctrinalCertification:"NOT_CLAIMED",
 nontrivialChapters:Object.freeze([1,2,5,7,8])
});
export function songParallelVerse(reference,from,to){
 if(reference?.book!=="SongOfSongs"||reference.verseStart!==reference.verseEnd)return null;
 if(from==="cpdv-2009"&&to==="dr-challoner")
  return cpToDr.get(reference.chapter+":"+reference.verseStart)??null;
 if(from==="dr-challoner"&&to==="cpdv-2009")
  return drToCp.get(reference.chapter+":"+reference.verseStart)??null;
 return null;
}
export function songCrosswalkCoverage(){
 return Object.freeze({cpdv:cpToDr.size,douayRheims:drToCp.size});
}
