/**
 * Durable METADATA-ONLY provenance for raw Roman Office XHTML captures.
 * No raw XHTML, normalized prayers, translations, or rubrical approvals
 * are stored in this ledger. SHA evidence is not a licence to publish.
 */
import {createHash} from "node:crypto";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {planAnnualOfficeCaptures,selectAnnualOfficeCaptureBatch}
  from "./annual-capture-plan.js";
import {ANNUAL_OFFICE_HOURS,ANNUAL_OFFICE_LANGUAGES}
  from "./annual-readiness-register.js";

export const OFFICE_CAPTURE_LEDGER_SCHEMA="ao.office.raw-capture-ledger.v1";
const sha=/^[0-9a-f]{64}$/;
const key=r=>r.date+"|"+r.hour+"|"+r.language;
const stable=records=>records.map(r=>[r.date,r.hour,r.language,r.sha256,r.bytes]
  .join("|")).join("\n")+"\n";
const sorted=(a,b)=>a.date.localeCompare(b.date)||
  ANNUAL_OFFICE_HOURS.indexOf(a.hour)-ANNUAL_OFFICE_HOURS.indexOf(b.hour)||
  ANNUAL_OFFICE_LANGUAGES.indexOf(a.language)-ANNUAL_OFFICE_LANGUAGES.indexOf(b.language);

/** Call only with a real source manifest AND the verified-byte report. */
export function buildAnnualCaptureLedger({
  manifest,verification,year=2026,startDate,composerRevision,workflowRunId
}={}){
  if(!manifest||!verification||typeof startDate!=="string"||
     !/^[0-9a-f]{40}$/.test(composerRevision??"")||
     !/^\d{5,20}$/.test(String(workflowRunId??"")))
    throw Error("OFFICE_LEDGER_PROVENANCE_INCOMPLETE");
  const cohort=selectAnnualOfficeCaptureBatch(planAnnualOfficeCaptures({year}),startDate);
  if(manifest.schema!=="ao.office.engine-probe-manifest.v1"||
     manifest.sourceRevision!==DIVINUM_OFFICIUM_PIN||
     manifest.researchOnly!==true||manifest.publicReaderEnabled!==false||
     manifest.counts?.published!==0||
     verification.schema!=="ao.office.annual-capture-verification.v1"||
     verification.batchId!==cohort.id||
     verification.sourceRevision!==DIVINUM_OFFICIUM_PIN||
     verification.validatedXhtmlEnvelopes!==cohort.plannedDocuments||
     verification.bytesSha256Verified!==cohort.plannedDocuments||
     verification.independentlyPrintedTextCertified!==0||
     verification.approved!==0||verification.published!==0||
     verification.canPublish!==false||
     !Array.isArray(manifest.records)||
     manifest.records.length!==cohort.plannedDocuments)
    throw Error("OFFICE_LEDGER_SOURCE_PROOF_MISMATCH");

  const seen=new Set(),records=manifest.records.map(r=>{
    if(!cohort.dates.includes(r.date)||
       !ANNUAL_OFFICE_HOURS.includes(r.hour)||
       !ANNUAL_OFFICE_LANGUAGES.includes(r.language)||
       !sha.test(r.sha256??"")||
       !Number.isSafeInteger(r.bytes)||r.bytes<=0||
       r.status!=="CAPTURED_UNVERIFIED"||r.envelopePass!==true||
       r.publishable!==false||r.compositionVerified!==false||
       r.languageCompletenessVerified!==false||
       r.printedBreviaryCertified!==false||
       r.file!==r.date+"/"+r.hour.toLowerCase()+"/"+r.language+".xhtml")
      throw Error("OFFICE_LEDGER_UNVERIFIED_RECORD");
    const k=key(r);
    if(seen.has(k))throw Error("OFFICE_LEDGER_DUPLICATE_RECORD");
    seen.add(k);
    return Object.freeze({
      date:r.date,hour:r.hour,language:r.language,
      bytes:r.bytes,sha256:r.sha256
    });
  }).sort(sorted);
  for(const date of cohort.dates)
    for(const hour of ANNUAL_OFFICE_HOURS)
      for(const language of ANNUAL_OFFICE_LANGUAGES)
        if(!seen.has(date+"|"+hour+"|"+language))
          throw Error("OFFICE_LEDGER_MISSING_RECORD");
  const recordsSha256=createHash("sha256").update(stable(records)).digest("hex");
  return Object.freeze({
    schema:OFFICE_CAPTURE_LEDGER_SCHEMA,
    batchId:cohort.id,year,firstDate:cohort.startDate,lastDate:cohort.endDate,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    composerRevision,workflowRunId:String(workflowRunId),
    proof:"ACTUAL_XHTML_BYTES_AND_SHA256_VERIFIED_IN_EPHEMERAL_CI",
    recordsSha256,verifiedRawSourceCount:records.length,
    noSourceTextRetained:true,
    structurallyVerified:0,liturgicallyCertified:0,
    translationsVerified:0,sourceRightsApproved:false,
    approved:0,published:0,canPublish:false,records
  });
}
export function validateAnnualCaptureLedger(ledger){
  if(ledger?.schema!==OFFICE_CAPTURE_LEDGER_SCHEMA||
     !Number.isInteger(ledger.year)||
     ledger.sourceRevision!==DIVINUM_OFFICIUM_PIN||
     !/^[0-9a-f]{40}$/.test(ledger.composerRevision??"")||
     !/^\d{5,20}$/.test(ledger.workflowRunId??"")||
     ledger.proof!=="ACTUAL_XHTML_BYTES_AND_SHA256_VERIFIED_IN_EPHEMERAL_CI"||
     ledger.noSourceTextRetained!==true||
     ledger.approved!==0||ledger.published!==0||ledger.canPublish!==false||
     ledger.structurallyVerified!==0||ledger.liturgicallyCertified!==0||
     ledger.translationsVerified!==0||ledger.sourceRightsApproved!==false||
     !Array.isArray(ledger.records))
    throw Error("OFFICE_LEDGER_INVALID");
  const c=selectAnnualOfficeCaptureBatch(planAnnualOfficeCaptures({year:ledger.year}),
    ledger.firstDate);
  if(c.id!==ledger.batchId||c.endDate!==ledger.lastDate||
     ledger.verifiedRawSourceCount!==c.plannedDocuments||
     ledger.records.length!==c.plannedDocuments)
    throw Error("OFFICE_LEDGER_BATCH_INVALID");
  const seen=new Set();
  for(const r of ledger.records){
    if(Object.keys(r).sort().join(",")!=="bytes,date,hour,language,sha256"||
      !c.dates.includes(r.date)||!ANNUAL_OFFICE_HOURS.includes(r.hour)||
      !ANNUAL_OFFICE_LANGUAGES.includes(r.language)||
      !Number.isSafeInteger(r.bytes)||r.bytes<=0||!sha.test(r.sha256??""))
      throw Error("OFFICE_LEDGER_UNSAFE_CONTENT");
    if(seen.has(key(r)))throw Error("OFFICE_LEDGER_DUPLICATE_RECORD");
    seen.add(key(r));
  }
  const canonical=[...ledger.records].sort(sorted);
  if(JSON.stringify(canonical)!==JSON.stringify(ledger.records)||
     createHash("sha256").update(stable(canonical)).digest("hex")!==ledger.recordsSha256)
    throw Error("OFFICE_LEDGER_HASH_OR_SORT_MISMATCH");
  return true;
}
export function reconcileAnnualCaptureLedger(existing,incoming){
  validateAnnualCaptureLedger(incoming);
  if(existing==null)return Object.freeze({action:"CREATE",ledger:incoming});
  validateAnnualCaptureLedger(existing);
  if(existing.batchId!==incoming.batchId||
    JSON.stringify(existing)!==JSON.stringify(incoming))
    throw Error("OFFICE_LEDGER_IMMUTABLE_CONFLICT");
  return Object.freeze({action:"UNCHANGED",ledger:existing});
}
