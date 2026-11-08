import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {OFFICE_HOUR_DRAFT_SCHEMA}
 from "../src/office/structured-hour-draft.js";
import {OFFICE_REVIEWED_HOUR_SCHEMA}
 from "../src/office/reviewed-hour-handoff.js";
import {projectOfficeBetaParallelHour}
 from "../src/office/reader-beta-parallel-projection.js";

const witness=JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/advent-i-2026-collect-dialogue-source-sections.json",
 import.meta.url),"utf8"));
const date="2026-11-29",civilDate="2026-11-28";
function sample(hour="VESPERS"){
 const selected={key:"collect",path:"Tempora/Adv1-0",
  section:"Oratio",role:"COLLECT"};
 const handoff={
  schema:OFFICE_REVIEWED_HOUR_SCHEMA,
  status:"SOURCE_SELECTION_RESEARCH",
  canResearchParse:true,officeSelectionAuthorized:false,
  liturgicallyCertified:false,publishable:false,published:false,
  civilDate,officeDate:date,officeKey:"advent-i-2026-11-29",
  hour,officePart:hour==="VESPERS"?"FIRST":null,
  selection:{status:"RESEARCH_SELECTION",sourceRevision:PIN,
   date,officeKey:"advent-i-2026-11-29",hour,
   orderedSections:[selected]}
 };
 const draft={
  schema:OFFICE_HOUR_DRAFT_SCHEMA,edition:"ROMAN_1960",
  date,civilDate,hour,officePart:handoff.officePart,
  sourceRevision:PIN,officeKey:handoff.officeKey,
  status:"STRUCTURED_UNVERIFIED",
  sections:[{
   key:"collect",role:"COLLECT",
   sourceId:"Tempora/Adv1-0#Oratio",
   texts:Object.fromEntries(["la","en","fr"].map(lang=>[
    lang,witness.sections[lang].Oratio[0]
   ])),alignmentVerified:false,psalmDoxologyAndAntiphonVerified:false
  }],sectionCount:1,officePrecedenceVerified:false,
  officeCompletenessVerified:false,languagesAligned:false,
  rightsApproved:false,publishable:false,published:false
 };
 return {handoff,draft};
}
test("one generic source-first reading projection accepts any canonical Hour's explicitly selected source sections",()=>{
 for(const hour of ["MATINS","LAUDS","PRIME","TERCE","SEXT",
  "NONE","VESPERS","COMPLINE"]){
  const {handoff,draft}=sample(hour);
  const r=projectOfficeBetaParallelHour({handoff,draft});
  assert.equal(r.status,"REUSABLE_SOURCE_HOUR_RESEARCH_ONLY",r.reason);
  assert.equal(r.hour,hour);
  assert.equal(r.blockCount,1);
  assert.deepEqual(r.availableLanguages,["la","en","fr"]);
  assert.equal(r.blocks[0].sourceId,"Tempora/Adv1-0#Oratio");
  for(const lang of ["la","en","fr"]){
   assert.equal(r.blocks[0].texts[lang].join("\n"),
    witness.sections[lang].Oratio[0]);
  }
  assert.equal(r.officePrecedenceCertified,false);
  assert.equal(r.rightsApproved,false);
  assert.equal(r.publicReaderEnabled,false);
  assert.equal(r.published,false);
  assert.equal(r.publishable,false);
 }
});
test("unappointed, incomplete, unpinned, mistranslated or macro source Hours are withheld as a whole",()=>{
 for(const change of [
  ({handoff})=>{handoff.selection.orderedSections[0].section="Other"},
  ({handoff})=>{handoff.officeSelectionAuthorized=true},
  ({handoff})=>{handoff.selection.sourceRevision="latest"},
  ({draft})=>{draft.sourceRevision="latest"},
  ({draft})=>{draft.publishable=true},
  ({draft})=>{draft.officeCompletenessVerified=true},
  ({draft})=>{draft.sections[0].texts.fr=""},
  ({draft})=>{draft.sections[0].texts.fr="$Qui vivis"},
  ({draft})=>{draft.sections[0].texts.la="<b>untrusted</b>"},
  ({draft})=>{draft.sections[0].sourceId="Psalterium/Common/Prayers#Qui vivis"},
  ({draft})=>{draft.sections[0].alignmentVerified=true}
 ]){
  const item=sample();change(item);
  const r=projectOfficeBetaParallelHour(item);
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.blocks.length,0);
  assert.equal(r.canPreview,false);
  assert.equal(r.published,false);
 }
});
