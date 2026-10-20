# SOT-07 customary source-lock — domestic sacramentals (20 October 2026)

Status: REVIEW BRANCH — existing customs admitted; St Blaise held for separate SOT admission.
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

## St Blaise — independently sourced, NOT admitted to the canonical SOT yet

Candidate: traditional blessing of throats; traditional feast 3 February.

Source witnesses:
* Philip T. Weller's translation/index of the *Roman Ritual* (1964), https://www.ewtn.com/catholicism/library/roman-ritual-index-11884 — entries for blessing of candles on St Blaise's feast and blessing of throats. The translated historical ritual witnesses a **distinct candle blessing** associated with St Blaise. It should not automatically be treated as a verbatim 1962 edition without textual comparison.
* Catholic Diocese of Venice (2026), https://dioceseofvenice.org/the-memorial-of-st-blaise-blessing-of-the-throats/ — living diocesan custom and current ministry.
* Current *Book of Blessings* §§1627–1629, transcribed at https://www.catholicculture.org/culture/liturgicalyear/prayers/view.cfm?id=733 — modern form can use candles blessed at the Presentation on 2 February and permits prescribed lay ministers in certain circumstances. These modern details are **not** to overwrite a traditional Roman ritual.
* *Blessed Be God* includes the date in its February calendar, but not the traditional throat-blessing rite.

Release gate: do not invent or recycle a frozen SOT-07 ID; admit a new canonical identity only through the separately approved SOT extension, with exact pre-1962 ritual witness, a non-geographic Roman practice claim, minister boundaries and French/English editorial copy. Until then, **no St Blaise event or UI card is introduced by this batch**.

## Protection and tests

* No changes to negative-knowledge.v1.json: DOM-005, DOM-008, DOM-015, LIFE-005 and the other HOLD/REJECT entries remain blocked.
* Customs Atlas contracts remain authoritative; counts after admission: 16 active customs, 74 attestations, 77 sources, 7 negative records.
* `tests/customs-atlas-contracts.mjs` now asserts the exact custom/attestation/source IDs, AREA_CONTEXT geography and absence of held-identity leakage.
* This branch does not touch the Mass reader, novena corpus or prayer corpus.
* Review/CI remains a separate gate before merge; no claim of local test execution is made here.
