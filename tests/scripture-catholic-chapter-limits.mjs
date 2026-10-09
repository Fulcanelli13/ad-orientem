import assert from "node:assert/strict";
import {CATHOLIC_BOOK_IDS} from "../src/scripture/canon.js";
import {scripturePassage} from "../src/scripture/catalogue.js";
import {CATHOLIC_CHAPTER_COUNTS,scriptureChapterExists,scriptureChapterLimit,
  resolveCatholicBookName,SCRIPTURE_CHAPTER_AUTHORITY} from "../src/scripture/chapter-counts.js";
import {parseScriptureContext,verifiedScriptureCommentary} from "../src/scripture/context.js";
import {readFileSync} from "node:fs";

assert.equal(CATHOLIC_BOOK_IDS.length,73);
assert.equal(Object.keys(CATHOLIC_CHAPTER_COUNTS).length,73);
assert.deepEqual(Object.keys(CATHOLIC_CHAPTER_COUNTS).sort(),[...CATHOLIC_BOOK_IDS].sort());
for(const id of CATHOLIC_BOOK_IDS){
 const limit=scriptureChapterLimit(id);
 assert.ok(Number.isSafeInteger(limit)&&limit>=1,id);
 assert.equal(scriptureChapterExists(id,1),true);
 assert.equal(scriptureChapterExists(id,limit),true);
 assert.equal(scriptureChapterExists(id,limit+1),false);
 assert.equal(resolveCatholicBookName(id),id);
 assert.deepEqual(scripturePassage({book:id,chapter:limit,verseStart:1}),
   {book:id,chapter:limit,verseStart:1,verseEnd:1});
 assert.throws(()=>scripturePassage({book:id,chapter:limit+1,verseStart:1}),
   /Chapter beyond Catholic/);
}
assert.equal(SCRIPTURE_CHAPTER_AUTHORITY.countConvention,"CATHOLIC_VULGATE_DOUAY");
for(const [book,max] of [["Esther",16],["Daniel",14],["Baruch",6],
  ["Tobit",14],["Sirach",51],["Psalms",150],["Revelation",22],
  ["Obadiah",1],["2John",1]]){
 assert.equal(scriptureChapterLimit(book),max,book);
}
for(const [alias,book] of [
 ["1 Cor 6:18–20","1Corinthians"],
 ["2 Corinthiens 5:17","2Corinthians"],
 ["Apocalypse 12:1","Revelation"],
 ["Sagesse 7:26","Wisdom"],
 ["Siracide 2:1","Sirach"],
 ["2 Maccabées 12:45","2Maccabees"],
 ["3 Kings 18:38","1Kings"],
 ["1 Pierre 3:15","1Peter"],
 ["Éphésiens 5:21–33","Ephesians"],
 ["Jean 1:1","John"],
 ["Luc 1:46–55","Luke"],
 ["Matthieu 6:9–13","Matthew"],
 ["Ct 4:7","SongOfSongs"],
 ["Tobie 12:15","Tobit"],
 ["Daniel 14:2","Daniel"],
 ["Baruch 6:1","Baruch"]
]){
 assert.equal(parseScriptureContext(alias)?.passage.book,book,alias);
}
for(const invalid of ["Genesis 51:1","Luke 25:1","Esther 17:1",
 "Baruch 7:1","Revelation 23:1","Psalms 151:1",
 "Not A Bible 3:1","Luke 1:0","Luke 1:10–2"]){
 assert.equal(parseScriptureContext(invalid),null,invalid);
}
assert.equal(verifiedScriptureCommentary(parseScriptureContext("Luke 1:26–38").passage)?.type,"PATRISTIC_COMPILATION");
assert.equal(verifiedScriptureCommentary(parseScriptureContext("Luke 1:46–55").passage)?.url,
 "https://www.ecatholic2000.com/catena/untitled-62.shtml");
assert.equal(verifiedScriptureCommentary(parseScriptureContext("Luke 1:68").passage),null,
 "Benedictus chapter proximity must not fabricate passage-specific commentary");
assert.equal(verifiedScriptureCommentary(parseScriptureContext("John 1:1").passage),null);
for(const chapter of [1,6,31,37,50,101,116,129,142,150]){
 const record=verifiedScriptureCommentary(parseScriptureContext("Psalms "+chapter+":1").passage);
 assert.equal(record?.type,"HISTORIC_CATHOLIC_EXEGESIS");
 assert.equal(record?.scope,"PSALM_SECTION_IN_COMPLETE_WORK");
 assert.equal(record?.psalmNumbering,"VULGATE_TRADITIONAL");
 assert.match(record?.url||"",/ecatholic2000.com\/bellarmine\/commentary-on-psalms/);
 assert.match(record?.title||"",new RegExp("Psalm "+chapter+"$"));
}
assert.equal(verifiedScriptureCommentary({book:"Psalms",chapter:151,verseStart:1}),null);

assert.match(readFileSync(new URL("../src/scripture/library.js",import.meta.url),"utf8"),
 /location\.chapter>=scriptureChapterLimit\(location\.book\)/,
 "Next chapter must disable at the last chapter");
console.log("PASS canonical 73-book Scripture chapter bounds, bilingual locators and scoped authentic commentary");
