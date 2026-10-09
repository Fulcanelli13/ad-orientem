import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(path, "utf8"));
const root = "data/learn/";
const packs = [
  "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
  "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json"
].map(x => read(root + x));
const byOwner = new Map(packs.flatMap(pack => pack.dossiers.map(d => [
  d.id, { dossier: d, sources: new Map(pack.source_registry.map(s => [s.id, s])) }
])));
const r5 = read(root + "formation-primary-context-review-5-2026-10-09.v1.json");
const review = read(root + "formation-primary-context-review-6-2026-10-09.v1.json");
assert.equal(r5.findings.length, 25);
assert.equal(review.version, "FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS6_20261009_V1");
assert.equal(review.scope.prior_findings_retained, 121);
assert.equal(review.scope.additional_findings, 26);
assert.equal(review.findings.length, 26);
assert.equal(new Set(review.findings.map(f => f.id)).size, 26);
assert.equal(new Set(review.findings.map(f => f.owner)).size, 19);
assert.equal(review.scope.english_french_user_sections_updated, 7);
for (const finding of review.findings) {
  const obj = byOwner.get(finding.owner);
  assert.ok(obj, finding.id + ": nonexistent canonical owner");
  const section = obj.dossier.sections.find(s => s.role === finding.role);
  assert.ok(section, finding.id + ": nonexistent role");
  assert.ok(section.source_ids.includes(finding.source_id), finding.id + ": source not cited by role");
  assert.equal(obj.sources.get(finding.source_id)?.url, finding.url, finding.id + ": URL differs from actual source");
  assert.match(finding.url, /^https:\/\/[^\s/]+\/\S+/);
  assert.ok(finding.locator.length >= 24 && finding.document_finding.length >= 75 && finding.qualification.length >= 60, finding.id + ": thin observation");
  assert.equal(finding.independent_certified, false, finding.id + ": editorial check is not independent certification");
  assert.equal(section.original_context_approved, false);
  assert.equal(section.french_final_approved, false);
}
for (const pack of packs) for (const d of pack.dossiers) {
  for (const key of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
    assert.equal(d[key], false, d.id + ": must remain held");
  for (const section of d.sections) {
    for (const id of Object.keys(section.source_claim_locators || {}))
      assert.ok(section.source_ids.includes(id), d.id + ": scope locator without source ownership");
  }
}
const pos = (id, role) => byOwner.get(id).dossier.sections.find(s => s.role === role);
assert.match(pos("APOL-013","documented_objection").text.en, /I\.2.*I\.3/);
assert.match(pos("APOL-008","documented_position").text.en, /had a beginning/);
assert.match(pos("APOL-028","documented_position").text.en, /XXIV\.5–6/);
assert.match(pos("APOL-030","documented_position").text.en, /XXIX\.5–7/);
assert.match(pos("APOL-031","documented_position").text.en, /XXIX\.2/);
assert.match(pos("APOL-043","documented_position").text.en, /III\.1.*III\.7/);
assert.match(pos("APOL-048","documented_position").text.en, /'willed by God'/);
assert.match(pos("APOL-039","answer").source_claim_locators.LG, /§§14–16/);
assert.match(packs[3].source_registry.find(s => s.id === "LG").locator, /14–16/);
assert.match(packs[3].source_registry.find(s => s.id === "WCF").locator, /XXIV/);
assert.equal(review.publication_allowed, false);
assert.equal(review.independent_theological_canonical_approval, false);
assert.equal(review.native_french_copyapproval, false);
console.log(JSON.stringify({status:"PASS",newFindings:26,ownersReviewed:19,bilingualDebatesRewritten:7,approvals:0,published:0}));
