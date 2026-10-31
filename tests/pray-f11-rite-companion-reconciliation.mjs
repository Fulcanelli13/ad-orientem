import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {F11_SUNG_HYMNS,benedictionSungStanzas} from "../src/pray/f11-sung-text-presentation.js";
const read=x=>readFileSync(x,"utf8");
const runtime=read("src/pray/presentation-runtime.js");
const focus=read("src/pray/devotional-sequence-adapter.js");
const css=read("src/pray/f11-rite-companion-styles.js");

test("F11 Claude B-03: two real Latin-first hymn stanzas in both vernaculars",()=>{
 assert.deepEqual(Object.keys(F11_SUNG_HYMNS).sort(),[
  "benediction_o_salutaris","benediction_tantum_ergo"
 ]);
 let verified=0;
 for(const id of Object.keys(F11_SUNG_HYMNS)){
  const source=PRAY_CANONICAL_DATA_V435930.prayers[id];
  assert.ok(source?.la,id+" original Latin is required");
  for(const language of ["en","fr"]){
   assert.ok(source[language],id+" "+language+" original is required");
   const rendered=benedictionSungStanzas(id,source.la,source[language]);
   assert.equal(rendered?.length,2,id+" "+language+" must align original two stanzas");
   const sep=t=>t.includes("\n\n")?"\n\n":"\n";
   assert.equal(rendered.map(s=>s.latin).join(sep(source.la)),source.la);
   assert.equal(rendered.map(s=>s.vernacular).join(sep(source[language])),source[language]);
   assert.ok(rendered.every(s=>s.latin.trim()&&s.vernacular.trim()));
   verified++;
  }
 }
 assert.equal(verified,4);
 assert.equal(benedictionSungStanzas("unknown","A","B"),null);
 assert.equal(benedictionSungStanzas("benediction_o_salutaris","Changed source","Other text"),null);
});

test("F11 Claude B-01/B-02/B-04/B-05: original public liturgy preserved",()=>{
 const stages=runtime.slice(runtime.indexOf("const BEN_STAGES=["),runtime.indexOf("function benStages(){"));
 const order=["exposition","adoration","hymn","prayer","blessing","praises","reposition"];
 let prev=-1;
 for(const id of order){
  const at=stages.indexOf("'"+id+"'");
  assert.ok(at>prev,"Seven ordered stages must remain source-owned: "+id);
  prev=at;
 }
 assert.match(runtime,/benFeastOptions\(\)/);
 assert.match(runtime,/batch02SourceLinks\('benediction-optional-local'\)/);
 assert.match(runtime,/class="aoRiteOptionRow"/);
 assert.match(runtime,/BENEDICTION_1962_WITNESS\.url/);
 assert.match(runtime,/benedictionAlleluiaStatus\(selectedDateKey\(\)\)/);
 assert.match(runtime,/Stop interacting with the phone/);
 assert.match(runtime,/Finish after Reposition/);
 assert.match(runtime,/data-ao-rite-owner="benediction"/);
 assert.match(runtime,/benSungPrayer\('benediction_o_salutaris'/);
 assert.match(runtime,/benSungPrayer\('benediction_tantum_ergo'/);
 assert.match(runtime,/data-ao-rite-chant-stanza/);
 assert.match(focus,/f11Rite=kind==="benediction"/);
 assert.match(focus,/i===found\?"1":i<found\?"\.54":"\.80"/);
 assert.match(css,/\.aoRiteChantVernacular/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test("F11 Forty Hours and Tenebrae retain original source and public/local limits",()=>{
 for(const mode of ["choose","visitor","solemn"]){
  assert.match(runtime,new RegExp('data-ao-rite-owner="forty-hours-'+(mode==="choose"?"choice":mode==="visitor"?"visitor":"solemn")+'"'));
 }
 assert.match(runtime,/data-ao-rite-owner="tenebrae"/);
 assert.match(runtime,/renderTenebraeBody\(/);
 assert.match(runtime,/loadTenebraeHour\(/);
 assert.match(runtime,/The app never asks a lay person to perform the public blessing/);
 assert.match(runtime,/not a parish timetable or a replacement for the clergy/);
 assert.match(runtime,/No seasonal Alleluia has been assumed/);
});
