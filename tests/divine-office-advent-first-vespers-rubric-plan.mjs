import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {OFFICE_ADVENT_ASSEMBLY_SCHEMA}
 from "../src/office/advent-first-vespers-assembled-research.js";
import {reviewAdventFirstVespers1960RubricPlan as review}
 from "../src/office/advent-first-vespers-rubric-plan.js";
import {reviewAdventI2026UniversalCommemoration}
 from "../src/office/advent-first-vespers-universal-commemoration.js";
import {readFileSync} from "node:fs";
const universal=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-universal-commemoration.json",
 import.meta.url),"utf8"));
const prefix="Psalterium/Common/Prayers#";
const lang=["la","en","fr"],segments=[
 [143,"1-8"],[143,"9-15"],[144,"1-7"],[144,"8-13a"],[144,"13b-21"]
];
const sourceIds=segments.map(([n,r])=>"Psalterium/Psalmorum/Psalm"+n+"#"+r);
const makeSlot=(key,sourceIds,texts,hasText=true)=>({
 key,sourceIds,texts,originalSourceTextIdentified:hasText,
 liturgicallyComplete:false,visibleInLiveReader:false,
 status:hasText?"SOURCE_TEXT_ONLY_NOT_LITURGICALLY_APPOINTED":"WITHHELD_NO_COMPOSED_TEXT"
});
const locale=mapper=>Object.fromEntries(lang.map(l=>[l,mapper(l)]));
const section=(id,l)=>({sourceId:prefix+id,sourceText:["test "+l+" "+id]});
function assembly(){
 const opening=["Pater noster","Ave Maria","Deus in adjutorium","Alleluia"];
 const end=["Dominus","Benedicamus Domino","Fidelium animae"];
 const slots=[
  makeSlot("opening",opening.map(x=>prefix+x),
   locale(l=>opening.map(x=>section(x,l)))),
  makeSlot("five-psalmody",[
   "Psalterium/Psalmi/Psalmi major#Day6 Vespera",
   "Tempora/Adv1-0#Ant Laudes",...sourceIds
  ],locale(l=>segments.map(([n,r],i)=>({
   antiphon:"Antiphon "+l+" "+i,verses:[n,r,l]
  })))),
  makeSlot("chapter",["Tempora/Adv1-0#Capitulum Laudes",
   prefix+"Deo gratias"],locale(l=>l+" chapter")),
  makeSlot("hymn",["Psalterium/Special/Major Special#Hymnus Adv Vespera"],
   locale(l=>l+" hymn")),
  makeSlot("versicle",["Psalterium/Special/Major Special#Adv Versum 3"],
   locale(l=>l+" verse")),
  makeSlot("magnificat-antiphon",["Tempora/Adv1-0#Ant 1"],
   locale(l=>l+" antiphon")),
  makeSlot("magnificat-canticle",[
   "Psalterium/Psalmorum/Psalm232#LUKE_1_46_55",prefix+"Gloria"],
   locale(l=>({verses:Array.from({length:10},(_,i)=>l+" "+i),
    gloria:["Gloria","Sicut"]}))),
  makeSlot("collect",["Tempora/Adv1-0#Oratio",prefix+"Qui vivis"],
   locale(l=>l+" collect")),
  makeSlot("commemorations",[],null,false),
  makeSlot("conclusion",end.map(x=>prefix+x),
   locale(l=>end.map(x=>section(x,l))))
 ];
 return {schema:OFFICE_ADVENT_ASSEMBLY_SCHEMA,
  status:"ORDERED_TRILINGUAL_SOURCE_RESEARCH_NOT_A_COMPLETE_OFFICE",
  sourceRevision:PIN,civilDate:"2026-11-28",
  officeDate:"2026-11-29",hour:"VESPERS",officePart:"FIRST",
  sourceComponentSlots:10,sourceTextComponentSlots:9,
  liturgicallyCompleteSlots:0,slots,appointedOfficeVerified:false,
  completeHourVerified:false,printedEditionCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false};
}
test("1960 research plan has Saturday psalter, 12 full antiphon uses, six Gloria and no Pater/Ave or preces",()=>{
 const p=review({assembly:assembly()});
 assert.equal(p.status,"RUBRIC_ORDER_RESEARCH_WITH_HELD_COLLATION");
 assert.equal(p.sourceAudit.psalmPortions,5);
 assert.equal(p.sourceAudit.fullAntiphonUsages,12);
 assert.equal(p.sourceAudit.gloriaPatriPositions,6);
 assert.equal(p.sourceAudit.openingGloriaPatriPositions,1);
 assert.equal(p.sourceAudit.totalDoxologyPositionsIncludingOpening,7);
 assert.equal(p.sourceAudit.preces,0);
 assert.equal(p.sourceAudit.paterAveAtOpening,0);
 assert.deepEqual(p.orderedEvents.slice(0,2).map(x=>x.sourceId),[
  prefix+"Deus in adjutorium",prefix+"Alleluia"
 ]);
 assert.deepEqual(p.orderedEvents.filter(x=>x.kind==="PSALM_PORTION").map(x=>x.sourceId),sourceIds);
 assert.equal(p.orderedEvents.filter(x=>x.kind==="GLORIA_PATRI").length,6);
 const ants=p.orderedEvents.filter(x=>x.kind.startsWith("ANTIPHON_"));
 assert.equal(ants.length,12);
 assert.deepEqual(ants.slice(0,10).map(x=>x.sourceRow),[1,1,2,2,3,3,4,4,5,5]);
 assert.equal(ants[0].sourceId,"Tempora/Adv1-0#Ant Laudes");
 for(let i=0;i<6;i++)assert.equal(ants[2*i].sourceId,ants[2*i+1].sourceId);
 assert.equal(p.orderedEvents.some(x=>x.kind==="PRECES"),false);
 assert.equal(p.orderedEvents.some(x=>x.kind==="COMMEMORATIONS_UNADJUDICATED"),true);
 assert.equal(p.completeHourVerified,false);
 assert.equal(p.printedEditionCertified,false);
 assert.equal(p.publishable,false);
 assert.equal(p.published,false);
});
test("collect dialogue follows recitation and ministry distinctions without approving text",()=>{
 for(const [mode,minister,expected] of [
  ["SOLO","DEACON_OR_HIGHER","DOMINE_EXAUDI"],
  ["SOLO","BELOW_DEACON","DOMINE_EXAUDI"],
  ["CHOIR_OR_COMMON","BELOW_DEACON","DOMINE_EXAUDI"],
  ["CHOIR_OR_COMMON","DEACON_OR_HIGHER","DOMINUS_VOBISCUM"]
 ]){
  const p=review({assembly:assembly(),recitation:mode,minister});
  assert.equal(p.dialogue,expected);
  assert.equal(p.orderedEvents.find(x=>x.kind==="BEFORE_COLLECT_DIALOGUE").variant,expected);
  assert.equal(p.rubricsFullyCertified,false);
 }
});
test("cannot silently accept local overlays, unsupported mode, missing language or Sunday Psalter",()=>{
 const invalid=[
  {calendarScope:"LOCAL"},
  {recitation:"PUBLIC"},
  {minister:"PRIEST_OR_LAY"},
  {assembly:{...assembly(),officePart:"SECOND"}},
  {assembly:{...assembly(),sourceTextComponentSlots:10}},
  {assembly:{...assembly(),appointedOfficeVerified:true}},
 ];
 for(const o of invalid){
  const p=review({assembly:assembly(),...o});
  assert.equal(p.status,"WITHHELD");assert.equal(p.publishable,false);
  assert.equal(p.orderedEvents.length,0);
 }
 const missed=assembly();
 delete missed.slots[1].texts.fr;
 assert.equal(review({assembly:missed}).status,"WITHHELD");
 const switched=assembly();
 switched.slots[1].sourceIds[0]="Psalterium/Psalmi/Psalmi major#Day0 Vespera";
 assert.equal(review({assembly:switched}).status,"WITHHELD");
});
test("unverified commemoration and incipit-overlap remain explicit",()=>{
 const p=review({assembly:assembly()});
 assert.ok(p.unresolvedGates.includes("UNIVERSAL_AND_LOCAL_PRIVILEGED_COMMEMORATION_REVIEW"));
 assert.ok(p.unresolvedGates.includes("1960_ANTIPHON_PSALM_INCIPIT_OVERLAP_198"));
 assert.equal(p.orderedEvents.filter(x=>x.kind==="PSALM_PORTION").every(x=>x.incipitOverlap198Collated===false),true);
 assert.equal(p.orderedEvents.find(x=>x.kind==="COMMEMORATIONS_UNADJUDICATED").selectionAuthorized,false);
});

test("explicit 1960 universal-only decision replaces commemoration unknown while local remains withheld",()=>{
 const universalCommemoration=reviewAdventI2026UniversalCommemoration({witness:universal});
 const p=review({assembly:assembly(),universalCommemoration});
 assert.equal(p.status,"RUBRIC_ORDER_RESEARCH_WITH_HELD_COLLATION");
 assert.equal(p.sourceAudit.universalCommemorationDecision,"NO_UNIVERSAL_COMMEMORATION");
 const e=p.orderedEvents.find(x=>x.slot==="commemorations");
 assert.equal(e.kind,"NO_UNIVERSAL_COMMEMORATION");
 assert.equal(e.noSourceTextRequired,true);
 assert.equal(e.localCalendarAdjudicated,false);
 assert.ok(p.unresolvedGates.includes("LOCAL_PRIVILEGED_COMMEMORATION_REVIEW"));
 assert.equal(p.completeHourVerified,false);
 assert.equal(p.publishable,false);
});
test("forged universal approval or fabricated local resolution fails closed",()=>{
 const ok=reviewAdventI2026UniversalCommemoration({witness:universal});
 for(const edit of [
  {localCalendarReviewed:true},{officePart:"SECOND"},
  {universalCommemorationCount:1},{completeHourCertified:true},
  {status:"APPROVED"},{published:true}
 ]){
  const p=review({assembly:assembly(),universalCommemoration:{...ok,...edit}});
  assert.equal(p.status,"WITHHELD");assert.equal(p.publishable,false);
 }
});
