# Worldwide Traditional Mass — editable classification review (CL27)

**26 October 2026 · Single existing Directory research master · €0 · no public releases**

The classification layer belongs to the physical-site, ministry and celebration data model already in Ad Orientem. It is **not a replacement catalogue, second calendar, new map or independent source of truth**.

## Corpus currently integrated

- 2,579 provisional distinct physical-site anchors (2,584 historical site IDs with five aliases)
- 2,715 original classification-source assertions; 2,674 exact source + group joins
- 2,008 source-reported institute/community label leads; **not** certified celebrants or canonical standing
- 36 classification-only orphan sources, five inconsistent source/group joins and eight unclassified physical source entries remain separate
- Three original CL2 accepted source-scoped 1962 Missal witnesses; later CL liturgical-evidence research stays independent until reconciled
- Zero new public *una cum*, Missal, ecclesial-position, canonical-status or Mass-time approvals

Canonical taxonomy: `data/directory/tlm-user-classification-taxonomy.v1.json`. B92's separate `classification-contract.v1.json` defines current accepted runtime evidence enums. Extended review codes are **not automatically admitted** to the B92 runtime contract.

## Review your classifications — one self-contained HTML file

The following commands reconstruct the pinned source data from the repository and generate a local web-page **with the actual 2,579 physical sites and 2,715 source assertions embedded**. No web server, Excel upload, paid service or account is required.

```bash
python3 tools/directory/rebuild-cl2-research-snapshot.py \
  --snapshot-dir data/directory/research/cl2-unified-20261026 \
  --output /tmp/ao-tlm-registry.sqlite

python3 tools/directory/build-cl27-tlm-classifications.py \
  --db /tmp/ao-tlm-registry.sqlite \
  --output /tmp/ao-tlm-classifications.json \
  --html-output /tmp/ao-tlm-classification-review.html
```

Open `/tmp/ao-tlm-classification-review.html` directly in a browser. The page is interactive locally: search sites, select countries and source-labelled institutes, isolate available 1962 source witnesses, read the associated frozen provenance, and draft your own classifications under the correct subject scope.

A fallback `tools/directory/review-cl27-tlm-classifications.html` is a template that accepts the generated JSON via its file picker. The generated single HTML already includes it and needs no upload.

Use **Export draft decisions as JSON** to save `ad-orientem-tlm-classification-drafts.json`. This is **your editable editorial work**, not source-verified public data. Closing the browser without exporting loses unsaved drafts. Each draft includes the physical anchor, field, subject type, exact subject ID when known, value, source ID and type, HTTPS evidence URL, evidence date, and verbatim note.

## Reconcile exported draft classifications

```bash
python3 tools/directory/validate-cl27-editorial-classification-drafts.py \
  --db /tmp/ao-tlm-registry.sqlite \
  --input /path/to/ad-orientem-tlm-classification-drafts.json \
  --report /tmp/ao-tlm-classification-audit.json
```

The validator checks physical anchor, reference source ID, field/value/type, permitted subject scope, source URL, date and release locks. An incomplete submission, source not in CL2, a mismatched building, or an unspecified ministry/celebration remains a **HOLD**. Even a complete and correctly joined draft remains **pending independent source and editorial review**. The validator never updates the original source master, public map, liturgical settings or Mass times.

## Current public-map behavior

The existing 1,879 historical R49 pins keep source-labelled institute filters (including smaller religious communities), with clear disclosure that these are provisional. No public user interface may automatically infer *una cum*, sedevacantism, ordinary Catholic status, a 1962 Mass, physical access or a weekly timetable from an institute name.

Publicly displaying a sourced *sedevacantist* or *sedeprivationist* venue, when appropriate, requires an unmistakable separate ecclesial-category context; do not merge such records into standard Roman Catholic Mass recommendations. Traditional Ambrosian, Dominican, Carmelite, Premonstratensian, pre-1955 and Roman 1965 use likewise remain distinct from the 1962 Roman Missal.

## Acceptance

```bash
node tests/directory-cl27-user-classification-facets.mjs
node tests/directory-cl27-offline-editor.mjs
python3 tools/directory/validate-cl27-bulk-schedule-audit.py
```

The CL27 workflow also tests the full SQLite projection, synthetic editorial draft, and generated HTML/JSON parity. A downloadable GitHub Actions HTML artifact is retained temporarily for convenience, but **the generator and underlying source remain permanently reconstructible from checked-in data**. Run the workflow again if the temporary artifact expires.

**Merge dependency:** CL27 remains a draft stacked above CL26 and CL2–CL25, and must not be merged or deployed before relevant upstream reviews and CI pass.
