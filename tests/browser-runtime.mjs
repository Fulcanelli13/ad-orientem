import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBrowserMassRuntime } from "../src/mass/browser-runtime.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const aspergesPayload=load("../data/presentation/reader-asperges.v1.json");
const specialExtension=load("../data/mass/special-days-extension.v1.3.json");
const aspergesData=Object.freeze({payload:aspergesPayload,graph:Object.freeze([...specialExtension.graphs.ASP])});
const palmPayload=load("../data/presentation/reader-palm.v1.json");
const palmData=Object.freeze({payload:palmPayload,graph:Object.freeze([...specialExtension.graphs.PALM])});
const ashPayload=load("../data/presentation/reader-ash.v1.json");
const ashData=Object.freeze({payload:ashPayload,graph:Object.freeze([...specialExtension.graphs.ASH])});
const candlemasPayload=load("../data/presentation/reader-candlemas.v1.json");
const candlemasData=Object.freeze({payload:candlemasPayload,graph:Object.freeze([...specialExtension.graphs.CND])});
const rogationsPayload=load("../data/presentation/reader-rogations.v1.json");
const rogationsData=Object.freeze({payload:rogationsPayload,graph:Object.freeze([...specialExtension.graphs.ROG])});
const requiemAbsolutionPayload=load("../data/presentation/reader-requiem-absolution.v1.json");
const requiemAbsolutionData=Object.freeze({payload:requiemAbsolutionPayload,graph:Object.freeze([...specialExtension.graphs.ABS])});
const corpusChristiPayload=load("../data/presentation/reader-corpus-christi.v1.json");
const corpusChristiData=Object.freeze({payload:corpusChristiPayload,graph:Object.freeze([...specialExtension.graphs.CORPUS])});
const holyThursdayPostPayload=load("../data/presentation/reader-holy-thursday-post.v1.json");
const holyThursdayPostData=Object.freeze({payload:holyThursdayPostPayload,graph:Object.freeze([...specialExtension.graphs.HT_POST])});
const specialCore=load("../data/mass/special-days-core.v1.1.json");
const goodFridayPayload=load("../data/presentation/reader-good-friday.v1.json");
const goodFridayData=Object.freeze({payload:goodFridayPayload,graph:Object.freeze([...specialCore.graphs.GF])});
const easterVigilPayload=load("../data/presentation/reader-easter-vigil.v1.json");
const easterVigilData=Object.freeze({payload:easterVigilPayload,graph:Object.freeze([...specialCore.graphs.EV])});
const presentationData=Object.freeze({
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
});
const eventGraph=load("../data/mass/mc-event-graph.v1.json");
const eventData=eventGraph.storage.eventFiles.flatMap(ref=>load("../"+ref.path).events);
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus Rosarii","Introit of the Rosary"),
  collects:[t("Collecta Rosarii","Collect of the Rosary")],
  epistle:t("Epistola Rosarii","Epistle of the Rosary"),
  gradual:t("Graduale et Alleluia Rosarii","Gradual and Alleluia of the Rosary"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium Rosarii","Gospel of the Rosary"),
  offertory:t("Offertorium Rosarii","Offertory of the Rosary"),
  secrets:[t("Secreta Rosarii","Secret of the Rosary")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio Rosarii","Communion of the Rosary"),
  postcommunions:[t("Postcommunio Rosarii","Postcommunion of the Rosary")],
};
function rootFixture(){return {innerHTML:"",querySelector(){return null},querySelectorAll(){return []},addEventListener(){}}}
function celebration(overrides={}){return {
  date:"2026-10-04",calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
  requestedCelebrationId:"holy_rosary",celebrationId:"holy_rosary",celebrationType:"votive",
  properSource:"Sancti/10-07",canStart:true,insertedRites:[],conditions:[],rubricSources:["RG60"],...overrides
}}

const root=rootFixture();
let mounted=false,loaded=false;
const runtime=createBrowserMassRuntime({
  root,
  celebrationApi:{getResolvedMass:()=>celebration()},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Holy Rosary",proper}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>{loaded=true;return presentationData},
  onReaderMounted:()=>{mounted=true},
});
const entered=await runtime.enter();
assert.equal(loaded,true); assert.equal(mounted,true);
assert.ok(root.innerHTML.includes('data-ao-reader-shell'));
assert.ok(root.innerHTML.includes("Holy Rosary"));
assert.equal(entered.session.resolvedMass.form,"MISSA_CANTATA_INCENSE");
assert.equal(entered.session.resolvedMass.presentationMode,"SIMPLE");
assert.equal(runtime.getReaderMode(),"SIMPLE");
assert.equal(runtime.setMode("LIVE"),"SIMPLE","standalone runtime allowed an uncertified LIVE mode switch");
const model=runtime.getReaderModel();
assert.equal(model.totalCards,30);
assert.equal(model.properSource,"Sancti/10-07");
assert.equal(runtime.getCurrentSectionId(),"AO.CARD.001");
assert.equal(runtime.getReaderState().cardTitle,"Introit & Preparatory Prayers");
assert.ok(runtime.getReaderState().paragraphs.some(p=>p.primary==="Introit of the Rosary"));

const host=runtime.showCanonicalEvent("MC-CNS-010",{priestPosition:{label:"ALTAR CENTER"},priestVoice:{label:"SILENT"}});
assert.equal(host.card.sectionId,"AO.CARD.015");
assert.equal(runtime.getReaderState().cardTitle,"Consecration of the Sacred Host");
const same=runtime.showCanonicalEvent("MC-CNS-040",{gesture:{label:"GENUFLECT"}});
assert.equal(same.card.sectionId,"AO.CARD.015");
assert.ok(runtime.getReaderState().paragraphs.length>0);
const chalice=runtime.showCanonicalEvent("MC-CNS-080");
assert.equal(chalice.card.sectionId,"AO.CARD.016");
runtime.previous(); assert.equal(runtime.getCurrentSectionId(),"AO.CARD.015");
runtime.next(); assert.equal(runtime.getCurrentSectionId(),"AO.CARD.016");
runtime.destroy(); assert.equal(root.innerHTML,""); assert.equal(runtime.getReaderModel(),null);


const aspergesRoot=rootFixture();
const aspergesRuntime=createBrowserMassRuntime({
  root:aspergesRoot,
  celebrationApi:{getResolvedMass:()=>celebration({insertedRites:["asperges"]})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Holy Rosary",proper,precedingRites:["ASPERGES"]}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  loadAspergesData:async()=>aspergesData,
});
await aspergesRuntime.enter();
assert.equal(aspergesRuntime.getCurrentSectionId(),null,"Mass card became active before Asperges completed");
assert.equal(aspergesRuntime.getReaderState().cardTitle,"Sunday Aspersion");
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R01");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getReaderState().cardTitle,"Asperges me");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R03");
assert.equal(aspergesRuntime.getReaderState().gesture,null,"sprinkling gesture fired from card visibility");
aspergesRuntime.markActuallySprinkled();
assert.equal(aspergesRuntime.getReaderState().gesture.label,"MAKE_FULL_SIGN_OF_CROSS");
aspergesRuntime.next();
aspergesRuntime.next();
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R05");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getCurrentSectionId(),"AO.CARD.001");
assert.equal(aspergesRuntime.getReaderState().cardTitle,"Introit & Preparatory Prayers");
aspergesRuntime.previous();
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R05","Back from first Mass card did not return to Asperges handoff");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getCurrentSectionId(),"AO.CARD.001");
aspergesRuntime.destroy();



const palmRoot=rootFixture();
const palmRuntime=createBrowserMassRuntime({
  root:palmRoot,
  celebrationApi:{getResolvedMass:()=>celebration({insertedRites:["palm"]})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Palm Sunday",proper,precedingRites:["PALM"]}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  loadPalmData:async()=>palmData,
});
const palmEntered=await palmRuntime.enter();
assert.equal(palmEntered.session.plan.massEntry,"INTROIT");
assert.equal(palmEntered.session.plan.normalLastGospel,false);
assert.equal(palmRuntime.getCurrentSectionId(),null);
assert.equal(palmRuntime.getReaderState().cardTitle,"Blessing of Palms");
palmRuntime.next();
assert.equal(palmRuntime.getPalmState().card.id,"PALM-R02");
assert.equal(palmRuntime.getReaderState().posture,null);
palmRuntime.setPalmRecipientState("RECEIVE_PALM");
assert.equal(palmRuntime.getReaderState().posture.label,"KNEEL");
palmRuntime.next();
assert.equal(palmRuntime.getReaderState().gesture.label,"GOSPEL_CROSSES");
palmRuntime.next();
assert.equal(palmRuntime.getReaderState().posture.label,"PROCESSIONAL");
while(!palmRuntime.getPalmState().atEnd)palmRuntime.next();
palmRuntime.next();
assert.equal(palmRuntime.getCurrentSectionId(),"AO.CARD.001");
assert.equal(palmRuntime.getReaderState().cardTitle,"Introit");
assert.ok(palmRuntime.getReaderState().paragraphs.length>0);
palmRuntime.previous();
assert.equal(palmRuntime.getPalmState().card.id,"PALM-R07");
palmRuntime.next();
palmRuntime.showSection(29);
const beforeLastGospel=palmRuntime.getCurrentSectionId();
const palmLifecycle=palmRuntime.next();
assert.equal(palmRuntime.getCurrentSectionId(),beforeLastGospel);
assert.equal(palmLifecycle.stage,"DEPARTURE","Palm last-Gospel suppression did not reach the post-Mass lifecycle");
assert.equal(palmRuntime.getLifecycleState().contract.leonine.eligible,false);
palmRuntime.destroy();


const ashRoot=rootFixture();
const ashRuntime=createBrowserMassRuntime({
  root:ashRoot,
  celebrationApi:{getResolvedMass:()=>celebration({insertedRites:["ash"]})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Ash Wednesday",proper,precedingRites:["ASH"]}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  loadAshData:async()=>ashData,
});
const ashEntered=await ashRuntime.enter();
assert.equal(ashEntered.session.plan.massEntry,"INTROIT");
assert.equal(ashEntered.session.plan.normalLastGospel,true);
assert.equal(ashRuntime.getCurrentSectionId(),null);
assert.equal(ashRuntime.getReaderState().cardTitle,"Opening and Blessing of Ashes");
assert.ok(ashRuntime.getReaderState().paragraphs.some(p=>p.primary.includes("Omnípotens sempitérne Deus")));
ashRuntime.next();
assert.equal(ashRuntime.getAshState().card.id,"ASH-R02");
assert.equal(ashRuntime.getReaderState().gesture,null,"Ash blessing action fabricated a faithful gesture");
ashRuntime.next();
assert.equal(ashRuntime.getAshState().card.id,"ASH-R03");
assert.equal(ashRuntime.getReaderState().posture,null,"Ash recipient posture leaked globally before personal state");
ashRuntime.setAshRecipientState("RECEIVE_ASHES");
assert.equal(ashRuntime.getReaderState().posture.label,"KNEEL");
ashRuntime.setAshRecipientState("ASHES_RECEIVED");
assert.equal(ashRuntime.getReaderState().posture.label,"STAND_WALK");
ashRuntime.next();
assert.equal(ashRuntime.getReaderState().cardTitle,"Concluding Prayer");
ashRuntime.next();
assert.equal(ashRuntime.getAshState().card.id,"ASH-R05");
ashRuntime.next();
assert.equal(ashRuntime.getCurrentSectionId(),"AO.CARD.001");
assert.equal(ashRuntime.getReaderState().cardTitle,"Introit");
assert.ok(ashRuntime.getReaderState().paragraphs.length>0);
ashRuntime.previous();
assert.equal(ashRuntime.getAshState().card.id,"ASH-R05");
ashRuntime.next();
assert.equal(ashRuntime.getCurrentSectionId(),"AO.CARD.001");
ashRuntime.destroy();

const candlemasRoot=rootFixture();
const candlemasRuntime=createBrowserMassRuntime({
  root:candlemasRoot,
  celebrationApi:{getResolvedMass:()=>celebration({insertedRites:["candlemas"]})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Candlemas",proper,precedingRites:["CANDLEMAS"]}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  loadCandlemasData:async()=>candlemasData,
});
const candlemasEntered=await candlemasRuntime.enter();
assert.equal(candlemasEntered.session.plan.massEntry,"INTROIT");
assert.equal(candlemasRuntime.getCurrentSectionId(),null);
assert.equal(candlemasRuntime.getReaderState().cardTitle,"Blessing of Candles");
assert.equal(candlemasRuntime.getCandlemasState().card.id,"CND-R01");
assert.equal(candlemasRuntime.getReaderState().paragraphs.filter(p=>p.primary?.includes("Orémus")).length,5);
candlemasRuntime.next();
assert.equal(candlemasRuntime.getCandlemasState().card.id,"CND-R02");
assert.equal(candlemasRuntime.getReaderState().gesture,null);
candlemasRuntime.next();
assert.equal(candlemasRuntime.getCandlemasState().card.id,"CND-R03");
assert.equal(candlemasRuntime.getReaderState().posture,null);
candlemasRuntime.setCandlemasRecipientState("RECEIVE_CANDLE");
assert.equal(candlemasRuntime.getReaderState().posture.label,"KNEEL");
assert.equal(candlemasRuntime.getCandlemasState().hasBlessedCandle,true);
candlemasRuntime.setCandlemasRecipientState("CANDLE_RECEIVED");
candlemasRuntime.setCandlemasProcessionParticipant(true);
candlemasRuntime.next();
assert.equal(candlemasRuntime.getReaderState().cardTitle,"Prayer after Distribution");
candlemasRuntime.next();
assert.equal(candlemasRuntime.getCandlemasState().candleState,"CANDLE_LIT");
assert.equal(candlemasRuntime.getReaderState().posture.label,"PROCESSIONAL");
while(!candlemasRuntime.getCandlemasState().atEnd)candlemasRuntime.next();
candlemasRuntime.next();
assert.equal(candlemasRuntime.getCurrentSectionId(),"AO.CARD.001");
assert.equal(candlemasRuntime.getReaderState().cardTitle,"Introit");
assert.equal(candlemasRuntime.getCandlemasMassState("MC-GSP-060").state,"CANDLE_LIT");
assert.equal(candlemasRuntime.getCandlemasMassState("MC-SAN-010").state,"CANDLE_LIT");
assert.equal(candlemasRuntime.getCandlemasMassState("MC-COM-030").state,"CANDLE_LIT");
assert.equal(candlemasRuntime.getCandlemasMassState("MC-COM-040").state,null);
candlemasRuntime.previous();
assert.equal(candlemasRuntime.getCandlemasState().card.id,"CND-R07");
candlemasRuntime.destroy();

const rogationsRoot=rootFixture();
const rogations=createBrowserMassRuntime({
  root:rogationsRoot,
  celebrationApi:{getResolvedMass:()=>celebration({insertedRites:["rogations"]})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Rogations",proper,precedingRites:["ROGATIONS"]}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  loadRogationsData:async()=>rogationsData,
});
const rogationsEntered=await rogations.enter();
assert.equal(rogationsEntered.session.plan.massEntry,"INTROIT");
assert.deepEqual([...rogationsEntered.session.plan.precedingGraphs],["ROGATIONS"]);
assert.equal(rogations.getCurrentSectionId(),null);
assert.equal(rogations.getReaderState().cardTitle,"Exsurge Domine");
rogations.next();
assert.equal(rogations.getRogationsState().card.id,"ROG-R02");
assert.equal(rogations.getReaderState().posture.label,"KNEEL");
rogations.next();
assert.equal(rogations.getRogationsState().card.id,"ROG-R03");
assert.equal(rogations.getReaderState().posture.label,"PROCESSIONAL");
assert.ok(rogations.getReaderState().paragraphs.length>100,"Rogation Litany was abridged in browser runtime");
while(!rogations.getRogationsState().atEnd)rogations.next();
assert.equal(rogations.getRogationsState().card.id,"ROG-R06");
rogations.next();
assert.equal(rogations.getCurrentSectionId(),"AO.CARD.001");
assert.equal(rogations.getReaderState().cardTitle,"Introit");
rogations.previous();
assert.equal(rogations.getRogationsState().card.id,"ROG-R06");
rogations.destroy();
assert.equal(rogationsRoot.innerHTML,"");

const planAwareLowRoot=rootFixture();
const planAwareLow=createBrowserMassRuntime({
  root:planAwareLowRoot,
  celebrationApi:{getResolvedMass:()=>celebration({
    gloria:true,credo:true,faithfulCommunicantsPresent:true,
  })},
  resolveHostOptions:()=>({
    form:"low",celebrationTitle:"Holy Rosary",
    proper:{...proper,hasGloria:true,hasCredo:true},
    faithfulCommunicantsPresent:true,
    chantSetting:"GREGORIAN",
  }),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  eventData,
});
await planAwareLow.enter();
assert.equal(planAwareLow.getObjectiveRuntime().supported,true);
assert.equal(planAwareLow.getObjectiveRuntime().owner,"R18_PLANNED_OBJECTIVE_TRAVERSAL");
assert.equal(planAwareLow.showCanonicalEvent("MC-OFF-110"),null,
  "Low browser runtime accepted Solemn offertory incensation outside its planned traversal");
assert.ok(planAwareLow.showCanonicalEvent("MC-CNS-010"),
  "Low browser runtime rejected a certified planned canonical event");
planAwareLow.showSection(30);
const lowBoundary=planAwareLow.next();
assert.equal(lowBoundary.stage,"LEONINE_OFFER","ordinary Low Mass did not route through the Leonine resolver");
assert.equal(lowBoundary.massComplete,true);
assert.equal(lowBoundary.completionRecord.form,"LOW");
assert.equal(planAwareLow.chooseLeonine(false).stage,"DEPARTURE");
assert.equal(planAwareLow.advanceLifecycle().stage,"GIVE_THANKS_HANDOFF");
assert.equal(planAwareLow.getLifecycleState().handoff,"GIVE_THANKS");
planAwareLow.destroy();

const liveRoot=rootFixture();
const liveRuntime=createBrowserMassRuntime({
  root:liveRoot,
  celebrationApi:{getResolvedMass:()=>celebration()},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Holy Rosary",proper}),
  readReaderPreferences:()=>({mode:"live",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
});
await liveRuntime.enter();
assert.equal(liveRuntime.getReaderMode(),"LIVE");
assert.equal(liveRuntime.getReaderModel().totalCards,39);
assert.equal(liveRuntime.getReaderModel().structureOwner,"SOURCE_FIRST_LIVE");
let liveHit=liveRuntime.showCanonicalEvent("MC-CAN-060");
assert.equal(liveHit.card.sectionId,"AO.CANON.04");
assert.equal(liveRuntime.getReaderState().cardTitle,"Hanc igitur");
liveHit=liveRuntime.showCanonicalEvent("MC-CAN-080");
assert.equal(liveHit.card.sectionId,"AO.CANON.05");
assert.equal(liveRuntime.getReaderState().cardTitle,"Quam oblationem");
liveHit=liveRuntime.showCanonicalEvent("MC-CNS-040");
assert.equal(liveHit.card.sectionId,"AO.CANON.06");
assert.equal(liveRuntime.getReaderState().cardTitle,"Consecration of the Sacred Host");
liveRuntime.next();
assert.equal(liveRuntime.getCurrentSectionId(),"AO.CANON.07");
liveRuntime.showSection(39);
assert.equal(liveRuntime.getReaderState().cardTitle,"Last Gospel");
assert.equal(liveRuntime.next().stage,"DEPARTURE");
liveRuntime.destroy();
assert.equal(liveRoot.innerHTML,"");

const goodFridayRoot=rootFixture();
let goodFridayPresentationLoaded=false;
const goodFriday=createBrowserMassRuntime({
  root:goodFridayRoot,
  celebrationApi:{getResolvedMass:()=>celebration({
    exceptionalProfile:"good-friday-1962",
    requestedCelebrationId:"good_friday",
    celebrationId:"good_friday",
    celebrationType:"special_formulary",
    properSource:null,
  })},
  resolveHostOptions:()=>({form:"solemn",celebrationTitle:"Good Friday",proper:null}),
  readReaderPreferences:()=>({mode:"live",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>{goodFridayPresentationLoaded=true;return presentationData},
  loadGoodFridayData:async()=>goodFridayData,
  goodFridayContext:{venerationMode:"PERSONAL",willReceiveCommunion:true},
});
const goodFridayEntered=await goodFriday.enter();
assert.equal(goodFridayEntered.session.plan.kind,"DISTINCT_RITE");
assert.equal(goodFridayEntered.session.plan.rite,"GOOD_FRIDAY");
assert.equal(goodFridayEntered.session.plan.canonicalMassGraphActive,false);
assert.equal(goodFridayPresentationLoaded,false,"Good Friday loaded ordinary Mass presentation data");
assert.equal(goodFriday.getReaderModel(),null,"Good Friday instantiated an ordinary Mass reader model");
assert.equal(goodFriday.getObjectiveRuntime(),null,"Good Friday instantiated Mass objective traversal");
assert.equal(goodFriday.getLifecycleState().rite,"GOOD_FRIDAY");
assert.equal(goodFriday.getLifecycleState().stage,"RITE_ACTIVE");
assert.equal(goodFriday.getGoodFridayState().step.recordId,"GF-OPEN-010");
assert.equal(goodFriday.getReaderState().posture.label,"STAND");

goodFriday.next();
assert.equal(goodFriday.getGoodFridayState().step.recordId,"GF-OPEN-020");
assert.equal(goodFriday.getReaderState().posture.label,"KNEEL_PROFOUND_BOW");

let gfGuard=0;
while(goodFriday.getGoodFridayState().step.recordId!=="GF-PASS-320" && gfGuard++<80) goodFriday.next();
assert.equal(goodFriday.getGoodFridayState().step.recordId,"GF-PASS-320");
assert.equal(goodFriday.getReaderState().posture.label,"KNEEL");
assert.equal(goodFriday.getReaderState().gesture.label,"PAUSE_BRIEFLY");
goodFriday.next();
assert.equal(goodFriday.getGoodFridayState().step.recordId,"GF-PASS-330");
assert.equal(goodFriday.getReaderState().posture.label,"STAND");

gfGuard=0;
while(goodFriday.getGoodFridayState().step.recordId!=="GF-VEN-620" && gfGuard++<80) goodFriday.next();
assert.equal(goodFriday.getGoodFridayState().personalOnly,true);
assert.equal(goodFriday.getReaderState().gesture.label,"ONE_SIMPLE_GENUFLECTION");

gfGuard=0;
while(goodFriday.getGoodFridayState().step.recordId!=="GF-COM-850" && gfGuard++<80) goodFriday.next();
assert.equal(goodFriday.getGoodFridayState().personalOnly,true);
assert.equal(goodFriday.getReaderState().posture.label,"KNEEL");
assert.equal(goodFriday.getReaderState().gesture.label,"RECEIVE_COMMUNION");

gfGuard=0;
while(!goodFriday.getGoodFridayState().atEnd && gfGuard++<80) goodFriday.next();
assert.equal(goodFriday.getGoodFridayState().step.recordId,"GF-END-910");
const goodFridayDone=goodFriday.next();
assert.equal(goodFridayDone.stage,"DEPARTURE");
assert.equal(goodFridayDone.ordinaryMassGraphActive,false);
assert.equal(goodFriday.getReaderModel(),null);
goodFriday.destroy();
assert.equal(goodFridayRoot.innerHTML,"");

const vigilRoot=rootFixture();
const vigilProper={...proper,introit:null,communion:null,sourcePath:"Tempora/Pasc0-0"};
const vigil=createBrowserMassRuntime({
  root:vigilRoot,
  celebrationApi:{getResolvedMass:()=>celebration({
    exceptionalProfile:"easter-vigil-1962",
    requestedCelebrationId:"easter_vigil",
    celebrationId:"easter_vigil",
    celebrationType:"special_formulary",
    properSource:"Tempora/Pasc0-0",
  })},
  resolveHostOptions:()=>({form:"solemn",celebrationTitle:"Easter Vigil",proper:vigilProper}),
  readReaderPreferences:()=>({mode:"live",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  loadEasterVigilData:async()=>easterVigilData,
  easterVigilContext:{fontMode:"SEPARATE_BAPTISTERY",baptismPresent:true},
});
const vigilEntered=await vigil.enter();
assert.equal(vigilEntered.session.plan.kind,"COMPOSITE_DISTINCT_RITE");
assert.equal(vigilEntered.session.plan.rite,"EASTER_VIGIL");
assert.equal(vigilEntered.session.plan.massEntry,"VIGIL_DEFINED_MASS_ENTRY");
assert.equal(vigil.getLifecycleState().stage,"VIGIL_ACTIVE");
assert.equal(vigil.getEasterVigilState().step.recordId,"EV-FIRE-010");
assert.equal(vigil.getReaderState().cardTitle,"Blessing of the New Fire");
assert.equal(vigil.getReaderModel().structureOwner,"EASTER_VIGIL_COMPOSITE_MASS");
assert.equal(vigil.getReaderModel().cardBySequence(1).title,"Kyrie");

let evGuard=0;
while(vigil.getEasterVigilState().step.recordId!=="EV-LUM-110" && evGuard++<80)vigil.next();
assert.equal(vigil.getReaderState().gesture.label,"GENUFLECT_TOWARD_PASCHAL_CANDLE_AND_RESPOND_DEO_GRATIAS");
evGuard=0;
while(vigil.getEasterVigilState().step.recordId!=="EV-FONT-440" && evGuard++<80)vigil.next();
assert.equal(vigil.getReaderState().posture.label,"KNEEL");
assert.equal(vigil.getReaderState().gesture.label,"CONTINUE_LITANY");
evGuard=0;
while(vigil.getEasterVigilState().step.recordId!=="EV-REN-510" && evGuard++<80)vigil.next();
assert.equal(vigil.getReaderState().gesture.label,"RESPOND_ABRENUNTIAMUS");
evGuard=0;
while(vigil.getEasterVigilState().step.recordId!=="EV-MASS-700" && evGuard++<80)vigil.next();
assert.equal(vigil.getEasterVigilState().handoffToMass,true);
vigil.next();
assert.equal(vigil.getEasterVigilState().step.recordId,"EV-MASS-700");
assert.equal(vigil.getCurrentSectionId(),vigil.getReaderModel().cardBySequence(1).sectionId);
assert.equal(vigil.getReaderState().cardTitle,"Kyrie");
vigil.previous();
assert.equal(vigil.getEasterVigilState().step.recordId,"EV-MASS-700");
vigil.next();
assert.equal(vigil.getReaderState().cardTitle,"Kyrie");
const laudsCard=vigil.getReaderModel().cards.find(x=>x.sectionId==="SP.EASTER_VIGIL.15");
assert.ok(laudsCard);
assert.ok(laudsCard.paragraphs[0].primary??laudsCard.paragraphs[0].latin);
vigil.showSection(vigil.getReaderModel().totalCards);
const vigilDone=vigil.next();
assert.equal(vigilDone.rite,"EASTER_VIGIL");
assert.equal(vigilDone.stage,"DEPARTURE");
vigil.destroy();
assert.equal(vigilRoot.innerHTML,"");

const missingRoot=rootFixture();
const missing=createBrowserMassRuntime({
  root:missingRoot, celebrationApi:{getResolvedMass:()=>celebration()},
  resolveHostOptions:()=>({form:"low",celebrationTitle:"Holy Rosary",proper}),
  readReaderPreferences:()=>({mode:"simple"}),
  loadPresentationData:async()=>{throw new Error("reader data unavailable")},
});
await assert.rejects(()=>missing.enter(),/reader data unavailable/);
assert.equal(missingRoot.innerHTML,"");

const requiemRoot=rootFixture();
const requiem=createBrowserMassRuntime({
  root:requiemRoot,
  celebrationApi:{getResolvedMass:()=>celebration({requestedCelebrationId:"requiem",celebrationId:"requiem",celebrationType:"requiem",properSource:"Votive/Requiem"})},
  resolveHostOptions:()=>({form:"solemn",celebrationTitle:"Requiem",proper,followingActions:["REQUIEM_ABSOLUTION"]}),
  readReaderPreferences:()=>({mode:"simple"}),
  loadPresentationData:async()=>presentationData,
  eventData,
  loadRequiemAbsolutionData:async()=>requiemAbsolutionData,
  requiemAbsolutionContext:{bodyPresent:true,burialProcession:true},
});
const requiemEntered=await requiem.enter();
assert.equal(requiemEntered.session.plan.normalLastGospel,false);
assert.equal(requiemEntered.session.plan.blessingAllowed,false);
assert.deepEqual([...requiemEntered.session.plan.followingGraphs],["REQUIEM_ABSOLUTION"]);
assert.equal(requiem.getReaderModel().totalCards,30,"Requiem variance duplicated the Mass reader surface");
requiem.showSection(29);
assert.equal(requiem.getReaderState().cardTitle,"Placeat tibi, sancta Trinitas");
assert.ok(requiem.getReaderState().paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0261")));
assert.ok(!requiem.getReaderState().paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0264")),
  "Requiem reader rendered the omitted final blessing");
const requiemMassEnd=requiem.getCurrentSectionId();
const absStart=requiem.next();
assert.equal(requiem.getCurrentSectionId(),requiemMassEnd,"Absolution handoff fabricated a Last Gospel card");
assert.equal(absStart.cardTitle,"At the Bier or Catafalque");
assert.equal(requiem.getLifecycleState().stage,"FOLLOWING_ACTION_HANDOFF");
assert.equal(requiem.getRequiemAbsolutionState().card.id,"ABS-R01");
requiem.next();
assert.equal(requiem.getReaderState().cardTitle,"Non intres in judicium");
requiem.next();
assert.equal(requiem.getReaderState().cardTitle,"Libera me, Domine");
requiem.next();
assert.equal(requiem.getReaderState().gesture,null,"coffin aspersion/incensation fabricated a faithful gesture");
requiem.next();
assert.equal(requiem.getReaderState().cardTitle,"In paradisum");
const absDone=requiem.next();
assert.equal(absDone.stage,"DEPARTURE");
assert.equal(requiem.getLifecycleState().stage,"DEPARTURE");
assert.equal(requiem.advanceLifecycle().stage,"GIVE_THANKS_HANDOFF");
requiem.destroy();
assert.equal(requiemRoot.innerHTML,"");

const corpusRoot=rootFixture();
const corpus=createBrowserMassRuntime({
  root:corpusRoot,
  celebrationApi:{getResolvedMass:()=>celebration({celebrationId:"corpus-christi",celebrationType:"calendar"})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Corpus Christi",proper,followingActions:["CORPUS_CHRISTI_PROCESSION"]}),
  readReaderPreferences:()=>({mode:"simple"}),
  loadPresentationData:async()=>presentationData,
  loadCorpusChristiData:async()=>corpusChristiData,
});
const corpusEntered=await corpus.enter();
assert.equal(corpusEntered.session.plan.dismissal,"BENEDICAMUS_DOMINO");
assert.equal(corpusEntered.session.plan.blessingAllowed,false);
assert.equal(corpusEntered.session.plan.normalLastGospel,false);
assert.deepEqual([...corpusEntered.session.plan.followingGraphs],["CORPUS_CHRISTI_PROCESSION"]);
corpus.showSection(29);
assert.equal(corpus.getReaderState().cardTitle,"Placeat tibi, sancta Trinitas");
assert.ok(corpus.getReaderState().paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0261")));
assert.ok(!corpus.getReaderState().paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0264")),
  "Corpus Christi reader rendered the omitted final blessing");
const corpusMassEnd=corpus.getCurrentSectionId();
const corpusStart=corpus.next();
assert.equal(corpus.getCurrentSectionId(),corpusMassEnd,"Corpus procession handoff fabricated a Last Gospel card");
assert.equal(corpusStart.cardTitle,"Mass Ends for the Procession");
assert.equal(corpus.getCorpusChristiState().card.id,"CORPUS-R01");
corpus.setCorpusChristiSacramentalState("MONSTRANCE_PLACED_IN_CELEBRANT_HANDS");
assert.equal(corpus.getReaderState().cardTitle,"Pange lingua");
corpus.setCorpusChristiProcessionParticipant(true);
corpus.setCorpusChristiSacramentalState("PROCESSION_ACTIVE");
assert.equal(corpus.getReaderState().cardTitle,"Eucharistic Procession");
assert.equal(corpus.getReaderState().posture.label,"PROCESSIONAL");
corpus.setCorpusChristiSacramentalState("BLESSED_SACRAMENT_REPLACED_ON_ALTAR");
assert.equal(corpus.getReaderState().cardTitle,"Tantum ergo");
corpus.next();
assert.equal(corpus.getReaderState().cardTitle,"Versicle and Prayer");
corpus.setCorpusChristiSacramentalState("BENEDICTION_COMPLETE");
assert.equal(corpus.getReaderState().cardTitle,"Benediction");
const corpusDone=corpus.next();
assert.equal(corpusDone.stage,"DEPARTURE");
assert.equal(corpus.advanceLifecycle().stage,"GIVE_THANKS_HANDOFF");
corpus.destroy();
assert.equal(corpusRoot.innerHTML,"");

const holyThursdayRoot=rootFixture();
const holyThursday=createBrowserMassRuntime({
  root:holyThursdayRoot,
  celebrationApi:{getResolvedMass:()=>celebration({celebrationId:"holy-thursday",celebrationType:"calendar"})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Holy Thursday",proper,followingActions:["HOLY_THURSDAY_POST"]}),
  readReaderPreferences:()=>({mode:"simple"}),
  loadPresentationData:async()=>presentationData,
  loadHolyThursdayPostData:async()=>holyThursdayPostData,
});
const holyThursdayEntered=await holyThursday.enter();
assert.equal(holyThursdayEntered.session.plan.blessingAllowed,false);
assert.equal(holyThursdayEntered.session.plan.normalLastGospel,false);
assert.deepEqual([...holyThursdayEntered.session.plan.followingGraphs],["HOLY_THURSDAY_POST"]);
holyThursday.showSection(29);
assert.equal(holyThursday.getReaderState().cardTitle,"Placeat tibi, sancta Trinitas");
assert.ok(holyThursday.getReaderState().paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0261")));
assert.ok(!holyThursday.getReaderState().paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0264")),
  "Holy Thursday reader rendered the omitted final blessing");
const holyThursdayMassEnd=holyThursday.getCurrentSectionId();
const htStart=holyThursday.next();
assert.equal(holyThursday.getCurrentSectionId(),holyThursdayMassEnd,"Holy Thursday following action fabricated a Last Gospel card");
assert.equal(htStart.cardTitle,"Translation of the Blessed Sacrament");
assert.equal(holyThursday.getHolyThursdayPostState().card.id,"HT-R01");
holyThursday.next();
assert.equal(holyThursday.getReaderState().cardTitle,"Follow to the Altar of Repose");
assert.equal(holyThursday.getReaderState().posture.label,"KNEEL");
holyThursday.setHolyThursdayJoiningState("JOINING");
assert.equal(holyThursday.getReaderState().posture.label,"STAND_WALK");
holyThursday.next();
assert.equal(holyThursday.getReaderState().cardTitle,"At the Altar of Repose");
assert.equal(holyThursday.getReaderState().posture.label,"KNEEL");
holyThursday.next();
assert.equal(holyThursday.getReaderState().cardTitle,"After the Reservation");
holyThursday.next();
assert.equal(holyThursday.getReaderState().cardTitle,"Stripping of the Altars");
assert.equal(holyThursday.getReaderState().posture,null,"stripping rite imposed a universal faithful posture");
assert.ok(holyThursday.getReaderState().paragraphs.length>=15,"Pian Psalm 21 was truncated in browser runtime");
holyThursday.next();
assert.equal(holyThursday.getReaderState().cardTitle,"Holy Thursday Rites Complete");
const htDone=holyThursday.next();
assert.equal(htDone.stage,"DEPARTURE");
assert.equal(holyThursday.advanceLifecycle().stage,"GIVE_THANKS_HANDOFF");
holyThursday.destroy();
assert.equal(holyThursdayRoot.innerHTML,"");

console.log("Browser Mass runtime PASS: ordinary flow, source-first LIVE, preludes, plan-aware ownership and lifecycle handoff.");
