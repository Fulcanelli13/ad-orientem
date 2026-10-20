# Source-locked feast-day blessings — October 2026

Owner: Customs Atlas (identity/provenance) → Calendar (dated contextual notice) → Learn (historical explanation). Pray retains prayer texts, and Special Days retains liturgical ceremony. This batch introduces NO liturgical rite and NO prayer module.

| Canonical ID | Feast / when | Evidence | Classification | Mapping |
| --- | --- | --- | --- | --- |
| BLSS-002 | Assumption, 15 August | Official Vatican Directory §181; Weller historical Roman Ritual herb/fruit blessing; direct Traditional Latin Mass parish example | Historically regional, Germanic emphasis | NOT_MAPPED |
| BLSS-003 | St John the Evangelist, 27 December | Mater Dei Catholic Parish historical 1962 Roman Ritual transcription; independent Catholic parish witness | Optional traditional Roman blessing, local availability | NOT_MAPPED |
| BLSS-004 | Holy Saturday before Easter | Weller older Roman Ritual blessings of lamb, eggs and bread; Vatican Directory §150; Diocese of Norwich 2026 | Regionally rooted Easter foods / basket blessing | NOT_MAPPED |

Source URLs and independent provenance are registered as seven distinct source records in `data/customs/source-registry.v1.json`; DPP-2001 is also reused where appropriate. Regional customs and rites recorded in the Roman Ritual must never be equated with mandatory universal observances or presumed parish schedules.

## Editorial specificity

* BLSS-002: Herbs, flowers and fruits at the Assumption are especially attested in Germanic regions. The official Directory explicitly describes Christianisation of earlier rituals. Do not assert that the blessing is offered in every parish, or that herbs have miraculous medical properties.
* BLSS-003: St John's poisoned-wine story is traditional legend. The wine itself is NOT Eucharistic consecrated wine. Explain only the tradition of bringing wine for a priest's blessing; do not direct drinking, treatment of illnesses or consumption by minors.
* BLSS-004: Weller distinguishes blessings for lamb, eggs and bread; baskets and foods differ among families and countries. Blessing may occur on Holy Saturday where locally provided. The Easter Vigil, the Mass and the domestic prayer before Easter dinner are separate.
* Dated cards in `src/calendar/traditional-year-v384.js` are bilingual and do not change the underlying 1962 feast day calculation.
* No custom receives a Place pin from the existence of a Roman Ritual blessing. All three attestations have `geo_area_id: geo:world`, `map_policy: NOT_MAPPED`, and null `place_id`; this is source context, not a worldwide claim of regular use.

## Source limitations

The previously supplied prayerbook *Blessed Be God* provides historical Catholic devotion but has **not been verified as containing descriptions of these three blessings**; its 810 pages are not cited as authority for them. The 1964 Weller translations are historical ritual witnesses, not by themselves a certificate of exact 1962 Latin editio typica parity. The 2001/2002 Vatican Directory explains contemporary popular piety but is not a replacement for the 1962 liturgical calendar.

## QA gate

* Old 63-row SOT-07 crosswalk and all seven HOLD/REJECT negative records remain unchanged.
* Frozen 10 October heritage research counts remain historical; regression checks explicitly account for seven later admitted source-locked customs after that baseline, without rewriting it.
* `npm run test:customs-atlas` includes typed Atlas and calendar tests across 2026, 2027 and 2030; complete CI remains required before merging.
