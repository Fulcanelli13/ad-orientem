# Explore Shrine Corpus — Tranche 8: US Mid-Atlantic

## Why this tranche

This tranche is based on a fresh read of the live generated Directory corpus after Tranche 7, not on the earlier country ranking.

Every country currently represented by the live FSSP / ICKSP / IBP generated corpus already has at least one canonical Explore Place. The next coverage gap is therefore depth inside the largest live markets.

The United States has the largest live Directory footprint while the pre-Tranche-8 Explore corpus had only three US canonical Places, all in Wisconsin. Pennsylvania is the strongest state-level concentration in the current live footprint once the FSSP and ICKSP rows are read together, with Maryland immediately useful as part of the same Mid-Atlantic Catholic geography.

The selected cluster adds six canonical Places:

- National Shrine of Saint Alphonsus Liguori — Baltimore, Maryland
- National Shrine of St. John Neumann — Philadelphia, Pennsylvania
- Basilica Shrine of Our Lady of the Miraculous Medal — Philadelphia, Pennsylvania
- National Shrine of Our Lady of Czestochowa — Doylestown, Pennsylvania
- The National Shrine of Saint Elizabeth Ann Seton — Emmitsburg, Maryland
- National Shrine Grotto of Our Lady of Lourdes — Emmitsburg, Maryland

All six are deliberately address-only. No coordinate is published without Place-level provenance.

## Directory identity rule

The National Shrine of Saint Alphonsus Liguori is a confirmed exact Directory-to-Place bridge.

The live FSSP Directory identifies the National Shrine of St. Alphonsus Liguori at West Saratoga Street in Baltimore and the shrine's own current site identifies the same named shrine and FSSP stewardship. This is identity evidence, not proximity inference.

No other Tranche 8 shrine receives a Directory link merely because a traditional community is nearby.

## Pilgrimage additions

The tranche adds eight pilgrimage identities:

1. St Alphonsus — destination pilgrimage / shrine visit
2. St John Neumann — destination pilgrimage
3. Miraculous Medal — destination pilgrimage
4. American Czestochowa — destination pilgrimage
5. American Czestochowa — multi-day walking pilgrimage
6. Seton Shrine — destination pilgrimage
7. Seton Shrine — annual Sea Services pilgrimage
8. National Shrine Grotto — destination pilgrimage

The American Czestochowa walking pilgrimage also adds one documented-but-unmapped route from Great Meadows, New Jersey to Doylestown. The source also records Trenton and Philadelphia pilgrimage groups; those are not promoted into invented route geometry.

## Temporal policy

Four temporal relationships are added.

- Miraculous Medal Monday Perpetual Novena — **NO_FIXED_CALENDAR_BINDING**. The shrine documents an uninterrupted Monday observance dating from 8 December 1930; a weekday recurrence is not reduced to a fake fixed date.
- American Czestochowa walking pilgrimage — **NO_FIXED_CALENDAR_BINDING**. The shrine describes it as annual / seasonal and keeps current dates in its events programme.
- Seton Sea Services pilgrimage — **NO_FIXED_CALENDAR_BINDING**. The shrine documents it as annual and documents the 2026 occurrence, but no unsupported recurrence formula is inferred.
- National Shrine Grotto feast day — **BOUND_TO_CALENDAR** through the already canonical `feast.our_lady_of_lourdes` key for 11 February. No duplicate Calendar key is created.

No new Calendar semantic key is required by this tranche.

## Customs Atlas additions

Five place-backed attestations are added:

- pilgrimage to the St John Neumann shrine
- votive candle practice at the Miraculous Medal Basilica Shrine
- American Czestochowa walking pilgrimage
- annual Sea Services pilgrimage at the Seton Shrine
- annual Lourdes feast-day novena at the National Shrine Grotto

The Tranche 8 additions remain separated by domain: Directory owns current TLM operations, Place owns physical identity, Shrine owns devotional identity, Pilgrimage owns journey identity, Customs owns attested practices, and Calendar owns recurring dates.

## Corpus delta

After this tranche:

- Geo areas: **24**
- Canonical Places: **56**
- Confirmed Directory → Place links: **2**
- Shrines: **54**
- Pilgrimages: **69**
- Routes: **17**
- Temporal links: **53**
- Customs attestations: **54**
- Shrine / Pilgrimage sources: **118**
- Customs sources: **58**

## Primary sources

- National Shrine of Saint Alphonsus Liguori: https://stalphonsusbalt.org/
- National Shrine of St. John Neumann: https://www.stjohnneumann.org/
- St John Neumann pilgrimages: https://www.stjohnneumann.org/pilgrimagesandretreats
- Basilica Shrine of Our Lady of the Miraculous Medal: https://miraculousmedal.org/visit-us/
- Miraculous Medal Perpetual Novena: https://miraculousmedal.org/pray/perpetual-novena/
- National Shrine of Our Lady of Czestochowa: https://czestochowa.us/
- American Czestochowa pilgrimage ministry: https://czestochowa.us/en/ministries/6-pilgrimage
- National Shrine of Saint Elizabeth Ann Seton: https://setonshrine.org/hours-directions/
- Seton Sea Services pilgrimage: https://setonshrine.org/press-release-the-national-shrine-of-saint-elizabeth-ann-seton-hosts-annual-pilgrimage-and-mass-for-the-sea-services/
- National Shrine Grotto of Our Lady of Lourdes: https://www.nsgrotto.org/
- National Shrine Grotto feast-day novena: https://www.nsgrotto.org/lourdesenrollment.html
