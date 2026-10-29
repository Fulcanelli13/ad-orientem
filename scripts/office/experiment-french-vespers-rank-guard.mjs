#!/usr/bin/env node
/**
 * Narrow research-only hypothesis: the pinned 1960 Roman II Vespers
 * commemorations gate checks the TRANSLATED rank field for 'Dominica',
 * unintentionally rejecting French 'dimanche' as a nonprivileged day.
 *
 * Temporarily extend one exact Perl regular expression in CI SCRATCH.
 * Compare 31 Oct and 1 Nov in all LA/EN/FR, then restore original bytes.
 * No app source text, public page, or upstream commit is changed.
 */
import {readFileSync,writeFileSync,unlinkSync} from "node:fs";
import {createHash} from "node:crypto";
import {join,resolve} from "node:path";
import {execFileSync,spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {makeGeneratorRequest,DIVINUM_OFFICIUM_OFFICE_PIN,inspectGeneratedXhtml}
  from "../../src/office/generator-probe-contract.js";

const OLD="&& $w{Rank} !~ /Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|;;6/i";
const NEW="&& $w{Rank} !~ /Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|dimanche|;;6/i";
export const PINNED_RANK_GUARD_FILE="web/cgi-bin/horas/specials/orationes.pl";
const digest=data=>createHash("sha256").update(data).digest("hex");

export function frenchSundayRankGuardCandidate(original){
  if(typeof original!=="string")throw Error("OFFICE_FR_VESPERS_RANK_GUARD_INPUT_INVALID");
  if(original.split(OLD).length!==2)
    throw Error("OFFICE_FR_VESPERS_RANK_GUARD_ANCHOR_NOT_UNIQUE");
  const content=original.replace(OLD,NEW);
  if(content.replace(NEW,OLD)!==original)
    throw Error("OFFICE_FR_VESPERS_RANK_GUARD_NOT_REVERSIBLE");
  return Object.freeze({
    content,
    changedOnlySundayRankRecognition:true,
    sourceModificationIsScratchOnly:true,
    originalSha256:digest(original),candidateSha256:digest(content),
    certifiedPrintedOffice:false,published:0,
  });
}
const fold=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replaceAll("æ","ae").replaceAll("œ","oe");
function sourceFeatures(raw,language){
  const text=fold(raw).replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ");
  const antiphon=language==="fr"?/jesus\s*,?\s*se retournant/.test(text):
    language==="en"?/but jesus turned him about/.test(text):
    /at (?:jesus|iesus) conversus/.test(text);
  const collect=language==="fr"?/pardonnez, nous vous en supplions, seigneur/.test(text):
    language==="en"?/o lord, we beseech thee, absolve thy people/.test(text):
    /absolve,? quaesumus,? domine/.test(text);
  return Object.freeze({antiphon,collect});
}
function run(upstream,date,language){
  const cwd=join(upstream,"standalone/tools/epubgen2");
  const entry=join(cwd,"EofficiumXhtml.pl");
  const request=makeGeneratorRequest({date,hour:"VESPERS",language});
  const env={...process.env,TZ:"UTC"};
  delete env.REQUEST_METHOD;delete env.QUERY_STRING;
  const p=spawnSync("perl",[entry,request.query],{cwd,env,
    encoding:"utf8",timeout:120000,maxBuffer:24*1024*1024});
  if(p.error||p.status!==0)
    throw Error("OFFICE_FR_VESPERS_RANK_GUARD_ENGINE_FAILED:"+date+":"+language+":"+(p.error?.message??p.status));
  const raw=String(p.stdout??"");
  if(!inspectGeneratedXhtml({xhtml:raw,date,hour:"VESPERS",language}).envelopePass)
    throw Error("OFFICE_FR_VESPERS_RANK_GUARD_ENVELOPE_FAILED:"+date+":"+language);
  return {date,language,sha256:digest(raw),features:sourceFeatures(raw,language)};
}
function research(upstream,report){
  const path=join(upstream,PINNED_RANK_GUARD_FILE);
  const revision=execFileSync("git",["rev-parse","HEAD"],{cwd:upstream,encoding:"utf8"}).trim();
  if(revision!==DIVINUM_OFFICIUM_OFFICE_PIN)
    throw Error("OFFICE_FR_VESPERS_RANK_GUARD_PIN_MISMATCH");
  const original=readFileSync(path,"utf8");
  const patch=frenchSundayRankGuardCandidate(original);
  const expectedDigest=digest(original);
  const dates=["2026-10-31","2026-11-01"],languages=["la","en","fr"];
  const baseline=dates.flatMap(date=>languages.map(language=>run(upstream,date,language)));
  let candidate;
  try{
    writeFileSync(path,patch.content,"utf8");
    candidate=dates.flatMap(date=>languages.map(language=>run(upstream,date,language)));
  }finally{
    writeFileSync(path,original,"utf8");
  }
  if(digest(readFileSync(path,"utf8"))!==expectedDigest)
    throw Error("OFFICE_FR_VESPERS_RANK_GUARD_RESTORE_FAILED");
  if(execFileSync("git",["status","--porcelain","--",PINNED_RANK_GUARD_FILE],{
    cwd:upstream,encoding:"utf8"}).trim())
    throw Error("OFFICE_FR_VESPERS_RANK_GUARD_SOURCE_DIRTY");
  const cases=baseline.map((original,i)=>{
    const changed=candidate[i];
    const compare=(original.date==="2026-11-01"&&original.language==="fr");
    return Object.freeze({
      date:original.date,language:original.language,experimentTarget:compare,
      baseline:original.features,candidate:changed.features,
      rawChanged:original.sha256!==changed.sha256,
      unaffectedSourceIdentical:compare?null:original.sha256===changed.sha256
    });
  });
  const desired=cases.find(x=>x.experimentTarget);
  const unexpected=cases.filter(x=>!x.experimentTarget&&!x.unaffectedSourceIdentical);
  const reportValue=Object.freeze({
    schema:"ao.office.french-vespers-rank-guard-experiment.v1",
    pinnedSourceRevision:revision,
    sourceFile:PINNED_RANK_GUARD_FILE,
    originalSha256:patch.originalSha256,
    candidateSha256:patch.candidateSha256,
    exactOneExpressionChanged:true,
    upstreamFileRestored:true,
    cases,
    targetFrenchSecondVespersRecovered:
      desired.candidate.antiphon&&desired.candidate.collect&&
      !desired.baseline.antiphon&&!desired.baseline.collect,
    otherFiveSourceOutputsUnchanged:unexpected.length===0,
    releaseAuthorized:false,printedBreviaryCertified:false,
    translationCertified:false,productionRouteRegistered:false,published:0,
  });
  writeFileSync(report,JSON.stringify(reportValue,null,2)+"\n","utf8");
  console.log("OFFICE_FR_VESPERS_RANK_GUARD_EXPERIMENT",JSON.stringify({
    recovery:reportValue.targetFrenchSecondVespersRecovered,
    otherFiveUnchanged:reportValue.otherFiveSourceOutputsUnchanged,
    cases:cases.map(x=>({date:x.date,lang:x.language,changed:x.rawChanged,
      before:x.baseline,after:x.candidate})),published:0}));
  if(unexpected.length)throw Error("OFFICE_FR_VESPERS_RANK_GUARD_UNRELATED_OUTPUT_CHANGED");
  return reportValue;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const a=process.argv.slice(2);
  try{
    if(a.length!==4||a[0]!=="--upstream"||a[2]!=="--report")
      throw Error("USAGE: --upstream /pinned/scratch --report /scratch/report.json");
    research(resolve(a[1]),resolve(a[3]));
  }catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
