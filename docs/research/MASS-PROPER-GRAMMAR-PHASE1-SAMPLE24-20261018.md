# Mass Proper Phase 1 — reproducible grammar sample (18 October 2026)

**Status: SECOND-PASS TARGETED ADJUDICATION, NO PRODUCTION TEXT CHANGES. Full 540-paragraph editorial certification remains open.**
Audit PR: #1418; source checkout: `edfbe1bb9b4695f73773a3444c7b46fd4652275f`.
Full machine record: CI artifact `phase1-24-propers-en-fr-audit` in the Phase 1 Grammar Sample workflow; retained for 30 days. The repeatable sampler is `tests/mass-phase1-24-random-propers-grammar.mjs`.

## Method and denominator
Seed `AO-P1-GRAMMAR-2026-10-18-v1`. Draw one Sunday and one non-Sunday per month of 2026 from deterministic shuffled days, retaining only successful original Calendar resolutions and a **new, unique `sourcePath`**. Thus 24/24 distinct Propers, covering all 12 months; no hand-picked 18 October Proper inside this sample.

For each date, run the real in-app 1962 Calendar resolver, selected **MISSA_CANTATA_SIMPLE** form, historical Proper recovery and `properToReaderSlots` for **English and French**. Read the entire output corpus stored in the JSON artifact (Latin and selected vernacular; 11 named slots per language, 540 reader paragraphs across EN/FR). Also collect print audit, source identity, status and final displayed editorial changes. This is the app's reader-data projection, **not photographed physical Android DOM**. It covers grammatical correctness, punctuation, reading/translation consistency and source/template leaks, not physical device legibility.

### Sample registry

| Date | Source Proper | Celebration |
| --- | --- | --- |
| 2026-01-04 | `Tempora/Nat2-0` | Holy Name of Jesus |
| 2026-01-09 | `Sancti/01-06` | Feria using Epiphany Proper |
| 2026-02-01 | `Tempora/Quadp1-0` | Septuagesima |
| 2026-02-23 | `Tempora/Quad1-1` | Monday, First Week of Lent |
| 2026-03-08 | `Tempora/Quad3-0` | Third Sunday of Lent |
| 2026-03-23 | `Tempora/Quad5-1` | Monday, Passion Week |
| 2026-04-19 | `Tempora/Pasc2-0` | Second Sunday after Easter |
| 2026-04-14 | `Sancti/04-14` | St Justin |
| 2026-05-17 | `Tempora/Pasc6-0` | Sunday after Ascension |
| 2026-05-13 | `Tempora/Pasc5-3` | Vigil of Ascension |
| 2026-06-07 | `Tempora/Pent02-0r` | Second Sunday after Pentecost |
| 2026-06-29 | `Sancti/06-29` | Sts Peter and Paul |
| 2026-07-19 | `Tempora/Pent08-0` | Eighth Sunday after Pentecost |
| 2026-07-10 | `Sancti/07-10` | Seven Holy Brothers and Sts Rufina and Secunda |
| 2026-08-23 | `Tempora/Pent13-0` | Thirteenth Sunday after Pentecost |
| 2026-08-21 | `Sancti/08-21` | St Jane Frances de Chantal |
| 2026-09-06 | `Tempora/Pent15-0` | Fifteenth Sunday after Pentecost |
| 2026-09-28 | `Sancti/09-28` | St Wenceslaus |
| 2026-10-11 | `Tempora/Pent20-0` | Twentieth Sunday after Pentecost |
| 2026-10-02 | `Sancti/10-02` | Holy Guardian Angels |
| 2026-11-22 | `Tempora/Pent24-0` | Last Sunday after Pentecost |
| 2026-11-10 | `Sancti/11-10` | St Andrew Avellino |
| 2026-12-27 | `Tempora/Nat1-0` | Sunday within Christmas Octave |
| 2026-12-11 | `Sancti/12-11` | St Damasus I |

## Data integrity observations
- **24/24** sampled Propers yield ready reader slots in both EN/FR.
- **13/24** satisfy the separate printable Proper gate. Six others are deliberately stopped by `Special structure requires the native Missal reader`; five by `Form-specific commemoration rules not yet source-certified`. These are **not grammatical findings**, and not evidence that the native reader text is missing.
- First mechanical sweep raised **34** punctuation flags. **33 were French punctuation whitespace false positives**; the actual English hit is `Gentiles ,`. The refined second-run scanner now reports **nine flagged paragraphs**: one definite English punctuation issue and eight paragraphs with missing French guillemet spacing. Independent full-corpus count finds **39 French closing guillemets without interior spacing** across eight Propers; classify as editorial typography, not automatically 39 grammatical mistakes. Latest successful second run: https://github.com/Fulcanelli13/ad-orientem/actions/runs/39160141300
- This is a **first-pass positive-findings register**. Neither the automated scanner nor targeted editorial reading establishes that all other words in these 24 long Proper/Scripture passages are free of error. No population-wide error-rate inference is authorised.

## Directly observed defects — exact reader output

| ID | Date / source slot | Lang | Observed excerpt | Proposed disposition |
| --- | --- | --- | --- | --- |
| P1-01 | 2026-03-23 Epistle | FR | `Dieu vit leurs œuvres, II vit qu’ils étalent revenus` | Two separate probable transcription/OCR errors: `Il vit qu’ils étaient revenus`. **Externally verified** against Catholic Vigouroux Jonah 3:10 |
| P1-02 | 2026-03-23 Gospel | EN | `among the Gentiles , and teach` | Remove space before comma; definite presentation/source punctuation |
| P1-03 | 2026-06-07 Epistle | FR | `n'aimons pas avec de parole et de langue` | Malformed preposition; collate with the Catholic Crampon 1 John 3:18 (`n'aimons pas de parole et de langue`) before editing |
| P1-04 | 2026-08-21 Gospel | FR | `tout scribe inité au Royaume` | `initié`; spelling/transcription defect |
| P1-05 | 2026-09-06 Collect | FR | `qu'elle soit toujour guidée` | `toujours`; spelling defect |
| P1-06 | 2026-10-11 Postcommunion | FR | `faite que nous obéissions` | `faites`; imperative of *faire* |
| P1-07 | 2026-10-02 Postcommunion | FR | `Nous avons reçus, Seigneur, les divins mystères` | `reçu`; no preceding direct object; past participle error |
| P1-08 | 2026-12-27 Collect | FR | `votre Fils bient-aimé` | `bien-aimé`; malformed compound |
| P1-09 | 2026-12-11 Collect | EN/FR | `blessed Damasum`, `bienheureux Damasum` | Latin accusative `Damasum` leaked untranslated into English and French; use properly reviewed vernacular name, **without modifying source Latin by guesswork** |
| P1-10 | 2026-12-11 Collect | LA/EN/FR | `Damasum Mártyrem` / `thy Martyr` / `votre Martyr` | **Liturgical source-identity discrepancy**, more serious than grammar: 1962 calendar identifies St Damasus I as **Pope and Confessor**. The same `Martyrem` is in the external Missale Meum Proper. Do **not** resolve from the calendar alone; verify printed 1962 Missal as independent primary witness before source change. |

These ten **issue groups** affect at least eight distinct sampled Propers; `P1-01` contains two probable errors and `P1-09` manifests in two languages. They are *not* ten identical error locations or an estimated population error rate.

### Independent evidence
- Vigouroux, Jonah 3:10: https://scriptura.fsspx.org/vigouroux/jon/3
- Crampon 1923, 1 John 3:18 (compare editions): https://www.bibliatodo.com/fr/bible/traduction-francaise-de-modele/1jean-3-18
- 1962 calendar Damasus classification: https://gcatholic.org/calendar/2026/Extraordinary-en
- External source containing `Damasum Mártyrem`: https://www.missalemeum.com/en/calendar/2060-12-11

## Classification and next step (do not repair in this PR)
1. **Direct grammar/transcription:** P1-01 through P1-09. Confirm source origin and independently witness suggested wording; prefer minimal exact-string changes over broad paraphrase.
2. **Source conflict:** P1-10; high priority original-Missal collation and saint/template-name provenance.
3. **Typographic consistency:** French closing guillemets (39 instances/8 Propers); review in batch under explicit French typographic convention without treating correctly spaced French question marks as errors.
4. **Reader/print availability:** 11 print holds separate from grammar.
5. **Source-to-display root-cause work is Phase 2.** Record the exact owning layer (`EXTERNAL_WITNESS`, `HOST_NORMALIZER`, `READER_PROJECTION`, `PRESENTATION`) before committing changes.
6. **Final manual linguistic certification remains open** for the long reading passages; first-pass findings are reproducible from the retained JSON.

No source, Calendar, rite or production Mass text modified in this audit.


## Second-pass grammatical adjudication — 18 specific findings / 11 Propers

Added a **machine-readable exact-source register**: `data/research/mass-proper-grammar-phase1-adjudications-20261018.v1.json`. The pre-existing P1-01–P1-10 IDs remain stable. The second pass adds the following additional defects in the *actual sampled reader texts* (not synthetic examples):

| ID | Sample / exact slot | Language | Defective reader wording | Adjudication |
| --- | --- | --- | --- | --- |
| P1-11 | 9 Jan, Epiphany Secret | FR | `Jetez une regard bienveillant` | `un regard`. Appears in final print as well; corroborating FSSPX French proper uses the correct masculine article. |
| P1-12 | 23 Feb, St Peter Damian commemoration Secret | EN | `holy Petri thy Bishop` | Latin genitive noun form leaked into vernacular: `holy Peter thy Bishop`. Exact defective English survives on Missale Meum. |
| P1-13 | 14 Apr, St Justin Secret | EN | `these our offerings thy wondrous mystery of which thy holy martyr Justin ... defended` | Syntactically malformed translation of Latin `quorum mirabile mysterium`. Provisional minimal `these our offerings, whose wondrous mystery thy holy martyr Justin ... defended`; verify against original source before publication. |
| P1-14 | 14 Apr, martyr commemoration Secret | EN | `may losen the bonds of our sins` | `loosen` (transcription typo); identical defective wording exists in Missale Meum. |
| P1-15 | 14 Apr, martyr commemoration Secret | EN | `the gist of thy mercy` | `the gifts of thy mercy`; the Latin is `dona`, and the existing FR has `les dons de votre miséricorde`. Same error in Missale Meum. |
| P1-16 | 14 Apr, martyr commemoration Postcommunion | FR | `qu’en celebrant cette fête` | Missing accent: `célébrant`. |
| P1-17 | 14 Apr, martyr commemoration Postcommunion | EN | `thy  saving grace` | Duplicate space; typographic only. |
| P1-18 | 23 Feb, Gospel, Matt 25:44 | EN | `Then they also will and say` | Spurious conjunction: `Then they also will say`; defective words also appear in the upstream Missale Meum passage. |

**Reconciled register totals:** **18 specific issue groups**, affecting **11 / 24** distinct sampled source Propers. **16** of these are grammatical, orthographic or translation-text defects; **1** is a separate Latin source-identity contradiction (P1-10); **1** is a simple typographic double-space. The 39 French guillemet-spacing occurrences across eight Propers are tracked **separately as a batch**, not miscounted as 39 grammatical errors. The 18-group count deliberately treats the two probable OCR corruptions in P1-01 as one localized sentence defect, while P1-14 and P1-15 are distinct word corruptions with different corrections.

### Source origin assessment

- **10/18** defective strings are **reproduced in existing third-party Proper publications**; this confirms that they were not invented by the final Ad Orientem card renderer, but **does not** establish the direction of copying, the exact pinned source revision, or independence of the third-party witness.
- **2/18** are present in both native-reader and printable-Proper representations, so the defect is already present at or before their shared source/normalization layer; distinguishing remote source from host-normalizer still requires the pinned source byte comparison.
- **5/18** have a verified linguistic defect but no established upstream byte match; source/host vs projection remains to be determined.
- **1/18 — St Damasus I, 11 December —** is **directly contradicted by a reproduction of the Latin 1962 Roman Missal**: the sample and Missale Meum describe Damasus as `Mártyrem`, but the 1962 calendar calls him `Papa et Confessor` and the contemporary proper's Collect has `per beatum Damasum ... Summum Pontificem`, **without** `Mártyrem`. The preceding 10 December St Melchiades Proper *does* say `Martyrem tuum atque Summum Pontificem`, suggesting a source-template contamination; this is an inference requiring further provenance tracing, not proof of how the corruption occurred. **Do not silently patch the Latin in the grammar-audit PR.**

These are **confirmed positive findings in a reproducible stratified random sample**, **not** a measured complete grammar-error prevalence. One sampled Proper with an issue does not tell us what fraction of all its words or fields are wrong.

### Source witnesses used for adjudication

- Independent printed-1962 confirmation of St Damasus **non-martyr** Collect: [11 Dec printed 1962 missal-aligned sheet](https://extraordinaryform.org/masses/1211StDamasusPope2ndM20.pdf), with the [1962 Latin Missal OCR search witness](https://isidore.co/misc/Res%20pro%20Deo/ITOPL_OCR-layer-only/11a.%20Liturgy/Missale%20Romanum%201962_OCR.pdf).
- Comparison for Epiphany Secret: [FSSPX day 9 Jan](https://ordo.fsspx.org/day/2026-01-09).
- Defective upstream exact strings for the Peter Damian English Secret and Gospel: [Missale Meum 23 Feb](https://www.missalemeum.com/en/widgets/propers/2026-02-23?theme=light).
- Defective source witness for St Justin / martyrs' Secrets: [Missale Meum 14 Apr](https://www.missalemeum.com/en/calendar/2026-04-14).
- French Epistle of Jonah 3:10: [independent Vigouroux text](https://scriptura.fsspx.org/vigouroux/jon/3) gives `il vit qu’ils étaient revenus`; [third-party Proper text](https://tridentine.org/missa/2026-03-23?lang=Francais) repeats the app's `II ... étalent` corruption.
- Source-reproduced 2 Oct Angel guardians postcommunion error: [ICRSP original-day French Proper](https://icrspfrance.fr/textes-de-la-messe.php?d=2026-10-02).
- 11 Oct Postcommunion imperative error repeated in [Laudemus](https://www.laudemus.org/?date=2026-10-11&mass_type=low&v=1029).

### Gate and next actions

1. **Phase 1**: Final full-sample expert/manual examination remains open for 540 paragraphs, particularly extended Epistles and Gospels. Additional actual errors may be discovered. The adjudications above are independently checkable positive findings.
2. **Origin trace**: Compare the exact pinned upstream source files/revisions with host-resolved `lat/en/fr` and final reader slot data; assign origin `SOURCE_IMPORT`, `HOST_NORMALIZER`, or `READER_PROJECTION` only with that evidence.
3. **Phase 2**: Only after collating the complete review should each accepted minimal correction be promoted through a separate source-owned, dated, reversible change with printed Proper and reader parity checks.
4. **No production text was changed.** All eighteen candidate issues remain publicly visible until a separate fix is reviewed and deployed.
