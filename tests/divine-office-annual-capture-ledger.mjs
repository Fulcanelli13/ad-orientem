import test from "node:test";
import assert from "node:assert/strict";
import {buildAnnualCaptureLedger,validateAnnualCaptureLedger,reconcileAnnualCaptureLedger}
 from "../src/office/annual-capture-ledger.js";
import {planAnnualOfficeCaptures,selectAnnualOfficeCaptureBatch}
 from "../src/office/annual-capture-plan.js";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
const batch=selectAnnualOfficeCaptureBatch(planAnnualOfficeCaptures({year:2026}),"2026-11-05");
const records=batch.dates.flatMap(date=>["MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"]
 .flatMap(hour=>["la","en","fr"].map(language=>({
   date,hour,language,file:date+"/"+hour.toLowerCase()+"/"+language+".xhtml",
   bytes:71,sha256:"a".repeat(64),status:"CAPTURED_UNVERIFIED",
   envelopePass:true,publishable:false,compositionVerified:false,
   printedBreviaryCertified:false,languageCompletenessVerified:false
 }))));
const manifest={schema:"ao.office.engine-probe-manifest.v1",
 sourceRevision:DIVINUM_OFFICIUM_PIN,researchOnly:true,publicReaderEnabled:false,
 counts:{requested:168,captured:168,failed:0,published:0},records};
const verification={
 schema:"ao.office.annual-capture-verification.v1",year:2026,
 batchId:batch.id,sourceRevision:DIVINUM_OFFICIUM_PIN,
 validatedXhtmlEnvelopes:168,bytesSha256Verified:168,
 independentlyPrintedTextCertified:0,approved:0,published:0,canPublish:false
};
const kwargs={manifest,verification,year:2026,startDate:"2026-11-05",
 composerRevision:"ce39a02827049b31041ae250ec3b9b7c364f4a1e",
 workflowRunId:"40834603630"};
const make=()=>buildAnnualCaptureLedger(kwargs);

test("metadata capture ledger records all 168 slots and NO XHTML/Office content",()=>{
  const data=make();
  assert.equal(validateAnnualCaptureLedger(data),true);
  assert.equal(data.records.length,168);
  assert.equal(data.verifiedRawSourceCount,168);
  assert.equal(data.batchId,"2026-capture-45");
  assert.equal(data.liturgicallyCertified,0);
  assert.equal(data.published,0);
  assert.equal(data.canPublish,false);
  assert.equal(data.noSourceTextRetained,true);
  assert.ok(data.records.every(x=>
    Object.keys(x).sort().join(",")==="bytes,date,hour,language,sha256"));
  assert.equal(reconcileAnnualCaptureLedger(null,data).action,"CREATE");
  assert.equal(reconcileAnnualCaptureLedger(data,data).action,"UNCHANGED");
});
test("metadata cannot be duplicated, silently mutated, or treated as publication",()=>{
  const original=make();
  assert.throws(()=>reconcileAnnualCaptureLedger(original,{
    ...original,records:[...original.records.slice(0,-1),
      {...original.records.at(-1),sha256:"b".repeat(64)}]
  }),/HASH_OR_SORT_MISMATCH/);
  assert.throws(()=>reconcileAnnualCaptureLedger(original,{
    ...original,workflowRunId:"987654321"
  }),/IMMUTABLE_CONFLICT/);
  assert.throws(()=>validateAnnualCaptureLedger({
    ...original,records:[...original.records.slice(0,1),
      {...original.records[0]},...original.records.slice(2)]
  }),/DUPLICATE_RECORD/);
  assert.throws(()=>validateAnnualCaptureLedger({...original,published:1}),
    /OFFICE_LEDGER_INVALID/);
  assert.throws(()=>validateAnnualCaptureLedger({
    ...original,records:[{...original.records[0],xhtml:"PRIVATE TEXT"},...original.records.slice(1)]
  }),/UNSAFE_CONTENT/);
});
test("untrusted or unverified capture source cannot be promoted into index",()=>{
  const dirty={...manifest,records:[...records]};
  dirty.records[0]={...dirty.records[0],publishable:true};
  assert.throws(()=>buildAnnualCaptureLedger({...kwargs,manifest:dirty}),
    /UNVERIFIED_RECORD/);
  assert.throws(()=>buildAnnualCaptureLedger({...kwargs,verification:{
    ...verification,bytesSha256Verified:167
  }}),/SOURCE_PROOF_MISMATCH/);
  assert.throws(()=>buildAnnualCaptureLedger({...kwargs,composerRevision:"unpinned"}),
    /PROVENANCE_INCOMPLETE/);
  assert.throws(()=>buildAnnualCaptureLedger({...kwargs,workflowRunId:"not-a-run"}),
    /PROVENANCE_INCOMPLETE/);
});
