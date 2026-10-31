#!/usr/bin/env node
/**
 * Validate every actual bytes/file/SHA/slot in ONE bounded raw XHTML batch.
 * The raw source never leaves CI scratch. This gate certifies capture only,
 * not Office rubrics, translation, permissions, or liturgical completeness.
 */
import {readFileSync,statSync,realpathSync} from "node:fs";
import {resolve,join,sep} from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {planAnnualOfficeCaptures,selectAnnualOfficeCaptureBatch}
  from "../../src/office/annual-capture-plan.js";
import {ANNUAL_OFFICE_HOURS,ANNUAL_OFFICE_LANGUAGES}
  from "../../src/office/annual-readiness-register.js";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";
const key=r=>r.date+"|"+r.hour+"|"+r.language;
export function verifyRawAnnualCapture({root,manifest,startDate,year=2026}={}){
  if(!root||!manifest||!startDate)throw Error("OFFICE_CAPTURE_INPUTS_MISSING");
  const base=realpathSync(resolve(root));
  const plan=planAnnualOfficeCaptures({year});
  const batch=selectAnnualOfficeCaptureBatch(plan,startDate);
  if(manifest.schema!=="ao.office.engine-probe-manifest.v1"||
    manifest.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    manifest.researchOnly!==true||manifest.publicReaderEnabled!==false||
    manifest.counts?.published!==0||!Array.isArray(manifest.records)||
    manifest.records.length!==batch.plannedDocuments||
    manifest.counts.requested!==batch.plannedDocuments||
    manifest.counts.captured!==batch.plannedDocuments||
    manifest.counts.failed!==0)
    throw Error("OFFICE_CAPTURE_MANIFEST_INCOMPLETE");
  const actual=new Set();
  for(const record of manifest.records){
    const date=record.date,hour=record.hour,language=record.language;
    if(!batch.dates.includes(date)||!ANNUAL_OFFICE_HOURS.includes(hour)||
       !ANNUAL_OFFICE_LANGUAGES.includes(language)||
       record.publishable!==false||record.compositionVerified!==false||
       record.languageCompletenessVerified!==false||
       record.printedBreviaryCertified!==false||
       record.status!=="CAPTURED_UNVERIFIED"||record.envelopePass!==true||
       typeof record.sha256!=="string"||!/^[a-f0-9]{64}$/.test(record.sha256))
      throw Error("OFFICE_CAPTURE_SLOT_INVALID");
    const k=key(record);
    if(actual.has(k))throw Error("OFFICE_CAPTURE_DUPLICATE_SLOT:"+k);
    actual.add(k);
    const relative=date+"/"+hour.toLowerCase()+"/"+language+".xhtml";
    if(record.file!==relative)throw Error("OFFICE_CAPTURE_FILE_PATH_UNTRUSTED:"+k);
    const file=resolve(join(base,relative));
    if(!file.startsWith(base+sep))throw Error("OFFICE_CAPTURE_SOURCE_PATH_ESCAPES_ROOT");
    const st=statSync(file);
    if(!st.isFile()||st.size!==record.bytes||realpathSync(file)!==file)
      throw Error("OFFICE_CAPTURE_FILE_BYTES_INVALID:"+k);
    const bytes=readFileSync(file);
    if(createHash("sha256").update(bytes).digest("hex")!==record.sha256)
      throw Error("OFFICE_CAPTURE_BYTES_DIGEST_MISMATCH:"+k);
  }
  for(const date of batch.dates)
    for(const hour of ANNUAL_OFFICE_HOURS)
      for(const language of ANNUAL_OFFICE_LANGUAGES)
        if(!actual.has(date+"|"+hour+"|"+language))
          throw Error("OFFICE_CAPTURE_MISSING_SLOT");
  return Object.freeze({
    schema:"ao.office.annual-capture-verification.v1",year,
    batchId:batch.id,startDate:batch.startDate,endDate:batch.endDate,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    days:batch.dates.length,validatedXhtmlEnvelopes:actual.size,
    bytesSha256Verified:actual.size,
    structuralOfficeSectionsVerified:0,
    independentlyPrintedTextCertified:0,
    translationsApproved:0,approved:0,published:0,canPublish:false
  });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const a=process.argv.slice(2);
    if(a.length!==6||a[0]!=="--root"||a[2]!=="--start"||a[4]!=="--report")
      throw Error("USAGE: --root path --start YYYY-MM-DD --report filename");
    const root=resolve(a[1]);
    const result=verifyRawAnnualCapture({root,
      manifest:JSON.parse(readFileSync(join(root,"manifest.json"),"utf8")),
      startDate:a[3],year:Number(a[3].slice(0,4))});
    const {writeFileSync}=await import("node:fs");
    writeFileSync(resolve(a[5]),JSON.stringify(result,null,2)+"\n");
    console.log("OFFICE_SOURCE_BATCH_INTEGRITY",JSON.stringify(result));
  }catch(e){console.error(e?.stack??String(e));process.exitCode=1;}
}
