import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";
import {LITTLE_CROWN_B30_SOURCE,LITTLE_CROWN_B30_BEADS,LITTLE_CROWN_B30_ASPIRATION,littleCrownStep} from "../src/pray/little-crown-b30.js";
import {renderLittleCrownB30} from "../src/pray/little-crown-presentation-b30.js";
const CANON=PRAY_CANONICAL_DATA_V435930.prayers;
assert.equal(LITTLE_CROWN_B30_SOURCE.candidateId,"AO-AQ-029");
assert.equal(LITTLE_CROWN_B30_SOURCE.printedOriginalPagePhotographicallyCollated,false);
assert.equal(LITTLE_CROWN_B30_SOURCE.historicalIndulgencesClaimedCurrent,false);
assert.equal(LITTLE_CROWN_B30_SOURCE.medalPrayerImported,false);
assert.equal(LITTLE_CROWN_B30_SOURCE.endingGloriaImported,false);
assert.equal(LITTLE_CROWN_B30_SOURCE.optionalTwelveMysteryMeditationsImported,false);
assert.equal(LITTLE_CROWN_B30_SOURCE.prayersCopiedFromCanonical,true);
assert.equal(LITTLE_CROWN_B30_BEADS.length,15);
assert.equal(new Set(LITTLE_CROWN_B30_BEADS.map(x=>x.id)).size,15);
assert.deepEqual(LITTLE_CROWN_B30_BEADS.map(x=>x.prayerId),[
 ...Array(3).fill("foundations_our_father"),...Array(12).fill("foundations_hail_mary")]);
assert.deepEqual(LITTLE_CROWN_B30_BEADS.slice(0,3).map(x=>x.id),["holy-family-jesus","holy-family-mary","holy-family-joseph"]);
assert.deepEqual(LITTLE_CROWN_B30_BEADS.slice(3).map(x=>x.order),Array.from({length:12},(_,i)=>i+1));
assert.equal(LITTLE_CROWN_B30_ASPIRATION.en,"And the Word was made Flesh and dwelt amongst us.");
assert.match(LITTLE_CROWN_B30_ASPIRATION.fr,/Et le Verbe s'est fait chair/);
assert.match(LITTLE_CROWN_B30_ASPIRATION.la,/Et Verbum caro factum est/);
for(const language of ["en","fr","la"]){
 for(let index=0;index<15;index++){
  const s=littleCrownStep(index,language);
  assert.ok(s && s.index===index && s.total===15);
  assert.equal(s.prayerText,CANON[s.prayerId][language],"Canonical text must be reused verbatim");
  assert.equal(s.aspiration,LITTLE_CROWN_B30_ASPIRATION[language],"Aspiration precedes all 15 prayers");
  assert.equal(s.isLast,index===14);
 }
}
for(const [i,lang] of [[-1,"en"],[15,"en"],[2.5,"fr"],[3,"de"]])assert.equal(littleCrownStep(i,lang),null);
assert.equal(Object.keys(CANON).length,48);
assert.equal(NOVENA_CORPUS_V4_IDS.length,16);
assert.equal(internalPrayerView("pray.little_crown"),"littleCrown");
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/pray/little-crown-styles-b30.js",import.meta.url),"utf8");
const markup=renderLittleCrownB30({
 index:0,latin:false,french:false,head:(h,t)=>h+t,
 L:(en)=>en,esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"),
 nl:s=>s
});
assert.equal((markup.match(/data-p435930-crown-bead=/g)||[]).length,15);
assert.match(markup,/data-p435930-crown-next/);
assert.match(markup,/aria-valuenow="1"/);
assert.match(markup,/And the Word was made Flesh and dwelt amongst us/);
assert.match(markup,/Our Father/);
assert.ok(!markup.includes("data-p435930-crown-finish"));
const end=renderLittleCrownB30({
 index:14,latin:false,french:true,head:()=>"",L:(_,fr)=>fr,esc:s=>String(s),nl:s=>s
});
assert.match(end,/data-p435930-crown-finish/);
assert.match(end,/aria-valuenow="15"/);
assert.match(end,/Je vous salue Marie/);
assert.match(ui,/view==='littleCrown'\)html=renderLittleCrown\(\)/);
assert.match(ui,/LITTLE_CROWN.index=Math.min\(14,LITTLE_CROWN.index\+1\)/);
assert.match(ui,/LITTLE_CROWN.index=Math.max\(0,LITTLE_CROWN.index-1\)/);
assert.match(ui,/data-p435930-crown-finish/);
assert.match(css,/min-height:48px;min-width:48px/);
assert.match(css,/prefers-reduced-motion:reduce/);
console.log("PASS B30: fifteen historically witnessed beads, correct 3+12 sequence and aspiration, three canonical language prayers, source/rights safeguards, frozen 48/16, navigation contracts");
