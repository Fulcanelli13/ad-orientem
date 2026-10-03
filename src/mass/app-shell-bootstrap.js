// Browser/app-shell bootstrap for the R17 modular Mass engine.
// This module deliberately does not own DOM, calendar resolution, Proper retrieval,
// or the legacy pre-Mass UI. Those remain host responsibilities until final landing.

import { prepareMassSessionFromV346 } from "./host-adapter.js";
import { resolveReaderPreferences } from "./reader-state.js";

function requireFunction(value, label) {
  if (typeof value !== "function") throw new TypeError(label + " function required");
  return value;
}

export function createMassEntryController({
  celebrationApi,
  resolveHostOptions = () => ({}),
  readReaderPreferences = () => ({}),
  openReader,
} = {}) {
  if (!celebrationApi || typeof celebrationApi.getResolvedMass !== "function") {
    throw new TypeError("celebrationApi.getResolvedMass() is required");
  }
  requireFunction(resolveHostOptions, "resolveHostOptions");
  requireFunction(readReaderPreferences, "readReaderPreferences");
  requireFunction(openReader, "openReader");

  async function prepare() {
    const legacyResolvedMass = await Promise.resolve(celebrationApi.getResolvedMass());
    if (!legacyResolvedMass || typeof legacyResolvedMass !== "object") {
      throw new Error("Legacy preflight did not return a ResolvedMass");
    }

    const readerPreferences = resolveReaderPreferences(
      (await Promise.resolve(readReaderPreferences(legacyResolvedMass))) ?? {}
    );

    const resolvedHostOptions =
      (await Promise.resolve(resolveHostOptions(legacyResolvedMass, readerPreferences))) ?? {};

    const session = prepareMassSessionFromV346(legacyResolvedMass, {
      ...resolvedHostOptions,
      // Presentation mode belongs to the reader, never to Mass-form resolution.
      presentationMode: readerPreferences.mode,
    });

    return Object.freeze({
      schema: "ao-mass-entry-bootstrap-v1",
      session,
      readerPreferences,
      legacyResolvedMass,
    });
  }

  async function enter() {
    const prepared = await prepare();
    await Promise.resolve(openReader(prepared));
    return prepared;
  }

  return Object.freeze({ prepare, enter });
}
