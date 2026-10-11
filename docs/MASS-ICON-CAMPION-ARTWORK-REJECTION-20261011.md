# Rejected Campion priest artwork — visual-family lock (11 October 2026)

## Explicit user rejection

The user reviewed the seven-icon family montage on 11 October 2026 and rejected **all five newly generated priest-gesture illustrations** from PR #1014, versions v1 and v2. That PR has been closed **unmerged**. None of its five priest SVG candidates is an approved master and none should enter production or be used as a donor for future art.

**Five rejected subjects:** Memento hands; hands over oblations; raised eyes only; minor elevation; raised eyes and hands. The previous claim that SVG structure and recolouring made these stylistically acceptable was invalid.

## Why the artwork failed

- Cartoonishly simplified priest busts and incongruous nose/beak silhouettes compared with the detailed Mass v1.80 priest family.
- Unconvincing anatomy, hand gestures, limb scale and garment cut-outs; vestment ornaments do not match original masters.
- Floating hands/objects without credible bodily continuity or altar spatial relationships.
- Minor elevation is a distinct *Per ipsum* action, not a generic picture of Host and chalice; neither an Elevation nor an *Ecce Agnus Dei* image is a correct substitute.
- 24–44px legibility and currentColor/XML validation cannot establish artistic or rubrical correctness.

## Accepted baseline — preserve exactly

The original 42 explicit selections and two approved finger-discipline illustrations merged in PR #1011 remain intact. The latter are `assets/approved/mass/finger-contact-post-consecration.svg` and `assets/approved/mass/finger-ablutions-post-communion.svg`. The frozen v4.6 active masters must not be replaced.

## Required method for any later redraw

Use the **real v1.80 high-resolution Mass priest donors** as master designs; retain their angle, body proportions, original vestments and black/negative-space visual texture. Work as *faithful, localized alterations of specific original masters* rather than a new generic cartoon family or a stylized image-generation montage. For fidelity, inspect original artwork in full, not just named file paths.

A new native SVG must use scalable geometry, transparent negative spaces and a liturgically tintable foreground (e.g. currentColor). Inspect the icon at 24, 32, 44, and larger sizes in the actual Mass reader. Subject-specific accuracy must be checked against 1962 rubrics and the exact priest action. No animation, layout, recolouring or technical score excuses visual-family mismatch.

Do not produce five more icons in one pass before a **single** proposed master has been compared against an existing approved original and accepted by the user.

## Recovery

The 17 source cues and ten proposed semantic groups are preserved **without any artwork claims** in `data/presentation/mass-icon-campion17-source-triage-20261011.v1.json`. Pending entries stay pending and old rejected files remain solely in the closed historical branch/PR #1014, not in `main`.

No production runtime binding, gesture source register or priest/faithful rail ownership was modified.
