import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {CURATED_LIVE_GROUPS} from "../src/mass/reader-live-curated-cards.js";
import {normalizeReaderMoment} from "../src/mass/reader-dom.js";
import {createReaderGestureMatrixController} from "../src/mass/reader-gesture-matrix.js";
import {certifiedLiveCanonActionOverride} from "../src/mass/reader-live-canon-action.js";
import {assertV183PreGospelLiveContract} from "../src/mass/reader-live-pre-gospel.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=path=>readFileSync(resolve(root,path),"utf8");
const packageJson=JSON.parse(read("package.json"));
const browser=read("src/mass/browser-entry.js");
const native=read("src/mass/reader-native-preview.js");
const properSlots=read("src/mass/proper-reader-slots.js");
const sourceMap=JSON.parse(read("data/presentation/reader-section-map.v0.13.1.json"));
const added=Object.values(CURATED_LIVE_GROUPS).reduce((n,part)=>{
 assert.equal(part.titles.length,part.after.length+1,"Curated titles must match exact source cuts");
 assert.ok(part.after.every(c=>Boolean(c.block)||Number.isInteger(c.cue)),"Every cut needs exact source evidence");
 return n+part.after.length;
},0);
assert.equal(39+added,65,"65-card single-Sanctus source-first LIVE product contract regressed");
assert.deepEqual(CURATED_LIVE_GROUPS["AO.CARD.013"].titles,["Sanctus"],
  "Keep both Sanctus and Benedictus in one prayer card titled simply Sanctus");
assert.deepEqual(CURATED_LIVE_GROUPS["AO.CARD.013"].after,[]);
assert.ok(CURATED_LIVE_GROUPS["AO.CARD.024"].titles[0].includes("Second Confiteor"));
assert.doesNotMatch(browser,/aoLiveCards=(?:48|65)/,
  "Production entry must not accept any obsolete LIVE card-count query flag");
assert.doesNotMatch(browser,/rollback48|reviewCuratedCards:!rollback48/,
  "URL-driven 48-card reader cannot return to production");
assert.match(native,/prepared,reviewCuratedCards:true,presentationData/,
  "Only the certified 65-family may be requested by the user-facing native mount");
assert.match(native,/projectCuratedOrdinaryLiveCards\(model\)/,
  "65-family projector must remain source-owned");
assert.doesNotMatch(native,/projectSourceFirst48Presentation|SOURCE_FIRST_LIVE_PRODUCT_48/,
  "Retired 48-card projection must not be reachable from the native reader");
const pre=assertV183PreGospelLiveContract();
assert.deepEqual(pre.order,["AO.SM.B021","AO.SM.B022","AO.SM.B023"]);
assert.equal(pre.alleluiaTract.mayMergeIntoGradual,false);
assert.ok(sourceMap.ordinarySungSections.some(row=>row.sectionId==="AO.CARD.006"&&row.name.includes("Gradual")));
assert.match(properSlots,/const sequenceRows=values\(proper\.sequence,locale\)/);
assert.ok(properSlots.includes("No separately sourced Alleluia/Tract or Sequence."),"Missing chant must not create invented content");
assert.match(packageJson.scripts["test:mass-batch4-release"],/mass-phase12-curated65-contract/);
assert.ok(packageJson.scripts.test.includes("test:mass-batch4-release"));
// The 65-card Consecrations use *different titles* from their preparation
// cards. Latin must be prominent when the reader follows the actual words.
for(const [title,latin,vernacular,cue] of [
 ["Words of Consecration and Elevation · Host",
  "Hoc est enim Corpus meum","For this is my Body","AO.SM.C0173"],
 ["Words of Consecration and Elevation · Chalice",
  "Hic est enim Calix Sanguinis mei","For this is the Chalice of my Blood","AO.SM.C0179"],
]){
 assert.ok(Object.values(CURATED_LIVE_GROUPS).some(group=>group.titles.includes(title)),
   "The 65-card Consecration title changed without its Latin priority gate");
 const vernacularFirst=normalizeReaderMoment({cardTitle:title,paragraphs:[{
   id:cue,sourceCueIds:[cue],kind:"TEXT",primary:vernacular,alternate:latin,
   displayLanguage:"VERNACULAR",replaceOnToggle:true,
 }]});
 assert.equal(vernacularFirst.paragraphs[0].primary,latin,title+" must show Latin first");
 assert.equal(vernacularFirst.paragraphs[0].secondary,vernacular);
 assert.equal(vernacularFirst.paragraphs[0].kind,"CONSECRATION_WORDS");
 assert.equal(vernacularFirst.paragraphs[0].displayLanguage,"LATIN");
 assert.equal(vernacularFirst.paragraphs[0].replaceOnToggle,false);
 const latinFirst=normalizeReaderMoment({cardTitle:title,paragraphs:[{
   id:cue,sourceCueIds:[cue],kind:"TEXT",primary:latin,alternate:vernacular,
   displayLanguage:"LATIN",replaceOnToggle:true,
 }]});
 assert.equal(latinFirst.paragraphs[0].primary,latin,
   title+" cannot reverse already Latin-first source");
 assert.equal(latinFirst.paragraphs[0].alternate,vernacular);
 assert.equal(latinFirst.paragraphs[0].kind,"CONSECRATION_WORDS");
}
const outside=normalizeReaderMoment({cardTitle:"Unde et memores",paragraphs:[{
 id:"ordinary",kind:"TEXT",primary:"English text",alternate:"Latin text",
 displayLanguage:"VERNACULAR",replaceOnToggle:true,
}]});
assert.equal(outside.paragraphs[0].primary,"English text",
  "Latin prominence must not spill across other LIVE cards");

// The frozen donor only says SIGNS HOST at C0185, whereas a separately
// certified priest gesture covers Host THEN Chalice at this exact cue.
const donor=JSON.parse(read("data/presentation/reader-priest-actions.v1.json"));
assert.equal(donor.items.find(x=>x.cueId==="AO.SM.C0185").label,"SIGNS HOST");
const matrix=JSON.parse(read("data/mass/gesture-matrix.v1.json"));
const sourceAction=createReaderGestureMatrixController({data:matrix})
  .project("AO.SM.C0185").primaryPriestAction;
const c0185=certifiedLiveCanonActionOverride({
 presentationMode:"LIVE",curatedPresentation:true,cueId:"AO.SM.C0185",matrixAction:sourceAction,
});
assert.equal(c0185.label,"CROSSES HOST THEN CHALICE");
assert.equal(c0185.owner,"GESTURE_MATRIX_SOT");
assert.equal(c0185.observedNow,false);
assert.equal(c0185.sourceCueAdvisory,true);
assert.equal(certifiedLiveCanonActionOverride({
 presentationMode:"LIVE",curatedPresentation:false,
 cueId:"AO.SM.C0185",matrixAction:sourceAction,
}),null,"Uncertified noncurated source projections must not borrow 65-only actions");
for(const mode of ["MISSAL","SIMPLE"]){
 assert.equal(certifiedLiveCanonActionOverride({
  presentationMode:mode,curatedPresentation:true,cueId:"AO.SM.C0185",matrixAction:sourceAction,
 }),null,"Other modes must retain their existing presentation contracts");
}
for(const incorrect of [
 {...sourceAction,sourceGestureId:"EDITORIAL_CANDIDATE"},
 {...sourceAction,sources:["UNAPPROVED"]},
 {...sourceAction,authorityClass:"DRAFT"},
 {...sourceAction,label:"SIGNS HOST"},
]){
 assert.equal(certifiedLiveCanonActionOverride({
  presentationMode:"LIVE",curatedPresentation:true,cueId:"AO.SM.C0185",matrixAction:incorrect,
 }),null,"Uncertified source-cue action must fail closed");
}
assert.equal(certifiedLiveCanonActionOverride({
 presentationMode:"LIVE",curatedPresentation:true,cueId:"AO.SM.C0174",matrixAction:sourceAction,
}),null,"No source action may leak onto the Host elevation");
assert.match(native,/originalPriestAction=canonLiveAction\?\?/,
 "LIVE projector must use the certified correction before the frozen cue label");

console.log("PASS Phase 1/2: 39-source/65-curated production, 64-visible condition, no public 48/65 URL rollback; source-native exceptions retained without the historical 48-card fallback.");
