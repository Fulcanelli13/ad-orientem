# B10 — Blessed Be God 1925 offering certified; historical Morning/Evening choices

**27 October 2026 · Draft PR #1785 · research/editorial recommendation only, not production.**

## Closed release gate: 1925 Morning Offering

The first-edition 1925 copy of Charles J. Callan and John A. McHugh, *Blessed Be God* (New York: P. J. Kenedy & Sons) has been checked directly against its original printed image.

- [Printed p. 1 / scan image 47](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/47): Morning Prayers begins.
- [Printed p. 2 / scan image 48](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/48): **complete Morning Offering** ends the Morning Prayers.
- [Printed p. 3 / scan image 49](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/49): **Prayers to be Said Every Day** begins as a new section (Lord's Prayer, Angelical Salutation, Apostles' Creed).

**Correction:** B01 had wrongly described Wikisource as truncating after the Morning Offering. That is false; the historical Morning Prayers chapter indeed ends there. The B01 book/source metadata and documentation are corrected. Page 3 material can be added as shared common prayers, not falsely attributed as part of the original two-page Morning sequence.

The exact 1925 Morning Offering now has a complete transcription, original page link and clear boundaries in `data/pray/daily-prayer-morning-offering-choices.b10.json`. The paragraph specifically includes reparation for 'my sins', intentions of all Associates and the Apostleship intention, which distinguish it from the 1911 Lasance texts.

## Offering choices — one prayer purpose, historically distinct words

The *Morning Offering* candidate matrix is editorially ordered for simple use, without representing these as an approved or published default.

| Proposed presentation | Witness | Distinctive content | Source status |
|---|---|---|---|
| **Suggested first-time default** | *Blessed Be God*, 1925, p.2 | Through Immaculate Heart, universal Mass, reparation for personal sins, Apostleship intention | Full original print checked B10 |
| Alternative: union with the Sacred Heart | Lasance, *With God*, 1911, p.127, **first** formula | Thanksgiving, reparation, monthly Apostleship intention | Original print checked B09 |
| Alternative: through Mary | Lasance, *With God*, 1911, p.127, **second** formula | Universal Mass and the Pope-recommended intention, not 1925's same wording | Original print checked B09 |
| Alternative: Eucharistic Sacred Heart | *Catholic's Pocket Prayer-Book*, 1899, pp.8–9 | Offers thoughts, desires, words and actions united with Jesus's Eucharistic praise | Print checked B08 |
| *More / historical*: Good Intention | Moran, 1883, p.2 | Shorter offering of the day, united with Jesus and Mary; historical indulgence intention embedded | Print checked B07; default discouraged pending suitability |
| **French original, not translated Apostleship** | French devotional prayers in 1905 edition, p.2* | One joined Thanksgiving + Offering of the day | Print checked B07; once per sequence |

**UI discipline:** recommend showing one selected prayer at recitation time; a `Change formulation` affordance opens at most 2–3 leading alternatives with a further `More historical forms` section. Attribution and relevant differences must be visible; exact text displayed fully, no generative reconstruction. The same historical formula witnessed in more than one book does not demand separate source-brand tabs. The French compound prayer is never duplicated as two consecutive cards.

## Full Morning/Evening editorial review list: gate by devotional stage

The already approved architecture supports conceptual stages rather than fixed 48-card or a new prayer reader; the current **11 Morning / 13 Evening** existing guided cards remain live until migration is approved.

| Daypart/stage | Strongest English default *candidate* | Historical French original candidate | Next gate |
|---|---|---|---|
| Morning presence | Baltimore Trinitarian adoration or Blessed Be God recollection | 1905 French opening adoration source | Complete form print checks, optional brief invocation |
| Morning thanksgiving | **Moran 1883 Thanksgiving (B07 print checked)** | 1905 French combined Thanksgiving/Offering (B07 print checked) | Decide one combined vs separate stage per source form |
| Morning offering | **Blessed Be God 1925 (B10 print checked)** | 1905 combined Thanksgiving/Offering (B07 print checked) | Source-specific user approval + rights checks |
| Morning Faith/Hope/Charity | Short Faith Pocket 1899 (B08 print checked); Hope/Charity still choice open | All three original 1905 Acts (B07 print checked) | English Hope/Charity full print checks and formulation dedup |
| Morning petitions/resolution | Moran Necessary Grace 1883 (B07 print checked) | 1905 prayer for necessary grace and resolution (B07 print checked) | Fix Short vs Complete optional stage structure |
| Morning Marian/Guardian | `Angel of God` shared prayer identity; St Joseph/patron optional | French 1905 guardian original entry pending full image check | Separate complementary devotions, not same-tab variants |
| Evening presence | Blessed Be God presence act | 1905 Evening Adoration (B09 print checked) | English primary full print |
| Evening thanksgiving | Blessed Be God Thanksgiving | 1905 evening Thanksgiving (B09 print checked) | English primary full print |
| Evening examination | Baltimore prayer for light + existing guided reflection | 1905 petition for light (B09 print checked) | Distinguish prayer from instructions, no moral score |
| Evening contrition/resolution | Lasance shorter Act pending full print; Moran long Act (B09 print checked) | 1905 Contrition and separate Resolution (B09 both checked) | Establish short/complete defaults; avoid making long form compulsory |
| Evening living intercessions | Baltimore and Blessed Be God distinct despite same incipit | 1905 combined Living/Departed prayer (B09 print checked) | Complete EN witness + split only where source splits |
| Evening prayers for departed | Moran *Fidelium Deus* collect (B08 print checked) and De Profundis distinct | 1905 combined living/dead prayer | Do not conflate psalm, collect or attached versicles |
| Evening night protection | Lasance Alphonsus Night Prayer (B09 print checked) + *Salva nos* and *Visita* (B08) | 1905 bedtime prayer and *Visita* (B09 print checked) | Multi-select complementary texts; avoid exclusive either/or |
| Evening final commendation | Lasance *In manus tuas* remains candidate | Separate French prayer to all saints (B09) if desired | Different devotional type; no fictional translation |

These are **not final user-approved defaults**. In particular, where only a French print body is verified, do not pass the French historical prayer off as having an equally verified English text. Source ownership should be `historic edition -> exact witness -> normalized family -> optional stage -> saved choice`.

## Current quantitative gate

- 7 English researched books, 14 morning/evening daypart chapter views, **155 English-source occurrences**.
- 21 initial French/Latin source occurrences and 1 French 1884 bibliographic-only book (zero text occurrences).
- **176** catalogued cross-language source occurrences (including rubrics, repeated texts and a sub-paragraph) — **unchanged** in B10.
- Complete historical source witnesses visually checked against original print images: **28 = B07 9 + B08 5 + B09 13 + B10 1**; **13 English / 15 French**.
- **0** published prayer texts, approved historical-form defaults, whole-book original print audits, timer code or production cards changed in this PR.
- The 1925 source is labelled no-copyright **United States** by Princeton's Theological Commons and Wikimedia Commons, but **worldwide redistribution status is a separate release review**, not determined by this print-collation pass.

## Next actual implementation/research gate

1. Verify candidate English Hope, Charity, evening Presence, Thanksgiving and short Contrition against the actual printed pages; avoid adding books just to enlarge raw counts.
2. Cross-check rights, exact canonical family and language identity for shortlisted sources.
3. Group candidate default/alternative texts by **one stage at a time** for substantive editorial approval; no mass approval inferred from research.
4. Keep the current reader intact until user approves defaults; reuse existing 11/13 guided card IDs, expand variant selectors safely, Short/Complete presets and a separate opt-in session timer that **never automatically advances**.
5. No subscriptions, storage costs or publisher contact.

Full machine matrix with original 1925 text and six form descriptions: `data/pray/daily-prayer-morning-offering-choices.b10.json`.

**Release status: source verified, editorial recommendation pending, draft PR unmerged.**
