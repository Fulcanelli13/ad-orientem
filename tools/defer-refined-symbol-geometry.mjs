#!/usr/bin/env node
import { readFileSync,writeFileSync,existsSync } from "node:fs";
const PATH="index.html", REPORT="data/presentation/startup-per-icon-report.v1.json";
const manifest=JSON.parse(readFileSync(REPORT,"utf8"));
let html=readFileSync(PATH,"utf8"),moved=0;
if(process.argv.includes("--verify")){
  const html=readFileSync(PATH,"utf8");
  const thinPath="data/presentation/startup-thin-shell.v1.json";
  const thin=existsSync(thinPath)?JSON.parse(readFileSync(thinPath,"utf8")):null;
  if(Buffer.byteLength(html,"utf8")!==(thin?.shellBytes??manifest.lazyHtmlBytes))throw Error("Lazy SVG index byte count drifted");
  for(const icon of manifest.icons){
    if(!html.includes('data-ao-refined-lazy="./'+icon.path+'#'+icon.id+'"'))throw Error("Missing inert icon "+icon.id);
    if(html.includes('<use href="./'+icon.path+'#'+icon.id+'"'))throw Error("Eager SVG icon request returned: "+icon.id);
  }
  if(!html.includes('src="./src/app/refined-icon-on-demand.js"'))throw Error("Lazy loader not installed");
  console.log("PASS inert SVG placeholders and on-demand loader integrity");
  process.exit(0);
}
if(process.argv.includes("--apply")&&manifest.lazyHtmlBytes){
  console.log("Refined SVG geometry already deferred; unchanged");
  process.exit(0);
}
for(const icon of manifest.icons){
  const id=icon.id,ref="./"+icon.path+"#"+id;
  const source='<use href="'+ref+'" width="100%" height="100%"></use>';
  const escaped=id.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");
  const rx=new RegExp('<symbol\\b[^>]*\\bid="'+escaped+'"[^>]*>[\\s\\S]*?<\\/symbol>');
  const match=html.match(rx);
  if(!match)throw Error("Missing SVG symbol proxy "+id);
  if(!match[0].includes(source))throw Error("Unknown SVG source link for "+id);
  if(match[0].split(source).length!==2)throw Error("Duplicate icon reference "+id);
  const changed=match[0].replace("<symbol ", '<symbol data-ao-refined-lazy="'+ref+'" ').replace(source,"");
  html=html.replace(match[0],changed);
  moved++;
}
const anchor='<script type="module" src="./src/mass/browser-entry.js"';
const loader='<script src="./src/app/refined-icon-on-demand.js"></script>\n';
if(!html.includes(anchor))throw Error("Native browser entry anchor missing");
if(html.includes(loader))throw Error("Duplicate icon activation loader");
html=html.replace(anchor,loader+anchor);
if(moved!==20)throw Error("Expected 20 inert SVG placeholders");
const bytes=Buffer.byteLength(html,"utf8");
if(bytes>3_000_000)throw Error("HTML unexpectedly exceeds size budget");
console.log("LAZY_SPRITE_RESULT="+JSON.stringify({symbols:moved,indexBytes:bytes}));
if(process.argv.includes("--apply")){
  writeFileSync(PATH,html);
  const next={...manifest,lazyHtmlBytes:bytes,lazyActivationOwner:"src/app/refined-icon-on-demand.js"};
  writeFileSync(REPORT,JSON.stringify(next,null,2)+"\n");
}
