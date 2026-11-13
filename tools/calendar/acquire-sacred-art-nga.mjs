#!/usr/bin/env node
/**
 * Independent National Gallery of Art (Washington) exact-object acquisition.
 * Never fetches images flagged openaccess=0 or publishes a Calendar/Home file.
 * Fetches the NGA's official published_images CSV ONCE for the full research batch.
 */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {mkdir,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {hasPradoProvenance} from "./sacred-art-source-policy.mjs";
import {parseImageDimensions} from "./acquire-sacred-art-bulk.mjs";

const root=new URL("../../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const intake=load("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const freeze=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const released=load("data/calendar/sacred-art-certified-media.v1.json");
const approved=new Set(freeze.approved.map(x=>x.artworkId));
const preserved=new Set(freeze.historicallyFiveIDsPreservedSeparately);
const rejected=new Set(freeze.rejected.map(x=>x.artworkId));
const CSV_URL="https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/published_images.csv";
const RIGHTS_URL="https://www.nga.gov/artworks/free-images-and-open-access";
export const NGA_PROVIDER="NGA_OFFICIAL_OPEN_ACCESS_CANDIDATE";
export function ngoObjectId(sourceUrl) {
 const u=new URL(sourceUrl);
 if(u.origin!=="https://www.nga.gov")throw Error("Not an NGA official object");
 const match=u.pathname.match(/^\/artworks\/(\d+)(?:-[a-z0-9-]+)?\/?$/i);
 if(!match)throw Error("NGA object URL has no exact integer ID");
 return Number(match[1]);
}
/** RFC-4180 cells including quoted commas, CRLFs and escaped double quotes. */
export function parseCsv(text,onRow) {
 let cells=[],field="",quoted=false,rowCount=0;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){
   if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;
  }else if(c===","&&!quoted){cells.push(field);field="";}
  else if((c==="\n"||c==="\r")&&!quoted){
   if(c==="\r"&&text[i+1]==="\n")i++;
   cells.push(field);field="";
   if(cells.length>1||cells[0]){onRow(cells);rowCount++;}
   cells=[];
  }else field+=c;
 }
 if(quoted)throw Error("Malformed NGA CSV: unterminated quoted field");
 if(field!==""||cells.length){cells.push(field);onRow(cells);rowCount++;}
 return rowCount;
}
export function selectNGAOpenImages(csv,wantedIds) {
 const results=new Map([...wantedIds].map(id=>[id,[]]));
 let headers=null;
 const count=parseCsv(csv,row=>{
  if(!headers){headers=row.map(x=>x.trim().toLowerCase().replace(/^\uFEFF/,""));return;}
  const col=name=>row[headers.indexOf(name)];
  const objectId=Number(col("depictstmsobjectid"));
  if(!results.has(objectId))return;
  // NGA explicitly warns that published_images includes restricted fair-use thumbnails.
  if(col("openaccess")!=="1" || !col("iiifurl"))return;
  if(col("viewtype")!=="primary")return;
  const base=col("iiifurl").replace(/\/+$/,"");
  let u;try{u=new URL(base);}catch{return;}
  if(u.protocol!=="https:"||u.hostname!=="api.nga.gov"||!/^\/iiif\/[0-9a-z-]+$/i.test(u.pathname)
     ||u.search||u.hash)return;
  if(!/^[0-9a-f-]{36}$/i.test(col("uuid")||""))return;
  results.get(objectId).push({objectId,uuid:col("uuid"),baseUrl:base,
    openaccess:1,viewtype:col("viewtype"),width:Number(col("width")),height:Number(col("height")),
    maxpixels:Number(col("maxpixels"))||null,metadataRecordSource:CSV_URL});
 });
 assert(headers?.includes("openaccess")&&headers?.includes("depictstmsobjectid")
  &&headers?.includes("iiifurl"),"Wrong NGA image dataset columns");
 const selected=new Map();
 for(const [id,items] of results) {
  items.sort((a,b)=>(b.width*b.height)-(a.width*a.height));
  selected.set(id,items[0]||null);
 }
 return {rowCount:count,selected};
}
async function fetchChecked(url,category){
 const u=new URL(url);
 const allow=category==="csv"?"raw.githubusercontent.com":"api.nga.gov";
 assert(u.hostname===allow&&u.protocol==="https:","Unapproved network host");
 const r=await fetch(url,{signal:AbortSignal.timeout(category==="csv"?180000:45000),
  headers:{"user-agent":"AdOrientemSacredArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"}});
 if(!r.ok)throw Error("HTTP "+r.status+" from "+allow);
 assert(new URL(r.url).hostname===allow,"Unexpected image/data redirect");
 return r;
}
export async function run() {
 assert.deepEqual(released.media,[],"No automatic release allowed");
 const candidates=intake.works.filter(x=>x.provider===NGA_PROVIDER);
 assert.equal(candidates.length,6,"Unexpected change to NGA exact-object research scope");
 const ids=new Map();
 for(const work of candidates){
  assert(!hasPradoProvenance(work)&&work.sourcePolicy?.noFetch!==true,"Prado material prohibited");
  const newApproval=work.reviewGate==="APPROVED"&&approved.has(work.id);
  const historic=work.reviewGate==="LEGACY_FIVE_PRESERVED"&&preserved.has(work.id);
  assert((newApproval||historic)&&!rejected.has(work.id),"NGA target lacks curator approval");
  const id=ngoObjectId(work.sourceUrl);
  if(ids.has(id))throw Error("Same NGA physical work duplicated in six-work acquisition");
  ids.set(id,work);
 }
 const output=join(process.cwd(),"artifacts","sacred-art-nga-official");
 await mkdir(output,{recursive:true});
 const csv=await (await fetchChecked(CSV_URL,"csv")).text();
 assert(csv.length>1000000&&csv.length<180000000,"NGA dataset size outside guard");
 const {rowCount,selected}=selectNGAOpenImages(csv,new Set(ids.keys()));
 const results=[];
 for(const [objectId,work] of ids){
  const evidence={artworkId:work.id,objectId,objectPage:work.sourceUrl,title:work.title,
   artist:work.artist,provider:"NATIONAL_GALLERY_OF_ART_OPEN_ACCESS",museumDataset:CSV_URL,
   rightsDocumentation:RIGHTS_URL,technicalStagingOnly:true,productionCertified:false,
   photoSelectionCertified:false,properAndPhoneQaCertified:false};
  const candidate=selected.get(objectId);
  if(!candidate){results.push({...evidence,status:"HOLD_NO_EXPLICIT_OPEN_ACCESS_IMAGE"});continue;}
  try{
   const imageUrl=candidate.baseUrl+"/full/full/0/default.jpg";
   const image=await fetchChecked(imageUrl,"image");
   assert(/image\/jpeg/i.test(image.headers.get("content-type")||""),"NGA image is not a JPEG");
   const data=Buffer.from(await image.arrayBuffer());
   assert(data.length>75000&&data.length<35000000,"NGA image bytes outside guard");
   const dims=parseImageDimensions(data,"image/jpeg");
   assert(dims.width>=1000&&dims.height>=700,"NGA image too small for source master");
   const sha256=createHash("sha256").update(data).digest("hex");
   const filename="nga-"+objectId+"-"+sha256.slice(0,12)+".jpg";
   const target={...evidence,status:"STAGED_NGA_OPEN_ACCESS_FOR_INDEPENDENT_QA",
      image:{file:filename,sha256,bytes:data.length,...dims},
      datasetRightsFlag:1,imageUrl,ngaPublishedImage:candidate,
      legalReuseVerifiedIndependently:false,sourcePhotoCropVerified:false};
   await writeFile(join(output,filename),data);
   await writeFile(join(output,filename+".json"),JSON.stringify(target,null,2)+"\n");
   results.push(target);
  }catch(err){results.push({...evidence,status:"HOLD_DOWNLOAD_OR_RESOLUTION",reason:String(err.message||err).slice(0,300)});}
 }
 const staged=results.filter(x=>x.image).length;
 const summary={schema:"AO_NGA_6_OPEN_ACCESS_STAGING_V1",asOf:"2026-10-20",datasetRecordsRead:rowCount,
   considered:results.length,stagedForQa:staged,held:results.length-staged,productionReleased:0,results};
 await writeFile(join(output,"results.json"),JSON.stringify(summary,null,2)+"\n");
 const esc=x=>String(x??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 await writeFile(join(output,"review.html"),'<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AO · NGA sources</title><style>body{margin:20px;background:#090d13;color:#e6dfd2;font:16px Georgia,serif}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;max-width:1300px}img{width:100%;height:360px;object-fit:contain}small{color:#b1a899}h2{font-size:1.05rem}</style><header><small>AD ORIENTEM · NGA OPEN-ACCESS TECHNICAL REVIEW · NOT PUBLISHED</small><h1>'+staged+' source images for QA</h1></header><main>'+results.filter(x=>x.image).map(x=>'<article><img src="'+esc(x.image.file)+'"><h2>'+esc(x.title)+'</h2><small>'+esc(x.artist)+' · '+esc(x.image.width+'×'+x.image.height)+'</small></article>').join("")+'</main></html>');
 console.log(JSON.stringify({count:results.length,staged,held:results.length-staged,ngaRows:rowCount,imagesReleased:0,summary:results.map(x=>({title:x.title,status:x.status,reason:x.reason}))}));
 return summary;
}
if(process.argv[1]&&/acquire-sacred-art-nga\.mjs$/.test(process.argv[1]))await run();
