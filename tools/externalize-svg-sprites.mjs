#!/usr/bin/env node
/**
 * Move historical refined icon geometry out of HTML, preserving original
 * <svg> and <symbol> IDs via tiny local symbol proxies.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

const INDEX="index.html";
if(process.argv.includes("--verify")){
  const saved=JSON.parse(readFileSync("data/presentation/startup-sprite-report.v1.json","utf8"));
  const html=readFileSync("index.html","utf8");
  if(Buffer.byteLength(html,"utf8")!==saved.reducedHtmlBytes)throw new Error("Index differs from sprite manifest");
  for(const entry of saved.entries){
    if(!existsSync(entry.path))throw new Error("SVG sprite missing: "+entry.path);
    const external=readFileSync(entry.path,"utf8");
    for(const sym of entry.symbols){
      if(!external.includes('id="'+sym+'"')&&!external.includes("id='"+sym+"'"))throw new Error("External symbol lost "+sym);
      if(!html.includes("#"+sym))throw new Error("Local proxy lost "+sym);
    }
  }
  console.log("PASS external SVG sprite integrity");
  process.exit(0);
}

const DIRECTORY="assets/generated-sprites";
const MANIFEST="data/presentation/startup-sprite-report.v1.json";
const SPRITES=["ao-v4318-refined-sprite","ao-v4330-semantic-icon-sprite","ao-v4332-full-refined-sprite"];
const bytes=s=>Buffer.byteLength(s,"utf8");
const sha=s=>createHash("sha256").update(s).digest("hex").slice(0,20);
let html=readFileSync(INDEX,"utf8");
const before=bytes(html);
const originalGzip=gzipSync(html).length;
const entries=[];
const apply=process.argv.includes("--apply");
if(apply&&existsSync(MANIFEST)){
  const baseline=JSON.parse(readFileSync(MANIFEST,"utf8"));
  if(before!==baseline.reducedHtmlBytes)throw new Error("Existing SVG sprite manifest does not match index.html; manual reconciliation required");
  for(const item of baseline.entries)if(!existsSync(item.path))throw new Error("Existing SVG asset missing: "+item.path);
  console.log("SVG geometry already extracted; no changes made");
  process.exit(0);
}
if(apply)mkdirSync(DIRECTORY,{recursive:true});

for(const id of SPRITES){
  const rx=new RegExp("<svg\\b([^>]*)\\bid=[\"']"+id+"[\"']([^>]*)>[\\s\\S]*?<\\/svg\\s*>","i");
  const match=html.match(rx);
  if(!match)throw new Error("Required original SVG sprite missing: "+id);
  const original=match[0];
  const rootClose=original.indexOf(">");
  const attrs=original.slice(4,rootClose);
  const symbols=[...original.matchAll(/<symbol\b([^>]*)>/gi)].map(x=>{
    const symbolId=x[1].match(/\bid=["']([^"']+)["']/i)?.[1];
    if(!symbolId)throw new Error("Unnamed symbol in "+id);
    const viewbox=x[1].match(/\bviewbox=["']([^"']+)["']/i)?.[1];
    if(!viewbox)throw new Error("Symbol without viewBox: "+symbolId);
    const preserve=x[1].match(/\bpreserveaspectratio=["']([^"']+)["']/i)?.[1];
    return {id:symbolId,viewBox:viewbox,preserveAspectRatio:preserve??null};
  });
  if(!symbols.length)throw new Error("No symbols in "+id);
  const unique=new Set(symbols.map(x=>x.id));
  if(unique.size!==symbols.length)throw new Error("Duplicate symbols in "+id);
  let document=original;
  if(!/\bxmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/i.test(attrs)){
    document=document.replace(/^<svg\b/i,'<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const filename=id+"-"+sha(original)+".svg";
  const path=DIRECTORY+"/"+filename;
  const proxySymbols=symbols.map(({id:sid,viewBox,preserveAspectRatio})=>{
    const parity=preserveAspectRatio?' preserveAspectRatio="'+preserveAspectRatio+'"':"";
    return '<symbol id="'+sid+'" viewBox="'+viewBox+'"'+parity+'><use href="./'+path+'#'+sid+'" width="100%" height="100%"></use></symbol>';
  }).join("");
  const stub="<svg"+attrs+"><defs>"+proxySymbols+"</defs></svg>";
  html=html.replace(original,stub);
  if(apply)writeFileSync(path,document);
  entries.push({id,filename,path,originalBytes:bytes(original),placeholderBytes:bytes(stub),symbols:symbols.map(x=>x.id)});
}
const after=bytes(html);
const report={schema:"ao-external-svg-sprites-v1",originalHtmlBytes:before,reducedHtmlBytes:after,originalGzipBytes:originalGzip,reducedGzipBytes:gzipSync(html).length,entries};
console.log("SPRITE_EXTRACTION="+JSON.stringify({before,after,saved:before-after,gzipBefore:originalGzip,gzipAfter:report.reducedGzipBytes,assets:entries.map(x=>({id:x.id,bytes:x.originalBytes,stub:x.placeholderBytes,count:x.symbols.length}))}));
if(apply){
  if(after>3_000_000)throw new Error("HTML remains above 3 MB; declining replacement");
  if(entries.reduce((n,x)=>n+x.symbols.length,0)<18)throw new Error("Missing refined symbols");
  writeFileSync(INDEX,html);
  writeFileSync(MANIFEST,JSON.stringify(report,null,2)+"\n");
}
