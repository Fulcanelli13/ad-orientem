# Ad Orientem — Ultra Master Music Addendum and LIVE Card/Schola Scene Contract

**Date:** 19 October 2026  
**Editorial base:** `Ad_Orientem_Ultra_Master_Mass_Source_of_Truth_RECONCILED_2026-10-16.xlsx` (36 retained tabs).  
**Music-corrected workbook:** `Ad_Orientem_Ultra_Master_Mass_Music_Reconciled_2026-10-19.xlsx` (41 tabs).  
**Status:** RESEARCH / DESIGN; **no** reader-state, text, timer or card-structure change approved by this addendum.  
**Parallel owner:** P0 Ultra Master knowledge bridge PR #1270 (draft). Do not duplicate that bridge or promote unapproved research to production.

## New reconciled Ultra Master sheets

- `37 MUSIC LITURGICAL TIMELINE`: 43 source-anchored liturgical sound / music event candidates, including conditional rites, optional additions, instrumental windows and silence. These are **not** 43 tracks all heard at every Mass.
- `38 MUSIC AUTHORITIES RULES`: 20 norm/interpretation records including 1958 instruction §§14–16,21,25–27,56–66,80–85.
- `39 SCHOLA RUNTIME CROSSWALK`: 10 currently implemented track types and 13 missing, overlapping or incorrectly anchored music/response/silence identities.
- `40 MUSIC AWARE CARD DESIGN`: 16 *presentation* scenes; do not create canonical priest actions or force a new card for every chant segment.
- `41 MUSIC INTEGRATION HOLDS`: 15 explicit release holds, tests and source caveats.

The original 435 micro-Latin units, 279 source cues, rubrics, Guides, Scripture records and current reader mapping are **preserved**. `00 START HERE`, source inventory, integration holds and dashboard were augmented, not replaced. Newly introduced `MUS.*`, `SC*`, `R*` and `MU-H*` are **research crosswalk IDs**, not production event IDs.

## Corrected, authority-bound music rules

1. Priest/ministers' Gregorian liturgical chant and associated ritual responses may **not** be given instrumental accompaniment (1958 §16b). Do not create automatic organ pitch/underscore during priest chant.
2. Proper Introit may be lengthened for a long entrance using appointed psalm verses (1958 §27a). Choir start belongs to the real entrance, not simply the appearance of canonical block B014.
3. The Offertory antiphon may be followed by appointed verses or fitting Latin material, and must end by the Secret boundary (1958 §27b). Do not use `Orémus` as *proof* the choir has begun, only as an expected entry signal.
4. Communion chant starts when the priest receives, or during Communion of the faithful when applicable (1958 §27c). Existing runtime B085 anchors the printed proper near ablutions: this is a **presentation location, not a safe musical start clock**.
5. Gregorian Sanctus/Benedictus is sung without interruption; otherwise Benedictus occurs after Consecration; no singing or instruments *during* Consecration (1958 §27d–e). The release of the later polyphonic Benedictus is observational, not automatic.
6. Silence between Consecration and Pater is recommended (1958 §27f); do not misread this as an absolute rule eliminating the allowed delayed Benedictus.
7. No organ during the final blessing (1958 §27g), and apply Advent, Lent, Requiem, Triduum and seasonal exceptions precisely (1958 §§80–85).
8. Optional Latin motet, chosen Kyriale/Credo and organ music are programme items, **not** prescribed for every parish; 1958 §14 restricts routine vernacular singing in sung liturgy.

**Primary authority:** https://adoremus.org/1958/09/instruction-on-sacred-music/  
**Runtime:** https://github.com/Fulcanelli13/ad-orientem/blob/main/src/mass/reader-schola.js  
**UI ticker:** https://github.com/Fulcanelli13/ad-orientem/blob/main/src/mass/reader-dom.js  
**Native cue projection:** https://github.com/Fulcanelli13/ad-orientem/blob/main/src/mass/reader-native-preview.js

## Why the current Schola appears erratic

The current controller has 10 broad music tracks, and a completed *scrolling text animation* can cause `onScholaAdvance`. At the same time, the main reader's scroll focus can call `scholaState.syncCue`, bringing the choir state back to an independently selected cue. Neither observation proves the choir is singing that line. Existing duplicate-cue guards and manual controls help, but cannot fix a conflated clock. The Communion and Introit anchors also need liturgical timing, not only a matching display card.

## Recommended card scene architecture

**Do not change the existing LIVE card count or canonical cue IDs to match music.** Create a read-only `musicScene` presentation linking one or more current cards, source blocks and real musical start/stop boundaries. One card-state progression belongs to the priest and faithful; one orthogonal *observed/expected* lane belongs to the Schola/organist. Three display behaviours:

- `SHARED_CHANT`: Kyrie, Gloria, Credo, Sanctus and Agnus Dei. Display sung text prominently once in the central prayer; Schola dock stays minimized as a nonduplicative status/setting display when the central text is the same.
- `PARALLEL_MUSIC`: Introit, Offertory, Canon overlap and Communion. The center prayer can change card as the priest moves, but the pinned, resizable Schola surface retains the named Proper, track and independent progress. Organ solo is a separate observed/possible window, not a fabricated phrase.
- `LITURGICAL_DIALOGUE_OR_SILENCE`: Collect, Epistle/Gospel, Preface, Pater, dismissal, Consecration and final blessing. Show source-owned ℣/℟ in Latin and vernacular where applicable, while suppressing or locking any unrelated music state during hard silence. No invented Schola chant track for priest's Gospel or Pater.

### Music-driven major scene transitions without artificial card churn

| Musical boundary | Reader should do | Schola / organ lane should do |
| --- | --- | --- |
| Sprinkling → entrance | Preserve selected preceding rite and move to Introit at actual handoff | End Asperges, indicate Introit *expected*, not automatically sounding |
| Introit → Kyrie | Ordinary card transition | Close Introit at actual conclusion; activate chosen Kyrie |
| Priest intones Gloria/Credo | Existing Gloria/Credo card | Mark distinction between priest incipit and choir continuation; no jump backward |
| Epistle → Gradual/Tract/Sequence | Source-verified pre-Gospel cards, conditional Sequence | Show actual named selection (no speculative Sequence) |
| Offertory Orémus → several priest prayers | Retain existing multi-card Offertory sequence | Persist Offertory proper / optional musical window through those cards; stop by Secret |
| Preface → Sanctus → Canon | Existing Preface/Sanctus and separate Canon prayer cards | Choir may overlap private Canon, independently of scroll |
| Consecration | Consecration of Host and Chalice unchanged | Absolutely no choir/organ music at Consecration; polyphonic Benedictus release after Chalice if observed |
| Agnus → Communion / distributions | Existing Agnus, Communion and Ablutions cards | Proper Communion begins on actual sacramental/distribution event; may outlast several cards |
| Postcommunion → dismissal → blessing | Existing prayer cards and source conditions | No autonomous Schola chant; exact response; organ silent during blessing |

### Display contract

- Two existing ribbons/rails continue to own Mass mode, user posture and priest action; **no third duplicated cue ribbon**.
- Existing Schola dock remains **permanently available, resizable and hideable**. In `SHARED_CHANT`, do not duplicate the same text in the dock and center.
- Music labels distinguish `EXPECTED` (source permits/anticipates), `OBSERVED_SINGING`, `COMPLETE` and `UNKNOWN`. No assertion of currently singing from user scrolling, elapsed animation or source proper alone.
- Optional organ label can be `POSSIBLE`, `OBSERVED` or `OFF/RESTRICTED`; never assume an organist is present.
- Singing state does **not** change priest posture, position or the Mass card automatically. During allowed overlaps, a card arrow advances only the priest/reader timeline.
- Existing source cues, 65-ish curated LIVE map, 48-step recovered-product projection, Missal pairing and special rites remain unchanged.

## Release criteria

No LIVE runtime change until P0 verifies 1) existing 279 cues still map to current source/text and actor; 2) true chant start/stop is represented for at least Introit/Offertory/Communion; 3) source-granted alternative musical conditions for Benedictus and Proper sequences; 4) organ silence and seasonal restrictions; 5) independence from scroll/ticker; 6) all five existing reader modes/forms/selected rite flows; 7) mobile usability and no duplication. Special-rite music is a separate continuation under issue #1445.