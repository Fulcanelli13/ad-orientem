# B07 — historical opening/thanksgiving/offering alternatives, 28 October 2026

## Decision / scope
Only the existing source-attested corpus is used. No new translations, invented texts, stage-count changes, or composite assembled from unrelated prayer pieces.

**Critical distinction:** The St Pius X morning `daily-prayer` is one complete prayer covering *adoration, thanksgiving, and offering*. The St Pius X evening `daily-prayer` likewise includes more than pure thanksgiving. The preconciliar prayer-book bank contains other complete prayers emphasizing only one of these acts. These are **narrower-focus replacements**, not equivalent verbatim editions. Present their exact source/title, show a visible scope note after selection, and restore the full St Pius X original with one tap.

The reviewed whitelist `src/pray/daily-stage-alternative-review.js` intentionally names source IDs rather than matching generic keywords. Every ID points to the existing `DAILY_PERSONAL_PRAYER_SOURCE_V1.additional` bank and retains its original `kind: additional` identity and source links.

## Coverage — 12 newly eligible source-backed choices

| Time / stage | Focus | Candidates | Language |
| --- | --- | --- | --- |
| Morning / opening | Adoration + thanksgiving | Lasance 1911; Moran 1883 | EN |
| Morning / opening | Offering only | Blessed Be God 1925; Lasance 1911 two distinct Morning Offerings; Pocket Prayer Book 1899; Moran 1883 | EN |
| Morning / opening | Thanksgiving + offering | Exercices de la vie chrétienne (1905) | FR |
| Evening / opening | Adoration + thanksgiving / light for examination | Lasance 1911 | EN |
| Evening / opening | Adoration or thanksgiving alone | Exercices de la vie chrétienne (1905), one prayer each | FR |
| Evening / contrition | Whole act of contrition | Exercices de la vie chrétienne (1905) | FR |

### Deliberately *not* promoted
- De profundis, Jesus–Joseph–Mary, and Roman/Baltimore Compline excerpts: separate devotions, not equivalent opening prayers.
- Evening light before examination: preparation for the examen, not a substitute for conducting one.
- Night protection prayers: do not equate them to the broad St Pius X Evening opening or to a distinct printed stage absent from the edition.
- Morning petitions, resolutions, and intercessions: no like-for-like St Pius X stages in the fixed original daily order; remain separately selectable optional prayers.
- Unreviewed namesakes: never infer equivalence from a title or general purpose.

## Implementation contract
- One-tap source-labelled alternative appears in the **current** prayer's existing source picker, next to the standard St Pius X form. The historical prayer is shown complete, with correct language, source URL and printed book attribution.
- The **entire stage text** changes. This is explicitly disclosed for narrower-focus replacements rather than pretending to replace just one sentence of the original St Pius X composite.
- Keep edition/daypart and language constraints, active card index, full-screen progressive sky and stopwatch/timer unchanged; no automatic navigation.
- Previous saved optional-extras remain persisted and valid. If an optional prayer is also selected as the current stage replacement, **display it only once**; it reappears in extras when the St Pius X form is restored.
- Persist **IDs only**, independent Morning and Evening, with schema v1 intact. Unavailable language choices fail closed, not translated by software.
- Full and Personal Brief show the same alternatives when that printed stage is present. No new "Short edition".
- Test source identity and provenance, all 12 options, source-language gating, printed stage counts and revert, deduplication with saved extras, mobile one-tap and atmospheric/clock DOM preservation.

## Provenance limitations
This pass compares the **existing** source registry's complete historical texts and page-level URLs, which carry their prior `sourceWebChecked` / `sourceImageChecked` audit flags. It does not claim an independent new scan-by-scan re-transcription of those printed books. Preserve the original source URLs and review flags unchanged.

No changes to Sacred Art, ICKSP/Divine Office PRs, the Mass Reader or other pipelines. Strict €0.
