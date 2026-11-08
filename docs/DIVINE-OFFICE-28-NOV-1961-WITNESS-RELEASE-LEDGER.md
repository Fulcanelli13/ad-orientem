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
