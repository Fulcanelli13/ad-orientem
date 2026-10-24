import {CURRENT_RELEASE_PLACE_IDS} from "./helpers/sacred-places-live-baseline.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const A=read("data/explore/europe-acquisition.wave4-national-depth.research.v1.json");
const G=read("data/geography/seed-registry.v1.json");
// Source-acquisition wave snapshots compare with the geography registry at their original research freeze, not later map promotions.
const publishedAfterFreeze=new Set(read("data/geography/research/sacred-geography-major-sites-launch-2026-10-10.v1.json").promoted.map(p=>p.place_id));
for(const p of read("data/geography/research/sacred-geography-major-exceptions-2026-10-10.v1.json").promoted)publishedAfterFreeze.add(p.place_id);
// Post-freeze Ireland R65 promotions must not rewrite this 10 October research snapshot.
for(const c of read("data/shrines/illustrated-place-guides-ireland.v1.json").candidates??[])if(c.published_place_id)publishedAfterFreeze.add(c.published_place_id);
// R71 publication is later than the frozen European source-acquisition baseline.
for(const row of read("data/geography/research/sacred-geography-r71-major-site-reconciliation.v1.json").published_new)publishedAfterFreeze.add(row.place_id);
// R72 seven-site publication also postdates these historical source-acquisition snapshots.
for(const row of read("data/geography/research/sacred-geography-r72-world-anchors.v1.json").sites)publishedAfterFreeze.add(row.place_id);
// R73 promotions postdate the frozen European discovery snapshots.
for(const row of read("data/geography/research/sacred-geography-r73-major-shrines.v1.json").sites)publishedAfterFreeze.add(row.place_id);
for(const row of read("data/geography/research/sacred-geography-r75-essential-sites.v1.json").published_new)publishedAfterFreeze.add(row.place_id);
for(const row of read("data/geography/research/sacred-geography-r77-essential-completeness.v1.json").published_new)publishedAfterFreeze.add(row.place_id);
// Post-freeze R79 three new cathedral/basilica Place publications preserve historical research denominators.
for(const row of read("data/geography/research/sacred-geography-r79-major-church-sites.v1.json").new_sites)publishedAfterFreeze.add(row.place_id);
// R87 physical Place additions also postdate the historical Europe survey freeze.
for(const row of read("data/geography/research/sacred-geography-r87-first-canonical-release.v1.json").published_new)publishedAfterFreeze.add(row.place_id);
// The P14 Ovada release is later than this frozen original Europe research census.
publishedAfterFreeze.add(read("data/geography/research/sacred-places-p14-ovada-canonical-release.v1.json").published_new.place_id);
for(const row of read("data/geography/research/sacred-places-p17-separated-bergamo-asuncion.v1.json").published_new)publishedAfterFreeze.add(row.place_id);
// Later P18 publications must not change frozen original European discovery denominators.
for(const row of read("data/geography/research/sacred-places-p18-three-site-release.v1.json").published_new)publishedAfterFreeze.add(row.place_id);
for(const row of JSON.parse(readFileSync("data/geography/research/sacred-places-p19-two-catholic-site-release.v1.json","utf8")).published_new)publishedAfterFreeze.add(row.place_id);
for(const placeId of CURRENT_RELEASE_PLACE_IDS)publishedAfterFreeze.add(placeId);
const historicalPlaces=G.places.filter(p=>!publishedAfterFreeze.has(p.place_id));
const W1=read("data/explore/europe-acquisition.wave1.research.v1.json");
const W2=read("data/explore/europe-acquisition.wave2.research.v1.json");
const W3=read("data/explore/europe-acquisition.wave3.research.v1.json");
assert.equal(A.schema,"AO_EXPLORE_EUROPE_NATIONAL_DEPTH_WAVE4_RESEARCH_V1");
assert.equal(A.status,"EUROPE_RESEARCH_NO_PINS");
assert.equal(A.sites.length,17);
assert.equal(A.sources.length,16);
assert.equal(A.associations.length,22);
const sites=new Map(A.sites.map(s=>[s.site_id,s]));
const sources=new Set(A.sources.map(s=>s.id));
const associations=new Set(A.associations.map(a=>a.id));
assert.equal(sites.size,17,"duplicate site identity in depth wave");
assert.equal(sources.size,16,"duplicate source ID in depth wave");
assert.equal(associations.size,22,"duplicate category record in depth wave");
assert.deepEqual(A.counts.by_country,{DE:7,ES:3,FR:6,RO:1});
assert.deepEqual(A.counts.by_category,{APPARITIONS:1,CUSTOMS:1,PILGRIMAGES:16,RELICS:2,SACRED_IMAGE:2});
const previous=[...W1.place_candidates.map(x=>({id:x.lead_id,cc:x.country_code,name:x.name})),...W2.place_leads.map(x=>({id:x.research_id,cc:x.country_code,name:x.name})),...W3.site_leads.map(x=>({id:x.id,cc:x.country_code,name:x.name}))];
const norm=x=>String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
for(const s of A.sources){assert.match(s.url,/^https:\/\//);assert.ok(s.scope.length>35)}
for(const s of A.sites){
 assert.equal(s.canonical_place_id,null);
 assert.equal(s.publication,"RESEARCH_ONLY");
 assert.equal(s.geo,null);
 assert.equal(s.image,null);
 assert.equal(s.biography,null);
 assert.ok(s.source_ids.length>0&&s.source_ids.every(id=>sources.has(id)));
 assert.ok(!previous.some(x=>x.cc===s.country_code&&norm(x.name)===norm(s.name)),"duplicate Europe wave identity: "+s.name);
 assert.ok(!historicalPlaces.some(p=>p.address.country_code===s.country_code&&norm(p.name.official)===norm(s.name)),"site exact existing Place duplicate: "+s.name);
}
for(const a of A.associations){
 assert.ok(sites.has(a.site_id),"category orphan Place "+a.id);
 assert.ok(a.source_ids.length>0&&a.source_ids.every(id=>sources.has(id)),"category orphan source "+a.id);
 assert.equal(a.publication,"RESEARCH_ONLY");
 assert.equal(a.route_geometry,null);
 assert.equal(a.own_marker,false);
 assert.ok(a.claim.length>=35&&a.qualification.length>=30);
 assert.ok(["APPARITIONS","CUSTOMS","PILGRIMAGES","RELICS","SACRED_IMAGE"].includes(a.category));
}
const stechap=A.associations.find(x=>x.kind==="HISTORIC_RELIC_SITE_NOT_PRESENT_CUSTODY");
assert.ok(stechap);
assert.ok(stechap.source_ids.includes("FR-SAINTE-CHAPELLE"));
assert.ok(stechap.qualification.includes("Notre-Dame in 1806"));
const relic=A.associations.find(x=>x.kind==="TEMPORARY_RELIC_EXHIBITION");
assert.ok(relic&&relic.qualification.includes("TEMPORARY"));
const apparition=A.associations.find(x=>x.category==="APPARITIONS");
assert.ok(apparition&&/not establish/.test(apparition.qualification));
console.log("PASS Europe depth wave4: 17 unique Place candidates, 22 independently sourced category records, 16 sources, zero live pins");
