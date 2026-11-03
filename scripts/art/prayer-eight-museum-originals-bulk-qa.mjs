/**
 * Zero-cost, read-only museum ORIGINAL-photo preflight.
 * Downloads to a GitHub Actions artifact ONLY. No image source enters main.
 * Eight objects were already selected by the 267-position Prayer editorial master.
 * User-approved painting identity != approval of a particular museum image.
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const spec=read("data/prayer/artwork-editorial-20261101/museum-eight-38-position-photo-preflight-20261103.v1.json");
const crosswalk=read("data/prayer/artwork-editorial-20261101/gallery-archive-crosswalk-267-20261103.v1.json");
assert.equal(spec.works.length,8);
assert.equal(crosswalk.assignments.length,267);
assert.equal(crosswalk.counts.states.APPROVED_EXACT_PHOTO_PENDING,161,
 "Batch frozen to 10 released photos; regenerate and review if release registry changes");
const dest=resolve(process.argv[2]||"artifacts/prayer-museum-eight");
mkdirSync(dest,{recursive:true});

function sameSource(a,b){
 if(!a||!b)return false;
 try{
  const aa=new URL(a),bb=new URL(b);
  return aa.hostname.replace(/^www\./,"")===bb.hostname.replace(/^www\./,"")
    &&aa.pathname.replace(/\/$/,"")===bb.pathname.replace(/\/$/,"");
 }catch{return false}
}
function assertMuseumURL(uri,museum){
 const u=new URL(uri);
 assert.equal(u.protocol,"https:");
 const host=u.hostname.toLowerCase();
 assert.ok(museum==="CMA"?
  (host==="clevelandart.org"||host.endsWith(".clevelandart.org")):
  (host==="metmuseum.org"||host.endsWith(".metmuseum.org")),
  "Image URL not on the verified museum domain: "+host);
}
function jpegDimensions(b){
 if(b.length<20||b[0]!==0xff||b[1]!==0xd8)throw Error("not JPEG");
 let p=2;
 while(p<b.length-10){
  if(b[p]!==0xff){p++;continue}
  const mark=b[p+1];p+=2;
  if(mark===0xd8||mark===0xd9||mark===0x01)continue;
  if(mark===0xda)break;
  if(p+2>b.length)break;
  const len=b.readUInt16BE(p);
  if(len<2||p+len>b.length)throw Error("bad JPEG marker");
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(mark)){
   if(len<7)throw Error("bad JPEG SOF");
   return {height:b.readUInt16BE(p+3),width:b.readUInt16BE(p+5)};
  }
  p+=len;
 }
 throw Error("JPEG dimensions unavailable");
}
function dimensions(b){
 if(b.length>24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
 return jpegDimensions(b);
}
async function remote(url,max=36000000){
 const resp=await fetch(url,{headers:{"User-Agent":"AdOrientemArtworkResearch/1.0 (noncommercial research; no automated release)","Accept":"application/json,image/*"},signal:AbortSignal.timeout(45000)});
 if(!resp.ok)throw Error("HTTP_"+resp.status+" "+new URL(url).hostname);
 const size=Number(resp.headers.get("content-length")||0);
 if(size>max)throw Error("OVER_SIZE_LIMIT_"+size);
 const buf=Buffer.from(await resp.arrayBuffer());
 if(buf.length>max)throw Error("OVER_SIZE_LIMIT_"+buf.length);
 return {response:resp,bytes:buf};
}
async function museumRecord(w){
 if(w.museum==="CMA"){
  const u="https://openaccess-api.clevelandart.org/api/artworks/"+w.museumId;
  const {bytes}=await remote(u,3000000);
  const o=JSON.parse(bytes.toString("utf8"));const x=o.data||o;
  const license=String(x.share_license_status||"").toUpperCase();
  if(license!=="CC0")throw Error("CMA_IMAGE_NOT_CC0_"+(license||"MISSING_LICENSE"));
  const image=x.images?.print?.url||x.images?.full?.url||x.images?.web?.url;
  if(!image)throw Error("CMA_NO_DIRECT_IMAGE");
  return {api:u,image,title:x.title,artist:x.creators?.map(c=>c.description||c.name||"").join("; ")||"",licenseStatus:license,recordNumber:String(x.accession_number||x.id||w.museumId),rawSource:"CMA_OPEN_ACCESS_CC0"};
 }
 const u="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+w.museumId;
 const {bytes}=await remote(u,3000000);
 const x=JSON.parse(bytes.toString("utf8"));
 if(x.isPublicDomain!==true)throw Error("MET_NOT_PUBLIC_DOMAIN");
 if(String(x.objectID)!==String(w.museumId))throw Error("MET_OBJECT_ID_MISMATCH");
 if(!x.primaryImage)throw Error("MET_NO_ORIGINAL_IMAGE");
 return {api:u,image:x.primaryImage,title:x.title,artist:x.artistDisplayName||"",licenseStatus:"PUBLIC_DOMAIN_OPEN_ACCESS",recordNumber:String(x.objectID),rawSource:"MET_OPEN_ACCESS"};
}
function escape(s){return String(s??"").replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]))}
const rows=[];
for(const w of spec.works){
 const matched=crosswalk.assignments.filter(a=>a.currentRuntime.state==="APPROVED_EXACT_PHOTO_PENDING"&&sameSource(a.painting?.sourcePage,w.expectedSourcePage));
 assert.equal(matched.length,w.expectedPositions,w.slug+" position mismatch, do not acquire without new review");
 assert.ok(matched.every(a=>a.editorial.approvedOrInherited&&!a.editorial.hold&&!a.editorial.protectedCover));
 const base={slug:w.slug,title:w.title,masterArtist:w.artistInMaster,institutionalArtist:w.institutionalArtist,
  institution:w.museum,objectId:w.museumId,sourcePage:w.expectedSourcePage,
  affectedPositionCount:matched.length,affectedSlots:matched.map(a=>a.slot),
  publicationHold:w.publicationHold||null,editorialWorkSelected:true,
  photographPublicationAuthorized:false};
 try{
  const source=await museumRecord(w);assertMuseumURL(source.image,w.museum);
  const dl=await remote(source.image,36000000);
  assertMuseumURL(dl.response.url,w.museum);
  const dim=dimensions(dl.bytes);
  if(Math.min(dim.width,dim.height)<900)throw Error("PHYSICAL_IMAGE_BELOW_900px_MIN_SIDE");
  const isPNG=dl.bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const ext=isPNG?".png":".jpg";
  const name=w.slug+ext;
  const sha256=createHash("sha256").update(dl.bytes).digest("hex");
  writeFileSync(join(dest,name),dl.bytes);
  const attributionMatch=source.artist.toLowerCase().includes(w.institutionalArtist.toLowerCase())||w.institutionalArtist.toLowerCase().includes(source.artist.toLowerCase());
  rows.push({...base,status:"ACQUIRED_FOR_REVIEW_NOT_RELEASED",source,
   image:{file:name,sha256,bytes:dl.bytes.length,dimensions:dim,contentType:dl.response.headers.get("content-type"),
     unmodifiedMuseumPhoto:true,cropped:false},attributionMatch,
   visualQAPassed:false,phoneQAPassed:false,publicationAllowed:false});
  console.log("ACQUIRED "+w.slug+" "+dim.width+"x"+dim.height+" "+sha256.slice(0,16));
 }catch(e){
  rows.push({...base,status:"ACQUISITION_HOLD",error:String(e?.message||e),
   image:null,visualQAPassed:false,phoneQAPassed:false,publicationAllowed:false});
  console.log("HOLD "+w.slug+" "+String(e?.message||e));
 }
}
const result={schema:"AO_PRAYER_MUSEUM_EIGHT_IMAGE_BYTES_QA_V1",asOf:"2026-11-03",
 policy:"READ_ONLY_ORIGINAL_MUSEUM_IMAGES_NOT_PUBLISHED",count:{
  plannedWorks:8,plannedPrayerSlots:38,
  imageFilesAcquired:rows.filter(x=>!!x.image).length,
  affectedSlotsAcquired:rows.filter(x=>!!x.image).reduce((sum,x)=>sum+x.affectedPositionCount,0),
  photographicPublicationCleared:0,
  attributionReviewHolds:rows.filter(x=>!!x.publicationHold).length
 },works:rows};
writeFileSync(join(dest,"provenance.json"),JSON.stringify(result,null,2)+"\n");
const cards=rows.map(w=>'<article><h2>'+escape(w.title)+'</h2><small>'+escape(w.institution)+" #"+escape(w.objectId)+" · "+escape(w.institutionalArtist)+'</small>'+
 (w.image?'<img src="'+escape(w.image.file)+'" alt="'+escape(w.title)+'"><p>'+escape(w.image.dimensions.width+" × "+w.image.dimensions.height)+" · SHA-256 "+escape(w.image.sha256)+'</p>':
 '<p class="hold">'+escape(w.error)+'</p>')+
 '<p>Selected Prayer positions: '+w.affectedPositionCount+'</p>'+
 (w.publicationHold?'<p class="hold">Hold: '+escape(w.publicationHold)+'</p>':"")+
 '<p><a href="'+escape(w.sourcePage)+'">Official collection record</a></p><p><strong>Original photograph QA: pending human review. No publication.</strong></p></article>').join("\n");
writeFileSync(join(dest,"index.html"),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Prayer museum originals — eight-work QA</title><style>body{margin:0;background:#141414;color:#efe7d8;font:15px/1.5 system-ui}header{max-width:1100px;margin:auto;padding:30px 24px}h1{font:32px Georgia}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:18px;max-width:1150px;margin:auto;padding:20px}article{border:1px solid #594f40;background:#1c1c1c;padding:20px;border-radius:12px}img{display:block;width:100%;height:360px;object-fit:contain;background:#080808;margin:16px 0}small{color:#b7b2a6}h2{font:21px Georgia;margin:0 0 8px}a{color:#dfc586}.hold{color:#ffb4a9}</style><header><h1>Eight museum originals · 38 Prayer positions</h1><p>Source-only contact sheet. Editorial selections preserved. No photograph in this package is approved for live publication. Original museum filenames are represented by SHA-256 records; images shown uncropped.</p></header><main>'+cards+'</main></html>');
console.log("BATCH_SUMMARY "+JSON.stringify(result.count));
console.log("ARTIFACT_PATH "+dest);
if(result.count.imageFilesAcquired!==8)process.exitCode=1;
