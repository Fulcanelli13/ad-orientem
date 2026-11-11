import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const a=read("data/geography/research/sacred-atlas-169-consolidated-admission-board-20261107.v1.json"),source=read("data/geography/research/"+ "sacred-atlas-169-owner-review-intake-20261106.v1.json");
const by=new Map(source.candidates.map(x=>[x.candidate_id,x]));
assert.equal(a.status,"RESEARCH_OWNER_REVIEW_PACKET_NOT_APPROVED");
assert.deepEqual(a.counts,{total:169,A_OWNER_REVIEW_ILLUSTRATIVE:98,B_OWNER_REVIEW_WITH_SCOPE_NOTE:68,C_REPAIR_EVIDENCE_OR_TITLE:0,D_PHYSICAL_IDENTITY_HOLD:1,E_EXISTING_DRAFT_SIGNOFF:2,presentable_to_owner:166,pre_decision_holds_or_repairs:1,existing_draft_requiring_signoff:2,approved:0,import_ready:0,published:0});
assert.equal(a.records.length,169);
assert.equal(new Set(a.records.map(x=>x.candidate_id)).size,169);
for(const row of a.records){const v=by.get(row.candidate_id);assert.ok(v);assert.equal(row.name,v.site_name);assert.equal(row.country_code,v.country_code);assert.equal(row.point.lat,v.staged_point.latitude);assert.equal(row.point.lng,v.staged_point.longitude);assert.equal(row.point.scope,v.staged_point.precision_suggestion);assert.equal(row.point.owner_accepted,false);assert.equal(row.point.independently_certified_entrance,false);assert.equal(row.owner_decision,"PENDING");assert.equal(row.identity_final,false);assert.equal(row.import_ready,false);assert.equal(row.publication_authorized,false);assert.equal(row.owner_review_presentable,/^[AB]_/.test(row.lane));assert.equal(row.already_draft_place_id,v.draft_b21_place_id);assert.ok(row.best_evidence_url?.startsWith("https://"));assert.equal(row.lane.startsWith("E_"),v.already_in_draft_unapproved);}
for(const id of ["SG-INV-0343","SG-INV-0465","SG-INV-0517","SG-INV-0616"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"B_OWNER_REVIEW_WITH_SCOPE_NOTE");
assert.equal(a.records.find(x=>x.candidate_id==="SG-INV-0717").lane,"D_PHYSICAL_IDENTITY_HOLD");
for(const id of ["SG-INV-0704","SG-INV-0731","SG-INV-0396"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"B_OWNER_REVIEW_WITH_SCOPE_NOTE");
for(const id of ["SG-INV-0415","SG-INV-0722"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"E_EXISTING_DRAFT_SIGNOFF");
for(const id of ["SG-INV-0021","SG-INV-0558","SG-INV-0564","SG-INV-0554","SG-INV-0664"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"B_OWNER_REVIEW_WITH_SCOPE_NOTE");
assert.equal(a.records.filter(x=>x.owner_review_presentable).length,166);
assert.equal(a.rules.never_auto_import,true);
assert.equal(a.rules.no_new_canonical_place_ids,true);

// The Lane-B decision packet must be a complete one-to-one view of the
// canonical B records, not a second editable Place or approval master.
const packet = readFileSync(new URL("../data/geography/research/sacred-atlas-169-owner-review-packet-20261107.md", import.meta.url), "utf8");
const qualifiedStart = "## Qualified Lane B — 68 existing candidates (10 November 2026)";
const qStart = packet.indexOf(qualifiedStart);
const qEnd = packet.indexOf("| Decision lane | Count | Meaning |", qStart);
assert.ok(qStart > -1 && qEnd > qStart, "Qualified Lane B must precede canonical decision-lane inventory");
const qualified = packet.slice(qStart, qEnd);
const qualifiedRows = [...qualified.matchAll(/^\| \x60(SG-INV-\d{4})\x60 \|.*$/gm)];
const qualifiedIDs = qualifiedRows.map(m => m[1]);
const canonicalB = a.records.filter(x => x.lane === "B_OWNER_REVIEW_WITH_SCOPE_NOTE");
assert.equal(canonicalB.length, 68);
assert.equal(qualifiedIDs.length, 68, "Exactly 68 row entries in the review packet");
assert.equal(new Set(qualifiedIDs).size, 68, "No duplicated Lane-B row");
assert.deepEqual([...qualifiedIDs].sort(), canonicalB.map(x => x.candidate_id).sort(),
  "The review packet must contain every canonical Lane-B candidate exactly once");
for (const match of qualifiedRows) {
  const candidate = canonicalB.find(x => x.candidate_id === match[1]);
  const line = match[0];
  assert.ok(line.includes(candidate.country_code), candidate.candidate_id + " country omitted");
  assert.ok(line.includes(candidate.point.scope), candidate.candidate_id + " map-scope omitted");
  assert.ok(line.includes(candidate.best_evidence_url), candidate.candidate_id + " evidence URL omitted");
  assert.equal(candidate.owner_decision, "PENDING");
  assert.equal(candidate.identity_final, false);
  assert.equal(candidate.publication_authorized, false);
  assert.equal(candidate.import_ready, false);
}
const groupCounts = [
  ["### 35 — Named sanctuary, complex or locality scope", 35],
  ["### 9 — Distinct Place near another existing Place", 9],
  ["### 5 — Eastern Catholic or historical ecclesial scope", 5],
  ["### 19 — Source, precise identity or formal-title follow-up", 19],
];
for (let i = 0; i < groupCounts.length; i++) {
  const [heading, expected] = groupCounts[i];
  const start = qualified.indexOf(heading);
  assert.ok(start > -1, "Missing review lane " + heading);
  const end = i + 1 < groupCounts.length ? qualified.indexOf(groupCounts[i + 1][0], start + heading.length) : qualified.length;
  assert.ok(end > start);
  assert.equal([...qualified.slice(start, end).matchAll(/^\| \x60SG-INV-\d{4}\x60 \|/gm)].length,
    expected, "Incorrect group size " + heading);
}
assert.deepEqual(canonicalB.reduce((s, row) => {
  s[row.point.scope] = (s[row.point.scope] || 0) + 1;
  return s;
}, {}), {locality: 24, complex_anchor: 27, site: 17});
assert.equal(canonicalB.filter(x => x.nearest_current_draft).length, 12);
assert.equal(canonicalB.filter(x => x.proposed_display_name).length, 15);
assert.equal(canonicalB.filter(x => x.point.independently_certified_entrance).length, 0);

console.log("PASS 169 owner review lanes 98/68/0/1/2; 16 case remediation crosswalk; all remain unapproved and not import-ready");
