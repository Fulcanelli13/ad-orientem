import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const path="data/artwork/";
const choices=load(path+"sacred-art-2026-class-ii-batch01-curatorial-proposals-20261110.v1.json");
const slate=load(path+"sacred-art-2026-class-ii-existing-match-review-slate-20261110.v1.json");
const master=load(path+"sacred-art-2026-coverage-first-master-20261110.v1.json");
assert.equal(choices.schema,"AO_SACRED_ART_CLASS_II_2026_BATCH01_CURATORIAL_PROPOSALS_V1");
assert.equal(choices.rows.length,25);
assert.equal(choices.count.dates,25);
assert.equal(new Set(choices.rows.map(x=>x.date)).size,25);
assert.deepEqual(new Set(choices.rows.map(x=>x.date)),new Set(slate.batch01First25ExistingMatchReview.map(x=>x.date)));
assert.equal(choices.count.approvedDateBindings,0);
assert.equal(choices.count.newPhotoAssets,0);
for(const r of choices.rows){
  const prior=slate.all75ClassIIDateMatchingCandidates.find(x=>x.date===r.date);
  assert.ok(prior,r.date);
  assert.equal(r.observance,prior.observance,r.date);
  assert.equal(r.principalId,prior.principalId,r.date);
  assert.equal(r.ownerApprovedForThisDate,false,r.date);
  assert.equal(r.productionImageCertifiedForThisDate,false,r.date);
  assert.equal(r.changeToCalendarRuntimeInThisBatch,false,r.date);
  if(r.proposedArtwork){
    assert.ok(prior.candidates.some(c=>c.title===r.proposedArtwork.title&&
      c.artist===r.proposedArtwork.artist&&c.artworkId===r.proposedArtwork.artworkId&&
      !c.excludedByUserPreferredArtistPolicy),r.date);
  }else{
    assert.ok(r.editorialTriage==="PREFER_BAROQUE_ALTERNATIVE"||
      r.editorialTriage.startsWith("EXISTING_APPROVED_WORK_FROM_OTHER"),r.date);
  }
}
const statuses=Object.fromEntries([...new Set(choices.rows.map(r=>r.editorialTriage))]
  .map(s=>[s,choices.rows.filter(r=>r.editorialTriage===s).length]));
assert.deepEqual(choices.count.triage,statuses);
const marian=choices.rows.find(x=>x.date==="2026-08-22");
assert.equal(marian.proposedArtwork.title,"The Heart of Mary");
assert.ok(marian.proposedArtwork.existingPrayerApprovedSlots.some(x=>x.runtimeState==="PUBLISHED_EXACT_PHOTO"));
const tr=choices.rows.find(x=>x.date==="2026-08-06");
assert.equal(tr.externalReuseReference.calendarDate,"2026-03-01");
assert.equal(master.calendar.days.find(x=>x.date==="2026-03-01").selectedArt.artist,"Raphael");
assert.equal(choices.rows.find(x=>x.date==="2026-02-02").externalReuseReference.prayerSlot,"HERO-04");
console.log("PASS 25 Class II editorial proposals against the original 75-date slate; no unapproved date publication");
