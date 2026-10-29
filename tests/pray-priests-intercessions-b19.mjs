import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";
import {PRIESTLY_INTERCESSIONS_B19,PRIESTLY_INTERCESSION_PURPOSES_B19,PRIESTLY_INTERCESSIONS_HOLDS_B19,priestlyIntercessionFor} from "../src/pray/priestly-intercessions-b19.js";
assert.deepEqual(PRIESTLY_INTERCESSION_PURPOSES_B19,["priests","vocations","perseverance"]);
assert.equal(PRIESTLY_INTERCESSIONS_B19.length,3);
assert.equal(new Set(PRIESTLY_INTERCESSIONS_B19.map(x=>x.id)).size,3);
assert.ok(PRIESTLY_INTERCESSIONS_B19.every(x=>x.liveEligible&&x.witnesses.length>=1));
assert.ok(PRIESTLY_INTERCESSIONS_B19.every(x=>x.witnesses.every(url=>url.startsWith("https://"))));
assert.ok(PRIESTLY_INTERCESSIONS_B19.every(x=>x.editionTextStatus.includes("DIGITAL")||x.editionTextStatus.includes("DIGITIZED")));
assert.equal(PRIESTLY_INTERCESSIONS_B19[0].authorStatus,"ANONYMOUS_1914_THERESE_ATTRIBUTION_UNPROVEN");
assert.ok(!PRIESTLY_INTERCESSIONS_B19[0].text.includes("St. Thérèse"));
const enMain=priestlyIntercessionFor("priests","en");
const frMain=priestlyIntercessionFor("priests","fr");
assert.equal(enMain.language,"en");
assert.equal(frMain.language,"en");
assert.equal(frMain.labelOriginal,true);
assert.match(frMain.labelLanguage,/anglais/i);
assert.equal(enMain.attributionStatus,"ANONYMOUS_1914_THERESE_ATTRIBUTION_UNPROVEN");
for(const purpose of ["vocations","perseverance"]){
 const en=priestlyIntercessionFor(purpose,"en");
 const la=priestlyIntercessionFor(purpose,"en",true);
 const fr=priestlyIntercessionFor(purpose,"fr");
 assert.equal(en.language,"en");
 assert.equal(la.language,"la");
 assert.equal(fr.language,"la","No invented French Raccolta translations");
 assert.ok(en.text.includes("Let us pray"));
 assert.ok(la.text.includes("Oremus"));
 assert.ok(fr.text.includes("Oremus"));
 assert.equal(en.sourceLinks.length,1);
 assert.notEqual(en.text,la.text);
 assert.ok(en.text.includes("Amen."));
}
assert.equal(priestlyIntercessionFor("church","en"),null);
assert.equal(priestlyIntercessionFor("priests","de"),null);
assert.ok(PRIESTLY_INTERCESSIONS_HOLDS_B19.some(x=>x.id==="icksp_priests_heart"&&x.status==="HOLD_TEXT_CORRUPTION"));
assert.ok(PRIESTLY_INTERCESSIONS_HOLDS_B19.some(x=>x.id==="icksp_benedict_xvi"&&x.status==="HOLD_RIGHTS"));
assert.ok(PRIESTLY_INTERCESSIONS_HOLDS_B19.every(x=>x.status.startsWith("HOLD")||x.status.startsWith("DEFER")));
assert.equal(internalPrayerView("pray.for_priests"),"priests");
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/pray/priestly-intercessions-styles.js",import.meta.url),"utf8");
for(const k of ["function renderPriestIntercessions(){","data-ao-priests-intercession",
 "data-p435930-priests-purpose","data-p435930-priests-latin",
 "PRIESTLY_INTERCESSION_PURPOSES_B19","priestlyIntercessionFor",
 "else if(view==='priests')html=renderPriestIntercessions()"]){
 assert.ok(ui.includes(k),"Missing implementation contract "+k);
}
assert.ok(ui.includes("'pray.for_priests':{id:'pray.for_priests'"));
assert.ok(ui.includes("['own','pray.for_priests'"),
 "Source-owned contextual Prayer card route must be declared exactly: pray.for_priests");
assert.ok(ui.includes("related.map(item=>prayFamilyItem(item,true))"),
 "Contextual Prayer route must use shared illustrated module card without a duplicate owner");
assert.ok(styles.includes("min-height:48px"));
assert.ok(styles.includes("max-width:360px"));
assert.ok(!PRIESTLY_INTERCESSIONS_B19.some(x=>x.language==="fr"));
console.log("B19 priests: three distinct historical prayer purposes, 1914 attribution hold, 1910 bilingual source and 48px in-reader choices PASS");
