# W60 — Saints of the Day historical-art physical-original reconciliation
**15 October 2026 · Research-only · No live-app or user-rating changes**

## Source of truth and preserved ownership

- Legacy W59 recovery: `data/research/saints-of-day-legacy-art-recovery-w59-20261015.v1.json` and identity crosswalk on the inherited W59 branch.
- Sacred Art: current canonical work-in-progress is draft [PR #887](https://github.com/Fulcanelli13/ad-orientem/pull/887), especially W48/W49 ratings, W46 earlier ratings, original 281-work registry and W31 source options. **None of those files were edited.**
- Saints identity and biographies: `saints/2026-10-15-identity-and-holiness-pilot` (separate owner), read-only artwork links only after verification.
- Breviarium: [83 public plates](https://breviarium.ink/art/) indexed by label and painter, **not** asserted as 83 verified painting URLs or new approvals.

## W60 files committed

1. `data/research/saints-of-day-physical-artwork-crosswalk-w60-20261015.v1.json` — per-work statuses for all 49 W59 Proper originals, 87 Saint Art rules and 18 named file directives; exact vs provisional identity evidence; artist and rating gates; W57/W58 protection.
2. `data/research/breviarium-83-label-crosswalk-w60-20261015.v1.json` — all 83 publicly listed plate titles/artists in 5 families (Our Lady 23, Life of Christ 29, Mystery of God 2, Angels 6, Saints 23); provisional overlaps with W59/W48. No per-plate Commons file paths could be verified through the source text; every overlap is **label-only**.

## Findings and categorisation

| Evidence category | Count | Interpretation |
|---|---:|---|
| Historical art rules | 87 | Old resolver approvals, **not** current human ratings |
| Rules with named files | 17 | 18 file directives, of which one ('Pietà') is not a usable Commons file reference |
| Category-only rules | 69 | Search prompts only; no identified painting guaranteed |
| No usable file/category | 1 | Cornelius & Cyprian group |
| Proper originals / liturgical assignments | 49 / 50 rows | 49 actual painting assignments + 1 explicit NO_ART row, distributed 15 Sancti / 35 Tempora; **not** 49 saints |
| W59 Proper artist-excluded originals | 4 | Fra Angelico 1, El Greco 3 |
| W59 Proper physically cross-linked to known earlier original | 3 | AO012, AO073, AO109; preserve 5/4/5 ratings |
| W59 Proper wrongly mergeable by broad title | 1 | AO021 Prado Murillo ≠ CMA Murillo; keep distinct |
| W59 Proper without cross-ledger original match | 41 | **Historical leads only, not new approved artworks** |
| Historical saint rule reusing an already registered object | 1 | St Joseph of Cupertino → existing `met-724811` |
| Breviarium title+artist overlaps with W59 Proper | 9 | **Not certified physical-original matches** |
| Breviarium title+artist overlaps with W48 | 6 | Still require matching Commons original/object ID |
| Breviarium excluded-artist plates | 7 | No reuse under current user preferences |

#**Accounting correction:** 50 legacy Proper rows = 49 painting assignments plus 1 NO_ART row (Sixteenth Sunday after Pentecost). The historical NO_ART status says no painting was cleared at the time; it is not an aesthetic rejection of that feast for all time.

## Verified identity decisions

- **AO012** Caravaggio, *Incredulity of Saint Thomas*, Sanssouci: reuses W48 **W07-014**, existing **5/5**; do not re-rate.
- **AO109** Caravaggio, *Crucifixion of Saint Peter*, Santa Maria del Popolo/Cerasi Chapel: reuses W48 **W05-027**, existing **5/5**. [Rome tourism authority](https://www.turismoroma.it/en/node/18610) identifies the original and location.
- **AO073** Jacopo Bassano, *Miraculous Draught of Fishes*, NGA object **96688**: reuses `nga-96688`, **4/5** in the earlier human-rating ledger. A different Commons photograph does not make a new original.
- **AO021** Murillo, *Immaculate Conception of Los Venerables*: **Prado P002809**, oil 274 × 190 cm, dated 1660–65, [Prado original](https://www.museodelprado.es/en/the-collection/art-work/immaculate-conception-los-venerables/76179d81-beaf-4f9e-9a05-ef92340a00d1). **Cleveland 1959.189** is a different Murillo canvas, 220.5 × 127.5 cm and c.1680, [CMA original](https://www.clevelandart.org/art/1959.189); **do not transfer its rating** or merge its physical record.
- **Saint Joseph of Cupertino:** historical named Commons image identifies Placido Costanzi's *A Miracle of Saint Joseph of Cupertino*, already in the 281-work registry as `met-724811`; [Met original](https://www.metmuseum.org/art/collection/search/724811) identifies object **2016.394**, 1750, oil on canvas. Do not count a second painting from a duplicate image title.
- **Saint Felix II:** file `Felix II antipapa.JPG` is a critical historical-person identity hold, not a safely validated saint portrait.
- **Hippolytus/Cassian:** historical file directive `Pietà` is not a specific Commons file ID.

### Existing user decisions and release gates

W49 has 86 selected-5 **placements** (not necessarily 86 unique physical paintings), and its permanent blocklist contains 95 works from the reconciled sources. This blocklist explicitly does **not** claim to enumerate every original human rating ever made. Preserve all former 0–2 global picture rejections, all 4/5 scores, and the protected W58 Gabriel and Guardian Angels paintings. **No historical `approved: true` flag overrides them.**

A painting is not publishable merely because its title, artist or old Commons license matches a subject: it also needs the correct physical original, original image quality and current reproduction rights, liturgical placement, crop and user selection. User preference remains dynamic artwork rotation among all genuinely 5-star approved works for a given theme.

## Why the previous 149 missing saint-feast entries cannot be honestly recomputed yet

The W59 **252 dates / 311 components** are historical manifest targets rather than a newly materialised, authoritative 1962 saint-feast table. W59 supplies only 87 historical artwork rules and 27 date overrides, not a complete date-by-identity-by-current-artwork ledger. The old **149** refers to an earlier coverage report, whose **149 per-feast rows and W57/W58 exact approved artwork links are not available in the examined research files**. The 83 Breviarium plate-to-Commons links also remain unverified. Consequently:

- Do **not** report 149 as the current gap, subtract 87, subtract 49, or equate category leads with artwork.
- Next input: serialise each of the original 149 feast IDs and associated canonical saint/group IDs from the current date resolver and W57 source ledger. Reconcile with W59 date locks/overrides, W58 current approved IDs, 83 Breviarium exact Commons file links, and W48–W60 physical IDs. 
- For each feast, assign **SELECTED_5**, **HAS_4_AWAITING_DECISION**, **RESEARCH_ONLY_OR_UNVERIFIED**, **IDENTIFIED_BUT_REJECTED**, or **NO_IDENTIFIED_ORIGINAL**. Each link must carry original ID, source URL, rating source/version, exact saint identity and publication gate.
- The **current outstanding 149-feast gap is indeterminate**, not silently filled or closed.

## Next deliverable

Obtain the missing 149-row source list, W57/W58 decisions, and exact Breviarium 83 file hyperlinks. Complete accession/Commons mapping, especially 41 Proper works unmatched in the examined ledgers and 16 named-file directives without a proved existing physical original; classify genuine new **unrated** paintings only after image identity and 0–2 rejection checks. No replacement HTML rating gallery should be issued while those identities may duplicate rated artwork. Avoid resurfacing the same rejected artists and images.

**Branch remains research-only; all preserved W59 and PR #887 data unchanged.**
