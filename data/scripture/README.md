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
- Catholic Public Domain Version (2009): expressly placed in the public domain by its author; compare pinned digital candidate against https://sacredbible.org/catholic/index.htm and review independent translation before certification.
- Knox and NCB: excluded from the public-domain-only edition shortlist.

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

## In-app Catena Aurea commentary (separate from Bible editions)

The four files under `data/scripture/catena/` are **commentary**, not Bible
text packs. They contain all 814 pericopes and 12,692 Father-attributed
fragments from the *Catena Aurea* Oxford translation (1841–45, J. H. Newman).
Source: `AlvaroBalbin/catena` pinned to commit
`efe1bd084d918a34ca22ffeef2ecf711c593b392`, with individual upstream
Git blob identifiers, edition label, source links and a corpus-wide manifest.

These files are self-hosted by Ad Orientem: clicking Commentary reads them
inside the existing Scripture overlay. Each Gospel is fetched only as needed,
and after the first successful retrieval can be saved to CacheStorage for
subsequent offline use. Initial use without connectivity still requires a
previously cached Gospel file. No dependency on live GitHub Raw for runtime
display. The original text fragments and attributed Father names are retained.

Run `node tests/scripture-catena-corpus.mjs` to verify the complete manuscript
census, attribution, source metadata, exact match against Gospel verse keys,
and no remote-runtime dependency. **Do not confuse this commentary source
approval with approval to reproduce the Bible translations**: the latter remain
disabled pending their separate canonical edition and textual audits.
