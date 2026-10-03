import { createMassEntryController } from "./app-shell-bootstrap.js";
import { createReaderDomAdapter } from "./reader-dom.js";

export function createBrowserMassRuntime({
  root,
  celebrationApi,
  resolveHostOptions,
  readReaderPreferences,
  iconResolver = null,
  onPresentationModeChange = null,
  onPrevious = null,
  onNext = null,
  onGuide = null,
  onReaderMounted = null,
} = {}) {
  const reader = createReaderDomAdapter({
    root,
    iconResolver,
    onPresentationModeChange,
    onPrevious,
    onNext,
    onGuide,
  });

  const entry = createMassEntryController({
    celebrationApi,
    resolveHostOptions,
    readReaderPreferences,
    openReader: prepared => {
      reader.mount(prepared);
      onReaderMounted?.(prepared, reader);
    },
  });

  return Object.freeze({
    prepare: entry.prepare,
    enter: entry.enter,
    renderMoment: reader.renderMoment,
    setMode: reader.setMode,
    destroy: reader.destroy,
    getReaderState: reader.getState,
    getReaderMode: reader.getMode,
  });
}
