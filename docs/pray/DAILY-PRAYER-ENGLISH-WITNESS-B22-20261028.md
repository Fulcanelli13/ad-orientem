# B22 — Saint Pius X Morning/Evening Prayer: English source provenance and gap closure

**28 October 2026 · research only · no text approved for public release**

## Important new bibliographic finding

The National Library of Ireland records a real English source:

- **Title:** *Catechism of Christian Doctrine: published by order of His Holiness Pius X*
- **Translator:** Rev. **John Hagan**
- **Publisher:** **M. H. Gill, Dublin**
- **Year:** **1914**
- **Extent:** **152 pages**
- **Record:** https://catalogue.nli.ie/Record/vtls000760522
- **Original work:** `Compendio della dottrina cristiana` (Italian).

This confirms the existence of an early English catechism, independently of reprints, but its **actual original printed daily-prayer pages have not been retrieved or visually checked**. Do not infer exact English 1914 liturgical/prayer text merely from the catalogue metadata.

## Different English text that IS accessible (provisional only)

- Source: https://sites.google.com/view/pius-x-catechism/on-daily-exercises-and-devotions
- Subject: *Greater Catechism* daily-exercise questions **972–985**, Hagan-associated English text transmitted in a later online presentation.
- Q974: Morning recollection, a single act combining adoration, thanksgiving and offering, then Our Father / Hail Mary / Credo / theological Acts.
- Q984: Repeat the same devotional prayers in the evening, **examine conscience and seek pardon**. It is an instruction, not a newly supplied English historical Evening Prayer.
- Q985: Sign of Cross and nighttime commendation of heart and soul to God, with invocations to Trinity, Jesus, Mary and Joseph.

Text is stored in `data/pray/daily-prayer-pius-x-primary-structure.b21.json` as a separate `piusx-hagan-en-derived` *provisional online witness*, never labelled original-page-verified 1914 English. The user's HTML choicebook renders it separately with an explicit bibliographic hold and the link to the 1914 National Library catalogue.

The 1910 `Compendium of Catechetical Instruction` (Hagan, multi-volume, combining Roman Catechism, Pius X and Raineri) is a **distinct work** from the Dublin 1914 English *Catechism of Christian Doctrine*. The 1974 Kevane translation / post-1953 shortened Italian revisions are **not** silently substituted for this early Hagan text.

## Printed source cross-check of French authority

Scanned early French catechism, https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf:
- **PDF page index 117** (printed p.108) directly inspected, containing both complete `Le matin` and `Le soir` prayers and their exact printed ordered recitation lists.
- **PDF page index 118** (printed p.109) inspected, showing the conclusion of Psalm 129 (*De profundis*) and subsequent Jesus/Joseph/Mary invocations.
- The French text is **not** identical with 1905 original Italian; keep distinct canonical source-edition identities.
- Authentic original print copy is a basis for precise transcription, but a final editorial copycheck and reuse rights review are still required.

## Strict editorial and runtime release holds

- **St Pius X Catechism is authoritative for the core daily prayer sequence.** Other preconciliar manuals are supplementary complete prayers, not competing principal sequences.
- No unverified English 1914 prayer wordings may enter production as historical text. Do not invent translations or silently reuse 1905 Italian, 1913 French, or modern English formulae.
- Research HTML default remains French 1913; it now includes a **clearly provisional English comparison** and original Italian 1905. Both individual stage and supplementary manual rejections export in JSON.
- The implementation **PR #1786 has since MERGED**, but the approved historical witness registry remains **empty** and publication/release switch **off**. Treat source text publication as a distinct, explicitly approved future change.
- The research **PR #1785 remains DRAFT, UNMERGED**. All historical wordings require final user editorial selection, original-edition copycheck and territory-level reuse rights before public release.
- No costs or publisher contact.

## Next source goal

A readable digital copy or original scan of Hagan's **1914** 152-page English *Catechism of Christian Doctrine*, particularly the daily-prayers appendix. Seek free libraries/archives and scan-backed copies; **do not misattribute** the Hagan-based online Q972–985 passage as that exact book. If a scan is unavailable, mark English 1914 as bibliographically verified / text unavailable and keep original 1913 French plus 1905 Italian visible.

**Status:** 1914 English edition existence **CONFIRMED**; English historical prayer body original-print verification **PENDING**; published English catechism historical prayers **ZERO**.
