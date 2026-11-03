// Bounded primary-source acquisition, no score publication or music approval.
// Preserve the original PNG bytes from the 1961 Solesmes/CMAA source host.
// At most ten distinct printed folios for twelve previously approved-for-review
// candidates. A remote failure remains a hold, not a fabricated facsimile.
import {createHash} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {FIRST12_1961_FACSIMILES} from
 "../../src/mass/reader-proper-first12-1961-facsimile-locators.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const output=join(root,".tmp","schola-1961-first12-original-facsimiles");
await mkdir(output,{recursive:true});
const unique=new Map();
for(const score of FIRST12_1961_FACSIMILES){
 if(!/^https:\/\/gregobase\.selapa\.net\/sources\/2\/\d+\.png$/.test(score.scanned1961PageUrl))
  throw Error("FACSIMILE_ORIGINAL_SOURCE_URL_NOT_PINNED");
 const key=score.scanned1961PageUrl;
 const previous=unique.get(key);
 if(previous&&previous.page!==score.folio)throw Error("SAME_PRINT_SCAN_DIFFERENT_BOOK_FOLIOS");
 unique.set(key,{page:score.folio,url:key,imageNumber:score.imageNumber});
}
if(FIRST12_1961_FACSIMILES.length!==12||unique.size!==10)
 throw Error("FACSIMILE_FIRST12_TEN_DISTINCT_1961_PAGES_REQUIRED");
const results=[];
for(const entry of unique.values()){
 const filename="graduale-romanum-1961-original-p"+entry.page+"-source2-"+entry.imageNumber+".png";
 const record={page:entry.page,sourceUrl:entry.url,imageNumber:entry.imageNumber,
  file:filename,pngSha256:null,width:null,height:null,bytes:0,
  status:"SOURCE_IMAGE_UNAVAILABLE_REVIEW_HOLD",error:null,
  printedStaffPitchesCompared:false,printedNeumeShapesCompared:false,
  rhythmicSignParityCompared:false,syllableUnderlayCertified:false};
 try{
  const response=await fetch(entry.url,{
   redirect:"follow",
   signal:AbortSignal.timeout(15000),
   headers:{"Accept":"image/png,image/*;q=0.9","User-Agent":"AdOrientem/1.0 Gregorian original-source collation"}
  });
  if(!response.ok)throw Error("HTTP_"+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<9000||bytes.length>15_000_000||
     !bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
   throw Error("ORIGINAL_SCAN_NOT_VALID_PNG");
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width<350||width>10000||height<350||height>15000)
   throw Error("ORIGINAL_SCAN_IMAGE_GEOMETRY_INVALID");
  record.pngSha256=createHash("sha256").update(bytes).digest("hex");
  record.bytes=bytes.length;record.width=width;record.height=height;
  record.status="ORIGINAL_1961_SCAN_CAPTURED_NOT_MUSICALLY_VERIFIED";
  await writeFile(join(output,filename),bytes);
 }catch(e){record.error=String(e?.message??e).slice(0,240)}
 results.push(record);
}
const byImage=new Map(results.map(r=>[r.sourceUrl,r]));
const scores=FIRST12_1961_FACSIMILES.map(s=>{
 const image=byImage.get(s.scanned1961PageUrl);
 return {
  scoreId:s.scoreId,part:s.part,original1961Page:s.folio,
  gregobaseSourceUrl:s.sourceUrl,original1961ScanUrl:s.scanned1961PageUrl,
  capturedOriginalImageSha256:image?.pngSha256??null,
  originalScanStatus:image?.status??"NOT_CAPTURED",
  sourceTextIdentityMustBeRetained:true,
  pitchVerified:false,neumesVerified:false,underlayVerified:false,
  printedRhythmicMarksVerified:false,publicScore:false
 };
});
const captured=results.filter(x=>x.pngSha256!=null).length;
const manifest={
 schema:"ao-schola-1961-first12-original-printed-source-image-capture-v1",
 status:"IMMUTABLE_SOURCE_IMAGE_EVIDENCE_ONLY_NOT_MUSIC_CERTIFICATE",
 edition:"Graduale Romanum, Solesmes, 1961",
 sourceArchive:"CMAA scanned folios served by GregoBase source ID 2",
 counts:{priorityScores:12,distinctPrintedPages:10,downloadedOriginalPageImages:captured,
  pageImageAccessHolds:10-captured,musicallyCollatedScores:0,approvedPublicScores:0},
 pages:results,scores,
 publication:{originalGabcUnchanged:true,selected1962LatinUnchanged:true,
  independentPrintedComparisonStillRequired:true,
  userEditorialApprovalRequired:true,publicScores:0}
};
await writeFile(join(output,"1961-original-first12-source-image-manifest.json"),
 JSON.stringify(manifest,null,2)+"\n");
console.log("SCHOLA_1961_ORIGINAL_FACSIMILE_CAPTURE "+JSON.stringify({
 ...manifest.counts,holds:results.filter(x=>x.error).map(x=>({
  page:x.page,error:x.error
 }))
}));
