#!/usr/bin/env node
/**
 * Real pinned-source Vespers boundary audit: All Saints (I/II),
 * Advent I (I/II) and All Saints -> special All Souls.
 * No production data, no parallel ordo, no text or chant publication.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";
import {
  OFFICE_VESPERS_CONCURRENCE_VERSION,OFFICE_VESPERS_RUBRICS,
  inspectOfficeVespersPair,inspectAllSaintsToAllSouls
} from "../../src/office/vespers-concurrence-gate.js";

export function auditRealVespersTransitions({main,advent,souls}={}){
  const load=(folder,date)=>{
    if(typeof folder!=="string")throw Error("OFFICE_VESPERS_SOURCE_ROOT_MISSING");
    return JSON.parse(readFileSync(join(folder,date,"vespers","la.research.json"),"utf8"));
  };
  const saintsEve=load(main,"2026-10-31");
  const saints=load(main,"2026-11-01");
  const adventEve=load(advent,"2026-11-28");
  const adventDay=load(advent,"2026-11-29");
  const allSouls=load(souls,"2026-11-02");
  const paired=[
    inspectOfficeVespersPair({id:"ALL_SAINTS",eve:saintsEve,day:saints}),
    inspectOfficeVespersPair({id:"ADVENT_I",eve:adventEve,day:adventDay}),
  ];
  const special=inspectAllSaintsToAllSouls({saints,souls:allSouls});
  return Object.freeze({
    schema:"ao.office.vespers-concurrence-source-audit.v1",
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    ruleVersion:OFFICE_VESPERS_CONCURRENCE_VERSION,
    rubrics:OFFICE_VESPERS_RUBRICS,paired,special,
    pairsSourceConsistent:paired.filter(x=>x.sourceStructureConsistent).length,
    pairsChecked:paired.length,
    // The known Gregorian reading is observed, not an automatic Office/commemoration decision.
    locallyAdjudicatedVespers:0,
    verifiedCommemorations:0,
    printedOfficeTextCertified:0,
    productionRouteRegistered:false,canPublish:false,published:0
  });
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==8||args[0]!=="--main"||args[2]!=="--advent"||
    args[4]!=="--souls"||args[6]!=="--report")
    throw Error("USAGE: --main path --advent path --souls path --report path");
  const report=auditRealVespersTransitions({
    main:resolve(args[1]),advent:resolve(args[3]),souls:resolve(args[5])
  });
  const dest=resolve(args[7]);
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("OFFICE_VESPERS_CONCURRENCE_AUDIT",JSON.stringify({
    matched:report.pairsSourceConsistent,total:report.pairsChecked,
    specialOffice:report.special.status,
    sourceHeadlinesConsistent:report.special.sourceHeadlinesConsistent,
    verifiedCommemorations:report.verifiedCommemorations,published:report.published
  }));
  if(report.pairsSourceConsistent!==report.pairsChecked||
    !report.special.sourceHeadlinesConsistent||
    !report.special.calendarAllSoulsDateMatches||
    report.verifiedCommemorations!==0||report.published!==0)
    throw Error("OFFICE_VESPERS_SOURCE_BOUNDARY_CONTRADICTION");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main()}catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
