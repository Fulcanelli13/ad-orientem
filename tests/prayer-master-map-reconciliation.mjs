import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/prayer/artwork-editorial-20261030/";
const read=name=>JSON.parse(readFileSync(dir+name,"utf8"));
const map=read("balanced-reuse-20261030-assignments.v2.json");
const ledger=read("master-map-275-reconciliation-20261031.v1.json");
const q2=read("decision-ledger-b01-b05.v1.json");
const later=read("approved-unified-b06-b11-from-user-message.v1.json");
const qa=read("missing-art-approved-quality-rights-20261030.v1.json");
const positive=new Set(["USER_APPROVED","USER_APPROVED_EXISTING_SAINTS_SELECTION","USER_APPROVED_20261030_NEW_ARTWORK_REUSE","USER_FINAL_LOCKED"]);
const approvedIds=new Set([
 ...q2.records.filter(x=>x.prayer_editorial_status==="ACCEPTED_FOR_PRAYER_REVIEW").map(x=>x.artwork_id),
 ...later.decisions.filter(x=>x.status==="ACCEPTED_AS_SHOWN_IN_UNIFIED_REVIEW").map(x=>x.artwork_id),
 ...map.slots.flatMap(s=>s.works.filter(w=>positive.has(w.editorial)).map(w=>w.id))
]);
const eligible=w=>w.eligible!==false&&(positive.has(w.editorial)||(w.editorial==="USER_APPROVED_CROSS_PRAYER_REUSE"&&approvedIds.has(w.id)));
const rows=map.slots.map(s=>({id:s.slot_id,works:s.works.filter(eligible)}));
assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,"Duplicated canonical editorial slot ID");
const c=ledger.scope;
assert.equal(c.canonical_editorial_slots,rows.length);
assert.equal(c.affirmatively_approved_slots,rows.filter(x=>x.works.length>0).length);
assert.equal(c.zero_affirmative_slots,rows.filter(x=>x.works.length===0).length);
assert.equal(c.approved_placement_edges,rows.reduce((n,x)=>n+x.works.length,0));
assert.equal(c.distinct_concrete_work_ids,new Set(rows.flatMap(x=>x.works.map(w=>w.id).filter(Boolean))).size);
assert.deepEqual(c.final_locked_unresolved_id_slots,rows.flatMap(x=>x.works.filter(w=>!w.id).map(w=>x.id)));
assert.equal(c.workbook_positions,c.canonical_editorial_slots+c.noneditorial_rows);
assert.equal(ledger.noneditorial_rows.length,c.noneditorial_rows);
for(const row of ledger.noneditorial_rows)assert.ok(!rows.some(x=>x.id===row.id),"Alias or navigation miscounted as editorial slot: "+row.id);
assert.ok(ledger.noneditorial_rows.some(x=>x.id==="COV-litany_loreto_current"));
assert.ok(ledger.noneditorial_rows.some(x=>x.id==="STG-daily.morning-01"));
assert.ok(ledger.noneditorial_rows.some(x=>x.id==="STG-daily.evening-01"));
assert.equal(c.photo_files_production_cleared_by_this_audit,0);
const types=qa.items.map(x=>{
 const s=String(x.rights_status||"");
 return /CC_BY|CC-BY/.test(s)?"CONDITIONAL":/TERMS_NOT_VERIFIED|UNCONFIRMED|NEED_EXACT_RECONCILIATION/.test(s)?"UNKNOWN":"PD_CC0_CLAIM";
});
assert.equal(qa.items.length,ledger.photo_source_review.approved_works_reviewed);
assert.equal(types.filter(x=>x==="PD_CC0_CLAIM").length,ledger.photo_source_review.rights_basis_pd_cc0_claims);
assert.equal(types.filter(x=>x==="CONDITIONAL").length,ledger.photo_source_review.rights_with_attribution_or_sharealike_excluded);
assert.equal(types.filter(x=>x==="UNKNOWN").length,ledger.photo_source_review.rights_unknown_or_unverified);
assert.equal(ledger.photo_source_review.production_ready,0);
assert.deepEqual(ledger.publication_policy.strict_source_basis,["PUBLIC_DOMAIN","CC0_1_0"]);
assert.equal(ledger.publication_policy.no_runtime_image_activated,true);
assert.equal(ledger.currentConsolidatedEditorialCoverage.mapped,200);
assert.equal(ledger.currentConsolidatedEditorialCoverage.unmapped,67);
assert.equal(ledger.currentConsolidatedEditorialCoverage.photographsCleared,0);
const newPass=ledger.sourceResearchUpdates.find(x=>x.key==="20261031-exact-stations-baroque");
assert.ok(newPass,"New six-Station image-source QA must be linked from canonical master");
assert.equal(newPass.newlyEditorApproved,0);
assert.equal(newPass.photoFilesCertified,0);
assert.deepEqual(newPass.commerciallyLicensedPhotoExcluded,["STG-pray.stations-10"]);
assert.deepEqual(newPass.pdPhotoReviewPending,["STG-pray.stations-11"]);

assert.ok(Array.isArray(ledger.editorialHardRejections));
const lybaert=ledger.editorialHardRejections.find(x=>x.artist==="Théophile Lybaert");
assert.ok(lybaert,"User rejection of entire Lybaert Stations cycle must be durable");
assert.equal(lybaert.userDecision,"EXPLICIT_REJECTION_ARTISTIC_FIT");
assert.equal(lybaert.mustNotBeSuggested,true);
assert.equal(lybaert.mustNotBeAutomaticallyMatched,true);
assert.equal(lybaert.licenseDoesNotOverrideRejection,true);
const excludedArtists=new Map(ledger.editorialHardRejections.map(x=>[x.artist,x]));
assert.equal(excludedArtists.get("El Greco")?.workFamily,"ALL_ARTWORK");
assert.equal(excludedArtists.get("Fra Angelico")?.workFamily,"ALL_ARTWORK");
assert.equal(excludedArtists.get("Ugolino da Siena")?.workFamily,"The Last Supper");
for(const artist of ["El Greco","Fra Angelico","Ugolino da Siena"]){
 assert.equal(excludedArtists.get(artist)?.mustNotBeSuggested,true);
 assert.equal(excludedArtists.get(artist)?.licenseDoesNotOverrideRejection,true);
}
assert.equal(ledger.editorialExampleAudit.oldIllustrativeSlotMapRowsCorrected,78);
assert.equal(ledger.currentCrossModuleCoverage.canonicalSlots,267);
assert.equal(ledger.currentCrossModuleCoverage.covered,200);
assert.equal(ledger.currentCrossModuleCoverage.gaps,67);
assert.equal(ledger.currentCrossModuleCoverage.productionReadyNewPhotos,0);


console.log(JSON.stringify({gate:"MASTER_275_TO_267_SOURCE_PARITY_NO_IMAGE_RELEASE",slots:rows.length,approved:c.affirmatively_approved_slots,gaps:c.zero_affirmative_slots,edges:c.approved_placement_edges,workIds:c.distinct_concrete_work_ids,extra:c.noneditorial_rows,photoReady:0},null,2));
