import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const shrineSot=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const audit=read("data/saints/legacy-shrine-name-audit-20261015.v1.json");
const pilot=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
assert.equal(audit.schema,"ao.saints.precanonical-shrine-name-audit.v1");
assert.equal(audit.scope,"RESEARCH_ONLY_NOT_APP_VISIBLE");
assert.equal(pilot.publication,"RESEARCH_ONLY_NOT_APP_VISIBLE");
assert(shrineSot.shrines.length>=audit.counts.shrine_records,"Source snapshot must not lose historical shrine records; later parallel shrine additions are allowed");
const originalEdges=shrineSot.shrines.flatMap(s=>(s.associated_saints||[]).map(name=>JSON.stringify([name,s.shrine_id,s.place_id,[...(s.source_ids||[])].sort()]))).sort();
const auditEdges=audit.mentions.flatMap(m=>m.shrine_associations.map(link=>JSON.stringify([m.name_literal,link.shrine_id,link.place_id,[...link.source_ids].sort()]))).sort();
assert.deepEqual(auditEdges,originalEdges,"Every existing name-shrine-place-source association must be preserved");
assert.equal(auditEdges.length,audit.counts.association_edges);
assert.equal(new Set(audit.mentions.map(x=>x.name_literal)).size,audit.counts.distinct_name_strings);
assert(audit.mentions.every(m=>m.identity_status==="UNRECONCILED_NAME_STRING"));
const shrineById=new Map(shrineSot.shrines.map(s=>[s.shrine_id,s]));
const seenIds=new Set();
for(const p of pilot.people){
 assert(!seenIds.has(p.saint_id),"Duplicate proposed person ID");seenIds.add(p.saint_id);
 assert(["CANONIZED_SAINT","BEATIFIED_NOT_CANONIZED"].includes(p.recognition_status));
 if(p.recognition_status==="BEATIFIED_NOT_CANONIZED")assert(p.saint_id.startsWith("blessed:"));
 assert(p.why_honoured.en.length>=55&&p.why_honoured.fr.length>=55,"Lead with why the person is holy in both languages");
 assert.equal(p.biography_facts.length,3);
 assert.deepEqual(p.biography_facts.map(f=>f.kind),["holy_witness","concrete_action","spiritual_legacy"]);
 assert(p.place_links.length>0);
 for(const fact of [p.why_honoured,...p.biography_facts]){
  assert(fact.en.length>=35&&fact.fr.length>=35&&fact.source_ids.length>0);
  for(const id of fact.source_ids)assert(pilot.sources[id]?.url?.startsWith("https://www.vatican.va/"),"Citation must resolve to recorded Holy See source");
 }
 for(const link of p.place_links){
  const shrine=shrineById.get(link.shrine_id);
  assert(shrine&&shrine.place_id===link.place_id);
  assert(shrine.associated_saints.includes(p.legacy_source_name));
  assert.deepEqual(link.source_ids,shrine.source_ids||[]);
  assert.equal(link.relation_kind,"SHRINE_ASSOCIATION_ONLY");
  assert.equal(link.coordinates,"INHERIT_EXISTING_PLACE_GEO_GATE");
 }
 assert.deepEqual(p.calendar_1962_keys,[],"Do not invent 1962 feasts");
 assert.deepEqual(p.approved_artwork_ids,[],"No unapproved art");
 assert.equal(p.publication,"EDITORIAL_REVIEW_ONLY");
}
assert.equal(pilot.people.length,6);
assert.equal(pilot.people.filter(p=>p.recognition_status==="BEATIFIED_NOT_CANONIZED").length,1);
console.log("PASS: source-preserving saint census and six holiness-first editorial pilot profiles");
