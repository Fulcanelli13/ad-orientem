// Bounded primary-source acquisition, no score publication or music approval.
// Preserve the original PNG bytes from the 1961 Solesmes/CMAA source host.
// Fourteen distinct printed folios for twelve previously approved-for-review
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
const continuations=new Map([
 ["GREGOBASE-475","393"],["GREGOBASE-782","363"],
 ["GREGOBASE-265","80"],["GREGOBASE-1271","384"]
]);
const unique=new Map(),pageSpanById=new Map();
function addPage(page,imageNumber){
 const url="https://gregobase.selapa.net/sources/2/"+imageNumber+".png";
 const previous=unique.get(url);
 if(previous&&previous.page!==page)throw Error("SAME_PRINT_SCAN_DIFFERENT_BOOK_FOLIOS");
 unique.set(url,{page,url,imageNumber});
 return url;
}
for(const score of FIRST12_1961_FACSIMILES){
 if(!/^https:\/\/gregobase\.selapa\.net\/sources\/2\/\d+\.png$/.test(score.scanned1961PageUrl))
  throw Error("FACSIMILE_ORIGINAL_SOURCE_URL_NOT_PINNED");
 const first=addPage(score.folio,score.imageNumber);
 if(first!==score.scanned1961PageUrl)throw Error("FIRST12_SOURCE_IMAGE_URL_DRIFT");
 const next=continuations.get(score.scoreId);
 const span=[{page:score.folio,imageUrl:first}];
 if(next){
  if(Number(next)!==Number(score.folio)+1)
   throw Error("PRINTED_CONTINUATION_MUST_BE_ADJACENT");
  span.push({page:next,imageUrl:addPage(next,score.imageNumber+1)});
 }
 pageSpanById.set(score.scoreId,span);
}
if(FIRST12_1961_FACSIMILES.length!==12||unique.size!==14||
   [...pageSpanById.values()].filter(x=>x.length===2).length!==4)
 throw Error("FACSIMILE_FIRST12_FOURTEEN_PRINTED_PAGES_REQUIRED");
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
 const span=pageSpanById.get(s.scoreId);
 const images=span.map(x=>byImage.get(x.imageUrl));
 const capturedSpan=images.every(x=>x?.pngSha256!=null);
 return {
  scoreId:s.scoreId,part:s.part,original1961Page:s.folio,
  originalPrintedFolios:span.map(x=>x.page),
  originalPrintedPageImageUrls:span.map(x=>x.imageUrl),
  capturedOriginalPageHashes:images.map(x=>x?.pngSha256??null),
  gregobaseSourceUrl:s.sourceUrl,original1961ScanUrl:s.scanned1961PageUrl,
  capturedOriginalImageSha256:images[0]?.pngSha256??null,
  originalScanStatus:capturedSpan?
   "COMPLETE_ORIGINAL_PRINT_SPAN_CAPTURED_NOT_MUSICALLY_VERIFIED":
   "PRINTED_SOURCE_SPAN_INCOMPLETE_REVIEW_HOLD",
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
 counts:{priorityScores:12,distinctPrintedPages:14,continuationScoreCount:4,
  downloadedOriginalPageImages:captured,pageImageAccessHolds:14-captured,
  completeSourceSpanScores:scores.filter(x=>x.originalScanStatus.startsWith("COMPLETE_")).length,
  musicallyCollatedScores:0,approvedPublicScores:0},
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
