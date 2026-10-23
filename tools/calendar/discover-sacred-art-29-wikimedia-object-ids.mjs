#!/usr/bin/env node
/**
 * Research-only 29-file provenance batch:
 * Commons MediaInfo "digital representation of" (P6243) artwork QIDs,
 * then Wikidata item original-collection, inventory and artist identities.
 * No images fetched; linked Wikidata records are research, not museum proof.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const folder=process.argv[2]||"artifacts/qa-discovery-merged";
const shortlist=JSON.parse(readFileSync(join(folder,"batch-34-object-shortlist.json"),"utf8"));
const provenance=JSON.parse(readFileSync(join(folder,"batch-34-frozen-object-provenance.json"),"utf8"));
assert(shortlist.schema==="AO_SACRED_ART_34_BULK_SOURCE_IDENTITY_SHORTLIST_V1");
assert(provenance.schema==="AO_SACRED_ART_34_APPROVED_OBJECT_EVIDENCE_RECONCILIATION_V1");
assert(shortlist.records.length>0&&shortlist.records.length<=34&&provenance.records.length===shortlist.records.length,"Source discovery may be temporarily incomplete");
const selected=shortlist.records.filter(r=>r.preliminaryFileForHumanObjectMatch);
assert(selected.length>=0&&selected.length<=29,"Current source lead count may not exceed frozen 29-work baseline");
const danger=/(museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i;
const scrub=x=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const QID=/^Q[1-9][0-9]*$/;
function getEntityIDs(ent,prop){
 return (ent?.claims?.[prop]||ent?.statements?.[prop]||[]).map(x=>x?.mainsnak?.datavalue?.value?.id).filter(x=>QID.test(x||""));
}
function getStrings(ent,prop){
 return (ent?.claims?.[prop]||ent?.statements?.[prop]||[]).map(x=>x?.mainsnak?.datavalue?.value).filter(x=>typeof x==="string");
}
function label(ent){
 const vals=ent?.labels||{};
 return vals.en?.value||vals.fr?.value||vals.it?.value||Object.values(vals)[0]?.value||null;
}
async function api(base,query){
 const url=new URL(base);
 for(const [k,v] of Object.entries(query))url.searchParams.set(k,v);
 for(let n=0;n<4;n++){
  try{
   const resp=await fetch(url,{redirect:"error",signal:AbortSignal.timeout(30000),
    headers:{"user-agent":"AdOrientemSacredArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"}});
   if([429,500,502,503,504].includes(resp.status)){await sleep(1200*(n+1));continue;}
   if(!resp.ok)throw Error("HTTP "+resp.status);
   if(new URL(resp.url).hostname!==new URL(base).hostname)throw Error("Untrusted redirect");
   const data=await resp.json();
   if(data.error?.code==="maxlag"){await sleep(1200*(n+1));continue}
   if(data.error)throw Error("API "+String(data.error.code).slice(0,60));
   return {data,error:null};
  }catch(e){if(n===3)return {data:null,error:String(e.message||e).slice(0,150)};await sleep(1200*(n+1))}
 }
 return {data:null,error:"Retries exhausted"};
}
const fileTitles=selected.map(s=>s.remainingFiles.find(f=>f.filePage===s.preliminaryFileForHumanObjectMatch)?.commonsTitle);
assert(fileTitles.every(x=>typeof x==="string"&&x.startsWith("File:")&&!danger.test(x)));
const commons="https://commons.wikimedia.org/w/api.php";
const wikidata="https://www.wikidata.org/w/api.php";
const query=await api(commons,{action:"query",format:"json",formatversion:"2",
 titles:[...new Set(fileTitles)].join("|"),prop:"info",maxlag:"5"});
const pages=query.data?.query?.pages||[];
const byTitle=new Map(pages.map(p=>[scrub(p.title),p]));
const mIds=pages.filter(p=>Number.isInteger(p.pageid)&&!p.missing).map(p=>"M"+p.pageid);
let med={data:null,error:null};
if(mIds.length)med=await api(commons,{action:"wbgetentities",format:"json",ids:mIds.join("|"),
 props:"claims",maxlag:"5"});
const mentities=med.data?.entities||{};
const bySelected=selected.map(s=>{
 const name=s.remainingFiles.find(f=>f.filePage===s.preliminaryFileForHumanObjectMatch)?.commonsTitle;
 const page=byTitle.get(scrub(name));
 const mid=page?.pageid?"M"+page.pageid:null;
 const entity=mid?mentities[mid]:null;
 const artworks=[...new Set(getEntityIDs(entity,"P6243"))];
 const allStatements=Object.keys(entity?.statements||entity?.claims||{});
 return {artworkId:s.artworkId,title:s.title,artist:s.artist,
  filePage:s.preliminaryFileForHumanObjectMatch,
  commonsFileTitle:name,mediaInfoEntity:mid,
  digitalRepresentationOfArtworkQIDs:artworks,hasCommonsStructuredObjectReference:artworks.length>0,
  otherStatements:allStatements.filter(x=>["P180","P195","P170","P921"].includes(x)),
  objectIdentityOfficiallyVerified:false,photosLicensed:false,publicationApproved:false};
});
const qids=[...new Set(bySelected.flatMap(x=>x.digitalRepresentationOfArtworkQIDs))];
const wdChunks=Array.from({length:Math.ceil(qids.length/40)},(_,i)=>qids.slice(i*40,(i+1)*40));
const wikidataRecords={},errors=[];
if(query.error)errors.push({type:"COMMONS_PAGES",detail:query.error});
if(med.error)errors.push({type:"COMMONS_MEDIAINFO",detail:med.error});
for(const chunk of wdChunks){
 const response=await api(wikidata,{action:"wbgetentities",format:"json",ids:chunk.join("|"),
  props:"labels|claims",languages:"en|fr|it",maxlag:"5"});
 if(response.error){errors.push({type:"WIKIDATA_ARTWORKS",detail:response.error});continue}
 Object.assign(wikidataRecords,response.data?.entities||{});
}
const personAndCollectionIDs=[...new Set(Object.values(wikidataRecords).flatMap(e=>[
 ...getEntityIDs(e,"P170"),...getEntityIDs(e,"P195")
]))];
const entityLabelRecords={};
for(let i=0;i<personAndCollectionIDs.length;i+=40){
 const group=personAndCollectionIDs.slice(i,i+40);
 const response=await api(wikidata,{action:"wbgetentities",format:"json",ids:group.join("|"),
  props:"labels",languages:"en|fr|it",maxlag:"5"});
 if(response.error)errors.push({type:"WIKIDATA_ENTITY_LABELS",detail:response.error});
 else Object.assign(entityLabelRecords,response.data?.entities||{});
}
const detailRows=bySelected.map(x=>{
 const physicalWorkItems=x.digitalRepresentationOfArtworkQIDs.map(qid=>{
  const e=wikidataRecords[qid];
  const inv=getStrings(e,"P217");
  const collections=getEntityIDs(e,"P195");
  const creators=getEntityIDs(e,"P170");
  const names=collections.map(k=>label(entityLabelRecords[k])||k);
  const artists=creators.map(k=>label(entityLabelRecords[k])||k);
  const hasPrado=names.some(n=>danger.test(n));
  return {qid,artworkItemUrl:"https://www.wikidata.org/wiki/"+qid,
   titled:label(e),inventoryNumbers:inv,collectionQIDs:collections,
   collectionNames:names,creatorQIDs:creators,creatorNames:artists,
   pradoProvenanceHold:hasPrado,
   artworkSourceIsCommunityMetadataNotMuseumCatalog:true,
   physicalArtworkVerifiedAgainstCuratorImage:false};
 });
 const prado=physicalWorkItems.some(q=>q.pradoProvenanceHold);
 return {...x,possibleStructuredArtworkItems:physicalWorkItems,
  provenanceLane:prado?"PRADO_EMBARGO_STRUCTURED_COLLECTION":
   physicalWorkItems.length&&physicalWorkItems.some(y=>y.inventoryNumbers.length&&y.collectionNames.length)?
    "STRUCTURED_COLLECTION_AND_INVENTORY_LEAD":
   physicalWorkItems.length?"STRUCTURED_ARTWORK_QID_NEEDS_MUSEUM_CROSSCHECK":
    "NO_STRUCTURED_ORIGINAL_ARTWORK_ITEM",
  sourcePhotoHeldIfPrado:prado,allReleaseGatesClosed:true};
});
const counts={
 artworkFilesQueried:selected.length,worksWithStructuredArtworkQID:detailRows.filter(x=>x.digitalRepresentationOfArtworkQIDs.length).length,
 distinctStructuredArtworkQIDs:qids.length,
 worksWithCollectionAndInventory:detailRows.filter(x=>x.provenanceLane==="STRUCTURED_COLLECTION_AND_INVENTORY_LEAD").length,
 worksWithWikidataPradoHold:detailRows.filter(x=>x.sourcePhotoHeldIfPrado).length,
 filesWithoutStructuredArtworkID:detailRows.filter(x=>!x.digitalRepresentationOfArtworkQIDs.length).length,
 apiErrors:errors.length,productionImagesApproved:0};
const result={schema:"AO_SACRED_ART_29_STRUCTURED_ORIGINAL_DISCOVERY_V1",
 asOf:"2026-10-20",counts,errors,records:detailRows,policy:{
  wikidataArtQIDDoesNotProveOfficialMuseumIdentity:true,
  photographerAndReproductionRightsUnaudited:true,
  physicalOriginalAndCuratorPreviewNotVisuallyCompared:true,
  noPradoOrMirrors:true,
  noAutoPromotionOrRatingChanges:true,
  noImageDownloads:true}};
assert(result.records.every(x=>x.allReleaseGatesClosed&&!x.publicationApproved));
mkdirSync(folder,{recursive:true});
writeFileSync(join(folder,"batch-29-structured-originals.json"),JSON.stringify(result,null,2)+"\n");
const csv=s=>'"'+String(s??"").replace(/"/g,'""')+'"';
const lines=["artworkId,title,artist,source,mediaEntity,structuredOriginalQIDs,objectTitles,collections,inventories,reviewLane"];
for(const x of detailRows)lines.push([x.artworkId,x.title,x.artist,x.filePage,x.mediaInfoEntity,
 x.digitalRepresentationOfArtworkQIDs.join(";"),
 x.possibleStructuredArtworkItems.map(y=>y.titled||"").join(";"),
 x.possibleStructuredArtworkItems.flatMap(y=>y.collectionNames).join(";"),
 x.possibleStructuredArtworkItems.flatMap(y=>y.inventoryNumbers).join(";"),
 x.provenanceLane].map(csv).join(","));
writeFileSync(join(folder,"batch-29-structured-originals.csv"),lines.join("\n")+"\n");
console.log(JSON.stringify({counts,itemsWithStructuredObject:detailRows.filter(x=>x.digitalRepresentationOfArtworkQIDs.length).map(x=>({title:x.title,items:x.digitalRepresentationOfArtworkQIDs}))}));
