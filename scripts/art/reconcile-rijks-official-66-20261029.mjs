/**
 * Rijksmuseum 66-item official Linked Art accession audit; research only.
 * Source: https://data.rijksmuseum.nl/docs/http (no key, free).
 * No images downloaded; no artwork/approval/production mutations.
 * Canonical Rijks persistent IDs and official object-number Identifier are required.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const input="data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json";
const output="data/calendar/sacred-art-phase1-rijks-66-official-linked-art-report-20261029.v1.json";
const audited=JSON.parse(readFileSync(input,"utf8"));
const selected=audited.rows.filter(x=>x.museum==="rijks");
if(selected.length!==66||selected.filter(x=>x.userDecision==="IMPORT_WITH_CORRECTIONS").length!==4)throw Error("Rijks frozen source choices changed");
const sha=s=>createHash("sha256").update(s).digest("hex");
const asArray=x=>x==null?[]:Array.isArray(x)?x:[x];
const flatten = x => asArray(x).flatMap(z => asArray(z));
const clean = s => String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const unique = x => [...new Set(x.filter(Boolean))];
const classified=x=>asArray(x?.classified_as).map(y=>y.id);
const english=x=>{const a=asArray(x);return a.find(z=>z?.["@language"]==="en")?.["@value"]??a[0]?.["@value"]??null};
const numberType="https://id.rijksmuseum.nl/22015218";
const responseLimitBytes=3200000; // Metadata only; prevent binary/oversized response.
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
async function readOfficial(row){
 const id=row.sourceObjectId;
 const url="https://data.rijksmuseum.nl/"+id+"?_profile=la-framed";
 let failReason=null;
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const res=await fetch(url,{signal:AbortSignal.timeout(25000),redirect:"follow",headers:{
    "Accept":"application/ld+json,application/json;q=0.9",
    "User-Agent":"AdOrientem-Art-Catalogue-SourceAudit/1.0"}});
   if(!res.ok){failReason="HTTP_"+res.status;if([429,500,502,503,504].includes(res.status)){await sleep(1200*attempt);continue;}break;}
   const ct=res.headers.get("content-type")||"";
   if(!ct.includes("json")){failReason="NOT_JSON_"+ct;break;}
   const text=await res.text();
   if(text.length>responseLimitBytes){failReason="METADATA_OVERSIZED";break;}
   let root=JSON.parse(text);
   if(root?.["@graph"]){let graph=asArray(root["@graph"]);root=graph.find(z=>z.id==="https://id.rijksmuseum.nl/"+id)||graph[0]}
   const identifiers=asArray(root?.identified_by).filter(z=>z.type==="Identifier").map(z=>({
    value:z.content??null,classificationIds:classified(z)
   }));
   const officialObjectNumbers=identifiers.filter(x=>x.classificationIds.includes(numberType)).map(x=>x.value);
   const canonicalId=root?.id;
   const idMatch=canonicalId==="https://id.rijksmuseum.nl/"+id;
   const accessionMatch=officialObjectNumbers.includes(row.sourceAccession);
   const kind=unique(asArray(root?.classified_as).flatMap(v=>asArray(v.notation).map(n=>n?.["@value"])));
   const titles=unique(asArray(root?.identified_by).filter(z=>z.type==="Name").map(z=>z.content));
   const bestTitleMatch=titles.some(x=>clean(x)===clean(row.title));
   const producer=asArray(root?.produced_by?.part).flatMap(p=>asArray(p?.referred_to_by).filter(z=>z?.type==="LinguisticObject").map(z=>z.content));
   const actorNames=asArray(root?.produced_by?.part).flatMap(p=>asArray(p?.carried_out_by).flatMap(a=>asArray(a.notation).map(n=>n?.["@value"])));
   const memberOf=asArray(root?.member_of).map(z=>({id:z.id??null,type:z.type??null}));
   const dimensions=asArray(root?.dimension).map(z=>({type:z.type,classifiedAs:classified(z),value:z.value??null,unit:asArray(z.unit).map(n=>n.id)}));
   const status=idMatch&&accessionMatch&&root?.type==="HumanMadeObject"
     ?"OFFICIAL_ID_AND_INVENTORY_CONFIRMED":"OFFICIAL_RESPONSE_UNCONFIRMED";
   return {sourceId:row.sourceId,batch:row.batch,userDecision:row.userDecision,originalTitle:row.title,
    originalArtist:row.artistAsReviewed,originalAccession:row.sourceAccession,
    originalSourceUrl:row.sourceObjectUrl,officialRequestUrl:url,officialFinalUrl:res.url,
    status,httpStatus:res.status,serverResponseSha256:sha(text),responseBytes:text.length,
    official:{canonicalId,type:root?.type,inventoryNumbers:officialObjectNumbers,
     titleCandidates:titles.slice(0,16),typeLabels:kind,creatorText:unique([...producer,...actorNames]).slice(0,14),
     memberOf:memberOf.slice(0,15),dimensions:dimensions.slice(0,10),hasAssignedAttributions:!!asArray(root?.attributed_by).length,
     representedSubjects:asArray(root?.shows).map(v=>v.id).slice(0,4)},
    evidence:{canonicalPersistentIdMatches:idMatch,officialInventoryMatchesFrozenAccession:accessionMatch,
     exactNormalizedTitleMatches:bestTitleMatch,metadataClassifiedAsPainting:kind.some(x=>/painting|schilderij/i.test(x)),
     creatorRequiresReview:row.artistAsReviewed==="Attribution not identified"||row.artistAsReviewed==="anonymous"||
      !unique([...producer,...actorNames]).some(n=>clean(n).includes(clean(row.artistAsReviewed)))},
    flags:[...(!idMatch?["CANONICAL_PID_MISMATCH"]:[]),...(!accessionMatch?["INVENTORY_MISMATCH"]:[]),
     ...(!bestTitleMatch?["REVIEW_TITLE_DIFFERENT_OR_ALTERNATE_LANGUAGE"]:[]),
     ...(!kind.some(x=>/painting|schilderij/i.test(x))?["NON_PAINTING_CLASSIFICATION_REVIEW"]:[])],
    exactPhotoVerified:false,licensedOriginalBytesVerified:false,physicalPaintingUniquenessVerified:false,
    matchedToCanonical383:false,originalEditorialDecisionPreserved:true,productionMutation:false};
  }catch(e){failReason=String(e).slice(0,240);await sleep(950*attempt);}
 }
 return {sourceId:row.sourceId,batch:row.batch,userDecision:row.userDecision,
  originalTitle:row.title,originalArtist:row.artistAsReviewed,originalAccession:row.sourceAccession,
  originalSourceUrl:row.sourceObjectUrl,officialRequestUrl:url,officialFinalUrl:null,
  status:"API_FETCH_FAILED",reason:failReason,official:null,
  evidence:{canonicalPersistentIdMatches:false,officialInventoryMatchesFrozenAccession:false,
   exactNormalizedTitleMatches:false,metadataClassifiedAsPainting:false,creatorRequiresReview:true},
  flags:["NO_AUTHORITATIVE_RESPONSE"],exactPhotoVerified:false,licensedOriginalBytesVerified:false,
  physicalPaintingUniquenessVerified:false,matchedToCanonical383:false,
  originalEditorialDecisionPreserved:true,productionMutation:false};
}
const rows=[];
for(let n=0;n<selected.length;n+=4){
 const batch=await Promise.all(selected.slice(n,n+4).map(readOfficial));
 rows.push(...batch);
 console.log("Rijksmuseum",Math.min(n+4,selected.length),"/",selected.length,
   "verified",rows.filter(x=>x.status==="OFFICIAL_ID_AND_INVENTORY_CONFIRMED").length);
 await sleep(400);
}
rows.sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
const counts={frozenSourceCards:66,
 officialIdAndInventoryConfirmed:rows.filter(x=>x.status==="OFFICIAL_ID_AND_INVENTORY_CONFIRMED").length,
 fetchedButNotConfirmed:rows.filter(x=>x.status==="OFFICIAL_RESPONSE_UNCONFIRMED").length,
 fetchFailed:rows.filter(x=>x.status==="API_FETCH_FAILED").length,
 normalizedTitleMatches:rows.filter(x=>x.evidence.exactNormalizedTitleMatches).length,
 museumPaintingClassified:rows.filter(x=>x.evidence.metadataClassifiedAsPainting).length,
 creatorMetadataReviewRequired:rows.filter(x=>x.evidence.creatorRequiresReview).length,
 originallyConditionalDecisions:rows.filter(x=>x.userDecision==="IMPORT_WITH_CORRECTIONS").length,
 sourceRowsWithMemberOf:rows.filter(x=>(x.official?.memberOf?.length??0)>0).length,
 canonical383NewLinks:0,distinctNewPaintingsCertified:0,photosCertified:0,productionImports:0};
if(counts.officialIdAndInventoryConfirmed+counts.fetchedButNotConfirmed+counts.fetchFailed!==66||
 counts.originallyConditionalDecisions!==4||new Set(rows.map(x=>x.sourceId)).size!==66)throw Error("Rijks report invariant "+JSON.stringify(counts));
const report={schema:"AO_SACRED_ART_RIJKS_66_OFFICIAL_LINKED_ART_EVIDENCE_V1",
 generatedAt:new Date().toISOString(),sourceAudited479:input,sourceAudited479Sha256:sha(readFileSync(input)),
 officialDataService:"https://data.rijksmuseum.nl/docs/http",
 officialRijksAccessionIdentifierType:numberType,counts,
 notes:["Exact persistent Rijks URI plus authority-classified object number are verified; title/attribution differences remain flags, never silent substitutions.",
 "HumanMadeObject classification and a distinct museum number do not establish independence from an ensemble or physical uniqueness.",
 "The original selected source may point to a photographic variant; no full-native image bytes or licence checked here.",
 "Metadata is transient; each official response fingerprint is stored without archiving its complete JSON."],
 gate:{userChoicesChanged:false,canonicalArtworkMaster383Changed:false,photographicRightsCleared:false,
 nativeVisualReviewCompleted:false,productionMutation:false},rows};
writeFileSync(output,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({output,counts},null,2));
