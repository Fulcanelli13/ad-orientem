// P4 public-domain source-original acquisition only.
// The asset is NOT a reader icon. Do not treat a historical scene as a
// source for exact 1962 actions until visual and ceremonial review passes.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {dirname,resolve} from "node:path";
const registry=JSON.parse(await readFile(new URL("../data/presentation/mass-priest-gesture-original-source-p4.v1.json",import.meta.url),"utf8"));
if(registry.schema!=="ao-mass-priest-gesture-original-source-p4-v1"||
   registry.releaseClass!=="RESEARCH_ONLY_NO_ICON_OR_RUBRIC_PROMOTION"||
   registry.policy.noArtInstalled!==true||
   registry.original.id!=="LECLERC1661_PLATE19")
 throw Error("Nonresearch source original requested");
const source=registry.original;
if(source.license!=="CC0_1_0"||source.museumRights!=="PUBLIC_DOMAIN"||
 source.exactLiturgicalGestureVerified!==false||source.iconReleaseEligible!==false||
 source.userArtworkApproval!=="PENDING"||source.palmGeometryInspected!==false)
 throw Error("CC0 rights or source-only release gate failed");
if(!source.sourcePageUrl.startsWith("https://commons.wikimedia.org/wiki/File:")||
 !source.sourceImageUrl.startsWith("https://upload.wikimedia.org/wikipedia/commons/8/82/")||
 source.expectedSHA1!=="9e7ec93ae7b947f9b540686340978287da5846a8")
 throw Error("Unexpected source media origin or Commons checksum");
const jpg=(bytes)=>{
 if(bytes.readUInt16BE(0)!==0xffd8)throw Error("Missing JPEG SOI");
 let offset=2;
 while(offset<bytes.length-12){
  if(bytes[offset++]!==0xff)continue;
  while(bytes[offset]===0xff)offset++;
  const marker=bytes[offset++];
  if(marker===0xd9||marker===0xda)break;
  if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
  const length=bytes.readUInt16BE(offset);
  if(length<2||offset+length>bytes.length)throw Error("Bad JPEG segment");
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))
   return {width:bytes.readUInt16BE(offset+5),height:bytes.readUInt16BE(offset+3)};
  offset+=length;
 }
 throw Error("JPEG source dimensions missing");
};
const response=await fetch(source.sourceImageUrl,{
 redirect:"error",
 headers:{"User-Agent":"AdOrientem/1.0 (open-source research; github.com/Fulcanelli13/ad-orientem)","Accept":"image/jpeg"},
 signal:AbortSignal.timeout(45000)
});
if(!response.ok)throw Error("Commons original fetch HTTP "+response.status);
if(!/^image\/jpeg\b/i.test(response.headers.get("content-type")??""))throw Error("Unexpected image MIME");
const bytes=Buffer.from(await response.arrayBuffer());
if(bytes.length!==source.expectedBytes)throw Error("Different Commons image byte count "+bytes.length);
const sha1=createHash("sha1").update(bytes).digest("hex");
const sha256=createHash("sha256").update(bytes).digest("hex");
if(sha1!==source.expectedSHA1)throw Error("Original JPEG SHA1 disagrees with Wikimedia structured checksum");
const dimensions=jpg(bytes);
if(dimensions.width!==source.expectedWidth||dimensions.height!==source.expectedHeight)
 throw Error("Unexpected original pixel dimensions "+JSON.stringify(dimensions));
for(const target of registry.targets){
 if(target.status==="APPROVED"||target.sourceCandidateId!==null&&target.cueId!=="AO.SM.C0161")
  throw Error("Research-only target falsely claims exact art release");
}
const dest=resolve(source.filePath);
const proof=resolve(source.proofPath);
if(!dest.startsWith(resolve("assets/references/mass-icon-originals/"))||
 !proof.startsWith(resolve("data/presentation/")))throw Error("Unsafe source destination");
await mkdir(dirname(dest),{recursive:true});
await writeFile(dest,bytes,{flag:"wx",mode:0o644});
const manifest={
 schema:"ao-mass-gesture-plate19-original-integrity-v1",
 status:"CC0_ORIGINAL_BYTES_VERIFIED_RESEARCH_ONLY",
 sourceId:source.id,license:source.license,
 imagePath:source.filePath,sourcePageUrl:source.sourcePageUrl,
 sourceImageUrl:source.sourceImageUrl,
 licenseEvidenceUrl:source.licenseEvidenceUrl,
 museumObjectUri:source.holdingInstitutionObjectUri,
 sha1,sha256,bytes:bytes.length,width:dimensions.width,height:dimensions.height,
 imageVisuallyInspectedForExact1962Pose:false,
 independent1962RubricMatch:false,
 iconApproved:false,assetPromoted:false,
 note:"A verified public-domain 1661 scan, not a 1962 gesture proof. Review hands, Host and chalice before tracing any design."
};
await writeFile(proof,JSON.stringify(manifest,null,2)+"\n",{flag:"wx"});
console.log("PASS P4 CC0 research original",JSON.stringify({sha1,sha256,bytes:bytes.length,dimensions,publicAsset:false}));
