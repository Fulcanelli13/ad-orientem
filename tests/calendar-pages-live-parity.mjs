/**
 * Read-only canonical Pages version check for the already-merged Calendar Clock.
 * The origin is fixed: NEVER claim preview (Vercel) matches the mobile PWA.
 * A current-main source match is separate from handset/active snapshot parity.
 */
import { readFileSync,writeFileSync,mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const BASE="https://fulcanelli13.github.io/ad-orientem/";
const paths=["src/calendar/liturgical-clock.js","src/calendar/calendar-runtime.js"];
const sha256=buffer=>createHash("sha256").update(buffer).digest("hex");
const id=process.env.GITHUB_RUN_ID||"manual";
const report={schema:"AO_CANONICAL_CALENDAR_PAGES_RELEASE_V1",
  checkedAt:new Date().toISOString(),sourceRef:process.env.GITHUB_SHA||null,site:BASE,
  files:[],entry:null,exact:false,errors:[],physicalPhoneVerified:false};
async function request(path){
 const url=BASE+path+(path.includes("?")?"&":"?")+"aoReleaseProbe="+encodeURIComponent(id);
 const response=await fetch(url,{redirect:"follow",headers:{"Cache-Control":"no-cache","Pragma":"no-cache"},signal:AbortSignal.timeout(24000)});
 return {response,body:Buffer.from(await response.arrayBuffer())};
}
for(const path of paths){
 const expected=readFileSync(new URL("../"+path,import.meta.url));
 const row={path,expectedSha256:sha256(expected),expectedLength:expected.length};
 try{
  const {response,body}=await request(path);
  row.status=response.status;
  row.servedSha256=sha256(body);
  row.servedLength=body.length;
  row.match=response.status===200&&body.equals(expected);
  if(!row.match)report.errors.push(path+" public bytes differ from checked-out source");
 }catch(error){
  row.match=false;row.error=String(error?.message||error);
  report.errors.push(path+": "+row.error);
 }
 report.files.push(row);
 console.log("CANONICAL_CALENDAR_PAGE_FILE "+JSON.stringify(row));
}
try{
 const {response,body}=await request("");
 report.entry={status:response.status,bytes:body.length,recognisedApp:body.includes(Buffer.from("AO_RUNTIME"))||body.includes(Buffer.from("ao-"))};
 if(response.status!==200||!report.entry.recognisedApp)report.errors.push("canonical app entry missing or invalid");
}catch(error){report.entry={error:String(error?.message||error)};report.errors.push("entry: "+report.entry.error);}
report.exact=report.files.length===paths.length&&report.files.every(x=>x.match)&&report.entry?.status===200&&report.entry.recognisedApp;
mkdirSync(resolve("test-output/calendar-pages-release"),{recursive:true});
writeFileSync(resolve("test-output/calendar-pages-release/report.json"),JSON.stringify(report,null,2)+"\n");
if(process.env.GITHUB_STEP_SUMMARY){
 const s="## Canonical GitHub Pages — Calendar Clock exact bytes\n\n"+
   "**Public parity: "+(report.exact?"VERIFIED":"NOT VERIFIED")+"**\n\n"+
   "Checked against "+(report.sourceRef||"local")+"; this is not a physical PWA check.\n\n"+
   report.files.map(x=>"- "+x.path+": "+(x.match?"MATCH":"MISMATCH / UNAVAILABLE")+" (HTTP "+(x.status??"n/a")+")").join("\n")+
   "\n\n"+report.errors.join("\n");
 writeFileSync(process.env.GITHUB_STEP_SUMMARY,s,{flag:"a"});
}
console.log("CANONICAL_CALENDAR_PAGES_VERDICT "+JSON.stringify({exact:report.exact,issues:report.errors}));
if(!report.exact)process.exitCode=1;
