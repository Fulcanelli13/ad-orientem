# Explore Shrine Corpus — Tranche 3 (United States · Canada)

This tranche expands Explore into the two largest remaining North American user/Directory markets while preserving the same source and ownership rules used in the France/Ireland/Mauritius and DACH tranches.

## New civil geography

- United States (`geo:country:US`)
- Canada (`geo:country:CA`)

## New canonical Places

### United States
- National Shrine of Our Lady of Champion
- Shrine of Our Lady of Guadalupe, La Crosse
- Basilica and National Shrine of Mary Help of Christians at Holy Hill

### Canada
- Sanctuaire Sainte-Anne-de-Beaupré
- Sanctuaire Notre-Dame-du-Cap
- Martyrs' Shrine, Midland

All six are address-only in this tranche. They gain Place pages and source-backed pilgrimage records immediately, but no map point until coordinate provenance is separately locked.

## Pilgrimage models

### Champion
- open destination pilgrimage
- annual 9 October Solemnity pilgrimage
- Walk to Mary, first Saturday of May
- documented walking route from the National Shrine of Saint Joseph at St. Norbert College

### Guadalupe / La Crosse
- open shrine pilgrimage
- 12 December Our Lady of Guadalupe solemnity
- current official Traditional Latin Mass schedule

### Holy Hill
- open Marian pilgrimage destination
- current three-day traditional Catholic pilgrimage organized through Saint Pius V Chapel / SSPX

### Sainte-Anne-de-Beaupré
- historic destination pilgrimage
- annual 17–25 July novena
- Saint Anne feast on 26 July

### Notre-Dame-du-Cap
- Marian pilgrimage destination
- Assumption novena from 7 to 15 August

### Martyrs' Shrine
- national Canadian Martyrs destination
- current traditional chapter pilgrimage with relic veneration at the Shrine and Solemn High Mass in the Midland mission landscape
- documented walking route from Crystal Beach to Martyrs' Shrine

## Calendar

New semantic keys:
- `observance.our_lady_of_champion` -> 9 October
- `feast.our_lady_of_guadalupe` -> 12 December

Existing keys are reused:
- `feast.saint_anne` -> Sainte-Anne-de-Beaupré
- `feast.assumption_of_mary` -> Notre-Dame-du-Cap

Walk to Mary, the traditional Holy Hill pilgrimage and the Canadian Martyrs traditional pilgrimage remain `NO_FIXED_CALENDAR_BINDING` because their annual dates are not encoded as one immutable feast date.

## Customs Atlas

Existing Custom entities receive new exact Place attestations:
- `DEV-007` Regional shrine anniversaries -> Champion
- `DEV-010` Votive candle at a shrine -> Guadalupe / La Crosse
- `DEV-007` Regional shrine anniversaries -> Sainte-Anne-de-Beaupré
- `DEV-010` Votive candle at a shrine -> Notre-Dame-du-Cap

No new Custom ids are created for the Walk to Mary, Holy Hill or Canadian Martyrs pilgrimages because those are Pilgrimage entities, not generic customs.

## Guadalupe Traditional Latin Mass safeguard

The Shrine of Our Lady of Guadalupe publishes:
- Monday–Saturday 08:30 Traditional Latin Mass
- Sunday 09:00 Traditional Latin Mass

The current generated FSSP, ICKSP and IBP corpus search produced no Guadalupe / La Crosse venue match.

Therefore the repo stores:

`candidate:directory-place:US:guadalupe-la-crosse-tlm`

with status:

`IDENTITY_RESOLUTION_REQUIRED`

No canonical Directory venue or `directoryPlaceLink` is created from the shrine schedule alone.

## Resulting seed corpus

After tranche 3:

- Countries: 8
- Canonical Places: 21
- Shrines: 20
- Pilgrimages: 29
- Routes: 8
- Shrine/Pilgrimage temporal links: 20
- Customs attestations: 25
- Shrine/Pilgrimage sources: 50
- Customs sources: 29
- unresolved Directory→Place candidates: 2

The only Shrine map points remain the three provenance-locked French Places: Lourdes, Laghet and Paray.
