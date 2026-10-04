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
corpus.showSection(28);
const corpusMassEnd=corpus.getCurrentSectionId();
const corpusStart=corpus.next();
assert.equal(corpus.getCurrentSectionId(),corpusMassEnd,"Corpus procession handoff fabricated a blessing/Last Gospel card");
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

console.log("Browser Mass runtime PASS: ordinary flow, source-first LIVE, preludes, plan-aware ownership and lifecycle handoff.");
