import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const results=read("data/calendar/sacred-art-p0-51-subject-source-matches-20261012.v1.json");
const worklist=read("data/calendar/sacred-art-134-subject-research-worklist-20261012.v1.json");
const decisions=read("data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json");
const archive=read("data/calendar/sacred-art-candidates.v1.json");
const artworkById=new Map(archive.artworks.map(x=>[x.id,x]));
const indexed=new Map(worklist.subjects.map(x=>[x.subjectId,x]));
const p0=worklist.subjects.filter(x=>x.priority==="P0");
const matched=results.rows.filter(x=>x.paintings.length);
assert.equal(results.schema,"AO_SACRED_ART_P0_51_SOURCE_MATCH_BATCH_20261012_V1");
assert.equal(results.phase,"PHASE_3_4_CANDIDATE_MATCH_GAPS_ONLY");
assert.equal(worklist.summary.total,134);
assert.equal(p0.length,51);
assert.equal(worklist.subjects.filter(x=>x.priority==="P1").length,83);
assert.equal(decisions.counts.selected,101);
assert.equal(results.rows.length,51);
assert.equal(matched.length,44);
assert.equal(results.summary.canonicalDistinctArtworkLeads,44);
assert.equal(results.summary.verifiedObjectProposalAssignments,48);
assert.equal(results.summary.p0WithoutNewObjectMatch,7);
assert.equal(results.summary.rubensApostlePanelMatches,7);
assert.equal(results.summary.sourceImagesAcquired,0);
assert.equal(results.summary.additionalHumanSelections,0);
assert.equal(results.summary.imagesReleased,0);
assert.equal(new Set(results.rows.map(x=>x.subjectId)).size,51);
assert.deepEqual(new Set(results.rows.map(x=>x.subjectId)),new Set(p0.map(x=>x.subjectId)));
const ids=new Map();
for(const row of results.rows){
 const existing=indexed.get(row.subjectId);
 assert.ok(existing);
 assert.equal(row.originalProblem,existing.researchProblem);
 assert.deepEqual(row.oldCandidateIds,existing.previousCandidateArtworkIds);
 assert.equal(row.userSelectionApproved,false);
 assert.equal(row.photoRightsAndAcquisition,"OUT_OF_SCOPE_PHASE_3_4");
 assert.ok(!decisions.decisions.some(x=>x.subject_id===row.subjectId&&x.decision==="selected"));
 for(const p of row.paintings){
  assert.match(p.sourceUrl,/^https:\/\/[^\/]+\/.+/);
  assert.doesNotMatch(p.artist,/El Greco|Fra Angelico/i);
  assert.equal(p.userApproval,false);
  assert.equal(p.appApproved,false);
  assert.equal(p.sourceImageAcquiredInPhase,false);
  assert.equal(p.medium,"painting");
  assert.ok(p.relation&&p.relation.length>10);
  const prev=ids.get(p.canonicalProposalId);
  if(prev) {
   assert.equal(prev.sourceUrl,p.sourceUrl,"A reused image ID cannot resolve to different source originals");
   assert.equal(prev.artist,p.artist);
  }else ids.set(p.canonicalProposalId,p);
  if(p.origin==="CANONICAL_ARCHIVE"){
    const actual=artworkById.get(p.canonicalProposalId);
    assert.ok(actual,"Never claim archival source not actually held");
    assert.equal(actual.source.objectUrl,p.sourceUrl);
    assert.equal(actual.acquisition.originalSha256,p.sha256);
  }else{
    assert.ok(["INSTITUTIONAL_OBJECT","ACADEMIC_DOCUMENTED_CHURCH_PAINTING","INSTITUTIONAL_ART_RESEARCH","MUSEUM_OBJECT_SECONDARY_PHOTOGRAPHIC_SOURCE"].includes(p.origin));
    assert.match(p.sourceUrl,/^https:\/\/(?:www\.)?(?:museodelprado\.es|collections\.louvre\.fr|metmuseum\.org|boijmans\.nl|collections\.augustins\.toulouse\.fr|emuseum\.mfah\.org|catalogo\.beniculturali\.it|archives\.carmeldelisieux\.fr|scuolagrandesanrocco\.org|catedraldesevilla\.es|pop\.culture\.gouv\.fr|onlinecollection\.nationalgallery\.ie|nationalgallery\.org\.uk|utpictura18\.univ-amu\.fr|catalogo\.fondazionezeri\.unibo\.it|lombardiabeniculturali\.it|commons\.wikimedia\.org)\//);
  }
 }
}
const ap=results.rows.filter(x=>x.subjectId.startsWith("SNT-AP"));
const aligned=ap.filter(x=>x.paintings.some(p=>p.artist==="Peter Paul Rubens"&&p.inventory?.startsWith("P0016")));
assert.equal(aligned.length,7,"The same original Rubens Apostle series resolves seven portrait subject gaps");
assert.equal(new Set(aligned.map(x=>x.paintings[0].inventory)).size,7);
assert.equal(results.rows.find(x=>x.subjectId==="DEV-12").specialEditorialGate,"ORIGINAL_ICON_VISUAL_EXCEPTION_UNDECIDED");
assert.equal(results.rows.find(x=>x.subjectId==="DEV-13").specialEditorialGate,"MODERN_SAINT_HISTORICAL_PORTRAIT_AUTHENTICITY_REQUIRED");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-05").specialEditorialGate,"MODERN_SAINT_HISTORICAL_PORTRAIT_AUTHENTICITY_REQUIRED");
assert.equal(results.rows.find(x=>x.subjectId==="DEV-19").paintings[0].canonicalProposalId,"boijmans-1738-ok");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-03").paintings[0].inventory,"INV 1736");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-07").paintings[0].inventory,"P002804");
assert.equal(results.rows.find(x=>x.subjectId==="DEV-05").paintings[0].canonicalProposalId,"met-438434");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-08").paintings[0].canonicalProposalId,"met-437542");
assert.equal(results.rows.find(x=>x.subjectId==="DEV-11").paintings[0].canonicalProposalId,"met-437542");
assert.equal(results.rows.find(x=>x.subjectId==="DEV-10").paintings[0].canonicalProposalId,"louvre-rf-1948-27");
const mark=results.rows.find(x=>x.subjectId==="SNT-EV-01").paintings[0];
const luke=results.rows.find(x=>x.subjectId==="SNT-EV-02").paintings[0];
assert.equal(mark.canonicalProposalId,"prado-juan-ribalta-p002965");
assert.equal(luke.canonicalProposalId,mark.canonicalProposalId,
  "Mark and Luke are depicted in one existing painting, not two separate sources");
assert.equal(mark.inventory,"P002965");
assert.equal(mark.relation,"BOTH_NAMED_EVANGELISTS_IN_SAME_PAINTED_PANEL");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-22").paintings[0].inventory,"P007637");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-19").paintings[0].relation,
  "CONTEXTUAL_NAMED_SAINT_ANSELM_IN_MARIAN_GROUP");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-24").paintings[0].inventory,"0700031704");
assert.equal(results.summary.sharedMarkLukeOriginalPaintings,1);
const thDev=results.rows.find(x=>x.subjectId==="DEV-13").paintings[0];
const thCal=results.rows.find(x=>x.subjectId==="SNT-OT-05").paintings[0];
assert.equal(thDev.canonicalProposalId,thCal.canonicalProposalId,
  "The 1925 Thérèse portrait is one canonical painted object shared by Devotions and Calendar");
assert.equal(thDev.portraitAuthenticity,"POSTHUMOUS_RELATIVE_PAINTED_LIKENESS_NOT_LIFE_SITTING");
assert.equal(results.rows.find(x=>x.subjectId==="DEV-15").paintings[0].observedGospelRelationship,
 "THEMATIC_NOT_APPOINTED_EVENT_VERIFIED",
 "Later handwashing trial must not be called 1962 Christ-the-King John 18 appointed Gospel");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-06").paintings[0].artist,
 "Bartolomé Esteban Murillo");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-08").paintings[0].inventory,
 "MV 8363; INV 5501; AC 1873");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-09").paintings[0].artisticQualityGate,
 "UNFINISHED_SMALL_OIL_SKETCH_VISUAL_REVIEW");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-20").paintings[0].inventory,"NG26");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-13").paintings[0].inventory,"B 746");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-15").paintings[0].inventory,"B 745");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-16").paintings[0].inventory,"B 744");
assert.equal(results.summary.completeBertinGreekDoctorsFromVersailles,3);
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-27").paintings[0].origin,
 "ACADEMIC_DOCUMENTED_CHURCH_PAINTING");
assert.equal(results.summary.sourceAuthenticatedNewAssignmentsInThisTurn,12);
assert.equal(results.summary.researchedCandidatesAddedThisTurn,9);
assert.equal(results.summary.p0UnresolvedWithStrongNewSourceCandidates,44);
assert.equal(results.summary.p0StillNeedingMasterpieceQualityOrIconException,7);
assert.equal(results.summary.userApprovedNewSubjectSelections,0);
assert.equal(results.summary.reproductionWorkInitiatedInCurrentPhase,0);
assert.deepEqual(new Set(results.remainingSevenCuratorialGaps),
 new Set(["DEV-02","DEV-12","SNT-DC-18","SNT-DC-23",
         "SNT-DC-25","SNT-DC-26","SNT-DC-27"]));
for(const id of results.remainingSevenCuratorialGaps) {
 const row=results.rows.find(x=>x.subjectId===id);
 assert.equal(row.status,"OPEN_PAINTING_RESEARCH_QUALITY_GATE");
 assert.equal(row.paintings.length,0);
 assert.ok(row.gapTriage.issue && row.gapTriage.reason);
 assert.ok(row.gapTriage.doNotSubstitute.length);
}

assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-10").paintings[0].inventory,"1894, 92 × 76 cm");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-11").paintings[0].inventory,"0900119548");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-12").paintings[0].inventory,"982.243");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-20").paintings[0].canonicalProposalId,
 "zeri-45874-peter-damian");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-DC-22").paintings[0].inventory,"L0050-00042");
assert.match(results.rows.find(x=>x.subjectId==="SNT-DC-22").paintings[0].note,/conflicts/,
 "Contradictory Bellarmine portrait chronology must not be silently treated as life portrait");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-17").paintings[0].inventory,"PM74001769");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-18").paintings[0].inventory,"PM01002671");
assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-28").paintings[0].origin,
 "MUSEUM_OBJECT_SECONDARY_PHOTOGRAPHIC_SOURCE");
for(const id of ["DEV-02","DEV-12","SNT-DC-18","SNT-DC-23","SNT-DC-25","SNT-DC-26","SNT-DC-27"])
 assert.equal(results.rows.find(x=>x.subjectId===id).paintings.length,0,
 "No weak, flat, unidentified or contextual art may be counted as a strong proposed match");



assert.equal(results.rows.find(x=>x.subjectId==="SNT-OT-01").paintings[0].canonicalProposalId,"louvre-rf-1948-27");
console.log("PASS 51 unresolved P0 subjects: 44 evidence-linked, 48 assignments, 44 canonical painting leads, 7 still open; zero selections/photos/app release changed");
