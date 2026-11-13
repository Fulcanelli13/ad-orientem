#!/usr/bin/env node
/**
 * Commons *metadata-only* discovery for the 76 approved-source recovery records.
 * Two 50/26 record shards, limited to sequential read-only Action API calls.
 * No image downloads, production promotion, collection/curator changes, or outreach.
 * Run: node tools/calendar/discover-sacred-art-76-open-sources.mjs <shard 0|1>
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mkdir,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {commonsLicenseUsable} from "./acquire-sacred-art-bulk.mjs";
import {hasPradoProvenance,commonsMetadataHasPradoProvenance} from "./sacred-art-source-policy.mjs";
const root=new URL("../../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const QUEUE=load("data/research/sacred-art-open-source-recovery-76-20261020.v1.json");
const INTAKE=load("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const FREEZE=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const CERT=load("data/calendar/sacred-art-certified-media.v1.json");
const allowed=new Set([...FREEZE.approved.map(x=>x.artworkId),...FREEZE.historicallyFiveIDsPreservedSeparately]);
const banned=new Set(FREEZE.rejected.map(x=>x.artworkId));
const WAIT=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const stripTags=x=>String(x??"").replace(/<[^>]+>/g," ").replace(/&(?:amp|quot|lt|gt|nbsp);/gi," ").replace(/\s+/g," ").trim();
const normalize=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const html=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const extradetails=x=>Object.fromEntries(["LicenseShortName","LicenseUrl","Copyrighted","Credit","Artist","ImageDescription","Source","Attribution","ObjectName","UsageTerms"].map(k=>[k,stripTags(x?.[k]?.value)]));
export function searchTerms(work) {
 const prefix=work.title.replace(/^San Polo Via Crucis\s*[—:-]+\s*Station\s*\d+:\s*/i,"");
 const station=work.artworkId.match(/an-olo-ia-rucis-tation-(\d\d)-/);
 const artist=station?"Giandomenico Tiepolo":work.artist;
 let subject=prefix.replace(/\((?:c\.)?\s*(?:1[0-9]{3}|20[0-9]{2})[^)]*\)/ig,"").replace(/[—–]/g," ");
 // Refrain from relying on 1 generic word ("saint") as a source match.
 if(station)return "Giandomenico Tiepolo San Polo "+String(Number(station[1]))+" "+subject;
 return [artist,subject].join(" ").trim().slice(0,155);
}
export function metadataIsPrado(page,ext={}) {
 if(hasPradoProvenance({title:page?.title}))return true;
 if(commonsMetadataHasPradoProvenance(ext))return true;
 return Object.entries(ext).some(([k,v])=>typeof v?.value==="string"
   &&/(museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i.test(v.value));
}
export function screenCandidate(work,page) {
 if(metadataIsPrado(page,page?.imageinfo?.[0]?.extmetadata))return null;
 const ii=page?.imageinfo?.[0];
 if(!ii||!["image/jpeg","image/png"].includes(ii.mime)||!ii.width||!ii.height
   ||Math.min(ii.width,ii.height)<700||Math.max(ii.width,ii.height)<1200)return null;
 const meta=extradetails(ii.extmetadata);
 if(!commonsLicenseUsable(meta.LicenseShortName,meta.Copyrighted))return null;
 if(/(?:\bnoncommercial\b|\bno derivatives\b|\bnc-nd\b|\bcc by-nc\b)/i.test(meta.UsageTerms+" "+meta.LicenseShortName))return null;
 if(typeof page.title!=="string"||!page.title.startsWith("File:"))return null;
 const meaningful=normalize(work.title).split(" ").filter(t=>t.length>=4&&!["saint","station","cross","crucis","christ","jesus","with","from","polo","march","santo","image","painting"].includes(t));
 const artistTokens=normalize(work.artist).split(" ").filter(t=>t.length>4&&!["peter","jean","paul","saint","giovanni","anthony","bartolome","giandomenico","the","elder"].includes(t));
 const source=normalize([page.title,meta.Artist,meta.ObjectName,meta.ImageDescription].join(" "));
 const matched=meaningful.filter(t=>source.split(" ").includes(t));
 const artistMatched=artistTokens.some(t=>source.split(" ").includes(t));
 const station=work.artworkId.match(/an-olo-ia-rucis-tation-(\d\d)-/);
 // Explicitly avoid automatically qualifying a reversed engraving of a painting.
 const differentMedium=/etching|engraving|print|aquatint|d'apr[eè]s/i.test([page.title,meta.ObjectName,meta.ImageDescription].join(" "));
 const score=(matched.length>=2?30:matched.length===1?10:0)+(artistMatched?20:0)
   +(station&&normalize(page.title).includes("san polo")?10:0);
 if(score<10)return null;
 const filePage="https://commons.wikimedia.org/wiki/"+encodeURIComponent(page.title.replaceAll(" ","_")).replace(/%3A/i,":");
 const thumb=typeof ii.thumburl==="string"&&new URL(ii.thumburl).hostname==="upload.wikimedia.org"?ii.thumburl:null;
 return {filePage,commonsTitle:page.title,photoRightsDeclared:meta.LicenseShortName,
   licenseUrl:meta.LicenseUrl||null,attribution:meta.Attribution||meta.Credit||meta.Artist||null,
   image:{width:ii.width,height:ii.height,mime:ii.mime,sha1:ii.sha1||null,thumb},
   matchedSubjectWords:matched,artistTokenMatched:artistMatched,searchScore:score,
   reviewStatus:"CANDIDATE_ONLY_UNVERIFIED_ORIGINAL",possibleEngravingOrDifferentMedium:differentMedium,
   originalPhysicalIdentityConfirmed:false,photographicRightsIndependentlyVerified:false,
   cropReviewed:false,productionEligible:false};
}
export function renderGallery(records) {
 const cards=records.map(rec=>'<section><h2>'+html(rec.title)+'</h2><div class="dim">'+html(rec.artist)+" · "+html(rec.lane)+'</div>'+
  (rec.candidates.length?rec.candidates.map(c=>'<article>'+
   (c.image.thumb?'<img loading="lazy" src="'+html(c.image.thumb)+'">':'')+
   '<p><a href="'+html(c.filePage)+'">'+html(c.commonsTitle)+'</a></p>'+
   '<small>'+html(c.photoRightsDeclared)+' · '+html(c.image.width+"×"+c.image.height)+
   ' · '+html(c.possibleEngravingOrDifferentMedium?"CHECK ENGRAVING/PRINT":"IDENTITY NOT VERIFIED")+
   '</small></article>').join(""):'<p class="dim">'+html(rec.discoveryStatus)+"</p>")+'</section>').join("");
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ad Orientem · 76 open-source discovery</title><style>body{background:#090d13;color:#e5decf;font:16px Georgia,serif;margin:1.6rem}h1{font-size:1.8rem}p,small,.dim{color:#b6afa0}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}section{padding:16px;border:1px solid #554f47;border-radius:7px}h2{font-size:1.13rem}a{color:#b6c6d5}article{border-top:1px solid #393936;padding:12px 0}img{width:100%;height:210px;object-fit:contain}small{font-size:.75rem}</style><h1>Ad Orientem · 76 approved-source recovery</h1><p>Research candidates only. A Commons licence is not proof that this is the approved physical original. No Prado, no image downloads and no production releases. Preview thumbnails require internet access.</p><main>'+cards+'</main></html>';
}
async function commonsQuery(work){
 const url=new URL("https://commons.wikimedia.org/w/api.php");
 for(const [k,v] of Object.entries({action:"query",format:"json",formatversion:"2",generator:"search",
  gsrsearch:searchTerms(work),gsrnamespace:"6",gsrlimit:"7",gsrsort:"relevance",prop:"imageinfo",
  iiprop:"size|sha1|mime|extmetadata|url",iiurlwidth:"280",maxlag:"5"}))url.searchParams.set(k,v);
 for(let attempt=0;attempt<4;attempt++){
  const res=await fetch(url,{signal:AbortSignal.timeout(30000),
   headers:{"user-agent":"AdOrientemSacredArtDiscovery/1.0 (https://github.com/Fulcanelli13/ad-orientem)"}});
  if([429,502,503,504].includes(res.status)){
   if(attempt===3)throw Error("Commons temporary HTTP "+res.status);
   const retry=Number(res.headers.get("retry-after"));
   await WAIT(Math.min(30000,Number.isFinite(retry)&&retry>0?retry*1000:3000*(attempt+1)));continue;
  }
  if(!res.ok)throw Error("Commons HTTP "+res.status);
  if(new URL(res.url).hostname!=="commons.wikimedia.org")throw Error("Commons redirect denied");
  const j=await res.json();
  if(j.error?.code==="maxlag"){await WAIT(3000*(attempt+1));continue;}
  if(j.error)throw Error("Commons API: "+String(j.error.code).slice(0,60));
  return j.query?.pages||[];
 }
 return [];
}
export async function run(shard){
 assert(Number.isInteger(shard)&&[0,1].includes(shard),"Shard must be 0 or 1");
 assert.deepEqual(CERT.media,[],"No release registry changes allowed");
 assert(QUEUE.records.length===76&&INTAKE.works.length===451);
 const start=shard*50,items=QUEUE.records.slice(start,start+50);
 assert(items.length===(shard===0?50:26),"Wrong shard size");
 const result=[];
 for(const work of items){
  assert(allowed.has(work.artworkId)&&!banned.has(work.artworkId),"Unapproved work");
  assert(!hasPradoProvenance({id:work.artworkId,sourceUrl:work.sourceUrl}),"Prado search prohibited");
  let pages=[],error=null;
  const alreadyRouted=work.lane==="SOURCE_IDENTIFIED_QA"&&work.status==="MOVED_TO_EXACT_COMMONS_SOURCE_QA";
  const pradoHold=work.lane==="PRADO_SOURCE_EMBARGO"||work.status==="HOLD_PRADO_SOURCE_POLICY"||INTAKE.works.find(x=>x.id===work.artworkId)?.sourcePolicy?.noFetch===true;
  if(!alreadyRouted&&!pradoHold)try{pages=await commonsQuery(work);}
  catch(e){error=String(e.message||e).slice(0,130);}
  const candidates=pages.map(page=>screenCandidate(work,page)).filter(Boolean)
    .sort((a,b)=>b.searchScore-a.searchScore).slice(0,4);
  result.push({artworkId:work.artworkId,title:work.title,artist:work.artist,sourceUrl:work.sourceUrl,
   lane:work.lane,priority:work.priority,query:searchTerms(work),
   discoveryStatus:pradoHold?"HOLD_PRADO_SOURCE_POLICY":alreadyRouted?"SOURCE_ALREADY_IDENTIFIED_FOR_IMAGE_QA":error?"HOLD_REQUEST_ERROR":candidates.length?"POTENTIAL_OPEN_LICENCE_MATCHES_FOR_QA":"HOLD_NO_EXACT_OPEN_CANDIDATE",
   error,candidates,productionCertified:false,approvedArtworkIntact:true});
  await WAIT(350);
 }
 const folder=join(process.cwd(),"artifacts","sacred-art-76-discovery","shard-"+String(shard));
 await mkdir(folder,{recursive:true});
 const summary={schema:"AO_76_OPEN_COMMONS_DISCOVERY_V1",asOf:"2026-10-20",shard,
  alreadyRoutedCount:result.filter(x=>x.discoveryStatus==="SOURCE_ALREADY_IDENTIFIED_FOR_IMAGE_QA").length,
  researchRecords:result.length,recordsWithCandidates:result.filter(x=>x.candidates.length).length,
  candidates:result.reduce((a,x)=>a+x.candidates.length,0),
  errors:result.filter(x=>x.error).length,pradoCandidatesAccepted:0,
  originalIdentitiesVerified:0,productionReleased:0,records:result};
 await writeFile(join(folder,"results.json"),JSON.stringify(summary,null,2)+"\n");
 await writeFile(join(folder,"review.html"),renderGallery(result));
 console.log(JSON.stringify({shard,records:summary.researchRecords,possibleFiles:summary.candidates,
  recordsWithCandidates:summary.recordsWithCandidates,errors:summary.errors,imagesDownloaded:0,
  approvedOrPublished:0,firstResults:result.filter(x=>x.candidates.length).slice(0,6).map(x=>({title:x.title,files:x.candidates.length}))}));
 return summary;
}
if(process.argv[1]?.endsWith("discover-sacred-art-76-open-sources.mjs"))await run(Number(process.argv[2]));
