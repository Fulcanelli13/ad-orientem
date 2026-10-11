# 1962 Missal high-priority source review: 100 packets and three printed July feasts

**11 October 2026 — PR #1018 — source-critical research only.** Do not present any result here as a release-certified 1962 Scripture hyperlink. This batch materially advances *source comparison*, not full edition and translation certification.

## High-priority set is now fully prepared for line-by-line review

[Exactly 100 upstream source paths](../../data/geography/research/mass-1962-high-priority-100-evidence-packets-20261011.v1.json) have standardized source evidence. The packet generator [is reproducible](../../scripts/research/mass-1962-high-priority-packets.mjs), and its [dedicated GitHub Action](../../.github/workflows/mass-1962-high-priority-evidence.yml) passed its completeness/closed-gate checks.

| Observation | Count |
|---|---:|
| Source paths in high-priority cohort | 100 |
| Paths with extracted section evidence | 96 |
| Paths using older four-slot observations | 4 |
| Raw chant-section candidates | 513 |
| Named special chant sections | 141 |
| Raw Scripture-note candidates | 605 |
| Raw section directives | 129 |
| Whole-1962-edition and bilingual certified paths | **0** |
| Released app Scripture links | **0** |

The high-priority path set is not a full Missal denominator. `GradualeP`, `Tractus`, `GradualeL...`, etc. are **named source sections**, not proof that a specific day's Mass actually performs them. Many candidates are conditional votive or seasonal usages.

## Two printed-page samples, three independent source celebrations, 27 compared segments

The [1962 Missal printed sample pages 533–539](https://propria.org/wp-content/uploads/2019/12/sample-pages-from-propria.org-missale-romanum-1962.pdf) have been consulted in the relevant source locations; **six page images (533, 534, 537, 538, 539 and the Rosary separate excerpt earlier) are not six full-volume edition authentications**. The July sample volume's title and decree pages were not inspected.

1. **1 July, Precious Blood:** [nine segment comparisons](../../data/geography/research/mass-1962-precious-blood-printed-source-batch-20261011.v1.json) against [`Sancti/07-01`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/07-01.txt), including the inherited [Hebrews 9:11–15](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad5-0.txt) Epistle, `Graduale`, `Tractus`, and Eastertide `GradualeP`. The printed votive directions show that an ordinary Alleluia must not be substituted for the post-Septuagesima Tract, and Eastertide requires its special two-Alleluia form. The printed Collect additionally omits *solemni cultu* in votive Masses.
2. **3 July, St Irenaeus:** [nine source comparisons and a crucial exact alias](../../data/geography/research/mass-1962-irenaeus-calendar-alias-primary-source-20261011.v1.json). The ordinary `Sancti/07-03` upstream file identifies St Leo, not Irenaeus. The explicitly titled [`Sancti/07-03r`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/07-03r.txt) identifies **Irenaeus** and delegates its Mass sections to [`Sancti/06-28`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/06-28.txt). The sample Missal instead places St Irenaeus on **3 July, III class**. This is strong evidence that a calendar lookup keyed by date filename alone could produce the wrong Mass.
3. **5 July, St Anthony Mary Zaccaria:** [nine source comparisons](../../data/geography/research/mass-1962-zaccaria-printed-source-batch-20261011.v1.json) against [`Sancti/07-05`](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/07-05.txt). Both ordinary `Graduale` plus Alleluia, post-Septuagesima votive `Tractus`, and Eastertide dual Alleluia in `GradualeP` are explicitly supported in print. Gospel Mark 10:15–21; Epistle 1 Timothy 4:8–16.

**1 John 5:7–8 edition hold:** the Precious Blood Gradual contains the longer *Tres sunt ... in cælo* wording that appears in the Clementine Vulgate; [Clementine / Neo-Vulgate side-by-side comparison](https://www.bibliacatolica.com.br/en/vulgata-clementina-vs-neo-vulgata-latina/epistula-i-ioannis/5/) demonstrates that these cannot be naively merged into an edition-neutral verse string. Latin Mass text must not be silently replaced by alternate biblical editions.

## Verification and publication gates

[100-source evidence regression](../../tests/mass-1962-high-priority-evidence-packets.mjs) passes: complete path set, precise section ownership, and no invented publication flag. [Printed July regression](../../tests/mass-1962-printed-july-source-samples.mjs) enforces the 27 sample comparisons, conditions, alias and Comma Johanneum hold. Both have workflows. These tests validate internal consistency and observed evidence, not external typographical accuracy of all 1962 texts.

**Still needed:** verify the whole 1962 edition's title, decrees and calendar; independently authenticate feast selection/transfer; compare every Latin verse to the Clementine and named Crampon/Douay editions; resolve missing Commons; distinguish text quotation, liturgical composition, typology and Dujardin meditation; keep published LIVE, Mass, Atlas, and Formation unchanged until each release gate is met.

**Next bulk batch:** process other available printed-Missal sections against the 100 ordered packets, but prioritize **date aliasing, source inheritance and conditional chant placement** over merely accumulating printed-source coincidences.
