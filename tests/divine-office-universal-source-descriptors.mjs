import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
 planUniversalOfficeKeys,planUniversalOfficeKeysForYear,
 projectOfficeDescriptorMetadata,createUniversalOfficeMetadataReader
} from "../src/office/universal-source-descriptors.js";

const sancti="Sancti/11-01",advent="Tempora/Adv1-0";
const parsed=(path,map)=>({sourceRevision:DIVINUM_OFFICIUM_PIN,
 sourcePath:path,language:"la",map});
const allSaints=()=>new Map([
 ["Officium",["Omnium Sanctorum"]],
 ["Rank",[";;Duplex I classis cum octava communi;;6.4;;vide C3",
           "(sed rubrica divino)",";;Duplex I classis;;6.51;;vide C3"]],
 ["Rule",["vide C3;","9 lectiones","Psalmi Dominica",
          "Antiphonas horas","(rubrica tridentina aut rubrica divino)"]]
]);
const advent1=()=>new Map([
 ["Officium",["Dominica I Adventus"]],
 ["Rank",[";;Semiduplex;;6.9"]],
 ["Rule",["9 lectiones","Antiphonas horas"]]
]);

test("Advent source keys follow the movable Sunday, not fixed civil day",()=>{
 const a=planUniversalOfficeKeys("2026-11-29");
 assert.deepEqual(a.keys.map(k=>k.path),["Sancti/11-29","Tempora/Adv1-0"]);
 assert.deepEqual(planUniversalOfficeKeys("2026-11-30").keys.map(k=>k.path),
  ["Sancti/11-30","Tempora/Adv1-1"]);
 assert.equal(planUniversalOfficeKeys("2026-12-20").keys[1].path,"Tempora/Adv4-0");
 assert.equal(planUniversalOfficeKeys("2026-12-24").keys[1].path,"Tempora/Adv4-4");
 assert.equal(planUniversalOfficeKeys("2028-12-03").keys[1].path,"Tempora/Adv1-0");
 assert.equal(planUniversalOfficeKeys("2028-12-24").keys[1].path,"Tempora/Adv4-0");
});
test("all dates propose fixed sanctoral keys but never assert file existence",()=>{
 for(const date of ["2026-01-01","2026-02-28","2028-02-29","2026-12-01"]){
  const a=planUniversalOfficeKeys(date);
  assert.equal(a.keys[0].path,"Sancti/"+date.slice(5));
  assert.equal(a.keys[0].sourceExists,"NOT_CHECKED");
  assert.equal(a.keys[0].officeAppointed,false);
  assert.equal(a.downloads,0);
 }
 assert.throws(()=>planUniversalOfficeKeys("2026-02-30"),
  /OFFICE_UNIVERSAL_DATE_INVALID/);
});
test("2026/2028 full-year recurrence plans emit only keys, not source documents",()=>{
 const a=planUniversalOfficeKeysForYear(2026);
 assert.equal(a.totalDays,365);
 assert.equal(a.fixedSanctoralPathLeads,365);
 assert.equal(a.adventTemporalPathLeads,26);
 assert.equal(a.totalProposedSourcePaths,391);
 assert.equal(a.actualSourceFilesVerified,0);
 assert.equal(a.textsParsed,0);
 assert.equal(a.downloads,0);
 const b=planUniversalOfficeKeysForYear(2028);
 assert.equal(b.totalDays,366);
 assert.equal(b.adventTemporalPathLeads,22);
 assert.equal(b.totalProposedSourcePaths,388);
 assert.equal(b.actualSourceFilesVerified,0);
});
test("pinned All Saints [Rank] metadata cannot be mistaken for RG91 class",()=>{
 const r=projectOfficeDescriptorMetadata({
  path:sancti,parsed:parsed(sancti,allSaints())
 });
 assert.equal(r.sourceMetadata.title,"Omnium Sanctorum");
 assert.equal(r.sourceMetadata.rankLabel,"Duplex I classis cum octava communi");
 assert.equal(r.sourceMetadata.possibleConditionalRuleLines,true);
 assert.equal(r.class,null);
 assert.equal(r.rg91TablePosition,null);
 assert.equal(r.hasFirstVespers,null);
 assert.equal(r.numericRankNot1960Class,true);
 assert.equal(r.flattenedSectionsMayOmitConditionalVariants,true);
 assert.equal(r.publishable,false);
 assert.equal(JSON.stringify(r).includes("Psalmi Dominica"),false);
});
test("pinned Advent I [Rank] 6.9 is not promoted to first class",()=>{
 const r=projectOfficeDescriptorMetadata({
  path:advent,parsed:parsed(advent,advent1())
 });
 assert.equal(r.sourceMetadata.title,"Dominica I Adventus");
 assert.equal(r.sourceMetadata.rankLabel,"Semiduplex");
 assert.equal(r.class,null);
 assert.equal(r.rg91TablePosition,null);
 assert.equal(r.status,"PINNED_METADATA_OBSERVED_UNADJUDICATED");
});
test("All Souls may have [Rank] without [Officium]; no guessed title",()=>{
 const r=projectOfficeDescriptorMetadata({path:"Sancti/11-02",
  parsed:parsed("Sancti/11-02",new Map([
   ["Rank",["In Commemoratione Omnium Fidelium Defunctorum;;I. classis;;6"]],
   ["Rule",["ex C9","No prima Vespera"]]
  ]))
 });
 assert.equal(r.sourceMetadata.title,null);
 assert.equal(r.rg91TablePosition,null);
 assert.equal(r.hasFirstVespers,null);
});
test("on-demand adapter reuses existing host and cache, no annual loop",async()=>{
 const calls=[];
 const host={sourceRevision:DIVINUM_OFFICIUM_PIN,
  async resolveSource(path,language,diagnostic){
   calls.push({path,language,diagnostic});
   return {map:path===sancti?allSaints():advent1()};
  }
 };
 const r=createUniversalOfficeMetadataReader({hostResolver:host});
 const [one,two]=await Promise.all([
  r.readDate("2026-11-01",{kind:"SANCTORAL_FIXED_DATE_RESEARCH_LEAD"}),
  r.readOne(sancti)
 ]);
 assert.equal(one.sourcePath,sancti);
 assert.equal(two.sourcePath,sancti);
 assert.equal(calls.length,1);
 assert.equal(calls[0].diagnostic,"office-metadata-only");
 await r.readDate("2026-11-29",{kind:"ADVENT_TEMPORAL_RESEARCH_LEAD"});
 assert.equal(calls.length,2);
 assert.equal(r.cachedSourceCount(),2);
});
test("unverified host pin, wrong language and missing map fail closed",async()=>{
 assert.throws(()=>createUniversalOfficeMetadataReader({
  hostResolver:{resolveSource:async()=>({map:allSaints()})}
 }),/OFFICE_DESCRIPTOR_PINNED_HOST_REQUIRED/);
 for(const wrong of [{sourceRevision:"0".repeat(40)},
  {sourcePath:"Sancti/11-02"},{language:"fr"},{map:null}]){
  const host={sourceRevision:DIVINUM_OFFICIUM_PIN,
   resolveSource:async()=>({map:allSaints(),...wrong})};
  const r=createUniversalOfficeMetadataReader({hostResolver:host});
  await assert.rejects(r.readOne(sancti),
   /OFFICE_DESCRIPTOR_(PIN_MISMATCH|PATH_MISMATCH|LANGUAGE_MISMATCH|SOURCE_PROVENANCE_INVALID)/);
 }
});
test("unsupported season/date lead cannot be forged into observed source",async()=>{
 const host={sourceRevision:DIVINUM_OFFICIUM_PIN,
  resolveSource:async()=>{throw Error("SHOULD_NOT_READ")}
 };
 const r=createUniversalOfficeMetadataReader({hostResolver:host});
 await assert.rejects(r.readDate("2026-07-01",{
  kind:"ADVENT_TEMPORAL_RESEARCH_LEAD"
 }),/OFFICE_DESCRIPTOR_KEY_NOT_IN_DATE/);
 await assert.rejects(r.readOne("Tempora/Pent23-0"),/OFFICE_DESCRIPTOR_PATH_INVALID/);
});
