import { readFileSync } from "node:fs";
const html=readFileSync("index.html","utf8");
const size=s=>Buffer.byteLength(s,"utf8");
const tags=[...html.matchAll(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi)];
console.log("TAG COUNT",tags.length);
for(const [,tag,attrs,source] of tags){
  const bytes=size(source);
  if(bytes<100000)continue;
  const id=attrs.match(/\bid\s*=\s*(['"])(.*?)\1/i)?.[2]??null;
  console.log(JSON.stringify({
    kind:tag,bytes,attrs:attrs.slice(0,500),id,
    referenceMentions:id ? html.split(id).length-1 : null,
    head:source.slice(0,180).replace(/\s+/g," "),
    currentScript:/\bdocument\s*\.\s*currentScript\b/.test(source),
  }));
}
