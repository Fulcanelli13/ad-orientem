# 2026 Hero Coverage — complete Sunday and major feast working matrix

**As of 21 October 2026 · Editorial research, not production photo release**

This document is derived from the companion [structured master](../data/calendar/sacred-art-2026-complete-hero-coverage-master.v1.json) on a **fresh branch based on current `main`**, not by importing the stale Sacred Art implementation branch. The original ten curator-approved date assignments from 19 October remain locked under [draft PR #1532](https://github.com/Fulcanelli13/ad-orientem/pull/1532).

## Baseline

- **52 Sundays**, **53 observed Class I dates**, **17 additional editorial spotlight proposals**; union **102 unique civil dates** because Sunday/feast/spotlight rows overlap.
- **10 exact date-specific painting approvals** (five intersect Sundays). Those are not new approvals here. All ten have candidate local image files in PR #1532, but **zero photographs are currently published**.
- **44 older curator-selected subject assignments / 35 distinct formerly approved painting IDs** reconciled from earlier source; this does *not* make every placement a 2026 date-specific hero approval.
- **135 artworks rated eligible for further review** carried forward and protected from reinterpretation as published or date-approved images.
- Sundays: **29 research-source leads** across 52 dates; **23 have no such original-source leads** in the old Sunday research. Some of these overlap selected liturgical feasts. Not equivalent to 23 missing paintings.
- Class I: **30 dates have historical human-selected subject art**, including dates later locked in the ten. Other Class I dates have unselected research leads; **1 old-reconciliation gap on May 1 (St Joseph the Workman)**, which may have relevant prior St Joseph subject art but no verified exact St Joseph the Workman artwork.
- All **zero-cost, no-contact** rules apply; no email, museum negotiation, paid licensing, or substitute painting for locked date assignments. Sources require their own photograph reuse proof and human acceptance.

## Verified liturgical observations (production 1962 resolver)

The [full-year browser run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39577372645) **resolved all 102 unique 2026 target dates** against the actual production DayResolver, with **53/53 Class I principal IDs** and **10/10 protected approved principal IDs** matched. The entire observed-date proof is permanently preserved in [102 observed dates](../data/calendar/sacred-art-2026-102-observed-days-production-evidence.v1.json) and attached to this master. All 102 dates returned a ready Proper. This confirms their 1962 observance, not the visual artworks.

Seven older *spotlight title strings* differ literally from current calendar titles but refer to the actual observed dates; examples include Holy Name of Jesus and Holy Family. They are **not assumed to be suppressed feasts**. Their actual principal IDs and titles, rather than earlier suggested descriptions, are the authority.

The resolver's Gospel reference metadata was not exposed in the tested `gospel.ref/reference/citation` fields (0/102): previous Sunday painting-to-Gospel relation claims consequently remain **research assertions**, not independently source-verified scene assignments. Do not automatically publish those 32 scene hypotheses. An exact identity comparison against the October 13 rating ledger matched only one older Sunday painting lead, Juan de Flandes's *The Temptation of Christ* on February 22, rated **3**, which is still not a release permission or definitive user hero choice.

## Recovered exact physical artwork identities from historic choices

All **44 earlier user-chosen subject artwork IDs** now resolve to an actual artist, title, museum and original object URL in the existing 281-work research catalogue. **38** of those old subject choices have a catalogued CC0 **source claim**; **6** have other or qualified source-rights labels. Neither label automatically certifies a packaged photograph for the app. The four archived subject choices involving a now-excluded artist style are preserved for provenance but held out of new recommendations.

This resolves artwork identity for historical subject choices rather than merely copying IDs; the Class I table below now displays actual paintings where recovered. It does **not** turn historical Christmas, Easter octave or saint-subject choices into newly approved date-specific user heroes.

## Meaning of statuses

- `LOCKED_EXACT`: later curator selection for this exact 2026 day, artist/title fixed.
- `PRIOR_SUBJECT_SELECTION`: real older curator choice for a thematic subject or Proper; not equivalent to exact date approval.
- `SCENE_RESEARCH`: a plausible artwork linked to Sunday Gospel in prior research, with correctness not revalidated here; not approved.
- `RESEARCH`: general candidate IDs, some contextual/thematic; not approved.
- `UNASSIGNED` / `GAP`: no reconcilable exact approval in historic data. Do not imply that no useful artwork exists in the broader library.

**Key rule:** The first column is a *civil date*. **Actual production 1962 DayResolver principal IDs and titles have now been verified for 102/102 unique dates.** Named optional feast headings remain separate from observed principal identity and must use the attached runtime values.

## A. All 52 Sundays

| 2026 date | Editorial status | Existing hero/scene evidence (not final unless LOCKED) | Earlier scene leads |
|---|---|---|---:|
| 2026-01-04 | SCENE_RESEARCH | Guercino — The Circumcision of Christ | 1 |
| 2026-01-11 | UNASSIGNED | — | 0 |
| 2026-01-18 | UNASSIGNED | — | 0 |
| 2026-01-25 | SCENE_RESEARCH | Paolo Veronese — Christ and the Centurion | 1 |
| 2026-02-01 | SCENE_RESEARCH | Rembrandt van Rijn — Parable of the Laborers in the Vineyard | 2 |
| 2026-02-08 | SCENE_RESEARCH | Pieter Bruegel the Elder — Landscape with the Parable of the Sower | 1 |
| 2026-02-15 | SCENE_RESEARCH | Lucas van Leyden — Healing of the Blind Man of Jericho (Triptych) | 1 |
| 2026-02-22 | I Sunday of Lent | RESEARCH | Juan de Flandes — The Temptation of Christ; Jacopo Tintoretto (Jacopo Robusti) — The Miracle of the Loaves and Fishes |
| 2026-03-01 | II Sunday of Lent | RESEARCH | Juan de Flandes — The Temptation of Christ; Jacopo Tintoretto (Jacopo Robusti) — The Miracle of the Loaves and Fishes |
| 2026-03-08 | III Sunday of Lent | RESEARCH | Juan de Flandes — The Temptation of Christ; Jacopo Tintoretto (Jacopo Robusti) — The Miracle of the Loaves and Fishes |
| 2026-03-15 | IV Sunday of Lent | RESEARCH | Juan de Flandes — The Temptation of Christ; Jacopo Tintoretto (Jacopo Robusti) — The Miracle of the Loaves and Fishes |
| 2026-03-22 | Passion Sunday | RESEARCH | Scipione Pulzone — The Lamentation; Moretto da Brescia — The Entombment |
| 2026-03-29 | Palm Sunday | LOCKED_EXACT | Anthony van Dyck — The Entry of Christ into Jerusalem |
| 2026-04-05 | Easter Sunday | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-12 | Low Sunday | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-19 | UNASSIGNED | — | 0 |
| 2026-04-26 | UNASSIGNED | — | 0 |
| 2026-05-03 | UNASSIGNED | — | 0 |
| 2026-05-10 | UNASSIGNED | — | 0 |
| 2026-05-17 | UNASSIGNED | — | 0 |
| 2026-05-24 | Pentecost Sunday | LOCKED_EXACT | Jean II Restout — Pentecost |
| 2026-05-31 | Trinity Sunday | PRIOR_SUBJECT_SELECTION | Laurent Girardin — The Trinity |
| 2026-06-07 | SCENE_RESEARCH | Cornelis Droochsloot — The Parable of the Great Supper | 1 |
| 2026-06-14 | SCENE_RESEARCH | Workshop of Leopold Layer — Christ tells the Pharisees the Parable of the Lost Sheep | 1 |
| 2026-06-21 | UNASSIGNED | — | 0 |
| 2026-06-28 | UNASSIGNED | — | 0 |
| 2026-07-05 | SCENE_RESEARCH | Giovanni Lanfranco — The Miracle of the Loaves and Fishes | 1 |
| 2026-07-12 | UNASSIGNED | — | 0 |
| 2026-07-19 | SCENE_RESEARCH | Andrea Schiavone (Andrea Meldolla) — The Parable of the Unjust Steward | 1 |
| 2026-07-26 | SCENE_RESEARCH | Luca Giordano — Christ Cleansing the Temple | 1 |
| 2026-08-02 | SCENE_RESEARCH | Dirck van Delen — Church Interior with the Parable of the Pharisee and the Publican | 1 |
| 2026-08-09 | SCENE_RESEARCH | Philippe de Champaigne — Christ Healing the Deaf-Mute | 1 |
| 2026-08-16 | UNASSIGNED | — | 0 |
| 2026-08-23 | SCENE_RESEARCH | James Tissot — The Healing of Ten Lepers | 1 |
| 2026-08-30 | UNASSIGNED | — | 0 |
| 2026-09-06 | SCENE_RESEARCH | Wilhelm Kotarbiński — Raising of the Son of the Widow of Nain | 2 |
| 2026-09-13 | SCENE_RESEARCH | Anonymous monastic painters — Christ Healing the Man with Dropsy | 1 |
| 2026-09-20 | UNASSIGNED | — | 0 |
| 2026-09-27 | UNASSIGNED | — | 0 |
| 2026-10-04 | SCENE_RESEARCH | Andrei Mironov — Parable of the Wedding Feast | 1 |
| 2026-10-11 | SCENE_RESEARCH | Unknown Indian Mughal painter — Jesus Heals the Nobleman's Son in Capernaum | 1 |
| 2026-10-18 | SCENE_RESEARCH | Claude Vignon — Parable of the Unforgiving Servant | 1 |
| 2026-10-25 | Christ the King | LOCKED_EXACT | Ambrosius Benson — Salvator Mundi |
| 2026-11-01 | All Saints | LOCKED_EXACT | Carlo Saraceni — Paradise |
| 2026-11-08 | SCENE_RESEARCH | Lucas Gassel — The Parable of the Wheat and the Tares | 1 |
| 2026-11-15 | UNASSIGNED | — | 0 |
| 2026-11-22 | UNASSIGNED | — | 0 |
| 2026-11-29 | I Sunday of Advent | LOCKED_EXACT | John Martin — The Great Day of His Wrath |
| 2026-12-06 | II Sunday of Advent | RESEARCH | Luca Giordano — The Annunciation; Philippe de Champaigne — The Annunciation |
| 2026-12-13 | III Sunday of Advent | RESEARCH | Luca Giordano — The Annunciation; Philippe de Champaigne — The Annunciation |
| 2026-12-20 | IV Sunday of Advent | RESEARCH | Luca Giordano — The Annunciation; Philippe de Champaigne — The Annunciation |
| 2026-12-27 | UNASSIGNED | — | 0 |

## B. All 53 Class I dates

| 2026 date | Recorded observed title | Editorial status | Existing artist or artwork ID |
|---|---|---|---|
| 2026-01-01 | Octave Day of Christmas | PRIOR_SUBJECT_SELECTION | Carlo Dolci — Adoration of the Shepherds |
| 2026-01-06 | Epiphany of the Lord | PRIOR_SUBJECT_SELECTION | Quinten Massys — The Adoration of the Magi |
| 2026-02-18 | Ash Wednesday | RESEARCH | Juan de Flandes — The Temptation of Christ; Jacopo Tintoretto (Jacopo Robusti) — The Miracle of the Loaves and Fishes |
| 2026-02-22 | I Sunday of Lent | RESEARCH | nga-50726, met-437821 |
| 2026-03-01 | II Sunday of Lent | RESEARCH | nga-50726, met-437821 |
| 2026-03-08 | III Sunday of Lent | RESEARCH | nga-50726, met-437821 |
| 2026-03-15 | IV Sunday of Lent | RESEARCH | nga-50726, met-437821 |
| 2026-03-19 | St. Joseph, Spouse of the Bl. Virgin Mary | RESEARCH | — |
| 2026-03-22 | Passion Sunday | RESEARCH | met-437342, met-437156, met-437986 |
| 2026-03-25 | Annunciation of the Blessed Virgin Mary | PRIOR_SUBJECT_SELECTION | Philippe de Champaigne — The Annunciation |
| 2026-03-29 | Palm Sunday | LOCKED_EXACT | Anthony van Dyck — The Entry of Christ into Jerusalem |
| 2026-03-30 | Feria II of Holy Week | RESEARCH | Scipione Pulzone — The Lamentation; Moretto da Brescia — The Entombment |
| 2026-03-31 | Feria III of Holy Week | RESEARCH | Scipione Pulzone — The Lamentation; Moretto da Brescia — The Entombment |
| 2026-04-01 | Feria IV of Holy Week | RESEARCH | Scipione Pulzone — The Lamentation; Moretto da Brescia — The Entombment |
| 2026-04-02 | Holy Thursday | LOCKED_EXACT | Ugolino da Siena — Last Supper |
| 2026-04-03 | Good Friday | PRIOR_SUBJECT_SELECTION | Pedro Orrente — The Crucifixion; Scipione Pulzone — The Lamentation |
| 2026-04-04 | Holy Saturday | PRIOR_SUBJECT_SELECTION | Moretto da Brescia — The Entombment |
| 2026-04-05 | Easter Sunday | PRIOR_SUBJECT_SELECTION | cma-78982 |
| 2026-04-06 | Monday in the Octave of Easter | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-07 | Tuesday in the Octave of Easter | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-08 | Wednesday in the Octave of Easter | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-09 | Thursday in the Octave of Easter | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-10 | Friday in the Octave of Easter | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-11 | Saturday in the Octave of Easter | PRIOR_SUBJECT_SELECTION | Johann König — The Resurrection of Christ |
| 2026-04-12 | Low Sunday | PRIOR_SUBJECT_SELECTION | cma-78982 |
| 2026-05-01 | St. Joseph the Workman | GAP | — |
| 2026-05-14 | Ascension of the Lord | PRIOR_SUBJECT_SELECTION | Hans Süss von Kulmbach — The Ascension of Christ |
| 2026-05-23 | Vigil of Pentecost | LOCKED_EXACT | Juan Bautista Maíno — The Pentecost |
| 2026-05-24 | Pentecost Sunday | LOCKED_EXACT | Jean II Restout — Pentecost |
| 2026-05-25 | Monday after Pentecost | PRIOR_SUBJECT_SELECTION | Master of the Baroncelli Portraits — Pentecost |
| 2026-05-26 | Tuesday after Pentecost | PRIOR_SUBJECT_SELECTION | Master of the Baroncelli Portraits — Pentecost |
| 2026-05-27 | Ember Wednesday of Pentecost | LOCKED_EXACT | Philippe de Champaigne — La Petite Cène |
| 2026-05-28 | Thursday after Pentecost | PRIOR_SUBJECT_SELECTION | Master of the Baroncelli Portraits — Pentecost |
| 2026-05-29 | Ember Friday of Pentecost | PRIOR_SUBJECT_SELECTION | Master of the Baroncelli Portraits — Pentecost |
| 2026-05-30 | Ember Saturday of Pentecost | PRIOR_SUBJECT_SELECTION | Master of the Baroncelli Portraits — Pentecost |
| 2026-05-31 | Trinity Sunday | PRIOR_SUBJECT_SELECTION | cma-136507 |
| 2026-06-04 | Corpus Christi | RESEARCH | Jean Auguste Dominique Ingres — The Virgin Adoring the Host |
| 2026-06-12 | Sacred Heart of Jesus | LOCKED_EXACT | Juan Patricio Morlete Ruiz — The Heart of Jesus |
| 2026-06-24 | Nativity of St. John the Baptist | PRIOR_SUBJECT_SELECTION | Spanish Catalan Painter — The Beheading of Saint John the Baptist |
| 2026-06-29 | Sts. Peter & Paul | PRIOR_SUBJECT_SELECTION | Jusepe de Ribera — The Tears of Saint Peter |
| 2026-07-01 | The Precious Blood of Our Lord Jesus Christ | RESEARCH | Pedro Orrente — The Crucifixion; Scipione Pulzone — The Lamentation |
| 2026-08-15 | Assumption of the Blessed Virgin Mary | PRIOR_SUBJECT_SELECTION | Anonymous painter (probably Rubens workshop; NGA) — The Assumption of the Virgin |
| 2026-09-29 | Dedication of St. Michael the Archangel | RESEARCH | Ignacio de Ries — Saint Michael the Archangel |
| 2026-10-25 | Christ the King | LOCKED_EXACT | Ambrosius Benson — Salvator Mundi |
| 2026-11-01 | All Saints | LOCKED_EXACT | Carlo Saraceni — Paradise |
| 2026-11-02 | Commemoration of All Souls | LOCKED_EXACT | Ludovico Carracci — An Angel Frees the Souls of Purgatory |
| 2026-11-29 | I Sunday of Advent | LOCKED_EXACT | John Martin — The Great Day of His Wrath |
| 2026-12-06 | II Sunday of Advent | RESEARCH | met-436502, met-438724 |
| 2026-12-08 | Immaculate Conception of the Blessed Virgin Mary | PRIOR_SUBJECT_SELECTION | Bartolomé Esteban Murillo — The Immaculate Conception |
| 2026-12-13 | III Sunday of Advent | RESEARCH | met-436502, met-438724 |
| 2026-12-20 | IV Sunday of Advent | RESEARCH | met-436502, met-438724 |
| 2026-12-24 | Vigil of Christmas | RESEARCH | Carlo Dolci — Adoration of the Shepherds; Bernardo Cavallino — Adoration of the Shepherds |
| 2026-12-25 | The Nativity of Our Lord | PRIOR_SUBJECT_SELECTION | Carlo Dolci — Adoration of the Shepherds |

## C. 17 additional major-feast highlights

Editorial *possibilities* only. These may be superseded by Sunday/Class I principal observance; never show them as a principal based solely on a nominal date.

| 2026 date | Nominal title | Theme | Status |
|---|---|---|---|
| 2026-01-04 | Most Holy Name of Jesus | holy-name | UNASSIGNED |
| 2026-01-11 | Holy Family | holy-family | UNASSIGNED |
| 2026-01-13 | Commemoration of the Baptism of Our Lord | baptism | UNASSIGNED |
| 2026-02-01 | Septuagesima Sunday | septuagesima | UNASSIGNED |
| 2026-02-02 | Purification of the BVM / Presentation of the Lord (Candlemas) | presentation | UNASSIGNED |
| 2026-02-11 | Our Lady of Lourdes | our-lady-lourdes | UNASSIGNED |
| 2026-07-02 | Visitation of the Blessed Virgin Mary | visitation | UNASSIGNED |
| 2026-07-22 | St. Mary Magdalene | magdalene | UNASSIGNED |
| 2026-08-06 | Transfiguration of Our Lord | transfiguration | UNASSIGNED |
| 2026-09-08 | Nativity of the Blessed Virgin Mary | nativity-mary | UNASSIGNED |
| 2026-09-14 | Exaltation of the Holy Cross | exaltation-cross | UNASSIGNED |
| 2026-09-15 | Seven Sorrows of the Blessed Virgin Mary | mater-dolorosa | UNASSIGNED |
| 2026-10-03 | St. Thérèse of the Child Jesus | therese-lisieux | UNASSIGNED |
| 2026-10-07 | Our Lady of the Rosary | our-lady-rosary | UNASSIGNED |
| 2026-11-09 | Dedication of the Lateran Archbasilica | lateran-dedication | UNASSIGNED |
| 2026-11-22 | Last Sunday after Pentecost | last-sunday | UNASSIGNED |
| 2026-12-28 | Holy Innocents | holy-innocents | UNASSIGNED |

## Work-order derived from this evidence

**First:** recover/preserve every exact date-specific painting approval already frozen (ten on release PR #1532; 40/40 real Home+Calendar simulated visual checks completed). 

**Second:** 1962 production DayResolver verification is **complete (102/102)**. Next check the exact appointed Gospel scene before an old Sunday lead becomes a recommendation. Avoid treating date overlap as different artworks required.

**Third:** map the **25 unlocked Class I dates with older human subject selections** to actual paintings and institutional free image sources before opening new painting research. Distinguish 'depicts appointed Gospel' from 'liturgically appropriate seasonal theme'. 

**Fourth:** reconcile rated/rejected artworks against the 26 unlocked Sundays with scene-source evidence. Prior source link does not equal aesthetic acceptance or a licence.

**Fifth:** examine the remaining **21 unlocked Sundays without an explicit scene-source lead**, using already approved seasonal or subject artwork when genuinely appropriate. Research a different free-source painting only for a real gap and only with explicit curator review.

**Sixth:** optional non-Class I spotlight curation comes after Sundays/Class I and must respect actual 1962 observance.

The master preserves citations as repository file paths and exact source URLs; it never invents image licences, changes painting selections or promotes unverified graphics.
