import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sanctuaryCueProjection,sanctuaryAspergesProjection,SANCTUARY_PROTOCOL,
 createReaderSanctuaryPreview} from "../src/mass/reader-sanctuary-visual.js";
import {createAspergesReaderController} from "../src/mass/reader-asperges.js";
import {checkSediliaObservation,SEDILIA_REVERENCE_EVENTS} from "../src/mass/reader-sedilia-reverence.js";
const card={sectionId:"AO.LIVECURATED.AO.CARD.003.2",
 sourceSectionId:"AO.CARD.003",title:"Gloria · Praise and Supplication"};
const state={nativeCueId:"AO.SM.C0055",schola:{trackId:"GLORIA"}};
const p=sanctuaryCueProjection({card,state,form:"SOLEMN",mode:"LIVE"});
assert.equal(p.type,SANCTUARY_PROTOCOL);
assert.equal(p.cardTitle,card.title);
assert.equal(p.sourceCueId,"AO.SM.C0055");
assert.equal(p.sourceSectionId,"AO.CARD.003");
assert.equal(p.scholaOnly,false);
assert.equal(p.certifiedSourceFocus,true);
assert.equal(p.requiem,false);
assert.equal(sanctuaryCueProjection({
 card,state,form:"SOLEMN",mode:"LIVE",
 prepared:{session:{resolvedMass:{actualCelebration:{type:"REQUIEM"}}}}
}).requiem,true,"Canonical Requiem selection must reach the preview solemn gate");

// The eight unique sung-word reverences each require a witnessed BEGIN/END.
assert.equal(Object.keys(SEDILIA_REVERENCE_EVENTS).length,8);
for(const [eventId,spec] of Object.entries(SEDILIA_REVERENCE_EVENTS)){
 const canonical={title:spec.card,sourceSectionId:spec.section};
 const observation={eventId,phase:"BEGIN",observed:true};
 const good=checkSediliaObservation({observation,card:canonical,
   form:"SOLEMN",mode:"LIVE"});
 assert.equal(good.accepted,true,eventId);
 assert.deepEqual(good.actors,eventId==="SED-CREDO-INCARNATUS"
   ?["P","S"]:["P","D","S"]);
 assert.ok(good.sequence.includes("PLACE_BIRETTA_ON_RIGHT_KNEE"));
 assert.equal(checkSediliaObservation({
   observation:{...observation,phase:"END"},card:canonical,
   form:"MISSA_CANTATA_SIMPLE",mode:"LIVE"
 }).accepted,true);
 for(const bad of [
   {card:{...canonical,title:"Unrelated text"},form:"SOLEMN",mode:"LIVE"},
   {card:canonical,form:"LOW",mode:"LIVE"},
   {card:canonical,form:"SOLEMN",mode:"MISSAL"},
   {card:canonical,form:"SOLEMN",mode:"LIVE",rite:"REQUIEM"}
 ])assert.equal(checkSediliaObservation({observation,...bad}).accepted,
   false,eventId+" invalid form/source/rite");
 assert.equal(checkSediliaObservation({
   observation:{...observation,observed:false},card:canonical,
   form:"SOLEMN",mode:"LIVE"
 }).accepted,false);
 const forwarded={
   eventId,phase:"BEGIN",observed:true,
   owner:"EXPLICIT_SEDILIA_GESTURE_OBSERVATION",
   nativeCardId:"AO.LIVECURATED."+spec.section+".2",
   sourceSectionId:spec.section
 };
 const projection=sanctuaryCueProjection({card:{
   ...canonical,sectionId:forwarded.nativeCardId
 },form:"SOLEMN",state:{observedSediliaReverence:forwarded}});
 assert.equal(projection.seatedReverenceObservation?.eventId,eventId);
 assert.equal(sanctuaryCueProjection({card:{
   ...canonical,sectionId:forwarded.nativeCardId
 },form:"SOLEMN",state:{observedSediliaReverence:{
   ...forwarded,owner:"CHOIR_TIMER"
 }}}).seatedReverenceObservation,null,
   "Never infer priest movement from the independent Schola");
}
const inc=SEDILIA_REVERENCE_EVENTS["SED-CREDO-INCARNATUS"];
assert.equal(checkSediliaObservation({observation:{
 eventId:"SED-CREDO-INCARNATUS",phase:"BEGIN",observed:true
},card:{title:inc.card,sourceSectionId:inc.section},form:"SOLEMN",
 mode:"LIVE",exceptionalIncarnatus:true}).reason,
 "INCARNATUS_EXCEPTION_REQUIRES_KNEEL");

// Canonical source *event*, not C0246 paragraph or Schola, may stage
// distribution/return. The objective event controller is the sole supplier.
const c57={sectionId:"AO.LIVECURATED.AO.CARD.025.1",
 sourceSectionId:"AO.CARD.025",title:"Communion of the Faithful"};
const expected={nativeCueId:"AO.SM.C0246",nativeEventId:"MC-COM-320"};
assert.equal(sanctuaryCueProjection({card:c57,state:expected,form:"SOLEMN"})
 .canonicalCommunionEventId,"MC-COM-320");
assert.equal(sanctuaryCueProjection({card:c57,state:{
 nativeCueId:"AO.SM.C0246",nativeEventId:"MC-COM-300"
},form:"LOW"}).canonicalCommunionEventId,"MC-COM-300");
assert.equal(sanctuaryCueProjection({card:c57,state:{
 nativeCueId:"AO.SM.C0246",nativeEventId:"MC-COM-310"
},form:"SOLEMN"}).canonicalCommunionEventId,"MC-COM-310");
assert.equal(sanctuaryCueProjection({card:c57,state:{
 nativeCueId:"AO.SM.C0246",nativeEventId:"MC-COM-305"
},form:"SOLEMN"}).canonicalCommunionEventId,null,
 "Independent Schola Communion antiphon is NOT a priest event");
assert.equal(sanctuaryCueProjection({card:c57,state:{
 nativeCueId:"AO.SM.C0246"
},form:"SOLEMN"}).canonicalCommunionEventId,null,
 "Communion text focus alone cannot synthesize return");
assert.equal(sanctuaryCueProjection({card:c57,state:expected,
 form:"MISSA_CANTATA_SIMPLE"}).canonicalCommunionEventId,null,
 "No blanket Solemn-to-Sung event transfer without certification");
assert.equal(sanctuaryCueProjection({card,
 state:expected,form:"SOLEMN"}).canonicalCommunionEventId,null,
 "A non-Communion source card cannot replay the return event");
assert.equal(sanctuaryCueProjection({card:c57,state:expected,form:"MISSAL"}),null,
 "Changing to MISSAL must not send canonical return cinematics");
const observedReturn={eventId:"MC-COM-320",
 nativeCardId:"AO.LIVECURATED.AO.CARD.025.1",
 sourceSectionId:"AO.CARD.025",actor:"PRIEST",observed:true,
 action:"RETURN_TO_ALTAR",owner:"EXPLICIT_PRIEST_COMMUNION_OBSERVATION"};
assert.equal(sanctuaryCueProjection({card:c57,form:"SOLEMN",
 state:{nativeCueId:"AO.SM.C0246",observedCommunionReturn:observedReturn}})
 .canonicalCommunionEventId,"MC-COM-320",
 "Only a genuine explicit native observer may forward a priest return");
for(const bad of [
 {...observedReturn,observed:false},
 {...observedReturn,actor:"SCHOLA"},
 {...observedReturn,action:"DISTRIBUTE_COMMUNION"},
 {...observedReturn,eventId:"MC-COM-305"},
 {...observedReturn,nativeCardId:"AO.LIVECURATED.AO.CARD.024.2"},
 {...observedReturn,owner:"CARD_SCROLL"}
]){
 assert.equal(sanctuaryCueProjection({card:c57,form:"SOLEMN",state:{
  nativeCueId:"AO.SM.C0246",observedCommunionReturn:bad
 }}).canonicalCommunionEventId,null,
 "Unverified or foreign observations must never start priest return");
}
const cancelled=sanctuaryCueProjection({card:c57,form:"SOLEMN",state:{
 observedCommunionReturn:observedReturn,communionReturnCancelled:true,
 nativeEventId:"MC-COM-320"
}});
assert.equal(cancelled.communionReturnCancelled,true);
assert.equal(cancelled.canonicalCommunionEventId,null,
 "An explicit observer cancellation must defeat even a stale native return");
assert.equal(sanctuaryCueProjection({card,form:"SOLEMN",state:{
 observedCommunionReturn:observedReturn
}}).canonicalCommunionEventId,null,
 "An observed C57 return must not cross into another source card");
assert.equal(sanctuaryCueProjection({card:c57,form:"MISSA_CANTATA_SIMPLE",
 state:{observedCommunionReturn:observedReturn}})
 .canonicalCommunionEventId,null,
 "Sung form cannot inherit an uncertified low/solemn return observation");

assert.equal(sanctuaryCueProjection({card,state,form:"SOLEMN",mode:"MISSAL"}),null);
assert.equal(sanctuaryCueProjection({card,state,form:"UNVERIFIED",mode:"LIVE"}),null);
assert.equal(sanctuaryCueProjection({card:{...card,stateOnly:true},state,
 form:"LOW",mode:"LIVE"}),null);
const omittedIncense=Object.freeze({
 sectionId:"AO.LIVECURATED.AO.CARD.010.5",
 sourceSectionId:"AO.CARD.010",
 title:"Incensation omitted for this Mass",
 stateOnly:true,omittedByRite:"1962_FORM_NO_INCENSE",paragraphs:[],
 blocks:[{blockId:"AO.SM.B036",omittedByRite:"1962_FORM_NO_INCENSE"}]
});
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 assert.equal(sanctuaryCueProjection({card:omittedIncense,form,
   mode:"LIVE",state:{nativeCueId:"AO.SM.C0121"}}),null,
   "Omitted 1962 incensation is an indexed but HIDDEN source card, "+
   "not a new sanctuary scene in "+form);
}
assert.equal(sanctuaryCueProjection({card:omittedIncense,form:"LOW",
 mode:"MISSAL"}),null,"MISSAL has no omitted-rite sanctuary handoff");
// Native visibleCardAllowed excludes ALL state-only omitted rite cards.
// C23 jumps directly to C25 with the priest at the altar.
assert.equal(sanctuaryCueProjection({card,state:{nativeCueId:"SCHOLA:OFFERTORY"},
 form:"MISSA_CANTATA_SIMPLE",mode:"LIVE"}).sourceCueId,null);
// Native R20, not a fabricated Cnn Mass card or a Schola text clock,
 // supplies all five Asperges stage identities and the personal gesture.
const extension=JSON.parse(readFileSync(new URL(
 "../data/mass/special-days-extension.v1.3.json",import.meta.url),"utf8"));
const aspergesPayload=JSON.parse(readFileSync(new URL(
 "../data/presentation/reader-asperges.v1.json",import.meta.url),"utf8"));
const asperges=createAspergesReaderController({
 graph:extension.graphs.ASP,payload:aspergesPayload
});
const aspBase={form:"SOLEMN",mode:"LIVE"};
let asp=sanctuaryAspergesProjection({
 aspergesState:asperges.project(),...aspBase
});
assert.equal(asp.sourceRiteId,"ASPERGES");
assert.equal(asp.riteStageId,"ASP-R01");
assert.deepEqual(asp.sourceRecordIds,["ASP-010"]);
assert.equal(asp.observedSprinkled,false);
asperges.goTo("ASP-R02");
asp=sanctuaryCueProjection({aspergesState:asperges.project(),...aspBase});
assert.equal(asp.riteStageId,"ASP-R02");
assert.deepEqual(asp.sourceRecordIds,["ASP-020","ASP-030"]);
assert.equal(asp.observedSprinkled,false,
 "The chant and preparatory kneeling must not masquerade as physical sprinkling");
asperges.goTo("ASP-R03");
asp=sanctuaryAspergesProjection({aspergesState:asperges.project(),...aspBase});
assert.equal(asp.observedSprinkled,false,
 "Simply visiting recipient stage must not create an observed sprinkle");
asperges.setActuallySprinkled(true);
asp=sanctuaryAspergesProjection({aspergesState:asperges.project(),...aspBase});
assert.equal(asp.observedSprinkled,true,
 "The user's explicit actually-sprinkled event may show the water illustration");
assert.equal(sanctuaryAspergesProjection({
 aspergesState:asperges.project(),mode:"MISSAL",form:"SOLEMN"}),null);
assert.equal(sanctuaryAspergesProjection({
 aspergesState:asperges.project(),mode:"LIVE",form:"LOW"}),null);
assert.equal(sanctuaryAspergesProjection({
 aspergesState:{...asperges.project(),card:{
  ...asperges.project().card,sourceRecordIds:["ASP-030"]}},...aspBase}),null,
 "Never accept a mismatched rite stage or Schola-only source record");
asperges.goTo("ASP-R04");
asp=sanctuaryAspergesProjection({aspergesState:asperges.project(),...aspBase});
assert.equal(asp.riteStageId,"ASP-R04");
assert.equal(asp.observedSprinkled,false,
 "No observed water gesture during return versicles");
asperges.goTo("ASP-R05");
asp=sanctuaryAspergesProjection({aspergesState:asperges.project(),...aspBase});
assert.equal(asp.riteStageId,"ASP-R05");
assert.deepEqual(asp.sourceRecordIds,["ASP-060"]);

// The canonical E63/E64 event graph must not silently reinterpret text
// or Schola as an independently observed *departure* from the altar.
// Ritus X.6 establishes an after-third-repetition rubric, but the
// canonical MC graph does not expose that boundary as a physical event.
const communionGraph=JSON.parse(readFileSync(new URL(
 "../data/mass/mc-events-05.v1.json",import.meta.url),"utf8"));
const byCommunionId=new Map(communionGraph.events.map(e=>[e.id,e]));
assert.deepEqual(["MC-COM-280","MC-COM-300","MC-COM-305",
 "MC-COM-310","MC-COM-320"].map(id=>byCommunionId.get(id)?.title),[
 "Domine non sum dignus ×3",
 "Distribution begins",
 "Schola begins Communion antiphon",
 "Holy Communion is being distributed",
 "Distribution concludes / priest returns"
]);
for(const id of ["MC-COM-300","MC-COM-310","MC-COM-320"]){
 const row=byCommunionId.get(id);
 assert.equal(row?.actor,"PRIEST");
 assert.deepEqual(row.sourceMomentRefs,["E64"]);
 assert.equal(row.evidenceTier,"A");
 assert.equal(row.forms.LOW,"CERTIFIED");
 assert.equal(row.forms.SOLEMN,"CERTIFIED");
}
assert.equal(byCommunionId.get("MC-COM-305")?.actor,"SCHOLA");
assert.equal(byCommunionId.get("MC-COM-280")?.actor,"PRIEST");
assert.deepEqual(byCommunionId.get("MC-COM-280")?.sourceMomentRefs,["E63"]);
assert.equal(byCommunionId.get("MC-COM-295"),undefined,
 "No canonical departure event exists between triple response and distribution");
assert.equal(sanctuaryCueProjection({card:c57,form:"SOLEMN",state:{
 nativeCueId:"AO.SM.C0246",nativeEventId:"MC-COM-280"
}}).canonicalCommunionEventId,null,
 "The triple response must not be mistaken for observed departure");
assert.equal(sanctuaryCueProjection({card:c57,form:"SOLEMN",state:{
 nativeCueId:"AO.SM.C0246",nativeEventId:"MC-COM-305"
}}).canonicalCommunionEventId,null,
 "The Schola Communion antiphon cannot move the priest");
assert.equal(createReaderSanctuaryPreview({enabled:false}).active,false);
console.log("PASS: LIVE sanctuary receives exact native card and cue only, no Schola or Missal source");


const visualSource=readFileSync(new URL("../src/mass/reader-sanctuary-visual.js",import.meta.url),"utf8");
assert.match(visualSource,/region\.hidden=true;shell\.classList\.remove\("ao-sanctuary-preview"\)/,
 "Missal or unsupported rite must remove the sanctuary layout, not merely stop animation");
assert.match(visualSource,/region\.hidden=false;shell\.classList\.add\("ao-sanctuary-preview"\)/,
 "Switching back to LIVE must restore original resizable sanctuary presentation");

const visualSourceLandscape=readFileSync(new URL("../src/mass/reader-sanctuary-visual.js",import.meta.url),"utf8");
assert.match(visualSourceLandscape,/grid-template-columns:var\(--ao-sanctuary-width\) minmax\(0,1fr\)/,
 "Compact sideways reading needs an actual side-by-side sanctuary and prayer stage");
assert.match(visualSourceLandscape,/if\(drag\.landscape\)setWidth\(/,
 "Sideways drag must resize sanctuary width instead of covering prayers");

assert.match(visualSourceLandscape,
 /\.ao-reader-shell\.ao-sanctuary-preview\[data-schola-visible="true"\][\s\S]*?\.ao-prayer-card\{\s*height:100%!important/,
 "The old native viewport-height hack must not crush a side-by-side prayer scroller");

assert.match(visualSourceLandscape,/height:82px;\s*max-height:36%/,
 "Compact landscape resize handle must stay above the floating Schola overlay");
