import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {reviewVespersCommemorationEvidence,screenGeneratedVespersCommemorations,
  OFFICE_VESPERS_COMMEMORATION_GATE} from "../src/office/vespers-commemoration-gate.js";

const text=[
  "Oratio {ex Proprio}","Oremus.","Main Office Collect. Per Dominum nostrum.",
  "Commemoratio Feria Adventus","Ant. Prophetae nuntiaverunt.",
  "℣. Rorate caeli desuper.","Orémus.","A second collect from the Proper.",
  "Per Dominum nostrum."
].join("\n");
const doc=(sourceText=text)=>({
  schema:"ao.office.source-cells.v1",date:"2026-12-20",hour:"VESPERS",language:"la",
  sourceRevision:DIVINUM_OFFICIUM_PIN,status:"STRUCTURED_UNVERIFIED",
  publishable:false,headline:"Dominica IV Adventus ~ I classis",
  sections:[{sourceCellId:"Vespera9",semantic:{role:"PRAYER"},text:sourceText,
    index:9,sourceIndex:9}]
});
const item=(overrides={})=>({
  date:"2026-12-20",kind:"PRIVILEGED",commemoratedId:"tempora:12-20:feria",
  calendarAuthority:"INDEPENDENT_OFFICE_REVIEW_PENDING",
  mainCollect:{sourceCellId:"Vespera9",literal:"Main Office Collect."},
  antiphon:{sourceCellId:"Vespera9",literal:"Ant. Prophetae nuntiaverunt."},
  versicle:{sourceCellId:"Vespera9",literal:"℣. Rorate caeli desuper."},
  oremus:{sourceCellId:"Vespera9",literal:"Orémus."},
  collect:{sourceCellId:"Vespera9",literal:"A second collect from the Proper."},
  ...overrides
});
test("source-owned exact three-part privileged commemoration still needs independent review",()=>{
  assert.equal(OFFICE_VESPERS_COMMEMORATION_GATE,"ao.office.vespers-commemoration-evidence.v1");
  const r=reviewVespersCommemorationEvidence({office:doc(),candidate:item()});
  assert.equal(r.status,"SOURCE_EVIDENCE_PRESENT_REVIEW_REQUIRED");
  assert.equal(r.sourceComponentsLocated,true);
  assert.equal(r.independentlyPrintedTextCertified,false);
  assert.equal(r.commemorationAuthorized,false);
  assert.equal(r.officePublicationAuthorized,false);
  assert.equal(r.published,0);
});
test("ordinary commemorations do not qualify at Vespers (RG 108)",()=>{
  const r=reviewVespersCommemorationEvidence({
    office:doc(),candidate:item({kind:"ORDINARY"})});
  assert.equal(r.reason,"RG_108_ORDINARY_COMMEMORATIONS_NOT_AT_VESPERS");
  assert.equal(r.commemorationAuthorized,false);
});
test("antiphon, versicle and collect cannot be missing, repeated or moved ahead of Office prayer",()=>{
  for(const bad of [
    {antiphon:{sourceCellId:"Vespera9",literal:"Absent antiphon."}},
    {versicle:{sourceCellId:"Vespera9",literal:"Absent versicle."}},
    {oremus:null},
    {collect:{sourceCellId:"Vespera8",literal:"A second collect from the Proper."}},
    {versicle:{sourceCellId:"Vespera9",literal:"Ant. Prophetae nuntiaverunt."}},
    {mainCollect:{sourceCellId:"Vespera9",literal:"A second collect from the Proper."}},
    {calendarAuthority:"MASS_RANK_ONLY"},
    {date:"2026-12-21"},
  ]){
    const result=reviewVespersCommemorationEvidence({
      office:doc(),candidate:item(bad)});
    assert.equal(result.status,"WITHHELD",JSON.stringify(bad));
    assert.equal(result.commemorationAuthorized,false);
  }
  const reversed=doc(text.replace(
    "Ant. Prophetae nuntiaverunt.\n℣. Rorate caeli desuper.",
    "℣. Rorate caeli desuper.\nAnt. Prophetae nuntiaverunt."));
  assert.equal(reviewVespersCommemorationEvidence({
    office:reversed,candidate:item()}).reason,
    "BR_251_ANTIPHON_VERSE_COLLECT_OUT_OF_ORDER");
});
test("inseparable St Peter–St Paul addition is prayer-only under RG 110(a)",()=>{
  const base=item({kind:"INSEPARABLE_PETER_PAUL",pair:"PETER_PAUL",
    apostlesSourceIdentityChecked:true,antiphon:null,versicle:null,oremus:null});
  const ok=reviewVespersCommemorationEvidence({office:doc(),candidate:base});
  assert.equal(ok.status,"SOURCE_EVIDENCE_PRESENT_REVIEW_REQUIRED");
  assert.equal(ok.reason,"RG_110_INSEPARABLE_PRAYER_ONLY");
  assert.equal(ok.commemorationAuthorized,false);
  for(const bad of [
    {apostlesSourceIdentityChecked:false},{pair:"PETER_AND_JOHN"},
    {antiphon:item().antiphon},{oremus:item().oremus}
  ]){
    const x=reviewVespersCommemorationEvidence({
      office:doc(),candidate:{...base,...bad}});
    assert.equal(x.status,"WITHHELD");
    assert.equal(x.reason,"RG_110_PETER_PAUL_EXCEPTION_IDENTITY_UNVERIFIED");
  }
});
test("BR 259 has an explicit withheld path for unusable proper antiphon AND verse",()=>{
  const candidate=item({
    kind:"PRIVILEGED_BR259_BOTH_OMITTED",antiphon:null,versicle:null,
    rubric259Review:"BOTH_PROPER_PARTS_INAPPLICABLE_REVIEW_PENDING",
  });
  const r=reviewVespersCommemorationEvidence({office:doc(),candidate});
  assert.equal(r.status,"SOURCE_EVIDENCE_PRESENT_REVIEW_REQUIRED");
  assert.equal(r.reason,"BR_259_NO_TRANSFER_OF_UNUSABLE_PROPER_PARTS");
  assert.equal(r.properOmissionIndependentlyEstablished,false);
  assert.equal(r.commemorationAuthorized,false);
  assert.equal(r.published,0);
  for(const changed of [{rubric259Review:null},
    {antiphon:item().antiphon},{versicle:item().versicle}]){
    const result=reviewVespersCommemorationEvidence({
      office:doc(),candidate:{...candidate,...changed}});
    assert.equal(result.status,"WITHHELD");
    assert.equal(result.reason,"BR_259_EXCEPTION_NOT_INDEPENDENTLY_ESTABLISHED");
  }
});
test("real-sample screening treats absent headings as UNKNOWN, not no commemoration",()=>{
  const found=screenGeneratedVespersCommemorations(doc());
  assert.equal(found.explicitCommemorationHeadingCount,1);
  assert.equal(found.possibleHeadings[0].sourceCellId,"Vespera9");
  assert.equal(found.absenceOfHeadingProvesNoCommemoration,false);
  const none=screenGeneratedVespersCommemorations(doc("Oratio\nA collect.\nConclusion."));
  assert.equal(none.explicitCommemorationHeadingCount,0);
  assert.equal(none.absenceOfHeadingProvesNoCommemoration,false);
  assert.equal(none.printAndLocalOrdoReviewRequired,true);
  assert.equal(none.published,0);
  assert.throws(()=>screenGeneratedVespersCommemorations({
    ...doc(),publishable:true}),/SOURCE_INVALID/);
});
