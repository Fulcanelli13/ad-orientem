import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CATHOLIC_BOOK_IDS} from "../src/scripture/canon.js";
import {SCRIPTURE_EDITIONS} from "../src/scripture/catalogue.js";
import {hasScriptureWitness,validateScriptureWitness,loadScriptureWitness} from "../src/scripture/witness-loader.js";

const french=["Matthew","Mark","Luke","John","Acts","1Corinthians","Revelation","SongOfSongs","Isaiah","Judith","Psalms"];
const dr=["Matthew","Mark","Luke","John"];
let verses=0,chapters=0,frenchChapters=0,drVerses=0,frVerses=0;
const stored=new Map();
for(const [edition,books] of [["cpdv-2009",CATHOLIC_BOOK_IDS],["dr-challoner",dr],["crampon-1923",french]]){
 for(const book of books){
  assert.equal(hasScriptureWitness(edition,book),true);
  const packet=JSON.parse(readFileSync(new URL("../data/scripture/witness/"+edition+"/"+book+".json",import.meta.url),"utf8"));
  const records=validateScriptureWitness(packet,edition,book);
  assert.ok(records.length>0,edition+" "+book+" needs original text");
  assert.ok(records.every(r=>r.reviewed===false&&r.sourceWitness===true&&r.sourceStatus==="UNCOLLATED_SOURCE_WITNESS"&&
     r.editionId===edition&&r.book===book&&r.licenceId==="UNCOLLATED_CATHOLIC_SOURCE_WITNESS"));
  const chaptersForBook=new Set(records.map(r=>r.chapter)).size;
  if(edition==="cpdv-2009"){verses+=records.length;chapters+=chaptersForBook;}
  if(edition==="crampon-1923"){frenchChapters+=chaptersForBook;frVerses+=records.length;}
  if(edition==="dr-challoner")drVerses+=records.length;
  stored.set(edition+":"+book,packet);
 }
}
assert.equal(CATHOLIC_BOOK_IDS.length,73);
assert.equal(verses,35825,"The CPDV transcription census may only change after independent source audit");
assert.equal(chapters,1333,"The CPDV source witness has 1,333 chapters: its Esther has 15 rather than Douay\u2019s 16");
assert.equal(new Set(stored.get("cpdv-2009:Esther").verses.map(row=>row[0])).size,15);
assert.equal(drVerses,3777);
assert.equal(frenchChapters,39);
assert.equal(frVerses,1460);
assert.ok(Object.values(SCRIPTURE_EDITIONS).every(e=>e.enabled===false),"Unreviewed witness must not certify edition packs");
assert.equal(hasScriptureWitness("dr-challoner","Genesis"),false);
assert.equal(hasScriptureWitness("crampon-1923","Genesis"),false);
assert.equal(hasScriptureWitness("cpdv-2009","Genesis"),true);
const text=stored.get("cpdv-2009:Luke");
assert.ok(validateScriptureWitness(text,"cpdv-2009","Luke").find(x=>x.chapter===1&&x.verseStart===28)?.text.length>30);
assert.throws(()=>validateScriptureWitness({...text,sourceStatus:"APPROVED"},"cpdv-2009"),/Invalid historical Scripture/);
assert.throws(()=>validateScriptureWitness({...text,verses:[...text.verses,text.verses[0]]},"cpdv-2009"),/Duplicate witness/);
let calls=0;
const example=await loadScriptureWitness("cpdv-2009","Luke",{cacheStorage:null,fetcher:async url=>{
 calls++;assert.equal(url,"/data/scripture/witness/cpdv-2009/Luke.json");
 return {ok:true,clone(){return {json:async()=>text}}};
}});
assert.equal(calls,1);
assert.ok(example.length>1000);
console.log("Scripture witness recovery: CPDV 73/73 books; "+verses+" verse slots, "+chapters+" chapters; Douay 4 Gospels; Crampon 39 historical chapters; all editions remain unapproved.");
