# Owner LIVE prototype → canonical Mass reader crosswalk

**Source:** the owner's 10 November 2026 `ad_orientem_live_handoff.zip` (`data/mass_cards.json`); reference titles. **Authority:** the repository's native direct-curated 1962 LIVE source model, not the prototype's `src/model.js`.

Exactly **65 prototype references** are mapped to expected source-cut IDs below. This table is a design crosswalk, not a second order of Mass. The implementation validates the **real model at runtime** and extracts its actual prayer/cue/block provenance; any mismatch holds rather than falling back to numbering or title matching.

Canonical structure: 30 source macros → 39 source-first units (including 14 Canon units) → 65 curated visible-reference positions. The usual second Confiteor is optional, so 64 may be visible. Pre-Gospel sequences, special rites, Holy Thursday, Ember readings, Nuptial insertions and Requiem omissions must remain source-controlled.

| Owner ref | Owner title | Canonical source segment / cut | Native ID required |
|---|---|---|---|
| C01 | At the Foot of the Altar · Opening and Psalm 42 | `AO.CARD.001` · 1 | `AO.LIVECURATED.AO.CARD.001.1` |
| C02 | Confiteor of the Celebrant | `AO.CARD.001` · 2 | `AO.LIVECURATED.AO.CARD.001.2` |
| C03 | Confiteor of the Servers | `AO.CARD.001` · 3 | `AO.LIVECURATED.AO.CARD.001.3` |
| C04 | Versicles and Ascent of the Altar | `AO.CARD.001` · 4 | `AO.LIVECURATED.AO.CARD.001.4` |
| C05 | Introit | `AO.CARD.001` · 5 | `AO.LIVECURATED.AO.CARD.001.5` |
| C06 | Kyrie | `AO.CARD.002` · 1 | `AO.LIVECURATED.AO.CARD.002.1` |
| C07 | Gloria · The Celebrant's Intonation | `AO.CARD.003` · 1 | `AO.LIVECURATED.AO.CARD.003.1` |
| C08 | Gloria · Praise and Supplication | `AO.CARD.003` · 2 | `AO.LIVECURATED.AO.CARD.003.2` |
| C09 | Gloria · Doxology | `AO.CARD.003` · 3 | `AO.LIVECURATED.AO.CARD.003.3` |
| C10 | Collect | `AO.CARD.004` · 1 | `AO.LIVECURATED.AO.CARD.004.1` |
| C11 | Epistle / Lesson | `AO.CARD.005` · 1 | `AO.LIVECURATED.AO.CARD.005.1` |
| C12 | Gradual · Alleluia / Tract / Sequence | `AO.CARD.006` · 1 | `AO.LIVECURATED.AO.CARD.006.1` |
| C13 | Preparation for the Gospel | `AO.CARD.007` · 1 | `AO.LIVECURATED.AO.CARD.007.1` |
| C14 | Proclamation of the Holy Gospel | `AO.CARD.007` · 2 | `AO.LIVECURATED.AO.CARD.007.2` |
| C15 | Sermon / Homily | `AO.CARD.008` · 1 | `AO.LIVECURATED.AO.CARD.008.1` |
| C16 | Credo · The Celebrant's Intonation | `AO.CARD.009` · 1 | `AO.LIVECURATED.AO.CARD.009.1` |
| C17 | Credo · The Father and the Son | `AO.CARD.009` · 2 | `AO.LIVECURATED.AO.CARD.009.2` |
| C18 | Credo · Incarnation, Passion and Resurrection | `AO.CARD.009` · 3 | `AO.LIVECURATED.AO.CARD.009.3` |
| C19 | Credo · The Holy Spirit, Church and Life Eternal | `AO.CARD.009` · 4 | `AO.LIVECURATED.AO.CARD.009.4` |
| C20 | Offertory · Invitation and Antiphon | `AO.CARD.010` · 1 | `AO.LIVECURATED.AO.CARD.010.1` |
| C21 | Offertory · Offering of the Bread | `AO.CARD.010` · 2 | `AO.LIVECURATED.AO.CARD.010.2` |
| C22 | Offertory · Preparing and Offering the Chalice | `AO.CARD.010` · 3 | `AO.LIVECURATED.AO.CARD.010.3` |
| C23 | Offertory · Humility and Invocation | `AO.CARD.010` · 4 | `AO.LIVECURATED.AO.CARD.010.4` |
| C24 | Offertory · Incensation | `AO.CARD.010` · 5 | `AO.LIVECURATED.AO.CARD.010.5` |
| C25 | Offertory · Lavabo and Offering to the Trinity | `AO.CARD.010` · 6 | `AO.LIVECURATED.AO.CARD.010.6` |
| C26 | Orate, fratres · Prayer and Response | `AO.CARD.011` · 1 | `AO.LIVECURATED.AO.CARD.011.1` |
| C27 | Secret Prayer and Conclusion | `AO.CARD.011` · 2 | `AO.LIVECURATED.AO.CARD.011.2` |
| C28 | Preface | `AO.CARD.012` · 1 | `AO.LIVECURATED.AO.CARD.012.1` |
| C29 | Sanctus | `AO.CARD.013` · 1 | `AO.LIVECURATED.AO.CARD.013.1` |
| C30 | Te igitur | `AO.CANON.01` · 1 | `AO.LIVECURATED.AO.CANON.01.1` |
| C31 | Memento, Domine — Living | `AO.CANON.02` · 1 | `AO.LIVECURATED.AO.CANON.02.1` |
| C32 | Communicantes | `AO.CANON.03` · 1 | `AO.LIVECURATED.AO.CANON.03.1` |
| C33 | Hanc igitur | `AO.CANON.04` · 1 | `AO.LIVECURATED.AO.CANON.04.1` |
| C34 | Quam oblationem | `AO.CANON.05` · 1 | `AO.LIVECURATED.AO.CANON.05.1` |
| C35 | Consecration of the Host · Preparation | `AO.CANON.06` · 1 | `AO.LIVECURATED.AO.CANON.06.1` |
| C36 | Words of Consecration and Elevation · Host | `AO.CANON.06` · 2 | `AO.LIVECURATED.AO.CANON.06.2` |
| C37 | Consecration of the Chalice · Preparation | `AO.CANON.07` · 1 | `AO.LIVECURATED.AO.CANON.07.1` |
| C38 | Words of Consecration and Elevation · Chalice | `AO.CANON.07` · 2 | `AO.LIVECURATED.AO.CANON.07.2` |
| C39 | Unde et memores | `AO.CANON.08` · 1 | `AO.LIVECURATED.AO.CANON.08.1` |
| C40 | Supra quae | `AO.CANON.09` · 1 | `AO.LIVECURATED.AO.CANON.09.1` |
| C41 | Supplices te rogamus | `AO.CANON.10` · 1 | `AO.LIVECURATED.AO.CANON.10.1` |
| C42 | Memento etiam, Domine — Dead | `AO.CANON.11` · 1 | `AO.LIVECURATED.AO.CANON.11.1` |
| C43 | Nobis quoque peccatoribus | `AO.CANON.12` · 1 | `AO.LIVECURATED.AO.CANON.12.1` |
| C44 | Per quem haec omnia | `AO.CANON.13` · 1 | `AO.LIVECURATED.AO.CANON.13.1` |
| C45 | Per ipsum · Minor Elevation | `AO.CANON.14` · 1 | `AO.LIVECURATED.AO.CANON.14.1` |
| C46 | Pater noster | `AO.CARD.019` · 1 | `AO.LIVECURATED.AO.CARD.019.1` |
| C47 | Libera nos · Prayer and Conclusion | `AO.CARD.020` · 1 | `AO.LIVECURATED.AO.CARD.020.1` |
| C48 | Pax Domini | `AO.CARD.020` · 2 | `AO.LIVECURATED.AO.CARD.020.2` |
| C49 | Commingling of the Sacred Species | `AO.CARD.020` · 3 | `AO.LIVECURATED.AO.CARD.020.3` |
| C50 | Agnus Dei | `AO.CARD.021` · 1 | `AO.LIVECURATED.AO.CARD.021.1` |
| C51 | Prayers before the Priest's Communion | `AO.CARD.022` · 1 | `AO.LIVECURATED.AO.CARD.022.1` |
| C52 | Domine, non sum dignus · Celebrant | `AO.CARD.022` · 2 | `AO.LIVECURATED.AO.CARD.022.2` |
| C53 | The Priest receives the Sacred Host | `AO.CARD.023` · 1 | `AO.LIVECURATED.AO.CARD.023.1` |
| C54 | The Priest receives the Precious Blood | `AO.CARD.023` · 2 | `AO.LIVECURATED.AO.CARD.023.2` |
| C55 | Second Confiteor · Optional Local Custom | `AO.CARD.024` · 1 | `AO.LIVECURATED.AO.CARD.024.1` |
| C56 | Ecce Agnus Dei · Preparation of the Faithful | `AO.CARD.024` · 2 | `AO.LIVECURATED.AO.CARD.024.2` |
| C57 | Communion of the Faithful | `AO.CARD.025` · 1 | `AO.LIVECURATED.AO.CARD.025.1` |
| C58 | Ablutions | `AO.CARD.026` · 1 | `AO.LIVECURATED.AO.CARD.026.1` |
| C59 | Communion Antiphon | `AO.CARD.026` · 2 | `AO.LIVECURATED.AO.CARD.026.2` |
| C60 | Postcommunion | `AO.CARD.027` · 1 | `AO.LIVECURATED.AO.CARD.027.1` |
| C61 | Dismissal | `AO.CARD.028` · 1 | `AO.LIVECURATED.AO.CARD.028.1` |
| C62 | Placeat tibi · Closing Prayer | `AO.CARD.029` · 1 | `AO.LIVECURATED.AO.CARD.029.1` |
| C63 | Final Blessing | `AO.CARD.029` · 2 | `AO.LIVECURATED.AO.CARD.029.2` |
| C64 | Last Gospel · Prologue of St John | `AO.CARD.030` · 1 | `AO.LIVECURATED.AO.CARD.030.1` |
| C65 | Last Gospel · The Word Made Flesh | `AO.CARD.030` · 2 | `AO.LIVECURATED.AO.CARD.030.2` |

**P1** is native Asperges, **P2** the Entrance stage, **Q1** After Mass. All remain outside the numbered 65 and cannot be inserted into the canonical Mass as new cards.

**Validation:** `tests/reader-live-handoff-source-crosswalk.mjs` builds the actual native reader model for Low, simple Sung, Sung with incense and Solemn Mass. Dedicated CI exports `reference-to-native-65.csv` and a JSON evidence ledger with actual source cue IDs, paragraph IDs, block IDs and Canon provenance. Mapping is review-only until CI passes and the PR merges.

**Publication rule:** do not use this table to generate liturgical text, infer choir performance, estimate a liturgical time, advance the priest clock or override existing source omission rules.