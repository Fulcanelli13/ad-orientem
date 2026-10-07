# Explore Shrine Corpus — Tranche 4 (Italy · Poland · Great Britain)

This tranche expands the canonical sacred-place corpus across Italy, Poland and Great Britain.

## New civil geography

- Italy (`geo:country:IT`)
- Poland (`geo:country:PL`)
- United Kingdom (`geo:country:GB`)

## New canonical sacred Places

### Italy
- Santuario Pontificio della Santa Casa di Loreto
- Pontificio Santuario della Beata Maria Vergine del Santo Rosario di Pompei

### Poland
- Jasna Góra
- Sanktuarium Pasyjno-Maryjne w Kalwarii Zebrzydowskiej

### Great Britain
- Catholic National Shrine and Basilica of Our Lady, Walsingham
- St Winefride's Shrine & Well, Holywell

An auxiliary Place is also created for **St Winefride's RC Church, Holywell**, because the traditional High Mass of the annual LMS Holywell pilgrimage is celebrated at the parish church before the procession to the separate Well shrine.

All seven new Places are address-only. No map point is published without independent coordinate provenance.

## Pilgrimage models

### Loreto
- open destination pilgrimage
- 9–10 December Venuta / Our Lady of Loreto cycle

### Pompei
- open Rosary pilgrimage destination
- recurring 8 May Supplica

### Jasna Góra
- open national Marian pilgrimage destination
- 26 August feast of Our Lady of Częstochowa with major walking-pilgrimage convergence

### Kalwaria Zebrzydowska
- open Passion-Marian pilgrimage destination
- Assumption cycle from 9–16 August, bound to the universal 15 August semantic owner

### Walsingham
- Catholic National Shrine destination
- 24 September feast of Our Lady of Walsingham
- annual Latin Mass Society walking pilgrimage from Ely with Traditional High Mass and procession

### Holywell
- ancient destination pilgrimage to St Winefride's Well
- 3 November liturgical feast of St Winefride
- annual LMS pilgrimage with High Mass at the separate parish church and rosary procession to the Well

## Calendar ownership

New local semantic keys:

- `observance.loreto_our_lady` -> 10 December
- `observance.pompeii_supplica_may_8` -> 8 May
- `observance.jasna_gora_czestochowa` -> 26 August
- `observance.walsingham_our_lady` -> 24 September
- `observance.holywell_saint_winefride` -> 3 November

Kalwaria reuses `feast.assumption_of_mary`.

The LMS Walsingham and Holywell pilgrimage dates remain `NO_FIXED_CALENDAR_BINDING`: their annual dates are organizer/calendar dependent and are not reduced to a fake permanent feast date.

## Customs Atlas

The existing regional shrine-anniversary Custom (`DEV-007`) receives exact Place attestations for:

- Loreto Venuta / feast
- Pompei Supplica
- Jasna Góra / Our Lady of Częstochowa
- Kalwaria Assumption cycle
- Walsingham feast
- Holywell / St Winefride feast

No new Custom id is created for pilgrimage routes, relic veneration, bathing at Holywell or the Pompei Supplica itself.

## Traditional-Mass Directory safeguards

Current generated FSSP, ICKSP and IBP snapshots contain no Walsingham or Holywell text match.

Two evidence candidates are therefore stored without canonical Directory links:

- `candidate:directory-place:GB:walsingham-lms-tlm`
- `candidate:directory-place:GB:holywell-st-winefride-church-tlm`

The Holywell candidate points to the **parish church**, not the Well shrine.

Annual pilgrimage evidence is insufficient to create a recurring Directory venue. Both remain `IDENTITY_RESOLUTION_REQUIRED`.

## Resulting seed corpus

After tranche 4:

- Geography areas: 13
- Canonical Places: 28
- Shrines: 26
- Pilgrimages: 37
- Routes: 10
- Shrine/Pilgrimage temporal links: 28
- Customs attestations: 31
- Shrine/Pilgrimage sources: 66
- Customs sources: 35
- unresolved Directory→Place candidates: 4

Only the previously provenance-locked shrine Places publish map coordinates. The tranche-4 Places remain address-only.
