# Prayer Corpus Wave 02: first ICKSP / ICRSP external source-unit ledger

28 October 2026. **Research only**. Baseline: merged Wave 01 (94 mixed ownership records, not unique prayers).

This sidecar indexes **40 source units** drawn from US Institute prayer pages and the French Child Jesus collection. It does **not** claim site-wide completion or 40 new distinct prayers. **38** units occur on inspected pages displaying text; **2** are index-only topics pending article/text retrieval. Original print certifications: **zero established by this pass**; imports: **zero**.

## Key collision controls

- Institute **Dedication to Christ the King** vs existing **Consecration to Christ the King**: exact textual collation required before merge.
- Institute **Golden Arrow** is linked to existing `supplement:golden_arrow`, not Sacred Heart `Iesu dulcissime`.
- French **Father Cyril** prayer is a likely language witness of the US **Divine Infant King** novena prayer; a nine-day programme cannot be inferred from a single prayer text.
- French two **Prague novenas** have day-by-day parallels but differing wording and an added hymn; treat as candidate recensions, not two confirmed unique works.
- Two **litanies** (short/long) and six **consecration formulas** are individually enumerated without collapsing their text differences.
- US **Prayers for Priests** contains two prayers, not one; the second web transcription has an apparent corrupted phrase that requires print collation.
- US **St Thérèse perpetual Tuesday Novena** already has a programme owner, while the same page also has prayers for **missionaries** and attributed to **Benedict XV**, independent prayer candidates.
- French **petite couronne** and **douze lundis** are *programmes*, not 12 new prayers each; its blessing formula is **held for ritual authority verification**.

## Source provenance

- us_index: https://institute-christ-king.org/resources/devotions-prayers
- us_610: https://institute-christ-king.org/resources/devotions-prayers/610-devotions-consecration-immaculate-conception
- us_611: https://institute-christ-king.org/resources/devotions-prayers/611-devotions-dedication-christ-king
- us_613: https://institute-christ-king.org/resources/devotions-prayers/613-devotions-reparation
- us_614: https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests
- us_615: https://institute-christ-king.org/resources/devotions-prayers/615-devotions-prayer-infant-jesus
- us_616: https://institute-christ-king.org/resources/devotions-prayers/616-devotions-prayer-infant-king
- us_621: https://institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus
- us_spiritual: https://institute-christ-king.org/videostreamprayers
- fr_prayers: https://icrspfrance.fr/?page=child-jesus-prayers
- fr_court: https://icrspfrance.fr/?page=child-jesus-court-of-honour
- fr_devotions: https://icrspfrance.fr/?page=child-jesus-devotions

## Next pass

Expand to remaining Institute UK/France devotional collections and the historical French liturgical catalogue, screen actual texts and metadata for title collisions, and then scale to 300–500 leads per complete discovery wave. Do not mark site coverage complete from this initial subset. All work IDs remain provisional until source-text and edition collation.

Machine-readable source-of-truth for this pass: `data/pray/prayer-corpus-external-discovery-wave02-icksp-firstpass.v1.json`.
