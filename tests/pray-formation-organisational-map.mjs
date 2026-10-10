import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const json=path=>JSON.parse(read(path));
const map=json("data/app/pray-formation-organisational-map.v1.json");
const navigation=json("data/app/content-navigation-registry.v1.json");
const guides=json("data/app/guide-coverage-two-function-audit.v1.json");
const prayerLeaf=json("data/app/content-items-pray.v1.json");
const formationLeaf=json("data/app/content-items-formation.v1.json");
const ethicsLeaf=json("data/app/content-items-sexual-ethics.v1.json");
const apostolateLeaf=json("data/app/content-items-apostolate.v1.json");
const prayerSource=read("src/pray/presentation-runtime.js");
const familySource=prayerSource.slice(prayerSource.indexOf("function prayFamilies()"),prayerSource.indexOf("function prayFamilyDoor("));

assert.equal(map.schema,"AO_PRAY_FORMATION_ORGANISATIONAL_MAP_V1");
assert.equal(map.status,"APPROVAL_CANDIDATE_NOT_RUNTIME_MIGRATION");
const unique=(entries,label)=>{
  const ids=entries.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length,label+" duplicates a content ID");
  return ids;
};
const sort=x=>[...x].sort();
const prayerEntries=map.pray.entries;
assert.equal(prayerEntries.length,23);
const srcPray=[...familySource.matchAll(/\\['(?:own|external)','([^']+)'/g)].map(x=>x[1]);
assert.equal(srcPray.length,22,"Prayer runtime source family count changed");
const srcLazy=[...familySource.matchAll(/\\['external','([^']+)'/g)].map(x=>x[1]);
assert.equal(srcLazy.length,10,"Prayer lazy routes changed");
assert.ok(familySource.includes("direct:'pray.library'"));
assert.deepEqual(sort(unique(prayerEntries,"Prayer")),sort([...srcPray,"pray.library"]));
assert.deepEqual(sort(map.pray.landing.families.map(x=>x.id)),sort(["daily_marian","before_the_blessed_sacrament","penance_and_passion","devotions_and_novenas","prayer_library"]));
for(const item of prayerEntries){
  assert.ok(map.pray.landing.families.some(x=>x.id===item.proposed_group),item.id+" is ungrouped");
  const declaration=navigation.routes.find(x=>x.id===item.id);
  assert.equal(item.canonical_owner,declaration?.canonical_owner,item.id+" ownership mismatch");
  if(srcLazy.includes(item.id))assert.equal(item.current_handoff,"lazy_external",item.id+" lost lazy entry");
}
assert.equal(prayerEntries.filter(x=>x.proposed_group==="daily_marian").length,5);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="before_the_blessed_sacrament").length,4);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="penance_and_passion").length,5);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="devotions_and_novenas").length,8);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="prayer_library").length,1);

const formationEntries=map.formation.entries;
assert.equal(formationEntries.length,15);
assert.deepEqual(sort(unique(formationEntries,"Formation")),sort(LEARN_MODULE_IDS));
for(const item of formationEntries){
  assert.ok(map.formation.groups.some(x=>x.id===item.primary_group),item.id+" is ungrouped");
  assert.equal(item.canonical_owner,navigation.routes.find(x=>x.id===item.id)?.canonical_owner,item.id+" owner mismatch");
}
const gated=["learn.apologetics","learn.church_crisis"];
const retired=["learn.catholic_life","learn.seasonal_rites"];
assert.deepEqual(sort(map.formation.unpublished_routes),sort(gated));
assert.deepEqual(sort(map.formation.retired_compatibility),sort(retired));
for(const id of [...gated,...retired])assert.ok(!formationEntries.some(x=>x.id===id),id+" published accidentally");

const apostolate=map.apostolate.entries;
assert.equal(apostolate.length,36);
const sourceScenarios=apostolateLeaf.items.filter(x=>x.kind==="apostolate-scenario");
assert.deepEqual(sort(unique(apostolate,"Apostolate")),sort(sourceScenarios.map(x=>x.id)));
assert.equal(apostolate.filter(x=>x.proposed_group==="answer_questions").length,8);
assert.equal(apostolate.filter(x=>x.proposed_group==="help_others").length,15);
assert.equal(apostolate.filter(x=>x.proposed_group==="introduce_the_faith").length,13);
for(const item of apostolate)assert.equal(item.canonical_owner,"apostolate");

assert.equal(map.pray.leaf_projections.length,100);
assert.deepEqual(sort(unique(map.pray.leaf_projections,"Prayer leaf")),sort(prayerLeaf.items.map(x=>x.id)));
for(const x of map.pray.leaf_projections){
  assert.ok(prayerEntries.some(item=>item.id===x.launch_route),x.id+" points to missing Prayer entry");
  assert.equal(x.canonical_owner,"pray");
}
const sourceKinds=(items,kindField="kind")=>Object.fromEntries([...new Set(items.map(x=>x[kindField]))].map(kind=>[kind,items.filter(x=>x[kindField]===kind).length]));
assert.deepEqual(map.content_census.pray.by_kind,sourceKinds(prayerLeaf.items,"type"));
assert.deepEqual(map.content_census.formation.by_kind,sourceKinds(formationLeaf.items));
assert.deepEqual(map.content_census.sexual_ethics.by_kind,sourceKinds(ethicsLeaf.items));

assert.equal(map.connections.registry_declared_handoffs.length,15);
assert.deepEqual(map.connections.registry_declared_handoffs.map(x=>[x.from,x.to,x.action]),navigation.cross_module_handoffs.map(x=>[x.from,x.to,x.action]));
const reachable=new Set([...prayerEntries,...formationEntries,...apostolate].map(x=>x.id));
assert.equal(map.connections.editorially_proposed_item_links.length,20);
for(const link of map.connections.editorially_proposed_item_links){
  assert.ok(reachable.has(link.from),link.from+" unknown origin");
  assert.ok(reachable.has(link.to),link.to+" unknown target");
  assert.equal(link.state,"PROPOSED_NOT_WIRED","Proposal must not masquerade as implemented navigation");
  assert.equal(link.return_to_origin_required,true);
}
const guideById=new Map(guides.routes.map(x=>[x.id,x]));
for(const item of [...prayerEntries,...formationEntries]){
  const g=guideById.get(item.id);
  assert.equal(item.guide_source_evidence.information,g?.information_status,item.id+" guide info status drift");
  assert.equal(item.guide_source_evidence.walkthrough,g?.walkthrough_status,item.id+" guide walkthrough drift");
}
assert.equal(map.acceptance.runtime_implemented,false);
assert.equal(map.acceptance.phone_verified,false);
console.log("PASS Pray-Formation IA: 23 Prayer doors, 15 Formation entries, 36 Apostolate scenarios, 100 Prayer leaves, 15 declared handoffs, 20 unimplemented proposals; publication gates intact");
