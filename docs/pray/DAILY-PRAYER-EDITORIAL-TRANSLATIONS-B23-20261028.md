# B23–B24 — Trilingual prayer readings and Hagan comparison

**28 October 2026 · PR #1785 research only · Live publication switch OFF**

## User-facing rule: only Latin / English / French

The single-file editorial reviewer offers exactly three reading languages: **Latin, English and French**. The source edition selector offers the distinct **1905 original** and **1913 revised** St Pius X routines. It does *not* offer an Italian reading option or Hagan as a third edition; Italian text is retained only in research-source records to audit translations, not displayed in the reading surface.

Latin forms are distinguished by provenance: the traditional Latin wording for familiar named prayers, versus explicitly marked Ad Orientem Latin drafts for the edition-specific core and theological acts. English and French drafts are also labelled editorial rather than falsely attributed to an edition that did not print them in that language. The printed French 1913 source may be shown directly as an authenticated source-language form.

The exact editions retain different Morning/Evening **orders**. Switching the reading language does not change the edition or import common prayer wording from the other edition without disclosure.

## Current coverage

| Parent edition | Prayer/formula units with Latin, English and French readings | Source caveat |
| --- | ---: | --- |
| Original 1905 | **16** (5 original appendix bodies/invocations, 9 original catechism common formulas, 2 conventional named prayer forms) | The *Salve Regina* and *Angele Dei* are standard prayer readings, not certified exact 1905 appendix wordings |
| Revised 1913 French | **14** (2 core and 12 common formulas/invocations) | The examen is a guided act, and *De profundis* is an adjacent optional devotion without exact edition-text collation in this dataset |
| Total | **30 source-aligned reading units**, each with Latin + English, and French or French original | Editorial draft, not approved public text |

All 30 translation units have Latin and English readings. The 1905 readings also have French drafts; the 1913 source already supplies original French wording. The 1905 source-wording statuses and the 1913 edition-specific passages are independently retained in `data/pray/daily-prayer-pius-x-primary-structure.b21.json` and `data/pray/daily-prayer-pius-x-translations.b23.json`.

## Hagan — a comparison witness, not a blocker

The [National Library of Ireland](https://catalogue.nli.ie/Record/vtls000760522) confirms **Rev. John Hagan, *Catechism of Christian Doctrine*, Dublin: M. H. Gill, 1914, 152 pages**. No readable original 1914 prayer appendix has been recovered in this batch.

A [Hagan-related online transcription of Q972–985](https://sites.google.com/view/pius-x-catechism/on-daily-exercises-and-devotions) permits a **secondary comparison of Q974's English sense**, not a certification of the exact 1914 printed text. Comparisons are recorded in `data/pray/daily-prayer-hagan-comparison.b24.json`.

Key example: the authenticated 1905 appendix includes **"created me"** in the thanksgiving; the Hagan-related online English text says only that God has **"made me a Christian"**. Our draft preserves *both*, faithful to the 1905 source. Elsewhere, "all my actions" vs "all my acts" and "preserve me this day from sin" vs "keep me this day without sin" are compatible senses, not grounds to change the source.

The 1913 revised evening prayer is **not** verifiable through the 1905-related Hagan online Q984. If the actual 1914 printed book becomes readable, record precise page and compare separately.

## Review behavior and release policy

The offline [editorial reviewer](./DAILY-PRAYER-REJECTION-REVIEW-2026-10-28.html) starts on the St Pius X primary routine and shows its stage list in either 1905 or 1913 order, with **Latin / English / Français** selectors. For the 1905 morning core prayer in English, a disclosure compares the translation to Hagan-related wording and explicitly warns that the exact 1914 print is not verified.

Source languages remain in the research registry for verification and provenance. Their absence from the reading surface is deliberate. Missing text stages show a warning rather than switching to an unverified text or source language. The original appendix's minor grammatical/transcription discrepancy remains recorded in B22.

No new prayer wording is on the live reader. Releasing historical text requires editorial approval, careful original-copy collation, and a documented rights/reuse decision. `DAILY_APPROVED_SEQUENCE_RELEASE_V1.enabled=false`; the publication manifest remains empty.
