# B22 — St Pius X Morning / Evening Prayer: source-specific editorial decision

**28 October 2026 · PR #1785 research only · zero approvals · public release OFF**

This is a *direct-first* editorial batch. The primary Morning/Evening Prayer programme must be taken from a specified edition of St Pius X's Catechism, not reconstructed from Lasance, Blessed Be God, Moran, Baltimore or other manuals. Those remain a secondary treasury of optional **complete** prayers, not the default rule.

Source identifiers and machine-readable decisions: `data/pray/daily-prayer-pius-x-source-collation.b22.json`. The existing reject/restore HTML is `docs/pray/DAILY-PRAYER-REJECTION-REVIEW-2026-10-28.html`. An un-rejected item is *not* an approved default or a rights clearance.

## The four primary source-order decisions

| Review ID | Edition / period | Source-defined recitation order | Current decision |
| --- | --- | --- | --- |
| **B22-1** | Original 1905 Italian · Morning | Cross → single complete morning prayer → Pater → Ave → Credo → Faith, Hope, Charity → Salve Regina → Angele Dei | UNREVIEWED |
| **B22-2** | Original 1905 Italian · Evening | Single complete evening prayer → Pater → Ave → Gloria → Contrition → the three Jesus–Joseph–Mary invocations | UNREVIEWED |
| **B22-3** | Authorized 1913 French revision · Morning | Cross → single complete morning prayer → Pater → Ave → **Gloria** → Credo → Faith, Hope, Charity → Salve Regina → Angele Dei | UNREVIEWED |
| **B22-4** | Authorized 1913 French revision · Evening | Single complete evening prayer → Pater → Ave → Gloria → **Credo → Faith, Hope, Charity → brief examination of conscience → Contrition** | UNREVIEWED |

All four preserve the source *as printed*. They are alternatives **by edition**, not four modern composite rituals. There is no basis to insert 1913 Evening items into the 1905 appendix by stealth.

## Where the evidence is anchored

**1905 original:** Vatican printing, page **396** (scan leaf **408**), via the [proofread original-page transcription](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/408). The [434-page original scanned book](https://commons.wikimedia.org/wiki/File:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu) exists and is labeled public domain on Wikimedia Commons. In B22, the actual high-resolution page image could not be independently inspected; retain the distinct `ORIGINAL_IMAGE_REQUIRED` gate instead of falsely claiming an image pass.

**1905 practice guidance:** [Catechismo Maggiore, part V, chapter VIII](https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Catechismo_maggiore/Parte_quinta/Capo_VIII), mirrored by [Museo San Pio X](https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quinta-delle-virtu-principali-e-di-altre-cose-necessarie-a-sapersi-dal-cristiano/). `Q972` establishes an immediate waking offering; `Q974` sets the principal morning recitations; `Q983` concerns the Angelus; `Q984` recommends repeating the morning prayers, an examination and forgiveness in the evening; `Q985` describes the additional bedside act. **Important editorial distinction:** Q984 is fuller practice advice, whereas the 1905 *appendix* prints a shorter Evening sequence. Both are authoritative evidence but must remain individually attributable. Q984 does **not** change the words or printed order on page 396.

**1913 French revision:** [the authorized French printed edition, PDF scan](https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf), PDF pages **117–118**. PDF text extraction independently confirms the essential 1913 orders recorded in B21. The document's introductory letter of 7 March 1913 authorizes the French translation of the **new revised catechism**, so it is not a literal 1905 Italian edition. The De profundis after the evening recitations is separately titled **for the souls in Purgatory**, and the Jesus–Joseph–Mary invocations occur after it: make them separate optional devotions, not compulsory components of the French Evening sequence. The PDF screenshot endpoint could not be retrieved in this B22 run; B21 records a prior printed-page review. An independent final-image proofreading gate remains.

## Original wording discrepancy, do not repair silently

The 1905 appendix's proofread text gives **`tutte la mie azioni`**, while Catechismo Maggiore `Q974` prints **`tutte le mie azioni`**. The latter is grammatical and might point to a typographical error in the appendix or a transcription discrepancy. It is *not* permissible to adopt the Q974 reading as though identical to the appendix without comparing the actual image. Keep both readings with their independent edition/page provenance; tag `B22-O1` unresolved.

## New English source prospect — not yet a translation clearance

The [National Library of Ireland catalog](https://catalogue.nli.ie/Record/vtls000760522) identifies **Rev. John Hagan, *Catechism of Christian Doctrine*, Dublin: M. H. Gill, 1914, 152 pages**, as an English translation of the `Compendio`. This is a concrete **source-era bibliographic lead** to pursue, not evidence that its full prayer appendix has been recovered, that its exact edition family matches B22-1/B22-2 or B22-3/B22-4, or that its English words are public-domain in every territory.

The widely circulated English online *Catechism of St. Pius X* has a 1911 Irish College introduction but generally reproduces the catechetical body without the complete final daily-prayer appendix. It must not supply fabricated English Pius X prayer formulas by extrapolation. Until a 1914/other demonstrably source-era English appendix is located and copychecked, **no English historical formula is ready**.

## Decisions now and later

**Now:** user editorial review of B22-1 through B22-4, and whether to provide Q984/Q985 as separately attributed practical addenda. A choice of one 1905 or 1913 source order cannot automatically release another language's wording. Do not shorten the body of a source prayer; optional shorter routines remove **whole optional prayers only**.

**Later:** image-level copycheck of original 1905 page, independent French proof, complete English-source verification, rights-by-edition/territory review, and explicit approval of each exact printed prayer and its place in the sequence.

No source texts were promoted to `APPROVED_DAILY_FORMULATION_MANIFEST_V1`; no live reader, Mass, Home, Calendar or timer code changed. The 40 supplemental complete historical forms remain review-only, never replacements for a Pius X edition's authoritative sequence.
