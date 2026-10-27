# 1962 Mass reader — source-owned seasonal Preface recovery (26 October 2026)

## Scope and authority

This is an **upstream Mass reader fix**, separate from Calendar Ordo draft PR #1739.
The Calendar 365-day audit identified historical `Communis` Preface fallbacks in the
canonical general Roman 1962 Mass source for 22 Lenten dates and 8 Pentecost
Vigil/octave dates. The Pentecost Sunday recovery was already independently present.
The other **29 newly source-owned cases** are enabled only where the principal
celebration ID and underlying canonical Proper path jointly identify the source.

Primary rubrical authority: **1960 General Rubrics of the Roman Missal**,
[§482, §486(a) and §493(a)](https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html).
Original trilingual source text: the named `[Quad]` and `[Spiritu]` sections of the
[Divinum Officium Prefationes source](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Ordo/Prefationes.txt).

## Recovery preconditions

The existing `recoverReaderProperOmissions` operates on the canonical selected
Mass Proper, not the Calendar widget. The new authenticated owner matching requires:

- For **Lent**: `tempora:Quad[1-4]-[0-6]:[1-3]:v` and precisely the matching `Tempora/QuadN-D` Proper path. Section `[Quad]` is retrieved in Latin, English and French with a verified `de Quadragesima` Latin heading.
- For the **Pentecost Vigil and octave**: `tempora:Pasc6-6:1:r` or `tempora:Pasc7-[1-6]:1:r` and its exact `Tempora/PascN-D` path. Section `[Spiritu]` is retrieved in all three languages, with `de Spiritu Sancto` Latin heading. The existing special `Pasc7-0` Pentecost Sunday rule remains.
- The original selected Preface heading must be **`Communis`**. Non-Common or already-correct sources are **never replaced**. Wrong owner, path, local or votive formulary cannot use this seasonal recovery.
- A failed source read, missing translation, wrong named section or mismatched heading does not produce a substitute Preface. Diagnostic warnings are retained; the independent `inspect1962PrefaceSelection` reader gate now **withholds** a contradictory Common Preface under the specifically authenticated required seasonal source identities.
- The original source Proper is not mutated. The reader receives a frozen new source-backed projection with `prefaceSection`, `sourcePath`, `recoveryScope`, `rubric` and `originalProperSourcePath` provenance.

## Test and release boundary

`tests/mass-1962-lent-preface-recovery.mjs` verifies all new owner patterns,
trilingual source recovery, fail-closed partial-language handling, already-correct
text preservation, source-path mismatch, other formularies, and source outage.

`tests/mass-1962-lent-preface-production.mjs` visits **all 30 affected/baseline
dates in 2026** using the *actual* production day resolver and the Mass reader's
Preface slot. There must be 22 `de Quadragesima` and eight `de Spiritu Sancto`
results, with complete French and English. Checks include the original source
immutability and reader slot `READY` outcome.

`tests/mass-1962-preface-decision.mjs` covers the independent display block:
if the mandated seasonal Preface is still `Communis`, the reader's Preface slot
must be `MISSING`, not automatically `READY`.

No Calendar source, day precedence, ceremony, Schola cue, Office or local Ordo
selection is changed. This branch is **not** a complete 1962 Preface typica
edition collation.

## Remaining repair cohorts

The Calendar's original 52 conflicting dates are a **triage population**, not
52 independently verified errors in one common source. After the Lent/Pentecost
cohort, the next major work is the **Easter and Ascension seasonal group**.
The Easter Preface contains *distinct text interpolations* for the Vigil, octave,
and the rest of Eastertide. Recovery must certify the correct interpolation in
all three languages against the 1962 Missal, not simply copy the `[Pasch]`
section wholesale. The separate already published Minor Rogations Easter
Preface is not a general fallback license.

Also review Holy Week's proper Prefaces, first-class divine mysteries,
Marian insertions and remaining selected feast exceptions independently.
Do not transfer institute-specific rights or votive permissions from ICRSP.
