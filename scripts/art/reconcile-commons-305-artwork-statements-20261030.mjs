/**
 * Commons 305 accepted source files — structured MediaInfo artwork lead audit.
 * Requires the completed Commons 305 file-page verification v2 report.
 * MediaInfo "digital representation of" (P6243) points to a Wikidata
 * artwork/object Q ID. "depicts" (P180) often points to *subject matter*
 * and MUST NEVER be mistaken for physical painting identity.
 * Metadata claims alone DO NOT certify any new canonical-383 link or licence.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const inpath="data/calendar/sacred-art-phase1-commons-305-official-file-audit-20261030.v2.json";
const outpath="data/calendar/sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json";
const input=JSON.parse(readFileSync(inpath,"utf8"));
if(input.rows.length!==305||input.counts.frozenImports!==299||input.counts.frozenImportsWithCorrections!==6)
 throw Error("Commons source file evidence 305 baseline mismatch");
const sha=x=>createHash("sha256").update(x).digest("hex");
const sleep=x=>new Promise(resolve=>setTimeout(resolve,x));
const approvedRows=input.rows.filter(r=>r.exactCommonsFilePageIdentityCertified===true);
const rows=new Map(),requests=[];
const api="https://commons.wikimedia.org/w/api.php";
const propIds=["P6243","P180","P921","P6216","P275"];
const idsFromClaim=(claims,prop)=>{
 const c=Array.isArray(claims?.[prop])?claims[prop]:[];
 return [...new Set(c.filter(z=>z.rank!=="deprecated").map(z=>z?.mainsnak?.datavalue?.value?.id).filter(x=>/^Q\d+$/.test(x)))];
};
async function runBatch(slice,i){
 const ids=slice.map(r=>"M"+r.sourceId.slice("commons:".length));
 const url=new URL(api);
 Object.entries({action:"wbgetentities",format:"json",ids:ids.join("|"),props:"claims",
  maxlag:"5"}).forEach(([k,v])=>url.searchParams.set(k,v));
 let error="NOT_ATTEMPTED";
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const resp=await fetch(url,{signal:AbortSignal.timeout(26000),headers:{
    "Accept":"application/json","User-Agent":"AdOrientemSacredArtResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem)"}});
   if(!resp.ok){error="HTTP_"+resp.status;
    if([429,500,502,503,504].includes(resp.status)){await sleep(900*attempt);continue;}break;}
   const raw=await resp.text(),j=JSON.parse(raw);
   if(j.error){error="API_"+j.error.code;if(j.error.code==="maxlag"){await sleep(1200*attempt);continue;}break;}
   if(!j.entities||typeof j.entities!=="object"){error="MISSING_ENTITIES";break;}
   requests.push({batch:i,requested:ids.length,resultKeys:Object.keys(j.entities).length,
    httpStatus:resp.status,jsonSha256:sha(raw)});
   for(const s of slice){
    const entityId="M"+s.sourceId.slice("commons:".length);
    const entity=j.entities[entityId]??null;
    const claims=entity?.statements??entity?.claims??{};
    const targets=Object.fromEntries(propIds.map(p=>[p,idsFromClaim(claims,p)]));
    const supported=!!entity&&!entity.missing&&entity.id===entityId;
    rows.set(s.sourceId,{
     sourceId:s.sourceId,filePageId:Number(s.sourceId.slice(8)),mediaInfoId:entityId,
     frozenUserChoice:s.originalDecision,sourceFileTitle:s.official.filePageTitle,
     verifiedFileSha1:s.official.fileCurrent.sha1,
     status:supported?"COMMONS_STRUCTURED_MEDIAINFO_RESOLVED":"COMMONS_MEDIAINFO_MISSING_OR_UNCONFIRMED",
     wikidataDigitalRepresentationOf:targets.P6243,
     wikidataDepicts:targets.P180,wikidataMainSubject:targets.P921,
     structuredCopyrightStatus:targets.P6216,structuredCopyrightLicence:targets.P275,
     sourceClaimsSatisfyPaintingIdentity:targets.P6243.length>0,
     fileRightsCertified:false,artworkQIdMuseumCorroborated:false,
     physicalPaintingSameAsCanonical383:false,originalPhotoVisuallyCertified:false,
     newCanonical383Link:false,productionMutation:false
    });
   }
   return;
  }catch(e){if(e instanceof ReferenceError)throw e;error=String(e).slice(0,180);await sleep(850*attempt);}
 }
 requests.push({batch:i,requested:ids.length,status:"QUERY_FAILED",error});
 for(const s of slice){rows.set(s.sourceId,{
  sourceId:s.sourceId,filePageId:Number(s.sourceId.slice(8)),mediaInfoId:"M"+s.sourceId.slice(8),
  frozenUserChoice:s.originalDecision,sourceFileTitle:s.official.filePageTitle,
  verifiedFileSha1:s.official.fileCurrent.sha1,status:"STRUCTURED_DATA_QUERY_FAILED",
  error,wikidataDigitalRepresentationOf:[],wikidataDepicts:[],wikidataMainSubject:[],
  structuredCopyrightStatus:[],structuredCopyrightLicence:[],
  sourceClaimsSatisfyPaintingIdentity:false,fileRightsCertified:false,
  artworkQIdMuseumCorroborated:false,physicalPaintingSameAsCanonical383:false,
  originalPhotoVisuallyCertified:false,newCanonical383Link:false,productionMutation:false
 });}
}
const chunkSize=25;
for(let i=0;i<approvedRows.length;i+=chunkSize){
 await runBatch(approvedRows.slice(i,i+chunkSize),Math.floor(i/chunkSize)+1);
 console.log("Commons Wikibase MediaInfo",Math.min(i+chunkSize,approvedRows.length),"/",approvedRows.length);
 await sleep(550);
}
const reportRows=input.rows.map(r=>{
 const entity=rows.get(r.sourceId);
 if(entity)return entity;
 return {sourceId:r.sourceId,filePageId:Number(r.sourceId.slice(8)),
  mediaInfoId:"M"+r.sourceId.slice(8),frozenUserChoice:r.originalDecision,
  sourceFileTitle:r.official?.filePageTitle??r.originalCommonsTitle,
  verifiedFileSha1:r.official?.fileCurrent?.sha1??null,
  status:"UPSTREAM_FILE_PAGE_UNVERIFIED_NOT_QUERIED",
  wikidataDigitalRepresentationOf:[],wikidataDepicts:[],wikidataMainSubject:[],
  structuredCopyrightStatus:[],structuredCopyrightLicence:[],
  sourceClaimsSatisfyPaintingIdentity:false,fileRightsCertified:false,
  artworkQIdMuseumCorroborated:false,physicalPaintingSameAsCanonical383:false,
  originalPhotoVisuallyCertified:false,newCanonical383Link:false,productionMutation:false};
});
const knownPoussin=reportRows.find(r=>r.sourceId==="commons:22151874");
if(!knownPoussin?.wikidataDigitalRepresentationOf?.includes("Q23929162"))throw Error("KNOWN_COMMONS_P6243_DIGITAL_REPRESENTATION_ASSERTION_MISSING; verify MediaInfo statement JSON schema before accepting work-level counts");
const works=new Map();
for(const r of reportRows){
 for(const q of r.wikidataDigitalRepresentationOf)
   works.set(q,[...(works.get(q)||[]),r.sourceId]);
}
const sameWorkMediaGroups=[...works.entries()].filter(([,sourceIds])=>sourceIds.length>1)
 .map(([qid,sourceIds])=>({wikidataWorkId:qid,sourceIds,
  relation:"MULTIPLE_COMMONS_MEDIA_FILES_REFER_TO_SAME_WIKIDATA_ARTWORK_ENTITY",
  confirmPhysicalIdentityAgainstMuseumAnd_CANONICAL383:true,
  noAutomaticArtworkMerge:true}));
const counts={sourceCards:305,
 upstreamVerifiedSourceFilePages:approvedRows.length,
 mediaInfoEntitiesResolved:reportRows.filter(x=>x.status==="COMMONS_STRUCTURED_MEDIAINFO_RESOLVED").length,
 mediaInfoMissing:reportRows.filter(x=>x.status==="COMMONS_MEDIAINFO_MISSING_OR_UNCONFIRMED").length,
 queryFailures:reportRows.filter(x=>x.status==="STRUCTURED_DATA_QUERY_FAILED").length,
 upstreamUnverifiedNotQueried:reportRows.filter(x=>x.status==="UPSTREAM_FILE_PAGE_UNVERIFIED_NOT_QUERIED").length,
 sourceFilesWithP6243SpecificArtworkId:reportRows.filter(x=>x.wikidataDigitalRepresentationOf.length).length,
 distinctP6243ArtworkQIds:works.size,
 sameWikidataWorkIdMultipleFileSourceGroups:sameWorkMediaGroups.length,
 sourceFilesWithDepictsOnlyButNotP6243:reportRows.filter(x=>x.wikidataDepicts.length&&!x.wikidataDigitalRepresentationOf.length).length,
 sourceFilesWithCopyrightStatusStatement:reportRows.filter(x=>x.structuredCopyrightStatus.length).length,
 sourceFilesWithCopyrightLicenceStatement:reportRows.filter(x=>x.structuredCopyrightLicence.length).length,
 exactMuseumPhysicalPaintingMatchesEstablished:0,
 canonical383NewIdentityLinks:0,photoRightsCertified:0,originalPhotosVisuallyCertified:0,productionImports:0
};
if(reportRows.length!==305||
 counts.mediaInfoEntitiesResolved+counts.mediaInfoMissing+counts.queryFailures+counts.upstreamUnverifiedNotQueried!==305)throw Error("Commons MediaInfo 305 source count drift");
const out={schema:"AO_SACRED_ART_COMMONS_305_STRUCTURED_ARTWORK_LEADS_V1",generatedAt:new Date().toISOString(),
 mediaInfoAuthority:"Wikimedia Commons Structured Data (Wikibase MediaInfo)",upstreamAudit:inpath,
 upstreamAuditSha256:sha(readFileSync(inpath)),apiEndpoint:api,
 propertyDocumentation:"https://www.wikidata.org/wiki/Property:P6243",requests,counts,
 rules:["P6243 digital representation of links the digital surrogate to a particular Wikidata-described work; treat as an identity lead pending external corroboration",
 "P180 depicts often describes subject matter and MUST NOT be treated as same physical painting",
 "P921 main subject may describe art or its subject; do not assume a physical artwork",
 "Wikidata assertions/Commons structured data are community-maintained; inspect provenance and museum accession before linking canonical 383",
 "Identical Q-IDs create possible same-work media families, never automatic image approval or canonical merges",
 "No photo bytes or native images inspected; copyright claims and licence statements do not authorize publication automatically"],
 sameWorkMediaGroups,
 release:{originalUserChoicesChanged:false,canonicalArtworkMaster383Changed:false,
  paintingIdentityPromoted:false,originalPhotoRightsCertified:false,
  originalPhotosNativeVisuallyApproved:false,productionMutation:false},rows:reportRows};
writeFileSync(outpath,JSON.stringify(out,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({output:outpath,counts},null,2));
