import { assertMCEvent, CERTIFIED_FORMS, GATED_FORMS } from "./contracts.js";

const CONDITION = Object.freeze({
  INCENSE_ENABLED: (ctx) => ctx.incenseEnabled === true,
  GLORIA_PRESENT: (ctx) => ctx.gloriaPresent === true,
  SEQUENCE_PRESENT: (ctx) => ctx.sequencePresent === true,
  CREDO_PRESENT: (ctx) => ctx.credoPresent === true,
  CHANT_SETTING_GREGORIAN: (ctx) => ctx.chantSetting === "GREGORIAN",
  CHANT_SETTING_NON_GREGORIAN_DEFERRED: (ctx) => ctx.chantSetting === "NON_GREGORIAN_DEFERRED",
  FORM_IS_SOLEMN: (ctx) => ctx.form === "SOLEMN",
  FAITHFUL_COMMUNICANTS_PRESENT: (ctx) => ctx.faithfulCommunicantsPresent === true,
  ORATIO_SUPER_POPULUM_PRESENT: (ctx) => ctx.oratioSuperPopulumPresent === true,
  BLESSING_ALLOWED: (ctx) => ctx.blessingAllowed === true,
  NORMAL_LAST_GOSPEL: (ctx) => ctx.normalLastGospel === true,
});

export function normalizeObjectiveContext(input = {}) {
  const form = input.form ?? "LOW";
  if (!CERTIFIED_FORMS.includes(form)) {
    const gap = GATED_FORMS[form];
    throw new Error(gap ? `${form} is research-gated by ${gap}` : `Unsupported Mass form: ${form}`);
  }
  return Object.freeze({
    form,
    incenseEnabled: input.incenseEnabled === true,
    gloriaPresent: input.gloriaPresent === true,
    sequencePresent: input.sequencePresent === true,
    credoPresent: input.credoPresent === true,
    chantSetting: input.chantSetting ?? "GREGORIAN",
    faithfulCommunicantsPresent: input.faithfulCommunicantsPresent === true,
    oratioSuperPopulumPresent: input.oratioSuperPopulumPresent === true,
    blessingAllowed: input.blessingAllowed !== false,
    normalLastGospel: input.normalLastGospel !== false,
  });
}

export function conditionSatisfied(condition, context) {
  const evaluator = CONDITION[condition];
  if (!evaluator) return false; // unknown conditions fail closed
  return evaluator(context);
}

export function eventAvailableForObjectiveTraversal(event, context) {
  assertMCEvent(event);
  if (event.forms?.[context.form] !== "CERTIFIED") return false;
  return (event.conditions ?? []).every((condition) => conditionSatisfied(condition, context));
}

export function buildObjectiveTraversal(events, input = {}) {
  if (!Array.isArray(events)) throw new TypeError("Canonical MC event array required");
  const context = normalizeObjectiveContext(input);
  const ordered = [...events].map(assertMCEvent).sort((a, b) => a.order - b.order);
  const seen = new Set();
  let lastOrder = 0;
  for (const event of ordered) {
    if (seen.has(event.id)) throw new Error("Duplicate MC event id: " + event.id);
    seen.add(event.id);
    if (event.order <= lastOrder) throw new Error("MC event order must be strictly increasing");
    lastOrder = event.order;
  }
  return Object.freeze(ordered.filter((event) => eventAvailableForObjectiveTraversal(event, context)));
}

export function sourceMomentCoverage(events) {
  const refs = new Set();
  for (const event of events) for (const ref of event.sourceMomentRefs ?? []) refs.add(ref);
  return Object.freeze([...refs].sort());
}

export class ObjectiveMassSession {
  #events;
  #index;

  constructor(events, context) {
    this.#events = buildObjectiveTraversal(events, context);
    this.#index = 0;
  }

  get length() { return this.#events.length; }
  get index() { return this.#index; }
  get current() { return this.#events[this.#index] ?? null; }
  get currentEventId() { return this.current?.id ?? null; }
  get atStart() { return this.#index === 0; }
  get atEnd() { return this.#events.length === 0 || this.#index === this.#events.length - 1; }

  goTo(eventId) {
    const next = this.#events.findIndex((event) => event.id === eventId);
    if (next < 0) return false;
    this.#index = next;
    return true;
  }

  next() {
    if (!this.atEnd) this.#index += 1;
    return this.current;
  }

  previous() {
    if (!this.atStart) this.#index -= 1;
    return this.current;
  }

  snapshot() {
    return Object.freeze({
      currentEventId: this.currentEventId,
      index: this.#index,
      length: this.#events.length,
    });
  }
}
