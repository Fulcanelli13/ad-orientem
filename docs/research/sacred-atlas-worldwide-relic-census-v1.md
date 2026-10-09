# Sacred Atlas — worldwide relic census, subject-first governance (v1)

Status: **editorial/research protocol**. This does not grant automatic approval to any reported relic, site, or private revelation and does not replace the existing published registry.

## Fundamental unit of research

Study **saints / sacred subjects and specific relic objects first**, then map verified permanent custodians. Do not create a new pilgrimage pin merely because a church contains a tiny relic fragment. One subject can have multiple claimed objects; one object can move through custodians over time; one custodian may hold many objects.

Relational structure:

1. **Subject**: canonically identified saint, Blessed, biblical figure, the Blessed Virgin, Our Lord, or a named collective. Collections are not silently treated as individuals; Servants of God and Venerables are distinct from canonized/beatified persons.
2. **Relic object / claim**: canonical object ID, body / major part / fragment / clothing / used object / touched object / historical Passion object / unclassified treasury, provenance chain, traditional identity, historical disputes, and primary evidence.
3. **Custody assertion**: object-to-place relationship, custodian, permanency, access/display restrictions, most recent verified source date, and competing/duplicate claims.
4. **Saint's devotional reach**: independently sourced universal, international, regional, local, or unassessed prominence; this is *not* a measure of holiness. Consider the 1962 Roman liturgical books, local calendars, patronage, pilgrimage continuity, devotional literature, and historical significance separately. Do not infer fame from number of relics.
5. **Publication decision**: *major shrine*, *regional significant shrine*, *contextual reference only*, or *research hold*, with a documented reason. Map pins are place-level and never one pin per reliquary.

## Two independent classifications, never conflated

### Traditional Catholic relic classes (descriptive)
- **First class**: human bodily remains of a Saint/Blessed or bodily fragments; body vs major part vs tiny fragment stays separate.
- **Second class**: an object personally used/worn/owned by the saint, when its identification is supportable.
- **Third class**: devotional object touched to a first-class relic (some usages also discuss contact with a shrine); these should **not** produce worldwide map pins by themselves.
- **Exceptional sacred-object category**: Passion relics, claimed Marian garments, Holy Land objects, and other ancient objects do not automatically fit modern saint bodily-relic classes. Catalogue type and attribution explicitly; do not force them into first class.
- A *grave site* without established bodily remains is a **commemorative tomb**, not automatically a first-class relic. A mixed treasury is a **collection**, not one graded relic.

### Ecclesiastical significance and authentication (separate)
The Holy See's 2017 instruction differentiates **significant relics** (body or notable bodily parts or full ashes) from **non-significant relics** (small bodily fragments or items of direct contact), and requires appropriate ecclesiastical documentation for exposure to public veneration. It is not the same axis as the first/second/third-class shorthand.
Record distinct values for: material type, relic class, physical extent, authentication evidence, historical attribution confidence, display status, and liturgical cult status. Unknown ≠ authenticated.
- Primary norm (FR): https://www.vatican.va/roman_curia/congregations/csaints/documents/rc_con_csaints_doc_20171208_istruzione-reliquie_fr.html
- Canon 1187, 1190: https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann1166-1190_en.html
- Popular piety context, CCC 1674–1676: https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_four/article_1.html
- Traditional three-class explanatory reference (secondary): https://www.catholic.com/magazine/online-edition/st-charles-borromeo-and-the-power-of-relics

## Research before mapping

Build an international **subject-first census** through ecclesiastical primary sources: Vatican and diocesan records; canonical recognition and reliquary records; cathedral, basilica, monastic order and official shrine archives; academic and heritage catalogues as corroboration. Organize research by (a) Our Lord and the Passion, (b) the Blessed Virgin, (c) Apostles / Evangelists / biblical figures, (d) Church Fathers / Doctors, (e) major saints and founders, (f) regional patrons and missionary saints, (g) other saints, local cults, and historically disputed subjects.

Never claim a *complete world inventory* without defining and sourcing the census frame. Hundreds of unknown fragments cannot reliably be counted as independent sites. Preserve obscure saints as research entries where evidence warrants, without overwhelming the world map.

For **each subject**, first compile its major relic claims (body, tomb, head, heart, notable part, principal garments/objects), custodians and relocations; then cover minor fragments as aggregated notes when useful. Record conflicts (e.g. two sites claiming a head) without declaring one authentic on the basis of the pin.

## Display policy and selectivity

Default world map: significant documented destination or historically consequential unique object only. Secondary regional map: documented local cult and important permanent relic even for a little-known saint. Ordinary fragments and third-class objects: available in shrine profiles where directly attested, **not** new map pins. Legacy published records remain untouched pending reviewed migration; never delete by an automated fame score.

Promotion requires source-traced custody, qualification of claimed authenticity, a single canonical Place, a reason that destination matters, and linkable shrine contacts. Calendar, devotions and novenas are associated *after* subject identity and shrine significance are established; never invent feast dates, Mass availability or pilgrim access.

## Immediate migration requirements

The legacy `data/explore/sacred-phenomena-seed.v1.json` field `relic_kind` describes heterogeneous objects, not consistent first/second/third-class grades. `associated_person` is free text and includes spelling variants, collectives, and sacred subjects; it must not become a canonical saint ID automatically. The audit below is **triage**, not automatic canonicalization or suppression.

Run `npm run atlas:audit-relic-subjects` to see every existing relic record, proposed *research* material category, legacy subject string, and required review flags. Future bulk research must go into a separate **subject / object / custody** census and be deduplicated prior to production Place integration.
