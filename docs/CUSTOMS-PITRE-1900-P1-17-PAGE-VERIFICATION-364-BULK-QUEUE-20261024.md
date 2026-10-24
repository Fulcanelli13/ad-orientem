# Pitrè 1900 — seventeen P1 original-page checks and complete remaining-page queue

**Date:** 24 October 2026. **Branch:** `research/customs-full-registry-census-20261023`. **Draft PR:** #1572. **Source:** user's compressed copy of Giuseppe Pitrè, *Feste patronali in Sicilia* (Carlo Clausen, 1900; University of Michigan/Internet Archive), SHA-256 `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`. No PDF binary was committed.

## Source-grounded results, not inferred contemporary Calendar dates

The **17 remaining P1 historical date/regional-variant observations** were checked against the original edition's printed folios and directly examined Italian scanned text.

| Original observation IDs | Printed page | Scan PDF page | Verified original-period distinction |
| --- | ---: | ---: | --- |
| PIT1900-IT-023, -024 | 447 | 505 | Canicattini ecclesiastical St Michael patronage versus popular St Joseph, celebrated 19 March and first Sunday of September |
| PIT1900-IT-032, -034, -035 | 449 | 507 | September wheat-gift variation; Santa Croce rival patronal attributions and three-day 17–19 March St Joseph feast |
| PIT1900-IT-050, -052 | 454 | 512 | Spadafora additional 15 July St Joseph observance; Raccuia third Sunday after Easter |
| PIT1900-IT-066 | 227 | 285 | Catania historical veiled `ntuppateddi` women, not presumed current |
| PIT1900-IT-069 | 230 | 288 | Catania older costumed procession figures expressly ceased: `Ora non più` |
| PIT1900-IT-080 | 277 | 335 | Syracuse St Lucy suburban image stay of eight days |
| PIT1900-IT-081 | 278 | 336 | Syracuse separate May `Santa Lucia delle quaglie` |
| PIT1900-IT-089 | 289 | 347 | Melilli visitor's reported historical physical penitential act, **not approved ritual guidance** |
| PIT1900-IT-106 | 359 | 417 | Solarino St Paul festivities begin the eve of 25 January |
| PIT1900-IT-115 | 380 | 438 | Naro St Calogero earthquake-remembrance image procession on 11 January |
| PIT1900-IT-116 | 381 | 439 | Naro local St Calogero 17–19 June celebration |
| PIT1900-IT-120, -122 | 516 | 574 | Caltanissetta May/September Michael feasts (preceded by context on p.515); nine-year Monday-after-Easter bread-and-water devotion |

The complete machine-readable **17-record page-verification dataset** preserves precise ID, original printed page, one-based PDF page, Italian phrase anchor and explicit non-certification of modern recurrence, liturgical authority, independent eyewitness status or distinct-custom identity:

`data/customs/master/pitre-1900-uploaded-facsimile-17-p1-date-region-page-gates.v1.json`.

The unified working catalogue has all 17 records' scan flags, printed page, scanned PDF page and provenance path updated. Previously verified 25 older P0 and 16 newer high-risk records remain preserved, giving **58/422 individually source-page-verified** Pitrè-1900 records across **42 different original PDF pages**.

## Full 364-record source-research search queue — no verification inflation

One new research-only dataset routes **every remaining unverified observation**, without repeating any earlier action identity comparisons:

`data/customs/master/pitre-1900-364-unverified-records-page-lookup-queue.v1.json`.

| Scope | Count |
| --- | ---: |
| Older `PIT1900-IT-` P2 original page checks | **87** |
| Newer `PIT1900-NEW-` original page checks | **277** |
| **Total unverified observations queued** | **364** |

For **241** records, a *search window* is inferred by monotonic interpolation between the **58 already verified historical scan anchors**, conservatively intersected with the record's already documented printed chapter/locality limits when available. For the other **123**, only historical chapter/locality page-range limits can be defended. Neither method is a human-confirmed folio: **all 364 remain explicitly page-unverified**, with `page_image_visually_verified=false` and `exact_printed_page_verified=false`.

**Important:** the PDF contains inserted front matter and historical plates. The relationship between printed pages and PDF page numbers is not safely constant in the earlier chapters; no PDF-page arithmetic is asserted below printed page 161 without subsequent inspection.

## Accounting and scope locks

- Historical-source workbench: **3,407** non-deduplicated source/detail observations, unchanged.
- Original Pitrè 1900 total: **129 older + 293 later = 422** source observations (not unique customs).
- Verified original printed page records: **25 P0 + 17 P1 + 16 new high-risk = 58**.
- Remaining: **87 older P2 + 277 later = 364**, now exhaustively queued for source-page examination.
- Existing **408 provisional groups**, older **56 working master identities**, earlier **71 relation comparisons and 47 separate exception reviews** unchanged.
- No new distinct Catholic customs certified; no independent pre-1900 authorities verified; no Roman Ritual blessings authenticated; no dates approved for modern recurring Calendar suggestions; zero app publications.

## Next substantial source step

Now that the full compressed original is locally readable, tackle **all 87 older P2 in one source-verification pass**. For each, confirm the printed page and readable Italian phrase against the scan, then promote the lookup-only pointer to verified folio with proof and source-stable ID; retain uncertain ones as a small exception list. This will close **129/129 old original-edition page checks** if all passages are legible. Follow with the **277 newer** records in two high-volume batches, initially grouped by specific locality/printed chapter so only the genuine OCR/scan ambiguities remain to be researched.

Regression suite: `tests/customs-pitre-1900-p1-17-and-page-queue-364.mjs`, the prior original-scan 41-item audit, full census, and zero publication gates; executed from existing `.github/workflows/customs-master-integrity.yml`. The user-provided original PDF remains outside Git history; all machine-readable provenance points to edition, public holding and SHA-256 witness.

**No additional cost and no production Calendar, ritual, prayer, Mass engine, or other app changes.**
