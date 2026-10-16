/* Public GitHub Pages byte-parity diagnostic. Never substitutes CI for a live
 * deployment check or a user's installed service-worker CacheStorage version.
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const base="https://fulcanelli13.github.io/ad-orientem/";
const paths=[
 "index.html","sw.js","src/app/offline-boot.js",
 "src/learn/mass-formation.js","src/learn/spiritual-life.js",
 "src/learn/sexual-ethics.js","src/learn/latin-course-v2.js",
 "src/learn/latin-course-source-display.js",
 "src/pray/devotional-sequence-adapter.js",
 "src/calendar/calendar-runtime.js",
 "src/calendar/liturgical-clock.js",
 "src/home/today-v2-styles.js",
 "src/app/release-identity.js",
 "src/settings/presentation.js",
 "src/settings/browser-entry.js",
 "src/home/today-v2-sections.js",
 "src/calendar/observed-commemoration-labels.js"
];
const sha=b=>createHash("sha256").update(b).digest("hex");
const run=String(process.env.GITHUB_RUN_ID||"local");
const report={schema:"AO_CANONICAL_PAGES_PARITY_V1",timestamp:new Date().toISOString(),
 testedCommit:process.env.GITHUB_SHA||"local",target:base,files:[],publicExact:false,
 sourceChecks:{missing:[],stale:[],matches:[],transportErrors:[]}};
for(const path of paths){
 const expected=readFileSync(new URL("../"+path,import.meta.url));
 const row={path,expectedSHA256:sha(expected),expectedBytes:expected.length};
 try{
  const url=new URL(path,base);url.searchParams.set("ao_parity_run",run);
  const res=await fetch(url,{headers:{"cache-control":"no-cache","pragma":"no-cache"},
   cache:"no-store",signal:AbortSignal.timeout(25000),redirect:"follow"});
  const body=Buffer.from(await res.arrayBuffer());
  Object.assign(row,{status:res.status,servedSHA256:sha(body),servedBytes:body.length,
   contentType:res.headers.get("content-type"),age:res.headers.get("age"),
   etag:res.headers.get("etag"),exact:res.status===200&&body.equals(expected)});
  if(row.exact)report.sourceChecks.matches.push(path);
  else if(res.status!==200)report.sourceChecks.missing.push(path);
  else report.sourceChecks.stale.push(path);
 }catch(error){
  row.exact=false;row.error=String(error?.message||error);
  report.sourceChecks.transportErrors.push(path);
 }
 report.files.push(row);
 console.log("CANONICAL_PAGES_FILE",JSON.stringify(row));
}
report.publicExact=report.files.length===paths.length&&report.files.every(x=>x.exact);
console.log("CANONICAL_PAGES_VERDICT",JSON.stringify({
 exact:report.publicExact,commit:report.testedCommit,summary:report.sourceChecks
}));
mkdirSync("test-output/canonical-pages-parity",{recursive:true});
writeFileSync("test-output/canonical-pages-parity/report.json",JSON.stringify(report,null,2)+"\n");
if(process.env.GITHUB_STEP_SUMMARY){
 const lines=["## Canonical Ad Orientem — public GitHub Pages parity",
 "**Network-served exact parity:** "+(report.publicExact?"VERIFIED":"NOT VERIFIED"),
 "Checked commit: \`"+report.testedCommit+"\`",
 "| File | Public match | HTTP | Served bytes | Cache age |",
 "|---|---|---:|---:|---|",
 ...report.files.map(x=>"| \`"+x.path+"\` | "+(x.exact?"MATCH":"NO MATCH")+" | "+(x.status||"N/A")+
 " | "+(x.servedBytes||0)+" | "+(x.age||"-")+" |"),
 "",
 "This tests raw public HTTPS, not an installed mobile device's service-worker cache."];
 writeFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join("\n")+"\n",{flag:"a"});
}
// A diagnostic that can report 'not verified' honestly without blocking
// unrelated release gates.
