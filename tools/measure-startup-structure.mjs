import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
const source=readFileSync("index.html","utf8");
const len=x=>Buffer.byteLength(x,"utf8");
const tokens=[];
const rx=/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
for(const m of source.matchAll(rx)){
 const [full,tag,attrs,payload]=m;
 const id=attrs.match(/\bid=["']([^"']+)["']/i)?.[1]||null;
 const type=attrs.match(/\btype=["']([^"']+)["']/i)?.[1]||null;
 const src=attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1]||null;
 tokens.push({tag,bytes:len(payload),id,refs:id?source.split(id).length-1:null,type,src,preview:payload.slice(0,140).replace(/\s+/g," "),blocked:/\bdocument\s*\.\s*(?:currentScript|write|writeln)\b/.test(payload)});
}
const scriptSize=tokens.filter(t=>t.tag==="script").reduce((n,x)=>n+x.bytes,0);
const styleSize=tokens.filter(t=>t.tag==="style").reduce((n,x)=>n+x.bytes,0);
const stat={htmlBytes:len(source),gzipBytes:gzipSync(source).length,
scripts:tokens.filter(t=>t.tag==="script").length,styles:tokens.filter(t=>t.tag==="style").length,
inlineScriptBytes:scriptSize,inlineStyleBytes:styleSize,
nonScriptStyleBytes:len(source)-scriptSize-styleSize,
top:tokens.filter(x=>x.bytes>25000).sort((a,b)=>b.bytes-a.bytes).slice(0,40),
first:source.slice(0,1500),last:source.slice(-2500)};
console.log("STARTUP_ANALYSIS="+JSON.stringify(stat));
