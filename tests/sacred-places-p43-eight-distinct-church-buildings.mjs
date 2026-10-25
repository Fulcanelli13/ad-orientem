import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LIVE,RELEASES} from "./helpers/sacred-places-live-baseline.mjs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {auditShrineSource,assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const m=read("data/geography/research/sacred-places-p43-eight-distinct-church-buildings.v1.json"),a=read("data/geography/research/sacred-places-p43-open35-global500-reconciliation.v1.json"),g=read("data/geography/seed-registry.v1.json"),s=read("data/shrines/source-registry.v1.json"),h=read("data/explore/heritage-place-reconciliation.review.v1.json"),sh=read("data/shrines/shrines-pilgrimages-seed.v1.json");
assert.deepEqual(Object.values(m.baseline),[490,788,490,231,146,9]);assert.deepEqual(Object.values(m.proposed),[498,796,498,239,146,9]);assert.equal(RELEASES.at(-1).id,"P43");
assert.deepEqual([g.places.length,s.sources.length,h.place_crosswalk.length,h.exception_queues.places_without_direct_claim.length,g.geoAreas.length,g.directoryPlaceLinks.length],[LIVE.places,LIVE.sources,LIVE.heritage_crosswalk,LIVE.unlinked,LIVE.areas,LIVE.links]);
assert.deepEqual([LIVE.places,LIVE.sources,LIVE.unlinked,LIVE.areas,LIVE.links],[498,796,239,146,9]);
assert.deepEqual([m.published_new.length,m.new_mapping_rows_resolved,m.new_candidate_ids_resolved],[8,6,7]);
assert.equal(a.open_mapping_35.length,35);assert.equal(a.global_acquisition_500.length,500);
assert.equal(a.counts.global_canonical_links_if_P43_merged,123);assert.equal(a.counts.global_unresolved_if_P43_merged,377);
assert.equal(a.counts.protected_complex_holds,3);assert.equal(a.counts.still_open_mapping_cases,35);
const ids=new Set(m.published_new.map(x=>x.place_id)),before=g.places.filter(x=>!ids.has(x.place_id)),refs=new Set(before.map(x=>x.geo?.source_ref).filter(Boolean));assert.equal(before.length,490);assert.equal(ids.size,8);
for(const x of m.published_new){assert.ok(!refs.has(x.geo_source_ref));refs.add(x.geo_source_ref);assert.match(x.geo_source_ref,/^osm:(way|relation):\\d+$/);const p=g.places.find(y=>y.place_id===x.place_id);assert.ok(p);assert.equal(p.name.official,x.name);assert.equal(p.geo.source_ref,x.geo_source_ref);assert.equal(p.geo.precision,"site");assert.ok(isMapPublishablePlaceGeo(p.geo,x.country));assert.deepEqual(p.source_ids,x.source_ids);const src=s.sources.find(z=>z.id===x.source_ids[0]);assert.ok(src);assert.deepEqual(auditShrineSource(src),[]);assert.equal(src.url,x.identity_source_url);assert.ok(h.exception_queues.places_without_direct_claim.includes(x.place_id));assert.deepEqual(h.place_crosswalk.filter(z=>z.place_id===x.place_id).map(z=>z.record_ids),[{}]);assert.ok(!sh.shrines.some(z=>z.place_id===x.place_id));assert.ok(!g.directoryPlaceLinks.some(z=>z.place_id===x.place_id));}
assert.equal(assertExploreGeographyRegistry(g).pass,true);assert.equal(assertShrinesPilgrimagesRegistry({...sh,sources:s.sources,places:g.places}).pass,true);
console.log("PASS P43: 8 exact Catholic buildings, 6 historic cases resolved, 35 open, 123 global candidate links, 377 unverified acquisition leads");
