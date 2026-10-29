# Roman Divine Office — annual release-readiness register

29 October 2026. One finite register, separate from draft research PR #1860.

## Exactly what the register counts

The 2026 civil year contains **365 days x 8 canonical hours x 3 languages = 8,760 planned source slots**. A leap year (2028) contains **8,784**. Each slot is keyed by date, Hour and language.

This is an **annual inventory**, NOT 8,760 generated Offices and NOT a completed full-year liturgical discrepancy audit. The initial report records 8,760 NOT_GENERATED, zero structurally verified, zero certified, zero approved and zero published. All results come from the actual unmerged state of PR #1860; the research compressor is not yet a public Office source.

Command (Node, no external dependencies):

    node scripts/office/build-annual-readiness-register.mjs --year 2026 --out /tmp/office-annual

Scratch outputs: 2026-office-annual-readiness.json (one record per slot); 2026-office-annual-exceptions.json (summary, candidate exceptions and known blockers). No user-facing app content, no score assets and no production routes.

## Evidence import

Optional --probe-manifest points to an actual pinned original Divinum Officium engine manifest produced by draft PR #1860. It must have the exact upstream SHA, research-only status, source SHA for every document, unchanged unverified content flags, and zero publication. A successful XHTML envelope moves a row to RAW_CAPTURED_UNVERIFIED, **not** into verified or approved status. A failed envelope does not count. Duplicates, unpinned provenance, fabricated approval or source from the wrong Hour are rejected.

The Office composer and normalizer are still draft; until an actual manifest is provided the new independent workflow correctly reports zero captured slots.

## Scoped exception queue (NOT an independent ordo)

Calendar seasons and the existing major-day overview provide **context**, not Office precedence or final commemorations. Candidate risks are Sunday First/Second Vespers, Prime's anticipated Martyrology, Holy Week/Tenebrae, major dates and All Souls special Office. None proves a real liturgical defect.

Known evidence-backed 2026 source blockers from PR #1860:
- 2 November, English Prime: source-translation mismatch in the beneficiary scope of the All Souls prayer.
- 2 November Prime: 3 November anticipated Martyrology text/edition and 2026 Luna not independently certified.
- 1 November, French Second Vespers: pinned composer omits Sunday commemoration; a reversible research-only fix was demonstrated, but the canonical pinned baseline still excludes the French preview.

The exception report says allYearDiscrepanciesActuallyChecked=false. It is not evidence that every unflagged date is correct.

## Finite four-gate completion definition

1. Annual slot inventory: 2026/2028 8-hour trilingual dates complete and uniquely keyed (this PR).
2. Actual source generation: bounded zero-cost batches; import SHA-identified raw evidence and later validated safe JSON evidence without promoting XHTML to published text.
3. Liturgical correctness: independent 1960–61 Office precedence, proper-text, translation, exceptional-hour and local-calendar reviews; source ID, witness, page and rights retained. The remaining historical exceptions get explicit approval or quarantine.
4. Release: only independently verified Office Hours connect to existing Calendar/Pray routes, with clear unavailable-locale behavior. Sung Vespers has a separate native-notation and rights gate and does not block text release.

No further general research phases, no second Calendar, no paid services, no recurring source scrape, and no archived bulk copyrighted source. This PR does not touch the production Office, Mass or Tenebrae readers. Do not merge draft PR #1860 merely to inflate the annual capture counts.
