#!/usr/bin/env node
/** Offline 34-work candidate-comparison gallery, download-only research thumbnails.
 * No master acquisition, curator rating mutation or publication.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mkdir,writeFile} from "node:fs/promises";
import {join} from "node:path";
const input=JSON.parse(readFileSync(process.argv[2]||"artifacts/qa-discovery-merged/discovery-117-screened.json","utf8"));
const out=process.argv[3]||"artifacts/qa-discovery-merged";
assert(input.schema==="AO_SACRED_ART_76_DISCOVERY_CANDIDATE_SCREEN_V1");
assert(input.counts.publishedPhotos===0&&input.counts.approvedPhotos===0);
const works=input.records.filter(w=>w.candidates.length);
const jobs=works.flatMap(w=>w.candidates.map((c,index)=>({work:w,source:c,index})));
const holdings=new Map();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchThumbnail(url){
 if(!url)return {status:"NO_THUMBNAIL",message:"Source supplied no preview"};
 let u;try{u=new URL(url)}catch{return {status:"BLOCK_INVALID_URL"}}
 if(u.protocol!=="https:"||u.hostname!=="upload.wikimedia.org"||/prado/i.test(u.pathname))
  return {status:"BLOCK_SOURCE_OR_HOST"};
 try{
  const r=await fetch(u,{redirect:"error",signal:AbortSignal.timeout(15000),
   headers:{"user-agent":"AdOrientemResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"}});
  if(!r.ok)return {status:"FETCH_FAILED",message:"HTTP "+r.status};
  const type=(r.headers.get("content-type")||"").split(";")[0].trim().toLowerCase();
  if(!["image/jpeg","image/png","image/webp"].includes(type))return {status:"BLOCK_BAD_MIME"};
  if(Number(r.headers.get("content-length")||0)>2000000)return {status:"BLOCK_OVERSIZE"};
  const bytes=Buffer.from(await r.arrayBuffer());
  if(bytes.length<300||bytes.length>2000000)return {status:"BLOCK_BAD_LENGTH"};
  const valid=type==="image/jpeg"?bytes[0]===255&&bytes[1]===216:
    type==="image/png"?bytes.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a","hex")):
    bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP";
  if(!valid)return {status:"BLOCK_MIME_BYTES"};
  return {status:"EMBEDDED_RESEARCH_THUMBNAIL",size:bytes.length,
   inline:"data:"+type+";base64,"+bytes.toString("base64")};
 }catch(e){return {status:"FETCH_FAILED",message:String(e.message||e).slice(0,95)}}
}
let offset=0;
async function worker(){
 for(;;){
  const k=offset++;if(k>=jobs.length)return;
  holdings.set(k,await fetchThumbnail(jobs[k].source.image?.thumb));
  await sleep(60);
 }
}
await Promise.all(Array.from({length:6},()=>worker()));
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let counter=0;
const sections=works.map(w=>{
 const images=w.candidates.map((c,i)=>{
  const v=holdings.get(counter++);
  // The Commons API sometimes returns no usable thumbnail URL. Keep a safe,
  // provenance-preserving, network-dependent exact Commons-file fallback.
  const file=String(c.commonsTitle||"").replace(/^File:/i,"");
  const remote=(c.image?.thumb&&/^https:\/\/upload\.wikimedia\.org\//.test(c.image.thumb))?
   c.image.thumb:
   file&&!/prado|museodelprado/i.test(file)?
   "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(file)+"?width=320":null;
  const preview=v.inline?
   '<img src="'+v.inline+'" alt="Unverified Commons research thumbnail" loading="lazy">':
   remote?'<img src="'+esc(remote)+'" alt="Unverified Commons source thumbnail; online connection required" loading="lazy">':
   '<p>No preview · '+esc(v.status)+' · open Commons source below</p>';
  return '<article><div class="image">'+preview+'</div>'+
   '<div class="label">Candidate '+(i+1)+' · '+esc(c.reviewLane)+' · '+esc(c.licenseClaim)+
   ' · '+esc(c.image?.width)+'×'+esc(c.image?.height)+'</div>'+
   '<a href="'+esc(c.filePage)+'" target="_blank" rel="noopener noreferrer">'+esc(c.commonsTitle)+'</a></article>';
 });
 const first=images.slice(0,2).join("");
 const rest=images.slice(2).length?'<details><summary>Compare '+(images.length-2)+' additional source files</summary>'+
  '<div class="photos">'+images.slice(2).join("")+'</div></details>':"";
 return '<section><h2>'+esc(w.approvedArtTitle)+'</h2><p>'+esc(w.approvedArtist)+
 ' · '+images.length+' file leads · <b>unverified original</b></p><div class="photos">'+first+
 '</div>'+rest+'</section>';
}).join("");
const outcomes=jobs.map((job,k)=>({artworkId:job.work.artworkId,filePage:job.source.filePage,
 previewStatus:holdings.get(k).status,productionEligible:false}));
const counts={artworksWithNewFileLeads:works.length,screenedFileLeads:jobs.length,
 previewsEmbedded:outcomes.filter(x=>x.previewStatus==="EMBEDDED_RESEARCH_THUMBNAIL").length,
 previewsUnavailable:outcomes.filter(x=>x.previewStatus!=="EMBEDDED_RESEARCH_THUMBNAIL").length,
 onlineCommonsFallbacks:outcomes.filter(x=>x.previewStatus!=="EMBEDDED_RESEARCH_THUMBNAIL").length,
 previewFailureCodes:Object.fromEntries([...new Set(outcomes.map(x=>x.previewStatus))].map(code=>[code,outcomes.filter(x=>x.previewStatus===code).length])),
 certifiedPhotoMasters:0};
await mkdir(out,{recursive:true});
await writeFile(join(out,"source-thumbnail-gallery-status.json"),
 JSON.stringify({schema:"AO_SACRED_ART_OFFLINE_CANDIDATE_GALLERY_V1",asOf:input.asOf,
  counts,originalsDownloaded:0,rightsCertified:0,published:0,records:outcomes},null,2)+"\n");
const page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">'+
 '<title>Ad Orientem · 34 painting source-comparison review</title>'+
 '<style>*{box-sizing:border-box}body{margin:0;background:#090d13;color:#eae3d6;font:15px/1.5 Georgia,serif}'+
 'header{background:#111b29;padding:30px 5%;border-bottom:1px solid #474b53}h1{font-size:32px;font-weight:400}'+
 'header p,section p,.label{color:#aea99f}main{padding:20px;margin:auto;max-width:1200px;display:grid;gap:18px}'+
 'section{padding:18px;border:1px solid #454852;background:#121923}h2{font-size:20px;font-weight:400;margin:0}'+
 '.photos{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}'+
 'article{border-top:1px solid #444;padding:12px 0}.image{height:240px;display:flex;align-items:center;justify-content:center;background:#080c11}'+
 '.image img{height:100%;width:100%;object-fit:contain}.image p{padding:20px}.label{font:12px/1.4 system-ui;margin:8px 0}'+
 'a{color:#b3d0ea;overflow-wrap:anywhere}summary{padding:10px;cursor:pointer;color:#dac5a6}'+
 'details{border:1px solid #4a4550;margin-top:12px}details .photos{padding:12px}'+
 '@media(min-width:900px){main{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
 '</style><header><h1>34 paintings · source photographs reviewed together</h1>'+
 '<p>All '+jobs.length+' current Commons research candidates; best-ranked two shown for each painting, others expandable. '+
 'These thumbnails are NOT verified to depict the exact approved original. No licensing or release approvals granted.</p>'+
 '<p>Embedded thumbnails work offline when available. Otherwise exact Commons file previews require an internet connection. Source files remain linked, and preview failures stay recorded.</p>'+
 '</header><main>'+sections+'</main></html>';
await writeFile(join(out,"34-paintings-source-comparison-gallery.html"),page);
console.log(JSON.stringify(counts));
