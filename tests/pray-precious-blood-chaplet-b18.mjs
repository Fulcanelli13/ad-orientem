import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";
import {historicalChapletCandidate} from "../src/pray/prayer-acquisition-chaplet-structures.v1.js";
import {
 PRECIOUS_BLOOD_HISTORICAL_SOURCE_V1 as source,
 PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1 as texts,
 PRECIOUS_BLOOD_MYSTERIES_V1 as mysteries,
 PRECIOUS_BLOOD_TOTALS_V1 as totals,
 preciousBloodMystery,preciousBloodPrayerAt
} from "../src/pray/precious-blood-chaplet.v1.js";
const canon=PRAY_CANONICAL_DATA_V435930.prayers;
assert.equal(source.id,"raccolta_1857_precious_blood_full");
assert.equal(source.originalPageImageCertified,false,"PDF text extract is not original image certification");
assert.equal(source.historicalIndulgencesCurrent,false);
assert.equal(source.noInventedFrench,true);
assert.equal(source.noInventedLatin,true);
assert.deepEqual(source.works.map(x=>x.entry),["35","138"]);
assert.equal(mysteries.length,7);
assert.deepEqual(mysteries.map(x=>x.pater),[5,5,5,5,5,5,3]);
assert.equal(totals.pater,33);
assert.equal(totals.gloria,7);
assert.equal(totals.versicles,7);
assert.equal(totals.openingGloria,1);
assert.equal(totals.closingCollect,1);
assert.deepEqual(mysteries.map(x=>x.id),["circumcision","agony","scourging","crowning","carrying","crucifixion","piercing"]);
assert.ok(mysteries.every(x=>x.meditationEn.length>180),"Complete original long meditation, not generated synopsis");
const ids=new Set();
for(let i=0;i<7;i++){
  const count=mysteries[i].pater;
  for(const lang of ["en","fr","la"]){
    const m=preciousBloodMystery(i,lang);
    assert.ok(m&&m.pater===count);
    assert.equal(m.paterText,canon.foundations_our_father[lang]);
    assert.equal(m.gloriaText,canon.foundations_glory_be[lang]);
    assert.equal(m.responseLanguage,lang==="en"?"en":"la","French uses labelled original Latin response");
    assert.equal(m.historicalMeditationLanguage,"en");
    for(let p=0;p<count+2;p++){
      const step=preciousBloodPrayerAt(i,p,lang);
      assert.ok(step&&step.position===p&&step.mysteryIndex===i);
      assert.equal(step.kind,p<count?"pater":p===count?"gloria":"versicle");
      if(p<count)assert.equal(step.text,canon.foundations_our_father[lang]);
      else if(p===count)assert.equal(step.text,canon.foundations_glory_be[lang]);
      else assert.equal(step.language,lang==="en"?"en":"la");
      ids.add(lang+"-"+i+"-"+p);
    }
    assert.equal(preciousBloodPrayerAt(i,count+2,lang),null);
  }
}
assert.equal(ids.size,47*3); // 33 Pater + 7 Gloria + 7 responses, each language
assert.equal(preciousBloodMystery(-1),null);
assert.equal(preciousBloodMystery(7),null);
assert.equal(preciousBloodPrayerAt(0,-1),null);
assert.equal(preciousBloodPrayerAt(0,0,"de"),null);
assert.equal(preciousBloodPrayerAt(0,2.5),null);
assert.ok(texts.closingBloodPrayerEn.startsWith("Most Precious Blood of life eternal"));
assert.ok(texts.closingBloodPrayerEn.length>450);
assert.ok(texts.collect.en.startsWith("Almighty and everlasting God"));
assert.ok(texts.collect.la.startsWith("Omnipotens sempiterne Deus"));
assert.ok(texts.historicalEtcExplicit,"An abbreviated historical ending must be visibly disclosed");
assert.equal(texts.closingTextLanguage,"en");
assert.ok(texts.finalVersicle.la[0].startsWith("Redemisti nos"));
const full=historicalChapletCandidate(source.id);
const short=historicalChapletCandidate("raccolta_1857_precious_blood_short");
assert.equal(full.releaseStatus,"PUBLISHED_GUIDED_FULL_FORM_TEXTUAL_WITNESSES");
assert.equal(full.userFacing,true);
assert.equal(full.closingPrayer,"historical:precious_blood_most_precious_blood_1910_en");
assert.equal(short.userFacing,false);
assert.equal(short.releaseStatus,"HOLD_SOURCE_CONFLICT");
assert.equal(short.claimedTotalPater,33);
assert.equal(short.reproducedTotalPater,35);
assert.equal(internalPrayerView("pray.precious_blood"),"preciousBlood");
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/pray/precious-blood-chaplet-styles.js",import.meta.url),"utf8");
for(const marker of ["function renderPreciousBlood(){","data-ao-precious-blood-reader",
 "data-p435930-blood-mystery","data-p435930-blood-next","data-p435930-blood-prev",
 "data-p435930-blood-finish","data-p435930-blood-latin","PRECIOUS_BLOOD.phase",
 "PRECIOUS_BLOOD.bead","PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1","historicalEtcExplicit"])
 assert.ok(runtime.includes(marker)||marker==="historicalEtcExplicit", "Reader marker missing: "+marker);
assert.ok(runtime.includes("PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1"));
assert.ok(runtime.includes("else if(view==='preciousBlood')html=renderPreciousBlood()"));
assert.ok(runtime.includes("'pray.precious_blood':{id:'pray.precious_blood'"));
assert.ok(runtime.includes("role=\"progressbar\""));
assert.ok(runtime.includes("historical English"));
assert.ok(styles.includes("min-height:48px"));
assert.ok(styles.includes("prefers-reduced-motion:reduce"));
assert.match(styles,/\.aoPreciousBloodActions\{[^]*?position:sticky;bottom:0;z-index:12/,
 "Keep the canonical previous/continue actions reachable in the phone reader");
assert.match(styles,/\.aoPreciousBloodActions button\{[^]*?min-height:48px/,
 "Original source-owned controls require 48px minimum tap targets");
assert.match(styles,/env\(safe-area-inset-bottom\)/,
 "Chaplet controls must respect a home-indicator safe area");
assert.match(styles,/@media\(max-width:420px\)/,
 "Compact only the mobile source-first layout, not the desktop or Mass reader");
assert.match(styles,/\.aoPreciousBloodCard p\{font:400 clamp\(19px,3\.4vw,23px\)\/1\.7/,
 "Do not shrink the actual source prayer font");

console.log("B18 PASS: 7 full historical Precious Blood mysteries, 33+7+7, dated original ending, canonical EN/FR/LA repeats; source-conflicted short form withheld.");
