// Field-safe additions to the host pre-Mass celebration catalogue.
// Keep this layer additive: never replace a host-native definition once one exists.

export const FIELD_CELEBRATION_OVERRIDES = Object.freeze({
  holy_rosary: Object.freeze({
    type: "votive",
    group: "mary",
    title: Object.freeze({
      en: "Most Holy Rosary",
      fr: "Très Saint Rosaire",
    }),
    path: "Sancti/10-07",
    colour: "White",
    fieldScope: "2026-10-04",
    sourcePolicy: "Use the source-resolved 7 October formulary as the explicitly selected actual celebration; the host rubrical resolver still decides whether the chosen votive basis permits it.",
  }),
});

export function installFieldCelebrationOverrides(
  catalogue = globalThis.AO_CELEBRATION_CATALOGUE ?? null,
) {
  if (!catalogue || typeof catalogue !== "object") {
    return Object.freeze({ installed: false, added: Object.freeze([]) });
  }

  const added = [];
  for (const [id, definition] of Object.entries(FIELD_CELEBRATION_OVERRIDES)) {
    if (catalogue[id]) continue;
    catalogue[id] = definition;
    added.push(id);
  }

  return Object.freeze({
    installed: true,
    added: Object.freeze(added),
  });
}
