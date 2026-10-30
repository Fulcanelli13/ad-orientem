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

## First current-main capture and sampled human visual review — 30 October

[GitHub Actions run 41040534514](https://github.com/Fulcanelli13/ad-orientem/actions/runs/41040534514) **passed all 54/54 route screenshot captures** (zero missing, zero reported document horizontal overflow, 6/6 rendered-candidate Explore map canvases, zero captured page errors). Its artifact includes all 54 full-viewport PNG files, `matrix.json` and the review board `index.html`. The artifact has 30-day Actions retention only.

**Manually examined all 54 frames in side-by-side six-variant contact sheets**, not merely the CI summary. This is a first-screen visual review at emulated viewport size, not a formal user aesthetic acceptance, complete route journey, or physical-phone certification.

| View | Current-frame finding | Provisional classification |
| --- | --- | --- |
| Today | EN 320/390/430 captures show a black artwork canvas and preserved Titian source credit, while corresponding FR views show the actual painting. This could be an image-network/decode race because EN precedes FR in each viewport batch. Do **not** classify as an app artwork rejection or source rights defect without a bounded image-load retest. | NEEDS_RETEST · capture timing vs actual image readiness |
| Today 320 | The large primary Mass CTA meets the bottom navigation at the first viewport edge (in EN and FR), although it may remain reachable after scroll. Do not call it unreachable without a scroller/occlusion interaction probe. At 390/430 the action is visibly clearer. | P1 VISUAL_CANDIDATE · fold/CTA hierarchy |
| Calendar Month | The 42-cell grid and five category controls render in EN/FR across all three widths; the day-cell text is necessarily minute and visually dense at 320. No actual horizontal overflow found. | P1 VISUAL_CANDIDATE · readability; **no automatic calendar redesign** |
| Mass Entry | Current M1 content-readiness, celebration choice and Start Mass are present in both languages. More settings sit below the fold at 320; no missing action or language failure shown in these initial captures. | Captured; further navigation review required |
| Pray/Rosary | Prayer hub uses the integrated **dark** presentation, not the historic cream-sheet alleged by obsolete source observations. Rosary shows selected day, method options and distinct reader route in EN/FR. | Old visual concern largely superseded; no new defect evidenced |
| Formation | Full-width topic cards at narrow widths replace the historic constrained two-column layout. EN/FR copy appears readable in these screen captures. | Prior source concern superseded; deeper formation interactions untested |
| Scripture | Luke 1:28 and passage tabs appear in EN/FR; citations and transcription are visible. Historical missing-context concerns cannot be inferred from a screenshot. | Captured; detailed source-return route still separately gated |
| Explore | Geography, boundaries and clustered pins are visible in all six views. Filters are intentionally horizontal. **Do not** infer that every pin, geocode, photo or affiliation is verified from a map canvas. | RENDERED_CANDIDATE_NEEDS_HUMAN_REVIEW |
| Settings | Current settings page, language labels and navigation render in EN/FR at each width, with no detected outer horizontal overflow. | Captured; keyboard/focus acceptance remains separate |

**Next instrumented run:** Wait for mounted Today image completion (bounded 8s) and report `todayArt` loaded, fallback and unverified separately from the route capture count. This is a test-only amendment; original art credits, source approvals and production UI are untouched. Reclassify the black EN frames only after retest.

**Decision hold:** CI passes and first-screen review allow us to keep/merge the reproducible QA harness. They do **not** authorize changing Home spacing, Calendar typography, map artwork or other product UI without a current source-owner change and the user’s visual decisions.
