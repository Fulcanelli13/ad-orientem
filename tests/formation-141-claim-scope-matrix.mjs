import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(path, "utf8"));
const report = read("data/learn/formation-141-claim-scope-matrix-2026-10-09.v1.json");
const packs = report.source_packs.map(path => ({path, data: read(path)}));
const reviews = report.review_ledgers.map(path => ({path, data: read(path)}));
assert.equal(report.version, "FORMATION_141_CLAIM_SCOPE_MATRIX_20261009_V1");
assert.match(report.count_semantics, /NOT_FULL_PASSAGE_COLLATION_OR_THEOLOGICAL_APPROVAL/);
assert.equal(packs.length, 8);
assert.equal(reviews.length, 9);
assert.equal(report.limited_bibliographic_observations,1);
assert.ok(report.review_ledgers.some(p=>p.includes("review-7-2026-10-09")));
assert.ok(report.review_ledgers.some(p=>p.includes("review-8-2026-10-09")));
assert.ok(report.review_ledgers.some(p=>p.includes("review-9-2026-10-09")));
const findings = reviews.flatMap(({data}) => data.findings);
assert.equal(new Set(findings.map(f => f.id)).size, findings.length, "Duplicated findings inflate progress");
const findingsByRole = new Map();
for (const f of findings) {
  const key = f.owner + "|" + f.role;
  if (!findingsByRole.has(key)) findingsByRole.set(key, []);
  findingsByRole.get(key).push(f.id);
  assert.equal(f.independent_certified, false, f.id + ": editorial observation is not expert certification");
}
const byId = new Map(report.dossiers.map(d => [d.id,d]));
assert.equal(byId.size, 141, "All canonical owners must be present exactly once");
let sections = 0, scoped = 0, ownersWithReview = 0;
for (const {path,data} of packs) {
  const sources = new Map(data.source_registry.map(s => [s.id,s]));
  assert.equal(sources.size, data.source_registry.length);
  assert.equal(data.publication_allowed, false);
  for(const actual of data.dossiers) {
    const snapshot = byId.get(actual.id);
    assert.ok(snapshot, "Unlisted canonical owner " + actual.id);
    assert.equal(snapshot.source_file, path, actual.id + ": wrong source");
    assert.equal(snapshot.canonical_owner, actual.id.startsWith("APOL-") ? "APOLOGETICS" : "CHURCH_CRISIS");
    assert.equal(snapshot.section_count, 4);
    assert.equal(actual.sections.length, snapshot.roles.length);
    assert.equal(snapshot.current_state, snapshot.sections_with_bounded_review > 0 ? "PARTIAL_SOURCE_CONTEXT_REVIEW" : "NO_BOUNDED_SOURCE_CONTEXT_REVIEW");
    assert.equal(snapshot.independent_theological_canonical_approval, false);
    assert.equal(snapshot.native_french_copyapproval, false);
    assert.equal(snapshot.publication_allowed, false);
    for(const flag of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
      assert.equal(actual[flag], false, actual.id + ": release flag must remain closed");
    const unreviewed = [];
    let reviewedCount = 0, findingCount = 0;
    for (const [i,role] of actual.sections.entries()) {
      const s = snapshot.roles[i];
      const expected = findingsByRole.get(actual.id+"|"+role.role) || [];
      assert.equal(role.role, s.role);
      assert.equal(s.source_id_count, role.source_ids.length);
      assert.deepEqual(s.bounded_findings,expected,actual.id+":"+s.role+" review ledger mismatch");
      const missing = role.source_ids.filter(id=>!sources.has(id));
      assert.deepEqual(s.unresolved_source_ids,missing,actual.id+":"+s.role+" source registry mismatch");
      assert.equal(missing.length,0,actual.id+":"+s.role+" unresolved citation");
      assert.ok(role.text.en.length>180 && role.text.fr.length>180);
      assert.equal(s.original_context_expert_approved, false);
      assert.equal(s.native_french_expert_approved, false);
      assert.equal(role.original_context_approved,false);
      assert.equal(role.french_final_approved,false);
      if(!expected.length)unreviewed.push(role.role);
      else reviewedCount++;
      findingCount += expected.length;
      sections++;if(expected.length)scoped++;
    }
    assert.deepEqual(snapshot.unreviewed_roles,unreviewed,actual.id+" incomplete role reconciliation");
    assert.equal(snapshot.sections_with_bounded_review,reviewedCount);
    assert.equal(snapshot.review_findings,findingCount);
    if (reviewedCount) ownersWithReview++;
  }
}
const expectedMetrics = {
  canonical_dossiers:byId.size,
  substantive_sections: sections,
  bounded_source_review_findings: findings.length,
  distinct_sections_with_bounded_review:scoped,
  distinct_sections_without_bounded_review:sections-scoped,
  dossiers_with_any_bounded_review:ownersWithReview,
  dossiers_without_any_bounded_review:byId.size-ownersWithReview,
  dossiers_independently_certified:0,
  dossiers_published:0
};
assert.deepEqual(report.metrics,expectedMetrics,"Tracked approval/coverage must be recalculated from original source and reviewer ledgers");
assert.equal(report.metrics.canonical_dossiers,141);
assert.equal(report.metrics.substantive_sections,564);
assert.equal(report.metrics.bounded_source_review_findings,345);
assert.equal(report.metrics.distinct_sections_with_bounded_review,304);
assert.equal(report.metrics.distinct_sections_without_bounded_review,260);
assert.equal(report.metrics.dossiers_without_any_bounded_review,0);
console.log(JSON.stringify({status:"PASS",...report.metrics,meaning:"EDITORIAL_SCOPE_ONLY_NOT_INDEPENDENT_CERTIFICATION"}));
