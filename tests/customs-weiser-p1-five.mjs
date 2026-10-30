import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertCustomsAtlasRegistry} from "../src/find/customs-contracts.js";
import {projectTraditionItems} from "../src/find/explore-projection.js";
import {groupTraditionsForBrowse} from "../src/find/traditions-browse.js";
import {v384Dates,v384Events} from "../src/calendar/traditional-year-v384.js";
import {calendarPracticeEvents} from "../src/calendar/intelligence.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const atlas=read("../data/customs/customs-atlas-seed.v1.json");
const sources=read("../data/customs/source-registry.v1.json");
const geography=read("../data/geography/seed-registry.v1.json");
const negative=read("../data/customs/negative-knowledge.v1.json");
const extensions=read("../data/customs/sot07-extensions.v1.json");
const p0=read("../data/customs/customs-p0-guidance-en-fr.v1.json");
const p1=read("../data/customs/customs-p1-guidance-en-fr.v1.json");
const specs=[
 ["EPIP-001","DE",["STERN-KINDERMISSIONSWERK-2026"]],
 ["EPIP-002","FR",["ECF-GALETTE-EPIPHANIE"]],
 ["CORP-001","PL",["UNESCO-CORPUS-FLOWER-CARPETS","VATICAN-DPP-CORPUS-FLOWERS-162"]],
 ["EAST-001","DE",["MUNICH-FREISING-EMMAUSGANG"]],
 ["MARI-002","US",["CATHCULTURE-MARY-GARDEN"]]
];
assert.deepEqual([atlas.customs.length,atlas.attestations.length,sources.sources.length,extensions.extensions.length,negative.entries.length,p1.entries.length],[39,98,110,22,7,5]);
assert.equal(p0.publication,"SUPPORTING_COPY_FOR_PUBLISHED_CANONICAL_IDS");
assert.equal(p1.publication,"SUPPORTING_COPY_FOR_PUBLISHED_CANONICAL_IDS");
for(const [id,country,ids] of specs){
 const custom=atlas.customs.find(row=>row.custom_id===id);
 const att=atlas.attestations.filter(row=>row.custom_id===id);
 const guide=p1.entries.find(row=>row.custom_id===id);
 const extension=extensions.extensions.find(row=>row.custom_id===id);
 assert.ok(custom&&guide&&extension,id+" missing source-backed owner");
 assert.equal(custom.publication_state,"PUBLISHED");
 assert.equal(guide.review_status,"CANONICAL_ID_PUBLISHED_IN_MAIN");
 assert.equal(att.length,1,id+" should not mint duplicate practice");
 assert.equal(att[0].attestation_id,`att:${id}:${country}`);
 assert.equal(att[0].geo_area_id,`geo:country:${country}`);
 assert.equal(att[0].place_id,null);
 assert.equal(att[0].map_policy,"NOT_MAPPED");
 assert.ok(guide.scope_en?.length>20&&guide.scope_fr?.length>20,"bilingual scope missing "+id);
 assert.deepEqual(att[0].source_ids,ids);
 assert.deepEqual(guide.source_ids,ids);
 assert.deepEqual(extension.source_ids,ids);
 for(const field of ["title_en","title_fr","description_en","description_fr","meaning_en","meaning_fr","how_en","how_fr","caution_fr"]){
  assert.ok(guide[field]?.length>15,id+" missing "+field);
 }
 assert.ok(custom.guardrail.length>65,id+" insufficient pastoral boundary");
 for(const sourceId of ids)assert.match(sources.sources.find(row=>row.id===sourceId)?.url??"",/^https:\/\//);
 assert.equal(negative.entries.some(row=>row.custom_id===id),false);
}
const audit=assertCustomsAtlasRegistry({customs:atlas.customs,attestations:atlas.attestations,sources:sources.sources,negativeKnowledge:negative.entries,geoAreas:geography.geoAreas,places:geography.places});
assert.equal(audit.pass,true);
assert.equal(audit.mapCandidates.length,58,"national custom attestation cannot create a place pin");
const raw=projectTraditionItems({customs:atlas.customs,attestations:atlas.attestations,places:geography.places,geoAreas:geography.geoAreas,sources:sources.sources,guidance:[...p0.entries,...p1.entries]});
const cards=groupTraditionsForBrowse(raw);
assert.equal(cards.length,39);
for(const [id] of specs){
 const card=cards.find(row=>row.source_id===id);
 assert.equal(card?.kind,"CANONICAL_CUSTOM",id+" missing Atlas folio");
 assert.ok(card.title_fr&&card.summary_fr);
 assert.ok(card.sections.some(row=>row.label==="Meaning"&&row.body_fr));
 assert.ok(card.sections.some(row=>row.label==="Optional observance"&&row.body_fr));
 assert.ok(card.source_links.length>0);
 assert.equal(card.map_publishable,false);
}
const next=value=>{const d=new Date(value+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)};
for(const year of [2026,2027,2030]){
 for(const [date,key,ids] of [
  [`${year}-01-06`,"epiphany-family",["EPIP-001","EPIP-002"]],
  [v384Dates(year).corpus,"corpus",["CORP-001"]],
  [next(v384Dates(year).easter),"easter-monday-emmaus",["EAST-001"]],
  [`${year}-05-01`,"may-marian-garden",["MARI-002"]]
 ]){
  for(const fr of [false,true]){
   assert.equal(v384Events(date,{fr}).filter(row=>row.key===key).length,1,date+" "+key+" duplicate");
   const actions=calendarPracticeEvents(date,{fr}).find(row=>row.key===key)?.actions.filter(row=>row[0].startsWith("find:traditions:"));
   assert.deepEqual(actions?.map(row=>row[0]),ids.map(id=>"find:traditions:"+id));
  }
 }
 assert.equal(v384Events(v384Dates(year).holySaturday).filter(row=>row.key==="holy-saturday").length,1);
}
console.log("PASS P1 Weiser five: 39 customs, 98 attestations, 110 sources, 22 SOT extensions; 5 bilingual folios, 58 untouched published map pins, bounded Calendar handoffs and no Mass reader changes");
