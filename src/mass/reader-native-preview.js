// Native R17 reader preview.
// R17 owns verified prayer-card text and 30-card navigation.
// The legacy reader remains underneath as rollback and temporarily donates live
// state channels until each channel is projected directly from canonical events.

import { createMassReaderModel } from "./reader-model.js";
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
}={}){
  if(!prepared?.session?.resolvedMass) throw new TypeError("Prepared R17 Mass session required");
  const structuralSupport=structureSupport(prepared);
  if(!structuralSupport.supported){
    throw new Error(structuralSupport.reason || "R17 native reader structure is not certified");
  }
  const resolvedForm=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
  const needsFormState=resolvedForm==="LOW" || resolvedForm==="SOLEMN";
  const [data,events,registries,guide,formState]=await Promise.all([
    presentationData ?? Promise.resolve(loadPresentationData(prepared)),
    eventData ?? Promise.resolve(loadEventData(prepared)),
    cueRegistries ?? Promise.resolve(loadCueRegistries(prepared)),
    guideData ?? Promise.resolve(loadGuideData(prepared)),
    needsFormState ? (formStateData ?? Promise.resolve(loadFormStateData(prepared))) : null,
  ]);
  const model=createMassReaderModel({
    resolvedMass:prepared.session.resolvedMass,
    sectionMap:data?.sectionMap,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
  });
  const eventState=createNativeEventStateController(events);
  const cueState=createReaderFormCueStateController({
    formStateData:formState,
    registries,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
    prepared,
  });
  const scholaState=createNativeScholaController({sungCorpus:data?.sungCorpus,properSlots:model.properSlots,prepared});
  const transientState=createReaderTransientController({events,prepared});
  return Object.freeze({prepared,data,model,events,eventState,registries,cueState,guide,scholaState,transientState,formState});
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
  readLegacyActive=null,
  iconResolver=null,
  onClose=null,
}={}){
  if(!doc?.body || !doc?.createElement) throw new TypeError("Document/body required");

  // Validate everything before adding a single preview node.
  const ready=await prepareNativeReaderPreview({
    prepared,presentationData,loadPresentationData,eventData,loadEventData,
    cueRegistries,loadCueRegistries,formStateData,loadFormStateData,guideData,loadGuideData,
  });

  doc.getElementById?.(ROOT_ID)?.remove?.();

  const root=doc.createElement("section");
  root.id=ROOT_ID;
  root.setAttribute("aria-label","R17 native Mass reader preview");
  root.dataset.r17TextOwner="R17_VERIFIED_CORPUS";
  root.dataset.r17CardOwner="R17_READER_MODEL";
  root.dataset.r17StateOwner="R17_PARTIAL_EVENT_STATE";
  root.style.cssText="position:fixed;inset:0;z-index:2147483100;background:#080c12;";
  const host=doc.createElement("div");
  host.style.cssText="position:absolute;inset:0;";
  const close=doc.createElement("button");
  close.type="button";
  close.textContent="×";
  close.setAttribute("aria-label","Close R17 native preview");
  close.style.cssText="position:absolute;z-index:4;top:8px;right:8px;width:38px;height:38px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#0d141c;color:#ddd;font-size:20px;";
  root.append(host,close);

  let current=ready.model.cardBySequence(1);
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
    const legacy=legacyReaderStateSnapshot(doc,{postureOnly:ready.cueState.supported});
    let eventState=null;
    if(typeof readLegacyActive==="function"){
      try{
        const eventId=extractCanonicalEventId(readLegacyActive());
        if(eventId)eventState=ready.eventState.project(eventId);
      }catch{}
    }

    const cueProjection=activeCueId ? ready.cueState.project(activeCueId) : null;
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
      legacyPosture:legacy.posture,
      cueId:activeCueId,
      sectionId:current?.sectionId??null,
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
    return card ? guideForSequence(ready.guide.registry,card.sequence) : null;
  }
  function showCard(card){
    if(!card) return null;
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
    ready.scholaState.activateForCard(card.sequence);
    const state=projectedState();
    reader.renderMoment({
      id:card.sectionId,
      sectionTitle:card.title,
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:card.paragraphs,
      progress:card.sequence+" / "+ready.model.totalCards,
      guide:guideForCurrent(card),
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
    return card;
  }

  const reader=createReaderDomAdapter({
    root:host,
    iconResolver,
    allowPresentationModeSwitch:false,
    onPrevious:()=>showCard(ready.model.previousCard(current.sectionId)),
    onNext:()=>showCard(ready.model.nextCard(current.sectionId)),
  });

  function syncState(){
    scheduled=false;
    const state=projectedState();
    reader.renderMoment({
      id:current?.sectionId ?? "",
      sectionTitle:current?.title ?? "",
      cardUpdate:false,
      progress:current ? current.sequence+" / "+ready.model.totalCards : null,
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
  showCard(current);

  const readerScroll=host.querySelector?.(".ao-prayer-card");
  if(readerScroll){
    cueTracker=installCueFocusTracker({
      container:readerScroll,
      win,
      onChange:(cueId)=>{
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
    root,reader,model:ready.model,
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
      modeSwitch:"LOCKED_UNTIL_V1_83_READER_PARITY",
    }),
    showSection:(sectionId)=>{
      const card=ready.model.cards.find(value=>value.sectionId===String(sectionId));
      return showCard(card);
    },
    showSequence:sequence=>showCard(ready.model.cardBySequence(sequence)),
    syncState:queue,
    destroy,
    getCurrentCard:()=>current,
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
  });
  globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
  return api;
}
