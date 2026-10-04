import { createMassEntryController } from "./app-shell-bootstrap.js";
import { createReaderDomAdapter } from "./reader-dom.js";
import { createMassReaderModel } from "./reader-model.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { structureSupport } from "./reader-structure.js";
import { createAspergesReaderController, loadAspergesReaderData } from "./reader-asperges.js";
import { createPalmReaderController, loadPalmReaderData } from "./reader-palm.js";
import { createAshReaderController, loadAshReaderData } from "./reader-ash.js";
import { createCandlemasReaderController, loadCandlemasReaderData } from "./reader-candlemas.js";
import { createRogationsReaderController, loadRogationsReaderData } from "./reader-rogations.js";
import { createRequiemAbsolutionReaderController, loadRequiemAbsolutionReaderData } from "./reader-requiem-absolution.js";
import { createCorpusChristiProcessionReaderController, loadCorpusChristiProcessionReaderData } from "./reader-corpus-christi.js";
import { createHolyThursdayPostReaderController, loadHolyThursdayPostReaderData } from "./reader-holy-thursday-post.js";
import { createGenericProcessionReaderController, loadGenericProcessionReaderData } from "./reader-generic-procession.js";
import { createGoodFridayReaderController, loadGoodFridayReaderData } from "./reader-good-friday.js";
import { createEasterVigilReaderController, loadEasterVigilReaderData, projectEasterVigilMassModel } from "./reader-easter-vigil.js";
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
  loadRogationsData = loadRogationsReaderData,
  loadRequiemAbsolutionData = loadRequiemAbsolutionReaderData,
  requiemAbsolutionContext = null,
  loadCorpusChristiData = loadCorpusChristiProcessionReaderData,
  loadHolyThursdayPostData = loadHolyThursdayPostReaderData,
  loadGenericProcessionData = loadGenericProcessionReaderData,
  loadGoodFridayData = loadGoodFridayReaderData, goodFridayContext = null,
  loadEasterVigilData = loadEasterVigilReaderData, easterVigilContext = null,
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
  let rogationsController = null;
  let inRogations = false;
  let requiemAbsolutionController = null;
  let inRequiemAbsolution = false;
  let corpusChristiController = null;
  let inCorpusChristi = false;
  let holyThursdayPostController = null;
  let inHolyThursdayPost = false;
  let genericProcessionController = null;
  let inGenericProcession = false;
  let goodFridayController = null;
  let inGoodFriday = false;
  let easterVigilController = null;
  let inEasterVigil = false;
  let distinctRiteState = null;
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

  function rogationsMoment(){
    const state=rogationsController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Rogations",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Rogations",
      posture:card.posture && !["LOCAL_OR_STAND","STAND_OR_LOCAL","ORDINARY_PROFILE"].includes(card.posture) ? {label:card.posture} : null,
      gesture:null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showRogations(){
    const moment=rogationsMoment();
    if(!moment)return null;
    currentSectionId=null;
    reader.renderMoment(moment);
    return moment;
  }

  function requiemAbsolutionMoment(){
    const state=requiemAbsolutionController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Requiem Absolution",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Absolution",
      posture:card.posture && card.posture!=="LOCAL_OR_INHERIT" ? {label:card.posture} : null,
      gesture:null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showRequiemAbsolution(){
    const moment=requiemAbsolutionMoment();
    if(!moment)return null;
    reader.renderMoment(moment);
    return moment;
  }

  function corpusChristiMoment(){
    const state=corpusChristiController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Corpus Christi Procession",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Corpus Christi",
      posture:state.posture && !["INHERIT","LOCAL_OR_INHERIT","LOCAL_REVERENT"].includes(state.posture) ? {label:state.posture} : null,
      gesture:null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showCorpusChristi(){
    const moment=corpusChristiMoment();
    if(!moment)return null;
    reader.renderMoment(moment);
    return moment;
  }

  function holyThursdayPostMoment(){
    const state=holyThursdayPostController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Holy Thursday",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[row.sourceRecordId].filter(Boolean),
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Holy Thursday",
      posture:state.posture && !["LOCAL_OR_INHERIT"].includes(state.posture) ? {label:state.posture} : null,
      gesture:null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showHolyThursdayPost(){
    const moment=holyThursdayPostMoment();
    if(!moment)return null;
    reader.renderMoment(moment);
    return moment;
  }

  function genericProcessionMoment(){
    const state=genericProcessionController?.project?.();
    const card=state?.card;
    if(!card)return null;
    return {
      id:card.id,
      sectionTitle:"Procession",
      cardTitle:card.title,
      cardUpdate:true,
      paragraphs:[],
      progress:String(state.index+1)+" / "+String(state.total)+" · Procession",
      posture:state.posture && state.posture!=="LOCAL" ? {label:state.posture} : null,
      gesture:null,
      guide:card.guide ? {registryAvailable:true,text:card.guide} : null,
    };
  }

  function showGenericProcession(){
    const moment=genericProcessionMoment();
    if(!moment)return null;
    reader.renderMoment(moment);
    return moment;
  }

  function goodFridayMoment(){
    const state=goodFridayController?.project?.();
    const card=state?.card;
    const step=state?.step;
    if(!card||!step)return null;
    return {
      id:step.recordId,
      sectionTitle:"Good Friday",
      cardTitle:card.title,
      cardUpdate:card.cardUpdate!==false,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        sourceCueIds:[...(row.sourceIds??[])],
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Good Friday",
      posture:state.posture ? {label:state.posture} : null,
      gesture:state.action ? {label:state.action} : null,
      guide:null,
    };
  }

  function showGoodFriday(){
    const moment=goodFridayMoment();
    if(!moment)return null;
    currentSectionId=null;
    reader.renderMoment(moment);
    return moment;
  }

  function easterVigilMoment(){
    const state=easterVigilController?.project?.();
    const card=state?.card;
    const step=state?.step;
    if(!card||!step)return null;
    return {
      id:step.recordId,
      sectionTitle:"Easter Vigil",
      cardTitle:card.title,
      cardUpdate:card.cardUpdate!==false,
      paragraphs:(card.paragraphs??[]).map(row=>({
        id:row.id,kind:row.kind,primary:row.latin,
        secondary:row.vernacular??row.english??null,
        sourceCueIds:[...(row.sourceIds??[])],
      })),
      progress:String(state.index+1)+" / "+String(state.total)+" · Easter Vigil",
      posture:state.posture ? {label:state.posture} : null,
      gesture:state.action ? {label:state.action} : null,
      guide:null,
    };
  }

  function showEasterVigil(){
    const moment=easterVigilMoment();
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

  function planAwareCard(card){
    if(!card)return null;
    const plan=currentPrepared?.session?.plan;
    if(plan?.blessingAllowed!==false || card.macroId!=="AO.SM.M29")return card;
    const blessing=card.blocks?.find?.(x=>x.blockId==="AO.SM.B092");
    if(!blessing || blessing.firstParagraphIndex==null || !blessing.paragraphCount)return card;
    const start=blessing.firstParagraphIndex;
    const end=start+blessing.paragraphCount;
    const paragraphs=card.paragraphs.filter((_,index)=>index<start||index>=end);
    return Object.freeze({
      ...card,
      title:"Placeat tibi, sancta Trinitas",
      paragraphs:Object.freeze(paragraphs),
      planFilteredBlocks:Object.freeze(["AO.SM.B092"]),
    });
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
      posture: extra.posture ?? (card.emberInsertion
        ? {label:card.posture==="SIT" ? "SIT" : "STAND"}
        : undefined),
      progress: String(card.sequence) + " / " + String(readerModel?.totalCards ?? 30),
    };
  }

  function showCard(card, extra = {}) {
    if (!readerModel) throw new Error("Reader model is not ready");
    if (!card) return null;
    const visibleCard=planAwareCard(card);
    currentSectionId = card.sectionId;
    const state = reader.renderMoment(cardMoment(visibleCard, extra));
    onSectionChange?.(visibleCard, state, readerModel);
    return visibleCard;
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
    const state=lifecycleRuntime.enterMassBoundary();
    notifyLifecycle(state);
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && requiemAbsolutionController){
      inLifecycle=false;
      inRequiemAbsolution=true;
      return showRequiemAbsolution();
    }
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && corpusChristiController){
      inLifecycle=false;
      inCorpusChristi=true;
      return showCorpusChristi();
    }
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && holyThursdayPostController){
      inLifecycle=false;
      inHolyThursdayPost=true;
      return showHolyThursdayPost();
    }
    if(state.stage==="FOLLOWING_ACTION_HANDOFF" && genericProcessionController){
      inLifecycle=false;
      inGenericProcession=true;
      return showGenericProcession();
    }
    inLifecycle=true;
    return state;
  }

  function advanceLifecycle(){
    if(!lifecycleRuntime)return null;
    inLifecycle=true;
    return notifyLifecycle(lifecycleRuntime.advance());
  }

  function move(direction) {
    if(inEasterVigil && easterVigilController){
      if(direction==="next"){
        const state=easterVigilController.project();
        if(state.atEnd && state.handoffToMass){
          inEasterVigil=false;
          distinctRiteState=Object.freeze({
            schema:"ao-r33-composite-rite-lifecycle-v1",
            rite:"EASTER_VIGIL",stage:"MASS_ACTIVE",ordinaryMassGraphActive:true,
          });
          return showCard(readerModel.cardBySequence(1));
        }
        easterVigilController.next();
        return showEasterVigil();
      }
      const state=easterVigilController.project();
      if(!state.atStart)easterVigilController.previous();
      return showEasterVigil();
    }
    if(direction==="previous" && easterVigilController && currentSectionId===readerModel?.cardBySequence?.(1)?.sectionId){
      inEasterVigil=true;
      easterVigilController.goToRecord("EV-MASS-700");
      return showEasterVigil();
    }
    if(inGoodFriday && goodFridayController){
      if(direction==="next"){
        const state=goodFridayController.project();
        if(state.atEnd){
          inGoodFriday=false;
          distinctRiteState=Object.freeze({
            schema:"ao-r28-distinct-rite-lifecycle-v1",
            rite:"GOOD_FRIDAY",stage:"DEPARTURE",ordinaryMassGraphActive:false,
          });
          onLifecycleHandoff?.(distinctRiteState,currentPrepared);
          return distinctRiteState;
        }
        goodFridayController.next();
        return showGoodFriday();
      }
      const state=goodFridayController.project();
      if(!state.atStart)goodFridayController.previous();
      return showGoodFriday();
    }
    if(inGenericProcession && genericProcessionController){
      if(direction==="next"){
        const state=genericProcessionController.project();
        if(state.atEnd){
          inGenericProcession=false;
          inLifecycle=true;
          return notifyLifecycle(lifecycleRuntime.completeFollowingAction());
        }
        genericProcessionController.next();
        return showGenericProcession();
      }
      const state=genericProcessionController.project();
      if(!state.atStart)genericProcessionController.previous();
      return showGenericProcession();
    }
    if(inHolyThursdayPost && holyThursdayPostController){
      if(direction==="next"){
        const state=holyThursdayPostController.project();
        if(state.atEnd){
          inHolyThursdayPost=false;
          inLifecycle=true;
          return notifyLifecycle(lifecycleRuntime.completeFollowingAction());
        }
        holyThursdayPostController.next();
        return showHolyThursdayPost();
      }
      const state=holyThursdayPostController.project();
      if(!state.atStart)holyThursdayPostController.previous();
      return showHolyThursdayPost();
    }
    if(inCorpusChristi && corpusChristiController){
      if(direction==="next"){
        const state=corpusChristiController.project();
        if(state.atEnd){
          inCorpusChristi=false;
          inLifecycle=true;
          return notifyLifecycle(lifecycleRuntime.completeFollowingAction());
        }
        corpusChristiController.next();
        return showCorpusChristi();
      }
      const state=corpusChristiController.project();
      if(!state.atStart)corpusChristiController.previous();
      return showCorpusChristi();
    }
    if(inRequiemAbsolution && requiemAbsolutionController){
      if(direction==="next"){
        const state=requiemAbsolutionController.project();
        if(state.atEnd){
          inRequiemAbsolution=false;
          inLifecycle=true;
          return notifyLifecycle(lifecycleRuntime.completeFollowingAction());
        }
        requiemAbsolutionController.next();
        return showRequiemAbsolution();
      }
      const state=requiemAbsolutionController.project();
      if(!state.atStart)requiemAbsolutionController.previous();
      return showRequiemAbsolution();
    }
    if(inLifecycle && lifecycleRuntime){
      if(direction==="next")return advanceLifecycle();
      return lifecycleRuntime.snapshot();
    }
    if(direction==="next" && inRogations && rogationsController){
      const state=rogationsController.project();
      if(state.atEnd){
        inRogations=false;
        return showCard(introitOnlyCard());
      }
      rogationsController.next();
      return showRogations();
    }
    if(direction==="previous" && inRogations && rogationsController){
      const state=rogationsController.project();
      if(!state.atStart)rogationsController.previous();
      return showRogations();
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
    if(direction==="previous" && rogationsController && currentSectionId===readerModel.cardBySequence(1)?.sectionId){
      inRogations=true;
      rogationsController.goTo("ROG-R06");
      return showRogations();
    }
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
    if(direction==="next" && !card && currentPrepared?.session?.plan?.kind==="COMPOSITE_DISTINCT_RITE" && currentPrepared?.session?.plan?.rite==="EASTER_VIGIL"){
      distinctRiteState=Object.freeze({
        schema:"ao-r33-composite-rite-lifecycle-v1",
        rite:"EASTER_VIGIL",stage:"DEPARTURE",ordinaryMassGraphActive:false,
      });
      onLifecycleHandoff?.(distinctRiteState,currentPrepared);
      return distinctRiteState;
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
      const plan=prepared?.session?.plan;
      if(plan?.kind==="DISTINCT_RITE" && plan?.rite==="GOOD_FRIDAY"){
        const gfData=await Promise.resolve(loadGoodFridayData(prepared));
        const gfContext=goodFridayContext ?? prepared?.session?.resolvedMass?.provenance?.goodFriday ?? {};
        readerModel=null;
        objectiveRuntime=null;
        lifecycleRuntime=null;
        inLifecycle=false;
        currentPrepared=prepared;
        currentSectionId=null;
        goodFridayController=createGoodFridayReaderController({
          graph:gfData?.graph,
          payload:gfData?.payload,
          jewishPrayerVariant:gfContext.jewishPrayerVariant??"PRINTED_1962",
          venerationMode:gfContext.venerationMode??"PERSONAL",
          willReceiveCommunion:gfContext.willReceiveCommunion===true,
        });
        inGoodFriday=true;
        distinctRiteState=Object.freeze({
          schema:"ao-r28-distinct-rite-lifecycle-v1",
          rite:"GOOD_FRIDAY",stage:"RITE_ACTIVE",ordinaryMassGraphActive:false,
        });
        reader.mount(prepared);
        showGoodFriday();
        onReaderMounted?.(prepared,reader,null);
        return;
      }
      if(plan?.kind==="COMPOSITE_DISTINCT_RITE" && plan?.rite==="EASTER_VIGIL"){
        const [data,evData]=await Promise.all([
          Promise.resolve(loadPresentationData(prepared)),
          Promise.resolve(loadEasterVigilData(prepared)),
        ]);
        const evContext=easterVigilContext ?? prepared?.session?.resolvedMass?.provenance?.easterVigil ?? {};
        const ordinaryResolved=Object.freeze({
          ...prepared.session.resolvedMass,
          distinctRite:null,
          precedingRites:[],
          followingActions:[],
          overlays:(prepared.session.resolvedMass.overlays??[]).filter(x=>x!=="EASTER_VIGIL"),
        });
        const baseModel=createMassReaderModel({
          resolvedMass:ordinaryResolved,
          sectionMap:data?.sectionMap,
          lowCorpus:data?.lowCorpus,
          sungCorpus:data?.sungCorpus,
          canonSourceMap:data?.canonSourceMap,
          nuptialData:data?.nuptialData,
        });
        readerModel=projectEasterVigilMassModel(baseModel,evData?.payload);
        objectiveRuntime=null;
        lifecycleRuntime=null;
        inLifecycle=false;
        currentPrepared=prepared;
        currentSectionId=null;
        easterVigilController=createEasterVigilReaderController({
          graph:evData?.graph,
          payload:evData?.payload,
          fontMode:evContext.fontMode??"IN_CHURCH",
          baptismPresent:evContext.baptismPresent===true,
        });
        inEasterVigil=true;
        distinctRiteState=Object.freeze({
          schema:"ao-r33-composite-rite-lifecycle-v1",
          rite:"EASTER_VIGIL",stage:"VIGIL_ACTIVE",ordinaryMassGraphActive:false,
        });
        reader.mount(prepared);
        showEasterVigil();
        onReaderMounted?.(prepared,reader,readerModel);
        return;
      }
      const structuralSupport=structureSupport(prepared);
      if(!structuralSupport.supported){
        throw new Error(structuralSupport.reason || "R17 browser reader structure is not certified");
      }
      const hasAsperges=(prepared?.session?.plan?.precedingGraphs??[]).includes("ASPERGES");
      const hasPalm=(prepared?.session?.plan?.precedingGraphs??[]).includes("PALM");
      const hasAsh=(prepared?.session?.plan?.precedingGraphs??[]).includes("ASH");
      const hasCandlemas=(prepared?.session?.plan?.precedingGraphs??[]).includes("CANDLEMAS");
      const hasRogations=(prepared?.session?.plan?.precedingGraphs??[]).includes("ROGATIONS");
      const hasRequiemAbsolution=(prepared?.session?.plan?.followingGraphs??[]).includes("REQUIEM_ABSOLUTION");
      const hasCorpusChristi=(prepared?.session?.plan?.followingGraphs??[]).includes("CORPUS_CHRISTI_PROCESSION");
      const hasHolyThursdayPost=(prepared?.session?.plan?.followingGraphs??[]).includes("HOLY_THURSDAY_POST");
      const hasGenericProcession=(prepared?.session?.plan?.followingGraphs??[]).includes("GENERIC_PROCESSION");
      const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
      const needsObjectiveRuntime=["LOW","SOLEMN"].includes(form);
      const [data,aspergesData,palmData,ashData,candlemasData,rogationsData,requiemAbsolutionData,corpusChristiData,holyThursdayPostData,genericProcessionData,events]=await Promise.all([
        Promise.resolve(loadPresentationData(prepared)),
        hasAsperges ? Promise.resolve(loadAspergesData(prepared)) : null,
        hasPalm ? Promise.resolve(loadPalmData(prepared)) : null,
        hasAsh ? Promise.resolve(loadAshData(prepared)) : null,
        hasCandlemas ? Promise.resolve(loadCandlemasData(prepared)) : null,
        hasRogations ? Promise.resolve(loadRogationsData(prepared)) : null,
        hasRequiemAbsolution ? Promise.resolve(loadRequiemAbsolutionData(prepared)) : null,
        hasCorpusChristi ? Promise.resolve(loadCorpusChristiData(prepared)) : null,
        hasHolyThursdayPost ? Promise.resolve(loadHolyThursdayPostData(prepared)) : null,
        hasGenericProcession ? Promise.resolve(loadGenericProcessionData(prepared)) : null,
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
        nuptialData: data?.nuptialData,
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
      rogationsController=hasRogations ? createRogationsReaderController({graph:rogationsData?.graph,payload:rogationsData?.payload}) : null;
      inRogations=Boolean(rogationsController);
      const absContext=requiemAbsolutionContext ?? prepared?.session?.resolvedMass?.provenance?.requiemAbsolution ?? {};
      requiemAbsolutionController=hasRequiemAbsolution ? createRequiemAbsolutionReaderController({
        graph:requiemAbsolutionData?.graph,
        payload:requiemAbsolutionData?.payload,
        bodyPresent:absContext.bodyPresent===true,
        burialProcession:absContext.burialProcession===true,
      }) : null;
      inRequiemAbsolution=false;
      corpusChristiController=hasCorpusChristi ? createCorpusChristiProcessionReaderController({
        graph:corpusChristiData?.graph,
        payload:corpusChristiData?.payload,
      }) : null;
      inCorpusChristi=false;
      holyThursdayPostController=hasHolyThursdayPost ? createHolyThursdayPostReaderController({
        graph:holyThursdayPostData?.graph,
        payload:holyThursdayPostData?.payload,
      }) : null;
      inHolyThursdayPost=false;
      genericProcessionController=hasGenericProcession ? createGenericProcessionReaderController({
        graph:genericProcessionData?.graph,
        payload:genericProcessionData?.payload,
      }) : null;
      inGenericProcession=false;
      const activePreceding=[inAsperges,inPalm,inAsh,inCandlemas,inRogations].filter(Boolean).length;
      if(activePreceding>1)throw new Error("Multiple preceding rite readers are not yet composable");
      reader.mount(prepared);
      if(inRogations)showRogations();
      else if(inCandlemas)showCandlemas();
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
    rogationsController = null;
    inRogations = false;
    requiemAbsolutionController = null;
    inRequiemAbsolution = false;
    corpusChristiController = null;
    inCorpusChristi = false;
    holyThursdayPostController = null;
    inHolyThursdayPost = false;
    genericProcessionController = null;
    inGenericProcession = false;
    goodFridayController = null;
    inGoodFriday = false;
    easterVigilController = null;
    inEasterVigil = false;
    distinctRiteState = null;
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
    getRogationsState: () => rogationsController?.project?.() ?? null,
    getRequiemAbsolutionState: () => requiemAbsolutionController?.project?.() ?? null,
    getCorpusChristiState: () => corpusChristiController?.project?.() ?? null,
    getHolyThursdayPostState: () => holyThursdayPostController?.project?.() ?? null,
    getGenericProcessionState: () => genericProcessionController?.project?.() ?? null,
    getGoodFridayState: () => goodFridayController?.project?.() ?? null,
    getEasterVigilState: () => easterVigilController?.project?.() ?? null,
    getLifecycleState: () => lifecycleRuntime?.snapshot?.() ?? distinctRiteState,

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
    setCorpusChristiProcessionParticipant: value => { if(!corpusChristiController)return null; corpusChristiController.setProcessionParticipant(value); return inCorpusChristi ? showCorpusChristi() : corpusChristiController.project(); },
    setCorpusChristiSacramentalState: value => { if(!corpusChristiController)return null; corpusChristiController.setSacramentalState(value); return inCorpusChristi ? showCorpusChristi() : corpusChristiController.project(); },
    setHolyThursdayJoiningState: value => { if(!holyThursdayPostController)return null; holyThursdayPostController.setJoiningState(value); return inHolyThursdayPost ? showHolyThursdayPost() : holyThursdayPostController.project(); },
    setGenericProcessionParticipant: value => { if(!genericProcessionController)return null; genericProcessionController.setParticipating(value); return inGenericProcession ? showGenericProcession() : genericProcessionController.project(); },
  });
}
