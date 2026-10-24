# Pitrè 1900 — Wave06, 237 rendered source-image region inspections and 3 OCR-anchor corrections

**Date:** 24 October 2026. **Scope:** Draft PR #1572, research only. This report supersedes neither the immutable Wave04 105-pending intake snapshot nor the Wave05 132 staged / 63 held editorial record.

## Actual progress

| Gate | Wave04 | Wave05 staged | Total |
|---|---:|---:|---:|
| Source observations under inspection | 105 | 132 | **237** |
| Individually generated original-scan anchor-region crop previews | 105 | 132 | **237** |
| Original-scan crop previews included in sheets and visually inspected | 105 | 132 | **237** |
| Original exact normalized Italian anchors matched in assigned PDF word stream | 105 | 129 | 234 |
| Original anchors requiring correction or extension | 0 | 3 | 3 |
| Corrected Italian anchor matched in the original PDF word stream | — | 3 | 3 |
| Complete original folios line-by-line visually certified | 0 | 0 | **0** |
| Independent source witness / Roman Ritual authorization / practice continuity proven | 0 | 0 | **0** |
| New canonical workbench observations / published customs | 0 | 0 | **0** |

**Crucial gate distinction:** The 237 cropped regions were rendered from the original scan and inspected as contact-sheet images. The source's searchable PDF text was used for precise locator extraction. A cropped-region review is *not* an independent OCR check, an exhaustive scan of the entire page, a full-folio facsimile certification, or historical authority verification. No automatic customary identity, rite, miracle, source independence or modern continuity is inferred.

The source is the original 1900 printed volume by Giuseppe Pitrè, *Feste patronali in Sicilia*, archive item `afm3499.0021.001.umich.edu`; PDF SHA-256: `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`. The scanned PDF is in the attached research library, not committed to GitHub. Nine Wave04 contact sheets and eleven Wave05 contact sheets were generated for inspection, but were not committed as large image binaries. Every one of the 237 record metadata mappings can be reconstructed from the reference scan using the original PDF page and textual anchor recorded in the ledger.

## Wave05 OCR-anchor repairs (without rewriting history)

- `PIT1900-W05-OBS-007` — Original OCR phrase omitted punctuation and intervening characters around *nembi di fiori*, PDF p. 121 / printed p. 59. Exact revised source anchor: `Bisognerebbe dire de' nembi ' di fiori che cadono di sui balconi al suo passaggio`.
- `PIT1900-W05-OBS-072` — Original anchor contained punctuation/spacing distortion; underlying printed sentence is `Quella di S. aiorgio dura due giorni, 23 e 24 Aprile, ma non ha nulla che attiri`, PDF p. 370 / printed p. 312. The OCR renders *Giorgio* as `aiorgio`; this correction is **not** a claim that the print literally spells the name that way.
- `PIT1900-W05-OBS-093` — The original selected snippet began with the corrupted page header `LA MADONNA DEL EOSARIO IN CASTROFILTPPO` and could not be located as a contiguous phrase in the word stream. The authentic passage begins `Le cavalcano giovani aitanti e puliti e vanno per il paese raccogliendo attorno a sé`, PDF p. 457 / printed p. 399. The corrected anchor is source-located, but the underlying header transcription remains an OCR artifact and must not be quoted as faithful Italian.

All three corrected anchor strings match the original PDF word stream after lowercase, accent and non-alphanumeric normalization. Original intake evidence strings remain unchanged, with reversible corrections only in the Wave06 ledger.

## Safety, integrity and counters

- **Source observation count remains 3,512.** Wave05's 132 source observations are staged but not yet appended to the unified workbench.
- The earlier 408 provisional practice groups and 56 overlapping working identities remain unchanged.
- The 63 held Wave05 leads remain unpromoted. They require further reading and editorial review, not automatic incorporation into the registry.
- The 105 Wave04 original queue flags remain an as-of-Wave04 snapshot. Wave06 adds a later, separately auditable contact-preview inspection layer; it does not claim that the older queue magically certified whole folios.
- This audit is source-locator evidence; it confers **no right to publish historical folk beliefs, blessing formulae, or modern feast dates** as Catholic liturgical authority.

## Committed artifacts and validation

- `data/customs/master/pitre-1900-wave06-237-image-preview-review-and-3-anchor-corrections.v1.json` — 237 individual source-image preview inspection records and three corrected textual locators.
- `tests/customs-pitre-1900-wave06-source-image-preview.mjs` — coverage, provenance, noncollision, edition-hash and no-promotion invariants.
- `.github/workflows/customs-master-integrity.yml` — Wave06 test added to PR checks.

CI validates the committed metadata and non-loss invariants, **not** a fresh visual examination of the pixels or historical correctness. A fresh reviewer can reproduce all rendered images from the checksum-matched scan.

**Next release gates:** complete substantive whole-folio review where needed, resolve any stage duplicates and dependency questions, and atomically add source-backed Wave05 observations to the canonical research workbench with all authority and publication flags still false. Do not restart earlier classifications.
