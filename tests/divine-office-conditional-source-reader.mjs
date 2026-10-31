import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {createOfficeConditionalSourceReader,officePinnedOriginalSourceUrl}
 from "../src/office/conditional-source-reader.js";
import {OFFICE_CONDITIONAL_META_SCHEMA}
 from "../src/office/conditional-metadata-parser.js";

const filenameIndex=JSON.parse(readFileSync(new URL(
 "../data/office/source-index/roman-1960-pinned-latin-filenames.json",
 import.meta.url),"utf8"));
const realHeaderAllSouls=`[Rank]
In Commemoratione Omnium Fidelium Defunctorum;;Duplex;;3;;ex C9

[Rank] (rubrica 196)
In Commemoratione Omnium Fidelium Defunctorum;;I. classis;;6;;ex C9

[Rule]
ex C9
Psalmi Dominica
No prima Vespera

[Oratio]
This entire prayer must be absent from the metadata result.
`;
const realHeaderAdvent=`[Officium]
Dominica I Adventus

[Rank]
;;Semiduplex;;6.9

[Rule]
9 lectiones
Antiphonas horas

[Lectio1]
Secret source lesson, never emitted.
`;
function host({body=realHeaderAllSouls,modify=()=>({})}={}){
 const calls=[];
 const fetchSource=async(url,init)=>{
  calls.push({url,init});
  return {
   ok:true,status:200,url,
   headers:{get:()=>null},
   text:async()=>body,...modify(url,init)
  };
 };
 return {calls,fetchSource};
}
test("authentic pinned source path through existing injected transport preserves historical conditions",async()=>{
 const h=host();
 const r=createOfficeConditionalSourceReader({fetchSource:h.fetchSource,filenameIndex});
 const a=await r.readDateLead({date:"2026-11-02",path:"Sancti/11-02"});
 assert.equal(a.schema,OFFICE_CONDITIONAL_META_SCHEMA);
 assert.equal(a.sourceRevision,DIVINUM_OFFICIUM_PIN);
 assert.equal(a.sourcePath,"Sancti/11-02");
 assert.equal(a.rankVariantBlockCount,2);
 assert.equal(a.byKind.Rank[1].headerQualifier,"rubrica 196");
 assert.equal(a.byKind.Rank[1].rankEntries[0].sourceRankCode,"6");
 assert.equal(a.class,null);
 assert.equal(a.appointedOffice,null);
 assert.equal(a.publishable,false);
 assert.equal(JSON.stringify(a).includes("This entire prayer"),false);
 assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].url,officePinnedOriginalSourceUrl("Sancti/11-02"));
 assert.ok(h.calls[0].url.includes(DIVINUM_OFFICIUM_PIN));
 assert.equal(h.calls[0].init.method,"GET");
 assert.equal(h.calls[0].init.redirect,"error");
 assert.equal(h.calls[0].init.cache,"no-store");
 assert.equal(r.persistentArchiveSupported,false);
 assert.equal(r.bulkReadSupported,false);
});
test("repeated one-source metadata requests reuse memory, no extra network reads",async()=>{
 const h=host({body:realHeaderAdvent});
 const reader=createOfficeConditionalSourceReader({
  fetchSource:h.fetchSource,filenameIndex,maxDistinctReads:2
 });
 const [a,b,c]=await Promise.all([
  reader.readOne("Tempora/Adv1-0"),
  reader.readDateLead({date:"2026-11-29",path:"Tempora/Adv1-0"}),
  reader.readOne("Tempora/Adv1-0")
 ]);
 assert.equal(a.sourcePath,"Tempora/Adv1-0");
 assert.equal(b.sourcePath,"Tempora/Adv1-0");
 assert.equal(c.sourcePath,"Tempora/Adv1-0");
 assert.equal(a.byKind.Officium[0].titleHints[0].literal,"Dominica I Adventus");
 assert.equal(h.calls.length,1);
 assert.equal(reader.remainingReadBudget(),1);
 assert.equal(reader.cachedSourceCount(),1);
});
test("not-indexed paths and wrong date identity cannot issue a network request",async()=>{
 const h=host();
 const reader=createOfficeConditionalSourceReader({fetchSource:h.fetchSource,filenameIndex});
 await assert.rejects(reader.readOne("Sancti/12-01"),
  /OFFICE_CONDITIONAL_SOURCE_FILENAME_NOT_INDEXED/);
 await assert.rejects(reader.readDateLead({date:"2026-11-29",path:"Sancti/11-02"}),
  /OFFICE_CONDITIONAL_SOURCE_NOT_DATE_LEAD/);
 await assert.rejects(reader.readOne("../Sancti/11-02"),
  /OFFICE_CONDITIONAL_SOURCE_PATH_INVALID/);
 assert.equal(h.calls.length,0);
});
test("untrusted source origin, pin and file response are refused",async()=>{
 for(const mutate of [
  ()=>({url:"https://example.invalid/11-02.txt"}),
  ()=>({ok:false,status:404}),
  ()=>({headers:{get:()=>String(999999999)}}),
  ()=>({text:async()=>""}),
  ()=>({text:async()=>"?".repeat(600001)})
 ]){
  const h=host({modify:mutate});
  const reader=createOfficeConditionalSourceReader({fetchSource:h.fetchSource,filenameIndex});
  await assert.rejects(reader.readOne("Sancti/11-02"),
   /OFFICE_(CONDITIONAL_SOURCE|META_SOURCE)_/);
  assert.equal(h.calls.length,1);
  assert.equal(reader.remainingReadBudget(),11);
 }
});
test("bounded user-triggered source reads cannot turn into an annual crawl",async()=>{
 const h=host({body:realHeaderAdvent});
 const r=createOfficeConditionalSourceReader({
  fetchSource:h.fetchSource,filenameIndex,maxDistinctReads:1
 });
 await r.readOne("Tempora/Adv1-0");
 await assert.rejects(r.readOne("Tempora/Adv1-1"),
  /OFFICE_CONDITIONAL_SOURCE_READ_BUDGET_EXHAUSTED/);
 assert.equal(h.calls.length,1);
});
test("original leaf parser is mandatory; flattened maps do not qualify",async()=>{
 const h=host({modify:()=>({text:undefined})});
 const r=createOfficeConditionalSourceReader({fetchSource:h.fetchSource,filenameIndex});
 await assert.rejects(r.readOne("Sancti/11-02"),
  /OFFICE_CONDITIONAL_SOURCE_RESPONSE_INVALID/);
 assert.throws(()=>createOfficeConditionalSourceReader({
  fetchSource:async()=>({}),filenameIndex:{...filenameIndex,sourceRevision:"0".repeat(40)}
 }),/OFFICE_PINNED_FILENAME_INDEX_PROVENANCE_INVALID/);
});
