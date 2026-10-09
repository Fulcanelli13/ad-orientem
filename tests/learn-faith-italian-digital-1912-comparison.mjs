import {readFileSync,writeFileSync,mkdirSync,mkdtempSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {join} from "node:path";
import {tmpdir} from "node:os";
import assert from "node:assert/strict";
const witness=JSON.parse(readFileSync("data/learn/ltfaith-pius-x-en-witness-index.v1.json","utf8"));
const files=[...new Set(witness.entries.map(e=>e.file))];
const commit=witness.upstreamCommit;
const root="https://raw.githubusercontent.com/gustavo-depaula/ember/"+commit+"/content/books/pius-x-catechism/it/";
const pdfUrl="https://www.corsiadeiservi.it/public/content/testi%20e%20documenti/Catechismo_PioX.pdf";
const dir=mkdtempSync(join(tmpdir(),"pius-x-it-compare-"));
const pdf=join(dir,"italian-digital.pdf");
const curl=(url,file)=>execFileSync("curl",["-fLSs","--retry","2","--connect-timeout","20","--max-time","150","-o",file,url],{timeout:170000});
curl(pdfUrl,pdf);
const info=execFileSync("pdfinfo",[pdf],{encoding:"utf8"});
const pagesCount=Number(info.match(/^Pages:\s*(\d+)/m)?.[1]);
assert.equal(pagesCount,68,"Unexpected Italian edition PDF identity/pages");
const extracted=execFileSync("pdftotext",["-raw",pdf,"-"],{encoding:"utf8",maxBuffer:12000000,timeout:30000});
const body=extracted.split("\f").slice(3,60).join("\n");
const candidates=[...body.matchAll(/^[ \t]*[*•]?\s*(\d{1,3})\.[ \t]+([^\r\n]{3,})/gm)];
let started=false,last=0;const found=[];
for(const m of candidates){
  const n=+m[1],line=m[2];
  if(!started){if(n!==1||!/chi\s+ci\s+ha\s+creato/i.test(line))continue;started=true;}
  if(n<=last||n>last+5)continue;
  found.push({q:n,offset:m.index,heading:line.slice(0,200)});
  last=n;
}
const qExtracted=new Map();
for(let i=0;i<found.length;i++){
 const row=found[i],next=found[i+1];
 qExtracted.set(row.q,body.slice(row.offset,next?.offset??body.length).slice(0,row.q===433?1100:4500).trim());
}
const sourceContents=await Promise.all(files.map(async filename=>{
 const resp=await fetch(root+filename);
 if(!resp.ok)throw Error("Pinned Italian source unreachable: "+filename+" HTTP "+resp.status);
 return [filename,await resp.text()];
}));
const original=new Map();
for(const [file,text] of sourceContents){
 const blocks=[...text.matchAll(/\*\*(\d+)\.\*\*\s*([\s\S]*?)(?=\n\*\*\d+\.\*\*|$)/g)];
 for(const m of blocks){
  const n=+m[1];
  if(original.has(n))throw Error("Repeated Italian primary number "+n);
  original.set(n,m[2].trim());
 }
}
assert.equal(original.size,433,"Pinned Markdown corpus must contain 433 original-language questions");
const normalize=s=>s.normalize("NFKD").replace(/\p{M}/gu,"").replace(/\b([A-Za-z])-\s+([A-Za-z])\b/g,"$1$2").replace(/[^a-zA-Z0-9]+/g," ").toLowerCase().replace(/\s+/g," ").trim();
const tri=s=>{const out=new Set();for(let i=0;i<s.length-2;i++)out.add(s.slice(i,i+3));return out};
const similarity=(left,right)=>{const a=tri(normalize(left)),b=tri(normalize(right));let same=0;for(const v of a)if(b.has(v))same++;return a.size+b.size?2*same/(a.size+b.size):0};
const questionMap=new Map(witness.entries.map(x=>[x.q,x]));
const rows=Array.from({length:433},(_,i)=>{
 const n=i+1,printed=qExtracted.get(n)??null,pinned=original.get(n)??null;
 const score=printed?similarity(pinned,printed):null;
 return {q:n,sourceFile:questionMap.get(n)?.file,independentDigitalPdfQuestionDetected:Boolean(printed),
  similarityScore:score===null?null:Number(score.toFixed(4)),
  reviewClass:score===null?"QUESTION_HEADING_NOT_PARSED":score<.5?"MAJOR_TEXT_DIVERGENCE_CANDIDATE":score<.72?"PARTIAL_MATCH_REQUIRES_EDITOR":score<.9?"SUBSTANTIVE_MATCH_MAY_HAVE_OCR_OR_VARIANT":"HIGH_LEXICAL_MATCH_NOT_PRINT_CERTIFIED",
  digitalExcerpt:printed?.replace(/\s+/g," ").slice(0,400)||null,pinnedExcerpt:pinned?.replace(/[*\s]+/g," ").slice(0,350)||null
 };
});
const counts={};for(const row of rows)counts[row.reviewClass]=(counts[row.reviewClass]||0)+1;
mkdirSync("artifacts/pius-x-collation",{recursive:true});
const out={version:"ITALIAN_DIGITAL_1912_EDITION_TEXT_COMPARISON_DRAFT",date:"2026-10-09",
 sourceDigitalPdf:pdfUrl,sourceDigitalPdfPages:pagesCount,pinnedItalianCommit:commit,scanned1912PrintedOriginal:false,
 compareMethod:"Poppler text extraction against pinned 433-question original-language Italian markdown; trigram overlap, not a theological equivalence score",
 numberedQuestionCount:rows.length,detectedQuestionCount:rows.filter(x=>x.independentDigitalPdfQuestionDetected).length,
 counts,rows};
writeFileSync("artifacts/pius-x-collation/italian-digital-comparison.json",JSON.stringify(out,null,2));
const low=rows.filter(x=>x.reviewClass==="MAJOR_TEXT_DIVERGENCE_CANDIDATE"||x.reviewClass==="QUESTION_HEADING_NOT_PARSED").slice(0,25).map(x=>({q:x.q,score:x.similarityScore,type:x.reviewClass,excerpt:x.digitalExcerpt?.slice(0,145)}));
console.log("ITALIAN_DIGITAL_MISSING_HEADING_DIAGNOSTICS="+JSON.stringify(rows.filter(x=>!x.independentDigitalPdfQuestionDetected).map(x=>({q:x.q,possible:candidates.filter(c=>Number(c[1])===x.q).slice(0,3).map(c=>c[0].slice(0,120))}))));
console.log("ITALIAN_DIGITAL_COMPARISON_SUMMARY="+JSON.stringify({status:"UNVERIFIED_CANDIDATE_COMPARISON",pdfPages:pagesCount,numbered:rows.length,detected:out.detectedQuestionCount,counts,reviewPriority:low,q226:rows[225],originalPrintingCertified:false}));
