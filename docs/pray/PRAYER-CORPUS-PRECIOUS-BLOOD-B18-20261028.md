# Prayer Corpus B18 — Complete Precious Blood Chaplet (1857/1910)

**Editorial disposition: ADMIT ONE FULL FORM; EXCLUDE SHORT CONTRADICTORY FORM.**
This is a narrow, usable chaplet choice in **Pray → Rosary & Chaplets**, not
another top-level module, source encyclopedia or different Mass/Stations reader.

## Historical witness reconciliation

- The Raccolta, **1857 §35**, and Ambrose St John's English **1910 §138**
  independently describe the *full* chaplet: seven meditations, Our Father counts
  **5 / 5 / 5 / 5 / 5 / 5 / 3**, one Glory Be after each, and **Te ergo
  quaesumus** after each mystery; opening *Deus in adjutorium* with *Gloria
  Patri*; conclusion *Most Precious Blood of Life Eternal*, *Redemisti nos*,
  *Et fecisti nos* and the collect *Omnipotens sempiterne Deus*.
- Historical EN meditation/closing transcription uses the 1910 wording and
  marks its English language. The 1910 print *uses “etc.”* in the collect's
  standard doxology; no fabricated extension replaces that witness.
- The historical chaplet's former indulgence grants are **not current grants**
  asserted by Ad Orientem. The original 1857 page-image was not authenticated;
  a 1910 textual PDF transcription and independent 1857 web text were compared.
- The 2026 Missionaries of the Precious Blood explanation independently
  supports the 33-bead / seven-mystery structure. It is not substituted as a
  source for nineteenth-century text (its Scripture-verse insertions are a
  modern, separate recension and not added here).
- The 1857 §40 **short form is deliberately excluded**. Its online
  transcription lists seven groups of five Our Fathers (35), despite an
  explicit 33-bead rationale; we do not silently rewrite it or promote it as
  an equal historical alternative.

Sources:
- https://www.liturgialatina.org/raccolta/blood.htm
- https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf
  (1910 PDF pages 63–65; zero-index pages 62–64)
- https://sanguischristi.com/entry/default/view/99
- https://icrspfrance.fr/textes-liturgiques.php?article=a0225_nouveau
  (distinct 1962 Mass collect witness; **not used as an invented expansion
  of the nineteenth-century chaplet's concluding prayer**)

## What users receive

One guided reader with **nine cards**: opening, seven mysteries and the
historical conclusion. Per-mystery prayer counts run from 5/5/5/5/5/5/3
Our Fathers, then Glory Be then a Latin/English historical response.
There is a quiet seven-mystery navigation rail, a six- or four-bead local
tracker, 48px+ touch targets, previous/continue, and a deliberate Latin
toggle.

The long English historical meditation under each mystery is an optional
disclosure; **simple mode is default**. The actual repeated Our Father and
Glory Be are read *verbatim* from canonical 48-prayer EN/FR/LA records; they
are not copied into a new corpus.

For EN users the 1910 English versicles and closing are available. For FR,
the canonical French common prayers and **labelled historical Latin**
versicles/collect are available. The long closing historical English
prayer is visibly labelled English, not passed off as a French translation.
This is an honest partial bilingual experience; additional French
historical witness would improve it, but isn't invented or a release
prerequisite for the canonical repetitive prayers.

No cost, new backend, new navigation section, new modern claims, current
indulgences, new novena, calendar streak or duplicate canonical prayer text.

## Implementation owners

- `src/pray/precious-blood-chaplet.v1.js`: canonical text projection,
  complete source metadata, seven original meditational witnesses and
  historical closing sequence.
- `src/pray/presentation-runtime.js`: nested reader view in the existing
  Prayer presentation/return owner.
- `src/pray/precious-blood-chaplet-styles.js`: compact native touch flow.
- `src/pray/internal-route-owner.js`: exact subroute.
- `src/pray/prayer-acquisition-chaplet-structures.v1.js`: **full-form release**
  versus **short-form exclusion**.
- `tests/pray-precious-blood-chaplet-b18.mjs`: 33 Pater + 7 Gloria +
  7 historical responses; source language, closing, failed-short gate.
- `tests/pray-chaplets-discovery-phone.mjs`: real 320/390px phone journey,
  while Divine Mercy and Five Wounds routes stay available.
- `tests/content-reachability-current.mjs`,
  `tests/pray-formation-architecture.mjs`,
  `tests/pray-formation-organisational-map.mjs`: preserve original
  **23 Prayer-family routes** and add one chaplet choice.
