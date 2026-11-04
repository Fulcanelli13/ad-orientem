# ICRSP France — Batch 12: atomic interpretive claims versus actual 1962 lections

**26 October 2026** · Research branch `governance/icrsp-source-inventory-1665` · [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666) · No published content changed.

## What this batch actually verifies

Five previously read ICRSP pages supply **seven separate atomic observation/interpretation claims**: two about Naaman, two about Susanna, one each for Elisha, Elijah, and Joseph. Their **five different existing Ad Orientem 1962 Latin Proper source paths** and exact lesson/Gospel references have now been checked against `data/mass/scripture-lent-weekday-source-audit.v1.json`. A sixth ICRSP page carries a **historical station-site dispute**, not a Scripture claim.

This confirms selected Bible passage boundaries and preserves category boundaries. It **does not** verify printed Guéranger volumes, Hippolytus, art-historical assertions, full existing prose parity, translation rights, or any missing deployed feature.

| ICRSP source and 1962 path | Existing lesson and Gospel | Atomic distinctions / restriction |
|---|---|---|
| [Mon. Lent III](https://icrspfrance.fr/textes-liturgiques.php?article=a0191_ancien), `Tempora/Quad3-1` | 2 Kings 5:1–15 / Luke 4:23–30 | Luke names Naaman **directly**; his cleansing understood as a type of Baptism is a **separate, attributed commentary claim**, not an explicit baptismal exegesis in Luke 4. |
| [Sat. Lent III](https://icrspfrance.fr/textes-liturgiques.php?article=a0198_ancien), `Tempora/Quad3-6` | **Daniel 13:1–9; 15–17; 19–30; 33–62** / John 8:1–11 | Commentary juxtaposes Susanna's innocence with mercy shown by Christ. Do not silently turn the disjoint Daniel lesson into Daniel 13:1–62. The putative Hippolytus/early Christian art link is **not original-source verified**. |
| [Thu. Lent IV](https://icrspfrance.fr/textes-liturgiques.php?article=a0205_ancien), `Tempora/Quad4-4` | 2 Kings 4:25–38 / Luke 7:11–16 | The Elisha/Shunammite and Nain pair shares a resurrection motif. The detailed Christological reading is Guéranger's interpretation, not a direct scriptural cross-reference. |
| [Fri. Lent IV](https://icrspfrance.fr/textes-liturgiques.php?article=a0206_ancien), `Tempora/Quad4-5` | 1 Kings 17:17–24 / John 11:1–45 | Elijah/widow and Lazarus are **distinct textual witnesses** from Elisha/Nain; classification by theme must not collapse the biblical accounts. |
| [Fri. Lent II](https://icrspfrance.fr/textes-liturgiques.php?article=a0186_ancien), `Tempora/Quad2-5` | Genesis 37:6–22 / Matthew 21:33–46 | **Important lection boundary:** Genesis 37:28 (the actual sale of Joseph) is **not read** in this Friday lesson. The commentary can discuss the full Joseph narrative as a Christological type, but the app must not label verse 28 as a selected Mass reading. Historical Jewish–Christian polemic remains quarantined. |

**Biblical book-numbering note:** the existing Mass source registries render Vulgate 3/4 Regum as `1Kings`/`2Kings` in the canonical Scripture viewer; this is an existing concordance, not a newly authenticated French/English text edition. Each claim remains a **research classification** pending text-source comparison.

## Explicit cross-owner reconciliation

- **Mass and Calendar:** existing Proper source-path/Latin reading ownership is confirmed for all five cases. Neither selected 1962 Proper, seasonal day assignment nor rubrical/user-posture fields change. Existing Calendar scripture-handoff resolves selected Proper dynamically.
- **Mass Explorer and Formation:** `data/learn/mass-explorer-approved-studies.v1.json` has **0 approved deep studies** at this check, while `data/learn/mass-explorer-prayer-readings.v1.json` contains 84 explanations of the Ordinary's prayer blocks, and `data/learn/mass-formation-campion.v1.json` holds 8 formation stages. None is a licence to duplicate them with new liturgical pages, and **a zero deep-study manifest does not prove absence of all other content**.
- **Scripture:** production `src/scripture/related-objects.js` is a reverse index for existing curated links, **not** a complete theological typology corpus. The independent, still-draft [Scripture correspondences PR #1553](https://github.com/Fulcanelli13/ad-orientem/pull/1553) already owns thematic research; its 56 named `thematic-source-leads.v1.json` subjects contain **no Naaman, Susanna, Elisha or Elijah titled subject** on inspection. The ICRSP evidence should therefore be offered to that existing owner by cross-branch reconciliation; do not create a second compendium or silently merge unverified research across PRs.
- **Places:** `data/geography/seed-registry.v1.json` presently has **457 `places` entries** and 145 `geoAreas` entries, **not 498 place records** as stated in the prior B11 narrative. The Roman station church names are not found as named records in this **seed only**. Other dedicated Sacred Places and Shrine registries have not been exhaustively checked, so **no new Place IDs** and **no missing-place conclusion**.

## Station contradiction remains an actual exception

The [Sitientes Saturday](https://icrspfrance.fr/textes-liturgiques.php?article=a0207_ancien) introduction names **San Lorenzo in Lucina** as the earlier Roman station. Guéranger's named section instead gives **San Lorenzo fuori le Mura**. The subsequently named station is **San Nicola in Carcere**. The former sites are not variants of one building. Keep both source claims attributed; establish the true historical succession from independent research before the Calendar or Sacred Places system receives a factual note. No icon, priest-action or local-custom cue is warranted.

## Acceptance gates and accountable totals

- **7/7 atomic claim rows have an exact pre-existing Mass Proper reading-pair witness**, across **5 source paths**, and **1 site dispute** is explicitly held.
- **0** original Guéranger editions, original Hippolytus passages, independently certified typological interpretations, or reproduction permissions have been collated/approved in this batch.
- **0** existing-app claim absences independently proven, **0** paragraph-level full cross-app parity certifications, **0** new stable Place IDs, **0** published content changes.
- The next editorial pass should compare the seven narrowly defined claims to the **actual passage-level correspondences in PR #1553** and other source branches; obtain original edition loci only for retained high-value topics. Treat Joseph 37:28 and Sitientes as hard negative/exception cases, not tasks to "fill" by inference.

**Research register:** `data/source-text/icrsp-france-b12-atomic-claim-and-lection-boundaries.v1.json`. **Regression test:** `tests/test_icrsp_b12_liturgical_claim_boundaries.py`. Records are editorial leads and exact existing lection boundaries, *not* quote-ready French reproduction or user-facing articles.
