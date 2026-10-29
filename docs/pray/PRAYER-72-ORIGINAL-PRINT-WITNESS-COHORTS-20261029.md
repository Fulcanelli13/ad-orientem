# Prayer — 72-day original printed-book witness campaign
**29 October 2026.** Builds on the already merged 72/72 **digital** overlap result in PR #1966. This is the next **printed-source locator** pass, not a second digital concordance and not 72 image-collation certificates.

## New substantive result: Holy Souls source is identified

The current nine-day text is present as a single cohesive novena in the **Redemptorist Fathers' *Manual of the Purgatorian Society***. The scanned copy bears **copyright 1894**, a New York imprimatur dated **13 August 1894**, and a further Boston imprimatur dated **28 May 1907**. These are the dates physically printed in this *copy*; do not infer that it was printed in 1894, nor mistake modern TAN editions for this scan. [Historical scan](https://www.catholickingdom.com/s_Library/Books/M/Manual_of_the_Purgatorian_Society_OCR_CK.pdf), title/approbations (PDF pp 1–3), original prayer (printed pp **199–210**, PDF zero-based page indices **198–209**).

The PDF searchable text has all **nine proper day prayers**, including the distinctive seventh-day incipit `O God, Father of Mercy`, not just generic St Alphonsus parallels. The **four-line `On Thy spouses have compassion` verse** appears after day one, followed by **seven `O most sweet Jesus` intercessions**; subsequent days explicitly reference the same shared sequence. These prove the app's restored shared prayer components are source-traceable. Actual page-image screenshots were not retrievable from the PDF web service during this run; therefore **no page was certified line-by-line against the photographed original**. The printed PDF *text layer*, not OCR invented by the assistant, grounds the page locations.

| Day | Printed pages | PDF page index (zero-based) | Opening anchor |
|---|---|---|---|
| 1 | 199–200 | 198–199 | `O Jesus, my Saviour` |
| 2 | 202–203 | 201–202 | `Woe to me, unhappy being` |
| 3 | 203–204 | 202–203 | `O my God, because Thou art infinite goodness` |
| 4 | 204–205 | 203–204 | `O my God, because Thou art infinite goodness` |
| 5 | 205–206 | 204–205 | `Woe to me, unhappy being` |
| 6 | 206–207 | 205–206 | `O my Divine Redeemer` |
| 7 | 207 | 206 | `O God, Father of Mercy` |
| 8 | 208–209 | 207–208 | `O my God, I also am one of these ungrateful beings` |
| 9 | 209–210 | 208–209 | `O my God, how was it possible` |

**Important textual distinction:** a second Redemptorist-provided excerpt from *Visits to the Most Holy Sacrament* (printed pp **301–310**) contains St Alphonsus' historical Novena for the Repose of the Holy Souls, with **different English wording** and a materially different day-seven sequence. It is a comparison witness, *not* a replacement for the exact edition used by Ad Orientem. [Redemptorists' alternate excerpt](https://www.redemptorists.ie/wp-content/uploads/2014/10/All-Souls-Novena.pdf).

## Remaining three printed-book cohorts

| Programme | Day bodies | Scanned book / section | Proof level |
|---|---:|---|---|
| Christmas, Pentecost | 18 | Callan/McHugh, *Blessed Be God*, originally copyrighted 1925. [Scanned-book listing](https://en.wikisource.org/wiki/File:Blessedbegodcomp00call.pdf): Christmas printed p **268**, Pentecost p **296** | Printed section locations; image-by-image comparison **pending** |
| Immaculate Conception, St Joseph | 18 | Moran, *The Catholic Prayer Book and Manual of Meditations* (1883), [scanned edition](https://archive.org/details/TheCatholicPrayerBookAndManual): Immaculate Conception p **566**, St Joseph p **603**; Corpus Christi p **608**, Sacred Heart p **609** (repeat forms, not part of 72) | Printed section locations; 18 individual-day page ranges **pending** |
| Annunciation, Seven Sorrows, Assumption | 27 | Hammer, *Mary, Help of Christians* (1909), [scanned edition](https://archive.org/details/MaryHelpOfChristians). Original daily structure [Gutenberg sections III–V](https://www.gutenberg.org/files/33671/33671-h/33671-h.htm) | Historical print source and 27 headings identified; printed day-page numbers and full image comparison **pending** |
| Holy Souls | 9 | Redemptorist *Manual of the Purgatorian Society* (1894 copyright, 1907 imprimatur), printed pp **199–210** | 9/9 numbered printed day ranges **located**; full image comparison **pending** |
| **Total** | **72** | **4** book cohorts | **0/72 full printed-facsimile certificates** |

### Edition-integrity issue in the Callan scan

**The accessible scanned *Blessed Be God* is not demonstrably a 1925 first printing.** Although 1925 appears as the work's original copyright date, its scanned text contains a Miraculous Medal decree dated **22 April 1933** and narrative events in **1932**. Thus its physical text cannot be treated as an untouched original 1925 impression. The source references and live Prayer metadata now disclose the **post-1933 content**. The 18 prayer bodies remain digitally source-matched but require an authenticated 1925 impression, or an explicit later-edition designation, before first-edition certification. No prayer text was changed.

## Repository changes and remaining work

The permanent record `data/pray/original-print-witness-locators-20261029.v1.json` includes **72 separately addressable day identifiers**, source-validated English opening/closing snippets, four exact book cohort identities, and **nine precise Holy Souls printed page/PDF index pairs**. Each row explicitly sets `facsimileImageCompared: false`, `fullyPrintCollated: false`, `frenchOriginalEditionCertified: false`. These flags are enforced by `tests/pray-72-original-print-witness-cohorts.mjs` in the existing Prayer CI suite.

The existing bilingual Prayer reader now displays an **actual historical printed source link** for Holy Souls, preserves its nine earlier individually compared digital day texts, and labels the source as a *located scanned print witness, not a completed facsimile collation*. The reader also discloses the Callan post-1933 scan anomaly for Christmas and Pentecost. No user recitation, prayers, completion progress or navigation were modified.

**Next one-sweep task:** match 9 Holy Souls scanned page images and 63 remaining original printed page images to their *complete* app English prayer strings; flag exact insertions/omissions. Preserve historical page URLs and document edition/rights, then allow certification **per day** only when full visual line collation actually passes. Separately verify French editorial translations and historical versus current indulgence grants.
