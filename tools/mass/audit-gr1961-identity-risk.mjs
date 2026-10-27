#!/usr/bin/env node
// Supplementary research-only identity audit of the *existing* pinned
// 1,195-GABC Graduale archive. It neither repeats SQL ingestion nor
// imports staged notation into the native Schola.
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
export const GR1961_IDENTITY_AUDIT_SCHEMA="ao-gr1961-identity-risk-audit-v1";
const ROOT=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const DIR=join(ROOT,"data/mass/chant-corpus");
const sha256=s=>createHash("sha256").update(s).digest("hex");
export function normalizedGregorianIncipit(incipit){
 return String(incipit??"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
}
export function buildGradualeIdentityAudit(index,records){
 if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
    index?.sourceEditionId!==2||index?.status!=="RESEARCH_ONLY_NOT_MASS_READER")
   throw Error("Authoritative 1961 research index required");
 if(records.length!==index.screening?.validStaged)
   throw Error("Archive count mismatch");
 const officeKeys=new Map(),textKeys=new Map(),hashKeys=new Map(),ids=new Set();
 for(const record of records){
  if(ids.has(record.id))throw Error("Duplicate source ID: "+record.id);
  ids.add(record.id);
  if(record.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
     record.sourceEditionId!==2||
     record.id!=="GREGOBASE-"+record.gregobaseId||
     !record.sha256||sha256(record.gabc)!==record.sha256)
   throw Error("Unverified research record: "+record.id);
  const normalized=normalizedGregorianIncipit(record.incipit);
  if(!normalized)throw Error("Missing Latin incipit: "+record.id);
  const scoped=record.officePart+"|"+normalized;
  for(const [map,key] of [[officeKeys,scoped],[textKeys,normalized],[hashKeys,record.sha256]]){
   const group=map.get(key)??[];group.push(record);map.set(key,group);
  }
 }
 const detail=group=>group.map(record=>({
  id:record.id,officePart:record.officePart,incipit:record.incipit,
  page:record.gradualeRomanum1961Page,mode:record.mode,
  version:record.version,sha256:record.sha256,
 })).sort((a,b)=>Number(a.id.slice(10))-Number(b.id.slice(10)));
 const samePartDistinctGabc=[...officeKeys].filter(([,group])=>
   group.length>1&&new Set(group.map(r=>r.sha256)).size>1)
  .map(([key,group])=>({normalizedIncipit:key.split("|").slice(1).join("|"),
   officePart:group[0].officePart,items:detail(group),
   decision:"KEEP_VARIANTS_SEPARATE_PENDING_PRINT_REVIEW"}))
  .sort((a,b)=>a.officePart.localeCompare(b.officePart)||
    a.normalizedIncipit.localeCompare(b.normalizedIncipit));
 const crossOfficePart=[...textKeys].filter(([,group])=>
   new Set(group.map(r=>r.officePart)).size>1)
  .map(([incipit,group])=>({normalizedIncipit:incipit,
   officeParts:[...new Set(group.map(r=>r.officePart))].sort(),
   items:detail(group),decision:"NEVER_MATCH_BY_INCIPIT_WITHOUT_CHANT_ROLE"}))
  .sort((a,b)=>a.normalizedIncipit.localeCompare(b.normalizedIncipit));
 const exactGabcGroups=[...hashKeys].filter(([,group])=>group.length>1)
  .map(([hash,group])=>({gabcSha256:hash,items:detail(group),
   decision:"PRESERVE_DISTINCT_SOURCE_IDS_PENDING_VARIANT_REVIEW"}))
  .sort((a,b)=>a.gabcSha256.localeCompare(b.gabcSha256));
 const metadata=Object.freeze({
  schema:GR1961_IDENTITY_AUDIT_SCHEMA,sourceFileBlobSha:index.sourceFileBlobSha,
  sourceSnapshotDate:index.snapshotDate,sourceEditionId:2,
  status:"SECONDARY_IDENTITY_AUDIT_NOT_EDITORIAL_APPROVAL",
  summary:Object.freeze({
   audited:records.length,distinctScopedIncipits:officeKeys.size,
   samePartDistinctGabcGroups:samePartDistinctGabc.length,
   crossOfficePartIncipitGroups:crossOfficePart.length,
   crossOfficePartRecords:crossOfficePart.reduce((n,x)=>n+x.items.length,0),
   exactGabcDuplicateGroups:exactGabcGroups.length,
   nonNumericPageTokens:records.filter(r=>!/^\d+$/.test(r.gradualeRomanum1961Page)).length,
   promotedToReader:0,
  }),
  samePartDistinctGabc,crossOfficePart,exactGabcGroups,
 });
 return metadata;
}
export function loadCanonicalGradualeCorpus({directory=DIR}={}){
 const index=JSON.parse(readFileSync(join(directory,"gr1961-proper-index.json"),"utf8"));
 const records=[];
 for(const entry of index.batches??[]){
  const path=join(ROOT,entry.path);
  const content=readFileSync(path,"utf8");
  if(sha256(content)!==entry.contentSha256||Buffer.byteLength(content)!==entry.bytes)
   throw Error("Source archive checksum mismatch "+entry.path);
  records.push(...JSON.parse(content).items);
 }
 return {index,records};
}
function main(){
 const args=process.argv.slice(2),mode=args[0];
 if(!["--write","--verify"].includes(mode))
  throw Error("Usage: node tools/mass/audit-gr1961-identity-risk.mjs --write|--verify");
 const {index,records}=loadCanonicalGradualeCorpus();
 const audit=buildGradualeIdentityAudit(index,records);
 const content=JSON.stringify(audit,null,2)+"\n";
 const target=join(DIR,"gr1961-identity-audit-v1.json");
 if(mode==="--write")writeFileSync(target,content);
 else if(readFileSync(target,"utf8")!==content)throw Error("Identity audit not reproducible");
 console.log("AO_GR1961_IDENTITY_AUDIT="+JSON.stringify(audit.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
