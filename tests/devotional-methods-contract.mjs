import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {divineMercySteps,mercyStepInfo,DEVOTIONAL_METHODS_VERSION,DEVOTIONAL_METHOD_SOURCES,
 ROSARY_METHODS,DOMINICAN_OPENING,MONTFORT_GRACES,FIFTEEN_CYCLE,nextFullRosarySet,
 lastDecadeBoundary,firstMysteryIndex} from "../src/pray/devotional-methods.js";
import {renderMercyReader} from "../src/pray/mercy-reader.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";

assert.equal(DEVOTIONAL_METHODS_VERSION,"rosary-methods-divine-mercy-v1");
const steps=divineMercySteps();
assert.equal(steps.length,62,"Minimum Divine Mercy sequence is 4+5×(1+10)+3");
assert.deepEqual(steps.slice(0,4).map(x=>x.canonicalId),[
 "foundations_sign_of_cross","foundations_our_father",
 "foundations_hail_mary","foundations_apostles_creed"]);
assert.equal(steps.filter(s=>s.kind==="large").length,5);
assert.equal(steps.filter(s=>s.kind==="small").length,50);
assert.equal(steps.filter(s=>s.kind==="conclusion").length,3);
assert.equal(steps.filter(s=>s.phase==="decade").length,55);
for(let decade=1;decade<=5;decade++){
 const own=steps.filter(s=>s.decade===decade);
 assert.equal(own.length,11);assert.equal(own[0].kind,"large");
 assert.deepEqual(own.slice(1).map(s=>s.bead),[1,2,3,4,5,6,7,8,9,10]);
 assert.ok(own.every(s=>s.decade===decade));
}
assert.deepEqual(steps.slice(-3).map(s=>s.repetition),[1,2,3]);
assert.equal(mercyStepInfo(steps,61).completed,true);
assert.equal(mercyStepInfo(steps,0).completed,false);
assert.equal(mercyStepInfo(steps,-1).index,0);
assert.ok(steps.every(s=>s.kind==="canonical"||s.source.startsWith("https://")));
assert.ok(DEVOTIONAL_METHOD_SOURCES.mercyFr.includes("vaticannews.va"));
assert.ok(DEVOTIONAL_METHOD_SOURCES.mercyEn.includes("thedivinemercy.org"));

const corpus=PRAY_CANONICAL_DATA_V435930.prayers;
for(const language of ["en","fr"]){
 for(const index of [0,1,2,3,4,5,14,15,26,59,60,61]){
  const reader=renderMercyReader({steps,state:{step:index,mode:"guided"},corpus,language});
  assert.match(reader,/data-ao-devotional-sequence="divine-mercy"/);
  assert.match(reader,new RegExp('data-ao-mercy-step="'+index+'"'));
  assert.match(reader,/class="aoMercyPrayer"/);
  assert.match(reader,/href="https:\/\/(www.vaticannews.va|thedivinemercy.org|www.vatican.va)/);
  assert.ok(reader.includes(language==="fr"?"Guide · prier":"Guide · pray"));
 }
 const simple=renderMercyReader({steps,state:{step:4,mode:"simple"},corpus,language});
 assert.doesNotMatch(simple,/class="aoMercyGuide"/);
}
const ending=renderMercyReader({steps,state:{step:61,mode:"guided"},corpus,language:"fr"});
assert.match(ending,/data-p435930-mercy-restart/);
assert.doesNotMatch(ending,/data-p435930-mercy-move="next"/);

assert.deepEqual(FIFTEEN_CYCLE,["joyful","sorrowful","glorious"]);
assert.equal(nextFullRosarySet("joyful"),"sorrowful");
assert.equal(nextFullRosarySet("sorrowful"),"glorious");
assert.equal(nextFullRosarySet("glorious"),null);
assert.equal(nextFullRosarySet("luminous"),null);
assert.deepEqual(ROSARY_METHODS.map(x=>x.id),["common","dominican","montfort"]);
assert.equal(DOMINICAN_OPENING.length,6);
assert.deepEqual(DOMINICAN_OPENING.map(x=>x.role),["V","R","V","R","V","R"]);
assert.equal(Object.keys(MONTFORT_GRACES).length,15);
assert.ok(!MONTFORT_GRACES.lum1);
const fake=[
 {kind:"prayer",phase:"opening",key:"sign"},
 {kind:"mystery",phase:"decade",mi:0},
 {kind:"prayer",phase:"decade",mi:4,key:"gloria"},
 {kind:"prayer",phase:"decade",mi:4,key:"fatima"},
 {kind:"conclusion",phase:"conclusion"}
];
assert.equal(firstMysteryIndex(fake),1);
assert.equal(lastDecadeBoundary(fake),3);
const donor=readFileSync("ao-inline-a45824678e308933fad5.js","utf8");
assert.match(donor,/selectSet:\(set,\{skipOpening=false\}=\{\}\)=>/);
assert.match(donor,/S\.rosarySet=set;const xs=labRosarySteps\(set\)/);
const presentation=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(presentation,/else if\(id==='pray\.divine_mercy'\)/);
assert.match(presentation,/renderDivineMercy\(\)/);
assert.match(presentation,/nextFullRosarySet\(st\?\.set\)/);
assert.match(presentation,/paintRosaryMethods/);
assert.match(presentation,/data-p435930-mercy-mode/);
assert.match(presentation,/ROSARY_METHOD\.fullActive/);
assert.doesNotMatch(presentation,/AUTOPLAY_MERCY|setInterval\(.*mercy/);
console.log("PASS Divine Mercy 62 steps, bilingual canonical prayers, Dominican/Montfort methods and native 15-decade handoffs");
