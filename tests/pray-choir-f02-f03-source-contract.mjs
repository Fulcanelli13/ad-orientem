import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {CHOIR_SOURCE_F02,CHOIR_SOURCE_F03,CHOIR_SOURCE_IDS,choirKind,choirSourceBeats} from "../src/pray/choir-source-beats.js";

test("F02/F03 complete corpus: all 15 source-owned texts, 45 exact EN/FR/LA faces",()=>{
 assert.equal(CHOIR_SOURCE_F02.length,10);
 assert.equal(CHOIR_SOURCE_F03.length,5);
 assert.equal(new Set(CHOIR_SOURCE_IDS).size,15);
 let faces=0,beatCount=0;
 for(const id of CHOIR_SOURCE_IDS){
  const row=PRAY_CANONICAL_DATA_V435930.prayers[id];
  assert.ok(row,id+" missing from canonical source owner");
  assert.ok(choirKind(id),id+" missing kind");
  for(const language of ["en","fr","la"]){
   const original=row[language];
   assert.ok(original,id+" "+language+" source face missing");
   const beats=choirSourceBeats(id,language,original);
   assert.ok(beats?.length,id+" "+language+" has no segments");
   assert.equal(beats.map(x=>x.raw).join(""),original,
    id+" "+language+" byte-exact source reconstruction");
   assert.ok(beats.every(x=>!x.uncertified),id+" "+language+" uncertified source");
   assert.ok(beats.filter(x=>x.kind!=="space").every(x=>x.raw.trim().length),
    id+" "+language+" empty focus beat");
   if(original.length>300)assert.ok(beats.length>1,id+" "+language+" text wall");
   faces++;beatCount+=beats.filter(x=>x.kind!=="space").length;
  }
 }
 assert.equal(faces,45);
 assert.ok(beatCount>300,"All sourced lines must become independent focus units");
});
test("F03 litanies: invocation and response are independent source-authentic focus beats",()=>{
 for(const id of CHOIR_SOURCE_F03.filter(x=>x!=="benediction_divine_praises")){
  for(const language of ["en","fr","la"]){
   const original=PRAY_CANONICAL_DATA_V435930.prayers[id][language];
   const beats=choirSourceBeats(id,language,original);
   assert.ok(beats.some(x=>x.kind==="invocation"),id+" "+language+" invocation missing");
   assert.ok(beats.some(x=>x.kind==="response"),id+" "+language+" collective response missing");
   assert.equal(beats.map(x=>x.raw).join(""),original);
   assert.equal((beats.map(x=>x.raw).join("").match(/℣/g)||[]).length,
    (original.match(/℣/g)||[]).length,"No ℣ invented");
   assert.equal((beats.map(x=>x.raw).join("").match(/℟/g)||[]).length,
    (original.match(/℟/g)||[]).length,"No ℟ invented");
  }
 }
});
test("F02 hymn, responsory and Divine Praises preserve stanzas and literal repetitions",()=>{
 for(const id of ["traditional_veni_sancte_sequence","benediction_tantum_ergo","benediction_o_salutaris","devotion_st_anthony_lost_items","benediction_divine_praises"]){
  for(const language of ["en","fr","la"]){
   const original=PRAY_CANONICAL_DATA_V435930.prayers[id][language];
   const beats=choirSourceBeats(id,language,original);
   assert.equal(beats.map(x=>x.raw).join(""),original);
   if(original.includes("\n\n"))assert.ok(beats.some(x=>x.kind==="space"));
  }
 }
 assert.equal(choirSourceBeats("unknown","en","Some text"),null);
 assert.equal(choirSourceBeats("benediction_tantum_ergo","la",""),null);
});
test("F02/F03 browser reader retains source, language and independent focus contracts",()=>{
 const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
 const focus=readFileSync("src/pray/devotional-sequence-adapter.js","utf8");
 const styles=readFileSync("src/pray/choir-family-styles.js","utf8");
 assert.match(runtime,/CHOIR_SOURCE_IDS\.includes\(id\)/);
 assert.match(runtime,/data-ao-choir-prayer/);
 assert.match(runtime,/choir\?"\.aoChoirBeat"/);
 assert.match(runtime,/data-p435930-choir-flip/);
 assert.match(runtime,/sourceLine\(p\)/);
 assert.match(runtime,/data-ao-pray-semantic="1"/);
 assert.match(focus,/kind==="library"/);
 assert.match(styles,/\.aoChoirResponse\[data-ao-devo-active="true"\]/);
 assert.match(styles,/prefers-reduced-motion:reduce/);
});
