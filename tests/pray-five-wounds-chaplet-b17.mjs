import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";
import {
 FIVE_WOUNDS_SOURCE_V1,FIVE_WOUNDS_WOUNDS_V1,FIVE_WOUNDS_CHAPLET_V1,
 fiveWoundsStep,fiveWoundsGroupProgress
} from "../src/pray/five-wounds-chaplet.v1.js";
import {historicalChapletCandidate} from "../src/pray/prayer-acquisition-chaplet-structures.v1.js";

const R=PRAY_CANONICAL_DATA_V435930.prayers;
assert.equal(FIVE_WOUNDS_SOURCE_V1.historicalIndulgencesCurrent,false);
assert.equal(FIVE_WOUNDS_SOURCE_V1.optionalMedalsRequired,false);
assert.equal(FIVE_WOUNDS_SOURCE_V1.originalBlessingMandatory,false);
assert.equal(FIVE_WOUNDS_WOUNDS_V1.length,5);
assert.deepEqual(FIVE_WOUNDS_WOUNDS_V1.map(x=>x.id),["left-foot","right-foot","left-hand","right-hand","side"]);
assert.equal(FIVE_WOUNDS_CHAPLET_V1.length,30);
assert.equal(new Set(FIVE_WOUNDS_CHAPLET_V1.map(x=>x.id)).size,30);
assert.deepEqual(FIVE_WOUNDS_CHAPLET_V1.filter(x=>x.kind==="ave").map(x=>x.group),[0,1,2,3,4]);
assert.equal(FIVE_WOUNDS_CHAPLET_V1.filter(x=>x.kind==="gloria").length,25);
for(let group=0;group<5;group++){
 const subset=FIVE_WOUNDS_CHAPLET_V1.slice(group*6,group*6+6);
 assert.deepEqual(subset.map(x=>x.kind),["gloria","gloria","gloria","gloria","gloria","ave"]);
 assert.ok(subset.every(x=>x.group===group));
}
for(let i=0;i<30;i++){
 const p=fiveWoundsGroupProgress(i);
 assert.equal(p.group,Math.floor(i/6)+1);
 assert.equal(p.position,(i%6)+1);
 assert.equal(p.completed,i+1);
 assert.equal(p.final,i===29);
 for(const l of ["en","fr","la"]){
   const x=fiveWoundsStep(i,l);
   assert.ok(x&&x.index===i&&x.total===30);
   assert.equal(x.text,R[x.prayerId][l],"Source IDs must read frozen 48-prayer corpus verbatim");
   assert.equal(x.woundNumber,Math.floor(i/6)+1);
   assert.equal(x.kind,i%6===5?"ave":"gloria");
   assert.ok(x.text.length>30);
 }
}
assert.equal(fiveWoundsStep(-1),null);
assert.equal(fiveWoundsStep(30),null);
assert.equal(fiveWoundsStep(2.5),null);
assert.equal(fiveWoundsStep(3,"de"),null);
assert.equal(fiveWoundsGroupProgress(30),null);
assert.equal(internalPrayerView("pray.five_wounds"),"fiveWounds");
const historical=historicalChapletCandidate("raccolta_1857_five_wounds");
assert.equal(historical.releaseStatus,"PUBLISHED_GUIDED_FORM_SOURCE_RECONCILED");
assert.equal(historical.userFacing,true);
assert.equal(historical.originalPrintScanCertified,false);
assert.equal(historical.derivedCounts.glory_be,25);
assert.equal(historical.derivedCounts.hail_mary,5);
const bloodFull=historicalChapletCandidate("raccolta_1857_precious_blood_full");
assert.equal(bloodFull.releaseStatus,"PUBLISHED_GUIDED_FULL_FORM_TEXTUAL_WITNESSES",
 "The source-reconciled full form may now be independently published");
assert.equal(bloodFull.userFacing,true);
const bloodShort=historicalChapletCandidate("raccolta_1857_precious_blood_short");
assert.ok(bloodShort.releaseStatus.startsWith("HOLD_") && !bloodShort.userFacing,
 "The contradictory short form must remain excluded");
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const style=readFileSync(new URL("../src/pray/five-wounds-chaplet-styles.js",import.meta.url),"utf8");
assert.ok(runtime.includes('function renderFiveWounds()'));
assert.ok(runtime.includes("view==='fiveWounds')html=renderFiveWounds()"));
assert.ok(runtime.includes("if(next==='fiveWounds'){FIVE_WOUNDS.index=0;FIVE_WOUNDS.latin=false}"));
assert.ok(runtime.includes("FIVE_WOUNDS.index=i*6"));
assert.ok(runtime.includes("FIVE_WOUNDS.index=Math.max(0,FIVE_WOUNDS.index-1)"));
assert.ok(runtime.includes("FIVE_WOUNDS.index=Math.min(29,FIVE_WOUNDS.index+1)"));
assert.ok(runtime.includes("if(b.hasAttribute('data-p435930-five-finish')&&FIVE_WOUNDS.index===29)"));
assert.ok(runtime.includes("FIVE_WOUNDS.latin=!FIVE_WOUNDS.latin"));
assert.ok(runtime.includes("const prayerLanguage=['adoration','benediction','stations','confession'].includes(view)||(view==='fiveWounds'&&!FIVE_WOUNDS.latin&&!CHAPLET_F07_PILOT_ENABLED)"),
 "Default Five Wounds keeps the existing session-only EN/FR switch; the opt-in reader must not show it twice");
assert.ok(runtime.includes('data-p435930-five-language'),"Opt-in Five Wounds Aa menu must remain wired to the original prayer language state");
assert.ok(runtime.includes("if(view==='fiveWounds'&&b.hasAttribute('data-p435930-session-language')&&!FIVE_WOUNDS.latin)"),
 "The chaplet language action must be source-local and not alter the historic four-reader handler");
assert.ok(runtime.includes('data-p435930-own="${esc(route)}"'));
assert.ok(runtime.includes("'pray.five_wounds',L('Chaplet of the Five Wounds'"));
assert.ok(runtime.includes("'pray.five_wounds':{id:'pray.five_wounds'"));
assert.ok(runtime.includes("data-ao-five-wounds-reader"));
assert.ok(runtime.includes("role=\"progressbar\""));
assert.ok(runtime.includes("aria-current=\"step\""));
assert.ok(runtime.includes("FIVE_WOUNDS_SOURCE_V1.sources.map"));
assert.ok(!runtime.slice(runtime.indexOf("function renderFiveWounds()"),runtime.indexOf("function renderMercy()")).includes("indulgence granted"));
assert.match(style,/\.aoFiveWounds button\{min-height:48px/);
assert.match(style,/\.aoFiveWoundsRail button\{min-height:58px/);
assert.match(style,/prefers-reduced-motion:reduce/);
assert.match(style,/\.aoFiveWoundsRail button small\{font:500 12px\/1\.35/,"Wound names must not be 10px labels");
assert.match(style,/\.aoFiveWoundsRail button small\{[^\n]*opacity:1;/,"Non-active wound names remain readable");
assert.match(style,/\.aoFiveWoundsActions\{[\s\S]*?position:sticky;bottom:0;z-index:12/,"Use the existing action row as a phone thumb dock");
assert.match(style,/env\(safe-area-inset-bottom\)/,"Respect phone safe-area inset");
assert.match(style,/\.aoFiveWoundsActions button\{[\s\S]*?min-height:48px/,"Next/previous remain accessible");
assert.doesNotMatch(style,/@media\(max-width:420px\)[^]*?font-size:10px/,"Mobile wound labels must not be reduced to 10px");
console.log("B17 PASS: five groups × five Gloria + Ave; canonical EN/FR/LA reuse, route, 48px controls and no current indulgence promises.");
