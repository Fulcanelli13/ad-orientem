#!/usr/bin/env node
// Research-only full-volume Latin anchor discovery. Page coincidences are NOT 1962 certification.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname} from "node:path";
const [input,output]=process.argv.slice(2);
if(!input||!output)throw Error("Usage: node script input-pdftotext.txt output.json");
const prefix="data/geography/research/";
const packets=JSON.parse(readFileSync(prefix+"mass-1962-high-priority-100-evidence-packets-20261011.v1.json","utf8"));
const normalize=s=>(s||"").replace(/([A-Za-zæœ])[-\\u00ad]\\s*\\n\\s*([A-Za-zæœ])/gi,"$1$2")
 .toLowerCase().replace(/æ/g,"ae").replace(/œ/g,"oe").normalize("NFD")
 .replace(/[\\u0300-\\u036f\\u00ad\\u0002]/g,"").replace(/j/g,"i").replace(/v/g,"u")
 .replace(/[^a-z]+/g," ").replace(/\\s+/g," ").trim();
const rawPages=readFileSync(input,"utf8").split("\f");
if(!rawPages.at(-1).trim())rawPages.pop();
if(rawPages.length<900)throw Error("Not a full scanned Missal: "+rawPages.length+" pages");
const pageText=rawPages.map(normalize);
const front=normalize(rawPages.slice(0,32).join(" "));
const sourceChecks={missaleRomanum:front.includes("missale romanum"),decretum:front.includes("decretum"),
 rubricarumInstructum:front.includes("rubricarum instructum"),dated1962:front.includes("mcmlxii")||front.includes("1962")};
const anchors=[];
for(const row of packets.rows){
 const sources=[
 ...row.sectionEvidence.map(s=>({name:s.originalSection,phrase:s.sourceLatinIncipit,source:"ALL_SECTION"})),
 ...row.witnessPositions.map(s=>({name:s.originalSection,phrase:s.sourceLatinIncipit,source:"FOUR_SLOT"}))];
 for(const s of sources){
  let words=normalize(s.phrase).split(" ").filter(Boolean);
  if(["v","r"].includes(words[0]))words=words.slice(1);
  const base={sourcePath:row.sourcePath,sourceSection:s.name,sourceWitness:s.source,
   latinIncipit:s.phrase?.slice(0,165)||null,publishable:false,editionCertified:false,bibleVerseCertified:false};
  if(words.length<6){
   anchors.push({...base,result:"SHORT_OR_UNAVAILABLE_ANCHOR",pageCandidates:[],candidateCount:0});
   continue;
  }
  const tiers=[9,7,5,4].filter(n=>n<=words.length);
  let phrase=null,candidates=[],matchedWords=0;
  for(const n of tiers){
   const trial=words.slice(0,n).join(" ");
   const pages=[];
   for(let i=0;i<pageText.length;i++)if(pageText[i].includes(trial))pages.push(i+1);
   if(pages.length){phrase=trial;candidates=pages;matchedWords=n;break;}
  }
  anchors.push({...base,searchPhrase:phrase,result:candidates.length?"PRINTED_OCR_CANDIDATE":"NO_EXACT_OCR_MATCH",
   matchStrengthWords:matchedWords,pageCandidates:candidates.slice(0,15),candidateCount:candidates.length,
   multipleMatches:candidates.length>1,ocrFoundNotVisuallyCertified:true});
 }
}
const sourcePaths=[...new Set(anchors.map(x=>x.sourcePath))];
const matchedPaths=new Set(anchors.filter(x=>x.candidateCount>0).map(x=>x.sourcePath));
const stats={sourcePaths:sourcePaths.length,sourcePathsWithAnyCandidate:matchedPaths.size,
 sourcePathsWithoutCandidate:sourcePaths.length-matchedPaths.size,anchorSections:anchors.length,
 sectionCandidates:anchors.filter(x=>x.candidateCount>0).length,
 uniquePageCandidates:anchors.filter(x=>x.candidateCount===1).length,
 ambiguousPageCandidates:anchors.filter(x=>x.candidateCount>1).length,
 noExactOcrMatch:anchors.filter(x=>x.result==="NO_EXACT_OCR_MATCH").length,
 shortAnchors:anchors.filter(x=>x.result==="SHORT_OR_UNAVAILABLE_ANCHOR").length,
 pdfPages:rawPages.length,editionCertified:0,publicationApproved:0};
const result={schema:"MASS_1962_FULL_PDF_OCR_100_SOURCE_ANCHOR_CANDIDATES_V1",date:"2026-10-11",
 sourcePdfUrl:"https://media.musicasacra.com/pdf/missale62.pdf",
 sourceHost:"Church Music Association of America",sourcePdfSHA256:process.env.MISSAL_WITNESS_SHA256||null,
 sourceEditionCaution:"CMAA 1962-labelled PDF: inspect frontmatter and late-1962 corrections separately; compare Propria 1962 revision. OCR matching is not calendrical or textual certification.",
 frontmatterFlags:sourceChecks,
 sourcePackets:prefix+"mass-1962-high-priority-100-evidence-packets-20261011.v1.json",
 caution:"A contiguous OCR Latin snippet appears on a PDF page. Not proof of selected Mass, chant order, correct biblical verse, identical edition or approval; manually compare printed headings/rubrics. Zero release flags.",
 stats,anchors,publicationStatus:"RESEARCH_ONLY"};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({frontmatter:sourceChecks,stats}));
