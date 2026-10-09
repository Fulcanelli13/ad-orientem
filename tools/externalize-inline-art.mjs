#!/usr/bin/env node
/**
 * Externalize large embedded image data URIs from production HTML / generated
 * root-level classic JavaScript. Text and executable logic are preserved.
 * Images are content-addressed and retain identical decoded image bytes.
 * Paths stay relative to the GitHub Pages app root.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

const OUTPUT_DIR="assets/generated-inline";
const REPORT="data/presentation/startup-art-report.v1.json";
const rootFiles=["index.html",...readdirSync(".").filter(x=>/^ao-boot-[a-f0-9]{16}\.(?:js|css)$/.test(x))];
const mimeToExt={png:"png",jpeg:"jpg",webp:"webp",gif:"gif"};
const regex=/data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})/gi;
const sha=data=>createHash("sha256").update(data).digest("hex").slice(0,20);
const files=new Map();
const changes=[];
const apply=process.argv.includes("--apply");
const bytes=x=>Buffer.byteLength(x,"utf8");

if(apply)mkdirSync(OUTPUT_DIR,{recursive:true});
for(const file of rootFiles){
  const original=readFileSync(file,"utf8");
  let imageMatches=0, oldEmbeddedBytes=0, decodedBytes=0;
  const changed=original.replace(regex,(full,rawMime,base64)=>{
    if(full.length<4096)return full; // tiny icons remain inline by design
    const mime=rawMime.toLowerCase();
    const data=Buffer.from(base64,"base64");
    if(data.length<1024)return full;
    if(data.toString("base64").replace(/=+$/,"")!==base64.replace(/=+$/,""))throw new Error("Corrupt image data URI in "+file);
    const extension=mimeToExt[mime];
    const name="art-"+sha(data)+"."+extension;
    const path=OUTPUT_DIR+"/"+name;
    const url="./"+path;
    if(!files.has(path))files.set(path,data);
    imageMatches++;
    oldEmbeddedBytes+=bytes(full);
    decodedBytes+=data.length;
    return url;
  });
  if(changed!==original){
    changes.push({file,oldBytes:bytes(original),newBytes:bytes(changed),replacedImages:imageMatches,embeddedBytes:oldEmbeddedBytes,decodedBytes});
    if(apply)writeFileSync(file,changed);
  }
}
if(apply){
  for(const [path,data] of files)writeFileSync(path,data);
}
const totalOld=changes.reduce((a,b)=>a+b.oldBytes,0);
const totalNew=changes.reduce((a,b)=>a+b.newBytes,0);
const report={
  schema:"ao-startup-art-externalization-v1",
  changedFiles:changes,
  replacedImages:changes.reduce((a,b)=>a+b.replacedImages,0),
  uniqueImages:files.size,
  originalTextBytes:totalOld,
  reducedTextBytes:totalNew,
  savedFromTextBytes:totalOld-totalNew,
  imageBinaryBytes:[...files.values()].reduce((a,b)=>a+b.length,0),
  reducedTextGzipBytes:changes.reduce((a,b)=>a+gzipSync(readFileSync(b.file)).length,0),
};
console.log(JSON.stringify(report,null,2));
if(apply){
  if(files.size===0)throw new Error("No embedded image payload found: leaving existing sources unchanged");
  writeFileSync(REPORT,JSON.stringify(report,null,2)+"\n");
  // Keep the earlier HTML-chunk provenance valid after relocating artwork.
  const splitPath="data/presentation/startup-split-report.v1.json";
  const split=JSON.parse(readFileSync(splitPath,"utf8"));
  for(const entry of split.entries){
    entry.packagedBytes=bytes(readFileSync(entry.filename));
  }
  split.postArtHtmlBytes=bytes(readFileSync("index.html"));
  writeFileSync(splitPath,JSON.stringify(split,null,2)+"\n");
}
