// Native R17 reader preview.
// R17 owns verified prayer-card text and 30-card navigation.
// The legacy reader remains underneath as rollback and temporarily donates live
// state channels until each channel is projected directly from canonical events.

import { createMassReaderModel } from "./reader-model.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { createReaderDomAdapter } from "./reader-dom.js";
import { loadCanonicalReaderEvents, createNativeEventStateController, extractCanonicalEventId } from "./reader-event-state.js";

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

export async function prepareNativeReaderPreview({
  prepared,
  presentationData=null,
  loadPresentationData=loadReaderPresentationData,
  eventData=null,
  loadEventData=loadCanonicalReaderEvents,
}={}){
  if(!prepared?.session?.resolvedMass) throw new TypeError("Prepared R17 Mass session required");
  const [data,events]=await Promise.all([
    presentationData ?? Promise.resolve(loadPresentationData(prepared)),
    eventData ?? Promise.resolve(loadEventData(prepared)),
  ]);
  const model=createMassReaderModel({
    resolvedMass:prepared.session.resolvedMass,
    sectionMap:data?.sectionMap,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
  });
  const eventState=createNativeEventStateController(events);
  return Object.freeze({prepared,data,model,events,eventState});
}

export async function mountNativeReaderPreview({
  doc=globalThis.document,
  prepared,
  presentationData=null,
  loadPresentationData=loadReaderPresentationData,
  eventData=null,
  loadEventData=loadCanonicalReaderEvents,
  readLegacyActive=null,
  iconResolver=null,
  onClose=null,
}={}){
  if(!doc?.body || !doc?.createElement) throw new TypeError("Document/body required");

  // Validate everything before adding a single preview node.
  const ready=await prepareNativeReaderPreview({prepared,presentationData,loadPresentationData,eventData,loadEventData});

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
    if(!eventState)return Object.freeze({
      ...legacy,
      nativeEventId:null,
      ownership:Object.freeze({
        priestVoice:"LEGACY_FALLBACK",
        response:"LEGACY_FALLBACK",
        gesture:"LEGACY_FALLBACK",
        posture:"LEGACY_PENDING_SOURCE_EXTRACTION",
        priestPosition:"LEGACY_PENDING_SOURCE_EXTRACTION",
        schola:"LEGACY_TEMPORARY",
      }),
    });
    return Object.freeze({
      priestPosition:legacy.priestPosition,
      posture:legacy.posture,
      gesture:eventState.ownership.gesture==="R17_NATIVE" ? eventState.gesture : legacy.gesture,
      response:eventState.ownership.response==="R17_NATIVE" ? eventState.response : legacy.response,
      priestVoice:eventState.ownership.priestVoice==="R17_NATIVE" ? eventState.priestVoice : legacy.priestVoice,
      schola:legacy.schola,
      sharedTextWithSchola:false,
      nativeEventId:eventState.canonicalEventId,
      ownership:Object.freeze({
        ...eventState.ownership,
        schola:"LEGACY_TEMPORARY",
      }),
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
    globalThis.AO_R17_NATIVE_READER_STATE=state;
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

  const MutationObserverImpl=win?.MutationObserver ?? globalThis.MutationObserver;
  if(typeof MutationObserverImpl==="function"){
    observer=new MutationObserverImpl(queue);
    const targets=[
      "#stationText","#postureText","#gestureText","#responseText",
      "#voiceText","#scholaDock","#scholaStreamLine"
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
      liveState:"R17_PARTIAL_EVENT_STATE",
      priestVoice:"R17_WHEN_CANONICAL_EVENT_RESOLVES",
      response:"R17_WHEN_CANONICAL_RESPONSE_EVENT_RESOLVES",
      gesture:"R17_CERTIFIED_INCARNATUS_ONLY",
      posture:"LEGACY_PENDING_SOURCE_EXTRACTION",
      priestPosition:"LEGACY_PENDING_SOURCE_EXTRACTION",
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
  });
  globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
  return api;
}
