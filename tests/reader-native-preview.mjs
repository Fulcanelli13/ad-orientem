import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { legacyReaderStateSnapshot, prepareNativeReaderPreview, resolveGestureProjection, resolveCueOwnedChannels, createCardTransitionTransientGuard } from "../src/mass/reader-native-preview.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
  rubricEvents:load("../data/presentation/reader-rubric-events.v1.json"),
  gestureMatrix:load("../data/mass/gesture-matrix.v1.json"),
};
const guideData={registry:load("../data/presentation/guide-registry.v1.json"),url:"test://guide-registry"};
const specialExtension=load("../data/mass/special-days-extension.v1.3.json");
const palmData={payload:load("../data/presentation/reader-palm.v1.json"),graph:specialExtension.graphs.PALM};
const ashData={payload:load("../data/presentation/reader-ash.v1.json"),graph:specialExtension.graphs.ASH};
const candlemasData={payload:load("../data/presentation/reader-candlemas.v1.json"),graph:specialExtension.graphs.CND};
const rogationsData={payload:load("../data/presentation/reader-rogations.v1.json"),graph:specialExtension.graphs.ROG};
const requiemAbsolutionData={payload:load("../data/presentation/reader-requiem-absolution.v1.json"),graph:specialExtension.graphs.ABS};
const corpusChristiData={payload:load("../data/presentation/reader-corpus-christi.v1.json"),graph:specialExtension.graphs.CORPUS};
const holyThursdayPostData={payload:load("../data/presentation/reader-holy-thursday-post.v1.json"),graph:specialExtension.graphs.HT_POST};
const genericProcessionData={payload:load("../data/presentation/reader-generic-procession.v1.json"),graph:specialExtension.graphs.PROC};
const cueRegistries=Object.freeze({
  gestures:load("../data/presentation/reader-gestures.v1.json"),
  responses:load("../data/presentation/reader-responses.v1.json"),
  postures:load("../data/presentation/reader-postures.v1.json"),
  positions:load("../data/presentation/reader-priest-positions.v1.json"),
  voices:load("../data/presentation/reader-priest-voices.v1.json"),
  actions:load("../data/presentation/reader-priest-actions.v1.json"),
});
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("I","Introit"),collects:[t("C","Collect")],epistle:t("E","Epistle"),
  gradual:t("G","Gradual"),sequence:{lat:"",en:""},gospel:t("Gsp","Gospel"),
  offertory:t("O","Offertory"),secrets:[t("S","Secret")],preface:t("P","Preface"),
  communion:t("Cm","Communion"),postcommunions:[t("Pc","Postcommunion")],
};
const eventData=[
  "../data/mass/mc-events-01.v1.json","../data/mass/mc-events-02.v1.json","../data/mass/mc-events-03.v1.json",
  "../data/mass/mc-events-04.v1.json","../data/mass/mc-events-05.v1.json","../data/mass/mc-events-06.v1.json",
].flatMap(path=>load(path).events);
const aspergesExtension=load("../data/mass/special-days-extension.v1.3.json");
const aspergesData=Object.freeze({
  graph:aspergesExtension.graphs.ASP,
  payload:load("../data/presentation/reader-asperges.v1.json"),
});
const livePrepared={
  session:{
    resolvedMass:{
      schema:"ao-resolved-mass-v2",date:"2026-10-04",form:"MISSA_CANTATA_INCENSE",
      presentationMode:"LIVE",calendarCelebration:{id:"day",type:"CALENDAR"},
      actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
      explicitlySelectedCelebration:true,proper:{status:"READY",data:proper},
      overlays:["VOTIVE_PROPER"],precedingRites:[],followingActions:[],distinctRite:null,
    },
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["VOTIVE_PROPER"]},
  },
  readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};
const liveReady=await prepareNativeReaderPreview({
  prepared:livePrepared,presentationData:data,eventData,cueRegistries,guideData
});
assert.equal(liveReady.model.totalCards,39);
assert.equal(liveReady.rubricState.supported,true);
assert.equal(liveReady.gestureMatrixState.supported,true);
assert.equal(liveReady.gestureMatrixState.audit.itemCount,142);
assert.equal(liveReady.gestureMatrixState.audit.campionBackedCount,100);
assert.equal(liveReady.gestureMatrixState.project("AO.SM.C0058").primaryPriestAction.label,"BOWS HEAD");
assert.equal(liveReady.gestureMatrixState.project("AO.SM.C0202").primaryPriestAction.label,"THREE CROSSES WITH HOST OVER CHALICE");
assert.equal(liveReady.gestureMatrixState.project("AO.SM.C0202").primaryPriestAction.iconKey,"cross","sourced triple-cross gesture must use its explicit v4.6 master");
assert.equal(liveReady.rubricState.project("AO.SM.C0058").primaryPriestAction.label,"BOWS HEAD");
assert.equal(liveReady.rubricState.project("AO.SM.C0174").events.length,6);
assert.equal(liveReady.rubricState.project("AO.SM.C0204").activeStates.THUMB_INDEX_JOINED.value,true);
assert.equal(liveReady.model.structureOwner,"SOURCE_FIRST_LIVE");
assert.equal(liveReady.presentationModel.totalCards,48);
assert.equal(liveReady.presentationModel.structureOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
assert.equal(liveReady.presentationModel.sourceModelTotalCards,39);
assert.equal(liveReady.presentationModel.historicalV183IdentityClaim,false);
assert.equal(liveReady.presentationModel.sourceAuthorityModel,liveReady.model);
assert.equal(liveReady.model.cards[13].sectionId,"AO.CANON.01");
assert.equal(liveReady.model.cards[13].title,"Te igitur");
assert.equal(liveReady.model.cards[18].sectionId,"AO.CANON.06");
assert.equal(liveReady.model.cards[18].title,"Consecration of the Sacred Host");
assert.equal(liveReady.model.cards[19].sectionId,"AO.CANON.07");
assert.equal(liveReady.model.cards[26].sectionId,"AO.CANON.14");
assert.equal(liveReady.model.cardForEvent("MC-CAN-060").card.sectionId,"AO.CANON.04");
assert.equal(liveReady.model.cardForEvent("MC-CNS-040").card.sectionId,"AO.CANON.06");
assert.equal(liveReady.model.cardForEvent("MC-CAN-180").card.sectionId,"AO.CANON.14");
assert.equal(liveReady.model.cards[18].guideSequence,15);
assert.equal(liveReady.model.cards[27].sourceSequence,19);

const aspergesPrepared={
  ...livePrepared,
  session:{
    ...livePrepared.session,
    resolvedMass:{
      ...livePrepared.session.resolvedMass,
      precedingRites:["ASPERGES"],
      provenance:{seasonalMode:null},
    },
    plan:{...livePrepared.session.plan,precedingGraphs:["ASPERGES"]},
  },
};
const aspergesReady=await prepareNativeReaderPreview({
  prepared:aspergesPrepared,presentationData:data,eventData,cueRegistries,guideData,aspergesData
});
assert.ok(aspergesReady.aspergesController,"native preview lost certified Asperges controller");
assert.equal(aspergesReady.aspergesController.project().card.id,"ASP-R01");
assert.equal(aspergesReady.aspergesController.project().formulaState.formula,"ORDINARY");
aspergesReady.aspergesController.goTo("ASP-R03");
assert.equal(aspergesReady.aspergesController.project().faithfulGesture,null);
aspergesReady.aspergesController.setActuallySprinkled(true);
assert.equal(aspergesReady.aspergesController.project().faithfulGesture,"MAKE_FULL_SIGN_OF_CROSS");
aspergesReady.aspergesController.goTo("ASP-R05");
assert.equal(aspergesReady.aspergesController.project().handoff,"FOOT_CLUSTER");

const candlemasPrepared={
  ...livePrepared,
  session:{
    ...livePrepared.session,
    resolvedMass:{...livePrepared.session.resolvedMass,precedingRites:["CANDLEMAS"]},
    plan:{...livePrepared.session.plan,precedingGraphs:["CANDLEMAS"]},
  },
};
const candlemasReady=await prepareNativeReaderPreview({
  prepared:candlemasPrepared,presentationData:data,eventData,cueRegistries,guideData,candlemasData
});
assert.ok(candlemasReady.candlemasController,"native preview lost Candlemas controller");
assert.equal(candlemasReady.candlemasController.project().card.id,"CND-R01");
candlemasReady.candlemasController.goTo("CND-R03");
candlemasReady.candlemasController.setRecipientState("RECEIVE_CANDLE");
assert.equal(candlemasReady.candlemasController.project().recipientPosture,"KNEEL");
assert.equal(candlemasReady.candlemasController.project().hasBlessedCandle,true);
candlemasReady.candlemasController.setProcessionParticipant(true);
candlemasReady.candlemasController.goTo("CND-R05");
assert.equal(candlemasReady.candlemasController.project().candleState,"CANDLE_LIT");
assert.equal(candlemasReady.candlemasController.massCandleState("MC-GSP-060").state,"CANDLE_LIT");
assert.equal(candlemasReady.candlemasController.massCandleState("MC-GSP-060").postureOverride,null);
assert.equal(candlemasReady.candlemasController.massCandleState("MC-COM-030").state,"CANDLE_LIT");
assert.equal(candlemasReady.candlemasController.massCandleState("MC-COM-040").state,null);
candlemasReady.candlemasController.goTo("CND-R07");
assert.equal(candlemasReady.candlemasController.project().handoff,"INTROIT");

const rogationsPrepared={
  ...livePrepared,
  session:{
    ...livePrepared.session,
    resolvedMass:{...livePrepared.session.resolvedMass,precedingRites:["ROGATIONS"]},
    plan:{...livePrepared.session.plan,precedingGraphs:["ROGATIONS"]},
  },
};
const rogationsReady=await prepareNativeReaderPreview({
  prepared:rogationsPrepared,presentationData:data,eventData,cueRegistries,guideData,rogationsData
});
assert.ok(rogationsReady.rogationsController,"native preview lost Rogations controller");
assert.equal(rogationsReady.rogationsController.project().card.id,"ROG-R01");
rogationsReady.rogationsController.goTo("ROG-R06");
assert.equal(rogationsReady.rogationsController.project().handoff,"INTROIT");


const followingFixtures=[
  ["REQUIEM_ABSOLUTION",requiemAbsolutionData,"requiemAbsolutionController","ABS-R01",{normalLastGospel:false,blessingAllowed:false}],
  ["CORPUS_CHRISTI_PROCESSION",corpusChristiData,"corpusChristiController","CORPUS-R01",{normalLastGospel:false,blessingAllowed:false}],
  ["HOLY_THURSDAY_POST",holyThursdayPostData,"holyThursdayPostController","HT-R01",{normalLastGospel:false,blessingAllowed:false}],
  ["GENERIC_PROCESSION",genericProcessionData,"genericProcessionController","PROC-R01",{normalLastGospel:true,blessingAllowed:true}],
];
for(const [followingAction,fixture,controllerKey,firstId,ending] of followingFixtures){
  const followingPrepared={
    ...livePrepared,
    session:{
      ...livePrepared.session,
      resolvedMass:{
        ...livePrepared.session.resolvedMass,
        overlays:followingAction==="REQUIEM_ABSOLUTION" ? ["REQUIEM"] : [],
        followingActions:[followingAction],
      },
      plan:{
        ...livePrepared.session.plan,
        followingGraphs:[followingAction],
        normalLastGospel:ending.normalLastGospel,
        blessingAllowed:ending.blessingAllowed,
      },
    },
  };
  const readyFollowing=await prepareNativeReaderPreview({
    prepared:followingPrepared,presentationData:data,eventData,cueRegistries,guideData,
    requiemAbsolutionData:followingAction==="REQUIEM_ABSOLUTION" ? fixture : null,
    corpusChristiData:followingAction==="CORPUS_CHRISTI_PROCESSION" ? fixture : null,
    holyThursdayPostData:followingAction==="HOLY_THURSDAY_POST" ? fixture : null,
    genericProcessionData:followingAction==="GENERIC_PROCESSION" ? fixture : null,
  });
  assert.ok(readyFollowing[controllerKey],"native preview lost "+followingAction+" controller");
  const first=readyFollowing[controllerKey].project().card;
  assert.equal(first.id??first.recordId,firstId);
  assert.equal(readyFollowing.lifecycleRuntime.snapshot().stage,"MASS_ACTIVE");
  assert.equal(readyFollowing.lifecycleRuntime.contract.followingAction.active,true);
}

await assert.rejects(
  ()=>prepareNativeReaderPreview({
    prepared:{
      ...livePrepared,
      session:{
        ...livePrepared.session,
        resolvedMass:{...livePrepared.session.resolvedMass,followingActions:["UNSUPPORTED_FOLLOWING"]},
        plan:{...livePrepared.session.plan,followingGraphs:["UNSUPPORTED_FOLLOWING"]},
      },
    },
    presentationData:data,eventData,cueRegistries,guideData
  }),
  /FOLLOWING_ACTION_PROJECTION_PENDING|NATIVE_PREVIEW_FOLLOWING_ACTION_PENDING:UNSUPPORTED_FOLLOWING/,
  "native preview stopped failing closed on an unsupported following action"
);

await assert.rejects(
  ()=>prepareNativeReaderPreview({
    prepared:{
      ...livePrepared,
      session:{
        ...livePrepared.session,
        resolvedMass:{...livePrepared.session.resolvedMass,precedingRites:["UNSUPPORTED_RITE"]},
        plan:{...livePrepared.session.plan,precedingGraphs:["UNSUPPORTED_RITE"]},
      },
    },
    presentationData:data,eventData,cueRegistries,guideData
  }),
  /PRECEDING_RITE_PROJECTION_PENDING|NATIVE_PREVIEW_PRECEDING_RITE_PENDING:UNSUPPORTED_RITE/,
  "native preview stopped failing closed on an unsupported preceding rite"
);

const prepared={
  ...livePrepared,
  session:{
    ...livePrepared.session,
    resolvedMass:{...livePrepared.session.resolvedMass,presentationMode:"SIMPLE"},
  },
  readerPreferences:{...livePrepared.readerPreferences,mode:"SIMPLE"},
};
const ready=await prepareNativeReaderPreview({prepared,presentationData:data,eventData,cueRegistries,guideData});
assert.equal(ready.guide.registry.entryCount,32);
assert.equal(ready.guide.registry.entries["AO.CARD.001"].moment,"Introit & Preparatory Prayers");
assert.equal(ready.scholaState.supported,true);
assert.equal(ready.scholaState.activateForCard(2).schola.cueId,"AO.SM.C0044");
assert.equal(ready.model.totalCards,30);
assert.equal(ready.presentationModel,ready.model,"non-LIVE native preview should not receive the 48-step Sung presentation");
assert.equal(ready.model.cards[14].title,"Consecration of the Sacred Host");
assert.equal(ready.model.cards[15].title,"Consecration of the Chalice");
assert.equal(ready.cueState.supported,true);
assert.equal(ready.transientState.supported,true);
assert.equal(ready.transientState.audit.bellCueCount,5);
assert.equal(ready.transientState.project("AO.SM.C0174").bell.label,"ELEVATION BELL");
assert.equal(ready.cueState.project("AO.SM.C0084").priestPosition.station,"ALTAR_GOSPEL_MISSAL");
assert.equal(ready.cueState.project("AO.SM.C0071").response.text,"Et cum spíritu tuo.");
assert.ok(ready.model.cards[0].paragraphs.length>0);
assert.ok(ready.model.cards.some(card=>card.paragraphs.some(p=>p.primary==="Introit")),"resolved Proper text never entered native card model");

const nodes={
  "#stationText":{textContent:"ALTAR"},
  "#postureText":{textContent:"KNEEL"},
  "#gestureText":{textContent:"BOW"},
  "#responseText":{textContent:"Amen"},
  "#voiceText":{textContent:"LOW VOICE"},
};
const snapshot=legacyReaderStateSnapshot({querySelector:s=>nodes[s]??null});
assert.equal(snapshot.priestPosition.label,"ALTAR");
assert.equal(snapshot.posture.label,"KNEEL");
assert.equal(snapshot.gesture.label,"BOW");
assert.equal(snapshot.response.label,"Amen");
assert.equal(snapshot.priestVoice.label,"LOW VOICE");
assert.equal(Object.hasOwn(snapshot,"schola"),false,"legacy snapshot still reads Schola");
const postureOnly=legacyReaderStateSnapshot({querySelector:s=>nodes[s]??null},{postureOnly:true});
assert.equal(postureOnly.posture.label,"KNEEL");
assert.equal(postureOnly.priestPosition,null);
assert.equal(postureOnly.gesture,null);
assert.equal(postureOnly.response,null);
assert.equal(postureOnly.priestVoice,null);

const disputed={
  gesture:null,
  ownership:{gesture:"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION"},
};
assert.equal(resolveGestureProjection(disputed,{label:"BOW"}),null,
  "disputed legacy bow leaked into R17 Gloria/Credo");
const certified={
  gesture:{label:"GENUFLECT"},
  ownership:{gesture:"R17_NATIVE"},
};
assert.equal(resolveGestureProjection(certified,{label:"BOW"}).label,"GENUFLECT",
  "certified native gesture did not outrank legacy fallback");

assert.equal(resolveGestureProjection(disputed,{label:"LEGACY BOW"},{
  cueId:"AO.SM.C0056",gestureProfile:"GUIDED_1962"
}),null,"customary Gloria cue leaked into GUIDED_1962");
assert.equal(resolveGestureProjection(disputed,{label:"LEGACY BOW"},{
  cueId:"AO.SM.C0056",gestureProfile:"TRADITIONAL"
}).type,"HEAD_BOW","exact traditional Gloria cue did not resolve");
assert.equal(resolveGestureProjection(disputed,{label:"LEGACY CROSS"},{
  cueId:"AO.SM.C0104",gestureProfile:"TRADITIONAL"
}).type,"SIGN_OF_CROSS","exact traditional Credo cross did not resolve");
assert.equal(resolveGestureProjection(null,{label:"LEGACY BOW"},{
  cueId:"AO.SM.C0090",gestureProfile:"GUIDED_1962"
}),null,"known Credo cue fell back to legacy despite profile suppression");


const guidedSource=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"FOREHEAD · LIPS · BREAST",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:null,
  legacy:{gesture:{label:"LEGACY"}},
  cueId:"AO.SM.C0084",
  gestureProfile:"GUIDED_1962",
});
assert.equal(guidedSource.gesture.label,"FOREHEAD · LIPS · BREAST",
  "GUIDED_1962 suppressed a source-backed Gospel gesture");

const guidedGloria=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"EXTRACTED BOW",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:{ownership:{gesture:"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION"}},
  legacy:{gesture:{label:"LEGACY BOW"}},
  cueId:"AO.SM.C0056",
  gestureProfile:"GUIDED_1962",
});
assert.equal(guidedGloria.gesture,null,
  "GUIDED_1962 leaked a customary Gloria bow from the raw source registry");

const traditionalGloria=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"EXTRACTED BOW",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:{ownership:{gesture:"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION"}},
  legacy:{},
  cueId:"AO.SM.C0056",
  gestureProfile:"TRADITIONAL",
});
assert.equal(traditionalGloria.gesture.type,"HEAD_BOW",
  "TRADITIONAL profile lost the adjudicated Gloria bow");

const essentialSource=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"FOREHEAD · LIPS · BREAST",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:null,legacy:{},
  cueId:"AO.SM.C0084",
  gestureProfile:"ESSENTIAL",
});
assert.equal(essentialSource.gesture,null,
  "ESSENTIAL unexpectedly inherited the full Guided source-gesture catalogue");

const transitionGuard=createCardTransitionTransientGuard();
assert.equal(transitionGuard.pending,false);
assert.deepEqual(transitionGuard.filter({
  gesture:{label:"BOW"},response:{label:"AMEN"},bell:{label:"BELL"},cinematic:{title:"CINEMA"}
}),{
  gesture:{label:"BOW"},response:{label:"AMEN"},bell:{label:"BELL"},cinematic:{title:"CINEMA"}
});
transitionGuard.begin();
assert.equal(transitionGuard.pending,true);
assert.deepEqual(transitionGuard.filter({
  gesture:{label:"BOW"},response:{label:"AMEN"},bell:{label:"BELL"},cinematic:{title:"CINEMA"}
}),{
  gesture:null,response:null,bell:null,cinematic:null
},"card transition leaked prior gesture/response/bell/cinematic transient");
transitionGuard.resolveCue("AO.SM.C0100");
assert.equal(transitionGuard.pending,false);
assert.equal(transitionGuard.filter({gesture:{label:"NEW"}}).gesture.label,"NEW");


const staleLegacy={
  priestPosition:{label:"STALE LEGACY POSITION"},
  priestVoice:{label:"STALE LEGACY VOICE"},
  gesture:{label:"STALE LEGACY GESTURE"},
  response:{label:"STALE LEGACY RESPONSE"},
};
const waiting=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:null,
  eventState:null,
  legacy:staleLegacy,
  cueId:null,
  gestureProfile:"GUIDED_1962",
});
assert.equal(waiting.priestPosition,null,"certified cue owner leaked stale legacy priest position while focus was unresolved");
assert.equal(waiting.priestVoice,null,"certified cue owner leaked stale legacy priest voice while focus was unresolved");
assert.equal(waiting.gesture,null,"certified cue owner leaked stale legacy gesture while focus was unresolved");
assert.equal(waiting.response,null,"certified cue owner leaked stale legacy response while focus was unresolved");
assert.equal(waiting.ownership.priestPosition,"R17_CUE_WAITING_FAIL_CLOSED");

const exactCue=ready.cueState.project("AO.SM.C0071");
const exactOwned=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:exactCue,
  eventState:null,
  legacy:staleLegacy,
  cueId:"AO.SM.C0071",
  gestureProfile:"GUIDED_1962",
});
assert.equal(exactOwned.priestPosition.station,"ALTAR_CENTER");
assert.equal(exactOwned.priestVoice.value,"LISTENS");
assert.equal(exactOwned.response.text,"Et cum spíritu tuo.");
assert.equal(exactOwned.gesture,null);

const matrixCue=ready.cueState.project("AO.SM.C0001");
assert.equal(matrixCue.gesture.owner,"GESTURE_MATRIX_SOT");
assert.equal(matrixCue.gesture.sourceGestureId,"GM.F.C0001.01");
const matrixOwned=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:matrixCue,
  eventState:null,
  legacy:staleLegacy,
  cueId:"AO.SM.C0001",
  gestureProfile:"GUIDED_1962",
});
assert.equal(matrixOwned.gesture.owner,"GESTURE_MATRIX_SOT");
assert.equal(matrixOwned.ownership.gesture,"GESTURE_MATRIX_SOT");

const unsupportedOwned=resolveCueOwnedChannels({
  cueControllerSupported:false,
  cueProjection:null,
  eventState:null,
  legacy:staleLegacy,
  gestureProfile:"GUIDED_1962",
});
assert.equal(unsupportedOwned.priestPosition.label,"STALE LEGACY POSITION");
assert.equal(unsupportedOwned.priestVoice.label,"STALE LEGACY VOICE");
assert.equal(unsupportedOwned.response.label,"STALE LEGACY RESPONSE");
assert.equal(unsupportedOwned.ownership.priestPosition,"LEGACY_FALLBACK");


const palmPrepared={
  ...prepared,
  session:{
    ...prepared.session,
    resolvedMass:{...prepared.session.resolvedMass,precedingRites:["PALM"]},
    plan:{kind:"MASS",precedingGraphs:["PALM"],followingGraphs:[],overlayGraphs:["VOTIVE_PROPER"],massEntry:"INTROIT",normalLastGospel:false},
  },
};
const palmReady=await prepareNativeReaderPreview({
  prepared:palmPrepared,presentationData:data,eventData,cueRegistries,guideData,palmData
});
assert.ok(palmReady.palmController,"Palm native preview controller missing");
assert.equal(palmReady.palmController.project().card.id,"PALM-R01");
assert.equal(palmReady.model.totalCards,30,"Palm prelude mutated Mass card identity");

const ashPrepared={
  ...prepared,
  session:{
    ...prepared.session,
    resolvedMass:{...prepared.session.resolvedMass,precedingRites:["ASH"]},
    plan:{kind:"MASS",precedingGraphs:["ASH"],followingGraphs:[],overlayGraphs:["VOTIVE_PROPER"],massEntry:"INTROIT",normalLastGospel:true},
  },
};
const ashReady=await prepareNativeReaderPreview({
  prepared:ashPrepared,presentationData:data,eventData,cueRegistries,guideData,ashData
});
assert.ok(ashReady.ashController,"Ash native preview controller missing");
assert.equal(ashReady.ashController.project().card.id,"ASH-R01");
assert.equal(ashReady.model.totalCards,30,"Ash prelude mutated Mass card identity");

let blocked=false;
try{
  await prepareNativeReaderPreview({
    prepared:{...prepared,session:{
      ...prepared.session,
      resolvedMass:{...prepared.session.resolvedMass,overlays:["UNSUPPORTED_TEST_OVERLAY"]},
      plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["UNSUPPORTED_TEST_OVERLAY"]},
    }},
    presentationData:data,
    eventData,
    cueRegistries,
    guideData,
  });
}catch(error){blocked=/STRUCTURAL_OVERLAY_PROJECTION_PENDING|not yet certified for overlay UNSUPPORTED_TEST_OVERLAY/.test(String(error.message))}
assert.equal(blocked,true,"unsupported special graph did not fail closed");

console.log("native reader preview: PASS — source-first LIVE is native-owned; remaining rollback state is explicit.");
