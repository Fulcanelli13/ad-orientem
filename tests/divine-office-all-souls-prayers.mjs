import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
  OFFICE_PRAYER_EXCEPTION_SOURCE,compareExceptionCollect,
} from "../scripts/office/audit-all-souls-proper-prayers.mjs";
const doc=(date,hour,text)=>({
  schema:"ao.office.source-cells.v1",
  date,hour,language:"la",sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  sections:[{index:1,sourceIndex:1,sourceCellId:"Prima1",
    text:"Psalmi\nPsalm 1",semantic:{role:"PSALMODY"}},
    {index:2,sourceIndex:2,sourceCellId:"Prima2",text,
      semantic:{role:"PRAYER"}}],
});
test("printed §248 exception is not fabricated by a reused ordinary prayer",()=>{
  assert.equal(OFFICE_PRAYER_EXCEPTION_SOURCE.rubric,"248");
  const a=compareExceptionCollect({
    hour:"PRIME",
    souls:doc("2026-11-02","PRIME","Oratio\nDeus, indulgentiarum Domine."),
    ordinary:doc("2026-11-03","PRIME","Oratio\nDomine Deus omnipotens."),
  });
  assert.equal(a.distinctFromFollowingOrdinaryCollect,true);
  assert.equal(a.correctProperTextIndependentlyCertified,false);
  assert.equal(a.translatedTextVerified,false);
  assert.equal(a.publishable,false);
  assert.equal(a.exceptionSourceCellId,"Prima2");
  assert.notEqual(a.exceptionTextSha256,a.controlTextSha256);
});
test("identical prayer is reported as a potential leak, not waved through",()=>{
  const same="Oratio\nSame prayer";
  const a=compareExceptionCollect({
    hour:"COMPLINE",
    souls:doc("2026-11-02","COMPLINE",same),
    ordinary:doc("2026-11-03","COMPLINE",same),
  });
  assert.equal(a.distinctFromFollowingOrdinaryCollect,false);
  assert.equal(a.correctProperTextIndependentlyCertified,false);
});
test("unresolved and incorrectly labeled source material fails closed",()=>{
  const input={
    hour:"PRIME",souls:doc("2026-11-02","PRIME","Oratio\nDeus."),
    ordinary:doc("2026-11-03","PRIME","Oratio\nDómine."),
  };
  assert.throws(()=>compareExceptionCollect({...input,hour:"VESPERS"}),/HOUR_UNSUPPORTED/);
  assert.throws(()=>compareExceptionCollect({...input,souls:{...input.souls,date:"2026-11-04"}}),/SOURCE_INVALID/);
  assert.throws(()=>compareExceptionCollect({...input,ordinary:{...input.ordinary,publishable:true}}),/SOURCE_INVALID/);
  assert.throws(()=>compareExceptionCollect({...input,ordinary:{...input.ordinary,sections:input.ordinary.sections.slice(0,1)}}),/PRAYER_AMBIGUOUS/);
});
