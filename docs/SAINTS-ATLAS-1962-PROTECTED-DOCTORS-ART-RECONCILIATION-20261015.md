# Map of Saints — 1962 protected feasts, Doctors and historic art cross-owner reconciliation

15 October 2026 · [Draft Saints PR #1227](https://github.com/Fulcanelli13/ad-orientem/pull/1227)

## Exact source method

The new reproducible `tools/saints/reconcile-2026-cross-owner-evidence.mjs` joins the original **365-day 2026 resolved Calendar** with **pinned, read-only** source JSON from the relevant *other PRs*. The GitHub Actions pipeline downloads these original registries at exact commit IDs:

- Calendar PR #1226, commit `622e9073272948e90549851ad30efcf3b7d7ec2a`: `data/calendar/cum-sanctissima-protected-third-class.review.v1.json` (70 source IDs) and `data/calendar/doctors-of-church-roster.review.v1.json` (38 people).
- Sacred Art PR #1231, commit `8cfaaf62e7d0dee14dbad182e58d0aa8009dfcdb`: W62 historical 252 date/311 component occurrence *expectations*, including 36 actual date locks, and W63 365-date candidate image crosswalk.

These records are **never copied into a new canonical Saints data registry**, and the resolver itself is not modified. All resulting comparisons include exact identity, observed day, main source ID and named commemoration evidence. `saints-2026-protected-doctors-historicart-crosswalk.json` is the machine-readable output preserved in CI's artifact.

## Source findings (validated through read-only 2026 resolver run)

| Group | Observed principal on nominal date | Named commemoration with matching exact source ID | Not visible under expected source ID in 2026 | No assigned 1962 source ID | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| 70 protected third-class feasts | 50 | 6 | 14 | 0 | 70 |
| 38 Doctors of the Church | 22 | 5 | 7 | 4 | 38 |

The 70 protected records represent liturgical **feast identities**, **not 70 individual saints**. The Doctor roster records the modern honour independently of its possible 1962 feast source, so neither current status nor feast rank is invented from the other.

Of the **14** protected feasts not observed under their exact expected 1962 ID in 2026:
- **11** have an observed Sunday principal on the nominal date: St Francis of Assisi (4 October), Cecilia (22 November), Nicholas (6 December), Lucy (13 December), Conversion of St Paul (25 January), Ignatius of Antioch (1 February), Basil the Great (14 June), Aloysius Gonzaga (21 June), Vincent de Paul (19 July), Alphonsus Liguori (2 August), and Cosmas/Damian (27 September).
- **Three** have a major non-Sunday Temporale principal instead: Leo the Great (11 April, Saturday in Easter Octave), Gregory VII (25 May, Monday after Pentecost), and Philip Neri (26 May, Tuesday after Pentecost).

Six protected source IDs are directly found **as named commemorations** on the nominal day: Perpetua/Felicity (6 March), Thomas Aquinas (7 March), Frances of Rome (9 March), Gregory the Great (12 March), Benedict (21 March) and Gabriel the Archangel (24 March). This is source observation, **not** an independent claim of correct oration precedence under every 1962 rubrical exception.

**None of these 14 is a missing saint from the historical calendar merely because its 2026 source ID is not observed as principal.** The join never silently turns a Sunday override into a fictitious cancellation, and a commemoration is retained separately from the principal.

## Doctors, historical art and imagery

- **38 Doctors:** 22 principal on nominal date, five source-ID-matched commemorations, seven not visible under exact ID, and four without a corresponding 1962 source ID in this Calendar roster. Those four are not treated as non-saints or denied an individual cult.
- **W62 historic scope:** 252 saint-bearing calendar dates and 311 saint/group component occurrence targets, with **36 serialised date locks**. These are not 311 independently recovered full person records. The locks are attached to observed day evidence with explicit identity review status, never auto-matched by saint-name substring.
- **W63 2026 artwork research:** all 365 art-owner dates aligned; **zero** date-specific principal source IDs from W63's scoped leads disagreed with the canonical 2026 resolver. **49 dates** carry scoped artwork research associations; those are unapproved candidates, not 49 finished pictures. In these limited research tables, 22 dates have only globally rejected original candidates, and 27 have at least one remaining unapproved candidate; other source corpora still require joining.
- Each piece of evidence carries the existing source-owner IDs. An image may serve a Calendar, Saint, Bible atlas and Shrine context through **one physical artwork record**, not duplicated files. Existing user ratings—particularly physical-original 0–2 rejections—remain mandatory.

## Remaining work to certify actual coverage

1. Extract the **full 311 historical component instances** from the original v43.33 runtime (the W62 branch itself warns they are not yet serialised); compare their original IDs and month/date with the observed and nominal feast sources. Do not invent 311 rows from 104 recovered ID candidates.
2. Cross-check **multiple 1962 years** for transferred feasts, Sunday precedence and additional/local commemorations. One 365-day 2026 run is not a complete independent general Sanctoral.
3. Classify each record as individual, collective martyr group, angel, Marian, Christological or event **using sources**, not surface text alone. Preserve the Calendar PR #1226's already researched later saints and Doctors as supplementary, with no silent insertion into the original 1962 Missal.
4. For every actual saint and day, join W63 and broader Sacred Art to user-rated, rights-cleared exact physical originals. `NO_IMAGE` and rejected-original decisions must survive; only then calculate genuine art coverage and gaps.
5. Extend the six existing substantive EN/FR Lives and their category/extraordinary-event schema via one canonical Saints owner, avoiding repeated research or additional Place pins.

**Publication gate:** Still a draft data crosswalk, no 1962 Calendar, Proper, rank, Mass, art or public GitHub Pages changes. Other workstreams keep their own registry and PR authority.
