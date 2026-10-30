/**
 * Research only: link Commons P6243 artwork-QID leads to accession evidence in
 * the 479 official museum records. Never interpret P180 or P921 as painting ID.
 * Do not promote canonical identity, photo rights, image quality, or user choice.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const dir="data/calendar/";
const read=name=>JSON.parse(readFileSync(dir+name,"utf8"));
const cross=read("sacred-art-accepted-856-to-canonical-383-20261029.v1.json");
const commons=read("sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json");
const museum=read("sacred-art-phase1-museum-479-accession-audit-20261029.v1.json");
const canonical=read("sacred-art-curator-queues-383-20261029.v1.json");
if(cross.records.length!==856||cross.counts.confirmed!==72||
   cross.counts.unlinked!==784||commons.rows.length!==305||
   commons.counts.sourceFilesWithP6243SpecificArtworkId!==195||
   museum.rows.length!==479||canonical.main_records.length!==383)
  throw Error("Frozen review / physical artwork baselines changed");
const accepted=new Map(cross.records.map(r=>[r.sourceId,r]));
const norm=s=>String(s??"").normalize("NFKC").toLowerCase()
  .replace(/[\s.\-_,;:()[\]]/g,"");
const museumByAcc=new Map();
for(const r of museum.rows){
  if(!accepted.has(r.sourceId)) throw Error("Museum source no longer accepted "+r.sourceId);
  const key=norm(r.sourceAccession);
  if(!key)continue;
  museumByAcc.set(key,[...(museumByAcc.get(key)||[]),r]);
}
const getValues=(claims,p)=>Array.isArray(claims?.[p])?
 claims[p].filter(c=>c.rank!=="deprecated").map(c=>c?.mainsnak?.datavalue?.value)
 .filter(v=>v!==undefined&&v!==null):[];
const claimsQ=(claims,p)=>[...new Set(getValues(claims,p).map(v=>v?.id).filter(x=>/^Q\d+$/.test(x)))];
const qids=[...new Set(commons.rows.flatMap(r=>r.wikidataDigitalRepresentationOf))].sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));
if(qids.length!==192)throw Error("Expected exactly 192 work Q IDs");
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const endpoint="https://www.wikidata.org/w/api.php";
const fetched=new Map(),batchEvidence=[];
async function queryBatch(ids,batch){
 const url=new URL(endpoint);
 Object.entries({action:"wbgetentities",format:"json",ids:ids.join("|"),
   props:"claims|labels",languages:"en|fr",maxlag:"5"}).forEach(([k,v])=>url.searchParams.set(k,v));
 let lastError="";
 for(let attempt=1;attempt<=4;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(30000),
    headers:{"Accept":"application/json","User-Agent":"AdOrientemSacredArtResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem)"}});
   if(!response.ok){lastError="HTTP_"+response.status;
    if([429,500,502,503,504].includes(response.status)){await sleep(attempt*1300);continue;}break;}
   const raw=await response.text(),data=JSON.parse(raw);
   if(data.error){lastError=data.error.code;
    if(data.error.code==="maxlag"){await sleep(attempt*1500);continue;}break;}
   if(!data.entities)throw Error("No entities");
   for(const id of ids)fetched.set(id,data.entities[id]??{id,missing:true});
   batchEvidence.push({batch,requested:ids.length,received:Object.keys(data.entities).length,
     httpStatus:response.status,sha256:createHash("sha256").update(raw).digest("hex")});
   return;
  }catch(e){lastError=String(e);await sleep(attempt*1000);}
 }
 batchEvidence.push({batch,requested:ids.length,status:"FAILED",error:lastError.slice(0,180)});
 for(const id of ids)fetched.set(id,{id,missing:true,fetchError:lastError});
}
for(let i=0;i<qids.length;i+=25){
 await queryBatch(qids.slice(i,i+25),Math.floor(i/25)+1);
 await sleep(350);
}
const museumQids=[...new Set([...fetched.values()].flatMap(e=>claimsQ(e.claims,"P195")))];
const collectionNames=new Map();
for(let i=0;i<museumQids.length;i+=25){
 const ids=museumQids.slice(i,i+25);
 const url=new URL(endpoint);
 Object.entries({action:"wbgetentities",format:"json",ids:ids.join("|"),
  props:"labels",languages:"en|fr",maxlag:"5"}).forEach(([k,v])=>url.searchParams.set(k,v));
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{
   "User-Agent":"AdOrientemSacredArtResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem)"}});
  if(!response.ok)throw Error("HTTP "+response.status);
  const data=await response.json();
  for(const id of ids)collectionNames.set(id,data.entities?.[id]?.labels?.en?.value
   ||data.entities?.[id]?.labels?.fr?.value||"");
 }catch(e){for(const id of ids)collectionNames.set(id,"");}
 await sleep(250);
}
const museumNames={
 cma:/cleveland museum of art/i,met:/metropolitan museum of art/i,
 nga:/national gallery of art|national gallery of art, washington/i,
 kmska:/royal museum of fine arts antwerp|koninklijk museum voor schone kunsten antwerpen|musée royal des beaux-arts d.anvers/i,
 rijks:/rijksmuseum/i,smk:/statens museum for kunst|national gallery of denmark/i,
 walters:/walters art museum/i
};
const report=[];
for(const source of commons.rows){
 const original=accepted.get(source.sourceId);
 if(!original)throw Error("Commons lead outside accepted crosswalk "+source.sourceId);
 for(const qid of source.wikidataDigitalRepresentationOf){
  const e=fetched.get(qid),claims=e?.claims??{};
  const inventories=[...new Set(getValues(claims,"P217").filter(x=>typeof x==="string"))];
  const collections=claimsQ(claims,"P195").map(id=>({qid:id,label:collectionNames.get(id)||null}));
  const museumHits=[];
  for(const inventory of inventories){
   for(const row of museumByAcc.get(norm(inventory))||[]){
    const collectionAgrees=collections.some(c=>museumNames[row.museum]?.test(c.label||"")===true);
    const current=accepted.get(row.sourceId);
    museumHits.push({museumSourceId:row.sourceId,museum:row.museum,
     museumVerifiedAccession:row.sourceAccession,wikidataInventory:inventory,
     accessionNormalizedMatch:true,collectionAgrees,collectionEvidence:collections,
     reviewTitle:row.title,museumCanonical383AlreadyLinked:
       current.canonical383.status==="CONFIRMED_IDENTITY",
     existingCanonicalArtworkId:current.canonical383.artworkId,
     assessment:collectionAgrees?"WIKIDATA_COLLECTION_AND_ACCESSION_LEAD":
       "WIKIDATA_ACCESSION_ONLY_UNCORROBORATED_COLLECTION",
     canonical383NewIdentityLink:false,photoRightsCertified:false});
   }
  }
  report.push({sourceId:source.sourceId,reviewedTitle:original.review.title,
   originalDecision:original.review.decision,workQid:qid,
   qidResolved:!!e&&!e.missing,workTitle:e?.labels?.en?.value||e?.labels?.fr?.value||null,
   wikidataInventoryNumbers:inventories,collections,
   creatorQids:claimsQ(claims,"P170"),
   wikidataWorkImageFileNames:getValues(claims,"P18").filter(x=>typeof x==="string"),
   museumAccessionCandidates:museumHits,
   originalCanonical383Status:original.canonical383.status,
   originalCanonical383ArtworkId:original.canonical383.artworkId,
   canonical383NewIdentityLink:false,
   photoRightsCertified:false,originalPhotoCertified:false,productionMutation:false});
 }
}
const allHits=report.flatMap(r=>r.museumAccessionCandidates);
const summary={
 sourceCards:305,sourceFilesWithQid:195,distinctQids:192,
 qidsResolved:[...fetched.values()].filter(e=>!e.missing).length,
 qidFetchErrors:[...fetched.values()].filter(e=>e.missing).length,
 commonsToMuseumAccessionCandidateEdges:allHits.length,
 collectionAndAccessionCandidateEdges:allHits.filter(x=>x.collectionAgrees).length,
 accessionOnlyCandidateEdges:allHits.filter(x=>!x.collectionAgrees).length,
 sourceFilesWithMuseumCandidates:new Set(report.filter(r=>r.museumAccessionCandidates.length).map(r=>r.sourceId)).size,
 existingCanonicalLinks:72,newCanonical383Links:0,
 publicationApproved:0,photoRightsCertified:0,productionImports:0
};
const out={schema:"AO_SACRED_ART_COMMONS_WIKIDATA_MUSEUM_ACCESSION_CANDIDATES_V1",
 generatedAt:new Date().toISOString(),
 provenance:{commonsLedger:"sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json",
  museumLedger:"sacred-art-phase1-museum-479-accession-audit-20261029.v1.json",
  canonicalCrosswalk:"sacred-art-accepted-856-to-canonical-383-20261029.v1.json",
  wikidataEndpoint:endpoint,batches:batchEvidence},
 rules:["P6243 provides an artwork-entity research lead, NOT proof of physical object identity",
  "P217 inventory number and P195 collection are independent Wikidata statements, not museum official claims",
  "Normalized accession alone is weak; even institution plus accession needs official corroboration of the Wikidata-artwork link",
  "P180 depicts and P921 subject excluded from artwork identity join",
  "Do not merge whole/part panels, copies, after, workshop objects or different photographs",
  "Frozen editorial choices, canonical 383 and photograph-rights gates all remain unchanged"],
 summary,records:report,productionMutation:false};
writeFileSync(dir+"sacred-art-phase1-commons-wikidata-museum-work-crosswalk-20261030.v1.json",
 JSON.stringify(out,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(summary,null,2));