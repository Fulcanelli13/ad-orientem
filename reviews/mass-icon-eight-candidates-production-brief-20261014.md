# Ad Orientem — Mass Icon Art Direction & Production Specifications (v1)
Date: 14 October 2026 · **Draft research only, not approval or integration**

Source of truth: [eight-source-cue specification register](../data/presentation/mass-icon-production-specifications-20261014.v1.json). This document is the human-readable brief, not a new asset bank.

## Decision

From the 36 candidate subjects in [the reuse-first backlog](../data/presentation/mass-icon-three-by-three-production-backlog-20261014.v1.json), only **eight subjects remain potential new/corrective illustrations**: `B10`, `B11`, `B16`, `A03`, `A06`, `B14`, `D02`, `D06`.

This is an **upper bound**, not an order for eight drawings. The current 42 user-selected assets are the visual standard; 19 other candidate subjects need reuse inspection, and nine are better represented by a reused icon plus a precise rubric. Previously approved finger-discipline artworks are preserved; do not regenerate them.

**No photographs, old engravings, generic decorative clipart, independently invented silhouettes or overview infographic sheets belong in the Mass reader.** Historical photographs may inform ceremonial accuracy but are not artwork.

## One locked visual family

- Master reference: one of the **user-selected** `assets/active/mass-v46/priest_centre_rich.svg`, supplemented by `priest_epistle_rich.svg` and `priest_elevate_chalice_rich.svg`. Those files contain embedded raster and are **not true editable vectors**.
- Use the *same priest*: fixed head and hair silhouette, neck, alb, traditional Roman chasuble with the **same** back ornament, lace hem, arms, body height and proportion.
- Preserve the *same altar*: width, panel profile, crucifix, two candlesticks, cloth and decorative rhythm. No invented angels, halos, clouds, extra ministers or additional candle rows.
- Match exactly the original family's navy/white silhouette treatment; sample the tint from the selected master rather than guessing a new hex code. No gradients, glows, photo textures or colourful backgrounds.
- One artwork per file, **1024 × 1024 draft PNG with verified transparency**. No baked grey chequerboard, captions, IDs, grids, legends or typography. A transparent PNG is **not** an SVG.
- Subject should occupy the same frame and baseline as the chosen original; alter **only** gesture and physically necessary Eucharistic objects. Use rear view, or the *minimum* rear three-quarter variation needed to make a liturgical action genuinely visible.
- Review at **48 / 64 / 96 / 128 px**; the gesture must read at 64 px. Where miniature object detail is impossible, a short source-owned rubric is preferable to a deceptive icon. At 48 px a simplified rail variant may be needed later, but it must remain visibly part of the same family.
- Final deliverable after artwork approval: real SVG shapes/paths, transparent, no base64 PNG/JPEG `<image>` wrapper; tinted consistently in the app where feasible. Verify file type rather than trusting the extension.

## Workflow — three at a time

**Gate 0 — Search before drawing.** Inspect every relevant existing approved or provisional icon, including original artwork not just the filename. Reuse if it actually depicts the exact action; don't accept byte-identical variants with different semantic names.

**Gate 1 — Rubric lock.** Record the 1962 source, exact action at the exact phrase, minister/actor, Mass-form conditions and pre/post-action distinction. A *rubric moment* is not automatically a unique *pictorial composition*.

**Gate 2 — Concept output.** Produce a **single isolated icon** per call. Avoid long inventories, infographics or multiple-pose sheets. One action, one physical frozen instant. If generation does not obey the approved visual grammar, do not continue producing the rest.

**Gate 3 — Independent review.** Scoring: exact gesture **5/5 required**, correct actor **5/5**, family continuity **at least 4/5**, hand/object clarity **at least 4/5**, 64 px comprehension **at least 4/5**. A pass on artistic appeal cannot compensate for wrong rubrics.

**Gate 4 — Asset finishing.** After user accepts the concept, produce proper editable vectors or obtain manual vector retouching. Confirm actual alpha, path-based shape, same navy family, no anomalous joints or disembodied fingers; compare at app sizes.

**Gate 5 — Runtime integration (separate PR).** Do not change any mapping on this research PR. Bind exact cue ID, actor, applicable Mass forms, and independent priest/minister clock; preserve all old master assets. No implied observation of clergy movements from reader scrolling.

Production batches: **(B10, B11, B16)** → **(A03, A06, B14)** → **(D02, D06)**. The last batch has two; don't invent a third subject to make the numbers even. Each next batch waits for the previous batch's review.

## Batch 1: exact briefs and copy-ready prompts

### B10 — Fraction of the Host
**Cue:** `AO.SM.C0216`. 1962 Ritus X.2, *Per eumdem Dominum nostrum Jesum Christum Filium tuum*.

**Physical instant:** The celebrant holds the consecrated Host **between the thumb and index finger of BOTH hands**, and reverently **breaks It into two halves over the open chalice**. The chalice stays under the Host; it is **not** raised for adoration at this instant. The breaking is visually legible, with no crumbs spraying and no Host going near the priest's face. The hands and Eucharistic objects must not disappear into the altar edge.

**Reject:** whole round Host held overhead, two pieces already in a chalice, the priest drinking, chalice held in the hands breaking the Host, the current generic `fraction` / `commingling` / `communion` duplicate illustration.

**Prompt (one image only):**
> Create ONE isolated, square, transparent-background, monochrome navy-and-white icon in the *exact* style of the attached user-approved priest-at-altar icon. Preserve the identical priest, Roman chasuble, alb, altar, crucifix, candlesticks, proportions and line-art detail. Show the priest at the altar breaking the consecrated Host into two halves directly above an uncovered chalice, carefully holding the Host between the thumb and index finger of **each hand**. The Host must be low, at altar level, with the break visibly occurring between both hands. Use a minimal rear three-quarter viewpoint only if essential to see his fingers. No overhead elevation, drinking, extra people, text, borders, composite layout or infographic. Output only the single image.

### B11 — Commingling
**Cue:** `AO.SM.C0221`. 1962 Ritus X.2, *Hæc commíxtio* after the three crosses during *Pax Domini*.

**Physical instant:** The priest holds a **small Eucharistic particle** delicately between the **right thumb and index**, placing it into the **open chalice**, which his **left hand supports by its node beneath the cup**. The large Host halves have already been set on the paten. Chalice remains at altar height; no break action, no full Host over it.

**Reject:** priest breaking the whole Host, large round Host hovering, elevated chalice/Host as *Per ipsum*, Communion drinking, floating wafer in air.

**Prompt (one image only):**
> Create ONE isolated square transparent icon belonging to the same approved navy-and-white priest-at-altar illustration family. Maintain the exact same priest, chasuble ornament, altar design, crucifix and candle positions. Depict the precise Roman Mass commingling: the priest, at altar level, **releases one small particle of the consecrated Host from the right thumb and index finger into the open chalice**, while his **left hand holds the chalice by the stem/node just below the bowl**. The particle must clearly be small, entering the chalice's rim; the entire Host is NOT being held, broken or elevated. Keep anatomically natural fingers, a clear sense of near-contact at the rim, and identical artwork density to the reference. No extra objects, words, collage or other moments.

### B16 — Profound bow of the celebrant
**Cues:** `AO.SM.C0016` (*Confiteor* at foot of altar), `AO.SM.C0150` (*Te igitur*), `AO.SM.C0187` (*Supplices te rogamus*). 1962 Ritus III.7 / VIII.1 / IX.1.

**Physical instant:** Deep **waist inclination**, head lowered. **Not** an altar kiss; mouth does not touch altar. For the **Canon-first** illustration (`C0150`/`C0187`), the joined hands are placed on the altar as appropriate. For the `Confiteor` (`C0016`), the priest bows at its foot with hands joined and **must not** be represented leaning his hands on the altar. The generic torso-bow image can be reused only if those hand/context differences are not falsely represented; otherwise retain short cue text or commission a reviewed contextual variant.

**Reject:** lips at altar surface, head-only nod, genuflection, hands holding Host, foot-of-altar pose with hands touching the altar, reuse of the byte-identical `priest_kiss_altar_rich` file without correction.

**Prompt (one image only):**
> Draw ONE isolated, square, transparent navy-and-white illustration using exactly the same priest and altar from the approved reference. Show the priest **bowing profoundly at the altar during the Roman Canon**: a visibly deep bend from the waist, head lowered, hands joined and placed on the altar in accordance with the Canon rubric, but **face not touching or kissing the altar**. Preserve chasuble back embroidery, alb and lace, altar proportions, crucifix and twin candlesticks. A minimal rear three-quarter angle may help make the inclination unmistakable. This is NOT a genuflection or an altar kiss. No text, other figures, collage or alternative views. Produce a single image.

**Design note:** B16 has more than one contextual rubric. An image of an altar-based Canon bow cannot be blindly applied to the `Confiteor` at the foot of the altar; when in doubt use a succinct exact text cue.

## Batch 2: exact moment definitions

| ID | Exact instant | Critical rejection |
|---|---|---|
| **A03 — Hanc igitur** `C0161` | Two hands **close together**, held over Host and chalice, bare palms **downwards towards** the offerings; neither vessel held. Ritus VIII.4. | No wide orans/cruciform arms, palms up, hands hidden on altar edge or Host in hand. Previous generated artwork was a style reference, **not rubrical certification**. |
| **A06 — Minor elevation** `C0204` | At *omnis honor et gloria*: priest's **right hand holds Host above the chalice**; his left grips chalice node. Both are raised **only somewhat** at chest/altar level. Ritus IX.3. | No overhead Host, major elevation, missing chalice, or both hands holding Host. |
| **B14 — Drinks Precious Blood** `C0234` | Priest's **right hand holds chalice at node**, left supports paten beneath chalice, the **lip of chalice meets mouth** as he drinks. Ritus X.5. | No chalice displayed high to congregation or confused with blessing by chalice. |

## Batch 3: Solemn Mass / incensed Missa Cantata research (not live)

| ID | Exact instant | Conditional actor distinction |
|---|---|---|
| **D02 — Deacon lifts chasuble** `C0174/C0181` | During elevations at **Solemn Mass**, deacon kneels at celebrant's right on upper step and lifts posterior chasuble fringe. Ritus VIII.8. | Deacon (dalmatic) is **not** priest and not Low Mass server. One contextual elevation at a time. |
| **D06 — Thurifer incenses** `C0174/C0181` | Thurifer kneeling on **Epistle side**, swings thurible three times toward raised Sacred Species; occurs when incense is used in eligible solemn/sung forms. Ritus VIII.8. | Thurifer is **not** celebrant. Do not imply incense is obligatory at Low Mass or all Missæ Cantatæ. |

At **64px** if a separate minister is not immediately identifiable, prefer the existing small incense cue combined with a precise actor-specific rubric over a false priest icon.

## Sources

1. [1962 Missale Romanum — Ritus servandus (Latin original)](https://www.documentacatholicaomnia.eu/01p/1962-06-23%2C_SS_Ioannes_XXIII%2C_Missale_Romanum%2C_LT.pdf), especially III.7, VIII.1, VIII.4, VIII.8, IX.1, IX.3, X.2, X.5.
2. [1962 Ritus servandus — full English translation](https://1962ordo.today/1962-rubrics/). Use as a reading aid, not as a substitute for the normative Latin text.
3. [Source-owned gesture matrix](../data/mass/gesture-matrix.v1.json), [rubrical events](../data/presentation/reader-rubric-events.v1.json), [conditional minister source branches](../data/research/mass-canon-minister-form-branches-20261013.json).
4. [Original user-selected icon list](../data/presentation/mass-icon-user-selections-20261010.v1.json). Approval of one selected icon is not approval of an entire unrelated style family.

**Approval status:** all eight subjects remain `NOT_APPROVED`; no new image, vector, app layout, cue mapping or published reader element is authorized by this brief.
