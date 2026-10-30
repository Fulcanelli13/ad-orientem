/**
 * Sacred Art, provenance recovery for 383 locked canonical works.
 * Source register stays immutable. Search older, explicitly dated research
 * archives for exact canonical ID or exact prior photo byte SHA256 evidence.
 * Metadata findings are research leads only, not artwork/rights approvals.
 */
import {readFileSync,readdirSync,writeFileSync,statSync} from "node:fs";
import {join,basename} from "node:path";
const base="data/calendar/";
const canonical=JSON.parse(readFileSync(base+"sacred-art-curator-queues-383-20261029.v1.json","utf8"));
const cross=JSON.parse(readFileSync(base+"sacred-art-accepted-856-to-canonical-383-20261029.v1.json","utf8"));
if(canonical.main_records.length!==383||cross.records.length!==856||
 cross.counts.confirmed!==72||cross.counts.unlinked!==784)throw Error("Frozen baseline changed");
const records=canonical.main_records;
const byId=new Map(records.map(x=>[x.artwork_id,x]));
const bySha=new Map();
for(const r of records)if(/^[0-9a-f]{64}$/i.test(r.prior_source_sha256||"")){
 const k=r.prior_source_sha256.toLowerCase();
 bySha.set(k,[...(bySha.get(k)||[]),r.artwork_id]);
}
const norm=s=>String(s||"").toLowerCase().trim();
const archivalFiles=[];
function listDir(dir){
 if(!statSync(dir,{throwIfNoEntry:false})?.isDirectory())return;
 for(const item of readdirSync(dir,{withFileTypes:true})){
  const f=join(dir,item.name);
  if(item.isDirectory()){if(!/node_modules|__pycache__|output|archive-download/i.test(item.name))listDir(f);}
  else if(/\.(json|csv)$/i.test(item.name)&&
    /(?:sacred.art|prayer.art|artwork|painting|image.*manifest|art.*inventory|master.*art)/i.test(item.name)&&
    !/phase1|editorial|20261030|accepted.856|curator.queues.383|bulk.screen|qa.worklist/i.test(item.name)&&
    statSync(f).size<1800000)archivalFiles.push(f);
 }
}
for(const dir of ["data/calendar","data/research","assets/inventory","assets/recovered","assets/staged","data/pray"])listDir(dir);
const seenFilePaths=new Set(),evidence=new Map();
const idKeys=new Set(["id","artwork_id","artworkid","art_id","canonical_artwork_id",
 "master_artwork_id","artwork_id_ref","artworkidref","artwork_ref","asset_artwork_id"]);
const shaKeys=/^(?:source_)?(?:original|archive|photo|image|selected|native|asset|prior|source|file|current)?_?sha256$|sha256$/i;
const urlKey=/(?:url|uri|page|purl|href|link)$/i;
function actualObjectUrl(v){
 if(typeof v!=="string"||!/^https?:\/\/\S+/i.test(v))return false;
 try{
  const u=new URL(v),host=u.hostname.toLowerCase(),p=u.pathname;
  if(/commons\.wikimedia\.org$/.test(host))return /^\/wiki\/File:/i.test(p);
  if(/(?:metmuseum\.org|clevelandart\.org|nga\.gov|rijksmuseum\.nl|smk\.dk|kmska\.be|thewalters\.org|purl\.thewalters\.org|collections\.louvre\.fr|museum|musee|gallery|collection)/i.test(host)){
   return /\/(?:art\/|artwork\/|collection\/|collections\/|objects?\/|object\/|meesterwerk\/|Search\/\d+|id\/\d+)|\/\d{4}\.\d+/.test(p)||/\/art\/collection\/search\/\d+/i.test(p);
  }
  return false;
 }catch{return false;}
}
function collectLocalFields(obj){
 const list=[];
 function walk(x,depth,path){
  if(!x||typeof x!=="object"||depth>3||list.length>80)return;
  if(Array.isArray(x)){for(let i=0;i<Math.min(x.length,6);i++)walk(x[i],depth+1,path+"["+i+"]");return;}
  for(const [k,v] of Object.entries(x)){
   const p=path?path+"."+k:k;
   if(typeof v==="string"&&v.length<650){
    if(urlKey.test(k)&&actualObjectUrl(v))list.push({kind:"OBJECT_OR_FILE_PAGE",field:p,value:v});
    else if(/^(?:accession|accessionnumber|inventory|inventorynumber|objectnumber)$/i.test(k)&&v.length<100)
      list.push({kind:"ACCESSION",field:p,value:v});
    else if(shaKeys.test(k)&&/^[0-9a-f]{64}$/i.test(v))
      list.push({kind:"PHOTO_SHA256",field:p,value:v.toLowerCase()});
   }else if(depth<3&&v&&typeof v==="object")walk(v,depth+1,p);
  }
 }
 walk(obj,0,"");
 return [...new Map(list.map(x=>[x.kind+"|"+x.field+"|"+x.value,x])).values()].slice(0,40);
}
function add(id,row){
 if(!evidence.has(id))evidence.set(id,[]);
 const list=evidence.get(id),key=row.file+"|"+row.path+"|"+row.matchMethod;
 if(list.some(x=>x.file+"|"+x.path+"|"+x.matchMethod===key))return;
 if(list.length<70)list.push(row);
}
function visit(obj,file,path,depth=0){
 if(!obj||typeof obj!=="object"||depth>18)return;
 if(Array.isArray(obj)){
  for(let i=0;i<obj.length;i++)visit(obj[i],file,path+"["+i+"]",depth+1);
  return;
 }
 let ids=new Set(),shaHits=new Set();
 for(const [k,v] of Object.entries(obj)){
  if(typeof v!=="string")continue;
  const key=k.toLowerCase().replace(/[^a-z0-9_]/g,"");
  if(idKeys.has(key)&&byId.has(v))ids.add(v);
  if(shaKeys.test(k)&&bySha.has(norm(v)))
   for(const id of bySha.get(norm(v)))shaHits.add(id);
 }
 if(ids.size||shaHits.size){
  const fields=collectLocalFields(obj);
  for(const id of ids)add(id,{file,path,matchMethod:"EXACT_CANONICAL_ID",
   originalId:id,fields});
  // SHA hits must not inherit a co-located different artwork ID.
  for(const id of shaHits)if(!ids.size||ids.has(id))
    add(id,{file,path,matchMethod:"EXACT_PRIOR_PHOTO_SHA256",
      originalId:id,fields});
 }
 for(const [k,v] of Object.entries(obj))if(v&&typeof v==="object")
  visit(v,file,path+"."+k,depth+1);
}
function parseCsv(text){
 const rows=[];let current=[],cell="",q=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(q&&text[i+1]==='"'){cell+='"';i++;}else q=!q;}
  else if(c===","&&!q){current.push(cell);cell="";}
  else if((c==="\n"||c==="\r")&&!q){
   if(c==="\r"&&text[i+1]==="\n")i++;
   current.push(cell);rows.push(current);current=[];cell="";
  }else cell+=c;
 }
 if(cell||current.length){current.push(cell);rows.push(current);}
 if(rows.length<2)return [];
 const headers=rows.shift();
 return rows.filter(r=>r.some(Boolean)).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]||""])));
}
const skipped=[];
for(const file of archivalFiles){
 try{
  const raw=readFileSync(file,"utf8");
  const data=file.endsWith(".csv")?parseCsv(raw):JSON.parse(raw);
  visit(data,file,"$",0);
  seenFilePaths.add(file);
 }catch(e){skipped.push({file,error:String(e).slice(0,160)});}
}
const found=[],countsByStatus={},topByFile={};
for(const r of records){
 const e=evidence.get(r.artwork_id)||[];
 const hasOfficialUrl=e.some(x=>x.fields.some(f=>f.kind==="OBJECT_OR_FILE_PAGE"&&
  /^(https?:\/\/)(?!commons\.wikimedia\.org)/.test(f.value) ));
 const hasCommonsUrl=e.some(x=>x.fields.some(f=>f.kind==="OBJECT_OR_FILE_PAGE"&&f.value.includes("commons.wikimedia.org")));
 const hasPhotoSha=e.some(x=>x.matchMethod==="EXACT_PRIOR_PHOTO_SHA256");
 const hasEvidence=e.length>0;
 const sourceMissing=!r.source_page;
 const status=!sourceMissing?"EXISTING_SOURCE_PAGE_RECORDED":
  hasOfficialUrl?"ARCHIVED_OBJECT_PAGE_CANDIDATE":
  hasCommonsUrl?"ARCHIVED_COMMONS_FILE_PAGE_CANDIDATE":
  hasPhotoSha?"ARCHIVED_PHOTO_HASH_ASSOCIATION_ONLY":
  hasEvidence?"ARCHIVAL_ID_FOUND_NO_EXPLICIT_OBJECT_PAGE":
  "NO_ARCHIVAL_PROVENANCE_IN_SCANNED_FILES";
 countsByStatus[status]=(countsByStatus[status]||0)+1;
 for(const x of e)topByFile[x.file]=(topByFile[x.file]||0)+1;
 found.push({artworkId:r.artwork_id,title:r.title,artist:r.artist,
  priorSourcePage:r.source_page||null,
  priorPhotoSha256:r.prior_source_sha256||null,
  missingSourcePage:sourceMissing,archiveStatus:status,
  candidateEvidenceCount:e.length,archiveEvidence:e.slice(0,14),
  canonicalIdentityPromoted:false,photoRightsApproved:false,
  imageCertified:false,productionMutation:false});
}
const summary={
 canonicalRecords:383,originalCanonicalSourcePagePresent:records.filter(x=>x.source_page).length,
 originalCanonicalSourcePageMissing:records.filter(x=>!x.source_page).length,
 archivalFilesSelected:archivalFiles.length,archivalFilesScanned:seenFilePaths.size,
 archivalFileReadFailures:skipped.length,
 missingCanonicalSourcePagesWithRecordedArchiveSource:
 found.filter(x=>x.missingSourcePage&&
 ["ARCHIVED_OBJECT_PAGE_CANDIDATE","ARCHIVED_COMMONS_FILE_PAGE_CANDIDATE"].includes(x.archiveStatus)).length,
 missingCanonicalSourcePagesWithAnyArchiveRecord:
 found.filter(x=>x.missingSourcePage&&x.candidateEvidenceCount).length,
 newCanonical383To856ConfirmedIdentityLinks:0,photoRightsCertifications:0,
 photoVisualCertifications:0,productionImports:0,byStatus:countsByStatus};
if(summary.canonicalRecords!==383||summary.originalCanonicalSourcePagePresent!==94||
 summary.originalCanonicalSourcePageMissing!==289||
 found.some(x=>x.canonicalIdentityPromoted||x.photoRightsApproved||x.imageCertified||x.productionMutation))
 throw Error("Canonical baseline and release-gate mismatch");
const out={schema:"AO_SACRED_ART_383_CANONICAL_PROVENANCE_ARCHIVE_SCAN_V1",
 generatedAt:new Date().toISOString(),input:"data/calendar/sacred-art-curator-queues-383-20261029.v1.json",
 provenancePolicy:[
 "Only exact frozen artwork IDs and exact prior photo SHA256 fingerprints count as an archival evidence join",
 "A repeated SHA is photo-byte evidence, not a grant of ownership, a same-work merge, or rights clearance",
 "Archived candidate object URLs are source leads; verify museum object identifiers and accession separately before canonical linkage",
 "No title/artist-only identity joins; missing canonical source_page remains unchanged",
 "Historical approvals, rejections, protected source identities, and production assets are untouched"],
 summary,archiveFileHits:Object.entries(topByFile).sort((a,b)=>b[1]-a[1]).slice(0,45)
  .map(([file,hits])=>({file,hits})),
 skipped,records:found,release:{sourceRegistryMutated:false,editorialDecisionsMutated:false,
 photoApproved:false,productionMutation:false}};
writeFileSync(base+"sacred-art-phase1-canonical383-archive-provenance-20261030.v1.json",
 JSON.stringify(out,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({summary,topArchiveFiles:out.archiveFileHits.slice(0,12)},null,2));
