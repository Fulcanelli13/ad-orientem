import { scripturePassage } from "./catalogue.js";

/**
 * Static checks, not theological certification. Human editors must separately
 * verify quotation, context, mystery relevance and translation fidelity.
 * Expects one item per planned Rosary quotation (normally 20 mysteries x 10).
 */
export function auditRosaryScriptureSlots(slots, { expectedCount = 200 } = {}) {
  if (!Array.isArray(slots)) throw new TypeError("Expected Rosary Scripture slots array");
  const problems = [];
  const ids = new Set();
  if (slots.length !== expectedCount) problems.push({
    issue: "wrong-count", expected: expectedCount, actual: slots.length
  });
  for (const [index, slot] of slots.entries()) {
    const id = slot?.id;
    if (!id || typeof id !== "string" || ids.has(id)) {
      problems.push({ index, id: id ?? null, issue: "missing-or-duplicate-id" });
    } else ids.add(id);
    if (!slot?.mysteryId) problems.push({ index, id, issue: "missing-mystery" });
    try { scripturePassage(slot?.passage || {}); }
    catch { problems.push({ index, id, issue: "invalid-passage" }); }
    if (!slot?.sourceEdition || !slot?.sourceUrl) {
      problems.push({ index, id, issue: "missing-source-provenance" });
    }
    if (slot?.review?.textAccuracy !== "approved" ||
        slot?.review?.context !== "approved" ||
        slot?.review?.mysteryRelevance !== "approved" ||
        slot?.review?.translationFidelity !== "approved") {
      problems.push({ index, id, issue: "editorial-certification-incomplete" });
    }
  }
  return Object.freeze({
    expectedCount, receivedCount: slots.length,
    certified: problems.length === 0,
    problems: Object.freeze(problems)
  });
}
