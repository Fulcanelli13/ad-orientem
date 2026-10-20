#!/usr/bin/env node
/**
 * Sacred Art: first-five exact-source acquisition. Stages download evidence;
 * never edits the Calendar, approved asset tree, or certified-media registry.
 * Run: node tools/calendar/acquire-sacred-art-first-five.mjs
 */
import assert from "node:assert/strict";
import {hasPradoProvenance,commonsMetadataHasPradoProvenance,PRADO_SOURCE_HOLD} from "./sacred-art-source-policy.mjs";
import {readFileSync} from "node:fs";
import {mkdir,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join} from "node:path";

const ROOT = new URL("../../", import.meta.url);
const read = p => JSON.parse(readFileSync(new URL(p,ROOT), "utf8"));
const freeze = read("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const batch = read("data/research/sacred-art-first-five-master-acquisition-20261017.v1.json");
const certified = read("data/calendar/sacred-art-certified-media.v1.json");
const approved = new Set(freeze.approved.map(x => x.artworkId));
const rejected = new Set(freeze.rejected.map(x => x.artworkId));
const outputDir = join(process.cwd(),"artifacts","sacred-art-first-five");

function jpegDimensions(bytes) {
  if(bytes[0]!==0xff || bytes[1]!==0xd8 || bytes[2]!==0xff) throw Error("Not JPEG data");
  let at=2;
  while(at+9<bytes.length) {
    if(bytes[at]!==0xff){at++;continue;}
    while(bytes[at]===0xff)at++;
    const marker=bytes[at++];
    if(marker===0xd9 || marker===0xda)break;
    if((marker>=0xd0&&marker<=0xd7)||marker===0x01)continue;
    if(at+2>bytes.length)break;
    const size=bytes.readUInt16BE(at);
    if(size<2||at+size>bytes.length)throw Error("Malformed JPEG segment");
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      if(size<7)throw Error("Malformed JPEG size marker");
      return {height:bytes.readUInt16BE(at+3),width:bytes.readUInt16BE(at+5)};
    }
    at+=size;
  }
  throw Error("Cannot determine original JPEG dimensions");
}
const allowedImageUrl = input => {
  const u = new URL(input);
  return u.protocol==="https:" && (u.hostname==="images.metmuseum.org"||u.hostname==="collectionapi.metmuseum.org");
};
async function request(url) {
  const result=await fetch(url,{signal:AbortSignal.timeout(45000),headers:{"user-agent":"AdOrientemSacredArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"}});
  if(!result.ok)throw Error("HTTP "+result.status+" for "+url);
  return result;
}
const esc = s => String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
async function acquireMet(work) {
  const apiUrl="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+work.museumObjectId;
  const response=await request(apiUrl);
  const meta=await response.json();
  assert.equal(meta.objectID,work.museumObjectId,"Incorrect physical museum object ID");
  assert.equal(meta.accessionNumber,work.accession,"Incorrect accession number");
  assert.equal(meta.isPublicDomain,true,"Met API does not classify this object as public domain");
  assert(/Philippe de Champaigne/i.test(meta.artistDisplayName||""),"Artist identity mismatch");
  assert(/Annunciation/i.test(meta.title||""),"Subject identity mismatch");
  assert(typeof meta.primaryImage==="string"&&allowedImageUrl(meta.primaryImage),"No permitted original Met image endpoint");
  const imgResponse=await request(meta.primaryImage);
  assert(allowedImageUrl(imgResponse.url),"Image redirect changed to unapproved host");
  assert(/image\/jpeg/i.test(imgResponse.headers.get("content-type")||""),"Expected original JPEG");
  const data=Buffer.from(await imgResponse.arrayBuffer());
  assert(data.length>100000 && data.length<30000000,"Downloaded bytes outside expected bounds");
  const dimensions=jpegDimensions(data);
  assert(dimensions.width>=2000 && dimensions.height>=2000,"Master resolution insufficient");
  const hash=createHash("sha256").update(data).digest("hex");
  // The curator selected the underlying source original in the review export;
  // a different crop or reproduction is NOT an interchangeable replacement.
  const preferredReviewImageKey=freeze.approved.find(x=>x.artworkId===work.artworkId)?.preferredImageKey;
  const reviewedSourceSha=preferredReviewImageKey?.split("|")[2];
  assert(/^[a-f0-9]{64}$/.test(reviewedSourceSha||""),"No source fingerprint in curator-selected image key");
  assert.equal(hash,reviewedSourceSha,"Open-access download differs from the curator-reviewed source original");
  const basename="met-438724-champaigne-annunciation-original.jpg";
  await writeFile(join(outputDir,basename),data,{flag:"w"});
  const review={
    schema:"AO_SACRED_ART_STAGED_MET_SOURCE_V1",
    artworkId:work.artworkId,
    approvedPhysicalOriginal:true,
    userRating:freeze.approved.find(x=>x.artworkId===work.artworkId)?.score??null,
    preferredReviewImageKey,
    sourceShaMatchesCuratorSelectedImage:true,
    original:{museum:"The Metropolitan Museum of Art",accession:meta.accessionNumber,objectId:meta.objectID,title:meta.title,artist:meta.artistDisplayName,medium:meta.medium},
    technicalFile:{name:basename,sha256:hash,bytes:data.length,...dimensions,downloadedFrom:meta.primaryImage},
    source:{objectUrl:work.sourceObjectUrl,metadataUrl:apiUrl,publicDomainFlagFromMuseumApi:true,
      rightsEvidenceUrl:"https://www.metmuseum.org/art/collection/search/438724",
      rightsPolicyUrl:"https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
      attribution:"Philippe de Champaigne, The Annunciation, ca. 1644; The Metropolitan Museum of Art, 2004.31 (Open Access)"
    },
    researchPlacement:{date:work.researchDate,subject:work.subject,feast:work.feast},
    rightsSourceIdentified:true,
    selectionState:"STAGED_FOR_INDEPENDENT_IMAGE_AND_PHONE_QA",
    requiresPhotoMatchToPreferredReviewImage:false,
    actual1962ProperAndGospelVerified:false,
    cropAndFrameFreeVerified:false,
    independentPhoneVisualQaVerified:false,
    canonicalReleaseRecordCreated:false,
    certifiedForProduction:false
  };
  await writeFile(join(outputDir,"met-438724-source-evidence.json"),JSON.stringify(review,null,2)+"\n");
  const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sacred Art · Met 438724 technical preview</title><style>body{background:#090d13;color:#eee8dc;font:16px Georgia,serif;margin:0;padding:18px}main{max-width:850px;margin:auto}.frame{max-width:600px;margin:18px auto}img{display:block;width:100%;height:auto;object-fit:contain}small{color:#b8ae9c}h1{font-size:1.5rem}p{line-height:1.5}</style><main><small>AD ORIENTEM · TECHNICAL SOURCE REVIEW · NOT A LIVE CALENDAR ASSET</small><h1>'+esc(meta.title)+'</h1><div class="frame"><img src="'+esc(basename)+'" alt="'+esc(meta.title)+'"></div><p>'+esc(meta.artistDisplayName)+' · The Metropolitan Museum of Art · '+esc(meta.accessionNumber)+'</p><p>Original size '+dimensions.width+' × '+dimensions.height+' px. Examine crop, frame, color, details, and actual phone display before certification.</p><small>File SHA-256: '+hash+' · Source: '+esc(meta.primaryImage)+'</small></main></html>';
  await writeFile(join(outputDir,"met-438724-phone-review.html"),html);
  return {artworkId:work.artworkId,stage:"STAGED_NOT_PUBLISHED",sha256:hash,...dimensions,bytes:data.length};
}

async function acquireCommons(work) {
  const api=new URL("https://commons.wikimedia.org/w/api.php");
  const params={action:"query",format:"json",formatversion:"2",prop:"imageinfo",titles:work.commonsTitle,iiprop:"url|size|sha1|mime|extmetadata"};
  for(const [k,v] of Object.entries(params))api.searchParams.set(k,v);
  const response=await request(api.toString());
  const payload=await response.json();
  const page=payload?.query?.pages?.[0];
  assert(page && page.missing!==true,"No exact Commons file page");
  assert.equal(page.title.replaceAll("_"," "),work.commonsTitle.replaceAll("_"," "),"Commons title normalization mismatch");
  const info=page.imageinfo?.[0];
  assert(!commonsMetadataHasPradoProvenance(info?.extmetadata),PRADO_SOURCE_HOLD+": metadata confirms Prado reproduction");
  assert(info && info.mime==="image/jpeg","Commons source is not an original JPEG");
  const license=String(info.extmetadata?.LicenseShortName?.value||"");
  const copyright=String(info.extmetadata?.Copyrighted?.value||"");
  assert(/public.domain/i.test(license),"Commons file has no public-domain license declaration");
  assert(!copyright || /^false$/i.test(copyright.replace(/<[^>]+>/g,"").trim()),"Commons claims file is copyrighted");
  assert(info.width>=2000 && info.height>=2000,"Commons original lacks premium image resolution");
  assert(info.url && new URL(info.url).protocol==="https:" && new URL(info.url).hostname==="upload.wikimedia.org",
    "Commons did not return an approved media host");
  const imgResponse=await request(info.url);
  assert(new URL(imgResponse.url).hostname==="upload.wikimedia.org","Commons image redirected away from media host");
  assert(/image\/jpeg/i.test(imgResponse.headers.get("content-type")||""),"Commons original is not JPEG bytes");
  const data=Buffer.from(await imgResponse.arrayBuffer());
  assert(data.length>100000 && data.length<30000000,"Commons master bytes outside allowed bounds");
  const dimensions=jpegDimensions(data);
  assert.equal(dimensions.width,info.width,"Commons pixel width changed");
  assert.equal(dimensions.height,info.height,"Commons pixel height changed");
  const sha1=createHash("sha1").update(data).digest("hex");
  if(/^[0-9a-f]{40}$/.test(info.sha1||""))assert.equal(sha1,info.sha1,"Commons source SHA-1 mismatch");
  const sha256=createHash("sha256").update(data).digest("hex");
  const basename=work.artworkId==="ART-eter-aul-ubens-doration-of-the-agi"
    ? "commons-rubens-prado-adoration-original.jpg":"commons-wolffort-ascension-original.jpg";
  const preferredReviewImageKey=freeze.approved.find(x=>x.artworkId===work.artworkId)?.preferredImageKey??null;
  const preferredSha=preferredReviewImageKey?.split("|")[2];
  const matchedPreferred=Boolean(preferredSha&&sha256===preferredSha);
  await writeFile(join(outputDir,basename),data);
  const evidence={
    schema:"AO_SACRED_ART_STAGED_COMMONS_SOURCE_V1",
    artworkId:work.artworkId,approvedPhysicalOriginal:true,
    original:{title:work.title,artist:work.artist,collectionSource:work.sourceObjectUrl,accession:work.verifiedMuseumAccession},
    preferredReviewImageKey,sourceShaMatchesCuratorSelectedImage:matchedPreferred,
    technicalFile:{name:basename,sha256,sha1,bytes:data.length,...dimensions,downloadedFrom:info.url},
    publishedSource:{filePage:work.filePageUrl,apiUrl:api.toString(),licenseDeclaration:license,
      rightsEvidenceUrl:work.filePageUrl,rightsLayer:"PD-Art historical reproduction declaration from Commons; jurisdiction review still required"},
    researchPlacement:{date:work.researchDate,subject:work.subject,feast:work.feast},
    selectionState:"STAGED_FOR_INDEPENDENT_OBJECT_AND_PHONE_QA",
    identityEvidenceNeedsFinalReview:true,
    rightsJurisdictionCheckComplete:false,
    curatorPreferredImageMatchNeedsReview:!matchedPreferred,
    cropAndFrameFreeVerified:false,independentPhoneVisualQaVerified:false,
    actual1962ProperAndGospelVerified:false,certifiedForProduction:false
  };
  const stem=basename.replace(/\.jpg$/,"");
  await writeFile(join(outputDir,stem+"-source-evidence.json"),JSON.stringify(evidence,null,2)+"\n");
  const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ad Orientem · Technical visual check</title><style>body{background:#090d13;color:#ede6d9;font:16px Georgia,serif;margin:0;padding:16px}main{max-width:900px;margin:auto}img{display:block;max-width:100%;max-height:85vh;margin:auto}p{line-height:1.5}small{color:#aaa092}</style><main><small>TECHNICAL SOURCE PREVIEW · NOT RELEASED</small><h1>'+esc(work.title)+'</h1><img src="'+esc(basename)+'" alt="'+esc(work.title)+'"><p>'+esc(work.artist)+' · '+esc(work.feast)+' · '+dimensions.width+' × '+dimensions.height+' px</p><p>Verify physical original, file crop, color, sharpness, phone view and jurisdictional reuse before production.</p><small>SHA-256 '+sha256+'</small></main></html>';
  await writeFile(join(outputDir,stem+"-phone-review.html"),html);
  return {artworkId:work.artworkId,stage:"STAGED_NOT_PUBLISHED",sha256,...dimensions,bytes:data.length};
}

async function main() {
  assert.equal(batch.works.length,5);
  assert.equal(certified.mediaReleaseCount,0);
  assert.deepEqual(certified.media,[]);
  const seen=new Set();
  for(const work of batch.works) {
    assert(!seen.has(work.artworkId),"Duplicate artwork");
    seen.add(work.artworkId);
    assert(approved.has(work.artworkId)&&!rejected.has(work.artworkId),"Artwork not definitively approved: "+work.artworkId);
  }
  await mkdir(outputDir,{recursive:true});
  const statuses=[];
  for(const work of batch.works) {
    if(work.sourcePolicy?.status===PRADO_SOURCE_HOLD||hasPradoProvenance(work)){
      statuses.push({artworkId:work.artworkId,stage:"HOLD",reason:PRADO_SOURCE_HOLD});
      continue;
    }
    if(work.provider==="MET_OPEN_ACCESS")statuses.push(await acquireMet(work));
    else if(work.provider==="WIKIMEDIA_COMMONS_PD_ART")statuses.push(await acquireCommons(work));
    else statuses.push({artworkId:work.artworkId,stage:"HOLD",reason:work.note});
  }
  await writeFile(join(outputDir,"first-five-status.json"),JSON.stringify({asOf:batch.asOf,results:statuses,certifiedForProduction:0},null,2)+"\n");
  console.log(JSON.stringify({acquired:statuses.filter(x=>x.stage==="STAGED_NOT_PUBLISHED").length,held:statuses.filter(x=>x.stage==="HOLD").length,productionReleaseCount:0,statuses},null,2));
}
await main();
