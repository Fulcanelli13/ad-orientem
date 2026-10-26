#!/usr/bin/env node
// Audit-only bulk index: source page links never constitute score approval.
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
export const SCHEMA="ao-gregobase-1961-discovery-v1";
export const PINNED_COMMIT="8851677efaccf0dccd4eb05ebff28d6f4018584c";
export const DUMP_URL="https://raw.githubusercontent.com/gregorio-project/GregoBase/"+PINNED_COMMIT+"/gregobase_online.sql";
const COLS={
 gregobase_chants:["id","cantusid","version","incipit","initial","office_part","mode","mode_var","transcriber","commentary","gabc","gabc_verses","tex_verses","remarks","copyrighted","duplicateof"],
 gregobase_chant_sources:["chant_id","source","page","sequence","extent"],
 gregobase_sources:["id","year","period","editor","title","description","caption","pages","urls"],
};
const PART={in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA_TRACT_SEQUENCE",tr:"ALLELUIA_TRACT_SEQUENCE",se:"ALLELUIA_TRACT_SEQUENCE",of:"OFFERTORY",co:"COMMUNION",ky:"ORDINARY"};
const val=x=>x==null?"":String(x).trim();
// MySQL INSERT lexer respects apostrophes, backslash escapes, multiline
// GABC and semicolons within strings. No SQL engine, install or network.
export function parseSqlInserts(sql,onRow){
 const re=/\bINSERT\s+INTO\s+\x60?([A-Za-z_]+)\x60?\s*(?:\(([^)]*)\)\s*)?VALUES\s*/gi;
 let m,rows=0,statements=0;
 while((m=re.exec(sql))){
  const table=m[1],cols=m[2]?[...m[2].matchAll(/\x60?([A-Za-z_-]+)\x60?/g)].map(x=>x[1]):COLS[table];
  let i=re.lastIndex,quoted=false,escaped=false;
  if(!COLS[table]){
   for(;i<sql.length;i++){const c=sql[i];if(quoted){if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c==="'")quoted=false}else if(c==="'")quoted=true;else if(c===";"){i++;break}}
   re.lastIndex=i;continue;
  }
  statements++;
  while(i<sql.length){
   while(/\s/.test(sql[i]||"")&&i<sql.length)i++;
   if(sql[i]===";"){i++;break}
   if(sql[i]===","){i++;continue}
   if(sql[i]!=="(")throw Error("Expected tuple "+table+" offset "+i);
   i++;const fields=[];
   while(true){
    while(/\s/.test(sql[i]||"")&&i<sql.length)i++;
    let item="";
    if(sql[i]==="'"){
     i++;let closed=false;
     while(i<sql.length){
      const c=sql[i++];
      if(c==="\\"){const n=sql[i++];item+=({n:"\n",r:"\r",t:"\t",0:"\0"}[n]??n)}
      else if(c==="'"){if(sql[i]==="'"){item+="'";i++}else{closed=true;break}}
      else item+=c;
     }
     if(!closed)throw Error("Unterminated quoted field in "+table);
    }else{
     const from=i;
     while(i<sql.length&&sql[i]!==","&&sql[i]!==")")i++;
     const raw=sql.slice(from,i).trim();
     item=/^NULL$/i.test(raw)?null:raw;
    }
    fields.push(item);
    while(/\s/.test(sql[i]||"")&&i<sql.length)i++;
    if(sql[i]===","){i++;continue}
    if(sql[i]===")"){i++;break}
    throw Error("Unterminated field "+table+" "+i);
   }
   if(!cols||fields.length!==cols.length)throw Error(table+" column mismatch "+fields.length+"/"+cols?.length);
   onRow(table,Object.fromEntries(cols.map((c,j)=>[c,fields[j]])));rows++;
  }
  re.lastIndex=i;
 }
 return {rows,statements};
}
export function ingest1961(sql){
 const chants=new Map(),sources=new Map(),links=[];
 const sqlStats=parseSqlInserts(sql,(table,r)=>{
  if(table==="gregobase_chants")chants.set(Number(r.id),r);
  if(table==="gregobase_sources")sources.set(Number(r.id),r);
  if(table==="gregobase_chant_sources"&&Number(r.source)===2)links.push(r);
 });
 const src=sources.get(2);
 if(!src||Number(src.year)!==1961||!/graduale\s+romanum/i.test(val(src.title))||!/solesmes/i.test(val(src.editor)))
  throw Error("Source ID 2 did not resolve to the 1961 Solesmes Graduale Romanum");
 const groups=new Map();
 for(const link of links){
  const id=Number(link.chant_id);
  if(!chants.has(id))continue;
  if(!groups.has(id))groups.set(id,[]);
  groups.get(id).push({page:val(link.page),sequence:Number(link.sequence),extent:Number(link.extent)});
 }
 const records=[...groups].map(([id,pages])=>{
  const r=chants.get(id),part=val(r.office_part??r["office-part"]).toLowerCase(),type=PART[part]??null;
  const copyright=Number(r.copyrighted)===1,duplicateOf=Number(r.duplicateof)||null;
  const hasGabcPayload=Boolean(val(r.gabc));
  pages.sort((a,b)=>a.page.localeCompare(b.page,undefined,{numeric:true})||a.sequence-b.sequence);
  return {id:"GREGOBASE-"+id,gregobaseId:id,incipit:val(r.incipit),officePart:part,
   trackHint:type,mode:val(r.mode)||null,version:val(r.version)||null,
   transcriber:val(r.transcriber)||null,pages,hasGabcPayload,copyright,duplicateOf,
   status:"HISTORICAL_SOURCE_METADATA_NOT_READER_APPROVED",
   reviewFlags:[...(!type?["UNCLASSIFIED_OR_NON_MASS"]:[]),
     ...(!hasGabcPayload?["GABC_MISSING"]:[]),
     ...(copyright?["COPYRIGHT_FLAGGED"]:[]),
     ...(duplicateOf?["DUPLICATE_SOURCE"]:[])],
   sourceUrl:"https://gregobase.selapa.net/chant.php?id="+id};
 }).sort((a,b)=>a.gregobaseId-b.gregobaseId);
 const summary={total:records.length,byOfficePart:{},withGabc:0,copyrightFlagged:0,
  duplicated:0,unclassified:0};
 for(const x of records){summary.byOfficePart[x.officePart]=(summary.byOfficePart[x.officePart]??0)+1;
  if(x.hasGabcPayload)summary.withGabc++;
  if(x.copyright)summary.copyrightFlagged++;
  if(x.duplicateOf)summary.duplicated++;
  if(!x.trackHint)summary.unclassified++;
 }
 const provenance={schema:SCHEMA,
  edition:{id:2,title:val(src.title),year:1961,editor:val(src.editor)},
  sourceUrl:DUMP_URL,dumpCommit:PINNED_COMMIT,
  sha256:createHash("sha256").update(sql).digest("hex"),
  snapshotType:"ARCHIVED_2021_DATABASE_NOT_2026_LIVE_CATALOGUE",
  sourceLicense:"GregoBase CC0 for transcriptions, per-record copyright flags retained",
  stats:sqlStats,summary};
 return {provenance,records};
}
export function makeShards(index,size=200){
 if(!Number.isInteger(size)||size<1||size>500)throw Error("Shard size 1..500");
 const n=Math.ceil(index.records.length/size);
 return Array.from({length:n},(_,i)=>({
  schema:SCHEMA,sourceSha256:index.provenance.sha256,index:i+1,total:n,
  records:index.records.slice(i*size,(i+1)*size),
 }));
}
function main(){
 const args=process.argv.slice(2),get=key=>{const i=args.indexOf(key);return i<0?null:args[i+1]};
 if(!get("--sql")||!get("--out"))throw Error("Usage: --sql dump.sql --out dir [--print-rows N]");
 const index=ingest1961(readFileSync(resolve(get("--sql")),"utf8"));
 const out=resolve(get("--out"));mkdirSync(out,{recursive:true});
 const shards=makeShards(index);
 const manifest={...index.provenance,shards:shards.map(s=>({
  file:"catalogue-"+String(s.index).padStart(3,"0")+".json",
  count:s.records.length,minId:s.records[0]?.gregobaseId??null,
  maxId:s.records.at(-1)?.gregobaseId??null,
 }))};
 writeFileSync(join(out,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
 for(const s of shards)writeFileSync(join(out,manifest.shards[s.index-1].file),JSON.stringify(s)+"\n");
 console.log("AO_GREGORIAN_MANIFEST="+JSON.stringify(manifest));
 const limit=Math.min(index.records.length,Math.max(0,Number(get("--print-rows")||0)));
 for(const row of index.records.slice(0,limit))console.log("AO_GREGORIAN_ROW="+JSON.stringify(row));
 // Transport-only fallback when Github Actions cannot push generated files.
 // Emit short checksum-addressed chunks for a client-side, independently
 // verified replay into the permanent research branch via the GitHub App.
 // Do not mistake the ephemeral runner log for permanent storage.
 if(get("--emit-shard-checkpoints")==="1"){
  for(const shard of shards){
   const json=JSON.stringify(shard)+"\n";
   const bytes=Buffer.from(json,"utf8");
   const sha256=createHash("sha256").update(bytes).digest("hex");
   const encoded=bytes.toString("base64");
   const width=3000,total=Math.ceil(encoded.length/width);
   console.log("AO_CHANT_CHECKPOINT_META="+JSON.stringify({
    shard:shard.index,total:shards.length,sha256,bytes:bytes.length,parts:total,
    file:manifest.shards[shard.index-1].file,
   }));
   for(let k=0;k<total;k++){
    console.log("AO_CHANT_CHECKPOINT_PART="+JSON.stringify({
     shard:shard.index,part:k+1,total,data:encoded.slice(k*width,(k+1)*width),
    }));
   }
  }
 }

 console.log("AO_GREGORIAN_RESULT="+JSON.stringify({discovered:index.records.length,shards:shards.length,approved:0}));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
