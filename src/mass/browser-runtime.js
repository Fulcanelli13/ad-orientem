import { createMassEntryController } from "./app-shell-bootstrap.js";
import { createReaderDomAdapter } from "./reader-dom.js";
import { createMassReaderModel } from "./reader-model.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { structureSupport } from "./reader-structure.js";
import { createAspergesReaderController, loadAspergesReaderData } from "./reader-asperges.js";
import { createPalmReaderController, loadPalmReaderData } from "./reader-palm.js";
import { createAshReaderController, loadAshReaderData } from "./reader-ash.js";
import { createCandlemasReaderController, loadCandlemasReaderData } from "./reader-candlemas.js";
import { loadCanonicalReaderEvents } from "./reader-event-state.js";
import { createPlanAwareObjectiveRuntime } from "./reader-objective-runtime.js";
import { createFormLifecycleRuntime } from "./form-lifecycle.js";

export function createBrowserMassRuntime({
  root, celebrationApi, resolveHostOptions, readReaderPreferences,
  iconResolver = null, loadPresentationData = loadReaderPresentationData,
  eventData = null, loadEventData = loadCanonicalReaderEvents,
  loadAspergesData = loadAspergesReaderData, aspergesRiteContext = null,
  loadPalmData = loadPalmReaderData,
  loadAshData = loadAshReaderData,
  loadCandlemasData = loadCandlemasReaderData,
  onPresentationModeChange = null, onPrevious = null, onNext = null,
  onGuide = null, onReaderMounted = null, onSectionChange = null,
  onLifecycleHandoff = null,
} = {}) {
  if (typeof loadPresentationData !== "function") throw new TypeError("loadPresentationData function required");

  let readerModel = null;
  let currentSectionId = null;
  let currentPrepared = null;
  let objectiveRuntime = null;
  let aspergesController = null;
  let inAsperges = false;
  let palmController = null;
  let inPalm = false;
  let ashController = null;
  let inAsh = false;
  let candlemasController = null;
  let inCandlemas = false;
  let lifecycleRuntime = null;
  let inLifecycle = false;


  function aspergesMoment(){
    const state=aspergesController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Asperges",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Asperges",
      posture:card.posture && card.posture!=="INHERIT" ? {label:card.posture} : null,
      gesture:state.faithfulGesture ? {label:state.faithfulGesture} : null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showAsperges(){
    const moment=aspergesMoment();
    if(!moment)return null;
    currentSectionId=null;
    reader.renderMoment(moment);
    return moment;
  }



  function ashMoment(){
    const state=ashController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Ash Wednesday",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Ash Rite",
      posture:state.recipientPosture
        ? {label:state.recipientPosture}
        : card.posture && !["LOCAL","ORDINARY_PROFILE"].includes(card.posture) ? {label:card.posture} : null,
      gesture:null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showAsh(){
    const moment=ashMoment();
    if(!moment)return null;
    currentSectionId=null;
    reader.renderMoment(moment);
    return moment;
  }

  function candlemasMoment(){
    const state=candlemasController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Candlemas",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Candlemas",
      posture:state.recipientPosture
        ? {label:state.recipientPosture}
        : card.posture && !["LOCAL","ORDINARY_PROFILE"].includes(card.posture) ? {label:card.posture} : null,
      gesture:null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showCandlemas(){
    const moment=candlemasMoment();
    if(!moment)return null;
    currentSectionId=null;
    reader.renderMoment(moment);
    return moment;
  }

  function palmMoment(){
    const state=palmController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Palm Sunday",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Palm Rite",
      posture:state.recipientPosture
        ? {label:state.recipientPosture}
        : card.posture && !["LOCAL","ORDINARY_PROFILE"].includes(card.posture) ? {label:card.posture} : null,
      gesture:card.gesture ? {label:card.gesture} : null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showPalm(){
    const moment=palmMoment();
    if(!moment)return null;
    currentSectionId=null;
    reader.renderMoment(moment);
    return moment;
  }

  function introitOnlyCard(){
    const card=readerModel?.cardBySequence?.(1);
    if(!card)return null;
    const block=card.blocks?.find?.(x=>x.blockId==="AO.SM.B014");
    if(!block || block.firstParagraphIndex==null || !block.paragraphCount)throw new Error("Preceding-rite Introit handoff cannot resolve AO.SM.B014");
    const paragraphs=card.paragraphs.slice(block.firstParagraphIndex,block.firstParagraphIndex+block.paragraphCount);
    return Object.freeze({...card,title:"Introit",paragraphs:Object.freeze(paragraphs),precedingRiteIntroitOnly:true});
  }

  function cardMoment(card, extra = {}) {
    if (!card) throw new TypeError("Reader card required");
    return {
      ...extra,
      id: extra.id ?? card.sectionId,
      sectionTitle: card.title,
      cardTitle: card.title,
      cardUpdate: true,
      paragraphs: card.paragraphs,
      progress: String(card.sequence) + " / " + String(readerModel?.totalCards ?? 30),
    };
  }

  function showCard(card, extra = {}) {
    if (!readerModel) throw new Error("Reader model is not ready");
    if (!card) return null;
    currentSectionId = card.sectionId;
    const state = reader.renderMoment(cardMoment(card, extra));
    onSectionChange?.(card, state, readerModel);
    return card;
  }

  function showSection(sectionOrSequence, extra = {}) {
    if (!readerModel) throw new Error("Reader model is not ready");
    const card = typeof sectionOrSequence === "number"
      ? readerModel.cardBySequence(sectionOrSequence)
      : readerModel.cards.find(value => value.sectionId === String(sectionOrSequence));
    return showCard(card, extra);
  }

  function notifyLifecycle(state){
    onLifecycleHandoff?.(state,currentPrepared);
    return state;
  }

  function enterLifecycleBoundary(){
    if(!lifecycleRuntime)throw new Error("Form lifecycle runtime is not ready");
    inLifecycle=true;
    return notifyLifecycle(lifecycleRuntime.enterMassBoundary());
  }

  function advanceLifecycle(){
    if(!lifecycleRuntime)return null;
    inLifecycle=true;
    return notifyLifecycle(lifecycleRuntime.advance());
  }

  function move(direction) {
    if(inLifecycle && lifecycleRuntime){
      if(direction==="next")return advanceLifecycle();
      return lifecycleRuntime.snapshot();
    }
    if(direction==="next" && inCandlemas && candlemasController){
      const state=candlemasController.project();
      if(state.atEnd){
        inCandlemas=false;
        return showCard(introitOnlyCard());
      }
      candlemasController.next();
      return showCandlemas();
    }
    if(direction==="previous" && inCandlemas && candlemasController){
      const state=candlemasController.project();
      if(!state.atStart)candlemasController.previous();
      return showCandlemas();
    }
    if(direction==="next" && inAsh && ashController){
      const state=ashController.project();
      if(state.atEnd){
        inAsh=false;
        return showCard(introitOnlyCard());
      }
      ashController.next();
      return showAsh();
    }
    if(direction==="previous" && inAsh && ashController){
      const state=ashController.project();
      if(!state.atStart)ashController.previous();
      return showAsh();
    }
    if(direction==="next" && inPalm && palmController){
      const state=palmController.project();
      if(state.atEnd){
        inPalm=false;
        return showCard(introitOnlyCard());
      }
      palmController.next();
      return showPalm();
    }
    if(direction==="previous" && inPalm && palmController){
      const state=palmController.project();
      if(!state.atStart)palmController.previous();
      return showPalm();
    }
    if(direction==="next" && inAsperges && aspergesController){
      const state=aspergesController.project();
      if(state.atEnd){
        inAsperges=false;
        return showCard(readerModel.cardBySequence(1));
      }
      aspergesController.next();
      return showAsperges();
    }
    if(direction==="previous" && inAsperges && aspergesController){
      const state=aspergesController.project();
      if(!state.atStart)aspergesController.previous();
      return showAsperges();
    }
    if(!readerModel || !currentSectionId)return null;
    if(direction==="previous" && candlemasController && currentSectionId===readerModel.cardBySequence(1)?.sectionId){
      inCandlemas=true;
      candlemasController.goTo("CND-R07");
      return showCandlemas();
    }
    if(direction==="previous" && ashController && currentSectionId===readerModel.cardBySequence(1)?.sectionId){
      inAsh=true;
      ashController.goTo("ASH-R05");
      return showAsh();
    }
    if(direction==="previous" && palmController && currentSectionId===readerModel.cardBySequence(1)?.sectionId){
      inPalm=true;
      palmController.goTo("PALM-R07");
      return showPalm();
    }
    if(direction==="previous" && aspergesController && currentSectionId===readerModel.cardBySequence(1)?.sectionId){
      inAsperges=true;
      aspergesController.goTo("ASP-R05");
      return showAsperges();
    }
    const card=direction==="previous"
      ? readerModel.previousCard(currentSectionId)
      : readerModel.nextCard(currentSectionId);
    if(direction==="next" && (card?.sourceSequence===30 || card?.sequence===30) && currentPrepared?.session?.plan?.normalLastGospel===false){
      return enterLifecycleBoundary();
    }
    if(direction==="next" && !card){
      return enterLifecycleBoundary();
    }
    return showCard(card);
  }

  const reader = createReaderDomAdapter({
    root, iconResolver, onPresentationModeChange,
    allowPresentationModeSwitch:false,
    onPrevious: (state, prepared) => {
      const card = move("previous");
      onPrevious?.(card, state, prepared, readerModel);
    },
    onNext: (state, prepared) => {
      const card = move("next");
      onNext?.(card, state, prepared, readerModel);
    },
    onGuide,
  });

  function showCanonicalEvent(eventId, state = {}) {
    if (!readerModel) throw new Error("Reader model is not ready");
    if (objectiveRuntime?.supported && !objectiveRuntime.allows(eventId)) return null;
    const hit = readerModel.cardForEvent(eventId);
    if (!hit) return null;

    const changed = currentSectionId !== hit.card.sectionId;
    if (changed) {
      currentSectionId = hit.card.sectionId;
      reader.renderMoment({
        ...state,
        id: hit.canonicalEventId,
        sectionTitle: hit.card.title,
        cardTitle: hit.card.title,
        cardUpdate: true,
        paragraphs: hit.card.paragraphs,
        progress: hit.progress.label,
      });
      onSectionChange?.(hit.card, reader.getState(), readerModel);
    } else {
      reader.renderMoment({
        ...state,
        id: hit.canonicalEventId,
        sectionTitle: hit.card.title,
        cardUpdate: false,
        progress: hit.progress.label,
      });
    }
    return hit;
  }

  const entry = createMassEntryController({
    celebrationApi, resolveHostOptions, readReaderPreferences,
    openReader: async prepared => {
      const structuralSupport=structureSupport(prepared);
      if(!structuralSupport.supported){
        throw new Error(structuralSupport.reason || "R17 browser reader structure is not certified");
      }
      const hasAsperges=(prepared?.session?.plan?.precedingGraphs??[]).includes("ASPERGES");
      const hasPalm=(prepared?.session?.plan?.precedingGraphs??[]).includes("PALM");
      const hasAsh=(prepared?.session?.plan?.precedingGraphs??[]).includes("ASH");
      const hasCandlemas=(prepared?.session?.plan?.precedingGraphs??[]).includes("CANDLEMAS");
      const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
      const needsObjectiveRuntime=["LOW","SOLEMN"].includes(form);
      const [data,aspergesData,palmData,ashData,candlemasData,events]=await Promise.all([
        Promise.resolve(loadPresentationData(prepared)),
        hasAsperges ? Promise.resolve(loadAspergesData(prepared)) : null,
        hasPalm ? Promise.resolve(loadPalmData(prepared)) : null,
        hasAsh ? Promise.resolve(loadAshData(prepared)) : null,
        hasCandlemas ? Promise.resolve(loadCandlemasData(prepared)) : null,
        needsObjectiveRuntime
          ? (eventData ?? Promise.resolve(loadEventData(prepared)))
          : Promise.resolve([]),
      ]);
      const plannedObjective=createPlanAwareObjectiveRuntime({events,prepared});
      const model = createMassReaderModel({
        resolvedMass: prepared.session.resolvedMass,
        sectionMap: data?.sectionMap,
        lowCorpus: data?.lowCorpus,
        sungCorpus: data?.sungCorpus,
        canonSourceMap: data?.canonSourceMap,
      });

      readerModel = model;
      objectiveRuntime = plannedObjective;
      lifecycleRuntime = createFormLifecycleRuntime({prepared});
      inLifecycle = false;
      currentPrepared = prepared;
      currentSectionId = null;
      aspergesController=hasAsperges ? createAspergesReaderController({graph:aspergesData?.graph,payload:aspergesData?.payload,riteContext:aspergesRiteContext??{}}) : null;
      inAsperges=Boolean(aspergesController);
      palmController=hasPalm ? createPalmReaderController({graph:palmData?.graph,payload:palmData?.payload}) : null;
      inPalm=Boolean(palmController);
      ashController=hasAsh ? createAshReaderController({graph:ashData?.graph,payload:ashData?.payload}) : null;
      inAsh=Boolean(ashController);
      candlemasController=hasCandlemas ? createCandlemasReaderController({graph:candlemasData?.graph,payload:candlemasData?.payload}) : null;
      inCandlemas=Boolean(candlemasController);
      const activePreceding=[inAsperges,inPalm,inAsh,inCandlemas].filter(Boolean).length;
      if(activePreceding>1)throw new Error("Multiple preceding rite readers are not yet composable");
      reader.mount(prepared);
      if(inCandlemas)showCandlemas();
      else if(inAsh)showAsh();
      else if(inPalm)showPalm();
      else if(inAsperges)showAsperges();
      else showCard(model.cardBySequence(1));
      onReaderMounted?.(prepared, reader, model);
    },
  });

  function destroy() {
    reader.destroy();
    readerModel = null;
    currentSectionId = null;
    currentPrepared = null;
    objectiveRuntime = null;
    aspergesController = null;
    inAsperges = false;
    palmController = null;
    inPalm = false;
    ashController = null;
    inAsh = false;
    candlemasController = null;
    inCandlemas = false;
    lifecycleRuntime = null;
    inLifecycle = false;
  }

  return Object.freeze({
    prepare: entry.prepare,
    enter: entry.enter,
    renderMoment: reader.renderMoment,
    showSection,
    showCanonicalEvent,
    previous: () => move("previous"),
    next: () => move("next"),
    setMode: reader.setMode,
    destroy,
    getReaderState: reader.getState,
    getReaderMode: reader.getMode,
    getReaderModel: () => readerModel,
    getPreparedSession: () => currentPrepared,
    getObjectiveRuntime: () => objectiveRuntime,
    getCurrentSectionId: () => currentSectionId,
    getAspergesState: () => aspergesController?.project?.() ?? null,
    getPalmState: () => palmController?.project?.() ?? null,
    getAshState: () => ashController?.project?.() ?? null,
    getCandlemasState: () => candlemasController?.project?.() ?? null,
    getCandlemasMassState: eventId => candlemasController?.massCandleState?.(eventId) ?? null,
    getLifecycleState: () => lifecycleRuntime?.snapshot?.() ?? null,
    chooseLeonine: accept => {
      if(!lifecycleRuntime)return null;
      inLifecycle=true;
      return notifyLifecycle(lifecycleRuntime.chooseLeonine(accept));
    },
    completeLeonine: () => {
      if(!lifecycleRuntime)return null;
      inLifecycle=true;
      return notifyLifecycle(lifecycleRuntime.completeLeonine());
    },
    completeFollowingAction: () => {
      if(!lifecycleRuntime)return null;
      inLifecycle=true;
      return notifyLifecycle(lifecycleRuntime.completeFollowingAction());
    },
    advanceLifecycle,
    setPalmRecipientState: value => { if(!palmController)return null; palmController.setRecipientState(value); return inPalm ? showPalm() : palmController.project(); },
    setAshRecipientState: value => { if(!ashController)return null; ashController.setRecipientState(value); return inAsh ? showAsh() : ashController.project(); },
    setCandlemasRecipientState: value => { if(!candlemasController)return null; candlemasController.setRecipientState(value); return inCandlemas ? showCandlemas() : candlemasController.project(); },
    setCandlemasProcessionParticipant: value => { if(!candlemasController)return null; candlemasController.setProcessionParticipant(value); return inCandlemas ? showCandlemas() : candlemasController.project(); },
    setCandlemasHasBlessedCandle: value => { if(!candlemasController)return null; candlemasController.setHasBlessedCandle(value); return inCandlemas ? showCandlemas() : candlemasController.project(); },
    markActuallySprinkled: () => { if(!aspergesController)return null; aspergesController.setActuallySprinkled(true); return inAsperges ? showAsperges() : aspergesController.project(); },
  });
}
