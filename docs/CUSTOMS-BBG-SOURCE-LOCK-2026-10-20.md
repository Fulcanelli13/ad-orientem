# SOT-07 customary source-lock — domestic sacramentals (20 October 2026)

Status: REVIEW BRANCH — three inherited SOT-07 customs plus one source-locked extension (BLSS-001). All remain unmerged pending CI.
Owner: Customs Atlas for identities/evidence; Calendar for dates; Learn for explanation; Pray for prayer bodies; Special Days for ceremonies.

## Scope and provenance

Reconciles three existing **SOT-07 custom IDs**, not new identities:

| ID | Existing research | Atlas state in this batch | Geographic attestation | Direct sources |
| --- | --- | --- | --- | --- |
| DOM-003 | Using blessed water at home (distinct from DOM-002: domestic holy-water font) | PUBLISHED | France; AREA_CONTEXT, never pin | MUCEM-BENITIER; RIT-WELLER |
| DOM-011 | Retaining Candlemas candles at home | PUBLISHED | France; AREA_CONTEXT | ECF-CHANDLEUR-HOME |
| DOM-013 | Retaining blessed Palm Sunday branches in homes | PUBLISHED | France; AREA_CONTEXT | ECF-RAMEAUX-HOME; DPP-2001 §139 |

The French domestic bénitier is **material evidence** for holy-water use in homes; it does not warrant an invented lay blessing rite or infer that any nearby parish performs the practice. DOM-003's vessel record and use record remain distinct.

The direct French episcopal source for DOM-013 mentions taking branches home to adorn crosses. The direct French liturgical source for DOM-011 states that blessed Candlemas candles are taken home and records their historical use near the dying.

No extra PLACE, ROUTE, directory-community, or global-obligation claim is added. Each custom retains its stable ID and gains a single non-pin, source-backed French attestation.

### Editorial handoff to existing Calendar

* Candlemas (2 February): mention that a blessed candle can be retained at home for prayer; the Candlemas reader continues to own the blessing and procession.
* Palm Sunday (computed from 1962 Calendar): mention that a blessed branch can be placed near a domestic crucifix. Participation at Mass/procession remains primary.
* Holy water (not date-bound): present via the Customs/Explore/Learn owner. No new daily reminder or module.

These bilingual Calendar summaries are contextual prompts, not prayer texts, rubrical directions, or indulgence claims.

## Blessed Be God: exact limits

Charles J. Callan and John A. McHugh, *Blessed Be God* (New York: P. J. Kenedy & Sons, 1925), scanned at https://archive.org/details/blessedbegodcomp00call :

* Printed p. 8, PDF p. 54: prayers on entering church and taking holy water. This **does not** directly establish a domestic holy-water rite.
* Printed p. 198, PDF p. 244: Candlemas feast prayers. This **does not** directly attest taking candles home.
* Printed p. 204 onward, PDF p. 254 onward: historical Palm Sunday/Holy Week descriptions; **not** a primary basis for present household branch custom or the post-1955/1962 ceremonial sequence.
* The calendar lists St Blase on 3 February (PDF p. 25) but **does not** contain a lay guide to the blessing of throats.

Independent, more precise witnesses supply the attestation for the domestic customs. The sourcebook's historical fast and quantified-indulgence claims are not current norms.

## St Blaise — separately admitted SOT-07 extension BLSS-001

Candidate status after source-lock review: **admitted to the canonical Customs Atlas on this draft branch** under `BLSS-001`, not presented as an original member of the 63-row SOT-07 workbook. Its independent provenance and inclusion policy are recorded in `data/customs/sot07-extensions.v1.json`.

Date: **3 February**. This is normally a **commemoration** of St Blaise in the 1962 Roman calendar, not a promoted third-class Mass feast. The Calendar owns any concurrence, date or Mass-formulary decisions. The custom's only UI output is an optional practical card (`practice.st-blaise-throats`).

Historical pre-1962 evidence:
* `ROMR-BLAISE-1956`: Dachauer, *Rural Life Prayerbook* (1956, EWTN reproduction) reproduces the Roman Ritual's distinct blessing of candles for St Blaise and the associated crossed-candle throat blessing. English translated historical witness, not certified word-for-word 1962 editio typica.
* `SCHOLA-BLAISE-LATIN`: Schola Sainte-Cécile's direct Latin/French Roman Ritual transcription includes both the candle blessing and the prayer `Per intercessionem sancti Blasii...`, independently corroborating the ceremonial distinction. It demonstrates French traditional Roman-rite reception without suggesting universal current parish availability.
* `ORDO-BLAISE-1962`: secondary 1962 calendar Ordo indicates 3 February's commemoration and traditional custom, but is not a substitute for the canonical Mass resolver.

Current separate evidence:
* `BOOK-BLESSINGS-BLAISE`: *Book of Blessings* §§1625–1650, English transcription, permits candles blessed on the Presentation of the Lord and provides specific cases for authorised lay ministers. Its provisions **must not** be projected backward into the traditional Roman Ritual.
* A priestly blessing in the older ritual is not a lay-performed prayer flow. No app ritual instructions, automated healing/indulgence claims, locality-specific promises, Mass overlays, or new calendar feast identity were added.

*Blessed Be God* lists St Blase among the 3 February commemorations (scanned PDF p. 25); it does **not** supply this rite. All ceremonial evidence comes from separately cited ritual witnesses.

New canonical attestation `att:BLSS-001:ROMAN`: `NOT_MAPPED`, world-context Roman-rite source, **not** a statement that every Roman Catholic parish offers a blessing on that date.

## Protection and tests

* No changes to negative-knowledge.v1.json: DOM-005, DOM-008, DOM-015, LIFE-005 and the other HOLD/REJECT entries remain blocked.
* Customs Atlas contracts remain authoritative; counts after admission: 17 active customs, 75 attestations, 81 sources, 7 negative records.
* `tests/customs-atlas-contracts.mjs` now asserts the exact custom/attestation/source IDs, AREA_CONTEXT geography and absence of held-identity leakage.
* This branch does not touch the Mass reader, novena corpus or prayer corpus.
* Review/CI remains a separate gate before merge; no claim of local test execution is made here.
