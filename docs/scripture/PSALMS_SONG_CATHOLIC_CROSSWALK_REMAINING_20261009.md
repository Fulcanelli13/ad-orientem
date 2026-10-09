# Remaining Catholic Psalm and Song of Songs verse divisions — 9 October 2026

All data below comes from the **original CPDV author pages** and the pinned **Douay–Rheims Challoner Catholic witness**, not from a Protestant Psalter or a guess based on King James numbering.

The automated check `tools/scripture/audit-psalms-song-divergence.mjs` now produces exact chapter count and unmatched-reference lists in the Scripture source workflow.

## Psalms — concentrated differences

| Catholic/Vulgate Psalm | Issue |
|---|---|
| **13** | CPDV author master includes verses 8–10 beyond the corresponding D–R verse set. These correspond to the expanded wickedness description often familiar from St Paul's citation in Romans 3; the textual and editorial source relationship needs specific review |
| **42** | D–R has verse 6 not present as a separate CPDV author coordinate; determine whether this is combined with an adjacent verse |
| **92** | CPDV has verses 6–7 in addition to five numbered D–R verse slots; chapter/verse content has shifted |
| **150** | D–R third-party source includes an empty verse 6 placeholder. It must not be confused with a textual omission in the CPDV author master; verify the exact terminal verse in the printed source |

**Audit count:** three chapters have different *recorded* source slot counts when the historical Douay blank placeholder is included; Psalm 150 also requires an explicit blank-text audit. Psalm numbers follow Catholic/Vulgate ordering (e.g. Psalm 22 corresponding to Psalm 23 in many modern editions).

**No automatic same-number Psalm reference substitution** is allowed until source-level mapping is certified.

## Song of Songs — five chapters have different verse counts

| Chapter | CPDV author numbered verses | D–R numbered verses |
|---|---:|---:|
| 1 | 21 | 16 |
| 2 | 19 | 17 |
| 5 | 19 | 17 |
| 7 | 14 | 13 |
| 8 | 15 | 14 |

The CPDV author edition identifies Bride/Groom speech divisions that do not simply map to the D–R line segmentation. The eleven additional CPDV numbered slots correspond to *different subdivisions*, not eleven proven extra verses.

**Action:** compare the complete passages to the Vulgate and determine a phrase- or passage-range correspondence. Do not manufacture single-verse equivalents or silently strip the CPDV speaker indications. The source comparison report holds exact coordinates.

## Esther is no longer in the unresolved group

The complete Catholic Esther alignment is under `docs/scripture/CATHOLIC_ESTHER_274_275_CROSSWALK_20261009.md`. It explicitly maps 274 original CPDV verse records to all 275 Catholic Douay–Rheims verse records, including the CPDV 7:14 / D–R 4:12–13 merge. This is a full *textual correspondence*, not ecclesiastical approval of the translation's doctrinal interpretation.

## Release policy

CPDV remains the editor-selected public-domain alternative to D–R but `enabled:false` until the required text/provenance/theological checks are signed off. These chapter-count audits do not authorize Bible text publication. French Crampon uses its own source-specific numbering and has no implied English verse crosswalk.
