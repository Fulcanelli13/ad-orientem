/**
 * Research-only current Walters online collection verification for 42 selected
 * sources. URL identity alone is not enough: verify HTML H1 and on-page
 * accession label, preserve old editorial decisions, never fetch images.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const sourcePath="data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json";
const output="data/calendar/sacred-art-phase1-walters-42-current-page-report-20261030.v1.json";
const base=JSON.parse(readFileSync(sourcePath,"utf8"));
const selected=base.rows.filter(r=>r.museum==="walters");
if(selected.length!==42||selected.filter(r=>r.userDecision==="IMPORT_WITH_CORRECTIONS").length!==2)throw Error("Frozen source set unexpectedly changed");
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const sha=x=>createHash("sha256").update(x).digest("hex");
const entities=s=>String(s||"").replace(/&#(?:x([0-9a-f]+)|(\d+));?/gi,(_,h,d)=>String.fromCodePoint(parseInt(h||d,h?16:10)))
 .replace(/&(?:amp|nbsp|quot|apos|lt|gt|rsquo|lsquo|ndash|mdash|eacute|Eacute);/gi,m=>({
  "&amp;":"&","&nbsp;":" ","&quot;":'"',"&apos;":"'","&lt;":"<","&gt;":">",
  "&rsquo;":"’","&lsquo;":"‘","&ndash;":"–","&mdash;":"—","&eacute;":"é"}[m.toLowerCase()]||m));
const clear=s=>entities(String(s||"").replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const escapeRegex=s=>s.replace(/[.*+?^$()|[\]{}\\]/g,"\\$&");
async function inspect(row){
 const id=row.sourceAccession,requested="https://art.thewalters.org/object/"+encodeURIComponent(id)+"/";let reason="NO_RESPONSE";
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const res=await fetch(requested,{redirect:"follow",signal:AbortSignal.timeout(25000),
    headers:{"User-Agent":"AdOrientem-Catalogue-Source-Verification/1.0","Accept":"text/html"}});
   if(!res.ok){reason="HTTP_"+res.status;if([429,500,502,503,504].includes(res.status)){await sleep(650*attempt);continue;}break;}
   const ct=res.headers.get("content-type")||"";
   if(!ct.includes("html")){reason="NOT_HTML_"+ct;break;}
   const html=await res.text();
   const h1=clear((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]);
   const title=clear((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]);
   const main=clear(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," "));
   const numberFound=new RegExp("Accession\\s+Number\\b[\\s\\S]{0,330}?\\b"+escapeRegex(id)+"(?![\\w.])","i").test(main);
   const titleMatched=norm(h1)===norm(row.title);
   const officialHost=/^https:\/\/art\.thewalters\.org\/object\/[^/]+\/?/.test(res.url);
   const status=numberFound&&titleMatched&&officialHost?"OFFICIAL_PAGE_TITLE_AND_ACCESSION_CONFIRMED":"OFFICIAL_PAGE_REVIEW_NEEDED";
   return {sourceId:row.sourceId,frozenDecision:row.userDecision,batch:row.batch,
    sourceTitle:row.title,sourceArtist:row.artistAsReviewed,sourceAccession:id,
    originalSourceUrl:row.sourceObjectUrl,requestUrl:requested,returnedUrl:res.url,
    httpStatus:res.status,pageSha256:sha(html),status,
    evidence:{titleH1:h1,htmlTitle:title,officialHost,titleNormalizedMatched:titleMatched,accessionLabelAndNumberMatched:numberFound},
    flags:[...(!numberFound?["ACCESSION_NOT_PRESENT_AS_LABEL"]:[]),
     ...(!titleMatched?["TITLE_VARIANT_OR_EXTRACTION_REVIEW"]:[]),
     ...(!officialHost?["WRONG_HOST"]:[])],
    distinctPhysicalWorkCertified:false,sourcePhotoRightsCertified:false,originalPhotoVisuallyInspected:false,
    canonical383IdentityLinked:false,originalDecisionPreserved:true,productionMutation:false};
  }catch(e){reason=String(e).slice(0,220);await sleep(800*attempt);}
 }
 return {sourceId:row.sourceId,frozenDecision:row.userDecision,batch:row.batch,
   sourceTitle:row.title,sourceArtist:row.artistAsReviewed,sourceAccession:id,
   originalSourceUrl:row.sourceObjectUrl,requestUrl:requested,returnedUrl:null,status:"PAGE_FETCH_FAILED",
   reason,evidence:{officialHost:false,titleNormalizedMatched:false,accessionLabelAndNumberMatched:false},
   flags:["PAGE_RETRY_REQUIRED"],distinctPhysicalWorkCertified:false,sourcePhotoRightsCertified:false,
   originalPhotoVisuallyInspected:false,canonical383IdentityLinked:false,originalDecisionPreserved:true,
   productionMutation:false};
}
const rows=[];
for(let n=0;n<selected.length;n+=4){
 rows.push(...await Promise.all(selected.slice(n,n+4).map(inspect)));
 console.log("Walters page",Math.min(n+4,selected.length),"/",selected.length,"confirmed",
  rows.filter(r=>r.status==="OFFICIAL_PAGE_TITLE_AND_ACCESSION_CONFIRMED").length);
 await sleep(400);
}
rows.sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
const counts={frozenAcceptedCards:42,officialTitleAndAccessionConfirmed:rows.filter(r=>r.status==="OFFICIAL_PAGE_TITLE_AND_ACCESSION_CONFIRMED").length,
 officialPagesNeedsReview:rows.filter(r=>r.status==="OFFICIAL_PAGE_REVIEW_NEEDED").length,
 sourcePageFetchFailed:rows.filter(r=>r.status==="PAGE_FETCH_FAILED").length,
 originalConditionalDecisions:rows.filter(r=>r.frozenDecision==="IMPORT_WITH_CORRECTIONS").length,
 canonical383NewLinks:0,newPhysicalPaintingCountCertified:0,photoRightsCertified:0,productionImports:0};
if(rows.length!==42||counts.originalConditionalDecisions!==2||
 counts.officialTitleAndAccessionConfirmed+counts.officialPagesNeedsReview+counts.sourcePageFetchFailed!==42)
 throw Error("Walters 42 invariant");
const report={schema:"AO_WALTERS_42_CURRENT_OFFICIAL_PAGES_V1",generatedAt:new Date().toISOString(),
 museumAuthority:"The Walters Art Museum",sourceFrozen:sourcePath,sourceFrozenSha256:sha(readFileSync(sourcePath)),
 origin:"https://art.thewalters.org/object/",method:"Exact current official object webpage, extracted H1 and accession label, no photos",
 counts,caveats:["Current official page confirms title/accession identity, not original legacy numeric CSV ID",
 "Official page alone is not evidence of a unique physical painting: parent panels/altarpieces need grouping",
 "Photographic rights, original image pixels, frames and colour have not been examined",
 "Original reviewed user decisions and canonical artwork master are not modified"],
 release:{userDecisionsChanged:false,canonical383Changed:false,imagesCleared:false,productionMutation:false},rows};
writeFileSync(output,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({output,counts},null,2));
