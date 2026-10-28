#!/usr/bin/env node
/**
 * Reconcile one real Sunday Office with a pinned candidate music booklet's
 * incipits and Psalm numbers. This is provenance/structure evidence only;
 * melody, musical rights and printed-rubric verification remain separate.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {DIVINUM_OFFICIUM_OFFICE_PIN} from "../../src/office/generator-probe-contract.js";

const PILOT=Object.freeze({first:"2026-11-28",second:"2026-11-29",
  antiphons:["In illa die","Jucundare","Ecce Dominus veniet","Omnes","Ecce veniet"],
  secondPsalms:[109,110,111,112,113],
  secondMagnificat:"Ne timeas",
  // The known Second Vespers candidate score does NOT cover the First
  // Vespers Magnificat antiphon, and its Psalm selection differs.
  firstMagnificat:"Ecce nomen Domini",
});
function fold(s){
  return String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replaceAll("æ","ae").replaceAll("ǽ","ae").replaceAll("j","i").replace(/[^a-z ]/g," ").replace(/\s+/g," ").trim();
}
function firstAntiphon(text){
  const line=String(text).split("\n").find(x=>/^Ant\./i.test(x.trim()));
  return line?line.replace(/^Ant\.\s*/i,"").replace(/\s+\*.*$/,"").trim():null;
}
export function inspectVespersText(document){
  if(document?.schema!=="ao.office.source-cells.v1"||document?.hour!=="VESPERS"||
    document?.language!=="la"||document?.sourceRevision!==DIVINUM_OFFICIUM_OFFICE_PIN||
    document?.status!=="STRUCTURED_UNVERIFIED"||document?.publishable!==false)
    throw Error("OFFICE_SUNG_TEXT_WITNESS_INVALID");
  const sections=document.sections;
  if(!Array.isArray(sections)||sections.length<10)throw Error("OFFICE_SUNG_SECTIONS_INCOMPLETE");
  const psalmody=sections.filter(x=>x.semantic?.role==="PSALMODY");
  if(psalmody.length!==5)throw Error("OFFICE_SUNG_NOT_FIVE_PSALM_FORM");
  const psalms=psalmody.map(x=>{
    const m=x.text.match(/(?:^|\n)Psalmus\s+(\d+)(?:\(([^)]+)\))?/m);
    if(!m)throw Error("OFFICE_SUNG_PSALM_NUMBER_MISSING:"+x.sourceCellId);
    return {psalm:Number(m[1]),part:m[2]??null,sourceCellId:x.sourceCellId};
  });
  const g=sections.find(x=>x.semantic?.role==="GOSPEL_CANTICLE");
  const magnificatAntiphon=g&&firstAntiphon(g.text);
  if(!magnificatAntiphon)throw Error("OFFICE_SUNG_MAGNIFICAT_ANTIPHON_MISSING");
  return {date:document.date,headline:document.headline,
    antiphons:psalmody.map(x=>firstAntiphon(x.text)),
    psalms,magnificatAntiphon,sourceRevision:document.sourceRevision};
}
export function auditSundayPair({first,second}={}){
  const a=inspectVespersText(first),b=inspectVespersText(second);
  if(a.date!==PILOT.first||b.date!==PILOT.second)
    throw Error("OFFICE_SUNG_SUNDAY_DATES_MISMATCH");
  const firstSaturday=new Date(a.date+"T12:00:00Z").getUTCDay()===6;
  const secondSunday=new Date(b.date+"T12:00:00Z").getUTCDay()===0;
  if(!firstSaturday||!secondSunday)throw Error("OFFICE_SUNG_WEEKDAYS_INCORRECT");
  const antiphonCheck=arr=>arr.map((s,i)=>Boolean(s)&&
    fold(s).startsWith(fold(PILOT.antiphons[i])));
  const firstAntiphonsMatched=antiphonCheck(a.antiphons);
  const secondAntiphonsMatched=antiphonCheck(b.antiphons);
  const secondPsalmsMatched=b.psalms.every((x,i)=>x.psalm===PILOT.secondPsalms[i]&&x.part===null);
  const firstPsalmsDiffer=a.psalms.some((x,i)=>
    x.psalm!==b.psalms[i].psalm||x.part!==b.psalms[i].part);
  const firstMagnificatMatched=fold(a.magnificatAntiphon).startsWith(fold(PILOT.firstMagnificat));
  const secondMagnificatMatched=fold(b.magnificatAntiphon).startsWith(fold(PILOT.secondMagnificat));
  const result={
    schema:"ao.office.advent-2026-chant-text-research.v1",
    dates:[a.date,b.date],sourceRevision:a.sourceRevision,
    firstVespers:a,secondVespers:b,
    firstAntiphonsMatched,secondAntiphonsMatched,
    secondPsalmsMatched,firstPsalmsDiffer,
    firstMagnificatMatched,secondMagnificatMatched,
    requiresDistinctFirstVespersMusic:firstPsalmsDiffer||
      fold(a.magnificatAntiphon)!==fold(b.magnificatAntiphon),
    textScoreCandidatesAligned:firstAntiphonsMatched.every(Boolean)&&
      secondAntiphonsMatched.every(Boolean)&&secondPsalmsMatched&&
      firstMagnificatMatched&&secondMagnificatMatched,
    printedRubricsChecked:false,
    gabcMelodiesReviewed:false,scoresPublished:0,sungButtonEnabled:false,
  };
  return result;
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--out"||args[2]!=="--report")
    throw Error("USAGE: --out normalized-office-root --report file");
  const root=resolve(args[1]);
  const read=d=>JSON.parse(readFileSync(join(root,d,"vespers","la.research.json"),"utf8"));
  const result=auditSundayPair({first:read(PILOT.first),second:read(PILOT.second)});
  mkdirSync(dirname(resolve(args[3])),{recursive:true});
  writeFileSync(resolve(args[3]),JSON.stringify(result,null,2)+"\n","utf8");
  console.log("OFFICE_SUNDAY_CHANT_TEXT_CHECK",JSON.stringify({
    dates:result.dates,
    firstPsalms:result.firstVespers.psalms.map(x=>x.psalm+(x.part?"("+x.part+")":"")),
    secondPsalms:result.secondVespers.psalms.map(x=>x.psalm),
    firstAntiphonsMatched:result.firstAntiphonsMatched,
    secondAntiphonsMatched:result.secondAntiphonsMatched,
    secondPsalmsMatched:result.secondPsalmsMatched,
    firstMagnificatMatched:result.firstMagnificatMatched,
    secondMagnificatMatched:result.secondMagnificatMatched,
    distinctFirstVespersMusic:result.requiresDistinctFirstVespersMusic,
    verified:false,published:result.scoresPublished,
  }));
}
if(process.argv[1]&&new URL("file://"+resolve(process.argv[1])).href===import.meta.url){
  try{main()}catch(e){console.error(String(e?.stack??e));process.exitCode=1}
}
