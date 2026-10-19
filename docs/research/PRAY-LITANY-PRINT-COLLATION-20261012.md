# Historical Litany of the Saints — witness provenance and collation gate
**Recorded:** 2026-10-12 · **Owner:** Prayer historical-source review · **Release status:** NOT PRINT-COLLATED

## Editorial rule
The English 1883 *The Catholic Prayer Book and Manual of Meditations* and Pierre Corneille's French text in Ch. Marty-Laveaux's 1862 *Œuvres*, tome IX, are **independent historical witnesses**. Neither is presented as a source-certified 1962 *Rituale Romanum* / Roman Pontifical litany. Never merge invocations or silently modernise language from one to the other. The litany proper ends before the appended Our Father/Psalm LXIX/collects; these are not duplicate invocations.

| Field | English | French |
| --- | --- | --- |
| historical source | *The Catholic Prayer Book and Manual of Meditations*, 1883 | Pierre Corneille, *Œuvres*, Ch. Marty-Laveaux, Hachette, 1862, tome IX |
| live page | https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations/The_Litany_of_the_Saints | https://fr.wikisource.org/wiki/%C5%92uvres_de_P._Corneille_(Marty-Laveaux)/Tome_9/Les_sept_psaumes_p%C3%A9nitentiaux |
| inspected wiki revision | [oldid 12282621](https://en.wikisource.org/w/index.php?title=The_Catholic_Prayer_Book_and_Manual_of_Meditations/The_Litany_of_the_Saints&oldid=12282621) | [oldid 14794744](https://fr.wikisource.org/w/index.php?title=Œuvres_de_P._Corneille_(Marty-Laveaux)/Tome_9/Les_sept_psaumes_pénitentiaux&oldid=14794744) |
| printed page/facsimile | **not yet verified** | Printed p. 279: [djvu page 293](https://fr.wikisource.org/wiki/Page:Corneille,_Pierre_-_Œuvres,_Marty-Laveaux,_1862,_tome_9.djvu/293), Litany incipit. Printed p. 280: [djvu page 294](https://fr.wikisource.org/wiki/Page:Corneille,_Pierre_-_Œuvres,_Marty-Laveaux,_1862,_tome_9.djvu/294), Latin invocations. |
| status | uncollated historical transcription | limited facsimile spot-check; comprehensive French and Latin printed pages not collated |
| offline distribution | **not approved** | **not approved** |

## 19 October scope clarification — source edition is longer than the reader

Both historical **source pages** continue after `Our Father`/
`Notre Père`, through **Psalm LXIX, suffrages and all ten
concluding collects**. The EN 1883 witness has ten English prose
orations; the FR 1862 page prints ten Latin orations followed by
ten French prose orations. `src/pray/litany-source.js` intentionally
extracts only the *Litany proper* for its own reader: this is a
**product presentation boundary, not the archival book's text boundary**.
The 1862 source additionally includes both a source-adjacent prose
translation of Psalm 69 and Corneille's poetic verse paraphrase; the
latter is not a literal liturgical substitute.

Provenance and candidate segment locators for the entire sequence now
reside at `data/mass/rogation-historical-language-witnesses.v1.json`.
Neither historical edition is 1962-certified, print-collated or
automatically approved for offline distribution. This clarification
does **not** enlarge the PRAY reader or make the historical Litany
equivalent to the separate Rogation procession.

## Findings requiring print-page comparison
1. The French transcribed invocation **“Saint Jean, riez pour nous.”** is suspect. It may be a web transcription error or may reproduce a printing error. **Do not silently change it** until the specific printed French page has been visually checked and a decision logged with page identifier.
2. The French opening **“Jésus-Christ, avez pitié de nous.”** likewise requires comparison to the printed page; do not change to another reading based only on grammar.
3. The 1862 volume also prints a Latin litany. Do not assume its list matches the accompanying French version verbatim, or that either list matches the independent English 1883 text. The latter visibly includes an invocation of St Joseph; absence/presence is **edition variation**, not proof of a web transcription defect.
4. Wikisource's complete French chapter combines the Seven Penitential Psalms, Latin and French litanies, and later devotions. Extract **only** the bounded French litany before `Notre Père, qui`. The independent English transcription similarly ends before `Our Father, in secret` and the appended Psalm LXIX.

## Runtime acceptance and exact limits
- `src/pray/litany-source.js` stores independent witness metadata, review revision pointers and suspect exact readings. `reviewLitanyTranscription()` reports anomalies but **does not replace words**; `extractLitanyProper()` remains a fail-closed historical bound.
- The Prayer source pane provides the live witness link, reviewed transcription revision, relevant facsimile entry and a notice when displayed wording matches a flagged suspect reading. The litany prayer card itself remains prayer-first, not editorial commentary.
- `tests/pray-litany-witness-collation-gate.mjs` uses plainly **synthetic** strings to test these contracts. A passing fixture test is **not** a full source collation.
- The app may cache a successfully fetched web transcription for revisits, but this is not a certified bundled offline edition; do not change `UNCOLLATED` status or import the entire web transcript into app assets before checking print, attribution/share-alike obligations, and allowed scope of reproduction.

## Mandatory closure
1. Read the full English 1883 printed Litany pages against its scanned facsimile, recording precise page numbers and variants.
2. Compare the full French **and Latin** 1862 litany, especially both suspect readings above, against the printed pages in tome IX. Record every amendment by exact line, original print, Wikisource reading, chosen display reading, and reason.
3. Decide one verified editorial text per historical source, with exact version identifiers and provenance/redistribution terms. Keep the editions separate.
4. Test a **genuine** loaded EN and FR source (no synthetic fixtures) in the 320/390px reader, then the same content through an intentionally offline fresh boot and reopening.
5. Only then change the publication status of the corresponding witness; separate 1962 liturgical certification is not implied.

**Tracking:** [Prayer release ledger #1102](https://github.com/Fulcanelli13/ad-orientem/issues/1102). Physical handset gate remains separate.
