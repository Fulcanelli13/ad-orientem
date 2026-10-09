import assert from "node:assert/strict";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAYER_SCRIPTURE_ORIGINS,STATION_SCRIPTURE_ORIGINS,prayerScriptureOrigin,stationScriptureOrigin} from "../src/pray/scripture-origins.js";
import {massScriptureContextForCard} from "../src/mass/scripture-reading-context.js";
import {readFileSync} from "node:fs";

const prayers=PRAY_CANONICAL_DATA_V435930.prayers;
assert.equal(Object.keys(prayers).length,48,"Canonical prayer corpus must not change");
assert.equal(Object.keys(PRAYER_SCRIPTURE_ORIGINS).length,8);
for(const [id,origin] of Object.entries(PRAYER_SCRIPTURE_ORIGINS)){
  assert.ok(prayers[id],"Unknown biblical prayer "+id);
  assert.ok(origin.passage && origin.reference && origin.relationship);
  assert.ok(!/VERIFIED_QUOTATION/.test(origin.relationship));
}
assert.equal(prayerScriptureOrigin("marian_memorare"),null,
  "Traditional Marian prayer must not be represented as a Bible quotation");
assert.equal(prayerScriptureOrigin("foundations_hail_mary").isVerbatimBibleText,false,
  "Whole Hail Mary incorporates later devotional petition");
assert.equal(prayerScriptureOrigin("dead_de_profundis").passage.book,"Psalms");
assert.equal(prayerScriptureOrigin("dead_de_profundis").passage.chapter,129,
  "Traditional Vulgate psalm numbering must not silently modernize");

assert.equal(STATION_SCRIPTURE_ORIGINS.length,14);
assert.equal(STATION_SCRIPTURE_ORIGINS.filter(row=>row.reference!==null).length,9);
for(const i of [2,3,5,6,8]){
  assert.equal(stationScriptureOrigin(i).reference,null,
    "Devotional scene must not receive an invented direct biblical reference: "+(i+1));
}
assert.equal(stationScriptureOrigin(7).reference,"Luke 23:27–31");
assert.equal(stationScriptureOrigin(-1),null);
assert.equal(stationScriptureOrigin(14),null);
const gospelCard={blocks:[{blockId:"AO.SM.B018",properSlot:"GOSPEL"}]};
const epistleCard={blocks:[{blockId:"AO.SM.B012",properSlot:"EPISTLE_OR_LESSON"}]};
const ordinaryCard={blocks:[{blockId:"AO.SM.B025",properSlot:null}]};
function prepared(data){return{session:{resolvedMass:{proper:{status:"READY",data}}}}}
const precise=prepared({
  gospel:{lat:"In illo tempore...",en:"At that time...",reference:"Luke 1:26–38"},
  epistle:{lat:"Lectio...",en:"Epistle...",scriptureRef:"1 Cor 6:18–20"}
});
assert.equal(massScriptureContextForCard(gospelCard,precise).reference,"Luke 1:26–38");
assert.equal(massScriptureContextForCard(epistleCard,precise).passage.book,"1Corinthians");
assert.equal(massScriptureContextForCard(ordinaryCard,precise),null);
assert.equal(massScriptureContextForCard(gospelCard,prepared({gospel:{en:"At that time the Angel was sent...",lat:"In illo tempore..."}})).state,"UNRESOLVED_REFERENCE");
assert.equal(massScriptureContextForCard(gospelCard,prepared({gospel:{en:"Luke 1:26–38\nAt that time...",fr:"Luke 1:26–38\nEn ce temps..."}})).reference,"Luke 1:26–38");
assert.equal(massScriptureContextForCard(gospelCard,prepared({
  gospel:{reference:"Luke 1:26–38"},
  scriptureReferences:{GOSPEL:"John 3:1–16"}
})).state,"UNRESOLVED_REFERENCE","Conflicting source references must fail closed");
const bridge=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.match(bridge,/massScriptureContextForCard\(/);
assert.match(bridge,/data-reader-scripture-context/);
assert.match(bridge,/installReaderScriptureBridge\(previewState\.preview,prepared\)/);
assert.doesNotMatch(bridge,/setPresentationMode.*Bible/);
const prayer=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.match(prayer,/prayerBlock\(LIB\.open,\{scriptureContext:true\}\)/);
assert.match(prayer,/stationScriptureOrigin\(i\)/);
console.log("PASS Scripture Context v2: 48 prayer records conserved, 8 curated origins, 14 stations with 5 traditional scenes, source-only Mass references");
