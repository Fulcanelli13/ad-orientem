import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const geo=load("data/geography/seed-registry.v1.json");
const sources=load("data/shrines/source-registry.v1.json");
const cross=load("data/explore/heritage-place-reconciliation.review.v1.json");
const shrines=load("data/shrines/shrines-pilgrimages-seed.v1.json");
const p13=load("data/geography/research/sacred-places-p13-identity-adjudication.v1.json");
const p15=load("data/geography/research/sacred-places-p15-two-exception-promotions.v1.json");
const release=load("data/geography/research/sacred-places-p16-three-qualified-site-release.v1.json");
assert.equal(release.schema,"AO_SACRED_PLACES_P16_THREE_QUALIFIED_RELEASES_V1");
assert.equal(release.baseline.places,350);
assert.equal(release.baseline.source_registry,630);
assert.equal(release.proposed.places,353);
assert.equal(release.proposed.source_registry,639);
assert.equal(release.published_new.length,3);
assert.equal(release.held_exceptions.length,16);
assert.equal(new Set(release.held_exceptions.map(x=>x.candidate_id)).size,16);
assert.equal(release.baseline.source_identity_title_holds_from_p15,19);
const priorHeld=p13.decisions.filter(x=>x.source_identity_gate!=="RESOLVED").map(x=>x.candidate_id);
const pastRelease=new Set(p15.published_new.map(x=>x.research_id));
const p16Release=new Set(release.published_new.map(x=>x.candidate));
assert.deepEqual(
 release.held_exceptions.map(x=>x.candidate_id).sort(),
 priorHeld.filter(id=>!pastRelease.has(id)&&!p16Release.has(id)).sort(),
 "P16 must retain all original unresolved exception slots, including the three unidentified legacy cases");
for(const x of release.held_exceptions){
 assert.equal(x.publication_state,"HOLD_NO_NEW_PIN");
 assert.ok(x.evidence);
 assert.ok(x.next);
 if(x.url)assert.match(x.url,/^https:\/\//);
}
assert.equal(geo.places.length,LIVE.places);
assert.equal(sources.sources.length,LIVE.sources);
assert.equal(geo.geoAreas.length,LIVE.areas,"Current country areas must follow immutable release chain");
assert.equal(geo.directoryPlaceLinks.length,9);
assert.equal(cross.place_crosswalk.length,LIVE.places);
assert.equal(cross.counts.places,LIVE.places);
assert.equal(cross.counts.places_without_direct_claim,LIVE.unlinked);
assert.equal(cross.exception_queues.places_without_direct_claim.length,LIVE.unlinked);
assert.equal(new Set(geo.places.map(p=>p.place_id)).size,geo.places.length);
assert.equal(new Set(sources.sources.map(s=>s.id)).size,sources.sources.length);
assert.equal(assertExploreGeographyRegistry(geo).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...shrines,sources:sources.sources,places:geo.places}).pass,true);
const byPlace=new Map(geo.places.map(p=>[p.place_id,p]));
const bySource=new Map(sources.sources.map(s=>[s.id,s]));
const abc="23456789CFGHJMPQRVWX",res=[20,1,.05,.0025,.000125];
function olcCenter(code){
 assert.match(code,/^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/);
 const symbols=code.replace("+","");let lat=-90,lng=-180;
 for(let i=0;i<5;i++){lat+=abc.indexOf(symbols[i*2])*res[i];lng+=abc.indexOf(symbols[i*2+1])*res[i];}
 return [Number((lat+.0000625).toFixed(7)),Number((lng+.0000625).toFixed(7))];
}
let auditedSources=0;
for(const rec of release.published_new){
 const p=byPlace.get(rec.id);
 assert.ok(p,"New site missing "+rec.id);
 assert.equal(p.place_id,rec.id);
 assert.equal(p.name.official,rec.name);
 assert.equal(p.mappable,true);
 assert.equal(p.geo.precision,"complex_anchor","Not an entrance nor independently mapped church footprint");
 assert.equal(p.geo.geocoding_source,"OTHER");
 assert.equal(p.geo.source_ref,"olc:"+rec.olc);
 assert.equal(p.geo.matched_country_code,p.address.country_code);
 assert.equal(p.geo.source_url,bySource.get(rec.geo_source)?.url);
 assert.deepEqual([p.geo.lat,p.geo.lng],olcCenter(rec.olc));
 assert.equal(p.geo.lat,rec.lat);assert.equal(p.geo.lng,rec.lng);
 assert.equal(p.geo.attribution,undefined,"Do not imply OpenStreetMap licensed polygon for a grid cell");
 assert.ok(isMapPublishablePlaceGeo(p.geo,p.address.country_code));
 assert.equal(p.source_ids.length,3);
 for(const id of p.source_ids){
  const src=bySource.get(id);
  assert.ok(src?.url?.startsWith("https://"),"Original source missing "+id);
  assert.ok(src.contribution&&src.directness);
  auditedSources++;
 }
 assert.equal(geo.directoryPlaceLinks.some(x=>x.place_id===p.place_id),false,"Site is not automatically 1962-Missal venue");
 assert.equal(shrines.shrines.some(x=>x.place_id===p.place_id),false,"New canonical Place is not a new independently sourced Shrine owner");
 const matches=cross.place_crosswalk.filter(x=>x.place_id===p.place_id);
 assert.equal(matches.length,1);
 assert.deepEqual(matches[0].record_ids,{});
 assert.ok(cross.exception_queues.places_without_direct_claim.includes(p.place_id));
}
assert.equal(auditedSources,9);
assert.equal(byPlace.get("place:MY:st-jude-church-rawang").place_type,"church","Original false Kuala Lumpur shrine title must not survive");
assert.equal(byPlace.get("place:PE:santuario-san-martin-de-porres-jicamarca").place_type,"shrine");
assert.equal(byPlace.get("place:UY:santuario-nuestra-senora-del-carmen-carmelo").place_type,"shrine");
const carmelo=olcCenter("48R32P38+28"),sanctuary=olcCenter("48R32P26+5R");
const diff=Math.hypot((carmelo[0]-sanctuary[0])*111195,(carmelo[1]-sanctuary[1])*111195*Math.cos(sanctuary[0]*Math.PI/180));
assert.ok(diff>300 && diff<600,"Carmelo parish and shrine must stay distinct physical locations");
assert.equal(release.proposed.new_approved_images,0);
assert.equal(release.proposed.new_directory_place_links,0);
console.log("PASS P16 353 Places, 639 typed sources, 3 OLC-qualified Catholic sites, 16 documented source holds, no unlicensed media or invented Mass");
