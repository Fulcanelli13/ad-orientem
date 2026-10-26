import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,filterPreliminaryR49} from "../src/find/preliminary-directory-r49.js";

const taxonomy=JSON.parse(readFileSync("data/directory/tlm-user-classification-taxonomy.v1.json","utf8"));
assert.equal(taxonomy.schema,"AO_TLM_USER_CLASSIFICATION_TAXONOMY_V1");
const byKey=new Map(taxonomy.dimensions.map(d=>[d.key,d]));
assert.equal(byKey.size,12);
for(const key of ["institute_or_community","ecclesial_position","una_cum","canonical_status",
  "liturgical_use","missal_edition","rubrical_basis","organizer_role","venue_owner_type",
  "celebrant_relationship","mass_type","schedule_and_location"])
  assert.ok(byKey.has(key),key);
assert.deepEqual(byKey.get("una_cum").subject,["MINISTRY","CELEBRATION"]);
assert.ok(!byKey.get("una_cum").subject.includes("VENUE"));
assert.ok(byKey.get("ecclesial_position").values.includes("SEDEVACANTIST"));
assert.ok(byKey.get("ecclesial_position").values.includes("SEDEPRIVATIONIST"));
assert.ok(byKey.get("missal_edition").values.includes("1962"));
assert.ok(byKey.get("liturgical_use").values.includes("DOMINICAN"));
assert.equal(taxonomy.public_approvals,0);

const raw=JSON.parse(readFileSync("data/directory/preliminary-map-r49.v1.json","utf8"));
const items=projectPreliminaryR49(raw);
assert.equal(items.length,1879);
for(const item of items){
  assert.equal(item.classification_status,"SOURCE_LABEL_ONLY_NOT_FULLY_REVIEWED");
  assert.equal(item.classification.una_cum,"UNKNOWN");
  assert.equal(item.classification.ecclesial_position,"UNKNOWN");
  assert.equal(item.classification.pontiff_recognition,"UNKNOWN");
  assert.equal(item.classification.canonical_status,"UNKNOWN");
  assert.equal(item.classification.missal_edition,"UNKNOWN");
  assert.equal(item.classification.liturgical_use,"UNKNOWN");
  assert.equal(item.classification.organizer_role,"UNKNOWN");
  assert.equal(item.classification.mass_type,"UNKNOWN");
  assert.ok(item.facts.some(f=>f.label==="Una cum"&&/Unknown/.test(f.value)));
  assert.ok(item.facts.some(f=>f.label==="Missal / rite"));
  assert.ok(item.source_links.length>0);
}
for(const [group,minimum] of Object.entries({AASJMV:5,ORATORIANS:5,CANONS:2,TRANSFIGURATION:5,CAPUCHINS:5,RELIGIOUS:10})){
  const filtered=filterPreliminaryR49(items,{directoryGroup:"ALL",affiliations:[group]});
  assert.ok(filtered.length>=minimum,group+": "+filtered.length);
  assert.ok(filtered.every(x=>x.community_id===group));
}
const sspx=filterPreliminaryR49(items,{directoryGroup:"ALL",affiliations:["SSPX"]});
assert.equal(sspx.length,732);
assert.ok(sspx.every(x=>x.classification.una_cum==="UNKNOWN"&&x.classification.ecclesial_position==="UNKNOWN"));
const all=filterPreliminaryR49(items,{directoryGroup:"ALL"});
assert.equal(all.length,items.length);
console.log("CL27 TLM classification UI PASS: 12 independent dimensions, 1879 unchanged pins, fine-grained institute labels, no invented Una Cum or Missal.");
