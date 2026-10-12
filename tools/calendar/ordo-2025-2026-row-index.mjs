#!/usr/bin/env node
// Extract PDF table references into a conservative 1962 Ordo comparison index.
// Never infer 1962 eligibility from optional alternatives or cross-row text.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname} from "node:path";
const input=process.argv[2],output=process.argv[3];
if(!input||!output)throw Error("Usage: node ordo-2025-2026-row-index.mjs pdftotext-layout.txt output.json");
const pages=readFileSync(input,"utf8").split("\f");
const current=new Set();
const rows=[],warnings=[];
for(let page=0;page<pages.length;page++){
 const lines=pages[page].split(/\r?\n/);
 const header=lines.find(x=>x.includes("MASS(ES)")&&x.includes("PREFACE")&&x.includes("COMMEMORATION"));
 const prefaceIndex=header?.indexOf("PREFACE")??-1,commemIndex=header?.indexOf("COMMEMORATION")??-1;
 for(let i=0;i<lines.length;i++){
  const matches=[...lines[i].matchAll(/\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(25|26)\b/g)];
  if(!matches.length)continue;
  const m=matches[0];
  const year=2000+Number(m[3]),month=Number(m[1]),day=Number(m[2]);
  const date=[year,String(month).padStart(2,"0"),String(day).padStart(2,"0")].join("-");
  const target=new Date(date+"T12:00:00Z");
  if(Number.isNaN(target.getTime())||target.toISOString().slice(0,10)!==date)continue;
  if(date<"2025-11-30"||date>"2026-11-28")continue;
  const heading=lines.slice(Math.max(0,i-2),i+1).filter(x=>x.trim());
  // A source date may be written on the second visual line of a printed
  // table row. Retain original lines and avoid pretending OCR is a decree.
  const nearby=lines.slice(Math.max(0,i-1),Math.min(lines.length,i+3));
  const principal=lines[i].trim().replace(m[0],"").trim()||lines[i-1]?.trim()||"";
  const rowLine=lines[i-1]??lines[i];
  const prefaceCell=prefaceIndex>=0&&commemIndex>prefaceIndex?
     rowLine.slice(prefaceIndex,commemIndex).trim():null;
  const prefaceTerms=["Holy Trinity","Common","BVM","Holy Spirit","Pentecost","Holy Ghost","Nativity","Epiphany","Easter","Passion","Lent","Advent","Ascension","Sacred Heart","Christ the King","Apostles","Dead","St. Joseph","Trinity","For the Dead"];
  const recognized=prefaceCell?
    prefaceTerms.find(x=>prefaceCell.toLowerCase().includes(x.toLowerCase()))??null:null;
  if(current.has(date)){warnings.push({date,page:page+1,kind:"DUPLICATE_PRINTED_DATE_OR_OPTIONAL_FORM"});continue}
  current.add(date);
  rows.push({date,sourcePdfPage:page+1,rawDateLine:lines[i].trim(),rawPreviousLine:lines[i-1]?.trim()??"",
   rawNextLine:lines[i+1]?.trim()??"",rawPriorContext:heading,provisionalPrincipalText:principal,
   rawPrefaceColumn:prefaceCell,prefaceKeywordCandidate:recognized,
   prefaceColumnLocated:prefaceIndex>=0&&commemIndex>prefaceIndex,
   principalMassEditionVerified:false,commemorationClassVerified:false,prefaceTextIndependentlyVerified:false,
   publicationApproved:false});
 }
}
rows.sort((a,b)=>a.date.localeCompare(b.date));
const start="2025-11-30",end="2026-11-28";
const expected=364;
const result={schema:"MASS_1962_ORDO_2025_2026_OCR_ROW_INDEX_V1",sourceUrl:"https://extraordinaryform.org/ordo/2025-2026Ordo.pdf",dateStart:start,dateEnd:end,
 methodology:"Physical Ordo PDF text layer by printed date token and page; preserves adjacent original row lines for an editor. A preface keyword may be an alternative or nearby row; never import it without printed-page comparison. The Ordo includes optional Cum Sanctissima and Pro Aliquibus Locis rows.",
 stats:{uniquePrintedDates:rows.length,expectedDates:expected,missedDays:expected-rows.length,
  candidatePrefaceKeywords:rows.filter(x=>x.prefaceKeywordCandidate).length,duplicateOrAlternativeDates:warnings.length,
  calendarDecisionsCertified:0,appApprovals:0},
 rows,warnings,releaseGate:"RESEARCH_ONLY"};
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result.stats));
if(rows.length<350)throw Error("Ordo text extraction not yet sufficient for year comparison: "+rows.length+" dates");
