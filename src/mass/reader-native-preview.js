// Native production reader.
// R17 owns verified prayer-card text, navigation and certified state channels.
// Legacy DOM/state is consulted only when an explicit rollback/shadow donor is supplied.

import { createMassReaderModel } from "./reader-model.js";
import { projectSourceFirst48Presentation } from "./reader-live-product48.js";
import { buildReaderModeModels, captureReaderModeAnchor, findReaderModeAnchorCard } from "./reader-mode-switch.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { createReaderDomAdapter } from "./reader-dom.js";
import { loadCanonicalReaderEvents, createNativeEventStateController, extractCanonicalEventId } from "./reader-event-state.js";
import { GLORIA_CREDO_FAITHFUL_GESTURES, isGloriaCredoGestureSourceCue, resolveFaithfulGestureForCue } from "./faithful-gesture-cues.js";
import { loadReaderCueRegistries } from "./reader-cue-state.js";
import { loadReaderFormStateData, createReaderFormCueStateController } from "./reader-form-state.js";
import { installCueFocusTracker } from "./reader-cue-focus.js";
import { resolveReaderPostureChannel } from "./reader-posture-profile.js";
import { structureSupport } from "./reader-structure.js";
import { loadGuideRegistry, guideForSequence } from "./reader-guide.js";
import { createNativeScholaController } from "./reader-schola.js";
import { iconKeysForReaderState } from "./reader-icons.js";
import { createReaderTransientController, partTransitionCinematic } from "./reader-transients.js";
import { createPlanAwareObjectiveRuntime } from "./reader-objective-runtime.js";
import { createAspergesReaderController, loadAspergesReaderData, resolveAspergesRiteContext } from "./reader-asperges.js";
import { createPalmReaderController, loadPalmReaderData } from "./reader-palm.js";
import { createAshReaderController, loadAshReaderData } from "./reader-ash.js";
import { createCandlemasReaderController, loadCandlemasReaderData } from "./reader-candlemas.js";
import { createRogationsReaderController, loadRogationsReaderData } from "./reader-rogations.js";
import { createGoodFridayReaderController, loadGoodFridayReaderData } from "./reader-good-friday.js";
import { createEasterVigilReaderController, loadEasterVigilReaderData, projectEasterVigilMassModel } from "./reader-easter-vigil.js";
import { createRequiemAbsolutionReaderController, loadRequiemAbsolutionReaderData } from "./reader-requiem-absolution.js";
import { createCorpusChristiProcessionReaderController, loadCorpusChristiProcessionReaderData } from "./reader-corpus-christi.js";
import { createHolyThursdayPostReaderController, loadHolyThursdayPostReaderData } from "./reader-holy-thursday-post.js";
import { createGenericProcessionReaderController, loadGenericProcessionReaderData } from "./reader-generic-procession.js";
import { createFormLifecycleRuntime } from "./form-lifecycle.js";

const ROOT_ID="ao-r17-native-reader-preview";

function cleanText(value){
  const text=String(value??"").trim();
  return text && text!=="—" ? text : null;
}

function textAt(doc,selector){
  return cleanText(doc?.querySelector?.(selector)?.textContent);
}

export function legacyReaderStateSnapshot(doc,{postureOnly=false}={}){
  const postureText=textAt(doc,"#postureText");
  if(postureOnly)return Object.freeze({priestPosition:null,posture:postureText?{label:postureText}:null,gesture:null,response:null,priestVoice:null});
  return Object.freeze({
    priestPosition:textAt(doc,"#stationText") ? {label:textAt(doc,"#stationText")} : null,
    posture:postureText ? {label:postureText} : null,
    gesture:textAt(doc,"#gestureText") ? {label:textAt(doc,"#gestureText")} : null,
    response:textAt(doc,"#responseText") ? {label:textAt(doc,"#responseText")} : null,
    priestVoice:textAt(doc,"#voiceText") ? {label:textAt(doc,"#voiceText")} : null,
  });
}

export function resolveGestureProjection(eventState, legacyGesture, {
  cueId=null,
  gestureProfile="GUIDED_1962",
  incarnatusAction="GENUFLECT",
}={}) {
  const owner=eventState?.ownership?.gesture ?? null;
  if(owner==="R17_NATIVE") return eventState.gesture ?? null;

  const adjudicated=Boolean(cueId && GLORIA_CREDO_FAITHFUL_GESTURES[cueId]);
  const cueGesture=cueId ? resolveFaithfulGestureForCue({cueId,gestureProfile,incarnatusAction}) : null;
  if(cueGesture) return cueGesture;

  if(adjudicated || owner==="R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION") return null;
  return legacyGesture ?? null;
}

export function resolveCueOwnedChannels({
  cueControllerSupported=false,
  cueProjection=null,
  eventState=null,
  legacy={},
  cueId=null,
  gestureProfile="GUIDED_1962",
}={}){
  const cueNative=Boolean(cueProjection?.supported && cueProjection?.reason==null);

  // Once the certified Sung cue controller owns these channels, absence is
  // meaningful. Do not leak a stale legacy cue while focus is resolving.
  if(cueControllerSupported){
    let gesture=null;
    if(cueNative){
      if(isGloriaCredoGestureSourceCue(cueId)){
        // Gloria/Credo are explicitly profile-adjudicated. This suppresses
        // duplicate extracted bow/cross rows in ESSENTIAL/GUIDED while retaining
        // the recovered Incarnatus rubrical cue and Traditional customary layer.
        gesture=resolveGestureProjection(eventState,null,{cueId,gestureProfile});
      }else if(gestureProfile!=="ESSENTIAL"){
        // Outside the adjudicated Gloria/Credo windows, the exact source cue
        // registry owns GUIDED_1962 and TRADITIONAL gestures.
        gesture=cueProjection.gesture??null;
      }
    }
    return Object.freeze({
      gesture,
      response:cueNative ? cueProjection.response : null,
      priestVoice:cueNative ? cueProjection.priestVoice : null,
      priestPosition:cueNative ? cueProjection.priestPosition : null,
      cueNative,
      ownership:Object.freeze({
        gesture:cueNative
          ? (
            gesture
              ? (gesture.owner==="R17_CUE_SOURCE" ? "R17_CUE_NATIVE_SOURCE" : "R17_EXACT_CUE_PROFILE")
              : cueProjection.ownership.gesture
          )
          : "R17_CUE_WAITING_FAIL_CLOSED",
        response:cueNative ? cueProjection.ownership.response : "R17_CUE_WAITING_FAIL_CLOSED",
        priestVoice:cueNative ? cueProjection.ownership.priestVoice : "R17_CUE_WAITING_FAIL_CLOSED",
        priestPosition:cueNative ? cueProjection.ownership.priestPosition : "R17_CUE_WAITING_FAIL_CLOSED",
      }),
    });
  }

  return Object.freeze({
    gesture:resolveGestureProjection(eventState,legacy.gesture,{cueId:null,gestureProfile}),
    response:eventState?.ownership?.response==="R17_NATIVE" ? eventState.response : legacy.response ?? null,
    priestVoice:eventState?.ownership?.priestVoice==="R17_NATIVE" ? eventState.priestVoice : legacy.priestVoice ?? null,
    priestPosition:legacy.priestPosition ?? null,
    cueNative:false,
    ownership:Object.freeze({
      gesture:eventState?.ownership?.gesture ?? "LEGACY_FALLBACK",
      response:eventState?.ownership?.response==="R17_NATIVE" ? "R17_EVENT_NATIVE" : "LEGACY_FALLBACK",
      priestVoice:eventState?.ownership?.priestVoice==="R17_NATIVE" ? "R17_EVENT_NATIVE" : "LEGACY_FALLBACK",
      priestPosition:"LEGACY_FALLBACK",
    }),
  });
}

export function createCardTransitionTransientGuard(){
  let pending=false;
  return Object.freeze({
    begin(){
      pending=true;
      return pending;
    },
    resolveCue(cueId){
      if(cueId)pending=false;
      return pending;
    },
    filter({gesture=null,response=null,bell=null,cinematic=null}={}){
      return Object.freeze({
        gesture:pending ? null : gesture,
        response:pending ? null : response,
        bell:pending ? null : bell,
        cinematic:pending ? null : cinematic,
      });
    },
    get pending(){return pending;},
  });
}

export async function prepareNativeReaderPreview({
  prepared,
  presentationData=null,
  loadPresentationData=loadReaderPresentationData,
  eventData=null,
  loadEventData=loadCanonicalReaderEvents,
  cueRegistries=null,
  loadCueRegistries=loadReaderCueRegistries,
  formStateData=null,
  loadFormStateData=loadReaderFormStateData,
  guideData=null,
  loadGuideData=loadGuideRegistry,
  aspergesData=null,
  loadAspergesData=loadAspergesReaderData,
  palmData=null,
  loadPalmData=loadPalmReaderData,
  ashData=null,
  loadAshData=loadAshReaderData,
  candlemasData=null,
  loadCandlemasData=loadCandlemasReaderData,
  rogationsData=null,
  loadRogationsData=loadRogationsReaderData,
  goodFridayData=null,
  loadGoodFridayData=loadGoodFridayReaderData,
  easterVigilData=null,
  loadEasterVigilData=loadEasterVigilReaderData,
  requiemAbsolutionData=null,
  loadRequiemAbsolutionData=loadRequiemAbsolutionReaderData,
  corpusChristiData=null,
  loadCorpusChristiData=loadCorpusChristiProcessionReaderData,
  holyThursdayPostData=null,
  loadHolyThursdayPostData=loadHolyThursdayPostReaderData,
  genericProcessionData=null,
  loadGenericProcessionData=loadGenericProcessionReaderData,
}={}){
  if(!prepared?.session?.resolvedMass) throw new TypeError("Prepared R17 Mass session required");
  const plan=prepared?.session?.plan;
  if(plan?.kind==="DISTINCT_RITE" && plan?.rite==="GOOD_FRIDAY"){
    const loadedGoodFriday=goodFridayData ?? await Promise.resolve(loadGoodFridayData(prepared));
    const ctx=prepared?.session?.resolvedMass?.provenance?.goodFriday ?? {};
    const goodFridayController=createGoodFridayReaderController({
      graph:loadedGoodFriday?.graph,
      payload:loadedGoodFriday?.payload,
      jewishPrayerVariant:ctx.jewishPrayerVariant??"PRINTED_1962",
      venerationMode:ctx.venerationMode??"PERSONAL",
      willReceiveCommunion:ctx.willReceiveCommunion===true,
    });
    return Object.freeze({
      prepared,
      distinctRite:"GOOD_FRIDAY",
      goodFridayController,
      model:null,
    });
  }
  if(plan?.kind==="COMPOSITE_DISTINCT_RITE" && plan?.rite==="EASTER_VIGIL"){
    const [data,loadedEasterVigil]=await Promise.all([
      presentationData ?? Promise.resolve(loadPresentationData(prepared)),
      easterVigilData ?? Promise.resolve(loadEasterVigilData(prepared)),
    ]);
    const resolved=prepared.session.resolvedMass;
    const ordinaryResolved=Object.freeze({
      ...resolved,
      distinctRite:null,
      precedingRites:Object.freeze([]),
      followingActions:Object.freeze([]),
      overlays:Object.freeze([...(resolved.overlays??[])].filter(x=>x!=="EASTER_VIGIL")),
    });
    const baseModel=createMassReaderModel({
      resolvedMass:ordinaryResolved,
      sectionMap:data?.sectionMap,
      lowCorpus:data?.lowCorpus,
      sungCorpus:data?.sungCorpus,
      canonSourceMap:data?.canonSourceMap,
      nuptialData:data?.nuptialData,
      properNotApplicableSlots:["INTROIT","COMMUNION"],
      vernacularLanguage:prepared?.readerPreferences?.language??"en",
    });
    const model=projectEasterVigilMassModel(baseModel,loadedEasterVigil?.payload);
    const ctx=resolved?.provenance?.easterVigil ?? {};
    const easterVigilController=createEasterVigilReaderController({
      graph:loadedEasterVigil?.graph,
      payload:loadedEasterVigil?.payload,
      fontMode:ctx.fontMode??"IN_CHURCH",
      baptismPresent:ctx.baptismPresent===true,
    });
    return Object.freeze({
      prepared,
      distinctRite:"EASTER_VIGIL",
      easterVigilController,
      model,
    });
  }
  const structuralSupport=structureSupport(prepared);
  if(!structuralSupport.supported){
    throw new Error(structuralSupport.reason || "R17 native reader structure is not certified");
  }
  const resolvedForm=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
  const needsFormState=resolvedForm==="LOW" || resolvedForm==="SOLEMN";
  const preceding=[...(prepared?.session?.plan?.precedingGraphs??[])];
  const unsupportedNativePreceding=preceding.filter(x=>!["ASPERGES","PALM","ASH","CANDLEMAS","ROGATIONS"].includes(x));
  if(unsupportedNativePreceding.length){
    throw new Error("NATIVE_PREVIEW_PRECEDING_RITE_PENDING:"+unsupportedNativePreceding.join(","));
  }
  const hasAsperges=preceding.includes("ASPERGES");
  const hasPalm=preceding.includes("PALM");
  const hasAsh=preceding.includes("ASH");
  const hasCandlemas=preceding.includes("CANDLEMAS");
  const hasRogations=preceding.includes("ROGATIONS");
  const following=[...(prepared?.session?.plan?.followingGraphs??[])];
  const unsupportedNativeFollowing=following.filter(x=>!["REQUIEM_ABSOLUTION","CORPUS_CHRISTI_PROCESSION","HOLY_THURSDAY_POST","GENERIC_PROCESSION"].includes(x));
  if(unsupportedNativeFollowing.length){
    throw new Error("NATIVE_PREVIEW_FOLLOWING_ACTION_PENDING:"+unsupportedNativeFollowing.join(","));
  }
  const hasRequiemAbsolution=following.includes("REQUIEM_ABSOLUTION");
  const hasCorpusChristi=following.includes("CORPUS_CHRISTI_PROCESSION");
  const hasHolyThursdayPost=following.includes("HOLY_THURSDAY_POST");
  const hasGenericProcession=following.includes("GENERIC_PROCESSION");
  if([hasAsperges,hasPalm,hasAsh,hasCandlemas,hasRogations].filter(Boolean).length>1)throw new Error("NATIVE_PREVIEW_MULTIPLE_PRELUDES_PENDING");
  if([hasRequiemAbsolution,hasCorpusChristi,hasHolyThursdayPost,hasGenericProcession].filter(Boolean).length>1)throw new Error("NATIVE_PREVIEW_MULTIPLE_FOLLOWING_ACTIONS_PENDING");
  const [data,events,registries,guide,formState,loadedAsperges,loadedPalm,loadedAsh,loadedCandlemas,loadedRogations,loadedRequiemAbsolution,loadedCorpusChristi,loadedHolyThursdayPost,loadedGenericProcession]=await Promise.all([
    presentationData ?? Promise.resolve(loadPresentationData(prepared)),
    eventData ?? Promise.resolve(loadEventData(prepared)),
    cueRegistries ?? Promise.resolve(loadCueRegistries(prepared)),
    guideData ?? Promise.resolve(loadGuideData(prepared)),
    needsFormState ? (formStateData ?? Promise.resolve(loadFormStateData(prepared))) : null,
    hasAsperges ? (aspergesData ?? Promise.resolve(loadAspergesData(prepared))) : null,
    hasPalm ? (palmData ?? Promise.resolve(loadPalmData(prepared))) : null,
    hasAsh ? (ashData ?? Promise.resolve(loadAshData(prepared))) : null,
    hasCandlemas ? (candlemasData ?? Promise.resolve(loadCandlemasData(prepared))) : null,
    hasRogations ? (rogationsData ?? Promise.resolve(loadRogationsData(prepared))) : null,
    hasRequiemAbsolution ? (requiemAbsolutionData ?? Promise.resolve(loadRequiemAbsolutionData(prepared))) : null,
    hasCorpusChristi ? (corpusChristiData ?? Promise.resolve(loadCorpusChristiData(prepared))) : null,
    hasHolyThursdayPost ? (holyThursdayPostData ?? Promise.resolve(loadHolyThursdayPostData(prepared))) : null,
    hasGenericProcession ? (genericProcessionData ?? Promise.resolve(loadGenericProcessionData(prepared))) : null,
  ]);
  const model=createMassReaderModel({
    resolvedMass:prepared.session.resolvedMass,
    sectionMap:data?.sectionMap,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
    canonSourceMap:data?.canonSourceMap,
    nuptialData:data?.nuptialData,
    vernacularLanguage:prepared?.readerPreferences?.language??"en",
  });
  const presentationModel=projectSourceFirst48Presentation(model);
  const eventState=createNativeEventStateController(events);
  const objectiveRuntime=createPlanAwareObjectiveRuntime({events,prepared});
  const cueState=createReaderFormCueStateController({
    formStateData:formState,
    registries,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
    prepared,
  });
  const scholaState=createNativeScholaController({sungCorpus:data?.sungCorpus,properSlots:model.properSlots,prepared});
  const transientState=createReaderTransientController({events,prepared});
  const aspergesController=hasAsperges
    ? createAspergesReaderController({
        graph:loadedAsperges?.graph,
        payload:loadedAsperges?.payload,
        riteContext:resolveAspergesRiteContext(prepared),
      })
    : null;
  const palmController=hasPalm
    ? createPalmReaderController({graph:loadedPalm?.graph,payload:loadedPalm?.payload})
    : null;
  const ashController=hasAsh
    ? createAshReaderController({graph:loadedAsh?.graph,payload:loadedAsh?.payload})
    : null;
  const candlemasController=hasCandlemas
    ? createCandlemasReaderController({graph:loadedCandlemas?.graph,payload:loadedCandlemas?.payload})
    : null;
  const rogationsController=hasRogations
    ? createRogationsReaderController({graph:loadedRogations?.graph,payload:loadedRogations?.payload})
    : null;
  const absContext=prepared?.session?.resolvedMass?.provenance?.requiemAbsolution ?? {};
  const requiemAbsolutionController=hasRequiemAbsolution
    ? createRequiemAbsolutionReaderController({
        graph:loadedRequiemAbsolution?.graph,
        payload:loadedRequiemAbsolution?.payload,
        bodyPresent:absContext.bodyPresent===true,
        burialProcession:absContext.burialProcession===true,
      })
    : null;
  const corpusChristiController=hasCorpusChristi
    ? createCorpusChristiProcessionReaderController({graph:loadedCorpusChristi?.graph,payload:loadedCorpusChristi?.payload})
    : null;
  const holyThursdayPostController=hasHolyThursdayPost
    ? createHolyThursdayPostReaderController({graph:loadedHolyThursdayPost?.graph,payload:loadedHolyThursdayPost?.payload})
    : null;
  const genericProcessionController=hasGenericProcession
    ? createGenericProcessionReaderController({graph:loadedGenericProcession?.graph,payload:loadedGenericProcession?.payload})
    : null;
  const lifecycleRuntime=createFormLifecycleRuntime({prepared});
  return Object.freeze({
    prepared,data,model,presentationModel,events,eventState,objectiveRuntime,registries,cueState,guide,scholaState,transientState,formState,
    aspergesController,palmController,ashController,candlemasController,rogationsController,
    requiemAbsolutionController,corpusChristiController,holyThursdayPostController,genericProcessionController,lifecycleRuntime
  });
}

export async function mountNativeReaderPreview({
  doc=globalThis.document,
  prepared,
  presentationData=null,
  loadPresentationData=loadReaderPresentationData,
  eventData=null,
  loadEventData=loadCanonicalReaderEvents,
  cueRegistries=null,
  loadCueRegistries=loadReaderCueRegistries,
  formStateData=null,
  loadFormStateData=loadReaderFormStateData,
  guideData=null,
  loadGuideData=loadGuideRegistry,
  aspergesData=null,
  loadAspergesData=loadAspergesReaderData,
  palmData=null,
  loadPalmData=loadPalmReaderData,
  ashData=null,
  loadAshData=loadAshReaderData,
  candlemasData=null,
  loadCandlemasData=loadCandlemasReaderData,
  rogationsData=null,
  loadRogationsData=loadRogationsReaderData,
  goodFridayData=null,
  loadGoodFridayData=loadGoodFridayReaderData,
  easterVigilData=null,
  loadEasterVigilData=loadEasterVigilReaderData,
  requiemAbsolutionData=null,
  loadRequiemAbsolutionData=loadRequiemAbsolutionReaderData,
  corpusChristiData=null,
  loadCorpusChristiData=loadCorpusChristiProcessionReaderData,
  holyThursdayPostData=null,
  loadHolyThursdayPostData=loadHolyThursdayPostReaderData,
  genericProcessionData=null,
  loadGenericProcessionData=loadGenericProcessionReaderData,
  readLegacyActive=null,
  iconResolver=null,
  onClose=null,
}={}){
  if(!doc?.body || !doc?.createElement) throw new TypeError("Document/body required");

  // Validate everything before adding a single preview node.
  const ready=await prepareNativeReaderPreview({
    prepared,presentationData,loadPresentationData,eventData,loadEventData,
    cueRegistries,loadCueRegistries,formStateData,loadFormStateData,guideData,loadGuideData,
    aspergesData,loadAspergesData,palmData,loadPalmData,ashData,loadAshData,
    candlemasData,loadCandlemasData,rogationsData,loadRogationsData,
    goodFridayData,loadGoodFridayData,
    easterVigilData,loadEasterVigilData,
    requiemAbsolutionData,loadRequiemAbsolutionData,corpusChristiData,loadCorpusChristiData,
    holyThursdayPostData,loadHolyThursdayPostData,genericProcessionData,loadGenericProcessionData,
  });

  doc.getElementById?.(ROOT_ID)?.remove?.();

  const root=doc.createElement("section");
  root.id=ROOT_ID;
  root.setAttribute("aria-label","Ad Orientem Mass reader");
  root.dataset.r17TextOwner="R17_VERIFIED_CORPUS";
  root.dataset.r17CardOwner="R17_READER_MODEL";
  root.dataset.r17StateOwner="R17_PARTIAL_EVENT_STATE";
  root.style.cssText="position:fixed;inset:0;z-index:2147483100;background:#080c12;";
  const host=doc.createElement("div");
  host.style.cssText="position:absolute;inset:0;";
  const close=doc.createElement("button");
  close.type="button";
  close.textContent="×";
  close.setAttribute("aria-label","Close Mass reader");
  close.style.cssText="position:absolute;z-index:4;top:8px;right:8px;width:38px;height:38px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#0d141c;color:#ddd;font-size:20px;";
  root.append(host);

  if(ready.goodFridayController){
    const controller=ready.goodFridayController;
    let reader=null;

    function goodFridayMoment(){
      const state=controller.project();
      const card=state?.card;
      const step=state?.step;
      if(!card||!step)return null;
      return Object.freeze({
        id:step.recordId,
        sectionTitle:"Good Friday",
        cardTitle:card.title,
        cardUpdate:card.cardUpdate!==false,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,
          kind:row.kind,
          primary:row.latin,
          secondary:row.vernacular??row.english??null,
          sourceCueIds:Object.freeze([...(row.sourceIds??[])]),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+" · Good Friday",
        posture:state.posture ? Object.freeze({label:state.posture}) : null,
        gesture:state.action ? Object.freeze({label:state.action}) : null,
        guide:null,
      });
    }

    function showGoodFriday(){
      const moment=goodFridayMoment();
      if(moment)reader.renderMoment(moment);
      return controller.project().card??null;
    }

    function moveGoodFriday(direction){
      const state=controller.project();
      if(direction==="next" && !state.atEnd)controller.next();
      else if(direction==="previous" && !state.atStart)controller.previous();
      return showGoodFriday();
    }

    reader=createReaderDomAdapter({
      root:host,
      iconResolver,
      allowPresentationModeSwitch:false,
      onPrevious:()=>moveGoodFriday("previous"),
      onNext:()=>moveGoodFriday("next"),
    });

    function destroyGoodFriday(){
      reader.destroy?.();
      root.remove?.();
      if(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root===root){
        try{delete globalThis.AO_R17_NATIVE_READER_PREVIEW}catch{}
      }
    }

    close.addEventListener?.("click",()=>{destroyGoodFriday();onClose?.()});
    root.dataset.r17TextOwner="R28_GOOD_FRIDAY_SOURCE_PINNED";
    root.dataset.r17CardOwner="R28_GOOD_FRIDAY_DISTINCT_RITE";
    root.dataset.r17StateOwner="R28_GOOD_FRIDAY_GRAPH";
    doc.body.appendChild(root);
    reader.mount(prepared);
    showGoodFriday();

    const api=Object.freeze({
      root,
      reader,
      model:null,
      ownership:Object.freeze({
        text:"R28_GOOD_FRIDAY_SOURCE_PINNED",
        cards:"R28_GOOD_FRIDAY_DISTINCT_RITE",
        liveState:"R28_GOOD_FRIDAY_GRAPH",
        ordinaryMassGraph:"INACTIVE",
      }),
      getCurrentCard:()=>controller.project().card??null,
      getGoodFridayState:()=>controller.project(),
      next:()=>moveGoodFriday("next"),
      previous:()=>moveGoodFriday("previous"),
      goToGoodFridayRecord:id=>{controller.goToRecord(id);return showGoodFriday();},
      destroy:destroyGoodFriday,
    });
    globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
    return api;
  }

  if(ready.easterVigilController){
    const controller=ready.easterVigilController;
    const model=ready.model;
    let reader=null;
    let inVigil=true;
    let currentMass=null;
    let stage="VIGIL_ACTIVE";

    function easterVigilMoment(){
      const state=controller.project();
      const card=state?.card;
      const step=state?.step;
      if(!card||!step)return null;
      return Object.freeze({
        id:step.recordId,
        sectionTitle:"Easter Vigil",
        cardTitle:card.title,
        cardUpdate:card.cardUpdate!==false,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,
          kind:row.kind,
          primary:row.latin,
          secondary:row.vernacular??row.english??null,
          sourceCueIds:Object.freeze([...(row.sourceIds??[])]),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+" · Easter Vigil",
        posture:state.posture ? Object.freeze({label:state.posture}) : null,
        gesture:state.action ? Object.freeze({label:state.action}) : null,
        guide:null,
      });
    }

    function showEasterVigil(){
      inVigil=true;
      stage="VIGIL_ACTIVE";
      const moment=easterVigilMoment();
      if(moment)reader.renderMoment(moment);
      root.dataset.r17CardOwner="R33_EASTER_VIGIL_COMPOSITE";
      root.dataset.r17StateOwner="R33_EASTER_VIGIL_GRAPH";
      return controller.project().card??null;
    }

    function showVigilMass(card){
      if(!card)return null;
      inVigil=false;
      stage="MASS_ACTIVE";
      currentMass=card;
      reader.renderMoment({
        id:card.sectionId,
        sectionTitle:card.title,
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:card.paragraphs,
        progress:String(card.sequence)+" / "+String(model.totalCards)+" · Easter Vigil Mass",
        guide:null,
      });
      root.dataset.r17CardOwner="R33_EASTER_VIGIL_MASS_PROJECTION";
      root.dataset.r17StateOwner="R33_EASTER_VIGIL_MASS";
      return card;
    }

    function moveEasterVigil(direction){
      if(inVigil){
        const state=controller.project();
        if(direction==="next"){
          if(state.atEnd && state.handoffToMass){
            return showVigilMass(model.cardBySequence(1));
          }
          if(!state.atEnd)controller.next();
        }else if(direction==="previous" && !state.atStart){
          controller.previous();
        }
        return showEasterVigil();
      }
      if(direction==="previous" && currentMass?.sectionId===model.cardBySequence(1)?.sectionId){
        controller.goToRecord("EV-MASS-700");
        return showEasterVigil();
      }
      const nextCard=direction==="previous"
        ? model.previousCard(currentMass?.sectionId)
        : model.nextCard(currentMass?.sectionId);
      if(nextCard)return showVigilMass(nextCard);
      if(direction==="next"){
        stage="DEPARTURE";
        return null;
      }
      return currentMass;
    }

    reader=createReaderDomAdapter({
      root:host,
      iconResolver,
      allowPresentationModeSwitch:false,
      onPrevious:()=>moveEasterVigil("previous"),
      onNext:()=>moveEasterVigil("next"),
    });

    function destroyEasterVigil(){
      reader.destroy?.();
      root.remove?.();
      if(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root===root){
        try{delete globalThis.AO_R17_NATIVE_READER_PREVIEW}catch{}
      }
    }

    close.addEventListener?.("click",()=>{destroyEasterVigil();onClose?.()});
    root.dataset.r17TextOwner="R33_EASTER_VIGIL_SOURCE_PINNED";
    root.dataset.r17CardOwner="R33_EASTER_VIGIL_COMPOSITE";
    root.dataset.r17StateOwner="R33_EASTER_VIGIL_GRAPH";
    doc.body.appendChild(root);
    reader.mount(prepared);
    showEasterVigil();

    const api=Object.freeze({
      root,
      reader,
      model,
      ownership:Object.freeze({
        text:"R33_EASTER_VIGIL_SOURCE_PINNED",
        cards:"R33_EASTER_VIGIL_COMPOSITE",
        liveState:"R33_EASTER_VIGIL_GRAPH",
        ordinaryMassGraph:"VIGIL_PROJECTED_ONLY",
      }),
      getCurrentCard:()=>inVigil ? controller.project().card??null : currentMass,
      getEasterVigilState:()=>controller.project(),
      getCompositeStage:()=>stage,
      next:()=>moveEasterVigil("next"),
      previous:()=>moveEasterVigil("previous"),
      goToEasterVigilRecord:id=>{controller.goToRecord(id);return showEasterVigil();},
      showVigilMassSequence:sequence=>showVigilMass(model.cardBySequence(sequence)),
      destroy:destroyEasterVigil,
    });
    globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
    return api;
  }

  let sourceModel=ready.model;
  let readerModel=ready.presentationModel??ready.model;
  let current=readerModel.cardBySequence(1);
  let reader=null;
  let inAsperges=Boolean(ready.aspergesController);
  let inPalm=Boolean(ready.palmController);
  let inAsh=Boolean(ready.ashController);
  let inCandlemas=Boolean(ready.candlemasController);
  let inRogations=Boolean(ready.rogationsController);
  let inRequiemAbsolution=false;
  let inCorpusChristi=false;
  let inHolyThursdayPost=false;
  let inGenericProcession=false;
  let inLifecycle=false;
  let observer=null;
  let cueTracker=null;
  let activeCueId=null;
  let scheduled=false;
  let initialCardRender=true;
  let partCinematic=null;
  let eventCinematic=null;
  let partCinemaTimer=null;
  let eventCinemaTimer=null;
  let lastEventCinemaCue=null;
  const transientGuard=createCardTransitionTransientGuard();
  const win=doc.defaultView ?? globalThis;

  function clearScheduledTimer(timer){
    if(timer==null)return;
    const clear=win?.clearTimeout ?? globalThis.clearTimeout;
    if(typeof clear==="function")clear.call(win,timer);
  }
  function later(fn,ms){
    const set=win?.setTimeout ?? globalThis.setTimeout;
    return typeof set==="function" ? set.call(win,fn,ms) : null;
  }
  function armPartCinematic(next){
    clearScheduledTimer(partCinemaTimer);
    partCinemaTimer=null;
    partCinematic=next??null;
    if(partCinematic)partCinemaTimer=later(()=>{partCinematic=null;partCinemaTimer=null;queue();},partCinematic.durationMs??920);
  }
  function clearEventCinematic({resetCue=false}={}){
    clearScheduledTimer(eventCinemaTimer);
    eventCinemaTimer=null;
    eventCinematic=null;
    if(resetCue)lastEventCinemaCue=null;
  }
  function armEventCinematic(next,cueId){
    if(!next){clearEventCinematic({resetCue:true});return;}
    if(lastEventCinemaCue===cueId)return;
    clearEventCinematic();
    lastEventCinemaCue=cueId;
    eventCinematic=next;
    eventCinemaTimer=later(()=>{eventCinematic=null;eventCinemaTimer=null;queue();},next.durationMs??1350);
  }

  function projectedState(){
    const legacy=typeof readLegacyActive==="function"
      ? legacyReaderStateSnapshot(doc,{postureOnly:ready.cueState.supported})
      : Object.freeze({priestPosition:null,posture:null,gesture:null,response:null,priestVoice:null});
    let eventState=null;
    let eventAllowed=true;
    if(typeof readLegacyActive==="function"){
      try{
        const eventId=extractCanonicalEventId(readLegacyActive());
        if(eventId){
          eventAllowed=!ready.objectiveRuntime.supported || ready.objectiveRuntime.allows(eventId);
          if(eventAllowed)eventState=ready.eventState.project(eventId);
        }
      }catch{}
    }

    const cueProjection=activeCueId && eventAllowed ? ready.cueState.project(activeCueId) : null;
    const gestureProfile=prepared?.readerPreferences?.gestureProfile ?? "GUIDED_1962";
    const owned=resolveCueOwnedChannels({
      cueControllerSupported:ready.cueState.supported,
      cueProjection,
      eventState,
      legacy,
      cueId:activeCueId,
      gestureProfile,
    });
    const cueNative=owned.cueNative;
    const transientProjection=activeCueId ? ready.transientState.project(activeCueId) : ready.transientState.project(null);
    const transient=transientGuard.filter({
      gesture:owned.gesture,
      response:owned.response,
      bell:transientProjection.bell,
      cinematic:eventCinematic,
    });
    const gesture=transient.gesture;
    const response=transient.response;
    const bell=transient.bell;
    const cinematic=partCinematic ?? transient.cinematic;
    const {priestVoice,priestPosition}=owned;

    // Posture ownership is profile-aware. FOLLOW_CONGREGATION remains an
    // observed rollback channel; sourced/local profiles never silently inherit it.
    const postureResolved=resolveReaderPostureChannel({
      preferences:prepared.readerPreferences,
      cueProjection:cueNative ? cueProjection : null,
      legacyPosture:eventAllowed ? legacy.posture : null,
      cueId:activeCueId,
      // Preserve pre-V5 local posture keys. The 48-step layer owns display IDs
      // only; saved section overrides continue to target the source AO.CARD.* id.
      sectionId:current?.sourceSectionId??current?.sectionId??null,
      macroId:current?.macroId??null,
    });
    const posture=postureResolved.posture;

    const scholaProjection=ready.scholaState.project();
    const ownership=Object.freeze({
      ...owned.ownership,
      gesture:transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : owned.ownership.gesture,
      response:transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : owned.ownership.response,
      bell:transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : transientProjection.ownership.bell,
      cinematic:partCinematic
        ? partCinematic.owner
        : transientGuard.pending
          ? "V1_83_CARD_TRANSITION_CLEARED"
          : eventCinematic
            ? transientProjection.ownership.cinematic
            : transientProjection.cinematic
              ? "R17_CUE_CINEMATIC_CONSUMED"
              : transientProjection.ownership.cinematic,
      posture:postureResolved.owner,
      schola:scholaProjection.ownership,
      priestAction:cueProjection?.ownership?.priestAction??"R18_CUE_WAITING_FAIL_CLOSED",
      sacredMinister:cueProjection?.ownership?.sacredMinister??"R18_CUE_WAITING_FAIL_CLOSED",
    });

    const iconKeys=iconKeysForReaderState({
      priestPosition,posture,gesture,response,priestVoice,schola:scholaProjection.schola
    });
    return Object.freeze({
      priestPosition,
      posture,
      gesture,
      response,
      bell,
      cinematic,
      priestVoice,
      schola:scholaProjection.schola,
      priestAction:cueProjection?.priestAction??null,
      sacredMinister:cueProjection?.sacredMinister??null,
      sacredMinisterAdvisory:cueProjection?.sacredMinisterAdvisory??null,
      sharedTextWithSchola:Boolean(scholaProjection.schola?.cueId && scholaProjection.schola.cueId===activeCueId),
      ...iconKeys,
      nativeEventId:eventState?.canonicalEventId??null,
      nativeCueId:activeCueId,
      cueProjectionSupported:cueNative,
      cueProjectionReason:cueProjection?.reason??null,
      ownership,
    });
  }
  function guideForCurrent(card=current){
    return card ? guideForSequence(ready.guide.registry,card.guideSequence??card.sourceSequence??card.sequence) : null;
  }

  function aspergesMoment(){
    const state=ready.aspergesController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return Object.freeze({
      state,
      moment:Object.freeze({
        id:card.id,
        sectionTitle:"Asperges",
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,
          kind:row.kind,
          primary:row.latin,
          sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+" · Asperges",
        posture:card.posture && card.posture!=="INHERIT" ? {label:card.posture} : null,
        gesture:state.faithfulGesture ? {label:state.faithfulGesture} : null,
        response:null,
        bell:null,
        cinematic:null,
        priestPosition:null,
        priestVoice:null,
        schola:null,
        guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
      }),
    });
  }

  function showAsperges(){
    const projected=aspergesMoment();
    if(!projected)return null;
    inAsperges=true;
    activeCueId=null;
    clearEventCinematic({resetCue:true});
    transientGuard.begin();
    reader.renderMoment(projected.moment);
    root.dataset.r17NativeEvent="asperges";
    root.dataset.r17NativeCue="unresolved";
    root.dataset.r17StateOwner="R20_ASPERGES_NATIVE";
    root.dataset.r17OwnerGesture=projected.state.faithfulGesture ? "R20_ASPERGES_PERSONAL_STATE" : "R20_ASPERGES_EXACT_NONE";
    root.dataset.r17OwnerResponse="R20_ASPERGES_PAYLOAD";
    root.dataset.r17OwnerPriestVoice="R20_ASPERGES_NOT_APPLICABLE";
    root.dataset.r17OwnerPriestPosition="R20_ASPERGES_NOT_APPLICABLE";
    root.dataset.r17OwnerPosture="R20_ASPERGES_PAYLOAD";
    root.dataset.r17OwnerSchola="R20_ASPERGES_PAYLOAD";
    root.dataset.r17OwnerBell="R20_ASPERGES_EXACT_NONE";
    root.dataset.r17OwnerCinematic="R20_ASPERGES_EXACT_NONE";
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({
      specialRite:"ASPERGES",
      cardId:projected.state.card?.id??null,
      posture:projected.moment.posture,
      gesture:projected.moment.gesture,
      handoff:projected.state.handoff??null,
      formulaState:projected.state.formulaState,
    });
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll)scroll.scrollTop=0;
    return projected.state;
  }


  function introitOnlyCard(){
    const card=readerModel.cardBySequence(1);
    if(!card)return null;
    const block=card.blocks?.find?.(value=>value.blockId==="AO.SM.B014");
    if(!block || block.firstParagraphIndex==null || !block.paragraphCount){
      throw new Error("Native prelude Introit handoff cannot resolve AO.SM.B014");
    }
    const paragraphs=card.paragraphs.slice(block.firstParagraphIndex,block.firstParagraphIndex+block.paragraphCount);
    return Object.freeze({...card,title:"Introit",paragraphs:Object.freeze(paragraphs),precedingRiteIntroitOnly:true});
  }

  function recipientPreludeMoment(kind,controller){
    const state=controller?.project?.();
    const card=state?.card;
    if(!card)return null;
    return Object.freeze({
      state,
      moment:Object.freeze({
        id:card.id,
        sectionTitle:kind==="PALM"?"Palm Sunday":"Ash Wednesday",
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,kind:row.kind,primary:row.latin,
          sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+" · "+(kind==="PALM"?"Palm Rite":"Ash Rite"),
        posture:state.recipientPosture
          ? {label:state.recipientPosture}
          : card.posture && !["LOCAL","ORDINARY_PROFILE","INHERIT"].includes(card.posture)
            ? {label:card.posture}
            : null,
        gesture:card.gesture ? {label:card.gesture} : null,
        response:null,bell:null,cinematic:null,priestPosition:null,priestVoice:null,schola:null,
        guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
      }),
    });
  }

  function showRecipientPrelude(kind,controller){
    const projected=recipientPreludeMoment(kind,controller);
    if(!projected)return null;
    inPalm=kind==="PALM";
    inAsh=kind==="ASH";
    inAsperges=false;
    activeCueId=null;
    clearEventCinematic({resetCue:true});
    transientGuard.begin();
    reader.renderMoment(projected.moment);
    root.dataset.r17NativeEvent=kind.toLowerCase();
    root.dataset.r17NativeCue="unresolved";
    root.dataset.r17StateOwner="R23_"+kind+"_NATIVE";
    root.dataset.r17OwnerGesture=projected.moment.gesture ? "R23_"+kind+"_PAYLOAD" : "R23_"+kind+"_EXACT_NONE";
    root.dataset.r17OwnerResponse="R23_"+kind+"_PAYLOAD";
    root.dataset.r17OwnerPriestVoice="R23_"+kind+"_NOT_APPLICABLE";
    root.dataset.r17OwnerPriestPosition="R23_"+kind+"_NOT_APPLICABLE";
    root.dataset.r17OwnerPosture="R23_"+kind+"_PERSONAL_OR_PAYLOAD";
    root.dataset.r17OwnerSchola="R23_"+kind+"_PAYLOAD";
    root.dataset.r17OwnerBell="R23_"+kind+"_EXACT_NONE";
    root.dataset.r17OwnerCinematic="R23_"+kind+"_EXACT_NONE";
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({
      specialRite:kind,
      cardId:projected.state.card?.id??null,
      posture:projected.moment.posture,
      gesture:projected.moment.gesture,
      handoff:projected.state.handoff??null,
      recipientState:projected.state.recipientState??null,
    });
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll)scroll.scrollTop=0;
    return projected.state;
  }

  function showPalm(){return showRecipientPrelude("PALM",ready.palmController)}
  function showAsh(){return showRecipientPrelude("ASH",ready.ashController)}

  function candlemasMoment(){
    const state=ready.candlemasController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return Object.freeze({
      state,
      moment:Object.freeze({
        id:card.id,
        sectionTitle:"Candlemas",
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,kind:row.kind,primary:row.latin,
          sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+" · Candlemas",
        posture:state.recipientPosture
          ? {label:state.recipientPosture}
          : card.posture && !["LOCAL","ORDINARY_PROFILE","INHERIT"].includes(card.posture)
            ? {label:card.posture}
            : null,
        gesture:null,response:null,bell:null,cinematic:null,priestPosition:null,priestVoice:null,schola:null,
        guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
      }),
    });
  }

  function showCandlemas(){
    const projected=candlemasMoment();
    if(!projected)return null;
    inCandlemas=true;inRogations=false;inPalm=false;inAsh=false;inAsperges=false;
    activeCueId=null;
    clearEventCinematic({resetCue:true});
    transientGuard.begin();
    reader.renderMoment(projected.moment);
    root.dataset.r17NativeEvent="candlemas";
    root.dataset.r17NativeCue="unresolved";
    root.dataset.r17StateOwner="R24_CANDLEMAS_NATIVE";
    root.dataset.r17OwnerGesture="R24_CANDLEMAS_EXACT_NONE";
    root.dataset.r17OwnerResponse="R24_CANDLEMAS_PAYLOAD";
    root.dataset.r17OwnerPriestVoice="R24_CANDLEMAS_NOT_APPLICABLE";
    root.dataset.r17OwnerPriestPosition="R24_CANDLEMAS_NOT_APPLICABLE";
    root.dataset.r17OwnerPosture="R24_CANDLEMAS_PERSONAL_OR_PAYLOAD";
    root.dataset.r17OwnerSchola="R24_CANDLEMAS_PAYLOAD";
    root.dataset.r17OwnerBell="R24_CANDLEMAS_EXACT_NONE";
    root.dataset.r17OwnerCinematic="R24_CANDLEMAS_EXACT_NONE";
    root.dataset.r17ObjectState=projected.state.candleState??"none";
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({
      specialRite:"CANDLEMAS",
      cardId:projected.state.card?.id??null,
      posture:projected.moment.posture,
      gesture:null,
      handoff:projected.state.handoff??null,
      recipientState:projected.state.recipientState??null,
      candleState:projected.state.candleState??null,
      hasBlessedCandle:projected.state.hasBlessedCandle??false,
      processionParticipant:projected.state.processionParticipant??false,
    });
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll)scroll.scrollTop=0;
    return projected.state;
  }

  function rogationsMoment(){
    const state=ready.rogationsController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return Object.freeze({
      state,
      moment:Object.freeze({
        id:card.id,
        sectionTitle:"Rogations",
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,kind:row.kind,primary:row.latin,
          sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+" · Rogations",
        posture:card.posture && !["LOCAL_OR_STAND","STAND_OR_LOCAL","ORDINARY_PROFILE","INHERIT"].includes(card.posture)
          ? {label:card.posture}
          : null,
        gesture:null,response:null,bell:null,cinematic:null,priestPosition:null,priestVoice:null,schola:null,
        guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
      }),
    });
  }

  function showRogations(){
    const projected=rogationsMoment();
    if(!projected)return null;
    inRogations=true;inCandlemas=false;inPalm=false;inAsh=false;inAsperges=false;
    activeCueId=null;
    clearEventCinematic({resetCue:true});
    transientGuard.begin();
    reader.renderMoment(projected.moment);
    root.dataset.r17NativeEvent="rogations";
    root.dataset.r17NativeCue="unresolved";
    root.dataset.r17StateOwner="R25_ROGATIONS_NATIVE";
    root.dataset.r17OwnerGesture="R25_ROGATIONS_EXACT_NONE";
    root.dataset.r17OwnerResponse="R25_ROGATIONS_PAYLOAD";
    root.dataset.r17OwnerPriestVoice="R25_ROGATIONS_NOT_APPLICABLE";
    root.dataset.r17OwnerPriestPosition="R25_ROGATIONS_NOT_APPLICABLE";
    root.dataset.r17OwnerPosture="R25_ROGATIONS_PAYLOAD";
    root.dataset.r17OwnerSchola="R25_ROGATIONS_PAYLOAD";
    root.dataset.r17OwnerBell="R25_ROGATIONS_EXACT_NONE";
    root.dataset.r17OwnerCinematic="R25_ROGATIONS_EXACT_NONE";
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({
      specialRite:"ROGATIONS",
      cardId:projected.state.card?.id??null,
      posture:projected.moment.posture,
      gesture:null,
      handoff:projected.state.handoff??null,
      processionActive:projected.state.processionActive??false,
    });
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll)scroll.scrollTop=0;
    return projected.state;
  }


  function followingActionMoment(kind,controller){
    const state=controller?.project?.();
    const card=state?.card;
    if(!card)return null;
    const config={
      REQUIEM_ABSOLUTION:{title:"Requiem Absolution",label:"Absolution",owner:"R26_REQUIEM_ABSOLUTION_NATIVE"},
      CORPUS_CHRISTI_PROCESSION:{title:"Corpus Christi Procession",label:"Corpus Christi",owner:"R27_CORPUS_CHRISTI_NATIVE"},
      HOLY_THURSDAY_POST:{title:"Holy Thursday",label:"Holy Thursday",owner:"R31_HOLY_THURSDAY_NATIVE"},
      GENERIC_PROCESSION:{title:"Procession",label:"Procession",owner:"R29_GENERIC_PROCESSION_NATIVE"},
    }[kind];
    if(!config)throw new Error("Unknown following-action reader "+kind);
    const rows=kind==="GENERIC_PROCESSION" ? [] : (card.paragraphs??[]).map(row=>Object.freeze({
      id:row.id,kind:row.kind,primary:row.latin,
      sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
    }));
    let posture=null;
    if(kind==="REQUIEM_ABSOLUTION" && card.posture && card.posture!=="LOCAL_OR_INHERIT")posture={label:card.posture};
    if(kind==="CORPUS_CHRISTI_PROCESSION" && state.posture && !["INHERIT","LOCAL_OR_INHERIT","LOCAL_REVERENT"].includes(state.posture))posture={label:state.posture};
    if(kind==="HOLY_THURSDAY_POST" && state.posture && state.posture!=="LOCAL_OR_INHERIT")posture={label:state.posture};
    if(kind==="GENERIC_PROCESSION" && state.posture && state.posture!=="LOCAL")posture={label:state.posture};
    return Object.freeze({
      state,config,
      moment:Object.freeze({
        id:card.id??card.recordId,
        sectionTitle:config.title,
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:Object.freeze(rows),
        progress:String(state.index+1)+" / "+String(state.total)+" · "+config.label,
        posture,gesture:null,response:null,bell:null,cinematic:null,priestPosition:null,priestVoice:null,schola:null,
        guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
      }),
    });
  }

  function showFollowingAction(kind,controller){
    const projected=followingActionMoment(kind,controller);
    if(!projected)return null;
    inRequiemAbsolution=kind==="REQUIEM_ABSOLUTION";
    inCorpusChristi=kind==="CORPUS_CHRISTI_PROCESSION";
    inHolyThursdayPost=kind==="HOLY_THURSDAY_POST";
    inGenericProcession=kind==="GENERIC_PROCESSION";
    inLifecycle=false;
    inAsperges=false;inPalm=false;inAsh=false;inCandlemas=false;inRogations=false;
    activeCueId=null;
    clearEventCinematic({resetCue:true});
    transientGuard.begin();
    reader.renderMoment(projected.moment);
    root.dataset.r17NativeEvent=kind.toLowerCase();
    root.dataset.r17NativeCue="unresolved";
    root.dataset.r17StateOwner=projected.config.owner;
    root.dataset.r17OwnerGesture=projected.config.owner+"_EXACT_NONE";
    root.dataset.r17OwnerResponse=projected.config.owner+"_PAYLOAD";
    root.dataset.r17OwnerPriestVoice=projected.config.owner+"_NOT_APPLICABLE";
    root.dataset.r17OwnerPriestPosition=projected.config.owner+"_NOT_APPLICABLE";
    root.dataset.r17OwnerPosture=projected.config.owner+"_PAYLOAD";
    root.dataset.r17OwnerSchola=projected.config.owner+"_PAYLOAD";
    root.dataset.r17OwnerBell=projected.config.owner+"_EXACT_NONE";
    root.dataset.r17OwnerCinematic=projected.config.owner+"_EXACT_NONE";
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({
      specialRite:kind,
      cardId:projected.state.card?.id??projected.state.card?.recordId??null,
      posture:projected.moment.posture,
      handoff:projected.state.handoff??null,
      objectState:projected.state.objectState??null,
      joiningState:projected.state.joiningState??null,
      processionActive:projected.state.processionActive??null,
    });
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll)scroll.scrollTop=0;
    return projected.state;
  }

  function showRequiemAbsolution(){return showFollowingAction("REQUIEM_ABSOLUTION",ready.requiemAbsolutionController)}
  function showCorpusChristi(){return showFollowingAction("CORPUS_CHRISTI_PROCESSION",ready.corpusChristiController)}
  function showHolyThursdayPost(){return showFollowingAction("HOLY_THURSDAY_POST",ready.holyThursdayPostController)}
  function showGenericProcession(){return showFollowingAction("GENERIC_PROCESSION",ready.genericProcessionController)}

  function lifecycleState(state){
    inLifecycle=true;
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({lifecycle:state,specialRite:null});
    root.dataset.r17StateOwner="R17_FORM_LIFECYCLE";
    return state;
  }

  function enterLifecycleBoundary(){
    const state=ready.lifecycleRuntime.enterMassBoundary();
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && ready.requiemAbsolutionController)return showRequiemAbsolution();
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && ready.corpusChristiController)return showCorpusChristi();
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && ready.holyThursdayPostController)return showHolyThursdayPost();
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && ready.genericProcessionController)return showGenericProcession();
    return lifecycleState(state);
  }

  function completeFollowingAction(){
    return lifecycleState(ready.lifecycleRuntime.completeFollowingAction());
  }

  function previousReaderCard(){
    if(inGenericProcession && ready.genericProcessionController){
      const state=ready.genericProcessionController.project();
      if(!state.atStart)ready.genericProcessionController.previous();
      return showGenericProcession();
    }
    if(inHolyThursdayPost && ready.holyThursdayPostController){
      const state=ready.holyThursdayPostController.project();
      if(!state.atStart)ready.holyThursdayPostController.previous();
      return showHolyThursdayPost();
    }
    if(inCorpusChristi && ready.corpusChristiController){
      const state=ready.corpusChristiController.project();
      if(!state.atStart)ready.corpusChristiController.previous();
      return showCorpusChristi();
    }
    if(inRequiemAbsolution && ready.requiemAbsolutionController){
      const state=ready.requiemAbsolutionController.project();
      if(!state.atStart)ready.requiemAbsolutionController.previous();
      return showRequiemAbsolution();
    }
    if(inLifecycle)return ready.lifecycleRuntime.snapshot();
    if(inRogations && ready.rogationsController){
      const state=ready.rogationsController.project();
      if(!state.atStart)ready.rogationsController.previous();
      return showRogations();
    }
    if(inCandlemas && ready.candlemasController){
      const state=ready.candlemasController.project();
      if(!state.atStart)ready.candlemasController.previous();
      return showCandlemas();
    }
    if(inPalm && ready.palmController){
      const state=ready.palmController.project();
      if(!state.atStart)ready.palmController.previous();
      return showPalm();
    }
    if(inAsh && ready.ashController){
      const state=ready.ashController.project();
      if(!state.atStart)ready.ashController.previous();
      return showAsh();
    }
    if(inAsperges && ready.aspergesController){
      const state=ready.aspergesController.project();
      if(!state.atStart)ready.aspergesController.previous();
      return showAsperges();
    }
    const first=readerModel.cardBySequence(1);
    if(ready.rogationsController && current?.sectionId===first?.sectionId){
      ready.rogationsController.goTo("ROG-R06");
      return showRogations();
    }
    if(ready.candlemasController && current?.sectionId===first?.sectionId){
      ready.candlemasController.goTo("CND-R07");
      return showCandlemas();
    }
    if(ready.palmController && current?.sectionId===first?.sectionId){
      ready.palmController.goTo("PALM-R07");
      return showPalm();
    }
    if(ready.ashController && current?.sectionId===first?.sectionId){
      ready.ashController.goTo("ASH-R05");
      return showAsh();
    }
    if(ready.aspergesController && current?.sectionId===first?.sectionId){
      ready.aspergesController.goTo("ASP-R05");
      return showAsperges();
    }
    return showCard(nextVisibleCard(current,"previous"));
  }

  function nextReaderCard(){
    if(inGenericProcession && ready.genericProcessionController){
      const state=ready.genericProcessionController.project();
      if(state.atEnd){inGenericProcession=false;return completeFollowingAction();}
      ready.genericProcessionController.next();
      return showGenericProcession();
    }
    if(inHolyThursdayPost && ready.holyThursdayPostController){
      const state=ready.holyThursdayPostController.project();
      if(state.atEnd){inHolyThursdayPost=false;return completeFollowingAction();}
      ready.holyThursdayPostController.next();
      return showHolyThursdayPost();
    }
    if(inCorpusChristi && ready.corpusChristiController){
      const state=ready.corpusChristiController.project();
      if(state.atEnd){inCorpusChristi=false;return completeFollowingAction();}
      ready.corpusChristiController.next();
      return showCorpusChristi();
    }
    if(inRequiemAbsolution && ready.requiemAbsolutionController){
      const state=ready.requiemAbsolutionController.project();
      if(state.atEnd){inRequiemAbsolution=false;return completeFollowingAction();}
      ready.requiemAbsolutionController.next();
      return showRequiemAbsolution();
    }
    if(inLifecycle)return lifecycleState(ready.lifecycleRuntime.advance());
    if(inRogations && ready.rogationsController){
      const state=ready.rogationsController.project();
      if(state.atEnd){
        inRogations=false;
        return showCard(introitOnlyCard());
      }
      ready.rogationsController.next();
      return showRogations();
    }
    if(inCandlemas && ready.candlemasController){
      const state=ready.candlemasController.project();
      if(state.atEnd){
        inCandlemas=false;
        return showCard(introitOnlyCard());
      }
      ready.candlemasController.next();
      return showCandlemas();
    }
    if(inPalm && ready.palmController){
      const state=ready.palmController.project();
      if(state.atEnd){
        inPalm=false;
        return showCard(introitOnlyCard());
      }
      ready.palmController.next();
      return showPalm();
    }
    if(inAsh && ready.ashController){
      const state=ready.ashController.project();
      if(state.atEnd){
        inAsh=false;
        return showCard(introitOnlyCard());
      }
      ready.ashController.next();
      return showAsh();
    }
    if(inAsperges && ready.aspergesController){
      const state=ready.aspergesController.project();
      if(state.atEnd){
        inAsperges=false;
        return showCard(readerModel.cardBySequence(1));
      }
      ready.aspergesController.next();
      return showAsperges();
    }
    const card=nextVisibleCard(current,"next");
    if(!card)return enterLifecycleBoundary();
    return showCard(card);
  }

  function planAwareCard(card){
    if(!card)return null;
    const plan=prepared?.session?.plan;
    if(plan?.blessingAllowed!==false)return card;
    const blessing=card.blocks?.find?.(value=>value.blockId==="AO.SM.B092");
    if(!blessing || blessing.firstParagraphIndex==null || !blessing.paragraphCount)return card;
    const start=blessing.firstParagraphIndex;
    const end=start+blessing.paragraphCount;
    const paragraphs=card.paragraphs.filter((_,index)=>index<start||index>=end);
    if(!paragraphs.length && !card.stateOnly)return null;
    return Object.freeze({...card,title:"Placeat tibi, sancta Trinitas",paragraphs:Object.freeze(paragraphs),planFilteredBlocks:Object.freeze(["AO.SM.B092"])});
  }

  function isLastGospelCard(card){
    if(!card)return false;
    if(Number(card.sourceSequence)===30)return true;
    const sourceId=String(card.sourceSectionId??card.sectionId??"");
    return sourceId==="AO.CARD.030";
  }

  function visibleCardAllowed(card){
    if(!card)return false;
    if(prepared?.session?.plan?.normalLastGospel===false && isLastGospelCard(card))return false;
    return Boolean(planAwareCard(card));
  }

  function nextVisibleCard(from,direction){
    let probe=from;
    while(probe){
      const candidate=direction==="previous"
        ? readerModel.previousCard(probe.sectionId)
        : readerModel.nextCard(probe.sectionId);
      if(!candidate)return null;
      if(visibleCardAllowed(candidate))return candidate;
      probe=candidate;
    }
    return null;
  }

  function showCard(card){
    if(!card) return null;
    inAsperges=false;
    inPalm=false;
    inAsh=false;
    inCandlemas=false;
    inRogations=false;
    inRequiemAbsolution=false;
    inCorpusChristi=false;
    inHolyThursdayPost=false;
    inGenericProcession=false;
    inLifecycle=false;
    root.dataset.r17ObjectState="none";
    root.dataset.r17StateOwner="R17_PARTIAL_EVENT_STATE";
    const visibleCard=planAwareCard(card);
    if(!visibleCard)return null;
    const previous=current;
    const changed=Boolean(previous?.sectionId && previous.sectionId!==card.sectionId);
    const partCinema=partTransitionCinematic(initialCardRender ? null : previous,card,{initial:initialCardRender});
    initialCardRender=false;
    armPartCinematic(partCinema);
    if(changed){
      activeCueId=null;
      clearEventCinematic({resetCue:true});
      transientGuard.begin();
      root.dataset.r17NativeCue="unresolved";
    }
    current=card;
    ready.scholaState.activateForCard(card.sourceSequence??card.guideSequence??card.sequence);
    const state=projectedState();
    reader.renderMoment({
      id:visibleCard.sectionId,
      sectionTitle:visibleCard.title,
      cardTitle:visibleCard.title,
      cardUpdate:true,
      paragraphs:visibleCard.paragraphs,
      progress:visibleCard.sequence+" / "+readerModel.totalCards,
      guide:guideForCurrent(visibleCard),
      ...state,
    });
    root.dataset.r17NativeEvent=state.nativeEventId??"unresolved";
    root.dataset.r17NativeCue=state.nativeCueId??"unresolved";
    root.dataset.r17OwnerGesture=state.ownership?.gesture??"UNRESOLVED";
    root.dataset.r17OwnerResponse=state.ownership?.response??"UNRESOLVED";
    root.dataset.r17OwnerPriestVoice=state.ownership?.priestVoice??"UNRESOLVED";
    root.dataset.r17OwnerPriestPosition=state.ownership?.priestPosition??"UNRESOLVED";
    root.dataset.r17OwnerPosture=state.ownership?.posture??"UNRESOLVED";
    root.dataset.r17OwnerSchola=state.ownership?.schola??"UNRESOLVED";
    root.dataset.r17OwnerPriestAction=state.ownership?.priestAction??"UNRESOLVED";
    root.dataset.r17OwnerSacredMinister=state.ownership?.sacredMinister??"UNRESOLVED";
    root.dataset.r17OwnerBell=state.ownership?.bell??"UNRESOLVED";
    root.dataset.r17OwnerCinematic=state.ownership?.cinematic??"UNRESOLVED";
    globalThis.AO_R17_NATIVE_READER_STATE=state;
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll){
      scroll.scrollTop=0;
      cueTracker?.refresh?.();
    }
    return visibleCard;
  }

  function sectionItems(){
    return readerModel.cards
      .filter(visibleCardAllowed)
      .map(card=>Object.freeze({id:card.sectionId,label:card.title}));
  }

  function focusCueAtReaderLine(cueId){
    if(!cueId)return false;
    const scroll=host.querySelector?.(".ao-prayer-card");
    const target=scroll?.querySelector?.('[data-cue-id="'+String(cueId)+'"]');
    if(!scroll||!target)return false;
    const cr=scroll.getBoundingClientRect?.();
    const tr=target.getBoundingClientRect?.();
    if(!cr||!tr)return false;
    const absoluteCenter=(tr.top-cr.top+scroll.scrollTop)+(tr.height/2);
    scroll.scrollTop=Math.max(0,absoluteCenter-scroll.clientHeight*.39);
    cueTracker?.refresh?.();
    return true;
  }

  function switchPresentationMode(nextMode){
    const anchor=captureReaderModeAnchor(current,{activeCueId});
    const desiredCue=anchor.cueId;
    const rebuilt=buildReaderModeModels({
      prepared:ready.prepared,
      data:ready.data,
      mode:nextMode,
    });
    sourceModel=rebuilt.sourceModel;
    readerModel=rebuilt.presentationModel;

    const anchored=findReaderModeAnchorCard(readerModel,anchor)??readerModel.cardBySequence(1);
    if(!anchored)throw new Error("MODE_SWITCH_ANCHOR_UNAVAILABLE");

    current=anchored;
    reader?.setSections?.(sectionItems());

    clearEventCinematic({resetCue:true});
    armPartCinematic(null);
    transientGuard.begin();

    const cueStillPresent=Boolean(desiredCue && (current.paragraphs??[]).some(paragraph=>
      (paragraph?.sourceCueIds??[]).some(id=>String(id)===String(desiredCue))
    ));
    activeCueId=cueStillPresent ? desiredCue : null;
    if(activeCueId)transientGuard.resolveCue(activeCueId);
    ready.scholaState.activateForCard(current.sourceSequence??current.guideSequence??current.sequence);

    root.dataset.r17PresentationMode=rebuilt.mode;
    root.dataset.r17SourceModelCards=String(sourceModel.totalCards);
    root.dataset.r17PresentationModelCards=String(readerModel.totalCards);

    if(!(inAsperges || inPalm || inAsh || inCandlemas || inRogations || inRequiemAbsolution || inCorpusChristi || inHolyThursdayPost || inGenericProcession || inLifecycle)){
      showCard(current);
      if(cueStillPresent)focusCueAtReaderLine(desiredCue);
    }
    return Object.freeze({
      mode:rebuilt.mode,
      card:current,
      sourceModel,
      presentationModel:readerModel,
      anchor,
    });
  }

  reader=createReaderDomAdapter({
    root:host,
    iconResolver,
    allowPresentationModeSwitch:true,
    sections:sectionItems(),
    onPresentationModeChange:(mode)=>switchPresentationMode(mode),
    onSectionSelect:(sectionId)=>{
      const card=readerModel.cards.find(value=>value.sectionId===String(sectionId));
      return showCard(visibleCardAllowed(card)?card:null);
    },
    onPrevious:previousReaderCard,
    onNext:nextReaderCard,
  });

  function syncState(){
    scheduled=false;
    if(inAsperges || inPalm || inAsh || inCandlemas || inRogations || inRequiemAbsolution || inCorpusChristi || inHolyThursdayPost || inGenericProcession || inLifecycle)return;
    const state=projectedState();
    reader.renderMoment({
      id:current?.sectionId ?? "",
      sectionTitle:current?.title ?? "",
      cardUpdate:false,
      progress:current ? current.sequence+" / "+readerModel.totalCards : null,
      guide:guideForCurrent(current),
      ...state,
    });
    root.dataset.r17NativeEvent=state.nativeEventId??"unresolved";
    root.dataset.r17NativeCue=state.nativeCueId??"unresolved";
    root.dataset.r17OwnerGesture=state.ownership?.gesture??"UNRESOLVED";
    root.dataset.r17OwnerResponse=state.ownership?.response??"UNRESOLVED";
    root.dataset.r17OwnerPriestVoice=state.ownership?.priestVoice??"UNRESOLVED";
    root.dataset.r17OwnerPriestPosition=state.ownership?.priestPosition??"UNRESOLVED";
    root.dataset.r17OwnerPosture=state.ownership?.posture??"UNRESOLVED";
    root.dataset.r17OwnerSchola=state.ownership?.schola??"UNRESOLVED";
    root.dataset.r17OwnerPriestAction=state.ownership?.priestAction??"UNRESOLVED";
    root.dataset.r17OwnerSacredMinister=state.ownership?.sacredMinister??"UNRESOLVED";
    root.dataset.r17OwnerBell=state.ownership?.bell??"UNRESOLVED";
    root.dataset.r17OwnerCinematic=state.ownership?.cinematic??"UNRESOLVED";
    globalThis.AO_R17_NATIVE_READER_STATE=state;
  }

  function queue(){
    if(scheduled) return;
    scheduled=true;
    const raf=win?.requestAnimationFrame;
    if(typeof raf==="function") raf.call(win,syncState);
    else setTimeout(syncState,0);
  }

  function destroy(){
    clearScheduledTimer(partCinemaTimer);
    clearScheduledTimer(eventCinemaTimer);
    partCinemaTimer=null;
    eventCinemaTimer=null;
    observer?.disconnect?.();
    observer=null;
    cueTracker?.destroy?.();
    cueTracker=null;
    root.remove?.();
    if(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root===root) {
      try{delete globalThis.AO_R17_NATIVE_READER_PREVIEW}catch{}
    }
  }

  close.addEventListener?.("click",()=>{destroy();onClose?.()});

  // Mount only after the model is complete.
  doc.body.appendChild(root);
  reader.mount(prepared);
  if(inRogations)showRogations();
  else if(inCandlemas)showCandlemas();
  else if(inPalm)showPalm();
  else if(inAsh)showAsh();
  else if(inAsperges)showAsperges();
  else showCard(current);

  const readerScroll=host.querySelector?.(".ao-prayer-card");
  if(readerScroll){
    cueTracker=installCueFocusTracker({
      container:readerScroll,
      win,
      onChange:(cueId)=>{
        if(inAsperges || inPalm || inAsh || inCandlemas || inRogations || inRequiemAbsolution || inCorpusChristi || inHolyThursdayPost || inGenericProcession || inLifecycle)return;
        activeCueId=cueId;
        ready.scholaState.syncCue(cueId);
        transientGuard.resolveCue(cueId);
        const transientProjection=cueId ? ready.transientState.project(cueId) : null;
        armEventCinematic(transientProjection?.cinematic??null,cueId);
        root.dataset.r17NativeCue=cueId??"unresolved";
        queue();
      },
    });
    cueTracker.refresh();
  }

  const MutationObserverImpl=win?.MutationObserver ?? globalThis.MutationObserver;
  if(typeof MutationObserverImpl==="function"){
    observer=new MutationObserverImpl(queue);
    const targets=[
      // FOLLOW_CONGREGATION posture remains the only DOM-observed rollback channel.
      "#postureText"
    ].map(selector=>doc.querySelector?.(selector)).filter(Boolean);
    for(const target of targets){
      observer.observe(target,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","aria-hidden"]});
    }
  }

  const api=Object.freeze({
    root,reader,
    get model(){return readerModel},
    get sourceModel(){return sourceModel},
    ownership:Object.freeze({
      text:"R17_VERIFIED_CORPUS",
      cards:"R17_READER_MODEL",
      liveState:"R17_CUE_STATE_WITH_ROLLBACK_GAPS",
      priestVoice:"R17_CUE_SOURCE_ON_CERTIFIED_MISSA_CANTATA",
      response:"R17_EXACT_CUE_SOURCE_ON_CERTIFIED_MISSA_CANTATA",
      gesture:"R17_EXACT_CUE_PROFILE_SOURCE_ON_CERTIFIED_MISSA_CANTATA",
      posture:"PROFILE_AWARE_R17_SOURCE_OR_LOCAL__FOLLOW_CONGREGATION_OBSERVED",
      priestPosition:"R17_CUE_SOURCE_PERSISTENT_ON_CERTIFIED_MISSA_CANTATA",
      schola:"R17_NATIVE_INDEPENDENT_SCHOLA_CLOCK",
      bell:"R17_RECOVERED_EXACT_CUE_CANONICAL_SOUND_EVENT",
      cinematic:"R17_SINGLE_OWNER_TIMED_TRANSIENT",
      guide:"R17_RECOVERED_V1_79_CONTINUITY_REGISTRY",
      modeSwitch:"PRESENTATION_ONLY_SOURCE_ANCHORED_IN_READER_SWITCH",
      asperges:ready.aspergesController ? "R20_NATIVE_PRELUDE" : "NOT_ACTIVE",
      palm:ready.palmController ? "R22_NATIVE_PRELUDE" : "NOT_ACTIVE",
      ash:ready.ashController ? "R23_NATIVE_PRELUDE" : "NOT_ACTIVE",
      candlemas:ready.candlemasController ? "R24_NATIVE_PRELUDE" : "NOT_ACTIVE",
      rogations:ready.rogationsController ? "R25_NATIVE_PRELUDE" : "NOT_ACTIVE",
      requiemAbsolution:ready.requiemAbsolutionController ? "R26_NATIVE_FOLLOWING_ACTION" : "NOT_ACTIVE",
      corpusChristi:ready.corpusChristiController ? "R27_NATIVE_FOLLOWING_ACTION" : "NOT_ACTIVE",
      holyThursdayPost:ready.holyThursdayPostController ? "R31_NATIVE_FOLLOWING_ACTION" : "NOT_ACTIVE",
      genericProcession:ready.genericProcessionController ? "R29_NATIVE_FOLLOWING_ACTION" : "NOT_ACTIVE",
      lifecycle:"R17_FORM_LIFECYCLE",
    }),
    showSection:(sectionId)=>{
      const card=readerModel.cards.find(value=>value.sectionId===String(sectionId));
      return showCard(visibleCardAllowed(card)?card:null);
    },
    showSequence:sequence=>{
      const card=readerModel.cardBySequence(sequence);
      return showCard(visibleCardAllowed(card)?card:null);
    },
    syncState:queue,
    getPresentationMode:()=>reader.getMode(),
    setPresentationMode:mode=>reader.setMode(mode),
    destroy,
    getCurrentCard:()=>inGenericProcession ? ready.genericProcessionController?.project?.().card??null : inHolyThursdayPost ? ready.holyThursdayPostController?.project?.().card??null : inCorpusChristi ? ready.corpusChristiController?.project?.().card??null : inRequiemAbsolution ? ready.requiemAbsolutionController?.project?.().card??null : inRogations ? ready.rogationsController?.project?.().card??null : inCandlemas ? ready.candlemasController?.project?.().card??null : inPalm ? ready.palmController?.project?.().card??null : inAsh ? ready.ashController?.project?.().card??null : inAsperges ? ready.aspergesController?.project?.().card??null : current,
    getNativeEventState:()=>globalThis.AO_R17_NATIVE_READER_STATE??null,
    getActiveCue:()=>activeCueId,
    getCueState:()=>activeCueId ? ready.cueState.project(activeCueId) : null,
    getScholaState:()=>ready.scholaState.project(),
    getTransientState:()=>activeCueId ? ready.transientState.project(activeCueId) : ready.transientState.project(null),
    nextSchola:()=>{const value=ready.scholaState.next();queue();return value},
    previousSchola:()=>{const value=ready.scholaState.previous();queue();return value},
    finishSchola:()=>{const value=ready.scholaState.finish();queue();return value},
    selectScholaTrack:(trackId)=>{const value=ready.scholaState.selectTrack(trackId);queue();return value},
    getTransientTransitionPending:()=>transientGuard.pending,
    getAspergesState:()=>ready.aspergesController?.project?.()??null,
    getPalmState:()=>ready.palmController?.project?.()??null,
    getAshState:()=>ready.ashController?.project?.()??null,
    getCandlemasState:()=>ready.candlemasController?.project?.()??null,
    getCandlemasMassState:eventId=>ready.candlemasController?.massCandleState?.(eventId)??null,
    getRogationsState:()=>ready.rogationsController?.project?.()??null,
    getRequiemAbsolutionState:()=>ready.requiemAbsolutionController?.project?.()??null,
    getCorpusChristiState:()=>ready.corpusChristiController?.project?.()??null,
    getHolyThursdayPostState:()=>ready.holyThursdayPostController?.project?.()??null,
    getGenericProcessionState:()=>ready.genericProcessionController?.project?.()??null,
    getLifecycleState:()=>ready.lifecycleRuntime?.snapshot?.()??null,
    setPalmRecipientState:value=>{if(!ready.palmController)return null;const result=ready.palmController.setRecipientState(value);return inPalm ? showPalm() : result},
    setAshRecipientState:value=>{if(!ready.ashController)return null;const result=ready.ashController.setRecipientState(value);return inAsh ? showAsh() : result},
    setCandlemasRecipientState:value=>{if(!ready.candlemasController)return null;const result=ready.candlemasController.setRecipientState(value);return inCandlemas ? showCandlemas() : result},
    setCandlemasProcessionParticipant:value=>{if(!ready.candlemasController)return null;const result=ready.candlemasController.setProcessionParticipant(value);return inCandlemas ? showCandlemas() : result},
    setCandlemasHasBlessedCandle:value=>{if(!ready.candlemasController)return null;const result=ready.candlemasController.setHasBlessedCandle(value);return inCandlemas ? showCandlemas() : result},
    setCorpusChristiProcessionParticipant:value=>{if(!ready.corpusChristiController)return null;const result=ready.corpusChristiController.setProcessionParticipant(value);return inCorpusChristi ? showCorpusChristi() : result},
    setCorpusChristiSacramentalState:value=>{if(!ready.corpusChristiController)return null;const result=ready.corpusChristiController.setSacramentalState(value);return inCorpusChristi ? showCorpusChristi() : result},
    setHolyThursdayJoiningState:value=>{if(!ready.holyThursdayPostController)return null;const result=ready.holyThursdayPostController.setJoiningState(value);return inHolyThursdayPost ? showHolyThursdayPost() : result},
    setGenericProcessionParticipant:value=>{if(!ready.genericProcessionController)return null;const result=ready.genericProcessionController.setParticipating(value);return inGenericProcession ? showGenericProcession() : result},
    markActuallySprinkled:()=>{
      if(!ready.aspergesController)return null;
      const value=ready.aspergesController.setActuallySprinkled(true);
      return inAsperges ? showAsperges() : value;
    },
  });
  globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
  return api;
}
