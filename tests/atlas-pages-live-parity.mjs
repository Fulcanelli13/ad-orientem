/**
 * Non-mutating GitHub Pages release-parity probe.
 * Compares public HTTPS bytes with the exact checked-out repository files.
 * A PR workflow runs it as a NON-GATING diagnostic; a failed check is never
 * silently presented as evidence that Pages deployed.
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
const ROOT=new URL("../",import.meta.url);
const BASE="https://fulcanelli13.github.io/ad-orientem/";
const paths=[
 "src/find/bible-atlas-history-review.js",
 "src/find/bible-atlas.js",
 "src/find/browser-entry.js"
];
const sha256=x=>createHash("sha256").update(x).digest("hex");
const auditId=process.env.GITHUB_RUN_ID||"local";
const report={
 schema:"AO_ATLAS_PAGES_LIVE_PARITY_V1",
 timestamp:new Date().toISOString(),
 expectedMainEvidence:process.env.GITHUB_SHA||null,
 releaseSite:BASE,
 purpose:"Evidence of publicly served file parity; not Android/hardware acceptance",
 results:[],
 publishedExact:false,
 errors:[]
};
async function request(relative){
 const url=BASE+relative+(relative.includes("?")?"&":"?")+"pagesParityRun="+encodeURIComponent(auditId);
 const response=await fetch(url,{
  redirect:"follow",
  headers:{"Cache-Control":"no-cache","Pragma":"no-cache"},
  signal:AbortSignal.timeout(22000)
 });
 const bytes=Buffer.from(await response.arrayBuffer());
 return {response,bytes};
}
for(const path of paths){
 const expected=readFileSync(new URL(path,ROOT));
 const row={path,expectedSHA256:sha256(expected),expectedBytes:expected.length};
 try{
  const {response,bytes}=await request(path);
  row.httpStatus=response.status;
  row.finalUrl=response.url.split("?")[0];
  row.contentType=response.headers.get("content-type");
  row.cacheAge=response.headers.get("age");
  row.responseSHA256=sha256(bytes);
  row.responseBytes=bytes.length;
  row.match=response.status===200&&bytes.equals(expected);
  row.validation=row.match?"EXACT_PUBLIC_BYTES_MATCH":"PUBLIC_BYTES_OR_HTTP_DIFFER";
  if(!row.match)report.errors.push(path+": "+row.validation+" status="+response.status);
 }catch(e){
  row.match=false;
  row.validation="TRANSPORT_ERROR";
  row.error=String(e?.message||e);
  report.errors.push(path+": "+row.error);
 }
 report.results.push(row);
 console.log("ATLAS_PAGES_PARITY "+JSON.stringify(row));
}
try{
 const {response,bytes}=await request("");
 report.entry={httpStatus:response.status,bytes:bytes.length,
  hasAppMarker:bytes.includes(Buffer.from("AO_RUNTIME"))||bytes.includes(Buffer.from("ao-")),
  finalUrl:response.url.split("?")[0]};
 if(response.status!==200||!report.entry.hasAppMarker)report.errors.push("index.html has no valid public app response");
}catch(e){
 report.entry={status:"TRANSPORT_ERROR",error:String(e.message||e)};
 report.errors.push("index: "+report.entry.error);
}
report.publishedExact=report.results.length===3&&report.results.every(x=>x.match)&&report.entry?.httpStatus===200&&report.entry.hasAppMarker;
mkdirSync(resolve("test-output/atlas-pages-release"),{recursive:true});
writeFileSync(resolve("test-output/atlas-pages-release/report.json"),JSON.stringify(report,null,2)+"\n");
const githubSummary=process.env.GITHUB_STEP_SUMMARY;
if(githubSummary){
 const rows=report.results.map(x=>"| `"+x.path+"` | "+(x.match?"MATCH":"NO MATCH")+
  " | "+(x.httpStatus??"n/a")+" | `"+(x.responseSHA256||"unavailable")+"` |").join("\n");
 const summary="## Biblical Atlas GitHub Pages exact-file audit\n"+
 "**Published parity: "+(report.publishedExact?"VERIFIED":"NOT VERIFIED")+"**\n\n"+
 "Checked against PR checkout `"+(report.expectedMainEvidence||"local")+"` on "+report.timestamp+".\n\n"+
 "| File | Exact public parity | HTTP | Served SHA-256 |\n|---|---|---|---|\n"+rows+
 "\n\nThis is a read-only CDN fetch, **not** the GitHub deployment-run SHA, and **not** real Android hardware testing.\n";
 writeFileSync(githubSummary,summary,{flag:"a"});
}
console.log("ATLAS_PAGES_VERDICT "+JSON.stringify({publishedExact:report.publishedExact,issues:report.errors}));
if(!report.publishedExact)process.exitCode=1;
