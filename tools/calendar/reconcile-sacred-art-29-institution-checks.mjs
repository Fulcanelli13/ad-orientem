#!/usr/bin/env node
/**
 * One 29-work batch bridge: current-run Wikidata/Commons file-to-artwork leads
 * ↔ manually source-checked institutional record references. All results
 * remain object-identity candidates. Absolutely no photo or artwork promotion.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const ROOT=new URL("../../",import.meta.url);
const load=(path)=>JSON.parse(readFileSync(new URL(path,ROOT),"utf8"));
const authority=load("data/research/sacred-art-29-institution-crosscheck-20261020.v1.json");
const frozen=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const excluded=new Set(frozen.rejected.map(x=>x.artworkId));
const allowed=new Set([...frozen.approved.map(x=>x.artworkId),...frozen.historicallyFiveIDsPreservedSeparately]);
const basedir=process.argv[2]||"artifacts/qa-discovery-merged";
const incoming=JSON.parse(readFileSync(join(basedir,"batch-29-structured-originals.json"),"utf8"));
const candidates=JSON.parse(readFileSync(join(basedir,"batch-34-object-shortlist.json"),"utf8"));
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
assert.equal(incoming.schema,"AO_SACRED_ART_29_STRUCTURED_ORIGINAL_DISCOVERY_V1");
assert.equal(candidates.schema,"AO_SACRED_ART_34_BULK_SOURCE_IDENTITY_SHORTLIST_V1");
assert.equal(incoming.records.length,29);
assert.equal(authority.records.length,27,"Expected 27 distinct independently researched source rows");
assert(authority.records.every(x=>!x.commonsCandidatePixelsComparedAgainstOfficialPainting &&
 !x.productionPhotoCleared &&!x.independentPhotoRightsVerified));
const refIndex=new Map();
for(const row of authority.records){
 assert(allowed.has(row.artworkId)&&!excluded.has(row.artworkId),"Authority includes forbidden or unapproved artwork");
 assert(!refIndex.has(row.artworkId),"Duplicate institutional reference artwork");
 assert(!/(museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i.test(row.officialEvidenceURL||""),
  "No Prado photography in official source references");
 refIndex.set(row.artworkId,row);
}
const keep=new Map(candidates.records.map(x=>[x.artworkId,x]));
const rows=incoming.records.map(item=>{
 const p=keep.get(item.artworkId);
 assert(p?.preliminaryFileForHumanObjectMatch,"Structured candidate must be one of 29 photo leads");
 assert(allowed.has(item.artworkId)&&!excluded.has(item.artworkId));
 const ref=refIndex.get(item.artworkId)||null;
 const found=item.possibleStructuredArtworkItems||[];
 const prior=authority.criticalIdentityConflicts[item.artworkId]||null;
 const qids=found.map(x=>x.qid);
 const significantIssues=[];
 if(!ref)significantIssues.push("OFFICIAL_INSTITUTION_RECORD_STILL_MISSING");
 if(ref?.evidenceClass==="OFFICIAL_INSTITUTION_MULTIPLE_OBJECT_VERSIONS_IDENTITY_HOLD")
  significantIssues.push("MULTIPLE_PHYSICAL_VERSIONS_MATCH_SUBJECT");
 if(ref?.evidenceClass==="OFFICIAL_INSTITUTION_PAGE_WITH_COLLECTION_DESCRIPTION_NOT_OBJECT_DETAIL")
  significantIssues.push("DEDICATED_OBJECT_PAGE_NOT_YET_LINKED");
 if(ref?.evidenceClass==="MUSEUM_PARTNER_OBJECT_RECORD_NOT_DIRECT_MUSEUM_CATALOGUE")
  significantIssues.push("DIRECT_MUSEUM_OBJECT_RECORD_NOT_YET_LINKED");
 if(ref?.evidenceClass==="INDEPENDENT_SCHOLARLY_OBJECT_RECORD_NOT_OFFICIAL_MUSEUM_PAGE")
  significantIssues.push("SCHOLARLY_INVENTORY_NEEDS_CURRENT_MUSEUM_CONFIRMATION");
 if(prior){
  significantIssues.push("KNOWN_STRUCTURED_ARTWORK_QID_WRONG_OR_OTHER_VERSION");
  if(prior.incorrectWikidataArtworkQID)
   assert(qids.includes(prior.incorrectWikidataArtworkQID),"Lanfranco wrong-object test must not go unobserved");
  if(prior.suspectWikidataArtworkQID)
   assert(qids.includes(prior.suspectWikidataArtworkQID),"Zurbaran different version must not go unobserved");
 }
 if(ref&&item.possibleStructuredArtworkItems?.length){
  const dataInventory=new Set(item.possibleStructuredArtworkItems.flatMap(o=>o.inventoryNumbers||[])
   .map(x=>String(x).replace(/[^a-z0-9]/gi,"").toLowerCase()));
  const officialInv=(ref.inventoryNumber||"").replace(/[^a-z0-9]/gi,"").toLowerCase();
  if(officialInv&&!officialInv.includes("(")&&dataInventory.size&&!dataInventory.has(officialInv))
   significantIssues.push("STRUCTURED_INVENTORY_DIFFERS_FROM_INSTITUTION_REFERENCE");
 }
 if(ref?.caveat&&/not the finished|modello|two|different|multiple|variant|instead|photo/i.test(ref.caveat))
  significantIssues.push("CHECK_APPROVED_COMPOSITION_NOT_JUST_TITLE");
 const lane=!ref?"NEEDS_INSTITUTION_RECORD":
  prior?"WRONG_ARTWORK_QID_OR_VERSION_HOLD":
  ref.evidenceClass==="OFFICIAL_INSTITUTION_OBJECT_RECORD"?
   "OFFICIAL_OBJECT_DOCUMENTED_PHOTO_COMPARISON_PENDING":
  ref.evidenceClass==="OFFICIAL_INSTITUTION_MULTIPLE_OBJECT_VERSIONS_IDENTITY_HOLD"?
   "MULTIPLE_VERSIONS_CURATOR_PHOTO_COMPARISON":
   "INDEPENDENT_SOURCE_NEEDS_INSTITUTION_CONFIRMATION";
 return {artworkId:item.artworkId,approvedTitle:item.title,artist:item.artist,
  frozenArtworkSelection:true,photoPreviewReferenceMayBeDifferent:true,
  candidateFilePage:item.filePage,structuredArtworkQIDs:qids,
  objectInventoryFromWikidata:found.flatMap(x=>x.inventoryNumbers||[]),
  institution:ref?.officialInstitution||null,institutionInventory:ref?.inventoryNumber||null,
  institutionalEvidenceURL:ref?.officialEvidenceURL||null,
  supportingOfficialRecordRefs:ref?.relatedDistinctVersions||[],
  provenanceLane:lane,exceptions:[...new Set(significantIssues)],identityProblemDetail:ref?.caveat||null,
  candidatePhotographComparedToKnownPhysicalOriginal:false,
  curatorApprovedImagePixelMatchCertified:false,
  rightsIndependentEvidenceCertified:false,
  productionEligible:false};
});
for(const row of authority.records)assert(rows.some(x=>x.artworkId===row.artworkId),
 "Current shortlist dropped institutional artwork "+row.artworkId);
const byLane={};for(const x of rows)byLane[x.provenanceLane]=(byLane[x.provenanceLane]||0)+1;
const counts={approvedOriginalsWithPreliminarySource:rows.length,
 independentReferenceRows:rows.filter(x=>x.institutionalEvidenceURL).length,
 officialIndividualObjectRecords:rows.filter(x=>x.provenanceLane==="OFFICIAL_OBJECT_DOCUMENTED_PHOTO_COMPARISON_PENDING").length,
 objectsWithNoInstitutionReference:rows.filter(x=>x.provenanceLane==="NEEDS_INSTITUTION_RECORD").length,
 flaggedWrongObjectOrVersion:rows.filter(x=>x.provenanceLane==="WRONG_ARTWORK_QID_OR_VERSION_HOLD").length,
 candidatePhotosPublished:0,sourceRecordCounts:byLane};
assert.equal(counts.independentReferenceRows,27);
assert.equal(counts.objectsWithNoInstitutionReference,2);
assert.equal(counts.flaggedWrongObjectOrVersion,2);
const out={schema:"AO_SACRED_ART_29_INSTITUTIONAL_BATCH_V1",asOf:"2026-10-20",counts,
  policy:{wikidataNeverOverrulesMuseum:false,
   distinctVersionOrModelloIsNotInterchangeableOriginal:true,
   lockedUserArtworkApprovalsNeverChanged:true,
   neverAutoCertifyPhotoOrRights:true,noPaidLicencesOrContacts:true,
   noPradoReproductionsOrMirrors:true},
 records:rows};
mkdirSync(basedir,{recursive:true});
writeFileSync(join(basedir,"batch-29-institutional-crosswalk.json"),JSON.stringify(out,null,2)+"\n");
const csv=s=>'"'+String(s??"").replace(/"/g,'""')+'"';
const head=["artworkId","approvedTitle","artist","provenanceLane","institution",
 "inventory","institutionalEvidenceURL","commonsSourceFile","flags"].join(",");
const lines=[head].concat(rows.map(x=>[
 x.artworkId,x.approvedTitle,x.artist,x.provenanceLane,x.institution,
 x.institutionInventory,x.institutionalEvidenceURL,x.candidateFilePage,x.exceptions.join(";")].map(csv).join(",")));
writeFileSync(join(basedir,"batch-29-institutional-crosswalk.csv"),lines.join("\n")+"\n");
const visual=rows.map(x=>'<tr><td>'+esc(x.approvedTitle)+'<small>'+esc(x.artist)+'</small></td>'+
 '<td>'+esc(x.provenanceLane)+'</td>'+
 '<td>'+(x.institutionalEvidenceURL?'<a href="'+esc(x.institutionalEvidenceURL)+'" target="_blank" rel="noopener noreferrer">'+esc(x.institution)+' / '+esc(x.institutionInventory)+'</a>':'Not yet identified')+'</td>'+
 '<td><a href="'+esc(x.candidateFilePage)+'" target="_blank" rel="noopener noreferrer">Commons preliminary file</a></td>'+
 '<td>'+esc(x.exceptions.join("; "))+'</td></tr>').join("");
writeFileSync(join(basedir,"batch-29-institutional-crosswalk.html"),
 '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ad Orientem · 29 institutional source checks</title>'+
 '<style>body{margin:25px;background:#080d13;color:#e8e0d4;font:14px/1.5 Georgia}table{width:100%;border-collapse:collapse}th,td{padding:10px;text-align:left;border-bottom:1px solid #48494c;vertical-align:top}small{display:block;color:#b7b2a8}a{color:#a9c7da}th{position:sticky;top:0;background:#19222c}</style>'+
 '<h1>29 paintings — institution records and approved-photo identity holds</h1>'+
 '<p>'+counts.independentReferenceRows+' independent documentary references; '+counts.objectsWithNoInstitutionReference+
 ' unmatched; '+counts.flaggedWrongObjectOrVersion+' proven wrong-object structured links. Not one photo has been automatically accepted.</p>'+
 '<table><tr><th>Frozen approved painting</th><th>Comparison lane</th><th>Institution &amp; accession</th><th>Unverified photo</th><th>Outstanding identity checks</th></tr>'+visual+'</table></html>');
console.log(JSON.stringify(counts));
