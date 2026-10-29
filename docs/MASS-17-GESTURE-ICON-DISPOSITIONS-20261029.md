# Mass Reader — final 17 gesture/icon disposition (29 October 2026)

**Decision:** distinguish **unbound source cues** from **artwork that should be manufactured**. This is a review-only release, with no new pictograms, no approved master-bank changes, and no modification to the user's canonical 1962 Missal rubrics.

| Stage | Source-reconciled records |
|---|---:|
| Canonical gesture matrix | 142 |
| Existing exact v4.6 bindings | 125 |
| Still without independent approved artwork | 17 |
| Normative priest gestures needing exact-art decision | 7 |
| Faithful source/profile instructions that need no additional standalone icon | 10 |
| Existing candidate SVG drawings inspected and blocked at 32/48px | 2 files for 3 priest cues |
| Priest gestures without an exact drawing even in review | 4 |
| Independent priest-position artwork review | 3 stations (NOT part of 17) |

## The seven priest art decisions

| Source cue | Rubric / gesture | Existing comparison | Treatment |
|---|---|---|---|
| C0117 | Raise eyes and hands, then join | `priest_centre_arms_rich` | **Redesign required** for `priest-eyes-hands-raised.svg`; not production eligible |
| C0155 | Living Memento: joined hands + head bowed | `priest_centre_hands_rich` | No exact art; source rubric only |
| C0161 | Hanc igitur: open hands over Host and chalice | `priest_centre_hands_rich` | **Redesign required** for `priest-hands-over-oblations.svg`; not production eligible |
| C0169 | Institution: eyes raised briefly, then lowered | `priest_centre_arms_rich` | No exact art; do **not** imply hands raised |
| C0193 | Dead Memento: hands and fixed gaze | `priest_centre_hands_rich` | No exact art; source rubric only |
| C0204 | Slight elevation of Host above chalice | `canon` | No exact art; do **not** reuse major Host or chalice elevation |
| C0263 | Final blessing: raise eyes/hands, then join and bow head | `priest_centre_arms_rich` | **Redesign required** for same eyes-and-hands proposal; independent exact-source approval needed per cue |

All seven have published bilingual **source rubrics** after PRs #1942 and #1949. A source-cued action needing art may not steal a position icon, a choir icon, or an adjacent priest icon. The original prayer paragraph always remains the owner.

## Ten faithful records — do not create ten pictures

These are current faithful-custom or participation cues, **not normative priest rubrics**:

- Profile-dependent posture: C0021 (Confiteor: kneel versus bow) and C0096 (Incarnatus: local/form/date rule). Continue using existing, separately source-owned posture state, rather than drawing a forced gesture.
- Gesture sequence: C0023 (bowed-to-upright transition); C0173, C0174, C0179 (kneeling/bowing/looking toward the elevated Species). Leave these as source-aligned guidance, not one static still.
- Optional or local: C0056 (Adoramus te); C0235 and C0237 (optional second Confiteor). No universal instruction without the user's selected custom/profile.
- Devotional, not a new posture: C0242 (reverent attention at Ecce Agnus Dei). Do not equate this with a priest Communion or elevation icon.

These ten still have `iconKey: null` in the canonical matrix; the register identifies why that can be intentional. This does **not** revoke independent approved standing/kneeling and other faithful postures already visible elsewhere in the reader.

## What the next reviewer decides

1. **Completed 29 October**: inspected both existing drawings at actual 32px, 48px and 64px. Both fail exact action legibility and original v4.6-family harmony. They are not user-rejected, but their existing SVG bytes must **never** be promoted.
2. Redesign requires a new original-source ceremonial image and matching approved donor geometry: C0117 follows *In spiritu humilitatis* and precedes *Veni, sanctificator*, NOT *Deus, qui humanae*; C0263 is the blessing; C0161 must show BOTH open palms above and facing Host **and** chalice.
3. Preserve the four other priest exceptions C0155, C0169, C0193 and C0204 as text-only. New artwork for any of the seven needs independently verified source picture, 32/48px family review and explicit user approval. None is currently ready for approval.
4. Treat Epistle and Gospel side **station** variants as their own existing 3-entry queue. Do not confuse them with the 17 gesture records.

**Review UI:** `reviews/mass-campion-icon-review-20261010.html` already displays the existing artwork, the review-only candidates and each exact source ID, with a decision export. The source of truth for this disposition is `data/mass/gesture-icon-disposition-20261029.v1.json`. None of its decisions is read by the LIVE renderer or changes its action clock.

## Release protection

`tests/mass-17-gesture-icon-disposition.mjs` and the R17 CI gate validate every original cue, actor, authority, profile, comparator master and absent production binding. The exact original matrix remains **142 / 125 / 17**; the October 20 crosswalk remains **414**; the frozen v4.6 bank remains **67**. A pending icon is not an absent rubric, and a user-selectable faithful custom is not a universal prescribed gesture.

## Two-SVG actual-size verdict — 29 October 2026

**Raised eyes and hands** (`priest-eyes-hands-raised.svg`, C0117/C0263): current unapproved SVG is a stick-like Y silhouette. At 32px, the upward-looking eyes cannot be distinguished from the arrow above a blank round head. The elbows/arms are drawn at a sustained high-Y angle, not a clear, momentary extension-and-rejoining before *Veni Sanctificator* or *Benedicat vos*. It does not reproduce the visual weight, chasuble, gaze or anatomy of the original v4.6 priest masters. **REDESIGN_REQUIRED**. Sources: [Ritus servandus VII.5](https://www.intratext.com/IXT/LAT0820/_PI.HTM) and [XII.1](https://www.intratext.com/IXT/LAT0820/_PN.HTM).

**Hands over oblations** (`priest-hands-over-oblations.svg`, C0161): the two open hands do not resolve in the compact graphic; the Host and chalice merge into indecipherable small strokes and the figure appears to extend one sideways arm. In the 1962 rubrics both open palms are simultaneously over and facing both Oblata, maintained until *Per Christum Dominum nostrum*. **REDESIGN_REQUIRED**. Source: [Ritus servandus VIII.4](https://www.intratext.com/IXT/LAT0820/_PJ.HTM).

Use `reviews/mass-priest-two-svg-visual-review-20261029.html` for the actual 32/48px comparisons. Neither image can be activated through the frozen v4.6 resolver; this verdict is **editorial**, not a permanent rejection or approval by the user. Original 142/125/17 and 67 masters remain unchanged.
