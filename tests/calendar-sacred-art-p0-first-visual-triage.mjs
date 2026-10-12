import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const j=read("data/calendar/sacred-art-p0-first-visual-triage-20261012.v1.json");
const source=read("data/calendar/sacred-art-p0-51-subject-source-matches-20261012.v1.json");
const selected=read("data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json");
const authority=new Map(source.rows.map(x=>[x.subjectId,x]));
assert.equal(j.schema,"AO_SACRED_ART_P0_20261012_VISUAL_CURATOR_TRIAGE_V1");
assert.equal(j.status,"ASSISTANT_PRELIMINARY_VISUAL_TRIAGE_NOT_USER_ACCEPTANCE");
assert.equal(selected.counts.selected,101);
assert.equal(j.policy.humanChosenCurrentSelectionsImmutable,101);
assert.equal(j.policy.noAutoApprovals,true);
assert.equal(j.policy.noImageAcquisition,true);
assert.deepEqual(j.policy.excludeArtists,["El Greco","Fra Angelico"]);
assert.equal(j.counts.subjectCards,51);
assert.equal(j.counts.cardsWithCandidates,44);
assert.equal(j.counts.genuineSourceGaps,7);
assert.equal(j.counts.assignments,48);
assert.equal(j.counts.uniqueCandidateWorks,44);
assert.equal(j.counts.previewInspectedWorks,17);
assert.equal(j.counts.previewInspectedSubjectAssignments,18);
assert.equal(j.counts.sourceOnlyWorks,27);
assert.equal(j.counts.shortlistWorks,12);
assert.equal(j.counts.secondaryStudyOrStyleHolds,5);
assert.equal(j.counts.additionalHumanSelections,0);
assert.equal(j.counts.imagesDownloaded,0);
const found=new Set();
const options=j.subjectCards.flatMap(x=>x.options);
for(const x of j.subjectCards){
 const r=authority.get(x.subjectId);
 assert.ok(r, "No candidate without source ledger subject");
 assert.equal(x.options.length,r.paintings.length,"The review may not inflate number of paintings");
 assert.equal(x.selectionStatus,"UNSELECTED_USER_REVIEW_REQUIRED");
 assert.equal(x.noWorkAutoPromoted,true);
 assert.deepEqual(x.options.map(z=>z.canonicalProposalId),r.paintings.map(z=>z.canonicalProposalId));
 for(const o of x.options){
  const record=r.paintings.find(z=>z.canonicalProposalId===o.canonicalProposalId);
  assert.equal(o.artist,record.artist);
  assert.equal(o.title,record.title);
  assert.equal(o.sourceUrl,record.sourceUrl);
  assert.equal(o.iconographicRelation,record.relation);
  assert.equal(o.subjectArtworkApproved,false);
  assert.equal(o.homeHeroApproved,false);
  assert.equal(o.separateReleaseRequirementsStillOutstanding,true);
  assert.equal(o.candidatesAreNotUserSelections,true);
  assert.doesNotMatch(o.artist,/El Greco|Fra Angelico/i);
  assert.ok(["MATCHED_IMAGE_PREVIEW_EXAMINED","INDIVIDUAL_PAINTING_NOT_VISUALLY_EXAMINED"].includes(o.previewInspection));
  if(o.previewInspection==="INDIVIDUAL_PAINTING_NOT_VISUALLY_EXAMINED"){
   assert.equal(o.preliminaryCuratorialTier,"NOT_VISUALLY_ASSESSED_IN_THIS_PASS");
   assert.equal(o.reviewConfidence,"NONE");
  }else{
   found.add(o.canonicalProposalId);
   assert.ok(o.visualAssessment.length>50);
   assert.ok(o.reviewConfidence==="MEDIUM"||o.reviewConfidence==="HIGH");
  }
 }
}
assert.deepEqual(found,new Set(j.inspectedCanonicalObjects));
const find=(id)=>options.find(x=>x.canonicalProposalId===id);
assert.equal(find("boijmans-1738-ok").preliminaryCuratorialTier,"SECONDARY_SMALL_STUDY_NOT_HOMEPAGE_DEFAULT");
assert.equal(find("prado-giaquinto-glory-saints").preliminaryCuratorialTier,"SECONDARY_ROCOCO_STYLE_HOLD");
assert.equal(find("louvre-rf-1948-27").preliminaryCuratorialTier,"PRIORITY_VISUAL_SHORTLIST");
assert.equal(find("prado-rubens-p001647").preliminaryCuratorialTier,"PRIORITY_VISUAL_SHORTLIST");
assert.equal(find("prado-rizi-saint-benedict-idols").preliminaryCuratorialTier,"PRIORITY_VISUAL_SHORTLIST");
assert.equal(find("venice-tintoretto-1566-christ-before-pilate").preliminaryCuratorialTier,"PRIORITY_VISUAL_SHORTLIST_CONTEXTUAL_ONLY");
assert.equal(find("prado-juan-ribalta-p002965").preliminaryCuratorialTier,"NOT_VISUALLY_ASSESSED_IN_THIS_PASS",
 "Never use Matthew/John image to grade separately selected Mark/Luke panel");
assert.equal(find("met-438434").preliminaryCuratorialTier,"NOT_VISUALLY_ASSESSED_IN_THIS_PASS",
 "Do not grade a different Ingres version as the Met original");
assert.equal(find("carmel-lisieux-1925-therese-aux-roses").preliminaryCuratorialTier,"NOT_VISUALLY_ASSESSED_IN_THIS_PASS",
 "Do not grade reproduced 1912 sketch as Céline's 1925 oil");
const pit=j.knownPreviewIdentityPitfalls;
assert.equal(pit.length,3);
assert.equal(pit[0].correctInventory,"P002965");
assert.ok(pit[0].falseSearchMatch.includes("Matthew"));
console.log("PASS P0 visual research: 51 subjects / 44 candidate painting objects / 17 matching previews examined / 12 artistically promising / 5 subordinate / 27 uninspected / 7 gaps / no user approval or photo acquisition");
