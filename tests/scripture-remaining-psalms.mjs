import assert from "node:assert/strict";
import {OUTSTANDING_PSALMS,inspectRemainingPsalmChapter,auditRemainingPsalms} from "../tools/scripture/audit-remaining-catholic-psalms.mjs";
import {PSALTER_REMAINDER_VERIFIED,psalterRemainderParallelVerse} from "../src/scripture/psalter-remainder-crosswalk.js";
import {scriptureParallelReferenceState} from "../src/scripture/reference-safety.js";
assert.deepEqual(OUTSTANDING_PSALMS,[16,64,73,75,76,77,88,101,108,111,115,120,137]);
const strong=[
"The Lord is my strength and I will rejoice in his salvation",
"He delivers his faithful people from the darkness of the valley",
"Sing a new canticle to God who is the hope of the nations",
"His mercy will protect the lowly and raise the just",
"Blessed are those who trust in him throughout their lives"
];
const a=new Map(strong.map((x,i)=>[i+1,x]));
const perfect=inspectRemainingPsalmChapter(16,a,a);
assert.equal(perfect.eligibleCount,5);
assert.equal(perfect.blockedCount,0);
const flipped=new Map(a);flipped.set(3,"The mighty mountains speak a different covenant of silence");
const mixed=inspectRemainingPsalmChapter(16,a,flipped);
assert.equal(mixed.eligibleVerses.includes(3),false);
const moved=new Map(a);moved.set(2,strong[2]);moved.set(3,strong[1]);
const testShift=inspectRemainingPsalmChapter(16,a,moved);
assert.equal(testShift.eligibleVerses.includes(2),false);
assert.equal(testShift.eligibleVerses.includes(3),false);
const missing=new Map(a);missing.delete(4);
assert.equal(inspectRemainingPsalmChapter(16,a,missing).eligibleCount,0,"Missing Catholic target numbering invalidates chapter");
assert.throws(()=>inspectRemainingPsalmChapter(13,a,a),/Not one of/);
const cp={editionId:"cpdv-2009",book:"Psalms",sourceUrl:"https://sacredbible.org/catholic/OT-21_Psalms.htm",sourceSha256:"f".repeat(64),verses:Array.from({length:150},(_,i)=>strong.map((text,j)=>({chapter:i+1,verse:j+1,text}))).flat()};
const dr={books:[{id:"Psalms",chapters:Array.from({length:150},(_,i)=>({number:i+1,verses:strong.map((text,j)=>({number:j+1,text}))}))}]};
const report=auditRemainingPsalms(dr,cp);
assert.equal(report.chapters,13);
assert.equal(report.totalCandidateVerses,65);
assert.equal(report.totalUnresolvedVerses,0);
assert.equal(report.textApprovedForPublication,false);
assert.equal(report.status,"REVIEW-REQUIRED-BEFORE-INCORPORATING-ANY-VERSE");
assert.equal(Object.keys(PSALTER_REMAINDER_VERIFIED).length,13);
assert.equal(Object.values(PSALTER_REMAINDER_VERIFIED).reduce((n,v)=>n+v.length,0),254);
for(const [chapter,verses] of Object.entries(PSALTER_REMAINDER_VERIFIED)){
 for(const verseStart of verses){
  const p={book:"Psalms",chapter:Number(chapter),verseStart,verseEnd:verseStart};
  assert.deepEqual(psalterRemainderParallelVerse(p,"cpdv-2009","dr-challoner"),p);
  assert.deepEqual(psalterRemainderParallelVerse(p,"dr-challoner","cpdv-2009"),p);
  assert.equal(scriptureParallelReferenceState(p,"cpdv-2009","dr-challoner").canAutoParallel,true);
 }
}
for(const [chapter,verseStart] of [[16,7],[64,14],[73,22],[75,5],[77,29],[88,37],[101,8],[108,12],[111,6],[115,1],[120,8],[137,6]]){
 assert.equal(psalterRemainderParallelVerse({book:"Psalms",chapter,verseStart,verseEnd:verseStart},"cpdv-2009","dr-challoner"),null);
 assert.equal(scriptureParallelReferenceState({book:"Psalms",chapter,verseStart},"dr-challoner","cpdv-2009").canAutoParallel,false);
}
assert.equal(psalterRemainderParallelVerse({book:"Psalms",chapter:16,verseStart:1,verseEnd:2},"cpdv-2009","dr-challoner"),null);
console.log("13-Psalm audit plus 254 verified mappings and unresolved fail-closed references passed");
