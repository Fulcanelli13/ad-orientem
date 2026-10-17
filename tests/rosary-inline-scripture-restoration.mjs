import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSARY_GUIDED_BEAD_EVIDENCE_V1} from "../src/pray/rosary-guided-bead-evidence.v1.js";
import {rosaryBeadContextReference} from "../src/pray/rosary-scripture-policy.js";
import {rosaryInlineVersePlan,rosaryInlineSourceVerses,ROSARY_RESTORED_BIBLE_STATUS} from "../src/pray/rosary-bead-scripture.js";
const witnesses=Object.values(ROSARY_GUIDED_BEAD_EVIDENCE_V1).flat();
assert.equal(witnesses.length,200);
let bible=0,doctrine=0;
for(const source of witnesses){
 const citation=rosaryBeadContextReference(source);
 if(!citation){doctrine++;assert.equal(rosaryInlineVersePlan(source.reference),null);continue}
 bible++;
 const plan=rosaryInlineVersePlan(citation);
 const french=rosaryInlineVersePlan(citation,{french:true});
 assert.ok(plan&&french);
 assert.equal(plan.editionId,"cpdv-2009");
 assert.equal(french.editionId,"crampon-1923");
 assert.ok(plan.shownEnd-plan.shownStart<2,"Bead must not repeat full passages");
 assert.equal(plan.catenaAvailable,["Matthew","Mark","Luke","John"].includes(plan.passage.book));
}
assert.equal(bible,190);assert.equal(doctrine,10);
assert.equal(ROSARY_RESTORED_BIBLE_STATUS,"UNCOLLATED_SOURCE_WITNESS");
const plan=rosaryInlineVersePlan("Luke 1:28-30");
assert.equal(plan.partial,true);
const fetched=await rosaryInlineSourceVerses(plan,{loader:async()=>[
 {book:"Luke",chapter:1,verseStart:28,verseEnd:28,text:"Source text 28",sourceStatus:"UNCOLLATED_SOURCE_WITNESS",reviewed:false},
 {book:"Luke",chapter:1,verseStart:29,verseEnd:29,text:"Source text 29",sourceStatus:"UNCOLLATED_SOURCE_WITNESS",reviewed:false},
 {book:"Luke",chapter:1,verseStart:30,verseEnd:30,text:"Source text 30",sourceStatus:"UNCOLLATED_SOURCE_WITNESS",reviewed:false}
]});
assert.deepEqual(fetched.map(x=>x.verse),[28,29],"Only one or two complete verses per bead");
assert.equal(rosaryInlineVersePlan("Munificentissimus Deus §44"),null);
const policy=readFileSync("src/pray/rosary-scripture-policy.js","utf8");
const scripture=readFileSync("src/scripture/browser-entry.js","utf8");
const library=readFileSync("src/scripture/library.js","utf8");
assert.match(policy,/restoreRosaryBeadScripture\(root,prayer,witness/);
assert.match(policy,/rosaryBeadContextReference\(witness\)/);
assert.match(scripture,/aoScriptureDepth==="commentary"/);
assert.match(scripture,/initialDepth:depth==="commentary"/);
assert.match(library,/commentaryVisible=Boolean\(context\?\.reference&&initialDepth==="commentary"\)/);
assert.match(policy,/\.lab-scripture-cue/,"Unsafe donor fragments remain excluded");
assert.ok(!policy.includes("window.AO_ROSARY_V381="),"Existing Rosary player remains the sole owner");
console.log("PASS Lab-ora-style CPDV/Crampon Rosary inline verse and Fathers contracts; 190 source citations + 10 doctrinal holds");
