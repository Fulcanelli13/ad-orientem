# Ad Orientem — ICKSP / ICRSP devotional gap audit B01

**28 October 2026 · Research-only; no prayer text published.**

Input sites:
- [Institute of Christ the King — US, Devotions and Prayers](https://institute-christ-king.org/resources/devotions-prayers)
- [Institut du Christ Roi — France, Textes liturgiques](https://icrspfrance.fr/textes-liturgiques.php)

This comparison uses the **48 prayer entries in the current canonical `src/pray/canonical-data.js` bank**, plus text/title probes of `traditional-pray-data.js` and `traditional-pray-runtime.js`. **Absence from that bank is not proof of global absence from all Ad Orientem modules**. No duplicate should be released without global-ID/incipit matching.

## Prioritized US devotional additions

| Prayer / group | Canonical-bank result | Priority | Correct integration |
|---|---|---|---|
| [Consecration to the Immaculate Conception](https://institute-christ-king.org/resources/devotions-prayers/610-devotions-consecration-immaculate-conception) | distinct-from-existing-immaculate-heart-consecration | P1 | Marian devotions; calendar 8 December |
| [Dedication to Christ the King](https://institute-christ-king.org/resources/devotions-prayers/611-devotions-dedication-christ-king) | close-existing-form-compare | P2 | Christ the King devotional; calendar feast |
| [Prayer of Reparation](https://institute-christ-king.org/resources/devotions-prayers/613-devotions-reparation) | related-existing-form-text-unverified | P2 | Sacred Heart devotions; First Friday contextual suggestion |
| [Prayer for Priests — O Jesus, Eternal Priest](https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests) | not-present-in-48-canonical-bank | P0 | Priesthood, vocations, optional First Thursday |
| [Prayer for Priests — Sacred Heart, Eternal High Priest](https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests) | not-present-in-48-canonical-bank | P1 | Priesthood, vocations |
| [Prayer to the Infant Jesus](https://institute-christ-king.org/resources/devotions-prayers/615-devotions-prayer-infant-jesus) | not-present-in-48-canonical-bank | P1 | Infant Jesus; Christmas season |
| [Novena to the Divine Infant King](https://institute-christ-king.org/resources/devotions-prayers/616-devotions-prayer-infant-king) | not-present-in-48-canonical-bank | P0 | Novenas; Infant Jesus |
| [Prayer to the Virgin: Remedy Against Evil Spirits](https://institute-christ-king.org/resources/devotions-prayers/617-devotions-prayer-virgin-remedy) | not-present-in-48-canonical-bank | P0 | Marian; protection; St Michael related links |
| [Novena to the Immaculate Conception](https://institute-christ-king.org/resources/devotions-prayers/619-devotions-novena-immaculate-conception) | not-present-in-48-canonical-bank | P0 | Novenas; calendar 29 November–7 December contextual |
| [Perpetual Novena in Honor of St Thérèse of the Child Jesus](https://institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus) | not-present-in-48-canonical-bank | P0 | Novenas; saints; user-opt-in recurrence |
| [Prayer to St Thérèse for Missionaries](https://institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus) | not-present-in-48-canonical-bank | P1 | St Thérèse; missions |
| [Prayer by Pope Benedict XV to St Thérèse](https://institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus) | not-present-in-48-canonical-bank | P1 | St Thérèse |

### Content boundaries
- ICKSP **consecration to the Immaculate Conception** explicitly consecrates **the Institute and its houses/apostolates**. It is distinct from the existing **consecration to the Immaculate Heart**; the Institute's proper text must not be quietly rewritten or presented as a personal prayer.
- **Dedication to Christ the King** needs a precise Latin/English comparison to existing `devotion_consecration_christ_king` before adding anything.
- **Prayer of Reparation** may overlap existing `sacred_heart_short_prayer`; the direct US page returned 403 and its full wording remains unverified.
- **Prayers for Priests** page contains **two** distinct prayer bodies. The second carries apparent page text corruption, so do not propagate unverified wording.
- **St Thérèse perpetual novena** page includes a **novena prayer and collect**, plus **two separate prayers** (for missionaries and one attributed to Benedict XV). Maintain distinct identities and do not recite the basic Our Father/Hail Mary/Glory Be more than once in a guided sequence.
- **Virgin remedy against evil spirits** (*August Queen of Heaven*): the UK ICKSP [original linked source](https://icksp.org.uk/newbrighton/consecration-to-our-lady/) confirms the full English wording; its 1908 historical indulgence attribution must not appear as an active present-day indulgence.
- **Immaculate Conception novena** can be linked to 29 Nov–7 Dec and 8 Dec, but local schedules and different historical forms should not be conflated.
- **Infant Jesus novena** is presented as a single devotional prayer attributed to Venerable Father Cyril OCD; a nine-day workflow must not fabricate nine independent source prayers.

## French liturgical and Office candidates

| Text / Office | Canonical-bank result | Priority | Appropriate app location |
|---|---|---|---|
| [Office des Complies](https://icrspfrance.fr/textes-liturgiques.php) | not-present-as-canonical-prayer-card | P0 | Traditional Compline / Night Prayer |
| [1res Vêpres / Vêpres du Dimanche](https://icrspfrance.fr/textes-liturgiques.php) | not-present-as-canonical-prayer-card | P1 | Sunday Vespers / liturgical time |
| [Te Deum](https://icrspfrance.fr/textes-liturgiques.php?article=x479a8dcc_lisible) | not-present-in-48-canonical-bank | P0 | Thanksgiving; liturgical calendar; Office |
| [Vexilla Regis](https://icrspfrance.fr/textes-liturgiques.php?article=a0901_ancien) | not-present-in-48-canonical-bank | P1 | Passiontide; Holy Week |
| [Audi, benigne Conditor](https://icrspfrance.fr/textes-liturgiques.php?article=x9ef3247f_lisible) | not-present-in-48-canonical-bank | P1 | Lent Vespers |
| [Ad cenam Agni providi / Ad regias Agni dapes](https://icrspfrance.fr/textes-liturgiques.php) | not-present-in-48-canonical-bank | P1 | Easter Vespers |
| [Aeterne Rex altissime](https://icrspfrance.fr/textes-liturgiques.php) | not-present-in-48-canonical-bank | P1 | Ascension Matins |
| [Lustra sex](https://icrspfrance.fr/textes-liturgiques.php) | not-present-in-48-canonical-bank | P1 | Passiontide Lauds |
| [O sol salutis intimis](https://icrspfrance.fr/textes-liturgiques.php) | not-present-in-48-canonical-bank | P1 | Lent Lauds |
| [Ex more docti mystico](https://icrspfrance.fr/textes-liturgiques.php) | not-present-in-48-canonical-bank | P2 | Lent Matins |
| [Magnificat](https://icrspfrance.fr/textes-liturgiques.php) | existing-identical-work-text-check | P3 | Office Vespers |
| [Benedictus](https://icrspfrance.fr/textes-liturgiques.php) | existing-identical-work-text-check | P3 | Office Lauds |
| [Bénédictions des cierges et des aliments en la Fête de Saint Blaise](https://icrspfrance.fr/textes-liturgiques.php) | liturgical-ritual-not-lay-prayer | P2 | Calendar Feb 3 customs; ritual reference |

- **Compline** and **Vespers** are Divine Office liturgies; they require proper antiphons, psalms, rubrics and calendar context. They should not replace the St Pius X Morning/Evening personal prayer core.
- **Benedictus** and **Magnificat** already exist in the canonical bank, so first reconcile Latin/English/French and Office-context linking rather than duplicating.
- **Te Deum** is a distinct high-value thanksgiving hymn with a directly accessible [Latin/French ICRSP article](https://icrspfrance.fr/textes-liturgiques.php?article=x479a8dcc_lisible).
- **Vexilla Regis** and **Audi benigne Conditor** have directly accessible Latin/French sources. Register their seasons and hymn variants; distinguish Passion `Pange lingua gloriosi` from Eucharistic `Pange lingua` texts.
- **St Blaise candle/food blessings** are priestly rituals. Calendar-linked sourced ritual descriptions are appropriate; do not give laity a misleading priestly blessing script.

## Delivery plan (strictly €0)
1. Store title, source URL, liturgical/devotional type, historical provenance, canonical match/status and release hold in `data/pray/icksp-devotional-gap-register.b01.json`.
2. Verify **global duplicate absence** and identify independently pre-1930 source witnesses, translation rights and full-text boundaries. Do not assume a current ICKSP webpage's modern translation is public domain.
3. Integrate approved **individual devotions** in Pray by category, and **Office texts** under the proper Office experience. Context-sensitive Calendar links for relevant novenas, feasts and seasons. Do not create a competing calendar or Customs Atlas.
4. Implement one reviewed navigable prayer identity per complete prayer, preserving EN/FR/Latin language provenance. Novenas use recitation sequences and optional saved progress; nothing involving daily spiritual notes stored.
5. Keep St Pius X's Catechism authoritative for the daily Morning/Evening structure. Any ICKSP prayer is a supplementary option, never an automatic compulsory card.
6. Publication and merge only after text-identity/source-rights clearance. No copyright guesswork, no paid tools or owner contact.

**Current outcome:** 12 US atomic candidate prayers (across 9 source categories) + 13 selected French Office/hymn/ritual candidates = **25 source-backed metadata records**. This is a high-value review queue, **not 25 confirmed new distinct prayers**. **Zero full text bodies imported or released.**
