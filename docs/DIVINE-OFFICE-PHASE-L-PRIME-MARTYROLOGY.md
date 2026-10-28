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
