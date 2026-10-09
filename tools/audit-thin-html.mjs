import {readFileSync} from "node:fs";
import {gzipSync} from "node:zlib";
const h=readFileSync("index.html","utf8"),B=x=>Buffer.byteLength(x,"utf8");
const tags=[...h.matchAll(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi)].map((m,i)=>{
 const [all,tag,attrs,payload]=m;
 const id=attrs.match(/\bid=["']([^"']+)["']/i)?.[1]??null;
 const type=attrs.match(/\btype=["']([^"']+)["']/i)?.[1]??"";
 const refs=id?h.split(id).length-1:0;
 const classic=tag==="script"&&(!type||/^(text|application)\/(java|ecma)script$/.test(type));
 const css=tag==="style"&&(!type||type==="text/css");
 const blocked=/\b(?:src|async|defer|onload|onerror|integrity)\s*=/i.test(attrs)||(/document\s*\.\s*(?:currentScript|write|writeln)|import\s*\.\s*meta/.test(payload)&&tag==="script");
 return {i,tag,bytes:B(payload),id,refs,type,classic,css,blocked,hash:/<\//.test(payload),leading:payload.slice(0,50).replace(/\s+/g," ")};
});
const classes=tags.reduce((a,x)=>{const k=x.tag;if(!a[k])a[k]={n:0,total:0,eligible:0,eligibleBytes:0,excluded:[]};a[k].n++;a[k].total+=x.bytes;const threshold=k==="script"?8192:3072;const elig=(x.classic||x.css)&&!x.blocked&&x.bytes>=threshold; if(elig){a[k].eligible++;a[k].eligibleBytes+=x.bytes}else if(x.bytes>12000)a[k].excluded.push({bytes:x.bytes,id:x.id,refs:x.refs,blocked:x.blocked});return a},{});
const large=tags.filter(x=>x.bytes>8000).sort((a,b)=>b.bytes-a.bytes);
const gaps=[];let prev=0;const tagrx=/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
for(const m of h.matchAll(tagrx)){gaps.push({bytes:B(h.slice(prev,m.index)),description:h.slice(prev,m.index).replace(/\s+/g," ").slice(0,90)});prev=m.index+m[0].length}
gaps.push({bytes:B(h.slice(prev)),description:"after last"});
console.log("THIN_AUDIT="+JSON.stringify({htmlBytes:B(h),gzipBytes:gzipSync(h).length,classes,large,gaps:gaps.filter(x=>x.bytes>1000).sort((a,b)=>b.bytes-a.bytes).slice(0,20),counts:tags.length}));
