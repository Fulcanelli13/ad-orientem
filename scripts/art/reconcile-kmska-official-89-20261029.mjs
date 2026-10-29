/**
 * Zero-cost research-only official KMSKA collection-source verifier.
 * Fetches 89 existing /nl/meesterwerk/<inventory> pages; no artwork images.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const path="data/calendar/sacred-art-phase1-kmska-89-official-identity-queue-20261029.v1.json";
const q=JSON.parse(readFileSync(path,"utf8"));
if(q.rows.length!==89||q.counts.conditional!==33)throw Error("Frozen KMSKA source scope drift");
const resultPath="data/calendar/sacred-art-phase1-kmska-89-official-inventory-report-20261029.v1.json";
const hash=v=>createHash("sha256").update(v).digest("hex");
const decode=s=>String(s||"").replace(/&#(?:x([0-9a-f]+)|(\d+));?/gi,(_,h,d)=>String.fromCodePoint(parseInt(h||d,h?16:10)))
 .replace(/&(?:amp|nbsp|quot|apos|lt|gt|rsquo|ndash|mdash);/gi,e=>({"&amp;":"&","&nbsp;":" ","&quot;":'"',"&apos;":"'","&lt;":"<","&gt;":">","&rsquo;":"’","&ndash;":"–","&mdash;":"—"}[e.toLowerCase()]||e));
const textOf=s=>decode(String(s||"").replace(/<[^>]*>/g," ")).replace(/\s+/g," ").trim();
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 .replace(/^(schilder:|painter:)\s*/,"").replace(/[’]/g,"'").replace(/[^a-z0-9]/g,"");
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
async function inspect(r) {
 const acc=r.inventoryNumberExactString,originalUrl="https://kmska.be/nl/meesterwerk/"+encodeURIComponent(acc);
 let error="FETCH_NOT_ATTEMPTED";
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const res=await fetch(originalUrl,{redirect:"follow",signal:AbortSignal.timeout(16000),
    headers:{"User-Agent":"AdOrientem-Research-ObjectIdentity/1.0","Accept":"text/html"}});
   const ct=res.headers.get("content-type")||"";
   if(!res.ok||!ct.includes("text/html")){
    error="HTTP_"+res.status+"_"+ct;
    if(res.status===429||res.status>=500){await sleep(700*attempt);continue}
    break;
   }
   const html=await res.text();
   const stripped=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ");
   const body=textOf(stripped),h1=textOf((stripped.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]),
    title=textOf((stripped.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]);
   const escaped=acc.replace(/[^\w]/g,"\\$&");
   const accessionMatch=new RegExp("(?:Inventaris\\s*nummer|Inventory\\s*number)\\s*:?\\s*"+escaped+"(?![\\w./-])","i").test(body);
   const titleMatch=norm(h1||title)===norm(r.originalReviewedTitle);
   const artistMatch=norm(body).includes(norm(r.originalReviewedArtist));
   const officialHost=/^https:\/\/(?:www\.)?kmska\.be\/nl\/meesterwerk\/[^/?#]+/.test(res.url);
   return {sourceId:r.sourceId,accession:acc,batch:r.batch,userChoice:r.originalUserDecision,
    reviewedTitle:r.originalReviewedTitle,reviewedArtist:r.originalReviewedArtist,legacyId:r.legacyKmskaId,
    requestedUrl:originalUrl,finalOfficialUrl:res.url,
    status:accessionMatch&&titleMatch&&officialHost?"EXACT_OFFICIAL_INVENTORY_AND_TITLE":"PAGE_FOUND_NEEDS_REVIEW",
    evidence:{status:res.status,officialHost,contentSha256:hash(html),officialH1:h1,officialTitleTag:title,
     inventoryTextMatches:accessionMatch,titleMatches:titleMatch,artistMentioned:artistMatch},
    flags:[...(!accessionMatch?["INVENTORY_NOT_PROVEN"]:[]),...(!titleMatch?["TITLE_DIFFERS"]:[]),
     ...(!artistMatch?["ARTIST_METADATA_REVIEW"]:[]),...(!officialHost?["HOST_NOT_OFFICIAL"]:[])],
    canonical383Match:false,uniquePhysicalWorkCertified:false,photoRightsCertified:false,
    photoVisualCertified:false,productionMutation:false};
  }catch(e){error=String(e).slice(0,170);await sleep(550*attempt);}
 }
 return {sourceId:r.sourceId,accession:acc,batch:r.batch,userChoice:r.originalUserDecision,
 reviewedTitle:r.originalReviewedTitle,reviewedArtist:r.originalReviewedArtist,legacyId:r.legacyKmskaId,
 requestedUrl:originalUrl,finalOfficialUrl:null,status:"OFFICIAL_FETCH_FAILED",
 evidence:{error},flags:["NEEDS_SOURCE_RETRY"],canonical383Match:false,
 uniquePhysicalWorkCertified:false,photoRightsCertified:false,photoVisualCertified:false,productionMutation:false};
}
const rows=[];
for(let i=0;i<q.rows.length;i+=4){
 const part=await Promise.all(q.rows.slice(i,i+4).map(inspect));rows.push(...part);
 console.log("KMSKA",Math.min(i+4,89),"/89",
  "exact",rows.filter(x=>x.status==="EXACT_OFFICIAL_INVENTORY_AND_TITLE").length);
 await sleep(320);
}
rows.sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
const counts={sourceCards:rows.length,verifiedExact:rows.filter(x=>x.status==="EXACT_OFFICIAL_INVENTORY_AND_TITLE").length,
 resolvedNeedsReview:rows.filter(x=>x.status==="PAGE_FOUND_NEEDS_REVIEW").length,
 fetchFailures:rows.filter(x=>x.status==="OFFICIAL_FETCH_FAILED").length,
 authorMetadataLeads:rows.filter(x=>x.flags.includes("ARTIST_METADATA_REVIEW")).length,
 originalConditionalDecisionsPreserved:rows.filter(x=>x.userChoice==="IMPORT_WITH_CORRECTIONS").length,
 newCanonical383Links:0,certifiedNewPaintings:0,certifiedImages:0,productionImports:0};
if(counts.sourceCards!==89||counts.originalConditionalDecisionsPreserved!==33||
  counts.verifiedExact+counts.resolvedNeedsReview+counts.fetchFailures!==89)throw Error("KMSKA counts invalid "+JSON.stringify(counts));
const result={schema:"AO_SACRED_ART_KMSKA_89_INSTITUTIONAL_HTML_INVENTORY_EVIDENCE_V1",
 generatedAt:new Date().toISOString(),officialSource:"https://kmska.be/nl/meesterwerk/",
 sourceQueue:path,sourceQueueSha256:hash(readFileSync(path)),counts,
 method:"Read-only official response; accepted only when final museum-host page, normalized title and explicit on-page inventory number all match; no image downloads",
 caveats:["Live official page title/inventory verifies record identity but not exact image nor physical uniqueness",
 "Artist differences trigger manual metadata review; no title/artist deduplication",
 "Parent altarpieces and recto/verso images must not inflate artwork counts",
 "HTML SHA256 fingerprints saved, source HTML and image files not archived"],
 gates:{originalChoicesModified:false,canonicalMaster383Mutated:false,photoRightsApproved:false,
 imagesVisuallyInspected:false,productionMutation:false},rows};
writeFileSync(resultPath,JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({resultPath,counts},null,2));
