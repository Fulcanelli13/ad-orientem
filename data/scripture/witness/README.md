# Source-labelled Catholic Scripture witness restoration

These are historical/research source transcriptions restored for **in-app reading**.
They are **not** the certified edition packs used by
`src/scripture/pack-loader.js`. Each file uses
`ao.scripture.source-witness.v1` and carries
`sourceStatus: UNCOLLATED_SOURCE_WITNESS`.

## Coverage restored

- **CPDV** (contemporary English): 73/73 Catholic books, 1,334 chapters and
  35,825 nonblank verse slots, from `exanx/bible-json/CPDV-73-Books` (secondary
  machine-readable distribution). Author's master and licence explanation:
  https://sacredbible.org/catholic/index.htm . This **does not constitute**
  a comparison of the entire secondary transcription with the author's current
  73 original book pages; differences and errata remain under review.
- **Douay–Rheims (Challoner)**: 4 complete Gospels, 3,777 verse slots, from
  `AlvaroBalbin/catena/data/bible/drb`, which cites Project Gutenberg
  eBook 1581 as its historical text source. Not labelled as a verified 1899
  printing or a newly certified complete Douay Bible.
- **Crampon (French, 1923 label)**: original Lab-ora subset, 39 chapters in
  11 books, 1,460 nonblank verse slots; `Fulcanelli13/lab-ora/data/crampon-chapters`,
  with an upstream Scrollmapper Crampon source candidate. Source collation with
  the exact 1923 printing remains pending.

## Reading contract

A passage can now display its actual verse text in the shared Scripture
overlay, and a reader can expand to the complete local chapter where one is
present. An explicit bilingual warning identifies the text as an uncollated
historical transcription. Readers can still follow the primary source link.

The text is lazy-loaded by canonical book and locally cacheable after a
successful fetch. No remote Bible proxy is required for reading a previously
cached book. First use of an uncached book requires connectivity to the app.

**Do not silently repair** verse gaps with guessed text. In particular,
French Crampon Matthew 17:27 has a blank transcription entry. The recovered
source notes also flag Psalm 44/45 and 131/132 numbering and the unusually
grouped Judith 13 verses. Edition-specific chapter and verse identities for
Psalms, Esther, the Song of Songs, and Greek additions need further collation.
Source transcriptions are not automatically suitable for cross-translation
verse alignment.

`SCRIPTURE_EDITIONS[*].enabled` deliberately remains `false`. The formal
73-book SHA-bound, human-reviewed and printed-edition verified release gate is
unchanged. The witness layer does **not** claim theological certification,
complete 1899 Challoner collation or complete 1923 French collation.

Run `node tests/scripture-witness-reading.mjs` for the full source census,
provenance-status checks, tamper rejection and reading loader contracts.
