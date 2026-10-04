// Field-safe additions to the host pre-Mass celebration catalogue.
// Keep this layer additive: never replace a host-native definition once one exists.
//
// 4 Oct 2026 is the first Sunday of October. Under the 1962 General Rubrics,
// the feast of Our Lady of the Rosary has an external solemnity by law on that
// Sunday (RG 356–360, especially 358b). The frozen host knows "external
// solemnity" conceptually but does not yet expose it as a resolver basis, so
// this module bridges that one certified field case without changing the
// historical monolith or weakening its fail-closed behaviour elsewhere.

export const HOLY_ROSARY_FIELD_DATE = "2026-10-04";

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
    fieldScope: HOLY_ROSARY_FIELD_DATE,
    sourcePolicy:
      "External solemnity by law on the first Sunday of October; source-resolve the 7 October formulary and preserve the host preflight/readiness gates.",
  }),
});

function selectedDate(arch = globalThis.AO_CELEBRATION_ARCH_V1 ?? null) {
  return (
    arch?.date ??
    arch?.liturgicalDay?.date ??
    globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate ??
    null
  );
}

export function isHolyRosaryExternalSolemnity(
  arch = globalThis.AO_CELEBRATION_ARCH_V1 ?? null,
) {
  return Boolean(
    arch?.actualCelebration?.id === "holy_rosary" &&
      selectedDate(arch) === HOLY_ROSARY_FIELD_DATE
  );
}

export function holyRosaryExternalSolemnityDecision({ form = "sung" } = {}) {
  return Object.freeze({
    status: "permitted",
    code: "external-solemnity-holy-rosary",
    summary: "External solemnity of Our Lady of the Rosary",
    reason:
      "The external solemnity of Our Lady of the Rosary belongs by law on the first Sunday of October.",
    additions: Object.freeze([]),
    conditions: Object.freeze([]),
    sources: Object.freeze(["RG 356–360", "RG 358b"]),
    votiveClass: 2,
    basis: "external_solemnity",
    gloria: true,
    credo: true,
    tone: form === "sung" ? "solemn" : null,
  });
}

export function normalizeHolyRosaryResolvedMass(
  resolved,
  arch = globalThis.AO_CELEBRATION_ARCH_V1 ?? null,
) {
  if (!resolved || !isHolyRosaryExternalSolemnity(arch)) return resolved;
  return Object.freeze({
    ...resolved,
    requestedCelebrationId: "holy_rosary",
    celebrationId: "holy_rosary",
    celebrationType: "votive",
    properSource: "Sancti/10-07",
    votiveClass: 2,
    colour: "White",
    gloria: true,
    credo: true,
    conditions: Object.freeze([]),
    rubricSources: Object.freeze(["RG 356–360", "RG 358b"]),
    canStart: true,
    sourceDiagnostics: Object.freeze({
      ...(resolved.sourceDiagnostics ?? {}),
      rubricStatus: "permitted",
      rubricCode: "external-solemnity-holy-rosary",
      votiveBasis: "external_solemnity",
      fieldBridge: "HOLY_ROSARY_EXTERNAL_SOLEMNITY_2026_10_04",
    }),
  });
}

function languageIsFrench() {
  return globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language === "fr";
}

function fieldDecision() {
  const arch = globalThis.AO_CELEBRATION_ARCH_V1 ?? null;
  return holyRosaryExternalSolemnityDecision({
    form: arch?.celebrationForm ?? "sung",
  });
}

function installApiBridge() {
  const api = globalThis.AO_CELEBRATION_API ?? null;
  if (!api || api.__aoHolyRosaryExternalSolemnityBridge) return false;

  const originals = {
    resolveRubrics:
      typeof api.resolveRubrics === "function"
        ? api.resolveRubrics.bind(api)
        : null,
    getRubricState:
      typeof api.getRubricState === "function"
        ? api.getRubricState.bind(api)
        : null,
    getResolvedMass:
      typeof api.getResolvedMass === "function"
        ? api.getResolvedMass.bind(api)
        : null,
    setVotiveBasis:
      typeof api.setVotiveBasis === "function"
        ? api.setVotiveBasis.bind(api)
        : null,
    select:
      typeof api.select === "function" ? api.select.bind(api) : null,
  };

  api.resolveRubrics = (...args) =>
    isHolyRosaryExternalSolemnity()
      ? fieldDecision()
      : originals.resolveRubrics?.(...args);

  api.getRubricState = (...args) => {
    if (!isHolyRosaryExternalSolemnity()) {
      return originals.getRubricState?.(...args);
    }
    const arch = globalThis.AO_CELEBRATION_ARCH_V1 ?? null;
    return Object.freeze({
      basis: "external_solemnity",
      context: Object.freeze({ ...(arch?.rubricContext ?? {}) }),
      decision: fieldDecision(),
    });
  };

  api.getResolvedMass = (...args) =>
    normalizeHolyRosaryResolvedMass(
      originals.getResolvedMass?.(...args),
      globalThis.AO_CELEBRATION_ARCH_V1 ?? null,
    );

  api.setVotiveBasis = (id, ...args) => {
    if (isHolyRosaryExternalSolemnity()) return fieldDecision();
    return originals.setVotiveBasis?.(id, ...args);
  };

  if (originals.select) {
    api.select = (id, ...args) => {
      const result = originals.select(id, ...args);
      if (id === "holy_rosary") queueMicrotask(syncInternalFieldBasis);
      return result;
    };
  }

  Object.defineProperty(api, "__aoHolyRosaryExternalSolemnityBridge", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  return true;
}

function syncInternalFieldBasis() {
  const arch = globalThis.AO_CELEBRATION_ARCH_V1 ?? null;
  const api = globalThis.AO_CELEBRATION_API ?? null;
  if (!arch || !api || !isHolyRosaryExternalSolemnity(arch)) return false;

  // The frozen host has no external-solemnity resolver row. Its existing
  // "special_occasion" row is also II class, so use it only as an internal
  // compatibility carrier. API output and user-facing copy are normalized
  // back to the actual RG 356–360 external-solemnity authority.
  if (arch.votiveBasis !== "special_occasion") {
    arch.votiveBasis = "special_occasion";
    arch.rubric = null;
    queueMicrotask(() => api.openPreflight?.());
    return true;
  }
  return false;
}

function decorateFieldPreflight() {
  const arch = globalThis.AO_CELEBRATION_ARCH_V1 ?? null;
  if (
    typeof document === "undefined" ||
    !isHolyRosaryExternalSolemnity(arch)
  ) {
    return;
  }

  const host = document.getElementById("ao-mass-flow-v1");
  if (!host) return;
  const fr = languageIsFrench();

  const basisGrid = host.querySelector(".aoBasisGrid");
  if (basisGrid && basisGrid.dataset.aoExternalSolemnity !== "true") {
    basisGrid.dataset.aoExternalSolemnity = "true";
    basisGrid.innerHTML = `
      <button class="active" disabled aria-disabled="true">
        <b>${fr ? "Solennité extérieure · IIe classe" : "External solemnity · II class"}</b>
        <small>${fr
          ? "Notre-Dame du Rosaire · premier dimanche d’octobre · RG 356–360"
          : "Our Lady of the Rosary · first Sunday of October · RG 356–360"}</small>
      </button>`;
  }

  const status = host.querySelector(".aoRubricStatus");
  if (status && status.dataset.aoExternalSolemnity !== "true") {
    status.dataset.aoExternalSolemnity = "true";
    status.classList.remove("bad", "warn");
    status.classList.add("ok");
    status.innerHTML = `
      <div>✓</div>
      <div>
        <strong>${fr
          ? "Solennité extérieure de Notre-Dame du Rosaire"
          : "External solemnity of Our Lady of the Rosary"}</strong>
        <p>${fr
          ? "Elle est accordée de plein droit le premier dimanche d’octobre."
          : "It belongs by law on the first Sunday of October."}</p>
      </div>`;
  }

  const effects = host.querySelector(".aoRubricEffects");
  if (effects && effects.dataset.aoExternalSolemnity !== "true") {
    effects.dataset.aoExternalSolemnity = "true";
    const sung = arch?.celebrationForm === "sung";
    effects.innerHTML = `
      <div class="aoEffectChips">
        <span>${fr ? "Classe votive : II" : "Votive class: II"}</span>
        <span>Gloria: ${fr ? "oui" : "yes"}</span>
        <span>Credo: ${fr ? "oui" : "yes"}</span>
        ${sung ? `<span>${fr ? "Ton chanté : solennel" : "Sung tone: solemn"}</span>` : ""}
      </div>`;
  }

  const why = host.querySelector("details.aoWhyRubric > div");
  if (why && why.dataset.aoExternalSolemnity !== "true") {
    why.dataset.aoExternalSolemnity = "true";
    why.innerHTML = `
      <b>${fr ? "Aujourd’hui" : "Today"}:</b> ${HOLY_ROSARY_FIELD_DATE}<br>
      <b>${fr ? "Demandée" : "Requested"}:</b> ${fr ? "Très Saint Rosaire" : "Most Holy Rosary"}<br>
      <b>${fr ? "Décision" : "Decision"}:</b> ${fr
        ? "Solennité extérieure de plein droit · Messe votive de IIe classe"
        : "External solemnity by law · votive Mass II class"}<br>
      <b>${fr ? "Base rubricale" : "Rubrical basis"}:</b> RG 356–360 · RG 358b
      <code>external-solemnity-holy-rosary</code>`;
  }

  const notes = [...host.querySelectorAll(".aoPrototypeNote")];
  const basisNote = notes.find((el) =>
    /Choose the basis|Choisissez la base/.test(el.textContent ?? ""),
  );
  if (basisNote) {
    basisNote.textContent = fr
      ? "La base est déterminée ici par RG 358b : solennité extérieure de Notre-Dame du Rosaire le premier dimanche d’octobre."
      : "The basis is fixed here by RG 358b: external solemnity of Our Lady of the Rosary on the first Sunday of October.";
  }
}

function installUiBridge() {
  if (
    typeof document === "undefined" ||
    typeof MutationObserver === "undefined" ||
    globalThis.AO_HOLY_ROSARY_FIELD_UI_BRIDGE
  ) {
    return false;
  }

  const refresh = () => {
    installApiBridge();
    if (syncInternalFieldBasis()) return;
    decorateFieldPreflight();
    globalThis.AO_SEQUENCE_BRIDGE_V23?.decorate?.();
  };

  document.addEventListener(
    "click",
    (event) => {
      const selected = event.target?.closest?.(
        '[data-ao-celebration="holy_rosary"]',
      );
      if (selected) queueMicrotask(refresh);
    },
    true,
  );

  const observer = new MutationObserver(() => queueMicrotask(refresh));
  observer.observe(document.documentElement, { childList: true, subtree: true });

  globalThis.AO_HOLY_ROSARY_FIELD_UI_BRIDGE = Object.freeze({
    installed: true,
    refresh,
  });
  queueMicrotask(refresh);
  return true;
}

export function installFieldCelebrationOverrides(
  catalogue = globalThis.AO_CELEBRATION_CATALOGUE ?? null,
) {
  const added = [];
  if (catalogue && typeof catalogue === "object") {
    for (const [id, definition] of Object.entries(
      FIELD_CELEBRATION_OVERRIDES,
    )) {
      if (catalogue[id]) continue;
      catalogue[id] = definition;
      added.push(id);
    }
  }

  installApiBridge();
  installUiBridge();

  return Object.freeze({
    installed: Boolean(catalogue && typeof catalogue === "object"),
    added: Object.freeze(added),
    externalSolemnityBridge: Boolean(
      globalThis.AO_CELEBRATION_API?.__aoHolyRosaryExternalSolemnityBridge,
    ),
  });
}
