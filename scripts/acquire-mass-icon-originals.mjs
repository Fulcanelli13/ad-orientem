// P3 SOURCE RESEARCH ONLY. Never installs an icon in the LIVE reader.
// Node 22: downloads rights-cleared original source to a temporary CI artifact.
// A named user's artwork approval, exact 1962 rite check, and approved-family
// comparison are REQUIRED separately before any UI icon is constructed.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";

const manifest=JSON.parse(await readFile(new URL("../data/presentation/mass-icon-source-acquisition-p3.v1.json",import.meta.url),"utf8"));
if(manifest.schema!=="ao-mass-source-acquisition-v1")throw new Error("wrong source-acquisition registry");
if(manifest.originals?.length!==1)throw new Error("Only reviewed CC0 acquisition may run in P3");
const dest=resolve("artifacts/mass-original-research");
await mkdir(dest,{recursive:true});

function jpegDimensions(bytes){
 if(bytes[0]!==0xff||bytes[1]!==0xd8)throw new Error("not JPEG SOI");
 let i=2;
 while(i<bytes.length-10){
   if(bytes[i++]!==0xff)continue;
   while(bytes[i]===0xff)i++;
   const marker=bytes[i++];
   if(marker===0xd9||marker===0xda)break;
   if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
   const len=(bytes[i]<<8)+bytes[i+1];
   if(len<2||i+len>bytes.length)throw new Error("bad JPEG marker segment");
   if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
     return {height:(bytes[i+3]<<8)+bytes[i+4],width:(bytes[i+5]<<8)+bytes[i+6]};
   }
   i+=len;
 }
 throw new Error("JPEG image dimensions unavailable");
}

for(const entry of manifest.originals){
 if(entry.rights!=="CC0_1_0"||entry.approvedForGeneration!==false||entry.approvedForRuntime!==false)
   throw new Error("source entry not research-only and CC0");
 if(!entry.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:")||
    !entry.sourceFileURL.startsWith("https://upload.wikimedia.org/wikipedia/commons/"))
   throw new Error("untrusted source host");
 if(!/^[A-Za-z0-9_.-]+\.jpg$/.test(entry.imageFilename))
   throw new Error("unsafe output filename");
 const u=new URL(entry.sourceFileURL);
 if(u.username||u.password||u.port||u.protocol!=="https:")
   throw new Error("unsafe original image URL");
 const response=await fetch(u,{redirect:"error",headers:{"User-Agent":"AdOrientem/1.0 (noncommercial scholarly provenance capture; github.com/Fulcanelli13/ad-orientem)","Accept":"image/jpeg"},signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error("original download HTTP "+response.status);
 const type=(response.headers.get("content-type")||"").toLowerCase();
 if(!type.includes("image/jpeg")&&!type.includes("image/jpg"))throw new Error("not a JPEG response: "+type);
 const len=Number(response.headers.get("content-length")||0);
 if(len && (len<entry.minimumBytes||len>entry.maximumBytes))
   throw new Error("unexpected HTTP image length: "+len);
 const data=Buffer.from(await response.arrayBuffer());
 if(data.length<entry.minimumBytes||data.length>entry.maximumBytes)
   throw new Error("unexpected image file size: "+data.length);
 const dimensions=jpegDimensions(data);
 if(dimensions.width!==entry.expectedWidth||dimensions.height!==entry.expectedHeight)
   throw new Error("wrong source image dimensions "+JSON.stringify(dimensions));
 const sha256=createHash("sha256").update(data).digest("hex");
 const sha1=createHash("sha1").update(data).digest("hex");
 const imagePath=resolve(dest,entry.imageFilename);
 await writeFile(imagePath,data,{flag:"wx",mode:0o644});
 const evidence={
   id:entry.id,title:entry.title,artist:entry.artist,year:entry.year,
   sourcePage:entry.sourcePage,originalFileURL:entry.sourceFileURL,
   museumRecord:entry.institutionURL,holdingInstitution:entry.holdingInstitution,
   rights:entry.rights,rightsEvidence:entry.rightsEvidence,
   sourceSHA256:sha256,sourceSHA1:sha1,sizeBytes:data.length,
   width:dimensions.width,height:dimensions.height,
   imageFile:entry.imageFilename,acquiredAt:new Date().toISOString(),
   imageVisuallyAccurateForSpecific1962HostAction:false,
   imageVisuallyAccurateForSpecific1962ChaliceAction:false,
   iconFamilyReviewed:false,userApproved:false,runtimeEligible:false,
   note:"Binary evidence for source provenance only; visual liturgical gestures and art style still require independent review."
 };
 await writeFile(resolve(dest,entry.id+".json"),JSON.stringify(evidence,null,2)+"\n",{flag:"wx"});
 console.log("P3 CC0 original VERIFIED:",entry.id,"SHA256",sha256,"bytes",data.length,"px",dimensions.width+"x"+dimensions.height);
}
// No copyrighted licensingResearch image is downloaded by this script.
