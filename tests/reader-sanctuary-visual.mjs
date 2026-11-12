import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sanctuaryCueProjection,sanctuaryAspergesProjection,SANCTUARY_PROTOCOL,
 createReaderSanctuaryPreview} from "../src/mass/reader-sanctuary-visual.js";
import {createAspergesReaderController} from "../src/mass/reader-asperges.js";
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

assert.equal(sanctuaryCueProjection({card,state,form:"SOLEMN",mode:"MISSAL"}),null);
assert.equal(sanctuaryCueProjection({card,state,form:"UNVERIFIED",mode:"LIVE"}),null);
assert.equal(sanctuaryCueProjection({card:{...card,stateOnly:true},state,
 form:"LOW",mode:"LIVE"}),null);
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
