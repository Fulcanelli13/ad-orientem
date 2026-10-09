import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";

const html=readFileSync("index.html","utf8");
const htmlBytes=Buffer.byteLength(html);
const chunks=readdirSync(".").filter(name=>/^ao-boot-[a-f0-9]{16}\.(?:js|css)$/.test(name));
const chunkBytes=chunks.reduce((sum,path)=>sum+statSync(path).size,0);
const report=JSON.parse(readFileSync("data/presentation/startup-art-report.v1.json","utf8"));
const split=JSON.parse(readFileSync("data/presentation/startup-split-report.v1.json","utf8"));

assert.ok(htmlBytes<=12_000_000,"Startup index.html exceeds 12 MB; loading regression");
assert.ok(htmlBytes+chunkBytes<=13_500_000,"Critical text payload exceeds 13.5 MB");
assert.ok(report.replacedImages>=90,"Historic base64 image payload was reintroduced");
assert.ok(report.uniqueImages>=80,"Externalized image registry unexpectedly shrank");
assert.ok(report.savedFromTextBytes>=25_000_000,"Text weight recovered less than expected");
assert.equal(split.postArtHtmlBytes,htmlBytes,"Current HTML has changed without updating startup measurement");

const encoded=/data:image\/(?:webp|jpeg|png|gif);base64,[A-Za-z0-9+/]{4096,}/i;
for(const path of ["index.html",...chunks]){
  const text=readFileSync(path,"utf8");
  assert.doesNotMatch(text,encoded,"Large inline raster image returned to "+path);
}
for(const chunk of chunks){
  assert.ok(html.includes("./"+chunk),"Generated critical chunk is not linked from HTML: "+chunk);
}
const images=readdirSync("assets/generated-inline").filter(name=>/^art-[a-f0-9]{20}\.(?:webp|jpg|png|gif)$/.test(name));
assert.equal(images.length,report.uniqueImages,"Content-addressed image count changed");
for(const name of images){
  assert.ok(statSync("assets/generated-inline/"+name).size>1000,"Empty image asset "+name);
}
for(const entry of split.entries){
  assert.ok(existsSync(entry.filename),"Missing executable chunk "+entry.filename);
}
assert.equal((html.match(/<script\b[^>]*\bsrc=["']\.\/src\/mass\/browser-entry\.js["'][^>]*><\/script>/gi)??[]).length,1,"Native Mass entry lost single owner");
console.log("PASS startup weight contract: "+htmlBytes+" HTML bytes, "+chunkBytes+" external code bytes, "+images.length+" content-addressed images.");
