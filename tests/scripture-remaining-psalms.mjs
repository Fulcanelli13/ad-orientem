import assert from "node:assert/strict";
import {OUTSTANDING_PSALMS,inspectRemainingPsalmChapter,auditRemainingPsalms} from "../tools/scripture/audit-remaining-catholic-psalms.mjs";
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
console.log("13 unresolved Catholic Psalms: conservative per-verse and source-context audit contracts passed");
