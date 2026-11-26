#!/usr/bin/env node
/**
 * Research-only reconciliation for the 34 approved artworks with new Commons
 * candidates. Joins the 29 preliminary photo leads and five unresolved holds
 * against frozen approved-art identifiers, institution-object evidence and
 * previously preferred curator preview fingerprints. Never treats a file name,
 * Commons rank, painting subject or rights claim as a certified original photo.
 *
 * Run after build-sacred-art-34-batch-shortlist.mjs.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {hasPradoProvenance} from "./sacred-art-source-policy.mjs";
const root=new URL("../../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const research=load("data/research/sacred-art-open-source-recovery-76-20261020.v1.json");
const intake=load("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const frozen=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const selected53=load("data/research/sacred-art-class-i-53-current-date-decisions-overlay-20261020.v1.json");
const certified=load("data/calendar/sacred-art-certified-media.v1.json");
const folder=process.argv[2]||"artifacts/qa-discovery-merged";
const summary=JSON.parse(readFileSync(join(folder,"batch-34-object-shortlist.json"),"utf8"));
const approved=new Set(frozen.approved.map(x=>x.artworkId));
const legacy=new Set(frozen.historicallyFiveIDsPreservedSeparately);
const rejected=new Set(frozen.rejected.map(x=>x.artworkId));
const rmap=new Map(research.records.map(x=>[x.artworkId,x]));
const imap=new Map(intake.works.map(x=>[x.id,x]));
const fmap=new Map(frozen.approved.map(x=>[x.artworkId,x]));
const scrub=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
assert.equal(research.records.length,76);
assert.equal(intake.works.length,451);
assert(summary.records.length>0&&summary.records.length<=34,"Transient Commons search returned fewer candidates; keep research holds rather than misclassifying frozen approvals");
assert.deepEqual(certified.media,[]);
const details=[];
const duplicateReferenceOwners=new Map();
for(const row of summary.records)for(const c of row.remainingFiles){
 if(!c.liveSHA1)continue;
 const owners=duplicateReferenceOwners.get(c.liveSHA1)||new Set();
 owners.add(row.artworkId);duplicateReferenceOwners.set(c.liveSHA1,owners);
}
const dateCrosswalk=new Map();
for(const date of selected53.records){
 for(const cand of date.catalogReview.possibleOriginalKeys||[]){
  const ds=dateCrosswalk.get(cand.artworkId)||[];
  ds.push({date:date.date,observance:date.observance,matchBasis:"EXPLICIT_CATALOGUE_WORK_ID"});
  dateCrosswalk.set(cand.artworkId,ds);
 }
}
const ARTIST_EQUIVALENT = s=>scrub(s).replace(/\b(the|saint|st|de|da|di|van|von|der|el|le|la|the elder)\b/g," ").replace(/\s+/g," ").trim();
function expectedObject(row,catalog,recover){
 const rEvidence=recover?.sourceEvidence||{};
 const candidates=[catalog.sourceObjectUrl,recover?.sourceObjectUrl,
   catalog.imageSourceVerification?.sourceObjectUrl,rEvidence.objectUrl].filter(Boolean);
 const independentOfficial=candidates.find(u=>/^https:\/\//i.test(u) &&
    !/wikimedia\.org|wikipedia\.org|museodelprado|prado/i.test(u));
 const accession=catalog.verifiedMuseumAccession||rEvidence.accession||null;
 const stationNumber=catalog.verifiedStationRoman||rEvidence.exactStation||null;
 return {officialObjectURL:independentOfficial||null,
  museumOrChurch:catalog.imageSourceVerification?.institution||rEvidence.verifiedCollection||rEvidence.museum||null,
  accession,stationNumber,
  curatorPreferredPreviewKey:catalog.preferredImageKey||fmap.get(row.artworkId)?.preferredImageKey||null,
  sourceResearchAuthority:(independentOfficial&&accession)?"INSTITUTIONAL_OBJECT_AND_ACCESSION_RESEARCH":
   independentOfficial?"INSTITUTIONAL_OBJECT_LINK_ONLY":
   stationNumber?"STATION_SEQUENCE_EVIDENCE_ONLY":
   "NO_INDEPENDENT_OBJECT_REFERENCE_IN_LOCAL_REGISTRY"};
}
for(const row of summary.records){
 const c=imap.get(row.artworkId),rec=rmap.get(row.artworkId);
 assert(c&&rec,"Approved source row absent in 451/76 inventory");
 assert(!rejected.has(row.artworkId),"Never resurrect rejected art");
 assert(approved.has(row.artworkId)||legacy.has(row.artworkId),"No approval authority");
 const obj=expectedObject(row,c,rec);
 const isPrado=hasPradoProvenance({id:row.artworkId,sourceObjectUrl:obj.officialObjectURL,
   sourceUrl:c.sourceUrl,location:obj.museumOrChurch});
 assert(!isPrado,"Prado provenance slipped into this new discovery batch");
 const selected=row.remainingFiles.find(f=>f.filePage===row.preliminaryFileForHumanObjectMatch)||null;
 const errors=[];
 if(!selected)errors.push("NO_PRELIMINARY_SOURCE");
 if(!obj.officialObjectURL)errors.push("NO_OFFICIAL_ORIGINAL_OBJECT_PAGE");
 if(!obj.accession&&!obj.stationNumber)errors.push("NO_INDEPENDENT_ACCESSION_OR_STATION_PROOF");
 if(!obj.curatorPreferredPreviewKey)errors.push("NO_CURATOR_PREFERRED_IMAGE_FINGERPRINT");
 if(selected?.sharedAcrossPaintingIDs?.length>1)errors.push("PHOTOGRAPH_REUSED_ACROSS_DIFFERENT_APPROVED_ARTWORKS");
 if(selected?.liveEvidenceStatus!=="METADATA_COHERENT_ONLY"&&selected)errors.push("PRELIMINARY_PHOTO_METADATA_EXCEPTION");
 const sourceConsistency=selected&&c.sourceUrl&&selected.filePage===c.sourceUrl?
  "SAME_FILE_AS_EXISTING_INTAKE_SOURCE":
   rec.sourceEvidence?.verifiedCommonsFile&&selected?.filePage===rec.sourceEvidence.verifiedCommonsFile?
   "SAME_FILE_AS_RESEARCH_VERIFIED_COMMONS_SOURCE":
   "NEW_DISCOVERY_SOURCE_NOT_PREVIOUSLY_FINGERPRINTED_FOR_USER_SELECTION";
 // Matching a specific file previously routed to QA is useful contextual
 // evidence, but never independently proves artwork/photo equivalence.
 const officialIdentityReadiness=!selected?"SOURCE_REQUIRED":
  obj.officialObjectURL&&obj.accession?"OFFICIAL_OBJECT_ACCESSION_CAN_BE_COMPARED":
  obj.officialObjectURL&&obj.stationNumber?"OFFICIAL_STATION_CAN_BE_COMPARED":
  obj.officialObjectURL?"OFFICIAL_OBJECT_RECORD_CAN_BE_COMPARED":
  obj.stationNumber?"STATION_SEQUENCE_CAN_BE_COMPARED":
  "EXACT_ORIGINAL_NOT_DOCUMENTED";
 const originalPreviewHash=obj.curatorPreferredPreviewKey?.split("|")[2]||null;
 if(originalPreviewHash)assert(/^[a-f0-9]{64}$/i.test(originalPreviewHash),"Invalid frozen curator preview hash");
 const result={
  artworkId:row.artworkId,title:row.title,artist:row.artist,
  approvedArtworkIDFrozen:true,
  isLegacyApprovalOnly:!approved.has(row.artworkId)&&legacy.has(row.artworkId),
  comparisonLane:officialIdentityReadiness,
  objectEvidence:obj,
  referencePreviewHashSha256:originalPreviewHash,
  // Preview SHA256 and Commons original-file SHA1 are NOT directly comparable.
  comparisonOfPixels:"NOT_PERFORMED_APPROVED_WEBP_REFERENCE_BYTES_NOT_IN_THIS_ACTION",
  preliminarySource:selected?.filePage||null,
  commonsSourceFileFingerprintSHA1:selected?.liveSHA1||null,
  sourceConsistency,
  allCandidateFiles:row.researchCandidates,
  unresolvedIssues:errors,
  calendarDateLinks:dateCrosswalk.get(row.artworkId)||[],
  photoRightsIndependentlyVerified:false,
  acceptedAsUserChosenPhoto:false,
  originalVisualCompositionCompared:false,
  officialMuseumObjectAndPhotoVerified:false,
  productionMediaReleased:false};
 details.push(result);
}
const counts={approvedArtworkSubjectsReviewed:details.length,
 withPreliminaryPhoto:details.filter(x=>x.preliminarySource).length,
 withoutPreliminaryPhoto:details.filter(x=>!x.preliminarySource).length,
 withIndependentOfficialObjectPage:details.filter(x=>x.objectEvidence.officialObjectURL).length,
 withAccessionOrStationEvidence:details.filter(x=>x.objectEvidence.accession||x.objectEvidence.stationNumber).length,
 withFrozenCuratorReferenceFingerprint:details.filter(x=>x.referencePreviewHashSha256).length,
 photosOnAlreadyDocumentedExactSourceRoute:details.filter(x=>x.sourceConsistency!=="NEW_DISCOVERY_SOURCE_NOT_PREVIOUSLY_FINGERPRINTED_FOR_USER_SELECTION").length,
 photographicMasterApproved:0,
 ratingsModified:0};
const byLane={};for(const x of details)byLane[x.comparisonLane]=(byLane[x.comparisonLane]||0)+1;
counts.byLane=byLane;
const proposal={schema:"AO_SACRED_ART_34_APPROVED_OBJECT_EVIDENCE_RECONCILIATION_V1",
 asOf:"2026-10-20",asRun:"LIVE_RESEARCH_NOT_PUBLICATION",
 sources:["frozen artwork approval register","451-artwork canonical source intake",
  "76-work open-source research ledger","current CI 117-live-Commons evidence",
  "current CI 34-work shortlist","Class I latest 53-date choices"],
 counts,policy:{keepApprovedSubjectsAndPhotoDecisionsDistinct:true,
  filenameIsNotOriginalIdentity:true,approvedPreviewHashNeedsActualPixelReference:true,
  retainPradoSourceEmbargo:true,retainAll5SharedImageHolds:true,
  photoRightsNotCertified:true,neverAutoApproveOrPublish:true,
  noArtworkReRating:true,noMuseumPermissionRequests:true,
  noAppOrCalendarWrite:true},records:details};
mkdirSync(folder,{recursive:true});
writeFileSync(join(folder,"batch-34-frozen-object-provenance.json"),JSON.stringify(proposal,null,2)+"\n");
const csv=s=>'"'+String(s??"").replace(/"/g,'""')+'"';
const lines=["artworkId,title,artist,comparisonLane,officialObjectURL,accession,stationNumber,selectedSourceFile,referencePreviewSHA256,sourceConsistency,unresolvedIssues"];
for(const x of details)lines.push([x.artworkId,x.title,x.artist,x.comparisonLane,
 x.objectEvidence.officialObjectURL,x.objectEvidence.accession,x.objectEvidence.stationNumber,
 x.preliminarySource,x.referencePreviewHashSha256,x.sourceConsistency,
 x.unresolvedIssues.join(";")].map(csv).join(","));
writeFileSync(join(folder,"batch-34-frozen-object-provenance.csv"),lines.join("\n")+"\n");
const parts=[
 ["OFFICIAL_OBJECT_ACCESSION_CAN_BE_COMPARED","Official object + accession"],
 ["OFFICIAL_STATION_CAN_BE_COMPARED","Official San Polo original + station"],
 ["OFFICIAL_OBJECT_RECORD_CAN_BE_COMPARED","Official object page, accession missing"],
 ["STATION_SEQUENCE_CAN_BE_COMPARED","Station identity, primary object page missing"],
 ["EXACT_ORIGINAL_NOT_DOCUMENTED","Exact original not yet documented"],
 ["SOURCE_REQUIRED","No safe preliminary source"]
];
const html=parts.map(([lane,title])=>{
 const rows=details.filter(x=>x.comparisonLane===lane);
 if(!rows.length)return "";
 return '<section><h2>'+esc(title)+' · '+rows.length+'</h2><table><tr><th>Painting</th><th>Institution/source object</th><th>Preliminary photo</th><th>Open gates</th></tr>'+
 rows.map(x=>'<tr><td>'+esc(x.title)+'<small>'+esc(x.artist)+'</small></td><td>'+
 (x.objectEvidence.officialObjectURL?'<a target="_blank" rel="noopener noreferrer" href="'+esc(x.objectEvidence.officialObjectURL)+'">Official object record</a>':'Object URL not yet linked')+
 (x.objectEvidence.accession?'<small>Accession '+esc(x.objectEvidence.accession)+'</small>':'')+
 '</td><td>'+(x.preliminarySource?'<a href="'+esc(x.preliminarySource)+'" target="_blank" rel="noopener noreferrer">Review Commons source</a>':'Held — no safe candidate')+
 '</td><td>'+esc(x.unresolvedIssues.join("; "))+'</td></tr>').join("")+
 '</table></section>';
}).join("");
const doc='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">'+
 '<title>Ad Orientem · 34 approved objects and photographic sources</title><style>body{margin:24px;background:#090d13;color:#e1dbce;font:15px/1.5 Georgia}'+
 'h1,h2{font-weight:400}p,small{color:#ada89d}section{margin:30px 0}table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #43464b;padding:10px;text-align:left;vertical-align:top}'+
 'small{display:block}a{color:#b6d1e4}h2{border-bottom:1px solid #746855;padding-bottom:10px}</style>'+
 '<h1>34 approved artworks — object identity and photography evidence</h1>'+
 '<p>29 preliminary source files and five unresolved. This comparison separates *original museum object identity* from a photograph of it and from the frozen artwork approval. '+ 
 'No candidate is marked physically verified or production-ready without the curator-approved image bytes, photo-rights and handset checks.</p>'+
 '<p>'+counts.withIndependentOfficialObjectPage+' local institutional object links · '+
 counts.withFrozenCuratorReferenceFingerprint+' curator-approved preview SHA references · '+
 counts.photographicMasterApproved+' published media approvals.</p>'+html+'</html>';
writeFileSync(join(folder,"batch-34-frozen-object-provenance.html"),doc);
console.log(JSON.stringify({counts,
 noCandidate:details.filter(x=>!x.preliminarySource).map(x=>x.title),
 previewReferenceOnly:details.filter(x=>x.referencePreviewHashSha256&&!x.objectEvidence.officialObjectURL).length}));
