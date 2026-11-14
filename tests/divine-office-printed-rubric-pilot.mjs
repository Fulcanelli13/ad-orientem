import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
  PRINTED_RUBRIC_WITNESSES, inspectAllSoulsMatins, inspectFeastTransition
} from "../scripts/office/audit-printed-rubrics-pilot.mjs";

const sample=(date,hour,first,body)=>{
  const cells=Array.isArray(body)?body:[body];
  return {
    schema:"ao.office.source-cells.v1",date,hour,language:"la",
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    status:"STRUCTURED_UNVERIFIED",publishable:false,
    headline:first+"\nVespera",sections:cells.map((text,i)=>({
      index:i+1,sourceIndex:i+1,sourceCellId:(hour==="VESPERS"?"Vespera":"Matutinum")+(i+1),
      text,semantic:{role:"SOURCE_SECTION"},
    }))
  };
};
const matins=()=>{
  const bodies=[];
  for(let n=1;n<=3;n++){
    bodies.push("Nocturnus "+["I","II","III"][n-1]+"\nAnt. Requiem aeternam");
    for(let i=1;i<=3;i++){
      const number=(n-1)*3+i;
      bodies.push("Lectio "+["I","II","III","IV","V","VI","VII","VIII","IX"][number-1]+"\nJob 7: "+number);
    }
  }
  return sample("2026-11-02","MATINS","Commemoratio Omnium Fidelium Defunctorum",bodies);
};
const halloween=sample("2026-10-31","VESPERS","Omnium Sanctorum","Vespera de sequenti");
const saints=sample("2026-11-01","VESPERS","Omnium Sanctorum","Conclusio");
const souls=sample("2026-11-02","VESPERS","Commemoratio Omnium Fidelium Defunctorum","Oratio");
test("printed rubric witness register is an independent read-only audit, not proper-text certification",()=>{
  assert.equal(PRINTED_RUBRIC_WITNESSES.rules.length,5);
  assert.deepEqual(PRINTED_RUBRIC_WITNESSES.rules.map(x=>x.id),
    ["ORDER_91","MATINS_161","SUNDAY_166","FESTIVE_167","CONCURRENCE_103_105"]);
  assert.equal(PRINTED_RUBRIC_WITNESSES.rules.every(x=>x.verifiedAgainstPrintedRule),true);
  assert.ok(PRINTED_RUBRIC_WITNESSES.rules.some(x=>x.paragraph==="161(d)"));
});
test("source-structure report detects three nocturns and nine lessons, but cannot certify the printed text",()=>{
  const result=inspectAllSoulsMatins(matins());
  assert.equal(result.nocturnLabelsObserved,3);
  assert.equal(result.lessonHeadersObserved,9);
  assert.equal(result.sourceNocturnsConsistent,true);
  assert.equal(result.sourceLessonsConsistent,true);
  assert.equal(result.independentlyCheckedPrintedOfficeText,false);
  const incomplete={...matins(),sections:matins().sections.filter(x=>!x.text.startsWith("Lectio IX"))};
  assert.equal(inspectAllSoulsMatins(incomplete).missingOrAmbiguous,true);
});
test("All Saints–All Souls Office audit never silently promotes structurally matched dates",()=>{
  const report=inspectFeastTransition({halloween,allSaints:saints,allSouls:souls,matins:matins()});
  assert.equal(report.structuralChecksPassed,5);
  assert.equal(report.structuralChecksTotal,5);
  assert.equal(report.canPublish,false);
  assert.equal(report.verifiedOfficeDates,0);
  assert.equal(report.verifiedTranslatedHours,0);
  assert.equal(report.published,0);
  assert.ok(report.unresolved.some(x=>x.includes("CONCURRENCE")));
  const wrong={...saints,headline:"Dominica XXIII post Pentecosten"};
  const failed=inspectFeastTransition({halloween,allSaints:wrong,allSouls:souls,matins:matins()});
  assert.equal(failed.structuralIndicators.ALL_SAINTS_2026_11_01_SECOND_VESPERS_SOURCE,false);
  assert.equal(failed.canPublish,false);
});
test("unrecognized non-source, already-published, wrong-date or foreign-pin material is rejected",()=>{
  assert.throws(()=>inspectAllSoulsMatins({...matins(),date:"2026-11-01"}),/INVALID_SOURCE/);
  assert.throws(()=>inspectAllSoulsMatins({...matins(),status:"CERTIFIED",publishable:true}),/INVALID_SOURCE/);
  assert.throws(()=>inspectAllSoulsMatins({...matins(),sourceRevision:"x".repeat(40)}),/INVALID_SOURCE/);
  assert.throws(()=>inspectAllSoulsMatins({...matins(),sections:[]}),/INVALID_SOURCE/);
});
