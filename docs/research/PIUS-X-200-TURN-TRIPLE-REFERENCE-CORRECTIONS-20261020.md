# St Pius X — 200-turn source, Chanoine and Denzinger corrections

**20 October 2026 · Research branch PR #1458 only. Historical source and document cross-references are research leads until independent publication approval.**

## Result

The complete Q567–Q666 bilingual Sacraments cohort now has **one evidence/referral record for each of its 200 original draft turns**, not merely chapter-level references:

- `data/learn/research/pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json`
- `data/learn/research/pius-x-source-bounded-bilingual-corrections-20261020.v1.json`

Reconciled against the original 100-family source index and the three linked Italian digital-source review waves: **9** support-question-array corrections, **10** source-faithful EN/FR draft wording corrections, **48** turns with original-document Magisterium topic leads, **42** with **1911 Bannwart old-Dz OCR-number candidates**, and **22** with specific but **blocked** Chanoine topic referrals. All 200 have an opt-in colleague switch policy and initial original numbered-question source references; **0** original 1905 print-image facsimile, final modern Denzinger, source-sentence, translation, historical voice, Canon reply or release certifications.

No global certification rate follows from these source-mapping counts. The 152 answer turns without a mapped Magisterium unit remain `UNASSESSED_NOT_NOT_APPLICABLE`, rather than being assigned guessed Dz numbers or falsely declared historically non-doctrinal.

## Corrected substantive source-faithfulness issues

1. **Sacrifice (Q652):** original says something perceptible is offered and *destroyed in some manner*. Two duplicated EN/FR draft turns had said *changed or destroyed*. Proposed replacements keep the original distinction. Source: Italian Q652.
2. **The Mass representing Calvary (Q657):** preserve the **force of consecratory words** under each species while affirming the whole Christ under either by **concomitance and the hypostatic union**. Two source-owned turn versions have a proposed bilingual correction. Source: Italian Q657; contextual Trent XIII chapter III and Trent XXII chapter I.
3. **Principal offerer / same sacrifice (Q655–656; Q660):** two turn versions now state explicitly that Christ is the first/principal offerer and the priest His minister, without falsely treating *same Priest and Victim* as the exact wording of Q655. Source: Q655 and Q660.
4. **Transubstantiation (Q607):** spell out conversion of substance and continuation of species; references require **Q596 + Q607 + Q609 + Q610**. Source: these Italian numbered answers; parallel Trent XIII canon II.
5. **Presence under every Eucharistic particle (Q619):** the duration of sacramental presence is supported by additional Q641. One EN/FR draft revision.
6. **The old midnight Communion fast (Q628 and Q633):** two reused historical-turn versions now distinguish Q628's *midnight* rule from Q633's definition of the natural fast. Old law cannot be represented as today's general discipline.

Three other question-reference corrections remain valid without changing their corresponding draft wording: Baptism/Confirmation sponsorial spiritual kinship Q576+595; Eucharist both sacrament and sacrifice Q596+651; Mass in honour of saints offered to God alone Q662+663. Each now has its precise source array in the 200-turn audit.

Ten bilingual revision candidates are in a **versioned source-owned overlay**. They are not a backdoor to release. The original 200 draft turns remain unchanged, and both old and corrected variants are accessible for reviewer comparison. Reviewer signoff must precede any publication or promotion of a revision into the canonical content owner.

## Magisterium and Denzinger: never invent a number

All 48 turns with Magisterium leads point to existing `MG-P...` original-document units owned by [PR #1452](https://github.com/Fulcanelli13/ad-orientem/pull/1452), using their document URL and unit labels. Typical leads:

| Subject | Original magisterial text | Magisterium ID | Old Dz research reference |
|---|---|---|---|
| Transubstantiation | Trent XIII canon II | MG-P013 | 884 |
| Whole Christ under each species | Trent XIII canon III | MG-P014 | 885 |
| Eucharistic adoration | Trent XIII chapter V / canon VI | MG-P012 / MG-P015 | 878 / 888 |
| True Sacrifice of the Mass | Trent XXII canon I | MG-P018 | 948 |
| One sacrifice, different mode of offering | Trent XXII chapter II | MG-P005 | 940 |
| Mass in honour of saints | Trent XXII chapter III | MG-P046 | 941 |
| Mass propitiatory for the living and dead | Trent XXII canon III | MG-P019 | 950 |

These are **old numbers observed in named 1911 OCR**, **not modern DS/DH references**. None is certified by inspected photographed original pages. The passage-unit relation may be narrower than the whole two-turn answer: the UI must never apply a Dz number to claims it does not support. For Q657, an original-document unit `MG-P008` (Trent XXII chapter I) is also attached **without inventing a Dz number**.

For the sacramental confession-before-Communion discussions Q630–631, Trent XIII chapter VII is present as an **original-document candidate without an established Magisterium registry passage ID**, not an invented numbered entry.

## Monsieur le Chanoine: referral is not answer approval

Every SPX reply offers **user-consented colleague switching**, retaining the original question, locale, source references, and conversation trail. Exactly 22 relevant turns have a **candidate** mapping to the existing held shared-router topics:
- `canon.apologetics_apol_031` — Mass as sacrifice; possible independently source-owned `apostolate:AQ04`.
- `canon.apologetics_apol_030` — Real Presence / Eucharistic change; possible independently source-owned `apostolate:AQ05`.

In [router PR #1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443), these specific broad topics are still **`SOURCE_GAP` with `approvedReply=false`**. The AQ04/AQ05 deterministic Chanoine pilot exists in [PR #1402](https://github.com/Fulcanelli13/ad-orientem/pull/1402), but is **not blanket approval** for every SPX question.

A visitor may request the Chanoine, but until source-owner eligibility is confirmed, the scene must give a transparent unavailable/source-gap state, not a fabricated Canon reply. Deny circular handoffs.

## Release gates and next editorial priority

`tests/pius-x-200turn-three-way-crosswalk.mjs` compares:
- every answer's canonical source owner, bilingual question text, 1905 QIDs and corrected support arrays;
- all 10 revision candidate IDs against the original unchanged owner, original-language numbered source refs, and release flags;
- all Magisterium passage ID candidates against a narrow approved research ID list; old-Dz numbers against their exact **1911 named-edition OCR** candidates;
- Chanoine specific-topic status as blocked, consent required, original context preserved, no loops or approved response invented;
- all 200 original answers unapproved and unshown.

It runs in the existing SPX research CI pipeline, verified passing in [run 39430577619](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39430577619).

**Editorial next:** independently collate the ten corrected EN/FR draft turns against the original Italian print edition, obtain relevant Trent text/1911 Denzinger page images and modern DS/DH edition concordance, then ask theological/style reviewers to approve precise language. After that, verify AQ04/AQ05 topic-specific Chanoine routing through the canonical router owner, retaining the option to decline unsupported specifics. Do not inflate answered question/unique-topic counts or publish unapproved content.

**No production runtime changes, canonical Catechism mutations, Chanoine source-owner modifications, original Mass reader edits, new paid assets, or user outreach.**
