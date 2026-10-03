import { createMassEntryController } from "./app-shell-bootstrap.js";
import { createReaderDomAdapter } from "./reader-dom.js";
import { createMassReaderModel } from "./reader-model.js";
import { loadReaderPresentationData } from "./reader-data.js";
import { structureSupport } from "./reader-structure.js";

export function createBrowserMassRuntime({
  root, celebrationApi, resolveHostOptions, readReaderPreferences,
  iconResolver = null, loadPresentationData = loadReaderPresentationData,
  onPresentationModeChange = null, onPrevious = null, onNext = null,
  onGuide = null, onReaderMounted = null, onSectionChange = null,
} = {}) {
  if (typeof loadPresentationData !== "function") throw new TypeError("loadPresentationData function required");

  let readerModel = null;
  let currentSectionId = null;
  let currentPrepared = null;

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

  function move(direction) {
    if (!readerModel || !currentSectionId) return null;
    const card = direction === "previous"
      ? readerModel.previousCard(currentSectionId)
      : readerModel.nextCard(currentSectionId);
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
      const data = await Promise.resolve(loadPresentationData(prepared));
      const model = createMassReaderModel({
        resolvedMass: prepared.session.resolvedMass,
        sectionMap: data?.sectionMap,
        lowCorpus: data?.lowCorpus,
        sungCorpus: data?.sungCorpus,
      });

      readerModel = model;
      currentPrepared = prepared;
      currentSectionId = null;
      reader.mount(prepared);
      showCard(model.cardBySequence(1));
      onReaderMounted?.(prepared, reader, model);
    },
  });

  function destroy() {
    reader.destroy();
    readerModel = null;
    currentSectionId = null;
    currentPrepared = null;
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
    getCurrentSectionId: () => currentSectionId,
  });
}
