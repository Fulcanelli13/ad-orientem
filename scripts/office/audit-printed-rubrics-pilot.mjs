#!/usr/bin/env node
/**
 * Phase H — independent printed RUBRIC witnesses vs pinned source-generation
 * structure. No printed *proper texts* or translation verification is claimed.
 *
 * Sources physically inspected on 2026-10-28:
 *  1961 Breviarium Romanum, Codex Rubricarum, printed pp. 41, 61–63
 *  https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf
 *  1960 English translation/commentary, pp. 20–21, 28–33
 *  https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf
 *
 * Source *structure* checks are necessary but never sufficient to certify a
 * date's Office, individual texts, languages, local feasts or commemorations.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";

export const PRINTED_RUBRIC_WITNESSES=Object.freeze({
  edition:"Breviarium Romanum, editio iuxta typicam 1961, Codex Rubricarum",
  latinUrl:"https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf",
  commentaryUrl:"https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf",
  rules:Object.freeze([
    Object.freeze({id:"ORDER_91",page:41,pdfPage:41,paragraph:"91",
      principle:"All Souls yields to an occurring Sunday; its rank cannot be used as a simple universal tie-breaker.",
      check:"PRINTED_RUBRIC_ONLY",verifiedAgainstPrintedRule:true}),
    Object.freeze({id:"MATINS_161",page:61,pdfPage:61,paragraph:"161(d)",
      principle:"All Souls Matins has three nocturns, nine psalms and nine lessons.",
      check:"SOURCE_STRUCTURE_REQUIRES_MANUAL_COLLATION",verifiedAgainstPrintedRule:true}),
    Object.freeze({id:"SUNDAY_166",page:62,pdfPage:62,paragraph:"166(a,b,g,h)",
      principle:"First Sunday Vespers follows Saturday's psalter where not proper; Compline after First Vespers is Saturday, after Second Vespers is Sunday.",
      check:"SOURCE_COMPLINE_PROPER_REQUIRES_MANUAL_COLLATION",verifiedAgainstPrintedRule:true}),
    Object.freeze({id:"FESTIVE_167",page:62,pdfPage:62,paragraph:"167(a,b,g,h)",
      principle:"Class I feast First and Second Vespers are festive; Compline following either is of Sunday.",
      check:"SOURCE_COMPLINE_PROPER_REQUIRES_MANUAL_COLLATION",verifiedAgainstPrintedRule:true}),
    Object.freeze({id:"CONCURRENCE_103_105",page:20,pdfPage:17,paragraph:"103–105",
      principle:"Vespers concurrence requires comparing both days and commemorations rather than reusing the Mass day winner.",
      check:"CALENDAR_AND_LOCAL_PROPER_REQUIRES_MANUAL_COLLATION",verifiedAgainstPrintedRule:true}),
  ]),
});

function checked(doc,{date,hour,language}){
  if(doc?.schema!=="ao.office.source-cells.v1"||
    doc?.date!==date||doc?.hour!==hour||doc?.language!==language||
    doc?.status!=="STRUCTURED_UNVERIFIED"||doc?.publishable!==false||
    doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    !Array.isArray(doc.sections)||doc.sections.length<1)
    throw Error("OFFICE_RUBRIC_AUDIT_INVALID_SOURCE:"+date+":"+hour+":"+language);
  return doc;
}
const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replaceAll("æ","ae").replaceAll("Æ","AE").toLowerCase();
export function inspectAllSoulsMatins(doc){
  checked(doc,{date:"2026-11-02",hour:"MATINS",language:"la"});
  const body=normalize(doc.sections.map(s=>s.text).join("\n"));
  const lineArr=body.split("\n").map(s=>s.trim());
  // Header naming differs across printed breviaries and source engines.
  // Count independent nocturn labels conservatively: if ambiguous, don't
  // mark success. A detected number of nine lessons is still not proof of
  // printed text, rubric omissions, or correct lesson selection.
  const nocturnHeaders=lineArr.filter(s=>/^(?:nocturn(?:us|um)?|in nocturno)\s*(?:[ivx]+|[123])\b/.test(s));
  const lessonHeaders=lineArr.filter(s=>/^(?:lectio|lectiones|lecti[oó]nes)\s*(?:[ivx]+|[1-9])\b/.test(s));
  const numbered=new Set(nocturnHeaders.map(s=>s.match(/\b(?:[ivx]+|[123])\b/)?.[0]).filter(Boolean));
  const n=numbered.size;
  const l=lessonHeaders.length;
  return Object.freeze({
    date:doc.date,hour:doc.hour,sourceCellCount:doc.sections.length,
    sourceLabel:doc.headline.split("\n")[0],
    nocturnLabelsObserved:n,lessonHeadersObserved:l,
    expectedNocturns:3,expectedLessons:9,
    sourceNocturnsConsistent:n===3,
    sourceLessonsConsistent:l===9,
    missingOrAmbiguous:n!==3||l!==9,
    independentlyCheckedPrintedOfficeText:false,
  });
}
export function inspectFeastTransition({halloween,allSaints,allSouls,matins}={}){
  const h=checked(halloween,{date:"2026-10-31",hour:"VESPERS",language:"la"});
  const s=checked(allSaints,{date:"2026-11-01",hour:"VESPERS",language:"la"});
  const d=checked(allSouls,{date:"2026-11-02",hour:"VESPERS",language:"la"});
  const mm=inspectAllSoulsMatins(matins);
  const isSaints=x=>/omnium sanctorum/.test(normalize(x.headline));
  const isSouls=x=>/defunctorum|fidelium/.test(normalize(x.headline));
  const results={
    "ALL_SAINTS_2026_10_31_FIRST_VESPERS_SOURCE":isSaints(h),
    "ALL_SAINTS_2026_11_01_SECOND_VESPERS_SOURCE":isSaints(s),
    "ALL_SOULS_2026_11_02_VESPERS_SOURCE":isSouls(d),
    "ALL_SOULS_MATINS_THREE_NOCTURNS_SOURCE":mm.sourceNocturnsConsistent,
    "ALL_SOULS_MATINS_NINE_LESSONS_SOURCE":mm.sourceLessonsConsistent,
  };
  const matched=Object.values(results).filter(Boolean).length;
  return Object.freeze({
    schema:"ao.office.independent-1961-rubric-pilot.v1",
    dateRange:["2026-10-31","2026-11-02"],
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    printedWitness:PRINTED_RUBRIC_WITNESSES,
    structuralIndicators:results,
    structuralChecksPassed:matched,
    structuralChecksTotal:Object.keys(results).length,
    allSoulsMatins:mm,
    observedTitles:{
      firstVespers:h.headline.split("\n")[0],
      secondVespers:s.headline.split("\n")[0],
      allSoulsVespers:d.headline.split("\n")[0],
    },
    unresolved:[
      "NOVEMBER_1_2_VESPERS_CONCURRENCE_AND_COMMEmORATIONS",
      "1961_PRINTED_PROPER_TEXT_LINES_NOT_COLLATED",
      "EN_FR_TRANSLATION_PARAGRAPH_COMPLETENESS_NOT_ATTESTED",
      "LOCAL_CALENDAR_VARIATIONS_NOT_RECONCILED",
      ...(matched===5?[]:["SOURCE_OFFICE_STRUCTURE_AMBIGUOUS"]),
    ],
    published:0,verifiedOfficeDates:0,verifiedTranslatedHours:0,
    canPublish:false,
  });
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==6||args[0]!=="--main"||args[2]!=="--souls"||args[4]!=="--report")
    throw Error("USAGE: --main path --souls path --report path");
  const root=resolve(args[1]),souls=resolve(args[3]);
  const read=(dir,date,hour)=>JSON.parse(readFileSync(join(dir,date,hour.toLowerCase(),"la.research.json"),"utf8"));
  const report=inspectFeastTransition({
    halloween:read(root,"2026-10-31","VESPERS"),
    allSaints:read(root,"2026-11-01","VESPERS"),
    allSouls:read(souls,"2026-11-02","VESPERS"),
    matins:read(souls,"2026-11-02","MATINS"),
  });
  const destination=resolve(args[5]);
  mkdirSync(dirname(destination),{recursive:true});
  writeFileSync(destination,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("OFFICE_PRINTED_RUBRIC_CASES",JSON.stringify({
    indicators:report.structuralIndicators,
    passed:report.structuralChecksPassed,
    total:report.structuralChecksTotal,
    matins:{nocturns:report.allSoulsMatins.nocturnLabelsObserved,
      lessons:report.allSoulsMatins.lessonHeadersObserved},
    outstanding:report.unresolved,
    verifiedDates:0,published:0,
  }));
  if(!report.structuralIndicators.ALL_SAINTS_2026_10_31_FIRST_VESPERS_SOURCE||
     !report.structuralIndicators.ALL_SAINTS_2026_11_01_SECOND_VESPERS_SOURCE||
     !report.structuralIndicators.ALL_SOULS_2026_11_02_VESPERS_SOURCE)
    throw Error("OFFICE_RUBRIC_PILOT_DAY_WRONG");
}
if(process.argv[1]&&new URL("file://"+resolve(process.argv[1])).href===import.meta.url){
  try{main()}catch(e){console.error(e?.stack??String(e));process.exitCode=1;}
}
