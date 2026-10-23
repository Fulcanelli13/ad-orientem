# Weiser 1958 — systematic feast-day customary inventory, Batch 02

**Source:** Fr Francis X. Weiser, S.J., *Handbook of Christian Feasts and Customs: The Year of the Lord in Liturgy and Folklore* (Harcourt, Brace, 1958). Printed pp. 60–153, chapters 6–12.

Primary online-text locator: https://www.scribd.com/document/447017805/Handbook-of-Christian-Feasts-and-Customs

Public scan viewer: https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf

The book is **copyrighted**. This repository includes only short, independently worded factual research labels and metadata, never copied passages, lyrics, recipes, images or full chapters. This is a historical source register, not current universal Roman law or a publication licence.

## Output and verification

Batch 02 extracts **122 independently indexed observations** from **seven further chapters**; combined register: **167 observations, chapters 1–12 of 28** (printed pp. 3–153).

| Chapter | Printed pages | Newly indexed |
| --- | --- | ---: |
| 6. Feast of the Nativity | 60–76 | 16 |
| 7. Christmas Hymns and Carols | 77–93 | 13 |
| 8. Christmas Symbols and Customs | 94–115 | 29 |
| 9. Christmas Foods | 116–120 | 14 |
| 10. Christmas Week | 121–134 | 20 |
| 11. Feast of the Circumcision | 135–140 | 11 |
| 12. Feast of the Epiphany | 141–153 | 19 |

### New batch triage

| First-pass classification | Records | Meaning |
| --- | ---: | --- |
| COVERED | 6 | Liturgical or feature owners already exist; no new feature |
| ENRICH | 13 | Potential contextual addition to existing owner |
| CANDIDATE | 28 | Possibly suitable short customs entry after independent validation |
| REGIONAL | 40 | Attestation bounded by country/region/parish; requires further review |
| HISTORY_ONLY | 27 | Historical context, suppressed rite, inter-rite comparison, non-Catholic folklore or secular background |
| EXCLUDE | 8 | Superstitious practice or unsupported origin myth; never user instruction |
| **Total** | **122** | Research observations, not 122 approved customs |

**Combined across batches 01+02:** 17 covered, 20 enrich, 36 candidates, 52 regional, 32 historical, 10 excluded. Candidate and regional labels are **not acceptance**; they preserve the source until source-owner adjudication.

## Most productive subjects and exact Weiser locations

1. **Christmas Eve domestic worship** (pp. 73–76): prayer before the crib, the Nativity scene and family gifts; Slavic `opłatki` shared before the *vigilia* Christmas Eve meal (p. 74; chapter 9 revisits pp. 117–118). The bread is *not* the consecrated Eucharist. Recurring owner: existing `DOM-010` Nativity crib, with future separate food-custom identity only if justified.
2. **Irish Christmas candle and window lights** (pp. 96–97; pp. 66–67 for transmission): parents pray for the living and the dead as a Christmas candle burns; candle/window variant in Irish diaspora. Adapt explanation for Southern Hemisphere seasons rather than prescribing an imagined snowy winter.
3. **La guignolée** (p. 87): French-Canadian house-to-house seasonal carols collecting food and clothing for the poor. Prefer a concrete charity custom over a new carol/audio module.
4. **French household festivities**: family `réveillon` after midnight Mass (p. 76) and Provençal `pain calendau` (p. 117), part of which Weiser describes as distributed to someone poor. These are geographically specific customs.
5. **St Stephen (26 December)**: rural horse blessings and associated rides (p. 129), hay/oats blessings (p. 130), distinct from horse-protection legends, fertility throwing and more secular Wren Boys customs. A separately source-checked local blessing is a **genuine new candidate**; do not create a universal December 26 parish promise.
6. **St John (27 December)**: priestly blessing of wine and `Johannesminne` (p. 130). Explicit Roman Ritual reference in Weiser, but `BLSS-003` is already proposed independently in **open PR #1512**. Do **not** duplicate it. Weiser adds historical uses at weddings and for journeys/the dying; these do not justify health/medical claims or alcohol advice.
7. **St Sylvester/New Year**: some families pray the Rosary near midnight, and French and French-Canadian parents bless children and spouse on 1 January (p. 139). Reconcile to original SOT-07 `DOM-001`, rather than minting another ID.
8. **Epiphany** (pp. 148–153): traditional announcement of the year's movable feasts at some cathedral liturgies (p. 148); solemn Latin-rite Epiphany water blessing and take-home holy water (p. 149); priestly home blessing and chalked Magi initials (pp. 149–150); `Sternsingen`/star-singer visits (p. 151); French `galette des rois` and charity customs (pp. 152–153). The rite of home blessing needs original SOT-07 `DOM-004`. `DOM-003` already owns holy water at home; `DOM-008` **blocks the universal chalk claim** even where the Roman Ritual prints a blessing of chalk.

## Source criticism / exclusions

- **Weiser's 1958 legislation is historical.** He describes Christmas Eve fasting and abstinence as canonical in his time (pp. 69, 74, 119) and changes of feast ranks and octaves. Do not state these as current 2026 obligations, nor silently alter the fixed 1962 Calendar.
- **Catholic versus non-Catholic practice:** the Pennsylvania `putz` example (p. 96) is explicitly Moravian; do not present it as originally Roman Catholic simply because it is a Nativity custom. The Christmas tree's origins are presented as Weiser's theory (pp. 98–101), not incontestable historical consensus.
- **Legends and rejected folklore:** magical winter customs, fertility/fortune-telling, the Christmas-hour luck legends, Holly charm against lightning, unsupported St Boniface/Luther tree origins, Innocents ghost-children and Sylvester lead-casting are either historical context or excluded. These never become prompts.
- **Discontinued church practices:** in-church Christmas dancing, cradle-rocking variants, the Feast of Fools, the Feast of the Ass, and the Office of the Star cannot be introduced as contemporary rubrical ceremonies based on a folklore book.
- **Eastern rites:** the Epiphany river blessing and Eastern solemn baptisms are legitimate study contexts, not automatic 1962 Roman customs (pp. 144–149).
- **Narrative data quality:** Weiser includes some period-specific etymologies, music attributions and estimates. The index prefers verifiable *customary practice* to treating incidental historical theories as settled truth.
- **Geographic claims:** references to “some areas,” folklore or historic Catholic Europe do not permit map pins or worldwide default calendar obligations. All Weiser keys are research IDs only.

## Governance and next passes

**No application files or canonical customs changed in this branch.** The ongoing SOT-07 original 63-row source of truth and all seven HOLD/REJECT entries remain undisturbed. `data/customs/research/weiser-handbook-inventory.v0.json` continues using `WEI58-CH-NNN` **research-only** IDs.

**Open PR #1512** still governs three separate priestly feast blessings (Assumption herbs; St John wine; Easter foods), and must be reconciled upon merge; this source research must not copy its app changes.

The next logical research segment is **chapters 13–17 (Pre-Lent, Lent, Holy Week, Easter and Easter songs/customs; printed pp. 154–238)**, with particular attention to the 1962 Holy Week revisions, Ember/Rogation owner parity, and separate historical and current norms. After that, chapters 18–22 cover Ascension through Thanksgiving and 23–28 cover Marian and saints' feasts.

No new prayer collection, music/Office feature, geographical place, special Mass, indulgence promise or expense is authorised by the source inventory.
