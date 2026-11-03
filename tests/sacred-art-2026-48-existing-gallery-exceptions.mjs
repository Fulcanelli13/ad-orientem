import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const report=read("artifacts/sacred-art-2026/48-existing-gallery-exception-reconciliation.json");
const audit=read("artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json");
const reuse=read("artifacts/sacred-art-2026/104-existing-seasonal-marian-reuse-proposals.json");
const gallery=read("data/artwork/research-operational-989.v1.json");
const cues=read("data/artwork/2026-existing-gallery-48-exception-cues.v1.json");
assert.equal(report.year,2026);
assert.equal(report.outstandingDates.length,48);
assert.equal(new Set(report.outstandingDates.map(d=>d.date)).size,48);
assert.equal(report.totals.previouslyProvisional,317);
assert.equal(report.totals.originalOutstanding,48);
assert.equal(report.totals.newlyProposedExistingGalleryDays,22);
assert.equal(report.totals.stillWithoutExistingGalleryProposal,26);
assert.equal(report.totals.provisionalWithArtworkLead,339);
assert.equal(report.totals.actualHomepageDatesCertifiedByThisPass,0);
assert.equal(report.constraints.newAcquisition,false);
assert.equal(report.constraints.homepageChanged,false);
assert.equal(report.constraints.productionReleasedCount,0);
assert.equal(report.constraints.manualDateEditorialApprovalRequired,true);
const covered=new Set(audit.dates.filter(d=>d.usableResearchCandidateCount>0).map(d=>d.date));
for(const p of reuse.proposals)if(p.selection)covered.add(p.date);
assert.equal(covered.size,317);
const rem=audit.dates.filter(d=>!covered.has(d.date));
assert.deepEqual(report.outstandingDates.map(d=>d.date),rem.map(d=>d.date));
const group=new Map(gallery.works.map(w=>[w.workGroupId,w]));
const cuesByDate=new Map(cues.cues.map(c=>[c.date,c]));
for(const d of report.outstandingDates){
 const a=rem.find(r=>r.date===d.date);
 assert.equal(d.observedPrincipalId,a.observedPrincipalId);
 assert.deepEqual(d.gospel,a.gospel);
 assert.equal(d.productionPublished,false);
 assert.equal(d.photoRightsCertified,false);
 assert.equal(d.exactGospelSceneCertified,false);
 const cue=cuesByDate.get(d.date);
 const donor=cue?.historicDonorDate?audit.dates.find(x=>x.date===cue.historicDonorDate):null;
 const donorCount=donor?.candidates.filter(c=>
   c.evidenceKind===cue.historicEvidenceKind&&c.title===cue.historicArtworkTitle).length??0;
 assert.equal(d.candidates.length,(cue?.workGroupIds.length??0)+donorCount);
 if(d.candidates.length)assert.equal(d.state,"EXISTING_GALLERY_EDITORIAL_PROPOSAL_NOT_RELEASED");
 else assert.equal(d.state,"NO_EVIDENCED_EXISTING_GALLERY_ASSIGNMENT");
 for(const c of d.candidates){
  if(c.workGroupId){
   assert.ok(group.has(c.workGroupId));
   assert.ok(!group.get(c.workGroupId).historicalExclusion);
  }else{
   assert.ok(c.originalResearchDonorDate);
   assert.ok(donor?.date===c.originalResearchDonorDate);
   assert.equal(c.rightsCategory,"NOT_VERIFIED_FOR_SELECTED_BYTES");
  }
  assert.equal(c.dateEditorialApprovalCertified,false);
  assert.equal(c.productionPublished,false);
  assert.equal(c.sceneDepictionVerified,false);
  assert.equal(c.originalPhotoRightsCertified,false);
  assert.equal(c.originalPhotoQualityCertified,false);
  assert.equal(c.physicalObjectIdentityDedupCertified,false);
 }
}
assert.ok(!cuesByDate.has("2026-07-10"),
 "Rufina of Seville must not be misidentified as Roman martyr Rufina");
const transfiguration=report.outstandingDates.find(d=>d.date==="2026-02-28");
assert.equal(transfiguration.candidateEvidenceKind,"PREVIOUS_DATED_SAME_VERIFIED_GOSPEL");
assert.ok(transfiguration.candidates.some(c=>c.artist==="Raphael"&&
 c.originalResearchDonorDate==="2026-03-01"));
const shepherd=report.outstandingDates.find(d=>d.date==="2026-04-19");
assert.ok(shepherd.candidates.some(c=>/Good Shepherd/i.test(c.artworkTitle)&&
 c.originalResearchDonorDate==="2026-05-26"));
const nain=report.outstandingDates.find(d=>d.date==="2026-05-04");
assert.equal(nain.candidateEvidenceKind,"OLDER_GOSPEL_STUDY_SAME_VERIFIED_GOSPEL");
assert.equal(nain.candidates.length,2);
assert.ok(nain.candidates.every(c=>c.originalResearchDonorDate==="2026-09-06"));
const magdalen=report.outstandingDates.find(d=>d.date==="2026-09-25");
assert.equal(magdalen.candidateEvidenceKind,"GOSPEL_CONTEXT_ICONOGRAPHY");
assert.match(magdalen.editorialNote,/NOT certified/);
const feast=report.outstandingDates.find(d=>d.date==="2026-11-18");
assert.equal(feast.candidateEvidenceKind,"FEAST_PATRON_ICONOGRAPHY");
const easterFeria=report.outstandingDates.find(d=>d.date==="2026-04-23");
assert.equal(easterFeria.candidateEvidenceKind,"HISTORIC_GOSPEL_SUBJECT_NO_DONOR_PERICOPE");
assert.ok(easterFeria.candidates.every(c=>/Good Shepherd/i.test(c.artworkTitle)));
const zero=report.outstandingDates.find(d=>d.date==="2026-05-12");
assert.equal(zero.gospel.reference,null);
assert.equal(zero.candidates.length,0);
const advent=report.outstandingDates.find(d=>d.date==="2026-12-17");
assert.ok(advent.candidates.some(c=>c.artist==="Bernardo Strozzi"&&
 c.originalResearchDonorDate==="2026-12-13"));
console.log("PASS: 48 exceptions assessed; 22 existing-source proposals, 26 still open; nothing published");
console.log(JSON.stringify(report.totals,null,2));
