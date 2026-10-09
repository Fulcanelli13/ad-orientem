import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {scriptureSegments,scriptureSegmentsReference,scriptureSegmentContext}
  from "../src/scripture/segments.js";
import {scriptureParallelReferenceState} from "../src/scripture/reference-safety.js";
import {VERIFIED_SEGMENTED_MASS_READINGS,VERIFIED_SEGMENTED_MASS_VERSION}
  from "../src/mass/scripture-segmented-reading-index.js";
import {registeredSegmentedMassReading,massScriptureContextForCard}
  from "../src/mass/scripture-reading-context.js";
import {openReaderScriptureContext} from "../src/mass/browser-entry.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const source=load("../data/mass/scripture-segmented-proper.v1.json");
assert.equal(VERIFIED_SEGMENTED_MASS_VERSION,source.version);
assert.deepEqual(VERIFIED_SEGMENTED_MASS_READINGS,source.readings,"Compiled segmented witness diverged from source ledger");
assert.equal(source.readings.length,15);
const bible=(book,chapter,a,b)=>({book,chapter,verseStart:a,verseEnd:b});
const part=[bible("Ephesians",3,8,12),bible("Ephesians",3,14,19)];
assert.equal(scriptureSegmentsReference(part),"Ephesians 3:8–12; 3:14–19");
const result=scriptureSegmentContext(part);
assert.equal(result.passage.chapter,3);
assert.equal(result.segments.length,2);
assert.equal(result.reference,"Ephesians 3:8–12; 3:14–19");
assert.ok(Object.isFrozen(result.segments));
assert.throws(()=>scriptureSegmentContext(part,{reference:"Ephesians 3:8–19"}),/citation/);
for(const invalid of [
 [],new Array(25).fill(bible("John",1,1,1)),
 [bible("John",18,1,40),bible("John",18,30,45)],
 [bible("John",19,1,42),bible("John",18,1,40)],
 [bible("John",19,1,42),bible("Matthew",19,1,42)],
 [bible("John",22,1,1)],
 [bible("Luke",1,20,10)]
])assert.throws(()=>scriptureSegments(invalid),"Bad segmented passage accepted");
const prep=p=>({session:{resolvedMass:{proper:{status:"READY",sourcePath:p.sourcePath,data:p}}}});
const card=slot=>({blocks:[{properSlot:slot}]});
const clean=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replaceAll("æ","ae").replaceAll("œ","oe").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const seen=new Set();
for(const row of source.readings){
 const key=row.sourcePath+"|"+row.slot;
 assert.ok(!seen.has(key),"Duplicate segmented Proper owner");
 seen.add(key);
 assert.equal(scriptureSegmentsReference(row.segments),row.reference);
 assert.ok(/^https:\/\/(?:www\.missalemeum\.com\/|github\.com\/DivinumOfficium\/divinum-officium\/blob\/master\/web\/www\/missa\/Latin\/Tempora\/)/.test(row.witnessUrl),
    "Segmented witness must be anchored to a real primary liturgical text source");
 if(row.witnessUrl.includes("github.com/DivinumOfficium"))
   assert.ok(row.witnessUrl.endsWith("/"+row.sourcePath.split("/").at(-1)+".txt"),
     "Source link must match its selected Proper file");
 assert.ok(row.latinIncipit.length>=18);
 assert.ok(row.segments.length>=2&&row.segments.length<=4);
 const field=row.slot==="GOSPEL"?"gospel":"epistle";
 const proper={sourcePath:row.sourcePath,[field]:{lat:"Passio. "+row.latinIncipit+", aliud verbum."}};
 const found=registeredSegmentedMassReading(proper,row.slot);
 assert.equal(found?.reference,row.reference,key);
 assert.equal(found?.segments.length,row.segments.length);
 assert.equal(found?.witnessUrl,row.witnessUrl);
 assert.equal(massScriptureContextForCard(card(row.slot),prep(proper)).state,"READY");
 assert.equal(massScriptureContextForCard(card(row.slot),prep(proper)).reference,row.reference);
 assert.equal(registeredSegmentedMassReading({...proper,sourcePath:"Sancti/01-01"},row.slot),null);
 assert.equal(registeredSegmentedMassReading({...proper,[field]:{lat:"Aliud prorsus textum"}},row.slot),null);
 assert.equal(registeredSegmentedMassReading({...proper,[field]:{en:"English without source Latin"}},row.slot),null);
 assert.equal(massScriptureContextForCard(card(row.slot),prep({...proper,[field]:{...proper[field],reference:"John 3:16"}})).state,
   "UNRESOLVED_REFERENCE","A contradictory Proper Bible reference must veto the segmented witness");
 assert.equal(massScriptureContextForCard(card(row.slot),prep({...proper,[field]:{...proper[field],reference:row.reference}})).state,
   "READY","Exact first-party segmented reference should preserve matched witness");
 assert.equal(massScriptureContextForCard(card(row.slot),prep({...proper,[field]:{...proper[field],reference:"Uncollated citation §2"}})).state,
   "UNRESOLVED_REFERENCE");
 assert.equal(massScriptureContextForCard({blocks:[{properSlot:row.slot},{properSlot:row.slot==="GOSPEL"?"EPISTLE_OR_LESSON":"GOSPEL"}]},prep(proper)).state,
   "UNRESOLVED_REFERENCE","Do not arbitrarily choose from a mixed-slot Mass card");
}
assert.equal(clean(source.readings[0].latinIncipit),clean("Tunc venit Jesus cum illis in villam"));
assert.deepEqual(source.readings[2].segments,part);
assert.equal(source.readings[2].segments[0].verseEnd,12);
assert.equal(source.readings[2].segments[1].verseStart,14,"Sacred Heart liturgical Epistle omits Ephesians 3:13");
const excluded=load("../data/mass/distinct-rite-scripture-order.v1.json");
assert.equal(excluded.status,"SOURCE_VERIFIED_NATIVE_GOOD_FRIDAY_PALM_AND_EASTER_VIGIL_LESSONS_CONTEXT_LINKED");
assert.equal(excluded.rites[0].entries[2].nativeStateIds.length,3,"Good Friday death pause must stay separate");
assert.equal(excluded.rites[1].entries.length,4,"Easter Vigil 1962 retains exactly four prophecies");
let single=0,multi=0;
const win={AO_SCRIPTURE_CONTEXT_V1:{
 open:(reference,options)=>{single++;assert.equal(reference,"Luke 1:26–38");assert.equal(options.language,"fr");return true;},
 openSegments:(segments,options)=>{multi++;assert.equal(segments.length,2);assert.equal(options.reference,result.reference);return true;}
}};
assert.equal(await openReaderScriptureContext("Luke 1:26–38",{win,language:"fr"}),true);
assert.equal(await openReaderScriptureContext(result,{win,language:"en"}),true);
assert.equal(single,1);assert.equal(multi,1);
const noOwner={AO_SCRIPTURE_CONTEXT_V1:{open:()=>true}};
await assert.rejects(openReaderScriptureContext(result,{win:noOwner,loader:async()=>({})}),/SEGMENTED_SCRIPTURE_OWNER_NOT_READY/);
const provisional=scriptureParallelReferenceState(result.passage,"dr-challoner","cpdv-2009");
assert.equal(provisional.canAutoParallel,false,"Never fabricate inter-edition equivalence from the new segments");
console.log("PASS segmented Scripture: canonical order/omissions, 15 text-guarded segmented Mass Propers, mixed-card/conflicting-citation rejection, one shared owner, native rite holds");
