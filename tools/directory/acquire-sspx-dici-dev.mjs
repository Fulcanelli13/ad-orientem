// Read-only source-discovery cross-check from an SSPX-hosted DICI DEVELOPMENT site.
// This dataset is NOT a release-eligible official Mass-venue export: it may
// include test operations, houses, schools, stale addresses and no Mass times.
import fs from "node:fs/promises";
import path from "node:path";
import {pathToFileURL} from "node:url";

export const DICI_DEV_ORIGIN="https://fe.dev.aws.fsspx.org";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function requireValid(x,message){if(!x)throw new Error("DICI discovery: "+message);}
export function parseDiciIndexPage({text,links,pageNumber,pageUrl}){
  const stats=String(text??"").match(/\b(\d+)\s+of\s+(\d+)\s+operations\b/i);
  const pagination=String(text??"").match(/\bPage\s+(\d+)\s+of\s+(\d+)\b/i);
  requireValid(stats&&pagination,"missing count / pagination at "+pageUrl);
  const statedPage=Number(pagination[1]), pages=Number(pagination[2]);
  const publishedTotal=Number(stats[2]);
  requireValid(statedPage===pageNumber,"wrong page at "+pageUrl);
  requireValid(Number.isSafeInteger(publishedTotal)&&publishedTotal>0,"invalid operation count");
  requireValid(Number.isSafeInteger(pages)&&pages===Math.ceil(publishedTotal/25),
    "total/pages inconsistency");
  const seen=new Map();
  for(const link of links??[]){
    let url;
    try{url=new URL(link.href,DICI_DEV_ORIGIN);}catch{continue;}
    if(url.origin!==DICI_DEV_ORIGIN)continue;
    const m=url.pathname.match(/^\/operations\/([^/]+)\/?$/);
    if(!m||!UUID.test(m[1]))continue;
    const source_id=m[1].toLowerCase();
    if(!seen.has(source_id)){
      seen.set(source_id,{
        upstream_dici_id:source_id,source_url:DICI_DEV_ORIGIN+"/operations/"+source_id,
        name:String(link.name??"").trim(),context:String(link.context??"").trim().slice(0,500),
        discovery_source:"DICI_DEVELOPMENT_SITE",provenance_tier:"RESEARCH_ONLY_NOT_PUBLISHABLE",
        discovered_from:pageUrl,page:pageNumber,
      });
    }
  }
  const records=[...seen.values()];
  const expectedOnPage=Math.min(25,Math.max(0,publishedTotal-(pageNumber-1)*25));
  requireValid(records.length===expectedOnPage,
    "page "+pageNumber+" incomplete: "+records.length+"/"+expectedOnPage+" operation links");
  requireValid(records.every(r=>r.name.length>0),"blank operation name on page "+pageNumber);
  return {page:pageNumber,pages,total:publishedTotal,records};
}
export async function acquireDiciDevelopmentIndex({out="data/directory/research/sspx-dici-dev",fetchPage}={}){
  requireValid(typeof fetchPage==="function","fetchPage required");
  const all=[],pageReports=[],ids=new Set();
  let expectedTotal=null,expectedPages=null;
  for(let n=1;n<= (expectedPages??1);n++){
    const pageUrl=DICI_DEV_ORIGIN+"/directory?page="+n;
    const document=await fetchPage(pageUrl,n);
    const parsed=parseDiciIndexPage({
      text:document.text,links:document.links,pageUrl,pageNumber:n,
    });
    if(expectedTotal===null){expectedTotal=parsed.total;expectedPages=parsed.pages;}
    requireValid(expectedTotal===parsed.total&&expectedPages===parsed.pages,
      "count changed during pagination at page "+n);
    for(const record of parsed.records){
      requireValid(!ids.has(record.upstream_dici_id),
        "duplicate operation across pages: "+record.upstream_dici_id);
      ids.add(record.upstream_dici_id);
      all.push(record);
    }
    pageReports.push({page:n,records:parsed.records.length});
  }
  requireValid(all.length===expectedTotal,
    "incomplete DICI development source corpus: "+all.length+"/"+expectedTotal);
  const retrievedAt=new Date().toISOString();
  const result={
    schema:"AO_DIRECTORY_SSPX_DICI_DEV_DISCOVERY_REPORT_V1",
    retrieved_at:retrievedAt,source_origin:DICI_DEV_ORIGIN,
    source_environment:"DEVELOPMENT_NOT_PRODUCTION",
    source_records:all.length,reported_total:expectedTotal,
    expected_pages:expectedPages,retrieved_pages:pageReports.length,
    completeness_checked:true,release_eligible:false,
    confirmed_current_public_mass_venues:0,
    notes:"The development site is not an authoritative production source and may include test operation records; never auto-import this report into Find.",
    page_reports:pageReports,
  };
  const dir=path.resolve(out);
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,"dici-dev-discovery.v1.json"),JSON.stringify({
    schema:"AO_DIRECTORY_SSPX_DICI_DEV_DISCOVERY_V1",
    retrieved_at:retrievedAt,source_environment:"DEVELOPMENT_NOT_PRODUCTION",
    release_eligible:false,records:all,
  },null,2)+"\n");
  await fs.writeFile(path.join(dir,"dici-dev-discovery-report.v1.json"),
    JSON.stringify(result,null,2)+"\n");
  return result;
}
export async function fetchDiciPageBrowser(url,{page}){
  const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  requireValid(response?.ok(),"HTTP "+(response?.status()??"unavailable")+" at "+url);
  return page.evaluate(()=>({
    text:document.body?.innerText??"",
    links:[...document.querySelectorAll('a[href*="/operations/"]')].map(a=>({
      href:a.href,name:a.textContent??"",
      context:a.closest("li,article")?.textContent?.trim()??a.parentElement?.textContent?.trim()??"",
    })),
  }));
}
export async function runDiciDiscovery(options={}){
  const {chromium}=await import("@playwright/test");
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({locale:"en-US"});
    await page.route("**/*",route=>["image","font","media"].includes(route.request().resourceType())
      ?route.abort():route.continue());
    return await acquireDiciDevelopmentIndex({
      out:options.out,
      fetchPage:(url)=>fetchDiciPageBrowser(url,{page}),
    });
  }finally{await browser.close();}
}
const direct=process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(direct){
  const out=process.argv.slice(2).find(a=>a.startsWith("--out="))?.slice(6);
  runDiciDiscovery({out})
    .then(report=>console.log(JSON.stringify(report,null,2)))
    .catch(error=>{console.error(error);process.exitCode=1});
}
