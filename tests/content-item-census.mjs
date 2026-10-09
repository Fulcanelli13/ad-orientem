import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { APP_SURFACES } from "../src/app/contracts.js";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const load=p=>JSON.parse(readFileSync(p,"utf8"));
const idx=load("data/app/content-item-census.v1.json");
const nav=load("data/app/content-navigation-registry.v1.json");
const expected=[
 ["pray",100],["formation",860],["sexual-ethics",255],
 ["reference",1030],["explore",1282],["apostolate",45],["directory-partial",277]
];
assert.equal(idx.schema,"AO_CONTENT_ITEM_CENSUS_INDEX_V1");
assert.equal(idx.status,"INTERNAL_CENSUS_NOT_PUBLICATION");
assert.deepEqual(nav.navigation.current_ribbon,APP_SURFACES);
assert.deepEqual(nav.navigation.proposed_ribbon,["today","mass","pray","learn","explore"]);
assert.equal(idx.shards.length,expected.length);
const unique=new Set(),rows=[],byKind={};
for(let i=0;i<expected.length;i++){
 const [name,count]=expected[i],descriptor=idx.shards[i];
 assert.equal(descriptor.name,name);
 assert.equal(descriptor.count,count,name+" count drift");
 assert.ok(existsSync(descriptor.path),"missing shard "+descriptor.path);
 const shard=load(descriptor.path);
 assert.equal(shard.schema,"AO_CONTENT_ITEM_SHARD_V1");
 assert.equal(shard.items.length,count);
 for(const item of shard.items){
  assert.equal(typeof item.id,"string");
  assert.ok(!unique.has(item.id),"duplicate global inventory ID "+item.id);
  unique.add(item.id);
  assert.ok(item.source&&existsSync(item.source),"missing authority file "+item.id);
  assert.ok(item.source_key,"missing source selector "+item.id);
  assert.ok(item.owner,"missing canonical owner "+item.id);
  assert.ok(item.publication_state,"missing publication classification "+item.id);
  assert.equal(item.browser_verified,false,"cannot pretend actual browser verification: "+item.id);
  const kind=item.kind??item.type;byKind[kind]=(byKind[kind]||0)+1;
  rows.push(item);
 }
}
assert.equal(rows.length,idx.total_index_identifiers);
assert.equal(rows.length,3849);
const findKind=kind=>rows.filter(x=>(x.kind??x.type)===kind);
const checkKind=(kind,n)=>assert.equal(byKind[kind],n,kind+" census drift");
for(const [kind,n] of Object.entries({
 "prayer":48,"rosary-mystery":20,"novena":16,"stations-stage":14,"devotional-programme":2,
 "apologetics-dossier":60,"church-crisis-dossier":81,
 "catechism-question-witness":433,"learn-faith-archival-lesson":54,"learn-faith-order-candidate":55,
 "formation-research-evidence":123,"latin-lesson":40,"spiritual-life-lesson":14,
 "sexual-ethics-question":150,"sexual-ethics-topic":50,"sexual-ethics-debate":55,
 "glossary-concept":450,"latin-lexeme":350,"latin-phrase":80,"scripture-edition":4,
 "place":181,"shrine":177,"pilgrimage":205,"apparition":32,"relic":121,
 "custom":13,"custom-attestation":71,"pilgrimage-route":20,
 "apostolate-scenario":36,"apostolate-skill":9,
 "provider-venue-evidence":243
}))checkKind(kind,n);
const topics=new Map(findKind("sexual-ethics-topic").map(x=>[x.id,x]));
for(const qa of findKind("sexual-ethics-question"))
 assert.ok(topics.get(qa.canonical_topic)?.question_ids.includes(qa.id),"orphaned Sexual Ethics question: "+qa.id);
const dossierIds=new Set([...findKind("apologetics-dossier"),...findKind("church-crisis-dossier")].map(x=>x.id));
const linked=new Set(findKind("formation-research-evidence").map(x=>x.canonical_target).filter(x=>dossierIds.has(x)));
assert.equal(dossierIds.size,141);
assert.equal(linked.size,53);
assert.equal(dossierIds.size-linked.size,88);
assert.equal(idx.key_crosswalks.distinct_APOL_CR_dossiers_with_research_links_in_this_ledger,53);
for(const item of findKind("learn-faith-order-candidate"))assert.equal(item.non_additive,true);
for(const item of findKind("formation-research-evidence"))assert.equal(item.non_additive,true);
for(const item of findKind("rosary-mystery")){
 assert.equal(item.traditional_cycle,item.family!=="luminous");
}
assert.equal(findKind("scripture-edition").filter(x=>x.text_enabled).length,0);
for(const id of ["learn.apologetics","learn.church_crisis","learn.catholic_life","learn.seasonal_rites"])
 assert.ok(!LEARN_MODULE_IDS.includes(id),"unapproved Formation navigation: "+id);
const places=new Set(findKind("place").map(x=>x.id));
const shrines=new Set(findKind("shrine").map(x=>x.id));
const customs=new Set(findKind("custom").map(x=>x.id));
for(const x of [...findKind("shrine"),...findKind("relic"),...findKind("apparition")])
 assert.ok(places.has(x.place_id),"missing canonical place "+x.id);
for(const x of findKind("pilgrimage"))
 if(x.destination_shrine_id)assert.ok(shrines.has(x.destination_shrine_id),"missing destination shrine "+x.id);
for(const x of findKind("custom-attestation"))
 assert.ok(customs.has(x.custom_id),"missing customary record "+x.id);
assert.equal(load("data/app/content-items-directory-partial.v1.json").complete,false);
assert.ok(idx.missing_coverage.some(x=>x.scope.includes("Mass directory")));
console.log(JSON.stringify({
 result:"PASS",item_ids:rows.length,unique_ids:unique.size,shards:expected.length,
 canonical_dossiers:dossierIds.size,linked_to_specific_research_ledger:linked.size,
 unreconciled_in_specific_ledger:dossierIds.size-linked.size,
 no_orphan_geography:true,full_directory_census:false,production_navigation_changed:false
},null,2));
