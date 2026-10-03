// Native R17 reader preview.
// R17 owns verified prayer-card text and 30-card navigation.
// The legacy reader remains underneath as rollback and temporarily donates live
// state channels until each channel is projected directly from canonical events.

import { createMassReaderModel } from "./reader-model.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { createReaderDomAdapter } from "./reader-dom.js";
import { loadCanonicalReaderEvents, createNativeEventStateController, extractCanonicalEventId } from "./reader-event-state.js";
import { GLORIA_CREDO_FAITHFUL_GESTURES, isGloriaCredoGestureSourceCue, resolveFaithfulGestureForCue } from "./faithful-gesture-cues.js";
import { loadReaderCueRegistries, createReaderCueStateController } from "./reader-cue-state.js";
import { installCueFocusTracker } from "./reader-cue-focus.js";
import { resolveReaderPostureChannel } from "./reader-posture-profile.js";

const ROOT_ID="ao-r17-native-reader-preview";

function cleanText(value){
  const text=String(value??"").trim();
  return text && text!=="—" ? text : null;
}

function textAt(doc,selector){
  return cleanText(doc?.querySelector?.(selector)?.textContent);
}

export function legacyReaderStateSnapshot(doc){
  const scholaDock=doc?.querySelector?.("#scholaDock");
  const scholaVisible=Boolean(scholaDock?.classList?.contains?.("show"));
  return Object.freeze({
    priestPosition:textAt(doc,"#stationText") ? {label:textAt(doc,"#stationText")} : null,
    posture:textAt(doc,"#postureText") ? {label:textAt(doc,"#postureText")} : null,
    gesture:textAt(doc,"#gestureText") ? {label:textAt(doc,"#gestureText")} : null,
    response:textAt(doc,"#responseText") ? {label:textAt(doc,"#responseText")} : null,
    priestVoice:textAt(doc,"#voiceText") ? {label:textAt(doc,"#voiceText")} : null,
    schola:scholaVisible && textAt(doc,"#scholaStreamLine")
      ? {label:textAt(doc,"#scholaStreamLine")}
      : null,
    sharedTextWithSchola:false,
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
    filter({gesture=null,response=null}={}){
      return Object.freeze({
        gesture:pending ? null : gesture,
        response:pending ? null : response,
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
}={}){
  if(!prepared?.session?.resolvedMass) throw new TypeError("Prepared R17 Mass session required");
  const [data,events,registries]=await Promise.all([
    presentationData ?? Promise.resolve(loadPresentationData(prepared)),
    eventData ?? Promise.resolve(loadEventData(prepared)),
    cueRegistries ?? Promise.resolve(loadCueRegistries(prepared)),
  ]);
  const model=createMassReaderModel({
    resolvedMass:prepared.session.resolvedMass,
    sectionMap:data?.sectionMap,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
  });
  const eventState=createNativeEventStateController(events);
  const cueState=createReaderCueStateController({
    registries,
    sungCorpus:data?.sungCorpus,
    prepared,
  });
  return Object.freeze({prepared,data,model,events,eventState,registries,cueState});
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
  readLegacyActive=null,
  iconResolver=null,
  onClose=null,
}={}){
  if(!doc?.body || !doc?.createElement) throw new TypeError("Document/body required");

  // Validate everything before adding a single preview node.
  const ready=await prepareNativeReaderPreview({
    prepared,presentationData,loadPresentationData,eventData,loadEventData,
    cueRegistries,loadCueRegistries,
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
  const transientGuard=createCardTransitionTransientGuard();
  const win=doc.defaultView ?? globalThis;

  function projectedState(){
    const legacy=legacyReaderStateSnapshot(doc);
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
    const transient=transientGuard.filter({
      gesture:owned.gesture,
      response:owned.response,
    });
    const gesture=transient.gesture;
    const response=transient.response;
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

    const ownership=Object.freeze({
      ...owned.ownership,
      gesture:transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : owned.ownership.gesture,
      response:transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : owned.ownership.response,
      posture:postureResolved.owner,
      schola:"LEGACY_TEMPORARY",
    });

    return Object.freeze({
      priestPosition,
      posture,
      gesture,
      response,
      priestVoice,
      schola:legacy.schola,
      sharedTextWithSchola:false,
      nativeEventId:eventState?.canonicalEventId??null,
      nativeCueId:activeCueId,
      cueProjectionSupported:cueNative,
      cueProjectionReason:cueProjection?.reason??null,
      ownership,
    });
  }
  function showCard(card){
    if(!card) return null;
    const changed=Boolean(current?.sectionId && current.sectionId!==card.sectionId);
    if(changed){
      activeCueId=null;
      transientGuard.begin();
      root.dataset.r17NativeCue="unresolved";
    }
    current=card;
    const state=projectedState();
    reader.renderMoment({
      id:card.sectionId,
      sectionTitle:card.title,
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:card.paragraphs,
      progress:card.sequence+" / "+ready.model.totalCards,
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
        transientGuard.resolveCue(cueId);
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
      // Posture and Schola remain rollback donors in this wave.
      "#postureText","#scholaDock","#scholaStreamLine"
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
      schola:"LEGACY_TEMPORARY",
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
    getTransientTransitionPending:()=>transientGuard.pending,
  });
  globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
  return api;
}
