/**
 * SMK (National Gallery of Denmark) 54 accepted/conditional official object-ID audit.
 * Exact matches require an official API object_number AND a recognized title.
 * Artist qualifiers, rights hints and visual assets are evidence fields ONLY.
 * No images downloaded, no original editor decisions changed, no 383 imports.
 */
import { readFileSync, writeFileSync } from "node:fs";
import {createHash} from "node:crypto";
const baselinePath="data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json";
const outputPath="data/calendar/sacred-art-phase1-smk-54-official-object-report-20261029.v1.json";
const base=JSON.parse(readFileSync(baselinePath,"utf8"));
const source=base.rows.filter(r=>r.museum==="smk").sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
if(source.length!==54||source.filter(r=>r.userDecision==="IMPORT_WITH_CORRECTIONS").length!==2)
 throw Error("SMK frozen 54-source baseline unexpectedly changed");
const sha=v=>createHash("sha256").update(v).digest("hex");
const arr=x=>x==null?[]:Array.isArray(x)?x:[x];
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9]/g,"");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const unique=x=>[...new Set(x.filter(v=>typeof v==="string"&&v.trim().length))];
function metadataOf(j){
  if(Array.isArray(j))return j.length===1?j[0]:null;
  if(j?.items && Array.isArray(j.items))return j.items.length===1?j.items[0]:null;
  if(j?.data && typeof j.data==="object" && !Array.isArray(j.data))return j.data;
  return j&&typeof j==="object"?j:null;
}
const titleOf=j=>unique([...arr(j?.titles).map(z=>typeof z==="string"?z:z?.title),
  ...arr(j?.title),...arr(j?.title_en),...arr(j?.title_da)]);
const namesOf=j=>unique([...arr(j?.artist).map(x=>typeof x==="string"?x:x?.name),
  ...arr(j?.production).flatMap(x=>[x?.creator,x?.creator_qualifier,x?.creator_role,
    x?.creator_forename,x?.creator_surname]).filter(Boolean)]);
const kindOf=j=>unique(arr(j?.object_names).map(z=>typeof z==="string"?z:z?.name)
 .concat(arr(j?.object_type),arr(j?.object_names_en).map(z=>z?.name??z)));
async function check(row){
 const accession=row.sourceAccession;
 const api="https://api.smk.dk/api/v1/art/?object_number="+encodeURIComponent(accession)+"&lang=en";
 let failure="NO_RESPONSE";
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const r=await fetch(api,{redirect:"follow",signal:AbortSignal.timeout(24000),headers:{
    Accept:"application/json","User-Agent":"AdOrientem-Sacred-Art-SourceIdentity/1.0"}});
   if(!r.ok){failure="HTTP_"+r.status;if([429,500,502,503,504].includes(r.status)){await sleep(1100*attempt);continue;}break;}
   const ct=r.headers.get("content-type")??"";
   if(!ct.includes("json")){failure="INVALID_CONTENT_TYPE_"+ct;break;}
   const data=await r.text();
   if(data.length>1500000){failure="TOO_MUCH_METADATA";break;}
   const full=JSON.parse(data),j=metadataOf(full);
   const actual=j?.object_number??null;
   const titles=titleOf(j);
   const titleMatches=titles.some(x=>norm(x)===norm(row.title));
   const objectExactCase=actual===accession;
   const objectMatches=typeof actual==="string"&&actual.toUpperCase()===accession.toUpperCase();
   const kinds=kindOf(j);
   const creators=namesOf(j);
   const creatorQualifier=arr(j?.production).map(z=>z?.creator_qualifier??null).filter(Boolean);
   const status=objectMatches&&titleMatches
    ?"OFFICIAL_OBJECT_ID_AND_TITLE_MATCH":"OFFICIAL_RECORD_REQUIRES_REVIEW";
   return {
    sourceId:row.sourceId,frozenDecision:row.userDecision,sourceBatch:row.batch,
    frozenTitle:row.title,frozenArtist:row.artistAsReviewed,frozenAccession:accession,
    originalSourceUrl:row.sourceObjectUrl,apiRequest:api,apiFinalUrl:r.url,
    status,responseSha256:sha(data),responseBytes:data.length,httpStatus:r.status,
    identityNormalization:{method:objectExactCase?"EXACT_CASE":"ASCII_CASEFOLD_ONLY",
      officialVerbatimObjectNumber:actual,frozenSourceObjectNumber:accession,
      fullyMatchedAfterCasefold:objectMatches},
    official:{
      objectNumber:actual,titles,creatorTexts:creators,creatorQualifiers:creatorQualifier,
      kinds,publicDomainField:j?.public_domain??null,imageExistsField:j?.has_image??null,
      objectUrl:j?.object_url??null,frontendUrl:j?.frontend_url??null,
      productions:arr(j?.production).map(z=>({
       creator:z?.creator??null,creatorRole:z?.creator_role??null,
       creatorQualifier:z?.creator_qualifier??null})).slice(0,10),
      material:arr(j?.materials).slice(0,10),techniques:arr(j?.techniques).slice(0,10),
      relatedIds:arr(j?.related_artworks).map(z=>typeof z==="string"?z:z?.object_number??z?.id).filter(Boolean).slice(0,20)
    },
    evidence:{objectNumberExact:objectMatches,objectNumberExactCase:objectExactCase,
      objectNumberCaseFoldMatches:objectMatches,normalizedTitleExact:titleMatches,
      creatorMentionMatch:creators.some(n=>norm(n)===norm(row.artistAsReviewed))},
    flags:[...(!objectMatches?["OFFICIAL_OBJECT_NUMBER_MISMATCH"]:[]),
      ...(!titleMatches?["OFFICIAL_TITLE_DIFFERENT_OR_NOT_EXTRACTED"]:[]),
      ...(row.artistAsReviewed.includes(";")||row.artistAsReviewed.includes("værksted")||
          /Ubekendt|Unknown/i.test(row.artistAsReviewed)?["HISTORIC_CREATOR_QUALIFIER_REVIEW"]:[]),
      ...(creators.length===0?["NO_CREATOR_TEXT_EXTRACTED"]:[])],
    physicalArtworkUniquenessCertified:false,canonical383Linked:false,
    exactOriginalPhotographCertified:false,photographicRightsCertified:false,
    nativeImageVisuallyInspected:false,userDecisionModified:false,productionMutation:false
   };
  }catch(e){failure=String(e).slice(0,240);await sleep(750*attempt);}
 }
 return {sourceId:row.sourceId,frozenDecision:row.userDecision,sourceBatch:row.batch,
  frozenTitle:row.title,frozenArtist:row.artistAsReviewed,frozenAccession:accession,
  originalSourceUrl:row.sourceObjectUrl,apiRequest:api,apiFinalUrl:null,
  status:"OFFICIAL_SOURCE_FETCH_FAILED",reason:failure,
  evidence:{objectNumberExact:false,normalizedTitleExact:false,creatorMentionMatch:false},
  flags:["UNRESOLVED_API_IDENTITY"],physicalArtworkUniquenessCertified:false,
  canonical383Linked:false,exactOriginalPhotographCertified:false,
  photographicRightsCertified:false,nativeImageVisuallyInspected:false,
  userDecisionModified:false,productionMutation:false};
}
const rows=[];
for(let i=0;i<source.length;i+=4){
 const batch=await Promise.all(source.slice(i,i+4).map(check));
 rows.push(...batch);
 console.log("SMK",Math.min(i+4,54),"/54","confirmed",rows.filter(r=>r.status==="OFFICIAL_OBJECT_ID_AND_TITLE_MATCH").length);
 await sleep(400);
}
rows.sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
const counts={frozenSourceCards:54,confirmedOfficialIdsAndTitles:rows.filter(r=>r.status==="OFFICIAL_OBJECT_ID_AND_TITLE_MATCH").length,
 officialResponseButUnresolved:rows.filter(r=>r.status==="OFFICIAL_RECORD_REQUIRES_REVIEW").length,
 officialFetchFailures:rows.filter(r=>r.status==="OFFICIAL_SOURCE_FETCH_FAILED").length,
 officialNumbersExactCase:rows.filter(r=>r.identityNormalization?.method==="EXACT_CASE").length,
 officialNumbersCasefoldOnly:rows.filter(r=>r.identityNormalization?.method==="ASCII_CASEFOLD_ONLY"&&r.identityNormalization.fullyMatchedAfterCasefold).length,
 originalConditionalImportCount:rows.filter(r=>r.frozenDecision==="IMPORT_WITH_CORRECTIONS").length,
 creatorReviewFlags:rows.filter(r=>r.flags.some(f=>/CREATOR/.test(f))).length,
 publicDomainFieldTrue:rows.filter(r=>r.official?.publicDomainField===true).length,
 publicDomainFieldFalse:rows.filter(r=>r.official?.publicDomainField===false).length,
 sourcePhotoLicensesCertified:0,uniquePhysicalNewPaintingsCertified:0,
 newlyEstablishedCanonical383Links:0,productionImports:0};
if(rows.length!==54||new Set(rows.map(r=>r.sourceId)).size!==54||
 counts.originalConditionalImportCount!==2||
 counts.confirmedOfficialIdsAndTitles+counts.officialResponseButUnresolved+counts.officialFetchFailures!==54)
 throw Error("SMK report bad source set "+JSON.stringify(counts));
const report={schema:"AO_SACRED_ART_SMK_54_OFFICIAL_COLLECTION_IDENTITY_V1",generatedAt:new Date().toISOString(),
 officialAuthority:"Statens Museum for Kunst (SMK), National Gallery of Denmark",
 documentedApi:"https://www.smk.dk/en/article/smk-api/",
 source479:baselinePath,source479Sha256:sha(readFileSync(baselinePath)),counts,
 identityNormalization:{rule:"ASCII_CASEFOLD_SAME_INVENTORY_ONLY",reason:"SMK spells KMSsp/KMSst in official API while older frozen source IDs are uppercased KMSSP/KMSST; verbatim IDs retained",promotedCaseOnlyRecords:counts.officialNumbersCasefoldOnly,exactCaseRecords:counts.officialNumbersExactCase,otherDifferencesPermitted:false,originalMuseumJsonResponseHashesPreserved:true,photographyReleaseUnaffected:true,baselineOriginalUserChoicesRetained:true},
 reconciliationAmendedFromOriginalApiSnapshot:false,
 methodologicalLimitations:[
  "Official museum object_number and title are authoritative source identity only, not a match to an existing canonical 383 work.",
  "Artist names and maker qualifiers are retained as evidence/review flags; no metadata or user's editorial decisions silently changed.",
  "SMK public_domain and has_image fields are signals, NOT proof of the specific original photographic bytes or suitability.",
  "No images were fetched, rights certified, frame/crop/colour checked, or physical-object uniqueness certified."
 ],release:{canonical383Changed:false,originalUserDecisionsChanged:false,
  photographicRightsApproved:false,originalImageVisuallyInspected:false,productionMutation:false},rows};
writeFileSync(outputPath,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({output:outputPath,counts},null,2));
