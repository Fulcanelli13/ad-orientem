# Nine-route bilingual phone review — current-main evidence

30 October 2026 · QA-only · Human review NOT complete · **No production UI change**.

## Purpose and source provenance

Rehome the unique screenshot/measurement programme of historical [PR #1050](https://github.com/Fulcanelli13/ad-orientem/pull/1050) without transplanting its 11 October MapLibre, Explore, Calendar or style changes over the current product. Its historic ledger, original 54 frames and original decisions remain recoverable in that PR; they are **historic observations**, not current P0/P1 defects. Today's current Home, Calendar, Prayer, Mass access, Formation, Scripture, Explore and Settings may have changed substantially.

The automated matrix attempts these nine current user-interface states: Today, Calendar Month, Mass Entry, Prayer Hub, Rosary, Formation, Scripture citation, Explore and Settings, each at 320×700, 390×844 and 430×932, in EN and FR: **54 target screenshots**. It opens the real app, changes the French language through current Settings, measures viewport horizontal overflow and samples tiny type (<11px) and small controls (<40px). It records page errors and preserves a browsable `index.html` alongside `matrix.json`. Missing routes fail CI; partial evidence is retained even on failures.

## Evidence and limitations

- `tests/ui-nine-route-phone-review.mjs`: current main route capture, with failure/partial evidence. Capturing a route is NOT acceptance of artwork, contrast, translation, liturgical authenticity or UI quality.
- `.github/workflows/ui-nine-route-phone-review.yml`: browser runner and 30-day **temporary** screenshots. Do not depend on expiring GitHub Actions artifacts as the sole permanent original data archive. Durable evidence is the source, run ID, manifest summaries and adjudication comments.
- Explore tiles are independently fetched and map canvas must be explicitly classified. `RENDERED_CANDIDATE_NEEDS_HUMAN_REVIEW` is not a verified map; stalled/empty/loading must remain `MAP_UNVERIFIED`. Pin/source reliability is a separate research programme.
- In-Mass LIVE, Missal, special rite, source cue, bell, Schola and 65-curated-card acceptance belong to existing dedicated suites. The historical 48-card product contract is **not** current.
- Capture quality at emulated phone viewports does not certify a physical phone, screen-reader, operating-system zoom or a complete French translation.
- Zero expenditure and **no production promotion**. User decisions about current UI and Sacred Art remain authoritative.

## Manual review gate

Only after **54/54 actual frames**, inspect side by side per width and language: navigation continuity, Home/Calendar/Mass hierarchy, Pray/Prayer page, Rosary prayer choice, Formation labels, Scripture return and Explore geolocation. Record precise selector/screenshot with severity P0/P1/P2, SOURCE_CONFIRMED vs VISUALLY_CONFIRMED vs NEEDS_DEVICE, and a responsible canonical module. Do not automatically refactor production CSS or merge historic feature changes.

The first run of this rehomed capture must be reviewed for stale automation selectors before concluding that a UI route is broken. This is a verification programme, not an artwork or product-release approval.
