# ICKSP / ICRSP reconciliation — Pray module audit Batch 01
**Date:** 2026-10-28  
**Repository:** `Fulcanelli13/ad-orientem`  
**Module scope:** First five cards in `prayFamilies().daily.items` in `src/pray/presentation-runtime.js` (not the separate traditional-runtime declaration order).  
**Status:** AUDITED_METADATA; no public prayer bodies added, no production code changed.  
**Editorial policy:** All 25 selected ICKSP/ICRSP source records in B01 are accepted for contextual coverage, but that is not a claim of 25 new missing prayers. Preserve the authoritative 1913 St Pius X Morning/Evening default and original 1905 option. Do not create a competing Calendar. Publish nothing requiring external permissions or expense.

## Reconciliation rubric
- EXISTING: live module and known source form represented; leave present prayer intact.
- RELATED: ICKSP source is devotional context or a distinct optional prayer, not proof of a missing mandatory component.
- ACTION: exact source/identity/language check, presentation or independent module follow-up needed.
- PENDING: source-level collation is not equivalent to technical presence. EN/FR/LA body attribution assessed individually. No text should be copied from a modern ICKSP translation absent reuse clearance.

| Order | Module / route | Existing implementation (2026-10-28 main) | ICKSP/ICRSP reconciliation | Outcome | Follow-up / release gate |
|---:|---|---|---|---|---|
| 1 | Morning & Evening Prayer (`pray.morning_evening`) | PR #1799 merged: St Pius X revised 1913 core 11 morning/10 evening, 1905 variant 10/8, LA/EN/FR core, 40 manual alternatives (25 EN/15 FR), local saved selections and timer | Neither Institute index establishes an alternate official personal daily order. ICRSP *Office des Complies* is the full Divine Office and must not be substituted for St Pius X evening prayers. Relevant ICKSP personal devotions may be optional additions only where the prayer body is genuinely personal | EXISTING; preserve | Keep 1913 default, original 1905 option and all optional forms; never merge Office psalms into private evening sequence. Source proofreading of editorial translations remains outstanding. Link to separate future Office Compline. |
| 2 | Angelus / Regina Cæli (`pray.angelus_regina`) | LA/EN/FR canonical Angelus and Regina Cæli bodies with form selection, seasonal auto selection, individual/group recitation, posture/gesture cues and optional historical conclusion | No named Angelus/Regina prayer text appears among the 9 U.S. devotion headings or selected French liturgical-index records. The ICKSP *Prayer to the Virgin: Remedy Against Evil Spirits* (August Queen of Heaven) is another Marian prayer, not an alternate Angelus | EXISTING + RELATED | Preserve Angelus/Regina. Link the August Queen prayer from Marian devotions/protection, with an optional related-prayer handoff only; do not insert it into the Angelus sequence. Verify seasonal/posture and historic appendix separately, not an Institute gap. |
| 3 | Holy Rosary (`pray.rosary`) | Canonical donor handles traditional 15 mysteries, five-decade portion, fifteen-decade option, methods including Dominican, Montfort, Scripture-linked, and source-linked guided material | The listed ICKSP prayer index provides no competing Rosary recitation formula. *Consecration to the Immaculate Conception* is Institute-institutional and *August Queen of Heaven* is Marian protection, neither a mandatory Rosary decade component | EXISTING + RELATED | Keep traditional Rosary method and bead sequence. Route other Institute Marian devotions to their own prayer identities, not a duplicate Rosary. Compare future full ICRSP Office/seasonal Marian texts only when specifically relevant. |
| 4 | Grace at Meals (`pray.meal_prayers`) | Separate complete Grace Before and Grace After Meals in LA/EN/FR, canonical IDs `foundations_grace_before_meals` and `foundations_grace_after_meals`; attributed to historical Baltimore Manual (1888) | Neither of the two inspected Institute indexes supplies a specifically named meal-prayer counterpart | EXISTING; NO ICKSP ADDITION | No invented gap or replacement. Optional source collation: verify individual language witnesses, especially do not imply French was printed in the original English Baltimore Manual without independent source evidence. |
| 5 | Nightly Examination (`pray.nightly_examen`) | Five guided steps: recollection/thanks; duties to God; neighbour; self; contrition and resolution. Uses canonical `sacrament_act_of_contrition`, provenance labelled Compendium (2005), with a return handoff to Evening Prayer | ICRSP *Office des Complies* explicitly includes `De examine conscientiae et confessione`, with examination or silent Pater, Confiteor and different solo/non-priest vs led forms. This attests Office context, **not** that the standalone five-step examen is defective | ACTION: TEXT SOURCE + OFFICE HANDOFF | Compare existing Act of Contrition with available 1905/1913 St Pius X versions; prefer the sourced historic option or expose it as an alternative, without silently replacing valid variants. Provide a separate Compline entry point; implement full 1960/1962 context, psalms, antiphons and proper person/solo roles rather than blending the Office into an examen. |

### Key verified anchors
- App hub order: `src/pray/presentation-runtime.js#prayFamilies().daily`; formal language from `src/pray/canonical-data.js`.
- Source-backed traditional current forms: `src/pray/traditional-pray-runtime.js`, `src/pray/guided-daily-cards.js`, `src/pray/daily-personal-rule.js`.
- Source index of 9 English categories: https://institute-christ-king.org/resources/devotions-prayers
- French liturgical and Office index: https://icrspfrance.fr/textes-liturgiques.php
- Compline: https://icrspfrance.fr/textes-liturgiques.php?article=a0141_ancien (includes the examination and the a solo Confiteor).
- *August Queen of Heaven* / Virgin against evil spirits: https://institute-christ-king.org/resources/devotions-prayers/617-devotions-prayer-virgin-remedy
- Accepted Institute inventory: `data/pray/icksp-devotional-gap-register.b01.json` (25 accepted records). `docs/pray/ICKSP-DEVOTIONAL-GAP-AUDIT-B01-20261028.md` has contextual routing.

### Batch 01 decisions and unresolved verification
- 5/5 current app modules inspected for source relationships and functional route. This is **not** text-by-text scholarly certification or live-device acceptance.
- 4 preserve-as-existing; 1 source/reference follow-up on the examen's Act of Contrition.
- 1 separate high-value Office module lead (Compline), for the broader ICKSP coverage programme; not counted as a missing mandatory daily prayer.
- Contextual Marian cross-links relate to existing accepted items; no duplicate prayer identities and no automatic insertion into daily or Rosary recitations.
- No production changes or new prayers were published by this audit.

### Batch 02 boundary
Proceed to the next app family (Rosary & Chaplets) in the actual Pray family order, **deduplicating the Holy Rosary** already audited in Batch 01, then continue into Eucharistic Prayer. Select the next five unique modules rather than audit the Rosary twice.
