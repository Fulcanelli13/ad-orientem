import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA} from "../src/office/advent-first-vespers-source-sequence.js";
import {ADVENT_VESPERS_REMAINDER_SCHEMA} from "../src/office/advent-vespers-remainder-research.js";
import {OFFICE_MAGNIFICAT_SOURCE_SCHEMA} from "../src/office/advent-magnificat-source.js";
import {OFFICE_ADVENT_CHAPTER_HYMN_SCHEMA} from "../src/office/advent-vespers-chapter-hymn.js";
import {OFFICE_SOURCE_SLICE_SCHEMA} from "../src/office/source-acceptance-slice.js";
import {OFFICE_VESPERS_ORIGINAL_PRAYERS_SCHEMA}
 from "../src/office/advent-vespers-ordinary-prayers.js";
import {assembleAdventFirstVespersResearch}
 from "../src/office/advent-first-vespers-assembled-research.js";

const pin=DIVINUM_OFFICIUM_PIN,langs=["la","en","fr"];
const shared={sourceRevision:pin,civilDate:"2026-11-28",
 officeDate:"2026-11-29",officePart:"FIRST",
 appointedOfficeVerified:false,completeHourVerified:false,
 publishable:false,published:false};
const trace=(sourceId,lang)=>({sourceId,language:lang});
function fixture(){
 const sourceSequence={...shared,schema:ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA,
  status:"SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED",
  psalmRowsVerifiedAsSourceCandidates:5};
 const psalmody={...shared,schema:ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA,
  status:"FIVE_SATURDAY_PSALM_SEGMENTS_TRILINGUAL_UNVERIFIED",
  gloriaPatriVerified:false,requiredAntiphonPlacementVerified:false,
  psalmVerseComponents:[[143,"1-8"],[143,"9-15"],[144,"1-7"],[144,"8-13a"],[144,"13b-21"]].map(([number,sourceRange])=>({
   psalmNumber:number,sourceRange,
   languages:Object.fromEntries(langs.map(lang=>[lang,{
    antiphon:"Antiphon "+lang+" "+number,
    psalmVerses:number+":1 Verse text "+lang,
    sourceTrace:[trace("Psalterium/Psalmorum/Psalm"+number+"#"+sourceRange,lang)]
   }]))
  }))};
 const properWitness={...shared,schema:ADVENT_VESPERS_REMAINDER_SCHEMA,
  status:"VERSICLE_AND_MAGNIFICAT_ANTIPHON_SOURCES_IDENTIFIED",
  languages:Object.fromEntries(langs.map(lang=>[lang,{
   versicle:["V. "+lang+" Rorate","R. "+lang+" Aperiatur"],
   versicleSourceId:"Psalterium/Special/Major Special#Adv Versum 3",
   magnficatAntiphon:"Magnificat Antiphon "+lang
  }]))};
 const magnificat={...shared,schema:OFFICE_MAGNIFICAT_SOURCE_SCHEMA,
  status:"MAGNIFICAT_THREE_LANGUAGE_SOURCE_COMPONENT_UNVERIFIED",
  rubricAntiphonPlacementVerified:false,
  languages:Object.fromEntries(langs.map(lang=>[lang,{
   canticle:{verses:Array.from({length:10},(_,i)=>({
    verse:"Luke 1:"+(i+46),text:lang+" verse "+(i+46)
   }))},
   gloria:["V. "+lang+" Gloria Patri","R. "+lang+" Amen"],
   sourceTrace:[trace("Tempora/Adv1-0#Ant 1",lang),
    trace("Psalterium/Psalmorum/Psalm232#LUKE_1_46_55",lang),
    trace("Psalterium/Common/Prayers#Gloria",lang)]
  }]))};
 const chapterHymn={...shared,schema:OFFICE_ADVENT_CHAPTER_HYMN_SCHEMA,
  status:"THREE_LANGUAGE_CHAPTER_HYMN_SOURCE_UNVERIFIED",
  languages:Object.fromEntries(langs.map(lang=>[lang,{
   chapter:{chapterText:"v. "+lang+" Romans 13:11",
    response:"R. "+lang+" Deo gratias",
    sourceTrace:[trace("Tempora/Adv1-0#Capitulum Laudes",lang),
     trace("Psalterium/Common/Prayers#Deo gratias",lang)]
   },
   hymn:{lines:[{kind:"HYMN_LINE",text:lang+" Creatór alme siderum"}]}
  }]))};
 const collect={schema:OFFICE_SOURCE_SLICE_SCHEMA,
  status:"TRILINGUAL_SOURCE_COMPONENT_SLICE_UNVERIFIED",
  sourceRevision:pin,civilDate:"2026-11-28",date:"2026-11-29",
  officePart:"FIRST",completeHourVerified:false,
  publishable:false,published:false,
  sections:[{role:"COLLECT",sourceId:"Tempora/Adv1-0#Oratio",
   texts:Object.fromEntries(langs.map(lang=>[lang,lang+" source collect"])),
   referenceTraces:Object.fromEntries(langs.map(lang=>[lang,[
    trace("Tempora/Adv1-0#Oratio",lang),
    trace("Psalterium/Common/Prayers#Qui vivis",lang)
   ]]))}]};
 return {sourceSequence,psalmody,properWitness,magnificat,chapterHymn,collect};
}
test("one ordered 10-slot Vespers research artifact joins all available source parts with 7 source-text slots",()=>{
 const r=assembleAdventFirstVespersResearch(fixture());
 assert.equal(r.status,"ORDERED_TRILINGUAL_SOURCE_RESEARCH_NOT_A_COMPLETE_OFFICE");
 assert.equal(r.sourceComponentSlots,10);
 assert.equal(r.sourceTextComponentSlots,7);
 assert.equal(r.liturgicallyCompleteSlots,0);
 assert.deepEqual(r.unresolvedSlots,["opening","commemorations","conclusion"]);
 assert.deepEqual(r.slots.map(x=>x.key),[
  "opening","five-psalmody","chapter","hymn","versicle",
  "magnificat-antiphon","magnificat-canticle","collect",
  "commemorations","conclusion"
 ]);
 assert.equal(r.slots[1].texts.fr[4].verses,"144:1 Verse text fr");
 assert.equal(r.slots[6].texts.la.verses.length,10);
 assert.equal(r.slots[7].texts.fr,"fr source collect");
 assert.equal(r.slots[0].texts,null);
 assert.equal(r.slots[9].visibleInLiveReader,false);
 assert.equal(r.slots.every(s=>s.liturgicallyComplete===false),true);
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.printedEditionCertified,false);
 assert.equal(r.translationAlignmentVerified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("changed First vs Second Vespers or forged appointment cannot produce source assembly",()=>{
 for(const x of [
  {sourceSequence:{...fixture().sourceSequence,officePart:"SECOND"}},
  {psalmody:{...fixture().psalmody,appointedOfficeVerified:true}},
  {magnificat:{...fixture().magnificat,completeHourVerified:true}}
 ]){
  const r=assembleAdventFirstVespersResearch({...fixture(),...x});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.publishable,false);
 }
});
test("missing one French psalm or tampered psalm number blocks all ten slots",()=>{
 for(const mutate of [
  x=>{delete x.psalmody.psalmVerseComponents[1].languages.fr},
  x=>{x.psalmody.psalmVerseComponents[3].psalmNumber=118},
  x=>{x.psalmody.psalmVerseComponents[0].languages.la.sourceTrace[0].sourceId=
   "Psalterium/Psalmorum/Psalm108#VERSES"}
 ]){
  const x=fixture();mutate(x);
  const r=assembleAdventFirstVespersResearch(x);
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.sourceTextComponentSlots,0);
 }
});
test("a missing French Gloria or missing Latin collect source conclusion cannot appear as complete",()=>{
 for(const mutate of [
  x=>{delete x.magnificat.languages.fr.canticle},
  x=>{x.collect.sections[0].referenceTraces.la=[]}
 ]){
  const x=fixture();mutate(x);
  const r=assembleAdventFirstVespersResearch(x);
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.publishable,false);
 }
});

function openingClosing(){
 return {...shared,schema:OFFICE_VESPERS_ORIGINAL_PRAYERS_SCHEMA,
  status:"OPENING_AND_CONCLUSION_SOURCE_CANDIDATES_UNVERIFIED",
  selected1960Ordinary:false,priestOrLayVariantVerified:false,
  languages:Object.fromEntries(langs.map(lang=>[lang,{
   opening:["Pater noster","Ave Maria","Deus in adjutorium","Alleluia"]
    .map(name=>({sourceId:"Psalterium/Common/Prayers#"+name,
      sourceText:["v. "+lang+" "+name],liturgicalChoiceAuthorized:false})),
   ending:["Dominus","Benedicamus Domino","Fidelium animae"]
    .map(name=>({sourceId:"Psalterium/Common/Prayers#"+name,
      sourceText:["V. "+lang+" "+name],liturgicalChoiceAuthorized:false}))
  }]))
 };
}
test("when original Ordinary source branches are observed, nine of ten slots contain source texts but zero are liturgically complete",()=>{
 const r=assembleAdventFirstVespersResearch({...fixture(),
  openingClosing:openingClosing()});
 assert.equal(r.status,"ORDERED_TRILINGUAL_SOURCE_RESEARCH_NOT_A_COMPLETE_OFFICE");
 assert.equal(r.sourceTextComponentSlots,9);
 assert.equal(r.liturgicallyCompleteSlots,0);
 assert.deepEqual(r.unresolvedSlots,["commemorations"]);
 assert.equal(r.slots[0].texts.fr.length,4);
 assert.equal(r.slots[9].texts.en.length,3);
 assert.equal(r.slots[9].unresolvedLiturgicalGates.includes(
  "PRIEST_OR_LAY_DOMINUS_VOBISCUM_BRANCH"),true);
 assert.equal(r.slots.every(x=>x.visibleInLiveReader===false),true);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("forged Ordinary approval cannot remove priest or lay dismissal exception",()=>{
 const evidence=openingClosing();
 const r=assembleAdventFirstVespersResearch({...fixture(),
  openingClosing:{...evidence,priestOrLayVariantVerified:true}});
 assert.equal(r.status,"WITHHELD");
 assert.equal(r.publishable,false);
});
