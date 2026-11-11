// CI browser-accessibility evidence for the exact unpublished 62-card owner proof.
// A 200 response is NOT factual source certification or owner release approval.
// Do not use this report to set published_source.deep_link_verified automatically.
import assert from "node:assert/strict";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {chromium} from "@playwright/test";

const proof=JSON.parse(readFileSync(
 "data/research/did-you-know/release-candidates/ao-dyk-batch-A-62-corrected-bilingual-owner-proof-RESEARCH_ONLY-20261111.v1.json","utf8"));
assert.equal(proof.release_stage,"RESEARCH_ONLY");
assert.equal(proof.records.length,62);
assert.equal(proof.inventory.owner_approved,0);
const refs=new Map();
for(const r of proof.records){
 assert.ok(Object.values(r.release_gate).every(v=>v===false),"No released card allowed");
 const sources=String(r.research_provenance.source_urls_raw||"").split(/\s*\|\s*/).filter(Boolean);
 for(const source of sources){
  assert.equal(new URL(source).protocol,"https:");
  if(!refs.has(source))refs.set(source,[]);
  refs.get(source).push(r.id);
 }
}
assert.equal(refs.size,49);
const urls=[...refs.keys()],rows=[];
const challenge=/just a moment|checking your browser|verifying you are human|access denied|enable javascript and cookies|captcha|unusual traffic|cloudflare ray id|request rejected|robot check/i;
const maxMs=12000;
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
 viewport:{width:390,height:844},
 userAgent:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
 ignoreHTTPSErrors:false,
 acceptDownloads:true
});
let index=0;
async function inspect(url){
 const report={url,ids:refs.get(url),status:"UNKNOWN",http_status:null,
  final_url:null,content_type:null,title:null,body_text_length:0,error:null,
  end_user_deep_link_verified:false,claim_source_certified:false};
 try{
  const type=new URL(url).pathname.toLowerCase();
  if(type.endsWith(".pdf")){
   const r=await context.request.head(url,{timeout:maxMs,maxRedirects:5});
   report.http_status=r.status();
   report.final_url=r.url();
   report.content_type=r.headers()["content-type"]||null;
   report.status=r.ok()?"PDF_HEADERS_REACHABLE_NOT_PAGE_CERTIFIED":"PDF_HEADER_HTTP_"+r.status();
  }else{
   const page=await context.newPage();
   try{
    const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:maxMs});
    report.final_url=page.url();
    report.http_status=response?.status()??null;
    report.content_type=response?.headers()["content-type"]||null;
    report.title=(await page.title().catch(()=>"")).slice(0,180);
    const body=(await page.locator("body").innerText({timeout:3000}).catch(()=>"")).slice(0,4500);
    report.body_text_length=body.length;
    const sample=report.title+"\n"+body;
    if(challenge.test(sample))report.status="BOT_OR_ACCESS_CHALLENGE";
    else if(report.http_status===404||report.http_status===410)report.status="NOT_FOUND";
    else if(report.http_status===401||report.http_status===403)report.status="ACCESS_RESTRICTED";
    else if(report.http_status>=500)report.status="SERVER_ERROR";
    else if(report.http_status>=200&&report.http_status<400&&body.length>100)report.status="BROWSER_TEXT_READABLE";
    else report.status="PAGE_CONTENT_INCONCLUSIVE";
   }finally{await page.close().catch(()=>{});}
  }
 }catch(e){
  report.status="BROWSER_REQUEST_ERROR";
  report.error=String(e?.message||e).slice(0,350);
 }
 return report;
}
async function worker(){
 for(;;){
  const n=index++;
  if(n>=urls.length)return;
  const row=await inspect(urls[n]);
  rows[n]=row;
  console.log((n+1)+"/"+urls.length+" "+row.status+" "+new URL(urls[n]).hostname);
 }
}
try{await Promise.all(Array.from({length:4},worker));}
finally{await context.close();await browser.close();}
const tally={};
for(const row of rows)tally[row.status]=(tally[row.status]||0)+1;
const output={
 format:"ad-orientem.did-you-know.batch-A-browser-link-qa.v1",
 generated_at:new Date().toISOString(),
 research_only:true,
 candidate_count:62,unique_urls:49,
 status_counts:tally,
 explanation:"Headless Chromium inspection of public links from the exact 62-card owner proof. PDF checks use HEAD only. Readable page status is not human source-claim signoff; bot challenges may work for actual readers; all deep-link release approvals remain false.",
 all_deep_links_verified:false,
 owner_release_authorized:false,
 urls:rows
};
mkdirSync("artifacts/dyk",{recursive:true});
writeFileSync("artifacts/dyk/batch-A-62-browser-links.json",JSON.stringify(output,null,2)+"\n");
console.log("DYK Batch A browser link QA: "+JSON.stringify(tally)+"; all release gates remain closed.");
// A definitive 404/410 is a broken source-link regression. Challenges, PDF
// header-only checks and temporary fetch errors are INCONCLUSIVE, not releases.
const broken=rows.filter(row=>row.status==="NOT_FOUND");
if(broken.length){
 console.error("DYK source links with confirmed HTTP 404/410:\\n"+
  broken.map(row=>row.url).join("\\n"));
 process.exitCode=1;
}
