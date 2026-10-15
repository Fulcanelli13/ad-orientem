import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(path, "utf8"));
const b3 = read("data/learn/formation-canonical-synthesis-batch3-2026-10-09.v1.json");
const review4 = read("data/learn/formation-primary-context-review-4-2026-10-09.v1.json");
const review5 = read("data/learn/formation-primary-context-review-5-2026-10-09.v1.json");
const reconciliation = read("data/reference/formation-current-source-reconciliation.v2.json");
const owners = new Map(b3.dossiers.map(d => [d.id, d]));
const sources = new Map(b3.source_registry.map(s => [s.id, s]));
assert.equal(review4.findings.length, 31);
assert.equal(review5.version, "FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS5_20261009_V1");
assert.equal(review5.scope.prior_findings_retained, 96);
assert.equal(review5.findings.length, 25);
assert.equal(review5.scope.additional_findings, 25);
assert.equal(review5.scope.canonical_existing_owners_examined.length, 13);
assert.equal(review5.scope.limited_source_previews, 1);
assert.equal(review5.scope.english_french_user_sections_updated, 4);
assert.equal(review5.scope.source_registry_entries_added, 1);
assert.equal(new Set(review5.findings.map(x => x.id)).size, 25);
assert.equal(new Set(review5.findings.map(x => x.owner)).size, 13);
const historicalRescopes = new Map(reconciliation.historical_pass5_source_dispositions.map(x=>[x.finding_id,x]));
assert.equal(historicalRescopes.size,3,"All changed previously reviewed source relationships need an explicit disposition");
let unchangedSourceEdges=0,documentedSourceRescopes=0;
for (const f of review5.findings) {
  const dossier = owners.get(f.owner);
  assert.ok(dossier, "Unknown owner: " + f.owner);
  const section = dossier.sections.find(s => s.role === f.role);
  assert.ok(section, f.id + ": historical role lost");
  assert.equal(sources.get(f.source_id)?.url, f.url, f.id + ": historical source URL changed");
  if(section.source_ids.includes(f.source_id)) {
    unchangedSourceEdges++;
    assert.ok(!historicalRescopes.has(f.id),f.id+": unchanged source incorrectly declared superseded");
  } else {
    documentedSourceRescopes++;
    const change=historicalRescopes.get(f.id);
    assert.ok(change,f.id+": old finding displaced without bounded version disposition");
    assert.equal(change.owner,f.owner);assert.equal(change.role,f.role);
    assert.equal(change.historic_source_id,f.source_id);
    assert.equal(change.historic_url,f.url);
    assert.deepEqual(change.current_source_ids,section.source_ids);
    assert.ok(change.disposition.length>65&&/NOT_|NO_VERDICT|NO_LONGER|NO_CLAIM/.test(change.disposition),
      f.id+": rescope must not imply old passage certifies new claim");
    const matching=section.source_ids.filter(id=>sources.get(id)?.url===f.url);
    assert.deepEqual(matching,change.matching_url_successor_id?[change.matching_url_successor_id]:[]);
  }
  assert.match(f.url, /^https:\/\/[^/\s]+\/\S+/);
  assert.ok(f.locator.length > 25 && f.document_finding.length > 60 && f.qualification.length > 50, f.id + ": thin finding");
  assert.ok(["BOUNDED_PRIMARY_DOCUMENT_EDITORIAL_CHECK", "LIMITED_SOURCE_PREVIEW_EDITORIAL_TRIAGE"].includes(f.status));
  assert.equal(f.independent_certified, false);
  assert.equal(section.original_context_approved, false);
  assert.equal(section.french_final_approved, false);
}
const P = (id, role) => owners.get(id).sections.find(s => s.role === role);
assert.match(P("CR-ECC-05", "critical_response").text.en, /Canon 1353.*canon 1736/);
assert.match(P("CR-ECC-05", "critical_response").text.fr, /canon 1353.*canon 1736/);
assert.ok(P("CR-ECC-05", "critical_response").source_ids.includes("CIC1353"));
assert.match(P("CR-AUT-07", "documented_position").text.en, /parish churches.*priests ordained after/);
assert.match(P("CR-AUT-03", "answer").text.en, /knowledge, competence and standing/);
assert.match(P("CR-GOV-06", "critical_response").text.en, /1962 Missal/);
assert.equal(unchangedSourceEdges,22);
assert.equal(documentedSourceRescopes,3);
assert.equal(reconciliation.metrics.historical_pass5_still_same_source_id,22);
assert.equal(reconciliation.metrics.historical_pass5_dispositions,3);
assert.equal(b3.source_registry.length, b3.metrics.source_registry_entries);
for (const d of b3.dossiers) {
  for (const key of ["publication_allowed", "original_claim_by_claim_source_context_certified", "independent_theological_canonical_approval", "native_french_copyapproval"]) {
    assert.equal(d[key], false, d.id + ": fabricated release");
  }
}
for (const key of ["publication_allowed", "independent_theological_canonical_approval", "native_french_copyapproval"])
  assert.equal(review5[key], false);
console.log(JSON.stringify({ status: "PASS", dossiersExamined: 13, editorialFindings: 25, stillSameSourceBinding:22, historicallyRescoped:3, limitedPreview: 1, bilingualSectionsCorrected: 4, independentApprovals: 0, published: 0 }));
