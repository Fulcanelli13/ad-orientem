#!/usr/bin/env node
/**
 * RESEARCH-ONLY generator probe. Uses Divinum Officium's own complete
 * EofficiumXhtml.pl engine, rather than concatenating raw horas source leaves.
 *
 * Example:
 * node scripts/office/phase-b-generate.mjs \
 *   --upstream ../divinum-officium --out /tmp/ao-office-probe \
 *   --dates 2026-10-28,2026-10-31,2026-11-01 \
 *   --hours LAUDS,VESPERS,COMPLINE --languages la,en,fr
 *
 * The output folder is a scratch-only research fixture, NOT a publication
 * destination. This script does not install a service, deploy, or change the
 * current Calendar, Pray or Mass routes.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import {
  DIVINUM_OFFICIUM_OFFICE_PIN, DEFAULT_PILOT_DATES,
  GENERATOR_HOUR_COMMANDS, GENERATOR_LANGUAGE,
  inspectGeneratedXhtml, makeGeneratorRequest,
} from "../../src/office/generator-probe-contract.js";

function options(argv) {
  const values={};
  for (let i=0;i<argv.length;i+=2) {
    const key=argv[i];
    if (!key?.startsWith("--") || !argv[i+1] || argv[i+1].startsWith("--"))
      throw Error("OFFICE_PROBE_ARGUMENT_INVALID:"+key);
    if (values[key]) throw Error("OFFICE_PROBE_ARGUMENT_DUPLICATE:"+key);
    values[key]=argv[i+1];
  }
  for (const key of Object.keys(values))
    if (!["--upstream","--out","--dates","--hours","--languages"].includes(key))
      throw Error("OFFICE_PROBE_ARGUMENT_UNKNOWN:"+key);
  if (!values["--upstream"] || !values["--out"])
    throw Error("OFFICE_PROBE_REQUIRES_UPSTREAM_AND_OUT");
  const split=value=>value.split(",").map(x=>x.trim()).filter(Boolean);
  const dates=split(values["--dates"]??DEFAULT_PILOT_DATES.join(","));
  const hours=split(values["--hours"]??"LAUDS,VESPERS,COMPLINE").map(x=>x.toUpperCase());
  const languages=split(values["--languages"]??"la,en,fr").map(x=>x.toLowerCase());
  if (!dates.length || !hours.length || !languages.length ||
      new Set(dates).size!==dates.length ||
      new Set(hours).size!==hours.length ||
      new Set(languages).size!==languages.length)
    throw Error("OFFICE_PROBE_DUPLICATE_OR_EMPTY_SELECTION");
  for (const date of dates) makeGeneratorRequest({date,hour:"LAUDS",language:"la"});
  for (const hour of hours) if (!GENERATOR_HOUR_COMMANDS[hour])throw Error("OFFICE_PROBE_HOUR_INVALID:"+hour);
  for (const language of languages) if (!GENERATOR_LANGUAGE[language])throw Error("OFFICE_PROBE_LANGUAGE_INVALID:"+language);
  return {upstream:resolve(values["--upstream"]),out:resolve(values["--out"]),dates,hours,languages};
}

function sha256(value) {return createHash("sha256").update(value,"utf8").digest("hex")}

async function main() {
  const opt=options(process.argv.slice(2));
  const entry=join(opt.upstream,"standalone/tools/epubgen2/EofficiumXhtml.pl");
  const cwd=join(opt.upstream,"standalone/tools/epubgen2");
  const rev=execFileSync("git",["rev-parse","HEAD"],{cwd:opt.upstream,encoding:"utf8"}).trim();
  if (rev!==DIVINUM_OFFICIUM_OFFICE_PIN)
    throw Error("OFFICE_PROBE_PIN_MISMATCH: expected "+DIVINUM_OFFICIUM_OFFICE_PIN+" got "+rev);
  const executable=await stat(entry);
  if (!executable.isFile())throw Error("OFFICE_PROBE_GENERATOR_MISSING");
  await mkdir(opt.out,{recursive:true});
  const records=[];
  // Match the upstream ebook generator: CGI.pm reads argv in command-line mode.
  const engineEnvironment={...process.env,TZ:"UTC"};
  delete engineEnvironment.REQUEST_METHOD;
  delete engineEnvironment.QUERY_STRING;
  for (const date of opt.dates) for (const hour of opt.hours) for (const language of opt.languages) {
    const request=makeGeneratorRequest({date,hour,language});
    const output=execFileSync("perl",[entry,request.query],{
      cwd,encoding:"utf8",timeout:120000,maxBuffer:24*1024*1024,
      env:engineEnvironment,
    });
    const result=inspectGeneratedXhtml({xhtml:output,date,hour,language});
    const file=date+"/"+hour.toLowerCase()+"/"+language+".xhtml";
    // Preserve raw XHTML for human collation; never insert upstream HTML into
    // the public DOM. Conversion/sanitization requires another reviewed step.
    await mkdir(join(opt.out,date,hour.toLowerCase()),{recursive:true});
    await writeFile(join(opt.out,file),output,"utf8");
    const record={
      date,hour,language,file,sha256:sha256(output),
      bytes:Buffer.byteLength(output,"utf8"),
      envelopePass:result.envelopePass,
      diagnosticErrors:[...result.errors],
      status:result.status,
      compositionVerified:false,languageCompletenessVerified:false,
      printedBreviaryCertified:false,publishable:false,
    };
    records.push(record);
    console.log([record.status,date,hour,language,record.bytes].join(" "));
  }
  const manifest={
    schema:"ao.office.engine-probe-manifest.v1",
    edition:"Rubrics 1960 - 1960",
    sourceRepository:"DivinumOfficium/divinum-officium",
    sourceRevision:rev,
    generator:"standalone/tools/epubgen2/EofficiumXhtml.pl",
    researchOnly:true,
    publicReaderEnabled:false,
    counts:{requested:records.length,captured:records.filter(x=>x.envelopePass).length,
      failed:records.filter(x=>!x.envelopePass).length,
      compositionVerified:0,published:0},
    records,
    // Critical: a complete XHTML envelope does not mean the Office texts,
    // local precedence, translation fidelity, or printed edition are complete.
    caveat:"Raw XHTML output only. Requires independent Office and locale checks before JSON conversion or publication.",
  };
  await writeFile(join(opt.out,"manifest.json"),JSON.stringify(manifest,null,2)+"\n","utf8");
  if (manifest.counts.failed)throw Error("OFFICE_PROBE_ENVELOPE_FAILURE:"+manifest.counts.failed);
  console.log("Office probe captured "+records.length+" unverified generator outputs; published 0.");
}

main().catch(error=>{console.error(error?.stack??String(error));process.exitCode=1;});
