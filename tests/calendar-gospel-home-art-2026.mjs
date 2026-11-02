import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {homeCalendarGospelArtworkEvidence,DAILY_ART_EVIDENCE_VERSION}
  from "../src/home/calendar-gospel-artwork-evidence.js";

const snapshot=JSON.parse(readFileSync(new URL(
  "../data/calendar/research/2026-calendar-gospel-home-artwork-source-crosswalk.v1.json",
  import.meta.url),"utf8"));
assert.match(DAILY_ART_EVIDENCE_VERSION,/calendar-gospel-artwork/);
assert.equal(snapshot.dates.length,365);
assert.equal(new Set(snapshot.dates.map(x=>x.date)).size,365);
for(let i=0;i<snapshot.dates.length;i++){
  const expected=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10);
  const row=snapshot.dates[i];
  assert.equal(row.date,expected);
  assert.match(row.observedPrincipalId,/^.+:[1-4]:[a-z]+$/i);
  assert.ok(row.observedTitle);
  assert.equal(row.gospel.verifiedAgainstActualSelectedLatin,false);
  assert.equal(row.productionHomepageImageVerified,false);
  assert.equal(row.historicArtApprovedForProduction,false);
}
const count=predicate=>snapshot.dates.filter(predicate).length;
assert.equal(count(x=>!!x.gospel.indexCandidateReference),snapshot.counts.indexedGospelLeads);
assert.equal(count(x=>!!x.approvedDatePainting),10);
assert.equal(count(x=>x.approvedDatePainting?.remotePreviewAvailable),8);
assert.equal(count(x=>x.approvedDatePainting&&!x.approvedDatePainting.remotePreviewAvailable),2);
assert.equal(snapshot.counts.productionHomepageImagesVerified,0);
assert.equal(snapshot.counts.gospelVerifiedAgainstResolvedProper,0);
for(const day of ["2026-10-25","2026-11-29"]){
  const row=snapshot.dates.find(x=>x.date===day);
  assert.ok(row.approvedDatePainting);
  assert.equal(row.approvedDatePainting.remotePreviewAvailable,false);
}

const make=(date,id,path,gospel=null)=>({
  date,status:"ready",day:{main:{id,title:"Observed Mass"}},
  proper:{status:"ready",sourcePath:path,data:{sourcePath:path,name:"Observed Mass",
    ...(gospel?{gospel}:{})}}
});
const missing=homeCalendarGospelArtworkEvidence({date:"2026-01-01"});
assert.equal(missing.status,"DAY_UNRESOLVED");
assert.equal(missing.gospel.status,"NOT_VERIFIED");
const allSaints=homeCalendarGospelArtworkEvidence({
  date:"2026-11-01",
  resolution:make("2026-11-01","sancti:11-01:1:w","Sancti/11-01")
});
assert.equal(allSaints.approvedArtwork.artist,"Carlo Saraceni");
assert.equal(allSaints.approvedArtwork.relationToGospel,"NOT_ASSERTED");
assert.equal(allSaints.homepageRenderedImageVerified,false);
assert.equal(allSaints.homepageArtworkState,"APPROVED_DATE_PREVIEW_NOT_OFFLINE_CERTIFIED");
const held=homeCalendarGospelArtworkEvidence({
  date:"2026-11-29",
  resolution:make("2026-11-29","tempora:Adv1-0:1:v","Tempora/Adv1-0")
});
assert.equal(held.homepageArtworkState,"APPROVED_ART_SOURCE_HELD");
assert.equal(held.approvedArtwork.imagePreview,null);
const wrongFeast=homeCalendarGospelArtworkEvidence({
  date:"2026-11-01",
  resolution:make("2026-11-01","sancti:11-02m1:1:b","Sancti/11-02m1")
});
assert.equal(wrongFeast.approvedArtwork,null);

const latin="Si quis diligit me sermonem meum servabit et Pater meus diliget eum";
const pent=homeCalendarGospelArtworkEvidence({
  date:"2026-05-24",
  resolution:make("2026-05-24","tempora:Pasc7-0:1:r","Tempora/Pasc7-0",
    {lat:latin,reference:"John 14:23–31"})
});
assert.equal(pent.gospel.status,"VERIFIED_FROM_SELECTED_PROPER");
assert.equal(pent.gospel.reference,"John 14:23–31");
assert.equal(pent.approvedArtwork.artist,"Jean II Restout");
assert.equal(pent.gospelArtworkMatch,"NOT_VERIFIED");
const contradiction=homeCalendarGospelArtworkEvidence({
  date:"2026-05-24",
  resolution:make("2026-05-24","tempora:Pasc7-0:1:r","Tempora/Pasc7-0",
    {lat:latin,reference:"Luke 18:9–14"})
});
assert.equal(contradiction.gospel.status,"NOT_VERIFIED","Conflicting reference must fail closed");
const excluded=homeCalendarGospelArtworkEvidence({
  date:"2026-01-01",
  resolution:make("2026-01-01","sancti:01-01:1:w","Sancti/01-01"),
  artProvider:{
    effectiveRow:()=>({status:"GREEN",primaryArtId:"AO015"}),
    effectiveArtwork:()=>({artist:"El Greco",title:"Pentecost",file:"x.jpg"})
  }
});
assert.equal(excluded.legacyCandidate.status,"EXCLUDED_BY_USER_ART_POLICY");
assert.equal(excluded.homepageArtworkState,"NO_CERTIFIED_DATE_ARTWORK");
assert.equal(excluded.homepageRenderedImageVerified,false);
console.log("365-day historical index and source-gated Calendar/Gospel/Home art evidence: PASS");
