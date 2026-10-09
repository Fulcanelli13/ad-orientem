#!/usr/bin/env node
/**
 * Eliminate the parser-blocking waterfall created by extracting 40 inline
 * classic IIFEs. Preload their source as one ordinary classic script, then
 * invoke each closure at the exact original parser position via tiny inline
 * stubs. Never eval/Function/dynamic script injection, reordering or deferral.
 * The old content-addressed JS files remain as auditable reproduction inputs.
 */
import {readFileSync,writeFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
const HTML="index.html",REPORT="data/presentation/startup-thin-shell.v1.json";
const hash=s=>createHash("sha256").update(s).digest("hex").slice(0,20);
const len=s=>Buffer.byteLength(s,"utf8");
const report=JSON.parse(readFileSync(REPORT,"utf8"));
let html=readFileSync(HTML,"utf8");
const apply=process.argv.includes("--apply"),verify=process.argv.includes("--verify");
if(verify){
 if(!report.pack)throw Error("Parser-ordered pack manifest missing");
 if(len(html)!==report.packedShellBytes)throw Error("Packed HTML byte size drifted");
 const payload=readFileSync(report.pack.file,"utf8");
 if(hash(payload)!==report.pack.sha)throw Error("Packed JavaScript changed");
 if(!html.includes('src="./'+report.pack.file+'"'))throw Error("Packed classic JS was unlinked");
 for(const item of report.pack.entries){
  if(!html.includes("globalThis.AO_INLINE_PACK_V1["+item.position+"].call(globalThis)"))throw Error("Missing preserved parser position "+item.position);
  if(!existsSync(item.source))throw Error("Missing original extracted IIFE "+item.source);
 }
 console.log("PASS packed parser-order scripts, "+report.pack.entries.length+" single-loader functions");
 process.exit(0);
}
if(apply&&report.pack){
 if(len(html)!==report.packedShellBytes)throw Error("Packed shell already applied but changed");
 console.log("Classic JS pack already applied");
 process.exit(0);
}
if(len(html)!==report.shellBytes)throw Error("Expected extracted shell before bundling");
const extracted=report.entries.filter(x=>x.tag==="script");
const matches=[],kept=[];
let count=0;
for(const m of html.matchAll(/<script\b([^>]*)><\/script>/gi)){
 const src=m[1].match(/\bsrc=(["'])(.*?)\1/i)?.[2];
 if(!src)continue;
 const name=src.replace(/^\.\//,"");
 if(!extracted.some(e=>e.path===name))continue;
 const source=readFileSync(name,"utf8");
 // Isolate only independent top-level IIFEs; e.g. (function(){})()
 // and (()=>{})(). Keep other scripts ordinary classic resources.
 if(!/^\s*\(\s*(?:\(|function\b|async\s+function\b)/.test(source)){
  kept.push({path:name,reason:"non-IIFE"});
  continue;
 }
 matches.push({tag:m[0],attrs:m[1],start:m.index,end:m.index+m[0].length,source,path:name});
}
if(matches.length<32)throw Error("Insufficient isolated IIFEs for safe pack: "+matches.length);
const functions=matches.map(m=>"function(){\n"+m.source+"\n}");
const bundle="/* Certified parser-order IIFEs; execution occurs at original script tags. */\n"+
"globalThis.AO_INLINE_PACK_V1=Object.freeze([\n"+functions.join(",\n")+"\n]);\n";
const file="ao-packed-"+hash(bundle)+".js";
let output="",cursor=0,i=0;
for(const m of matches){
 let attrs=m.attrs;
 const original='src="./'+m.path+'"';
 if(!attrs.includes(original))throw Error("Unable to preserve inline script attrs for "+m.path);
 attrs=attrs.replace(original,"");
 const stub="<script"+attrs+">globalThis.AO_INLINE_PACK_V1["+i+"].call(globalThis)</script>";
 if(m.start<cursor)throw Error("Overlapping script token");
 output+=html.slice(cursor,m.start)+(i===0?'<script src="./'+file+'"></script>\n':"")+stub;
 cursor=m.end;
 i++;
}
output+=html.slice(cursor);
const entries=matches.map((m,i)=>({source:m.path,position:i,originalBytes:len(m.source)}));
const newReport={...report,packedShellBytes:len(output),pack:{schema:"ao-classic-iife-pack-v1",file,sha:hash(bundle),sourceCount:entries.length,bytes:len(bundle),unpacked:kept,entries}};
console.log("PACK_RESULT="+JSON.stringify({shellBefore:len(html),shellAfter:len(output),pack:file,packBytes:len(bundle),packed:matches.length,remainingExternal:kept.length}));
if(apply){
 if(len(output)>650_000)throw Error("Packed HTML broke thin shell budget");
 writeFileSync(file,bundle);
 writeFileSync(HTML,output);
 writeFileSync(REPORT,JSON.stringify(newReport,null,2)+"\n");
}
