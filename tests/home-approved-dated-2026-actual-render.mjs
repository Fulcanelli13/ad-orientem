import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {APPROVED_CLASS_I_2026} from "../src/calendar/approved-class-i-heroes-2026.js";
import {
 approved2026HomeArtwork,renderApproved2026HomeArtwork,
 EXTRA_RELEASED_2026_HOME_DATE_PREVIEWS,EXISTING_RELEASED_2026_DATE_PHOTOS
} from "../src/home/approved-dated-artwork-2026.js";
import {RELEASED_2026_GOSPEL_HERO_DATES} from "../src/home/released-date-gospel-heroes-2026.js";

const paths={
 "2026-03-29":"Tempora/Quad6-0r",
 "2026-04-02":"Tempora/Quad6-4r",
 "2026-05-23":"Tempora/Pasc6-6",
 "2026-05-24":"Tempora/Pasc7-0",
 "2026-05-27":"Tempora/Pasc7-3",
 "2026-06-12":"Tempora/Pent02-5",
 "2026-11-01":"Sancti/11-01",
 "2026-11-02":"Sancti/11-02m1"
};
const build=(date,id,path,gospel="Luke 1:26–38")=>({
 selectedDate:date,route:"home",resolving:false,
 resolution:{
  date,status:"ready",day:{main:{id,title:"Resolved 1962 observed day"}},
  proper:{status:"ready",sourcePath:path,
   data:{sourcePath:path,gospel:{lat:"Sequéntia sancti Evangélii",
    reference:gospel}}}
 }
});
assert.equal(APPROVED_CLASS_I_2026.length,10);
for(const [date,path] of Object.entries(paths)){
 const record=APPROVED_CLASS_I_2026.find(a=>a.date===date);
 assert.ok(record,"Missing protected date "+date);
 const state=build(date,record.principalId,path);
 const art=approved2026HomeArtwork(state);
 assert.ok(art,"Approved Class I preview missing in real Home resolver: "+date);
 assert.equal(art.title,record.title);
 assert.equal(art.artist,record.artist);
 assert.equal(art.artworkId,record.artworkId);
 if(date==="2026-06-12"){
  assert.equal(art.image,"/assets/prayer/released/heart-jesus-full-original.jpg");
  assert.equal(art.selectionKind,"PREVIOUSLY_APPROVED_CLASS_I_LOCAL_ORIGINAL");
  assert.equal(art.imageStatus,"PREVIOUSLY_RELEASED_LOCAL_ORIGINAL");
 }else assert.equal(art.image,record.image);
 assert.equal(art.source,record.source);
 if(date!=="2026-06-12")assert.equal(art.selectionKind,"PREVIOUSLY_APPROVED_CLASS_I_DATE");
 if(date!=="2026-06-12")assert.ok(art.imageStatus.includes("NOT_OFFLINE_CERTIFIED"));
 assert.equal(approved2026HomeArtwork(build(date,"wrong-principal",path)),null);
 assert.equal(approved2026HomeArtwork(build(date,record.principalId,path+"-wrong")),null);
 state.resolution.date="2026-01-01";
 assert.equal(approved2026HomeArtwork(state),null,"stale date must not show artwork");
}
for(const suffix of ["2","3"]){
 const rec=APPROVED_CLASS_I_2026.find(a=>a.date==="2026-11-02");
 assert.ok(approved2026HomeArtwork(build("2026-11-02",rec.principalId,
  "Sancti/11-02m"+suffix)),"All Souls alternative Mass same feast art");
}
for(const date of ["2026-10-25","2026-11-29"]){
 const rec=APPROVED_CLASS_I_2026.find(a=>a.date===date);
 assert.equal(approved2026HomeArtwork(build(date,rec.principalId,
  date==="2026-10-25"?"Sancti/10-DU":"Tempora/Adv1-0")),null,
  "Rights-held Class I photograph should remain held");
}
const ash=EXTRA_RELEASED_2026_HOME_DATE_PREVIEWS["2026-02-18"];
assert.equal(ash.artworkId,"met-436839");
assert.equal(ash.principalId,"tempora:Quadp3-3:1:v");
assert.equal(ash.properPath,"Tempora/Quadp3-3");
assert.match(ash.source,/metmuseum.org\/art\/collection\/search\/436839$/);
assert.match(ash.imageSource,/commons\.wikimedia\.org\/wiki\/File:The_Penitent_Magdalen_MET_DT7252/);
assert.match(ash.rights,/CC0/);
const ashState=build(ash.date,ash.principalId,ash.properPath,"Matthew 6:16–21");
const ashHero=approved2026HomeArtwork(ashState);
assert.ok(ashHero);
assert.equal(ashHero.title,"The Penitent Magdalen");
assert.equal(ashHero.selectionKind,"PREVIOUSLY_APPROVED_ASH_WEDNESDAY_DATE");
assert.equal(ashHero.imageStatus,"REMOTE_CC0_SOURCE_PREVIEW_NOT_OFFLINE_CERTIFIED");
assert.equal(approved2026HomeArtwork(build(ash.date,"tempora:wrong:1:v",ash.properPath)),null);
assert.equal(approved2026HomeArtwork(build(ash.date,ash.principalId,"Tempora/Quad1-0")),null);
assert.equal(approved2026HomeArtwork(build("2026-02-19",ash.principalId,ash.properPath)),null);
for(const [date,cue] of Object.entries(RELEASED_2026_GOSPEL_HERO_DATES)){
 const state=build(date,cue.principalId,cue.properPath,cue.gospel);
 const art=approved2026HomeArtwork(state);
 assert.equal(art?.artworkId,"met-438724");
 assert.equal(art?.selectionKind,"EXACT_GOSPEL_PREVIOUSLY_RELEASED_MODULE_IMAGE");
 assert.equal(art?.image,"/assets/home/c3-approved-met/angelus-frameless.webp");
 assert.equal(approved2026HomeArtwork(build(date,cue.principalId,cue.properPath,"John 2:1–11")),null);
}
let img;
const hero={classList:{removed:[],added:[],
 remove(s){this.removed.push(s)},add(s){this.added.push(s)}},querySelector(){return null}};
const slot={
 children:[],replaceChildren(...children){this.children=children;children.forEach(x=>x.isConnected=true)},
 closest:()=>hero
};
const win={document:{createElement(name){
 assert.equal(name,"img");
 img={dataset:{},events:{},
  addEventListener(name,fn){this.events[name]=fn},isConnected:true};
 return img;
}}};
const mounted=renderApproved2026HomeArtwork(slot,ashState,win);
assert.ok(mounted);
assert.equal(slot.children.length,1);
assert.equal(img.dataset.aoHomeAuthoritativeDate,"2026-02-18");
assert.equal(img.dataset.aoHomeAuthoritativeArtwork,"met-436839");
assert.equal(img.src,ash.image);
assert.equal(img.alt,"The Penitent Magdalen — Georges de La Tour");
assert.ok(hero.classList.removed.includes("aoTodayV2ArtMissing"));
img.events.error();
assert.equal(slot.children.length,0,"Broken remote image must fall back to text-only");
assert.ok(hero.classList.added.includes("aoTodayV2ArtMissing"));
assert.equal(renderApproved2026HomeArtwork(slot,build("2026-02-19","none","none"),win),null);

const previous=JSON.parse(readFileSync(new URL("../data/artwork/2026-prior-date-artwork-evidence.v1.json",import.meta.url),"utf8"));
assert.equal(Object.keys(EXISTING_RELEASED_2026_DATE_PHOTOS).length,3);
const actualFiles={
 "2026-03-19":"assets/prayer/released/joseph-whole-original.jpg",
 "2026-06-04":"assets/home/c3-approved-met/adoration-frameless.webp",
 "2026-12-24":"assets/prayer/released/joseph-whole-original.jpg"
};
for(const [date,rule] of Object.entries(EXISTING_RELEASED_2026_DATE_PHOTOS)){
 const editorial=previous.days.find(x=>x.date===date)?.selection;
 assert.ok(editorial,"Missing frozen 2026 editorial selection "+date);
 assert.equal(editorial.title,rule.title);
 assert.equal(editorial.artist.normalize("NFD").replace(/[^a-z]/gi,"").toLowerCase(),
  rule.artist.normalize("NFD").replace(/[^a-z]/gi,"").toLowerCase(),
  "Artist must remain identical despite catalogue punctuation");
 assert.equal(editorial.artworkId,rule.artworkId);
 assert.equal(editorial.editorialBasis,rule.editorialBasis);
 const state=build(date,rule.principalId,rule.properPath);
 const art=approved2026HomeArtwork(state);
 assert.ok(art,"Existing released painting not shown on selected date "+date);
 assert.equal(art.title,editorial.title);
 assert.equal(art.artist.normalize("NFD").replace(/[^a-z]/gi,"").toLowerCase(),
  editorial.artist.normalize("NFD").replace(/[^a-z]/gi,"").toLowerCase());
 assert.equal(art.artworkId,editorial.artworkId);
 assert.equal(art.selectionKind,"PREVIOUSLY_SELECTED_DATE_REUSES_RELEASED_MODULE_ORIGINAL");
 assert.equal(art.image,"/"+actualFiles[date]);
 assert.equal(art.imageStatus,"PREVIOUSLY_RELEASED_LOCAL_ORIGINAL");
 assert.ok(existsSync(new URL("../"+actualFiles[date],import.meta.url)),"Local image missing "+date);
 assert.equal(approved2026HomeArtwork(build(date,"wrong-principal",rule.properPath)),null);
 assert.equal(approved2026HomeArtwork(build(date,rule.principalId,rule.properPath+"-wrong")),null);
 state.resolution.proper.status="loading";
 assert.equal(approved2026HomeArtwork(state),null);
}
const june12=APPROVED_CLASS_I_2026.find(x=>x.date==="2026-06-12");
assert.ok(june12);
assert.equal(june12.imagePublicationStatus,"REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED",
 "Calendar registry remains a source-scoped, separate image preview");
const june12Actual=approved2026HomeArtwork(build("2026-06-12",june12.principalId,"Tempora/Pent02-5"));
assert.equal(june12Actual.image,"/assets/prayer/released/heart-jesus-full-original.jpg");
assert.equal(june12Actual.artworkId,june12.artworkId);
assert.equal(june12Actual.releasePr,2302);
assert.ok(existsSync(new URL("../assets/prayer/released/heart-jesus-full-original.jpg",import.meta.url)));
const heldKing=APPROVED_CLASS_I_2026.find(x=>x.date==="2026-10-25");
assert.equal(approved2026HomeArtwork(build(heldKing.date,heldKing.principalId,"Sancti/10-DU")),null,
 "Photo released in another Prayer module must not silently bypass the King date rights hold");

console.log("PASS actual Home resolver: eight Class I previews + Ash Wednesday + two previously released Gospel dates; source/principal/Proper safeguards");
