import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {planAnnualOfficeCaptures,selectAnnualOfficeCaptureBatch}
 from "../src/office/annual-capture-plan.js";
import {verifyRawAnnualCapture}
 from "../scripts/office/validate-annual-capture.mjs";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";

test("annual plan has 53 finite batches for 2026; 53 for leap-year 2028",()=>{
  const p=planAnnualOfficeCaptures({year:2026});
  assert.equal(p.dayCount,365);
  assert.equal(p.batchCount,53);
  assert.equal(p.plannedDocuments,8760);
  assert.equal(p.batches[0].plannedDocuments,168);
  assert.equal(p.batches.at(-1).plannedDocuments,24);
  assert.equal(p.batches.at(-1).endDate,"2026-12-31");
  assert.equal(selectAnnualOfficeCaptureBatch(p,"2026-11-05").endDate,"2026-11-11");
  assert.equal(new Set(p.batches.flatMap(x=>x.dates)).size,365);
  assert.ok(p.batches.every(x=>x.plannedDocuments<=168&&x.published===0));
  assert.equal(p.noAutomaticExecution,true);
  const leap=planAnnualOfficeCaptures({year:2028});
  assert.equal(leap.dayCount,366);
  assert.equal(leap.plannedDocuments,8784);
  assert.equal(leap.batches.at(-1).plannedDocuments,48);
  assert.throws(()=>planAnnualOfficeCaptures({year:2026,batchDays:8}),/ARGUMENT_INVALID/);
  assert.throws(()=>selectAnnualOfficeCaptureBatch(p,"2026-11-03"),/NOT_FOUND/);
});
test("verifier reads actual XHTML bytes and distinguishes raw capture from certification",()=>{
  const dir=mkdtempSync(join(tmpdir(),"office-capture-verification-"));
  try{
    const chunk=selectAnnualOfficeCaptureBatch(planAnnualOfficeCaptures({year:2026}),"2026-11-05");
    const records=[];
    for(const date of chunk.dates)for(const hour of [
      "MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"])
      for(const language of ["la","en","fr"]){
        const file=date+"/"+hour.toLowerCase()+"/"+language+".xhtml";
        const dst=join(dir,file);
        mkdirSync(join(dir,date,hour.toLowerCase()),{recursive:true});
        const body="<html>"+date+"|"+hour+"|"+language+"</html>";
        writeFileSync(dst,body);
        records.push({date,hour,language,file,bytes:Buffer.byteLength(body),
          sha256:createHash("sha256").update(body).digest("hex"),
          status:"CAPTURED_UNVERIFIED",envelopePass:true,publishable:false,
          compositionVerified:false,printedBreviaryCertified:false,
          languageCompletenessVerified:false});
      }
    const manifest={
      schema:"ao.office.engine-probe-manifest.v1",
      sourceRevision:DIVINUM_OFFICIUM_PIN,researchOnly:true,
      publicReaderEnabled:false,counts:{requested:168,captured:168,failed:0,published:0},
      records
    };
    const report=verifyRawAnnualCapture({root:dir,manifest,startDate:"2026-11-05"});
    assert.equal(report.validatedXhtmlEnvelopes,168);
    assert.equal(report.bytesSha256Verified,168);
    assert.equal(report.independentlyPrintedTextCertified,0);
    assert.equal(report.published,0);
    assert.equal(report.canPublish,false);
    const damaged={...manifest,records:[...manifest.records]};
    damaged.records[0]={...damaged.records[0],sha256:"f".repeat(64)};
    assert.throws(()=>verifyRawAnnualCapture({
      root:dir,manifest:damaged,startDate:"2026-11-05"
    }),/DIGEST_MISMATCH/);
    const wrongFile={...manifest,records:[...manifest.records]};
    wrongFile.records[0]={...wrongFile.records[0],file:"../some-other-file.xhtml"};
    assert.throws(()=>verifyRawAnnualCapture({
      root:dir,manifest:wrongFile,startDate:"2026-11-05"
    }),/FILE_PATH_UNTRUSTED/);
    const missing={...manifest,records:manifest.records.slice(1)};
    assert.throws(()=>verifyRawAnnualCapture({
      root:dir,manifest:missing,startDate:"2026-11-05"
    }),/MANIFEST_INCOMPLETE/);
    const duplicate={...manifest,records:[...manifest.records]};
    duplicate.records[1]={...duplicate.records[0]};
    assert.throws(()=>verifyRawAnnualCapture({
      root:dir,manifest:duplicate,startDate:"2026-11-05"
    }),/DUPLICATE_SLOT/);
    const unsafe={...manifest,sourceRevision:"unpinned"};
    assert.throws(()=>verifyRawAnnualCapture({
      root:dir,manifest:unsafe,startDate:"2026-11-05"
    }),/MANIFEST_INCOMPLETE/);
  }finally{rmSync(dir,{force:true,recursive:true});}
});
