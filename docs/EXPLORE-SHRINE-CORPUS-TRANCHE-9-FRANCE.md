# Explore Shrine Corpus — Tranche 9 · France

## Rationale

After Tranche 8, France is the largest remaining density gap in the live traditional-Mass Directory: roughly 95 live Directory rows against five canonical French Explore Places at the start of this tranche. The tranche expands the shared Place/Shrine/Pilgrimage corpus while preserving the rule that identity is never inferred from geographic proximity.

## Added Places

- Chapelle Notre-Dame de Bermont, Greux
- Basilique Notre-Dame d’Arcachon — Sanctuaire Notre-Dame des Marins
- Sanctuaire Notre-Dame de Pontmain
- Sanctuaire Notre-Dame de Miséricorde de Pellevoisin
- Sanctuaire Notre-Dame de Montligeon
- Chapelle Notre-Dame de la Médaille Miraculeuse, rue du Bac, Paris

All six are stored as address-only Places until Place-level coordinate provenance is locked; none becomes map-publishable merely because a Directory venue elsewhere has coordinates.

## Exact Directory identity bridges

Only two relationships are promoted to CONFIRMED LOCATED_AT because the live Directory venue and shrine Place are the same physical identity:

- FSSP Basilique Notre-Dame, Arcachon → Notre-Dame des Marins Place
- FSSP Ermitage Notre-Dame de Bermont, Greux → Bermont Place

Pontmain, Pellevoisin, Montligeon and rue du Bac receive no Directory association by proximity.

## Pilgrimage and Calendar policy

The tranche adds destination pilgrimages for all six Places plus recurring pilgrimage/observance records:

- Pontmain apparition anniversary — fixed 17 January; Calendar owns `observance.pontmain_apparition_anniversary`.
- Pontmain Assumption pilgrimage — reuses `feast.assumption_of_mary`.
- Pellevoisin grand annual pilgrimage — last weekend of August; `NO_FIXED_CALENDAR_BINDING`.
- Montligeon Pèlerinages du Ciel — recurring November cycle with year-specific dates; `NO_FIXED_CALENDAR_BINDING`.
- Rue du Bac / Miraculous Medal — fixed 27 November; Calendar owns `observance.miraculous_medal_nov27`.

No private recurrence formula is manufactured.

## Customs Atlas

Six source-backed attestations are added: Bermont pilgrimage practice associated with Saint Joan of Arc; Pontmain's 17 January apparition anniversary and votive-candle offering; Pellevoisin's grand annual pilgrimage; Montligeon's November prayer for the dead; and organized pilgrimage to rue du Bac. No custom is inferred merely because a Place is Marian or a shrine.

## Corpus after tranche

- 62 canonical Places
- 4 confirmed Directory → Place links
- 60 Shrines
- 79 Pilgrimages
- 17 routes
- 58 temporal links
- 60 Customs attestations
- 130 Shrine/Pilgrimage sources
- 64 Customs sources

## Primary sources

- https://www.nd-bermont.fr/
- https://bordeaux.catholique.fr/le-diocese/decouvrir-le-diocese/les-sanctuaires/notre-dame-des-marins/
- https://sanctuaire-pontmain.fr/
- https://www.pellevoisin.net/
- https://montligeon.org/le-sanctuaire-notre-dame-de-montligeon/
- https://www.chapellenotredamedelamedaillemiraculeuse.com/
