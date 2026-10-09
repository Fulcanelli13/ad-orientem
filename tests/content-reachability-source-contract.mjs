import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {APP_SURFACES} from "../src/app/contracts.js";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";

const read=p=>readFileSync(p,"utf8"),json=p=>JSON.parse(read(p));
const audit=json("data/app/content-reachability-audit.v1.json");
const nav=json("data/app/content-navigation-registry.v1.json");
const census=json("data/app/content-item-census.v1.json");

assert.equal(audit.schema,"AO_CONTENT_REACHABILITY_AUDIT_V1");
assert.equal(audit.status,"SOURCE_TRACE_NOT_PHONE_ACCEPTANCE");
assert.equal(audit.routes.length,nav.routes.length);
assert.equal(audit.routes.length,63);
assert.equal(audit.kind_entry_points.length,Object.keys(census.entry_point_contracts).length);
assert.equal(audit.kind_entry_points.length,39);
assert.equal(audit.coverage.indexed_leaf_ids,census.total_index_identifiers);
assert.deepEqual(APP_SURFACES,nav.navigation.current_ribbon);
assert.deepEqual(
 new Set(audit.routes.map(x=>x.id)),
 new Set(nav.routes.map(x=>x.id)),
 "route census drift");
assert.deepEqual(
 new Set(audit.kind_entry_points.map(x=>x.kind)),
 new Set(Object.keys(census.entry_point_contracts)),
 "kind/entry contract drift");
assert.ok(audit.routes.every(x=>x.browser_verified===false));
assert.ok(audit.kind_entry_points.every(x=>x.individually_browser_verified===false));
assert.ok(audit.routes.every(x=>x.evidence_paths.length&&x.evidence_paths.every(existsSync)));
assert.equal(audit.summary.confirmed_unreachable_public_items,0,"do not infer confirmed inaccessible items from source alone");

const counts=audit.routes.reduce((a,x)=>(a[x.kind]=(a[x.kind]||0)+1,a),{});
assert.equal(counts.NAV_DESTINATION,6);
assert.equal(counts.FORMATION_FAMILY_LAUNCHER+counts.FORMATION_DONOR_DELEGATION,15);
assert.equal(counts.PRAY_FAMILY_ITEM,23);
assert.equal(counts.EXPLORE_LENS,6);
assert.equal(counts.UNPUBLISHED_HOLD,2);
assert.equal(counts.RETIRED,1);
assert.equal(counts.COMPATIBILITY_CALENDAR,1);
assert.equal(counts.COMPATIBILITY_ALIAS,1);
for(const id of LEARN_MODULE_IDS){
 const route=audit.routes.find(x=>x.id===id);
 assert.ok(route, "missing launcher audit "+id);
 assert.ok(route.kind==="FORMATION_FAMILY_LAUNCHER"||route.kind==="FORMATION_DONOR_DELEGATION");
}
for(const id of ["learn.apologetics","learn.church_crisis"]){
 assert.ok(!LEARN_MODULE_IDS.includes(id),"premature gated public navigation");
 const record=audit.routes.find(x=>x.id===id);
 assert.equal(record.source_trace_status,"INTENTIONALLY_NO_PUBLIC_LAUNCHER");
}
for(const id of ["learn.catholic_life","learn.seasonal_rites"]){
 assert.ok(!LEARN_MODULE_IDS.includes(id),"retired owner promoted");
}
const pray=read("src/pray/presentation-runtime.js");
const learn=read("src/learn/browser-entry.js");
const home=read("src/home/browser-entry.js");
const script=read("src/scripture/browser-entry.js");
const find=read("src/find/browser-entry.js");
const explore=read("src/find/explore-projection.js");
const cate=read("src/learn/catechism-guided-preview-bridge.js");
assert.match(pray,/function prayFamilies\(/);
assert.match(pray,/function renderLibrary\(/);
assert.match(pray,/Object\.values\(DATA\.prayers\|\|\{\}\)/);
assert.match(pray,/pray\.visit_blessed_sacrament/);
assert.match(pray,/pray\.de_profundis/);
assert.match(pray,/pray\.eternal_rest/);
assert.match(learn,/data-ao-learn-module/);
assert.match(learn,/ensureLearnModule/);
assert.match(home,/function openRoute\(route\)/);
assert.match(home,/AO_PRAY_APP_V1\?\.open/);
assert.match(script,/data-ao-scripture-context/);
assert.match(find,/data-find-filter/);
assert.match(explore,/EXPLORE_LENSES=Object\.freeze/);
assert.match(cate,/!preview && !guidedStudyReleaseApproved\(crosswalk\)/);
const cat=read("src/scripture/catalogue.js");
for(const id of ["dr-challoner","cpdv-2009","crampon-1923","vulgate-clementine"])
 assert.ok(cat.includes('"'+id+'"'),"missing edition "+id);
const findings=new Map(audit.findings.map(f=>[f.id,f]));
assert.equal(findings.get("RCH-004").normal_path_defect_confirmed,false);

const g=json("data/geography/seed-registry.v1.json");
const sh=json("data/shrines/shrines-pilgrimages-seed.v1.json");
const p=json("data/explore/sacred-phenomena-seed.v1.json");
const c=json("data/customs/customs-atlas-seed.v1.json");
const n=json("data/customs/novena-context-links.v1.json");
const relatedPlaceIds=new Set([
 ...sh.shrines.map(x=>x.place_id),
 ...p.relics.map(x=>x.place_id),
 ...p.apparitions.map(x=>x.place_id),
 ...c.attestations.map(x=>x.place_id).filter(Boolean),
 ...g.directoryPlaceLinks.map(x=>x.place_id),
 ...n.links.map(x=>x.place_id).filter(Boolean)
]);
const orphanIds=g.places.filter(x=>!relatedPlaceIds.has(x.place_id)).map(x=>x.place_id).sort();
const reviewedIds=audit.orphaned_place_profile_candidates.map(x=>x.place_id).sort();
assert.deepEqual(orphanIds,reviewedIds,"unlinked Place records changed: reconcile with Explore audit, not new duplicate imports");
assert.equal(g.places.length,audit.summary.geographical_place_profile_count);
assert.equal(g.places.length-orphanIds.length,audit.summary.geographical_place_profiles_with_known_lens_relationship);
assert.ok(audit.orphaned_place_profile_candidates.every(x=>x.relationship_status==="NOT_VERIFIED"));

console.log(JSON.stringify({
 status:"SOURCE_CONTRACT_PASS",
 global_destinations:counts.NAV_DESTINATION,
 formation_launcher_paths:counts.FORMATION_DONOR_DELEGATION+counts.FORMATION_FAMILY_LAUNCHER,
 prayer_family_routes:counts.PRAY_FAMILY_ITEM,
 explore_lenses:counts.EXPLORE_LENS,
 audited_route_ids:audit.routes.length,
 audited_content_kinds:audit.kind_entry_points.length,
 verified_browser_interactions:0,
 confidence:"SOURCE_TRACE_ONLY"
},null,2));
