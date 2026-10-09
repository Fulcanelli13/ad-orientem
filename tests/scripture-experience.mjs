import assert from "node:assert/strict";
import {createScripturePreferences} from "../src/scripture/preferences.js";
import {searchScriptureBooks,searchCertifiedScripture} from "../src/scripture/search.js";
import {cacheApprovedScripturePack} from "../src/scripture/offline.js";
import {validateScriptureImport} from "../src/scripture/import-contract.js";
import {installScriptureBrowserOwner} from "../src/scripture/browser-entry.js";
import {parseScriptureContext,verifiedScriptureCommentary,scriptureContextCapsule} from "../src/scripture/context.js";
import {readFileSync} from "node:fs";
const memory=new Map(),storage={
 getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)
};
const prefs=createScripturePreferences(storage);
assert.deepEqual(prefs.load(),{language:"en",bookmarks:[]});
assert.equal(prefs.setLanguage("fr"),true);
const passage={book:"Luke",chapter:1,verseStart:28};
assert.equal(prefs.toggleBookmark(passage,"dr-challoner"),true);
assert.equal(prefs.load().bookmarks.length,1);
assert.equal(prefs.toggleBookmark(passage,"dr-challoner"),false);
assert.equal(prefs.load().bookmarks.length,0);
assert.equal(prefs.toggleBookmark(passage,"dr-challoner"),true);
assert.equal(prefs.toggleBookmark(passage,"cpdv-2009"),true);
assert.equal(prefs.load().bookmarks.length,2);
assert.equal(prefs.toggleBookmark(passage,"dr-challoner"),false);
assert.deepEqual(prefs.load().bookmarks.map(x=>x.editionId),["cpdv-2009"]);
assert.throws(()=>prefs.toggleBookmark(passage),/specific Catholic edition/);
const oldStore=new Map([["ao-scripture-v1",JSON.stringify({bookmarks:[passage]})]]);
const oldPrefs=createScripturePreferences({getItem:k=>oldStore.get(k),setItem:(k,v)=>oldStore.set(k,v)});
assert.equal(oldPrefs.load().bookmarks[0].editionId,null);
assert.equal(oldPrefs.assignLegacyBookmark(passage,"dr-challoner"),true);
assert.equal(oldPrefs.load().bookmarks[0].editionId,"dr-challoner");
assert.equal(prefs.load().language,"fr");
assert.equal(prefs.englishEdition(),"dr-challoner");
assert.equal(prefs.setEnglishEdition("cpdv-2009"),true);
assert.equal(prefs.englishEdition(),"cpdv-2009");
assert.throws(()=>prefs.setEnglishEdition("ncb-2019"));
assert.equal(prefs.load().language,"fr","English edition setting must not overwrite French language");
assert.deepEqual(searchScriptureBooks("tob"),["Tobit"]);
assert.equal(searchCertifiedScripture([{editionId:"knox",book:"Luke",chapter:1,verseStart:28,text:"Uncleared example",reviewed:true,licenceId:"x",sourceEdition:"x",sourceUrl:"x"}],{query:"Uncleared"}).length,0);
await assert.rejects(cacheApprovedScripturePack({editionId:"knox",records:[{text:"x"}]}),/not certified/);
const invalid=validateScriptureImport({editionId:"dr-challoner",books:[],provenance:{}});
assert.equal(invalid.valid,false);
assert.ok(invalid.failures.some(x=>x.includes("rights")||x.includes("clearance")));
assert.ok(invalid.failures.some(x=>x.includes("73")));
assert.equal(typeof installScriptureBrowserOwner,"function");
for(const [reference,book,chapter,verse] of [
  ["Mt 5:27–28","Matthew",5,27],["Matthew 5:27-28","Matthew",5,27],
  ["Luke 1:26–38","Luke",1,26],["John 19:26–27","John",19,26],
  ["Psalms 129:1","Psalms",129,1],["1 Cor 6:18–20","1Corinthians",6,18],
  ["Gen 1:27","Genesis",1,27],["Revelation 12:1","Revelation",12,1],
  ["1 Peter 3:15–16","1Peter",3,15],["2 Timothy 2:23–25","2Timothy",2,23],
  ["Jacques 1:19","James",1,19],["Matthieu 26:36–46","Matthew",26,36]
]){
  const parsed=parseScriptureContext(reference);
  assert.equal(parsed?.passage.book,book,reference+" book");
  assert.equal(parsed?.passage.chapter,chapter,reference+" chapter");
  assert.equal(parsed?.passage.verseStart,verse,reference+" verse");
}
assert.equal(parseScriptureContext("Other document §4"),null);
assert.equal(parseScriptureContext("Luke 0:1"),null);
assert.equal(parseScriptureContext("John 19:30; Mt 5:28"),null,"Multi-source strings require individual capsules");
assert.equal(parseScriptureContext("Psalms 129:1").numbering,"SOURCE_EDITION_REQUIRED");
assert.equal(verifiedScriptureCommentary(parseScriptureContext("Matthew 5:27–28").passage)?.type,"PATRISTIC_COMPILATION");
assert.equal(verifiedScriptureCommentary(parseScriptureContext("Luke 1:68").passage),null,
  "Never fabricate a patristic commentary for an uncollated passage");
assert.match(scriptureContextCapsule("Mt 5:27–28"),/data-ao-scripture-context="Mt 5:27–28"/);
assert.equal(scriptureContextCapsule("unsupported passage"),"");

const app=readFileSync(new URL("../src/app/browser-entry.js",import.meta.url),"utf8");
const home=readFileSync(new URL("../src/home/presentation.js",import.meta.url),"utf8");
assert.match(app,/scripture\/browser-entry/);
assert.match(home,/data-home-scripture/);
console.log("Scripture user experience, bookmarks, import rights and Home entry contracts passed");
