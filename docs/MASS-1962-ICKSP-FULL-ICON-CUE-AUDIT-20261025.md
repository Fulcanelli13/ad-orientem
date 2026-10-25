# Mass 1962 — Full 279-cue icon placement screening (25 October 2026)

**Status:** source-registry screening, **not** a claim that all 279 liturgical actions have been independently certified against the 1962 rubrics, and not visual/pixel approval for every cue.

Source-of-truth snapshot: `data/mass/icksp-1962-full-icon-cue-screening-20261025.v1.json` (279 rows, stable canonical IDs). It was generated from **merged** main after PR #1677, not from a historical 48-card prototype.

## Coverage actually established

| Registry/source | Count |
|---|---:|
| Canonical exact source cues | 279 (C0001–C0279) |
| Synthetic pause/guide marker, not a liturgical cue | 1 (`AO.SM.B096.SYN`) |
| Gesture-matrix source rows | 142: priest 83, faithful 59 |
| Published 1962 source-linked rubric rows | 57 |
| Priest action records | 77 |
| Faithful cue records | 59 |
| Source rows without an exact icon binding | 17 |
| Explicitly guarded choir-owned source cues | 38 |
| Canonical cue IDs missing/duplicated | 0 |

All published rubric and priest-action references resolve to canonical cues. The screening lists **58 distinct cues** with one or more review flags; flag categories overlap and should not be added together or called 58 liturgical mistakes.

## Adjudication queue (separate from the already-correct 38 choir clock guards)

**P1 — Body inclination icon semantics.** `C0116` (*In spiritu humilitatis*) and `C0128` (*Suscipe, sancta Trinitas*) have normative priest **BODY_BOW** rows with the donor icon key `head_bow`. The priest-action resolver has a `priest.action.bow_moderate` semantic category but no approved exact artwork for it. Do **not** substitute the approved *profound* bow: it denotes a different depth. Treat the text rubric as authoritative until an existing appropriate asset is approved. `C0145` is a third historical BODY_BOW/head-bow row, but it is a public Sanctus choir cue: current #1677 fail-closed priest-clock logic correctly prevents a choir tick from asserting a priest bow.

**P2 — Faithful legacy source triggers.** 15 cues contain a faithful donor trigger not found as an exact phrase in the cue's own Latin source span. They include the known Gloria/Credo repeats (`C0055`, `C0057`, `C0059`, `C0060`, `C0062`, `C0063`, `C0066`, `C0069`, `C0092`, `C0094`, `C0100`, `C0102`) and `C0084`, `C0197`, `C0198`. **This is a lexical screening signal, not proof of a rubrical misplacement:** split words, repeated signs, variant priest/faithful clocks, and nonliteral rubrics require source-by-source adjudication. The current Gloria/Credo LIVE resolver already blocks legacy donor spillovers.

**P2 — Held-back exact artwork.** 17 gesture-matrix rows have no certified `iconKey`: **7 priest / 10 faithful**. Their textual or posture indications may remain valid; missing art is not, by itself, a bug. Determine whether an approved existing meaning can express the gesture faithfully before considering illustration.

**Protected, not unresolved:** 38 choir-public cues across Gloria/Credo (30), Sanctus/Benedictus (5), and Agnus Dei (3) are guarded. They **must not** spawn priest motion or private speech from schola phrase advancement. `C0054` and `C0090` are separate priest intonation endings.

## Source discipline

- Primary ceremonial anchors: [ICKSP France, Ordo Missae 1962](https://icrspfrance.fr/textes-liturgiques.php?article=a0003_ancien) and the [1962 Missale Romanum / Ritus servandus](https://www.musicasacra.com/pdf/missale62.pdf).
- The **current runtime** reads the active canonical icon resolver and independent priest/faithful/schola projectors. `reader-final65-icon-keys.js` is saved as *legacy frozen crosswalk context*, **not** the authority for what appears in LIVE.
- Exact word and actor clocks must be preserved. The source's `SCHOLA_PUBLIC` position is not proof that the priest is performing the same action at that second.
- Faithful gestures remain profile- and local-custom-aware; they cannot be promoted to obligatory priest rubrics.
- Do not mutate the frozen 142-row matrix, 57 published rubrics, 279 IDs, curated LIVE cards, locked SVGs, or user gesture preferences as a side effect of this research audit.
- Separate release evidence: [unified merged PR #1677](https://github.com/Fulcanelli13/ad-orientem/pull/1677), [visual acceptance workflow](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40211558988).

## Next closure gates

1. Manually adjudicate the P1 body-bow rows and remaining non-protected cue/actor mismatch candidates against the literal 1962 rubric; record **NO_ICON_REQUIRED**, **TEXT_ONLY**, **EXISTING_APPROVED_ART**, or **NEW_ART_REQUIRES_APPROVAL** for each.
2. Run exact rendered phone checks at the trigger paragraph on Low, sung, Solemn, Requiem and relevant Holy Week branches. Source-registry matching alone is not pixel-level acceptance.
3. Verify local-custom profiles for faithful gestures against real local rubrics without altering the universal priest register.
4. Re-run the 279-cue snapshot validator after each approved code/registry change.

The complete data matrix is audit evidence, not an automatic instruction to publish new cues or icons.
