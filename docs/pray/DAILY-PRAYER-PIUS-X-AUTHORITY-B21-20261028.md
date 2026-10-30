# Morning and Evening Prayer — St Pius X Catechism is authoritative

**28 October 2026 · B21 editorial correction · Research only; no public release**

## Source hierarchy — binding for future curation

**The daily rule is established first from St Pius X's Catechism, not from Lasance, Moran, Blessed Be God, Baltimore, the Pocket Prayer Book, or the 1905 devotional appendix to the Catechism of Trent.** These latter sources remain useful only as **additional optional prayers and genuine variant texts**, clearly identified as such. They are not substitutes for the Pius X daily order or required slots.

The B19/B20 eight editorial composite Short/Complete proposals are **superseded as candidates for the default authoritative routine**. Retain them as historical research/supplemental suggestions, not automatic defaults. The user's unambiguous correction is authoritative for this project.

## The actual distinct Pius X witnesses

1. **Original Italian `Compendio della dottrina cristiana` (Rome, 1905), `Orazioni quotidiane e altre preci`**. Source: https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci . The printed page is represented by a proofread Wikisource transcription. Do not label the 1905 text "direct original-image checked" based on this alone.
2. **Authorized early French edition of revised `Catéchisme de la doctrine chrétienne` (Paris, 1913)**. Its opening letter reports St Pius X's approval and prescription of the *new shorter catechism* for the ecclesiastical province of Rome and authorizes the French translation. https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf . Printed French page 108, **PDF zero-index page 117**, was directly visually inspected along with p.118. Common formula texts visually reviewed on PDF pages 10–15. This **is not a word-for-word translation of the 1905 Italian original**.
3. **1905 Catechismo maggiore**, Part Five ch. VIII, questions **972–985**, gives accompanying devotional practices: wake and sign oneself, offer the heart, recollect God's presence, kneel if possible, recite the acts, examine conscience in the evening, and commend oneself to Jesus, Mary and Joseph. https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quinta-delle-virtu-principali-e-di-altre-cose-necessarie-a-sapersi-dal-cristiano/
4. **Exclude** the separately labelled *1967 updated* prayer appendix in some modern Catechismo Maggiore presentations from the claim "original St Pius X wording."

## Exact printed morning and evening orders (not conflated)

### 1905 original Italian `Compendio`
Morning: Sign of Cross; one complete Morning Prayer (adoration, thanksgiving and offering); Pater noster; Ave Maria; Creed; acts of Faith, Hope, Charity; Salve Regina; Angel of God.

Evening: one complete Evening Prayer (adoration, thanksgiving and offering); Pater noster; Ave Maria; Gloria Patri; Act of Contrition; three short invocations to Jesus, Joseph and Mary. Greater Catechism Q984 separately counsels a brief evening examen. **Do not silently insert the later revised French sequence into the 1905 original order.**

### 1913 French of revised catechism
Morning: Sign of Cross; one complete Morning Prayer (adoration, thanksgiving, offering and petition); Pater; Ave; **Gloria**; Credo; acts of Faith, Hope, Charity; Salve Regina; Angele Dei.

Evening: one complete Evening Prayer (adoration, thanksgiving, repentance, night protection); Pater; Ave; Gloria; Credo; acts of Faith, Hope, Charity; **brief examination of conscience**; Act of Contrition. Printed immediately after is *De profundis* for the souls in Purgatory and invocations to Jesus, Joseph and Mary, which are distinguishable from the required sequence.

The main Pius X prayers themselves combine devotional purposes. **Do not duplicate adoration/thanksgiving/offering as three recitations.** Supplementary Night Prayer, Visita, separate Morning Offering, antiphons or litanies should be optional and retain source labels.

## User-facing editor B21

Source of truth: `data/pray/daily-prayer-pius-x-primary-structure.b21.json`.

The existing self-contained HTML at `docs/pray/DAILY-PRAYER-REJECTION-REVIEW-2026-10-28.html` now **opens on St Pius X's primary daily order**, has 1905 Italian versus 1913 French edition toggle, daypart toggle and original printed formulae where transcribed. Users can reject each Catechism stage **per edition**, independently from excluding one of the 40 supplementary historical wordings **globally**. Both rejection types export in the same JSON. B19/B20 lists remain accessible under **Other manuals** and **All 40 historical wordings**, no longer first-class default authorities.

The primary French 1913 prayer and common-form texts are in their original French, checked against printed pages but requiring a separate final copyedit before any public text release. The 1905 Italian common prayers, other than specifically transcribed source bodies, are not silently imported from a later Italian/French edition. Do not manufacture an English Pius X primary "historical translation": a verified source-era English witness is still needed.

## B22 English witness discovery — 1914 original located bibliographically, textual witness still pending (28 October 2026)

**Confirmed primary English edition:** *Catechism of Christian Doctrine: published by order of His Holiness Pius X*, translated by **Rev. John Hagan**, Dublin, M. H. Gill, **1914**, 152 pp., translation of `Compendio della dottrina cristiana`. The National Library of Ireland catalogue independently identifies the language, translator, publisher, date and original work: https://catalogue.nli.ie/Record/vtls000760522 . Its catalog record establishes **a historical English edition exists**, but **NOT** that its actual prayer text was read, transcribed or checked against printed images.

**Distinct English supplementary witness:** the Greater Catechism's daily devotions Q972–985 survive online in an Hagan-associated English rendering at https://sites.google.com/view/pius-x-catechism/on-daily-exercises-and-devotions . The daily advice includes a short Morning act (Q974), the associated Our Father/Hail Mary/Creed/Acts, and evening examination, pardon and bedtime commendation (Q984–985). **This is not proof of the original 1914 wording.** These words are catalogued as `SECONDARY_ONLINE_ENGLISH_TRANSCRIPTION`, visibly flagged as provisional in the HTML, and cannot populate the production release manifest. In particular Q984's direction to repeat the same prayers cannot be relabeled a distinct, source-authenticated English Evening Prayer printed in 1914.

The Hagan `Compendium of Catechetical Instruction` (an earlier multi-volume collection combining Roman Catechism/Pius X/Raineri) and the separate Hagan **1914 English Catechism translation** must not be interchanged. Equally, postconciliar Kevane (1974) and translations of the later 1953 shortened Italian catechism are not edition-matched replacements for either original source.

**Research status:** English 1914 print existence = VERIFIED; original-page English 1914 daily formulae = **NOT YET VERIFIED**; Hagan-associated Q974/Q984–985 derivative online text = PROVISIONAL; English approved historical source bodies = **0**; public release gate remains OFF.

## Publication and implementation gates

- The current LIVE Morning 11 / Evening 13 card reader in main remains **unchanged**.
- Implementation PR #1786's release manifest remains **empty** and historical switch **off**, though implementation CI had passed on the last head tested before B21.
- Historical Pius X source priority must govern the eventual explicit released-profile manifest. "Short" retains the complete Pius X core prayer and all stages designated required by the chosen exact edition, optionally omitting other complete prayers (never clipping an original recitation). "Complete" can supplement but must not misattribute supplemental source text to Pius X.
- User has not approved the eight B19/B20 composite sequences as defaults; therefore no Pius X source text has been enabled as a public ritual.
- EN and FR exact edition-matched text, territory-level redistribution/reuse rights and original image/copy checks remain publication holds. **No postconciliar wording and no compulsory paid tools, services or publishers' contact.**
