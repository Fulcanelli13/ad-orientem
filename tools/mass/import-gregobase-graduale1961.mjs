#!/usr/bin/env node
// Reproducible, offline-only research extraction from the PINNED GregoBase
// January 2024 SQL snapshot. NEVER writes or imports the live Mass reader.
// Usage:
// node tools/mass/import-gregobase-graduale1961.mjs --input /path/gregobase_online.sql --verify
// node tools/mass/import-gregobase-graduale1961.mjs --input /path/gregobase_online.sql --write
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";

export const GR1961_SOURCE_BLOB_SHA="c43cc2d08488eef0f128933fe10b6bb292fa4f3b";
export const GR1961_SNAPSHOT_DATE="2024-01-05";
export const GR1961_CATEGORIES=Object.freeze({
  in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA",tr:"TRACT",of:"OFFERTORY",co:"COMMUNION",
});
const SCHEMA="ao-gregobase-graduale1961-research-batch-v1";
const INDEX_SCHEMA="ao-gregobase-graduale1961-research-index-v1";
const ROOT=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const OUT=join(ROOT,"data/mass/chant-corpus");
const sha256=value=>createHash("sha256").update(value).digest("hex");
const gitBlobSha=buffer=>createHash("sha1").update("blob "+buffer.length+"\0").update(buffer).digest("hex");

export function* parseMysqlInsertRows(sql,table){
  const tick=String.fromCharCode(96);
  const re=new RegExp("INSERT INTO "+tick+table+tick+"[^\\n]* VALUES\\n","g");
  let marker;
  while((marker=re.exec(sql))){
    let i=re.lastIndex,start=0,fields=[],active=false,quoted=false,escaped=false;
    for(;i<sql.length;i++){
      const c=sql[i];
      if(!active){
        if(c==="("){active=true;fields=[];start=i+1;}
        else if(c===";")break;
        continue;
      }
      if(quoted){
        if(escaped){escaped=false;continue;}
        if(c==="\\"){escaped=true;continue;}
        if(c==="'"){
          if(sql[i+1]==="'"){i++;continue;}
          quoted=false;
        }
        continue;
      }
      if(c==="'"){quoted=true;continue;}
      if(c===","||c===")"){
        fields.push(sql.slice(start,i).trim());
        start=i+1;
        if(c===")"){yield fields;active=false;}
      }
    }
    re.lastIndex=i+1;
  }
}
export function mysqlField(token){
  if(token==="NULL")return null;
  if(!token?.startsWith("'"))return Number(token);
  return token.slice(1,-1)
    .replace(/\\([0bnrtZ\\'"])/g,(_,c)=>({
      0:"\0",b:"\b",n:"\n",r:"\r",t:"\t",Z:"\x1a","\\":"\\","'":"'","\"":"\"",
    })[c]).replace(/''/g,"'");
}
export function screenGraduale1961Sql(sql){
  const witnessPage=new Map();
  for(const x of parseMysqlInsertRows(sql,"gregobase_chant_sources")){
    if(Number(x[1])!==2)continue;
    const id=Number(x[0]);
    if(!witnessPage.has(id))witnessPage.set(id,mysqlField(x[2]));
  }
  const accepted=[],exceptions=[];
  let linkedCore=0,duplicate=0,rightsExcluded=0;
  for(const x of parseMysqlInsertRows(sql,"gregobase_chants")){
    const id=Number(x[0]);
    const office=mysqlField(x[5]);
    if(!witnessPage.has(id)||!GR1961_CATEGORIES[office])continue;
    linkedCore++;
    if(Number(x[15])!==0){rightsExcluded++;continue;}
    if(x[16]!=="NULL"){duplicate++;continue;}
    try{
      const elements=JSON.parse(mysqlField(x[11])??"null");
      const gabc=Array.isArray(elements)?
        elements.find(row=>Array.isArray(row)&&row[0]==="gabc")?.[1]:null;
      if(typeof gabc!=="string"||!gabc.includes("(")||gabc.length<40)
        throw new Error("No usable structured GABC transcription");
      const title=mysqlField(x[3]);
      accepted.push({
        id:"GREGOBASE-"+id,gregobaseId:id,officePart:office,
        trackCategory:GR1961_CATEGORIES[office],
        title,incipit:String(title??""),
        mode:mysqlField(x[6]),modeVariation:mysqlField(x[7]),
        version:mysqlField(x[2]),transcriber:mysqlField(x[8]),
        commentary:mysqlField(x[9]),
        gradualeRomanum1961Page:witnessPage.get(id),sourceEditionId:2,
        sourceUrl:"https://gregobase.selapa.net/chant.php?id="+id,
        gabc,sha256:sha256(gabc),
        releaseStatus:"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED",
      });
    }catch(error){
      exceptions.push({gregobaseId:id,officePart:office,page:witnessPage.get(id),
        reason:String(error?.message??error).slice(0,120)});
    }
  }
  accepted.sort((a,b)=>a.gregobaseId-b.gregobaseId);
  return {accepted,exceptions,linkedCore,duplicate,rightsExcluded};
}
export function renderGraduale1961Archive(screen){
  const {accepted,exceptions,linkedCore,duplicate,rightsExcluded}=screen;
  const batches=[];
  for(let i=0;i<accepted.length;i+=200){
    const items=accepted.slice(i,i+200);
    const name="gr1961-proper-"+String(batches.length+1).padStart(3,"0")+".json";
    const document={
      schema:SCHEMA,snapshotDate:GR1961_SNAPSHOT_DATE,sourceEditionId:2,
      sourceEdition:"Graduale Romanum (Solesmes, 1961)",
      batch:batches.length+1,status:"STAGED_UNRELEASED",items,
    };
    const content=JSON.stringify(document,null,2)+"\n";
    const path="data/mass/chant-corpus/"+name;
    batches.push({path,content,count:items.length,firstId:items[0].gregobaseId,
      lastId:items.at(-1).gregobaseId,
      contentSha256:sha256(content),bytes:Buffer.byteLength(content)});
  }
  const perType={};
  for(const x of accepted)perType[x.officePart]=(perType[x.officePart]||0)+1;
  const exactByHash=new Map(), sameIncipit=new Map();
  for(const record of accepted){
    const all=exactByHash.get(record.sha256)??[];all.push(record.id);
    exactByHash.set(record.sha256,all);
    const normalized=record.incipit.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    const key=record.officePart+":"+normalized;
    const group=sameIncipit.get(key)??[];group.push(record);
    sameIncipit.set(key,group);
  }
  const duplicateHashes=[...exactByHash.values()].filter(group=>group.length>1)
    .map(ids=>({ids,decision:"PRESERVE_BOTH_PENDING_SOURCE_REVIEW"}));
  const distinctMelodies=[...sameIncipit.values()].filter(group=>group.length>1 &&
    new Set(group.map(record=>record.sha256)).size>1)
    .map(group=>({ids:group.map(row=>row.id),decision:"PRESERVE_AS_VARIANTS"}));
  const index={
    schema:INDEX_SCHEMA,snapshotDate:GR1961_SNAPSHOT_DATE,
    sourceRepository:"gregorio-project/GregoBase",
    sourceFile:"gregobase_online.sql",sourceFileBlobSha:GR1961_SOURCE_BLOB_SHA,
    sourceUrl:"https://github.com/gregorio-project/GregoBase/blob/master/gregobase_online.sql",
    sourceEditionId:2,edition:{title:"Graduale Romanum",year:1961,editor:"Solesmes"},
    rights:"GregoBase transcriptions CC0; not a claim about facsimile scans or recordings",
    status:"RESEARCH_ONLY_NOT_MASS_READER",
    screening:{
      sourceMatchedCoreRows:linkedCore,copyrightExcluded:rightsExcluded,
      duplicateExcluded:duplicate,validStaged:accepted.length,
      transcriptionExceptions:exceptions.length,byOfficePart:perType,
    },
    batches:batches.map(({content,...meta})=>meta),
    exceptions,
    releaseRule:"Do not import this data in native Schola until source ownership, 1962 slot eligibility, exact Latin identity, edition verification and editorial review are individually passed.",
    identityFindings:{
      exactGabcDuplicateGroups:duplicateHashes,
      samePartAndIncipitDistinctMelodies:distinctMelodies,
      existingFiveChristmasPilotIds:["GREGOBASE-72","GREGOBASE-1163","GREGOBASE-324","GREGOBASE-1274","GREGOBASE-1139"],
      rule:"Source IDs stay stable. Equal GABC or matching incipits are review evidence, never grounds for silently rewriting original records.",
    },
  };
  return {batches,indexContent:JSON.stringify(index,null,2)+"\n",index};
}
export function verifyOrWrite(out,mode="verify"){
  for(const batch of out.batches){
    const full=join(ROOT,batch.path);
    if(mode==="write"){
      mkdirSync(resolve(full,".."),{recursive:true});writeFileSync(full,batch.content);
    }else if(readFileSync(full,"utf8")!==batch.content)
      throw new Error("Research batch has drifted: "+batch.path);
  }
  const path=join(OUT,"gr1961-proper-index.json");
  if(mode==="write"){
    mkdirSync(OUT,{recursive:true});writeFileSync(path,out.indexContent);
  }else if(readFileSync(path,"utf8")!==out.indexContent)
    throw new Error("Research index has drifted");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const arg=process.argv.indexOf("--input");
  const mode=process.argv.includes("--write")?"write":"verify";
  if(arg<0||!process.argv[arg+1])
    throw new Error("Supply --input for the pinned 2024 SQL dump; no automatic downloads");
  const bytes=readFileSync(process.argv[arg+1]);
  if(gitBlobSha(bytes)!==GR1961_SOURCE_BLOB_SHA)
    throw new Error("Snapshot Git blob SHA differs; review before importing any newer database");
  const screened=screenGraduale1961Sql(bytes.toString("utf8"));
  if(screened.accepted.length!==1195||screened.exceptions.length!==58)
    throw new Error("Unexpected source cohort; review before continuing");
  verifyOrWrite(renderGraduale1961Archive(screened),mode);
  console.log("GR1961 research "+mode+" PASS — "+screened.accepted.length+
    " imported, "+screened.exceptions.length+" quarantined; 0 live promotions");
}
