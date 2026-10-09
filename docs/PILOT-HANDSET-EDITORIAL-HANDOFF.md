# Pilot handoff — Rosary editorial and real handset acceptance

**Status: REVIEW PACKET READY; HUMAN VERDICT PENDING.**
This is a controlled QA handoff, **not** an Android APK, public release approval, independent theological approval or permission to relax [#271](https://github.com/Fulcanelli13/ad-orientem/issues/271).

## Download the review packet

In GitHub Actions, open **Pilot review packet**, choose **Run workflow** if no current run exists, and download the **ao-pilot-review-handoff** artifact from its completed run. It contains:

- \`rosary-review-offline.html\`: standalone offline review table for **all 200** Guided Rosary meditations, EN and FR side by side, original witness links, source-role classification and per-bead verdicts
- \`rosary-review-200.csv\`: 200-row export, initially **UNREVIEWED**
- \`rosary-review-source.json\`: canonical production data and SHA-256 fingerprints locking each reviewed translation and citation to the examined edition

Open the HTML locally in a browser, enter reviewer identity, inspect source links and both languages and record each verdict (**Approve / Revise / Hold**). Your entries are cached in that browser where possible. Export the decision JSON frequently, particularly before switching devices. This file never sends comments to a server. A pass is **not** conferred by generating the packet; publication requires a competent human reviewing and explicitly accepting the results.

A later change to any meditation, source role or URL changes its row fingerprint. Decisions on old fingerprints cannot automatically approve new wording. Independent theology/language approvers should distinguish narrative paraphrase, scriptural Passion application, Marian typology, the Assumption's 1950 dogmatic definition, and ordinary papal doctrine on Queenship. Keep unreviewed historical donor quotations withheld.

Local CLI alternative: \`node tools/build-pilot-review-packet.mjs artifacts/pilot-review-handoff\` and \`node tests/pilot-review-packet.mjs\`.

## Physical-device acceptance

These checks **cannot** be marked passed by Playwright emulation. Record device model, Android version, actual access method (mobile browser or installed pilot package), connection conditions, locale, app commit SHA, date, tester, and screenshot/video evidence for any failure. Do not record personal prayer/confession content or sensitive device identifiers.

| ID | Journey on real phone | Pass criteria |
| --- | --- | --- |
| F01 | Cold launch and return from background | No blank screen, crash, stuck cinematic or forced reload; Home appears at readable scale |
| F02 | Home -> Calendar -> choose today's traditional celebration | Real date and Proper selected; no emergency date-specific route or wrong celebration |
| F03 | Mass preflight -> R17 native **Missal**, **Simple**, **LIVE** | Distinct intended modes; 48-card LIVE design not replaced by obsolete 30-card concept |
| F04 | Low Mass and Missa Cantata, using the actual rite available | Posture, priest location, audible/silent indicators and responses agree with observed action |
| F05 | Scroll Missal and LIVE by touch with different speeds | Finger scrolling smooth; start/end paragraphs remain reachable, cue handoffs not early or invisible |
| F06 | Switch translation in Mass and general prayers | Mass mode respects its current pairing; general prayers initially selected vernacular with Latin **replacing** on tap |
| F07 | Gospel signs, Incarnatus bow, elevation, bells and kneeling | Key gestures visible at the triggering words, bells paced, no intrusive duplicate text |
| F08 | Schola box and chant handoff during a sung Mass | No endless ticker loop or unwanted duplicate Gloria/Credo; box can be controlled without obscuring prayer |
| F09 | Open Settings over active native Mass and return | Same Mass state restored, no silent Mass restart; structural changes blocked while active |
| F10 | Background, reopen and explicitly resume Mass | Correct saved section and mode; no automatic unintended restart |
| F11 | PRAY -> Rosary Simple and Guided -> 10 beads | Mystery progression and ten Ave Maria; Guided original EN/FR meditation and source link; no bogus quotation |
| F12 | Angelus/Regina Cæli, Stations, Confession guide, Adoration and Benediction | Correct module-specific controls, readable rails, no overlapping/transient ghost states |
| F13 | Prayer Library, 48 titles, English/French, Latin switch | Touch opens and closes without trapped focus, scroll freeze, empty bodies or untranslated text disguised as French |
| F14 | Novenas, all 16 records; Nine Tuesdays and Christ the King | Nine **weekly** Tuesdays distinct from daily novena; traditional feast timing and suggested dates not conflated |
| F15 | Learn -> back -> Home -> PRAY -> Settings | Coherent Back/Home semantics, single presentation owner, no obsolete card or interrupted navigation |
| F16 | Low light, reduced motion, 320–430px equivalent widths | Readable text/contrast, comfortable hit targets, no flickering focus transitions or content clipped by ribbons |
| F17 | Offline / intermittent network after initial install/load | Clearly document working versus unavailable features; no falsely claimed offline guarantee |
| F18 | 15–20 minutes continuous use and repeated app switching | No excessive temperature, progressively increasing lag, stuck screen or visible memory-related reload |

**Recording rule:** Each scenario requires actual phone evidence and one of \`PASS\`, \`FAIL\`, \`NOT_TESTED\` or \`NOT_APPLICABLE\` (with an explanation). Any reproduced P0 crash, incorrect rite or deceptive text prevents pilot acceptance. An irrelevant test may be N/A with reason; it cannot be silently counted as passed. For substantive bugs record the exact route, date, Mass form and reproduction steps and link a GitHub issue.

**Scope boundary:** The automated app/Marian/visual suites cover browser behavior, including virtual mobile viewports. They do **not** certify this physical-device matrix, an Android binary or a real liturgical observation. The separate public application release gate remains **OPEN** until exact historical donor evidence is restored or an authorized release decision explicitly changes that rule.

## Decision record required before accepting a pilot

- Reviewer returns the fingerprinted 200-row EN/FR review decisions; every changed/held item receives editorial adjudication.
- A physical-device tester records F01–F18 against an exact production SHA, including failures and N/A rationale.
- Release owner decides explicitly whether this is **private testing only** or an authorized release. Do not infer a public green light from green GitHub Actions.
- [#271](https://github.com/Fulcanelli13/ad-orientem/issues/271) remains open pending recovery or authorized change to exact-primary donor requirements; do not mark \`FINAL_APP_READY\` from this packet.

