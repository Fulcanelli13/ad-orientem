import {readFileSync,writeFileSync,mkdirSync,mkdtempSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
const map=JSON.parse(readFileSync("data/learn/ltfaith-pius-x-fr-1913-scan-page-candidates.v1.json","utf8"));
assert.equal(map.questionCount,433);
const url=map.sourcePdf;
const dir=mkdtempSync(join(tmpdir(),"fr-1913-qa-"));
const pdf=join(dir,"printed-french.pdf");
execFileSync("curl",["-fLSs","--retry","2","--connect-timeout","20","--max-time","180","-o",pdf,url],{timeout:200000});
const {readFileSync:read}=await import("node:fs");
const sha256=createHash("sha256").update(read(pdf)).digest("hex");
const raw=execFileSync("pdftotext",["-raw",pdf,"-"],{encoding:"utf8",maxBuffer:20000000,timeout:40000});
const pages=raw.split("\f");
assert.ok(pages.length>=165 && pages.length<=167,"Unexpected scanned French PDF page count");
const rows=[];
const safePage=(p)=>pages[p-1]||"";
for(const loc of map.entries){
 const start=loc.pdfPageOneIndexedCandidates[0];
 const allPages=[...loc.pdfPageOneIndexedCandidates,...(loc.continuationPdfPagesOneIndexed||[])];
 const wanted=loc.q;
 let match=null,sourcePage=null;
 for(const p of allPages){
   const page=safePage(p).replace(/\u00ad/g,"");
   // The historical printed text sometimes uses a prefixed asterisk.
   const hits=[...page.matchAll(/^\s*\*?\s*(\d{1,3})\.\s+([^\r\n]{3,})/gm)];
   const target=hits.find(m=>+m[1]===wanted);
   if(target){
     const next=hits.find(m=>m.index>target.index&&+m[1]>wanted);
     const until=next?.index??page.length;
     match=page.slice(target.index,until).trim().slice(0,2200);
     sourcePage=p;
     break;
   }
 }
 const status=match?"UNCERTIFIED_QA_OCR_CANDIDATE":"UNCERTIFIED_PAGE_CONTEXT_ONLY_NUMBER_NOT_RECOVERED";
 const excerpt=match??safePage(start).replace(/\s+/g," ").slice(0,950);
 rows.push({q:wanted,sourcePdfUrl:loc.scanUrl,printedPageCandidate:start-10,pageOneIndexed:sourcePage??start,
  independentPhotoRead:loc.status==="VISUALLY_CONFIRMED_ORIGINAL_FRENCH_1913_PRINT_QA",
  extractionStatus:status,
  textCandidate:excerpt,
  textAcceptedForPublication:false});
}
const counts=rows.reduce((o,r)=>(o[r.extractionStatus]=(o[r.extractionStatus]||0)+1,o),{});
mkdirSync("artifacts/pius-x-collation",{recursive:true});
const out={version:"PIUS_X_FRENCH_1913_ORIGINAL_SCAN_OCR_QA_CANDIDATES_V1",
 scanUrl:url,scanSha256:sha256,pages:165,questionCount:433,
 method:"PDF OCR text extraction; one candidate per numbered question from bounded original scan page; fallback gives full-page context for missing OCR headings; candidates are NOT verified transcriptions",
 autoExportOnly:true,fullyProofreadByNativeFrenchEditor:false,approvedForPublication:false,counts,rows};
writeFileSync("artifacts/pius-x-collation/french-1913-qa-ocr-candidates.json",JSON.stringify(out,null,2));
console.log("FR1913_QA_OCR_CANDIDATES_SUMMARY="+JSON.stringify({status:"PROVISIONAL_NOT_CERTIFIED",pages:165,questionCount:433,counts,photoVerifiedEntries:rows.filter(x=>x.independentPhotoRead).length,sourceSha256:sha256,unparsed:rows.filter(x=>!x.textCandidate||x.extractionStatus.startsWith("UNCERTIFIED_PAGE")).map(x=>x.q).slice(0,60)}));
