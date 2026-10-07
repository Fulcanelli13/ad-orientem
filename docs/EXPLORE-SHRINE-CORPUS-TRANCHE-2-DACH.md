# Explore Shrine Corpus — Tranche 2 (Germany · Austria · Switzerland)

This tranche expands the canonical sacred-place corpus into the strongest coherent post-France cluster from the live traditional-Mass Directory footprint: Germany, Austria and Switzerland.

## New civil geography

- Germany (`geo:country:DE`)
- Austria (`geo:country:AT`)
- Switzerland (`geo:country:CH`)

## New canonical Places

### Germany
- `place:DE:altoetting-gnadenkapelle`
- `place:DE:kevelaer-gnadenkapelle`
- `place:DE:kevelaer-kerzenkapelle`

### Austria
- `place:AT:mariazell-basilica`
- `place:AT:maria-taferl-basilica`

### Switzerland
- `place:CH:einsiedeln-monastery`
- `place:CH:kloster-mariastein`

All seven are intentionally address-only in this tranche. No map point is published until the shared Place coordinate-provenance contract passes independently.

## Shrine identities

Six Shrine records are added:

- Our Lady of Altötting
- Our Lady, Consoler of the Afflicted — Kevelaer
- Our Lady of Mariazell
- Our Lady of Sorrows — Maria Taferl
- Our Lady of Einsiedeln
- Our Lady of Mariastein

The Kevelaer Kerzenkapelle is a separate auxiliary Place, not a duplicate Shrine identity.

## Pilgrimages

Destination pilgrimages:
- Altötting
- Kevelaer
- Mariazell
- Maria Taferl
- Einsiedeln
- Mariastein

Special annual records:
- Altötting Assumption observances
- Einsiedeln Engelweihe

The following remain recurrence/season context rather than fake single dates:
- Kevelaer pilgrimage season
- Mariazell principal pilgrimage season
- Mariastein first-Wednesday monthly pilgrimage

## Calendar ownership

Calendar gains:
- `feast.assumption_of_mary` -> 15 August
- `observance.einsiedeln_engelweihe` -> 14 September

The Shrine corpus stores only the semantic keys and registry ownership. It contains no duplicate date arithmetic.

## Customs Atlas

This tranche strengthens existing Custom entities rather than proliferating new ids:

- `DEV-009` Ex-votos -> Altötting Gnadenkapelle
- `DEV-010` Votive candle at a shrine -> Mariazell Kerzengrotte
- `DEV-007` Regional pardons and shrine anniversaries -> Einsiedeln Engelweihe

Other directly documented practices — candlelight processions, blessing devotional objects, vehicle blessings and monthly pilgrimage structure — remain source-backed Shrine/Pilgrimage context until the Custom SOT has the appropriate canonical concept.

## Kevelaer 1962 Mass safeguard

The official St. Marien Kevelaer schedule publishes a Sunday Mass according to the 1962 Missal in the **Kerzenkapelle**:
- 08:00 during pilgrimage season;
- 09:00 outside pilgrimage season.

This evidence does not create a Directory venue by itself.

The generated FSSP, ICKSP and IBP snapshots were checked and contain no Kevelaer text match.

Therefore the evidence is stored in:

`data/geography/directory-place-candidates.v1.json`

with status:

`IDENTITY_RESOLUTION_REQUIRED`

No canonical `directoryPlaceLink` is created for either the Kerzenkapelle or Gnadenkapelle. Future resolution must identify a current Directory venue independently.

## Resulting corpus

After this tranche:

- Geography countries: 6
- Canonical Places: 15
- Shrines: 14
- Pilgrimages: 19
- Routes: 6
- Shrine/Pilgrimage temporal links: 13
- Customs attestations: 21
- Shrine/Pilgrimage source records: 35
- Customs source records: 25

Only the three previously provenance-locked Shrine Places — Lourdes, Laghet and Paray — publish Shrine map points. The DACH Places remain address-only.
