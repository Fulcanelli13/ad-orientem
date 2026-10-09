// Conditional II-class Rogation Mass contract (1960 Rubricae generales §§80–90, 341–347).
// This is a pure Mass-owner decision: it does not infer a rite from a calendar date
// and never substitutes an ordinary feria or an unrelated votive Proper.
export const ROGATION_PROPER_KEYS = Object.freeze([
  "introit", "collect", "epistle", "gradual_alleluia", "gospel",
  "offertory", "secret", "communion", "postcommunion"
]);

export function rogationProperReady(gate, sourceProper = null) {
  if (gate?.schema !== "AO_1962_ROGATION_MASS_SOURCE_GATE_V1" ||
      gate?.publicationAllowed !== true ||
      gate?.status !== "PUBLISHED_1962_ROGATION_PROPER") return false;
  const rite = gate.scope?.conditionalMass;
  if (rite?.class !== 2 || rite?.colour !== "violet" ||
      rite?.handoff !== "INTROIT" || rite?.omitOpeningPrayers !== true ||
      rite?.gloria !== false || rite?.credo !== false) return false;
  const sections = gate.properSections;
  if (!Array.isArray(sections) || sections.length !== ROGATION_PROPER_KEYS.length) return false;
  const byKey = new Map(sections.map(section => [section?.key, section]));
  if (byKey.size !== ROGATION_PROPER_KEYS.length) return false;
  if (sourceProper?.schema !== "AO_1962_ROGATION_PROPER_V1" ||
      !Array.isArray(sourceProper.sections) ||
      sourceProper.sections.length !== ROGATION_PROPER_KEYS.length) return false;
  const sourceByKey = new Map(sourceProper.sections.map(s => [s?.key, s]));
  if (sourceByKey.size !== ROGATION_PROPER_KEYS.length) return false;
  return ROGATION_PROPER_KEYS.every(key => {
    const s = byKey.get(key);
    const content = sourceByKey.get(key);
    return s?.latinVerified === true && s?.englishVerified === true &&
      s?.frenchVerified === true && typeof s.exactSourceLocator === "string" &&
      s.exactSourceLocator.trim().length > 0 &&
      s.candidate?.translationRights === "CLEARED" &&
      // A metadata-only certificate is insufficient: require the actual
      // nine-section trilingual Proper from the canonical Mass text owner.
      content?.sourceLocator === s.exactSourceLocator &&
      ["latin","english","french"].every(lang =>
        typeof content[lang] === "string" && content[lang].trim().length > 10);
  });
}

// observanceConfirmed must be supplied by the shared liturgical-day resolver,
// including any lawful diocesan transfer; civil date alone is never enough.
// A procession and Ordinariate-authorised alternative public supplications
// are separate explicit service states under rubrics §§82–83 and 346.
export function resolveRogationMassVariant({
  choice = "DAY_MASS", observanceConfirmed = false, service = null,
  dayClass = null, sourceGate = null, sourceProper = null
} = {}) {
  if (!["DAY_MASS", "ROGATION_MASS"].includes(choice)) {
    throw new TypeError("Unknown Rogation Mass choice");
  }
  const ordinary = Object.freeze({
    selection: "DAY_MASS", availability: "AVAILABLE",
    massEntry: "FOOT_CLUSTER", properOwner: "DAY_RESOLVER",
    precedingRites: Object.freeze([])
  });
  const validPublicService = ["PUBLIC_PROCESSION", "ORDINARY_AUTHORIZED_SUPPLICATIONS"].includes(service);
  if (choice === "DAY_MASS") {
    if (service === null) return ordinary;
    if (observanceConfirmed !== true) return Object.freeze({
      ...ordinary, availability:"BLOCKED", reason:"ROGATION_OBSERVANCE_NOT_CONFIRMED"
    });
    if (!validPublicService) return Object.freeze({
      ...ordinary, availability:"BLOCKED", reason:"PUBLIC_RITE_NOT_CONFIRMED"
    });
    // RG 347: even when the votive is impeded, the Mass of the day is part
    // of the same action following the public procession or supplications.
    return Object.freeze({
      ...ordinary, massEntry:"INTROIT", omitOpeningPrayers:true,
      precedingRites:Object.freeze(["ROGATIONS"]), selectedService:service
    });
  }
  function block(reason) {
    return Object.freeze({
      selection: "ROGATION_MASS", availability: "BLOCKED", reason,
      massEntry: null, properOwner: null,
      precedingRites: Object.freeze([])
    });
  }
  if (observanceConfirmed !== true) return block("ROGATION_OBSERVANCE_NOT_CONFIRMED");
  if (!validPublicService) {
    return block("PUBLIC_RITE_NOT_CONFIRMED");
  }
  if (![1, 2, 3, 4].includes(dayClass)) return block("DAY_CLASS_NOT_VERIFIED");
  if (dayClass === 1) return block("VOTIVE_II_CLASS_IMPEDED");
  if (!rogationProperReady(sourceGate, sourceProper)) return block("PROPER_NOT_SOURCE_CERTIFIED");
  return Object.freeze({
    selection: "ROGATION_MASS", availability: "AVAILABLE",
    properOwner: "ROGATION_1962_SOURCE", massClass: 2, colour: "violet",
    massEntry: "INTROIT", omitOpeningPrayers: true, gloria: false, credo: false,
    precedingRites: Object.freeze(["ROGATIONS"]),
    selectedService: service
  });
}
