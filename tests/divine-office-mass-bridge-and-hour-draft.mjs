import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {createOfficeMassHostBridge} from "../src/office/mass-host-source-bridge.js";
import {composeOfficeHourDraft,OFFICE_HOUR_DRAFT_SCHEMA}
  from "../src/office/structured-hour-draft.js";

const path="Tempora/Pent23-0";
const originals=Object.freeze({
  la:new Map([["Antiphona",["Antiphona Latine."]],["Oratio",["Oratio Latine."]]]),
  en:new Map([["Antiphona",["Antiphon English."]],["Oratio",["Collect English."]]]),
  fr:new Map([["Antiphona",["Antienne française."]],["Oratio",["Oraison française."]]])
});
const selection=Object.freeze({
  edition:"ROMAN_1960",date:"2026-10-29",hour:"VESPERS",
  officeKey:"provisional-pent23",status:"RESEARCH_SELECTION",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  orderedSections:Object.freeze([
    {key:"antiphon-a",role:"ANTIPHON",path,section:"Antiphona"},
    {key:"collect-a",role:"COLLECT",path,section:"Oratio"}
  ])
});
function host({modify=()=>null}={}){
  const calls=[];
  const resolver={
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    async resolveSource(p,lang,diagnostic){
      calls.push({path:p,language:lang,diagnostic});
      return modify(p,lang)??{map:originals[lang]};
    }
  };
  return {calls,resolver};
}
test("Mass parsed resolver is called once per pinned source and language",async()=>{
  const h=host(),bridge=createOfficeMassHostBridge({hostResolver:h.resolver});
  const hour=await composeOfficeHourDraft({resolver:bridge,selection});
  assert.equal(hour.schema,OFFICE_HOUR_DRAFT_SCHEMA);
  assert.equal(hour.sectionCount,2);
  assert.equal(hour.sections[0].texts.fr,"Antienne française.");
  assert.equal(hour.sections[1].texts.en,"Collect English.");
  assert.equal(hour.status,"STRUCTURED_UNVERIFIED");
  assert.equal(hour.officePrecedenceVerified,false);
  assert.equal(hour.officeCompletenessVerified,false);
  assert.equal(hour.languagesAligned,false);
  assert.equal(hour.printedEditionCertified,false);
  assert.equal(hour.publishable,false);
  assert.equal(hour.published,false);
  assert.equal(h.calls.length,3);
  assert.deepEqual(h.calls.map(x=>x.language),["la","en","fr"]);
  assert.ok(h.calls.every(x=>x.path===path&&x.diagnostic==="office-source-first"));
});
test("second hour draft reuses cached parsed sources; no bulk generation",async()=>{
  const h=host(),bridge=createOfficeMassHostBridge({hostResolver:h.resolver});
  await composeOfficeHourDraft({resolver:bridge,selection});
  await composeOfficeHourDraft({resolver:bridge,selection});
  assert.equal(h.calls.length,3);
  assert.equal(bridge.cachedSourceCount(),3);
});
test("unlabelled or non-pinned host is rejected rather than impersonated",()=>{
  const h=host();
  delete h.resolver.sourceRevision;
  assert.throws(()=>createOfficeMassHostBridge({hostResolver:h.resolver}),
    /OFFICE_MASS_SOURCE_PIN_NOT_VERIFIED/);
  h.resolver.sourceRevision="0".repeat(40);
  assert.throws(()=>createOfficeMassHostBridge({hostResolver:h.resolver}),
    /OFFICE_MASS_SOURCE_PIN_NOT_VERIFIED/);
});
test("host output cannot contradict claimed pinned source identity",async()=>{
  for(const mismatch of [{sourceRevision:"0".repeat(40)},
    {sourcePath:"Commune/C1"},{language:"en"}]){
    const h=host({modify:(p,lang)=>({map:originals[lang],...mismatch})});
    const bridge=createOfficeMassHostBridge({hostResolver:h.resolver});
    await assert.rejects(bridge.resolveSection({
      path,section:"Oratio",language:"la",role:"COLLECT"
    }),/OFFICE_HOST_SOURCE_(REVISION|PATH|LANGUAGE)_CHANGED/);
  }
});
test("partial host parsing cannot be mistaken for a complete Office",async()=>{
  const h=host({modify:(p,lang)=>({map:lang==="fr"?new Map():originals[lang]})});
  await assert.rejects(
    composeOfficeHourDraft({resolver:createOfficeMassHostBridge({hostResolver:h.resolver}),selection}),
    /OFFICE_SOURCE_SECTION_EMPTY/
  );
});
test("invalid research selection cannot call a source resolver",async()=>{
  const h=host(),bridge=createOfficeMassHostBridge({hostResolver:h.resolver});
  for(const updates of [
    {date:"2026-02-30"},{hour:"SUNDAY"}, {edition:"MASS_1962"},
    {status:"CERTIFIED"}, {sourceRevision:"0".repeat(40)},
    {orderedSections:[]},
    {orderedSections:[selection.orderedSections[0],selection.orderedSections[0]]}
  ]){
    await assert.rejects(composeOfficeHourDraft({
      resolver:bridge,selection:{...selection,...updates}
    }),/OFFICE_DRAFT_(SELECTION|SECTION_ID)_INVALID/);
  }
  assert.equal(h.calls.length,0);
});
test("no generic Common substitution for missing proper section",async()=>{
  const h=host({modify:(p,lang)=>({map:new Map([["Oratio",["An unrelated prayer"]]])})});
  const bridge=createOfficeMassHostBridge({hostResolver:h.resolver});
  await assert.rejects(composeOfficeHourDraft({resolver:bridge,selection}),
    /OFFICE_SOURCE_SECTION_EMPTY/);
  assert.equal(h.calls.length,3);
});
test("unresolved original directives fail without guessed composition",async()=>{
  const h=host({modify:(p,lang)=>({map:new Map([
    ["Antiphona",["Antiphona."]],["Oratio",["@Commune/C1:Oratio"]]])})});
  const bridge=createOfficeMassHostBridge({hostResolver:h.resolver});
  await assert.rejects(composeOfficeHourDraft({resolver:bridge,selection}),
    /OFFICE_SOURCE_DIRECTIVE_UNRESOLVED/);
});
test("two sections of same original document keep stable identities",async()=>{
  const h=host(),bridge=createOfficeMassHostBridge({hostResolver:h.resolver});
  const hour=await composeOfficeHourDraft({resolver:bridge,selection});
  assert.deepEqual(hour.sections.map(s=>s.sourceId),
    [path+"#Antiphona",path+"#Oratio"]);
  assert.deepEqual(hour.sections.map(s=>s.key),["antiphon-a","collect-a"]);
  assert.equal("html" in hour,false);
});
