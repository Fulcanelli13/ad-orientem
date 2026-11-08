# Compline: printed-witness release ledger — 28 November 2026

**Status: source-backed PRIVATE READING, not yet a public Latin Hour.**
This ledger distinguishes original source extraction, 1961 printed-Ordinary
correction, the 1962 Latin psalter, and what remains uncertified. No public
publication flag may be set by this document alone.

## Exact 28 November 2026 Office

- Universal calendar: First Vespers of Advent I on Saturday evening,
  **Saturday Compline**, not Sunday Compline. 1961 Roman Breviary rubrics
  §166(b): [printed page 62](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf#page=63).
- Printed ordinary: §§54–67 on **printed pp. 132–141**, beginning with
  `Iube, Dómine, benedícere`, 1 Peter 5:8–9 and the Confiteor; three
  appointed Saturday psalms; `Te lucis`, `Tu autem in nobis`, the
  `In manus tuas` responsory, `Salva nos` and Nunc dimittis;
  `Visita, quæsumus`, `Benedícat et custódiat`,
  Advent `Alma Redemptoris Mater`, `Grátiam tuam`,
  and `Divínum auxílium`.
  [First page of the printed Ordinary](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf#page=133).
- Printed §64–65 (pp. 138–139): after the second `Salva nos`, go
  **directly to the dialogue, Oremus and Visita**. No `Kyrie` and no
  second `Pater noster`. Corrected in
  `src/office/compline-recitation-projection.js`, which leaves the
  original 42 source events untouched but renders **40** reading events.
- Printed §54 and §66: both blessings require their `R. Amen`. These
  are recovered from the pinned original-language Amen response, and the
  source ID remains recorded; never generate a liturgical response.
- Printed §147 / Ordinary §56: final prayer of the day means examination
  of conscience **in place of** the introductory Pater. Alternative
  recitation preserves that *introductory* Pater; no second Pater follows
  Nunc dimittis in either context.
- Printed §67 and seasonal antiphons (pp. 140–141): the Saturday before
  Advent I is the beginning of `Alma Redemptoris Mater`, with the
  pre-24 December verse and `Grátiam tuam` collect.

## Independent Psalterium witness (not the original 1961 typesetting)

[Consociatio Christi Regis, *Psalterium Romanum iuxta ritum 1962*
(2023), pp. 73–74](https://ccregis.org/psalter_lt.pdf) identifies
Saturday Compline with **Psalm 87** and **Psalm 102** (the latter
divided into 1–12 and 13–22 in the appointed source pattern).
Its preface states the booklet is drawn from an FSSP-printed Roman
Breviary and that the psalm texts were taken from the Clementine
Vulgate. The original source reader uses exactly the pinned
Divinum Officium Latin `Psalm87` and `Psalm102` leaves and maintains
their verse subdivisions. This independent concordance covers the
**appointment and incipits**; it is not yet a line-by-line photographic
collation of a 1961 printed psalter leaf.

## Release gating, not inferred from a green CI badge

- `1961_ordinary_sequence_reviewed=true` **for the private
  source projection**, not the original 42-event extraction.
- `saturday_psalm_appointment_reviewed=true` for 28 Nov 2026.
- `1961_psalter_verbatim_collated=false` until the complete printed
  Psalm 87 and Psalm 102 texts and their divisions are checked.
- `local_or_proper_office_resolved=false` outside the explicit
  universal calendar; no calendar transposition.
- `latin_public_release_certified=false`,
  `translationApproved=false`, `rightsApproved=false`,
  `published=false`.

**Implementation result:** all 8 explicit dates now undergo regression
checks for the 1961 printed-order transformation (both recitation contexts,
no post-canticle Kyrie/Pater, both blessing Amens, 40 reading events).
The source and printed witnesses are distinct records. No new runtime
provider or commercial licence was added.


## 8 November follow-up: verse/stich source fidelity and reading labels

Comparison of the pinned Saturday Psalm 87 / Psalm 102 Latin rows with the
2023 printed *Psalterium Romanum iuxta ritum 1962* (Saturday Compline,
pp. 177–179), plus independent Clementine Vulgate biblical verse references,
requires distinguishing recitation stichs from Bible verse numbering.

- Biblical Psalm 87:1 is the superscription; "Domine, Deus salutis meae"
  correctly begins at Psalm 87:2. A stich ordinal is not a Bible citation.
- Psalm 87 contains 19 recitation stichs, of which some cross the biblical
  boundaries 87:5–6 and 87:9–10.
- Psalm 102 contains 22 recitation stichs, divided as 1–12 / 13–22. Stiches
  cross the boundaries 102:13–14, 14–15, and 17–18. The visible source
  number jump does not mean "Homo, sicut faenum" or another word is absent.
- The new private reading display projection strips only source numeric
  prefixes and shows conservative biblical reference or span labels. Every
  original source line is retained separately, with its original source
  identity and source verse number. A changed sequence or language row
  identity fails closed, never silently renumbered or reconstructed.
- For 28 November and 5 December, strict tests check all 19+22 display
  frames, the crossing boundaries, source-word preservation and
  source-numbering drift; other dates retain the existing reviewed source.

Witnesses: https://ccregis.org/psalter_lt.pdf (2023 typesetting, pp. 177–179),
https://www.ccel.org/ccel/b/bible/vul/cache/vul.pdf (Clementine Psalm 87),
https://www.wilbourhall.org/pdfs/vulgate.pdf (Clementine Psalm 102).

The accessible 1961 Mame scan holds the Ordinary only (145 PDF pages)
and does not contain the actual Saturday psalter leaves. This work improves
source and citation fidelity, but does not establish full verbatim collation
against a complete 1961 printed Breviary. Publication remains withheld:
1961_psalter_verbatim_collated=false, latin_public_release_certified=false,
published=false.

## Printed Latin Saturday Psalter: second independent witness (8 Nov 2026)

A substantive new source was found: David Siefker (ed.), *Diurnale
Romanum* (2008), laid out according to the John XXIII 1961 Roman Office,
printed **Saturday Compline pp. 349–352**. This is a complete, readable
Latin-English edition and includes the antiphon *Intret oratio mea*,
**Psalmus 87** (printed pp. 349–350), **Psalmus 102 i** (pp. 350–351),
**Psalmus 102 ii** (pp. 351–352), and the repeated antiphon. Its
printed layout directly corroborates the Saturday appointment and the
1–12 / 13–22 division.

Source: https://www.scribd.com/document/761102039/Breviarium-romanum-Breviario-romano-1961-1962
(text of the printed book at "Sábbato ad Completórium"; a modern 2008
typesetting, **not an original 1961 Mame psalter leaf**).

All **41 recitation stich incipits** were checked against this independent
printed presentation, then placed in the private witness register
`data/office/research/compline-saturday-printed-diurnale-2008-row-witness.json`.
The required CI test verifies those 41 original Latin source rows on
each subsequent change; the register stays excluded from the curated
GitHub Pages release. This protects the actual words against accidental
source swaps without publishing review data.

The following spelling distinctions require explicit source accounting:
- Printed *fœnum* versus pinned *fænum* in Psalm 102's second half.
  This is an orthographic lexical variant, not a missing sentence.
- Printed *Angeli* versus pinned *Ángeli*, an accent distinction.

**Certification boundary.** The two modern independent print witnesses
(2008 complete Diurnale and 2023 1962-pattern Psalterium) substantively
strengthen Latin Saturday Psalm appointment and textual fidelity.
However a 41-stich **incipit** regression is not a substitute for
byte-for-byte collation of every line of the original 1961 printed
Psalterium. Thus the exact-original-edition flag remains false;
no rights or publication flag is promoted. This also keeps the
currently staged native public reader's release gate closed.

The next meaningful step is a normalized **full-word** printed collation
that documents every substantive discrepancy, followed by independent
review of the complete dated Hour and a narrow publication decision.


## 8 November — full-word printed Saturday Psalter reconciliation

The previous 41-stich **incipit** register has been superseded as a
completeness test by an independently reviewed **full-line** Latin
witness: `data/office/research/compline-saturday-diurnale-2008-full-line-witness.json`.
This transcribes all 19 recitation lines of Psalm 87 and all 22 lines of
Psalm 102 (segments 1–12 / 13–22), from the accessible text of the
2008 Siefker *Diurnale Romanum*, Saturday Compline, printed pp. 349–352.
Witness: https://www.scribd.com/document/761102039/Breviarium-romanum-Breviario-romano-1961-1962

The complete source-vs-print comparison checks **473 Latin word tokens**
across all **41/41 recitation stichs**, not just the first few words.
**Zero substantive word or ordering discrepancies** remain after
documented Latin orthographic normalization. Exactly **two non-identical
literal rows** remain:

- Psalm 102, recitation row 14: print `fœnum` versus pinned `fænum`.
- Psalm 102, recitation row 20: print `Angeli` versus pinned `Ángeli`.

Required CI test:
`tests/divine-office-saturday-printed-full-word.mjs`. It checks full
word-order equality, expects exactly those two literal differences, and
explicitly detects omissions **inside** verses. Its token threshold is
the actual 473, not the erroneous 540 initially used in a test; no
Latin prayer text was changed to fix that test. The register remains
outside curated GitHub Pages.

### Rights and specificity

At the exact pinned Divinum Officium source commit
`126a07f91ede04664108abb6fb20ace3f4de14b9`, the GitHub `LICENSE`
is MIT (copyright 2026 Divinum Officium); its original credits describe
the Latin Vulgate as public-domain material. The maintainers also
confirmed general liturgical text reuse on 5 March 2026, discussion
#5071. We now ship the original full MIT licence and pinned attribution
as `src/office/LICENSE-DIVINUM-OFFICIUM-MIT.txt`, linked directly from
the staged Latin reader. None of this grants public release of
French Propers or English hymn translations.

The **2008 printed edition** is a complete, independent
1961-pattern Latin textual witness but **not a facsimile of the 1961
Mame psalter**. Consequently keep
`psalter1961VerbatimCollated=false`. Also leave the separate
**complete dated Hour / release approval** gates closed until explicitly
resolved; green source and UI CI alone do not constitute certification.

## Independent 2023 full-word Latin concordance — 8 November 2026

The complete source-text word sequences for Saturday Psalm 87 (**223 words**)
and Psalm 102 (**250 words**) have been compared with the Latin columns
of the independently published *Psalterium Romanum iuxta ritum 1962*
(Consociatio Christi Regis, 2023), Saturday Compline, printed pp. **177–179**.

**473 words agree in order after typographic normalization**, allowing
exactly three documented spelling variants: `sepulchris`/`sepulcris`
and `sepulchro`/`sepulcro` (Psalm 87), and `fœnum`/`fænum`
(Psalm 102). Accent marks, ligatures and punctuation are not used to
hide added or missing words. The full transcribed print witness is
preserved in
`data/office/research/compline-saturday-printed-2023-fullword-witness.v1.json`;
`tests/divine-office-saturday-fullword-2023-witness.mjs` enforces all
473 tokens, the exact allowed variants and unchanged public withholding
flags in the Office CI. The printed page's physical text wrapping is
**not** assumed to match the source's 19/22 recitation stichs.

Printed witness: https://ccregis.org/psalter_lt-en.pdf (pp. 177–179).
This is independent of the already tested 2008 *Diurnale* full-word
comparison, but **neither edition is an original 1961 Mame Psalterium
leaf**. The exact-original 1961 verbatim, entire-Hour, rights and
public-release gates therefore remain **FALSE**. No public Office
prayer text is enabled.
