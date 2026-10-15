# Biblical Atlas — optional historical-place-name disclosure preview
**15 October 2026.** Owner: `src/find/bible-atlas.js`. Coordination: #342. Editorial source: merged #1243.

## Purpose
The existing opt-in cinematic Biblical Atlas can render the **11 curated bilingual historical-name notes** inside its **existing event detail sheet**, behind a second explicit review flag. The current ordinary Atlas and the cinematic-only mode show **no historical-name disclosure**.

**Review entry (only after deployment):** `?atlasCinema=1&atlasHistory=1` → Explore → Biblical Atlas → select an eligible event → expand the existing event sheet → open **Historical name / Nom historique**.

- The existing 151 canonical events, eventKey identity, Scripture handoff, follow/pan behavior, 35 pin keys, source accuracy, physical map, and 22 permanent EN/FR map labels remain as before.
- The historical panel is a `<details>` disclosure (closed by default), adjacent to—not replacing—the existing independent geographical qualification and canonical **Read Scripture** action.
- **11** source-linked notes are projected from `data/explore/biblical-atlas-contextual-name-proposals.research.v1.json`, keyed to **existing source geo key and narrative era**. Every note includes one source Pleiades name URI and scholarly/ancient-source links. This is a small display projection, **not a new gazetteer**.
- Other 11 reviewed settlement aliases were intentionally suppressed by the editorial owner; they never get a new note. A note appears only when its broad narrative era fits the existing event. No year/date is inferred from an ordinal era.
- The separate `atlasHistory` URL flag has **no effect** without `atlasCinema=1`. No changes to the unflagged public experience or existing cinematic-only review.

## Test/acceptance
`node tests/atlas-historical-name-disclosure.mjs` asserts exact parity of the 11 rendered annotations with the frozen editorial notes (EN/FR, named URI, sources), suppression of 11 redundant extras, no appearance without the explicit opt-in, unchanged 151 event identities and original geo owner. `node tests/atlas-historical-name-disclosure-phone.mjs` exercises actual mobile Playwright Chromium at **320, 390 and 768 px**, opening the compact event sheet and historical disclosure, validating overflow and safe links, switching to a suppressed location, then entering and returning from the original native Scripture reader. Dedicated workflow `atlas-historical-disclosure-review.yml` combines source tests and screenshot artifacts.

**Remaining manual QA:** inspect all 3 screenshots for legibility, tactile sizing, scroll behavior and styling; real physical Android Chrome thumb/drag/Follow remains separately held. Release requires explicit editorial sign-off of bilingual historic explanations and references. This rollout is deliberately review-only; neither map labels nor story narratives are automatically historically renamed.


## 15 October addendum — four original-form/source clarifications

This source-quality reconciliation corrects the merged #1243 editorial ledger and its existing #1247 render-only projection **in place**. No alternative geography database or new UI surface is introduced. All four cases stay `HOLD_REVIEW_ONLY`.

| Existing key | Correct witness / precision | Evidence |
|---|---|---|
| `joppa` | Greek Acts 9:36 has `Ἰόππῃ` (lemma `Ἰόππη`), while the **Latin Vulgate** at Acts 9:36 has `Ioppe`. The former description “Greek-form Ioppe” was inaccurate; this is a **language** comparison, not a new historic city. | [JERIHNA Sources Chrétiennes, Vulgate Acts 9:36](https://jerihna.sourceschretiennes.org/en/bible-names/forms/17205); [Greek lemma](https://jerihna.sourceschretiennes.org/en/bible-names/lemmas/2579) |
| `nineveh` | Pleiades indexes `Ninuwā`; ORACC ancient cuneiform catalogues normalize related written forms as `Ninua`, including period-labelled and Assyrian texts. The two editorial transliterations are not interchangeable exact spellings and **cannot date Jonah**. | [ORACC Assyrian toponym, 356 instances](https://oracc.museum.upenn.edu/atae/cbd/qpn/x000001080.html); [ORACC Old Babylonian Ninua](https://oracc2.museum.upenn.edu/epsd2/cbd/sux/o0047097.html) |
| `babylon` | ORACC contains the exact scholarly name form `Bābili` for Babylon with cuneiform references, alongside its extensive `Babili` word family. This establishes a real historical toponym, **not a specific Biblical event site or dated Exile year**. | [ORACC Bābili form](https://oracc.museum.upenn.edu/cmawro/cmawr3/cbd/qpn/x000000100.html); [ORACC Babylon inscription name family, 600 instances](https://oracc.museum.upenn.edu/ribo/babylon7/cbd/qpn/x000000070.html) |
| `philippi` | Scholarly excavation sources date the `Krenides` name before Philip II renamed the town `Philippi` in **356 BC**; UNESCO separately confirms Roman-colony history and the Pauline context. `Krenides` must not become the title of an Acts 16 map marker. | [Princeton Encyclopedia of Classical Sites](https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.04.0006%3Aentry%3Dphilippi); [UNESCO Archaeological Site of Philippi](https://whc.unesco.org/en/list/1517) |

**Pinning rule:** these external sources and the original Pleiades `name URI` are display links, not imported prose, imagery or libraries. Their presence in the review-only disclosure does not constitute an independent archaeological certification of a **specific** location for a miracle, the Pauline visit, the book of Jonah or an event date. The actual canonical Scripture remains the narrative owner.

**Deployment/physical limitations:** No exact GitHub Pages deployment SHA of #1247 was independently accessible through the available web retrieval in this batch. Do not infer Pages publication from the Vercel build status. The existing 320/390/768 Chromium checks are evidence of mobile-view browser behaviour, **not a genuine Android Chrome/touch-screen validation**. Keep the double opt-in flags and all initial holds.
