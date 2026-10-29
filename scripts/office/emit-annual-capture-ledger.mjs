#!/usr/bin/env node
/**
 * Generate a provenance-checked METADATA-ONLY capture index in CI scratch,
 * after re-verifying all original XHTML bytes. Emit its JSON as a single
 * machine-readable CI log line for reviewed GitHub commit; do not upload
 * source texts, and do not promote the captured Office to the public app.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import {verifyRawAnnualCapture} from "./validate-annual-capture.mjs";
import {buildAnnualCaptureLedger,validateAnnualCaptureLedger}
  from "../../src/office/annual-capture-ledger.js";
function main(argv){
  if(argv.length!==10||
     argv[0]!=="--root"||argv[2]!=="--start"||
     argv[4]!=="--composer"||argv[6]!=="--run-id"||
     argv[8]!=="--out")
    throw Error("OFFICE_LEDGER_CLI_ARGS_INVALID");
  const root=resolve(argv[1]),startDate=argv[3];
  const manifest=JSON.parse(readFileSync(join(root,"manifest.json"),"utf8"));
  const verification=verifyRawAnnualCapture({
    root,manifest,startDate,year:Number(startDate.slice(0,4))});
  const ledger=buildAnnualCaptureLedger({
    manifest,verification,year:verification.year,
    startDate,composerRevision:argv[5],workflowRunId:argv[7]});
  validateAnnualCaptureLedger(ledger);
  writeFileSync(resolve(argv[9]),JSON.stringify(ledger,null,2)+"\n","utf8");
  console.log("OFFICE_CAPTURE_LEDGER_SUMMARY",JSON.stringify({
    batchId:ledger.batchId,count:ledger.verifiedRawSourceCount,
    recordsSha256:ledger.recordsSha256,sourceRevision:ledger.sourceRevision,
    certified:ledger.liturgicallyCertified,published:ledger.published
  }));
  // The log contains only hashes/provenance. The byte files remain scratch.
  console.log("OFFICE_CAPTURE_LEDGER_JSON "+JSON.stringify(ledger));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2))}
  catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
