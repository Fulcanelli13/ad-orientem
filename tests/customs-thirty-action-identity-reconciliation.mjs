import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=name=>JSON.parse(readFileSync(new URL("../data/customs/master/"+name,import.meta.url),"utf8"));
const r=load("customs-thirty-action-identity-reconciliation-20261026.v1.json");
const original=load("customs-editorial-thirty-review-units-20261026.v1.json");
const master=load("working-master.v1.json");
const ids=new Set(master.records.map(x=>x.id));
const classes={
 PROPOSE_DISTINCT_BOUNDARIED_CUSTOM:18,
 PROPOSE_ENRICH_EXISTING_IDENTITY:3,
 REGIONAL_COMPONENT_OR_VARIANT:2,
 HISTORICAL_CULTURAL_CONTEXT:7,
 EVIDENCE_OR_RITE_HOLD:0
};
assert.equal(r.schema,"AO_CUSTOMS_THIRTY_ACTION_IDENTITY_RECONCILIATION_V1");
assert.equal(r.status,"REVIEW_PROPOSALS_NOT_HUMAN_AUTHORIZED");
assert.equal(r.records.length,30);
assert.equal(original.rows.length,30);
assert.equal(r.counts.approved_new_customs,0);
assert.equal(r.counts.publication_changes,0);
assert.equal(r.guards.no_automatic_minting,true);
assert.equal(r.guards.no_1962_rite_authorization_by_reference,true);
assert.equal(new Set(r.records.map(x=>x.review_key)).size,30);
for(const [kind,expected] of Object.entries(classes)){
 assert.equal(r.records.filter(x=>x.identity_route_proposed===kind).length,expected,kind);
}
const counts=r.counts;
assert.deepEqual([
 counts.distinct_candidate_proposals,
 counts.enrich_existing_proposals,
 counts.regional_variant_component_proposals,
 counts.historical_cultural_context,
 counts.evidence_or_rite_hold
],[18,3,2,7,0]);
const existingOwners=new Set;
for(let i=0;i<r.records.length;i++){
 const x=r.records[i],a=original.rows[i];
 assert.equal(x.review_key,a.review_key);
 assert.equal(x.working_title_en,a.titles.en);
 assert.deepEqual(x.original_source_urls,a.source_urls);
 assert.ok(x.action_identity_rationale_en.length>40);
 assert.ok(x.calendar_and_locality_rule_en.length>30);
 assert.ok(x.outstanding_editorial_gate_en.length>15);
 assert.ok(x.related_not_same_action_ids.every(y=>ids.has(y)||["CRIB-001"].includes(y)),"Unresolved relation target ID");
 assert.equal(x.proposed_approved_canonical_id,null);
 assert.equal(x.publication_state,"RESEARCH_ONLY_PRELIMINARY_ACTION_COMPARISON");
 for(const k of ["canonical_identity_human_approved","source_claims_human_approved","liturgical_authority_human_approved","bilingual_copy_human_approved","calendar_publication_human_approved"])
  assert.equal(x[k],false,"Unauthorized human approval "+x.review_key);
 const isEnrich=x.identity_route_proposed==="PROPOSE_ENRICH_EXISTING_IDENTITY";
 if(isEnrich){
  assert.ok(x.proposed_enrichment_owner_id&&ids.has(x.proposed_enrichment_owner_id),"Enrichment owner must be known master identity");
  assert.equal(master.records.find(y=>y.id===x.proposed_enrichment_owner_id).publication_state,"NOT_APPROVED","No unapproved enrichment should update the published production registry");
  existingOwners.add(x.proposed_enrichment_owner_id);
 }else assert.equal(x.proposed_enrichment_owner_id,null,"No silent group merger");
}
assert.deepEqual([...existingOwners].sort(),["CUST-ADVT-HERBERGSUCHE","CUST-PENTECOST-POLISH-GREENERY"]);
const marian=r.records.filter(x=>x.proposed_enrichment_owner_id==="CUST-ADVT-HERBERGSUCHE");
assert.equal(marian.length,2,"Traveling Advent images from two book/action records must enrich one owner");
const greenery=r.records.filter(x=>x.proposed_enrichment_owner_id==="CUST-PENTECOST-POLISH-GREENERY");
assert.equal(greenery.length,1,"Pentecost Polish greenery must not duplicate the working identity");
const szopka=r.records.find(x=>x.review_key==="OBSERVATION:BULK150-007");
assert.equal(szopka.identity_route_proposed,"REGIONAL_COMPONENT_OR_VARIANT");
assert.ok(szopka.related_not_same_action_ids.every(x=>ids.has(x)));
const cultural=r.records.find(x=>x.review_key==="OBSERVATION:BULK150-001");
assert.equal(cultural.identity_route_proposed,"HISTORICAL_CULTURAL_CONTEXT");
assert.match(cultural.calendar_and_locality_rule_en,/Gregorian/);
for(const idsToNotConfuse of [
 ["MASTER:CUST-XMAS-PROVENCAL-PAIN-CALENDAL","OBSERVATION:BULK150-018"],
 ["MASTER:CUST-XMAS-POLISH-KOLEDNICI","OBSERVATION:BULK150-007"]
])assert.ok(idsToNotConfuse.every(id=>r.records.some(x=>x.review_key===id)),"Keep related but distinct actions separately inspectable");
console.log("PASS Customs 30 review adjudications: 18 distinct proposals, 3 enrichment links to 2 staged owners, 2 components/variants, 7 context-only routes; no formal approval, canonical ID mint, runtime publication or synthetic 1962 rites");
