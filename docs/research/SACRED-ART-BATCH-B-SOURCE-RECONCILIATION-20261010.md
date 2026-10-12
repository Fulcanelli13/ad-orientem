# Sacred Art — Batch B source reconciliation and first-class acceleration
10 October 2026 · [Issue #885](https://github.com/Fulcanelli13/ad-orientem/issues/885) · [PR #887](https://github.com/Fulcanelli13/ad-orientem/pull/887)

**Research inventory only; zero app images approved.** The complete 1962 2026 DayResolver sweep and source-art auditor remain separate from the actual app calendar rendering.

## Verified at the last dated source audit

| Audit | Baseline before Batch B | Current | Explanation |
|---|---:|---:|---|
| Catalogued distinct painting candidates | 194 | **218** | 22 vetted bulk sources + 2 Sacred Heart paintings |
| Acquired SHA256 original files | 179 | **203** | **203 different source hashes**, no same image counted twice |
| Museum CC0 acquired originals | 171 | **193** | +22 official Met/Cleveland source originals |
| Commons PD-Art original files, rights held | 3 | **5** | +2 direct Sacred Heart sources; **NOT** CC0 |
| Kress public-domain sources, rights held | 5 | **5** | unchanged |
| All subject depth targets met | 97/168 | **99/168 = 58.9%** | Old 2+ original targets retained rather than reset to 1 |
| Major-feast depth targets met | 20/26 | **21/26 = 80.8%** | Sacred Heart 2/2 now |
| Major-feast first-pass 1+ source | 24/26 | **25/26 = 96.2%** | Christ the King still zero exact sources |
| Observed I-class exact-source A days | 16/53 | **17/53 = 32.1%** | Sacred Heart linked with two sources |
| Contextual B days | 20/53 | **22/53 = 41.5%** | Holy Saturday Entombment; Christ King in Glory |
| Unresolved C days | 17/53 | **14/53 = 26.4%** | No false class conversion |
| A+B provisionally source-covered days | 36/53 | **39/53 = 73.6%** | Not a right or artistic approval |
| Rights/art/crop-approved original images | 0 | **0** | Human selection HTML still last |

Sources: [five-lane bulk original run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38056121980); [two-original Sacred Heart focused run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38058367058); [latest full-year and exact-context source auditor](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38058596005); [latest subject acquisition audit](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38058592402).

### Important corrections to automatic search hits

The initial five-lane search found 28 preferred research records but **24 unique original hashes** due to duplicate cross-module finds. After inspecting images, **22** sources were imported once each. Two were not imported: **`met-435885`**, a landscape named Domaine Saint-Joseph (NOT Saint Joseph), and **`cma-144270`**, Saint Paul the Hermit (NOT Paul the Apostle). Saint Andrew's Crucifixion was retained solely as Saint Andrew's martyrdom, not Christ's Passion/Stations. Two generic Madonna panels were **not** mislabelled Our Lady of Perpetual Help. Four smaller originals were retained in source artifacts for image QA without automatically inflating the canonical registry.

The full rejection/reclassification manifest is [bulk acquisition quality ledger](../../data/calendar/sacred-art-bulk-acquisition-qa-reconciliation.v1.json).

### Major Sacred Heart breakthrough

Two real **colour paintings**, independently downloaded from exact Wikimedia Commons source pages and checked against original pixel dimensions and SHA256:

- **Juan Patricio Morlete Ruiz, *The Heart of Jesus*, 1759**, oil on copper, Museo Nacional de Arte, Mexico City. [Source](https://commons.wikimedia.org/wiki/File:Juan_Patricio_Morlete_Ruiz_-_The_Heart_of_Jesus_-_Google_Art_Project.jpg). Original 2345 × 3045. `commons-morlete-sacred-heart-1759`.
- **Anonymous Mexican retablo, *The Sacred Heart of Jesus*, mid-nineteenth century**, oil on tin, El Paso Museum of Art. [Source](https://commons.wikimedia.org/wiki/File:%27The_Sacred_Heart_of_Jesus%27,_anonymous_Mexican_retablo,_oil_on_tin,_mid_19th_century,_El_Paso_Museum_of_Art.JPG). Original 2360 × 3064. `commons-el-paso-sacred-heart-retablo`.

Both depict the sacred devotion itself (not just a generic Christ). Both are **PD-Art sources with worldwide reproduction-rights review pending**. Source IDs, source SHA256 and rights flags are preserved in the canonical master. They match the 2026-06-12 production resolver I-class principal `tempora:Pent02-5:1:w`. Neither is approved for app use.

### Reused I-class images without misleading users

The actual Holy Saturday `tempora:Quad6-6r:1:vw` is provisionally illustrated by the **Entombment**, explicitly described as the tomb context, NOT the appointed 1962 Easter Vigil ceremonies. Christ the King `sancti:10-DU:1:w` uses **Christ in Glory** solely as a **B context**, without claiming an exact feast-specific painting. The legal, artistic and phone-crop gates remain separate.

**Christ the King is now the only one of 26 principal-feast subjects without an acquired exact original**. Other existing multi-image minimum deficits remain Palm Sunday, All Saints, All Souls and Transfiguration (one original short each), and Christ the King (two short). Do not confuse collection depth with one-image-first calendar coverage.

### Remaining 14 unresolved observed I-class days

- Ash Wednesday; I, III and IV Sundays of Lent; Passion Sunday;
- Holy Monday, Holy Tuesday and Holy Wednesday;
- Low Sunday; Saint Joseph the Workman;
- First, Second, Third and Fourth Sundays of Advent.

Next: bulk-check their **1962 appointed Gospel/rubrics** and search by iconographic narrative, not the words “Advent”/“Lent”. Any new image may satisfy multiple relevant day/module subjects but one acquired file remains **one physical original**. Do not manufacture coverage by offering a generic Virgin image for the Annunciation, a generic Holy Family scene for Saint Joseph's trade or a Crucifixion of another saint for Christ's Passion.

Then complete Stations/Scripture/saints/Formation subjects, followed by II–IV-class calendar associations, and only at the end build the **standalone curatorial HTML** with real image previews, category filters, accept/reject/review controls and a versioned exported JSON manifest. No visual or legal publication approval is inferred from coverage percentages.
