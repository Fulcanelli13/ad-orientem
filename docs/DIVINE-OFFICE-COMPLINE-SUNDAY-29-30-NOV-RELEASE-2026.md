# Divine Office · Sunday Compline release · 29–30 November 2026

**Scope.** Native Latin-only Compline for the universal Roman Office of
**29 November 2026, first Sunday of Advent**, and **30 November 2026,
St Andrew the Apostle (II class)**. These are independently appointed
Sunday-Psalter cases. This increment is **not** a universal weekly release.

## Rubrical authority and exact appointment

The 1960 Roman Breviary rubrics identify:
- **§166(h)** — on Sundays the Office's Compline is of Sunday;
- **§168(d)** — on II-class feasts the Office's Compline is of Sunday.

Primary rubrical source: [1960 Roman Breviary rubrics](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html).
For **29 November** the pinned dated appointment requires
`weekday=Dominica`, `officeClass=I_SUNDAY`,
`psalmDay=Dominica`, `marianSection=Advent` and
`ADVENT_SUNDAY_COMPLINE_SUNDAY_BR166_H`.

For **30 November** it instead requires
`weekday=Feria II`, `officeClass=II_FEAST`,
`psalmDay=Dominica`, `marianSection=Advent` and
`ST_ANDREW_APOSTLE_II_CLASS_SUNDAY_COMPLINE_BR168_D`.
The distinct civil weekday is intentional: St Andrew does not get
Monday's ferial psalms.

All elements are checked independently on each date before the public
reader can fetch any source.

## Independently verified complete Sunday psalter

The appointed text comprises **30 original Latin recitation stichs
and 329 Latin word tokens**:

| Psalm | Recitation stichs | Printed source |
| --- | ---: | --- |
| 4 | 10 | `Cum invocarem`; Psalm 4:2 divided into 2a/2b |
| 90 | 16 | `Qui habitat`; canonical verses 1–16 |
| 133 | 4 | `Ecce nunc`; Psalm 133:1 divided into 1a/1b |

Both independent printed witnesses were read against the pinned
traditional-Vulgate text, allowing differences of case, accents,
recitation pause symbols, print punctuation, ligatures, and page wrapping
but **no missing, changed or reordered Latin words**:

- David Siefker, *Diurnale Romanum* (2008), Sunday Compline printed pp.
  104–106; [indexed print witness](https://www.scribd.com/document/761102039/Breviarium-romanum-Breviario-romano-1961-1962).
- Consociatio Christi Regis, *Psalterium Romanum iuxta ritum 1962*
  (2023), Sunday Compline printed pp. 30–31; [printed source](https://ccregis.org/psalter_lt-en.pdf).

The 30-line lexical witness is stored privately at
`data/office/research/compline-sunday-2008-2023-fullword-witness.v1.json`.
`tests/divine-office-sunday-printed-full-word.mjs` checks every word
rather than merely comparing Psalm incipits. The page display converts
raw numeric prefixes to honest canonical references, including the two
split verses, without modifying prayer words.

The **original 1961 Mame Saturday or Sunday Psalter leaves are still
not available for verbatim collation**. Ad Orientem releases a
traditional-Clementine Vulgate Latin text under the **1960 Roman
Breviary rubrics**, not a reproduction or exact edition-facsimile of
the Mame 1961 printing. The separately verified Mame 1961
*Ordinarium* §§54–67 governs its full 40-moment liturgical sequence.
The original Divinum Officium Latin source is pinned at
`126a07f91ede04664108abb6fb20ace3f4de14b9` with the full MIT
attribution shipped alongside the public reader. English and French
translations remain out of scope.

## Regression and publication boundary

The explicit public set becomes **28, 29, 30 November and 5 December
2026**. The two Saturdays retain 41 displayed Saturday stichs, and
29/30 November require exactly **30 displayed Sunday stichs**. Every
date must still resolve to 42 original source blocks, 40
printed-Ordinary reading moments, original short `Per Dóminum`,
two blessing Amens, and the correct
priest/non-priest `Dóminus vobíscum` alternative. Both the
final-prayer examen and the introductory `Pater noster` mode are tested
in all four dates.

**1, 2, 3 and 4 December 2026 remain unpublished**, and no other
civil date, Office Hour, local calendar, or translation is enabled.
A failed original Latin fetch fails closed.

The 320px and 390px browser tests must open actual Latin readings for
both new dates, show correct dates, fetch only whitelisted original
Latin leaves, and preserve native navigation without overflow.
The exact-head PR's Office integration, required main gate and mobile
tests must succeed before merge. Deployment uses GitHub Actions and
GitHub Pages only; the production version is confirmed by exact-SHA
post-deploy evidence.
