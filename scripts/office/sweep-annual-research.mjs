#!/usr/bin/env node
/**
 * Explicit, zero-download, read-only annual Office research status.
 * No HTTP, CGI generator, rendered Offices, or permanently retained texts.
 * Optional roster contains source-ID candidate metadata, not Office texts.
 */
import {readFileSync,writeFileSync,statSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {sweepAnnualOfficeResearch} from "../../src/office/annual-research-sweep.js";

function main(argv){
 const options={};
 for(let i=0;i<argv.length;i+=2){
  if(!["--year","--out","--office-days","--source-index","--temporal"].includes(argv[i])||
     !argv[i+1]||options[argv[i]]!==undefined)
   throw Error("OFFICE_SWEEP_CLI_ARGS_INVALID");
  options[argv[i]]=argv[i+1];
 }
 if(!options["--year"]||!options["--out"]||
    !/^[12]\d{3}$/.test(options["--year"]))
  throw Error("OFFICE_SWEEP_CLI_ARGS_INVALID");
 let officeDays=[];
 if(options["--office-days"]){
  const source=resolve(options["--office-days"]);
  if(statSync(source).size>250000)throw Error("OFFICE_SWEEP_ROSTER_TOO_LARGE");
  officeDays=JSON.parse(readFileSync(source,"utf8"));
 }
 let filenameIndex=null;
 if(options["--source-index"]){
  const source=resolve(options["--source-index"]);
  if(statSync(source).size>200000)throw Error("OFFICE_SWEEP_FILENAME_INDEX_TOO_LARGE");
  filenameIndex=JSON.parse(readFileSync(source,"utf8"));
 }
 if(options["--temporal"]!==undefined&&options["--temporal"]!=="expanded")
  throw Error("OFFICE_SWEEP_TEMPORAL_MODE_INVALID");
 const report=sweepAnnualOfficeResearch({
  year:Number(options["--year"]),officeDays,filenameIndex,
  expandedTemporal:options["--temporal"]==="expanded"
 });
 writeFileSync(resolve(options["--out"]),JSON.stringify(report,null,2)+"\n","utf8");
 console.log("OFFICE_ANNUAL_RESEARCH_SWEEP",JSON.stringify(report.summary));
 console.log("OFFICE_ANNUAL_REASONS",JSON.stringify(report.reasons));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{main(process.argv.slice(2))}
 catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
