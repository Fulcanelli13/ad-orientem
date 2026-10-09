import assert from "node:assert/strict";
import { CATHOLIC_BOOK_IDS } from "../src/scripture/canon.js";
import { validateScriptureImport } from "../src/scripture/import-contract.js";
import { loadScriptureBook } from "../src/scripture/pack-loader.js";
const approved={
  rightsReview:"approved",versificationReview:"approved",editionReview:"approved",
  sourceUrl:"https://example.org/TEST-NOT-SCRIPTURE",sourceEdition:"UNIT TEST FIXTURE",
  licenceId:"TEST-ONLY",reviewer:"test",reviewDate:"2026-10-09"
};
const makeBook=(id)=>({id,chapters:Array.from({length:16},(_,c)=>({
  number:c+1,verses:Array.from({length:30},(_,v)=>({number:v+1,text:"TEST DATA ONLY. NOT A BIBLE VERSE."}))
}))});
const full=validateScriptureImport({editionId:"dr-challoner",provenance:approved,
 books:CATHOLIC_BOOK_IDS.map(makeBook)});
assert.equal(full.valid,true,full.failures.join("; "));
assert.equal(full.bookCount,73);
assert.equal(full.verseCount,73*16*30);
const short=validateScriptureImport({editionId:"dr-challoner",provenance:approved,
 books:CATHOLIC_BOOK_IDS.map(id=>({id,chapters:[{number:1,verses:[{number:1,text:"UNIT TEST"}]}]}))});
assert.equal(short.valid,false);
assert.ok(short.failures.some(x=>x.includes("Incomplete Bible verses")));
const missing=validateScriptureImport({editionId:"dr-challoner",provenance:approved,
 books:CATHOLIC_BOOK_IDS.slice(0,72).map(makeBook)});
assert.equal(missing.valid,false);
const stolen=validateScriptureImport({editionId:"dr-challoner",provenance:{...approved,rightsReview:"pending"},
 books:CATHOLIC_BOOK_IDS.map(makeBook)});
assert.equal(stolen.valid,false);
await assert.rejects(loadScriptureBook("knox","Luke"),/not cleared/);
await assert.rejects(loadScriptureBook("dr-challoner","Luke"),/not cleared/);
console.log("Complete Catholic Bible import threshold and safe offline loader tests passed");
