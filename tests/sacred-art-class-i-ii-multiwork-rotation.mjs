import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {certifiedHomeArtworkCandidates,createHomeArtworkVisitRotator} from "../src/home/sacred-art-visit-rotation.js";
const master=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-class-i-ii-multiwork-crosswalk.v1.json",import.meta.url),"utf8"));
const reverse=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-all383-artwork-reverse-index.v1.json",import.meta.url),"utf8"));
assert.equal(reverse.artworks.length,383);
assert.equal(new Set(reverse.artworks.map(a=>a.artworkId)).size,383);
assert.equal(reverse.statistics.catalogueIdsLinkedToClassIOrII,79);
assert.equal(reverse.statistics.catalogueIdsNotYetLinkedToClassIOrII,304);
assert.equal(reverse.statistics.historicallyApprovedArtworkIds,107);
assert.equal(reverse.statistics.historicallyApprovedArtworkIdsWithAtLeastOneIorIILink,28);
assert.equal(reverse.artworks.reduce((n,a)=>n+a.dateLinks.length,0),85);
for(const a of reverse.artworks){
  assert.equal(a.publicationStatus,"NO_NEW_RELEASE_APPROVED");
  for(const d of a.dateLinks){
    const row=master.dates.find(x=>x.date===d.date);
    assert.ok(row,"no invented date in reverse index");
    assert.equal(row.observedPrincipalId,d.observedPrincipalId);
    assert.ok(row.exactSubjectCatalogueCandidates.some(x=>x.artworkId===a.artworkId));
  }
}
assert.equal(master.dates.length,129,"all 53+76 observed Class I/II principal dates");
assert.equal(master.dates.filter(d=>d.liturgicalRank==="I").length,53);
assert.equal(master.dates.filter(d=>d.liturgicalRank==="II").length,76);
assert.equal(new Set(master.dates.map(d=>d.date)).size,129);
assert.equal(master.dates.filter(d=>d.exactSubjectCatalogueCandidates.length>1).length,15);
assert.equal(master.dates.reduce((n,d)=>n+d.exactSubjectCatalogueCandidates.length,0),85);
assert.equal(master.dates.reduce((n,d)=>n+d.additionalInstitutionalResearchLeads.length,0),13);
assert.equal(master.dates.filter(d=>d.liturgicalRank==="I"&&d.selectedPrimary).length,53);
for(const d of master.dates){
  assert.ok(/^(sancti|tempora):/.test(d.observedPrincipalId));
  assert.equal(d.homepageRotationPolicy.releaseCertifiedWorks,0);
  assert.equal(new Set(d.exactSubjectCatalogueCandidates.map(c=>c.artworkId)).size,d.exactSubjectCatalogueCandidates.length);
  for(const candidate of d.exactSubjectCatalogueCandidates){
    assert.notEqual(candidate.editorialStatus,"REJECTED");
    assert.equal(candidate.homepageRotationReleaseCertified,false);
    assert.ok(candidate.artworkId);
  }
  for(const lead of d.additionalInstitutionalResearchLeads)assert.equal(lead.homepageRotationReleaseCertified,false);
}
assert.equal(master.dates.find(d=>d.date==="2026-04-02").selectedPrimary.artist,"Philippe de Champaigne");
assert.equal(master.dates.find(d=>d.date==="2026-12-25").selectedPrimary.artworkId,"cma-143644");
assert.equal(master.dates.find(d=>d.date==="2026-12-08").selectedPrimary.artworkId,"cma-135659");
assert.equal(master.dates.find(d=>d.date==="2026-01-13").exactSubjectCatalogueCandidates.length,4);
assert.ok(master.dates.find(d=>d.date==="2026-09-08").additionalInstitutionalResearchLeads.length>=2);
const iso="2026-03-25",principal="sancti:03-25:1:w",hash="a".repeat(64);
const valid=(physicalObjectId,artist,title,extra={})=>({
  date:iso,observedPrincipalId:principal,physicalObjectId,artist,title,
  localImagePath:"assets/sacred-art/published/"+physicalObjectId+".webp",
  localImageSha256:hash,productionReleaseCertified:true,
  dateEditorialStatus:"USER_APPROVED_FOR_DATE",
  iconographicRole:"EXACT_LITURGICAL_SUBJECT",
  exactPaintingIdentityVerified:true,
  reproductionLicenceVerifiedForApp:true,
  photoCompositionQa:"PASS",homePhoneCropQa:"PASS",...extra
});
const candidates=[
 valid("p1","A Artist","Annunciation",{isProtectedDatePrimary:true}),
 valid("p2","B Artist","Annunciation"),
 valid("p2","B Artist","Annunciation duplicate alternate photo",{localImageSha256:"b".repeat(64)}),
 valid("wrong-day","C Artist","Annunciation",{date:"2026-12-25"}),
 valid("wrong-feast","D Artist","Annunciation",{observedPrincipalId:"sancti:03-24:3:w"}),
 valid("unclear-rights","E Artist","Annunciation",{reproductionLicenceVerifiedForApp:false}),
 valid("rejected","F Artist","Annunciation",{dateEditorialStatus:"NOT_APPROVED"}),
 valid("thematic","G Artist","Holy Family",{iconographicRole:"CONTEXTUAL_UNAPPROVED"}),
 valid("bad-file","H Artist","Annunciation",{localImagePath:"https://example.com/art.jpg"}),
 valid("no-crop","I Artist","Annunciation",{homePhoneCropQa:"HOLD"})
];
assert.deepEqual(certifiedHomeArtworkCandidates({date:iso,observedPrincipalId:principal,placements:candidates}).map(x=>x.physicalObjectId),["p1","p2"]);
const backing=new Map();
const storage={getItem:key=>backing.get(key)||null,setItem:(key,value)=>backing.set(key,value)};
const rotator=createHomeArtworkVisitRotator({storage});
const request={date:iso,observedPrincipalId:principal,placements:candidates};
const first=rotator.forVisit({...request,visitKey:"home-entry-1"});
assert.equal(first.physicalObjectId,"p1");
assert.equal(first.rotationTotal,2);
assert.equal(rotator.forVisit({...request,visitKey:"home-entry-1"}),first,"same visit and rerender must not rotate");
assert.equal(rotator.forVisit({...request,visitKey:"home-entry-2"}).physicalObjectId,"p2");
assert.equal(rotator.forVisit({...request,visitKey:"home-entry-3"}).physicalObjectId,"p1");
assert.equal(rotator.forVisit({...request,visitKey:"home-entry-3"}).imageInfo.artist,"A Artist");
assert.equal(rotator.forVisit({date:iso,observedPrincipalId:"sancti:03-27:3:w",visitKey:"wrong",placements:candidates}),null);
assert.equal(rotator.forVisit({date:iso,observedPrincipalId:principal,visitKey:"none",placements:[]}),null);
assert.throws(()=>rotator.forVisit({...request,visitKey:""}),/visitKey/);
const fails=createHomeArtworkVisitRotator({storage:{getItem(){throw Error("privacy mode")},setItem(){throw Error("privacy mode")}}});
assert.equal(fails.forVisit({...request,visitKey:"private"}).physicalObjectId,"p1");
console.log("Sacred Art: 129 dated Class I/II rows, 85 initial links, 13 museum leads; exact-source guarded rotation passes.");
