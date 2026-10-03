// R19 — Missa Cantata certification projection over the immutable 178-event MC-* core.
// RG-003 closed by MC-CERT-2026-09-22.1. The base Low/Solemn event graph is not rewritten.

export const MISSA_CANTATA_FORMS = Object.freeze([
  "MISSA_CANTATA_SIMPLE",
  "MISSA_CANTATA_INCENSE",
]);

const FORM_PROFILE = Object.freeze({
  MISSA_CANTATA_SIMPLE: Object.freeze({
    key: "mc-simple",
    statusField: "Simple profile",
    certificateProfile: "SIMPLE_NO_INCENSE",
    incense: false,
  }),
  MISSA_CANTATA_INCENSE: Object.freeze({
    key: "mc-incense",
    statusField: "Incense profile",
    certificateProfile: "SOLEMNIZED_WITH_INCENSE",
    incense: true,
  }),
});

export function normalizeMissaCantataForm(value) {
  const v = String(value ?? "").trim().toUpperCase();
  const alias = {
    "MC-SIMPLE": "MISSA_CANTATA_SIMPLE",
    "SIMPLE_NO_INCENSE": "MISSA_CANTATA_SIMPLE",
    "MC-INCENSE": "MISSA_CANTATA_INCENSE",
    "SOLEMNIZED_WITH_INCENSE": "MISSA_CANTATA_INCENSE",
  }[v] ?? v;
  if (!MISSA_CANTATA_FORMS.includes(alias)) {
    throw new Error("Unsupported Missa Cantata form: " + value);
  }
  return alias;
}

export function bindingMap(bindings) {
  if (!Array.isArray(bindings)) throw new TypeError("Missa Cantata bindings array required");
  const map = new Map();
  for (const binding of bindings) {
    const id = binding?.["MC Event"];
    if (!/^MC-[A-Z0-9-]+$/.test(id ?? "")) throw new Error("Bad MC certification id: " + id);
    if (map.has(id)) throw new Error("Duplicate MC certification binding: " + id);
    map.set(id, binding);
  }
  return map;
}

function conditionSatisfied(condition, context, profile) {
  if (!condition) return true;
  switch (condition) {
    case "session.communicants": return context.faithfulCommunicantsPresent === true;
    case "mass.credo": return context.credoPresent === true;
    case "mass.gloria": return context.gloriaPresent === true;
    case "mass.sequence": return context.sequencePresent === true;
    case "mass.normal_last_gospel": return context.normalLastGospel !== false;
    case "session.incense": return profile.incense === true;
    case "session.asperges": return context.asperges === true;
    case "mass.form==SOLEMN": return false;
    case "dismissal_allows_blessing": return context.blessingAllowed !== false;
    case "mass.oratio_super_populum": return context.oratioSuperPopulumPresent === true;
    case "chant_setting==GREGORIAN": return (context.chantSetting ?? "GREGORIAN") === "GREGORIAN";
    case "chant_setting==NON_GREGORIAN_DEFERRED": return context.chantSetting === "NON_GREGORIAN_DEFERRED";
    case "session.custom_profile.second_confiteor_retained": return false;
    case "session.custom_profile.marian_antiphon_after_mass != 'NONE'": return false;
    default: return false;
  }
}

function statusAllows(status, context) {
  if (status === "ACTIVE") return true;
  if (status === "IF_FAITHFUL_COMMUNION") return context.faithfulCommunicantsPresent === true;
  if (status === "CONDITIONAL_PRE_MASS") return context.asperges === true;
  if (status === "SUPPRESSED") return false;
  return false;
}

export function assertMissaCantataCertification(manifest, bindings, baseEvents) {
  if (manifest?.certificate !== "MC-CERT-2026-09-22.1") throw new Error("Wrong MC certificate");
  if (manifest?.status !== "RG003_CERTIFIED_ORDINARY_MISSA_CANTATA") throw new Error("RG-003 is not certified");
  if (bindings.length !== manifest.bindingCount || bindings.length !== 189) throw new Error("MC binding count mismatch");
  if (!Array.isArray(baseEvents) || baseEvents.length !== manifest.canonicalBaseEventCount) throw new Error("MC base event count mismatch");

  const map = bindingMap(bindings);
  const baseIds = new Set(baseEvents.map((event) => event.id));
  if (baseIds.size !== baseEvents.length) throw new Error("Duplicate canonical base event id");
  for (const id of baseIds) if (!map.has(id)) throw new Error("Canonical event has no MC certification binding: " + id);

  const certOnly = [...map.keys()].filter((id) => !baseIds.has(id)).sort();
  const expectedExcluded = [...(manifest.excludedFromCanonicalCore ?? [])].sort();
  if (JSON.stringify(certOnly) !== JSON.stringify(expectedExcluded)) {
    throw new Error("MC certificate-only identity set differs from manifest");
  }

  const incense = manifest.profiles?.["mc-incense"];
  if (incense?.runtimeTorchbearerActor !== false) throw new Error("MC torchbearer runtime guard lost");
  if ((incense?.staffing ?? []).includes("TORCHBEARERS")) throw new Error("Torchbearers leaked into canonical MC runtime staffing");

  return Object.freeze({
    certificate: manifest.certificate,
    baseEvents: baseEvents.length,
    bindings: bindings.length,
    certificateOnly: Object.freeze(certOnly),
  });
}

export function projectMissaCantataEvents(baseEvents, bindings, input = {}) {
  const form = normalizeMissaCantataForm(input.form);
  const profile = FORM_PROFILE[form];
  const map = bindingMap(bindings);
  const projected = [];

  for (const event of baseEvents) {
    const binding = map.get(event.id);
    if (!binding) throw new Error("Missing MC certification binding: " + event.id);
    const status = binding[profile.statusField];
    if (!statusAllows(status, input)) continue;
    if (!conditionSatisfied(binding.Condition, input, profile)) continue;

    const resolvedActor = String(binding["Resolved actor"] ?? "");
    if (/\b(?:DEACON|SUBDEACON)\b/i.test(resolvedActor)) {
      throw new Error("Sacred-minister actor leaked into Missa Cantata: " + event.id);
    }
    if (/TORCHBEAR/i.test(resolvedActor)) {
      throw new Error("Torchbearer runtime actor leaked into Missa Cantata: " + event.id);
    }

    projected.push(Object.freeze({
      ...event,
      actorResolved: resolvedActor,
      audibilityResolved: binding.Audibility ?? null,
      mcCertification: Object.freeze({
        certificate: "MC-CERT-2026-09-22.1",
        form,
        profile: profile.certificateProfile,
        status,
        condition: binding.Condition ?? null,
        sourceMomentRefs: binding["E refs"] ?? null,
      }),
    }));
  }

  return Object.freeze(projected);
}
