#!/usr/bin/env node
/**
 * Generate a deterministic YEAR inventory and a small exception report.
 * Does not run a liturgical composer, claim a proper-text discrepancy,
 * copy copyrighted materials, persist 8,760 texts or enable an Office route.
 *
 * node scripts/office/build-annual-readiness-register.mjs --year 2026 \
 *   --out /tmp/office-readiness
 * Optional: --probe-manifest /scratch/pinned/manifest.json
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {buildAnnualOfficeReadiness} from "../../src/office/annual-readiness-register.js";
import {ledgerToAnnualEvidenceManifest} from "../../src/office/annual-capture-ledger.js";

export function parseReadinessArgs(args){
  if(args.length%2)throw Error("OFFICE_REGISTER_ARGS_UNPAIRED");
  const opts={};
  for(let i=0;i<args.length;i+=2){
    const [k,v]=[args[i],args[i+1]];
    if(!["--year","--out","--probe-manifest","--ledger-file"].includes(k)||!v||
       v.startsWith("--")||opts[k])throw Error("OFFICE_REGISTER_ARGS_INVALID");
    opts[k]=v;
  }
  if(!opts["--out"]||!opts["--year"]||!/^\d{4}$/.test(opts["--year"]))
    throw Error("OFFICE_REGISTER_YEAR_OUTPUT_REQUIRED");
  return {year:Number(opts["--year"]),out:resolve(opts["--out"]),
    probe:opts["--probe-manifest"]?resolve(opts["--probe-manifest"]):null,
    ledger:opts["--ledger-file"]?resolve(opts["--ledger-file"]):null};
}
function main(){
  const opts=parseReadinessArgs(process.argv.slice(2));
  if(opts.probe&&opts.ledger)
    throw Error("OFFICE_REGISTER_SOURCE_EVIDENCE_AMBIGUOUS");
  const ledger=opts.ledger?
    JSON.parse(readFileSync(opts.ledger,"utf8")):null;
  const probes=opts.probe?[JSON.parse(readFileSync(opts.probe,"utf8"))]:
    ledger?[ledgerToAnnualEvidenceManifest(ledger)]:[];
  const data=buildAnnualOfficeReadiness({year:opts.year,probeManifests:probes});
  mkdirSync(opts.out,{recursive:true});
  const inventory=join(opts.out,opts.year+"-office-annual-readiness.json");
  const exceptions=join(opts.out,opts.year+"-office-annual-exceptions.json");
  writeFileSync(inventory,JSON.stringify(data,null,2)+"\n","utf8");
  const summary={schema:"ao.office.annual-readiness-summary.v1",year:opts.year,
    sourceRevision:data.sourceRevision,summary:data.summary,
    historicalMetadataLedgerImported:!!ledger,
    sourceXhtmlBytesAvailableFromLedger:false,
    exceptions:data.exceptions,release:data.release,
    caveat:"Raw source envelope counts are NOT Office correctness or translation approval."};
  writeFileSync(exceptions,JSON.stringify(summary,null,2)+"\n","utf8");
  console.log("OFFICE_ANNUAL_READINESS",JSON.stringify({
    year:opts.year,civilDays:data.summary.civilDays,
    planned:data.summary.planned,rawCaptured:data.summary.rawCaptured,
    ungenerated:data.summary.notGenerated,
    knownBlockers:data.summary.knownBlockerRowCount,
    historicalHashOnlyCaptureEvidence:!!ledger,
    independentlyCertified:data.summary.liturgicallyCertified,
    published:data.summary.published
  }));
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
  try{main()}catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
