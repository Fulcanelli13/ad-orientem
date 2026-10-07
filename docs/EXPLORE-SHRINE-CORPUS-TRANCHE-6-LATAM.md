# Explore Shrine Corpus — Tranche 6 (Mexico · Brazil · Colombia)

This tranche expands the canonical sacred-place corpus into Latin America using the strongest remaining live traditional-Mass footprint.

## New countries
- Mexico
- Brazil
- Colombia

## New canonical Places

### Mexico
- Insigne y Nacional Basílica de Santa María de Guadalupe
- Basílica de Nuestra Señora de Zapopan

### Brazil
- Santuário Nacional de Nossa Senhora Aparecida
- Basílica Santuário de Nossa Senhora de Nazaré do Desterro

### Colombia
- Santuario de Nuestra Señora del Rosario de Las Lajas
- Basílica de Nuestra Señora del Rosario de Chiquinquirá

Las Lajas publishes a provenance-backed map point from the Gobernación de Nariño source. The other five Places remain address-only.

## Pilgrimage models

### Guadalupe
- national Marian destination at Tepeyac
- principal 12 December pilgrimage and liturgy
- reuses the existing `feast.our_lady_of_guadalupe` Calendar owner

### Zapopan
- Basilica destination
- annual 12 October Romería
- documented walking route from Guadalajara Cathedral to the Basilica

### Aparecida
- Brazil's national Marian destination
- annual 3–12 October novena
- 12 October patronal feast and solemn procession

### Nazaré / Belém
- open Basilica destination
- annual Círio de Nazaré pilgrimage cycle
- documented Cathedral-to-Basilica procession route
- principal procession occurs on the second Sunday of October and therefore remains `NO_FIXED_CALENDAR_BINDING`

### Las Lajas
- Andean Marian pilgrimage destination
- September patronal cycle centered on 15 September

### Chiquinquirá
- national Marian pilgrimage destination in Boyacá
- annual 9 July observance

## Calendar

New semantic keys:
- `observance.zapopan_romeria` -> 12 October
- `observance.our_lady_aparecida` -> 12 October
- `observance.las_lajas` -> 15 September
- `observance.chiquinquira_july9` -> 9 July

Guadalupe reuses:
- `feast.our_lady_of_guadalupe` -> 12 December

Círio remains recurrence context rather than being reduced to a false fixed date.

## Customs Atlas

Existing `DEV-007` receives exact-place attestations for:
- Guadalupe / Tepeyac
- Zapopan Romería
- Aparecida patronal cycle
- Círio de Nazaré
- Las Lajas September cycle
- Chiquinquirá 9 July observance

No new custom id is created.

## Directory safeguards

Current generated FSSP / ICKSP / IBP snapshots were searched for:
- Guadalupe
- Zapopan
- Aparecida
- Nazaré
- Las Lajas
- Chiquinquirá

No exact shrine venue match was found. No canonical Directory→Place link and no unresolved candidate were added from ambiguous names or unrelated Guadalupe records.

## Resulting corpus

- Geography areas: 20
- Canonical Places: 42
- confirmed Directory→Place links: 1
- Shrines: 40
- Pilgrimages: 53
- Routes: 14
- temporal links: 41
- Customs attestations: 41
- Shrine/Pilgrimage sources: 92
- Customs sources: 45
- unresolved Directory candidates: 4

Mapped shrine Places now total seven: Lourdes, Laghet, Paray, Penrose Park, Marian Valley, Nne Enyemaka/Umuaka and Las Lajas.
