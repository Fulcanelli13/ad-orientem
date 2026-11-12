import fs from "node:fs/promises";
import {chromium} from "@playwright/test";

const URL="https://www.fssp.org/en/find-us/where-are-we/";
const report={schema:"AO_FSSP_SOURCE_DIAGNOSTIC_V1",date:"2026-11-12",
  source:URL,status:"RESEARCH_ONLY_NO_IMPORT",visits:[],request_stats:[],page_errors:[],
  source_metadata:{},coverage_verified:false,publishable_rows:0};
const safe=u=>{
  try{const x=new URL(u);if(!/^(www\.)?fssp\.org$/.test(x.hostname))return null;
    return {host:x.hostname,path:x.pathname,action:x.searchParams.get("action")||null,
      rest_route:x.searchParams.get("rest_route")||null};
  }catch{return null}
};
const head=await fetch(URL,{headers:{"Accept":"text/html"},signal:AbortSignal.timeout(45000)});
const sourceHtml=await head.text();
report.source_metadata={status:head.status,final_url:safe(head.url),
  content_type:head.headers.get("content-type"),length:sourceHtml.length,
  plugin_signals:[...new Set((sourceHtml.match(/wpgmza|wp-google-maps|wp-google-maps-pro|wp-json|admin-ajax|marker-list/g)||[]))].slice(0,12),
  has_known_australia_witness:sourceHtml.includes("Maternal Heart of Mary Parish"),
  has_directory_header:sourceHtml.includes("ZIP / Address"),
  tr_elements:(sourceHtml.match(/<tr\b/gi)||[]).length};
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:850},locale:"en-US"});
page.on("pageerror",e=>{if(report.page_errors.length<20)report.page_errors.push(String(e.message).slice(0,280));});
page.on("response",r=>{
 const path=safe(r.url());if(!path||report.request_stats.length>=250)return;
 const type=r.headers()["content-type"]||"";
 const reqtype=r.request().resourceType();
 report.request_stats.push({path,...{status:r.status(),type:type.slice(0,65),request_type:reqtype}});
});
page.on("requestfailed",r=>{
 const path=safe(r.url());if(path&&report.request_stats.length<250)report.request_stats.push({path,request_error:r.failure()?.errorText?.slice(0,90)});
});
const snapshots=async phase=>{
 const value=await page.evaluate(()=>{
   const outer=document.documentElement.outerHTML||"";
   const keys=Object.keys(window).filter(x=>/wpgmz|wpgmza|google.*map|map.*google/i.test(x)).slice(0,30);
   const selectors=["table","table tr","tbody tr",".wpgmza_marker_list",".wpgmza_marker_list tr",".wpgmza_marker_holder",
    ".wpgmza_map",".wpgmza_map_wrapper",".wpgmza_marker_listing",".wpgmza-marker-listing", "[data-wpgmza-id]"];
   const counts=Object.fromEntries(selectors.map(k=>[k,document.querySelectorAll(k).length]));
   const tables=[...document.querySelectorAll("table")].slice(0,6)
     .map(t=>({id:t.id,class:t.className,row_count:t.querySelectorAll("tr").length,
       sample:(t.textContent||"").trim().slice(0,240)}));
   const scripts=[...document.querySelectorAll("script[src]")].map(x=>{
     try{return new URL(x.src).pathname}catch{return ""}
   }).filter(x=>/wpgmz|google|map|locator|jquery|wp-includes/.test(x)).slice(0,45);
   return {ready_state:document.readyState,title:document.title,document_length:outer.length,
     source_witness:outer.includes("Maternal Heart of Mary Parish"),
     world_map_plugin:outer.includes("wpgmza")||outer.includes("wp-google-maps"),
     visible_table_rows:document.querySelectorAll("table tbody tr").length,
     counts,tables,scripts,window_api_keys:keys,body_text_length:document.body?.innerText.length||0};
 });
 report.visits.push({phase,...value});
};
try{
 const navigation=await page.goto(URL,{waitUntil:"domcontentloaded",timeout:65000});
 report.navigation={status:navigation?.status()??null,redirected:safe(page.url())};
 await snapshots("DOMContentLoaded");
 await page.waitForTimeout(6000);await snapshots("after-6s");
 await page.waitForTimeout(8000);await snapshots("after-14s");
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(5500);
 await snapshots("after-scroll-20s");
 await page.waitForTimeout(13000);await snapshots("after-33s");
}finally{await browser.close();}
report.verified_rows=Math.max(0,...report.visits.map(x=>x.visible_table_rows));
report.coverage_verified=report.verified_rows>=100;
report.publishable_rows=0; // Diagnostic is never an approved import.
await fs.mkdir("data/directory/research",{recursive:true});
await fs.writeFile("data/directory/research/fssp-dynamic-loader-diagnostic-20261112.v1.json",
  JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({source_http:report.source_metadata.status,server_table_rows:report.source_metadata.tr_elements,
  source_html_bytes:report.source_metadata.length,source_witness:report.source_metadata.has_known_australia_witness,
  browser_rows:report.visits.map(x=>({phase:x.phase,rows:x.visible_table_rows,plugins:x.world_map_plugin,body:x.body_text_length})),
  responses:report.request_stats.filter(x=>/json|ajax|wpgmz|map/.test(x.path?.path||"")).slice(0,25),
  page_errors:report.page_errors.slice(0,8),coverage_verified:report.coverage_verified,
  IMPORTANT:"Zero rows have been imported or published"},null,2));
