#!/usr/bin/env node
// Reconstruct the source-only Graduale index from transient GitHub Actions
// log checkpoint chunks and write permanent checksum-verified research files.
// Never modifies production Mass data or grants editorial approval.
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import {SCHEMA} from "./ingest-gregobase-1961.mjs";

export function replayGregoBaseCheckpoints(log){
 const lines=String(log).split(/\r?\n/);
 const found=(key,line)=>{const at=line.indexOf(key);return at<0?null:JSON.parse(line.slice(at+key.length))};
 let manifest=null;
 const meta=new Map(),parts=new Map(),fail=[];
 for(const line of lines){
  let item;
  if((item=found("AO_GREGORIAN_MANIFEST=",line))){
   if(manifest)fail.push("DUPLICATE_MANIFEST");else manifest=item;
  }
  if((item=found("AO_CHANT_CHECKPOINT_META=",line))){
   if(meta.has(item.shard))fail.push("DUPLICATE_SHARD_META");
   else meta.set(item.shard,item);
  }
  if((item=found("AO_CHANT_CHECKPOINT_PART=",line))){
   if(!parts.has(item.shard))parts.set(item.shard,new Map());
   const one=parts.get(item.shard);
   if(one.has(item.part))fail.push("DUPLICATE_PART");
   else one.set(item.part,item);
  }
 }
 if(fail.length)throw Error(fail.join("; "));
 if(manifest?.schema!==SCHEMA||!manifest.sha256||
    !Array.isArray(manifest.shards)||!manifest.shards.length)
  throw Error("Missing or invalid authoritative Graduale discovery manifest");
 const outputs=new Map();
 if(meta.size!==manifest.shards.length||parts.size!==manifest.shards.length)
  throw Error("Missing checkpoint shard(s)");
 let totalRows=0;
 for(let id=1;id<=manifest.shards.length;id++){
  const m=meta.get(id),expected=manifest.shards[id-1],pieces=parts.get(id);
  if(!m||!pieces||m.shard!==id||m.total!==manifest.shards.length||
     !/^[0-9a-f]{64}$/.test(m.sha256)||
     m.file!==expected.file||!/^[A-Za-z0-9._-]+\.json$/.test(m.file)||
     m.parts!==pieces.size||m.parts>1000||m.parts<1)
   throw Error("Invalid or incomplete shard metadata "+id);
  const fragments=[];
  for(let n=1;n<=m.parts;n++){
   const item=pieces.get(n);
   if(!item||item.part!==n||item.total!==m.parts||typeof item.data!=="string"||
      !/^[A-Za-z0-9+/=]+$/.test(item.data)||item.data.length>3000)
    throw Error("Missing or invalid checkpoint part "+id+"/"+n);
   fragments.push(item.data);
  }
  const raw=Buffer.from(fragments.join(""),"base64");
  const sha256=createHash("sha256").update(raw).digest("hex");
  if(sha256!==m.sha256||raw.length!==m.bytes)throw Error("Checksum mismatch shard "+id);
  const shard=JSON.parse(raw.toString("utf8"));
  if(shard.schema!==SCHEMA||shard.sourceSha256!==manifest.sha256||
     shard.index!==id||shard.total!==manifest.shards.length||
     shard.records?.length!==expected.count)
   throw Error("Shard source identity/count mismatch "+id);
  const first=shard.records[0]?.gregobaseId??null,last=shard.records.at(-1)?.gregobaseId??null;
  if(first!==expected.minId||last!==expected.maxId)
   throw Error("Shard ID bounds mismatch "+id);
  outputs.set(m.file,raw.toString("utf8"));
  totalRows+=shard.records.length;
 }
 if(totalRows!==manifest.summary.total)throw Error("Total source row count mismatch");
 return Object.freeze({manifest,shards:outputs,records:totalRows,integrity:"SHA256_VERIFIED"});
}
function main(){
 const argv=process.argv.slice(2),arg=name=>{const p=argv.indexOf(name);return p<0?null:argv[p+1]};
 if(!arg("--log")||!arg("--out"))
  throw Error("Usage: --log actions-job.txt --out repo-research-folder");
 const result=replayGregoBaseCheckpoints(readFileSync(resolve(arg("--log")),"utf8"));
 const dir=resolve(arg("--out"));mkdirSync(dir,{recursive:true});
 writeFileSync(join(dir,"manifest.json"),JSON.stringify(result.manifest,null,2)+"\n");
 for(const [file,source] of result.shards)writeFileSync(join(dir,file),source);
 console.log("AO_CHANT_REPLAY="+JSON.stringify({
  records:result.records,shards:result.shards.size,integrity:result.integrity,approved:0,
 }));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
