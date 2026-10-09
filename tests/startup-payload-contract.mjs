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
const sprites=JSON.parse(readFileSync("data/presentation/startup-sprite-report.v1.json","utf8"));
const perIcon=JSON.parse(readFileSync("data/presentation/startup-per-icon-report.v1.json","utf8"));
const thin=JSON.parse(readFileSync("data/presentation/startup-thin-shell.v1.json","utf8"));
assert.equal(thin.sourceHtmlBytes,perIcon.lazyHtmlBytes,"Thin-shell provenance missing");
assert.equal(thin.packedShellBytes??thin.shellBytes,htmlBytes,"Current HTML differs from certified thin-shell manifest");
assert.ok(thin.pack?.sourceCount>=32,"Parser-order IIFE pack missing; prevent 40-request startup waterfall");
assert.ok(htmlBytes<650_000,"HTML must remain below 650 KB until deeper modularization");
assert.ok(thin.extractedEntries>=70,"Loss of parser-ordered JS/CSS extraction");
for(const entry of thin.entries){
  assert.ok(existsSync(entry.path),"Missing boot asset "+entry.path);
  if(!thin.pack.entries.some(item=>item.source===entry.path))assert.ok(html.includes("./"+entry.path),"Detached boot asset "+entry.path);
  assert.equal(statSync(entry.path).size,entry.bytes,"Boot asset content changed: "+entry.path);
}
assert.equal(perIcon.lazyActivationOwner,"src/app/refined-icon-on-demand.js");
assert.ok(html.includes('src="./src/app/refined-icon-on-demand.js"'),"Deferred icon loader missing");
assert.equal(perIcon.originalHtmlBytes,sprites.reducedHtmlBytes,"Original sprite manifest lost its provenance");
assert.equal(perIcon.icons.length,20,"Twenty historical refined icon symbols must remain intact");
const mappedIcons=new Map(perIcon.icons.map(row=>[row.id,row]));
for(const icon of perIcon.icons){
  assert.ok(existsSync(icon.path),"Missing per-icon geometry: "+icon.path);
  const source=readFileSync(icon.path,"utf8");
  assert.ok(source.includes('id="'+icon.id+'"'),"Individual SVG lost "+icon.id);
  assert.ok(html.includes('data-ao-refined-lazy="./'+icon.path+'#'+icon.id+'"'),"Lazy local symbol lost asset path: "+icon.id);
  assert.ok(!html.includes('<use href="./'+icon.path+'#'+icon.id+'"'),"Historical icon is still loaded eagerly: "+icon.id);
}
assert.equal(sprites.originalHtmlBytes,split.postArtHtmlBytes,"SVG extraction did not start from the certified post-art HTML");
assert.ok(htmlBytes<3_000_000,"Cold HTML budget: refined SVG assets must remain external");
assert.ok(sprites.entries.length===3,"Three large refined SVG sprite assets required");
for(const entry of sprites.entries){
  assert.ok(existsSync(entry.path),"Missing refined SVG asset: "+entry.path);
  const svg=readFileSync(entry.path,"utf8");
  assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'),"External sprite lacks SVG namespace");
  for(const id of entry.symbols){
    assert.ok(html.includes('id="'+id+'"'),"Legacy symbol not present in lightweight proxy: "+id);
    assert.ok(mappedIcons.has(id),"Historical sprite symbol disappeared: "+id);
    assert.ok(svg.includes('id="'+id+'"'),"External asset lost referenced symbol: "+id);
  }
}

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
