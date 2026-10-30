# Divine Office Phase K — All Souls French source provenance and printed-text review

Date: 29 October 2026. Research-only, draft [PR #1860](https://github.com/Fulcanelli13/ad-orientem/pull/1860). **Zero public Office routes, zero liturgical texts certified, zero paid services.** Keep both LIVE and MISSAL fail-closed until proper-text checks are finished.

## Evidence completed

[CI run #40779270634](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40779270634): **3/3 jobs successful**, all 10 Chromium device-size tests passed with **0 horizontal overflow**; the new Phase K unit tests and 11-cell source provenance review passed.

The fixed experimental source remains the pinned [Divinum Officium revision `126a07f91ede04664108abb6fb20ace3f4de14b9`](https://github.com/DivinumOfficium/divinum-officium/tree/126a07f91ede04664108abb6fb20ace3f4de14b9), with **exactly 15 typographic `&special` delimiters changed** in a temporary CI working tree. The baseline generated 11 French missing markers; the reversible candidate generated **zero**; Latin and English were unchanged; none of the 11 French source cells disappeared. The 1934 and 1960 witnesses mentioned below were **not** integrated into this generated output.

The provenance tool `scripts/office/audit-recovered-french-allsouls.mjs` checks every recovered cell's source ID, index correspondence, upstream `&special` section, prayer role, SHA-256 hashes, non-placeholder status and the Latin/English source anchor. This is a **source-integrity** audit, not a full translation audit.

| Recovered French cell | Hour | Upstream section | Source role | Source integrity | Printed/translation approval |
|---|---|---|---|---|---|
| `Prima4` | Prime | `Oratio mortuorum2` | Prayer | Resolved | PENDING |
| `Prima5` | Prime | `#Martyrologium` | Martyrology | Resolved | PENDING |
| `Prima6` | Prime | `Conclusio` | Conclusion | Resolved | PENDING |
| `Tertia4` | Terce | `Oratio mortuorum` | Prayer | Resolved | PENDING |
| `Tertia5` | Terce | `Conclusio` | Conclusion | Resolved | PENDING |
| `Sexta4` | Sext | `Oratio mortuorum` | Prayer | Resolved | PENDING |
| `Sexta5` | Sext | `Conclusio` | Conclusion | Resolved | PENDING |
| `Nona4` | None | `Oratio mortuorum` | Prayer | Resolved | PENDING |
| `Nona5` | None | `Conclusio` | Conclusion | Resolved | PENDING |
| `Completorium6` | Compline | `Oratio mortuorum1` | Prayer | Resolved | PENDING |
| `Completorium7` | Compline | `Conclusio` | Conclusion | Resolved | PENDING |

**Additional caution:** `Prima5` begins `Martyrologe {anticipé}` and each conclusion begins `Conclusio specialis` even after the missing-text markers vanish. The parser's absence of `is missing` is NOT proof that every exceptional hour contains a complete, acceptable French liturgical text. No full-cell exact Latin/English duplication above 40 normalized characters was found; shorter Latin fragments or mixed-language texts have **not** been excluded by that check.

### New high-priority semantic review: Prime, after the Martyrology

The [pinned Latin All Souls source](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Latin/Sancti/11-02.txt) has a `Deus, véniæ largítor` petition for **`animas omnium fidelium`**—all the faithful departed. The [pinned French source](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Francais/Sancti/11-02.txt) likewise says **`âmes de tous les fidèles`**. The [pinned English source](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/English/Sancti/11-02.txt), however, says **`brethren of our congregation, kinsfolk, and benefactors`**, a narrower group. The Phase K check flagged `scopeMismatchCandidate:true` in live CI.

This wording is attested as a **different traditional usage**, not an arbitrary phrase: e.g., the Augustinian *Analecta Ordinis*, 1965, `Oratio Serotina`, printed p. 29, [scan](https://oadnet.org/wp-content/uploads/2021/04/Analecta-Ordinis-1965-vol-2.pdf#page=28), includes a congregation/relatives/benefactors variant. **It does NOT prove that the English variant belongs in the 2 November 1960 Roman Office**. Do not silently change the English, and do not promote it. Obtain the exact printed Roman proper and classify its recipient group.

### Source rights and usable historical witnesses

- The pinned Divinum Officium repository includes [`LICENSE` (MIT)](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/LICENSE), with a requirement to retain the copyright and licence notice in copies/substantial portions. A project representative said in [GitHub Discussion #5071 (5 March 2026)](https://github.com/DivinumOfficium/divinum-officium/discussions/5071) that **all liturgical texts are open source and no further permission is required**. This supports a zero-fee path to redistribute the project's source-derived material with appropriate notices, but is not a guarantee of independent printed-text accuracy.
- **Independent textual witness candidate:** *Le Bréviaire Romain*, Latin–French, Labergerie, 1934, [Bibliothèque Saint Libère scan catalogue](https://www.liberius.net/livre.php?id_livre=1439), independently bibliographically confirmed by [Séminaire de Tournai](https://bibliotheque.seminaire-tournai.be/index.php?lvl=notice_display&id=62625). This printed book **predates the 1960 rubrics** and has not been inspected page-by-page; use only for eventual French wording comparison. Do not republish it wholesale or treat its sequence as the 1960 Office.
- **Normative 1960 sequence:** [ICRSP France 1960 Breviary rubrics](https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien), especially §§180–181, 185, 190, 240, 243, 248; and the 1961 Roman Breviary's general Latin rubrics, previously recorded in Phase H. These establish *what to check*, but not which translated words are correct in each proper cell.

### Remaining gates

1. Check Latin/French/English of the five recovered prayers, the five conclusions, and the anticipated Martyrology against an **independently examined** 1960-compatible printed Roman Office. Distinguish literal source text, omitted sections, and rubric explanations.
2. Resolve the English Prime scope mismatch separately; confirm whether the prayer is the universal All Souls collect or a congregation-specific alternative.
3. Certify the text version, language, date/hour, sequence, and redistribution attribution **per source cell**, with a reviewer/date, not a generic "source structurally aligned" flag.
4. Only then consider promoting certified files to the existing Calendar/Pray integration. Release must remain unavailable for all 1960 Office dates/hours without comprehensive verification. Sunday Sung Vespers has its **own** native-score/rights gate and no external links.

**Machine state remains:** `independentlyCheckedPrintedTextCells:0`; `verifiedTranslationCells:0`; `textSuitableForPublicDeployment:false`; `published:0`.
