# Divine Office Phase L — All Souls Prime critical text review

Date: 29 October 2026. Original draft [PR #1860](https://github.com/Fulcanelli13/ad-orientem/pull/1860). **Review scope is deliberately finite: Prima4, Prima5, Prima6, with emphasis on the Martyrology and the prayer immediately after it.** No publication; the source experiment remains separate from the public Calendar and Pray reader.

## Findings

The pinned upstream Divinum Officium revision is `126a07f91ede04664108abb6fb20ace3f4de14b9`. The repaired 11 French missing-cell markers are no longer present, but this proves *syntax restoration*, not liturgical authenticity.

### P0 — Prime after-Martyrology petition names different beneficiaries

[Latin 11-02.txt, Special Prima](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Latin/Sancti/11-02.txt) has `Deus, véniæ largítor` praying for **`animas omnium fidelium qui ex hoc saeculo transierunt`** — all the faithful departed.

[French 11-02.txt, Special Prima](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Francais/Sancti/11-02.txt) agrees, with **`âmes de tous les fidèles qui sont sortis de ce monde`**.

[English 11-02.txt, Special Prima](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/English/Sancti/11-02.txt) substitutes **`brethren of our congregation, kinsfolk, and benefactors`**. The latter is attested in a different traditional formula, e.g. the [Office of the Dead on Latin Mass Funeral](https://www.latinmassfuneral.com/office-for-the-dead/), under `Deus veniae largitor` with `nostrae congregationis fratres, propinquos, et benefactores`. That is **not proof** that the congregation-specific formula belongs in this universal 1960 Roman All Souls proper.

This is a **source selection/scope discrepancy**, not a superficial language-style variation. The engine must not mark `Prima5` EN translation approved, and no release gate should change based on absence of `is missing` placeholders.

**Required editorial decision:** obtain the printed 1960-compatible Roman Breviary's Prime prayer for 2 November, transcribe the Latin prayer and its proper English translation with precise edition/page, confirm the intended beneficiaries, and adopt one approved English version with source and rights recorded. Do not silently change Latin or French or import a Mass collect into Office Prime.

### P0 — Martyrology sequence and textual completeness not yet verified

The source-cell `Prima5` also contains the generated **anticipated Martyrology** element. The recovered French begins with `Martyrologe {anticipé}`; a marker is not proof that all the text for the next day, lunar indication, saint entries and the applicable `Variationes` are correct.

Independent historical evidence:

- The **1930 Martyrologium Romanum**, [scan](https://librinostri.catholica.cz/download/MartyrRom1930-r.pdf), printed `Rubricae Martyrologii Romani`, gives the general rule that Prime ordinarily announces the **following day's** martyrology. It also provides a special same-day All Souls commemoration and **`In memoria aeterna`** in place of `Pretiosa`, with an exceptional ending.
- The [Acta Apostolicae Sedis 52 (1960), pp. 722–729, *Variationes in Martyrologio Romano*](https://isidore.co/divinum/www/horas/Help/Rubrics/Variationes%20in%20Martyrologio%20Romano%20%28AAS%2052%2C%201960%29.pdf), updates the Roman Martyrology. Its enumerated late-October/November changes include **31 October** (abolition of the All Saints Vigil elogium) and **8 November** (abolition of the All Saints octave elogium); the list does not supply an independent full 3 November reading. These adjustments MUST be considered alongside the Martyrology book, not treated as a full replacement.
- [1960 Roman Breviary Rubrics §248, ICRSP France](https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien) explicitly makes the All Souls Prime collect an exception to the ordinarily fixed Prime prayer. This is why the prayer immediately after the Martyrology merits its own source-controlled check.

**Required verification:** compare the actual generated 2 November Prime output with an independently examined edition of the Roman Martyrology reflecting 1960–61 modifications, for the *3 November* anticipated reading and any same-day 2 November exception, as well as the `In memoria aeterna` verse and absence of the ordinary chapter ending where applicable. Preserve exact date distinction. Do not substitute a modern Martyrology.

### Status and tooling

Committed:
- `scripts/office/audit-all-souls-prime-critical.mjs` — inspects LA/EN/FR `Prima5` text, role, source IDs, actual recipient wording, source SHA-256, headings, marker status and separate next-day Martyrology review state; never upgrades a source.
- `tests/divine-office-all-souls-prime-critical.mjs` — tests actual source recipient-scope mismatch, missing source cells/semantics and fail-closed review state.
- `.github/workflows/divine-office-phase-b.yml` — regenerates source-backed Offices from the exact pinned source then requires `recipientScope.mismatch` to be explicitly recorded, `martyrology2026_11_03TextVerified=false`, `englishRecipientScopeReviewedAndApproved=false`, `readyForPublicReader=false`, and `published=0`.

**No text has been altered.** A green CI means the discrepancy is *detected and gated*, not that the English prayer, French proper or complete Martyrology has been certified. This review closes when source page and approved correction are both recorded, not on another generic CI run.

Next editorial action: establish the printed Latin Prime `Deus veniae largitor` passage and relevant 3 November Martyrology edition/reading; then correct only the affected, verified source cell(s), retaining original IDs and audit provenance. This must be a specific fix, not another new reader design or external-link experience.


## Follow-up: independently located witnesses and exact publication limits (29 October 2026)

This is a **source audit**, not permission to import an English collect or publish the 3 November Martyrology. Phase N's source-lossless Martyrology/prayer card segmentation is completed and automated-browser-tested in [run #40792894676](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40792894676) (3/3 jobs; 10/10 Chromium cases). Its editorial source gates remain closed.

| Source / witness | Independently established | Not established |
| --- | --- | --- |
| [1960 Roman Breviary General Rubrics §248, ICRSP Latin/French](https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien) | The otherwise fixed Prime and Compline collects have a specific exception for the Office of All Souls. | The *wording* of the exceptional Prime collect or any English translation. |
| [AAS 52 (1960), pp. 722–729, *Variationes in Martyrologio Romano*](https://isidore.co/divinum/www/horas/Help/Rubrics/Variationes%20in%20Martyrologio%20Romano%20%28AAS%2052%2C%201960%29.pdf), **p. 728, items 56–57** | 31 October deletes the All Saints Vigil elogium; 8 November deletes the All Saints octave elogium. There is **no explicitly listed 3 November change** in this decree. This amendment is supplementary, not a complete Martyrology. | That every 3 November 1956 entry or calendar-year lunar announcement has been checked. |
| [1956 *Martyrologium Romanum* Vatican print, bibliographic record](https://books.google.com/books?id=bfwuAAAAYAAJ) (also [Pontifical Gregorian University catalogue](https://oseegenius.unigre.it/pug/resource?cc=bc&uri=156661BIB&v=l)) | Edition and imprint exist: fourth after the typical edition, Vatican Polyglot Press, 1956, 542 pages. This is the correct era of **base book** to collate with 1960 *Variationes*. | The actual **3 November page**, text, entry order or 2026 Luna has not been independently inspected in this review; a bibliographic record is NOT a textual witness. |
| [1930 Martyrology Latin scan](https://librinostri.catholica.cz/download/MartyrRom1930-r.pdf), *Rubricae Martyrologii Romani*; [older Latin November transcription](https://liturgialatina.org/martyrologium/21.htm) | Earlier general rule anticipates the next day in Prime; All Souls is exceptional, and *In memoria aeterna* substitutes for *Pretiosa*. The November transcription is a useful **pre-1956 comparison** only. | The final 1956+1960-adjusted 3 November sequence. |
| František Hrubík, [*Nová úprava Římského breviáře a missálu* (Prague, **1912**), printed p. 53, PDF page 53](https://librinostri.catholica.cz/download/HrubikBreviar-OCR.pdf) | A dated historical commentary states that All Souls Prime reads the Martyrology in choir, then retains *In memoria aeterna* and *Deus veniae largitor* **even outside choir**, and omits the concluding short reading. It corroborates **the distinction behind the Phase N UI**. | This is a **1912**, pre-1960 commentary; do not cite it as a printed 1961 rubric or as proof of the exact 1961 prayer/English wording. |
| [Online PDF labelled *Breviarium Romanum 1961*](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf) | Its 145-page extract establishes a 1961 date and includes preliminary/rubrical matter. | It does **not** contain a independently findable All Souls Prime proper/collect in those pages; it is **not** valid evidence for this particular text. |
| [Office of the Dead collect](https://www.latinmassfuneral.com/office-for-the-dead/); [older congregational prayer translation witness](https://www.latinmassfuneral.com/files/prayers/WithGod.pdf) | The different *Deus, veniae largitor* formula for deceased congregation members, relatives and benefactors is real and has an English translation. | That translating the universal *animas omnium fidelium* Prime adaptation by the **congregation-specific** formula is valid. This is the exact currently quarantined mismatch. |

### Decisions and narrowly scoped next evidence

1. **Keep the 2026-11-02 Prime English preview quarantined.** Neither borrowing the congregational collect nor substituting an All Souls Mass collect meets the exact-text provenance gate.
2. **Keep the 3 November Martyrology unverified.** The 1960 decree contains no explicit 3 November alteration, but absence of an alteration does not establish parity between the prior printed editions and the pinned generated 2026 text. Compare an actual **1956 Vatican edition 3 November page** against the original pinned output, then apply the 1960 changes and check the 2026 Luna and All Souls exception separately.
3. To clear the Prime prayer gate, acquire an independently readable **1961-compatible printed All Souls Prime proper page** with edition/page, collate exact Latin beneficiaries and ending, identify an independently attributable authorized/rights-cleared EN translation of **that adaptation**, and record editorial approval. No translation is authored or silently inserted at this stage.
4. **Do not re-open Phase N navigation engineering** unless a regression is demonstrated; 3/3 jobs and 10/10 browser cases passed at the exact head. Preserve its source-cell IDs, date-specific gating, and post-Martyrology prayer outside-choir behavior.

**Release flags unchanged:** `martyrology2026_11_03TextVerified=false`; `primeCollectComparedAgainstPrintedRomanProper=false`; `englishRecipientScopeReviewedAndApproved=false`; `verifiedOfficeDates=0`; `published=0`. Draft PR #1860 remains unmerged and undeployed.

## 29 October: primary source wording checkpoint (1922 / 1960)

This follow-up closes an **independent historical Latin wording check**, **not** the 1961 edition, 1956 Martyrology, English translation or release gate.

### A. Actual preconciliar printed wording found

- **Rudolf Tomanek, *Kościół cierpiący* (Cieszyn, 1922), printed p. 154**, Latin/Polish section *Officium Defunctorum — Godzinki za dusze*, digitized by the Silesian Digital Library: https://sbc.org.pl/Content/323045/Publikacja-KC-8072.pdf .
- The searchable page contains the sequence **`In memoria aeterna erunt justi` → `Deus, veniae largitor`**, whose petition explicitly reads **`ut animas omnium fidelium, qui ex hoc saeculo transierunt`**. Its facing Polish translation likewise says *dusze wszystkich wiernych*. A separate academic publication confirms the book's **1922** date: https://bibliotekanauki.pl/articles/673281.pdf .
- This is independent evidence that the **universal-beneficiaries variant historically existed in an Office-for-the-Dead context**, beyond the pinned Divinum Officium source. It is **not** by itself a 1960/61 printed Roman Breviary collation; nor does it demonstrate an English wording.
- The digital library's PDF text was indexed, but the full scanned page could not be directly loaded in this research environment (timeout). Record as **searchable printed witness; page image inspection pending**. Do not misstate that the image was visually collated.

### B. Exact primary 1960 amendments and rubrics page checked

- *Acta Apostolicae Sedis* **52 (1960), p. 728**, direct page-image examination: https://isidore.co/divinum/www/horas/Help/Rubrics/Variationes%20in%20Martyrologio%20Romano%20%28AAS%2052%2C%201960%29.pdf . Item **56** deletes the All Saints Vigil elogium on **31 October**; item **57** deletes the All Saints octave elogium on **8 November**. There is **no 3 November-specific item** between these entries. This does **not** establish the full 3 November list or Luna.
- Patrick L. Murphy, ed., *The New Rubrics of the Roman Breviary and Missal: Translation and Commentary* (**1960**, Catholic Press Newspaper Co., Sydney), **printed p. 46**, PDF **page 31 (index 30)**, has directly examined §**248**: Prime and Compline's prayer is ordinarily fixed **except in the Office of All Souls**, and Prime also in the Sacred Triduum. https://cdn.restorethe54.com/media/pdf/the-new-rubrics-of-the-roman-missal-and-breviary-1960.pdf . This proves the **exception**, **not the wording** of the adapted collect.

### C. Where this leaves the 1956 Martyrology

- An independently indexed 1960-version **November 3** summary cites **2017 Justitias Books pp. 270–271** (Latin reconstruction of 1956+1960) and **1962 J. B. O'Connell / Newman Press p. 240** (English). The edition/page data is a **secondary bibliography**, not a directly inspected primary page: https://en.wikipedia.org/wiki/November_3_in_the_Roman_Martyrology .
- Justitias itself states its edition incorporates the 1956 print and the 1960 changes, but its public **sample pages are January only**, not 3 November: https://justitiasbooks.com/martyrologium-romanum/ .
- Thus, **1956 actual November 3 entries and 2026 ecclesiastical Luna remain unverified**. A Google Books snippet, library catalogue, or Wikipedia list is not adequate certification of the complete Martyrology, rubrical sequence or lunar announcement.

### Freeze and explicit stopping rule

Do not generate another research wave or relabel the engineering phase for this case. **Accept** the universal Latin phrase as historically *attested in a 1922 Office-of-the-Dead witness*; **reject** the available congregation-specific English as a translation of that phrase. **Wait for precise page evidence**, namely (a) actual 1956/1960-adjusted **3 November page** and accurate 2026 Luna, and (b) actual printed **1961-compatible All Souls Prime proper** plus a documented English translation of exactly the universal variant. Until then, no source rewrite or public promotion.

Current blocked states remain: `primeCollectComparedAgainstPrintedRomanProper=false`, `martyrology2026_11_03TextVerified=false`, `englishRecipientScopeReviewedAndApproved=false`, `published=0`.
