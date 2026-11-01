import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolveApprovedPlaceMedia,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {compactHeritagePlaceSheet} from "../src/find/heritage-presentation.js";
import {renderSacredPlaceFallback,sacredPlaceFallbackKind} from "../src/find/sacred-place-visual-fallback.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geo=read("data/geography/seed-registry.v1.json");
const reg=read("data/geography/approved-place-media.v1.json");
const gal=read("data/geography/approved-place-gallery.v1.json");
const review=read("data/geography/research/photo-finder-20261030/decisions.json").decisions;
const ledger=read("data/geography/research/photo-finder-20261030/releases/sacred-atlas-530-cover-closure-106-v1.json");
const retry=read(ledger.source_recovery_report);
assert.equal(geo.places.length,530);
assert.equal(ledger.canonical_places,530);
assert.equal(ledger.approved_cover_count,307);
assert.equal(ledger.chosen_rank1_places,395);
assert.equal(ledger.chosen_approved,289);
assert.equal(ledger.approved_outside_chosen,18);
assert.equal(ledger.chosen_pending,106);
assert.equal(ledger.none_without_photo,51);
assert.equal(ledger.unreviewed_without_photo,66);
assert.equal(ledger.missing_photo_or_exact_approved_hero,223);
assert.equal(ledger.items.length,106);
assert.equal(retry.verified_research_only,6);
assert.equal(retry.still_held,2);
const expected={author_attribution:4,licence_verification:29,no_persisted_exception:9,source_metadata_mismatch:24,source_size_format:26,unverified_public_domain_claim:13,visual_watermark_hold:1};
const counts=Object.fromEntries(Object.keys(expected).sort().map(k=>[k,ledger.items.filter(x=>x.disposition===k).length]));
assert.deepEqual(counts,ledger.counts_by_disposition);
assert.deepEqual(counts,expected);
const idSet=new Set();
for(const x of ledger.items){
  assert.ok(!idSet.has(x.place_id));
  idSet.add(x.place_id);
  assert.equal(review[x.place_id]?.files?.[0],x.selected_file);
  assert.match(x.source_sha1_claim,/^[0-9a-f]{40}$/);
}
const byPlace=new Map(reg.items.map(x=>[x.place_id,x]));
assert.ok(reg.items.length>=307);
assert.equal(byPlace.size,reg.items.length);
assert.equal(Object.values(review).filter(x=>x.none).length,56);
assert.ok(!byPlace.has("place:CU:el-cobre-caridad-basilica"));
const mapSource=readFileSync(new URL("../src/find/explore-map-medallions.js",import.meta.url),"utf8");
assert.ok(mapSource.includes('"CHURCH","SHRINE","RELIC","PILGRIMAGE"'));
const profiles=buildExplorePlaceProfiles({geography:geo,media:{approved:reg.items,gallery:gal.items}},{});
assert.equal(profiles.length,530,"All canonical Places need profiles, even without photographs");
let photo=0,illustrated=0;
for(const p of profiles){
 const approved=resolveApprovedPlaceMedia(reg.items,p.place_id);
 if(approved){photo++;assert.ok(p.media?.asset_path,"Approved Place photo omitted");assert.ok(existsSync(new URL("../"+approved.asset_path,import.meta.url)),"Broken approved-image asset "+p.place_id);}
 const card=compactHeritagePlaceSheet({selectedPlace:p,language:"en",filters:{}});
 if(p.media){
   assert.ok(card.includes('class="aoHeritagePlaceThumb"'),"Approved photo card changed "+p.place_id);
   assert.ok(!card.includes('data-visual-kind="category-symbol"'),"Illustration replaced approved photo "+p.place_id);
 }else{
   illustrated++;
   assert.ok(card.includes('data-visual-kind="category-symbol"'),"Card missing neutral symbol "+p.place_id);
   assert.ok(card.includes('no approved photograph'),"Card symbol wrongly attributed "+p.place_id);
   assert.ok(!card.includes('<img'),"Unapproved image injected "+p.place_id);
   const french=renderSacredPlaceFallback(p,"fr","preview");
   assert.ok(french.includes("aucune photographie approuvée"));
   const kind=sacredPlaceFallbackKind(p);
   assert.ok(["CHURCH","SHRINE","PILGRIMAGE"].includes(kind));
 }
}
if(reg.items.length===307)assert.deepEqual([photo,illustrated],[307,223]);
assert.equal(photo+illustrated,530);
const chosen=profiles.find(p=>!p.media);
assert.ok(chosen);
const expanded=renderExploreToString(buildExploreViewModel({
 language:"fr",lens:"heritage",view:"map",items:[],placeProfiles:profiles,
 selectedPlaceId:chosen.place_id,expandPlace:true,filters:{}
}));
assert.ok(expanded.includes('data-explore-place-owner="'+chosen.place_id+'"'));
assert.ok(expanded.includes('aoExplorePlaceMedia aoSacredPlaceSymbolFallback'));
assert.ok(!expanded.includes('<img class="aoExplorePlaceMedia"'));
console.log("PASS 530 physical Place previews: "+photo+" approved photos + "+illustrated+" neutral category symbols; 106 frozen source holds, no false approvals");
