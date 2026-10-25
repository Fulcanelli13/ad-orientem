# ICKSP 1962 Gloria/Credo — priest versus Schola clock (B02)

**Status:** separate source concordance + strict owner guard, **not an automatic priest movement engine**. Based on the 1962 *Ritus servandus*, IV.3 (Gloria) and VI.3 (Credo), cross-checked with ICKSP's published Latin–French Ordo.

Sources: [ICKSP Ordo](https://icrspfrance.fr/textes-liturgiques.php?article=a0003_ancien); [1962 Ritus servandus](https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/).

## Source crosswalk

The B02 JSON lists **12 explicit priest gestures** during Gloria and Credo: **10 already in the canonical gesture matrix**, and **2 source-attested without a separate gesture-matrix record**: `C0054` (priest bow at *Deo*) and `C0056` (*Adoramus te*). The approved 182 original image names, 57 published rubric rows, 142 gesture matrix rows, 279 Sung cues, and 65 LIVE cards remain frozen.

**Crucial timing distinction:** the priest intones the Gloria through *Deo* (`C0054`) and the Credo through *in unum Deum* (`C0090`), then privately continues the prayer independently of the schola. The choir continuation starts at `C0055` / `C0091`. The donor corpus currently labels the two intonation-ending cues `SCHOLA_PUBLIC`; [parallel PR #1554](https://github.com/Fulcanelli13/ad-orientem/pull/1554) explicitly adjudicates priest chant there. **Do not suppress or rewrite those two cues here.**

## What changes in the LIVE reader

The existing `resolvePriestChantAction` and `resolvePriestChantVoice` guard is extended to the **30 later choir-owned phrase cues**, specifically `C0055–C0069` and `C0091–C0105`, and to all three Sung forms. A user's navigation to any such public phrase may still show the lyrics and their **faithful** posture/gesture cues, but **cannot infer a current priest action or private speech**. No gesture art is deleted. Low Mass and the existing exact-source Sanctus/Benedictus independent-observation pathway remain unaffected.

## Follow-up decisions

- Review `C0054` and `C0056` against the primary Latin facsimile and ensure the missing source-attested priest bows have independently owned rubrical descriptions **without expanding the frozen gesture/icon registries**.
- Align the priest intonation head-bow for `C0054` with PR #1554, preserving its sung owner.
- If later exposing independently observed priest gestures in LIVE, require explicit independent observation or source MC-event—not simultaneous choir syllables or a scroll position.
- Merge sequencing must account for outstanding PR #1643 (icon/rubric QA), #1554 (intonation/Schola windows), #1653 (local Confiteor), and #1663 (Placeat). No part of this B02 silently merges them.

## Tests

`tests/reader-priest-chant-owner.mjs` checks all 30 choir-owned cues across three sung forms for absent inferred priest action and voice, rejects forged observation, preserves C0054/C0090 intonation endings, and verifies Low Mass is untouched. CI of this exact head remains authoritative; passing one older branch is not release evidence.
