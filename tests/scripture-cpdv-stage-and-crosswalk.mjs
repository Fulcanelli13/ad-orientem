import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { CATHOLIC_BOOK_IDS } from "../src/scripture/canon.js";
import { stageCpdvBook,stagingSummary } from "../tools/scripture/stage-cpdv-original-packs.mjs";
import { scriptureParallelReferenceState,scriptureReferenceWarning } from "../src/scripture/reference-safety.js";
import {CPDV_AUTHOR_BOOK_URLS,cpdvAuthorBookUrl} from "../src/scripture/cpdv-primary-links.js";
const good={editionId:"cpdv-2009",book:"John",
 status:"RESEARCH_ONLY_AWAITING_TEXT_AND_THEOLOGICAL_CERTIFICATION",
 sourceUrl:"https://sacredbible.org/catholic/NT-04_John.htm",
 sourceSha256:"a".repeat(64),verses:[
 {chapter:1,verse:1,text:"UNIT TEST; NOT A BIBLE TEXT."},
 {chapter:1,verse:2,text:"UNIT TEST; NOT A BIBLE TEXT."},
 {chapter:2,verse:1,text:"UNIT TEST; NOT A BIBLE TEXT."}]};
const b=stageCpdvBook(good);
assert.equal(b.verseCount,3);
assert.equal(b.chapterCount,2);
assert.ok(b.records.every(x=>x.reviewed===false && x.editorialStatus.includes("PENDING")));
assert.throws(()=>stageCpdvBook({...good,book:"NonCanonical"}),/Not a Catholic/);
assert.throws(()=>stageCpdvBook({...good,sourceSha256:"bad"}),/SHA-256/);
assert.throws(()=>stageCpdvBook({...good,status:"APPROVED"}),/Cannot stage/);
assert.throws(()=>stageCpdvBook({...good,verses:[...good.verses,good.verses[0]]}),/Duplicate/);
assert.throws(()=>stageCpdvBook({...good,verses:[{chapter:1,verse:1,text:"x"},{chapter:1,verse:3,text:"y"}]}),/Verse sequence gap/);
assert.throws(()=>stagingSummary([b]),/Incomplete original/);
const p={book:"Esther",chapter:1,verseStart:1};
const e=scriptureParallelReferenceState(p,"dr-challoner","cpdv-2009");
assert.equal(e.kind,"source-collated-esther-single-verse");assert.equal(e.canAutoParallel,true);
assert.deepEqual(e.reference,{book:"Esther",chapter:3,verseStart:1,verseEnd:1});
for(const book of ["Esther","Psalms","SongOfSongs"]){
 assert.ok(scriptureReferenceWarning(book,"en"));
 assert.ok(scriptureReferenceWarning(book,"fr"));
 if(book==="Esther")assert.equal(scriptureParallelReferenceState({book,chapter:1,verseStart:1},"cpdv-2009","dr-challoner").canAutoParallel,true);
 else assert.equal(scriptureParallelReferenceState({book,chapter:1,verseStart:1},"cpdv-2009","dr-challoner").canAutoParallel,true);
}
const j=scriptureParallelReferenceState({book:"John",chapter:1,verseStart:1},"cpdv-2009","dr-challoner");
assert.equal(j.kind,"provisional-coordinates-only");assert.equal(j.canAutoParallel,false);
assert.equal(scriptureParallelReferenceState({book:"John",chapter:1,verseStart:1},"cpdv-2009","cpdv-2009").canAutoParallel,true);
assert.equal(Object.keys(CPDV_AUTHOR_BOOK_URLS).length,73);
assert.equal(new Set(Object.values(CPDV_AUTHOR_BOOK_URLS)).size,73);
assert.equal(cpdvAuthorBookUrl("Luke"),"https://sacredbible.org/catholic/NT-03_Luke.htm");
assert.equal(cpdvAuthorBookUrl("1Maccabees"),"https://sacredbible.org/catholic/OT-45_1-Maccabees.htm");
assert.equal(cpdvAuthorBookUrl("SongOfSongs"),"https://sacredbible.org/catholic/OT-24_Song2.htm");
assert.throws(()=>cpdvAuthorBookUrl("GospelOfThomas"),/Unknown/);
console.log("CPDV 73-book staged pack, publisher source links and cross-edition safety contracts passed");
