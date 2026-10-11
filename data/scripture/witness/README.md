# Source-labelled Catholic Scripture witness restoration

These are historical/research source transcriptions restored for **in-app reading**.
They are **not** the certified edition packs used by
`src/scripture/pack-loader.js`. Each file uses
`ao.scripture.source-witness.v1` and carries
`sourceStatus: UNCOLLATED_SOURCE_WITNESS`.

## Coverage restored

- **CPDV** (contemporary English): 73/73 Catholic books, 1,333 source chapters (including Esther\u2019s 15-chapter arrangement) and
  35,825 nonblank verse slots, from `exanx/bible-json/CPDV-73-Books` (secondary
  machine-readable distribution). Author's master and licence explanation:
  https://sacredbible.org/catholic/index.htm . This **does not constitute**
  a comparison of the entire secondary transcription with the author's current
  73 original book pages; differences and errata remain under review.
- **Douay–Rheims (Challoner)**: **73/73 Catholic books, 1,334 chapters,
  35,786 verse entries**. The source is the Catholic/Vulgate-numbered
  Challoner transcription from `AlvaroBalbin/catena/data/bible/drb`, pinned at
  `efe1bd084d918a34ca22ffeef2ecf711c593b392`, with Project Gutenberg
  eBook 1581 as the original electronic witness. This is **not** a full collation
  against a specific 1899 printed edition; publisher notes and chapter arguments
  are not present in these text-only source files.
- **Crampon (French)**: **73/73 Catholic books, 1,334 chapters, 35,486
  nonblank verse entries**, imported from the historical candidate
  `scrollmapper/bible_databases` at pinned commit
  `e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c`; exact upstream blob
  `a6c4a997fde1bda4d9025064aaf7c1dfe26f9001`
  (`formats/json/FreCrampon.json`). All **1,460** previously restored
  Lab-ora verses were checked against this expansion and matched exactly.
  **124 blank source cells** (35,610 original slots) are *not* fabricated.
  Their exact book/chapter/verse identities are preserved in
  `src/scripture/witness-gaps.js` and signalled in the reader.
  The source is labelled Crampon 1923 but has not been fully collated
  with the printed Desclée witness.

## Reading contract

A passage can now display its actual verse text in the shared Scripture
overlay, and a reader can expand to the complete local chapter where one is
present. An explicit bilingual warning identifies the text as an uncollated
historical transcription. Readers can still follow the primary source link.

The text is lazy-loaded by canonical book and locally cacheable after a
successful fetch. No remote Bible proxy is required for reading a previously
cached book. First use of an uncached book requires connectivity to the app.

**Do not silently repair** verse gaps with guessed text. In particular,
French Crampon Matthew 17:27 has a blank transcription entry that is explicitly signalled within the chapter view. The recovered
source notes also flag Psalm 44/45 and 131/132 numbering and the unusually
grouped Judith 13 verses. Edition-specific chapter and verse identities for
Psalms, Esther, the Song of Songs, and Greek additions need further collation. CPDV Esther\u2019s 15 chapter arrangement must not be forced into the 16-chapter Douay system.
Source transcriptions are not automatically suitable for cross-translation
verse alignment.

`SCRIPTURE_EDITIONS[*].enabled` deliberately remains `false`. The formal
73-book SHA-bound, human-reviewed and printed-edition verified release gate is
unchanged. The witness layer does **not** claim theological certification,
complete 1899 Challoner collation or complete 1923 French collation.

Run `node tests/scripture-witness-reading.mjs` for the full source census,
provenance-status checks, tamper rejection and reading loader contracts.
