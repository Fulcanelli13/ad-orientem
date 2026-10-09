# Catholic Scripture offline text packs

Only approved, edition-specific text files belong here. No Protestant texts or
generated Scripture verses may be used as filler.

**Upstream candidates for review** (not yet imported or certified):
- Douay–Rheims 1899 / Challoner revision: eBible.org `engDRA` (public domain),
  or the Scrollmapper `DRC` dataset. Source transcription must be compared
  against the declared edition.
- Crampon 1923: French Wikisource's scanned Desclée 1923 edition as the
  textual witness; Scrollmapper `FreCrampon` is a candidate machine-readable
  transcription, not independent proof of accuracy.
- Clementine Vulgate: compare against a named Clementine print edition.
- Knox: **no copy may be imported or redistributed without permission**.

Before running `node tools/scripture/compile-books.mjs INPUT OUTPUT`:
1. Confirm the exact printing, bibliographic details, rights for redistribution
   and offline caching, and human editorial review.
2. Map every upstream book to the fixed 73 canonical IDs, including Tobit,
   Judith, Wisdom, Sirach, Baruch, Maccabees, and the full Catholic Esther and
   Daniel material.
3. Verify the text's versification for every book. Never automatically substitute
   Protestant numbering, especially in Psalms and deuterocanonical material.
4. Prepare a normalized JSON file with 73 book objects and approved provenance.
   The compiler refuses incomplete sources and duplicate chapters/verses.
5. Compare sampled passages and checksum the output; manual certification is
   distinct from the compiler's structural checks.

No pack currently ships. The Home reader opens source sites when there is no
validated in-app text. Full-text search and offline caching intentionally require
licensed/certified packs; the interface does not claim unavailable Bible texts.
