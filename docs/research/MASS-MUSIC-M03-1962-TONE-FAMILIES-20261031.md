# M03 — Common tones of Mass: 1962 rule engine and score-source research

31 October 2026 · stacked on M02 (PR #2153) and M01 (PR #2152) · **draft, not released**

## Primary authority
The 1962 `Missale Romanum` General Rubrics §513 defines what the celebrant sings at Solemn Mass, §514 applies the relevant obligations to `Missa cantata`, and §§515–516 classify the **prayers, Preface and Pater noster** into solemn and ferial tone families. This is **not** a blanket rule for all Kyriale, Gospel, Introit, dismissal, Sequence or other Proper melodies.

§515 (solemn): Sundays (including penitential Sundays), festive Masses, Saturday Office of Our Lady, first-class vigils, Holy Thursday Mass, the Mass of the Easter Vigil, prescribed octaves, and votive Masses of classes I–III.

§516 (ferial): ferias, second-/third-class vigils, votive Masses of class IV and Masses for the Dead.

Original 1962 rubrics: https://maternalheart.org/library/1962rubrics.pdf ; supplemental contemporaneous ceremonial and chant reference: J. B. O'Connell, `The Celebration of Mass` (1962), Music of Solemn/High Mass.

## Actual implementation
- `src/mass/reader-mass-1962-tone-family.js`: the pure `resolve1962CommonMassTone` selector. Requires a **source-certified actual Mass** of schema `ao-1962-sourced-tone-context-v1` with `sourceOwner: 1962_PROPER_RESOLVER`, except Requiem which uses the existing exact Mass predicate. It returns `SOLEMN`, `FERIAL`, `UNRESOLVED`, or a conflict.
- `resolve1962DialogueToneFamily` applies the shared rubric only to `COLLECT`, `PREFACE_DIALOGUE`, `PATERNOSTER` and `POSTCOMMUNION`. The Preface celebrant and all **three** responses carry the same verified family.
- The M02 source-pair projection adds `toneSelection.toneFamily` only when the cited rubrical classification is certain; even then `celebrant`, `response` and their melodic match remain **not yet approved**.
- The existing Schola Music menu gives a concise EN/FR `1962 tone family: solemn/ferial — Score not approved` instead of presenting a guessed melody. The actual Latin/Mass paragraphs are untouched.
- `tests/reader-mass-1962-tone-family.mjs` tests fourteen classified scenarios, seasonal exceptions, Requiem, exact votive/vigil classes, conflicting provenance, no colour/date guessing, and no incorrect transfer of the common tone rule to Gospel/Gloria/Credo/dismissal.

## Edition-indexed **research candidates**, no published score
`data/research/mass-music-m03-score-leads-20261031.v1.json` contains ten source citations anchored to the 1961 Solesmes `Liber Usualis` (pages 11, 12, 19, 98, 106, 107, 109, 110), with an index/reference page at https://gregobase.selapa.net/source.php?id=3 . Each entry is explicitly `PENDING_USER_REVIEW`, `NOT_IMPORTED`, and `PENDING` for facsimile comparison, full response match and licence assessment.

Especially:
- Solemn Preface/three responses: p. 109, https://gregobase.selapa.net/chant.php?id=4449 .
- Ferial Preface/three responses: p. 109, https://gregobase.selapa.net/chant.php?id=4450 .
- Optional *solemnior* Preface: p. 110, https://gregobase.selapa.net/chant.php?id=4451 ; must not replace ordinary solemn tone automatically.
- Common oration festive tone: p. 98, https://gregobase.selapa.net/chant.php?id=4487 .
- Gospel ordinary and optional alternate, pp. 106–107: https://gregobase.selapa.net/chant.php?id=4490 and https://gregobase.selapa.net/chant.php?id=4491 . These GABC transcriptions explicitly declare their sample Gospel incomplete.
- Asperges and Vidi aquam: pp. 11–12, https://gregobase.selapa.net/chant.php?id=497 and https://gregobase.selapa.net/chant.php?id=958 . **Critical source warning:** the shared online transcriptions also reference the later 1974 omission of `Gloria Patri`; the pre-1962/1961 source must govern our original seasonal rite and refrain.
- Pater noster common response, p. 110, https://gregobase.selapa.net/chant.php?id=7282 .
- Ite Ia, p. 19, https://gregobase.selapa.net/chant.php?id=2988 ; online transcription explicitly separates the `Deo gratias` response into its own GABC. We must pair both before a musical release.

## Next dependency — wiring full actual-Mass context
The current `session-engine.js` stores `calendarCelebration`, `actualCelebration`, `proper` and `provenance` but **does not yet carry a mandatory certified 1962 tone classification** for most dates. Thus **M03 only produces automatically resolved ferial tone for an explicit Requiem**, or solemn/ferial for a resolver-approved and supplied `provenance.musicToneContext`. Other sessions intentionally return `UNRESOLVED`; no unsupported seasonal 'completion' is claimed.

**M04 must integrate the actual 1962 Calendar/Proper decision** into this source-context contract, selecting the *actual* chosen Mass rather than calendar display day. Only after that can the app choose the right family every Sunday/feria/feast. Subsequent score work must verify full syllable-by-note and celebrant/response parity for each recorded melody, and secure editorial/licensing approval.

No changes to priest/Schola clocks, rite stages, gestures, media engine, source texts, H7 Home or selected Claude R17 Mass visuals.

## Merge gate
Stacked draft requires M01 → M02 → M03 reconciliation with latest `main`, successful latest-head CI (especially `test:reader-schola`, R17, form/phone/EN-FR), independent visual acceptance, and editorial approval for any actual score or recording before its publication.
