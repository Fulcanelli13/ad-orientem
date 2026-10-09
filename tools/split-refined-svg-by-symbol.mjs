#!/usr/bin/env node
// Avoid transferring an entire 1.5–4.4 MB SVG sprite when only one symbol
// appears on Home. Keep the original SVGs for independent visual parity tests
// and preserve the historical local <symbol id> proxies in index.html.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const SOURCE="data/presentation/startup-sprite-report.v1.json";
const OUTPUT="data/presentation/startup-per-icon-report.v1.json";
const DIR="assets/generated-symbols";
const bytes=x=>Buffer.byteLength(x,"utf8");
const digest=x=>createHash("sha256").update(x).digest("hex").slice(0,20);
const apply=process.argv.includes("--apply");
const verify=process.argv.includes("--verify");
const baseline=JSON.parse(readFileSync(SOURCE,"utf8"));
if(verify){
  const existing=JSON.parse(readFileSync(OUTPUT,"utf8"));
  const html=readFileSync("index.html","utf8");
  if(bytes(html)!==(existing.lazyHtmlBytes??existing.reducedHtmlBytes))throw Error("Index disagrees with per-icon manifest");
  if(existing.icons.length!==20)throw Error("Historical 20 refined icons not preserved");
  for(const icon of existing.icons){
    if(!existsSync(icon.path))throw Error("Missing per-icon SVG "+icon.path);
    const source=readFileSync(icon.path,"utf8");
    if(!source.includes('id="'+icon.id+'"'))throw Error("Icon symbol missing "+icon.id);
    if(!html.includes("./"+icon.path+"#"+icon.id))throw Error("Index proxy lost "+icon.id);
  }
  console.log("PASS per-icon manifests and stable local symbol IDs");
  process.exit(0);
}
if(apply&&existsSync(OUTPUT)){
  console.log("Per-icon sprite extraction already applied; source unchanged");
  process.exit(0);
}
let html=readFileSync("index.html","utf8");
if(bytes(html)!==baseline.reducedHtmlBytes)throw Error("Source HTML deviated from previously certified SVG extraction");
if(apply)mkdirSync(DIR,{recursive:true});
const icons=[];
for(const entry of baseline.entries){
  const source=readFileSync(entry.path,"utf8");
  const symbols=[...source.matchAll(/<symbol\b[^>]*\bid=["']([^"']+)["'][^>]*>[\s\S]*?<\/symbol\s*>/gi)];
  if(symbols.length!==entry.symbols.length)throw Error("Unexpected symbol boundaries in "+entry.path);
  const seen=[];
  for(const match of symbols){
    const id=match[1],original=match[0];
    if(!entry.symbols.includes(id))throw Error("Undeclared historical icon "+id);
    seen.push(id);
    // Icon symbols carry their own <defs> (gradients, clipping and masks).
    // Fail closed rather than emit a partially-rendered icon if an external
    // dependency cannot be resolved within its own symbol.
    const ids=new Set([...original.matchAll(/\bid=["']([^"']+)["']/gi)].map(z=>z[1]));
    for(const use of original.matchAll(/(?:url\(\s*#([^)\s]+)\s*\)|(?:href|xlink:href)=["']#([^"']+)["'])/gi)){
      const dep=use[1]??use[2];
      if(!ids.has(dep))throw Error("Icon "+id+" requires a root/shared definition "+dep);
    }
    const standalone='<svg xmlns="http://www.w3.org/2000/svg"><defs>'+original+'</defs></svg>';
    const fileName="ao-icon-"+id.replace(/[^a-z0-9-]/gi,"-")+"-"+digest(standalone)+".svg";
    const path=DIR+"/"+fileName;
    const oldRef="./"+entry.path+"#"+id;
    const newRef="./"+path+"#"+id;
    if(!html.includes(oldRef))throw Error("Missing original local icon proxy "+oldRef);
    if(html.split(oldRef).length!==2)throw Error("Ambiguous original icon reference "+id);
    html=html.replace(oldRef,newRef);
    if(apply)writeFileSync(path,standalone);
    icons.push({id,path,bytes:bytes(standalone),sourceBundle:entry.path});
  }
  if(seen.sort().join(",")!==entry.symbols.slice().sort().join(","))throw Error("Symbol parity error: "+entry.path);
}
if(icons.length!==20)throw Error("Expected exactly 20 separate icons");
const result={schema:"ao-refined-icons-per-symbol-v1",originalHtmlBytes:baseline.reducedHtmlBytes,reducedHtmlBytes:bytes(html),originalBundleBytes:baseline.entries.reduce((n,e)=>n+e.originalBytes,0),individualSymbolBytes:icons.reduce((n,e)=>n+e.bytes,0),icons};
console.log("PER_ICON_RESULT="+JSON.stringify({before:result.originalHtmlBytes,after:result.reducedHtmlBytes,icons:icons.length,symbolBytes:result.individualSymbolBytes,originalBundleBytes:result.originalBundleBytes}));
if(apply){
  writeFileSync("index.html",html);
  writeFileSync(OUTPUT,JSON.stringify(result,null,2)+"\n");
}
