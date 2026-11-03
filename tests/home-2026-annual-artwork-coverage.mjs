/* Annual source + exact production resolver test.
 * This is a code/asset availability gate, not proof of 365 browser renders.
 */
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {ANNUAL_HOME_ARTWORK_DAYS_2026,annualHomeArtworkDay2026,
 annualHomeArtworkStatus2026} from "../src/home/annual-home-artwork-2026.js";
import {approved2026SeasonalHomeReuse} from "../src/home/approved-2026-seasonal-reuse.js";
import {approved2026HomeArtwork,EXISTING_RELEASED_2026_DATE_PHOTOS,
 EXTRA_RELEASED_2026_HOME_DATE_PREVIEWS} from "../src/home/approved-dated-artwork-2026.js";
import {APPROVED_CLASS_I_2026} from "../src/calendar/approved-class-i-heroes-2026.js";
import {APPROVED_2026_OTHER_DATE_PREVIEWS} from "../src/home/approved-2026-other-date-previews.js";
import {RELEASED_2026_GOSPEL_HERO_DATES} from "../src/home/released-date-gospel-heroes-2026.js";
import {RELEASED_MODULE_PAINTINGS} from "../src/art/released-module-paintings.v1.js";

const prior=JSON.parse(readFileSync(new URL("../data/artwork/2026-prior-date-artwork-evidence.v1.json",import.meta.url),"utf8"));
const annual=ANNUAL_HOME_ARTWORK_DAYS_2026;
const all=Object.values(annual);
assert.equal(all.length,365);
assert.equal(prior.days.length,365);
assert.equal(new Set(all.map(x=>x.date)).size,365);
assert.equal(all.filter(x=>x.selection).length,53);
assert.equal(all.filter(x=>x.rank==="IV").length,71);
assert.deepEqual(Object.fromEntries(["I","II","III","IV"].map(k=>[k,all.filter(x=>x.rank===k).length])),
 {I:53,II:76,III:165,IV:71});
for(let i=0;i<365;i++){
 const one=all[i],src=prior.days[i];
 assert.equal(one.date,src.date);
 assert.equal(one.principalId,src.principalId);
 assert.equal(one.rank,src.rank);
 assert.equal(one.candidateSourceCount,src.catalogue.length+src.externalExistingResearch.length+src.study.length);
 assert.equal(one.selection?.title??null,src.selection?.title??null);
 assert.equal(one.selection?.artist??null,src.selection?.artist??null);
 assert.equal(one.selection?.artworkId??null,src.selection?.artworkId??null);
 assert.equal(annualHomeArtworkDay2026(one.date,"wrong:principal"),null);
}
const build=(date,principalId,properPath,gospel="Matthew 1:1–16")=>({
 selectedDate:date,resolving:false,route:"home",
 resolution:{date,status:"ready",day:{main:{id:principalId}},
 proper:{status:"ready",sourcePath:properPath,data:{sourcePath:properPath,
 gospel:{lat:"Sequéntia sancti Evangélii",reference:gospel}}}}
});
const classIPath={
 "2026-03-29":"Tempora/Quad6-0r","2026-04-02":"Tempora/Quad6-4r",
 "2026-05-23":"Tempora/Pasc6-6","2026-05-24":"Tempora/Pasc7-0",
 "2026-05-27":"Tempora/Pasc7-3","2026-06-12":"Tempora/Pent02-5",
 "2026-10-25":"Sancti/10-DU","2026-11-01":"Sancti/11-01",
 "2026-11-02":"Sancti/11-02m1","2026-11-29":"Tempora/Adv1-0"
};
const published=new Map();
for(const r of APPROVED_CLASS_I_2026){
 const art=approved2026HomeArtwork(build(r.date,r.principalId,classIPath[r.date]));
 if(r.imagePublicationStatus==="HELD_SOURCE_REUSE_RIGHTS"){
  assert.equal(art,null,"Held selection must remain absent "+r.date);
  continue;
 }
 assert.ok(art?.image,"Class I preview missing "+r.date);
 published.set(r.date,art);
}
for(const r of Object.values(APPROVED_2026_OTHER_DATE_PREVIEWS)){
 const art=approved2026HomeArtwork(build(r.date,r.principalId,r.properPath));
 assert.ok(art?.image,"Older dated source preview missing "+r.date);
 published.set(r.date,art);
}
for(const r of Object.values(EXTRA_RELEASED_2026_HOME_DATE_PREVIEWS)){
 const art=approved2026HomeArtwork(build(r.date,r.principalId,r.properPath));
 assert.ok(art?.image);
 published.set(r.date,art);
}
for(const [date,r] of Object.entries(EXISTING_RELEASED_2026_DATE_PHOTOS)){
 const art=approved2026HomeArtwork(build(date,r.principalId,r.properPath));
 assert.ok(art?.image);
 published.set(date,art);
}
for(const [date,r] of Object.entries(RELEASED_2026_GOSPEL_HERO_DATES)){
 const art=approved2026HomeArtwork(build(date,r.principalId,r.properPath,r.gospel));
 assert.ok(art?.image);
 published.set(date,art);
}
assert.equal(published.size,25,"Original live date-mapping baseline moved");
const seasonal=[];
for(const day of all.filter(x=>x.rank==="IV")){
 const path=day.principalId.startsWith("commune:C10")?"Commune/C10":"Tempora/feria";
 const state=build(day.date,day.principalId,path);
 const reuse=approved2026SeasonalHomeReuse(day.date,day.principalId,path);
 const actual=approved2026HomeArtwork(state);
 assert.ok(reuse&&actual,"Missing seasonal date "+day.date);
 assert.deepEqual(actual,reuse);
 assert.equal(actual.selectionKind,"SEASONAL_CONTEXT_NOT_GOSPEL_SCENE");
 assert.equal(actual.explicitGospelSceneMatch,false);
 assert.equal(actual.imageStatus,"PREVIOUSLY_RELEASED_LOCAL_ORIGINAL_AS_CONTEXT");
 assert.ok(actual.image.startsWith("/assets/"));
 assert.ok(existsSync(new URL(".."+actual.image,import.meta.url)),"Local original missing "+actual.image);
 const moduleId=actual.artworkId.slice("released-photo:".length);
 assert.equal(actual.artist,RELEASED_MODULE_PAINTINGS[moduleId].artist);
 assert.equal(actual.title,RELEASED_MODULE_PAINTINGS[moduleId].title);
 assert.equal(approved2026SeasonalHomeReuse(day.date,"wrong-principal",path),null);
 assert.equal(approved2026SeasonalHomeReuse(day.date,day.principalId,"wrong-path"),null);
 assert.equal(annualHomeArtworkStatus2026(day.date,day.principalId,actual),
  "SEASONAL_LOCAL_PHOTO_MAPPED_NOT_GOSPEL_EXACT");
 seasonal.push(actual);
}
assert.equal(seasonal.length,71);
assert.equal(seasonal.filter(x=>x.liturgicalContext==="MARIAN_SATURDAY").length,12);
assert.equal(seasonal.filter(x=>x.liturgicalContext==="FERIAL_SEASON_OR_DEVOTIONAL_CONTEXT").length,59);
assert.equal(seasonal.filter(x=>published.has(x.date)).length,0);
assert.equal(published.size+seasonal.length,96);
const dateSelectedPending=all.filter(d=>d.selection&&!published.has(d.date));
assert.equal(dateSelectedPending.length,29);
for(const d of dateSelectedPending){
 assert.equal(approved2026SeasonalHomeReuse(d.date,d.principalId,"Tempora/probe"),null,
 "Historical date-approved work must never be replaced with seasonal stock");
}
const wrong=build("2026-01-03","sancti:wrong","Commune/C10");
assert.equal(approved2026HomeArtwork(wrong),null);
console.log("PASS annual artwork 365/365 indexed: 25 previously mapped, 71 seasonal local originals, 269 image-mapping exceptions");
console.log("PASS 53 preserved dated selections, 12 Marian Saturdays, 59 other Class IV ferias, 2 protected rights holds");
