# Biblical citations in the variable chants of the 1962 Mass — primary-source inspection batch 1

**11 October 2026. Research only; not added to Mass, Atlas or Formation production.**

The earlier Ordinary-text research located **45 candidate Bible relationships at 41 real Latin cues**. This batch extends the **changing liturgical Propers**, where a fixed source cue cannot be assigned one universal Bible verse.

## Original text files inspected

Eight directly fetched Latin liturgical source files in [Divinum Officium's primary repository](https://github.com/DivinumOfficium/divinum-officium/tree/master/web/www/missa/Latin), four chant slots each (32 inspected sections): **First Sunday of Advent** (`Tempora/Adv1-0`), **a Christmas Mass** (`Tempora/Nat1-0`), **First Sunday of Lent** (`Tempora/Quad1-0`), **Palm Sunday Mass** (`Tempora/Quad6-0`), **Easter Sunday** (`Tempora/Pasc0-0`), **Pentecost Sunday** (`Tempora/Pasc7-0`), **Corpus Christi** (`Tempora/Pent01-4`), and **Epiphany** (`Sancti/01-06`). No attempt is made to generalize one Christmas Mass as all Christmas Propers.

The [structured source witness register](../../data/geography/research/mass-proper-chant-bible-witnesses-batch01-20261011.v1.json) preserves original `!Bible citation` marker spelling and source line coordinates plus the Latin text excerpt after the first marker for every `INTROIT`, `GRADUAL`, `OFFERTORY` and `COMMUNION`. All individual entries are **publication-blocked**, and source markers are still pending an independent original-1962-Missal and canonical Bible text collation.

| Celebration | Introit first marker | Gradual first marker | Offertory first marker | Communion first marker |
|---|---|---|---|---|
| Advent I | Ps 24:1–3 | Ps 24:3–4 | Ps 24:1–3 | Ps 84:13 |
| Christmas (`Nat1-0`) | Wisdom 18:14–15 | Ps 44:3, 2 | Ps 92:1–2 | Matthew 2:20 |
| Lent I | Ps 90:15–16 | Ps 90:11–12 | Ps 90:4–5 | Ps 90:4–5 |
| Palm Sunday Mass | Ps 21:20,22 | Ps 72:24,1–3 | Ps 68:21–22 | Matthew 26:42 |
| Easter Sunday | Ps 138:18,5–6 | Ps 117:24,1 | Ps 75:9–10 | 1 Corinthians 5:7–8 |
| Pentecost | Wisdom 1:7 | Ps 103:30 | Ps 67:29–30 | Acts 2:2,4 |
| Corpus Christi | Ps 80:17 | Ps 144:15–16 | Leviticus 21:6 | 1 Corinthians 11:26–27 |
| Epiphany | Malachi 3:1 / 1 Chronicles 29:12 | Isaiah 60:6,1 | Ps 71:10–11 | Matthew 2:2 |

**Citations in this table reproduce the first source markers, not necessarily the whole chant.** Source spellings, combined verses, exact Psalm translations and liturgical adaptations need a separate verse-level concordance before use. Some are repeated or reordered scripture clauses rather than unmodified biblical texts. A source marker is not proof that the **whole** associated Latin block is a verbatim biblical quotation.

## Important result: compound chants need sub-passage source links

Of the **32 chant sections, 15 contain two or more explicit `!` scriptural markers**. Examples:
- Advent I Introit: Psalm 24:1–3 followed by a **different** Psalm 24:4 marker. The same-day Gradual has Psalm 24 and additionally Psalm 84:8.
- The Christmas Introit begins with Wisdom 18, then points to Psalm 92.
- The Gradual may combine Gradual proper and an Alleluia verse with separate biblical source markers. Therefore **never apply its first source marker to the whole Gradual/Alleluia sequence**.

This is a structural issue for the future Bible Atlas. Each liturgical chant/verse needs a **one-to-many** link from its actual component to original Bible verses; title-only associations can mislabel half a chant.

## Distinguish actual Scripture from traditional interpretation

Actual source metadata identifies biblical passages in liturgical worship directly. Thus Pentecost Sunday has a Wisdom reference at the Introit and Acts 2 references at Communion, independent of the Dujardin meditation that associates the final Mass blessing with Pentecost. On Easter Sunday the chant explicitly references resurrection-related Psalms and Paul's `Pascha nostrum`, independent of traditional devotional meditation on the consecration.

Source evidence does **not** establish the history of *when* each chant entered the Roman repertoire. For that use Fortescue, liturgical manuscripts, Jungmann and modern musicology, not assumptions drawn from a Psalm marker.

## Approval path

1. Separate every source-marked Latin chant component, keeping verbatim marker and text range.
2. Compare all components with resolved **1962** feast/date/rite Proper and pre/post-Mass rite branches.
3. Match Bible text in Clementine Vulgate, Crampon and Douay with correct numbering (especially Psalms, Wisdom/Sapientia, 1 Paralipomenon, and Leviticus).
4. Reuse the already working in-app Scripture passage reader and the existing `learn.mass` owner. Do not route chant verses as a fabricated Gospel/Epistle through the strict reading bridge.
5. Add authored Patristic/Alphonsus/Guéranger/Fortescue interpretations separately, only where supported; artwork and Atlas place links remain independently reviewed.

**Evidence status:** eight upstream Latin Proper files inspected; 32 sections recorded; 15 with multiple scriptural markers; zero 1962 facsimile/Bible-edition certified chant links; zero production changes.
