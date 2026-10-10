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
- **Douay–Rheims (Challoner)**: all 73 Catholic books, 1,334 source chapters,
  35,786 verse slots from `AlvaroBalbin/catena/data/bible/drb` (Project Gutenberg
  eBook #1581 underlying text). The 69 newly imported books are bound to the
  upstream commit `efe1bd084d918a34ca22ffeef2ecf711c593b392` and their
  Git blob SHAs. This is a **complete digitized source witness, not a certified
  reproduction of a particular 1899 printing**. Four source files that exceeded
  GitHub's 1 MB Contents cutoff—Genesis, Jeremiah, Psalms, Sirach—were
  recovered directly from their original Git blobs, not left empty.
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
Psalms, Esther, the Song of Songs, and Greek additions need further collation. CPDV Esther\u2019s 15 chapter arrangement must not be forced into the 16-chapter Douay system.
Source transcriptions are not automatically suitable for cross-translation
verse alignment.

`SCRIPTURE_EDITIONS[*].enabled` deliberately remains `false`. The formal
73-book SHA-bound, human-reviewed and printed-edition verified release gate is
unchanged. The witness layer does **not** claim theological certification,
complete 1899 Challoner collation or complete 1923 French collation.

Run `node tests/scripture-witness-reading.mjs` for the full source census,
provenance-status checks, tamper rejection and reading loader contracts.
