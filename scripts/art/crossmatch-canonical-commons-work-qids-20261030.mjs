/**
 * Research-only: resolve canonical-383 Commons source-photo pages to MediaInfo
 * P6243 artwork QIDs, then compare with accepted Commons sources' QIDs.
 * This compares work statements, NOT image hashes, and does not merge or publish.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const base="data/calendar/";
const load=name=>JSON.parse(readFileSync(base+name,"utf8"));
const main=load("sacred-art-curator-queues-383-20261029.v1.json");
const cross=load("sacred-art-accepted-856-to-canonical-383-20261029.v1.json");
const src=load("sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json");
if(main.main_records.length!==383||cross.records.length!==856||src.rows.length!==305)
 throw Error("Locked baseline drift");
const canCommons=main.main_records.filter(r=>
 /^https?:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(r.source_page||"")).map(r=>{
 const raw=r.source_page.split("/wiki/").slice(1).join("/").split(/[?#]/)[0];
 return {canonicalArtworkId:r.artwork_id,canonicalTitle:r.title,
  canonicalArtist:r.artist,sourcePage:r.source_page,
  commonsTitle:decodeURIComponent(raw).replace(/_/g," ")};
});
if(!canCommons.length)throw Error("No canonical Commons page identities available");
const api="https://commons.wikimedia.org/w/api.php";
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sha=t=>createHash("sha256").update(t).digest("hex");
const records=[],requests=[];
const flatten=s=>s.trim().replace(/_/g," ").replace(/\s+/g," ").toLowerCase();
async function request(q,slot){
 const url=new URL(api);
 for(const [k,v] of Object.entries(q))url.searchParams.set(k,v);
 let error="";
 for(let attempt=1;attempt<=4;attempt++){
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(25000),
    headers:{"Accept":"application/json","User-Agent":"AdOrientemSacredArtResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem)"}});
   if(!r.ok){error="HTTP_"+r.status;if([429,500,502,503,504].includes(r.status)){
    await sleep(1000*attempt);continue;}break;}
   const raw=await r.text(),j=JSON.parse(raw);
   if(j.error){error="API_"+j.error.code;
    if(j.error.code==="maxlag"){await sleep(1200*attempt);continue;}break;}
   requests.push({slot,requestedCount:q.titles?.split("|").length||
    q.ids?.split("|").length||0,httpStatus:r.status,
    responseSha256:sha(raw)});
   return j;
  }catch(e){error=String(e).slice(0,160);await sleep(800*attempt);}
 }
 requests.push({slot,error});return null;
}
const pageRows=[];
for(let i=0;i<canCommons.length;i+=20){
 const batch=canCommons.slice(i,i+20);
 const q=await request({action:"query",format:"json",prop:"info",
  redirects:"1",titles:batch.map(x=>x.commonsTitle).join("|"),maxlag:"5"},"file_pages_"+i);
 const resolved=q?.query?.pages?Object.values(q.query.pages):[];
 const alias=new Map();
 for(const a of [...(q?.query?.normalized||[]),...(q?.query?.redirects||[])])
  alias.set(flatten(a.from),flatten(a.to));
 function finalKey(title){let key=flatten(title);const seen=new Set();
  while(alias.has(key)&&!seen.has(key)){seen.add(key);key=alias.get(key);}
  return key;}
 const byTitle=new Map(resolved.map(p=>[flatten(p.title),p]));
 for(const c of batch){
  const p=byTitle.get(finalKey(c.commonsTitle));
  pageRows.push({...c,commonsCurrentTitle:p?.title||null,
    commonsCurrentFilePageId:Number.isInteger(p?.pageid)?p.pageid:null,
    exactFilePageResolved:Number.isInteger(p?.pageid)});
 }
 await sleep(300);
}
const media=new Map();
const ids=[...new Set(pageRows.filter(x=>x.commonsCurrentFilePageId).map(x=>"M"+x.commonsCurrentFilePageId))];
for(let i=0;i<ids.length;i+=25){
 const batch=ids.slice(i,i+25);
 const j=await request({action:"wbgetentities",format:"json",
  props:"claims",ids:batch.join("|"),maxlag:"5"},"mediainfo_"+i);
 for(const id of batch){
  const e=j?.entities?.[id],claims=e?.statements??e?.claims??{};
  const qs=(claims.P6243||[]).filter(x=>x.rank!=="deprecated")
   .map(x=>x?.mainsnak?.datavalue?.value?.id).filter(x=>/^Q\d+$/.test(x));
  media.set(id,{mediaResolved:!!e&&!e.missing,
   specificArtworkQIds:[...new Set(qs)]});
 }
 await sleep(300);
}
const acceptedByQid=new Map();
for(const r of src.rows)for(const qid of r.wikidataDigitalRepresentationOf){
 acceptedByQid.set(qid,[...(acceptedByQid.get(qid)||[]),r.sourceId]);
}
const acceptedById=new Map(cross.records.map(r=>[r.sourceId,r]));
const canonicalWorkRows=pageRows.map(c=>{
 const e=media.get("M"+c.commonsCurrentFilePageId);
 const qs=e?.specificArtworkQIds||[];
 const leads=[...new Set(qs.flatMap(q=>acceptedByQid.get(q)||[]))]
 .filter(id=>acceptedById.get(id)?.canonical383.status==="NO_CONFIRMED_IDENTITY");
 return {...c,mediaInfoId:c.commonsCurrentFilePageId?"M"+c.commonsCurrentFilePageId:null,
  mediaInfoResolved:e?.mediaResolved||false,
  specificArtworkQIds:qs,
  previouslyUnlinkedAcceptedSameQidSources:leads,
  evidenceClass:leads.length?"SHARED_COMMONS_P6243_ARTWORK_QID_CANDIDATE_NOT_FINAL":
   "NO_NEW_SHARED_WORK_QID_LEAD",
  provenance:"COMMONS_CURRENT_FILE_PAGE_AND_MEDIAINFO_STATEMENTS",
  specificWorkIdentityMuseumVerified:false,
  newCanonical383Link:false,rightsCertified:false,visualCertified:false,productionMutation:false};
});
const candidates=canonicalWorkRows.flatMap(c=>c.previouslyUnlinkedAcceptedSameQidSources.map(id=>({
 canonicalArtworkId:c.canonicalArtworkId,acceptedSourceId:id,
 sharedQids:c.specificArtworkQIds.filter(q=>src.rows.find(r=>r.sourceId===id)
  ?.wikidataDigitalRepresentationOf.includes(q)),
 canonicalSourcePage:c.sourcePage,canonicalCurrentCommonsPageId:c.commonsCurrentFilePageId,
 acceptedSourcePage:acceptedById.get(id).review.originalSourceUrl,
 evidence:"COMMONS_P6243_WORK_QID_MATCH_REQUIRES_OFFICIAL_CORROBORATION",
 certifiedNewCanonicalIdentity:false,photoApproved:false,
 productionMutation:false
})));
const counts={
 canonicalMasterRecords:383,canonicalCommonsSourcePages:canCommons.length,
 commonsPagesResolved:canonicalWorkRows.filter(x=>x.exactFilePageResolved).length,
 commonsMediaInfoResolved:canonicalWorkRows.filter(x=>x.mediaInfoResolved).length,
 canonicalSourcePhotosWithArtworkQid:canonicalWorkRows.filter(x=>x.specificArtworkQIds.length).length,
 acceptedCommonsWorkQidSources:src.counts.sourceFilesWithP6243SpecificArtworkId,
 previouslyUnlinkedAcceptedCandidatesWithSharedWorkQid:
  new Set(candidates.map(x=>x.acceptedSourceId)).size,
 canonicalArtworkRowsWithSharedWorkQidCandidates:
  new Set(candidates.map(x=>x.canonicalArtworkId)).size,
 sharedWorkQidCandidateEdges:candidates.length,
 existingCanonicalSourceLinks:72,newConfirmedCanonical383Links:0,
 exactPhotoRightsCertified:0,originalNativePhotosCertified:0,productionImports:0
};
if(counts.commonsPagesResolved>canCommons.length||
 counts.commonsMediaInfoResolved>counts.commonsPagesResolved||
 candidates.some(c=>c.certifiedNewCanonicalIdentity!==false||c.productionMutation!==false))
 throw Error("Canonical Commons work audit integrity problem");
const report={
 schema:"AO_SACRED_ART_383_CANONICAL_COMMONS_WORK_QID_CROSSWALK_V1",
 generatedAt:new Date().toISOString(),sources:{
 canonical383:"sacred-art-curator-queues-383-20261029.v1.json",
 accepted856:"sacred-art-accepted-856-to-canonical-383-20261029.v1.json",
 acceptedCommonsMediaInfo:"sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json"},
 authority:"Wikimedia Commons File page and structured-data MediaInfo",
 counts,requests,
 rules:["Only canonical source_page URLs explicitly naming a Commons File are queried. No title-based attribution across missing canonical source pages.",
  "P6243 shared artwork QID is a same-work research lead, not museum-verified identity.",
  "P180 depicts and P921 main subject are ignored for physical artwork identity.",
  "No similarity or work-QID match grants a new canonical link without independent official object provenance.",
  "Frozen approvals/rejections, canonical registry, image rights and production remain unchanged."],
 candidates,canonicalCommonsPhotoPages:canonicalWorkRows,
 release:{newCanonicalLinks:0,photoRightsApprovals:0,photoVisualApprovals:0,productionMutation:false}
};
writeFileSync(base+"sacred-art-phase1-canonical383-commons-work-qid-crosswalk-20261030.v1.json",
 JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(counts,null,2));