import { createReaderSectionResolver } from "./reader-sections.js";
import { selectReaderTextCorpus, buildReaderSectionCard } from "./reader-text.js";
import { properToReaderSlots, assertReaderProperReady } from "./proper-reader-slots.js";
import { projectSourceFirstLiveModel } from "./reader-live-source.js";
import { augmentReaderCardsWithPrayerOverPeople } from "./reader-prayer-over-people.js";
import { projectEmberInsertionModel } from "./reader-ember-lessons.js";
import { projectNuptialInsertionModel } from "./reader-nuptial.js";

const SUPPORTED_OVERLAYS=new Set(["VOTIVE_PROPER","REQUIEM","EMBER_LESSONS","NUPTIAL"]);

function assertBaselineReaderGraph(resolvedMass){
  if(resolvedMass?.distinctRite) {
    throw new Error("Reader card adapter not yet certified for distinct rite "+resolvedMass.distinctRite);
  }
  const unsupportedPreceding=(resolvedMass?.precedingRites??[]).filter(x=>!["ASPERGES","PALM","ASH","CANDLEMAS","ROGATIONS"].includes(x));
  if(unsupportedPreceding.length) {
    throw new Error("Reader card adapter not yet certified for preceding rite graph "+unsupportedPreceding.join(", "));
  }
  const unsupportedFollowing=(resolvedMass?.followingActions??[]).filter(x=>!["REQUIEM_ABSOLUTION","CORPUS_CHRISTI_PROCESSION","HOLY_THURSDAY_POST","GENERIC_PROCESSION"].includes(x));
  if(unsupportedFollowing.length) {
    throw new Error("Reader card adapter not yet certified for following-action graph "+unsupportedFollowing.join(", "));
  }
  const unsupported=(resolvedMass?.overlays??[]).filter(x=>!SUPPORTED_OVERLAYS.has(x));
  if(unsupported.length) {
    throw new Error("Reader card adapter not yet certified for overlay "+unsupported.join(", "));
  }
}

function unwrapProper(proper){
  if(!proper) return null;
  const status=String(proper.status??"READY").toUpperCase();
  if(!["READY","CACHED"].includes(status)) return null;
  return proper.data??proper;
}

export function createMassReaderModel({
  resolvedMass,
  sectionMap,
  lowCorpus,
  sungCorpus,
  canonSourceMap=null,
  nuptialData=null,
  properNotApplicableSlots=Object.freeze([]),
}={}){
  if(!resolvedMass || resolvedMass.schema!=="ao-resolved-mass-v2") {
    throw new TypeError("ao-resolved-mass-v2 required");
  }
  assertBaselineReaderGraph(resolvedMass);

  const proper=unwrapProper(resolvedMass.proper);
  if(!proper) throw new Error("Reader requires a READY resolved Proper before Mass opens");

  const properMap=assertReaderProperReady(properToReaderSlots(proper,{notApplicableSlots:properNotApplicableSlots}));
  const sectionResolver=createReaderSectionResolver(sectionMap);
  const selected=selectReaderTextCorpus({
    form:resolvedMass.form,
    lowCorpus,
    sungCorpus,
  });

  const baseCards=Object.freeze(sectionResolver.sections.map(section=>
    buildReaderSectionCard({
      corpus:selected.corpus,
      section,
      properSlots:properMap.slots,
    })
  ));
  const cards=augmentReaderCardsWithPrayerOverPeople(baseCards,resolvedMass);
  const byId=new Map(cards.map(card=>[card.sectionId,card]));

  function cardBySequence(sequence){
    const n=Number(sequence);
    return Number.isInteger(n) && n>=1 && n<=cards.length ? cards[n-1] : null;
  }

  function cardForEvent(eventId){
    const hit=sectionResolver.sectionForEvent(eventId);
    if(!hit) return null;
    return Object.freeze({
      canonicalEventId:hit.canonicalEventId,
      section:hit.section,
      card:byId.get(hit.section.sectionId),
      progress:hit.progress,
    });
  }

  function neighbor(sectionId,direction){
    const current=sectionResolver.sectionById(sectionId);
    if(!current) return null;
    const delta=direction==="previous" ? -1 : direction==="next" ? 1 : 0;
    return delta ? cardBySequence(current.sequence+delta) : byId.get(current.sectionId);
  }

  const baseModel=Object.freeze({
    schema:"ao-mass-reader-model-v1",
    form:resolvedMass.form,
    presentationMode:resolvedMass.presentationMode,
    actualCelebration:resolvedMass.actualCelebration,
    corpusFamily:selected.family,
    corpusAudit:selected.audit,
    properSource:proper.sourcePath??resolvedMass.proper?.sourcePath??null,
    cards,
    totalCards:cards.length,
    sectionResolver,
    properSlots:properMap,
    structureOwner:"BASE_30_MACROS",
    cardBySequence,
    cardForEvent,
    previousCard:sectionId=>neighbor(sectionId,"previous"),
    nextCard:sectionId=>neighbor(sectionId,"next"),
  });
  let projected=baseModel;
  if(String(resolvedMass.presentationMode??"").toUpperCase()==="LIVE"){
    if(!canonSourceMap)throw new Error("SOURCE_FIRST_LIVE_CANON_MAP_REQUIRED");
    projected=projectSourceFirstLiveModel(baseModel,canonSourceMap);
  }
  projected=projectEmberInsertionModel(projected,resolvedMass);
  return projectNuptialInsertionModel(projected,resolvedMass,nuptialData);
}
