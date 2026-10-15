#!/usr/bin/env node
// Deterministic local-only passage compiler. It NEVER downloads a source
// or grants republication rights. Approval must come from the owning editor.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {resolve,dirname,sep} from "node:path";
import {webcrypto} from "node:crypto";
import {parsePinnedSourceText} from "../../src/reference/text-parser.js";
import {parsePinnedSourceHtml} from "../../src/reference/html-parser.js";
import {compileSourcePassagePacks} from "../../src/reference/passage-packs.js";

const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const safePath=(s,prefix)=>{
 if(typeof s!=="string"||s.startsWith("/")||s.includes("\\")||s.includes("\0"))
  throw new Error("SOURCE_PACK_PATH_UNSAFE");
 const full=resolve(root,s);
 if(!full.startsWith(resolve(root,prefix)+sep))throw new Error("SOURCE_PACK_PATH_OUTSIDE_"+prefix);
 return full;
};
export async function buildSourcePacksFromConfig(configPath,{check=true}={}){
 const config=JSON.parse(await readFile(safePath(configPath,"data/reference"),"utf8"));
 if(config?.schema!=="ao.source-pack-build-config.v1"||
    config?.rights!=="CLEARED"||!config?.approval?.recordId||
    !config?.approval?.edition||!config?.approval?.republicationEvidence||
    !["AUTHOR_ORIGINAL_DEMO_ONLY","ORIGINAL_AUTHOR_TEXT_DEMO_ONLY","REPUBLICATION_LICENSED"].includes(config.approval.scope))
  throw new Error("SOURCE_PACK_EDITORIAL_RIGHTS_APPROVAL_REQUIRED");
 if(config.approval.scope==="REPUBLICATION_LICENSED"&&
    (!config.approval.licenceId||!config.approval.reviewer||!config.approval.reviewDate))
  throw new Error("SOURCE_PACK_INCOMPLETE_LICENCE_APPROVAL");
 const source=await readFile(safePath(config.sourceFile,"tests/fixtures"),"utf8");
 const input={text:source,workId:config.workId,witnessId:config.witnessId,
  revision:config.revision,language:config.language,rights:config.rights};
 const document=config.format==="clean-html"?parsePinnedSourceHtml(input):
   parsePinnedSourceText({...input,format:config.format});
 const {manifest,chunks}=await compileSourcePassagePacks(document,{cryptoProvider:webcrypto});
 const out=safePath(config.outputDir+"/manifest.v1.json","data/reference");
 const targets=[[out,JSON.stringify(manifest)],...chunks.map(c=>
  [safePath(config.outputDir+"/"+c.file,"data/reference"),c.raw])];
 if(check){
  for(const [file,expected] of targets){
   const actual=await readFile(file,"utf8");
   if(actual!==expected)throw new Error("SOURCE_PACK_BUILD_OUT_OF_SYNC "+file);
  }
 }else{
  await mkdir(dirname(out),{recursive:true});
  for(const [file,data] of targets)await writeFile(file,data,"utf8");
 }
 return Object.freeze({workId:config.workId,witnessId:config.witnessId,
  sectionCount:chunks.length,manifestBytes:Buffer.byteLength(JSON.stringify(manifest)),
  sectionBytes:chunks.reduce((n,x)=>n+Buffer.byteLength(x.raw),0),check});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2],config=process.argv[3];
 if(!["--check","--write"].includes(mode)||!config){
  console.error("Usage: node tools/reference/build-source-packs.mjs --check|--write data/reference/...build-config.json");
  process.exitCode=2;
 }else{
  buildSourcePacksFromConfig(config,{check:mode==="--check"})
   .then(x=>console.log("SOURCE_PACK_BUILD",JSON.stringify(x)))
   .catch(e=>{console.error("SOURCE_PACK_BUILD_FAILED",e.message);process.exitCode=1});
 }
}
