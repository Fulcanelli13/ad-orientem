/**
 * Walters 42 museum-backed accepted source IDs: official archived static CSV
 * exact ID/accession/title/source PURL join, plus official relationship edges.
 * No production changes, no image downloads, no identity promotion to 383.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const auditPath="data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json";
const outputPath="data/calendar/sacred-art-phase1-walters-42-official-csv-report-20261030.v1.json";
const frozen=JSON.parse(readFileSync(auditPath,"utf8"));
const selected=frozen.rows.filter(x=>x.museum==="walters");
if(selected.length!==42||selected.filter(x=>x.userDecision==="IMPORT_WITH_CORRECTIONS").length!==2)
 throw Error("Walters 42 frozen editorial scope mismatch");
const sourceRepo="https://github.com/WaltersArtMuseum/api-thewalters-org";
const base="https://raw.githubusercontent.com/WaltersArtMuseum/api-thewalters-org/main/";
const hash=x=>createHash("sha256").update(x).digest("hex");
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
function csv(txt,callback){
 const s=txt.replace(/^\uFEFF/,"");let row=[],cell="",quoted=false,head=null,n=0;
 const push=()=>{row.push(cell);cell=""};
 const end=()=>{push();if(head===null){head=row.map(x=>x.trim())}
  else if(row.some(x=>x!=="")){callback(Object.fromEntries(head.map((h,i)=>[h,row[i]??""])),n);n++}row=[]};
 for(let i=0;i<s.length;i++){let c=s[i];
  if(quoted){if(c==='"'){if(s[i+1]==='"'){cell+='"';i++}else quoted=false}else cell+=c}
  else if(c==='"')quoted=true;else if(c===',')push();else if(c==='\n')end();
  else if(c==='\r'){if(s[i+1]!=='\n')end()}else cell+=c;
 }
 if(quoted)throw Error("Malformed museum CSV");
 if(row.length||cell.length)end();
 return {head,rowCount:n};
}
async function get(name){
 const url=base+name;
 const r=await fetch(url,{signal:AbortSignal.timeout(95000),
  headers:{"User-Agent":"AdOrientem-Curatorial-SourceID-Audit/1.0","Accept":"text/csv,text/plain,*/*"}});
 if(!r.ok)throw Error("Unable to fetch Walters official "+name+": HTTP "+r.status);
 const text=await r.text();
 return {url,text,sha256:hash(text),byteLength:Buffer.byteLength(text)};
}
const srcIds=new Set(selected.map(x=>x.sourceObjectId));
const [art,relations]=await Promise.all([get("art.csv"),get("relationships.csv")]);
const museumById=new Map(),museumByAccession=new Map();
let artTotal=0;
const parsedArt=csv(art.text,(row)=>{
 artTotal++;
 if(srcIds.has(row.ObjectID)){
  if(museumById.has(row.ObjectID))throw Error("duplicate official source id "+row.ObjectID);
  museumById.set(row.ObjectID,row);
 }
 if(selected.some(s=>s.sourceAccession.toUpperCase()===row.AccessionNumber.toUpperCase())){
  const k=row.AccessionNumber.toUpperCase();
  museumByAccession.set(k,[...(museumByAccession.get(k)||[]),{id:row.ObjectID,title:row.Title}]);
 }
});
if(!["ObjectID","AccessionNumber","Title","ResourceURL","Classification","RelatedObjects"].every(k=>parsedArt.head.includes(k)))
 throw Error("Walters art.csv changed schema");
const relationships=new Map();
let relCount=0;
const parsedRel=csv(relations.text,(row)=>{
 relCount++;
 for(const id of [row.art1,row.art2]){
  if(!srcIds.has(id))continue;
  relationships.set(id,[...(relationships.get(id)||[]),{
   relationshipId:row.id,otherMuseumObjectId:row.art1===id?row.art2:row.art1,
   directedRelationship:row.art1===id?row.relationship1:row.relationship2,
   reverseRelationship:row.art1===id?row.relationship2:row.relationship1
  }]);
 }
});
if(!["art1","art2","relationship1","relationship2"].every(k=>parsedRel.head.includes(k)))
 throw Error("Walters relationships.csv schema changed");
const rows=selected.map(s=>{
 const official=museumById.get(s.sourceObjectId)??null;
 const objectIdExact=!!official&&official.ObjectID===s.sourceObjectId;
 const accessionExact=!!official&&official.AccessionNumber===s.sourceAccession;
 const titleExact=!!official&&norm(official.Title)===norm(s.title);
 const purlExact=!!official&&official.ResourceURL===s.sourceObjectUrl;
 const museumTitle=official?.Title??null;
 const status=objectIdExact&&accessionExact&&titleExact&&purlExact?
  "OFFICIAL_ARCHIVED_ID_ACCESSION_TITLE_PURL_CONFIRMED":official?
  "OFFICIAL_OBJECT_ID_FOUND_BUT_METADATA_CONFLICT":"OFFICIAL_OBJECT_ID_NOT_FOUND";
 const related=relationships.get(s.sourceObjectId)??[];
 const relatedCrossSource=related.filter(r=>srcIds.has(r.otherMuseumObjectId));
 return {
  sourceId:s.sourceId,originalFrozenDecision:s.userDecision,batch:s.batch,
  reviewedTitle:s.title,reviewedArtist:s.artistAsReviewed,
  reviewedAccession:s.sourceAccession,originalPurl:s.sourceObjectUrl,
  officialArchivedMuseumId:official?.ObjectID??null,status,
  official:official?{
   accessionNumber:official.AccessionNumber,title:museumTitle,resourceUrl:official.ResourceURL,
   classification:official.Classification,objectType:official.ObjectName,medium:official.Medium,
   culture:official.Culture,dateText:official.DateText,
   creatorNumericIds:official.Creators?.split("|").filter(Boolean)??[],
   relatedObjectIds:official.RelatedObjects?.split("|").filter(Boolean)??[],
   associatedImageFileNames:official.Images?.split("|").filter(Boolean)??[],
   curatorText:official.Description?.replace(/<[^>]*>/g," ").replace(/\s+/g," ").slice(0,500)??""
  }:null,
  sourceEvidence:{numericIdExact:objectIdExact,accessionExact,titleNormalizedExact:titleExact,
    purlExact,objectFromOfficialWaltersCSV:!!official},
  relationshipEdges:related,relationshipEdgesWithinAccepted42:relatedCrossSource,
  accessionCrossCheckCandidates:museumByAccession.get(s.sourceAccession.toUpperCase())??[],
  flags:[...(!objectIdExact?["MUSEUM_NUMERIC_OBJECT_ID_NOT_FOUND"]:[]),
    ...(objectIdExact&&!accessionExact?["NUMERIC_ID_AND_ACCESSION_DISAGREE"]:[]),
    ...(objectIdExact&&!titleExact?["FROZEN_TITLE_VS_ARCHIVED_MUSEUM_TITLE_DIFFERS"]:[]),
    ...(objectIdExact&&!purlExact?["HISTORIC_SOURCE_URL_DISAGREES"]:[]),
    ...(relatedCrossSource.length?["RELATED_ACCEPTED_SOURCE_IDS_NO_AUTO_MERGE"]:[]),
    ...(official?.ObjectName?.toLowerCase().includes("triptych")?["TRIPTYCH_OR_COMPONENT_NEEDS_PHYSICAL_OBJECT_REVIEW"]:[])],
  newPhysicalUniqueWorkCertified:false,canonical383Match:false,
  selectedImageBytesVisuallyChecked:false,imageRightsCertified:false,
  frozenEditorialChoiceChanged:false,productionMutation:false
 };
}).sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
const counts={frozenSourceCards:42,
 exactObjectIdAccessionTitlePurlMatch:rows.filter(r=>r.status==="OFFICIAL_ARCHIVED_ID_ACCESSION_TITLE_PURL_CONFIRMED").length,
 foundNumericIdButDifferentMetadata:rows.filter(r=>r.status==="OFFICIAL_OBJECT_ID_FOUND_BUT_METADATA_CONFLICT").length,
 absentNumericObjectId:rows.filter(r=>r.status==="OFFICIAL_OBJECT_ID_NOT_FOUND").length,
 numericIdExact:rows.filter(r=>r.sourceEvidence.numericIdExact).length,
 accessionExact:rows.filter(r=>r.sourceEvidence.accessionExact).length,
 titleNormalizedExact:rows.filter(r=>r.sourceEvidence.titleNormalizedExact).length,
 purlExact:rows.filter(r=>r.sourceEvidence.purlExact).length,
 recordsWithRelatedAcceptedMuseumObjects:rows.filter(r=>r.relationshipEdgesWithinAccepted42.length).length,
 originalConditionalDecisions:rows.filter(r=>r.originalFrozenDecision==="IMPORT_WITH_CORRECTIONS").length,
 unrelatedRecordsVerifiedAsNewPhysicalArtworks:0,newCanonical383Links:0,
 originalPhotoRightsCertified:0,productionImports:0};
if(rows.length!==42||new Set(rows.map(x=>x.sourceId)).size!==42||
 counts.originalConditionalDecisions!==2||
 counts.exactObjectIdAccessionTitlePurlMatch+counts.foundNumericIdButDifferentMetadata+counts.absentNumericObjectId!==42)
 throw Error("Walters official CSV report integrity failed");
const report={schema:"AO_WALTERS_42_AUTHORITY_STATIC_CSV_OBJECT_JOIN_V1",
 generatedAt:new Date().toISOString(),museumAuthority:"The Walters Art Museum",sourceFrozen:auditPath,
 sourceFrozenSha256:hash(readFileSync(auditPath)),sourceRepo,officialCSV:{
  art:{url:art.url,sha256:art.sha256,bytes:art.byteLength,totalRows:parsedArt.rowCount},
  relationships:{url:relations.url,sha256:relations.sha256,bytes:relations.byteLength,totalRows:parsedRel.rowCount}
 },counts,notes:["Walters original API v1 retired in 2023. Official museum CSV snapshot is static, not a guarantee of unchanged current catalogue metadata",
 "Exact numeric museum object ID + accession + normalized title + legacy official PURL used to confirm archived physical-object catalogue identity",
 "Explicit relationships can contain generic See Also; do not infer merges, count all panels as unrelated, or treat a set as extra standalone work",
 "Associated official image filenames are catalogue descriptions, not downloaded original media or rights/quality checks",
 "Live Walters online collection pages are verified in a separate per-URL ledger."],
 release:{allFrozenDecisionsRetained:true,originalPhotoRightsCertified:false,
   canonical383Mutated:false,sourcePhotographsVisuallyInspected:false,
   productionMutation:false},rows};
writeFileSync(outputPath,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({outputPath,counts,exceptions:rows.filter(r=>r.status!=="OFFICIAL_ARCHIVED_ID_ACCESSION_TITLE_PURL_CONFIRMED").map(r=>({id:r.sourceId,acc:r.reviewedAccession,status:r.status,museumId:r.officialArchivedMuseumId,offAcc:r.official?.accessionNumber,title:r.official?.title}))},null,2));
