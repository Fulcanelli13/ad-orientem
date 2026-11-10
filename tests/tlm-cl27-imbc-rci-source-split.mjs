import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const split=read("data/directory/research/cl27-imbc-rci-source-split-20261110.v1.json");
const live=read("data/directory/generated/cl2-physical-site-index.v1.json");
const published=read("data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json");
assert.equal(split.schema,"AO_CL27_PHASE27H_IMBC_RCI_FROZEN_SOURCE_SPLIT_V1");
assert.equal(split.classification_scope,"SITE_LINKED_SOURCE_ORGANIZATION_NOT_VENUE_WIDE_RITE_OR_MISSAL");
assert.equal(split.counts.research_sites,31);
assert.equal(split.counts.public_new_missal_edition_certifications,0);
assert.equal(split.norms.length,2);
assert.equal(split.norms.find(n=>n.family==="IMBC").missal_year,"UNKNOWN");
assert.equal(split.norms.find(n=>n.family==="RCI").missal_year,"UNKNOWN");
const map=new Map(live.records.map(r=>[r[0],r]));
const seenAnchors=new Set(),seenSources=new Set(),by={IMBC:0,RCI_DIRECTORY:0};
const approved=new Set(published.records.map(r=>r[0]+"|"+r[1]));
for(const r of split.records){
 assert.ok(!seenAnchors.has(r.cl2_anchor)&&!seenSources.has(r.cl2_source_id),"Duplicate frozen source link");
 seenAnchors.add(r.cl2_anchor);seenSources.add(r.cl2_source_id);
 const liveSite=map.get(r.cl2_anchor);
 assert.ok(liveSite&&liveSite[1].includes(r.cl2_source_id),"Historical source not joined to current CL2 index");
 assert.ok(!approved.has(r.cl2_anchor+"|"+r.cl2_source_id),"Research candidate already certified as Roman/1962");
 assert.equal(r.publication,"RESEARCH_ONLY_NOT_PUBLIC");
 assert.equal(r.liturgical_use,"ROMAN");
 assert.equal(r.edition_for_actual_celebration,"UNKNOWN");
 assert.ok(!("una_cum" in r)&&!("canonical_status" in r)&&!("missal_edition" in r)&&!("mass_schedule" in r));
 if(r.family==="IMBC"){
  assert.ok(r.cl2_source_id.startsWith("AO-B50-IMBC-"));
  assert.equal(r.source_organization_label,"Istituto Mater Boni Consilii");
  assert.equal(r.ministerial_role,"IMBC_SOURCE_MINISTRY");
  assert.equal(r.institution_books_policy,"MISSAL_PIUS_V_REFORMED_PIUS_X");
  assert.ok(r.source_url.startsWith("https://www.sodalitium.eu/"));
 }else if(r.family==="RCI_DIRECTORY"){
  assert.ok(r.cl2_source_id.startsWith("AO-B56-"));
  assert.equal(r.source_organization_label,"Roman Catholic Institute / cooperating clergy");
  assert.equal(r.ministerial_role,"RCI_OR_COOPERATING_CLERGY_UNDETERMINED");
  assert.equal(r.institution_books_policy,"RCI_MEMBERS_PRE_1948_BUT_DIRECTORY_MIXED");
  assert.equal(r.source_url,"https://romancatholicinstitute.org/mass-centers/");
 }else throw Error("Unknown split family");
 by[r.family]++;
}
assert.equal(seenAnchors.size,31);
assert.equal(by.IMBC,10);
assert.equal(by.RCI_DIRECTORY,21);
assert.equal(split.counts.imbc_source_ministries,10);
assert.equal(split.counts.rci_mixed_clergy_directory,21);
console.log("PASS CL27 historical family split: 10 IMBC exact source ministries, 21 mixed RCI directory links, 0 fabricated 1962 claims or venue-wide classification");
