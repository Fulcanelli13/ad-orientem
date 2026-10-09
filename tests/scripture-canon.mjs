import assert from "node:assert/strict";
import { CATHOLIC_BOOK_IDS, isCatholicBookId } from "../src/scripture/canon.js";
import { scripturePassage } from "../src/scripture/catalogue.js";
assert.equal(CATHOLIC_BOOK_IDS.length,73);
assert.equal(new Set(CATHOLIC_BOOK_IDS).size,73);
for (const id of CATHOLIC_BOOK_IDS) {
  assert.equal(isCatholicBookId(id),true);
  assert.equal(scripturePassage({book:id,chapter:1,verseStart:1}).book,id);
}
for (const id of ["3Maccabees","4Esdras","GospelOfThomas","PrayerOfManasseh","Unknown"]) {
  assert.equal(isCatholicBookId(id),false);
  assert.throws(() => scripturePassage({book:id,chapter:1,verseStart:1}));
}
console.log("Catholic 73-book canon contracts passed");
