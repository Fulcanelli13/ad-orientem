#!/usr/bin/env node
/**
 * Extract sizeable safe classic inline scripts and static CSS without
 * changing parser execution order. Each asset is at the same relative URL
 * depth as index.html to preserve CSS url() and classic script paths.
 * No async, defer, type=module, JSON data script or dependency reordering.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
const INPUT="index.html",REPORT="data/presentation/startup-thin-shell.v1.json";
const SOURCE="data/presentation/startup-per-icon-report.v1.json";
const DIR="assets/generated-boot";
const html=readFileSync(INPUT,"utf8"),B=x=>Buffer.byteLength(x,"utf8");
const hash=x=>createHash("sha256").update(x).digest("hex").slice(0,20);
const baseline=JSON.parse(readFileSync(SOURCE,"utf8"));
const expected=baseline.lazyHtmlBytes;
const apply=process.argv.includes("--apply"),verify=process.argv.includes("--verify");
const sizeBefore=B(html);
if(verify){
 const audit=JSON.parse(readFileSync(REPORT,"utf8"));
 if(sizeBefore!==audit.shellBytes)throw Error("Thin shell byte-size regression");
 for(const e of audit.entries){
  if(!existsSync(e.path))throw Error("Missing critical script/style "+e.path);
  const source=readFileSync(e.path,"utf8");
  if(B(source)!==e.bytes||hash(source)!==e.sha)throw Error("Boot asset mutated: "+e.path);
  if(!html.includes("./"+e.path))throw Error("Boot asset unlinked: "+e.path);
 }
 console.log("PASS thin HTML content-addressed assets: "+sizeBefore+" HTML bytes, "+audit.entries.length+" extracted parser-order dependencies");
 process.exit(0);
}
if(apply&&existsSync(REPORT)){
 const prior=JSON.parse(readFileSync(REPORT,"utf8"));
 if(sizeBefore!==prior.shellBytes)throw Error("Existing thin-shell report disagrees with HTML");
 console.log("HTML extraction already applied; idempotent no-op");
 process.exit(0);
}
if(sizeBefore!==expected)throw Error("HTML has changed since certified per-icon extraction: "+sizeBefore+" != "+expected);
let out="",cursor=0,n=0,extracted=0;
const entries=[];
const blocked=[];
const regex=/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
for(const m of html.matchAll(regex)){
 const [full,tag,attrs,source]=m;
 const type=(attrs.match(/\btype\s*=\s*(['"])(.*?)\1/i)?.[2]||"").trim().toLowerCase();
 const kind=tag.toLowerCase();
 const isJs=kind==="script"&&(!type||/^(text|application)\/(java|ecma)script$/.test(type));
 const isCss=kind==="style"&&(!type||type==="text/css");
 const runnable= isJs||isCss;
 const badAttributes=/\b(?:src|async|defer|onload|onerror|integrity|nonce)\s*=/i.test(attrs);
 const unsafeJs=isJs&&/\bdocument\s*\.\s*(?:currentScript|write|writeln)\b|\bimport\s*\.\s*meta\b/.test(source);
 const dataBytes=B(source);
 const min=kind==="script"?8192:3072;
 const eligible=runnable&&!badAttributes&&!unsafeJs&&dataBytes>=min;
 if(!eligible){
  if(dataBytes>=min)blocked.push({kind,bytes:dataBytes,type,reason:!runnable?"not executable/static":badAttributes?"attributes":"runtime-relative"});
  continue;
 }
 const ext=isJs?"js":"css";
 const path=DIR+"/ao-inline-"+hash(kind+"\0"+source)+"."+ext;
 const replacement=isJs
 ? "<script"+attrs+' src="./'+path+'"></script>'
 : '<link rel="stylesheet"'+attrs+' href="./'+path+'">';
 out+=html.slice(cursor,m.index)+replacement;cursor=m.index+full.length;
 entries.push({path,tag:kind,bytes:dataBytes,sha:hash(source),index:n++});
 if(apply){mkdirSync(DIR,{recursive:true});writeFileSync(path,source)}
 extracted+=dataBytes;
}
out+=html.slice(cursor);
const finalSize=B(out),external=entries.reduce((a,e)=>a+e.bytes,0);
const report={schema:"ao-thin-shell-v1",sourceHtmlBytes:expected,shellBytes:finalSize,htmlGzipBytes:gzipSync(out).length,
scriptStyleExtractedBytes:extracted,extractedEntries:entries.length,codeBytes:external,
criticalTransferBytes:finalSize+external,blocked,entries};
console.log("THIN_RESULT="+JSON.stringify({source:expected,after:finalSize,saved:expected-finalSize,gzipBefore:gzipSync(html).length,gzipAfter:report.htmlGzipBytes,extractedEntries:entries.length,externalBytes:external,blockers:blocked}));
if(apply){
 if(finalSize>650_000)throw Error("HTML thinning did not achieve 650 KB budget: "+finalSize);
 writeFileSync(INPUT,out);
 writeFileSync(REPORT,JSON.stringify(report,null,2)+"\n");
}
