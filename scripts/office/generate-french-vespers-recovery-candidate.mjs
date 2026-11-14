#!/usr/bin/env node
/**
 * Produce a distinct, research-only trilingual 2026 All Saints II-Vespers
 * candidate from a one-line reversible Sunday-rank source overlay.
 * Never write into the canonical 96-document baseline or public app.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {join,resolve} from "node:path";
import {spawnSync,execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {frenchSundayRankGuardCandidate,PINNED_RANK_GUARD_FILE}
 from "./experiment-french-vespers-rank-guard.mjs";
import {DIVINUM_OFFICIUM_OFFICE_PIN} from "../../src/office/generator-probe-contract.js";

export const CANDIDATE_COHORT="ao.office.french-vespers-restoration.v1";
const digest=s=>createHash("sha256").update(s).digest("hex");

export function candidateSafetyRecord({original,candidate,root}={}){
  if(!original||!candidate||!root||original===candidate)
    throw Error("OFFICE_FR_VESPERS_CANDIDATE_PATHS_UNSAFE");
  return Object.freeze({schema:CANDIDATE_COHORT,
    sourceRevision:DIVINUM_OFFICIUM_OFFICE_PIN,
    canonicalBaselineUnmodified:true,
    sourceFixAppliedOnlyInScratch:true,
    independentlyPrintedFrenchProperCertified:false,
    frenchTranslationEditoriallyApproved:false,
    productionRouteRegistered:false,canPublish:false,published:0});
}
function generate({upstream,out}={}){
  if(!upstream||!out)throw Error("OFFICE_FR_VESPERS_CANDIDATE_ARGS_MISSING");
  const source=join(upstream,PINNED_RANK_GUARD_FILE);
  const revision=execFileSync("git",["rev-parse","HEAD"],{cwd:upstream,encoding:"utf8"}).trim();
  if(revision!==DIVINUM_OFFICIUM_OFFICE_PIN)throw Error("OFFICE_FR_VESPERS_CANDIDATE_WRONG_PIN");
  const original=readFileSync(source,"utf8");
  const patch=frenchSundayRankGuardCandidate(original);
  const expected=digest(original);
  const command=fileURLToPath(new URL("./phase-b-generate.mjs",import.meta.url));
  const guard=candidateSafetyRecord({original:source,candidate:out,root:upstream});
  mkdirSync(out,{recursive:true});
  try{
    writeFileSync(source,patch.content,"utf8");
    const process=spawnSync(processExec(),[command,"--upstream",upstream,"--out",out,
      "--dates","2026-11-01","--hours","VESPERS","--languages","la,en,fr"],{
      cwd:resolve(fileURLToPath(new URL("../../",import.meta.url))),
      encoding:"utf8",timeout:120000,maxBuffer:24*1024*1024,env:{...globalProcessEnv()}
    });
    if(process.error||process.status!==0)
      throw Error("OFFICE_FR_VESPERS_CANDIDATE_COMPOSER_FAILED:"+
        (process.error?.message??String(process.stderr).slice(-1000)));
  }finally{
    writeFileSync(source,original,"utf8");
  }
  if(digest(readFileSync(source,"utf8"))!==expected)
    throw Error("OFFICE_FR_VESPERS_CANDIDATE_SOURCE_NOT_RESTORED");
  if(execFileSync("git",["status","--porcelain","--",PINNED_RANK_GUARD_FILE],{
    cwd:upstream,encoding:"utf8"}).trim())
    throw Error("OFFICE_FR_VESPERS_CANDIDATE_UPSTREAM_DIRTY");
  const manifest=JSON.parse(readFileSync(join(out,"manifest.json"),"utf8"));
  if(manifest.sourceRevision!==revision||manifest.records.length!==3||
     manifest.records.some(r=>r.date!=="2026-11-01"||r.hour!=="VESPERS"||
       r.status!=="CAPTURED_UNVERIFIED"||r.envelopePass!==true||
       r.publishable!==false)||manifest.researchOnly!==true||
     manifest.counts.published!==0)
    throw Error("OFFICE_FR_VESPERS_CANDIDATE_MANIFEST_INVALID");
  writeFileSync(join(out,"research-restoration-provenance.json"),
    JSON.stringify({...guard,
      sourceFile:PINNED_RANK_GUARD_FILE,
      beforeSha256:patch.originalSha256,
      transientCandidateSha256:patch.candidateSha256,
      sourceRestoredSha256:expected,
      generatedCells:3},null,2)+"\n","utf8");
  console.log("OFFICE_FR_VESPERS_RESTORED_CANDIDATE",JSON.stringify({
    samples:3,sourceRestored:true,baselineUnmodified:true,published:0}));
}
function processExec(){return process.execPath}
function globalProcessEnv(){return process.env}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const a=process.argv.slice(2);
  try{
    if(a.length!==4||a[0]!=="--upstream"||a[2]!=="--out")
      throw Error("USAGE: --upstream /scratch/pinned --out /scratch/candidate");
    generate({upstream:resolve(a[1]),out:resolve(a[3])});
  }catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
