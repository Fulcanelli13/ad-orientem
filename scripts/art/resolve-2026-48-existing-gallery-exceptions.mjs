/**
 * Resolve the 48 residual 2026 day-level exceptions against existing gallery
 * evidence only. Preserves human approvals, exact Gospel integrity, rights
 * holds, and all existing curated assignments; does not touch the homepage.
 *
 * Run after build-2026-daily-art-coverage.mjs --gospel-audit and
 * assign-2026-existing-seasonal-marian-reuse.mjs.
 */
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=async p=>JSON.parse(await readFile(resolve(root,p),"utf8"));
const [audit,reuse,gallery,source,cues]=await Promise.all([
  read("artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json"),
  read("artifacts/sacred-art-2026/104-existing-seasonal-marian-reuse-proposals.json"),
  read("data/artwork/research-operational-989.v1.json"),
  read("data/artwork/research-source-records-3205.v1.json"),
  read("data/artwork/2026-existing-gallery-48-exception-cues.v1.json")
]);
assert.equal(audit.dates.length,365);
assert.equal(audit.stats.sourceResolvedGospels,355);
assert.equal(reuse.proposals.length,104);
assert.equal(gallery.works.length,989);
assert.equal(source.records.length,3205);
assert.equal(cues.year,2026);
assert.equal(cues.cues.length,19);
const groups=new Map(gallery.works.map(w=>[w.workGroupId,w]));
const operationalIds=new Set(source.records.filter(s=>
  s.isOperationalCandidate&& !["REJECT","PLACEMENT_REJECT"].includes(s.originalUserDecision)
).map(s=>s.workGroupId));
const cueMap=new Map();
for(const cue of cues.cues){
  assert.match(cue.date,/^2026-\d{2}-\d{2}$/);
  assert.ok(!cueMap.has(cue.date),"Duplicate date cue: "+cue.date);
  assert.ok(cue.workGroupIds.length>0);
  assert.equal(new Set(cue.workGroupIds).size,cue.workGroupIds.length);
  cueMap.set(cue.date,cue);
}
const alreadyCovered=new Set(audit.dates.filter(d=>
  d.usableResearchCandidateCount>0).map(d=>d.date));
for(const p of reuse.proposals){
  if(p.selection){
    assert.ok(!alreadyCovered.has(p.date),"Seasonal proposal overwrites specific candidate: "+p.date);
    alreadyCovered.add(p.date);
  }
}
assert.equal(alreadyCovered.size,317,"Pinned verified 2026 baseline has changed; re-audit cues before applying");
const outstanding=audit.dates.filter(d=>!alreadyCovered.has(d.date));
assert.equal(outstanding.length,48);
for(const cue of cues.cues){
  assert.ok(outstanding.some(d=>d.date===cue.date),
    "Cue targets a date now already covered (or an unknown date): "+cue.date);
}
const output=[];
const matchedKinds={};
const candidateGroupIds=new Set();
for(const day of outstanding){
  const cue=cueMap.get(day.date);
  const candidates=[];
  if(cue){
    assert.equal(day.gospel.reference,cue.gospelReference,
      "Actual selected Proper Gospel changed: "+day.date);
    assert.equal(day.gospel.status,"ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED");
    assert.ok([
      "EXACT_NAMED_SAINT_TITLE","EXACT_NAMED_FEAST_TITLE",
      "EXACT_GOSPEL_STORY_TITLE","FEAST_PATRON_ICONOGRAPHY",
      "GOSPEL_CONTEXT_ICONOGRAPHY","SEASONAL_REUSE_CONTEXT"
    ].includes(cue.matchKind));
    matchedKinds[cue.matchKind]=(matchedKinds[cue.matchKind]??0)+1;
    for(const groupId of cue.workGroupIds){
      const w=groups.get(groupId);
      assert.ok(w&&!w.historicalExclusion,"Unknown or excluded gallery group: "+groupId);
      assert.ok(operationalIds.has(groupId),"No operational source evidence for "+groupId);
      assert.ok(!w.userReviewStates?.some(s=>["REJECT","PLACEMENT_REJECT"].includes(s)));
      assert.doesNotMatch(w.artist??"",/fra angelico|el greco/i);
      assert.doesNotMatch(w.artworkTitle??"",/\bprado\b/i);
      assert.doesNotMatch(w.selectedSourceUrl??"",/museodelprado\.es/i);
      candidateGroupIds.add(groupId);
      candidates.push({
        workGroupId:groupId,canonicalArtworkId:w.canonicalArtworkId??null,
        artworkTitle:w.artworkTitle,artist:w.artist??null,
        selectedSourceUrl:w.selectedSourceUrl??null,
        preferredSourceRecordId:w.preferredRecordId,
        originalUserReviewStates:w.userReviewStates??[],
        rightsQueue:w.queue,rightsCategory:w.rightsCategory??null,
        matchKind:cue.matchKind,
        sceneDepictionVerified:false,
        physicalObjectIdentityDedupCertified:false,
        originalPhotoRightsCertified:false,
        originalPhotoQualityCertified:false,
        dateEditorialApprovalCertified:false,
        productionPublished:false
      });
    }
  }
  output.push({
    date:day.date,liturgicalClass:day.rank,observedTitle:day.observedTitle,
    observedPrincipalId:day.observedPrincipalId,gospel:day.gospel,
    state:cue?"EXISTING_GALLERY_EDITORIAL_PROPOSAL_NOT_RELEASED":
      "NO_EVIDENCED_EXISTING_GALLERY_ASSIGNMENT",
    candidateEvidenceKind:cue?.matchKind??null,
    editorialNote:cue?.reviewNote??"Review prior approved art, seasonal/cycle linkage and older unjoined identifiers; no new acquisitions",
    candidates,alternativeCount:Math.max(0,candidates.length-1),
    exactGospelSceneCertified:false,photoRightsCertified:false,
    productionPublished:false,
    nextAction:cue?
      "CONFIRM_SUBJECT_PHYSICAL_IDENTITY_DATE_APPROVAL_AND_SELECTED_IMAGE_BYTES":
      "RECONCILE_PREEXISTING_APPROVALS_AND_SOURCE_IDS_BEFORE_RESEARCH"
  });
}
const newDays=output.filter(d=>d.candidates.length>0).length;
assert.equal(newDays,19);
const report={
  schema:"AO_2026_48_EXISTING_GALLERY_EXCEPTION_RECONCILIATION_V1",
  year:2026,
  generatedAt:new Date().toISOString(),
  inputs:["365 existing-gallery verified-Gospel audit","104 seasonal/Marian reuse proposals",
    "989 operational artwork groups","3205 original source decisions",
    "19 hand-reviewed existing-gallery subject cues"],
  constraints:{
    newAcquisition:false,manualDateEditorialApprovalRequired:true,
    physicalDedupRequired:true,exactImageRightsAndBytesRequired:true,
    homepageChanged:false,productionReleasedCount:0,
    gospelSceneTitleNotProof:true
  },
  totals:{
    dates:365,previouslyProvisional:alreadyCovered.size,
    originalOutstanding:outstanding.length,
    newlyProposedExistingGalleryDays:newDays,
    newlyProposedCandidateRows:output.reduce((n,d)=>n+d.candidates.length,0),
    distinctArtworkGroupsReferenced:candidateGroupIds.size,
    provisionalWithArtworkLead:alreadyCovered.size+newDays,
    stillWithoutExistingGalleryProposal:outstanding.length-newDays,
    actualHomepageDatesCertifiedByThisPass:0,
    byMatchKind:matchedKinds,
    byUnmatchedClass:output.filter(d=>!d.candidates.length).reduce((a,d)=>
      (a[d.liturgicalClass]=(a[d.liturgicalClass]??0)+1,a),{})
  },
  outstandingDates:output
};
assert.equal(report.totals.provisionalWithArtworkLead+report.totals.stillWithoutExistingGalleryProposal,365);
await mkdir(resolve(root,"artifacts/sacred-art-2026"),{recursive:true});
await writeFile(resolve(root,"artifacts/sacred-art-2026/48-existing-gallery-exception-reconciliation.json"),
  JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report.totals,null,2));
