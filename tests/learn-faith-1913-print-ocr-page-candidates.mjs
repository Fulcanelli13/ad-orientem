import {execFileSync} from "node:child_process";
import {readFileSync,mkdtempSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
const url="https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf";
const dir=mkdtempSync(join(tmpdir(),"pius-x-1913-"));
const pdf=join(dir,"original-1913.pdf");
try {
  execFileSync("curl",["--fail","--location","--retry","2","--connect-timeout","20","--max-time","180","--output",pdf,url],{stdio:"pipe",timeout:210000});
  const raw=execFileSync("pdftotext",["-raw",pdf,"-"],{encoding:"utf8",maxBuffer:16000000,timeout:30000});
  const pages=raw.split("\f");
  const refs={};
  for(let p=16;p<Math.min(pages.length,119);p++){
    const t=pages[p].replace(/\u00ad/g,"").replace(/\u200b/g,"");
    for(const line of t.split("\n")){
      const m=line.match(/^\s*[∗*]?\s*(\d{1,3})\s*[.\-]\s+([A-Za-zÀ-ÿ])/u);
      if(!m)continue;
      const q=+m[1];
      if(q<1||q>433)continue;
      if(!refs[q])refs[q]=[];
      if(!refs[q].includes(p+1))refs[q].push(p+1);
    }
  }
  const anchors={"1":19,"226":68,"228":69,"253":75,"400":107,"433":116};
  const results=Object.fromEntries(Object.entries(anchors).map(([q,page])=>[q,{observed:refs[q]||[],expected:page,match:(refs[q]||[]).includes(page)}]));
  const summary={status:"OCR_PAGE_LOCATOR_CANDIDATES_ONLY",pdfPages:pages.length,potentialQuestionCount:Object.keys(refs).length,missingQuestionNumbers:Array.from({length:433},(_,i)=>i+1).filter(q=>!refs[q]),sampleChecks:results,notCertified:true};
  console.log("SCAN_SUMMARY_JSON="+JSON.stringify(summary));
  console.log("SCAN_433_MAP_JSON="+JSON.stringify(refs));
} catch(error){
  console.log("SCAN_UNAVAILABLE_JSON="+JSON.stringify({status:"NOT_ACCESSIBLE_FROM_GITHUB_RUNNER",message:String(error?.message||error).slice(0,800),notCertified:true}));
}
