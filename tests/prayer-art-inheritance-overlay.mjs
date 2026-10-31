import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const base="data/prayer/artwork-editorial-20261030/";
const read=name=>JSON.parse(readFileSync(base+name,"utf8"));
const slots=read("balanced-reuse-20261030-assignments.v2.json").slots;
const original=read("master-map-275-reconciliation-20261031.v1.json");
const b1=read("decision-ledger-b01-b05.v1.json");
const b2=read("approved-unified-b06-b11-from-user-message.v1.json");
const m=read("approved-artwork-inheritance-overlay-20261031.v1.json");
const yes=new Set(["USER_APPROVED","USER_APPROVED_EXISTING_SAINTS_SELECTION","USER_APPROVED_20261030_NEW_ARTWORK_REUSE","USER_FINAL_LOCKED"]);
const ids=new Set([...b1.records.filter(x=>x.prayer_editorial_status==="ACCEPTED_FOR_PRAYER_REVIEW").map(x=>x.artwork_id),...b2.decisions.filter(x=>x.status==="ACCEPTED_AS_SHOWN_IN_UNIFIED_REVIEW").map(x=>x.artwork_id),...slots.flatMap(s=>s.works.filter(w=>yes.has(w.editorial)).map(w=>w.id))]);
const allowed=w=>w.eligible!==false&&(yes.has(w.editorial)||w.editorial==="USER_APPROVED_CROSS_PRAYER_REUSE"&&ids.has(w.id));
const excluded=m.excludedHistoricalArtwork.artworkId;
const actual=new Map(slots.map(s=>[s.slot_id,s]));
const donor=new Map();
for(const s of slots)for(const w of s.works.filter(allowed))if(w.id){const a=donor.get(w.id)||[];a.push(s.slot_id);donor.set(w.id,a);}
assert.equal(original.scope.canonical_editorial_slots,267);
assert.equal(m.summary.historicApprovedSlots,162);
assert.equal(m.summary.currentApprovedSlots,160);
assert.equal(m.summary.currentGaps,107);
assert.equal(m.summary.newSafeReuseSlots,33);
assert.equal(m.summary.remainingGapsAfterSafeReuse,74);
assert.equal(m.summary.contextualProposals,38);
assert.equal(m.summary.newUnpublishedRelationships,119);
assert.equal(m.summary.productionClearedImages,0);
const simon=m.relationships.find(x=>x.slot==="STG-pray.stations-05");
assert.ok(simon,"Approved scene inheritance must cover Simon of Cyrene");
assert.equal(simon.artworkId,"REVIEW::commons:22178536");
assert.equal(simon.approvedDonor,"STG-pray.stations-02");
assert.equal(simon.relationship,"EXACT_SCENE");
assert.equal(simon.sourceEvidence?.nativeFileQA,false);
assert.equal(simon.sourceEvidence?.sourceClaim,"GETTY_OPEN_CONTENT_CC0_AND_COMMONS_PD_MARK");
assert.equal(simon.publishable,false);

assert.equal(m.rules.length,73);
assert.equal(m.relationships.length,119);
const kinds=new Set(["EXACT_SCENE","DEVOTIONAL_SUBJECT","CONTEXTUAL_REVIEW","RESEARCH_REQUIRED","PROTECTED_LOCK"]);
const keys=new Set(),perSlot=new Map();
for(const r of m.rules){
 assert.ok(actual.has(r.slot),"Unknown target "+r.slot);
 assert.ok(kinds.has(r.relationship));
 assert.ok(!keys.has(r.slot),"Duplicate target "+r.slot);keys.add(r.slot);
 perSlot.set(r.slot,r);
 assert.deepEqual(r.artworkIds.length?Array.from(new Set(r.artworkIds)):[],r.artworkIds,"duplicate art id at "+r.slot);
}
const seen=new Set();
for(const e of m.relationships){
 assert.equal(e.relationship,perSlot.get(e.slot)?.relationship);
 assert.ok(perSlot.get(e.slot)?.artworkIds.includes(e.artworkId));
 assert.ok(donor.has(e.artworkId),"Artwork must already have an affirmatively approved donor "+e.artworkId);
 assert.ok(donor.get(e.artworkId).includes(e.approvedDonor),"Bad donor evidence "+e.artworkId);
 assert.notEqual(e.artworkId,excluded,"Do not reuse a later-rejected painting");
 assert.equal(e.exactFileLicense,"NOT_VERIFIED");
 assert.equal(e.photoQA,"NOT_VERIFIED");
 assert.equal(e.publishable,false);
 assert.ok(!actual.get(e.slot).works.some(w=>allowed(w)&&w.id===e.artworkId),"Never duplicate an existing edge "+e.slot);
 const k=e.slot+"::"+e.artworkId;assert.ok(!seen.has(k),"duplicate crosswalk edge");seen.add(k);
}
const count=(kind)=>m.rules.filter(r=>r.relationship===kind).length;
assert.equal(count("EXACT_SCENE"),15);
assert.equal(count("DEVOTIONAL_SUBJECT"),18);
assert.equal(count("CONTEXTUAL_REVIEW"),38);
assert.equal(count("PROTECTED_LOCK"),1);
assert.equal(count("RESEARCH_REQUIRED"),1);
for(const slot of ["STG-pray.stations-03","STG-pray.stations-07","STG-pray.stations-08","STG-pray.stations-09","STG-pray.stations-10","STG-pray.stations-11","STG-pray.benediction-03"]){
 assert.ok(!m.rules.some(r=>r.slot===slot&&["EXACT_SCENE","DEVOTIONAL_SUBJECT"].includes(r.relationship)),"Stage-specific artwork cannot be invented: "+slot);
}
const affected=slots.filter(s=>s.works.some(w=>allowed(w)&&w.id===excluded));
assert.equal(affected.reduce((n,s)=>n+s.works.filter(w=>allowed(w)&&w.id===excluded).length,0),6);
assert.ok(!m.rules.some(r=>r.artworkIds.includes(excluded)));
assert.deepEqual(m.policy.onlyPublicDomainOrCC0ExactImageFiles,true);
assert.deepEqual(m.policy.unverifiedPhotosNotPublished,true);
assert.deepEqual(m.policy.contextualReviewIsNotApproval,true);
assert.equal(m.finalLocksRequiringIdentity.length,3);
console.log(JSON.stringify({status:"PASS",historicalSlots:267,activeWithExisting:160,safeReuseTargets:33,remainingGaps:74,contextualOnly:38,unreleasedLinks:119,rejectedOlderEdges:6,photosPublished:0},null,2));
