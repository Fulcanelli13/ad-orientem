import assert from "node:assert/strict";
import {bookFromMasterLabel,findMasterBookLinks,parseMasterBookVerses,comparisonWords} from "../tools/scripture/collate-cpdv-master.mjs";
for(const [label,id] of [["1 Samuel","1Samuel"],["2 Maccabees","2Maccabees"],["Acts of the Apostles","Acts"],["Song of Songs","SongOfSongs"]]){
 assert.equal(bookFromMasterLabel(label),id);
}
assert.equal(bookFromMasterLabel("The Four Gospels"),null);
const sample='<a href="NT-11_Philippians.htm">Philippians</a><a href="OT-01_Genesis.htm">Genesis</a>';
const links=findMasterBookLinks(sample);
assert.equal(links.size,2);
assert.equal(links.get("Philippians"),"https://sacredbible.org/catholic/NT-11_Philippians.htm");
const text='<p>{3:1} but for you, it is necessary.</p><p>{3:2} Beware of dogs.</p> * * *';
const result=parseMasterBookVerses(text);
assert.equal(result.get("3:1"),"but for you, it is necessary.");
assert.equal(result.get("3:2"),"Beware of dogs.");
const withChapter = parseMasterBookVerses("<p>{1:1} In the beginning.</p> [ Genesis 2 ] <p>{2:1} Thus completed.</p> The Sacred Bible: Genesis");
assert.equal(withChapter.get("1:1"),"In the beginning.");
assert.equal(withChapter.get("2:1"),"Thus completed.");
assert.equal(comparisonWords("Hail, full of grace."),comparisonWords("Hail full of grace!"));
console.log("CPDV 73-book primary-author parser tests passed");
