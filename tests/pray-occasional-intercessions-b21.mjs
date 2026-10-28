import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {OCCASIONAL_INTERCESSIONS_B20,OCCASIONAL_PURPOSES_B20,occasionalIntercessionFor} from "../src/pray/occasional-intercessions-b20.js";
import {OCCASIONAL_INTERCESSIONS_B21,OCCASIONAL_PURPOSES_ALL_B21,OCCASIONAL_HOLDS_B21,occasionalIntercessionB21For} from "../src/pray/occasional-intercessions-b21.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";

const canonical=PRAY_CANONICAL_DATA_V435930.prayers.devotion_ad_te_beate_ioseph;
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48,"Frozen canonical bank must remain unchanged");
assert.deepEqual(OCCASIONAL_PURPOSES_B20,["sick","family","difficulties"],"B20 legacy contract preserved");
assert.equal(OCCASIONAL_INTERCESSIONS_B20.length,2,"B20 historic work inventory untouched");
assert.deepEqual(OCCASIONAL_PURPOSES_ALL_B21,["sick","family","difficulties","peace","travel","discernment"]);
assert.equal(new Set(OCCASIONAL_PURPOSES_ALL_B21).size,6);
assert.equal(OCCASIONAL_INTERCESSIONS_B21.length,3);
assert.deepEqual(OCCASIONAL_INTERCESSIONS_B21.map(x=>x.purpose),["peace","travel","discernment"]);
assert.equal(new Set(OCCASIONAL_INTERCESSIONS_B21.map(x=>x.id)).size,3);
assert.ok(OCCASIONAL_INTERCESSIONS_B21.every(x=>x.sourceLinks.length>0&&x.sourceLinks.every(u=>u.startsWith("https://"))));
assert.ok(OCCASIONAL_INTERCESSIONS_B21.every(x=>x.sourceStatus.includes("PRINT_IMAGE_NOT_COLLATED")));
assert.ok(OCCASIONAL_INTERCESSIONS_B21.every(x=>!x.fr&&x.en.length>180));
assert.equal(OCCASIONAL_INTERCESSIONS_B21[0].la.includes("Da pacem, Domine"),true);
assert.ok(!OCCASIONAL_INTERCESSIONS_B21[1].la&&!OCCASIONAL_INTERCESSIONS_B21[2].la);
assert.match(OCCASIONAL_INTERCESSIONS_B21[1].en,/Archangel Raphael/);
assert.match(OCCASIONAL_INTERCESSIONS_B21[1].en,/children of Israel/);
assert.doesNotMatch(OCCASIONAL_INTERCESSIONS_B21[1].en,/O blessed St. Joseph/,"Do not append optional Lasance traveller variant");
assert.match(OCCASIONAL_INTERCESSIONS_B21[2].en,/^Almighty God!/,"Correct verified digital transcript's opening typo");
assert.match(OCCASIONAL_INTERCESSIONS_B21[2].en,/choice of a state of life/);
assert.ok(OCCASIONAL_INTERCESSIONS_B21[2].noteEn.includes("transcription defect"));
for(const purpose of OCCASIONAL_PURPOSES_B20){
 for(const locale of ["en","fr"]){
  for(const latin of [false,true]){
   assert.deepEqual(occasionalIntercessionB21For(purpose,locale,latin,canonical),
      occasionalIntercessionFor(purpose,locale,latin,canonical),"B21 must delegate without changing B20 text or language");
  }
 }
}
const peaceEn=occasionalIntercessionB21For("peace","en",false,canonical);
const peaceLa=occasionalIntercessionB21For("peace","en",true,canonical);
const peaceFr=occasionalIntercessionB21For("peace","fr",false,canonical);
const peaceFrFlip=occasionalIntercessionB21For("peace","fr",true,canonical);
assert.equal(peaceEn.language,"en");
assert.equal(peaceLa.language,"la");
assert.equal(peaceFr.language,"la","FR should default to historic Latin, no French invented");
assert.equal(peaceFrFlip.language,"en");
assert.equal(peaceFrFlip.labelOriginal,true);
assert.notEqual(peaceEn.text,peaceLa.text);
assert.match(peaceEn.text,/Let us pray/);
assert.match(peaceLa.text,/Oremus/);
for(const purpose of ["travel","discernment"]){
 const en=occasionalIntercessionB21For(purpose,"en",false,canonical);
 const fr=occasionalIntercessionB21For(purpose,"fr",false,canonical);
 const frFlip=occasionalIntercessionB21For(purpose,"fr",true,canonical);
 assert.equal(en.language,"en");
 assert.equal(fr.language,"en");
 assert.equal(fr.labelOriginal,true);
 assert.equal(fr.text,en.text,"Never invent French for Lasance");
 assert.equal(frFlip.language,"en","Never invent Latin");
 assert.equal(fr.canLatin,false);
}
assert.equal(occasionalIntercessionB21For("unknown","en",false,canonical),null);
assert.equal(occasionalIntercessionB21For("peace","de",false,canonical),null);
assert.equal(internalPrayerView("pray.occasional_intercessions"),"occasionals");
assert.equal(internalPrayerView("pray.for_priests"),"priests");
assert.ok(OCCASIONAL_HOLDS_B21.length>=4);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/pray/occasional-intercessions-styles.js",import.meta.url),"utf8");
for(const x of ["OCCASIONAL_PURPOSES_B20.includes(purpose)","occasionalIntercessionFor(purpose","occasionalIntercessionB21For(purpose","OCCASIONAL_PURPOSES_ALL_B21.map","OCCASIONAL_PURPOSES_ALL_B21.includes(selected)","data-ao-occasional-purpose-count","L('For peace','Pour la paix')","L('Before a journey','Avant un voyage')","L('For a life choice','Pour un choix de vie')"]) assert.ok(ui.includes(x),"B21 UI regression "+x);
assert.ok(css.includes("grid-template-columns:repeat(2,minmax(0,1fr))"));
assert.ok(css.includes("@media(max-width:360px)"));
assert.ok(css.includes("@media(min-width:641px)"));
const admissions=JSON.parse(readFileSync(new URL("../data/pray/prayer-corpus-admissions-b21.v1.json",import.meta.url),"utf8"));
assert.equal(admissions.newWorkCount,3);
assert.equal(admissions.availablePurposeCount,6);
assert.equal(admissions.canonicalPrayerBankUnchanged,true);
assert.equal(admissions.policy.noInventedTranslations,true);
console.log("B21 occasional prayer corpus: six purposes, 3 source works, B20 exact delegation, EN/LA peace and original-language Lasance, 48 canonical prayers, 48px mobile intent layout PASS");
