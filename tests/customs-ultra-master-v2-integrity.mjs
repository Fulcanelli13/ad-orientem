import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/customs/master/",import.meta.url);
const get=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const old=get("customs-ultra-master-observation-index-3703-20261030.v1.json");
const refs=get("customs-ultra-master-v2-3703-reference-crosswalk.v1.json");
const identities=get("customs-ultra-master-v2-identity-register-465.v1.json");
const indulgences=get("customs-ultra-master-v2-indulgence-work-audit.v1.json");
const coverage=get("customs-ultra-master-v2-coverage-gates.v1.json");
const pinnedMaster=get("customs-ultra-master-integrated-20261030.v1.json");
const localSeed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const sourceOwners=get("customs-all408-consolidated-editorial-decision-ledger-20261029.v1.json");
assert.equal(old.observations.length,3703);
const eid=new Set(old.observations.map(x=>x.evidence_id));
assert.equal(eid.size,3703);
assert.equal(refs.counts.source_pointers_verified,3703);
assert.equal(refs.counts.source_pointer_errors,0);
assert.equal(refs.verified_group_links.length,408);
assert.equal(refs.unassigned_evidence_ids.length,3295);
const assigned=new Set(refs.verified_group_links.map(x=>x.id));
const unassigned=new Set(refs.unassigned_evidence_ids);
assert.equal(assigned.size,408);assert.equal(unassigned.size,3295);
for(const e of eid)assert.ok(assigned.has(e)||unassigned.has(e),"Missing retained source evidence "+e);
for(const e of assigned)assert.ok(!unassigned.has(e),"Source both assigned and unassigned");
assert.equal(refs.verified_group_links.reduce((s,x)=>s+x.group.length,0),409);
const grouplookup=new Map(sourceOwners.records.map(x=>[x.provisional_group_id,x]));
for(const row of refs.verified_group_links){
 const evidence=old.observations.find(x=>x.evidence_id===row.id);
 assert.ok(evidence);
 for(const gid of row.group){
  assert.ok(grouplookup.has(gid),"Unknown group "+gid);
  assert.ok(grouplookup.get(gid).source_observation_ids.includes(evidence.source_observation_id));
 }
}
assert.equal(identities.records.length,465);
const mids=new Set(identities.records.map(x=>x.id));assert.equal(mids.size,465);
assert.equal(identities.records.filter(x=>x.layer==="MASTER_IDENTITY").length,57);
assert.equal(identities.records.filter(x=>x.layer==="PROVISIONAL_GROUP").length,408);
assert.equal(identities.records.filter(x=>x.publication_state==="PUBLISHED").length,36);
assert.equal(identities.records.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.equal(pinnedMaster.counts.main_published,36,"Master must retain PENT-001 from current main");
assert.equal(pinnedMaster.master_identities.length,57);
assert.ok(identities.records.some(x=>x.id==="PENT-001"&&x.publication_state==="PUBLISHED"));
assert.equal(localSeed.customs.filter(x=>x.publication_state==="PUBLISHED").length<=36,true,"Never claim unmerged research branch canonical seed is current main");
assert.deepEqual(new Set(pinnedMaster.master_identities.filter(x=>["PUBLISHED","CONTEXT_ONLY"].includes(x.publication_state_current_main)).map(x=>x.id)),new Set(identities.records.filter(x=>x.layer==="MASTER_IDENTITY"&&["PUBLISHED","CONTEXT_ONLY"].includes(x.publication_state)).map(x=>x.id)));
for(const x of identities.records.filter(x=>x.layer==="PROVISIONAL_GROUP"))assert.equal(x.identity_approved_for_publication,false);
assert.equal(indulgences.screening_by_identity.length,465);
assert.equal(new Set(indulgences.screening_by_identity.map(x=>x.identity_id)).size,465);
assert.equal(indulgences.current_grant_work_seeds.length,7);
assert.equal(indulgences.screening_by_identity.reduce((n,x)=>n+x.candidate_work_matches.length,0),8);
assert.equal(indulgences.historic_grant_cases.length,4);
assert.equal(indulgences.original_observation_indulgence_mentions.length,5);
for(const c of indulgences.historic_grant_cases)assert.equal(c.can_appear_as_current_grant,false);
for(const x of indulgences.screening_by_identity){assert.equal(x.universal_indulgence_attached_to_this_custom,false);assert.equal(x.historical_1962_raccolta_verified,false);}
assert.equal(coverage.progress.evidence_directly_linked_to_group.not_directly_linked,3295);
assert.equal(coverage.progress.historical_indulgence_original_grants_verified.done,0);
assert.equal(coverage.release_freeze,"RESEARCH_ONLY");
console.log("PASS Customs Ultra-Master v2: all 3,703 retained, 408 linked evidence/3295 separately indexed, 465 identities, 0 unpublished grants, zero canonical writes");
