// Native production reader.
// R17 owns verified prayer-card text, navigation and certified state channels.
// Legacy DOM/state is consulted only when an explicit rollback/shadow donor is supplied.

import { createMassReaderModel } from "./reader-model.js";
import {loadMandatumSource, createMandatumEventController} from "./reader-holy-thursday-mandatum-events.js";
import { assessMassTextPrint, renderMassTextPrintHtml } from "./reader-print-booklet.js";
import { projectCuratedOrdinaryLiveCards, projectCuratedIntroitEntryLiveCards, visibleMassCardTitle } from "./reader-live-curated-cards.js";
import {auditOrdinarySungPriestEventAlignment,projectObservedOrdinaryPriestEvent} from "./reader-priest-event-alignment.js";
import { buildReaderModeModels, captureReaderModeAnchor, findReaderModeAnchorCard } from "./reader-mode-switch.js";
import { projectGranularMissalCards, missalPrayerHeadingsForCard } from "./reader-missal-granularity.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { createReaderDomAdapter, syncReaderRitualHighlights } from "./reader-dom.js";
import { buildScholaMusicItinerary } from "./reader-schola-event-timeline.js";
import {projectNativeRiteMusicItinerary} from "./reader-schola-special-rite-itinerary.js";
import {readScholaLocalProgramme, updateScholaLocalProgramme, applyScholaLocalProgramme} from "./reader-schola-local-programme.js";
import { loadCanonicalReaderEvents, createNativeEventStateController, extractCanonicalEventId } from "./reader-event-state.js";
import { GLORIA_CREDO_FAITHFUL_GESTURES, isGloriaCredoGestureSourceCue, resolveFaithfulGestureForCue } from "./faithful-gesture-cues.js";
import { loadReaderCueRegistries } from "./reader-cue-state.js";
import { loadReaderFormStateData, createReaderFormCueStateController } from "./reader-form-state.js";
import { installCueFocusTracker } from "./reader-cue-focus.js";
import { withLiveReadingSections } from "./reader-live-reading-sections.js";
import { projectReaderObjectiveContext } from "./reader-objective-context.js";

// The certified Good Friday state graph carries nine kneel/rise formula
// pairs and three Cross-unveiling silent adoration intervals. Their spoken
// formula cues are recognized ONLY by exact source-owned paragraph IDs.
export function goodFridayFormulaAtFocus({scrollTop=0,clientHeight=0,items=[]}={}){
  const y=Math.max(0,Number(scrollTop)||0),height=Math.max(0,Number(clientHeight)||0);
  if(y<=8 || !height)return null;
  const line=y+height*.39;
  return [...items].filter(row=>
    /^(?:GF-SOP-\d\d-[KR]|GF-X-52[123])$/.test(String(row?.cueId??"")) &&
    Number.isFinite(row.top)&&Number.isFinite(row.bottom) &&
    row.top<=line && row.bottom>=y-4
  ).sort((a,b)=>b.top-a.top)[0]?.cueId??null;
}

// Palm gospel-crosses belong only to the source-owned proclamation heading,
// never the response or the complete Matthew reading in the same rite card.
const PALM_GOSPEL_HEADING_ID="PALM-R03-01";
export function palmGospelFocusedRow({scrollTop=0,clientHeight=0,scrollHeight=0,items=[]}={}){
  const rows=(items??[]).filter(x=>/^PALM-R03-0[1-4]$/.test(String(x?.id??"")) &&
    Number.isFinite(x?.top)&&Number.isFinite(x?.bottom));
  if(!rows.length)return null;
  const top=Math.max(0,Number(scrollTop)||0),height=Math.max(1,Number(clientHeight)||1);
  const extent=Math.max(height,Number(scrollHeight)||height);
  if(top<=8)return rows[0].id;
  if(top>=extent-height-8)return rows[rows.length-1].id;
  const openingCenter=(rows[0].top+rows[0].bottom)/2;
  const focus=top+Math.min(height*.39,Math.max(24,openingCenter+top*.8));
  let selected=rows[0],distance=Infinity;
  for(const row of rows){
    if(focus>=row.top&&focus<=row.bottom)return row.id;
    const delta=Math.abs((row.top+row.bottom)/2-focus);
    if(delta<distance){distance=delta;selected=row}
  }
  return selected.id;
}
import { resolveReaderPostureChannel } from "./reader-posture-profile.js";
import { structureSupport } from "./reader-structure.js";
import { loadGuideRegistry, guideForPresentationCard } from "./reader-guide.js";
import { createNativeScholaController } from "./reader-schola.js";
import { readMassCustomaryPreferences, updateMassCustomaryPreferences } from "./reader-customary-preferences.js";
import { projectGloriaCredoFaithfulCue, resolveIncarnatusSungAction } from "./gloria-credo-faithful.js";
import { iconKeysForReaderState, readerAttentionForState } from "./reader-icons.js";
import { projectCurated65PriestStation } from "./reader-priest-station65.js";
import { createReaderTransientController, partTransitionCinematic, resolveCanonStageBellCinematic } from "./reader-transients.js";
import {projectHolyThursdayBell,projectEasterVigilGloriaBell} from "./reader-triduum-bells.js";
import {projectLowMassCommunionWarning} from "./reader-low-communion-bell.js";
import { projectPriestQuietOffertory } from "./reader-offertory-quiet.js";
import { projectLiveCinematicScene, projectGoodFridayDeathScene } from "./reader-cinematic-scenes.js";
import { createReaderRubricEventController } from "./reader-rubric-events.js";
import { withPublishedCanonParagraphRubrics } from "./reader-canon-published-rubrics.js";
import { withPublishedMissalParagraphRubrics } from "./reader-missal-rubrics.js";
import {with1962RitusXIVParagraphRubrics} from "./1962-all-souls-consecutive-rites.js";
import { withCertifiedSolemnMissalMinisters } from "./reader-missal-solemn-rubrics.js";
import { withRequiemXIII3MissalNotes } from "./reader-requiem-conditions.js";
import { createReaderGestureMatrixController } from "./reader-gesture-matrix.js";
import { certifiedLiveCanonActionOverride } from "./reader-live-canon-action.js";
import { createLiveCanonStageObservationController } from "./reader-live-canon-stage-observation.js";
import { mountLiveCanonManualFollow,canonicalManualFollowContext } from "./reader-live-canon-manual-follow.js";
import { resolvePriestChantAction, resolvePriestChantVoice, validatePriestChantObservation } from "./reader-priest-chant-owner.js";
import { createObservedPriestEntranceController, projectObservedPreMassPriestAction } from "./reader-priest-entrance-observation.js";
import { createObservedChalicePreparationController } from "./reader-priest-chalice-observation.js";
import { createPlanAwareObjectiveRuntime } from "./reader-objective-runtime.js";
import { createAspergesReaderController, loadAspergesReaderData, resolveAspergesRiteContext } from "./reader-asperges.js";
import { projectRiteMusicBadge, loadRiteMusicRegistry } from "./reader-rite-music-presentation.js";
import { project1962ReaderOrganNote } from "./reader-organ-permission-presentation.js";
import { createPalmReaderController, loadPalmReaderData } from "./reader-palm.js";
import { createAshReaderController, loadAshReaderData } from "./reader-ash.js";
import { createCandlemasReaderController, loadCandlemasReaderData } from "./reader-candlemas.js";
import { createRogationsReaderController, contextualRogationCard, loadRogationsReaderData } from "./reader-rogations.js";
import { createGoodFridayReaderController, loadGoodFridayReaderData } from "./reader-good-friday.js";
import { installDistinctRiteReadingFocus } from "./reader-distinct-text-focus.js";
import { createEasterVigilReaderController, loadEasterVigilReaderData, projectEasterVigilMassModel } from "./reader-easter-vigil.js";
import { EASTER_VIGIL_PROPHECY_READINGS } from "./reader-easter-vigil-prophecy-index.js";
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
  const adjudicated=Boolean(cueId && GLORIA_CREDO_FAITHFUL_GESTURES[cueId]);
  const cueGesture=cueId ? resolveFaithfulGestureForCue({cueId,gestureProfile,incarnatusAction}) : null;
  if(cueGesture) return cueGesture;
  if(owner==="R17_NATIVE" && !adjudicated)return eventState.gesture ?? null;

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
              ? (gesture.owner==="GESTURE_MATRIX_SOT" ? "GESTURE_MATRIX_SOT" : gesture.owner==="R17_CUE_SOURCE" ? "R17_CUE_NATIVE_SOURCE" : "R17_EXACT_CUE_PROFILE")
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
  reviewCuratedCards=false,
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
  riteMusicData=null,
  loadRiteMusicData=loadRiteMusicRegistry,
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
  mandatumSourceData=null,
  loadMandatumData=loadMandatumSource,
  genericProcessionData=null,
  loadGenericProcessionData=loadGenericProcessionReaderData,
}={}){
  if(!prepared?.session?.resolvedMass) throw new TypeError("Prepared R17 Mass session required");
  const plan=prepared?.session?.plan;
  if(plan?.kind==="DISTINCT_RITE" && plan?.rite==="GOOD_FRIDAY"){
    // R28 bypasses the ordinary Mass preload; music metadata must be loaded
    // here, without making supplementary research a prerequisite for prayer.
    const [loadedGoodFriday,loadedRiteMusic]=await Promise.all([
      goodFridayData ?? Promise.resolve(loadGoodFridayData(prepared)),
      riteMusicData ?? Promise.resolve().then(()=>loadRiteMusicData(prepared)).catch(()=>null),
    ]);
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
      riteMusicRegistry:loadedRiteMusic,
      riteMusicSource:loadedGoodFriday?.payload??null,
      model:null,
    });
  }
  if(plan?.kind==="COMPOSITE_DISTINCT_RITE" && plan?.rite==="EASTER_VIGIL"){
    const [data,loadedEasterVigil,loadedRiteMusic]=await Promise.all([
      presentationData ?? Promise.resolve(loadPresentationData(prepared)),
      easterVigilData ?? Promise.resolve(loadEasterVigilData(prepared)),
      riteMusicData ?? Promise.resolve().then(()=>loadRiteMusicData(prepared)).catch(()=>null),
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
      frenchOrdinary:data?.frenchOrdinary,
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
      riteMusicRegistry:loadedRiteMusic,
      // Prophecy canticles already have their own pinned source reader; this
      // projection references those words and does not copy or translate them.
      riteMusicSource:Object.freeze({
        ...loadedEasterVigil.payload,prophecyCanticles:EASTER_VIGIL_PROPHECY_READINGS,
      }),
      riteMusicCondition:"FONT_MODE="+(ctx.fontMode??"IN_CHURCH"),
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
  // Supplementary music research may fail closed without blocking Mass text.
  const hasRiteMusic=hasAsperges||hasPalm||hasCandlemas||hasRogations||
    hasRequiemAbsolution||hasCorpusChristi||hasHolyThursdayPost||hasGenericProcession;
  const loadedRiteMusic=hasRiteMusic
    ? (riteMusicData ?? await Promise.resolve().then(()=>loadRiteMusicData(prepared)).catch(()=>null))
    : null;
  const mandatumActive=prepared?.session?.resolvedMass?.provenance?.holyThursday?.mandatumPresent===true;
  const loadedMandatum=mandatumActive
    ? (mandatumSourceData ?? await Promise.resolve(loadMandatumData(prepared)))
    : null;
  const mandatumSource=loadedMandatum?.source??loadedMandatum??null;
  const presentationWithMandatum=Object.freeze({...data,mandatumSource});
  const model=createMassReaderModel({
    resolvedMass:prepared.session.resolvedMass,
    sectionMap:data?.sectionMap,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
    canonSourceMap:data?.canonSourceMap,
    nuptialData:data?.nuptialData,
    frenchOrdinary:data?.frenchOrdinary,
    holyThursdayMandatumSource:mandatumSource,
    vernacularLanguage:prepared?.readerPreferences?.language??"en",
  });
  // MISSAL has 30 source cards even for a Sung Mass whose LIVE source
  // has 39. Eligibility must be checked against the separate LIVE model,
  // regardless of which of the two reader views is currently selected.
  const liveCapabilityModel=String(model.presentationMode)==="LIVE" ? model
    : reviewCuratedCards===true ? createMassReaderModel({
        resolvedMass:Object.freeze({...prepared.session.resolvedMass,
          presentationMode:"LIVE"}),
        sectionMap:data?.sectionMap,
        lowCorpus:data?.lowCorpus,
        sungCorpus:data?.sungCorpus,
        canonSourceMap:data?.canonSourceMap,
        nuptialData:data?.nuptialData,
        frenchOrdinary:data?.frenchOrdinary,
        holyThursdayMandatumSource:mandatumSource,
        vernacularLanguage:prepared?.readerPreferences?.language??"en",
      }) : model;
  // Only explicit, independently sourced pre-Mass and post-Mass actions
  // can accompany the ordinary Sung projection. Do not infer ceremonies
  // from dates, feast names or a later requested Mass. The four Foot-of-
  // Altar cards are suppressed only after an INTROIT-owned preceding rite.
  const introEntryKind=preceding.length===1 ? preceding[0] : null;
  const explicitIntroitEntry=["PALM","ASH","CANDLEMAS","ROGATIONS"].includes(introEntryKind) &&
    String(plan?.massEntry??"").toUpperCase()==="INTROIT" &&
    (introEntryKind==="PALM" ? Boolean(loadedPalm) :
      introEntryKind==="ASH" ? Boolean(loadedAsh) :
      introEntryKind==="CANDLEMAS" ? Boolean(loadedCandlemas) :
      Boolean(loadedRogations));
  const compatiblePrelude=preceding.length===0 ||
    (preceding.length===1 && preceding[0]==="ASPERGES" && Boolean(loadedAsperges) &&
      String(plan?.massEntry??"FOOT_CLUSTER").toUpperCase()==="FOOT_CLUSTER") ||
    explicitIntroitEntry;
  // Requiem uses the SAME curated source-owned Mass cards, with the
  // Requiem-only omissions/text variants applied by reader-model and
  // planAwareCard. Its optional Absolution is a distinct following rite.
  // Holy Thursday retains its independent special-form ownership.
  // Generic following processions change no Ordinary Mass ending. Corpus
  // Christi has a sourced Benedicamus, blessing/Last Gospel suppression.
  // No mixed preceding+following graph is automatically certified here.
  const singleFollowing=following.length===1 ? following[0] : null;
  const compatibleFollowing=following.length===0 ||
    (preceding.length===0 && singleFollowing==="REQUIEM_ABSOLUTION" &&
      Boolean(loadedRequiemAbsolution) &&
      (plan?.overlayGraphs??[]).includes("REQUIEM") &&
      plan?.dismissal==="REQUIESCANT_IN_PACE" &&
      plan?.blessingAllowed===false && plan?.normalLastGospel===false) ||
    (preceding.length===0 && singleFollowing==="GENERIC_PROCESSION" &&
      Boolean(loadedGenericProcession) && plan?.blessingAllowed!==false &&
      plan?.normalLastGospel!==false) ||
    (preceding.length===0 && singleFollowing==="CORPUS_CHRISTI_PROCESSION" &&
      Boolean(loadedCorpusChristi) && plan?.blessingAllowed===false &&
      plan?.normalLastGospel===false && plan?.dismissal==="BENEDICAMUS_DOMINO");
  const curatedEligible=reviewCuratedCards===true &&
    plan?.kind==="MASS" &&
    liveCapabilityModel.totalCards===39 &&
    String(liveCapabilityModel.corpusFamily)==="SUNG" &&
    // Eligibility is a property of the prepared Mass, not the initial mode:
    // a session may open in MISSAL and then switch to LIVE.
    compatiblePrelude && compatibleFollowing &&
    (plan?.overlayGraphs??[]).every(id=>["VOTIVE_PROPER","REQUIEM"].includes(id));
  const curatedOrdinary=curatedEligible && String(model.presentationMode)==="LIVE"
    ? projectCuratedOrdinaryLiveCards(model):null;
  const presentationModel=curatedOrdinary
    ? (explicitIntroitEntry
        ? projectCuratedIntroitEntryLiveCards(curatedOrdinary)
        : curatedOrdinary)
    : String(model.presentationMode??"").toUpperCase()==="MISSAL"
      ? projectGranularMissalCards(model)
      : model;
  // Validate the separate 15-cue event crosswalk before mounting the opt-in reader.
  if(curatedEligible)auditOrdinarySungPriestEventAlignment(events);
  const eventState=createNativeEventStateController(events);
  const objectiveRuntime=createPlanAwareObjectiveRuntime({events,prepared});
  const cueState=createReaderFormCueStateController({
    formStateData:formState,
    registries,
    lowCorpus:data?.lowCorpus,
    sungCorpus:data?.sungCorpus,
    frenchOrdinary:data?.frenchOrdinary??null,
    prepared,
    gestureMatrix:data?.gestureMatrix??null,
  });
  const scholaState=createNativeScholaController({
    sungCorpus:data?.sungCorpus,properSlots:model.properSlots,
    prepared,frenchOrdinary:data?.frenchOrdinary??null,
  });
  const transientState=createReaderTransientController({events,prepared});
  const rubricState=createReaderRubricEventController({data:data?.rubricEvents??null});
  const gestureMatrixState=createReaderGestureMatrixController({data:data?.gestureMatrix??null});
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
    prepared,curatedEligible,curatedIntroitEntry:explicitIntroitEntry,
    data:presentationWithMandatum,model,presentationModel,events,eventState,objectiveRuntime,registries,cueState,guide,scholaState,transientState,rubricState,gestureMatrixState,formState,
    aspergesController,palmController,ashController,candlemasController,rogationsController,
    requiemAbsolutionController,corpusChristiController,holyThursdayPostController,genericProcessionController,lifecycleRuntime,
    riteMusicRegistry:loadedRiteMusic,
    riteMusicSources:Object.freeze({
      ASPERGES:loadedAsperges?.payload??null,PALM:loadedPalm?.payload??null,
      CANDLEMAS:loadedCandlemas?.payload??null,ROGATIONS:loadedRogations?.payload??null,
      REQUIEM_ABSOLUTION:loadedRequiemAbsolution?.payload??null,
      CORPUS_CHRISTI:loadedCorpusChristi?.payload??null,
      HOLY_THURSDAY_POST:loadedHolyThursdayPost?.payload??null,
      GENERIC_PROCESSION:loadedGenericProcession?.payload??null,
    })
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
  riteMusicData=null,
  loadRiteMusicData=loadRiteMusicRegistry,
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
  mandatumSourceData=null,
  loadMandatumData=loadMandatumSource,
  genericProcessionData=null,
  loadGenericProcessionData=loadGenericProcessionReaderData,
  readLegacyActive=null,
  iconResolver=null,
  onClose=null,
}={}){
  if(!doc?.body || !doc?.createElement) throw new TypeError("Document/body required");

  // User-facing native mount always selects the certified 65-card LIVE
  // projection when eligible. The historical 48-step compatibility
  // projector is internal to source-only test/exception paths and is
  // never selected from URLs or mount options.
  const ready=await prepareNativeReaderPreview({
    prepared,reviewCuratedCards:true,presentationData,loadPresentationData,eventData,loadEventData,
    cueRegistries,loadCueRegistries,formStateData,loadFormStateData,guideData,loadGuideData,
    riteMusicData,loadRiteMusicData,
    aspergesData,loadAspergesData,palmData,loadPalmData,ashData,loadAshData,
    candlemasData,loadCandlemasData,rogationsData,loadRogationsData,
    goodFridayData,loadGoodFridayData,
    easterVigilData,loadEasterVigilData,
    requiemAbsolutionData,loadRequiemAbsolutionData,corpusChristiData,loadCorpusChristiData,
    holyThursdayPostData,loadHolyThursdayPostData,mandatumSourceData,loadMandatumData,genericProcessionData,loadGenericProcessionData,
  });

  doc.getElementById?.(ROOT_ID)?.remove?.();

  const root=doc.createElement("section");
  root.id=ROOT_ID;
  root.setAttribute("aria-label","Ad Orientem Mass reader");
  root.dataset.r17CuratedReview=String(ready.curatedEligible===true);
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
    let shownSurface=null;
    let disposeReadingFocus=()=>{};
    let personalControls=null;
    let communionControls=null;
    let deathCueRunning=false;
    let formulaCueRunning=false;
    let formulaKneelRecord=null;
    let formulaKneelScrollTop=null;
    const kneelRecord=id=>/^GF-SOP-\d\d-K$/.test(id??"")||/^GF-X-52[123]$/.test(id??"");
    const r28Posture=state=>kneelRecord(state.step?.recordId) &&
      formulaKneelRecord!==state.step.recordId ? "STAND" : state.posture;
    const formulaAnchor=record=>{
      if(/^GF-SOP-\d\d-K$/.test(record))return "Flectamus genua.";
      if(/^GF-SOP-\d\d-R$/.test(record))return "Levate.";
      if(/^GF-X-52[123]$/.test(record))return "Venite, adoremus.";
      return null;
    };
    const personalSteps=Object.freeze({
      "GF-VEN-600":Object.freeze({title:"Your Cross veneration",label:"It is my turn"}),
      "GF-VEN-610":Object.freeze({title:"Approach the Cross",label:"I am at the Cross"}),
      "GF-VEN-620":Object.freeze({title:"One simple genuflection",label:"I have genuflected"}),
      "GF-VEN-630":Object.freeze({title:"Venerate the Cross",label:"I have venerated"}),
      "GF-VEN-640":Object.freeze({title:"Return to your place",label:"Continue"}),
      "GF-COM-850":Object.freeze({title:"Your Holy Communion",label:"I have received"}),
    });

    function createGoodFridayControls(){
      const stage=host.querySelector?.(".ao-reader-stage");
      if(!stage)return;
      const panel=doc.createElement("div");
      panel.className="ao-rite-choice ao-good-friday-choice";
      panel.dataset.role="good-friday-personal";
      panel.hidden=true;
      panel.setAttribute("role","group");
      panel.setAttribute("aria-label","Your Good Friday action");
      const title=doc.createElement("span");
      title.className="ao-rite-choice-label";
      title.dataset.role="good-friday-choice-title";
      const action=doc.createElement("button");
      action.type="button";
      action.dataset.goodFridayAdvance="true";
      action.setAttribute("aria-label","Continue personal Good Friday action");
      panel.append(title,action);
      stage.append(panel);
      personalControls=panel;
    }

    const communionSpeakerLabels=Object.freeze({
      CELEBRANT:"Celebrant",
      DEACON:"Deacon",
      ALL:"All present",
      COMMUNICANTS:"Communicants",
      CHRONISTA:"Chronista · Narrator",
      CHRISTUS:"Christus · Christ",
      SYNAGOGA:"Synagoga · Other speakers",
    });

    function installCommunionSpeakerStyles(){
      const style=doc.createElement("style");
      style.textContent=`
        #ao-r17-native-reader-preview .ao-good-friday-speaker-label{
          display:block;margin:0 0 5px;
          font:600 10px/1.35 var(--ao-font-ui,system-ui,sans-serif);
          letter-spacing:.09em;text-transform:uppercase;color:#b2c0b6;
        }
        #ao-r17-native-reader-preview .ao-reader-paragraph[data-speaker]{
          padding-top:9px;
        }
        #ao-r17-native-reader-preview .ao-reader-paragraph[data-speaker="ALL"]{
          border-left:2px solid rgba(178,201,183,.46);
          padding-left:12px;
        }
        #ao-r17-native-reader-preview .ao-good-friday-repeat{
          display:inline-block;margin:0 0 8px;
          font:600 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
          letter-spacing:.03em;color:#b2c0b6;
        }
      `;
      root.append(style);
    }

    function updateCommunionSpeakerLabels(){
      // The canonical GF source paragraphs carry speaker metadata; labels
      // appear only when the speaker changes, never as extra liturgical text.
      const rowsById=new Map((controller.project().card?.paragraphs??[])
        .map(row=>[row.id,row]));
      let previous=null;
      for(const node of host.querySelectorAll?.(".ao-reader-paragraph[data-paragraph-id]")??[]){
        const row=rowsById.get(node.dataset.paragraphId);
        const speaker=row?.speaker??null;
        const repeat=node.querySelector(".ao-good-friday-repeat");
        if(row?.repetitions>1){
          const marker=repeat??doc.createElement("span");
          marker.className="ao-good-friday-repeat";
          marker.textContent=String(row.repetitions)+" times";
          if(!repeat)node.insertBefore(marker,node.querySelector(".ao-line-primary")??node.firstChild);
        }else repeat?.remove();
        const old=node.querySelector(".ao-good-friday-speaker-label");
        if(!speaker){
          delete node.dataset.speaker;
          old?.remove();
          previous=null;
          continue;
        }
        node.dataset.speaker=speaker;
        if(speaker===previous)old?.remove();
        else {
          const label=old??doc.createElement("span");
          label.className="ao-good-friday-speaker-label";
          label.textContent=communionSpeakerLabels[speaker]??speaker;
          if(!old)node.insertBefore(label,node.firstChild);
        }
        previous=speaker;
      }
    }

    function createCommunionControls(){
      const stage=host.querySelector?.(".ao-reader-stage");
      if(!stage)return;
      const panel=doc.createElement("div");
      panel.className="ao-rite-choice ao-good-friday-communion";
      panel.dataset.role="good-friday-communion-choice";
      panel.hidden=true;
      panel.setAttribute("role","group");
      panel.setAttribute("aria-label","Your Holy Communion");
      panel.innerHTML='<span class="ao-rite-choice-label">Will you receive Holy Communion?</span>'+
        '<span class="ao-rite-choice-actions">'+
        '<button type="button" data-gf-communion="false" aria-pressed="false">Remain</button>'+
        '<button type="button" data-gf-communion="true" aria-pressed="false">Receive</button>'+
        '</span>';
      stage.append(panel);
      communionControls=panel;
    }

    function updateCommunionControls(){
      if(!communionControls)return;
      const state=controller.project();
      const visible=state.step?.recordId==="GF-COM-840";
      communionControls.hidden=!visible;
      const stage=communionControls.closest(".ao-reader-stage");
      if(stage)stage.dataset.riteChoice=String(visible);
      if(!visible)return;
      for(const button of communionControls.querySelectorAll("[data-gf-communion]"))
        button.setAttribute("aria-pressed",
          String(button.dataset.gfCommunion===String(state.willReceiveCommunion)));
    }

    function onCommunionChoice(event){
      const button=event.target?.closest?.("[data-gf-communion]");
      if(!button||!communionControls?.contains?.(button)||communionControls.hidden)return;
      event.stopPropagation?.();
      const card=host.querySelector?.(".ao-prayer-card");
      const previousScroll=card?.scrollTop??0;
      controller.setWillReceiveCommunion(button.dataset.gfCommunion==="true");
      showGoodFriday();
      if(card)card.scrollTop=previousScroll;
    }

    function updateGoodFridayControls(){
      if(!personalControls)return;
      const state=controller.project(),id=state?.step?.recordId;
      const formulaAction=formulaKneelRecord===id ? (
        /^GF-X-52[123]$/.test(id) ?
          {title:"Silent adoration of the Cross",label:"Rise after adoration"} :
          {title:"Kneel at Flectamus genua",label:"Stand at Levate"}
      ) : null;
      const unveilingPending=/^GF-X-52[123]$/.test(id??"") &&
        formulaKneelRecord!==id
        ? {title:"At Venite, adoremus",label:"Kneel for adoration"}:null;
      const action=personalSteps[id]??(id==="GF-PASS-320"
        ? {title:"At the death of Our Lord",label:"Continue the Passion"}:
          formulaAction??unveilingPending);
      personalControls.hidden=!action;
      const stage=personalControls.closest(".ao-reader-stage");
      if(stage)stage.dataset.riteChoice=String(Boolean(action));
      if(!action)return;
      personalControls.querySelector('[data-role="good-friday-choice-title"]').textContent=action.title;
      personalControls.querySelector("[data-good-friday-advance]").textContent=action.label;
    }

    function deathPhraseRect(){
      const card=host.querySelector?.(".ao-prayer-card");
      const paragraph=card?.querySelector?.('.ao-reader-paragraph[data-cue-id="GF-PASS-320"]');
      const primary=paragraph?.querySelector?.(".ao-line-primary");
      if(!card||!primary||!doc.createRange)return null;
      const needle="tradidit spiritum";
      const walker=doc.createTreeWalker(primary,4);
      let node;
      while((node=walker.nextNode())){
        const text=String(node.textContent??"");
        const i=text.toLowerCase().lastIndexOf(needle);
        if(i<0)continue;
        const range=doc.createRange();
        range.setStart(node,i);
        range.setEnd(node,i+needle.length);
        return {card,rect:range.getBoundingClientRect(),viewport:card.getBoundingClientRect()};
      }
      return null;
    }

    function syncGoodFridayDeath(){
      if(deathCueRunning||controller.project()?.step?.recordId!=="GF-PASS-310")return;
      const loc=deathPhraseRect();
      if(!loc)return;
      const threshold=loc.viewport.top+loc.card.clientHeight*.39;
      // The actual Latin death words, not the card start, own the kneeling pause.
      const atEnd=loc.card.scrollTop>=loc.card.scrollHeight-loc.card.clientHeight-8;
      // On small screens the last Passion words can sit below the fixed
      // 39% line even at maximum scroll. At the real end of the same source
      // reading they must still trigger the pause, never be skipped.
      if((loc.card.scrollTop||0)<=8||
         (loc.rect.top>threshold&&!atEnd)||
         loc.rect.bottom<loc.viewport.top)return;
      deathCueRunning=true;
      try{controller.goToRecord("GF-PASS-320");showGoodFriday();}
      finally{deathCueRunning=false;}
    }

    function syncGoodFridayFormulas(){
      if(formulaCueRunning)return;
      const state=controller.project(),id=state.step?.recordId??"";
      if(!/^GF-SOP-\d\d-K$/.test(id) && !/^GF-X-52[123]$/.test(id))return;
      const card=host.querySelector?.(".ao-prayer-card");
      if(!card)return;
      const shell=card.getBoundingClientRect();
      const items=[...card.querySelectorAll(".ao-reader-paragraph[data-cue-id]")].map(node=>{
        const rect=node.getBoundingClientRect();
        return {cueId:node.dataset.cueId,
          top:rect.top-shell.top+card.scrollTop,bottom:rect.bottom-shell.top+card.scrollTop};
      });
      // In a short or densely segmented prayer, both formulae can fall
      // above the focus line on the first swipe. Never skip Flectamus:
      // until it has been reached, only its exact K words may activate.
      // Once kneeling is active, only the distinct Levate line may rise.
      const expected=formulaKneelRecord===id ? id.replace(/-K$/,"-R") : id;
      const reached=goodFridayFormulaAtFocus({
        scrollTop:card.scrollTop,clientHeight:card.clientHeight,
        items:items.filter(row=>row.cueId===expected),
      });
      if(!reached)return;
      // Rendering the kneeling cue does not constitute a second scroll.
      // Chromium may dispatch a deferred native scroll event after the
      // explicit first focus event; it must not immediately stand at Levate.
      // Require forward movement after Flectamus, or the explicit stand action.
      if(formulaKneelRecord===id && /^GF-SOP-\d\d-K$/.test(id) &&
        card.scrollTop<=(formulaKneelScrollTop??card.scrollTop)+2)return;
      formulaCueRunning=true;
      try{
        if(reached===id && formulaKneelRecord!==id){
          formulaKneelRecord=id;
          formulaKneelScrollTop=card.scrollTop;
          showGoodFriday();
        }else if(/^GF-SOP-\d\d-R$/.test(reached) &&
          reached===id.replace(/-K$/,"-R") && formulaKneelRecord===id){
          formulaKneelRecord=null;
          formulaKneelScrollTop=null;
          controller.goToRecord(reached);
          showGoodFriday();
        }
      }finally{formulaCueRunning=false;}
    }

    function onGoodFridayScroll(){
      syncGoodFridayDeath();
      syncGoodFridayFormulas();
    }

    function onGoodFridayAction(event){
      const target=event.target?.closest?.("[data-good-friday-advance]");
      if(!target||personalControls?.hidden||!personalControls?.contains?.(target))return;
      event.stopPropagation?.();
      const state=controller.project();
      const id=state.step?.recordId??"";
      if(/^GF-X-52[123]$/.test(id) && formulaKneelRecord!==id){
        // Three short unveiling cards have no scroll travel. A deliberate
        // user activation at the response is required: never guess the
        // source ceremony's timing from the card becoming visible.
        formulaKneelRecord=id;
        showGoodFriday();
        return;
      }
      if(!personalSteps[id] && id!=="GF-PASS-320" &&
        formulaKneelRecord!==id)return;
      formulaKneelRecord=null;
      formulaKneelScrollTop=null;
      controller.next();
      showGoodFriday();
    }

    function goodFridayMoment(){
      const state=controller.project();
      const card=state?.card;
      const step=state?.step;
      if(!card||!step)return null;
      const sourcePosture=r28Posture(state);
      const formulaActive=formulaKneelRecord===step.recordId;
      const formulaText=formulaActive?formulaAnchor(step.recordId):null;
      return Object.freeze({
        id:step.recordId,
        sectionTitle:"Good Friday",
        cardTitle:card.title,
        // Compare the last rendered surface. Going directly to a later
        // source step must load its text, but an in-group temporary posture
        // change must retain scroll and prayer focus.
        cardUpdate:shownSurface!==step.surfaceKey,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,
          kind:row.kind,
          primary:row.latin,
          secondary:row.vernacular??row.english??null,
          sourceCueIds:Object.freeze([...(row.sourceIds??[])]),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+" · Good Friday",
        riteMusic:projectRiteMusicBadge({
          registry:ready.riteMusicRegistry,riteId:"GOOD_FRIDAY",
          stageId:step.recordId,sourcePayload:ready.riteMusicSource,
        }),
        organPermission:project1962ReaderOrganNote({
          riteId:"GOOD_FRIDAY",stageId:step.recordId,
        }),
        posture:sourcePosture ? Object.freeze({label:sourcePosture}) : null,
        postureIconKey:({KNEEL:"kneel",STAND:"stand",SIT:"sit"})[sourcePosture]??null,
        cinematicScene:projectGoodFridayDeathScene({
          recordId:step.recordId,deathPause:step.recordId==="GF-PASS-320",
          posture:sourcePosture,
        }),
        ritualTrigger:/^GF-SOP-\d\d-R$/.test(step.recordId)
          ? Object.freeze({
            canonicalCueId:step.recordId,anchorLat:"Levate.",
            owner:"R28_GF_LEVATE_SOURCE",
          }):null,
        gesture:step.recordId==="GF-PASS-320"
          ? Object.freeze({
              // Keep the exact source action stable for the R28 Good Friday
              // contract and the low-tech faithful cue display. The
              // contextual Continue control presents the plain-language cue.
              label:state.action,action:state.action,
              canonicalCueId:"GF-PASS-320",anchorLat:"tradidit spiritum",
              owner:"R28_GF_PASSION_DEATH_SOURCE",
            })
          : formulaText ? Object.freeze({
            label:state.action??"KNEEL",
            action:state.action??"KNEEL",
            canonicalCueId:step.recordId,anchorLat:formulaText,
            owner:"R28_GF_FORMULA_EXACT_SOURCE",
          })
          : formulaActive || !kneelRecord(step.recordId)
            ? (state.action ? Object.freeze({label:state.action}):null)
            : null,
        guide:null,
      });
    }

    function showGoodFriday(){
      const state=controller.project(),step=state.step;
      const moment=goodFridayMoment();
      if(moment)reader.renderMoment(moment);
      if(step && step.surfaceKey!==shownSurface){
        const card=host.querySelector?.(".ao-prayer-card");
        if(card)card.scrollTop=0;
      }
      shownSurface=step?.surfaceKey??null;
      const dying=step?.recordId==="GF-PASS-320";
      const activeFormula=formulaKneelRecord===step?.recordId?step.recordId:null;
      const activeRise=/^GF-SOP-\d\d-R$/.test(step?.recordId??"")?step.recordId:null;
      for(const paragraph of host.querySelectorAll?.('.ao-reader-paragraph[data-cue-id]')??[]){
        if(paragraph.dataset.cueId==="GF-PASS-320" ||
           /^(GF-SOP-\d\d-[KR]|GF-X-52[123])$/.test(paragraph.dataset.cueId))
          paragraph.dataset.active=String(
            dying&&paragraph.dataset.cueId==="GF-PASS-320" ||
            activeFormula===paragraph.dataset.cueId ||
            activeRise===paragraph.dataset.cueId
          );
      }
      syncReaderRitualHighlights(host,moment?.ritualTrigger??moment?.gesture??null);
      updateCommunionSpeakerLabels();
      updateGoodFridayControls();
      updateCommunionControls();
      root.dataset.r17NativeRiteRecord=step?.recordId??"none";
      root.dataset.r17OwnerGesture=dying?"R28_GF_PASSION_DEATH_SOURCE":
        activeFormula?"R28_GF_FORMULA_EXACT_SOURCE":
        (kneelRecord(step?.recordId)?"R28_GF_FORMULA_PENDING":
          state.action?"R28_GF_CEREMONIAL":"R28_GF_EXACT_NONE");
      globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({
        specialRite:"GOOD_FRIDAY",recordId:step?.recordId??null,
        posture:r28Posture(state),personalState:state.personalState,
        exactFormulaActive:activeFormula,exactLevateActive:activeRise,
        objectState:state.objectState,deathPause:dying,
        willReceiveCommunion:state.willReceiveCommunion,
      });
      return state.card??null;
    }

    function moveGoodFriday(direction){
      const state=controller.project();
      formulaKneelRecord=null;
      formulaKneelScrollTop=null;
      if(direction==="next" && !state.atEnd)controller.next();
      else if(direction==="previous" && !state.atStart)controller.previous();
      return showGoodFriday();
    }

    reader=createReaderDomAdapter({
      root:host,
      iconResolver,
      allowPresentationModeSwitch:false,
      specialRiteMusicItinerary:()=>projectNativeRiteMusicItinerary({
        registry:ready.riteMusicRegistry,riteId:"GOOD_FRIDAY",
        controller,sourcePayload:ready.riteMusicSource,
      }),
      onPrevious:()=>moveGoodFriday("previous"),
      onNext:()=>moveGoodFriday("next"),
    });

    function destroyGoodFriday(){
      disposeReadingFocus();
      host.querySelector?.(".ao-prayer-card")?.removeEventListener?.("scroll",onGoodFridayScroll);
      host.removeEventListener?.("click",onGoodFridayAction);
      host.removeEventListener?.("click",onCommunionChoice);
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
    disposeReadingFocus=installDistinctRiteReadingFocus(root,{mode:prepared?.readerPreferences?.mode??"LIVE"});
    installCommunionSpeakerStyles();
    createGoodFridayControls();
    createCommunionControls();
    host.addEventListener?.("click",onGoodFridayAction);
    host.addEventListener?.("click",onCommunionChoice);
    host.querySelector?.(".ao-prayer-card")?.addEventListener?.("scroll",onGoodFridayScroll,{passive:true});
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
      goToGoodFridayRecord:id=>{
        formulaKneelRecord=null;
        formulaKneelScrollTop=null;
        controller.goToRecord(id);
        const card=showGoodFriday();
        // An explicit jump to the already source-owned death pause must
        // locate "tradidit spiritum". A long Passion paragraph can
        // otherwise open at its beginning under a misleading death banner.
        // Normal reading continues to trigger this stage only via the
        // separate source-word focus detector in syncGoodFridayDeath.
        if(id==="GF-PASS-320"){
          const loc=deathPhraseRect();
          if(loc){
            const target=loc.viewport.top+loc.card.clientHeight*.39;
            loc.card.scrollTop=Math.max(0,loc.card.scrollTop+loc.rect.top-target);
          }
        }
        return card;
      },
      setWillReceiveCommunion:value=>{
        controller.setWillReceiveCommunion(value);
        return showGoodFriday();
      },
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
    let disposeReadingFocus=()=>{};

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
        riteMusic:projectRiteMusicBadge({
          registry:ready.riteMusicRegistry,riteId:"EASTER_VIGIL",
          stageId:step.recordId,sourcePayload:ready.riteMusicSource,
          condition:ready.riteMusicCondition,
        }),
        organPermission:project1962ReaderOrganNote({
          riteId:"EASTER_VIGIL",stageId:step.recordId,
        }),
        posture:state.posture ? Object.freeze({label:state.posture}) : null,
        gesture:state.action ? Object.freeze({label:state.action}) : null,
        guide:null,
      });
    }

    function showEasterVigil(){
      inVigil=true;
      stage="VIGIL_ACTIVE";
      const moment=easterVigilMoment();
      if(moment)reader.renderMoment({...moment,bell:null,cinematic:null});
      root.dataset.r17OwnerBell="R33_EASTER_VIGIL_PRE_GLORIA_SILENCE";
      root.dataset.r17NativeRiteRecord=controller.project().step?.recordId??"none";
      root.dataset.r17CardOwner="R33_EASTER_VIGIL_COMPOSITE";
      root.dataset.r17StateOwner="R33_EASTER_VIGIL_GRAPH";
      return controller.project().card??null;
    }

    function showVigilMass(card){
      if(!card)return null;
      inVigil=false;
      stage="MASS_ACTIVE";
      currentMass=card;
      const vigilGloriaBell=projectEasterVigilGloriaBell({
        distinctRite:ready.distinctRite,massStarted:true,card,
      });
      reader.renderMoment({
        bell:vigilGloriaBell.bell,
        cinematic:vigilGloriaBell.cinematic,
        id:card.sectionId,
        sectionTitle:card.title,
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:card.paragraphs,
        progress:String(card.sequence)+" / "+String(model.totalCards)+" · Easter Vigil Mass",
        organPermission:project1962ReaderOrganNote({
          riteId:"EASTER_VIGIL_MASS",massCard:card,massModel:model,
        }),
        guide:null,
      });
      root.dataset.r17NativeRiteRecord="MASS:"+card.sectionId;
      root.dataset.r17OwnerBell=vigilGloriaBell.owner;
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
      specialRiteMusicItinerary:()=>projectNativeRiteMusicItinerary({
        registry:ready.riteMusicRegistry,riteId:"EASTER_VIGIL",
        controller,sourcePayload:ready.riteMusicSource,
        condition:ready.riteMusicCondition,
      }),
      onPrevious:()=>moveEasterVigil("previous"),
      onNext:()=>moveEasterVigil("next"),
    });

    function destroyEasterVigil(){
      disposeReadingFocus();
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
    disposeReadingFocus=installDistinctRiteReadingFocus(root,{mode:prepared?.readerPreferences?.mode??"LIVE"});
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

  // Print is sourced from the canonical 30-section MISSAL text model,
  // including AO.SM.B061 (Canon Per omnia / Amen), rather than from the
  // 39/48-step LIVE presentation. Mode and visible LIVE cards are unchanged.
  let bookletModel=null,printAssessment={ok:false},massPrintControl=null;
  try{
    bookletModel=buildReaderModeModels({
      prepared:ready.prepared,data:ready.data,mode:"MISSAL"
    }).sourceModel;
    printAssessment=assessMassTextPrint({
      prepared,model:bookletModel,
      guideRegistry:ready.guide?.registry??null,
      language:prepared?.readerPreferences?.language??"en"
    });
  }catch(error){
    // Fail closed; the native reader remains usable without print.
    printAssessment={ok:false,reason:String(error?.message??error)};
  }
  if(printAssessment.ok){
    const print=doc.createElement("button");
    print.type="button";
    print.dataset.aoNativeMassPrint="source-text";
    print.textContent=String(prepared?.readerPreferences?.language??"en").startsWith("fr")?"Imprimer":"Print text";
    print.setAttribute("aria-label",String(prepared?.readerPreferences?.language??"en").startsWith("fr")?"Imprimer les textes bilingues de la messe":"Print bilingual Mass texts");
    print.title=String(prepared?.readerPreferences?.language??"en").startsWith("fr")
      ?"Ordinaire et Propre, sans les rubriques complètes"
      :"Ordinary and Propers; detailed ceremonial rubrics not included";
    print.className="ao-mass-prefs-more";
    print.style.cssText="min-height:44px;font-size:11px;";
    print.addEventListener("click",()=>{
      try{
        const popup=doc.defaultView?.open?.("","_blank");
        if(!popup)throw new Error("PRINT_POPUP_BLOCKED");
        popup.opener=null;
        const html=renderMassTextPrintHtml({prepared,model:bookletModel,guideRegistry:ready.guide.registry,language:prepared?.readerPreferences?.language??"en"});
        popup.document.open();popup.document.write(html);popup.document.close();
        root.dataset.aoNativePrintStatus="READY";
      }catch(error){
        root.dataset.aoNativePrintStatus="UNAVAILABLE";
        console.error("Native reader Mass text print failed closed",error);
        print.title=String(prepared?.readerPreferences?.language??"en").startsWith("fr")
          ?"Impression indisponible; vérifier l’autorisation des fenêtres"
          :"Print unavailable; check browser pop-up permissions";
      }
    });
    massPrintControl=print;
  }
  // Pre-Mass actions are independently witnessed, never inferred from C0001.
  const priestEntranceState=createObservedPriestEntranceController({
    form:ready.prepared.session.resolvedMass.form
  });
  // Optional human witness only; never linked to reading position or Schola.
  const chaliceObservationState=createObservedChalicePreparationController({
    resolvedMass:ready.prepared.session.resolvedMass
  });
  // The live Canon action clock is driven exclusively by an independent
  // observer. This does not modify the decorative cue-focused experience.
  const canonStageObservation=ready.curatedEligible && ready.data?.rubricEvents
    ? createLiveCanonStageObservationController({
        registry:ready.data.rubricEvents,
        form:ready.prepared.session.resolvedMass.form,
      }):null;
  let sourceModel=ready.model;
  let readerModel=ready.presentationModel??ready.model;
  const mandatumController=ready.model?.mandatumSource
    ?createMandatumEventController({
      source:ready.model.mandatumSource,
      language:prepared?.readerPreferences?.language??"en"
    }):null;
  let current=readerModel.cardBySequence(1);
  let reader=null;
  let canonManualUI=null;
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
  let modeSwitchCueLock=null;
  let scholaPinnedByCatchup=false;
  let selectedScholaEvent=null;
  let stopModeSwitchCueLock=()=>{};
  let enteredCanonicalCueSequence=false;
  // Explicit external observation only; neither scroll focus nor Schola audio
  // may invent the priest's private Sanctus/Benedictus recitation.
  let observedPriestEvent=null;
  const sourceCueClocks=new Map(
    (ready.data?.sungCorpus?.blocks??[])
      .flatMap(block=>block.units??[])
      .map(unit=>[unit.cue_id,unit.clock])
  );
  let observedCuratedPriestEvent=null;
  const priestEventIndex=new Map(ready.events.map(e=>[e.id,e]));
  let scheduled=false;
  let initialCardRender=true;
  let partCinematic=null;
  let eventCinematic=null;
  let partCinemaTimer=null;
  let eventCinemaTimer=null;
  let canonStageTimer=null;
  let lastEventCinemaCue=null;
  const transientGuard=createCardTransitionTransientGuard();
  const win=doc.defaultView ?? globalThis;
  let customStorage=null;
  try{customStorage=win.localStorage??null;}catch{}
  let customaryPrefs=readMassCustomaryPreferences(prepared.readerPreferences,customStorage);
  ready.scholaState.setSanctusPerformance?.(customaryPrefs.sanctusPerformance);
  let scholaLocalProgramme=readScholaLocalProgramme(customStorage);
  let riteChoice=null;
  let palmGospelCueVisible=null;

  function createRiteChoice(){
    const stage=host.querySelector?.(".ao-reader-stage");
    if(!stage)return;
    const panel=doc.createElement("div");
    panel.className="ao-rite-choice";
    panel.dataset.role="rite-choice";
    panel.hidden=true;
    panel.setAttribute("role","group");
    panel.setAttribute("aria-label","Personal procession participation");
    panel.innerHTML='<span class="ao-rite-choice-label" data-rite-choice-title></span>'+
      '<span class="ao-rite-choice-actions">'+
      '<button type="button" data-rite-participation="false" aria-pressed="true">Remain</button>'+
      '<button type="button" data-rite-participation="true" aria-pressed="false">Join</button>'+
      '</span>';
    stage.append(panel);
    riteChoice=panel;
  }

  function syncRiteChoice(kind,state){
    if(!riteChoice)return;
    const id=state?.card?.id;
    const eligible=(kind==="PALM"&&["PALM-R04","PALM-R05"].includes(id)) ||
      (kind==="CANDLEMAS"&&["CND-R05","CND-R06"].includes(id)) ||
      (kind==="REQUIEM_ABSOLUTION"&&id==="ABS-R05") ||
      (kind==="HOLY_THURSDAY_POST"&&id==="HT-R02") ||
      (kind==="MANDATUM"&&current?.sectionId==="AO.HT.MANDATUM");
    riteChoice.hidden=!eligible;
    const stage=riteChoice.closest(".ao-reader-stage");
    if(stage)stage.dataset.riteChoice=String(eligible);
    if(!eligible)return;
    riteChoice.dataset.rite=kind;
    riteChoice.querySelector("[data-rite-choice-title]").textContent=
      kind==="MANDATUM"?"Are you having your foot washed?":
      kind==="REQUIEM_ABSOLUTION"?"Follow the burial procession?":
      kind==="HOLY_THURSDAY_POST"?"After the Sacrament passes, will you follow?":"Join this procession?";
    for(const button of riteChoice.querySelectorAll("[data-rite-participation]")){
      button.textContent=kind==="MANDATUM"
        ?(button.dataset.riteParticipation==="true"?"Participant":"Observer")
        :(button.dataset.riteParticipation==="true"?"Join":"Remain");
    }
    const selected=kind==="MANDATUM"?state.participant:
      kind==="PALM" ? state.processionParticipant :
      kind==="CANDLEMAS" ? state.processionParticipant :
      kind==="HOLY_THURSDAY_POST" ? (state.joiningState==="WAITING"
        ? null : state.joiningState==="JOINING") : state.burialParticipant;
    for(const button of riteChoice.querySelectorAll("[data-rite-participation]")){
      button.setAttribute("aria-pressed",String(selected!==null &&
        button.dataset.riteParticipation===String(Boolean(selected))));
    }
  }

  function syncPalmGospelCue(){
    if(!inPalm || ready.palmController?.project?.().card?.id!=="PALM-R03")return;
    const card=host.querySelector?.(".ao-prayer-card");
    if(!card)return;
    const rect=card.getBoundingClientRect();
    const items=[...card.querySelectorAll(".ao-reader-paragraph[data-paragraph-id^='PALM-R03-']")].map(node=>{
      const bounds=node.getBoundingClientRect();
      return {id:node.dataset.paragraphId,top:bounds.top-rect.top+card.scrollTop,bottom:bounds.bottom-rect.top+card.scrollTop};
    });
    const activeId=palmGospelFocusedRow({
      scrollTop:card.scrollTop,clientHeight:card.clientHeight,scrollHeight:card.scrollHeight,items
    });
    for(const node of card.querySelectorAll(".ao-reader-paragraph[data-paragraph-id^='PALM-R03-']"))
      node.dataset.active=String(node.dataset.paragraphId===activeId);
    const show=activeId===PALM_GOSPEL_HEADING_ID;
    if(show===palmGospelCueVisible)return;
    palmGospelCueVisible=show;
    const gesture=show?{
      label:"Forehead · lips · breast",action:"Gospel small crosses",type:"GOSPEL_CROSSES",
      canonicalCueId:PALM_GOSPEL_HEADING_ID,
      anchorLat:"Sequéntia sancti Evangélii",
      owner:"R22_PALM_GOSPEL_HEADING_SOURCE",
    }:null;
    reader.renderMoment({cardUpdate:false,gesture,gestureIconKey:show?"gospel_crosses":null});
    root.dataset.r17OwnerGesture=show?"R22_PALM_GOSPEL_HEADING_SOURCE":"R22_PALM_GOSPEL_READING_NONE";
    const previous=globalThis.AO_R17_NATIVE_READER_STATE??{};
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({...previous,gesture,palmGospelActive:show});
  }

  function onRiteChoiceClick(event){
    const button=event.target?.closest?.("[data-rite-participation]");
    if(!button||!riteChoice?.contains?.(button)||riteChoice.hidden)return;
    event.stopPropagation?.();
    const participating=button.dataset.riteParticipation==="true";
    const scroll=host.querySelector?.(".ao-prayer-card");
    const position=scroll?.scrollTop??0;
    if(riteChoice.dataset.rite==="PALM"&&inPalm){
      ready.palmController.setProcessionParticipant(participating);showPalm();
    }else if(riteChoice.dataset.rite==="CANDLEMAS"&&inCandlemas){
      ready.candlemasController.setProcessionParticipant(participating);showCandlemas();
    }else if(riteChoice.dataset.rite==="REQUIEM_ABSOLUTION"&&inRequiemAbsolution){
      ready.requiemAbsolutionController.setBurialParticipant(participating);showRequiemAbsolution();
    }else if(riteChoice.dataset.rite==="MANDATUM"&&mandatumController && current?.sectionId==="AO.HT.MANDATUM"){
      mandatumController.setParticipant(participating);showMandatumStage();
    }else if(riteChoice.dataset.rite==="HOLY_THURSDAY_POST"&&inHolyThursdayPost){
      // Choosing Follow is itself the moment of joining, after the
      // Sacrament passes: WAITING must never become STAND_WALK by default.
      ready.holyThursdayPostController.setJoiningState(participating?"JOINING":"NOT_JOINING");
      showHolyThursdayPost();
    }else return;
    if(scroll)scroll.scrollTop=position;
  }

  function clearScheduledTimer(timer){
    if(timer==null)return;
    const clear=win?.clearTimeout ?? globalThis.clearTimeout;
    if(typeof clear==="function")clear.call(win,timer);
  }
  function later(fn,ms){
    const set=win?.setTimeout ?? globalThis.setTimeout;
    return typeof set==="function" ? set.call(win,fn,ms) : null;
  }
  function clearCanonObservation(){
    clearScheduledTimer(canonStageTimer);
    canonStageTimer=null;
    return canonStageObservation?.reset()??null;
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

  function currentObservedCuratedPriestEvent(){
    if(!ready.curatedEligible || !readerModel?.curatedPresentationReview ||
       !observedCuratedPriestEvent || !current)return null;
    return projectObservedOrdinaryPriestEvent({
      observedEventId:observedCuratedPriestEvent.eventId,
      independentlyObserved:true,
      form:prepared?.session?.resolvedMass?.form,
      conditions:[...(ready.cueState.conditions??[]),...observedCuratedPriestEvent.conditions],
      sourceSectionId:current.sourceSectionId??current.sectionId,
      eventIndex:priestEventIndex,cueController:ready.cueState,
      observedActor:observedCuratedPriestEvent.observedActor??null,
      observedDelivery:observedCuratedPriestEvent.observedDelivery??null,
      observedPosition:observedCuratedPriestEvent.observedPosition??null,
      observedAction:observedCuratedPriestEvent.observedAction??null,
    });
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

    // Exact native cue ownership is independent of the legacy/event compatibility
    // channel. If a canonical cue is visible in the native reader, its gesture,
    // response, action, position, voice and posture source may project. The
    // eventAllowed flag only controls legacy event-state fallback above.
    const cueProjection=activeCueId ? ready.cueState.project(activeCueId) : null;
    const observedPriest=currentObservedCuratedPriestEvent();
    const observedChalicePreparation=(current?.sourceSectionId??current?.sectionId)==="AO.CARD.010"
      ? chaliceObservationState.project() : null;
    const gestureProfile=customaryPrefs.gestureProfile;
    const owned=resolveCueOwnedChannels({
      cueControllerSupported:ready.cueState.supported,
      cueProjection,
      eventState,
      legacy,
      cueId:activeCueId,
      gestureProfile,
    });
    const cueNative=owned.cueNative;
    const resolvedMass=ready.prepared?.session?.resolvedMass;
    const form=resolvedMass?.form??"LOW";
    const incarnatusAction=resolveIncarnatusSungAction(resolvedMass);
    const faithfulCueFor=id=>{
      if(!id)return null;
      const source=ready.cueState.supported?ready.cueState.project(id):null;
      return projectGloriaCredoFaithfulCue({
        cueId:id,form,preferences:customaryPrefs,
        sourcedPosture:source?.posture??null,incarnatusAction,
      });
    };
    const focusedFaithful=faithfulCueFor(activeCueId);
    // Every Latin cue paragraph retains its own faithful posture/gesture.
    // The priest's sedilia witness is advisory: no fabricated source cue.
    const paragraphCues=Object.freeze(Object.fromEntries(
      (current?.paragraphs??[]).flatMap(p=>{
        const ids=p.sourceCueIds??[p.id];
        const id=ids.find(v=>projectGloriaCredoFaithfulCue({
          cueId:v,form,preferences:customaryPrefs,incarnatusAction,
        }));
        if(!id)return [];
        const projection=faithfulCueFor(id);
        return projection?[[String(p.id),projection]]:[];
      })
    ));
    const transientProjection=activeCueId ? ready.transientState.project(activeCueId) : ready.transientState.project(null);
    const observedCanon=canonStageObservation && current?.curatedPresentationReview===true &&
      readerModel?.sourceModelTotalCards===39 &&
      String(readerModel?.presentationMode).toUpperCase()==="LIVE" &&
      canonStageObservation.snapshot().cueId===activeCueId
        ? canonStageObservation.snapshot():null;
    const rubricProjection=activeCueId ? ready.rubricState.project(activeCueId) : ready.rubricState.project(null);
    const gestureMatrixProjection=activeCueId ? ready.gestureMatrixState.project(activeCueId) : ready.gestureMatrixState.project(null);
    const transient=transientGuard.filter({
      gesture:owned.gesture,
      response:owned.response,
      bell:transientProjection.bell,
      cinematic:eventCinematic,
    });
    const gesture=focusedFaithful ? focusedFaithful.gesture : transient.gesture;
    const response=transient.response;
    // The combined source cue covers five distinct published rubric actions.
    // After any explicit Canon observation, source focus must not invent a
    // simultaneous elevation bell or animate the next ceremonial stage.
    const canonBellStage=resolveCanonStageBellCinematic({
      cueId:activeCueId,expectedBell:transient.bell,
      expectedCinematic:partCinematic??transient.cinematic,
      observedCanon,
    });
    const lowCommunionWarning=projectLowMassCommunionWarning({
      form,activeCueId,
      conditions:[...(resolvedMass?.conditions??[]),
        ...(ready.prepared?.session?.conditions??[])],
      canonicalTransient:transientProjection,
      transitionPending:transientGuard.pending===true,
    });
    const communionBell=lowCommunionWarning.bell??canonBellStage.bell;
    const communionCinematic=lowCommunionWarning.cinematic??canonBellStage.cinematic;
    const triduumBell=projectHolyThursdayBell({
      resolvedMass,cueId:activeCueId,
      expectedBell:communionBell,expectedCinematic:communionCinematic,
    });
    const bell=triduumBell.bell;
    const cinematic=triduumBell.cinematic;
    const sourcePriestPosition=observedPriest?.priestPosition ??
      (focusedFaithful?.conditionalSedilia
      ? Object.freeze({station:"SEDILIA",label:"AT SEDILIA",
          value:"SEDILIA",owner:"CUSTOMARY_SEDILIA_WITNESS",
          sourceCueId:focusedFaithful.priestStateWitness})
      : owned.priestPosition);
    // Only the source-backed curated LIVE family receives the new state
    // projection. A card scroll is never an observed priest movement.
    const finalCurated65=readerModel?.structureOwner==="SOURCE_FIRST_LIVE_CURATED_65_REVIEW" &&
      [65,66,67].includes(readerModel?.totalCards) &&
      readerModel?.presentationMode==="LIVE";
    const curatedLocation=projectCurated65PriestStation({
      cueId:activeCueId,sourcePosition:sourcePriestPosition,
      form,observedPriestEventId:observedPriest?.eventId??null,
      enabled:finalCurated65,
      sermonPause:current?.blocks?.some(block=>block.blockId==="AO.SM.B096")===true,
    });
    const priestPosition=curatedLocation?.priestPosition??sourcePriestPosition;

    // Posture ownership is profile-aware. FOLLOW_CONGREGATION remains an
    // observed rollback channel; sourced/local profiles never silently inherit it.
    const postureResolved=resolveReaderPostureChannel({
      preferences:customaryPrefs,
      cueProjection:cueNative ? cueProjection : null,
      legacyPosture:eventAllowed ? legacy.posture : null,
      cueId:activeCueId,
      resolvedMass,
      // Preserve pre-V5 local posture keys. The 48-step layer owns display IDs
      // only; saved section overrides continue to target the source AO.CARD.* id.
      sectionId:current?.sourceSectionId??current?.sectionId??null,
      macroId:current?.macroId??null,
    });
    const posture=focusedFaithful && !cueProjection?.posture?.fixed
      ? Object.freeze({label:focusedFaithful.posture,value:focusedFaithful.posture,
          owner:focusedFaithful.source,persistent:true})
      : postureResolved.posture;


    const scholaProjection=ready.scholaState.project();
    // Reading a Consecration card is a liturgical silence restriction,
    // never evidence that the Schola was heard finishing. Preserve its
    // independent underlying position for a possible post-Chalice Benedictus.
    const consecrationSilence=Boolean((current?.blocks??[]).some(block=>
      ["AO.SM.B052","AO.SM.B053"].includes(block.blockId)));
    const lastChaliceCard=readerModel?.cards?.filter(card=>
      (card.blocks??[]).some(block=>block.blockId==="AO.SM.B053")).at(-1);
    const benedictusReleaseAllowed=Boolean(lastChaliceCard &&
      Number(current?.sequence)>Number(lastChaliceCard.sequence));
    const visibleSchola=consecrationSilence ? null :
      scholaProjection.schola
        ? Object.freeze({...scholaProjection.schola,benedictusReleaseAllowed})
        : null;
    // Duplication is a card/chant relationship, not proof that the priest's
    // current paragraph and the choir's phrase clocks have synchronized.
    // Keep the central sung text as the sole lyric surface throughout the
    // entire matching Kyrie/Gloria/Credo/Sanctus/Agnus or Proper card.
    const visibleTrack=ready.scholaState.tracks?.find(track=>
      track.id===scholaProjection.trackId);
    const visibleCueIds=new Set((current?.paragraphs??[])
      .flatMap(paragraph=>paragraph.sourceCueIds??[]));
    const visibleBlockIds=new Set((current?.blocks??[])
      .map(block=>block.blockId));
    const sameSungCard=Boolean(visibleSchola && visibleTrack && (
      (visibleTrack.segments??[]).some(segment=>
        segment.cueId && visibleCueIds.has(segment.cueId)) ||
      (visibleTrack.canonicalBlockIds??[]).some(id=>visibleBlockIds.has(id))));
    const rubricAction=rubricProjection?.primaryPriestAction??null;
    const matrixAction=gestureMatrixProjection?.primaryPriestAction??null;
    // Matrix text wins, but the same-cue rubric retains an authoritative
    // icon identity if the matrix has not bound its icon yet.
    const resolvedMatrixAction=matrixAction && !matrixAction.iconKey &&
      matrixAction.iconStatus!=="PENDING_EXACT_MASTER" &&
      rubricAction?.iconKey && rubricAction.cueId===matrixAction.cueId
      ? Object.freeze({...matrixAction,iconKey:rubricAction.iconKey})
      : matrixAction;
    // The C0185 frozen priest label omits the separately prescribed Chalice
    // cross. Only in LIVE may the already certified matrix correct its
    // wording; this does not claim the two gestures have been observed.
    const canonLiveAction=certifiedLiveCanonActionOverride({
      presentationMode:readerModel?.presentationMode,
      curatedPresentation:current?.curatedPresentationReview===true &&
        readerModel?.sourceModelTotalCards===39,
      cueId:activeCueId,matrixAction:resolvedMatrixAction,
    });
    const originalPriestAction=canonLiveAction??cueProjection?.priestAction??resolvedMatrixAction??rubricAction??null;
    const priestLane=resolvePriestChantAction({
      form,cueId:activeCueId,sourceClock:sourceCueClocks.get(activeCueId)??null,
      observation:observedPriestEvent,gestureMatrix:ready.data?.gestureMatrix,
      ordinaryAction:originalPriestAction
    });
    const priestVoiceState=resolvePriestChantVoice({
      form,cueId:activeCueId,sourceClock:sourceCueClocks.get(activeCueId)??null,
      ordinaryVoice:owned.priestVoice,
      observedPriestAction:priestLane,observation:observedPriestEvent
    });
    const priestVoice=observedPriest?.priestVoice??priestVoiceState.priestVoice;
    const priestQuietOffertory=projectPriestQuietOffertory({
      cueId:activeCueId,
      sourceClock:sourceCueClocks.get(activeCueId)??null,
      form,mode:readerModel?.presentationMode,
      language:ready.prepared?.readerPreferences?.language??"en",
    });
    const priestEntrance=priestEntranceState.project();
    const preMassPriestAction=projectObservedPreMassPriestAction({
      state:priestEntrance,activeCueId,
      preMassVisualWindowOpen:!enteredCanonicalCueSequence && current?.sequence===1
    });
    const priestAction=observedCanon?.priestAction??observedPriest?.priestAction??preMassPriestAction??priestLane.priestAction;
    const ownership=Object.freeze({
      ...owned.ownership,
      gesture:transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : owned.ownership.gesture,
      response:transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : owned.ownership.response,
      bell:triduumBell.applies && (triduumBell.suppressed || activeCueId==="AO.SM.C0053")
        ? triduumBell.owner
        : lowCommunionWarning.bell
          ? lowCommunionWarning.owner
        : canonBellStage.observationOverrides ? canonBellStage.bellOwner
        : transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED" : transientProjection.ownership.bell,
      cinematic:triduumBell.applies && activeCueId==="AO.SM.C0053"
        ? triduumBell.owner
        : lowCommunionWarning.cinematic
          ? lowCommunionWarning.owner
        : canonBellStage.observationOverrides
        ? canonBellStage.cinematicOwner
        : partCinematic ? partCinematic.owner
        : transientGuard.pending ? "V1_83_CARD_TRANSITION_CLEARED"
        : eventCinematic ? transientProjection.ownership.cinematic
        : transientProjection.cinematic ? "R17_CUE_CINEMATIC_CONSUMED"
        : transientProjection.ownership.cinematic,
      posture:focusedFaithful ? focusedFaithful.source : postureResolved.owner,
      schola:scholaProjection.ownership,
      priestEntrance:priestEntrance.sourceOwner,
      priestVoice:observedPriest?.priestVoice ? "EXPLICIT_SOURCE_PRIEST_EVENT" : priestVoiceState.owner==="EXISTING_SOURCE_VOICE" ? owned.ownership.priestVoice : priestVoiceState.owner,
      priestPosition:observedPriest?.priestPosition ? "EXPLICIT_SOURCE_PRIEST_EVENT" : owned.ownership.priestPosition,
      priestAction:observedCanon?.priestAction ? "INDEPENDENT_CANON_PRIEST_OBSERVATION" :
        observedPriest?.priestAction ? "EXPLICIT_SOURCE_PRIEST_EVENT" : preMassPriestAction
        ? "OBSERVED_PREMASS_PRIEST"
        : priestLane.owner==="INDEPENDENT_PRIEST_OBSERVATION"
        ? "INDEPENDENT_PRIEST_OBSERVATION"
        : priestLane.owner==="PRIEST_EVENT_UNOBSERVED"
          ? "PRIEST_EVENT_UNOBSERVED_FAIL_CLOSED"
          : canonLiveAction
            ? "GESTURE_MATRIX_SOT_CERTIFIED_LIVE_CANON"
            : cueProjection?.priestAction
              ? cueProjection?.ownership?.priestAction??"R18_CUE_WAITING_FAIL_CLOSED"
            : gestureMatrixProjection?.primaryPriestAction
              ? "GESTURE_MATRIX_SOT"
              : rubricProjection?.primaryPriestAction
                ? "R17_RUBRIC_EVENT_OVERLAY"
                : "R18_CUE_WAITING_FAIL_CLOSED",
      sacredMinister:cueProjection?.ownership?.sacredMinister??"R18_CUE_WAITING_FAIL_CLOSED",
    });
    // Decorative focus follows a certified exact LIVE cue; it is never
    // evidence that the priest (or the faithful) performed an action.
    const cinematicScene=projectLiveCinematicScene({
      mode:readerModel?.presentationMode,
      cueId:activeCueId,
      cueNative,
      cinematic:canonBellStage.observationOverrides
        ? canonBellStage.cinematic : transient.cinematic,
      faithfulGesture:focusedFaithful?.gesture??null,
      priestAction,
      priestPosition,
      sourceGestureAction:gestureMatrixProjection?.primaryPriestAction??null,
    });
    const attention=readerAttentionForState({priestVoice,response});
    // A native source transition may animate the selected posture owner.
    // Never issue a conflicting instruction when a local/observed profile
    // deliberately resolved a different faithful posture.
    const localTransition=postureResolved.owner==="LOCAL_OVERRIDE" &&
      postureResolved.localKey===activeCueId && Boolean(posture);
    const sediliaMovement=focusedFaithful?.conditionalSedilia===true && (
      activeCueId==="AO.SM.C0065" ||
      activeCueId===customaryPrefs.credoSitStart
    );
    const sediliaReturn=focusedFaithful && !focusedFaithful.conditionalSedilia &&
      customaryPrefs.followPriestSeating!==false &&
      ["AO.SM.C0068","AO.SM.C0104"].includes(activeCueId);
    const choirMovement=postureResolved.owner==="REQUIEM_CHOIR_1962" &&
      postureResolved.posture?.transition===true &&
      postureResolved.posture?.cueId===activeCueId &&
      String(posture?.value??posture?.label??"")===postureResolved.posture.value;
    const postureCue=(sediliaMovement||sediliaReturn)
      ? Object.freeze({...posture,cueId:activeCueId,
          owner:"CUSTOMARY_PRIEST_SEDILIA_TRANSITION"})
      : localTransition
        ? Object.freeze({...posture,cueId:activeCueId,owner:"LOCAL_CUSTOMARY_CUE"})
      : choirMovement ? postureResolved.posture
      : cueNative && cueProjection?.postureTransition===true &&
        cueProjection?.posture?.cueId===activeCueId &&
        String(posture?.value??posture?.label??"")===String(cueProjection.posture.value??cueProjection.posture.label??"")
        ? cueProjection.posture : null;
    const iconKeys=iconKeysForReaderState({
      priestPosition,posture,gesture,response,priestVoice,
      priestAction,bell,schola:scholaProjection.schola,
      cueId:activeCueId,curated65FinalArt:finalCurated65,
      form
    });
    return Object.freeze({
      priestPosition,
      priestMissalLocation:curatedLocation?.missalLocation??null,
      priestStationConfidence:curatedLocation?.reason??null,
      posture,
      postureCue,
      paragraphCues,
      gesture,
      response,
      attention,
      attentionIconKey:attention?.iconKey??null,
      bell,
      cinematic,
      cinematicScene,
      canonStageBellOverride:canonBellStage.observationOverrides,
      canonStageSoundPhaseOwner:canonBellStage.phaseOwner,
      triduumBellOwner:triduumBell.owner,
      triduumBellSuppressed:triduumBell.suppressed,
      lowCommunionBellStatus:lowCommunionWarning.status??null,
      priestVoice,
      priestQuietOffertory,
      schola:visibleSchola,
      scholaCatchupPinned:scholaPinnedByCatchup,
      scholaEventSelection:selectedScholaEvent,
      priestAction,
      priestEntrance,
      independentlyObservedCanonStage:observedCanon,
      // Audit-only report: no timed priest/minister action or rail projection.
      observedChalicePreparation,
      sacredMinister:cueProjection?.sacredMinister??null,
      sacredMinisterAdvisory:cueProjection?.sacredMinisterAdvisory??null,
      rubricEvents:rubricProjection?.events??Object.freeze([]),
      rubricStates:rubricProjection?.activeStates??Object.freeze({}),
      gestureMatrixPriest:gestureMatrixProjection?.priest??Object.freeze([]),
      gestureMatrixFaithful:gestureMatrixProjection?.faithful??Object.freeze([]),
      sharedTextWithSchola:sameSungCard,
      sharedScholaControls:String(readerModel?.presentationMode??"").toUpperCase()==="LIVE",
      musicSilenceRequired:consecrationSilence,
      customary:Object.freeze({
        postureProfile:customaryPrefs.postureProfile,
        gestureProfile:customaryPrefs.gestureProfile,
        secondConfiteor:customaryPrefs.secondConfiteor,
        sanctusPerformance:customaryPrefs.sanctusPerformance,
        localPosture:customaryPrefs.localPostures[activeCueId]??"DEFAULT",
        localGesture:customaryPrefs.localGestures?.[activeCueId]??"DEFAULT",
        followPriestSeating:customaryPrefs.followPriestSeating,
        credoSitStart:customaryPrefs.credoSitStart,
        localPostures:customaryPrefs.localPostures,
        cueId:activeCueId,
        localPostureEditable:Boolean(activeCueId && !cueProjection?.posture?.fixed),
      }),
      ...iconKeys,
      nativeEventId:eventState?.canonicalEventId??null,
      independentlyObservedPriestEvent:observedPriest?.eventId??null,
      sourceOnlyPriestCue:observedPriest?.cueId??null,
      nativeCueId:activeCueId,
      cueProjectionSupported:cueNative,
      cueProjectionReason:cueProjection?.reason??null,
      ownership,
    });
  }
  function guideForCurrent(card=current){
    return card ? guideForPresentationCard(ready.guide.registry,card) : null;
  }

  function riteMusicAt(riteId,cardId,condition=null){
    return projectRiteMusicBadge({
      registry:ready.riteMusicRegistry,riteId,stageId:cardId,
      sourcePayload:ready.riteMusicSources?.[riteId]??null,condition
    });
  }

  function aspergesMoment(){
    const state=ready.aspergesController?.project?.();
    const card=state?.card;
    if(!card)return null;
    const french=String(prepared?.readerPreferences?.language??"en").toLowerCase().startsWith("fr");
    const displayTitle=String((french?card.titleFr:card.title)??card.title);
    const displayGuide=String((french?card.guideFr:card.guide)??card.guide??"");
    const spokenRows=(card.paragraphs??[]).map(row=>Object.freeze({
      id:row.id,
      kind:row.kind,
      primary:row.latin,
      sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
    }));
    // Three R20 action/transition cards legitimately have no spoken prayer.
    // Surface their existing guidance as an explicitly nonspoken RUBRIC,
    // without assigning a source cue or inventing a liturgical text.
    const visibleRows=spokenRows.length?spokenRows:displayGuide
      ? [Object.freeze({id:card.id+".guide",kind:"RUBRIC",primary:displayGuide,
          active:true,sourceCueIds:Object.freeze([])})]
      : [];
    return Object.freeze({
      state,
      moment:Object.freeze({
        id:card.id,
        sectionTitle:displayTitle,
        cardTitle:displayTitle,
        cardUpdate:true,
        paragraphs:Object.freeze(visibleRows),
        progress:String(state.index+1)+" / "+String(state.total)+" · Asperges",
        posture:card.posture && card.posture!=="INHERIT" ? {label:card.posture} : null,
        gesture:state.faithfulGesture ? {label:state.faithfulGesture} : null,
        response:null,
        bell:null,
        cinematic:null,
        priestPosition:null,
        priestVoice:null,
        schola:null,
        riteMusic:riteMusicAt("ASPERGES",card.id,state.formulaState?.formula),
        guide:displayGuide ? {registryAvailable:true,text:displayGuide} : null,
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
    // Curated Introit is a dedicated source block, not sequence 1.
    const card=readerModel.cards.find(value=>
      value.blocks?.some(block=>block.blockId==="AO.SM.B014"));
    if(!card)return null;
    const block=card.blocks?.find?.(value=>value.blockId==="AO.SM.B014");
    if(!block || block.firstParagraphIndex==null || !block.paragraphCount){
      throw new Error("Native prelude Introit handoff cannot resolve AO.SM.B014");
    }
    const paragraphs=card.paragraphs.slice(block.firstParagraphIndex,block.firstParagraphIndex+block.paragraphCount);
    // This is a one-block presentation slice. Its source block offsets
    // must be relative to the displayed rows, not the parent 30-card model:
    // the LIVE section-spacing projector validates local source ownership.
    // Never mutate the canonical Introit model or insert pre-Mass prayers.
    const displayBlock=Object.freeze({...block,firstParagraphIndex:0,paragraphCount:paragraphs.length});
    return Object.freeze({...card,title:"Introit",paragraphs:Object.freeze(paragraphs),
      blocks:Object.freeze([displayBlock]),precedingRiteIntroitOnly:true});
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
          : (kind==="PALM" ? state.posture : card.posture) && !["LOCAL","ORDINARY_PROFILE","INHERIT"].includes(kind==="PALM" ? state.posture : card.posture)
            ? {label:kind==="PALM" ? state.posture : card.posture}
            : null,
        // A card-level Gospel-cross flag is not an event trigger: only the
        // exact PALM-R03-01 heading can activate the three small crosses.
        gesture:null,
        response:null,bell:null,cinematic:null,priestPosition:null,priestVoice:null,schola:null,
        riteMusic:riteMusicAt(kind,card.id),
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
    syncRiteChoice(kind,projected.state);
    palmGospelCueVisible=null;
    root.dataset.r17NativeEvent=kind.toLowerCase();
    root.dataset.r17NativeRiteRecord=kind+":"+(projected.state.card?.id??"none");
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
      processionParticipant:kind==="PALM" ? projected.state.processionParticipant??false : null,
    });
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll)scroll.scrollTop=0;
    if(kind==="PALM")syncPalmGospelCue();
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
          : state.posture && !["LOCAL","ORDINARY_PROFILE","INHERIT"].includes(state.posture)
            ? {label:state.posture}
            : null,
        gesture:null,response:null,bell:null,cinematic:null,priestPosition:null,priestVoice:null,schola:null,
        riteMusic:riteMusicAt("CANDLEMAS",card.id),
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
    syncRiteChoice("CANDLEMAS",projected.state);
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
    const selection=prepared?.session?.resolvedMass?.provenance?.rogationSelection??{};
    const card=contextualRogationCard(state?.card,selection);
    if(!card)return null;
    const major=selection.observance==="MAJOR";
    return Object.freeze({
      state,
      moment:Object.freeze({
        id:card.id,
        sectionTitle:major?"Greater Litanies":"Rogations",
        cardTitle:card.title,
        cardUpdate:true,
        paragraphs:Object.freeze((card.paragraphs??[]).map(row=>Object.freeze({
          id:row.id,kind:row.kind,primary:row.latin,
          sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
        }))),
        progress:String(state.index+1)+" / "+String(state.total)+(major?" · Greater Litanies":" · Rogations"),
        posture:card.posture && !["LOCAL_OR_STAND","STAND_OR_LOCAL","ORDINARY_PROFILE","INHERIT"].includes(card.posture)
          ? {label:card.posture}
          : null,
        gesture:null,response:null,bell:null,cinematic:null,priestPosition:null,priestVoice:null,schola:null,
        riteMusic:riteMusicAt("ROGATIONS",card.id),
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
      id:row.id,kind:row.kind,
      primary:row.kind==="RUBRIC"
        ? (String(ready.prepared?.readerPreferences?.language??"en").toLowerCase().startsWith("fr")
            ? row.french : row.english) : row.latin,
      sourceCueIds:Object.freeze([row.sourceRecordId].filter(Boolean)),
    }));
    let posture=null;
    if(kind==="REQUIEM_ABSOLUTION" && state.posture && state.posture!=="LOCAL_OR_INHERIT")posture={label:state.posture};
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
        riteMusic:riteMusicAt(kind==="CORPUS_CHRISTI_PROCESSION"?"CORPUS_CHRISTI":kind,
          card.id??card.recordId,
          kind==="REQUIEM_ABSOLUTION" &&
            ready.prepared?.session?.resolvedMass?.provenance?.requiemAbsolution?.burialProcession===true
            ? "OPTIONAL_BURIAL_FOLLOWING_ACTION" : null),
        organPermission:project1962ReaderOrganNote({
          riteId:kind,stageId:card.id??card.recordId,
        }),
        guide:card.guide ? {registryAvailable:true,text:
          kind==="REQUIEM_ABSOLUTION" &&
          String(ready.prepared?.readerPreferences?.language??"en").toLowerCase().startsWith("fr") &&
          card.guideFr ? card.guideFr : card.guide} : null,
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
    syncRiteChoice(kind,projected.state);
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
      burialParticipant:kind==="REQUIEM_ABSOLUTION" ? projected.state.burialParticipant??false : null,
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
    if(mandatumController&&current?.sectionId==="AO.HT.MANDATUM"){
      const state=mandatumController.project();
      if(!state.atStart){mandatumController.previous();return showMandatumStage();}
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
    if(mandatumController&&current?.sectionId==="AO.HT.MANDATUM"){
      const state=mandatumController.project();
      if(!state.atEnd){mandatumController.next();return showMandatumStage();}
    }
    const card=nextVisibleCard(current,"next");
    if(!card)return enterLifecycleBoundary();
    return showCard(card);
  }

  function planAwareCard(card){
    if(!card)return null;
    // Purple II-class Rogation votives always omit Gloria. Under 1960
    // General Rubrics §343(a), Credo is retained if the occurring
    // Sunday prescribes it. Keep the canonical 48-card source unchanged.
    const resolved=prepared?.session?.resolvedMass;
    const isRogation=resolved?.actualCelebration?.id==="rogation-mass-1962";
    const sourceSection=String(card.sourceSectionId??card.sectionId??"");
    const prov=resolved?.provenance??{};
    if(isRogation && sourceSection==="AO.CARD.003" && prov.gloria!==false)
      throw new Error("ROGATION_GLORIA_OMISSION_NOT_CERTIFIED");
    // The selected Mass, not a generic season or civil date, owns whether
    // Gloria and Credo are prescribed. A Requiem omits both; the canonical
    // source model and original cards remain intact for another Mass.
    // Unknown flags keep the source text visible (fail without invention).
    const isRequiem=resolved?.isRequiem===true || resolved?.provenance?.isRequiem===true ||
      ["REQUIEM","MASS_FOR_THE_DEAD"].includes(
        String(resolved?.actualCelebration?.type??"").toUpperCase()) ||
      ["REQUIEM","MASS_FOR_THE_DEAD"].includes(
        String(resolved?.actualCelebration?.kind??"").toUpperCase()) ||
      (resolved?.overlays??[]).some(value=>
        ["REQUIEM","MASS_FOR_THE_DEAD"].includes(
          String(value?.id??value?.type??value??"").toUpperCase()));
    if(sourceSection==="AO.CARD.003" && (isRequiem||prov.gloria===false))return null;
    if(sourceSection==="AO.CARD.009" && (isRequiem||prov.credo===false))return null;
    const plan=prepared?.session?.plan;
    if(plan?.blessingAllowed!==false)return card;
    const blessing=card.blocks?.find?.(value=>value.blockId==="AO.SM.B092");
    if(!blessing || blessing.firstParagraphIndex==null || !blessing.paragraphCount)return card;
    const start=blessing.firstParagraphIndex;
    const end=start+blessing.paragraphCount;
    if(!Number.isInteger(start)||start<0||end>card.paragraphs.length)
      throw new Error("INVALID_FINAL_BLESSING_SOURCE_BOUNDARY");
    const paragraphs=card.paragraphs.filter((_,index)=>index<start||index>=end);
    if(!paragraphs.length && !card.stateOnly)return null;
    // The closing prayer and the optional final blessing have distinct
    // source owners. Removing B092 must also rebase the displayed block
    // offsets, otherwise LIVE reading-section ownership points past the
    // remaining paragraphs during Requiem/Corpus following-action handoff.
    const blocks=(card.blocks??[]).map(block=>{
      if(block.blockId==="AO.SM.B092")return Object.freeze({...block,
        firstParagraphIndex:null,paragraphCount:0,omittedByPlan:true});
      if(block.firstParagraphIndex==null||!block.paragraphCount)return block;
      const first=block.firstParagraphIndex,last=first+block.paragraphCount;
      if(first>=end)return Object.freeze({...block,firstParagraphIndex:first-blessing.paragraphCount});
      if(first<end&&last>start)
        throw new Error("FINAL_BLESSING_SOURCE_BLOCK_OVERLAP:"+block.blockId);
      return block;
    });
    return Object.freeze({...card,title:"Placeat tibi, sancta Trinitas",
      paragraphs:Object.freeze(paragraphs),blocks:Object.freeze(blocks),
      planFilteredBlocks:Object.freeze(["AO.SM.B092"])});
  }

  function isLastGospelCard(card){
    if(!card)return false;
    if(Number(card.sourceSequence)===30)return true;
    const sourceId=String(card.sourceSectionId??card.sectionId??"");
    return sourceId==="AO.CARD.030";
  }

  function visibleCardAllowed(card){
    if(!card)return false;
    // The source graph preserves an omitted rite's original indexed card,
    // but no blank "omitted" screen belongs in linear Mass navigation or
    // direct jumps. This protects the fixed 48/64 structural source map.
    if(card.stateOnly===true &&
       ["RITUS_XIII_1_REQUIEM","RITUS_XIII_2_REQUIEM","1962_FORM_NO_INCENSE"]
         .includes(card.omittedByRite))return false;
    // This prayer survived only as a local/older practice; its C0235-C0241
    // source paragraphs remain auditable in the 65-card review, but are
    // never inserted into the ordinary faithful's swipe path by default.
    const isOptionalCommunionConfiteor=card.curatedPresentationReview===true &&
      (card.blocks??[]).some(block=>block.blockId==="AO.SM.B077") &&
      (card.blocks??[]).every(block=>["AO.SM.B077","AO.SM.B078","AO.SM.B079"].includes(block.blockId));
    if(isOptionalCommunionConfiteor &&
       customaryPrefs.secondConfiteor!==true)return false;
    if(prepared?.session?.plan?.normalLastGospel===false && isLastGospelCard(card))return false;
    return Boolean(planAwareCard(card));
  }

  function visibleProgress(card){
    const visible=readerModel.cards.filter(visibleCardAllowed);
    const at=visible.findIndex(candidate=>candidate.sectionId===card?.sectionId);
    return at<0 ? null : String(at+1)+" / "+String(visible.length);
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

  // A single optional card follows the original six Mandatum source events.
  // The participant switch is local. No nonparticipant receives foot-washing
  // instructions; no action is misattributed to the entire congregation.
  function showMandatumStage(){
    if(!mandatumController||current?.sectionId!=="AO.HT.MANDATUM")return null;
    const state=mandatumController.project();
    const action=state.action?state.action.replaceAll("_"," ").toLowerCase():null;
    reader.renderMoment({
      id:state.sourceEventId,sectionTitle:"Mandatum · Washing of Feet",
      cardTitle:current.title,cardUpdate:false,
      progress:"Mandatum "+String(state.index+1)+" / "+String(state.total),
      posture:state.posture!=="LOCAL_OR_INHERIT"?{label:state.posture}:null,
      gesture:action?{label:action}:null,
      guide:{registryAvailable:true,text:state.title},
      response:null,bell:null,cinematic:null,priestPosition:null,
      priestVoice:null,schola:null,
    });
    syncRiteChoice("MANDATUM",{card:{id:"AO.HT.MANDATUM"},participant:state.participant});
    root.dataset.r17NativeEvent=state.sourceEventId;
    root.dataset.r17NativeCue="unresolved";
    root.dataset.r17StateOwner="R17_MANDATUM_CANONICAL_EVENT";
    root.dataset.r17OwnerPosture=state.actorScope==="MANDATUM_PARTICIPANT"
      ?(state.participant?"MANDATUM_PARTICIPANT_SOURCE":"LOCAL_OR_INHERIT")
      :"MANDATUM_CONGREGATION_SOURCE";
    root.dataset.r17OwnerGesture=state.action?"MANDATUM_PARTICIPANT_SOURCE":"MANDATUM_NO_PERSONAL_ACTION";
    globalThis.AO_R17_NATIVE_READER_STATE=Object.freeze({
      specialRite:"MANDATUM",recordId:state.sourceEventId,
      actorScope:state.actorScope,posture:state.posture,gesture:state.action,
      participant:state.participant,handoff:state.handoff,sourceOwner:"SPECIAL_DAYS_CORE"
    });
    return state;
  }

  function showCard(card,{directJump=false,preserveSchola=false}={}){
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
    syncRiteChoice(null,null);
    const previous=current;
    const changed=Boolean(previous?.sectionId && previous.sectionId!==card.sectionId);
    // Explicit priest-side state persists between Gloria/Credo subcards but
    // must not leak into an unrelated source Mass section.
    if(previous && (previous.sourceSectionId??previous.sectionId)!==
       (card.sourceSectionId??card.sectionId)){
      observedCuratedPriestEvent=null;
      chaliceObservationState.reset();
      clearCanonObservation();
    }
    // A direct section/sequence jump is navigation, not a liturgical
    // procession between adjacent cards. Preserve donor cinematics during
    // linear reading only; never mask a manually selected destination.
    const partCinema=directJump ? null : partTransitionCinematic(initialCardRender ? null : previous,card,{initial:initialCardRender});
    initialCardRender=false;
    armPartCinematic(partCinema);
    if(changed){
      modeSwitchCueLock=null;
      enteredCanonicalCueSequence=true;
      observedPriestEvent=null;
      activeCueId=null;
      clearEventCinematic({resetCue:true});
      transientGuard.begin();
      root.dataset.r17NativeCue="unresolved";
    }
    current=card;
    // Missal is a static book: select only the canonical opening cue as a
    // page-level reference for its ribbon. Unlike LIVE, never advance the
    // ritual clock/cinematics from reading scroll. A page with no exact
    // sourced cue remains unresolved, not a guessed posture or action.
    if((changed || !activeCueId) && String(readerModel?.presentationMode??"").toUpperCase()==="MISSAL"){
      const firstSourceCue=(visibleCard.paragraphs??[])
        .flatMap(paragraph=>paragraph.sourceCueIds??[])
        .find(id=>/^AO\.SM\.C\d{4}$/.test(String(id)))??null;
      activeCueId=firstSourceCue;
      if(firstSourceCue)transientGuard.resolveCue(firstSourceCue);
    }
    // Normal linear navigation may update the expected musical scene.
    // A manual priest catch-up is different: the user has only changed
    // which priest prayer is on screen and has NOT heard the choir move.
    // Preserve its exact track, phrase, completion and Benedictus state.
    if(!preserveSchola&&!scholaPinnedByCatchup)
      ready.scholaState.activateForCard(visibleCard);
    const state=projectedState();
    reader.renderMoment({
      id:visibleCard.sectionId,
      sectionTitle:visibleMassCardTitle(visibleCard),
      cardTitle:visibleMassCardTitle(visibleCard),
      cardUpdate:true,
      missalRubric:String(readerModel?.presentationMode??"").toUpperCase()==="MISSAL"
        ? (()=>{
          const first=(visibleCard.paragraphs??[])
            .flatMap(row=>row.sourceCueIds??[])
            .find(id=>/^AO\.SM\.C\d{4}$/.test(String(id)));
          const sourced=first&&ready.cueState.supported
            ? ready.cueState.project(first):null;
          if(!sourced?.supported)return null;
          const icons=iconKeysForReaderState({
            priestAction:sourced.priestAction,
            priestPosition:sourced.priestPosition,
            gesture:sourced.gesture,
          });
          const withIcon=(value,key)=>value
            ? Object.freeze({...value,iconKey:key??null}) : null;
          return Object.freeze({
            sourceCueId:first,
            priestAction:withIcon(sourced.priestAction,icons.priestActionIconKey),
            priestPosition:withIcon(sourced.priestPosition,icons.priestPositionIconKey),
            faithfulGesture:withIcon(sourced.gesture,icons.gestureIconKey),
          });
        })()
        :null,
      missalHeadings:String(ready.prepared?.readerPreferences?.mode ??
        ready.prepared?.session?.resolvedMass?.presentationMode??"").toUpperCase()==="MISSAL" ||
        String(root.dataset.r17PresentationMode??"").toUpperCase()==="MISSAL"
          ? missalPrayerHeadingsForCard(visibleCard,{
              language:ready.prepared?.readerPreferences?.language??"en",
              resolvedMass:ready.prepared?.session?.resolvedMass??null,
            })
          : [],
      paragraphs:with1962RitusXIVParagraphRubrics(withLiveReadingSections(visibleCard,
        withRequiemXIII3MissalNotes(
        String(readerModel?.presentationMode??"").toUpperCase()==="MISSAL"
        ? withCertifiedSolemnMissalMinisters(
          withPublishedMissalParagraphRubrics(
            visibleCard.paragraphs,ready.data?.rubricEvents??null,{
              form:ready.prepared?.session?.resolvedMass?.form,
              language:ready.prepared?.readerPreferences?.language??"en",
            gestureMatrix:ready.data?.gestureMatrix??null,
            }),{
            formStateData:ready.formState,
            cueState:ready.cueState,
            form:ready.prepared?.session?.resolvedMass?.form,
            language:ready.prepared?.readerPreferences?.language??"en",
          })
        : String(readerModel?.presentationMode??"").toUpperCase()==="LIVE"
          ? withCertifiedSolemnMissalMinisters(
              withPublishedMissalParagraphRubrics(
                visibleCard.paragraphs,ready.data?.rubricEvents??null,{
                  form:ready.prepared?.session?.resolvedMass?.form,
                  language:ready.prepared?.readerPreferences?.language??"en",
                  gestureMatrix:ready.data?.gestureMatrix??null,
                }),{
                formStateData:ready.formState,
                cueState:ready.cueState,
                form:ready.prepared?.session?.resolvedMass?.form,
                language:ready.prepared?.readerPreferences?.language??"en",
              })
          : withPublishedCanonParagraphRubrics(
              visibleCard.paragraphs,ready.data?.rubricEvents??null,{
                form:ready.prepared?.session?.resolvedMass?.form,
              }),ready.prepared?.session?.resolvedMass??null,{
                language:ready.prepared?.readerPreferences?.language??"en",
              }),{mode:readerModel?.presentationMode}),
        ready.prepared?.session?.resolvedMass?.provenance?.allSoulsSuccession,{
          language:ready.prepared?.readerPreferences?.language??"en",
        }),
      progress:visibleProgress(visibleCard),
      // Guide/Formation is an independent educational destination. The
      // published R17 1962 event registry, not an inherited 32-card Guide,
      // supplies LIVE rubrics at the exact source cue paragraph.
      guide:null,
      ...state,
      // The context is descriptive editorial copy, never a priest observation
      // and never a replacement for the existing exact-gesture rails.
      objectiveContext:String(readerModel?.presentationMode??"").toUpperCase()==="LIVE"
        ? projectReaderObjectiveContext(visibleCard,{
            cueId:state.nativeCueId,
            form:ready.prepared?.session?.resolvedMass?.form,
            language:ready.prepared?.readerPreferences?.language??"en",
            sourceBlocks:ready.data?.sungCorpus?.blocks,
          })
        :null,
    });
    canonManualUI?.update();
    root.dataset.r17NativeEvent=state.nativeEventId??"unresolved";
    root.dataset.r17NativeCue=state.nativeCueId??"unresolved";
    root.dataset.r17OwnerGesture=state.ownership?.gesture??"UNRESOLVED";
    root.dataset.r17OwnerResponse=state.ownership?.response??"UNRESOLVED";
    root.dataset.r17OwnerPriestVoice=state.ownership?.priestVoice??"UNRESOLVED";
    root.dataset.r17OwnerPriestPosition=state.ownership?.priestPosition??"UNRESOLVED";
    root.dataset.r17OwnerPosture=state.ownership?.posture??"UNRESOLVED";
    root.dataset.r17OwnerSchola=state.ownership?.schola??"UNRESOLVED";
    root.dataset.r17OwnerPriestAction=state.ownership?.priestAction??"UNRESOLVED";
    root.dataset.r17OwnerPriestEntrance=state.ownership?.priestEntrance??"UNRESOLVED";
    root.dataset.r17OwnerSacredMinister=state.ownership?.sacredMinister??"UNRESOLVED";
    root.dataset.r17OwnerBell=state.ownership?.bell??"UNRESOLVED";
    root.dataset.r17OwnerCinematic=state.ownership?.cinematic??"UNRESOLVED";
    globalThis.AO_R17_NATIVE_READER_STATE=state;
    const scroll=host.querySelector?.(".ao-prayer-card");
    if(scroll){
      scroll.scrollTop=0;
      cueTracker?.refresh?.();
    }
    if(current.sectionId==="AO.HT.MANDATUM"&&mandatumController){
      mandatumController.reset();
      showMandatumStage();
    }
    return visibleCard;
  }

  function sectionItems(){
    return readerModel.cards
      .filter(visibleCardAllowed)
      .map(card=>Object.freeze({id:card.sectionId,label:visibleMassCardTitle(card)}));
  }

  function focusCueAtReaderLine(cueId){
    if(!cueId)return false;
    const scroll=host.querySelector?.(".ao-prayer-card");
    const target=scroll?.querySelector?.('[data-cue-id="'+String(cueId)+'"]')
      ??[...(scroll?.querySelectorAll?.("[data-source-cue-ids]")??[])].find(row=>
        String(row.dataset?.sourceCueIds??"").split(" ").includes(String(cueId)));
    if(!scroll||!target)return false;
    const cr=scroll.getBoundingClientRect?.();
    const tr=target.getBoundingClientRect?.();
    if(!cr||!tr)return false;
    const exactRows=[...(scroll.querySelectorAll?.(".ao-reader-paragraph[data-cue-id]")??[])];
    // The requested cue may be the final rubric on a source-owned card
    // even though the 65-card LIVE model owns a separate elevation
    // card. A center-based scroll target can land earlier in a short card;
    // the focus tracker deliberately assigns the last cue at the bottom
    // edge. Preserve the actual source cue, not a macro/card-number offset.
    const atFinalSourceCue=exactRows.length>1&&exactRows.at(-1)===target;
    const absoluteCenter=(tr.top-cr.top+scroll.scrollTop)+(tr.height/2);
    scroll.scrollTop=atFinalSourceCue
      ? Math.max(0,scroll.scrollHeight-scroll.clientHeight)
      : Math.max(0,absoluteCenter-scroll.clientHeight*.39);
    cueTracker?.refresh?.();
    return true;
  }

  function switchPresentationMode(nextMode){
    // Mode switch invalidates the curated independent-event adapter.
    observedCuratedPriestEvent=null;
    chaliceObservationState.reset();
    clearCanonObservation();
    const anchor=captureReaderModeAnchor(current,{activeCueId});
    const desiredCue=anchor.cueId;
    const rebuilt=buildReaderModeModels({
      prepared:ready.prepared,
      data:ready.data,
      mode:nextMode,
      reviewExpandedCards:ready.curatedEligible===true && String(nextMode).toUpperCase()==="LIVE",
    });
    sourceModel=rebuilt.sourceModel;
    // Preserve the liturgically omitted Foot-cluster across LIVE → MISSAL →
    // LIVE mode switches. No hidden 65-card ordinary opening can reappear.
    readerModel=ready.curatedEligible && ready.curatedIntroitEntry===true &&
      rebuilt.mode==="LIVE" && [64,65,66].includes(rebuilt.presentationModel.totalCards)
      ? projectCuratedIntroitEntryLiveCards(rebuilt.presentationModel)
      : rebuilt.presentationModel;

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
    observedPriestEvent=null;
    activeCueId=cueStillPresent ? desiredCue : null;
    if(activeCueId)transientGuard.resolveCue(activeCueId);
    if(!scholaPinnedByCatchup)ready.scholaState.activateForCard(current);

    root.dataset.r17PresentationMode=rebuilt.mode;
    root.dataset.r17SourceModelCards=String(sourceModel.totalCards);
    root.dataset.r17PresentationModelCards=String(readerModel.totalCards);

    if(!(inAsperges || inPalm || inAsh || inCandlemas || inRogations || inRequiemAbsolution || inCorpusChristi || inHolyThursdayPost || inGenericProcession || inLifecycle)){
      showCard(current);
      // A two-column Missal changes page geometry, not source/cue identity.
      if(cueStillPresent){
        activeCueId=desiredCue;
        if(!scholaPinnedByCatchup)
          ready.scholaState.reachLiturgicalBoundary?.(desiredCue);
        transientGuard.resolveCue(desiredCue);
        focusCueAtReaderLine(desiredCue);
        root.dataset.r17NativeCue=desiredCue;
        // Source-owned cards can combine exact units in a text row. Preserve
        // the explicit cue anchor until the user resumes scrolling; the row
        // geometry may otherwise report an earlier source cue.
        modeSwitchCueLock=rebuilt.mode==="MISSAL"?null:{
          cueId:desiredCue,sectionId:current.sectionId,
        };
        queue();
      }
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
    // Resolve against the CURRENT sourced presentation model after mode or
    // local-custom changes; the timeline never drives chant advancement.
    // The current native rite owns its stage order and branch condition.
    // This ONLY predicts music and never mutates those controllers.
    specialRiteMusicItinerary:()=>{
      const active=inAsperges?["ASPERGES",ready.aspergesController,
        ready.riteMusicSources?.ASPERGES,
        ready.aspergesController?.project?.()?.formulaState?.formula]:
        inPalm?["PALM",ready.palmController,ready.riteMusicSources?.PALM,null]:
        inCandlemas?["CANDLEMAS",ready.candlemasController,ready.riteMusicSources?.CANDLEMAS,null]:
        inRogations?["ROGATIONS",ready.rogationsController,ready.riteMusicSources?.ROGATIONS,null]:
        inRequiemAbsolution?["REQUIEM_ABSOLUTION",ready.requiemAbsolutionController,
          ready.riteMusicSources?.REQUIEM_ABSOLUTION,
          ready.prepared?.session?.resolvedMass?.provenance?.requiemAbsolution?.burialProcession===true
            ?"OPTIONAL_BURIAL_FOLLOWING_ACTION":null]:
        inCorpusChristi?["CORPUS_CHRISTI",ready.corpusChristiController,
          ready.riteMusicSources?.CORPUS_CHRISTI,null]:
        inHolyThursdayPost?["HOLY_THURSDAY_POST",ready.holyThursdayPostController,
          ready.riteMusicSources?.HOLY_THURSDAY_POST,null]:
        null;
      return active?projectNativeRiteMusicItinerary({
        registry:ready.riteMusicRegistry,riteId:active[0],
        controller:active[1],sourcePayload:active[2],condition:active[3],
      }):null;
    },
    scholaLocalProgramme:()=>scholaLocalProgramme,
    onScholaLocalProgrammeChange:change=>{
      scholaLocalProgramme=updateScholaLocalProgramme(scholaLocalProgramme,change,customStorage);
      queue();
    },
    scholaMusicItinerary:()=>applyScholaLocalProgramme(buildScholaMusicItinerary({
      // An omitted Gloria, Credo, Requiem blessing, or optional Confiteor
      // must not survive as a navigable music event for this Mass.
      cards:readerModel?.cards.filter(visibleCardAllowed),
      form:prepared.session.resolvedMass.form,
      resolvedMass:prepared.session.resolvedMass,
      tracks:ready.scholaState?.trackIds??[],
      sanctusPerformance:ready.scholaState?.project?.()?.sanctusPerformance,
    }),scholaLocalProgramme),
    onPresentationModeChange:(mode)=>switchPresentationMode(mode),
    onCustomaryChange:change=>{
      customaryPrefs=updateMassCustomaryPreferences(customaryPrefs,change,customStorage);
      if(change?.kind==="sanctusPerformance"){
        ready.scholaState.setSanctusPerformance?.(customaryPrefs.sanctusPerformance);
      }
      if(change?.kind==="secondConfiteor"){
        reader.setSections?.(sectionItems());
        // Turning the local custom off must not leave a hidden card active.
        if(current && !visibleCardAllowed(current)){
          const next=nextVisibleCard(current,"next")??nextVisibleCard(current,"previous");
          if(next){showCard(next,{directJump:true});return;}
        }
      }
      queue();
    },
    onScholaEventSelect:(eventId)=>{
      const itinerary=applyScholaLocalProgramme(buildScholaMusicItinerary({
        cards:readerModel?.cards.filter(visibleCardAllowed),
        form:prepared.session.resolvedMass.form,
        resolvedMass:prepared.session.resolvedMass,
        tracks:ready.scholaState?.trackIds??[],
        sanctusPerformance:ready.scholaState?.project?.()?.sanctusPerformance,
      }),scholaLocalProgramme);
      const event=itinerary.supported
        ? itinerary.events.find(item=>item.id===String(eventId)) : null;
      if(!event || event.manualOnly || event.id==="BENEDICTUS_CONTINUOUS")return false;
      if(event.kind==="ORGAN_OPTION" && (event.localPlan?.selected!==true ||
        ["SOLO_FORBIDDEN","REQUIRES_EXACT_RITE_STAGE"].includes(event.organPermission?.status)))
        return false;
      if(event.kind==="LOCAL_OPTION" && event.localPlan?.selected!==true)return false;
      // Explicit manual music selection, not priest-card movement or proof
      // that the choir is currently performing this event.
      scholaPinnedByCatchup=true;
      if(event.kind==="CHANT"){
        selectedScholaEvent=null;
        ready.scholaState.selectTrack(event.trackId);
      }else{
        ready.scholaState.selectTrack(null);
        selectedScholaEvent=Object.freeze({
          id:event.id,kind:event.kind,label:event.localPlan?.title||event.label,
          status:event.status,sourceRef:event.sourceRef,
          observed:false,organPermission:event.organPermission?.status??null,
        });
      }
      queue();
      return true;
    },
    onScholaAdvance:()=>{
      const value=ready.scholaState.next();
      queue();
      return value;
    },
    onScholaRelease:()=>{
      // The printed Benedictus appears before the Canon. The *sung* second
      // half of a polyphonic setting may be released only after the Chalice
      // Consecration, and still needs an explicit choir observation.
      const lastChalice=readerModel.cards.filter(card=>
        (card.blocks??[]).some(block=>block.blockId==="AO.SM.B053")).at(-1);
      if(!lastChalice || Number(current?.sequence)<=Number(lastChalice.sequence))
        return ready.scholaState.project();
      const value=ready.scholaState.releaseBenedictus?.();
      queue();return value;
    },
    onScholaPrevious:()=>{
      const value=ready.scholaState.previous();
      queue();
      return value;
    },
    onSectionSelect:(sectionId)=>{
      const card=readerModel.cards.find(value=>value.sectionId===String(sectionId));
      if(!visibleCardAllowed(card))return null;
      // Catch-up pins the choir's position through further priest scrolling
      // and card navigation, not only through the initial selected jump.
      scholaPinnedByCatchup=true;
      return showCard(card,{directJump:true,preserveSchola:true});
    },
    onScholaRejoin:()=>{
      // Explicitly resume source-order expectations, not a claim that the
      // choir was heard starting or finishing a particular piece.
      scholaPinnedByCatchup=false;
      selectedScholaEvent=null;
      const value=ready.scholaState.activateForCard(current);
      queue();return value;
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
      sectionTitle:current ? visibleMassCardTitle(current) : "",
      cardUpdate:false,
      progress:current ? visibleProgress(current) : null,
      guide:null,
      ...state,
      // Card navigation has no observed cue; scrolling later resolves one.
      // Recompute contextual ribbon copy on every cue-only update or it
      // remains null (or stale) even while the LIVE action rails advance.
      objectiveContext:String(readerModel?.presentationMode??"").toUpperCase()==="LIVE"
        ? projectReaderObjectiveContext(current,{
            cueId:state.nativeCueId,
            form:ready.prepared?.session?.resolvedMass?.form,
            language:ready.prepared?.readerPreferences?.language??"en",
            sourceBlocks:ready.data?.sungCorpus?.blocks,
          })
        :null,
      organPermission:project1962ReaderOrganNote({
        massCard:current,resolvedMass:prepared?.session?.resolvedMass,
      }),
    });
    canonManualUI?.update();
    root.dataset.r17NativeEvent=state.nativeEventId??"unresolved";
    root.dataset.r17NativeCue=state.nativeCueId??"unresolved";
    root.dataset.r17OwnerGesture=state.ownership?.gesture??"UNRESOLVED";
    root.dataset.r17OwnerResponse=state.ownership?.response??"UNRESOLVED";
    root.dataset.r17OwnerPriestVoice=state.ownership?.priestVoice??"UNRESOLVED";
    root.dataset.r17OwnerPriestPosition=state.ownership?.priestPosition??"UNRESOLVED";
    root.dataset.r17OwnerPosture=state.ownership?.posture??"UNRESOLVED";
    root.dataset.r17OwnerSchola=state.ownership?.schola??"UNRESOLVED";
    root.dataset.r17OwnerPriestAction=state.ownership?.priestAction??"UNRESOLVED";
    root.dataset.r17OwnerPriestEntrance=state.ownership?.priestEntrance??"UNRESOLVED";
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
    priestEntranceState.reset();
    chaliceObservationState.close();
    observedPriestEvent=null;
    canonManualUI?.destroy();
    canonManualUI=null;
    clearCanonObservation();
    clearScheduledTimer(partCinemaTimer);
    clearScheduledTimer(eventCinemaTimer);
    partCinemaTimer=null;
    eventCinemaTimer=null;
    observer?.disconnect?.();
    observer=null;
    root.removeEventListener?.("click",onRiteChoiceClick);
    host.querySelector?.(".ao-prayer-card")?.removeEventListener?.("scroll",syncPalmGospelCue);
    stopModeSwitchCueLock();
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
  // The existing Mass preferences surface owns secondary tools: no floating
  // button over the section selector or the 48-step LIVE ribbon.
  const nativePreferences=host.querySelector('[data-role="mass-preferences"]');
  if(massPrintControl&&nativePreferences)nativePreferences.append(massPrintControl);
  root.dataset.aoNativePrintGate=printAssessment.ok?"READY":String(printAssessment.reason||"SOURCE_UNAVAILABLE");
  root.dataset.aoNativePrintMounted=String(Boolean(host.querySelector('[data-ao-native-mass-print]')));
  // Hidden by default. The only two entrances are the certified Host
  // and Chalice elevation cues on the 65-family LIVE reader.
  canonManualUI=mountLiveCanonManualFollow({
    doc,host,controller:canonStageObservation,
    getContext:()=>({
      mode:readerModel?.presentationMode,
      curated:Boolean(ready.curatedEligible&&current?.curatedPresentationReview===true&&
        readerModel?.sourceModelTotalCards===39),
      cueId:activeCueId,
      sectionId:current?.sourceSectionId??current?.sectionId,
      presentationCardId:current?.sectionId,
      language:ready.prepared?.readerPreferences?.language??"en",
      specialRite:inAsperges||inPalm||inAsh||inCandlemas||inRogations||
        inRequiemAbsolution||inCorpusChristi||inHolyThursdayPost||
        inGenericProcession||inLifecycle,
    }),
    observe:input=>observeCanonCeremonyStage(input),
    clear:()=>{const state=clearCanonObservation();queue();return state;},
  });
  createRiteChoice();
  root.addEventListener?.("click",onRiteChoiceClick);
  if(inRogations)showRogations();
  else if(inCandlemas)showCandlemas();
  else if(inPalm)showPalm();
  else if(inAsh)showAsh();
  else if(inAsperges)showAsperges();
  else showCard(current);

  const readerScroll=host.querySelector?.(".ao-prayer-card");
  if(readerScroll){
    readerScroll.addEventListener?.("scroll",syncPalmGospelCue,{passive:true});
    const releaseModeSwitchCueLock=()=>{
      if(!modeSwitchCueLock)return;
      modeSwitchCueLock=null;
      const resumed=cueTracker?.getCue?.();
      if(resumed&&resumed!==activeCueId){
        activeCueId=resumed;
        root.dataset.r17NativeCue=resumed;
        transientGuard.resolveCue(resumed);
        queue();
      }
    };
    readerScroll.addEventListener("touchstart",releaseModeSwitchCueLock,{passive:true});
    readerScroll.addEventListener("wheel",releaseModeSwitchCueLock,{passive:true});
    stopModeSwitchCueLock=()=>{
      readerScroll.removeEventListener("touchstart",releaseModeSwitchCueLock);
      readerScroll.removeEventListener("wheel",releaseModeSwitchCueLock);
    };
    cueTracker=installCueFocusTracker({
      container:readerScroll,
      win,
      onChange:(cueId)=>{
        if(inAsperges || inPalm || inAsh || inCandlemas || inRogations || inRequiemAbsolution || inCorpusChristi || inHolyThursdayPost || inGenericProcession || inLifecycle)return;
        // The classical Missal is a static reading view. Scrolling must not
        // move the underlying source cue or trigger LIVE cinematics.
        if(root.querySelector?.("[data-ao-reader-shell]")?.dataset?.mode==="MISSAL")return;
        if(modeSwitchCueLock&&modeSwitchCueLock.sectionId===current?.sectionId&&
           modeSwitchCueLock.cueId===activeCueId &&
           (current.paragraphs??[]).some(row=>(row.sourceCueIds??[])
             .includes(modeSwitchCueLock.cueId))){
          // Programmatic layout refresh is not a new observed priest or
          // faithful cue. Preserve the same exact source event until user
          // scroll/input releases this temporary mode-switch anchor.
          return;
        }
        modeSwitchCueLock=null;
        if(activeCueId!==cueId){
          observedPriestEvent=null;
          clearCanonObservation();
        }
        if(cueId)enteredCanonicalCueSequence=true;
        activeCueId=cueId;
        // An independently sung chant is not synchronized to the priest's
        // scroll or textual focus. The public Secret conclusion only closes
        // the Offertory music window; it is not proof of heard completion.
        if(!scholaPinnedByCatchup)
          ready.scholaState.reachLiturgicalBoundary?.(cueId);
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

  function observeCanonCeremonyStage(observation){
      const form=String(readerModel?.presentationMode??"").toUpperCase();
      const correctSection=Boolean(canonicalManualFollowContext({
        mode:form,curated:Boolean(ready.curatedEligible&&current?.curatedPresentationReview===true&&
          readerModel?.sourceModelTotalCards===39),
        cueId:activeCueId,
        sectionId:current?.sourceSectionId??current?.sectionId,
        presentationCardId:current?.sectionId,
        specialRite:inAsperges||inPalm||inAsh||inCandlemas||inRogations||
          inRequiemAbsolution||inCorpusChristi||inHolyThursdayPost||
          inGenericProcession||inLifecycle,
      }));
      if(!canonStageObservation || !ready.curatedEligible ||
         current?.curatedPresentationReview!==true ||
         readerModel?.sourceModelTotalCards!==39 || form!=="LIVE" ||
         !correctSection || inAsperges||inPalm||inAsh||inCandlemas||
         inRogations||inRequiemAbsolution||inCorpusChristi||
         inHolyThursdayPost||inGenericProcession||inLifecycle)
        return Object.freeze({accepted:false,reason:"NOT_IN_CURATED_LIVE_CANON_ELEVATION"});
      const result=canonStageObservation.observe({
        ...observation,sourceCueId:activeCueId,
      });
      if(result.accepted){
        clearScheduledTimer(canonStageTimer);
        // The visual highlight expires; the accepted source sequence remains
        // available for audit until a different cue or card is selected.
        canonStageTimer=later(()=>{
          canonStageObservation.settleTransient();
          canonStageTimer=null;queue();
        },1800);
        queue();
      }
      return result;
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
      return showCard(visibleCardAllowed(card)?card:null,{directJump:true});
    },
    showSequence:sequence=>{
      const card=readerModel.cardBySequence(sequence);
      return showCard(visibleCardAllowed(card)?card:null,{directJump:true});
    },
    syncState:queue,
    // Optional observational inputs; not a liturgical norm or required tap.
    observePriestArrival:observation=>{
      const result=priestEntranceState.observeArrival(observation??{});
      if(result.accepted)queue();
      return result;
    },
    observePriestReverence:observation=>{
      const result=priestEntranceState.observeReverence(observation??{});
      if(result.accepted)queue();
      return result;
    },
    beginObservedMass:()=>{
      const result=priestEntranceState.beginMass();
      queue();
      return result;
    },
    getPriestEntranceState:()=>priestEntranceState.project(),
    // Optional independent human observation of chalice actions.
    // Rejected outside the Offertory source section; never fires on scroll.
    observeChalicePreparation:observation=>{
      const sourceSection=current?.sourceSectionId??current?.sectionId;
      if(sourceSection!=="AO.CARD.010"||
         inAsperges||inPalm||inAsh||inCandlemas||inRogations||
         inRequiemAbsolution||inCorpusChristi||inHolyThursdayPost||
         inGenericProcession||inLifecycle)
        return Object.freeze({accepted:false,reason:"NOT_IN_OFFERTORY",
          state:chaliceObservationState.project()});
      const result=chaliceObservationState.observe(observation);
      if(result.accepted)queue();
      return result;
    },
    // Observed priest stages and independently observed server bells retain
    // distinct event IDs and may never be activated by scrolling or chant.
    // This optional adapter overlays the existing LIVE rails/cinematics only
    // for the selected curated 65-family Canon cue.
    observeCanonCeremonyStage,
    getObservedCanonCeremonyStage:()=>canonStageObservation?.snapshot()??null,
    clearObservedCanonCeremonyStage:()=>{
      const result=clearCanonObservation();queue();return result;
    },
    getObservedChalicePreparation:()=>chaliceObservationState.project(),
    clearObservedChalicePreparation:()=>{
      const state=chaliceObservationState.reset();
      queue();
      return state;
    },
    // This optional hook is for explicit priest observations from a caller.
    // It is not microphone recognition and does not listen to the Schola.
    observePriestEvent:event=>{
      const form=ready.prepared?.session?.resolvedMass?.form;
      if(!validatePriestChantObservation(event,activeCueId,form)){
        return Object.freeze({accepted:false,reason:"UNSUPPORTED_OR_UNOBSERVED_PRIEST_EVENT"});
      }
      observedPriestEvent=Object.freeze({
        actor:"PRIEST",observed:true,source:"EXPLICIT_OBSERVATION",
        eventType:event.eventType,atCueId:activeCueId
      });
      queue();
      return Object.freeze({accepted:true,eventType:event.eventType,atCueId:activeCueId});
    },
    clearPriestObservation:()=>{
      observedPriestEvent=null;
      queue();
      return true;
    },
    getPresentationMode:()=>reader.getMode(),
    setPresentationMode:mode=>reader.setMode(mode),
    destroy,
    getCurrentCard:()=>inGenericProcession ? ready.genericProcessionController?.project?.().card??null : inHolyThursdayPost ? ready.holyThursdayPostController?.project?.().card??null : inCorpusChristi ? ready.corpusChristiController?.project?.().card??null : inRequiemAbsolution ? ready.requiemAbsolutionController?.project?.().card??null : inRogations ? ready.rogationsController?.project?.().card??null : inCandlemas ? ready.candlemasController?.project?.().card??null : inPalm ? ready.palmController?.project?.().card??null : inAsh ? ready.ashController?.project?.().card??null : inAsperges ? ready.aspergesController?.project?.().card??null : current,
    getNativeEventState:()=>globalThis.AO_R17_NATIVE_READER_STATE??null,
    getActiveCue:()=>activeCueId,
    // Priest-mode adapter. A caller must independently observe a canonical
    // MC event; swiping a card or changing Schola lyrics never calls this.
    // Invalid/unmatched form, source section or conditional sedilia events
    // fail closed. Production 48 and special rites do not accept events.
    observePriestCeremonialEvent:(eventId,{
      conditions=[],observedActor=null,observedDelivery=null,
      observedPosition=null,observedAction=null,
    }={})=>{
      if(!ready.curatedEligible || !eventId || !Array.isArray(conditions)){
        observedCuratedPriestEvent=null;queue();return false;
      }
      observedCuratedPriestEvent={eventId:String(eventId),conditions:[...conditions],
        observedActor,observedDelivery,observedPosition,observedAction};
      const matched=currentObservedCuratedPriestEvent();
      if(!matched){observedCuratedPriestEvent=null;queue();return false;}
      queue();return true;
    },
    clearObservedPriestEvent:()=>{observedCuratedPriestEvent=null;queue();return true;},
    getObservedPriestEvent:()=>currentObservedCuratedPriestEvent(),
    getCueState:()=>activeCueId ? ready.cueState.project(activeCueId) : null,
    getScholaState:()=>ready.scholaState.project(),
    getSelectedScholaEvent:()=>selectedScholaEvent,
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
    setPalmProcessionParticipant:value=>{if(!ready.palmController)return null;const result=ready.palmController.setProcessionParticipant(value);return inPalm ? showPalm() : result},
    setAshRecipientState:value=>{if(!ready.ashController)return null;const result=ready.ashController.setRecipientState(value);return inAsh ? showAsh() : result},
    setCandlemasRecipientState:value=>{if(!ready.candlemasController)return null;const result=ready.candlemasController.setRecipientState(value);return inCandlemas ? showCandlemas() : result},
    setCandlemasProcessionParticipant:value=>{if(!ready.candlemasController)return null;const result=ready.candlemasController.setProcessionParticipant(value);return inCandlemas ? showCandlemas() : result},
    setCandlemasHasBlessedCandle:value=>{if(!ready.candlemasController)return null;const result=ready.candlemasController.setHasBlessedCandle(value);return inCandlemas ? showCandlemas() : result},
    setCorpusChristiProcessionParticipant:value=>{if(!ready.corpusChristiController)return null;const result=ready.corpusChristiController.setProcessionParticipant(value);return inCorpusChristi ? showCorpusChristi() : result},
    setCorpusChristiSacramentalState:value=>{if(!ready.corpusChristiController)return null;const result=ready.corpusChristiController.setSacramentalState(value);return inCorpusChristi ? showCorpusChristi() : result},
    setHolyThursdayJoiningState:value=>{if(!ready.holyThursdayPostController)return null;const result=ready.holyThursdayPostController.setJoiningState(value);return inHolyThursdayPost ? showHolyThursdayPost() : result},
    setGenericProcessionParticipant:value=>{if(!ready.genericProcessionController)return null;const result=ready.genericProcessionController.setParticipating(value);return inGenericProcession ? showGenericProcession() : result},
    setRequiemBurialParticipant:value=>{if(!ready.requiemAbsolutionController)return null;const result=ready.requiemAbsolutionController.setBurialParticipant(value);return inRequiemAbsolution ? showRequiemAbsolution() : result},
    markActuallySprinkled:()=>{
      if(!ready.aspergesController)return null;
      const value=ready.aspergesController.setActuallySprinkled(true);
      return inAsperges ? showAsperges() : value;
    },
  });
  globalThis.AO_R17_NATIVE_READER_PREVIEW=api;
  return api;
}
