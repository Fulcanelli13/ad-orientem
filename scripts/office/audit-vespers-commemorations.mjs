#!/usr/bin/env node
/**
 * Scan the already generated pinned Vespers research samples for possible
 * commemoration headings, without claiming the absence of headings means
 * the absence of an appointed commemoration. No source copying or promotion.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";
import {OFFICE_VESPERS_COMMEMORATION_GATE,
  screenGeneratedVespersCommemorations,
  collateAllSaintsSundayVespersCommemoration} from "../../src/office/vespers-commemoration-gate.js";
const SAMPLES=Object.freeze([
  ["main","2026-10-31"],["main","2026-11-01"],
  ["souls","2026-11-02"],["advent","2026-11-28"],["advent","2026-11-29"]
]);
export function auditRealVespersCommemorations({main,advent,souls}={}){
  const roots={main,advent,souls};
  const sourceDocuments=new Map();
  const cases=SAMPLES.map(([group,date])=>{
    if(typeof roots[group]!=="string"||!roots[group])throw Error("OFFICE_COMM_ROOT_MISSING");
    const doc=JSON.parse(readFileSync(join(roots[group],date,"vespers","la.research.json"),"utf8"));
    sourceDocuments.set(date,doc);
    return Object.freeze({...screenGeneratedVespersCommemorations(doc),group});
  });
  const sundayComparisons=["2026-10-31","2026-11-01"].map(date=>
    collateAllSaintsSundayVespersCommemoration(sourceDocuments.get(date)));
  return Object.freeze({
    schema:"ao.office.vespers-commemoration-screening.v1",
    sundayComparisons,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    gate:OFFICE_VESPERS_COMMEMORATION_GATE,
    sampleDates:cases.length,cases,
    // A discovered heading is a research lead, not a certified appointment;
    // the absence of such a heading is not proof of zero commemorations.
    independentlyVerifiedOfficeCommemorations:0,
    certifiedVespersTextComponents:0,localOrdoReviewed:false,
    canPublish:false,published:0,productionRouteRegistered:false
  });
}
function mainFn(){
  const args=process.argv.slice(2);
  if(args.length!==8||args[0]!=="--main"||args[2]!=="--advent"||
    args[4]!=="--souls"||args[6]!=="--report")
    throw Error("USAGE: --main path --advent path --souls path --report path");
  const report=auditRealVespersCommemorations({
    main:resolve(args[1]),advent:resolve(args[3]),souls:resolve(args[5])
  });
  const dest=resolve(args[7]);
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(report,null,2)+"\n");
  console.log("OFFICE_VESPERS_COMMEMORATION_SCREEN",JSON.stringify({
    sampleDates:report.sampleDates,
    cases:report.cases.map(c=>({date:c.date,
      sourceCells:c.scannedPrayerSourceCellIds,
      possibleHeadings:c.explicitCommemorationHeadingCount})),
    sundayComparisons:report.sundayComparisons.map(c=>({
      date:c.date,part:c.part,sourceHeading:c.sourceHeading,
      incipits:c.componentIncipitsLocated,inOrder:c.componentOrderMatches,
      sourceMatched:c.sourceStructureMatches,
      originalPrinted1961Certified:c.original1961BreviaryPrintedProperCertified
    })),
    certified:report.independentlyVerifiedOfficeCommemorations,published:report.published
  }));
  // These two specific Latin source triplets have now been checked
  // against independently illustrated Sunday incipits. Treat a future
  // mismatch as a source regression, NOT as permission to substitute text.
  if(report.sundayComparisons.length!==2||
    report.sundayComparisons.some(c=>!c.sourceStructureMatches||
      Object.values(c.componentIncipitsLocated).some(v=>v!==true)||
      c.original1961BreviaryPrintedProperCertified!==false||
      c.canPublish!==false||c.published!==0))
    throw Error("OFFICE_VESPERS_SUNDAY_COMM_EXACT_SOURCE_MISMATCH");
  if(report.sampleDates!==5||report.cases.some(c=>
      c.absenceOfHeadingProvesNoCommemoration!==false||
      c.printAndLocalOrdoReviewRequired!==true)||report.published!==0)
    throw Error("OFFICE_VESPERS_COMMEMORATION_SCREEN_DRIFT");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{mainFn()}catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}