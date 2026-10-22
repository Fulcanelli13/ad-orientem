// Projects every cue of every Mass form through the real cue-state engines and
// returns what reaches the icon resolver: stations, facings, action labels,
// voices, gestures and postures. Used by the canonical icon coverage test.
import { readFileSync } from "node:fs";
import { createReaderFormCueStateController } from "../../src/mass/reader-form-state.js";

const load = p => JSON.parse(readFileSync(new URL("../../" + p, import.meta.url), "utf8"));

export const ICON_FORMS = Object.freeze(["LOW", "MISSA_CANTATA_SIMPLE", "MISSA_CANTATA_INCENSE", "SOLEMN"]);

export function loadIconInputSources() {
  return Object.freeze({
    formState: load("data/presentation/reader-form-state.v1.json"),
    lowCorpus: load("data/presentation/reader-text-low.v1.json"),
    sungCorpus: load("data/presentation/reader-text-sung.v1.json"),
    gestureMatrix: load("data/mass/gesture-matrix.v1.json"),
    registries: Object.freeze({
      gestures: load("data/presentation/reader-gestures.v1.json"),
      responses: load("data/presentation/reader-responses.v1.json"),
      postures: load("data/presentation/reader-postures.v1.json"),
      positions: load("data/presentation/reader-priest-positions.v1.json"),
      voices: load("data/presentation/reader-priest-voices.v1.json"),
      actions: load("data/presentation/reader-priest-actions.v1.json"),
    }),
  });
}

function cueIds(corpus) {
  const ids = corpus.blocks.flatMap(b => (b.units ?? []).map(u => u.cue_id)).filter(id => /^AO\.SM\.C\d{4}$/.test(String(id)));
  return [...new Set(ids)].sort();
}

// Yields {form, cueId, state} for every cue the form's corpus contains.
export function* projectAllCues(src = loadIconInputSources(), { forms = ICON_FORMS, gestureProfile = "TRADITIONAL" } = {}) {
  for (const form of forms) {
    const prepared = { session: { resolvedMass: { form, conditions: [] } }, readerPreferences: { mode: "SIMPLE", postureProfile: "FOLLOW_CONGREGATION", gestureProfile } };
    const controller = createReaderFormCueStateController({
      formStateData: src.formState, registries: src.registries, lowCorpus: src.lowCorpus, sungCorpus: src.sungCorpus,
      prepared, gestureMatrix: src.gestureMatrix,
    });
    if (!controller.supported) throw new Error("Form not supported by the cue-state engine: " + form);
    const ids = form === "LOW" ? cueIds(src.lowCorpus).filter(id => Number(id.slice(-4)) <= 275) : cueIds(src.sungCorpus);
    for (const cueId of ids) yield { form, cueId, state: controller.project(cueId) };
  }
}
