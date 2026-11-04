# ICRSP France — Batch 13: patristic source locators and the existing Scripture-correspondences owner

**26 October 2026.** Research-only continuation of [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666). No edits to published Calendar, Scripture, Mass Explorer, Mass reader, or the separate [draft Scripture-correspondences PR #1553](https://github.com/Fulcanelli13/ad-orientem/pull/1553).

## Verdict

**Two important early Christian interpretive loci located:** St Ambrose, *De mysteriis* III.16–17 for Naaman and the Baptismal typology; the *Commentary on Daniel* traditionally attributed to Hippolytus, I.15.5–6 (and I.17.3–6), for Susanna and the Church. Both have inspected translated-text witnesses, but **neither original Latin/Greek/Slavonic critical source has been collated**. Nothing from the copyrighted modern Schmidt translation is approved for republication.

### A. Naaman (Monday Lent III)

- ICRSP [`a0191_ancien`](https://icrspfrance.fr/textes-liturgiques.php?article=a0191_ancien), **Dom Guéranger / LEÇON** explicitly reads Naaman's cleansing (2 Kings 5:1–15; Vulgate IV Reg 5) as a figure of Baptism. The actual 1962 Gospel is Luke 4:23–30, where Jesus **names Naaman**; the Gospel's reference and the later sacramental interpretation are **two distinct claims**.
- Independent earlier author: St Ambrose, [*On the Mysteries*, chapter III, §§16–17](https://www.newadvent.org/fathers/3405.htm). Passage inspected: Ambrose recounts Naaman's Jordan purification in an instruction on the efficacy of baptismal grace. **This is a genuinely attested early-Christian interpretive locus in an older English translation**, not evidence that Guéranger directly cited or borrowed Ambrose.
- Do not mistake Ambrose's fourth-century mystagogical explanation for a 1962 ceremonial command or an official universal practice concerning catechumens.

### B. Susanna (Saturday Lent III)

- ICRSP [`a0198_ancien`](https://icrspfrance.fr/textes-liturgiques.php?article=a0198_ancien) distinguishes Susanna's **innocence and vindication** (the Lenten lesson's **four disjoint Daniel 13 verse segments**) from Christ's treatment of the accused woman in John 8:1–11. This explains the **liturgical pairing** but is not a direct cross-quotation in either biblical text.
- The Guéranger-labelled text refers to St Hippolytus as a witness for Susanna as figure of the persecuted Church.
- Independently inspected: Thomas C. Schmidt's 2010 English translation of the traditionally Hippolytus-attributed [*Commentary on Daniel*, I.15.5–6](https://www.pergrazia.com/wp-content/uploads/2019/12/0205_hippolytus_commentary-on-daniel_2010.pdf), **printed p. 25, PDF page index 24**. The passage explicitly interprets Susanna as representing the Church and Jehoiakim as representing Christ. Sections I.17.3–6 also discuss Susanna's washing in ecclesial imagery. The PDF's own first pages state that the translator **retains copyright**; no part of this modern translation is permitted for copying to the app by virtue of research access.
- A 2026 web translation in [Royal Archives, ch. 15](https://royalarchives.org/hippolytus_of_rome/commentary_on_daniel/chapter_15/) independently displays the same chapter-locus, but it is **not** proof of the original Greek critical text or of full historical attribution. The older original critical reference is the Bonwetsch/Achelis *Hippolytus Werke* (GCS 1, 1897); its exact original-language lines remain to be checked. The contemporary edition and author-attribution questions remain open.
- **Separate art-historical claim not verified:** the ICRSP text's sarcophagus/catacomb interpretation has a [historical secondary literature lead](https://ccel.org/ccel/daubney/additions/additions.viii.xii.html), but none of the individual frescoes, excavation dates or catalogued objects has been independently verified in this batch. Do not add an artwork on that basis.
- Historical rhetoric that allegorizes Jews and Gentiles as adversaries of the Church must retain its period, speaker, and polemical context. It is **not** to be exported as a universal factual judgement about peoples.

### C. Guéranger bibliographic edition versus specific print-location evidence

A separate bibliographic confirmation is now available for Prosper Guéranger, *L'Année liturgique — Le Carême*, **16th ed., H. Oudin, 1903**, in the [Bibliothèque nationale de France catalogue](https://catalogue.bnf.fr/ark:/12148/cb32133488h). The [1903 edition-title-page transcription](https://www.domgueranger.net/lannee-liturgique-le-careme-historique-mystique-pratique-prieres/) independently bears the publisher/date/edition. **Neither individual Naaman nor Susanna paragraph was verified against the actual printed pages of this edition**. Do not describe this as full original-edition collation. Older liturgical arrangement statements are never imported into 1962 norms without separate proof.

### D. Exact reconciliation with the existing Scripture-compendium research

At inspection, [PR #1553](https://github.com/Fulcanelli13/ad-orientem/pull/1553) had head `3288c4a505092875f10b96faa5b26dfc02d72bb3`. Its `data/scripture/correspondences/thematic-source-leads.v1.json` contains **56 provisional named thematic leads**, of which **zero named records explicitly mention Naaman, Susanna, Elijah, or Elisha**. That establishes only an **absence of these names in this 56-record set**, not an absence of theological relationships anywhere in the 2,193 UBS group records, 565 Catholic deuterocanonical source candidates, or elsewhere in Ad Orientem.

**Actionable handoff, not a second master:** the existing PR #1553 owner can add or reuse source-linked typed relationships, preserving: (1) 2 Kings 5 / Luke 4's explicit person reference versus the Ambrose/Guéranger baptismal typology; (2) Daniel 13 / John 8 pairing versus the distinct Hippolytus church-type; (3) separate source/translation status, attribution, biblical verse and liturgical day; (4) original language/rights gates. The Bible compendium belongs outside Historia Salutis chronology.

### E. Remaining five B12 claim rows

- **Direct Naaman Gospel mention (CLM-001):** already resolved as the actual Gospel text; no extra patristic source needed.
- **Susanna/John 8 (CLM-003):** an ICRSP day-specific comparison; an authentic Hippolytus text on Susanna-as-Church does *not* prove he commented on John 8 here.
- **Elisha/Nain (CLM-005) and Elijah/Lazarus (CLM-006):** unchanged source-grounded research ideas, with **no** new original patristic locus checked.
- **Joseph/tenants (CLM-007):** hold unchanged. Actual Friday Lent II lesson is **Genesis 37:6–22**, while the sale appears in **37:28**; ICRSP comments on broader Genesis, not a verse read in that Proper.

## Release counts

| Gate | Actual |
| --- | ---: |
| B12 atomic claim IDs routed to the existing Scripture owner | 7/7 |
| Two distinct early Christian author work-loci located in *translations* | 2 |
| Original French Guéranger day passages verified against printed edition | 0 |
| Original-language patristic passages critically collated | 0 |
| Independently identified early-Christian Susanna artwork objects | 0 |
| Reproduction permissions for source/modern translated prose | 0 |
| Certified missing user-visible app features | 0 |
| New production typology records or Mass/Calendar changes | 0 |

**Committed register:** `data/source-text/icrsp-france-b13-patristic-loci-crossbranch-handoff.v1.json`. **Integrity tests:** `tests/test_icrsp_b13_patristic_handoff.py`. Further research should focus on original-language loci and genuine claim-level duplicates against existing research records—not 51 duplicate articles or a wholesale Guéranger import.
