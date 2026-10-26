# CL8 — permanent research completeness audit (CL2–CL7)

**26 October 2026.** CL8 is an executable, field-by-field *research audit*, not a new population, publication approval or a replacement for CL2. All source records, frozen identifiers, historical VERIFIED labels and CL3–CL7 overlays remain unchanged.

## Run

From the repository root, on the **stacked CL8 branch** (CL2 → CL3 → CL4 → CL5 → CL6 → CL7 → CL8), with Python 3's standard library only:

```bash
python3 tools/directory/validate-cl3-reconciliation.py
python3 tools/directory/validate-cl4-owner-screening.py
python3 tools/directory/validate-cl5-provisional-intake.py
python3 tools/directory/validate-cl6-source-reconciliation.py
python3 tools/directory/validate-cl7-final-gaps.py
python3 tools/directory/rebuild-cl7-research-index.py --output /tmp/ao-cl8-master.sqlite
python3 tools/directory/audit-cl-completeness.py --db /tmp/ao-cl8-master.sqlite --output-dir /tmp/ao-cl8-audit
```

Outputs: (1) `cl_completeness_summary.json`, with source population and every field's numerator/denominator; (2) `field_metrics.csv`; (3) `missal_1962_reconciliation.csv`, with original timetable source ID, group ID, verbatim research wording, schedule URL and held classification join; (4) `institutional_url_review_queue.csv` with direct-review status; (5) `physical_precision_queue.csv`, separating missing descriptions from unassessed street-level precision. The same data are queryable in the rebuilt SQLite as `cl_audit_field` and `cl_1962_reconciliation`. Original tables are only read, never rewritten.

## Three independent progress gates

* **Presence / collected:** the field is actually populated; a copied source label is collected but NOT an established institution or rite.
* **Evidence state:** separates raw labels and transcribed timetable descriptions from directly reviewed owner evidence and formal accepted Missal witnesses. Different claim scopes cannot be promoted through joins.
* **Release:** all CL8 rows remain `HOLD_NOT_PUBLIC`, including good-looking sites and historical timetable rows labelled VERIFIED. No public pin, live schedule, Una Cum filter, canon-law assessment or celebrant claim is generated.

Counts and denominators are explicitly per row type: 2,584 *historical site IDs* (2,579 provisional physical anchors), 2,715 source-level classifications, 4,681 historical timetable rows. Those populations must not be added together or interpreted as identical physical celebrations. Five CL2 same-source group contradictions, 36 unadmitted classification-only source IDs and eight venue-only sources remain preserved in the source master. CL3–CL7's 77 description backfills reduce CL2's 113 originally blank descriptions to 36 *research-description* blanks, not 36 remaining map pins.

The street-precision queue is intentionally **conservative**: unless CL3–CL7 supplies a specific documented precision label, earlier CL2 descriptions are flagged for precision assessment. Thus the queue is **not** a statistic claiming all other CL2 descriptions lack streets. A documented postal street address also does not certify entrance geometry, actual Mass location or public release.

## 1962 wording reconciliation: no silent promotion

There are **three** accepted CL2 source-level owner witnesses for a 1962-Missal claim. A wider pool of 1962 references appears in existing timetable records, but its size depends on the extraction rule. The earlier **396** timetable reference count is a historical working figure, not an owner-witness count.

CL8 deterministically checks the *rite/Mass type* column for literal `1962`, then checks the public-evidence-excerpt field and supplementary timetable notes separately; an explicit `Missal of St John XXIII` label is also captured in its own category. The precedence is: literal 1962 in Mass type → 1962 in transcribed excerpt → 1962 in researcher notes → John XXIII label. The CSV preserves original text and links. A `VERIFIED` historical schedule with a date and an official URL remains a **reconciliation candidate**, not accepted source wording: a human must open the exact owner page, establish whether the phrase describes a specific celebration, and confirm provenance and temporal scope.

No inference from FSSP, ICKSP, diocesan affiliation, or generic `Traditional Latin Mass` to a Missal edition. No equation of traditional Lyonese or another non-Roman usage with the Roman 1962 Missal. Una Cum is celebration/ministry-specific and stays UNKNOWN without explicit scoped evidence.

## Workflow and audit invariants

`.github/workflows/directory-cl8-completeness.yml` rebuilds from committed source shards with existing checksum validation and checks: frozen populations; effective 36 missing descriptions; 200 recorded institutional URLs, five directly reviewed and **195 requiring review**; three accepted owner witnesses; zero newly approved Missal/Una Cum/recurrence claims; zero public-release flags; no foreign-key or integrity errors. CSV and JSON are regenerated on each run and can be saved as a short-lived CI artifact; the **committed source + code**, not the artifact-retention period, are the permanent archive.

Recommended research sequence: review the existing timetable 1962 reconciliation queue in owner-page batches, resolve 195 institutional links, investigate 36 blank descriptions and independent street/entrance precision, then submit explicitly scoped verified claims through the already-established Directory release contract. These are **independent completion programmes**, not one total percent.
