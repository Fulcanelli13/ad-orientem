# Mass Reader — final 17 gesture/icon disposition (29 October 2026)

**Decision:** distinguish **unbound source cues** from **artwork that should be manufactured**. This is a review-only release, with no new pictograms, no approved master-bank changes, and no modification to the user's canonical 1962 Missal rubrics.

| Stage | Source-reconciled records |
|---|---:|
| Canonical gesture matrix | 142 |
| Existing exact v4.6 bindings | 125 |
| Still without independent approved artwork | 17 |
| Normative priest gestures needing exact-art decision | 7 |
| Faithful source/profile instructions that need no additional standalone icon | 10 |
| Existing candidate SVG drawings needing source & optical approval | 2 files for 3 priest cues |
| Priest gestures without an exact drawing even in review | 4 |
| Independent priest-position artwork review | 3 stations (NOT part of 17) |

## The seven priest art decisions

| Source cue | Rubric / gesture | Existing comparison | Treatment |
|---|---|---|---|
| C0117 | Raise eyes and hands, then join | `priest_centre_arms_rich` | Review `priest-eyes-hands-raised.svg`; **not approved** |
| C0155 | Living Memento: joined hands + head bowed | `priest_centre_hands_rich` | No exact art; source rubric only |
| C0161 | Hanc igitur: open hands over Host and chalice | `priest_centre_hands_rich` | Review `priest-hands-over-oblations.svg`; **not approved** |
| C0169 | Institution: eyes raised briefly, then lowered | `priest_centre_arms_rich` | No exact art; do **not** imply hands raised |
| C0193 | Dead Memento: hands and fixed gaze | `priest_centre_hands_rich` | No exact art; source rubric only |
| C0204 | Slight elevation of Host above chalice | `canon` | No exact art; do **not** reuse major Host or chalice elevation |
| C0263 | Final blessing: raise eyes/hands, then join and bow head | `priest_centre_arms_rich` | Review SAME eyes-and-hands proposal for its first phase only; joined-hands and bow already have distinct approved source annotations |

All seven have published bilingual **source rubrics** after PRs #1942 and #1949. A source-cued action needing art may not steal a position icon, a choir icon, or an adjacent priest icon. The original prayer paragraph always remains the owner.

## Ten faithful records — do not create ten pictures

These are current faithful-custom or participation cues, **not normative priest rubrics**:

- Profile-dependent posture: C0021 (Confiteor: kneel versus bow) and C0096 (Incarnatus: local/form/date rule). Continue using existing, separately source-owned posture state, rather than drawing a forced gesture.
- Gesture sequence: C0023 (bowed-to-upright transition); C0173, C0174, C0179 (kneeling/bowing/looking toward the elevated Species). Leave these as source-aligned guidance, not one static still.
- Optional or local: C0056 (Adoramus te); C0235 and C0237 (optional second Confiteor). No universal instruction without the user's selected custom/profile.
- Devotional, not a new posture: C0242 (reverent attention at Ecce Agnus Dei). Do not equate this with a priest Communion or elevation icon.

These ten still have `iconKey: null` in the canonical matrix; the register identifies why that can be intentional. This does **not** revoke independent approved standing/kneeling and other faithful postures already visible elsewhere in the reader.

## What the next reviewer decides

1. Compare the TWO existing **review-only** SVG drawings in `assets/review/mass-icon-candidates/` against authentic ceremonial images and frozen family masters at 32px and 48px; refuse candidates that don't show exact eyes, palms, object or vestments.
2. Approve/reject the drawings specifically for C0117/C0263 and C0161. No transitive approval: one drawing could work for one cue but fail the other.
3. For C0155, C0169, C0193 and C0204, retain text-only as the default. Make artwork only when original-source image evidence exists, and obtain an explicit user decision before committing a production asset.
4. Treat Epistle and Gospel side **station** variants as their own existing 3-entry queue. Do not confuse them with the 17 gesture records.

**Review UI:** `reviews/mass-campion-icon-review-20261010.html` already displays the existing artwork, the review-only candidates and each exact source ID, with a decision export. The source of truth for this disposition is `data/mass/gesture-icon-disposition-20261029.v1.json`. None of its decisions is read by the LIVE renderer or changes its action clock.

## Release protection

`tests/mass-17-gesture-icon-disposition.mjs` and the R17 CI gate validate every original cue, actor, authority, profile, comparator master and absent production binding. The exact original matrix remains **142 / 125 / 17**; the October 20 crosswalk remains **414**; the frozen v4.6 bank remains **67**. A pending icon is not an absent rubric, and a user-selectable faithful custom is not a universal prescribed gesture.
