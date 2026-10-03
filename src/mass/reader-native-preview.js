// Native R17 reader preview.
// R17 owns verified prayer-card text and 30-card navigation.
// The legacy reader remains underneath as rollback and temporarily donates live
// state channels until each channel is projected directly from canonical events.

import { createMassReaderModel } from "./reader-model.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { createReaderDomAdapter } from "./reader-dom.js";
import { loadCanonicalReaderEvents, createNativeEventStateController, extractCanonicalEventId } from "./reader-event-state.js";
import { GLORIA_CREDO_FAITHFUL_GESTURES, resolveFaithfulGestureForCue } from "./faithful-gesture-cues.js";
import { loadReaderCueRegistries, createReaderCueStateController } from "./reader-cue-state.js";
import { installCueFocusTracker } from "./reader-cue-focus.js";

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
    const cueNative=Boolean(cueProjection?.supported && cueProjection?.reason==null);
    const gestureProfile=prepared?.readerPreferences?.gestureProfile ?? "GUIDED_1962";

    let gesture=null;
    if(cueNative){
      // Source registry owns exact-cue absence as well as presence: no legacy text/phase inference.
      if(gestureProfile==="TRADITIONAL" && cueProjection.gesture){
        gesture=cueProjection.gesture;
      }else{
        gesture=resolveGestureProjection(eventState,null,{
          cueId:activeCueId,
          gestureProfile,
        });
      }
    }else{
      gesture=resolveGestureProjection(eventState,legacy.gesture,{
        cueId:null,
        gestureProfile,
      });
    }

    const response=cueNative ? cueProjection.response : (
      eventState?.ownership?.response==="R17_NATIVE" ? eventState.response : legacy.response
    );
    const priestVoice=cueNative && cueProjection.priestVoice
      ? cueProjection.priestVoice
      : eventState?.ownership?.priestVoice==="R17_NATIVE"
        ? eventState.priestVoice
        : legacy.priestVoice;
    const priestPosition=cueNative && cueProjection.priestPosition
      ? cueProjection.priestPosition
      : legacy.priestPosition;

    // Posture is intentionally still conservative. Only an explicitly satisfied
    // source/profile posture transition may replace the rollback donor.
    const posture=cueNative && cueProjection.posture
      ? cueProjection.posture
      : legacy.posture;

    const ownership=Object.freeze({
      priestVoice:cueNative && cueProjection.priestVoice
        ? cueProjection.ownership.priestVoice
        : eventState?.ownership?.priestVoice==="R17_NATIVE"
          ? "R17_EVENT_NATIVE"
          : "LEGACY_FALLBACK",
      response:cueNative
        ? cueProjection.ownership.response
        : eventState?.ownership?.response==="R17_NATIVE"
          ? "R17_EVENT_NATIVE"
          : "LEGACY_FALLBACK",
      gesture:cueNative
        ? (
          gesture
            ? (gesture.owner==="R17_CUE_SOURCE" ? "R17_CUE_NATIVE_TRADITIONAL_PROFILE" : "R17_EXACT_CUE_PROFILE")
            : cueProjection.ownership.gesture
        )
        : eventState?.ownership?.gesture ?? "LEGACY_FALLBACK",
      posture:cueNative && cueProjection.posture
        ? cueProjection.ownership.posture
        : "LEGACY_PROFILE_FALLBACK",
      priestPosition:cueNative && cueProjection.priestPosition
        ? cueProjection.ownership.priestPosition
        : "LEGACY_FALLBACK",
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
      posture:"R17_ONLY_WHEN_SOURCE_CONDITION_RESOLVES_ELSE_LEGACY",
      priestPosition:"R17_CUE_SOURCE_PERSISTENT_ON_CERTIFIED_MISSA_CANTATA",
      schola:"LEGACY_TEMPORARY",
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
  });
  globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
  return api;
}
